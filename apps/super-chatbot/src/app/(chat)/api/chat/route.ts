import { streamText, stepCountIs } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { myProvider } from "@/lib/ai/providers";
import { systemPrompt } from "@/lib/ai/prompts";
import { withMonitoring } from "@/lib/monitoring/simple-monitor";
import {
  getChatById,
  getMessagesByChatId,
  saveMessages,
} from "@/lib/db/queries";
import { postRequestBodySchema } from "./schema";

// Import utilities
import {
  normalizeUIMessage,
  ensureMessageHasUUID,
  convertDBMessagesToUIMessages,
  normalizeMessageParts,
} from "@/lib/ai/chat/message-utils";
import {
  ensureChatExists,
  saveUserMessage,
} from "@/lib/ai/chat/chat-management";
import { formatErrorResponse } from "@/lib/ai/chat/error-handler";

// Import tools
import { configureImageGeneration } from "@/lib/ai/tools/configure-image-generation";
import { configureVideoGeneration } from "@/lib/ai/tools/configure-video-generation";
import { configureScriptGeneration } from "@/lib/ai/tools/configure-script-generation";
import { createDocument } from "@/lib/ai/tools/create-document";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";

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

    let {
      messages: rawMessages,
      message: singleMessage,
      id: chatId,
      selectedChatModel,
      selectedVisibilityType,
    } = validationResult.data;

    // Convert single message to array format if needed
    if (singleMessage && !rawMessages) {
      rawMessages = [singleMessage];
    }

    // Ensure we have messages
    if (!rawMessages || rawMessages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    // AI SDK v5: Ensure all messages have proper UUID and createdAt
    // Also normalize message parts to convert tool-specific types to generic types
    const normalizedMessages = rawMessages.map((msg: any) => {
      const normalized = normalizeUIMessage(msg);
      const withUUID = ensureMessageHasUUID(normalized);
      return normalizeMessageParts(withUUID);
    });

    // Ensure chat exists (with automatic FK recovery)
    await ensureChatExists({
      chatId,
      userId: session.user.id,
      userEmail: session.user.email || `user-${session.user.id}@example.com`,
      firstMessage: normalizedMessages[normalizedMessages.length - 1],
      visibility: selectedVisibilityType || "private",
    });

    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return formatErrorResponse(
        new Error("Failed to create chat"),
        "Chat API"
      );
    }

    // Get previous messages from database
    const previousMessages = await getMessagesByChatId({ id: chatId });

    // Convert to UI format and add new messages
    const allMessages = [
      ...convertDBMessagesToUIMessages(previousMessages),
      ...normalizedMessages.filter((msg) => msg.role !== "system"),
    ];

    // Save user messages to database (with automatic FK recovery)
    const userMessages = normalizedMessages.filter(
      (msg) => msg.role === "user"
    );
    for (const userMsg of userMessages) {
      await saveUserMessage({
        chatId,
        message: userMsg,
      });
    }

    // Generate response using AI SDK v5
    const chatModel = selectedChatModel || "chat-model";

    // Create tools with proper parameters
    const createDocumentTool = createDocument({ session });
    const updateDocumentTool = updateDocument({ session });
    const lastMessage = normalizedMessages[normalizedMessages.length - 1];
    const imageGenerationTool = configureImageGeneration({
      createDocument: createDocumentTool,
      session,
      chatId,
      userMessage: lastMessage?.content || "",
      currentAttachments: lastMessage?.experimental_attachments || [],
    });
    const videoGenerationTool = configureVideoGeneration({
      createDocument: createDocumentTool,
      session,
      chatId,
      userMessage: lastMessage?.content || "",
      currentAttachments: lastMessage?.experimental_attachments || [],
    });
    const scriptGenerationTool = configureScriptGeneration({
      createDocument: createDocumentTool,
      session,
    });
    const suggestionsTool = requestSuggestions({ session });

    const result = streamText({
      model: myProvider.languageModel(chatModel),
      system: systemPrompt({
        selectedChatModel: chatModel,
        requestHints: { latitude: "0", longitude: "0", city: "", country: "" },
      }),
      messages: allMessages,
      temperature: 0.7,
      tools: {
        configureImageGeneration: imageGenerationTool,
        configureVideoGeneration: videoGenerationTool,
        configureScriptGeneration: scriptGenerationTool,
        createDocument: createDocumentTool,
        updateDocument: updateDocumentTool,
        requestSuggestions: suggestionsTool,
      },
      toolChoice: 'auto', // Let model decide when to use tools vs generate text
      stopWhen: stepCountIs(10), // AI SDK v5: Enable multi-step execution - model can call tools AND generate text in same response
      onFinish: async ({ response }) => {
        try {
          console.log(
            "📝 onFinish called with response.messages:",
            response.messages.length
          );

          // Extract document IDs from tool results
          const toolDocuments: Array<{ id: string; title: string; kind: string }> = [];
          for (const msg of response.messages) {
            if (msg.role === "tool") {
              const toolResult = (msg as any).content;
              console.log("📝 🔍 Tool result:", JSON.stringify(toolResult).substring(0, 200));

              // AI SDK v5: Tool result is wrapped in array with type/output structure
              if (Array.isArray(toolResult)) {
                for (const item of toolResult) {
                  // Check for tool-result with output.value structure
                  if (item.type === "tool-result" && item.output?.type === "json" && item.output?.value) {
                    const doc = item.output.value;
                    if (doc.id && doc.kind) {
                      toolDocuments.push({
                        id: doc.id,
                        title: doc.title || "Document",
                        kind: doc.kind,
                      });
                      console.log("📝 ✅ Found document from tool:", doc.kind, doc.id);
                    }
                  }
                  // Fallback: direct structure
                  else if (item.id && item.kind) {
                    toolDocuments.push({
                      id: item.id,
                      title: item.title || "Document",
                      kind: item.kind,
                    });
                    console.log("📝 ✅ Found document from tool (direct):", item.kind, item.id);
                  }
                }
              }
              // Fallback: single object
              else if (toolResult && typeof toolResult === "object") {
                // Check for tool-result structure
                if (toolResult.type === "tool-result" && toolResult.output?.type === "json" && toolResult.output?.value) {
                  const doc = toolResult.output.value;
                  if (doc.id && doc.kind) {
                    toolDocuments.push({
                      id: doc.id,
                      title: doc.title || "Document",
                      kind: doc.kind,
                    });
                    console.log("📝 ✅ Found document from tool:", doc.kind, doc.id);
                  }
                }
                // Direct structure
                else if (toolResult.id && toolResult.kind) {
                  toolDocuments.push({
                    id: toolResult.id,
                    title: toolResult.title || "Document",
                    kind: toolResult.kind,
                  });
                  console.log("📝 ✅ Found document from tool (direct):", toolResult.kind, toolResult.id);
                }
              }
            }
          }

          const assistantMessages = response.messages
            .filter((msg) => msg.role === "assistant")
            .map((msg) => {
              const normalized = normalizeUIMessage(msg);
              const withUUID = ensureMessageHasUUID(normalized);

              const attachments = normalized.experimental_attachments || [];

              // Add attachments for documents created by tools
              for (const doc of toolDocuments) {
                if (doc.kind === "script") {
                  attachments.push({
                    name: doc.title.length > 200 ? `${doc.title.substring(0, 200)}...` : doc.title,
                    url: `${
                      typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL
                        ? process.env.NEXT_PUBLIC_APP_URL
                        : "http://localhost:3001"
                    }/api/document?id=${doc.id}`,
                    contentType: "text/markdown" as const,
                    documentId: doc.id,
                  });
                  console.log("📝 ✅ Added script attachment to message:", doc.id);
                }
              }

              return {
                id: withUUID.id,
                chatId,
                role: "assistant" as const,
                parts: normalized.parts,
                attachments: attachments,
                createdAt: new Date(),
              };
            });

          if (assistantMessages.length > 0) {
            console.log(
              "📝 Saving",
              assistantMessages.length,
              "assistant messages to database"
            );
            await saveMessages({ messages: assistantMessages });
            console.log("📝 ✅ Assistant messages saved successfully");
          } else {
            console.log("📝 ⚠️ No assistant messages to save");
          }
        } catch (error) {
          console.error("Failed to save assistant messages:", error);
        }
      },
      onError: (error) => {
        console.error("Stream error:", error);
      },
    });

    // AI SDK v5: Use toUIMessageStreamResponse() - requires updating @ai-sdk/react
    return result.toUIMessageStreamResponse();
  } catch (error) {
    return formatErrorResponse(error, "Chat API");
  }
});
