import { streamText } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { myProvider } from "@/lib/ai/providers";
import { systemPrompt } from "@/lib/ai/prompts";
import { withMonitoring } from "@/lib/monitoring/simple-monitor";
import {
  getChatById,
  getMessagesByChatId,
  saveMessages,
  saveChat,
  getOrCreateOAuthUser,
} from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { convertDBMessagesToUIMessages } from "@/lib/types/message-conversion";
import { postRequestBodySchema } from "./schema";

// Normalize message function from the original code
function normalizeMessage(message: any) {
  return {
    ...message,
    content: message.content || message.parts?.[0]?.text || "",
    parts: message.parts || [{ type: "text", text: message.content || "" }],
  };
}

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export const POST = withMonitoring(async (request: Request) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body using schema
    const validationResult = postRequestBodySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      messages: rawMessages,
      id: chatId,
      selectedChatModel,
      selectedVisibilityType,
    } = validationResult.data;

    // Ensure we have messages
    if (!rawMessages || rawMessages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    // Get chat info
    let chat = await getChatById({ id: chatId });

    // If chat doesn't exist, create it
    if (!chat) {
      try {
        // Ensure user exists
        if (session.user.email) {
          await getOrCreateOAuthUser(session.user.id, session.user.email);
        }

        // Generate title from first user message
        const firstUserMessage = rawMessages.find(
          (msg: any) => msg.role === "user"
        );
        const title = firstUserMessage
          ? await generateTitleFromUserMessage({
              message: normalizeMessage(firstUserMessage),
            })
          : "New Chat";

        // Create the chat
        await saveChat({
          id: chatId,
          userId: session.user.id,
          title,
          visibility: selectedVisibilityType || "private",
        });

        // Get the created chat
        chat = await getChatById({ id: chatId });

        if (!chat) {
          return NextResponse.json(
            { error: "Failed to create chat" },
            { status: 500 }
          );
        }
      } catch (error) {
        console.error("Error creating chat:", error);
        return NextResponse.json(
          { error: "Failed to create chat" },
          { status: 500 }
        );
      }
    }

    // Get previous messages from database
    const previousMessages = await getMessagesByChatId({ id: chatId });

    // Convert to UI format and add new messages
    const allMessages = [
      ...convertDBMessagesToUIMessages(previousMessages),
      ...rawMessages.map(normalizeMessage),
    ];

    // Save user messages to database
    const userMessages = rawMessages.filter((msg: any) => msg.role === "user");
    if (userMessages.length > 0) {
      await saveMessages({
        messages: userMessages.map((msg: any) => ({
          chatId,
          id: msg.id || generateUUID(),
          role: msg.role,
          parts: msg.parts || [{ type: "text", text: msg.content }],
          attachments: msg.experimental_attachments || [],
          createdAt: new Date(),
        })),
      });
    }

    // Generate response using AI SDK v5
    const chatModel = selectedChatModel || "chat-model";
    const result = streamText({
      model: myProvider.languageModel(chatModel),
      system: systemPrompt({
        selectedChatModel: chatModel,
        requestHints: { latitude: "0", longitude: "0", city: "", country: "" },
      }),
      messages: allMessages,
      temperature: 0.7,
      onFinish: async ({ response }) => {
        try {
          // Save assistant messages to database
          const assistantMessages = response.messages.filter(
            (msg: any) => msg.role === "assistant"
          );
          if (assistantMessages.length > 0) {
            await saveMessages({
              messages: assistantMessages.map((msg: any) => ({
                chatId,
                id: msg.id || generateUUID(),
                role: msg.role,
                parts: msg.parts || [{ type: "text", text: msg.content }],
                attachments: msg.experimental_attachments || [],
                createdAt: new Date(),
              })),
            });
          }
        } catch (error) {
          console.error("Error saving assistant messages:", error);
        }
      },
      onError: (error) => {
        console.error("Stream error:", error);
      },
    });

    // Create a simple data stream response manually
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Start the AI stream
          result.consumeStream();

          // Process text chunks using async iteration
          for await (const chunk of result.textStream) {
            // Send data in the format expected by the client
            const data = `0:"${chunk.replace(/"/g, '\\"')}"\n`;
            controller.enqueue(new TextEncoder().encode(data));
          }

          // Close the stream when done
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
