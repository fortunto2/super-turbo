// AICODE-NOTE: New Video Generator Hook using framework architecture
// Maintains exact same API for backward compatibility but uses new architecture under the hood

'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import {
  saveVideo,
  getStoredVideos,
  deleteStoredVideo,
  clearStoredVideos,
} from '@/lib/utils/local-storage';
import { useVideoSSE } from '@/artifacts/video';
import {
  generationPersistence,
  type GenerationState,
} from '@/lib/websocket/generation-persistence';
import type { VideoGenerationFormData } from '../components/video-generator-form';
import type { GenerationStatus } from '../components/video-generation-progress';
import { API_NEXT_ROUTES } from '@/lib/config/next-api-routes';

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  projectId?: string;
  requestId?: string;
  settings: {
    model: string;
    style: string;
    resolution: string;
    shotSize: string;
    duration: number;
    frameRate: number;
    negativePrompt?: string;
  };
}

export interface UseVideoGeneratorReturn {
  // Generation state
  generationStatus: GenerationStatus;
  currentGeneration: GeneratedVideo | null;
  generatedVideos: GeneratedVideo[];
  isGenerating: boolean;

  // Connection state
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';

  // Actions
  generateVideo: (formData: VideoGenerationFormData) => Promise<void>;
  stopGeneration: () => Promise<void>;
  clearCurrentGeneration: () => void;
  deleteVideo: (videoId: string) => void;
  clearAllVideos: () => void;
  forceCheckResults: () => Promise<void>;

  // Utils
  downloadVideo: (video: GeneratedVideo) => Promise<void>;
  copyVideoUrl: (video: GeneratedVideo) => Promise<void>;
}

export function useVideoGenerator(): UseVideoGeneratorReturn {
  // State management
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [currentGeneration, setCurrentGeneration] =
    useState<GeneratedVideo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: 'idle',
    progress: 0,
    message: '',
    estimatedTime: 0,
    projectId: '',
    requestId: '',
    fileId: '',
  });
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected');

  // SSE state
  const [currentFileId, setCurrentFileId] = useState<string>('');
  const requestIdRef = useRef<string>('');

  // AICODE-NOTE: SSE event handlers for real-time updates (прогресс + готовое видео для совместимости с чатом)
  const handleSseEvent = useCallback(
    (event: any) => {
      console.log('🎬 📡 Video SSE event received:', event);

      if (event.type === 'render_progress') {
        setGenerationStatus((prev) => ({
          ...prev,
          status: 'processing',
          progress: Math.round((event.progress || 0) * 100),
          message: event.data?.message || 'Processing video...',
        }));

        // Update persistence
        if (currentFileId) {
          generationPersistence.updateState(currentFileId, {
            status: 'processing',
            progress: Math.round((event.progress || 0) * 100),
            message: event.data?.message || 'Processing video...',
          });
        }
      }

      // AICODE-NOTE: Handle video completion events (for chat compatibility)
      if (event.type === 'file' && event.object?.url) {
        console.log('🎬 ✅ Video generation completed via SSE:', event);

        const videoUrl = event.object.url;

        setGenerationStatus((prev) => ({
          ...prev,
          status: 'completed',
          progress: 100,
          message: 'Video generation completed!',
        }));

        // Create completed video
        const completedVideo: GeneratedVideo = {
          id: currentFileId || event.object.id || Date.now().toString(),
          url: videoUrl,
          prompt: generationStatus.message || 'Generated video',
          timestamp: Date.now(),
          projectId: currentFileId,
          requestId: requestIdRef.current,
          settings: {
            model: 'Unknown',
            style: 'base',
            resolution: '1280x720',
            shotSize: 'medium_shot',
            duration: 5,
            frameRate: 30,
          },
        };

        setCurrentGeneration(completedVideo);
        setGeneratedVideos((prev) => [completedVideo, ...prev]);
        saveVideo(completedVideo);

        // Update persistence to completed
        if (currentFileId) {
          generationPersistence.updateState(currentFileId, {
            status: 'completed',
            progress: 100,
            message: 'Video generation completed!',
            url: videoUrl,
          });
        }

        toast.success('Video generated successfully via SSE!');
        setIsGenerating(false);
        setConnectionStatus('disconnected');
      }

      if (event.type === 'error') {
        console.error('🎬 ❌ Video generation error:', event);

        setGenerationStatus((prev) => ({
          ...prev,
          status: 'error',
          message: event.error || 'Video generation failed',
        }));

        // Update persistence to error
        if (currentFileId) {
          generationPersistence.updateState(currentFileId, {
            status: 'error',
            message: event.error || 'Video generation failed',
          });
        }

        toast.error(event.error || 'Video generation failed');
        setIsGenerating(false);
      }
    },
    [currentFileId, generationStatus.message],
  );

  const eventHandlers = useMemo(() => [handleSseEvent], [handleSseEvent]);

  // AICODE-NOTE: Use ready-made SSE hook instead of custom implementation
  const { isConnected, disconnect } = useVideoSSE({
    projectId: currentFileId,
    eventHandlers,
    enabled: isGenerating && !!currentFileId,
    requestId: requestIdRef.current,
  });

  // Update connection status based on SSE state
  useEffect(() => {
    if (isGenerating && currentFileId) {
      setConnectionStatus(isConnected ? 'connected' : 'connecting');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected, isGenerating, currentFileId]);

  // AICODE-NOTE: Recovery system for page reloads
  useEffect(() => {
    // Load stored videos on mount
    const storedVideos = getStoredVideos();
    const convertedVideos: GeneratedVideo[] = storedVideos.map((stored) => ({
      id: stored.id,
      url: stored.url,
      prompt: stored.prompt,
      timestamp: stored.timestamp,
      projectId: stored.projectId || stored.fileId || '',
      requestId: stored.requestId ?? '',
      settings: stored.settings,
    }));
    setGeneratedVideos(convertedVideos);
    console.log(
      '🎬 📂 Loaded',
      convertedVideos.length,
      'stored videos from localStorage',
    );

    // Check for active generations to recover
    const activeStates = generationPersistence.getActiveStates();
    const videoStates = activeStates.filter((state) => state.type === 'video');

    if (videoStates.length > 0) {
      const mostRecent = videoStates.sort(
        (a, b) => b.lastUpdate - a.lastUpdate,
      )[0];

      console.log(
        '🎬 🔄 Found active video generation to recover:',
        mostRecent,
      );

      if (mostRecent) {
        setCurrentFileId(mostRecent.fileId);
        requestIdRef.current = mostRecent.requestId || '';
        setIsGenerating(true);
        setGenerationStatus({
          status: 'processing',
          progress: mostRecent.progress || 10,
          message: 'Checking video generation status...',
          estimatedTime: mostRecent.estimatedTime || 60000,
          projectId: mostRecent.projectId || '',
          requestId: mostRecent.requestId || '',
          fileId: mostRecent.fileId,
        });
      }

      toast.info('Recovering video generation...');

      // AICODE-NOTE: Immediately check file status on recovery
      setTimeout(async () => {
        try {
          if (!mostRecent) return;

          const { pollFileCompletion } = await import(
            '@/lib/utils/smart-polling-manager'
          );

          console.log(
            '🔍 Checking recovered video status for file:',
            mostRecent.fileId,
          );

          const result = await pollFileCompletion(mostRecent.fileId, {
            maxDuration: 15000, // Quick 15-second check on recovery
            initialInterval: 1000,
            onProgress: (attempt, elapsed, nextInterval) => {
              console.log(
                `🔄 Recovery check attempt ${attempt} (${Math.round(elapsed / 1000)}s elapsed)`,
              );
            },
          });

          if (result.success && result.data?.url) {
            console.log(
              '🎬 ✅ Recovered video is already complete!',
              result.data.url,
            );

            // Create video object and add to results immediately
            const newVideo: GeneratedVideo = {
              id: mostRecent.fileId,
              url: result.data.url,
              prompt: mostRecent.prompt || 'Recovered Video',
              timestamp: Date.now(),
              projectId: mostRecent.projectId ?? '',
              requestId: mostRecent.requestId ?? '',
              settings: mostRecent.settings || {
                model: 'unknown',
                style: 'base',
                resolution: '1280x720',
                shotSize: 'medium_shot',
                duration: 5,
                frameRate: 30,
              },
            };

            setGeneratedVideos((prev) => [newVideo, ...prev]);
            setCurrentGeneration(newVideo);

            // Update status to completed
            setGenerationStatus((prev) => ({
              ...prev,
              status: 'completed',
              progress: 100,
              message: 'Video generation completed!',
            }));

            // Save to localStorage
            const storedVideo = {
              id: newVideo.id,
              url: newVideo.url,
              prompt: newVideo.prompt,
              timestamp: newVideo.timestamp,
              fileId: mostRecent.fileId,
              requestId: newVideo.requestId ?? '',
              settings: newVideo.settings,
            };
            saveVideo(storedVideo);

            // Clean up persistence state
            generationPersistence.updateState(mostRecent.fileId, {
              status: 'completed',
              progress: 100,
              url: result.data.url,
            });

            setIsGenerating(false);
            setConnectionStatus('disconnected');
            toast.success('Video was already completed!');
          } else {
            console.log(
              '🔄 Video still processing, starting SSE monitoring...',
            );
            setGenerationStatus((prev) => ({
              ...prev,
              message: 'Video still processing... monitoring progress',
            }));
            toast.info(
              'Video is still being generated. Monitoring progress...',
            );

            // SSE will be connected by the useVideoSSE hook automatically
          }
        } catch (error) {
          console.error('❌ Recovery check failed:', error);
          setGenerationStatus((prev) => ({
            ...prev,
            message: 'Recovery check failed, monitoring via SSE...',
          }));
          toast.warning(
            'Could not check status, monitoring via real-time updates...',
          );

          // Continue with SSE as fallback
        }
      }, 1000); // Small delay to let UI settle
    }
  }, []);

  // Main generation function
  const generateVideo = useCallback(
    async (formData: VideoGenerationFormData) => {
      try {
        setIsGenerating(true);
        setConnectionStatus('connecting');

        const requestId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        requestIdRef.current = requestId;

        setGenerationStatus({
          status: 'pending',
          progress: 0,
          message: 'Starting video generation...',
          estimatedTime: 60000,
          projectId: '',
          requestId,
          fileId: '',
        });

        // Call API with appropriate content type based on generation type
        let response: Response;

        if (formData.generationType === 'image-to-video' && formData.file) {
          try {
            const formDataToSend = new FormData();

            formDataToSend.append('prompt', formData.prompt);
            formDataToSend.append('model', formData.model || '');
            formDataToSend.append('resolution', formData.resolution || '');
            formDataToSend.append('style', formData.style || '');
            formDataToSend.append('shotSize', formData.shotSize || '');
            formDataToSend.append('duration', String(formData.duration || 5));
            formDataToSend.append(
              'frameRate',
              String(formData.frameRate || 30),
            );
            formDataToSend.append(
              'negativePrompt',
              formData.negativePrompt || '',
            );
            formDataToSend.append('generationType', formData.generationType);
            formDataToSend.append('chatId', 'video-generator-tool');
            formDataToSend.append('seed', String(formData.seed ?? ''));
            if (formData.file) {
              formDataToSend.append('file', formData.file);
            }

            console.log(
              '🎬 Sending image-to-video request with FormData (multipart/form-data)',
            );

            response = await fetch(API_NEXT_ROUTES.GENERATE_VIDEO, {
              method: 'POST',
              body: formDataToSend,
            });
          } catch (err) {
            console.error('❌ Client-side request failed:', err);
            throw new Error('Failed to send form data.');
          }
        } else {
          // Use JSON for text-to-video
          console.log('🎬 Sending text-to-video request with JSON');

          response = await fetch(API_NEXT_ROUTES.GENERATE_VIDEO, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: formData.prompt,
              model: formData.model,
              resolution: formData.resolution,
              style: formData.style,
              shotSize: formData.shotSize,
              duration: formData.duration,
              frameRate: formData.frameRate,
              negativePrompt: formData.negativePrompt,
              generationType: formData.generationType,
              seed: formData.seed,
              chatId: 'video-generator-tool',
            }),
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Generation failed');
        }

        const fileId = result.fileId || result.projectId || '';
        setCurrentFileId(fileId);

        // Update status with file ID
        setGenerationStatus((prev) => ({
          ...prev,
          status: 'processing',
          progress: 10,
          message: 'Video generation started...',
          projectId: result.projectId || '',
          fileId,
        }));

        // AICODE-NOTE: Save to persistence system for recovery
        const persistenceState: GenerationState = {
          id: fileId,
          type: 'video',
          status: 'processing',
          fileId,
          projectId: result.projectId,
          requestId,
          prompt: formData.prompt,
          progress: 10,
          message: 'Video generation started...',
          estimatedTime: 60000,
          startTime: Date.now(),
          lastUpdate: Date.now(),
          settings: formData,
        };

        generationPersistence.saveState(persistenceState);

        console.log('🎬 ✅ Video generation started:', { fileId, requestId });

        // Start polling for result (like image-generator)
        const checkResult = async (attempts = 0): Promise<void> => {
          if (attempts > 18) {
            // 3 minutes max (18 * 10s)
            throw new Error('Video generation timeout');
          }

          await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds

          try {
            // Check if we have a result in fileId
            console.log(`🔄 Video polling attempt ${attempts + 1}`, fileId);
            const checkResponse = await fetch(`/api/file/${fileId}`);
            if (checkResponse.ok) {
              const fileData = await checkResponse.json();
              if (fileData.url) {
                // Success!
                console.log('🎬 ✅ Video ready via polling!', fileData.url);

                const generatedVideo: GeneratedVideo = {
                  id: fileId,
                  url: fileData.url,
                  prompt: formData.prompt,
                  timestamp: Date.now(),
                  projectId: fileId,
                  requestId: requestId ?? '',
                  settings: {
                    model: formData.model || 'unknown',
                    style: formData.style || 'base',
                    resolution: formData.resolution || '1280x720',
                    shotSize: formData.shotSize || 'medium_shot',
                    duration: formData.duration || 5,
                    frameRate: formData.frameRate || 30,
                    ...(formData.negativePrompt && {
                      negativePrompt: formData.negativePrompt,
                    }),
                  },
                };

                setCurrentGeneration(generatedVideo);
                setGeneratedVideos((prev) => [generatedVideo, ...prev]);

                // Save to localStorage
                saveVideo({
                  id: generatedVideo.id,
                  url: generatedVideo.url,
                  prompt: generatedVideo.prompt,
                  timestamp: generatedVideo.timestamp,
                  fileId,
                  requestId,
                  settings: generatedVideo.settings,
                });

                setGenerationStatus({
                  status: 'completed',
                  progress: 100,
                  message: 'Video generation completed!',
                  estimatedTime: 0,
                  projectId: fileId,
                  requestId,
                  fileId,
                });

                // Clean up persistence state
                generationPersistence.updateState(fileId, {
                  status: 'completed',
                  progress: 100,
                  url: fileData.url,
                });

                setIsGenerating(false);
                setConnectionStatus('disconnected');
                toast.success('Video generated successfully!');
                return;
              }
            }
          } catch (error) {
            console.log('Polling attempt', attempts + 1, 'failed, retrying...');
          }

          // Update progress based on polling attempts
          const progressIncrement = Math.min(80, 10 + attempts * 4); // Progress from 10% to 80%
          setGenerationStatus((prev) => ({
            ...prev,
            progress: progressIncrement,
            message: `Checking video progress... (attempt ${attempts + 1})`,
          }));

          // Continue polling
          return checkResult(attempts + 1);
        };

        await checkResult();
      } catch (error) {
        console.error('🎬 ❌ Video generation error:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to start video generation',
        );
        setIsGenerating(false);
        setConnectionStatus('disconnected');
      }
    },
    [],
  );

  const clearCurrentGeneration = useCallback(() => {
    setCurrentGeneration(null);
    setGenerationStatus({
      status: 'idle',
      progress: 0,
      message: '',
      estimatedTime: 0,
      projectId: '',
      requestId: '',
      fileId: '',
    });
  }, []);

  const stopGeneration = useCallback(async () => {
    try {
      console.log(
        '🛑 Stopping generation (UI only - backend cannot be cancelled)',
      );

      // Clean up current state
      setIsGenerating(false);
      setConnectionStatus('disconnected');
      setCurrentFileId('');
      requestIdRef.current = '';

      // Update status to cancelled
      setGenerationStatus({
        status: 'error',
        progress: 0,
        message: 'Generation cancelled by user',
        estimatedTime: 0,
        projectId: '',
        requestId: '',
        fileId: '',
      });

      // Clean up persistence if there's an active generation
      if (currentFileId) {
        generationPersistence.updateState(currentFileId, {
          status: 'error',
          message: 'Cancelled by user',
        });
      }

      toast.success(
        'Generation stopped (UI only - backend may continue processing)',
      );

      // Auto-clear the error status after 3 seconds
      setTimeout(() => {
        setGenerationStatus((prev) =>
          prev.status === 'error' && prev.message?.includes('cancelled')
            ? { ...prev, status: 'idle', message: '' }
            : prev,
        );
      }, 3000);
    } catch (error) {
      console.error('❌ Error stopping generation:', error);
      toast.error('Failed to stop generation');
    }
  }, [
    currentFileId,
    generationPersistence,
    setIsGenerating,
    setConnectionStatus,
    setCurrentFileId,
    setGenerationStatus,
  ]);

  const deleteVideo = useCallback((videoId: string) => {
    setGeneratedVideos((prev) => prev.filter((video) => video.id !== videoId));
    deleteStoredVideo(videoId);
    toast.success('Video deleted');
  }, []);

  const clearAllVideos = useCallback(() => {
    setGeneratedVideos([]);
    clearStoredVideos();
    toast.success('All videos cleared');
  }, []);

  const forceCheckResults = useCallback(async () => {
    if (!currentFileId) {
      toast.error('No active generation to check');
      return;
    }

    try {
      toast.info('Checking video results...');

      // Import polling function
      const { pollFileCompletion } = await import(
        '@/lib/utils/smart-polling-manager'
      );

      const result = await pollFileCompletion(currentFileId, {
        maxDuration: 10000, // Quick check - 10 seconds
        initialInterval: 1000,
        onProgress: (attempt, elapsed, nextInterval) => {
          console.log(
            `🔄 Video status check attempt ${attempt} (${Math.round(elapsed / 1000)}s elapsed)`,
          );
        },
      });

      if (result.success && result.data?.url) {
        console.log('✅ Video ready!', result.data.url);

        // Update status to completed
        setGenerationStatus((prev) => ({
          ...prev,
          status: 'completed',
          progress: 100,
          message: 'Video generation completed!',
        }));

        // Create video object and add to results
        const newVideo: GeneratedVideo = {
          id: currentFileId,
          url: result.data.url,
          prompt: generationStatus.fileId
            ? generationPersistence.getState(generationStatus.fileId)?.prompt ||
              'Video'
            : 'Video',
          timestamp: Date.now(),
          projectId: generationStatus.projectId ?? '',
          requestId: generationStatus.requestId ?? '',
          settings: {
            model: 'unknown',
            style: 'base',
            resolution: '1280x720',
            shotSize: 'medium_shot',
            duration: 5,
            frameRate: 30,
          },
        };

        setGeneratedVideos((prev) => [newVideo, ...prev]);
        setCurrentGeneration(newVideo);

        // Save to localStorage
        const storedVideo = {
          id: newVideo.id,
          url: newVideo.url,
          prompt: newVideo.prompt,
          timestamp: newVideo.timestamp,
          fileId: currentFileId,
          requestId: newVideo.requestId ?? '',
          settings: newVideo.settings,
        };
        saveVideo(storedVideo);

        // Clean up persistence state
        if (generationStatus.fileId) {
          generationPersistence.updateState(generationStatus.fileId, {
            status: 'completed',
            progress: 100,
            url: result.data.url,
          });
        }

        setIsGenerating(false);
        setConnectionStatus('disconnected');
        toast.success('Video is ready!');
      } else {
        console.log(
          '⏳ Video still processing, status:',
          result.error || 'In progress',
        );
        toast.info(
          'Video is still being generated. SSE connection will continue monitoring.',
        );
      }
    } catch (error) {
      console.error('❌ Failed to check video status:', error);
      toast.error('Failed to check video status');
    }
  }, [
    currentFileId,
    generationStatus,
    saveVideo,
    setGeneratedVideos,
    setCurrentGeneration,
    setIsGenerating,
    setGenerationStatus,
    setConnectionStatus,
    generationPersistence,
  ]);

  const downloadVideo = useCallback(async (video: GeneratedVideo) => {
    try {
      const response = await fetch(video.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video-${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Video downloaded');
    } catch (error) {
      toast.error('Failed to download video');
    }
  }, []);

  const copyVideoUrl = useCallback(async (video: GeneratedVideo) => {
    try {
      await navigator.clipboard.writeText(video.url);
      toast.success('Video URL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy video URL');
    }
  }, []);

  // AICODE-NOTE: Return same interface as before for compatibility
  return {
    // Generation state
    generationStatus,
    currentGeneration,
    generatedVideos,
    isGenerating,

    // Connection state - now using real SSE connection
    isConnected,
    connectionStatus,

    // Actions
    generateVideo,
    stopGeneration,
    clearCurrentGeneration,
    deleteVideo,
    clearAllVideos,
    forceCheckResults,

    // Utils
    downloadVideo,
    copyVideoUrl,
  };
}
