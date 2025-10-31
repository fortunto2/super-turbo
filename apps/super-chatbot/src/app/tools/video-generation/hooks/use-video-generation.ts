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
  const [generatedVideos, setGeneratedVideos] = useState<
    GeneratedVideoResult[]
  >([]);
  const [currentGeneration, setCurrentGeneration] =
    useState<GeneratedVideoResult | null>(null);
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

  // Load stored videos on mount (from DB + localStorage cache)
  useEffect(() => {
    const loadVideos = async () => {
      try {
        // Try to load from DB first
        const response = await fetch('/api/media/list?type=video&limit=50');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const videos = result.data.map((item: any) => ({
              id: item.id,
              url: item.url,
              prompt: item.prompt,
              timestamp: new Date(item.createdAt).getTime(),
              settings: item.settings,
              fileId: item.fileId,
              requestId: item.requestId,
              thumbnailUrl: item.thumbnailUrl,
              projectId: item.projectId,
            }));
            setGeneratedVideos(videos);
            // Update localStorage cache
            localStorage.setItem(
              'video-generation-videos',
              JSON.stringify(videos.slice(0, 10)),
            );
            console.log('📂 Loaded', videos.length, 'videos from database');
            return;
          }
        }
      } catch (error) {
        console.warn(
          'Failed to load videos from database, falling back to localStorage:',
          error,
        );
      }

      // Fallback to localStorage
      const storedVideos = localStorage.getItem('video-generation-videos');
      if (storedVideos) {
        try {
          const parsed = JSON.parse(storedVideos);
          setGeneratedVideos(parsed);
          console.log(
            '📂 Loaded',
            parsed.length,
            'stored videos from localStorage',
          );
        } catch (error) {
          console.error('Failed to load stored videos:', error);
        }
      }
    };

    loadVideos();
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
          message: 'Starting video generation...',
          estimatedTime: (request.duration || 8) * 10,
          fileId: '',
        });

        // Call API with progress updates
        const isVertexModel = request.model?.startsWith('vertex-');

        if (isVertexModel) {
          setGenerationStatus({
            status: 'processing',
            progress: 30,
            message: 'Video submitted to Vertex AI, waiting for completion...',
            estimatedTime: 60,
            fileId: '',
          });
        }

        const result = await generateVideo(request);

        if (isVertexModel && result.success) {
          setGenerationStatus({
            status: 'processing',
            progress: 90,
            message: 'Processing complete, loading video...',
            estimatedTime: 5,
            fileId: result.fileId || '',
          });
        }

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

        // Save to database
        try {
          const saveResponse = await fetch('/api/media/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'video',
              url: generatedData.url,
              prompt: request.prompt,
              model: request.model || 'fal-veo3',
              settings: {
                model: request.model || 'fal-veo3',
                style: 'cinematic',
                resolution: request.resolution || '720p',
                shotSize: request.aspectRatio || '16:9',
                duration: request.duration || 8,
                frameRate: 30,
                seed: request.seed,
              },
              fileId: result.fileId,
            }),
          });

          if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            console.log('✅ Video saved to database:', saveResult.data.id);
          } else {
            const errorData = await saveResponse.json();
            console.error('❌ Failed to save video to database:', errorData);
          }
        } catch (saveError) {
          console.error('Failed to save to database:', saveError);
          // Continue anyway, we still have the video
        }

        // Update with result immediately
        setCurrentGeneration(generatedData);

        const MAX_VIDEOS = 10;
        const newVideos = [generatedData, ...generatedVideos].slice(
          0,
          MAX_VIDEOS,
        );
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
        const message =
          error instanceof Error ? error.message : 'Video generation failed';
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
    async (videoId: string) => {
      try {
        // Delete from database
        const response = await fetch('/api/media/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: videoId }),
        });

        if (response.ok) {
          console.log('✅ Video deleted from database:', videoId);
        } else {
          console.warn(
            'Failed to delete from database, removing from local cache anyway',
          );
        }
      } catch (error) {
        console.error('Error deleting from database:', error);
      }

      // Always remove from local state
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
