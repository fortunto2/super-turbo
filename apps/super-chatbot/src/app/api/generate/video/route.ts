import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getSuperduperAIConfigWithUserToken } from '@/lib/config/superduperai';
import { generateVideoWithStrategy } from '@turbo-super/api';
import {
  validateOperationBalance,
  deductOperationBalance,
} from '@/lib/utils/tools-balance';
import { createBalanceErrorResponse } from '@/lib/utils/balance-error-handler';

// Map human-readable model name to generation_config_name
function mapModelNameToConfig(
  modelName: string,
  generationType: 'text-to-video' | 'image-to-video',
): string {
  const modelMap: Record<string, Record<string, string>> = {
    Veo2: {
      'text-to-video': 'google-cloud/veo2-text2video',
      'image-to-video': 'google-cloud/veo2',
    },
    Veo3: {
      'text-to-video': 'google-cloud/veo3-text2video',
      'image-to-video': 'google-cloud/veo3',
    },
    Sora: {
      'text-to-video': 'azure-openai/sora',
      'image-to-video': 'azure-openai/sora',
    },
  };
  return modelMap[modelName]?.[generationType] || modelName;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication first
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    // Support both JSON (text-to-video) and multipart (image-to-video)
    let body: any;
    if (isMultipart) {
      const form = await request.formData();
      body = Object.fromEntries(form.entries());
      // File stays as File object on the server runtime
      body.file = form.get('file');
    } else {
      body = await request.json();
    }

    console.log('🎬 Video API: Processing request:', {
      isMultipart,
      keys: Object.keys(body || {}),
    });

    // Validate user balance before proceeding
    const userId = session.user.id;
    const generationType: 'text-to-video' | 'image-to-video' =
      (body.generationType as any) === 'image-to-video'
        ? 'image-to-video'
        : 'text-to-video';

    // Determine cost multipliers based on request
    const multipliers: string[] = [];
    const duration = body.duration || 5;
    if (duration <= 5) multipliers.push('duration-5s');
    else if (duration <= 10) multipliers.push('duration-10s');
    else if (duration <= 15) multipliers.push('duration-15s');
    else if (duration <= 30) multipliers.push('duration-30s');

    // Check resolution quality
    if (body.resolution?.includes('HD') || body.resolution?.includes('720')) {
      multipliers.push('hd-quality');
    } else if (
      body.resolution?.includes('4K') ||
      body.resolution?.includes('2160')
    ) {
      multipliers.push('4k-quality');
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

    // Configure OpenAPI client with user token from session (with system token fallback)
    const config = getSuperduperAIConfigWithUserToken(session);

    const rawModel =
      typeof body.model === 'string'
        ? body.model
        : body?.model?.name || 'azure-openai/sora';
    const mappedModelName = mapModelNameToConfig(rawModel, generationType);

    const styleId =
      (typeof body.style === 'string' ? body.style : body?.style?.id) ||
      'flux_watercolor';
    const shotId =
      (typeof body.shotSize === 'string'
        ? body.shotSize
        : body?.shotSize?.id) || 'medium_shot';

    // Parse resolution "WxH" or default
    let width = 1920;
    let height = 1080;
    if (typeof body.resolution === 'string') {
      const m = body.resolution?.match(/(\d+)x(\d+)/);
      if (m) {
        width = Number.parseInt(m[1]);
        height = Number.parseInt(m[2]);
      }
    }

    // Build params for shared generator
    let result: any;
    if (generationType === 'image-to-video' && body.file instanceof File) {
      result = await generateVideoWithStrategy(
        'image-to-video',
        {
          prompt: body.prompt || 'animate this image naturally',
          file: body.file as File,
          model: mappedModelName,
          style: { id: styleId, label: styleId },
          resolution: {
            width,
            height,
            label: `${width}x${height}`,
            aspectRatio:
              width === height ? '1:1' : width > height ? '16:9' : '9:16',
          },
          shotSize: { id: shotId, label: shotId },
          duration: Number(body.duration) || 5,
          frameRate: Number(body.frameRate) || 30,
          negativePrompt: body.negativePrompt || '',
          seed: body.seed
            ? Number(body.seed)
            : Math.floor(Math.random() * 1000000),
          projectId: body?.projectId,
          sceneId: body?.sceneId,
        },
        config,
      );
    } else {
      result = await generateVideoWithStrategy(
        'text-to-video',
        {
          prompt: body.prompt || '',
          model: mappedModelName,
          style: { id: styleId, label: styleId },
          resolution: {
            width,
            height,
            label: `${width}x${height}`,
            aspectRatio:
              width === height ? '1:1' : width > height ? '16:9' : '9:16',
          },
          shotSize: { id: shotId, label: shotId },
          duration: Number(body.duration) || 5,
          frameRate: Number(body.frameRate) || 30,
          negativePrompt: body.negativePrompt || '',
          seed: body.seed
            ? Number(body.seed)
            : Math.floor(Math.random() * 1000000),
          projectId: body?.projectId,
          sceneId: body?.sceneId,
        },
        config,
      );
    }

    console.log('✅ Video generation result:', result);

    // Deduct balance after successful generation
    try {
      await deductOperationBalance(
        userId,
        'video-generation',
        generationType,
        multipliers,
        {
          fileId: result.fileId,
          projectId: result.projectId,
          operationType: generationType,
          duration: duration,
          resolution: body.resolution,
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
      // Continue with response - video was generated successfully
    }

    // Return standardized response
    const response = {
      ...result,
      creditsUsed: balanceValidation.cost,
      usingUserToken: config.isUserToken,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 Video API error:', error);

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
