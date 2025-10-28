import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { z } from "zod";

// Zod schema for operation check request
const operationCheckSchema = z.object({
  operationName: z.string().min(1, "Operation name is required"),
});

/**
 * Check Vertex AI Video Generation Operation Status
 *
 * Polls the status of a long-running video generation operation
 * Returns video URL when ready
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Vertex AI Operation Check API called");

    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get API key
    const apiKey =
      process.env.GOOGLE_AI_API_KEY || process.env.VERTEXT_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Vertex AI API key not configured" },
        { status: 500 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedData = operationCheckSchema.parse(body);

    console.log("🔍 Checking operation:", validatedData.operationName);

    // Check operation status via Generative Language API
    const checkUrl = `https://generativelanguage.googleapis.com/v1beta/${validatedData.operationName}`;

    const response = await fetch(checkUrl, {
      method: "GET",
      headers: {
        "x-goog-api-key": apiKey,
      },
    });

    const responseText = await response.text();
    console.log("📋 Operation status response:", response.status);
    console.log("📋 Response body:", responseText.substring(0, 500));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to check operation status",
          details: responseText,
          status: "error",
        },
        { status: response.status }
      );
    }

    const operationData = JSON.parse(responseText);

    console.log("operationData", operationData);

    // Check if operation is complete
    if (operationData.done === true) {
      console.log("✅ Operation completed!");

      // Extract video URL from response
      // Vertex AI response structure:
      // response.generateVideoResponse.generatedSamples[0].video.uri
      const videoUrl =
        operationData.response?.generateVideoResponse?.generatedSamples?.[0]
          ?.video?.uri ||
        operationData.response?.video?.uri ||
        operationData.response?.videoUri ||
        operationData.response?.url ||
        null;

      if (videoUrl) {
        console.log("✅ Video URL found:", `${videoUrl.substring(0, 50)}...`);
        return NextResponse.json({
          success: true,
          status: "completed",
          videoUrl,
          data: operationData,
        });
      } else {
        console.error("❌ No video URL found in response structure");
        console.error(
          "Response:",
          JSON.stringify(operationData.response, null, 2)
        );
        return NextResponse.json({
          success: true,
          status: "completed_no_url",
          message: "Operation completed but video URL not found",
          data: operationData,
        });
      }
    } else {
      // Operation still processing
      console.log("⏳ Operation still processing...");
      return NextResponse.json({
        success: true,
        status: "processing",
        message: "Video is still being generated",
        metadata: operationData.metadata || {},
      });
    }
  } catch (error) {
    console.error("💥 Vertex Operation Check error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check operation status",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// GET endpoint for info
export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/video/check-vertex",
    description: "Check Vertex AI video generation operation status",
    usage: {
      method: "POST",
      body: {
        operationName:
          "string (e.g., models/veo-3.1-generate-preview/operations/xxx)",
      },
    },
  });
}
