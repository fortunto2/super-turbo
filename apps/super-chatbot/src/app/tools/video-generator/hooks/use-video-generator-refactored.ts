/**
 * Рефакторенный хук для генерации видео
 * Разделен на более мелкие, специализированные хуки для лучшей читаемости и тестируемости
 */

"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useVideoGenerationState } from "./use-video-generation-state";
import { useVideoStorage } from "./use-video-storage";
import { useVideoConnection } from "./use-video-connection";
import { generationPersistence } from "@/lib/websocket/generation-persistence";
import { API_NEXT_ROUTES } from "@/lib/config/next-api-routes";
import type {
  UseVideoGeneratorReturn,
  VideoGenerationFormData,
  GeneratedVideo,
} from "./types";

interface UseVideoGeneratorProps {
  projectId?: string;
  onVideoGenerated?: (video: GeneratedVideo) => void;
  onError?: (error: string) => void;
}

export function useVideoGenerator({
  projectId,
  onVideoGenerated,
  onError,
}: UseVideoGeneratorProps = {}): UseVideoGeneratorReturn {
  // Состояние генерации
  const {
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
  } = useVideoGenerationState();

  // Хранение видео
  const {
    storedVideos,
    saveVideo: saveVideoToStorage,
    deleteVideo: deleteVideoFromStorage,
    clearAllVideos,
    loadStoredVideos,
  } = useVideoStorage();

  // Подключение к WebSocket
  const { isConnected, connectionStatus, disconnectFromProject } =
    useVideoConnection(projectId);

  // Генерация видео
  const generateVideo = useCallback(
    async (formData: VideoGenerationFormData) => {
      try {
        updateStatus("preparing");
        updateMessage("Подготовка к генерации видео...");

        // Сохраняем параметры генерации в localStorage
        localStorage.setItem(
          "lastVideoGenerationParams",
          JSON.stringify(formData)
        );

        // Отправляем запрос на генерацию
        const response = await fetch(API_NEXT_ROUTES.GENERATE_VIDEO, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            projectId: projectId || formData.projectId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.requestId) {
          updateRequestId(data.requestId);
          updateStatus("generating");
          updateMessage("Генерация видео началась...");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Неизвестная ошибка";
        updateError(errorMessage);
        onError?.(errorMessage);
        toast.error(`Ошибка генерации видео: ${errorMessage}`);
      }
    },
    [
      projectId,
      updateStatus,
      updateMessage,
      updateRequestId,
      updateError,
      onError,
    ]
  );

  // Повторная генерация
  const retryGeneration = useCallback(async () => {
    const lastParamsStr = localStorage.getItem("lastVideoGenerationParams");
    if (lastParamsStr) {
      try {
        const lastParams = JSON.parse(lastParamsStr);
        await generateVideo(lastParams);
      } catch (error) {
        toast.error("Ошибка при загрузке параметров для повтора");
      }
    } else {
      toast.error("Нет сохраненных параметров для повтора генерации");
    }
  }, [generateVideo]);

  // Очистка текущей генерации
  const clearGeneration = useCallback(() => {
    resetState();
    localStorage.removeItem("lastVideoGenerationParams");
  }, [resetState]);

  // Сохранение видео
  const saveVideo = useCallback(
    (video: GeneratedVideo) => {
      saveVideoToStorage(video);
      onVideoGenerated?.(video);
    },
    [saveVideoToStorage, onVideoGenerated]
  );

  // Удаление видео
  const deleteVideo = useCallback(
    (videoId: string) => {
      deleteVideoFromStorage(videoId);
    },
    [deleteVideoFromStorage]
  );

  // Обновление настроек
  const updateSettings = useCallback(
    (settings: Partial<VideoGenerationFormData>) => {
      const currentParamsStr = localStorage.getItem(
        "lastVideoGenerationParams"
      );
      if (currentParamsStr) {
        try {
          const currentParams = JSON.parse(currentParamsStr);
          const updatedParams = { ...currentParams, ...settings };
          localStorage.setItem(
            "lastVideoGenerationParams",
            JSON.stringify(updatedParams)
          );
        } catch (error) {
          console.error("Ошибка при обновлении настроек:", error);
        }
      }
    },
    []
  );

  // Получение последних параметров генерации
  const getLastGenerationParams =
    useCallback((): VideoGenerationFormData | null => {
      const lastParamsStr = localStorage.getItem("lastVideoGenerationParams");
      if (lastParamsStr) {
        try {
          return JSON.parse(lastParamsStr);
        } catch (error) {
          console.error("Ошибка при загрузке параметров:", error);
          return null;
        }
      }
      return null;
    }, []);

  // Текущее видео
  const currentGeneration = useMemo((): GeneratedVideo | null => {
    if (isCompleted && state.videoUrl) {
      return {
        id: state.requestId || `video-${Date.now()}`,
        url: state.videoUrl,
        prompt: getLastGenerationParams()?.prompt || "",
        timestamp: Date.now(),
        projectId: state.projectId,
        requestId: state.requestId,
        settings: {
          model: getLastGenerationParams()?.model || "",
          style: getLastGenerationParams()?.style || "",
          resolution: getLastGenerationParams()?.resolution || "",
          shotSize: getLastGenerationParams()?.shotSize || "",
          duration: getLastGenerationParams()?.duration || 5,
          frameRate: getLastGenerationParams()?.frameRate || 24,
          negativePrompt: getLastGenerationParams()?.negativePrompt,
        },
      };
    }
    return null;
  }, [
    isCompleted,
    state.videoUrl,
    state.requestId,
    state.projectId,
    getLastGenerationParams,
  ]);

  return {
    // Generation state
    generationStatus: state.status,
    currentGeneration,
    generatedVideos: storedVideos,
    isGenerating,

    // Connection state
    isConnected,
    connectionStatus,

    // Actions
    generateVideo,
    retryGeneration,
    clearGeneration,
    clearAllVideos,
    deleteVideo,
    saveVideo,

    // Settings
    updateSettings,
    getLastGenerationParams,

    // Persistence
    loadStoredVideos,
    clearStoredVideos: clearAllVideos,
  };
}
