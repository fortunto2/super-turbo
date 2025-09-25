/**
 * Хук для управления хранением видео
 * Вынесен в отдельный файл для лучшей организации кода
 */

import { useState, useCallback, useEffect } from "react";
import {
  saveVideo as saveVideoToStorage,
  getStoredVideos,
  deleteStoredVideo,
  clearStoredVideos as clearStoredVideosFromStorage,
} from "@/lib/utils/local-storage";
import type { GeneratedVideo } from "./types";

export function useVideoStorage() {
  const [storedVideos, setStoredVideos] = useState<GeneratedVideo[]>([]);

  // Загружаем сохраненные видео при инициализации
  useEffect(() => {
    const videos = getStoredVideos();
    setStoredVideos(videos);
  }, []);

  const saveVideo = useCallback((video: GeneratedVideo) => {
    saveVideoToStorage(video);
    setStoredVideos((prev) => {
      const existingIndex = prev.findIndex((v) => v.id === video.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = video;
        return updated;
      }
      return [...prev, video];
    });
  }, []);

  const deleteVideo = useCallback((videoId: string) => {
    deleteStoredVideo(videoId);
    setStoredVideos((prev) => prev.filter((v) => v.id !== videoId));
  }, []);

  const clearAllVideos = useCallback(() => {
    clearStoredVideosFromStorage();
    setStoredVideos([]);
  }, []);

  const loadStoredVideos = useCallback(() => {
    const videos = getStoredVideos();
    setStoredVideos(videos);
  }, []);

  return {
    storedVideos,
    saveVideo,
    deleteVideo,
    clearAllVideos,
    loadStoredVideos,
  };
}
