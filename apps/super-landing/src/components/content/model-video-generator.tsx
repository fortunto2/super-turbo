"use client";

import { Button } from "@turbo-super/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import { Video, Sparkles, Zap } from "lucide-react";
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

export function ModelVideoGenerator({
  modelName,
  modelConfig,
  locale = "tr",
}: ModelVideoGeneratorProps) {
  const { t } = useTranslation(locale);

  const defaultConfig = {
    maxDuration: 8,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
    description:
      t(
        `model_descriptions.${modelName.toLowerCase().replace(/\s+/g, "_").replace(/\./g, "")}`
      ) || `Video generation with ${modelName}`,
  };

  const config = { ...defaultConfig, ...modelConfig };

  const handleGenerateClick = () => {
    // Перенаправляем на страницу генерации
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const generationUrl = `${baseUrl}/${locale}/generate-video?model=${encodeURIComponent(modelName)}`;
    window.location.href = generationUrl;
  };

  return (
    <div
      className="space-y-6"
      data-testid="video-generator"
    >
      {/* Информация о модели */}
      <div className="bg-gradient-to-br from-green-950/40 to-blue-950/40 border border-green-500/20 rounded-lg p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-green-300 mb-2 flex items-center gap-2">
              <Video className="w-5 h-5" />
              {modelName}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {config.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {config.width && config.height && (
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 border-green-500/30 text-green-300"
                >
                  {config.width}x{config.height}
                </Badge>
              )}
              {config.aspectRatio && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 border-blue-500/30 text-blue-300"
                >
                  {config.aspectRatio}
                </Badge>
              )}
              {config.maxDuration && (
                <Badge
                  variant="secondary"
                  className="bg-purple-500/20 border-purple-500/30 text-purple-300"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {config.maxDuration}s
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка для начала процесса */}
      <Card className="card-enhanced border-green-500/20 bg-gradient-to-br from-green-950/30 via-blue-950/30 to-purple-950/30 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-green-300 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            {t("video_generator.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {t("video_generator.payment_description") ||
              "Pay $1.00 to generate videos with this model"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGenerateClick}
            data-testid="generate-video-button"
            className="w-full btn-accent bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-green-500/25"
          >
            <Video className="w-4 h-4 mr-2" />
            {t("video_generator.generate_for").replace("{price}", "$1.00") ||
              "Generate for $1.00"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
