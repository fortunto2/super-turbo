"use client";

import { useState, useCallback } from "react";
import {
  VideoGenerationParams,
  GeneratedVideo,
  GenerationStatus,
} from "../types";

export interface UseVideoGeneratorOptions {
  onGenerate?: (params: VideoGenerationParams) => Promise<GeneratedVideo>;
  onError?: (error: string) => void;
  onSuccess?: (video: GeneratedVideo) => void;
}

export interface UseVideoGeneratorReturn {
  // State
  isGenerating: boolean;
  generationStatus: GenerationStatus;
  generatedVideos: GeneratedVideo[];
  currentGeneration: GeneratedVideo | null;

  // Actions
  generateVideo: (params: VideoGenerationParams) => Promise<void>;
  clearCurrentGeneration: () => void;
  deleteVideo: (videoId: string) => void;
  clearAllVideos: () => void;

  // Utils
  downloadVideo: (video: GeneratedVideo) => Promise<void>;
  copyVideoUrl: (video: GeneratedVideo) => Promise<void>;
}

export function useVideoGenerator(
  options: UseVideoGeneratorOptions = {}
): UseVideoGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [currentGeneration, setCurrentGeneration] =
    useState<GeneratedVideo | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: "idle",
    message: "",
  });

  const generateVideo = useCallback(
    async (params: VideoGenerationParams) => {
      if (!options.onGenerate) {
        console.warn("No onGenerate function provided to useVideoGenerator");
        return;
      }

      try {
        setIsGenerating(true);
        setGenerationStatus({
          status: "generating",
          message: "Starting video generation...",
          progress: 0,
        });

        const video = await options.onGenerate(params);

        setCurrentGeneration(video);
        setGeneratedVideos((prev) => [video, ...prev]);
        setGenerationStatus({
          status: "completed",
          message: "Video generation completed!",
          progress: 100,
        });

        options.onSuccess?.(video);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Video generation failed";
        setGenerationStatus({
          status: "error",
          message: errorMessage,
          error: errorMessage,
        });
        options.onError?.(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );

  const clearCurrentGeneration = useCallback(() => {
    setCurrentGeneration(null);
    setGenerationStatus({
      status: "idle",
      message: "",
    });
  }, []);

  const deleteVideo = useCallback((videoId: string) => {
    setGeneratedVideos((prev) => prev.filter((video) => video.id !== videoId));
  }, []);

  const clearAllVideos = useCallback(() => {
    setGeneratedVideos([]);
  }, []);

  const downloadVideo = useCallback(async (video: GeneratedVideo) => {
    try {
      const response = await fetch(video.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `video-${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download video:", error);
    }
  }, []);

  const copyVideoUrl = useCallback(async (video: GeneratedVideo) => {
    try {
      await navigator.clipboard.writeText(video.url);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  }, []);

  return {
    isGenerating,
    generationStatus,
    generatedVideos,
    currentGeneration,
    generateVideo,
    clearCurrentGeneration,
    deleteVideo,
    clearAllVideos,
    downloadVideo,
    copyVideoUrl,
  };
}
