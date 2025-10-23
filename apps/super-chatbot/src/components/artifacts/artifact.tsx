'use client';

import type { UIMessage } from 'ai';
import type { Attachment } from '@/lib/types/attachment';
import { formatDistance } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useDebounceCallback, useWindowSize } from 'usehooks-ts';
import type { Document, Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { ArtifactActions } from './artifact-actions';
import { ArtifactCloseButton } from './artifact-close-button';
import { ArtifactMessages } from './artifact-messages';
import { useArtifactContext } from '@/contexts/artifact-context';
import { imageArtifact } from '@/artifacts/image/client';

import { sheetArtifact } from '@/artifacts/sheet/client';
import { textArtifact } from '@/artifacts/text/client';
import { videoArtifact } from '@/artifacts/video/client';
import { scriptArtifact } from '@/artifacts/script/client';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useSidebar, MultimodalInput, Toolbar, VersionFooter } from '../';
import type { VisibilityType } from '../shared/visibility-selector';

export const artifactDefinitions = [
  textArtifact,
  imageArtifact,
  sheetArtifact,
  videoArtifact,
  scriptArtifact,
] as const;
export type ArtifactKind = (typeof artifactDefinitions)[number]['kind'];

export interface UIArtifact {
  title: string;
  documentId: string;
  kind: ArtifactKind;
  content: string;
  isVisible: boolean;
  status: 'streaming' | 'idle' | 'error' | 'completed' | 'pending';
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  timestamp?: number;
}

// Function to convert JSON title to human-readable format
function getDisplayTitle(title: string, kind: ArtifactKind): string {
  if (kind === 'image') {
    try {
      const params = JSON.parse(title);
      if (params.prompt) {
        return `AI Image: ${params.prompt.substring(0, 60)}${params.prompt.length > 60 ? '...' : ''}`;
      }
    } catch {
      // If not JSON, return as is
      return title;
    }
  }

  if (kind === 'video') {
    // Check if title starts with "Video:" (new readable format)
    if (title.startsWith('Video:')) {
      // Extract readable part before JSON
      const jsonMatch = title?.match(/\{.*\}$/);
      if (jsonMatch) {
        return title.substring(0, title.length - jsonMatch[0].length).trim();
      }
      return title; // If no JSON found, return as is
    }

    // Fallback: try to parse as JSON (old format)
    try {
      const params = JSON.parse(title);
      if (params.prompt) {
        return `AI Video: ${params.prompt.substring(0, 60)}${params.prompt.length > 60 ? '...' : ''}`;
      }
    } catch {
      // If not JSON, return as is
      return title;
    }
  }

  return title;
}

function PureArtifact({
  chatId,
  input,
  setInput,
  handleSubmit,
  status,
  stop,
  attachments,
  setAttachments,
  append,
  messages,
  setMessages,
  reload,
  votes,
  isReadonly,
  selectedVisibilityType,
  selectedChatModel,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void; // AI SDK v5: manually managed
  status: UseChatHelpers<any>['status'];
  stop: UseChatHelpers<any>['stop'];
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void; // AI SDK v5: setMessages accepts value or updater function
  votes: Array<Vote> | undefined;
  append: (message: any, options?: any) => Promise<string | null | undefined>; // AI SDK v5: append type
  handleSubmit: (event?: any, options?: any) => void; // AI SDK v5: handleSubmit type
  reload: () => void; // AI SDK v5: reload type
  isReadonly: boolean;
  selectedVisibilityType: VisibilityType;
  selectedChatModel: string;
}) {
  const { artifact, setArtifact, metadata, setMetadata } = useArtifactContext();

  // Only log in development and with throttling to avoid spam
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLogTimeRef = useRef<number>(0);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const now = Date.now();
      if (now - lastLogTimeRef.current > 1000) {
        // Throttle to once per second
        // Artifact component rendered
        lastLogTimeRef.current = now;
      }
    }
  });

  // Check if documentId is valid UUID (not empty, not 'init', not nano-banana ID)
  const isValidDocumentId = (id: string) => {
    if (!id || id === 'init' || id.startsWith('nano-banana-')) return false;
    // Check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const {
    data: documents,
    isLoading: isDocumentsFetching,
    mutate: mutateDocuments,
  } = useSWR<Array<Document>>(
    isValidDocumentId(artifact.documentId) && artifact.status !== 'streaming'
      ? `/api/document?id=${artifact.documentId}`
      : null,
    fetcher,
  );

  const [mode, setMode] = useState<'edit' | 'diff'>('edit');
  const [document, setDocument] = useState<Document | null>(null);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);

  // Безопасное использование useSidebar с fallback
  let isSidebarOpen = false;
  try {
    const sidebarContext = useSidebar();
    isSidebarOpen = sidebarContext.open;
  } catch (error) {
    // SidebarProvider недоступен, используем значение по умолчанию
    console.warn('SidebarProvider not available, using default sidebar state');
  }

  // Memoize effect dependencies to prevent unnecessary reruns
  const documentsLength = documents?.length || 0;
  const lastDocumentId = documents?.at(-1)?.id;

  useEffect(() => {
    if (documents && documents.length > 0) {
      const mostRecentDocument = documents.at(-1);

      if (mostRecentDocument) {
        setDocument(mostRecentDocument);
        setCurrentVersionIndex(documents.length - 1);
        setArtifact((currentArtifact) => ({
          ...currentArtifact,
          content: mostRecentDocument.content ?? '',
        }));
      }
    }
  }, [documents, documentsLength, lastDocumentId, setArtifact]);

  // Memoize mutateDocuments call to prevent unnecessary API calls
  const stableArtifactStatus = useRef(artifact.status);
  useEffect(() => {
    if (stableArtifactStatus.current !== artifact.status) {
      stableArtifactStatus.current = artifact.status;
      mutateDocuments();
    }
  }, [artifact.status, mutateDocuments]);

  const { mutate } = useSWRConfig();
  const [isContentDirty, setIsContentDirty] = useState(false);

  const handleContentChange = useCallback(
    (updatedContent: string) => {
      if (!artifact) return;

      mutate<Array<Document>>(
        `/api/document?id=${artifact.documentId}`,
        async (currentDocuments) => {
          if (!currentDocuments) return undefined;

          const currentDocument = currentDocuments.at(-1);

          if (!currentDocument || !currentDocument.content) {
            setIsContentDirty(false);
            return currentDocuments;
          }

          if (
            currentDocument.content !== updatedContent &&
            isValidDocumentId(artifact.documentId)
          ) {
            await fetch(`/api/document?id=${artifact.documentId}`, {
              method: 'POST',
              body: JSON.stringify({
                title: artifact.title,
                content: updatedContent,
                kind: artifact.kind,
              }),
            });

            setIsContentDirty(false);

            const newDocument = {
              ...currentDocument,
              content: updatedContent,
              createdAt: new Date(),
            };

            return [...currentDocuments, newDocument];
          }
          return currentDocuments;
        },
        { revalidate: false },
      );
    },
    [artifact, mutate],
  );

  const debouncedHandleContentChange = useDebounceCallback(
    handleContentChange,
    2000,
  );

  const saveContent = useCallback(
    (updatedContent: string, debounce: boolean) => {
      if (document && updatedContent !== document.content) {
        setIsContentDirty(true);

        if (debounce) {
          debouncedHandleContentChange(updatedContent);
        } else {
          handleContentChange(updatedContent);
        }
      }
    },
    [document, debouncedHandleContentChange, handleContentChange],
  );

  function getDocumentContentById(index: number) {
    if (!documents) return '';
    if (!documents[index]) return '';
    return documents[index].content ?? '';
  }

  const handleVersionChange = (type: 'next' | 'prev' | 'toggle' | 'latest') => {
    if (!documents) return;

    if (type === 'latest') {
      setCurrentVersionIndex(documents.length - 1);
      setMode('edit');
    }

    if (type === 'toggle') {
      setMode((mode) => (mode === 'edit' ? 'diff' : 'edit'));
    }

    if (type === 'prev') {
      if (currentVersionIndex > 0) {
        setCurrentVersionIndex((index) => index - 1);
      }
    } else if (type === 'next') {
      if (currentVersionIndex < documents.length - 1) {
        setCurrentVersionIndex((index) => index + 1);
      }
    }
  };

  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  /*
   * NOTE: if there are no documents, or if
   * the documents are being fetched, then
   * we mark it as the current version.
   */

  const isCurrentVersion =
    documents && documents.length > 0
      ? currentVersionIndex === documents.length - 1
      : true;

  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const isMobile = windowWidth ? windowWidth < 768 : false;

  const artifactDefinition = artifactDefinitions.find(
    (definition) => definition.kind === artifact.kind,
  );

  if (!artifactDefinition) {
    throw new Error('Artifact definition not found!');
  }

  useEffect(() => {
    if (isValidDocumentId(artifact.documentId)) {
      if (artifactDefinition.initialize) {
        artifactDefinition.initialize({
          documentId: artifact.documentId,
          setMetadata,
        });
      }
    }
  }, [artifact.documentId, artifactDefinition, setMetadata]);

  return (
    <AnimatePresence>
      {artifact.isVisible && (
        <motion.div
          data-testid="artifact"
          className="flex flex-row h-dvh w-dvw fixed top-0 left-0 z-50 bg-transparent"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { delay: 0.4 } }}
        >
          {!isMobile && (
            <motion.div
              className="fixed bg-background h-dvh"
              initial={{
                width: isSidebarOpen ? windowWidth - 256 : windowWidth,
                right: 0,
              }}
              animate={{ width: windowWidth, right: 0 }}
              exit={{
                width: isSidebarOpen ? windowWidth - 256 : windowWidth,
                right: 0,
              }}
            />
          )}

          {!isMobile && (
            <motion.div
              className="relative w-[400px] bg-muted dark:bg-background h-dvh shrink-0"
              initial={{ opacity: 0, x: 10, scale: 1 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: {
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 200,
                  damping: 30,
                },
              }}
              exit={{
                opacity: 0,
                x: 0,
                scale: 1,
                transition: { duration: 0 },
              }}
            >
              <AnimatePresence>
                {!isCurrentVersion && (
                  <motion.div
                    className="left-0 absolute h-dvh w-[400px] top-0 bg-zinc-900/50 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>

              <div className="flex flex-col h-full justify-between items-center">
                <ArtifactMessages
                  chatId={chatId}
                  status={status}
                  votes={votes}
                  messages={messages}
                  setMessages={setMessages}
                  reload={reload}
                  isReadonly={isReadonly}
                  artifactStatus={artifact.status}
                />

                <form className="flex flex-row gap-2 relative items-end w-full px-4 pb-4">
                  <MultimodalInput
                    chatId={chatId}
                    input={input}
                    setInput={setInput}
                    handleSubmit={handleSubmit}
                    status={status}
                    stop={stop}
                    attachments={attachments}
                    setAttachments={setAttachments}
                    messages={messages}
                    append={append}
                    className="bg-background dark:bg-muted"
                    setMessages={setMessages}
                    selectedVisibilityType={selectedVisibilityType}
                  />
                </form>
              </div>
            </motion.div>
          )}

          <motion.div
            className="fixed dark:bg-muted bg-background h-dvh flex flex-col overflow-y-scroll md:border-l dark:border-zinc-700 border-zinc-200"
            initial={
              isMobile
                ? {
                    opacity: 1,
                    x: artifact.boundingBox.left,
                    y: artifact.boundingBox.top,
                    height: artifact.boundingBox.height,
                    width: artifact.boundingBox.width,
                    borderRadius: 50,
                  }
                : {
                    opacity: 1,
                    x: artifact.boundingBox.left,
                    y: artifact.boundingBox.top,
                    height: artifact.boundingBox.height,
                    width: artifact.boundingBox.width,
                    borderRadius: 50,
                  }
            }
            animate={
              isMobile
                ? {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    height: windowHeight,
                    width: windowWidth ? windowWidth : 'calc(100dvw)',
                    borderRadius: 0,
                    transition: {
                      delay: 0,
                      type: 'spring',
                      stiffness: 200,
                      damping: 30,
                      duration: 5000,
                    },
                  }
                : {
                    opacity: 1,
                    x: 400,
                    y: 0,
                    height: windowHeight,
                    width: windowWidth
                      ? windowWidth - 400
                      : 'calc(100dvw-400px)',
                    borderRadius: 0,
                    transition: {
                      delay: 0,
                      type: 'spring',
                      stiffness: 200,
                      damping: 30,
                      duration: 5000,
                    },
                  }
            }
            exit={{
              opacity: 0,
              scale: 0.5,
              transition: {
                delay: 0.1,
                type: 'spring',
                stiffness: 600,
                damping: 30,
              },
            }}
          >
            <div className="p-2 flex flex-row justify-between items-start">
              <div className="flex flex-row gap-4 items-start">
                <ArtifactCloseButton />

                <div className="flex flex-col">
                  <div className="font-medium">
                    {getDisplayTitle(artifact.title, artifact.kind)}
                  </div>

                  {isContentDirty ? (
                    <div className="text-sm text-muted-foreground">
                      Saving changes...
                    </div>
                  ) : document ? (
                    <div className="text-sm text-muted-foreground">
                      {`Updated ${formatDistance(
                        new Date(document.createdAt),
                        new Date(),
                        {
                          addSuffix: true,
                        },
                      )}`}
                    </div>
                  ) : (
                    <div className="w-32 h-3 mt-2 bg-muted-foreground/20 rounded-md animate-pulse" />
                  )}
                </div>
              </div>

              <ArtifactActions
                artifact={artifact}
                currentVersionIndex={currentVersionIndex}
                handleVersionChange={handleVersionChange}
                isCurrentVersion={isCurrentVersion}
                mode={mode}
                metadata={metadata}
                setMetadata={setMetadata}
              />
            </div>

            <div className="dark:bg-muted bg-background h-full overflow-y-scroll !max-w-full items-center">
              {(() => {
                return (
                  <artifactDefinition.content
                    title={artifact.title}
                    content={
                      isCurrentVersion
                        ? artifact.content
                        : getDocumentContentById(currentVersionIndex)
                    }
                    mode={mode}
                    status={
                      artifact.status === 'completed' ||
                      artifact.status === 'pending'
                        ? 'idle'
                        : artifact.status
                    }
                    currentVersionIndex={currentVersionIndex}
                    suggestions={[]}
                    onSaveContent={saveContent}
                    isInline={false}
                    isCurrentVersion={isCurrentVersion}
                    getDocumentContentById={getDocumentContentById}
                    isLoading={isDocumentsFetching && !artifact.content}
                    metadata={metadata}
                    setMetadata={setMetadata}
                    append={append}
                    setMessages={setMessages}
                    setArtifact={setArtifact}
                    chatId={chatId}
                    documentId={artifact.documentId}
                  />
                );
              })()}

              <AnimatePresence>
                {isCurrentVersion && (
                  <Toolbar
                    isToolbarVisible={isToolbarVisible}
                    setIsToolbarVisible={setIsToolbarVisible}
                    append={append}
                    status={status}
                    stop={stop}
                    setMessages={setMessages}
                    artifactKind={artifact.kind}
                  />
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {!isCurrentVersion && (
                <VersionFooter
                  currentVersionIndex={currentVersionIndex}
                  documents={documents}
                  handleVersionChange={handleVersionChange}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// IMPORTANT: Don't use memo with custom comparison for components that use context
// The component relies on ArtifactContext which is not part of props
// Memo with custom comparison will block re-renders when context changes
export const Artifact = PureArtifact;
