import { NextRequest, NextResponse } from "next/server";
import { getSessionData, updateSessionData, type SessionData } from "@/lib/kv";
import {
  configureSuperduperAI,
  getSuperduperAIConfig,
} from "@/lib/config/superduperai";

// Check file status in SuperDuperAI and update session if needed
async function checkAndUpdateFileStatus(sessionData: SessionData) {
  console.log(
    `🔍 checkAndUpdateFileStatus called with status: ${sessionData.status}, fileId: ${sessionData.fileId}`
  );

  if (sessionData.status !== "processing" || !sessionData.fileId) {
    console.log(
      `⏭️ Skipping check - status: ${sessionData.status}, fileId: ${sessionData.fileId}`
    );
    return sessionData;
  }

  try {
    configureSuperduperAI();
    const config = getSuperduperAIConfig();

    const response = await fetch(
      `${config.url}/api/v1/file/${sessionData.fileId}`,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.log(
        `📁 File ${sessionData.fileId} not ready yet (${response.status})`
      );
      return sessionData;
    }

    const fileData = await response.json();
    console.log(`📁 File ${sessionData.fileId} status:`, fileData);

    // If file has URL, it's completed
    if (fileData.url) {
      console.log(
        `✅ File ${sessionData.fileId} is ready! URL: ${fileData.url}`
      );
      return {
        ...sessionData,
        status: "completed" as const,
      };
    } else {
      console.log(`⏳ File ${sessionData.fileId} not ready yet - no URL`);
    }

    // Check if file failed
    if (
      fileData.tasks &&
      fileData.tasks.some(
        (task: { status: string }) =>
          task.status === "failed" || task.status === "error"
      )
    ) {
      console.log(`❌ File ${sessionData.fileId} failed`);

      // Check for specific Google Cloud errors
      const failedTask = fileData.tasks.find(
        (task: { status: string }) =>
          task.status === "failed" || task.status === "error"
      );

      let errorMessage = "File generation failed";
      if (failedTask) {
        console.log(`🔍 Failed task details:`, failedTask);

        // Check for Google Cloud specific errors
        if (
          fileData.video_generation?.generation_config_name?.includes(
            "google-cloud"
          )
        ) {
          errorMessage =
            "Google Cloud video generation failed. This may be due to content policy restrictions or model limitations. Please try a different prompt or model.";
        }
      }

      return {
        ...sessionData,
        status: "error" as const,
        error: errorMessage,
      };
    }

    return sessionData;
  } catch (error) {
    console.error(`❌ Error checking file ${sessionData.fileId}:`, error);
    return sessionData;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const sessionData = await getSessionData(sessionId);

    if (!sessionData) {
      return NextResponse.json({
        status: "pending",
        message: "Session not found or processing not yet started",
      });
    }

    console.log(
      "📊 Retrieved session data for API:",
      sessionId,
      sessionData.status
    );

    // Check and update file status if needed
    console.log(
      `🔍 Checking file status for session ${sessionId} with fileId: ${sessionData.fileId}`
    );
    const updatedSessionData = await checkAndUpdateFileStatus(sessionData);

    // Update session data in Redis if status changed
    if (updatedSessionData.status !== sessionData.status) {
      console.log(
        `🔄 Status changed from ${sessionData.status} to ${updatedSessionData.status}`
      );
      await updateSessionData(sessionId, {
        status: updatedSessionData.status,
        error: updatedSessionData.error || "",
      });
      console.log(
        `✅ Updated session ${sessionId} status to: ${updatedSessionData.status}`
      );
    } else {
      console.log(`📊 Status unchanged: ${sessionData.status}`);
    }

    // Return session data in format expected by frontend
    return NextResponse.json({
      status: updatedSessionData.status,
      fileId: updatedSessionData.fileId,
      error: updatedSessionData.error,
      toolSlug: updatedSessionData.toolSlug,
      toolTitle: updatedSessionData.toolTitle,
      prompt: updatedSessionData.prompt,
      timestamp: updatedSessionData.createdAt,
      modelName: updatedSessionData.modelName,
      generationType: updatedSessionData.generationType,
    });
  } catch (error) {
    console.error("Error getting session data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const updates = await request.json();

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      );
    }

    // Update session data
    await updateSessionData(sessionId, updates);

    console.log(`📊 Session data updated for ${sessionId}:`, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating session data:", error);
    return NextResponse.json(
      { error: "Failed to update session data" },
      { status: 500 }
    );
  }
}
