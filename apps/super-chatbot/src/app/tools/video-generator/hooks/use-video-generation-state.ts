/**
 * Хук для управления состоянием генерации видео
 * Вынесен в отдельный файл для лучшей организации кода
 */

import { useState, useCallback, useMemo } from 'react';
import type { VideoGenerationState, GenerationStatus } from './types';

export function useVideoGenerationState() {
  const [state, setState] = useState<VideoGenerationState>({
    status: 'idle',
    progress: 0,
  });

  const updateStatus = useCallback((status: GenerationStatus) => {
    setState((prev) => ({ ...prev, status }));
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setState((prev) => ({ ...prev, message }));
  }, []);

  const updateError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, error, status: 'error' }));
  }, []);

  const updateRequestId = useCallback((requestId: string) => {
    setState((prev) => ({ ...prev, requestId }));
  }, []);

  const updateVideoUrl = useCallback((videoUrl: string) => {
    setState((prev) => ({ ...prev, videoUrl, status: 'completed' }));
  }, []);

  const updateProjectId = useCallback((projectId: string) => {
    setState((prev) => ({ ...prev, projectId }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
    });
  }, []);

  const isGenerating = useMemo(
    () =>
      state.status === 'preparing' ||
      state.status === 'generating' ||
      state.status === 'processing',
    [state.status],
  );

  const isCompleted = useMemo(
    () => state.status === 'completed',
    [state.status],
  );

  const hasError = useMemo(() => state.status === 'error', [state.status]);

  return {
    state,
    updateStatus,
    updateProgress,
    updateMessage,
    updateError,
    updateRequestId,
    updateVideoUrl,
    updateProjectId,
    resetState,
    isGenerating,
    isCompleted,
    hasError,
  };
}
