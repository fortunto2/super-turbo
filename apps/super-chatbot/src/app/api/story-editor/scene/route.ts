import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getSuperduperAIConfig, OpenAPI, SceneService } from '@turbo-super/api';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sceneId = searchParams.get('sceneId');

    if (!sceneId) {
      return NextResponse.json(
        { error: 'Scene ID is required' },
        { status: 400 },
      );
    }

    const config = await getSuperduperAIConfig();

    if (!config.token || !config.url) {
      return NextResponse.json(
        { error: 'SuperDuperAI configuration not available' },
        { status: 500 },
      );
    }

    OpenAPI.BASE = config.url;
    OpenAPI.TOKEN = config.token;

    // Get scene via SceneService
    const response = await SceneService.sceneGetById({ id: sceneId });

    if (!response) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      scene: response,
    });
  } catch (error: any) {
    console.error('Error fetching scene:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 },
    );
  }
}
