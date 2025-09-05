import { type NextRequest, NextResponse } from "next/server";
import { configureSuperduperAI } from "@/lib/config/superduperai";
import { SceneService, getSuperduperAIConfig, OpenAPI } from "@turbo-super/api";

type ISceneUpdateOrder = Parameters<typeof SceneService.sceneUpdateOrder>[0];

export async function POST(request: NextRequest) {
  try {
    // Ensure OpenAPI client is configured
    configureSuperduperAI();
    const config = await getSuperduperAIConfig();
    if (config?.url) OpenAPI.BASE = config.url;
    if (config?.token) OpenAPI.TOKEN = config.token;

    const body = (await request.json()) as ISceneUpdateOrder;

    console.log("body", body);

    if (!body?.id || body?.requestBody?.order === undefined) {
      console.log(!body?.id || body?.requestBody?.order === undefined);
      return NextResponse.json(
        {
          error: "Failed to update order scene",
          details: "No Id or order provided",
        },
        { status: 400 }
      );
    }

    const response = await SceneService.sceneUpdateOrder(body);
    console.log(response);

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
