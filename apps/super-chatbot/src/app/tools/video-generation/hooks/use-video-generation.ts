'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  generateVideo,
  type VideoGenerationRequest,
  type GeneratedVideoResult,
} from '../api/video-generation-api';

export interface GenerationStatus {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  estimatedTime: number;
  fileId: string;
}

export interface UseVideoGenerationReturn {
  // Generation state
  generationStatus: GenerationStatus;
  currentGeneration: GeneratedVideoResult | null;
  generatedVideos: GeneratedVideoResult[];
  isGenerating: boolean;

  // Connection state
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';

  // Actions
  generateVideo: (request: VideoGenerationRequest) => Promise<void>;
  clearCurrentGeneration: () => void;
  deleteVideo: (videoId: string) => void;
  clearAllVideos: () => void;
  forceCheckResults: () => Promise<void>;

  // Utils
  downloadVideo: (video: GeneratedVideoResult) => Promise<void>;
  copyVideoUrl: (video: GeneratedVideoResult) => Promise<void>;
}

export function useVideoGeneration(): UseVideoGenerationReturn {
  // State management
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoResult[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState<GeneratedVideoResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: 'idle',
    progress: 0,
    message: '',
    estimatedTime: 0,
    fileId: '',
  });
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected');
  const [isConnected, setIsConnected] = useState(false);

  // Load stored videos on mount
  useEffect(() => {
    const storedVideos = localStorage.getItem('video-generation-videos');
    if (storedVideos) {
      try {
        const parsed = JSON.parse(storedVideos);
        setGeneratedVideos(parsed);
        console.log('📂 Loaded', parsed.length, 'stored videos');
      } catch (error) {
        console.error('Failed to load stored videos:', error);
      }
    }
  }, []);

  // Save videos to localStorage
  const saveVideos = useCallback((videos: GeneratedVideoResult[]) => {
    try {
      localStorage.setItem('video-generation-videos', JSON.stringify(videos));
    } catch (error) {
      console.error('Failed to save videos:', error);
      toast.error('Failed to save videos to storage');
    }
  }, []);

  // Main generation function
  const handleGenerateVideo = useCallback(
    async (request: VideoGenerationRequest) => {
      try {
        setIsGenerating(true);
        setConnectionStatus('connected');
        setIsConnected(true);
        setGenerationStatus({
          status: 'pending',
          progress: 10,
          message: 'Generating video with VEO3...',
          estimatedTime: (request.duration || 8) * 10,
          fileId: '',
        });

        // Call API
        const result = await generateVideo(request);

        if (!result.success) {
          throw new Error(result.error || 'Generation failed');
        }

        if (!result.data) {
          throw new Error('No data returned from generation');
        }

        // Fal.ai returns the video URL immediately
        const generatedData = {
          ...result.data,
          url: result.url || result.data.url, // Ensure URL is set
        };

        // Update with result immediately
        setCurrentGeneration(generatedData);

        const MAX_VIDEOS = 10;
        const newVideos = [generatedData, ...generatedVideos].slice(0, MAX_VIDEOS);
        setGeneratedVideos(newVideos);
        saveVideos(newVideos);

        setGenerationStatus({
          status: 'completed',
          progress: 100,
          message: 'Video generated successfully',
          estimatedTime: 0,
          fileId: result.fileId || '',
        });

        toast.success('Video generated successfully!');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Video generation failed';
        console.error('Video generation error:', error);

        setGenerationStatus({
          status: 'error',
          progress: 0,
          message: message,
          estimatedTime: 0,
          fileId: '',
        });

        toast.error(message);
      } finally {
        setIsGenerating(false);
        setConnectionStatus('disconnected');
        setIsConnected(false);
      }
    },
    [generatedVideos, saveVideos],
  );

  const clearCurrentGeneration = useCallback(() => {
    setCurrentGeneration(null);
    setGenerationStatus({
      status: 'idle',
      progress: 0,
      message: '',
      estimatedTime: 0,
      fileId: '',
    });
  }, []);

  const deleteVideo = useCallback(
    (videoId: string) => {
      const updatedVideos = generatedVideos.filter((vid) => vid.id !== videoId);
      setGeneratedVideos(updatedVideos);
      saveVideos(updatedVideos);
      toast.success('Video deleted');
    },
    [generatedVideos, saveVideos],
  );

  const clearAllVideos = useCallback(() => {
    setGeneratedVideos([]);
    saveVideos([]);
    toast.success('All videos cleared');
  }, [saveVideos]);

  const forceCheckResults = useCallback(async () => {
    toast.info('Checking results...');
  }, []);

  const downloadVideo = useCallback(async (video: GeneratedVideoResult) => {
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

  const copyVideoUrl = useCallback(async (video: GeneratedVideoResult) => {
    try {
      await navigator.clipboard.writeText(video.url);
      toast.success('Video URL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  }, []);

  return {
    generationStatus,
    currentGeneration,
    generatedVideos,
    isGenerating,
    isConnected,
    connectionStatus,
    generateVideo: handleGenerateVideo,
    clearCurrentGeneration,
    deleteVideo,
    clearAllVideos,
    forceCheckResults,
    downloadVideo,
    copyVideoUrl,
  };
}
