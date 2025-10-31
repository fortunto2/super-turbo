import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  GenerationConfigService,
  GenerationTypeEnum,
  getSuperduperAIConfig,
} from '@turbo-super/api';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Getting SuperDuperAI configuration
    const superduperaiConfig = getSuperduperAIConfig();

    if (!superduperaiConfig.token) {
      return NextResponse.json(
        { error: 'SuperDuperAI API token not configured' },
        { status: 500 },
      );
    }

    // Setup and use generated API client
    const { OpenAPI } = await import('@turbo-super/api');
    OpenAPI.BASE = superduperaiConfig.url;
    OpenAPI.TOKEN = superduperaiConfig.token;

    const result = await GenerationConfigService.generationConfigGetList({
      limit: 100,
    });
    console.log('result', result);

    // Filter only video configurations
    const videoConfigs =
      result?.items.filter((model) =>
        [GenerationTypeEnum.TEXT_TO_IMAGE].includes(model.type),
      ) ?? [];

    return NextResponse.json({
      success: true,
      configs: videoConfigs,
      total: videoConfigs.length,
    });
  } catch (error: any) {
    console.error('Story Editor Configs API Error:', error);

    // Return mock data in case of error
    const mockConfigs = [
      { id: '1', name: 'VEO3 Standard', type: 'video', source: 'superduperai' },
      { id: '2', name: 'VEO3 HD', type: 'video', source: 'superduperai' },
      { id: '3', name: 'VEO3 4K', type: 'video', source: 'superduperai' },
      {
        id: '4',
        name: 'KLING Standard',
        type: 'video',
        source: 'superduperai',
      },
      { id: '5', name: 'LTX Standard', type: 'video', source: 'superduperai' },
    ];

    return NextResponse.json({
      success: true,
      configs: mockConfigs,
      total: mockConfigs.length,
      note: 'Using mock data due to API error',
    });
  }
}
