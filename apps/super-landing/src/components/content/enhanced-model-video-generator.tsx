"use client";

import { useState, useRef } from "react";
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
import {
  Loader2,
  Play,
  Download,
  Video,
  Sparkles,
  Zap,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { CreditBalance } from "@/components/ui/credit-balance";
import { useTranslation } from "@/hooks/use-translation";
import { Locale } from "@/config/i18n-config";

interface EnhancedModelVideoGeneratorProps {
  modelName: string;
  modelConfig?: {
    maxDuration?: number;
    aspectRatio?: string;
    width?: number;
    height?: number;
    frameRate?: number;
    description?: string;
    supportsImageToVideo?: boolean;
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

export function EnhancedModelVideoGenerator({
  modelName,
  modelConfig,
  locale = "tr",
}: EnhancedModelVideoGeneratorProps) {
  const { t } = useTranslation(locale);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus | null>(null);
  const [generationType, setGenerationType] = useState<
    "text-to-video" | "image-to-video"
  >("text-to-video");
  const [_selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultConfig = {
    maxDuration: 8,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
    supportsImageToVideo: false,
    description:
      t(
        `model_descriptions.${modelName.toLowerCase().replace(/\s+/g, "_").replace(/\./g, "")}`
      ) || `Генерация видео с моделью ${modelName}`,
  };

  const config = { ...defaultConfig, ...modelConfig };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Создаем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedImage(file);
    // Сохраняем файл для передачи на сервер
    setUploadedImageUrl(file as unknown as string); // Временно используем это поле для хранения файла
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateVideo = async () => {
    if (!prompt.trim()) {
      alert(t("video_generator.error"));
      return;
    }

    if (generationType === "image-to-video" && !uploadedImageUrl) {
      alert(t("video_generator.upload_image_required"));
      return;
    }

    setIsGenerating(true);
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Создаем FormData для передачи файла
      const formData = new FormData();
      formData.append("generationId", generationId);
      formData.append("prompt", prompt.trim());
      formData.append("modelName", modelName);
      formData.append("modelConfig", JSON.stringify(config));
      formData.append("videoCount", "1");
      formData.append("status", "pending");
      formData.append("progress", "0");
      formData.append("createdAt", new Date().toISOString());
      formData.append("generationType", generationType);

      // Добавляем файл если это image-to-video
      if (generationType === "image-to-video" && uploadedImageUrl) {
        console.log("📁 Adding file to FormData");
        formData.append("imageFile", uploadedImageUrl as unknown as File);
      }

      console.log("📤 FormData contents:", {
        generationId: formData.get("generationId"),
        prompt: formData.get("prompt"),
        modelName: formData.get("modelName"),
        generationType: formData.get("generationType"),
        hasImageFile: formData.has("imageFile"),
      });

      // Создаем запрос на генерацию
      const response = await fetch("/api/generate-model-video", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Специальная обработка ошибок баланса
        if (response.status === 402) {
          const errorMessage = data.error === "Insufficient balance" 
            ? t("video_generator.insufficient_balance", { 
                required: data.balanceRequired || 0,
                fallback: `Недостаточно кредитов. Требуется: ${data.balanceRequired || 0} кредитов. Пожалуйста, пополните баланс.`
              })
            : data.message || t("video_generator.insufficient_balance_fallback", { 
                fallback: "Недостаточно кредитов для генерации видео. Пожалуйста, пополните баланс."
              });
          
          alert(errorMessage);
          throw new Error(errorMessage);
        }
        
        throw new Error(data.message || t("video_generator.generation_error"));
      }
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
      setIsGenerating(false);
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

        if (data.status === "processing" || data.status === "pending") {
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
      }
    };

    setTimeout(poll, 1000);
  };

  const resetGeneration = () => {
    setGenerationStatus(null);
    setPrompt("");
    removeImage();
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
            {config.supportsImageToVideo && (
              <Badge
                variant="secondary"
                className="bg-orange-500/20 border-orange-500/30 text-orange-300"
              >
                <ImageIcon className="w-3 h-3 mr-1" />
                Image-to-Video
              </Badge>
            )}
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
          {/* Выбор типа генерации */}
          {config.supportsImageToVideo && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-300">
                {t("video_generator.generation_type")}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={
                    generationType === "text-to-video" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setGenerationType("text-to-video")}
                  className={
                    generationType === "text-to-video"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  }
                >
                  <Video className="w-4 h-4 mr-1" />
                  Text-to-Video
                </Button>
                <Button
                  variant={
                    generationType === "image-to-video" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setGenerationType("image-to-video")}
                  className={
                    generationType === "image-to-video"
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                  }
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Image-to-Video
                </Button>
              </div>
            </div>
          )}

          {/* Загрузка изображения для image-to-video */}
          {generationType === "image-to-video" &&
            config.supportsImageToVideo && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-orange-300">
                  {t("video_generator.upload_image")}
                </label>
                <div className="border-2 border-dashed border-orange-500/30 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-green-300">
                        {t("video_generator.image_uploaded")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-orange-400" />
                      <p className="text-sm text-muted-foreground">
                        {t("video_generator.click_to_select")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        {t("video_generator.select_file")}
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            )}

          {/* Промпт */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-300">
              {generationType === "image-to-video"
                ? t("video_generator.describe_animation")
                : t("video_generator.description")}
            </label>
            <Textarea
              placeholder={
                generationType === "image-to-video"
                  ? t("video_generator.animation_placeholder")
                  : t("video_generator.placeholder")
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none input-enhanced border-purple-500/30 bg-purple-950/20 focus:border-purple-400 focus:ring-purple-400/20"
              disabled={isGenerating}
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={generateVideo}
              disabled={
                isGenerating ||
                !prompt.trim() ||
                (generationType === "image-to-video" && !uploadedImageUrl)
              }
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
