import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

import type { MediaOption, MediaResolution } from '@/lib/types/media-settings';
import type { ImageModel } from '@/lib/config/superduperai';
import { useImageSSE } from './use-image-sse';
import { useImageEventHandler } from './use-image-event-handler';
import {
  FileService,
  FileTypeEnum,
  generateImageWithStrategy,
  getSuperduperAIConfig,
} from '@turbo-super/api';

export enum TaskStatusEnum {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum TaskTypeEnum {
  MUSICBEATS_METADATA_FLOW = 'musicbeats-metadata-flow',
  AUDIO_GENERATION_FLOW = 'audio-generation-flow',
  VIDEO_GENERATION_FLOW = 'video-generation-flow',
  IMAGE_GENERATION_FLOW = 'image-generation-flow',
  TXT2SCENE_FLOW = 'txt2scene-flow',
  TXT2SCRIPT_FLOW = 'txt2script-flow',
  SCRIPT2ENTITIES_FLOW = 'script2entities-flow',
  SCRIPT2STORYBOARD_FLOW = 'script2storyboard-flow',
  STORYBOARD2VIDEO_FLOW = 'storyboard2video-flow',
  TIMELINE2VIDEO_FLOW = 'timeline2video-flow',
}

export type ITaskRead = {
  type: TaskTypeEnum;
  status?: TaskStatusEnum;
  id: string;
  file_id?: string | null;
  project_id?: string | null;
};

export interface UseImageGenerationState {
  isGenerating: boolean;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  imageUrl?: string;
  projectId?: string;
  requestId?: string;
  timestamp?: number;
  fileId?: string;
}

export interface UseImageGenerationActions {
  generateImageAsync: (
    style: MediaOption,
    resolution: MediaResolution,
    prompt: string,
    model: ImageModel,
    shotSize: MediaOption,
    chatId: string,
  ) => Promise<void>;
  resetState: () => void;
  startTracking: (projectId: string, requestId?: string) => void;
  forceCheckResults: () => Promise<void>;
}

export interface UseImageGenerationReturn
  extends UseImageGenerationState,
    UseImageGenerationActions {
  disconnect: () => void;
  isConnected: boolean;
  connectionAttempts: number;
  maxAttempts: number;
}

const initialState: UseImageGenerationState = {
  isGenerating: false,
  progress: 0,
  status: 'pending',
};

export function useImageGeneration(chatId?: string): UseImageGenerationReturn {
  const [state, setState] = useState<UseImageGenerationState>(initialState);
  const stableChatIdRef = useRef<string | undefined>(chatId);
  const [chatIdState, setChatIdState] = useState(chatId);
  const [currentRequestId, setCurrentRequestId] = useState<
    string | undefined
  >();
  const mountedRef = useRef(true);

  // Update stable chatId and state only when actually changed
  useEffect(() => {
    if (stableChatIdRef.current !== chatId) {
      const oldChatId = stableChatIdRef.current;
      console.log('🎮 ChatId changed from', oldChatId, 'to', chatId);

      // Clean up old project connections immediately and synchronously
      if (oldChatId) {
        console.log('🧹 Cleaning up old project immediately:', oldChatId);
        // Use the store directly for immediate cleanup
        const { imageSSEStore } = require('../stores/image-sse-store');
        imageSSEStore.cleanupProject(oldChatId);

        // Also remove any lingering handlers for the old project
        imageSSEStore.removeProjectHandlers(oldChatId, []);
      }

      stableChatIdRef.current = chatId;
      setChatIdState(chatId);
      setCurrentRequestId(undefined); // Reset request ID
      // Reset state only when switching to a different chatId
      if (mountedRef.current) {
        setState(initialState);
      }
    }
  }, [chatId]);

  // Track mounting state for React Strict Mode
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleStateUpdate = useCallback(
    (update: Partial<UseImageGenerationState>) => {
      if (!mountedRef.current) return; // Don't update state if unmounted

      console.log('🎮 State update received:', update);
      setState((prev) => {
        const newState = {
          ...prev,
          ...update,
          timestamp: Date.now(),
        };
        return newState;
      });
    },
    [],
  );

  // Create stable event handler using chatIdState and currentRequestId
  const imageEventHandler = useImageEventHandler(
    chatIdState || '',
    handleStateUpdate,
    currentRequestId,
  );

  // Use stable chatIdState for useMemo to properly trigger recreations
  const eventHandlers = useMemo(() => {
    // Only log on first creation or chat change
    if (typeof window !== 'undefined' && chatIdState) {
      const logKey = `img_handlers_${chatIdState}`;
      if (!(window as any)[logKey]) {
        console.log('🎮 Creating event handlers for chat:', chatIdState);
        (window as any)[logKey] = true;
      }
    }
    return chatIdState ? [imageEventHandler] : [];
  }, [imageEventHandler, chatIdState, currentRequestId]);

  // Create stable WebSocket options with chatIdState dependency
  const websocketOptions = useMemo(() => {
    // Only connect if we have a real projectId (fileId) from active generation, not just chatId
    const hasActiveGeneration = !!(state.fileId && state.isGenerating);
    const shouldConnect =
      !!chatIdState && mountedRef.current && hasActiveGeneration;

    console.log('🔌 WebSocket options:', {
      fileId: state.fileId, // This should be the actual fileId from API response
      chatId: chatIdState,
      hasActiveGeneration,
      shouldConnect,
      isGenerating: state.isGenerating,
    });

    return {
      fileId: state.fileId ?? '', // FIXED: Use only state.projectId (which contains fileId from API)
      eventHandlers,
      enabled: shouldConnect,
    };
  }, [chatIdState, eventHandlers, state.projectId, state.isGenerating]);

  // Improved cleanup for React Strict Mode
  useEffect(() => {
    return () => {
      console.log('🧹 Final cleanup useImageGeneration, chatId:', chatIdState);
      mountedRef.current = false;

      // Immediate cleanup without delays for React Strict Mode
      if (chatIdState) {
        const { imageSSEStore } = require('../stores/image-sse-store');
        imageSSEStore.cleanupProject(chatIdState);

        // Check for excessive handlers and force cleanup if needed
        const debugInfo = imageSSEStore.getDebugInfo();
        if (debugInfo.totalHandlers > 8) {
          console.log(
            '🧹 Force cleanup due to excessive handlers:',
            debugInfo.totalHandlers,
          );
          imageSSEStore.forceCleanup();
        }
      }
    };
  }, [chatIdState]); // Depend on chatIdState for proper cleanup

  const { isConnected, connectionAttempts, maxAttempts, disconnect } =
    useImageSSE(websocketOptions);

  // Only log WebSocket status changes, not every render
  useEffect(() => {
    if (chatIdState && typeof window !== 'undefined') {
      const statusKey = `ws_status_${chatIdState}`;
      const lastStatus = (window as any)[statusKey];
      const currentStatus = { isConnected, connectionAttempts, maxAttempts };

      if (
        !lastStatus ||
        JSON.stringify(lastStatus) !== JSON.stringify(currentStatus)
      ) {
        console.log('🎮 WebSocket status changed:', currentStatus);
        (window as any)[statusKey] = currentStatus;
      }
    }
  }, [chatIdState, isConnected, connectionAttempts, maxAttempts]);

  const startTracking = useCallback((projectId: string, requestId?: string) => {
    if (!mountedRef.current) return;

    console.log(
      '🎯 Starting tracking for project:',
      projectId,
      'requestId:',
      requestId,
    );

    // Set current request ID for event filtering
    if (requestId) {
      setCurrentRequestId(requestId);
    }

    // Set initial tracking state
    setState((prev) => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      status: 'processing',
      ...(projectId && { projectId }),
      ...(requestId && { requestId }),
    }));

    // Reduced tracking logging
  }, []);

  const resetState = useCallback(() => {
    if (!mountedRef.current) return;
    console.log('🎯 Resetting image generation state');
    setCurrentRequestId(undefined);
    setState(initialState);
  }, []);

  const generateImageAsync = useCallback(
    async (
      style: MediaOption,
      resolution: MediaResolution,
      prompt: string,
      model: ImageModel,
      shotSize: MediaOption,
      chatId: string,
    ) => {
      try {
        // Reset state and immediately show generating state
        setState({
          ...initialState,
          isGenerating: true,
          status: 'processing', // Show processing immediately
          // Don't set projectId yet - wait for API response with fileId
        });

        console.log('🚀 Starting image generation for chat:', chatId);

        const config = getSuperduperAIConfig();

        const result = await generateImageWithStrategy(
          'text-to-image',
          {
            prompt,
            model: model,
            resolution: resolution,
            style: style,
            shotSize: shotSize,
          },
          config,
        );

        if (!result.success) {
          console.error('❌ Image generation failed:', result.error);
          setState((prev) => ({
            ...prev,
            isGenerating: false,
            status: 'failed',
            error: result.error || 'Unknown error occurred',
          }));
          return;
        }

        console.log('✅ Image generation API success:', {
          fileId: result.fileId, // This is actually the fileId from API
          requestId: result.requestId,
          files: result.files?.length || 0,
        });

        // AICODE-DEBUG: Подробное логирование fileId в useImageGeneration
        console.log('🔍 useImageGeneration: API result details:', {
          resultFileId: result.fileId || 'none',
          resultProjectId: result.projectId || 'none',
          resultRequestId: result.requestId || 'none',
          resultKeys: Object.keys(result),
          willSetProjectId: result.projectId,
          willSetFileId: result.fileId,
        });

        // Set request ID for tracking
        if (result.requestId) {
          setCurrentRequestId(result.requestId);
        }

        // CRITICAL: Use result.projectId which contains the fileId for SSE connection
        setState((prev) => ({
          ...prev,
          ...(result.projectId && { projectId: result.projectId }), // This is the fileId we need for SSE
          ...(result.fileId && { fileId: result.fileId }), // Store the actual fileId separately
          ...(result.requestId && { requestId: result.requestId }),
          status: 'processing',
        }));

        // FALLBACK: Add aggressive polling checks in case SSE doesn't work
        console.log(
          '⏰ Setting up aggressive fallback polling for project:',
          result.projectId,
        );
        const projectIdToCheck = result.projectId;

        // Check every 10 seconds for 60 seconds total
        let attempts = 0;
        const maxAttempts = 6; // 6 attempts * 10s = 60s total

        const pollCheck = async () => {
          attempts++;
          console.log(
            `⏰ Polling attempt ${attempts}/${maxAttempts} for project:`,
            projectIdToCheck,
          );

          try {
            // Use Next.js API route to check project status
            const response = await fetch(`/api/project/${projectIdToCheck}`);

            if (!response.ok) {
              console.error('⏰ ❌ Fallback polling failed:', response.status);
              return false;
            }

            const project = await response.json();
            console.log('⏰ Fallback polling result:', {
              id: project.id,
              dataCount: project.data?.length || 0,
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
              const imageUrl = (imageData.value as Record<string, any>)
                .url as string;
              console.log('⏰ ✅ Image found via fallback polling:', imageUrl);
              setState((prev) => ({
                ...prev,
                status: 'completed' as const,
                ...(imageUrl && { imageUrl }),
                progress: 100,
                isGenerating: false,
              }));
              return true; // Found image, stop polling
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
              console.log('⏰ Found file_id via fallback, resolving:', fileId);

              // Import and resolve file_id to URL
              const fileResponse = await FileService.fileGetById({
                id: fileId,
              });

              if (
                fileResponse?.url &&
                fileResponse.type === FileTypeEnum.IMAGE
              ) {
                console.log(
                  '⏰ ✅ File ID resolved to image URL via fallback:',
                  fileResponse.url,
                );
                setState((prev) => ({
                  ...prev,
                  status: 'completed' as const,
                  ...(fileResponse.url && { imageUrl: fileResponse.url }),
                  progress: 100,
                  isGenerating: false,
                }));
                return true; // Found image, stop polling
              }
            }

            console.log('⏰ ⚠️ No image found in fallback polling yet');
            return false; // Not found, continue polling
          } catch (error) {
            console.error('⏰ ❌ Fallback polling error:', error);
            return false;
          }
        };

        // Start polling after 10 seconds, then every 10 seconds
        const startPolling = () => {
          const pollInterval = setInterval(async () => {
            const found = await pollCheck();
            if (found || attempts >= maxAttempts) {
              clearInterval(pollInterval);
              if (attempts >= maxAttempts && !found) {
                console.log(
                  '⏰ ❌ Polling exhausted, image generation may have failed',
                );
              }
            }
          }, 10000);

          // Clear interval after max time to prevent memory leaks
          setTimeout(() => {
            clearInterval(pollInterval);
          }, 65000); // 65s to ensure we get all 6 attempts
        };

        // Start first check after 10 seconds
        console.log('⏰ Scheduling polling to start in 10 seconds...');
        setTimeout(() => {
          console.log('⏰ 10 seconds elapsed, starting polling now...');
          startPolling();
        }, 10000);
      } catch (error: any) {
        console.error('💥 Image generation error:', error);
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          status: 'failed',
          error: error?.message || 'Unexpected error occurred',
        }));
      }
    },
    [],
  );

  // Force check for completed images manually
  const forceCheckResults = useCallback(async () => {
    const projectId = state.projectId;

    if (!projectId) {
      console.warn('⚠️ No active image generation to check');
      return;
    }

    console.log('🔍 Force checking image results for project:', projectId);

    try {
      // Use Next.js API route to check project status (avoids CORS and auth issues)
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

      // Look for image data in project.data first (regardless of task status)
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
        handleStateUpdate({
          status: 'completed',
          imageUrl,
          progress: 100,
          isGenerating: false,
        });
        return;
      }

      // Handle file_id case in project data
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

        // Import and resolve file_id to URL
        const fileResponse = await FileService.fileGetById({ id: fileId });

        if (fileResponse?.url && fileResponse.type === FileTypeEnum.IMAGE) {
          console.log(
            '🔍 ✅ File ID resolved to image URL manually:',
            fileResponse.url,
          );
          handleStateUpdate({
            status: 'completed',
            imageUrl: fileResponse.url,
            progress: 100,
            isGenerating: false,
          });
          return;
        }
      }

      // Check task statuses for error handling
      const hasErrors = project.tasks?.some(
        (task: any) => task.status === TaskStatusEnum.ERROR,
      );
      const inProgress = project.tasks?.some(
        (task: any) => task.status === TaskStatusEnum.IN_PROGRESS,
      );

      if (hasErrors) {
        console.log('🔍 ❌ Generation failed - task errors found');
        handleStateUpdate({
          status: 'failed',
          error: 'Image generation failed - check logs',
          isGenerating: false,
        });
      } else if (inProgress) {
        console.log('🔍 ⏳ Generation still in progress...');
      } else {
        console.log('🔍 ⚠️ No image data found but no clear error state');
      }
    } catch (error) {
      console.error('🔍 ❌ Force check failed:', error);
      handleStateUpdate({
        status: 'failed',
        error: 'Failed to check image results',
        isGenerating: false,
      });
    }
  }, [state.projectId, handleStateUpdate]);

  return {
    ...state,
    isConnected,
    connectionAttempts,
    maxAttempts,
    startTracking,
    resetState,
    generateImageAsync,
    forceCheckResults,
    disconnect,
  };
}

export const useTaskStatus = (type: TaskTypeEnum, tasks?: ITaskRead[]) => {
  const firstTask = tasks?.find((task) => task.type === type);
  return {
    isExists: !!firstTask,
    isCompleted: firstTask?.status === TaskStatusEnum.COMPLETED,
    isPending: firstTask?.status === TaskStatusEnum.IN_PROGRESS,
    isError: firstTask?.status === TaskStatusEnum.ERROR,
  };
};
