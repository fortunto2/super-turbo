import { useState } from "react";
import type { ISceneRead } from "@turbo-super/api";
import type { ToolType } from "../_components/toolbar";
import { useNextGenerateImage } from "@/lib/api";

interface UseInpaintingProps {
  scene?: ISceneRead | null;
  projectId: string;
  onActiveToolChange?: (tool: ToolType | null) => void;
  onStarted: (id: string) => void;
}

export function useInpainting({
  scene,
  projectId,
  onActiveToolChange,
  onStarted,
}: UseInpaintingProps) {
  const [isInpainting, setIsInpainting] = useState(false);
  const [canvas, setCanvas] = useState<any>(null);
  const { mutateAsync } = useNextGenerateImage();

  const handleInpainting = async (result: {
    prompt: string;
    mask: File;
    config: string;
  }) => {
    setIsInpainting(true);
    if (!scene || !scene.file?.url || !projectId) return;

    try {
      const formData = new FormData();
      formData.append("prompt", result.prompt);
      formData.append("mask", result.mask);
      formData.append("config", result.config);
      formData.append("generationType", "image-to-image");
      formData.append("mask", result.mask);
      formData.append("sourceImageId", scene?.file?.id!);
      formData.append("sourceImageUrl", scene?.file?.url!);
      formData.append("model", "comfyui/flux/inpainting");
      formData.append("projectId", projectId);
      formData.append("sceneId", scene.id);
      const data = await mutateAsync(formData);

      if (data.success) {
        onActiveToolChange?.("mediaList");
        if (data?.fileId) onStarted(data.fileId);
      }
    } catch (err) {
      console.error("Error during inpainting:", err);
    } finally {
      setIsInpainting(false);
    }
  };

  return {
    isInpainting,
    canvas,
    setCanvas,
    handleInpainting,
  };
}
