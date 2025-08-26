import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getSuperduperAIConfig,
  OpenAPI,
  VideoProjectsLegacyService,
} from "@turbo-super/api";

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    // Input validation
    if (!projectId) {
      return NextResponse.json(
        {
          error: "Missing required field: projectId",
        },
        { status: 400 }
      );
    }

    console.log(`🎬 Starting timeline2video for project: ${projectId}`);

    // Getting SuperDuperAI configuration
    const superduperaiConfig = getSuperduperAIConfig();

    if (!superduperaiConfig.token) {
      return NextResponse.json(
        { error: "SuperDuperAI API token not configured" },
        { status: 500 }
      );
    }

    // Setup and call SuperDuperAI API
    OpenAPI.BASE = superduperaiConfig.url;
    OpenAPI.TOKEN = superduperaiConfig.token;

    console.log(
      `🚀 Calling SuperDuperAI timeline2video API for project ${projectId}`
    );

    const result = await VideoProjectsLegacyService.projectTimeline2Video({
      id: projectId,
    });

    console.log(
      `✅ Timeline2video completed successfully for project ${projectId}`
    );

    return NextResponse.json({
      success: true,
      message: "Timeline to video conversion started successfully",
      project: result,
      projectId,
    });
  } catch (error: any) {
    console.error("Timeline2Video API Error:", error);

    // Handle specific API errors
    if (error.status === 422) {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.body?.detail || "Invalid request data",
        },
        { status: 422 }
      );
    }

    if (error.status === 404) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (error.status === 400) {
      return NextResponse.json(
        {
          error: "Bad Request",
          details: error.body?.detail || "Invalid request",
        },
        { status: 400 }
      );
    }

    // General server error
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
