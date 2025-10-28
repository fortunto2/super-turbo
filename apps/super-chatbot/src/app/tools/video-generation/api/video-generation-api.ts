'use client';

// Types for Video Generation operations
export type VideoModel = 'fal-veo3' | 'vertex-veo3' | 'vertex-veo2';

export interface VideoGenerationRequest {
  prompt: string;
  sourceImageUrl?: string;
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  resolution?: '720p' | '1080p';
  model?: VideoModel;
  generateAudio?: boolean;
  enhancePrompt?: boolean;
  negativePrompt?: string;
  seed?: number;
}

// API Response types
export interface VideoGenerationApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fileId?: string;
  url?: string;
  videoUrl?: string;
  provider?: string;
  model?: string;
}

export interface GeneratedVideoResult {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  provider?: string;
  model?: string;
  settings?: {
    duration?: number;
    aspectRatio?: string;
    resolution?: string;
    seed?: number;
  };
}

// API Functions
export async function generateVideo(
  request: VideoGenerationRequest,
): Promise<VideoGenerationApiResponse<GeneratedVideoResult>> {
  try {
    console.log('🎬 Generating video with request:', request);

    // Determine endpoint based on model selection
    const model = request.model || 'fal-veo3';
    let endpoint = '/api/video/generate'; // Default: Fal.ai

    if (model === 'vertex-veo3' || model === 'vertex-veo2') {
      endpoint = '/api/video/generate-vertex';
    }

    console.log('📡 Using endpoint:', endpoint, 'for model:', model);

    // Prepare duration format based on provider
    // Fal.ai expects '4s', '6s', '8s' with suffix
    // Vertex AI expects '4', '6', '8' without suffix
    const durationValue = request.duration || 8;
    const duration = model.startsWith('vertex-')
      ? String(durationValue) // Vertex: '4', '6', '8'
      : `${durationValue}s`; // Fal.ai: '4s', '6s', '8s'

    // Prepare request body
    const requestBody = {
      prompt: request.prompt,
      ...(request.sourceImageUrl && {
        sourceImageUrl: request.sourceImageUrl,
      }),
      duration,
      aspectRatio: request.aspectRatio || '16:9',
      resolution: request.resolution || '720p',
      ...(request.generateAudio !== undefined && {
        generateAudio: request.generateAudio,
      }),
      ...(request.enhancePrompt !== undefined && {
        enhancePrompt: request.enhancePrompt,
      }),
      ...(request.negativePrompt && { negativePrompt: request.negativePrompt }),
      ...(request.seed !== undefined && { seed: request.seed }),
    };

    console.log('📤 Request body:', requestBody);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);

    const data = await response.json();
    console.log('📦 Response data:', data);

    if (!response.ok) {
      const errorMessage =
        data?.error ||
        data?.details ||
        `HTTP ${response.status}: Failed to generate video`;
      console.error('❌ API Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (!data?.success) {
      const errorMessage =
        data?.error || data?.details || 'Video generation failed';
      console.error('❌ Generation failed:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Handle Vertex AI async processing
    if (
      model.startsWith('vertex-') &&
      data.status === 'processing' &&
      data.operationName
    ) {
      console.log(
        '⏳ Vertex AI video is processing, polling for completion...',
      );

      // Poll for video completion (max 60 seconds)
      const maxAttempts = 12; // 12 * 5s = 60s
      const pollInterval = 5000; // 5 seconds

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`🔄 Polling attempt ${attempt}/${maxAttempts}...`);

        await new Promise((resolve) => setTimeout(resolve, pollInterval));

        const checkResponse = await fetch('/api/video/check-vertex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: data.operationName }),
        });

        const checkData = await checkResponse.json();
        console.log(`📊 Check result:`, checkData);

        if (checkData.status === 'completed' && checkData.videoUrl) {
          console.log('✅ Video ready!', checkData.videoUrl);

          // Use proxy URL for Vertex AI videos to handle authentication
          const proxyUrl = `/api/video/proxy-vertex?url=${encodeURIComponent(checkData.videoUrl)}`;
          console.log('🔄 Using proxy URL:', proxyUrl);

          const videoData: GeneratedVideoResult = {
            id: data.fileId || `video-${Date.now()}`,
            url: proxyUrl,
            prompt: request.prompt,
            timestamp: Date.now(),
            provider: data.provider || 'vertex-ai',
            model: data.model || model,
            settings: {
              duration: request.duration || 8,
              aspectRatio: request.aspectRatio || '16:9',
              resolution: request.resolution || '720p',
              ...(request.seed !== undefined && { seed: request.seed }),
            },
          };

          return {
            success: true,
            data: videoData,
            fileId: data.fileId,
            url: proxyUrl,
            videoUrl: proxyUrl,
            provider: data.provider,
            model: data.model,
          };
        }
      }

      // Timeout after max attempts
      console.warn('⏱️ Video generation timeout - still processing');
      return {
        success: false,
        error: 'Video generation timeout. Please try again later.',
      };
    }

    // Extract video URL (works for Fal.ai and completed Vertex)
    const videoUrl = data.videoUrl || data.data?.url || '';

    if (!videoUrl) {
      console.warn('⚠️ No video URL in response');
      return {
        success: false,
        error: 'No video URL returned from API',
      };
    }

    const videoData: GeneratedVideoResult = {
      id: data.fileId || `video-${Date.now()}`,
      url: videoUrl,
      prompt: request.prompt,
      timestamp: Date.now(),
      provider: data.provider || 'unknown',
      model: data.model || model,
      settings: {
        duration: request.duration || 8,
        aspectRatio: request.aspectRatio || '16:9',
        resolution: request.resolution || '720p',
        ...(request.seed !== undefined && { seed: request.seed }),
      },
    };

    console.log('✅ Video data prepared:', videoData);

    return {
      success: true,
      data: videoData,
      fileId: data.fileId,
      url: videoUrl,
      videoUrl: videoUrl,
      provider: data.provider,
      model: data.model,
    };
  } catch (error) {
    console.error('💥 Video generation error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown generation error',
    };
  }
}

// Configuration function
export async function getVideoGenerationConfig(): Promise<{
  durations: Array<{ id: number; label: string; description: string }>;
  aspectRatios: Array<{ id: string; label: string; description: string }>;
  resolutions: Array<{ id: string; label: string; description: string }>;
  models: Array<{
    id: VideoModel;
    label: string;
    description: string;
    badge?: string;
  }>;
}> {
  return {
    durations: [
      { id: 4, label: '4 seconds', description: 'Quick clip' },
      { id: 6, label: '6 seconds', description: 'Medium clip' },
      {
        id: 8,
        label: '8 seconds',
        description: 'Standard duration (recommended)',
      },
    ],
    aspectRatios: [
      {
        id: '16:9',
        label: 'Landscape (16:9)',
        description: 'Widescreen, YouTube',
      },
      { id: '9:16', label: 'Portrait (9:16)', description: 'Stories, Reels' },
      { id: '1:1', label: 'Square (1:1)', description: 'Instagram' },
    ],
    resolutions: [
      { id: '720p', label: '720p', description: 'HD (faster, cheaper)' },
      { id: '1080p', label: '1080p', description: 'Full HD (better quality)' },
    ],
    models: [
      {
        id: 'fal-veo3',
        label: 'Fal.ai Veo 3',
        description: 'Google Veo 3 via Fal.ai (Recommended)',
        badge: 'Best',
      },
      {
        id: 'vertex-veo3',
        label: 'Vertex AI Veo 3',
        description: 'Direct Google Veo 3.1 (Requires special access)',
        badge: 'Direct',
      },
      {
        id: 'vertex-veo2',
        label: 'Vertex AI Veo 2',
        description: 'Google Veo 2 (Older version)',
      },
    ],
  };
}
