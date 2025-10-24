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
  const [generatedImages, setGeneratedImages] = useState<
    GeneratedImageResult[]
  >([]);
  const [currentGeneration, setCurrentGeneration] =
    useState<GeneratedImageResult | null>(null);
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
        console.log('📂 [Gallery] Loading images from database...');
        // Try to load from DB first
        const response = await fetch('/api/media/list?type=image&limit=50');
        console.log('📂 [Gallery] Database response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('📂 [Gallery] Database result:', result);

          if (result.success && result.data && Array.isArray(result.data)) {
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

            console.log('✅ [Gallery] Loaded', images.length, 'images from database');
            setGeneratedImages(images);

            // Update localStorage cache (only metadata)
            try {
              const cacheData = images.slice(0, 3).map((img: GeneratedImageResult) => ({
                id: img.id,
                prompt: img.prompt.substring(0, 100),
                timestamp: img.timestamp,
              }));
              localStorage.setItem(
                'image-generation-images-meta',
                JSON.stringify(cacheData),
              );
            } catch (cacheError) {
              console.warn('⚠️ [Gallery] Failed to cache metadata:', cacheError);
            }

            return;
          } else {
            console.warn('⚠️ [Gallery] No images in database or invalid format');
          }
        } else {
          const errorText = await response.text().catch(() => 'Unable to read error');
          console.error('❌ [Gallery] Database fetch failed:', response.status, errorText);
        }
      } catch (error) {
        console.error(
          '❌ [Gallery] Exception loading from database:',
          error,
        );
      }

      // Fallback to localStorage
      console.log('📂 [Gallery] Falling back to localStorage...');
      const storedImages = localStorage.getItem('image-generation-images');
      if (storedImages) {
        try {
          const parsed = JSON.parse(storedImages);
          setGeneratedImages(parsed);
          console.log(
            '✅ [Gallery] Loaded',
            parsed.length,
            'images from localStorage',
          );
        } catch (error) {
          console.error('❌ [Gallery] Failed to parse localStorage:', error);
        }
      } else {
        console.log('📂 [Gallery] No images in localStorage either');
      }
    };

    loadImages();
  }, []);

  // Save images to localStorage (with quota management)
  const saveImages = useCallback((images: GeneratedImageResult[]) => {
    try {
      // First, try to save only the last 3 images with full data
      const recentImages = images.slice(-3);
      localStorage.setItem('image-generation-images', JSON.stringify(recentImages));
    } catch (error) {
      console.error('Failed to save images:', error);

      // If quota exceeded, try without base64 URLs
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        try {
          // Store metadata only, without large base64 URLs
          const metadataOnly = images.slice(-10).map(img => ({
            id: img.id,
            url: '', // Empty URL to save space
            prompt: img.prompt.substring(0, 200), // Limit prompt length
            timestamp: img.timestamp,
            settings: img.settings,
          }));
          localStorage.setItem('image-generation-images', JSON.stringify(metadataOnly));
          toast.warning('Storage space limited - image history will not persist');
        } catch (retryError) {
          console.error('Failed to save even metadata:', retryError);
          // Clear the key if we can't save anything
          try {
            localStorage.removeItem('image-generation-images');
          } catch {}
          toast.error('Storage quota exceeded. Please clear browser storage or use fewer images.');
        }
      } else {
        toast.error('Failed to save images to storage');
      }
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
          console.log('💾 [Save] Saving image to database...');
          const savePayload = {
            type: 'image' as const,
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
          };

          console.log('💾 [Save] Payload:', {
            ...savePayload,
            url: `${savePayload.url.substring(0, 50)}...`,
          });

          const saveResponse = await fetch('/api/media/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(savePayload),
          });

          console.log('💾 [Save] Response status:', saveResponse.status);

          if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            console.log('✅ [Save] Image saved to database with ID:', saveResult.data?.id);
            toast.success('Image saved to database');
          } else {
            const errorData = await saveResponse.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ [Save] Failed to save image to database:', errorData);
            toast.error(`Failed to save to database: ${errorData.error || 'Unknown error'}`);
          }
        } catch (saveError) {
          console.error('❌ [Save] Exception saving to database:', saveError);
          toast.error('Failed to save image to database');
          // Continue anyway, we still have the image
        }

        // Update with result immediately
        setCurrentGeneration(generatedData);

        const MAX_IMAGES = 10;
        const newImages = [generatedData, ...generatedImages].slice(
          0,
          MAX_IMAGES,
        );
        setGeneratedImages(newImages);

        // Don't save to localStorage - images are saved to database
        // saveImages(newImages); // Removed to avoid QuotaExceededError

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
        const message =
          error instanceof Error ? error.message : 'Image generation failed';
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
          console.warn(
            'Failed to delete from database, removing from local cache anyway',
          );
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
