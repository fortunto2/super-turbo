"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "@turbo-super/ui";
import {
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { ProjectTaskList } from "@/components/project/project-task-list";
import { useProjectTasks } from "@turbo-super/api";
import {
  useProjectGetById,
  useProjectScript2Storyboard,
  useProjectTxt2Script,
  useProjectVideoScript2Entities,
} from "@/lib/api";
import { getProjectStatus } from "@/lib/utils/project-status";
import { useProjectEvents } from "@/hooks/event-handlers/event-source";
import { useProjectEventHandler } from "@/hooks/event-handlers/event-handler";
import { useProjectVideoEventHandler } from "@/hooks/event-handlers/use-project-video-event-handler";

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  // Убираем локальные состояния, используем данные из хуков

  const { mutate: regenerateStoryboard, isPending: isStoryboardRegenerating } =
    useProjectScript2Storyboard();

  const { mutate: regenerateEntities, isPending: isEntitiesRegenerating } =
    useProjectVideoScript2Entities();

  const { mutate: regenerateTxt, isPending: isTxtRegenerating } =
    useProjectTxt2Script();

  const { data: project } = useProjectGetById({ id: projectId });

  // Настраиваем обработчики событий для real-time обновлений
  const projectEventHandler = useProjectEventHandler(projectId);
  const projectVideoEventHandler = useProjectVideoEventHandler(projectId);

  useProjectEvents({
    projectId,
    eventHandlers: [projectEventHandler, projectVideoEventHandler],
  });

  const {
    isEntityError,
    isStoryboardError,
    errorTasks,
    completedTasks,
    isEntityCompleted,
    isStoryboardCompleted,
    isTxtCompleted,
    isTxtError,
  } = useProjectTasks(project?.tasks);

  // Определяем статус проекта на основе задач
  const projectStatusInfo = project?.tasks
    ? getProjectStatus(project.tasks)
    : null;
  const projectStatus = projectStatusInfo?.status || "pending";
  const hasErrors = errorTasks.length > 0;
  const isCompleted =
    isStoryboardCompleted && isEntityCompleted && isTxtCompleted;

  const handleRegenerate = () => {
    if (isTxtError) {
      regenerateTxt({
        id: projectId,
        requestBody: project?.config?.prompt,
      });
      return;
    }
    if (isEntityError) {
      regenerateEntities({ id: projectId });
      return;
    }
    if (isStoryboardError) {
      regenerateStoryboard({ id: projectId });
      return;
    }
  };

  // Автоматический запуск следующего этапа после успешного завершения предыдущего
  const handleAutoNextStage = useCallback(() => {
    if (isTxtCompleted && !isEntityCompleted && !isEntityError) {
      console.log("🚀 Auto-starting entities generation...");
      regenerateEntities({ id: projectId });
    } else if (
      isEntityCompleted &&
      !isStoryboardCompleted &&
      !isStoryboardError
    ) {
      console.log("🚀 Auto-starting storyboard generation...");
      regenerateStoryboard({ id: projectId });
    }
  }, [
    isTxtCompleted,
    isEntityCompleted,
    isEntityError,
    isStoryboardCompleted,
    isStoryboardError,
    regenerateEntities,
    regenerateStoryboard,
    projectId,
  ]);

  useEffect(() => {
    if (isCompleted) {
      router.replace(`/project/video/${projectId}/preview`);
    }
  }, [isCompleted, projectId, router]);

  // Автоматический запуск следующего этапа
  useEffect(() => {
    handleAutoNextStage();
  }, [handleAutoNextStage]);

  if (!projectId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Project ID not found
          </h1>
          <button
            onClick={() => router.back()}
            className="text-primary hover:text-primary/80 underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="mx-auto px-4 py-8 w-full max-w-4xl">
        <div className="w-full space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
              >
                <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <ArrowLeft className="size-4" />
                </div>
                <span className="font-medium">Go Back</span>
              </button>
              <h1 className="text-3xl font-bold text-foreground">
                Generation Tracking
              </h1>
              <p className="text-muted-foreground">Project ID: {projectId}</p>
            </div>
          </div>

          {/* Project status */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-primary">Project Status</CardTitle>
              <CardDescription>
                Tracking video generation progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Project ID:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {projectId}
                  </code>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress:</span>
                    <span>{completedTasks.length}/3 steps</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedTasks.length / 3) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Status display */}
                <div className="flex items-center space-x-2">
                  {projectStatus === "completed" ? (
                    <CheckCircle className="size-4 text-green-600" />
                  ) : projectStatus === "failed" ? (
                    <AlertCircle className="size-4 text-red-600" />
                  ) : projectStatus === "processing" ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <Loader2 className="size-4 animate-spin text-yellow-600" />
                  )}
                  <span className="capitalize">
                    {projectStatus === "completed" && "Video ready!"}
                    {projectStatus === "failed" && "Generation error"}
                    {projectStatus === "processing" && "Video generating..."}
                    {projectStatus === "pending" && "Waiting to start..."}
                  </span>
                </div>

                {/* Main status message */}
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    {hasErrors
                      ? "An error occurred. Please try regenerating the project."
                      : "Auto mode is active. Please wait while your project is being prepared."}
                  </p>
                </div>

                {/* Error details */}
                {projectStatusInfo?.errorStage && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
                    <AlertCircle className="size-5" />
                    <span>Error in {projectStatusInfo.errorStage} stage</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-4 space-y-3">
                  {/* View video button for completed projects */}
                  {projectStatus === "completed" && (
                    <Button
                      onClick={() =>
                        router.push(`/project/video/${projectId}/preview`)
                      }
                      className="w-full"
                      variant="default"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Watch Video
                    </Button>
                  )}

                  {/* Regenerate button for failed projects */}
                  {hasErrors && (
                    <Button
                      onClick={handleRegenerate}
                      className="w-full"
                      variant="outline"
                      disabled={
                        isEntitiesRegenerating ||
                        isStoryboardRegenerating ||
                        isTxtRegenerating
                      }
                    >
                      {isEntitiesRegenerating ||
                      isStoryboardRegenerating ||
                      isTxtRegenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        "Regenerate Project"
                      )}
                    </Button>
                  )}
                </div>

                {/* Task details using the new component */}
                <ProjectTaskList
                  tasks={
                    project?.tasks?.map((task) => ({
                      ...task,
                      status: task.status || "pending",
                    })) || []
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer info */}
          <div className="text-center text-sm text-muted-foreground border-t pt-8 mt-12">
            <p>
              Powered by <strong>SuperDuperAI</strong> • Video generation
              tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
