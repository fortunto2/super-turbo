'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@turbo-super/ui';
import { CopyIcon } from '@/components/common/icons';
import { ImageErrorDisplay } from '@/components/chat/error-display';
import { useImageGeneration } from '../hooks/use-image-generation';
import { useImageEffects } from '../hooks/use-image-effects';
import {
  copyImageUrlToClipboard,
  shouldShowSkeleton,
  shouldShowImage,
  getDisplayImageUrl,
  getDisplayPrompt,
  type ImageState,
} from '../utils/image-utils';
import { DebugParameters } from '@/components/debug/debug-parameters';
import { FileService, FileTypeEnum } from '@turbo-super/api';
import { toast } from 'sonner';

interface ImageEditorProps {
  chatId?: string;
  append?: any; // AI SDK v5: append type changed
  setMessages?: any; // AI SDK v5: setMessages type changed
  initialState?: ImageState;
  setArtifact?: (fn: (prev: any) => any) => void;
  parsedContent?: any;
}

function ImageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="size-4 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-64 w-full bg-gray-200 rounded-lg animate-pulse" />
      <div className="flex gap-2">
        <div className="h-2 flex-1 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function GenerationSkeleton({
  prompt,
  onForceCheck,
  isChecking,
}: {
  prompt?: string;
  onForceCheck?: () => void;
  isChecking?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative max-w-full max-h-[70vh] overflow-hidden rounded-lg border bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full h-80 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] -skew-x-12" />

          <div className="text-center space-y-4 z-10 relative">
            <div className="size-16 mx-auto bg-white/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🎨</span>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-white/40 rounded animate-pulse w-32 mx-auto" />
              <div className="h-2 bg-white/30 rounded animate-pulse w-24 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {prompt && (
        <div className="mt-6 text-center max-w-md">
          <div className="text-sm text-muted-foreground mb-2">Generating:</div>
          <div className="text-base italic text-gray-700 bg-gray-50 p-4 rounded-lg border">
            &ldquo;{prompt}&rdquo;
          </div>
        </div>
      )}

      {onForceCheck && (
        <div className="mt-4 text-center">
          <Button
            onClick={onForceCheck}
            variant="outline"
            size="sm"
            disabled={isChecking}
            className="text-xs"
          >
            {isChecking ? 'Checking...' : 'Check for results'}
          </Button>
        </div>
      )}
    </div>
  );
}

function ImageDisplay({
  imageUrl,
  prompt,
  onCopyUrl,
  onGenerateNew,
  apiPayload,
}: {
  imageUrl: string;
  prompt?: string;
  onCopyUrl: () => void;
  onGenerateNew: () => void;
  apiPayload?: any;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Generated Image</h3>
        <button
          type="button"
          onClick={onCopyUrl}
          className="p-1 hover:bg-gray-100 rounded"
          title="Copy image URL"
        >
          <CopyIcon size={16} />
        </button>
      </div>
      <div className="relative">
        {/*eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={`Generated image: ${prompt || 'AI generated'}`}
          className="w-full h-auto rounded-lg border object-contain"
          style={{ maxHeight: '70vh' }}
        />
        <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          ✅ Complete
        </div>
      </div>

      {prompt && (
        <div className="text-sm text-muted-foreground text-center italic">
          &ldquo;{prompt}&rdquo;
        </div>
      )}

      {/* Debug Parameters Display */}
      <DebugParameters data={apiPayload} />

      {/* Generate New button - always show at the bottom */}
    </div>
  );
}

function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>{isConnected ? '🟢' : '🔴'}</span>
      <span className="text-muted-foreground">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}

export function ImageEditor({
  chatId: propChatId,
  append,
  setMessages,
  initialState,
  setArtifact,
  parsedContent,
}: ImageEditorProps) {
  const params = useParams();
  const chatId = propChatId || (params?.id as string);

  // Use fileId from initialState if available (artifact mode), otherwise use chatId
  const effectiveProjectId = initialState?.fileId || chatId;

  // AICODE-DEBUG: Подробное логирование fileId в ImageEditor
  console.log('🔍 ImageEditor: FileId tracking:', {
    propChatId: propChatId || 'none',
    paramsId: (params?.id as string) || 'none',
    finalChatId: chatId || 'none',
    initialStateFileId: initialState?.fileId || 'none',
    initialStateProjectId: initialState?.projectId || 'none',
    effectiveProjectId: effectiveProjectId || 'none',
    fallbackReason: initialState?.fileId
      ? 'using initialState.fileId'
      : 'using chatId as fallback',
    initialStateKeys: initialState ? Object.keys(initialState) : 'none',
  });
  const imageGeneration = useImageGeneration(effectiveProjectId);
  const [prompt, setPrompt] = useState(initialState?.prompt || '');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isForceChecking, setIsForceChecking] = useState(false);

  // Initialize component state and tracking
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);

      // If we have initialState with projectId and it's processing, start tracking
      if (
        (initialState?.fileId || initialState?.projectId) &&
        (initialState.status === 'processing' ||
          initialState.status === 'pending')
      ) {
        console.log(
          '🎯 Starting tracking for artifact project:',
          initialState.projectId,
          'requestId:',
          initialState.requestId,
        );
        if (initialState?.projectId) {
          imageGeneration.startTracking(
            initialState.projectId,
            initialState.requestId,
          );
        } else if (initialState?.fileId) {
          imageGeneration.startTracking(
            initialState?.fileId,
            initialState.requestId,
          );
        }
      }
    }
  }, [
    hasInitialized,
    initialState?.fileId,
    initialState?.projectId,
    initialState?.status,
    initialState?.requestId,
    imageGeneration,
  ]);

  // Debug initialState changes to track when it gets updated
  useEffect(() => {
    console.log('🎯 ImageEditor: initialState updated', {
      projectId: initialState?.projectId || 'none',
      status: initialState?.status || 'none',
      imageUrl: initialState?.imageUrl
        ? `${initialState.imageUrl.substring(0, 50)}...`
        : 'none',
      timestamp: initialState?.timestamp || 'none',
    });
  }, [initialState]);

  // Determine what to display - prioritize initialState in artifact mode
  const isArtifactMode = !!initialState?.projectId;

  // Handle image effects - use initialState data in artifact mode
  const effectiveImageUrlForEffects = isArtifactMode
    ? initialState?.imageUrl
    : imageGeneration.imageUrl;
  const effectiveStatusForEffects = isArtifactMode
    ? initialState?.status
    : imageGeneration.status;

  useImageEffects({
    ...(effectiveImageUrlForEffects && {
      imageUrl: effectiveImageUrlForEffects,
    }),
    status: effectiveStatusForEffects || '',
    ...(append && { append }),
    prompt: prompt || initialState?.prompt || '',
    hasInitialized,
    ...(setArtifact && { setArtifact }),
    chatId,
    resetState: imageGeneration.resetState,
    setPrompt,
    ...(initialState?.prompt && { initialPrompt: initialState.prompt }),
    ...(setMessages && { setMessages }),
    ...(initialState?.fileId && { fileId: initialState.fileId }),
    ...(imageGeneration.fileId && { fileId: imageGeneration.fileId }),
  });

  // Get connection status - prioritize SSE over WebSocket
  const getConnectionStatus = (): boolean => {
    // If we have initialState with projectId, we're in artifact mode - use SSE status
    if (initialState?.fileId || initialState?.projectId) {
      // Check global artifact SSE connections
      if (typeof window !== 'undefined') {
        const globalWindow = window as any;
        if (
          initialState.fileId &&
          globalWindow.artifactSSEStatus?.[initialState.fileId]
        ) {
          return globalWindow.artifactSSEStatus[initialState.fileId];
        } else if (
          initialState.projectId &&
          globalWindow.artifactSSEStatus?.[initialState.projectId]
        ) {
          return globalWindow.artifactSSEStatus[initialState.projectId];
        }
      }
      // Fallback: assume connected if we have projectId and it's processing/pending
      return (
        initialState.status === 'processing' ||
        initialState.status === 'pending'
      );
    }

    // Fallback to imageGeneration connection status for standalone usage
    return imageGeneration.isConnected;
  };

  const isConnected = getConnectionStatus();
  const effectiveImageUrl = isArtifactMode
    ? initialState?.imageUrl
    : imageGeneration.imageUrl;
  const showSkeleton = shouldShowSkeleton(
    initialState,
    effectiveImageUrl,
    initialState?.imageUrl,
  );
  const showImage = shouldShowImage(effectiveImageUrl, initialState?.imageUrl);
  const displayImageUrl = getDisplayImageUrl(
    effectiveImageUrl,
    initialState?.imageUrl,
  );
  const displayPrompt = getDisplayPrompt(prompt, initialState?.prompt);

  // Debug display logic to understand why image is not showing
  useEffect(() => {
    console.log('🎯 ImageEditor display state:', {
      projectId: initialState?.projectId || 'none',
      isArtifactMode,
      initialStatus: initialState?.status || 'none',
      initialImageUrl: initialState?.imageUrl
        ? `${initialState.imageUrl.substring(0, 50)}...`
        : 'none',
      liveImageUrl: imageGeneration.imageUrl
        ? `${imageGeneration.imageUrl.substring(0, 50)}...`
        : 'none',
      effectiveImageUrl: effectiveImageUrl
        ? `${effectiveImageUrl.substring(0, 50)}...`
        : 'none',
      showSkeleton,
      showImage,
      displayImageUrl: displayImageUrl
        ? `${displayImageUrl.substring(0, 50)}...`
        : 'none',
    });
  }, [
    initialState?.status,
    initialState?.imageUrl,
    imageGeneration.imageUrl,
    effectiveImageUrl,
    showSkeleton,
    showImage,
    displayImageUrl,
    initialState?.projectId,
    isArtifactMode,
  ]);

  // Show loading skeleton if no chatId
  if (!chatId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Image Editor...</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageSkeleton />
        </CardContent>
      </Card>
    );
  }

  const handleCopyUrl = () => {
    if (displayImageUrl) {
      copyImageUrlToClipboard(displayImageUrl);
    }
  };

  const handleGenerateNew = () => {
    imageGeneration.resetState();
    setPrompt('');
  };

  const handleRetry = async () => {
    try {
      // Clear error and reset state for retry
      imageGeneration.resetState();

      // For now, we don't have lastGenerationParams in the hook
      // This is a placeholder implementation
      if (!prompt) {
        toast.error('Нет промпта для повтора генерации');
        return;
      }

      // TODO: Implement proper retry logic with stored parameters
      // This would typically call imageGeneration.generateImageAsync with stored params
      toast.info(
        'Функция повтора изображения будет реализована в следующей версии',
      );
    } catch (error) {
      console.error('Error during retry:', error);
      toast.error('Ошибка при повторе генерации');
    }
  };

  const handleForceCheck = async () => {
    setIsForceChecking(true);
    try {
      // Use projectId from initialState if available (artifact mode), otherwise from imageGeneration
      const projectId = initialState?.projectId || imageGeneration.projectId;

      if (!projectId) {
        console.warn('⚠️ No active project to check');
        return;
      }

      console.log('🔍 Force checking results for project:', projectId);

      // Use the same logic as imageGeneration.forceCheckResults but with projectId from initialState
      const response = await fetch(`/api/project/${projectId}`);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const project = await response.json();
      console.log('🔍 Project check result:', {
        id: project.id,
        tasksCount: project.tasks?.length || 0,
        dataCount: project.data?.length || 0,
        taskStatuses: project.tasks?.map((t: any) => t.status) || [],
      });

      // Look for image data in project.data
      const imageData = project.data?.find((data: any) => {
        if (data.value && typeof data.value === 'object') {
          const value = data.value as Record<string, any>;
          const hasUrl = !!value.url;
          const isImage = value.url?.match(
            /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i,
          );

          return hasUrl && isImage;
        }
        return false;
      });

      if (imageData?.value && typeof imageData.value === 'object') {
        const imageUrl = (imageData.value as Record<string, any>).url as string;
        console.log('🔍 ✅ Image found manually:', imageUrl);

        // Update artifact content if in artifact mode
        if (initialState?.projectId && setArtifact) {
          setArtifact((prev: any) => {
            try {
              const currentContent = JSON.parse(prev.content || '{}');
              const updatedContent = {
                ...currentContent,
                status: 'completed',
                imageUrl,
                progress: 100,
              };
              return {
                ...prev,
                content: JSON.stringify(updatedContent),
              };
            } catch (error) {
              console.error('🔍 ❌ Failed to update artifact content:', error);
              return prev;
            }
          });
        } else {
          // For standalone mode, we can't directly update the state
          // The user can see the result in the console and try SSE again
          console.log(
            '🔍 ✅ Image found in standalone mode - refresh page or wait for SSE',
          );
        }
        return;
      }

      // Handle file_id case
      const fileIdData = project.data?.find((data: any) => {
        return (
          data.value &&
          typeof data.value === 'object' &&
          (data.value as any).file_id
        );
      });

      if (fileIdData?.value && typeof fileIdData.value === 'object') {
        const fileId = (fileIdData.value as Record<string, any>)
          .file_id as string;
        console.log('🔍 Found file_id manually, resolving:', fileId);

        const fileResponse = await FileService.fileGetById({ id: fileId });

        if (fileResponse?.url && fileResponse.type === FileTypeEnum.IMAGE) {
          console.log(
            '🔍 ✅ File ID resolved to image URL manually:',
            fileResponse.url,
          );

          // Update artifact content if in artifact mode
          if (initialState?.projectId && setArtifact) {
            setArtifact((prev: any) => {
              try {
                const currentContent = JSON.parse(prev.content || '{}');
                const updatedContent = {
                  ...currentContent,
                  status: 'completed',
                  imageUrl: fileResponse.url,
                  progress: 100,
                };
                return {
                  ...prev,
                  content: JSON.stringify(updatedContent),
                };
              } catch (error) {
                console.error(
                  '🔍 ❌ Failed to update artifact content with file_id:',
                  error,
                );
                return prev;
              }
            });
          } else {
            // For standalone mode, we can't directly update the state
            // The user can see the result in the console and try SSE again
            console.log(
              '🔍 ✅ File ID resolved in standalone mode - refresh page or wait for SSE',
            );
          }
          return;
        }
      }

      console.log('🔍 ⚠️ No image data found');
    } catch (error) {
      console.error('🔍 ❌ Force check failed:', error);
    } finally {
      setIsForceChecking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Image Generator</CardTitle>
          <ConnectionStatus isConnected={isConnected} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {imageGeneration.error && (
          <ImageErrorDisplay
            error={imageGeneration.error}
            {...(initialState?.prompt && { prompt: initialState.prompt })}
            onRetry={handleRetry}
          />
        )}

        {showSkeleton && (
          <GenerationSkeleton
            {...(initialState?.prompt && { prompt: initialState.prompt })}
            {...(imageGeneration.isGenerating &&
              handleForceCheck && { onForceCheck: handleForceCheck })}
            {...(isForceChecking && { isChecking: isForceChecking })}
          />
        )}

        {showImage && displayImageUrl && (
          <ImageDisplay
            imageUrl={displayImageUrl}
            {...(displayPrompt && { prompt: displayPrompt })}
            onCopyUrl={handleCopyUrl}
            onGenerateNew={handleGenerateNew}
            apiPayload={parsedContent} // Pass parsed content for debug display
          />
        )}
      </CardContent>
    </Card>
  );
}
