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
import { Loader2, Play, Download, Video, Sparkles, Zap } from "lucide-react";
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
  // const [videoCount, setVideoCount] = useState(1);

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
          videoCount: 1,
          status: "pending",
          progress: 0,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(t("video_generator.generation_error"));
      }

      const data = await response.json();
      setGenerationStatus({
        id: generationId,
        status: "pending",
        progress: 0,
        videos: data.videos || [],
      });

      // Начинаем опрос статуса
      pollGenerationStatus(generationId);
    } catch (error) {
      console.error("Error generating video:", error);
      setGenerationStatus({
        id: generationId,
        status: "error",
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      // Не разблокируем кнопку сразу; пусть останется заблокированной до завершения
    }
  };

  const pollGenerationStatus = async (generationId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/generate-model-video?generationId=${generationId}`
        );
        if (!response.ok) {
          throw new Error(t("video_generator.status_error"));
        }

        const data = await response.json();
        setGenerationStatus(data);

        const busy = data.status === "processing" || data.status === "pending";
        setIsGenerating(busy);

        if (busy) {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        console.error("Error polling status:", error);
        setGenerationStatus((prev) =>
          prev
            ? {
                ...prev,
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : null
        );
        setIsGenerating(false);
      }
    };

    setTimeout(poll, 1000);
  };

  const resetGeneration = () => {
    setGenerationStatus(null);
    setPrompt("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20 border border-purple-500/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-green-500/10 animate-pulse"></div>
        <div className="relative p-6 text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-green-500/20 border border-purple-500/30">
              <Video className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
            {t("video_generator.title")} {t("video_generator.with")} {modelName}
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {config.description}
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-purple-500/20 border-purple-500/30 text-purple-300"
            >
              <Zap className="w-3 h-3 mr-1" />
              {t("video_generator.duration")}: {config.maxDuration}
              {t("video_generator.seconds")}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-blue-500/20 border-blue-500/30 text-blue-300"
            >
              <Video className="w-3 h-3 mr-1" />
              {t("video_generator.aspect_ratio")}: {config.aspectRatio}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-green-500/20 border-green-500/30 text-green-300"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {t("video_generator.resolution")}: {config.width}x{config.height}
            </Badge>
          </div>
        </div>
      </div>

      {/* Баланс кредитов */}
      <CreditBalance
        showPurchaseButton={true}
        locale={locale}
      />

      {/* Форма генерации */}
      <Card className="card-enhanced border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-blue-950/30 to-green-950/30 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-purple-300 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            {t("video_generator.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">
              {t("video_generator.description")}
            </label>
            <Textarea
              placeholder={t("video_generator.placeholder")}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none input-enhanced border-purple-500/30 bg-purple-950/20 focus:border-purple-400 focus:ring-purple-400/20"
              disabled={isGenerating}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* <div className="flex items-center gap-3">
              <label
                htmlFor="videoCount"
                className="text-sm font-medium text-purple-300"
              >
                {t("video_generator.video_count")}:
              </label>
              <select
                id="videoCount"
                value={videoCount}
                onChange={(e) => setVideoCount(Number(e.target.value))}
                className="border border-purple-500/30 rounded-lg px-3 py-2 text-sm bg-purple-950/20 text-purple-300 focus:border-purple-400 focus:ring-purple-400/20"
                disabled={isGenerating}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div> */}

            <Button
              onClick={generateVideo}
              disabled={isGenerating || !prompt.trim()}
              className="btn-accent bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("video_generator.generating")}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {t("video_generator.generate")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Статус генерации */}
      {generationStatus && (
        <Card className="card-enhanced border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-purple-950/30 to-green-950/30 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-300 text-lg">
              {generationStatus.status === "processing" && (
                <div className="p-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {t("video_generator.status")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Прогресс */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-300">
                  {t("video_generator.progress")}
                </span>
                <span className="text-green-300 font-medium">
                  {generationStatus.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${generationStatus.progress}%` }}
                />
              </div>
            </div>

            {/* Статус */}
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  generationStatus.status === "completed"
                    ? "default"
                    : generationStatus.status === "error"
                      ? "destructive"
                      : "secondary"
                }
                className={
                  generationStatus.status === "completed"
                    ? "bg-green-500/20 border-green-500/30 text-green-300"
                    : generationStatus.status === "error"
                      ? "bg-red-500/20 border-red-500/30 text-red-300"
                      : "bg-blue-500/20 border-blue-500/30 text-blue-300"
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
                <span className="text-red-400 text-sm bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                  {generationStatus.error}
                </span>
              )}
            </div>

            {/* Видео результаты */}
            {generationStatus.videos && generationStatus.videos.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-green-300 flex items-center gap-2 text-sm">
                  <Video className="w-4 h-4" />
                  {t("video_generator.results")}:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generationStatus.videos.map((video, index) => (
                    <div
                      key={video.fileId}
                      className="border border-green-500/20 rounded-lg p-4 bg-gradient-to-br from-green-950/20 to-blue-950/20 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-green-300">
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
                          className={
                            video.status === "completed"
                              ? "bg-green-500/20 border-green-500/30 text-green-300"
                              : video.status === "error"
                                ? "bg-red-500/20 border-red-500/30 text-red-300"
                                : "bg-blue-500/20 border-blue-500/30 text-blue-300"
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
                        <div className="space-y-3">
                          {video.thumbnailUrl && (
                            <div className="relative overflow-hidden rounded-lg border border-green-500/20">
                              <img
                                src={video.thumbnailUrl}
                                alt={`Превью видео ${index + 1}`}
                                className="w-full h-32 object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => window.open(video.url, "_blank")}
                              className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs"
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
                              className="flex items-center gap-1 border-green-500/30 text-green-300 hover:bg-green-500/10 text-xs"
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
            <div className="flex gap-3 pt-2">
              {(generationStatus.status === "completed" ||
                generationStatus.status === "error") && (
                <Button
                  onClick={resetGeneration}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
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
