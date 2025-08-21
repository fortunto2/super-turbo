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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            ID проекта не найден
          </h1>
          <Link
            href="/tools/story-editor"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Вернуться к Story Editor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-8 w-full max-w-4xl">
        <div className="w-full space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Link
                href="/tools/story-editor"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к Story Editor
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Отслеживание генерации
              </h1>
              <p className="text-gray-600">ID проекта: {projectId}</p>
            </div>
          </div>

          {/* Project status */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-emerald-600">Статус проекта</CardTitle>
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
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
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
                    <Loader2 className="size-4 animate-spin text-emerald-600" />
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
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
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

                {/* Task details */}
                {projectTasks.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium text-sm">Детали задач:</h4>
                    <div className="space-y-2">
                      {projectTasks.map((task: any, index: number) => {
                        // Определяем понятное название для типа задачи
                        const getTaskTypeName = (type: string) => {
                          switch (type) {
                            case "txt2script_flow":
                              return "Генерация сценария";
                            case "script2entities_flow":
                              return "Извлечение сущностей";
                            case "script2storyboard_flow":
                              return "Создание раскадровки";
                            default:
                              return (
                                type?.replace(/_/g, " ").toLowerCase() ||
                                `Задача ${index + 1}`
                              );
                          }
                        };

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="capitalize">
                              {getTaskTypeName(task.type)}
                            </span>
                            <div className="flex items-center space-x-2">
                              {task.status === "completed" ? (
                                <CheckCircle className="size-3 text-green-600" />
                              ) : task.status === "error" ? (
                                <AlertCircle className="size-3 text-red-600" />
                              ) : task.status === "in_progress" ? (
                                <Loader2 className="size-3 animate-spin text-emerald-600" />
                              ) : (
                                <div className="size-3 rounded-full bg-gray-300" />
                              )}
                              <span className="text-xs capitalize">
                                {task.status === "completed" && "Завершено"}
                                {task.status === "error" && "Ошибка"}
                                {task.status === "in_progress" && "В процессе"}
                                {task.status === "pending" && "Ожидание"}
                                {!task.status && "Неизвестно"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
