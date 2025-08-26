"use client";

import { Locale } from "@/config/i18n-config";
import { ModelVideoGenerator } from "./model-video-generator";
import { EnhancedModelVideoGenerator } from "./enhanced-model-video-generator";
import { ModelImageGenerator } from "./model-image-generator";
import { getModelType, supportsImageToVideo } from "@/lib/models-config";

interface UniversalModelGeneratorProps {
  modelName: string;
  locale?: Locale;
  modelConfig?: Record<string, unknown>;
}

/**
 * Универсальный генератор моделей
 * Автоматически определяет тип модели по названию и рендерит соответствующий компонент
 */
export function BlogModelGenerator({
  modelName,
  locale = "en",
  modelConfig,
}: UniversalModelGeneratorProps) {
  const modelType = getModelType(modelName);
  const supportsImageToVideoMode = supportsImageToVideo(modelName);

  switch (modelType) {
    case "video":
      // Для видео моделей используем EnhancedModelVideoGenerator если поддерживают image-to-video
      if (supportsImageToVideoMode) {
        return (
          <EnhancedModelVideoGenerator
            modelName={modelName}
            modelConfig={modelConfig}
            locale={locale}
          />
        );
      } else {
        return (
          <ModelVideoGenerator
            modelName={modelName}
            locale={locale}
            modelConfig={modelConfig}
          />
        );
      }

    case "image":
    default:
      return (
        <ModelImageGenerator
          modelName={modelName}
          locale={locale}
          modelConfig={modelConfig}
        />
      );
  }
}
