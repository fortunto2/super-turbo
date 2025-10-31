import { type NextRequest, NextResponse } from 'next/server';
import { configureSuperduperAI } from '@/lib/config/superduperai';
import { getSuperduperAIConfig, OpenAPI, FileService } from '@turbo-super/api';

export async function DELETE(request: NextRequest) {
  try {
    // Ensure OpenAPI client is configured
    configureSuperduperAI();
    const config = await getSuperduperAIConfig();
    if (config?.url) OpenAPI.BASE = config.url;
    if (config?.token) OpenAPI.TOKEN = config.token;

    const { id } = (await request.json()) as { id: string };

    if (!id) {
      return NextResponse.json(
        {
          error: 'No id provided',
        },
        { status: 400 },
      );
    }

    const response = await FileService.fileDelete({ id });
    console.log(response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 Scene proxy error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update scene status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
