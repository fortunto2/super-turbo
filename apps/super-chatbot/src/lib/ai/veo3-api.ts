/**
 * VEO3 (Google Video Generation) API Integration
 * Supports multiple providers:
 * - Google AI API (Gemini API with Veo 3.1) - using GOOGLE_AI_API_KEY
 * - Fal.ai (using FAL_KEY)
 */

export interface Veo3VideoRequest {
  prompt: string;
  duration?: '4' | '6' | '8' | '4s' | '6s' | '8s'; // Supports both formats
  aspectRatio?: '16:9' | '9:16' | '1:1';
  resolution?: '720p' | '1080p';
  generateAudio?: boolean; // Fal.ai only
  enhancePrompt?: boolean; // Fal.ai only
  negativePrompt?: string;
  seed?: number; // Fal.ai only
}

export interface Veo3VideoResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: string;
  resolution: string;
  prompt: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface Veo3Project {
  id: string;
  name: string;
  description: string;
  videos: Veo3VideoResponse[];
  createdAt: string;
}

/**
 * Creates video using Fal.ai Veo3 API
 * This function should be called from server-side only (API routes)
 */
export async function createVeo3Video(
  request: Veo3VideoRequest,
): Promise<Veo3VideoResponse> {
  const falKey = process.env.FAL_KEY;

  if (!falKey) {
    throw new Error('FAL_KEY environment variable not configured');
  }

  try {
    // Import Fal.ai client dynamically (server-side only)
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    // Normalize duration format for Fal.ai (needs 's' suffix)
    const duration = request.duration || '8s';
    const normalizedDuration = duration.endsWith('s')
      ? duration
      : `${duration}s`;

    // Call Fal.ai Veo3 API
    const result = await fal.subscribe('fal-ai/veo3', {
      input: {
        prompt: request.prompt,
        duration: normalizedDuration as '4s' | '6s' | '8s',
        aspect_ratio: request.aspectRatio || '16:9',
        resolution: request.resolution || '720p',
        generate_audio: request.generateAudio ?? true,
        enhance_prompt: request.enhancePrompt ?? true,
        ...(request.negativePrompt && {
          negative_prompt: request.negativePrompt,
        }),
        ...(request.seed && { seed: request.seed }),
      },
      logs: true,
    });

    const videoUrl = result.data?.video?.url;
    if (!videoUrl) {
      throw new Error('No video URL in Fal.ai response');
    }

    return {
      id: `veo3-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      status: 'completed',
      videoUrl,
      duration: normalizedDuration,
      resolution: request.resolution || '720p',
      prompt: request.prompt,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('VEO3 video creation error:', error);
    return {
      id: crypto.randomUUID(),
      status: 'failed',
      duration: request.duration || '8s',
      resolution: request.resolution || '720p',
      prompt: request.prompt,
      createdAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Note: Fal.ai Veo3 API returns videos immediately (no need for status polling)
 * The video URL is available in the response right away
 */

/**
 * Generates video prompt ideas for Veo3
 */
export function generateVeo3Ideas(prompt: string): string[] {
  const ideas = [
    `Create a cinematic video: ${prompt} with Hollywood-style production`,
    `Documentary-style video about ${prompt} with natural lighting`,
    `Animated video featuring ${prompt} with vibrant colors`,
    `Realistic video of ${prompt} with smooth camera movements`,
    `Creative video: ${prompt} with unique camera angles and perspectives`,
  ];

  return ideas.slice(0, 3);
}
