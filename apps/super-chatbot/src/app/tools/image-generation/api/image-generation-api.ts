'use client';

// Types for Image Generation operations (Nano Banana)
export interface ImageGenerationRequest {
  prompt: string;
  sourceImageUrl?: string;
  style?: string;
  quality?: 'standard' | 'high' | 'ultra' | 'masterpiece';
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:2' | '9:16' | '21:9';
  seed?: number;
  batchSize?: number;
  enableContextAwareness?: boolean;
  enableSurgicalPrecision?: boolean;
  creativeMode?: boolean;
}

export interface ImageEditingRequest {
  editType: string;
  editPrompt: string;
  sourceImageUrl: string;
  precisionLevel?: string;
  blendMode?: string;
  preserveOriginalStyle?: boolean;
  enhanceLighting?: boolean;
  preserveShadows?: boolean;
  seed?: number;
  batchSize?: number;
}

// API Response types
export interface ImageGenerationApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  projectId?: string;
  requestId?: string;
  fileId?: string;
  url?: string;
}

export interface GeneratedImageResult {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  settings?: {
    style?: string;
    quality?: string;
    aspectRatio?: string;
    seed?: number;
    batchSize?: number;
    enableContextAwareness?: boolean;
    enableSurgicalPrecision?: boolean;
    creativeMode?: boolean;
  };
}

export interface EditedImageResult {
  id: string;
  url: string;
  editType: string;
  editPrompt: string;
  originalImageUrl: string;
  timestamp: number;
  settings: {
    precisionLevel?: string;
    blendMode?: string;
    preserveOriginalStyle: boolean;
    enhanceLighting: boolean;
    preserveShadows: boolean;
  };
}

// API Functions
export async function generateImage(
  request: ImageGenerationRequest,
): Promise<ImageGenerationApiResponse<GeneratedImageResult>> {
  try {
    // AICODE-NOTE: Copied logic from nano-banana-generator
    // Without sourceImageUrl → use /api/nano-banana/direct-image (simple generation)
    // With sourceImageUrl → use /api/nano-banana/edit (image-to-image editing)

    if (request.sourceImageUrl) {
      // Image-to-image mode - use edit endpoint
      const editPayload = {
        editType: 'style-transfer', // Using style-transfer as default for image-to-image
        editPrompt: request.prompt,
        sourceImageUrl: request.sourceImageUrl,
        precisionLevel: 'automatic',
        blendMode: 'natural',
        preserveOriginalStyle: false,
        enhanceLighting: true,
        preserveShadows: true,
        seed: request.seed,
        batchSize: request.batchSize || 1,
      };

      const response = await fetch('/api/nano-banana/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editPayload),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.data?.url) {
        return {
          success: false,
          error: data?.error || 'Failed to generate image with source',
        };
      }

      const result: GeneratedImageResult = {
        id: data.data.id || `img-${Date.now()}`,
        url: data.data.url,
        prompt: request.prompt,
        timestamp: Date.now(),
        settings: {
          style: request.style,
          quality: request.quality,
          aspectRatio: request.aspectRatio,
          seed: request.seed,
          batchSize: request.batchSize,
          enableContextAwareness: request.enableContextAwareness,
          enableSurgicalPrecision: request.enableSurgicalPrecision,
          creativeMode: request.creativeMode,
        },
      };

      return {
        success: true,
        data: result,
        projectId: data.projectId,
        requestId: data.requestId,
        fileId: data.fileId,
      };
    } else {
      // Text-to-image mode - use direct-image endpoint (like nano-banana-generator)
      const response = await fetch('/api/nano-banana/direct-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: request.prompt }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.url) {
        return {
          success: false,
          error: data?.error || 'Failed to generate image',
        };
      }

      const result: GeneratedImageResult = {
        id: `vertex-${Date.now()}`,
        url: data.url,
        prompt: request.prompt,
        timestamp: Date.now(),
        settings: {
          style: request.style || '',
          quality: request.quality || '',
          aspectRatio: request.aspectRatio || '',
          seed: request.seed,
          enableContextAwareness: request.enableContextAwareness ?? true,
          enableSurgicalPrecision: request.enableSurgicalPrecision ?? true,
          creativeMode: request.creativeMode ?? false,
        },
      };

      return { success: true, data: result };
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

export async function editImage(
  request: ImageEditingRequest,
): Promise<ImageGenerationApiResponse<EditedImageResult>> {
  try {
    const response = await fetch('/api/nano-banana/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Image editing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Editing failed',
    };
  }
}

// Configuration function for Nano Banana
export async function getImageGenerationConfig(): Promise<{
  styles: Array<{ id: string; label: string; description: string }>;
  qualityLevels: Array<{ id: string; label: string; description: string }>;
  aspectRatios: Array<{ id: string; label: string; description: string }>;
}> {
  return {
    styles: [
      {
        id: 'realistic',
        label: 'Realistic',
        description: 'Photorealistic images',
      },
      {
        id: 'cinematic',
        label: 'Cinematic',
        description: 'Movie-style with dramatic lighting',
      },
      { id: 'anime', label: 'Anime', description: 'Japanese animation style' },
      {
        id: 'cartoon',
        label: 'Cartoon',
        description: 'Cartoon animation style',
      },
      { id: 'chibi', label: 'Chibi', description: 'Cute miniature style' },
      {
        id: '3d-render',
        label: '3D Render',
        description: 'Three-dimensional computer graphics',
      },
      {
        id: 'oil-painting',
        label: 'Oil Painting',
        description: 'Classic oil painting',
      },
      {
        id: 'watercolor',
        label: 'Watercolor',
        description: 'Gentle watercolor technique',
      },
      { id: 'sketch', label: 'Sketch', description: 'Pencil sketch' },
      {
        id: 'digital-art',
        label: 'Digital Art',
        description: 'Modern digital artwork',
      },
      { id: 'fantasy', label: 'Fantasy', description: 'Magical fantasy world' },
      {
        id: 'sci-fi',
        label: 'Sci-Fi',
        description: 'Futuristic science fiction style',
      },
      {
        id: 'steampunk',
        label: 'Steampunk',
        description: 'Victorian era with technology',
      },
      {
        id: 'cyberpunk',
        label: 'Cyberpunk',
        description: 'Neon futuristic style',
      },
      {
        id: 'vintage',
        label: 'Vintage',
        description: 'Retro style of past eras',
      },
      {
        id: 'minimalist',
        label: 'Minimalist',
        description: 'Simple and clean design',
      },
      { id: 'abstract', label: 'Abstract', description: 'Abstract art' },
      {
        id: 'portrait',
        label: 'Portrait',
        description: 'Focus on face and character',
      },
      {
        id: 'landscape',
        label: 'Landscape',
        description: 'Nature and city views',
      },
      { id: 'macro', label: 'Macro', description: 'Close-up of small objects' },
    ],
    qualityLevels: [
      { id: 'standard', label: 'Standard', description: 'Base quality' },
      { id: 'high', label: 'High', description: 'Improved quality' },
      { id: 'ultra', label: 'Ultra', description: 'Maximum quality' },
      {
        id: 'masterpiece',
        label: 'Masterpiece',
        description: 'Professional quality',
      },
    ],
    aspectRatios: [
      { id: '1:1', label: 'Square (1:1)', description: '1024x1024' },
      { id: '4:3', label: 'Classic (4:3)', description: '1024x768' },
      { id: '16:9', label: 'Widescreen (16:9)', description: '1920x1080' },
      { id: '3:2', label: 'Photo (3:2)', description: '1536x1024' },
      { id: '9:16', label: 'Vertical (9:16)', description: '768x1366' },
      { id: '21:9', label: 'Ultrawide (21:9)', description: '2560x1080' },
    ],
  };
}
