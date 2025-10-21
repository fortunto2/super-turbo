'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  generateImage,
  type ImageGenerationRequest,
  type GeneratedImageResult,
} from '../api/image-generation-api';

export interface GenerationStatus {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  estimatedTime: number;
  projectId: string;
  requestId: string;
  fileId: string;
}

export interface UseImageGenerationReturn {
  // Generation state
  generationStatus: GenerationStatus;
  currentGeneration: GeneratedImageResult | null;
  generatedImages: GeneratedImageResult[];
  isGenerating: boolean;

  // Connection state
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';

  // Actions
  generateImage: (request: ImageGenerationRequest) => Promise<void>;
  clearCurrentGeneration: () => void;
  deleteImage: (imageId: string) => void;
  clearAllImages: () => void;
  forceCheckResults: () => Promise<void>;

  // Utils
  downloadImage: (image: GeneratedImageResult) => Promise<void>;
  copyImageUrl: (image: GeneratedImageResult) => Promise<void>;
}

export function useImageGeneration(): UseImageGenerationReturn {
  // State management
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageResult[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState<GeneratedImageResult | null>(null);
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
  const [isConnected, setIsConnected] = useState(false);

  // Load stored images on mount
  useEffect(() => {
    const storedImages = localStorage.getItem('image-generation-images');
    if (storedImages) {
      try {
        const parsed = JSON.parse(storedImages);
        setGeneratedImages(parsed);
        console.log('📂 Loaded', parsed.length, 'stored images');
      } catch (error) {
        console.error('Failed to load stored images:', error);
      }
    }
  }, []);

  // Save images to localStorage
  const saveImages = useCallback((images: GeneratedImageResult[]) => {
    try {
      localStorage.setItem('image-generation-images', JSON.stringify(images));
    } catch (error) {
      console.error('Failed to save images:', error);
      toast.error('Failed to save images to storage');
    }
  }, []);

  // Main generation function
  const handleGenerateImage = useCallback(
    async (request: ImageGenerationRequest) => {
      try {
        setIsGenerating(true);
        setConnectionStatus('connected');
        setIsConnected(true);
        setGenerationStatus({
          status: 'pending',
          progress: 10,
          message: 'Generating image...',
          estimatedTime: 0,
          projectId: '',
          requestId: '',
          fileId: '',
        });

        // Call API
        const result = await generateImage(request);

        if (!result.success) {
          throw new Error(result.error || 'Generation failed');
        }

        if (!result.data) {
          throw new Error('No data returned from generation');
        }

        const generatedData = result.data;

        // Update with result immediately
        setCurrentGeneration(generatedData);

        const MAX_IMAGES = 10;
        const newImages = [generatedData, ...generatedImages].slice(0, MAX_IMAGES);
        setGeneratedImages(newImages);
        saveImages(newImages);

        setGenerationStatus({
          status: 'completed',
          progress: 100,
          message: 'Image generated successfully',
          estimatedTime: 0,
          projectId: result.projectId || '',
          requestId: result.requestId || '',
          fileId: result.fileId || '',
        });

        toast.success('Image generated successfully!');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Image generation failed';
        console.error('Image generation error:', error);

        setGenerationStatus({
          status: 'error',
          progress: 0,
          message: message,
          estimatedTime: 0,
          projectId: '',
          requestId: '',
          fileId: '',
        });

        toast.error(message);
      } finally {
        setIsGenerating(false);
        setConnectionStatus('disconnected');
        setIsConnected(false);
      }
    },
    [generatedImages, saveImages],
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

  const deleteImage = useCallback(
    (imageId: string) => {
      const updatedImages = generatedImages.filter((img) => img.id !== imageId);
      setGeneratedImages(updatedImages);
      saveImages(updatedImages);
      toast.success('Image deleted');
    },
    [generatedImages, saveImages],
  );

  const clearAllImages = useCallback(() => {
    setGeneratedImages([]);
    saveImages([]);
    toast.success('All images cleared');
  }, [saveImages]);

  const forceCheckResults = useCallback(async () => {
    toast.info('Checking results...');
  }, []);

  const downloadImage = useCallback(async (image: GeneratedImageResult) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded');
    } catch (error) {
      toast.error('Failed to download image');
    }
  }, []);

  const copyImageUrl = useCallback(async (image: GeneratedImageResult) => {
    try {
      await navigator.clipboard.writeText(image.url);
      toast.success('Image URL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  }, []);

  return {
    generationStatus,
    currentGeneration,
    generatedImages,
    isGenerating,
    isConnected,
    connectionStatus,
    generateImage: handleGenerateImage,
    clearCurrentGeneration,
    deleteImage,
    clearAllImages,
    forceCheckResults,
    downloadImage,
    copyImageUrl,
  };
}
