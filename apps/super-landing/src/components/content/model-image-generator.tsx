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
import { Loader2, Image, Download, Sparkles, Palette, Zap } from "lucide-react";
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
  const [status, setStatus] = useState("");
  const [imageCount, setImageCount] = useState(1);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const generateImage = async () => {
    if (!prompt.trim()) {
      alert(t("image_generator.error"));
      return;
    }

    setIsGenerating(true);
    setStatus(t("image_generator.starting"));
    setGeneratedImages([]);

    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const response = await fetch("/api/generate-model-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generationId,
          prompt: prompt.trim(),
          modelName,
          modelConfig,
          imageCount,
          status: "pending",
          progress: 0,
          createdAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Специальная обработка ошибок баланса
        if (response.status === 402) {
          const errorMessage =
            data.error === "Insufficient balance"
              ? t("image_generator.insufficient_balance", {
                  required: data.balanceRequired || 0,
                  fallback: `Недостаточно кредитов. Требуется: ${data.balanceRequired || 0} кредитов. Пожалуйста, пополните баланс.`,
                })
              : data.message ||
                t("image_generator.insufficient_balance_fallback", {
                  fallback:
                    "Недостаточно кредитов для генерации изображений. Пожалуйста, пополните баланс.",
                });

          alert(errorMessage);
          throw new Error(errorMessage);
        }

        throw new Error(data.message || t("image_generator.generation_error"));
      }

      setStatus(t("image_generator.tracking"));

      // Начинаем опрос статуса
      pollGenerationStatus(generationId);
    } catch (error) {
      console.error("Error generating image:", error);
      setStatus(t("image_generator.generation_error_msg"));
    }
  };

  const pollGenerationStatus = async (genId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/generate-model-image?generationId=${genId}`
        );
        if (!response.ok) {
          throw new Error(t("image_generator.status_check_error"));
        }

        const data = await response.json();
        setStatus(data.status);

        if (data.status === "completed" && data.images) {
          const urls = (data.images || [])
            .map((img: any) => img?.url)
            .filter((u: any) => typeof u === "string" && u.length > 0);
          setGeneratedImages(urls);
          setIsGenerating(false);
        } else if (data.status === "processing" || data.status === "pending") {
          setTimeout(poll, 2000);
        } else if (data.status === "error") {
          setStatus(data.error || t("image_generator.generation_error_msg"));
          setIsGenerating(false);
        }
      } catch (error) {
        console.error("Error polling status:", error);
        setStatus(t("image_generator.status_check_error"));
        setIsGenerating(false);
      }
    };

    setTimeout(poll, 1000);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-green-900/20 border border-blue-500/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-green-500/10 animate-pulse"></div>
        <div className="relative p-6 text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-blue-500/30">
              <Image className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            {t("image_generator.title")} {t("image_generator.with")} {modelName}
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {modelConfig?.description ||
              t(
                `model_descriptions.${modelName
                  .toLowerCase()
                  .replace(/\s+/g, "_")
                  .replace(/\./g, "")}`
              ) ||
              `Создавайте изображения с помощью ${modelName}`}
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {modelConfig?.width && modelConfig?.height && (
              <Badge
                variant="secondary"
                className="bg-blue-500/20 border-blue-500/30 text-blue-300"
              >
                <Zap className="w-3 h-3 mr-1" />
                {modelConfig.width}×{modelConfig.height}
              </Badge>
            )}
            {modelConfig?.aspectRatio && (
              <Badge
                variant="secondary"
                className="bg-purple-500/20 border-purple-500/30 text-purple-300"
              >
                <Image className="w-3 h-3 mr-1" />
                {modelConfig.aspectRatio}
              </Badge>
            )}
            {modelConfig?.style && (
              <Badge
                variant="secondary"
                className="bg-green-500/20 border-green-500/30 text-green-300"
              >
                <Palette className="w-3 h-3 mr-1" />
                {modelConfig.style}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Баланс кредитов */}
      <CreditBalance locale={locale} />

      {/* Форма генерации */}
      <Card className="card-enhanced border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-purple-950/30 to-green-950/30 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-blue-300 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            {t("image_generator.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {modelConfig?.description ||
              t(
                `model_descriptions.${modelName
                  .toLowerCase()
                  .replace(/\s+/g, "_")
                  .replace(/\./g, "")}`
              ) ||
              `Создавайте изображения с помощью ${modelName}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Поле ввода */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-300">
              {t("image_generator.image_description")}
            </label>
            <Textarea
              placeholder={t("image_generator.image_placeholder")}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="input-enhanced border-blue-500/30 bg-blue-950/20 focus:border-blue-400 focus:ring-blue-400/20"
              disabled={isGenerating}
            />
          </div>

          {/* Количество изображений — временно отключено */}
          {false && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-300">
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
                    className={
                      imageCount === count
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        : "border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                    }
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Кнопка генерации */}
          <Button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="w-full btn-accent bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
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
              </>
            )}
          </Button>

          {/* Статус и прогресс */}
          {isGenerating && (
            <div className="space-y-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-blue-300 text-sm">{status}</span>
              </div>
            </div>
          )}

          {/* Результаты */}
          {generatedImages.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-green-300 flex items-center gap-2 text-sm">
                <Image className="w-4 h-4" />
                {t("image_generator.created_images")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="border border-green-500/20 rounded-lg p-3 bg-gradient-to-br from-green-950/20 to-blue-950/20 backdrop-blur-sm"
                  >
                    <div className="relative overflow-hidden rounded-lg border border-green-500/20 mb-3">
                      <img
                        src={imageUrl}
                        alt={`${t("image_generator.generated_image")} ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(imageUrl, "_blank")}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs"
                      >
                        <Image className="w-3 h-3 mr-1" />
                        {t("image_generator.watch")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadImage(imageUrl, index)}
                        className="border-green-500/30 text-green-300 hover:bg-green-500/10 text-xs"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
