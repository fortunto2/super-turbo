// @ts-nocheck
import { VideoGenerationStrategyFactory } from "./strategy.factory";
import type {
  ImageToVideoParams,
  VideoGenerationParams,
  VideoGenerationResult,
} from "./strategy.interface";

// Main generation function using strategy pattern
export async function generateVideoWithStrategy(
  generationType: string,
  params: VideoGenerationParams | ImageToVideoParams,
  config: { url: string; token: string }
): Promise<VideoGenerationResult> {
  const factory = new VideoGenerationStrategyFactory();
  const strategy = factory.getStrategy(generationType);

  if (!strategy) {
    return {
      success: false,
      error: `Unsupported generation type: ${generationType}. Supported types: ${factory.getSupportedTypes().join(", ")}`,
    };
  }

  // Validate parameters
  const validation = strategy.validate(params);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  try {
    const payload = await strategy.generatePayload(params, config);

    // Use correct SuperDuperAI endpoint for video generation
    const endpoint = "/api/v1/file/generate-video";
    const url = `${config.url}${endpoint}`;

    console.log(
      "🎬 Sending with JSON payload:",
      JSON.stringify(payload, null, 2)
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ ${strategy.type} API Error (${response.status}):`,
        errorText
      );

      return {
        success: false,
        error: `API Error: ${response.status} ${response.statusText} - ${errorText}`,
      };
    }

    const result = await response.json();
    console.log(`📨 ${strategy.type} API Response:`, result);

    // Extract fileId from response
    const fileId =
      result.id ||
      result.data?.[0]?.value?.file_id ||
      result.data?.[0]?.id ||
      result.fileId;

    if (!fileId) {
      console.error("❌ No fileId found in response");
      return {
        success: false,
        error: "No file ID returned from API",
      };
    }

    console.log(`🎬 ${strategy.type} generation started - FileId: ${fileId}`);

    return {
      success: true,
      projectId: fileId,
      requestId: fileId,
      fileId,
      message: `${strategy.type} generation started! FileId: ${fileId}`,
    };
  } catch (error: any) {
    console.error(`❌ ${strategy.type} generation error:`, error);

    let errorMessage =
      error.message || `Unknown ${strategy.type} generation error`;

    return {
      success: false,
      error: errorMessage,
    };
  }
}
