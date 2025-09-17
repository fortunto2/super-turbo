import { API_NEXT_ROUTES } from "@/lib/config/next-api-routes";

export interface VideoGenerationFormData {
  prompt: string;
  model?: string;
  resolution?: string;
  style?: string;
  shotSize?: string;
  duration?: number;
  frameRate?: number;
  seed?: number;
  generationType?: "text-to-video" | "image-to-video";
  negativePrompt?: string;
  file?: File;
}

export interface VideoGenerationApiResult {
  success: boolean;
  projectId?: string;
  requestId?: string;
  fileId?: string;
  error?: string;
}

export async function generateVideoApi(
  formData: VideoGenerationFormData
): Promise<VideoGenerationApiResult> {
  try {
    let response: Response;

    if (formData.generationType === "image-to-video" && formData.file) {
      // Send multipart/form-data with raw File to Next backend
      const fd = new FormData();
      fd.append("prompt", formData.prompt);
      fd.append("model", formData.model || "azure-openai/sora");
      fd.append("resolution", formData.resolution || "1280x720");
      fd.append("style", formData.style || "cinematic");
      fd.append("shotSize", formData.shotSize || "medium_shot");
      fd.append("duration", String(formData.duration || 5));
      fd.append("frameRate", String(formData.frameRate || 30));
      if (typeof formData.seed === "number")
        fd.append("seed", String(formData.seed));
      if (formData.negativePrompt)
        fd.append("negativePrompt", formData.negativePrompt);
      fd.append("generationType", "image-to-video");
      fd.append("chatId", "video-generator-tool");
      fd.append("file", formData.file);

      response = await fetch(API_NEXT_ROUTES.GENERATE_VIDEO, {
        method: "POST",
        body: fd,
      });
    } else {
      // JSON request for text-to-video
      const payload: any = {
        prompt: formData.prompt,
        model: { name: formData.model || "azure-openai/sora" },
        resolution: {
          width: Number.parseInt(formData.resolution?.split("x")[0] || "1280"),
          height: Number.parseInt(formData.resolution?.split("x")[1] || "720"),
        },
        style: { id: formData.style || "cinematic" },
        shotSize: { id: formData.shotSize || "medium_shot" },
        duration: formData.duration || 5,
        frameRate: formData.frameRate || 30,
        seed: formData.seed,
        negativePrompt: formData.negativePrompt || "",
        chatId: "video-generator-tool",
        generationType: "text-to-video",
      };

      response = await fetch(API_NEXT_ROUTES.GENERATE_VIDEO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error:
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Generation failed",
      };
    }

    return {
      success: true,
      projectId: result.fileId, // Use fileId as projectId for tracking
      requestId: result.fileId, // Use fileId as requestId
      fileId: result.fileId, // Store the actual fileId
    };
  } catch (error) {
    console.error("Video generation API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
