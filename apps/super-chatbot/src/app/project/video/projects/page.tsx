"use client";

import { useRouter } from "next/navigation";
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
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { QueryState } from "@/components/ui/query-state";
// import { useProjectList } from "@/lib/api/superduperai";
import { useQuery } from "@tanstack/react-query";
import {
  getStatusIcon,
  getStatusColor,
  getStatusText,
} from "@/lib/utils/project-status";

interface UserProject {
  id: string;
  userId: string;
  projectId: string;
  status?: "pending" | "processing" | "completed" | "failed";
  errorStage?: "script" | "entities" | "storyboard";
  errorMessage?: string;
  completedStages?: string[];
  failedStages?: string[];
  tasks?: any[];
  creditsUsed?: number;
  createdAt: string;
  updatedAt?: string;
}

export default function ProjectsPage() {
  const router = useRouter();

  // Используем локальный API для загрузки проектов пользователя
  const {
    data: projectsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user-projects"],
    queryFn: async () => {
      const response = await fetch("/api/user/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    },
  });

  const projects = projectsData?.projects || [];

  // Используем утилиты из project-status.ts

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
          >
            <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <ArrowLeft className="size-4" />
            </div>
            <span className="font-medium">Go Back</span>
          </button>
        </div>

        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={projects.length === 0}
          emptyMessage="You don't have any projects yet"
          loadingMessage="Loading projects..."
          errorMessage="Failed to load projects"
        >
          {projects.length === 0 ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
              <div className="text-center bg-card border border-border rounded-2xl p-8 shadow-2xl">
                <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  You don&apos;t have any projects yet
                </h2>
                <p className="text-muted-foreground mb-4">
                  Create your first project in Story Editor and it will appear
                  here
                </p>
                <div className="space-y-3">
                  <Link href="/tools/story-editor">
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Create First Project
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    💡 Each project costs 40 credits
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    My Projects
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    All your Story Editor projects in one place
                  </p>
                </div>
                <Link href="/tools/story-editor">
                  <Button>Create New Project</Button>
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project: UserProject) => {
                  const status = project.status || "pending"; // TODO: Получить статус из API

                  return (
                    <Card
                      key={project.id}
                      className="bg-card border border-border hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg truncate text-foreground">
                            Project {project.projectId.slice(-8)}
                          </CardTitle>
                          <span className="text-lg">
                            {getStatusIcon(status)}
                          </span>
                        </div>
                        <CardDescription className="text-muted-foreground">
                          Created{" "}
                          {new Date(project.createdAt).toLocaleDateString(
                            "en-US"
                          )}
                          {project.creditsUsed && (
                            <span className="block text-xs">
                              Credits used: {project.creditsUsed}
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Status:
                            </span>
                            <span
                              className={`text-sm font-medium ${getStatusColor(status)}`}
                            >
                              {getStatusText(status)}
                            </span>
                          </div>

                          {project.errorStage && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600 dark:text-red-400">
                                Error in {project.errorStage} stage
                              </span>
                            </div>
                          )}

                          {project.completedStages &&
                            project.completedStages.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Completed: {project.completedStages.join(", ")}
                              </div>
                            )}

                          <div className="pt-2">
                            <Link
                              href={`/project/video/${project.projectId}/generate`}
                            >
                              <Button
                                className="w-full hover:scale-105 transition-all duration-300"
                                variant="outline"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Open Project
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </QueryState>
      </div>
    </div>
  );
}
