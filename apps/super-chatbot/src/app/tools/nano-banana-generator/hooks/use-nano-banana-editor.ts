// AICODE-NOTE: Hook for Nano Banana image editing functionality
// Manages state for image editing operations and results

"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  editNanoBananaImage,
  type NanoBananaImageEditingRequest,
  type NanoBananaEditResult,
} from "../api/nano-banana-api";

export interface EditingStatus {
  status: "idle" | "pending" | "processing" | "completed" | "error";
  progress: number;
  message: string;
  estimatedTime: number;
  projectId: string;
  requestId: string;
  fileId: string;
}

export interface UseNanoBananaEditorReturn {
  // Editing state
  editingStatus: EditingStatus;
  currentEdit: NanoBananaEditResult | null;
  editedImages: NanoBananaEditResult[];
  isEditing: boolean;

  // Connection state
  isConnected: boolean;
  connectionStatus: "disconnected" | "connecting" | "connected";

  // Actions
  editImage: (request: NanoBananaImageEditingRequest) => Promise<void>;
  clearCurrentEdit: () => void;
  deleteEditedImage: (imageId: string) => void;
  clearAllEditedImages: () => void;
  forceCheckEditResults: () => Promise<void>;

  // Utils
  downloadEditedImage: (image: NanoBananaEditResult) => Promise<void>;
  copyEditedImageUrl: (image: NanoBananaEditResult) => Promise<void>;
}

export function useNanoBananaEditor(): UseNanoBananaEditorReturn {
  // State management
  const [editedImages, setEditedImages] = useState<NanoBananaEditResult[]>([]);
  const [currentEdit, setCurrentEdit] = useState<NanoBananaEditResult | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editingStatus, setEditingStatus] = useState<EditingStatus>({
    status: "idle",
    progress: 0,
    message: "",
    estimatedTime: 0,
    projectId: "",
    requestId: "",
    fileId: "",
  });
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [isConnected, setIsConnected] = useState(false);

  // Load stored edited images on mount
  useEffect(() => {
    const storedImages = localStorage.getItem("nano-banana-edited-images");
    if (storedImages) {
      try {
        const parsed = JSON.parse(storedImages);
        setEditedImages(parsed);
        console.log(
          "🍌 ✏️ Loaded",
          parsed.length,
          "stored Nano Banana edited images"
        );
      } catch (error) {
        console.error("Failed to load stored edited images:", error);
      }
    }
  }, []);

  // Save edited images to localStorage
  const saveEditedImages = useCallback((images: NanoBananaEditResult[]) => {
    localStorage.setItem("nano-banana-edited-images", JSON.stringify(images));
  }, []);

  // Main editing function
  const editImage = useCallback(
    async (request: NanoBananaImageEditingRequest) => {
      try {
        setIsEditing(true);
        setConnectionStatus("connecting");
        setEditingStatus({
          status: "pending",
          progress: 0,
          message: "Starting Nano Banana image editing...",
          estimatedTime: 30000,
          projectId: "",
          requestId: "",
          fileId: "",
        });

        // Simulate connection
        setTimeout(() => {
          setConnectionStatus("connected");
          setIsConnected(true);
        }, 1000);

        // Call API
        const result = await editNanoBananaImage(request);

        if (!result.success) {
          throw new Error(result.error || "Editing failed");
        }

        if (!result.data) {
          throw new Error("No data returned from editing");
        }

        // Store data in a variable after null check
        const editedData = result.data;

        // Update status
        setEditingStatus({
          status: "processing",
          progress: 50,
          message: "Nano Banana image editing in progress...",
          estimatedTime: 15000,
          projectId: result.projectId || "",
          requestId: result.requestId || "",
          fileId: result.fileId || "",
        });

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Update with result
        setCurrentEdit(editedData);
        setEditedImages((prev) => [editedData, ...prev]);
        saveEditedImages([editedData, ...editedImages]);

        setEditingStatus({
          status: "completed",
          progress: 100,
          message: "Nano Banana image editing completed!",
          estimatedTime: 0,
          projectId: result.projectId || "",
          requestId: result.requestId || "",
          fileId: result.fileId || "",
        });

        toast.success("Nano Banana image edited successfully!");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Image editing failed";
        console.error("Nano Banana editing error:", error);

        setEditingStatus({
          status: "error",
          progress: 0,
          message: message,
          estimatedTime: 0,
          projectId: "",
          requestId: "",
          fileId: "",
        });

        toast.error(message);
      } finally {
        setIsEditing(false);
        setConnectionStatus("disconnected");
        setIsConnected(false);
      }
    },
    [editedImages, saveEditedImages]
  );

  const clearCurrentEdit = useCallback(() => {
    setCurrentEdit(null);
    setEditingStatus({
      status: "idle",
      progress: 0,
      message: "",
      estimatedTime: 0,
      projectId: "",
      requestId: "",
      fileId: "",
    });
  }, []);

  const deleteEditedImage = useCallback(
    (imageId: string) => {
      const updatedImages = editedImages.filter((img) => img.id !== imageId);
      setEditedImages(updatedImages);
      saveEditedImages(updatedImages);
      toast.success("Edited image deleted");
    },
    [editedImages, saveEditedImages]
  );

  const clearAllEditedImages = useCallback(() => {
    setEditedImages([]);
    saveEditedImages([]);
    toast.success("All edited images cleared");
  }, [saveEditedImages]);

  const forceCheckEditResults = useCallback(async () => {
    toast.info("Checking edit results...");
    // In real implementation, would force polling check
  }, []);

  const downloadEditedImage = useCallback(
    async (image: NanoBananaEditResult) => {
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `nano-banana-edited-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Edited image downloaded");
      } catch (error) {
        toast.error("Failed to download edited image");
      }
    },
    []
  );

  const copyEditedImageUrl = useCallback(
    async (image: NanoBananaEditResult) => {
      try {
        await navigator.clipboard.writeText(image.url);
        toast.success("Edited image URL copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy edited image URL");
      }
    },
    []
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
