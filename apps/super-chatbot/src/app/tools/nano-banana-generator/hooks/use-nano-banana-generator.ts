// AICODE-NOTE: Main hook for Nano Banana image generation functionality
// Manages state for image generation, progress tracking, and results

"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  generateNanoBananaImage,
  type NanoBananaImageGenerationRequest,
  type NanoBananaImageResult,
} from "../api/nano-banana-api";

export interface GenerationStatus {
  status: "idle" | "pending" | "processing" | "completed" | "error";
  progress: number;
  message: string;
  estimatedTime: number;
  projectId: string;
  requestId: string;
  fileId: string;
}

export interface UseNanoBananaGeneratorReturn {
  // Generation state
  generationStatus: GenerationStatus;
  currentGeneration: NanoBananaImageResult | null;
  generatedImages: NanoBananaImageResult[];
  isGenerating: boolean;

  // Connection state
  isConnected: boolean;
  connectionStatus: "disconnected" | "connecting" | "connected";

  // Actions
  generateImage: (request: NanoBananaImageGenerationRequest) => Promise<void>;
  clearCurrentGeneration: () => void;
  deleteImage: (imageId: string) => void;
  clearAllImages: () => void;
  forceCheckResults: () => Promise<void>;

  // Utils
  downloadImage: (image: NanoBananaImageResult) => Promise<void>;
  copyImageUrl: (image: NanoBananaImageResult) => Promise<void>;
}

export function useNanoBananaGenerator(): UseNanoBananaGeneratorReturn {
  // State management
  const [generatedImages, setGeneratedImages] = useState<
    NanoBananaImageResult[]
  >([]);
  const [currentGeneration, setCurrentGeneration] =
    useState<NanoBananaImageResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
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

  // Load stored images on mount
  useEffect(() => {
    const storedImages = localStorage.getItem("nano-banana-images");
    if (storedImages) {
      try {
        const parsed = JSON.parse(storedImages);
        setGeneratedImages(parsed);
        console.log("🍌 📂 Loaded", parsed.length, "stored Nano Banana images");
      } catch (error) {
        console.error("Failed to load stored images:", error);
      }
    }
  }, []);

  // Save images to localStorage
  const saveImages = useCallback((images: NanoBananaImageResult[]) => {
    localStorage.setItem("nano-banana-images", JSON.stringify(images));
  }, []);

  // Main generation function
  const generateImage = useCallback(
    async (request: NanoBananaImageGenerationRequest) => {
      try {
        setIsGenerating(true);
        setConnectionStatus("connecting");
        setGenerationStatus({
          status: "pending",
          progress: 0,
          message: "Starting Nano Banana image generation...",
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
        const result = await generateNanoBananaImage(request);

        if (!result.success) {
          throw new Error(result.error || "Generation failed");
        }

        if (!result.data) {
          throw new Error("No data returned from generation");
        }

        // Store data in a variable after null check
        const generatedData = result.data;

        // Update status
        setGenerationStatus({
          status: "processing",
          progress: 50,
          message: "Nano Banana image generation in progress...",
          estimatedTime: 15000,
          projectId: result.projectId || "",
          requestId: result.requestId || "",
          fileId: result.fileId || "",
        });

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update with result
        setCurrentGeneration(generatedData);
        setGeneratedImages((prev) => [generatedData, ...prev]);
        saveImages([generatedData, ...generatedImages]);

        setGenerationStatus({
          status: "completed",
          progress: 100,
          message: "Nano Banana image generation completed!",
          estimatedTime: 0,
          projectId: result.projectId || "",
          requestId: result.requestId || "",
          fileId: result.fileId || "",
        });

        toast.success("Nano Banana image generated successfully!");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Image generation failed";
        console.error("Nano Banana generation error:", error);

        setGenerationStatus({
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
        setIsGenerating(false);
        setConnectionStatus("disconnected");
        setIsConnected(false);
      }
    },
    [generatedImages, saveImages]
  );

  const clearCurrentGeneration = useCallback(() => {
    setCurrentGeneration(null);
    setGenerationStatus({
      status: "idle",
      progress: 0,
      message: "",
      estimatedTime: 0,
      projectId: "",
      requestId: "",
      fileId: "",
    });
  }, []);

  const deleteImage = useCallback(
    (imageId: string) => {
      const updatedImages = generatedImages.filter((img) => img.id !== imageId);
      setGeneratedImages(updatedImages);
      saveImages(updatedImages);
      toast.success("Image deleted");
    },
    [generatedImages, saveImages]
  );

  const clearAllImages = useCallback(() => {
    setGeneratedImages([]);
    saveImages([]);
    toast.success("All images cleared");
  }, [saveImages]);

  const forceCheckResults = useCallback(async () => {
    toast.info("Checking results...");
    // In real implementation, would force polling check
  }, []);

  const downloadImage = useCallback(async (image: NanoBananaImageResult) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nano-banana-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch (error) {
      toast.error("Failed to download image");
    }
  }, []);

  const copyImageUrl = useCallback(async (image: NanoBananaImageResult) => {
    try {
      await navigator.clipboard.writeText(image.url);
      toast.success("Image URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  }, []);

  return {
    generationStatus,
    currentGeneration,
    generatedImages,
    isGenerating,
    isConnected,
    connectionStatus,
    generateImage,
    clearCurrentGeneration,
    deleteImage,
    clearAllImages,
    forceCheckResults,
    downloadImage,
    copyImageUrl,
  };
}
