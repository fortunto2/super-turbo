import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { fal } from '@fal-ai/client';
import {
  validateOperationBalance,
  deductOperationBalance,
} from '@/lib/utils/tools-balance';
import { createBalanceErrorResponse } from '@/lib/utils/balance-error-handler';

// Configure Fal.ai client with API key
function configureFalClient() {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error('FAL_KEY environment variable is not configured');
  }
  fal.config({ credentials: falKey });
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      prompt,
      duration = '8s',
      aspectRatio = '16:9',
      resolution = '720p',
      generateAudio = true,
      enhancePrompt = true,
      negativePrompt,
      seed,
    } = body;

    console.log('🎬 Video Fal API: Processing request:', {
      prompt: `${prompt?.substring(0, 50)}...`,
      duration,
      aspectRatio,
      resolution,
    });

    // Validate user balance
    const userId = session.user.id;
    const generationType = 'text-to-video';

    // Determine cost multipliers based on duration
    const multipliers: string[] = [];
    const durationSeconds = Number.parseInt(duration);
    if (durationSeconds <= 5) multipliers.push('duration-5s');
    else if (durationSeconds <= 10) multipliers.push('duration-10s');
    else if (durationSeconds <= 15) multipliers.push('duration-15s');

    // Add resolution multiplier
    if (resolution === '1080p') {
      multipliers.push('hd-quality');
    }

    const balanceValidation = await validateOperationBalance(
      userId,
      'video-generation',
      generationType,
      multipliers,
    );

    if (!balanceValidation.valid) {
      const errorResponse = createBalanceErrorResponse(
        balanceValidation,
        generationType,
      );
      return NextResponse.json(errorResponse, { status: 402 });
    }

    console.log(
      `💳 User ${userId} has sufficient balance for ${generationType} (${balanceValidation.cost} credits)`,
    );

    // Configure Fal.ai client
    configureFalClient();

    // Call Fal.ai Veo3 API
    console.log('🚀 Calling Fal.ai Veo3 API...');
    const result = await fal.subscribe('fal-ai/veo3', {
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        duration,
        resolution,
        generate_audio: generateAudio,
        enhance_prompt: enhancePrompt,
        ...(negativePrompt && { negative_prompt: negativePrompt }),
        ...(seed && { seed: Number.parseInt(seed) }),
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log('📊 Queue update:', update);
      },
    });

    console.log('✅ Video generation result:', result);

    // Extract video URL from response
    const videoUrl = result.data?.video?.url;
    if (!videoUrl) {
      throw new Error('No video URL in response');
    }

    // Generate unique file ID
    const fileId = `fal-video-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Deduct balance after successful generation
    try {
      await deductOperationBalance(
        userId,
        'video-generation',
        generationType,
        multipliers,
        {
          fileId,
          operationType: generationType,
          duration: durationSeconds,
          resolution,
          provider: 'fal.ai',
          model: 'veo3',
          timestamp: new Date().toISOString(),
        },
      );
      console.log(
        `💳 Balance deducted for user ${userId} after successful video generation`,
      );
    } catch (balanceError) {
      console.error(
        '⚠️ Failed to deduct balance after video generation:',
        balanceError,
      );
      // Continue - video was generated successfully
    }

    // Return standardized response
    return NextResponse.json({
      success: true,
      fileId,
      videoUrl,
      data: {
        id: fileId,
        url: videoUrl,
        prompt,
        timestamp: Date.now(),
        settings: {
          duration: durationSeconds,
          aspectRatio,
          resolution,
          generateAudio,
        },
      },
      creditsUsed: balanceValidation.cost,
      provider: 'fal.ai',
      model: 'veo3',
    });
  } catch (error) {
    console.error('💥 Video Fal API error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate video',
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
