import { Button } from "@turbo-super/ui";
import { GeneratedImage } from "../hooks/use-image-generator";
import NextImage from "next/image";
import { formatTimestamp } from "@/lib/utils/format";
import { X } from "lucide-react";
import { Inpainting } from "@turbo-super/features";
import { API_NEXT_ROUTES } from "@/lib/config/next-api-routes";
import { useState } from "react";

export const ImagePreviewModal = ({
  image,
  setSelectedImage,
  handleImageError,
  startInpaintingPolling,
  isGenerating,
}: {
  image: GeneratedImage;
  setSelectedImage: (image: GeneratedImage | null) => void;
  handleImageError: (imageId: string) => void;
  startInpaintingPolling: (
    projectId: string,
    prompt: string,
    sourceImage: GeneratedImage,
    fileId?: string
  ) => Promise<void>;
  isGenerating: boolean;
}) => {
  const [isInpainting, setIsInpainting] = useState(false);
  const handleInpaintingComplete = async (result: {
    prompt: string;
    mask: File;
    config: string;
  }) => {
    try {
      // Block the inpainting button immediately
      setIsInpainting(true);

      const formData = new FormData();
      formData.append("prompt", result.prompt);
      formData.append("mask", result.mask);
      formData.append("config", result.config);
      formData.append("generationType", "image-to-image");
      formData.append("mask", result.mask);
      formData.append("sourceImageId", image.id);
      formData.append("sourceImageUrl", image.url);
      formData.append("model", "comfyui/flux/inpainting");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/${API_NEXT_ROUTES.GENERATE_IMAGE}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Inpainting response:", data);

      // If successful, start polling for the result
      if (data.success && data.projectId) {
        // Close the modal immediately after successful request
        setSelectedImage(null);

        await startInpaintingPolling(
          data.projectId,
          result.prompt,
          image,
          image.fileId || image.id || data.projectId
        );
      } else {
        // If failed, unblock the button
        setIsInpainting(false);
      }
    } catch (error) {
      console.error("Error during inpainting:", error);
      // Unblock the button on error
      setIsInpainting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="relative w-full h-full">
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 z-10 "
          onClick={() => setSelectedImage(null)}
          disabled={isInpainting}
        >
          <X className="size-4" />
        </Button>

        <div className="w-full h-full">
          <Inpainting
            imageUrl={image.url}
            onGenerating={() => {}}
            onComplete={handleInpaintingComplete}
            isGenerating={isGenerating || isInpainting}
          />
        </div>

        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white p-4 rounded-b-lg">
          <p className="text-sm font-medium line-clamp-2">{image.prompt}</p>
          <p className="text-xs text-gray-300 mt-1">
            {formatTimestamp(image.timestamp)}
          </p>
          {isInpainting && (
            <div className="mt-2 flex items-center space-x-2 text-blue-300">
              <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Starting inpainting...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
