import { type NextRequest, NextResponse } from "next/server";
import { configureSuperduperAI } from "@/lib/config/superduperai";
import {
  SceneService,
  getSuperduperAIConfig,
  OpenAPI,
  ISceneUpdate,
} from "@turbo-super/api";

export async function POST(request: NextRequest) {
  try {
    // Ensure OpenAPI client is configured
    configureSuperduperAI();
    const config = await getSuperduperAIConfig();
    if (config?.url) OpenAPI.BASE = config.url;
    if (config?.token) OpenAPI.TOKEN = config.token;

    const { searchParams } = new URL(request.url);
    const sceneId = searchParams.get("sceneId");
    if (!sceneId) {
      return NextResponse.json(
        {
          error: "Failed to update scene",
          details: "No sceneId provided",
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as {
      sceneId: string;
      requestBody: ISceneUpdate;
    };

    console.log("body", body);

    const response = await SceneService.sceneUpdate({
      id: body.sceneId,
      requestBody: {
        ...body.requestBody,
      } as ISceneUpdate,
    });
    console.log("response scene update", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 Scene proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to update scene status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
