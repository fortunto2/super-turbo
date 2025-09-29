import {
  configureSuperduperAI,
  getSuperduperAIConfig,
} from "@/lib/config/superduperai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_ENDPOINTS = {
  GENERATE_VIDEO: "/api/v1/generate/video",
  GENERATE_IMAGE: "/api/v1/generate/image",
};

export async function POST(request: NextRequest) {
  try {
    const { modelName, configName } = await request.json();

    if (!modelName || !configName) {
      return NextResponse.json(
        { error: "Missing modelName or configName" },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing config: ${configName} for model: ${modelName}`);

    // Configure SuperDuperAI client
    configureSuperduperAI();
    const config = getSuperduperAIConfig();

    // Создаем минимальный payload для тестирования
    const payload = {
      config: {
        prompt: "test prompt",
        negative_prompt: "",
        width: 1280,
        height: 720,
        aspect_ratio: "16:9",
        seed: 12345,
        generation_config_name: configName,
        batch_size: 1,
        references: [],
      },
    };

    // Определяем endpoint в зависимости от типа модели
    const endpoint = modelName.toLowerCase().includes("image")
      ? API_ENDPOINTS.GENERATE_IMAGE
      : API_ENDPOINTS.GENERATE_VIDEO;

    console.log(`📤 Testing ${configName} at endpoint: ${endpoint}`);

    const response = await fetch(`${config.url}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`,
        "User-Agent": "SuperDuperAI-Landing/1.0",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });

    console.log(`📡 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Config test failed for ${configName}:`, errorText);
      return NextResponse.json(
        {
          error: `Config test failed: ${response.status} - ${errorText}`,
          status: response.status,
          configName,
        },
        { status: 400 }
      );
    }

    console.log(`✅ Config ${configName} is valid`);
    return NextResponse.json({
      success: true,
      configName,
      message: "Configuration is valid",
    });
  } catch (error) {
    console.error("❌ Config test error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        configName: "unknown",
      },
      { status: 500 }
    );
  }
}
