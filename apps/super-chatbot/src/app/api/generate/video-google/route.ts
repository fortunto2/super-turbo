import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  validateOperationBalance,
  deductOperationBalance,
} from '@/lib/utils/tools-balance';
import { createBalanceErrorResponse } from '@/lib/utils/balance-error-handler';

// Google Veo 3.1 API endpoint
const GOOGLE_VEO_API = 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning';

interface GoogleVeoOperation {
  name: string;
  done: boolean;
  metadata?: {
    '@type': string;
    videoGenerationVideoMetadata?: {
      generatedVideo: {
        uri: string;
        mimeType: string;
      };
    };
  };
  response?: {
    generatedVideos: Array<{
      uri: string;
      mimeType: string;
    }>;
  };
  error?: {
    code: number;
    message: string;
  };
}

async function waitForVideoGeneration(
  operationName: string,
  apiKey: string,
  maxAttempts = 60,
): Promise<string> {
  const operationUrl = `https://generativelanguage.googleapis.com/${operationName}`;

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(operationUrl, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Operation check failed: ${response.status}`);
    }

    const operation: GoogleVeoOperation = await response.json();

    if (operation.error) {
      throw new Error(
        `Video generation failed: ${operation.error.message}`,
      );
    }

    if (operation.done) {
      // Extract video URL from response
      const videoUri =
        operation.response?.generatedVideos?.[0]?.uri ||
        operation.metadata?.videoGenerationVideoMetadata?.generatedVideo?.uri;

      if (!videoUri) {
        throw new Error('No video URL in completed operation');
      }

      return videoUri;
    }

    // Wait 10 seconds before next check (Veo typically takes 30s-2min)
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log(`⏳ Waiting for video generation... Attempt ${i + 1}/${maxAttempts}`);
  }

  throw new Error('Video generation timeout - exceeded maximum wait time');
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Google AI API key
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_AI_API_KEY not configured' },
        { status: 500 },
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      prompt,
      duration = '8',
      aspectRatio = '16:9',
      resolution = '720p',
      negativePrompt,
    } = body;

    console.log('🎬 Video Google API: Processing request:', {
      prompt: `${prompt?.substring(0, 50)}...`,
      duration,
      aspectRatio,
      resolution,
    });

    // Validate user balance
    const userId = session.user.id;
    const generationType = 'text-to-video';

    // Determine cost multipliers
    const multipliers: string[] = [];
    const durationSeconds = Number.parseInt(duration);
    if (durationSeconds <= 5) multipliers.push('duration-5s');
    else if (durationSeconds <= 10) multipliers.push('duration-10s');

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

    // Call Google Veo API
    console.log('🚀 Calling Google Veo 3.1 API...');
    const response = await fetch(GOOGLE_VEO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
            ...(negativePrompt && { negativePrompt }),
          },
        ],
        parameters: {
          aspectRatio,
          resolution,
          durationSeconds: duration,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Veo API error:', errorText);
      throw new Error(`Google Veo API error: ${response.status} - ${errorText}`);
    }

    const operationData: GoogleVeoOperation = await response.json();
    console.log('📋 Operation started:', operationData.name);

    // Wait for video to be generated (this will take 30s - 2min)
    console.log('⏳ Waiting for video generation to complete...');
    const videoUrl = await waitForVideoGeneration(operationData.name, apiKey);

    console.log('✅ Video generated:', videoUrl);

    // Generate unique file ID
    const fileId = `google-veo-${Date.now()}-${Math.random().toString(36).substring(7)}`;

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
          provider: 'google',
          model: 'veo-3.1',
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
        },
      },
      creditsUsed: balanceValidation.cost,
      provider: 'google',
      model: 'veo-3.1',
    });
  } catch (error) {
    console.error('💥 Video Google API error:', error);

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
