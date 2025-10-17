'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CopyIcon } from '@/components/common/icons';
import { DebugParameters } from '@/components/debug/debug-parameters';
import { VideoErrorDisplay } from '@/components/chat/error-display';
import { toast } from 'sonner';
import type { UseChatHelpers } from '@ai-sdk/react';

// Temporary type definitions until we create the proper utils
interface VideoState {
  videoUrl?: string;
  prompt?: string;
  negativePrompt?: string;
  projectId?: string;
  requestId?: string;
  status?: string;
  timestamp?: number;
  message?: string;
  error?: string;
}

const copyVideoUrlToClipboard = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Video URL copied to clipboard');
  } catch (error) {
    toast.error('Failed to copy video URL');
  }
};

interface VideoEditorProps {
  chatId?: string;
  append?: UseChatHelpers<any>['append'];
  setMessages?: UseChatHelpers<any>['setMessages'];
  initialState?: VideoState;
  setArtifact?: (fn: (prev: any) => any) => void;
  availableResolutions?: any[];
  availableStyles?: any[];
  availableShotSizes?: any[];
  availableModels?: any[];
  availableFrameRates?: any[];
  defaultSettings?: any;
  parsedContent?: any;
}

function VideoSkeleton() {
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

function GenerationSkeleton({ prompt }: { prompt?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative max-w-full max-h-[70vh] overflow-hidden rounded-lg border bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full h-80 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] -skew-x-12" />

          <div className="text-center space-y-4 z-10 relative">
            <div className="size-16 mx-auto bg-white/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🎬</span>
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
          <div className="text-sm text-muted-foreground mb-2">
            Generating video:
          </div>
          <div className="text-base italic text-gray-700 bg-gray-50 p-4 rounded-lg border">
            &ldquo;{prompt}&rdquo;
          </div>
        </div>
      )}
    </div>
  );
}

function VideoDisplay({
  videoUrl,
  prompt,
  onCopyUrl,
  apiPayload,
}: {
  videoUrl: string;
  prompt?: string;
  onCopyUrl: () => void;
  apiPayload?: any;
}) {
  return (
    <div className="space-y-4 px-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Generated Video</h3>
        <button
          type="button"
          onClick={onCopyUrl}
          className="p-1 hover:bg-gray-600 rounded"
          title="Copy video URL"
        >
          <CopyIcon size={16} />
        </button>
      </div>
      <div className="relative">
        <video
          src={videoUrl}
          controls
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

export function VideoEditor({
  chatId: propChatId,
  append,
  setMessages,
  initialState,
  setArtifact,
  availableResolutions = [],
  availableStyles = [],
  availableShotSizes = [],
  availableModels = [],
  availableFrameRates = [],
  defaultSettings,
  parsedContent,
}: VideoEditorProps) {
  const params = useParams();
  const chatId = propChatId || (params?.id as string);

  // For now, just show a placeholder until we implement the full video generation hooks
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(
    initialState?.videoUrl,
  );
  const [prompt, setPrompt] = useState(initialState?.prompt || '');
  const [error, setError] = useState<string | undefined>(initialState?.error);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize component state
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  // Update videoUrl when initialState changes (from SSE updates)
  useEffect(() => {
    if (initialState?.videoUrl && initialState.videoUrl !== videoUrl) {
      setVideoUrl(initialState.videoUrl);
    }
    if (initialState?.error && initialState.error !== error) {
      setError(initialState.error);
    }
  }, [initialState?.videoUrl, initialState?.error, videoUrl, error]);

  // Temporary implementation - we'll implement proper video generation hooks later
  const status = error
    ? 'error'
    : isGenerating
      ? 'processing'
      : videoUrl
        ? 'completed'
        : 'pending';

  const handleCopyUrl = () => {
    if (videoUrl) {
      copyVideoUrlToClipboard(videoUrl);
    }
  };

  const handleGenerateNew = () => {
    // This will be implemented when we add the video generation panel
  };

  const handleRetry = async () => {
    try {
      // Clear error and reset state for retry
      setError(undefined);
      setIsGenerating(true);

      // For now, we don't have video generation hooks implemented
      // This is a placeholder implementation
      if (!prompt) {
        toast.error('Нет промпта для повтора генерации');
        setIsGenerating(false);
        return;
      }

      // TODO: Implement proper video generation retry logic
      // This would typically call a video generation hook or API
      toast.info('Функция повтора видео будет реализована в следующей версии');
    } catch (error) {
      console.error('Error during retry:', error);
      toast.error('Ошибка при повторе генерации');
    } finally {
      setIsGenerating(false);
    }
  };

  // Get global WebSocket connection status
  const getGlobalConnectionStatus = (): boolean => {
    if (typeof window !== 'undefined') {
      const globalWindow = window as any;
      const chatInstance = globalWindow.chatWebSocketInstance;
      if (chatInstance) {
        const websocketProjectId = initialState?.projectId || chatId;
        if (websocketProjectId && chatInstance.isConnectedToProject) {
          return chatInstance.isConnectedToProject(websocketProjectId);
        }
        return chatInstance.isConnected || false;
      }
    }
    return false;
  };

  const isConnected = getGlobalConnectionStatus();

  // Render based on status
  if (status === 'error' && error) {
    return (
      <VideoErrorDisplay error={error} prompt={prompt} onRetry={handleRetry} />
    );
  }

  if (status === 'processing' || (status === 'pending' && prompt)) {
    return <GenerationSkeleton prompt={prompt} />;
  }

  if (status === 'completed' && videoUrl) {
    return (
      <VideoDisplay
        videoUrl={videoUrl}
        prompt={prompt}
        onCopyUrl={handleCopyUrl}
        apiPayload={parsedContent}
      />
    );
  }

  // Default fallback for no content
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="size-16 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-2xl">🎬</span>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">No video content</h3>
        <p className="text-sm text-muted-foreground">
          Video generation is in progress or no video has been generated yet.
        </p>
      </div>
      <ConnectionStatus isConnected={isConnected} />
    </div>
  );
}
