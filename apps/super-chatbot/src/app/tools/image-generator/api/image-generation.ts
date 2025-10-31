import { API_NEXT_ROUTES } from '@/lib/config/next-api-routes';

export interface ImageGenerationFormData {
  prompt: string;
  model?: string;
  resolution?: string;
  style?: string;
  shotSize?: string;
  seed?: number;
  generationType?: 'text-to-image' | 'image-to-image';
  file?: File;
}

export interface ImageGenerationApiResult {
  success: boolean;
  projectId?: string;
  requestId?: string;
  fileId?: string;
  error?: string;
}

export async function generateImageApi(
  formData: ImageGenerationFormData,
): Promise<ImageGenerationApiResult> {
  try {
    let response: Response;

    if (formData.generationType === 'image-to-image' && formData.file) {
      // Send multipart/form-data with raw File to Next backend
      const fd = new FormData();
      fd.append('prompt', formData.prompt);
      fd.append('model', formData.model || 'comfyui/flux');
      fd.append('resolution', formData.resolution || '1024x1024');
      fd.append('style', formData.style || 'flux_watercolor');
      fd.append('shotSize', formData.shotSize || 'medium_shot');
      if (typeof formData.seed === 'number')
        fd.append('seed', String(formData.seed));
      fd.append('generationType', 'image-to-image');
      fd.append('chatId', 'image-generator-tool');
      fd.append('file', formData.file);

      response = await fetch(API_NEXT_ROUTES.GENERATE_IMAGE, {
        method: 'POST',
        body: fd,
      });
    } else {
      // JSON request for text-to-image
      const payload: any = {
        prompt: formData.prompt,
        model: { name: formData.model || 'comfyui/flux' },
        resolution: {
          width: Number.parseInt(formData.resolution?.split('x')[0] || '1024'),
          height: Number.parseInt(formData.resolution?.split('x')[1] || '1024'),
        },
        style: { id: formData.style || 'flux_watercolor' },
        shotSize: { id: formData.shotSize || 'medium_shot' },
        seed: formData.seed,
        chatId: 'image-generator-tool',
        steps: 30,
        generationType: 'text-to-image',
      };

      response = await fetch(API_NEXT_ROUTES.GENERATE_IMAGE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        error: result.error || 'Generation failed',
      };
    }

    return {
      success: true,
      projectId: result.fileId, // Use fileId as projectId for tracking
      requestId: result.fileId, // Use fileId as requestId
      fileId: result.fileId, // Store the actual fileId
    };
  } catch (error) {
    console.error('Image generation API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
