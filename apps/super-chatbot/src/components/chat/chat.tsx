"use client";

import type { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import type { Attachment } from "@/lib/types/attachment";
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

  const chatHelpers = useChat({
    id,
    messages: initialMessages, // AI SDK v5: messages instead of initialMessages

    // body: {
    //   id,
    //   selectedChatModel: initialChatModel,
    //   selectedVisibilityType: visibilityType,
    // }, // Removed in AI SDK v5

    generateId: generateUUID,

    onFinish: () => {
      console.log("🔍 useChat onFinish called - НЕ обновляем URL");
      console.log("🔍 Chat ID in onFinish:", id);
      // Сбрасываем состояние блокировки
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      // НЕ обновляем URL здесь - ждем команду от сервера
      // URL будет обновлен только после успешного создания чата
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },

    onError: (error) => {
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

    // api: isGeminiChat ? "/api/gemini-chat" : "/api/chat", // Removed in AI SDK v5
  });

  // Extract properties from chatHelpers for AI SDK v5 compatibility
  const { messages, setMessages, status, stop } = chatHelpers;

  // AI SDK v5: input and handleSubmit are not directly available
  const [input, setInput] = useState("");

  // Define append and reload functions for AI SDK v5 compatibility
  const append = (message: any) => {
    setMessages((prev: any) => [...prev, message]);
  };

  const reload = () => {
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("🔍 handleSubmit START - function called");
    console.log("🔍 handleSubmit event object:", e);
    console.log("🔍 handleSubmit event type:", typeof e);

    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      console.log("🔍 handleSubmit after preventDefault");
    } else {
      console.log("🔍 handleSubmit no preventDefault method");
    }

    console.log("🔍 handleSubmit called with input:", input);
    console.log("🔍 handleSubmit input.trim():", input.trim());

    if (!input.trim()) {
      console.log("🔍 handleSubmit blocked - no input");
      return;
    }

    console.log("🔍 handleSubmit proceeding with message creation");

    // Manual append implementation
    const userMessage = {
      role: "user",
      content: input,
      parts: [{ type: "text", text: input }],
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };
    console.log("🔍 handleSubmit created userMessage:", userMessage);

    setMessages((prev: any) => [...prev, userMessage]);
    setInput("");
    console.log("🔍 handleSubmit updated messages and cleared input");

    // Send message to API
    console.log("🔍 handleSubmit about to send to API");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          message: userMessage,
          selectedChatModel: initialChatModel,
          selectedVisibilityType: visibilityType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("🔍 Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the message if sending failed
      setMessages((prev: any) => prev.slice(0, -1));
    }
  };

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);
  const [scriptStatus, setScriptStatus] = useState<"idle" | "submitted">(
    "idle"
  );

  const handleAppend = useCallback(
    (message: any, options?: any) => {
      // НЕ обновляем URL здесь - ждем команду от сервера
      setMessages((prev: any) => [...prev, message]);
    },
    [setMessages, id]
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

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const { setArtifact, updateMessages, artifact } = useArtifactContext();
  const isArtifactVisible = artifact.isVisible;

  // Notify parent about dataStream changes for artifacts
  useEffect(() => {
    // Обрабатываем команды перенаправления от сервера
    // Note: data handling removed in AI SDK v5, will be handled differently
  }, [onDataStream]);

  useAutoResume({
    autoResume,
    initialMessages,
    experimental_resume: () => {}, // Use new resume function
    data: [], // Empty data array in AI SDK v5
    setMessages: setMessages as any, // Type assertion for compatibility
  });

  // Set active chat for cleanup management
  useEffect(() => {
    setActiveChat(id);
  }, [id]);

  // Обновляем сообщения в контексте артефактов для детекции
  useEffect(() => {
    if (updateMessages && messages) {
      console.log("🔄 Updating messages in artifact context:", {
        chatId: id,
        messagesCount: messages.length,
      });
      updateMessages(messages);
    }
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

  const handleFormSubmit = useCallback(
    async (
      event?: { preventDefault?: () => void } | undefined,
      chatRequestOptions?: any
    ) => {
      if (event?.preventDefault) {
        event.preventDefault();
      }

      console.log("🔍 handleFormSubmit called - НЕ обновляем URL");
      console.log("🔍 Chat ID:", id);
      console.log("🔍 Chat request options:", chatRequestOptions);

      // НЕ обновляем URL сразу - ждем успешного создания чата
      // URL будет обновлен в onFinish callback API route

      console.log("🔍 handleFormSubmit about to call handleSubmit");
      console.log("🔍 handleSubmit function:", typeof handleSubmit);

      if (typeof handleSubmit !== "function") {
        console.error("🔍 handleSubmit is not a function:", handleSubmit);
        return;
      }

      try {
        await handleSubmit(event as React.FormEvent);
        console.log("🔍 handleFormSubmit finished calling handleSubmit");
      } catch (error) {
        console.error("🔍 Error in handleFormSubmit:", error);
      }
    },
    [handleSubmit, id]
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
          setMessages={setMessages as any}
          reload={() => window.location.reload()}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          selectedChatModel={initialChatModel}
          selectedVisibilityType={visibilityType}
          append={append}
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
              setMessages={setMessages as any}
              append={append}
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
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
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
                Загрузка чата...
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
