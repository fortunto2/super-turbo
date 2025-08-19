import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getSuperduperAIConfig,
  ProjectService,
  TaskStatusEnum,
  TaskTypeEnum,
} from "@turbo-super/api";

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Получение конфигурации SuperDuperAI
    const superduperaiConfig = getSuperduperAIConfig();

    if (!superduperaiConfig.token) {
      return NextResponse.json(
        { error: "SuperDuperAI API token not configured" },
        { status: 500 }
      );
    }

    // Настройка и вызов SuperDuperAI API
    const { OpenAPI } = await import("@turbo-super/api");
    OpenAPI.BASE = superduperaiConfig.url;
    OpenAPI.TOKEN = superduperaiConfig.token;

    const result = await ProjectService.projectGetById({
      id: projectId,
    });

    // Определяем статус проекта на основе задач (используя логику из хука)
    const projectTasks = result.tasks || [];

    // Проверяем статусы конкретных типов задач
    const txtTask = projectTasks.find(
      (task) => task.type === TaskTypeEnum.TXT2SCRIPT_FLOW
    );
    const entityTask = projectTasks.find(
      (task) => task.type === TaskTypeEnum.SCRIPT2ENTITIES_FLOW
    );
    const storyboardTask = projectTasks.find(
      (task) => task.type === TaskTypeEnum.SCRIPT2STORYBOARD_FLOW
    );

    const isTxtCompleted = txtTask?.status === TaskStatusEnum.COMPLETED;
    const isEntityCompleted = entityTask?.status === TaskStatusEnum.COMPLETED;
    const isStoryboardCompleted =
      storyboardTask?.status === TaskStatusEnum.COMPLETED;

    const isTxtError = txtTask?.status === TaskStatusEnum.ERROR;
    const isEntityError = entityTask?.status === TaskStatusEnum.ERROR;
    const isStoryboardError = storyboardTask?.status === TaskStatusEnum.ERROR;

    // Определяем общий статус проекта
    const totalTasks = 3; // TXT2SCRIPT, SCRIPT2ENTITIES, SCRIPT2STORYBOARD
    const completedCount = [
      isTxtCompleted,
      isEntityCompleted,
      isStoryboardCompleted,
    ].filter(Boolean).length;
    const progress = Math.round((completedCount / totalTasks) * 100);

    let status = "processing";
    let message = "Tasks in progress";

    if (isTxtError || isEntityError || isStoryboardError) {
      status = "failed";
      message = "Some tasks failed";
    } else if (completedCount === totalTasks) {
      status = "completed";
      message = "All tasks completed";
    } else if (completedCount === 0) {
      status = "pending";
      message = "Project created, waiting to start";
    }

    const projectStatus = {
      status,
      progress,
      message,
      completedTasks: completedCount,
      totalTasks,
      errorTasks: [isTxtError, isEntityError, isStoryboardError].filter(
        Boolean
      ),
      completedTasksList: [
        isTxtCompleted,
        isEntityCompleted,
        isStoryboardCompleted,
      ].filter(Boolean),
    };

    return NextResponse.json({
      success: true,
      project: result,
      ...projectStatus,
    });
  } catch (error: any) {
    console.error("Story Editor Status API Error:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
