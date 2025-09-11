"use client";

import { useState, useEffect } from "react";
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

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [projectStatus, setProjectStatus] = useState<string>("unknown");
  const [projectProgress, setProjectProgress] = useState<number>(0);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [errorTasks, setErrorTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Project status tracking
  useEffect(() => {
    if (!projectId) return;

    const checkStatus = async () => {
      try {
        setIsLoading(false);
        const response = await fetch(
          `/api/story-editor/status?projectId=${projectId}`
        );
        const result = await response.json();

        if (result.success) {
          setProjectStatus(result.status);
          setProjectProgress(result.progress || 0);
          setProjectTasks(result.project?.tasks || []);
          setCompletedTasks(result.completedTasks || 0);
          setTotalTasks(result.totalTasks || 0);
          setErrorTasks(result.errorTasks || []);

          // If project is completed, show message
          if (result.status === "completed") {
            // Can add notification or automatic redirect
          } else if (result.status === "failed") {
            setError("Video generation failed");
          }
        } else {
          setError("Error getting project status");
        }
      } catch (err) {
        console.error("Error checking project status:", err);
        setError("Status check error");
      }
    };

    // Check status every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    checkStatus(); // First check immediately

    return () => clearInterval(interval);
  }, [projectId]);

  const handleRegenerate = async () => {
    if (!projectId) return;

    try {
      setError(null);
      setProjectStatus("pending");
      setProjectProgress(0);
      setProjectTasks([]);
      setCompletedTasks(0);
      setTotalTasks(0);
      setErrorTasks([]);

      // Here you can add logic for regenerating specific tasks
      // For now, just restart the entire project
      const response = await fetch("/api/story-editor/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_name: "story",
          config: {
            prompt: "Project regeneration", // Can add field for prompt
            aspect_ratio: "16:9",
            image_generation_config_name: "default",
            auto_mode: true,
            seed: Math.floor(Math.random() * 1000000),
            quality: "sd",
            entity_ids: [],
            dynamic: 1,
            voiceover_volume: 0.5,
            music_volume: 0.5,
            sound_effect_volume: 0.5,
            watermark: false,
            subtitles: false,
            voiceover: false,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update projectId if a new project was created
        if (result.projectId !== projectId) {
          router.push(`/project/video/${result.projectId}/generate`);
        }
      } else {
        throw new Error(result.error || "Regeneration error");
      }
    } catch (err: any) {
      setError(err.message || "Regeneration error");
    }
  };

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
                    <span>
                      {completedTasks}/{totalTasks} steps
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${projectProgress}%` }}
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
                    {projectStatus === "unknown" && "Checking status..."}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Status updates automatically every 5 seconds
                </p>

                {/* Error display */}
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
                    <AlertCircle className="size-5" />
                    <span>{error}</span>
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
                  {projectStatus === "failed" && (
                    <Button
                      onClick={handleRegenerate}
                      className="w-full"
                      variant="outline"
                    >
                      Regenerate Project
                    </Button>
                  )}
                </div>

                {/* Task details using the new component */}
                <ProjectTaskList tasks={projectTasks} />
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
