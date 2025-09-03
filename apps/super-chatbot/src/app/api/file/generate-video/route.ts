import { type NextRequest, NextResponse } from "next/server";
import { configureSuperduperAI } from "@/lib/config/superduperai";
import {
  getSuperduperAIConfig,
  OpenAPI,
  FileService,
  GenerateVideoPayload,
} from "@turbo-super/api";

export async function POST(request: NextRequest) {
  try {
    // Ensure OpenAPI client is configured
    configureSuperduperAI();
    const config = await getSuperduperAIConfig();
    if (config?.url) OpenAPI.BASE = config.url;
    if (config?.token) OpenAPI.TOKEN = config.token;

    const requestBody = (await request.json()) as GenerateVideoPayload;

    const response = await FileService.fileGenerateVideo({ requestBody });
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
