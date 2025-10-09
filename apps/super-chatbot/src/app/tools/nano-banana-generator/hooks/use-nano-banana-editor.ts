// Hook for Nano Banana image editing functionality
// Manages state for image editing operations and results

'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  editNanoBananaImage,
  type NanoBananaImageEditingRequest,
  type NanoBananaEditResult,
} from '../api/nano-banana-api';

export interface EditingStatus {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  estimatedTime: number;
  projectId: string;
  requestId: string;
  fileId: string;
}

export interface UseNanoBananaEditorReturn {
  editingStatus: EditingStatus;
  currentEdit: NanoBananaEditResult | null;
  editedImages: NanoBananaEditResult[];
  isEditing: boolean;

  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';

  editImage: (request: NanoBananaImageEditingRequest) => Promise<void>;
  clearCurrentEdit: () => void;
  deleteEditedImage: (imageId: string) => void;
  clearAllEditedImages: () => void;
  forceCheckEditResults: () => Promise<void>;

  downloadEditedImage: (image: NanoBananaEditResult) => Promise<void>;
  copyEditedImageUrl: (image: NanoBananaEditResult) => Promise<void>;
}

export function useNanoBananaEditor(): UseNanoBananaEditorReturn {
  const [editedImages, setEditedImages] = useState<NanoBananaEditResult[]>([]);
  const [currentEdit, setCurrentEdit] = useState<NanoBananaEditResult | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editingStatus, setEditingStatus] = useState<EditingStatus>({
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

  // Load stored edited images
  useEffect(() => {
    const storedImages = localStorage.getItem('nano-banana-edited-images');
    if (storedImages) {
      try {
        const parsed = JSON.parse(storedImages);
        setEditedImages(parsed);
        console.log(
          '🍌 ✏️ Loaded',
          parsed.length,
          'stored Nano Banana edited images',
        );
      } catch (error) {
        console.error('Failed to load stored edited images:', error);
      }
    }
  }, []);

  const saveEditedImages = useCallback((images: NanoBananaEditResult[]) => {
    localStorage.setItem('nano-banana-edited-images', JSON.stringify(images));
  }, []);

  // Main editing function
  const editImage = useCallback(
    async (request: NanoBananaImageEditingRequest) => {
      try {
        setIsEditing(true);
        setConnectionStatus('connected');
        setIsConnected(true);
        setEditingStatus({
          status: 'pending',
          progress: 10,
          message: 'Editing image...',
          estimatedTime: 0,
          projectId: '',
          requestId: '',
          fileId: '',
        });

        // Call API
        const result = await editNanoBananaImage(request);

        if (!result.success) {
          throw new Error(result.error || 'Editing failed');
        }

        if (!result.data) {
          throw new Error('No data returned from editing');
        }

        const editedData = result.data;

        // Update state
        setCurrentEdit(editedData);

        const MAX_IMAGES = 2; // TODO: заменить на сохранение в БД
        setEditedImages((prev) => {
          const newImages = [editedData, ...prev].slice(0, MAX_IMAGES);
          saveEditedImages(newImages);
          return newImages;
        });

        setEditingStatus({
          status: 'completed',
          progress: 100,
          message: 'Image editing completed!',
          estimatedTime: 0,
          projectId: result.projectId || '',
          requestId: result.requestId || '',
          fileId: result.fileId || '',
        });

        toast.success('Nano Banana image edited successfully!');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Image editing failed';
        console.error('Nano Banana editing error:', error);

        setEditingStatus({
          status: 'error',
          progress: 0,
          message,
          estimatedTime: 0,
          projectId: '',
          requestId: '',
          fileId: '',
        });

        toast.error(message);
      } finally {
        setIsEditing(false);
        setConnectionStatus('disconnected');
        setIsConnected(false);
      }
    },
    [saveEditedImages],
  );

  const clearCurrentEdit = useCallback(() => {
    setCurrentEdit(null);
    setEditingStatus({
      status: 'idle',
      progress: 0,
      message: '',
      estimatedTime: 0,
      projectId: '',
      requestId: '',
      fileId: '',
    });
  }, []);

  const deleteEditedImage = useCallback(
    (imageId: string) => {
      setEditedImages((prev) => {
        const updated = prev.filter((img) => img.id !== imageId);
        saveEditedImages(updated);
        return updated;
      });
      toast.success('Edited image deleted');
    },
    [saveEditedImages],
  );

  const clearAllEditedImages = useCallback(() => {
    setEditedImages([]);
    saveEditedImages([]);
    toast.success('All edited images cleared');
  }, [saveEditedImages]);

  const forceCheckEditResults = useCallback(async () => {
    toast.info('Checking edit results...');
  }, []);

  const downloadEditedImage = useCallback(
    async (image: NanoBananaEditResult) => {
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nano-banana-edited-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Edited image downloaded');
      } catch {
        toast.error('Failed to download edited image');
      }
    },
    [],
  );

  const copyEditedImageUrl = useCallback(
    async (image: NanoBananaEditResult) => {
      try {
        await navigator.clipboard.writeText(image.url);
        toast.success('Edited image URL copied to clipboard');
      } catch {
        toast.error('Failed to copy edited image URL');
      }
    },
    [],
  );

  return {
    editingStatus,
    currentEdit,
    editedImages,
    isEditing,
    isConnected,
    connectionStatus,
    editImage,
    clearCurrentEdit,
    deleteEditedImage,
    clearAllEditedImages,
    forceCheckEditResults,
    downloadEditedImage,
    copyEditedImageUrl,
  };
}
