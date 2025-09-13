import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getSuperduperAIConfig,
  ProjectService,
  QualityTypeEnum,
} from "@turbo-super/api";
import {
  validateOperationBalance,
  deductOperationBalance,
} from "@/lib/utils/tools-balance";
import { createBalanceErrorResponse } from "@/lib/utils/balance-error-handler";
import {
  createUserProject,
  updateProjectStatus,
} from "@/lib/db/project-queries";
import {
  handlePrefectError,
  shouldRollbackProject,
} from "@/lib/utils/project-error-handler";

interface ProjectVideoCreate {
  template_name: string;
  config: {
    prompt: string;
    aspect_ratio: string;
    image_generation_config_name: string;
    auto_mode: boolean;
    seed: number;
    quality: string;
    entity_ids: string[];
  };
}

export async function POST(request: NextRequest) {
  let projectId: string | null = null;
  let userId: string | null = null;
  let creditsUsed = 0;

  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ProjectVideoCreate = await request.json();
    userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔍 Story Editor API: Processing request:", body);
    // Input validation
    if (!body.config.prompt || !body.config.image_generation_config_name) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: prompt and image_generation_config_name",
        },
        { status: 400 }
      );
    }

    // Calculate quality multipliers for balance validation
    const qualityMultipliers = [];
    if (body.config.quality === "4k") {
      qualityMultipliers.push("4k");
    } else if (body.config.quality === "hd") {
      qualityMultipliers.push("hd");
    }

    // Validate balance before proceeding
    const balanceValidation = await validateOperationBalance(
      userId,
      "story-editor",
      "project-video",
      qualityMultipliers
    );

    if (!balanceValidation.valid) {
      return NextResponse.json(
        createBalanceErrorResponse(balanceValidation, "story editor project"),
        { status: 402 }
      );
    }

    creditsUsed = balanceValidation.cost || 0;
    console.log(
      `💳 Balance validated: ${creditsUsed} credits required for story editor project`
    );

    // Configure SuperDuperAI API
    const superduperaiConfig = getSuperduperAIConfig();
    const { OpenAPI } = await import("@turbo-super/api");

    OpenAPI.BASE = superduperaiConfig.url;
    OpenAPI.TOKEN = superduperaiConfig.token;

    const payload = {
      template_name: "story",
      config: {
        prompt: body.config.prompt,
        aspect_ratio: body.config.aspect_ratio,
        image_generation_config_name: body.config.image_generation_config_name,
        auto_mode: body.config.auto_mode,
        seed: body.config.seed,
        quality: (() => {
          switch (body.config.quality) {
            case "4k":
              return QualityTypeEnum.FULL_HD;
            case "hd":
              return QualityTypeEnum.HD;
            case "standard":
              return QualityTypeEnum.SD;
            default:
              return QualityTypeEnum.SD;
          }
        })(),
        entity_ids: body.config.entity_ids,
      },
    };

    console.log("payload", payload);

    // Create project in SuperDuperAI
    const result = await ProjectService.projectVideo({ requestBody: payload });
    projectId = result.id;

    if (!projectId) {
      throw new Error("No project ID returned from SuperDuperAI API");
    }

    // Save project to database with pending status
    try {
      await createUserProject(userId, projectId, creditsUsed);
      console.log(
        `💾 Project ${projectId} created in database with status: pending`
      );
    } catch (dbError: any) {
      console.error("Database error creating project:", dbError);
      throw new Error(`Failed to save project to database: ${dbError.message}`);
    }

    // Update project status to processing
    // Временно отключено - требуется миграция для добавления колонки status
    try {
      // await updateProjectStatus(projectId, "processing");
      console.log(
        `📊 Project ${projectId} status update skipped (migration needed)`
      );
    } catch (statusError) {
      console.error("Error updating project status:", statusError);
      // Continue execution even if status update fails
    }

    // Deduct balance AFTER successful project creation and database save
    try {
      await deductOperationBalance(
        userId,
        "story-editor",
        "project-video",
        qualityMultipliers,
        {
          projectId: projectId,
          operation: "story-editor-project",
          timestamp: new Date().toISOString(),
        }
      );
      console.log(
        `💳 Balance deducted for user ${userId} after successful story editor project creation: ${creditsUsed} credits`
      );
    } catch (balanceError: any) {
      console.error("Balance deduction error:", balanceError);
      // If balance deduction fails, we need to rollback the project
      await handlePrefectError(projectId, userId, 0, balanceError);
      throw new Error(`Failed to deduct balance: ${balanceError.message}`);
    }

    return NextResponse.json({
      success: true,
      projectId,
      message: "Video generation started successfully",
      data: result.data,
      creditsUsed,
    });
  } catch (error: any) {
    console.error("Story Editor API Error:", error);

    // Handle project rollback if needed
    if (projectId && userId && shouldRollbackProject(error)) {
      console.log(`🔄 Rolling back project ${projectId} due to error`);
      try {
        await handlePrefectError(projectId, userId, creditsUsed, error);
      } catch (rollbackError) {
        console.error("Failed to rollback project:", rollbackError);
      }
    }

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        projectId: projectId || null,
      },
      { status: 500 }
    );
  }
}
