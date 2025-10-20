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
    initialMessages: initialMessages as any, // Use initialMessages for uncontrolled mode
    // AI SDK v5: api parameter might be different
    ...(isGeminiChat ? { api: "/api/gemini-chat" } : {}),
    // AI SDK v5: body parameter might be different
    body: {
      id,
      selectedChatModel: initialChatModel,
      selectedVisibilityType: visibilityType,
    },
    // Add onResponse to log what we receive from server
    onResponse: (response: any) => {
      console.log("🌐 Client onResponse - Received response from server:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
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
      console.log("🔍 ========== CLIENT onFinish START ==========");
      console.log("🔍 Chat ID in onFinish:", id);
      console.log("🔍 onFinish result keys:", Object.keys(result || {}));
      console.log("🔍 onFinish result full:", result);

      // IMPORTANT: result.messages contains the complete updated message list
      // The messages from hook (line 194) might be empty at this point due to timing
      const allMessages = result?.messages || [];
      console.log("🔍 All messages from result:", allMessages.length);
      console.log(
        "🔍 Messages from hook (might be empty at this point):",
        messages.length
      );
      console.log(
        "🔍 All messages details:",
        allMessages.map((m: any) => ({
          id: m.id,
          role: m.role,
          partsCount: m.parts?.length || 0,
          hasContent: !!m.content,
          content: m.content ? `${m.content.substring(0, 100)}...` : "(empty)",
        }))
      );
      console.log(
        "🔍 Last message:",
        allMessages[allMessages.length - 1]
          ? {
              id: allMessages[allMessages.length - 1]?.id,
              role: allMessages[allMessages.length - 1]?.role,
              partsCount:
                allMessages[allMessages.length - 1]?.parts?.length || 0,
              hasContent: !!(allMessages[allMessages.length - 1] as any)
                ?.content,
            }
          : null
      );

      // Extract script documents from tool results
      const scriptDocuments: Array<{ id: string; title: string }> = [];

      console.log(
        "📝 Client onFinish - Searching for script documents in",
        allMessages.length,
        "messages"
      );

      for (const msg of allMessages) {
        console.log(
          "📝 Client onFinish - Message role:",
          msg.role,
          "has parts:",
          !!(msg as any).parts
        );

        if (msg.role === "assistant" && (msg as any).parts) {
          console.log(
            "📝 Client onFinish - Assistant message parts:",
            (msg as any).parts.length
          );

          for (const part of (msg as any).parts) {
            console.log("📝 Client onFinish - Part:", {
              type: part.type,
              hasToolInvocation: !!part.toolInvocation,
              hasOutput: !!part.output,
              hasToolName: !!part.toolName,
              hasToolType: !!part.toolType,
              textContent:
                part.type === "text" ? part.text || "(empty)" : undefined,
            });

            // Check multiple possible structures
            let toolResult = null;
            let isScriptTool = false;

            // Structure 1: part.toolInvocation
            if (part.type === "tool-invocation" && part.toolInvocation) {
              const { toolName, state, result } = part.toolInvocation;
              if (
                state === "result" &&
                toolName === "configureScriptGeneration"
              ) {
                toolResult = result;
                isScriptTool = true;
                console.log(
                  "📝 Client onFinish - Match: Structure 1 (toolInvocation)"
                );
              }
            }

            // Structure 2: part.type is the tool name
            if (part.type === "tool-configureScriptGeneration" && part.output) {
              toolResult = part.output;
              isScriptTool = true;
              console.log(
                "📝 Client onFinish - Match: Structure 2 (type=tool name)"
              );
            }

            // Structure 3: part.toolType
            if (
              part.output &&
              part.toolType === "tool-configureScriptGeneration"
            ) {
              toolResult = part.output;
              isScriptTool = true;
              console.log("📝 Client onFinish - Match: Structure 3 (toolType)");
            }

            // Structure 4: part.toolName
            if (
              part.toolName?.includes("configureScriptGeneration") &&
              part.output
            ) {
              toolResult = part.output;
              isScriptTool = true;
              console.log("📝 Client onFinish - Match: Structure 4 (toolName)");
            }

            if (isScriptTool && toolResult) {
              console.log(
                "📝 Client onFinish - Found script tool result:",
                toolResult
              );
              const { id, title } = toolResult as any;
              if (id && title) {
                scriptDocuments.push({ id, title });
                console.log("📝 ✅ Client onFinish - Found script document:", {
                  id,
                  title,
                });
              }
            }
          }
        }
      }

      console.log(
        "📝 Client onFinish - Total script documents found:",
        scriptDocuments.length
      );

      // CRITICAL FIX: The server already saves messages with attachments correctly.
      // We just need to trigger updateMessages to:
      // 1. Detect and open artifacts (script panel)
      // 2. Trigger UI re-render to show messages
      // The messages are loaded from DB with attachments already present.

      console.log(
        "📝 ✅ Calling updateMessages immediately to trigger artifact detection and UI update"
      );

      // Call updateMessages with result.messages to trigger:
      // - Artifact detection in use-artifact.ts (lines 215-345)
      // - UI re-render showing messages
      if (updateMessages && allMessages.length > 0) {
        updateMessages(allMessages);
        console.log(
          "📝 ✅ updateMessages called successfully with",
          allMessages.length,
          "messages"
        );
      } else {
        console.log(
          "⚠️ Cannot call updateMessages:",
          !updateMessages ? "updateMessages is null" : "no messages"
        );
      }

      // Сбрасываем состояние блокировки
      isSubmittingRef.current = false;
      setIsSubmitting(false);

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

  // REMOVED: Duplicate updateMessages call that was interfering with onFinish
  // The onFinish callback already calls updateMessages with the correct messages from result.messages
  // This useEffect was causing issues by calling updateMessages too early with empty messages array

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
