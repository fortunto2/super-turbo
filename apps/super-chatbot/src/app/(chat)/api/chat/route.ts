import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  smoothStream,
  streamText,
} from "ai";
import { auth, type UserType } from "@/app/(auth)/auth";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  getStreamIdsByChatId,
  saveChat,
  saveMessages,
  getOrCreateOAuthUser,
  getUser,
} from "@/lib/db/queries";
import { generateUUID, getTrailingMessageId } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { createDocument } from "@/lib/ai/tools/create-document";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";

import { myProvider } from "@/lib/ai/providers";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { postRequestBodySchema, type PostRequestBody } from "./schema";
import { geolocation } from "@vercel/functions";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { after } from "next/server";
import type { Chat } from "@/lib/db/schema";
import { differenceInSeconds } from "date-fns";
import * as Sentry from "@sentry/nextjs";
import { configureImageGeneration } from "@/lib/ai/tools/configure-image-generation";
import { configureVideoGeneration } from "@/lib/ai/tools/configure-video-generation";
import {
  listVideoModels,
  findBestVideoModel,
} from "@/lib/ai/tools/list-video-models";
import { enhancePromptUnified } from "@/lib/ai/tools/enhance-prompt-unified";
import { convertDBMessagesToUIMessages } from "@/lib/types/message-conversion";
import { configureScriptGeneration } from "@/lib/ai/tools/configure-script-generation";
import { isProductionEnvironment } from "@/lib/constants";

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

/**
 * Formats error response based on environment
 * @param error - error object
 * @param context - error context for easier debugging
 * @returns Response object with formatted error
 */
function formatErrorResponse(error: unknown, context = "API") {
  console.error(`Error in ${context}:`, error);

  // In development mode return detailed error information
  if (!isProductionEnvironment) {
    const errorMessage =
      error instanceof Error
        ? `${error.message}\n\n${error.stack}`
        : "Unknown error";

    return new Response(
      JSON.stringify(
        {
          error: `Error in ${context}`,
          details: errorMessage,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      ),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // In production return generic message
  return new Response("An error occurred while processing your request!", {
    status: 500,
  });
}

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (error) {
    console.error("Invalid request body:", error);

    if (!isProductionEnvironment) {
      return new Response(
        JSON.stringify(
          {
            error: "Invalid request data",
            details: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response("Invalid request body", { status: 400 });
  }

  try {
    const { id, message, selectedChatModel, selectedVisibilityType } =
      requestBody;

    const session = await auth();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Логируем данные сессии для отладки
    Sentry.addBreadcrumb({
      category: "auth",
      message: "Session user info before chat creation",
      level: "info",
      data: {
        userId: session.user.id,
        email: session.user.email,
        type: session.user.type,
      },
    });

    const userType: UserType = session.user.type;

    // Перед созданием чата убедимся, что пользователь существует в БД
    try {
      const users = await getUser(session.user.email || "");
      if (users.length === 0) {
        // Если поиск по email не дал результатов, принудительно создаем пользователя
        console.log(
          `User not found by email, trying to ensure user exists: ${session.user.id}`
        );
        await getOrCreateOAuthUser(
          session.user.id,
          session.user.email || `user-${session.user.id}@example.com`
        );

        // Логируем успешное создание пользователя
        Sentry.addBreadcrumb({
          category: "auth",
          message: "User created before chat creation",
          level: "info",
          data: { userId: session.user.id },
        });
      } else {
        // Пользователь найден по email, обновим userId в сессии для создания чата
        const foundUser = users[0];
        if (foundUser.id !== session.user.id) {
          console.log(
            `User found with email but different ID, using existing ID: ${foundUser.id} instead of ${session.user.id}`
          );

          // Логируем, что мы используем другой ID
          Sentry.addBreadcrumb({
            category: "auth",
            message: "Using existing user ID from database",
            level: "info",
            data: {
              sessionUserId: session.user.id,
              databaseUserId: foundUser.id,
              email: session.user.email,
            },
          });

          // Используем ID из базы данных для создания чата
          session.user.id = foundUser.id;
        }
      }
    } catch (userError) {
      console.error("Failed to ensure user exists:", userError);
      Sentry.captureException(userError, {
        tags: { operation: "user_check_before_chat" },
        extra: {
          userId: session.user.id,
          email: session.user.email,
        },
      });
      // Продолжаем выполнение, но логируем ошибку
    }

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new Response(
        "You have exceeded your maximum number of messages for the day! Please try again later.",
        {
          status: 429,
        }
      );
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      let savedChat = false;
      try {
        await saveChat({
          id,
          userId: session.user.id,
          title,
          visibility: selectedVisibilityType,
        });
        savedChat = true;

        // Логируем успешное создание чата
        Sentry.addBreadcrumb({
          category: "chat",
          message: `Chat created: ${id}`,
          level: "info",
          data: {
            chatId: id,
            userId: session.user.id,
            visibility: selectedVisibilityType,
          },
        });
      } catch (error) {
        console.error("Failed to save chat:", error);

        // Добавляем проверку на ошибку внешнего ключа
        if (
          error instanceof Error &&
          error.message.includes("foreign key constraint") &&
          (error.message.includes("Chat_userId_User_id_fk") ||
            error.message.includes("Key (userId)"))
        ) {
          // Логируем событие в Sentry
          Sentry.captureException(error, {
            tags: { error_type: "foreign_key_constraint", entity: "chat" },
            extra: {
              chatId: id,
              userId: session.user.id,
              email: session.user.email || "unknown",
            },
          });

          console.log(`Trying to auto-create user with ID: ${session.user.id}`);

          try {
            // Пытаемся принудительно создать пользователя и чат
            const email =
              session.user.email || `auth0-user-${session.user.id}@example.com`;

            const createdUser = await getOrCreateOAuthUser(
              session.user.id,
              email
            );
            console.log(`User created: ${JSON.stringify(createdUser)}`);

            // Повторно пытаемся сохранить чат
            await saveChat({
              id,
              userId: session.user.id,
              title,
              visibility: selectedVisibilityType,
            });
            savedChat = true;

            // Логируем успешное восстановление ситуации
            Sentry.addBreadcrumb({
              category: "chat",
              message: `Chat created after user recovery: ${id}`,
              level: "info",
              data: { chatId: id, userId: session.user.id },
            });
          } catch (innerError) {
            console.error(
              "Failed to auto-create user and save chat:",
              innerError
            );

            // Логируем ошибку в Sentry
            Sentry.captureException(innerError, {
              tags: {
                error_type: "failed_chat_recovery",
                entity: "user_and_chat",
              },
              extra: {
                chatId: id,
                userId: session.user.id,
                email: session.user.email || "unknown",
              },
            });

            // Возвращаем ошибку клиенту с детальным описанием
            return new Response(
              JSON.stringify({
                error: "Failed to create chat due to user creation issues",
                details: "Please try refreshing the page or contact support",
                chatId: id,
                timestamp: new Date().toISOString(),
              }),
              {
                status: 500,
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }
        } else {
          // Другие ошибки при создании чата
          Sentry.captureException(error as Error, {
            tags: { error_type: "chat_creation_failed", entity: "chat" },
            extra: {
              chatId: id,
              userId: session.user.id,
              errorMessage: (error as Error).message,
            },
          });

          return new Response(
            JSON.stringify({
              error: "Failed to create chat",
              details: (error as Error).message,
              chatId: id,
              timestamp: new Date().toISOString(),
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      }

      if (!savedChat) {
        return new Response(
          JSON.stringify({
            error: "Failed to create chat",
            details: "Chat creation was unsuccessful",
            chatId: id,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else {
      if (chat.userId !== session.user.id) {
        // Логируем попытку доступа к чужому чату
        Sentry.captureMessage(`Unauthorized chat access attempt: ${id}`, {
          level: "warning",
          tags: { error_type: "unauthorized", entity: "chat" },
          extra: {
            chatId: id,
            chatOwnerId: chat.userId,
            userId: session.user.id,
          },
        });

        return new Response("Forbidden", { status: 403 });
      }
    }

    const previousMessages = await getMessagesByChatId({ id });

    const messages = appendClientMessage({
      messages: convertDBMessagesToUIMessages(previousMessages),
      message,
    });

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    try {
      await saveMessages({
        messages: [
          {
            chatId: id,
            id: message.id,
            role: "user",
            parts: message.parts,
            attachments: message.experimental_attachments ?? [],
            createdAt: new Date(),
          },
        ],
      });
    } catch (error) {
      console.error("Failed to save user message:", error);

      // If the error is related to missing chat, try to recreate it
      if (
        error instanceof Error &&
        error.message.includes("foreign key constraint") &&
        (error.message.includes("Message_v2_chatId_Chat_id_fk") ||
          error.message.includes("Key (chatId)"))
      ) {
        console.log(`Trying to recreate chat with ID: ${id}`);

        try {
          // Check if user exists, create if not
          if (session.user.email) {
            await getOrCreateOAuthUser(session.user.id, session.user.email);
          }

          // Try to recreate the chat
          const title = await generateTitleFromUserMessage({
            message,
          });

          await saveChat({
            id,
            userId: session.user.id,
            title,
            visibility: selectedVisibilityType,
          });

          // Try to save message again
          await saveMessages({
            messages: [
              {
                chatId: id,
                id: message.id,
                role: "user",
                parts: message.parts,
                attachments: message.experimental_attachments ?? [],
                createdAt: new Date(),
              },
            ],
          });
        } catch (innerError) {
          console.error(
            "Failed to recreate chat and save message:",
            innerError
          );
          // Continue execution to let the user get a response
        }
      }
      // Continue execution, as we can still try to get a response without saving the message
    }

    const streamId = generateUUID();
    try {
      await createStreamId({ streamId, chatId: id });
    } catch (error) {
      console.error("Failed to create stream id in database", error);

      // If the error is related to missing chat, try to recreate it
      if (
        error instanceof Error &&
        error.message.includes("foreign key constraint") &&
        (error.message.includes("Stream_chatId_Chat_id_fk") ||
          error.message.includes("Key (chatId)"))
      ) {
        console.log(`Trying to recreate chat for stream with ID: ${id}`);

        try {
          // Check if user exists, create if not
          if (session.user.email) {
            await getOrCreateOAuthUser(session.user.id, session.user.email);
          }

          // Try to recreate the chat
          const title = await generateTitleFromUserMessage({
            message,
          });

          await saveChat({
            id,
            userId: session.user.id,
            title,
            visibility: selectedVisibilityType,
          });

          // Try to create stream ID again
          await createStreamId({ streamId, chatId: id });
        } catch (innerError) {
          console.error(
            "Failed to recreate chat and create stream ID:",
            innerError
          );
          // Continue execution as stream can be created even without DB record
        }
      }
      // Continue execution, as we can proceed without DB record
    }

    const stream = createDataStream({
      execute: (dataStream) => {
        const enhancedDataStream = {
          ...dataStream,
          end: () => {},
          error: (error: Error) => {
            console.error("Stream error:", error);
          },
        };

        const tools = {
          createDocument: createDocument({
            session,
            dataStream: enhancedDataStream,
          }),
          updateDocument: updateDocument({
            session,
            dataStream: enhancedDataStream,
          }),
          requestSuggestions: requestSuggestions({
            session,
            dataStream: enhancedDataStream,
          }),
        };

        // Note: Autotrigger disabled. Let the model call configureImageGeneration tool.

        console.log("🔍 Message structure for configureImageGeneration:", {
          hasMessage: !!message,
          messageKeys: message ? Object.keys(message) : [],
          experimentalAttachments: (message as any)?.experimental_attachments,
          attachments: (message as any)?.attachments,
        });

        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel, requestHints }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === "chat-model-reasoning"
              ? []
              : [
                  "configureImageGeneration",
                  "configureVideoGeneration",
                  "configureScriptGeneration",
                  "listVideoModels",
                  "findBestVideoModel",
                  "enhancePromptUnified",
                  "createDocument",
                  "updateDocument",
                  "requestSuggestions",
                ],
          experimental_transform: smoothStream({ chunking: "word" }),
          experimental_generateMessageId: generateUUID,
          tools: {
            ...tools,
            configureImageGeneration: configureImageGeneration({
              createDocument: tools.createDocument,
              session,
              defaultSourceImageUrl: (() => {
                try {
                  const atts = (message as any)?.experimental_attachments || [];
                  console.log("🔍 Looking for image attachments in message:", {
                    hasMessage: !!message,
                    hasAttachments: !!atts,
                    attachmentsCount: atts?.length || 0,
                    attachments: atts,
                  });
                  const img = atts.find(
                    (a: any) =>
                      typeof a?.url === "string" &&
                      /^https?:\/\//.test(a.url) &&
                      String(a?.contentType || "").startsWith("image/")
                  );
                  console.log("🔍 Found image attachment:", img);
                  return img?.url;
                } catch (error) {
                  console.error(
                    "🔍 Error extracting defaultSourceImageUrl:",
                    error
                  );
                  return undefined;
                }
              })(),
            }),
            configureVideoGeneration: configureVideoGeneration({
              createDocument: tools.createDocument,
              session,
            }),
            configureScriptGeneration: configureScriptGeneration({
              createDocument: tools.createDocument,
              session,
            }),
            listVideoModels,
            findBestVideoModel,
            enhancePromptUnified,
          },
          // Note: explicit toolChoice removed due to type constraints; tool remains available
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantMessages = response.messages.filter(
                  (message) => message.role === "assistant"
                );

                if (assistantMessages.length === 0) {
                  console.warn("No assistant messages found in response");
                  return;
                }

                const assistantId = getTrailingMessageId({
                  messages: assistantMessages,
                });

                if (!assistantId) {
                  console.warn("No assistant message ID found");
                  return;
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });

                if (!assistantMessage) {
                  console.warn("Failed to append response messages");
                  return;
                }

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (error) {
                console.error("Failed to save assistant message:", error);
                if (error instanceof Error) {
                  console.error(error.stack);
                }
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () => stream)
      );
    } else {
      return new Response(stream);
    }
  } catch (error) {
    return formatErrorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    const streamContext = getStreamContext();
    const resumeRequestedAt = new Date();

    if (!streamContext) {
      return new Response(null, { status: 204 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return new Response("id is required", { status: 400 });
    }

    // Валидация UUID формата
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        chatId
      )
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid chat ID format",
          details: "Chat ID must be a valid UUID",
          chatId: chatId,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const session = await auth();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    let chat: Chat;

    try {
      chat = await getChatById({ id: chatId });
    } catch (error) {
      console.error("Error getting chat by ID:", error);
      return formatErrorResponse(error as Error, "GET chat/getChatById");
    }

    if (!chat) {
      return new Response(
        JSON.stringify({
          error: "Chat not found",
          details: "The requested chat does not exist",
          chatId: chatId,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (chat.visibility === "private" && chat.userId !== session.user.id) {
      return new Response(
        JSON.stringify({
          error: "Access denied",
          details: "You don't have permission to access this chat",
          chatId: chatId,
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const streamIds = await getStreamIdsByChatId({ chatId });

    if (!streamIds.length) {
      return new Response("No streams found", { status: 404 });
    }

    const recentStreamId = streamIds.at(-1);

    if (!recentStreamId) {
      return new Response("No recent stream found", { status: 404 });
    }

    const emptyDataStream = createDataStream({
      execute: () => {},
    });

    const stream = await streamContext.resumableStream(
      recentStreamId,
      () => emptyDataStream
    );

    /*
     * For when the generation is streaming during SSR
     * but the resumable stream has concluded at this point.
     */
    if (!stream) {
      try {
        const messages = await getMessagesByChatId({ id: chatId });
        const mostRecentMessage = messages.at(-1);

        if (!mostRecentMessage) {
          return new Response(emptyDataStream, { status: 200 });
        }

        if (mostRecentMessage.role !== "assistant") {
          return new Response(emptyDataStream, { status: 200 });
        }

        const messageCreatedAt = new Date(mostRecentMessage.createdAt);

        if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
          return new Response(emptyDataStream, { status: 200 });
        }

        const restoredStream = createDataStream({
          execute: (buffer) => {
            buffer.writeData({
              type: "append-message",
              message: JSON.stringify(mostRecentMessage),
            });
          },
        });

        return new Response(restoredStream, { status: 200 });
      } catch (error) {
        return formatErrorResponse(error, "GET chat/restoreStream");
      }
    }

    return new Response(stream, { status: 200 });
  } catch (error) {
    return formatErrorResponse(error, "GET chat");
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const deletedChat = await deleteChatById({ id });

    return Response.json(deletedChat, { status: 200 });
  } catch (error) {
    return formatErrorResponse(error);
  }
}
