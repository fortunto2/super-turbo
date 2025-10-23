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

  // Load stored images on mount (from DB + localStorage cache)
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Try to load from DB first
        const response = await fetch('/api/media/list?type=image&limit=50');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const images = result.data.map((item: any) => ({
              id: item.id,
              url: item.url,
              prompt: item.prompt,
              timestamp: new Date(item.createdAt).getTime(),
              settings: item.settings,
              projectId: item.projectId,
              requestId: item.requestId,
              fileId: item.fileId,
            }));
            setGeneratedImages(images);
            // Update localStorage cache
            localStorage.setItem('image-generation-images', JSON.stringify(images.slice(0, 10)));
            console.log('📂 Loaded', images.length, 'images from database');
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to load images from database, falling back to localStorage:', error);
      }

      // Fallback to localStorage
      const storedImages = localStorage.getItem('image-generation-images');
      if (storedImages) {
        try {
          const parsed = JSON.parse(storedImages);
          setGeneratedImages(parsed);
          console.log('📂 Loaded', parsed.length, 'stored images from localStorage');
        } catch (error) {
          console.error('Failed to load stored images:', error);
        }
      }
    };

    loadImages();
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

        // Save to database
        try {
          const saveResponse = await fetch('/api/media/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'image',
              url: generatedData.url,
              prompt: request.prompt,
              model: 'nano-banana',
              settings: {
                model: 'nano-banana',
                style: request.style || 'realistic',
                resolution: request.aspectRatio || '1:1',
                shotSize: request.quality || 'standard',
                seed: request.seed,
                batchSize: request.batchSize,
              },
              projectId: result.projectId,
              requestId: result.requestId,
              fileId: result.fileId,
            }),
          });

          if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            console.log('✅ Image saved to database:', saveResult.data.id);
          } else {
            const errorData = await saveResponse.json();
            console.error('❌ Failed to save image to database:', errorData);
          }
        } catch (saveError) {
          console.error('Failed to save to database:', saveError);
          // Continue anyway, we still have the image
        }

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
    async (imageId: string) => {
      try {
        // Delete from database
        const response = await fetch('/api/media/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: imageId }),
        });

        if (response.ok) {
          console.log('✅ Image deleted from database:', imageId);
        } else {
          console.warn('Failed to delete from database, removing from local cache anyway');
        }
      } catch (error) {
        console.error('Error deleting from database:', error);
      }

      // Always remove from local state
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
