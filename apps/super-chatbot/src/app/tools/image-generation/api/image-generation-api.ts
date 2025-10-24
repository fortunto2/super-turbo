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
    // Using Nano Banana API with correct parameters
    const response = await fetch('/api/nano-banana/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || data?.details || 'Failed to generate image',
      };
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || data?.details || 'Image generation failed',
      };
    }

    // Nano Banana returns data in data field
    const imageData = data.data;
    const result: GeneratedImageResult = {
      id: imageData?.id || `img-${Date.now()}`,
      url: imageData?.url || '',
      prompt: request.prompt,
      timestamp: Date.now(),
      settings: {
        ...(request.style && { style: request.style }),
        ...(request.quality && { quality: request.quality }),
        ...(request.aspectRatio && { aspectRatio: request.aspectRatio }),
        ...(typeof request.seed === 'number' && { seed: request.seed }),
        ...(typeof request.batchSize === 'number' && {
          batchSize: request.batchSize,
        }),
        ...(typeof request.enableContextAwareness === 'boolean' && {
          enableContextAwareness: request.enableContextAwareness,
        }),
        ...(typeof request.enableSurgicalPrecision === 'boolean' && {
          enableSurgicalPrecision: request.enableSurgicalPrecision,
        }),
        ...(typeof request.creativeMode === 'boolean' && {
          creativeMode: request.creativeMode,
        }),
      },
    };

    return {
      success: true,
      data: result,
      projectId: imageData?.projectId,
      requestId: imageData?.id,
      fileId: imageData?.id,
      url: imageData?.url,
    };
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
