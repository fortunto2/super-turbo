// AICODE-NOTE: New Image Generator Hook using framework architecture
// Maintains exact same API for backward compatibility but uses new architecture under the hood

"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  saveImage,
  getStoredImages,
  deleteStoredImage,
  clearStoredImages,
} from "@/lib/utils/local-storage";
import type { ImageGenerationFormData } from "../components/image-generator-form";
import type { GenerationStatus } from "../components/generation-progress";
import {
  generateImageApi,
} from "../api/image-generation";

// Legacy interfaces - MUST remain exactly the same for compatibility
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  projectId?: string;
  requestId?: string;
  settings: {
    model: string;
    style: string;
    resolution: string;
    shotSize: string;
    seed?: number;
  };
  fileId?: string;
}

export interface UseImageGeneratorReturn {
  // Generation state
  generationStatus: GenerationStatus;
  currentGeneration: GeneratedImage | null;
  generatedImages: GeneratedImage[];
  isGenerating: boolean;

  // Connection state
  isConnected: boolean;
  connectionStatus: "disconnected" | "connecting" | "connected";

  // Actions
  generateImage: (formData: ImageGenerationFormData) => Promise<void>;
  clearCurrentGeneration: () => void;
  deleteImage: (imageId: string) => void;
  clearAllImages: () => void;
  forceCheckResults: () => Promise<void>;

  // Inpainting actions
  startInpaintingPolling: (
    projectId: string,
    prompt: string,
    sourceImage: GeneratedImage
  ) => Promise<void>;

  // Utils
  downloadImage: (image: GeneratedImage) => Promise<void>;
  copyImageUrl: (image: GeneratedImage) => Promise<void>;
}

export function useImageGenerator(): UseImageGeneratorReturn {
  // State management
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentGeneration, setCurrentGeneration] =
    useState<GeneratedImage | null>(null);
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
    const storedImages = getStoredImages();
    const convertedImages: GeneratedImage[] = storedImages.map((stored) => ({
      id: stored.id,
      url: stored.url,
      prompt: stored.prompt,
      timestamp: stored.timestamp,
      projectId: stored.projectId,
      requestId: stored.requestId,
      settings: stored.settings,
    }));
    setGeneratedImages(convertedImages);
    console.log(
      "🖼️ 📂 Loaded",
      convertedImages.length,
      "stored images from localStorage"
    );
  }, []);

  // Main generation function
  const generateImage = useCallback(
    async (formData: ImageGenerationFormData) => {
      try {
        setIsGenerating(true);
        setConnectionStatus("connecting");
        setGenerationStatus({
          status: "pending",
          progress: 0,
          message: "Starting image generation...",
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

        // Call API using dedicated API function
        const result = await generateImageApi(formData);

        if (!result.success) {
          throw new Error(result.error || "Generation failed");
        }

        if (!result.projectId) {
          throw new Error("Missing project ID in response");
        }

        // Update status
        setGenerationStatus({
          status: "processing",
          progress: 50,
          message: "Image generation in progress...",
          estimatedTime: 15000,
          projectId: result.projectId || "",
          requestId: result.requestId || "",
          fileId: result.fileId || "",
        });

        // Simulate polling for result (in real implementation would use SSE)
        const checkResult = async (attempts = 0): Promise<void> => {
          if (attempts > 30) {
            // 5 minutes max
            throw new Error("Generation timeout");
          }

          await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds

          try {
            // Check if we have a result in projectId
            const checkResponse = await fetch(
              `/api/file/${result.projectId || ""}`
            );
            if (checkResponse.ok) {
              const fileData = await checkResponse.json();
              if (fileData.url) {
                // Success!
                const generatedImage: GeneratedImage = {
                  id: result.projectId || "",
                  url: fileData.url,
                  prompt: formData.prompt,
                  timestamp: Date.now(),
                  projectId: result.projectId || "",
                  requestId: result.requestId,
                  settings: {
                    model: formData.model || "",
                    style: formData.style || "",
                    resolution: formData.resolution || "",
                    shotSize: formData.shotSize || "",
                    seed: formData.seed,
                  },
                };

                setCurrentGeneration(generatedImage);
                setGeneratedImages((prev) => [generatedImage, ...prev]);

                // Save to localStorage
                saveImage({
                  id: generatedImage.id,
                  url: generatedImage.url,
                  prompt: generatedImage.prompt,
                  timestamp: generatedImage.timestamp,
                  projectId: generatedImage.projectId,
                  requestId: generatedImage.requestId,
                  settings: generatedImage.settings,
                });

                setGenerationStatus({
                  status: "completed",
                  progress: 100,
                  message: "Image generation completed!",
                  estimatedTime: 0,
                  projectId: result.projectId || "",
                  requestId: result.requestId || "",
                  fileId: result.fileId || "",
                });

                toast.success("Image generated successfully!");
                return;
              }
            }
          } catch (error) {
            console.log("Polling attempt", attempts + 1, "failed, retrying...");
          }

          // Continue polling
          return checkResult(attempts + 1);
        };

        await checkResult();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Image generation failed";
        console.error("Image generation error:", error);

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
    []
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

  const deleteImage = useCallback((imageId: string) => {
    setGeneratedImages((prev) => prev.filter((img) => img.id !== imageId));
    deleteStoredImage(imageId);
    toast.success("Image deleted");
  }, []);

  const clearAllImages = useCallback(() => {
    setGeneratedImages([]);
    clearStoredImages();
    toast.success("All images cleared");
  }, []);

  const forceCheckResults = useCallback(async () => {
    toast.info("Checking results...");
    // In real implementation, would force polling check
  }, []);

  // Inpainting polling function
  const startInpaintingPolling = useCallback(
    async (
      projectId: string,
      prompt: string,
      sourceImage: GeneratedImage,
      fileId?: string
    ) => {
      try {
        setIsGenerating(true);
        setConnectionStatus("connecting");
        setGenerationStatus({
          status: "pending",
          progress: 0,
          message: "Starting inpainting...",
          estimatedTime: 30000,
          projectId: projectId,
          requestId: projectId,
          fileId: fileId || projectId,
        });

        // Simulate connection
        setTimeout(() => {
          setConnectionStatus("connected");
          setIsConnected(true);
        }, 1000);

        // Update status to processing
        setGenerationStatus({
          status: "processing",
          progress: 50,
          message: "Inpainting in progress...",
          estimatedTime: 15000,
          projectId: projectId,
          requestId: projectId,
          fileId: fileId || projectId,
        });

        // Polling function for inpainting result
        const checkInpaintingResult = async (attempts = 0): Promise<void> => {
          if (attempts > 30) {
            // 5 minutes max
            throw new Error("Inpainting timeout");
          }

          await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds

          try {
            // Check if we have a result
            const checkResponse = await fetch(`/api/file/${projectId}`);
            if (checkResponse.ok) {
              const fileData = await checkResponse.json();
              if (fileData.url) {
                // Success!
                const generatedImage: GeneratedImage = {
                  id: projectId,
                  url: fileData.url,
                  prompt: prompt,
                  timestamp: Date.now(),
                  projectId: projectId,
                  requestId: projectId,
                  settings: {
                    model: "comfyui/flux/inpainting",
                    style: "inpainting",
                    resolution: "1024x1024",
                    shotSize: "medium_shot",
                  },
                  fileId: fileId || projectId,
                };

                setCurrentGeneration(generatedImage);
                setGeneratedImages((prev) => [generatedImage, ...prev]);

                // Save to localStorage
                saveImage({
                  id: generatedImage.id,
                  url: generatedImage.url,
                  prompt: generatedImage.prompt,
                  timestamp: generatedImage.timestamp,
                  projectId: generatedImage.projectId,
                  requestId: generatedImage.requestId,
                  settings: generatedImage.settings,
                  fileId: fileId || projectId,
                });

                setGenerationStatus({
                  status: "completed",
                  progress: 100,
                  message: "Inpainting completed!",
                  estimatedTime: 0,
                  projectId: projectId,
                  requestId: projectId,
                  fileId: fileId || projectId,
                });

                toast.success("Inpainting completed successfully!");
                return;
              }
            }
          } catch (error) {
            console.log(
              "Inpainting polling attempt",
              attempts + 1,
              "failed, retrying..."
            );
          }

          // Continue polling
          return checkInpaintingResult(attempts + 1);
        };

        await checkInpaintingResult();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Inpainting failed";
        console.error("Inpainting error:", error);

        setGenerationStatus({
          status: "error",
          progress: 0,
          message: message,
          estimatedTime: 0,
          projectId: projectId,
          requestId: projectId,
          fileId: fileId || projectId,
        });

        toast.error(message);
      } finally {
        setIsGenerating(false);
        setConnectionStatus("disconnected");
        setIsConnected(false);
      }
    },
    []
  );

  const downloadImage = useCallback(async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch (error) {
      toast.error("Failed to download image");
    }
  }, []);

  const copyImageUrl = useCallback(async (image: GeneratedImage) => {
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
    startInpaintingPolling,
    downloadImage,
    copyImageUrl,
  };
}
