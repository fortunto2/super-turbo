'use client';

import { useArtifactContext } from '@/contexts/artifact-context';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { useChatImageSSE } from '@/hooks/use-chat-image-sse';
import { useChatVideoSSE } from '@/hooks/use-chat-video-sse';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { setActiveChat } from '@/lib/utils/chat-websocket-cleanup';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
import { UIArtifact } from '../artifacts';
import { ArtifactDebug } from '../artifacts/artifact-debug';
import { ArtifactManager } from '../artifacts/artifact-manager';
import { LoaderIcon } from '../common/icons';
import { toast } from '../common/toast';
import { Messages } from '../messages';
import type { VisibilityType } from '../shared/visibility-selector';
import { getChatHistoryPaginationKey } from '../sidebar/sidebar-history';
import { ChatHeader } from './chat-header';
import { MultimodalInput } from './multimodal-input';

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
    role: 'assistant',
    content: ' ',
    parts: [],
    experimental_attachments: [
      {
        url: `${
          typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost:3000'
        }/api/document?id=${docId}`,
        name: userPrompt || 'Scenario.md',
        contentType: 'text/markdown',
        documentId: docId,
      },
    ],
    createdAt: new Date(),
    id: generateUUID(),
  };
  setMessages((prev) => [...prev, artifactAttachmentMessage as UIMessage]);
  await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const [input, setInput] = useState('');

  const chatHelpers = useChat({
    id,
    messages: initialMessages as any, // AI SDK v5: messages instead of initialMessages
    // AI SDK v5: api parameter might be different
    ...(isGeminiChat ? { api: '/api/gemini-chat' } : {}),
    // AI SDK v5: body parameter might be different
    body: {
      id,
      selectedChatModel: initialChatModel,
      selectedVisibilityType: visibilityType,
    },
    // AI SDK v5: Use fetch function to intercept and modify the request
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      console.log('🔍 Custom fetch called');
      console.log('🔍 Request URL:', input);

      // Parse the request body to get messages
      if (init?.body) {
        try {
          const body = JSON.parse(init.body as string);
          console.log(
            '🔍 CLIENT - Original messages count:',
            body.messages?.length || 0,
          );
          console.log(
            '🔍 CLIENT - Original message roles:',
            body.messages?.map((m: any) => m.role) || [],
          );

          // CRITICAL FIX: Only send the last (new) message
          // After page reload, useChat has all messages from DB
          // We only need to send the new user message
          if (body.messages && body.messages.length > 0) {
            const lastMessage = body.messages[body.messages.length - 1];
            console.log('🔍 CLIENT - Sending only last message:', {
              id: lastMessage.id,
              role: lastMessage.role,
              content: lastMessage.content?.substring(0, 30),
            });

            body.messages = [lastMessage];
            init.body = JSON.stringify(body);

            console.log(
              '🔍 CLIENT - Modified messages count:',
              body.messages.length,
            );
          }
        } catch (e) {
          console.error('Failed to parse request body:', e);
        }
      }

      return fetch(input, init);
    },
    onFinish: (result: any) => {
      console.log('🔍 Client onFinish - Chat ID:', id);

      // IMPORTANT: result.messages contains the complete updated message list
      let allMessages = result?.messages || [];
      console.log('🔍 Messages received:', allMessages.length);

      // CRITICAL FIX: Add attachments for script documents from tool results
      // This ensures scripts appear immediately without page reload
      if (allMessages.length > 0) {
        const lastMessage = allMessages[allMessages.length - 1];
        if (
          lastMessage &&
          lastMessage.role === 'assistant' &&
          lastMessage.parts
        ) {
          console.log('🔧 Checking for script tools in last message');

          const scriptDocuments: Array<{
            id: string;
            title: string;
            kind: string;
          }> = [];

          // Check each part for script-generating tools
          for (const part of lastMessage.parts) {
            if (
              part.type &&
              typeof part.type === 'string' &&
              part.type.startsWith('tool-') &&
              ((part as any).state === 'output-available' ||
                (part as any).state === 'result') &&
              (part as any).output
            ) {
              const toolName = part.type.replace('tool-', '');
              const toolResult = (part as any).output;

              // Check for script documents
              if (
                (toolName === 'configureScriptGeneration' ||
                  (toolName === 'createDocument' &&
                    toolResult.kind === 'script')) &&
                toolResult.id &&
                toolResult.kind === 'script'
              ) {
                scriptDocuments.push({
                  id: toolResult.id,
                  title: toolResult.title || 'Document',
                  kind: toolResult.kind,
                });
                console.log('🔧 ✅ Found script document:', toolResult.id);
              }
            }
          }

          // Add attachments if we found script documents
          if (scriptDocuments.length > 0) {
            const attachments = lastMessage.experimental_attachments || [];
            let hasNewAttachments = false;

            for (const doc of scriptDocuments) {
              // Check if attachment already exists
              const exists = attachments.some(
                (att: any) => att.documentId === doc.id,
              );
              if (!exists) {
                attachments.push({
                  name:
                    doc.title.length > 200
                      ? `${doc.title.substring(0, 200)}...`
                      : doc.title,
                  url: `${window.location.origin}/api/document?id=${doc.id}`,
                  contentType: 'text/markdown' as const,
                  documentId: doc.id,
                });
                hasNewAttachments = true;
                console.log('🔧 ✅ Added script attachment on client:', doc.id);
              }
            }

            if (hasNewAttachments) {
              // Update the last message with new attachments
              allMessages = [
                ...allMessages.slice(0, -1),
                {
                  ...lastMessage,
                  experimental_attachments: attachments,
                },
              ];
              console.log(
                '🔧 ✅ Updated messages with',
                attachments.length,
                'attachments',
              );
            }
          }
        }

        console.log(
          '🔍 Updating messages state with',
          allMessages.length,
          'messages',
        );

        // CRITICAL FIX: Remove image/video attachments to prevent token overflow
        // Keep markdown attachments (scripts) as they don't cause token overflow
        // Images/videos are displayed via SSE hooks, not via attachments in messages
        const messagesWithoutImageAttachments = allMessages.map((msg: any) => {
          if (!msg.experimental_attachments) return msg;

          // Keep only markdown attachments (scripts), remove image/video attachments
          const filteredAttachments = msg.experimental_attachments.filter(
            (att: any) => att.contentType === 'text/markdown',
          );

          return {
            ...msg,
            experimental_attachments:
              filteredAttachments.length > 0 ? filteredAttachments : undefined,
          };
        });
        console.log(
          '🔍 Filtered image/video attachments from',
          allMessages.length,
          'messages to prevent client-side token overflow',
        );

        // CRITICAL FIX: Explicitly update React state with new messages
        // AI SDK v5 requires explicit state update in onFinish callback
        setMessages(messagesWithoutImageAttachments);
        console.log(
          '✅ setMessages (React state) called with',
          messagesWithoutImageAttachments.length,
          'messages',
        );

        // Update artifact context for artifact detection
        if (updateMessages) {
          updateMessages(messagesWithoutImageAttachments);
          console.log('✅ updateMessages (artifact context) called');
        }
      }

      // Сбрасываем состояние блокировки
      isSubmittingRef.current = false;
      setIsSubmitting(false);

      // Обновляем URL после успешного завершения чата
      if (id && typeof window !== 'undefined') {
        const newUrl = `/chat/${id}`;
        if (window.location.pathname !== newUrl) {
          window.history.pushState(null, '', newUrl);
        }
      }
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error: Error) => {
      // При ошибке не обновляем URL, чтобы избежать 404
      console.error('Chat error:', error);

      // Сбрасываем состояние блокировки
      isSubmittingRef.current = false;
      setIsSubmitting(false);

      // Передаем ошибку в родительский компонент
      if (onError) {
        onError(error);
      }

      toast({
        type: 'error',
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
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);
  const [scriptStatus, setScriptStatus] = useState<'idle' | 'submitted'>(
    'idle',
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
    [sendMessage],
  );

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      handleAppend({
        role: 'user',
        content: query,
      });

      setHasAppendedQuery(true);
      // НЕ обновляем URL здесь - ждем команду от сервера
    }
  }, [query, handleAppend, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
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

    console.log('🔄 Updating messages in artifact context:', {
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
      console.log('🔄 Calling updateMessages after timeout');
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
    if (typeof window !== 'undefined') {
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
      chatRequestOptions?: any,
    ) => {
      if (event?.preventDefault) {
        event.preventDefault();
      }

      // Проверяем и устанавливаем блокировку
      if (
        isSubmittingRef.current ||
        status !== 'ready' ||
        isSubmitting ||
        !input.trim()
      ) {
        console.log(
          '🔍 handleFormSubmit blocked - already submitting or empty input',
        );
        return;
      }

      // Устанавливаем блокировку
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      console.log('🔍 handleFormSubmit called - НЕ обновляем URL');
      console.log('🔍 Chat ID:', id);
      console.log('🔍 Input:', input);
      console.log('🔍 Chat request options:', chatRequestOptions);

      // НЕ обновляем URL сразу - ждем успешного создания чата
      // URL будет обновлен в onFinish callback

      // AI SDK v5: Use sendMessage to send the message
      sendMessage({
        text: input,
        // TODO: Add attachments support
      });

      // Clear input and attachments after sending
      setInput('');
      setAttachments([]);
    },
    [input, attachments, sendMessage, id, status, isSubmitting],
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
          status={scriptStatus === 'submitted' ? 'submitted' : status}
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
        {process.env.NODE_ENV === 'development' && (
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
      <ChatContent {...props} isGeminiChat={props.isGeminiChat ?? false} />
    </Suspense>
  );
}
