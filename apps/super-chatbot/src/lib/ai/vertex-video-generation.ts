/**
 * Vertex AI Video Generation Logic
 * Extracted from API route to be used directly in AI tools
 */

import type { Session } from "next-auth";
import {
  validateOperationBalance,
  deductOperationBalance,
} from "@/lib/utils/tools-balance";

export interface VertexVideoRequest {
  prompt: string;
  duration?: "4" | "6" | "8";
  aspectRatio?: "16:9" | "9:16" | "1:1";
  resolution?: "720p" | "1080p";
  negativePrompt?: string;
  model?: "veo3";
}

export interface VertexVideoResponse {
  success: boolean;
  fileId?: string;
  operationName?: string;
  status?: "processing" | "completed";
  videoUrl?: string;
  error?: string;
  provider?: string;
  model?: string;
  creditsUsed?: number | undefined;
}

/**
 * Generate video using Vertex AI (VEO2 or VEO3)
 * This function can be called directly from AI tools with session
 */
export async function generateVertexVideo(
  request: VertexVideoRequest,
  session: Session
): Promise<VertexVideoResponse> {
  try {
    console.log("🎬 Vertex AI Video Generation called");

    if (!session?.user?.id) {
      throw new Error("User session required");
    }

    // Check API key
    const apiKey =
      process.env.GOOGLE_AI_API_KEY || process.env.VERTEX_AI_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "Vertex AI API key not configured",
      };
    }

    console.log("✅ API Key found");

    // Validate balance
    const userId = session.user.id;
    const generationType = "text-to-video";

    const multipliers: string[] = [];
    const durationSeconds = Number.parseInt(request.duration || "8");

    if (durationSeconds <= 5) multipliers.push("duration-5s");
    else if (durationSeconds <= 10) multipliers.push("duration-10s");
    else if (durationSeconds <= 15) multipliers.push("duration-15s");

    if (request.resolution === "1080p") {
      multipliers.push("hd-quality");
    }

    const balanceValidation = await validateOperationBalance(
      userId,
      "video-generation",
      generationType,
      multipliers
    );

    if (!balanceValidation.valid) {
      return {
        success: false,
        error: balanceValidation.error || "Insufficient balance",
      };
    }

    console.log(
      `💳 User ${userId} has sufficient balance (${balanceValidation.cost} credits)`
    );

    // Determine model version (only veo-3.1 is available via Generative Language API)
    const modelVersion = request.model || "veo3";
    const modelName = "veo-3.1"; // Only VEO 3.1 is available

    // Try Generative Language API (works with API key)
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}-generate-preview:predictLongRunning`;

    console.log(`🚀 Calling Vertex AI ${modelVersion.toUpperCase()}...`);
    console.log(`   Endpoint: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: request.prompt,
            ...(request.negativePrompt && {
              negativePrompt: request.negativePrompt,
            }),
          },
        ],
        parameters: {
          aspectRatio: request.aspectRatio || "16:9",
          resolution: request.resolution || "720p",
          durationSeconds: durationSeconds,
        },
      }),
    });

    const responseText = await response.text();
    console.log(`📋 Response Status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ Vertex AI error:`, responseText.substring(0, 200));
      return {
        success: false,
        error: `Vertex AI error: ${response.status}`,
      };
    }

    const operationData = JSON.parse(responseText);
    const fileId = `vertex-${modelVersion}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log("✅ Video generation started:", operationData.name);

    // Deduct balance
    try {
      await deductOperationBalance(
        userId,
        "video-generation",
        generationType,
        multipliers,
        {
          fileId,
          operationType: generationType,
          duration: durationSeconds,
          resolution: request.resolution || "720p",
          provider: "vertex-ai",
          model: modelName,
          timestamp: new Date().toISOString(),
        }
      );
      console.log(`💳 Balance deducted for user ${userId}`);
    } catch (balanceError) {
      console.error("⚠️ Failed to deduct balance:", balanceError);
    }

    return {
      success: true,
      fileId,
      operationName: operationData.name,
      status: "processing",
      provider: "vertex-ai",
      model: modelName,
      creditsUsed: balanceValidation.cost || undefined,
    };
  } catch (error) {
    console.error("💥 Vertex Video Generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check status of Vertex AI video generation
 */
export async function checkVertexVideoStatus(operationName: string): Promise<{
  status: "processing" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
}> {
  try {
    const apiKey =
      process.env.GOOGLE_AI_API_KEY || process.env.VERTEX_AI_API_KEY;

    if (!apiKey) {
      throw new Error("Vertex AI API key not configured");
    }

    // Extract operation ID from name
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/${operationName}`;

    const response = await fetch(endpoint, {
      headers: {
        "x-goog-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.done) {
      if (data.error) {
        return {
          status: "failed",
          error: data.error.message || "Video generation failed",
        };
      }

      // Extract video URL from correct Vertex AI response structure
      const videoUrl =
        data.response?.generateVideoResponse?.generatedSamples?.[0]?.video
          ?.uri ||
        data.response?.video?.uri ||
        data.response?.videoUri ||
        data.response?.url ||
        null;

      if (!videoUrl) {
        return {
          status: "failed",
          error: "No video URL in response",
        };
      }

      return {
        status: "completed",
        videoUrl,
      };
    }

    return {
      status: "processing",
    };
  } catch (error) {
    console.error("Status check error:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
