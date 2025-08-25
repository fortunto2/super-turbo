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
import Link from "next/link";
import { ProjectTaskList } from "@/components/project-task-list";

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

  // Отслеживание статуса проекта
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

          // Если проект завершен, показываем сообщение
          if (result.status === "completed") {
            // Можно добавить уведомление или автоматическое перенаправление
          } else if (result.status === "failed") {
            setError("Генерация видео не удалась");
          }
        } else {
          setError("Ошибка получения статуса проекта");
        }
      } catch (err) {
        console.error("Error checking project status:", err);
        setError("Ошибка проверки статуса");
      }
    };

    // Проверяем статус каждые 5 секунд
    const interval = setInterval(checkStatus, 5000);
    checkStatus(); // Первая проверка сразу

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

      // Здесь можно добавить логику для перегенерации конкретных задач
      // Пока что просто перезапускаем весь проект
      const response = await fetch("/api/story-editor/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_name: "story",
          config: {
            prompt: "Перегенерация проекта", // Можно добавить поле для промпта
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
        // Обновляем projectId если создался новый проект
        if (result.projectId !== projectId) {
          router.push(`/project/video/${result.projectId}/generate`);
        }
      } else {
        throw new Error(result.error || "Ошибка перегенерации");
      }
    } catch (err: any) {
      setError(err.message || "Ошибка перегенерации");
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            ID проекта не найден
          </h1>
          <button
            onClick={() => router.back()}
            className="text-primary hover:text-primary/80 underline"
          >
            Вернуться
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
                <span className="font-medium">Вернуться</span>
              </button>
              <h1 className="text-3xl font-bold text-foreground">
                Отслеживание генерации
              </h1>
              <p className="text-muted-foreground">ID проекта: {projectId}</p>
            </div>
          </div>

          {/* Project status */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-primary">Статус проекта</CardTitle>
              <CardDescription>
                Отслеживание прогресса генерации видео
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>ID проекта:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {projectId}
                  </code>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Прогресс:</span>
                    <span>
                      {completedTasks}/{totalTasks} шагов
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
                    {projectStatus === "completed" && "Видео готово!"}
                    {projectStatus === "failed" && "Ошибка генерации"}
                    {projectStatus === "processing" && "Видео генерируется..."}
                    {projectStatus === "pending" && "Ожидание начала..."}
                    {projectStatus === "unknown" && "Проверка статуса..."}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Статус обновляется автоматически каждые 5 секунд
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
                      Смотреть видео
                    </Button>
                  )}

                  {/* Regenerate button for failed projects */}
                  {projectStatus === "failed" && (
                    <Button
                      onClick={handleRegenerate}
                      className="w-full"
                      variant="outline"
                    >
                      Перегенерировать проект
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
              Powered by <strong>SuperDuperAI</strong> • Отслеживание генерации
              видео
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
