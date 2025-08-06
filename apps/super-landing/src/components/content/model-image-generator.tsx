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
import { Loader2, Image, Download } from "lucide-react";
import { CreditBalance } from "@/components/ui/credit-balance";
import { useTranslation } from "@/hooks/use-translation";
import { Locale } from "@/config/i18n-config";

interface ModelImageGeneratorProps {
  modelName: string;
  modelConfig?: {
    width?: number;
    height?: number;
    aspectRatio?: string;
    style?: string;
    shotSize?: string;
    description?: string;
  };
  locale?: Locale;
}

export function ModelImageGenerator({
  modelName,
  modelConfig,
  locale = "tr",
}: ModelImageGeneratorProps) {
  const { t } = useTranslation(locale);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [images, setImages] = useState<
    Array<{ url: string; thumbnailUrl?: string }>
  >([]);
  const [error, setError] = useState<string>("");
  const [imageCount, setImageCount] = useState(1);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError(t("image_generator.error"));
      return;
    }

    setIsGenerating(true);
    setError("");
    setProgress(0);
    setStatus(t("image_generator.starting"));
    setImages([]);

    const newGenerationId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setGenerationId(newGenerationId);

    try {
      const response = await fetch("/api/generate-model-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: newGenerationId,
          prompt: prompt.trim(),
          modelName,
          modelConfig,
          imageCount,
          status: "pending",
          progress: 0,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || t("image_generator.generation_error")
        );
      }

      const data = await response.json();
      setStatus(t("image_generator.tracking"));
      pollGenerationStatus(newGenerationId);
    } catch (err) {
      console.error("Ошибка генерации:", err);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setIsGenerating(false);
      setStatus("");
    }
  };

  const pollGenerationStatus = async (genId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/generate-model-image?generationId=${genId}`
        );
        if (!response.ok) {
          throw new Error(t("image_generator.status_error"));
        }

        const data = await response.json();
        setProgress(data.progress || 0);
        setStatus(data.status || t("image_generator.processing"));

        if (data.images && data.images.length > 0) {
          const completedImages = data.images
            .filter((img: any) => img.status === "completed" && img.url)
            .map((img: any) => ({
              url: img.url,
              thumbnailUrl: img.thumbnailUrl,
            }));

          setImages(completedImages);
        }

        if (data.status === "completed") {
          setIsGenerating(false);
          setStatus(t("image_generator.generation_complete"));
          return;
        }

        if (data.status === "error") {
          setIsGenerating(false);
          setError(data.error || t("image_generator.generation_error_msg"));
          setStatus("");
          return;
        }

        // Продолжаем опрос
        setTimeout(poll, 2000);
      } catch (err) {
        console.error("Ошибка при проверке статуса:", err);
        setIsGenerating(false);
        setError(t("image_generator.status_check_error"));
        setStatus("");
      }
    };

    poll();
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${modelName.toLowerCase().replace(/\s+/g, "-")}-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          {t("image_generator.title")} {t("image_generator.with")} {modelName}
        </CardTitle>
        <CardDescription>
          {modelConfig?.description ||
            t(
              `model_descriptions.${modelName.toLowerCase().replace(/\s+/g, "_").replace(/\./g, "")}`
            ) ||
            `Создавайте изображения с помощью ${modelName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Информация о модели */}
        <div className="flex flex-wrap gap-2">
          {modelConfig?.width && modelConfig?.height && (
            <Badge variant="secondary">
              {modelConfig.width}×{modelConfig.height}
            </Badge>
          )}
          {modelConfig?.aspectRatio && (
            <Badge variant="secondary">{modelConfig.aspectRatio}</Badge>
          )}
          {modelConfig?.style && (
            <Badge variant="secondary">{modelConfig.style}</Badge>
          )}
        </div>

        {/* Баланс кредитов */}
        <CreditBalance locale={locale} />

        {/* Поле ввода */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("image_generator.image_description")}
          </label>
          <Textarea
            placeholder={t("image_generator.image_placeholder")}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={isGenerating}
          />
        </div>

        {/* Количество изображений */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("image_generator.image_count")}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map((count) => (
              <Button
                key={count}
                variant={imageCount === count ? "default" : "outline"}
                size="sm"
                onClick={() => setImageCount(count)}
                disabled={isGenerating}
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        {/* Кнопка генерации */}
        <Button
          onClick={generateImage}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("image_generator.generating")}
            </>
          ) : (
            <>
              <Image className="w-4 h-4 mr-2" />
              {t("image_generator.generate")}
              {imageCount > 1 ? ` (${imageCount})` : ""}
            </>
          )}
        </Button>

        {/* Статус и прогресс */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{status}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Результаты */}
        {images.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">
              {t("image_generator.created_images")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="space-y-2"
                >
                  <img
                    src={image.url}
                    alt={`${t("image_generator.generated_image")} ${index + 1}`}
                    className="w-full h-48 object-cover rounded-md border"
                  />
                  <Button
                    onClick={() => downloadImage(image.url, index)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t("image_generator.download")}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
