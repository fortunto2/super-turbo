"use client";

import type { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import useSWR, { useSWRConfig } from "swr";
import { ChatHeader } from "./chat-header";
import type { Vote } from "@/lib/db/schema";
import { fetcher, generateUUID } from "@/lib/utils";
import { UIArtifact } from "../artifacts";
import { MultimodalInput } from "./multimodal-input";
import { Messages } from "../messages";
import type { VisibilityType } from "../shared/visibility-selector";
import { useArtifactContext } from "@/contexts/artifact-context";
import { unstable_serialize } from "swr/infinite";
import { getChatHistoryPaginationKey } from "../sidebar/sidebar-history";
import { toast } from "../common/toast";
import type { Session } from "next-auth";
import { useSearchParams } from "next/navigation";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatImageSSE } from "@/hooks/use-chat-image-sse";
import { useChatVideoSSE } from "@/hooks/use-chat-video-sse";
import { setActiveChat } from "@/lib/utils/chat-websocket-cleanup";
import { LoaderIcon } from "../common/icons";
import { ArtifactManager } from "../artifacts/artifact-manager";
import { ArtifactDebug } from "../artifacts/artifact-debug";

// --- UNIVERSAL SAVE SCRIPT ARTIFACT TO CHAT ---
async function saveScriptArtifactToChat({
  chatId,
  userPrompt,
  docId,
  setMessages,
  initialChatModel,
  visibilityType,
}: {
  chatId: string;
  userPrompt: string;
  docId: string;
  setMessages: (fn: (prev: UIMessage[]) => UIMessage[]) => void;
  initialChatModel: string;
  visibilityType: string;
}) {
  const artifactAttachmentMessage = {
    role: "assistant",
    content: " ",
    parts: [],
    experimental_attachments: [
      {
        url: `${
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000"
        }/api/document?id=${docId}`,
        name: userPrompt || "Scenario.md",
        contentType: "text/markdown",
        documentId: docId,
      },
    ],
    createdAt: new Date(),
    id: generateUUID(),
  };
  setMessages((prev) => [...prev, artifactAttachmentMessage as UIMessage]);
  await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: chatId,
      message: artifactAttachmentMessage,
      selectedChatModel: initialChatModel,
      selectedVisibilityType: visibilityType,
    }),
  });
}
// --- END UNIVERSAL SAVE SCRIPT ARTIFACT TO CHAT ---

function ChatContent({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
  onDataStream,
  onError,
  isGeminiChat = false,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
  onDataStream?: (dataStream: any[]) => void;
  onError?: (error: Error) => void;
  isGeminiChat?: boolean;
}) {
  const { mutate } = useSWRConfig();

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  // Состояние для блокировки кнопки отправки
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const { updateMessages, artifact } = useArtifactContext();

  // AI SDK v5: Manual input management (useChat doesn't provide input/setInput in v5)
  const [input, setInput] = useState("");

  const chatHelpers = useChat({
    id,
    messages: initialMessages as any, // AI SDK v5: messages instead of initialMessages
    // AI SDK v5: api parameter might be different
    ...(isGeminiChat ? { api: "/api/gemini-chat" } : {}),
    // AI SDK v5: body parameter might be different
    body: {
      id,
      selectedChatModel: initialChatModel,
      selectedVisibilityType: visibilityType,
    },
    // AI SDK v5: Prepare request body to ensure correct format
    experimental_prepareRequestBody: ({
      messages: msgs,
      requestData,
      requestBody,
    }: any) => {
      console.log("🔍 Preparing request body:", {
        messagesCount: msgs.length,
        requestData,
        requestBody,
      });

      return {
        id,
        messages: msgs,
        selectedChatModel: initialChatModel,
        selectedVisibilityType: visibilityType,
        ...requestBody,
      };
    },
    onFinish: (result: any) => {
      console.log("🔍 useChat onFinish called - обновляем URL");
      console.log("🔍 Chat ID in onFinish:", id);
      console.log("🔍 onFinish result:", result);

      // Access messages from the result or chatHelpers
      const currentMessages = result?.messages || [];
      console.log("🔍 Messages in onFinish:", currentMessages.length);
      console.log(
        "🔍 Last message in onFinish:",
        currentMessages[currentMessages.length - 1]
          ? {
              id: currentMessages[currentMessages.length - 1]?.id,
              role: currentMessages[currentMessages.length - 1]?.role,
              partsCount:
                currentMessages[currentMessages.length - 1]?.parts?.length || 0,
              hasContent: !!(currentMessages[currentMessages.length - 1] as any)
                ?.content,
            }
          : null
      );

      // Extract document IDs from tool results (same logic as server-side)
      const toolDocuments: Array<{ id: string; title: string; kind: string }> = [];
      for (const msg of currentMessages) {
        if (msg.role === "assistant" && msg.parts) {
          for (const part of msg.parts) {
            // Check for tool-invocation parts with results
            if (part.type === "tool-invocation" && part.toolInvocation) {
              const { toolName, state, result: toolResult } = part.toolInvocation;

              if (state === "result" && toolResult) {
                console.log("📝 🔍 Client onFinish - Found tool result:", {
                  toolName,
                  hasId: !!(toolResult as any).id,
                  hasKind: !!(toolResult as any).kind,
                  result: toolResult,
                });

                // Extract document info from tool result
                if (
                  (toolResult as any).id &&
                  (toolResult as any).kind &&
                  (toolResult as any).title
                ) {
                  toolDocuments.push({
                    id: (toolResult as any).id,
                    title: (toolResult as any).title,
                    kind: (toolResult as any).kind,
                  });
                  console.log("📝 ✅ Client onFinish - Found document from tool:",
                    (toolResult as any).kind,
                    (toolResult as any).id
                  );
                }
              }
            }
          }
        }
      }

      // Add attachments for script documents to assistant messages
      if (toolDocuments.length > 0) {
        console.log("📝 Client onFinish - Adding attachments for", toolDocuments.length, "documents");

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];

          // Find the last assistant message and add attachments
          for (let i = updatedMessages.length - 1; i >= 0; i--) {
            if (updatedMessages[i].role === "assistant") {
              const message = updatedMessages[i] as any;
              const existingAttachments = message.experimental_attachments || [];

              // Extract text response from tool results
              let textResponse = "";
              for (const msg of currentMessages) {
                if (msg.role === "assistant" && msg.parts) {
                  for (const part of msg.parts) {
                    if (part.type === "tool-invocation" && part.toolInvocation) {
                      const { state, result: toolResult } = part.toolInvocation;
                      if (state === "result" && toolResult && (toolResult as any).message) {
                        textResponse = (toolResult as any).message;
                        break;
                      }
                    }
                  }
                  if (textResponse) break;
                }
              }

              // Add script attachments
              for (const doc of toolDocuments) {
                if (doc.kind === "script") {
                  // Check if this attachment doesn't already exist
                  const alreadyExists = existingAttachments.some(
                    (att: any) => att.documentId === doc.id
                  );

                  if (!alreadyExists) {
                    existingAttachments.push({
                      name: doc.title.length > 200
                        ? `${doc.title.substring(0, 200)}...`
                        : doc.title,
                      url: `${
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "http://localhost:3001"
                      }/api/document?id=${doc.id}`,
                      contentType: "text/markdown" as const,
                      documentId: doc.id,
                    });
                    console.log("📝 ✅ Client onFinish - Added script attachment to message:", doc.id);
                  }
                }
              }

              // Update the message with attachments and text content
              message.experimental_attachments = existingAttachments;

              // Add text content if we have a response from tool
              if (textResponse && (!message.content || message.content.length === 0)) {
                message.content = textResponse;
                // Also update parts
                if (!message.parts || message.parts.length === 0 ||
                    (message.parts.length === 1 && message.parts[0].type === "text" && !message.parts[0].text)) {
                  message.parts = [{ type: "text", text: textResponse }];
                } else {
                  // Find text part and update it
                  const textPart = message.parts.find((p: any) => p.type === "text");
                  if (textPart) {
                    textPart.text = textResponse;
                  }
                }
                console.log("📝 ✅ Client onFinish - Added text response to message:", textResponse.substring(0, 100));
              }

              // Break after updating the last assistant message
              break;
            }
          }

          return updatedMessages;
        });
      }

      // Сбрасываем состояние блокировки
      isSubmittingRef.current = false;
      setIsSubmitting(false);

      // Trigger artifact detection after a short delay to ensure messages are processed
      setTimeout(() => {
        console.log("🔄 Triggering artifact detection from onFinish");
        if (updateMessages && currentMessages.length > 0) {
          updateMessages(currentMessages);
        }
      }, 200);

      // Обновляем URL после успешного завершения чата
      if (id && typeof window !== "undefined") {
        const newUrl = `/chat/${id}`;
        if (window.location.pathname !== newUrl) {
          window.history.pushState(null, "", newUrl);
        }
      }
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error: Error) => {
      // При ошибке не обновляем URL, чтобы избежать 404
      console.error("Chat error:", error);

      // Сбрасываем состояние блокировки
      isSubmittingRef.current = false;
      setIsSubmitting(false);

      // Передаем ошибку в родительский компонент
      if (onError) {
        onError(error);
      }

      toast({
        type: "error",
        description: error.message,
      });
    },
  } as any);

  // Extract properties from chatHelpers
  const { messages, setMessages, status, stop } = chatHelpers;
  const sendMessage = (chatHelpers as any).sendMessage;
  const regenerate = (chatHelpers as any).regenerate;

  // AI SDK v5: reload is now regenerate
  const reload = useCallback(() => {
    if (regenerate) {
      return regenerate();
    }
  }, [regenerate]);

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);
  const [scriptStatus, setScriptStatus] = useState<"idle" | "submitted">(
    "idle"
  );

  // AI SDK v5: Append function using sendMessage
  const handleAppend = useCallback(
    async (message: any, options?: any): Promise<string | null | undefined> => {
      // НЕ обновляем URL здесь - ждем команду от сервера
      if (message.content) {
        const result = await sendMessage({
          text: message.content,
        });
        return result;
      }
      return null;
    },
    [sendMessage]
  );

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      handleAppend({
        role: "user",
        content: query,
      });

      setHasAppendedQuery(true);
      // НЕ обновляем URL здесь - ждем команду от сервера
    }
  }, [query, handleAppend, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Array<any>>([]);

  const isArtifactVisible = artifact.isVisible;

  // AI SDK v5: No more data stream - tool invocations are in message.parts
  // This hook is kept for compatibility but data is always undefined in v5
  useEffect(() => {
    // onDataStream callback removed - not applicable in v5
    // Tool results are now in message.parts, not in separate data stream
  }, [onDataStream]);

  useAutoResume({
    autoResume,
    initialMessages,
    data: undefined, // AI SDK v5: No data stream
    setMessages,
  });

  // Set active chat for cleanup management
  useEffect(() => {
    setActiveChat(id);
  }, [id]);

  // Обновляем сообщения в контексте артефактов для детекции
  useEffect(() => {
    if (!updateMessages || !messages) {
      return;
    }

    console.log("🔄 Updating messages in artifact context:", {
      chatId: id,
      messagesCount: messages.length,
      lastMessage: messages[messages.length - 1]
        ? {
            id: messages[messages.length - 1]?.id,
            role: messages[messages.length - 1]?.role,
            partsCount: messages[messages.length - 1]?.parts?.length || 0,
            hasContent: !!(messages[messages.length - 1] as any)?.content,
          }
        : null,
    });

    // Add a small delay to ensure the messages are fully processed
    const timeoutId = setTimeout(() => {
      console.log("🔄 Calling updateMessages after timeout");
      updateMessages(messages);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, updateMessages, id]);

  // Global SSE connections for media generation
  const chatImageSSE = useChatImageSSE({
    chatId: id,
    messages,
    setMessages,
    enabled: !isReadonly, // Only enable for non-readonly chats
  });

  const chatVideoSSE = useChatVideoSSE({
    chatId: id,
    messages,
    setMessages,
    enabled: !isReadonly, // Only enable for non-readonly chats
  });

  // Register WebSocket instance for debugging and expose chat context for script artifacts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const globalWindow = window as any;

      // Expose chat instance for script artifacts to access setMessages
      globalWindow.chatInstance = {
        setMessages,
        chatId: id,
        messages,
      };

      if (globalWindow.setChatWebSocketInstance) {
        // Create a persistent storage object that maintains lastImageUrl
        if (!globalWindow.chatWebSocketInstance) {
          globalWindow.chatWebSocketInstance = {};
        }

        // Update with current SSE data while preserving lastImageUrl
        Object.assign(globalWindow.chatWebSocketInstance, {
          ...chatImageSSE,
          ...chatVideoSSE,
          messages,
          lastImageUrl: globalWindow.chatWebSocketInstance.lastImageUrl, // Preserve existing URL
          lastVideoUrl: globalWindow.chatWebSocketInstance.lastVideoUrl, // Preserve existing video URL
        });

        // Debugging instance stored silently
      }
    }
  }, [chatImageSSE, chatVideoSSE, messages, setMessages, id]);

  // AI SDK v5: Manual submit handler using sendMessage
  const handleFormSubmit = useCallback(
    (
      event?: { preventDefault?: () => void } | undefined,
      chatRequestOptions?: any
    ) => {
      if (event?.preventDefault) {
        event.preventDefault();
      }

      // Проверяем и устанавливаем блокировку
      if (
        isSubmittingRef.current ||
        status !== "ready" ||
        isSubmitting ||
        !input.trim()
      ) {
        console.log(
          "🔍 handleFormSubmit blocked - already submitting or empty input"
        );
        return;
      }

      // Устанавливаем блокировку
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      console.log("🔍 handleFormSubmit called - НЕ обновляем URL");
      console.log("🔍 Chat ID:", id);
      console.log("🔍 Input:", input);
      console.log("🔍 Chat request options:", chatRequestOptions);

      // НЕ обновляем URL сразу - ждем успешного создания чата
      // URL будет обновлен в onFinish callback

      // AI SDK v5: Use sendMessage to send the message
      sendMessage({
        text: input,
        // TODO: Add attachments support
      });

      // Clear input and attachments after sending
      setInput("");
      setAttachments([]);
    },
    [input, attachments, sendMessage, id, status, isSubmitting]
  );

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={initialChatModel}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
        />

        <Messages
          chatId={id}
          status={scriptStatus === "submitted" ? "submitted" : status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          selectedChatModel={initialChatModel}
          selectedVisibilityType={visibilityType}
          append={handleAppend}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleFormSubmit}
              status={status}
              stop={stop}
              isSubmitting={isSubmitting}
              isSubmittingRef={isSubmittingRef}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={handleAppend}
              selectedVisibilityType={visibilityType}
            />
          )}
        </form>

        {/* Менеджер артефактов для отладки и восстановления */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-4 right-4 z-50 max-w-sm">
            <ArtifactManager chatId={id} />
            <div className="mt-2">
              <ArtifactDebug chatId={id} />
            </div>
          </div>
        )}
      </div>

      <UIArtifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleFormSubmit}
        status={status}
        stop={stop}
        reload={reload}
        attachments={attachments}
        setAttachments={setAttachments}
        append={handleAppend}
        messages={messages}
        setMessages={setMessages}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
        selectedChatModel={initialChatModel}
      />
    </>
  );
}

export function Chat(props: {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
  onDataStream?: (dataStream: any[]) => void;
  isGeminiChat?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-w-0 h-dvh bg-background">
          <div className="flex items-center justify-center h-dvh">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin text-zinc-500 size-12">
                <LoaderIcon size={48} />
              </div>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Loading chat...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <ChatContent
        {...props}
        isGeminiChat={props.isGeminiChat ?? false}
      />
    </Suspense>
  );
}
