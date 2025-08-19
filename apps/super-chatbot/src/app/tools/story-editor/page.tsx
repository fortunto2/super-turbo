"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Textarea,
  Button,
  Label,
  Input,
} from "@turbo-super/ui";
import {
  FileText,
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GenerationConfig {
  id: string;
  name: string;
  type: string;
  source: string;
  params?: Record<string, any>;
}

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
    // Дополнительные поля для API
    dynamic?: number;
    image_model_type?: string;
    voiceover_volume?: number;
    music_volume?: number;
    sound_effect_volume?: number;
    watermark?: boolean;
    subtitles?: boolean;
    voiceover?: boolean;
  };
}

export default function StoryEditorPage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [generationConfig, setGenerationConfig] = useState("");
  const [seed, setSeed] = useState("42");
  const [quality, setQuality] = useState("sd");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [generationConfigs, setGenerationConfigs] = useState<
    GenerationConfig[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState<string>("unknown");
  const [projectProgress, setProjectProgress] = useState<number>(0);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [errorTasks, setErrorTasks] = useState<any[]>([]);

  // Загрузка конфигураций генерации
  useEffect(() => {
    const loadGenerationConfigs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/story-editor/configs");
        const result = await response.json();

        if (result.success) {
          setGenerationConfigs(result.configs);
          if (result.configs.length > 0) {
            setGenerationConfig(result.configs[0].name);
          }
        } else {
          setError("Ошибка загрузки конфигураций генерации");
        }
      } catch (err) {
        setError("Ошибка загрузки конфигураций генерации");
      } finally {
        setIsLoading(false);
      }
    };

    loadGenerationConfigs();
  }, []);

  // Отслеживание статуса проекта
  useEffect(() => {
    if (!projectId) return;

    const checkStatus = async () => {
      try {
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

          // Если проект завершен, обновляем UI
          if (result.status === "completed") {
            setSuccess("Видео успешно сгенерировано!");
          } else if (result.status === "failed") {
            setError("Генерация видео не удалась");
          }
        }
      } catch (err) {
        console.error("Error checking project status:", err);
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
      setIsGenerating(true);
      setError(null);

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
            prompt: prompt.trim(),
            aspect_ratio: aspectRatio,
            image_generation_config_name: generationConfig,
            auto_mode: true,
            seed: Math.floor(Math.random() * 1000000), // Новый seed
            quality: quality,
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
        setProjectId(result.projectId);
        setSuccess("Перегенерация запущена! ID проекта: " + result.projectId);
        setProjectStatus("pending");
        setProjectProgress(0);
        setProjectTasks([]);
        setCompletedTasks(0);
        setTotalTasks(0);
        setErrorTasks([]);
      } else {
        throw new Error(result.error || "Ошибка перегенерации");
      }
    } catch (err: any) {
      setError(err.message || "Ошибка перегенерации");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Введите промпт для генерации");
      return;
    }

    if (!generationConfig) {
      setError("Выберите конфигурацию генерации");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setSuccess(null);

      const payload: ProjectVideoCreate = {
        template_name: "story", // Можно сделать настраиваемым
        config: {
          prompt: prompt.trim(),
          aspect_ratio: aspectRatio,
          image_generation_config_name: generationConfig,
          auto_mode: true,
          seed: Number(seed),
          quality: quality,
          entity_ids: [],
          // Добавляем дополнительные поля для API
          dynamic: 1,
          voiceover_volume: 0.5,
          music_volume: 0.5,
          sound_effect_volume: 0.5,
          watermark: false,
          subtitles: false,
          voiceover: false,
        },
      };

      // Вызов API для генерации видео
      const response = await fetch("/api/story-editor/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setProjectId(result.projectId);
        setSuccess(`Видео генерируется! ID проекта: ${result.projectId}`);
      } else {
        throw new Error(result.error || "Ошибка генерации видео");
      }
    } catch (err: any) {
      setError(err.message || "Ошибка генерации видео");
    } finally {
      setIsGenerating(false);
    }
  };

  const aspectRatioOptions = [
    { value: "16:9", label: "16:9 (Landscape)" },
    { value: "9:16", label: "9:16 (Portrait)" },
    { value: "1:1", label: "1:1 (Square)" },
    { value: "4:3", label: "4:3 (Classic)" },
  ];

  const qualityOptions = [
    { value: "sd", label: "Standard (SD)" },
    { value: "hd", label: "HD" },
    { value: "4k", label: "4K (Full HD)" },
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-8 w-full max-w-4xl">
        <div className="w-full space-y-8">
          {/* Main content */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Story Editor
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Генерация профессиональных видео с использованием SuperDuperAI
              Project Video API
            </p>
          </div>

          {/* Generation form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="size-6 text-emerald-600" />
                <span>Генерация видео</span>
              </CardTitle>
              <CardDescription>
                Создайте видео, используя AI модели SuperDuperAI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Промпт для генерации</Label>
                <Textarea
                  id="prompt"
                  placeholder="Опишите видео, которое хотите создать..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Configuration options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aspect ratio */}
                <div className="space-y-2">
                  <Label htmlFor="aspect-ratio">Соотношение сторон</Label>
                  <Select
                    value={aspectRatio}
                    onValueChange={setAspectRatio}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatioOptions.map((option, index) => (
                        <SelectItem
                          key={index}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generation config */}
                <div className="space-y-2">
                  <Label htmlFor="generation-config">
                    Конфигурация генерации
                  </Label>
                  <Select
                    value={generationConfig}
                    onValueChange={setGenerationConfig}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generationConfigs.map((config, index) => (
                        <SelectItem
                          key={index}
                          value={config.name}
                        >
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seed */}
                <div className="space-y-2">
                  <Label htmlFor="seed">Seed</Label>
                  <Input
                    id="seed"
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="42"
                  />
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <Label htmlFor="quality">Качество</Label>
                  <Select
                    value={quality}
                    onValueChange={setQuality}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qualityOptions.map((option, index) => (
                        <SelectItem
                          key={index}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Error/Success messages */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="size-5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="size-5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Play className="size-4 mr-2" />
                    Сгенерировать видео
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Project status */}
          {projectId && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-emerald-600">
                  Статус проекта
                </CardTitle>
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
                      <Loader2 className="size-4 text-yellow-600" />
                    )}
                    <span className="capitalize">
                      {projectStatus === "completed" && "Видео готово!"}
                      {projectStatus === "failed" && "Ошибка генерации"}
                      {projectStatus === "processing" &&
                        "Видео генерируется..."}
                      {projectStatus === "pending" && "Ожидание начала..."}
                      {projectStatus === "unknown" && "Проверка статуса..."}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Статус обновляется автоматически каждые 5 секунд
                  </p>

                  {/* Regenerate button for failed projects */}
                  {projectStatus === "failed" && (
                    <div className="mt-4">
                      <Button
                        onClick={handleRegenerate}
                        disabled={isGenerating}
                        className="w-full"
                        variant="outline"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Перегенерация...
                          </>
                        ) : (
                          "Перегенерировать проект"
                        )}
                      </Button>
                    </div>
                  )}

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
                                  {task.status === "in_progress" &&
                                    "В процессе"}
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
          )}

          {/* Footer info */}
          <div className="text-center text-sm text-muted-foreground border-t pt-8 mt-12">
            <p>
              Powered by <strong>SuperDuperAI</strong> • Project Video API для
              генерации профессиональных видео
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
