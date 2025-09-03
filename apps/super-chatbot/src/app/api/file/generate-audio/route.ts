import { type NextRequest, NextResponse } from "next/server";
import { configureSuperduperAI } from "@/lib/config/superduperai";
import {
  getSuperduperAIConfig,
  OpenAPI,
  FileService,
  GenerateAudioPayload,
} from "@turbo-super/api";

export async function POST(request: NextRequest) {
  try {
    // Ensure OpenAPI client is configured
    configureSuperduperAI();
    const config = await getSuperduperAIConfig();
    if (config?.url) OpenAPI.BASE = config.url;
    if (config?.token) OpenAPI.TOKEN = config.token;

    const requestBody = (await request.json()) as GenerateAudioPayload;

    const response = await FileService.fileGenerateAudio({ requestBody });
    console.log("Audio generation response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 Audio generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate audio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
