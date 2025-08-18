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
import { Image, Sparkles, Palette } from "lucide-react";
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

  const handleGenerateClick = () => {
    // Перенаправляем на страницу генерации
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const generationUrl = `${baseUrl}/${locale}/generate-image?model=${encodeURIComponent(modelName)}`;
    window.location.href = generationUrl;
  };

  return (
    <div
      className="space-y-6"
      data-testid="image-generator"
    >
      {/* Информация о модели */}
      <div className="bg-gradient-to-br from-blue-950/40 to-purple-950/40 border border-blue-500/20 rounded-lg p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-300 mb-2 flex items-center gap-2">
              <Image className="w-5 h-5" />
              {modelName}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {modelConfig?.description ||
                t(
                  `model_descriptions.${modelName
                    .toLowerCase()
                    .replace(/\s+/g, "_")
                    .replace(/\./g, "")}`
                ) ||
                `Create images with ${modelName}`}
            </p>
            <div className="flex flex-wrap gap-2">
              {modelConfig?.width && modelConfig?.height && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 border-blue-500/30 text-blue-300"
                >
                  {modelConfig.width}x{modelConfig.height}
                </Badge>
              )}
              {modelConfig?.aspectRatio && (
                <Badge
                  variant="secondary"
                  className="bg-purple-500/20 border-purple-500/30 text-purple-300"
                >
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
      </div>

      {/* Кнопка для начала процесса */}
      <Card className="card-enhanced border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-purple-950/30 to-green-950/30 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-blue-300 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            {t("image_generator.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {t("image_generator.payment_description") ||
              "Pay $1.00 to generate images with this model"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGenerateClick}
            data-testid="generate-image-button"
            className="w-full btn-accent bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            <Image className="w-4 h-4 mr-2" />
            {t("image_generator.generate_for").replace("{price}", "$1.00") ||
              "Generate for $1.00"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
