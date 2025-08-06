"use client";

import { useState } from "react";
import { Button } from "@turbo-super/ui";
import { Textarea } from "@turbo-super/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import { Loader2, Play, Download } from "lucide-react";
import { CreditBalance } from "@/components/ui/credit-balance";
import { useTranslation } from "@/hooks/use-translation";
import { Locale } from "@/config/i18n-config";

interface ModelVideoGeneratorProps {
  modelName: string;
  modelConfig?: {
    maxDuration?: number;
    aspectRatio?: string;
    width?: number;
    height?: number;
    frameRate?: number;
    description?: string;
  };
  locale?: Locale;
}

interface GenerationStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  videos?: Array<{
    fileId: string;
    url?: string;
    thumbnailUrl?: string;
    status: "pending" | "processing" | "completed" | "error";
  }>;
  error?: string;
}

export function ModelVideoGenerator({
  modelName,
  modelConfig,
  locale = "tr",
}: ModelVideoGeneratorProps) {
  const { t } = useTranslation(locale);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus | null>(null);
  const [videoCount, setVideoCount] = useState(1);

  const defaultConfig = {
    maxDuration: 8,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
    description:
      t(
        `model_descriptions.${modelName.toLowerCase().replace(/\s+/g, "_").replace(/\./g, "")}`
      ) || `Генерация видео с моделью ${modelName}`,
  };

  const config = { ...defaultConfig, ...modelConfig };

  const generateVideo = async () => {
    if (!prompt.trim()) {
      alert(t("video_generator.error"));
      return;
    }

    setIsGenerating(true);
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Создаем запрос на генерацию
      const response = await fetch("/api/generate-model-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generationId,
          prompt: prompt.trim(),
          modelName,
          modelConfig: config,
          videoCount,
          status: "pending",
          progress: 0,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(t("video_generator.generation_error"));
      }

      const result = await response.json();

      if (result.success) {
        setGenerationStatus({
          id: generationId,
          status: "processing",
          progress: 0,
          videos:
            result.fileIds?.map((fileId: string) => ({
              fileId,
              status: "processing" as const,
            })) || [],
        });

        // Начинаем отслеживание статуса
        pollGenerationStatus(generationId);
      } else {
        throw new Error(result.error || "Неизвестная ошибка");
      }
    } catch (error) {
      console.error("Ошибка генерации:", error);
      setGenerationStatus({
        id: generationId,
        status: "error",
        progress: 0,
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const pollGenerationStatus = async (generationId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/generate-model-video?generationId=${generationId}`
        );
        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            setGenerationStatus({
              id: data.generationId,
              status: data.status,
              progress: data.progress,
              videos: data.videos,
              error: data.error,
            });

            // Продолжаем опрос, если генерация еще не завершена
            if (data.status === "processing") {
              setTimeout(poll, 3000); // Опрашиваем каждые 3 секунды
            }
          }
        }
      } catch (error) {
        console.error("Ошибка при проверке статуса:", error);
      }
    };

    // Начинаем опрос через 2 секунды
    setTimeout(poll, 2000);
  };

  const resetGeneration = () => {
    setGenerationStatus(null);
    setPrompt("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Заголовок и описание */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          {t("video_generator.title")} {t("video_generator.with")} {modelName}
        </h2>
        <p className="text-muted-foreground">{config.description}</p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">
            {t("video_generator.duration")}: {config.maxDuration}
            {t("video_generator.seconds")}
          </Badge>
          <Badge variant="secondary">
            {t("video_generator.aspect_ratio")}: {config.aspectRatio}
          </Badge>
          <Badge variant="secondary">
            {t("video_generator.resolution")}: {config.width}x{config.height}
          </Badge>
        </div>
      </div>

      {/* Баланс кредитов */}
      <div className="flex justify-center">
        <CreditBalance
          showPurchaseButton={true}
          locale={locale}
        />
      </div>

      {/* Форма генерации */}
      <Card>
        <CardHeader>
          <CardTitle>{t("video_generator.title")}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={t("video_generator.placeholder")}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
            disabled={isGenerating}
          />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="videoCount"
                className="text-sm font-medium"
              >
                {t("video_generator.video_count")}:
              </label>
              <select
                id="videoCount"
                value={videoCount}
                onChange={(e) => setVideoCount(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
                disabled={isGenerating}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>

            <Button
              onClick={generateVideo}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("video_generator.generating")}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {t("video_generator.generate")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Статус генерации */}
      {generationStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {generationStatus.status === "processing" && (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
              {t("video_generator.status")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Прогресс */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("video_generator.progress")}</span>
                <span>{generationStatus.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationStatus.progress}%` }}
                />
              </div>
            </div>

            {/* Статус */}
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  generationStatus.status === "completed"
                    ? "default"
                    : generationStatus.status === "error"
                      ? "destructive"
                      : "secondary"
                }
              >
                {generationStatus.status === "completed"
                  ? t("video_generator.completed")
                  : generationStatus.status === "error"
                    ? t("video_generator.error_status")
                    : generationStatus.status === "processing"
                      ? t("video_generator.processing")
                      : t("video_generator.pending")}
              </Badge>
              {generationStatus.error && (
                <span className="text-red-500 text-sm">
                  {generationStatus.error}
                </span>
              )}
            </div>

            {/* Видео результаты */}
            {generationStatus.videos && generationStatus.videos.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">{t("video_generator.results")}:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generationStatus.videos.map((video, index) => (
                    <div
                      key={video.fileId}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {t("video_generator.video")} {index + 1}
                        </span>
                        <Badge
                          variant={
                            video.status === "completed"
                              ? "default"
                              : video.status === "error"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {video.status === "completed"
                            ? t("video_generator.ready")
                            : video.status === "error"
                              ? t("video_generator.error_status")
                              : t("video_generator.processing")}
                        </Badge>
                      </div>

                      {video.status === "completed" && video.url && (
                        <div className="space-y-2">
                          {video.thumbnailUrl && (
                            <img
                              src={video.thumbnailUrl}
                              alt={`Превью видео ${index + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => window.open(video.url, "_blank")}
                              className="flex items-center gap-1"
                            >
                              <Play className="h-3 w-3" />
                              {t("video_generator.watch")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = video.url!;
                                link.download = `video_${index + 1}.mp4`;
                                link.click();
                              }}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              {t("video_generator.download")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Кнопки действий */}
            <div className="flex gap-2">
              {(generationStatus.status === "completed" ||
                generationStatus.status === "error") && (
                <Button
                  onClick={resetGeneration}
                  variant="outline"
                >
                  {t("video_generator.create_new")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
