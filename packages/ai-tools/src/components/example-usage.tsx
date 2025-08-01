"use client";

import React from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import {
  useImageGenerator,
  useVideoGenerator,
  usePromptEnhancer,
} from "../hooks";
import {
  ImageGenerationParams,
  VideoGenerationParams,
  PromptEnhancementParams,
} from "../types";

export const ExampleUsage: React.FC = () => {
  // Пример использования хука для генерации изображений
  const imageGenerator = useImageGenerator({
    onGenerate: async (params: ImageGenerationParams) => {
      // Здесь будет ваша логика генерации изображений
      console.log("Generating image with params:", params);

      // Имитация API вызова
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        id: Date.now().toString(),
        url: "https://example.com/generated-image.jpg",
        prompt: params.prompt,
        model: params.model || "default",
        createdAt: new Date().toISOString(),
      };
    },
    onSuccess: (image) => {
      console.log("Image generated successfully:", image);
    },
    onError: (error) => {
      console.error("Image generation failed:", error);
    },
  });

  // Пример использования хука для генерации видео
  const videoGenerator = useVideoGenerator({
    onGenerate: async (params: VideoGenerationParams) => {
      console.log("Generating video with params:", params);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      return {
        id: Date.now().toString(),
        url: "https://example.com/generated-video.mp4",
        prompt: params.prompt,
        model: params.model || "default",
        createdAt: new Date().toISOString(),
        duration: 10,
      };
    },
  });

  // Пример использования хука для улучшения промптов
  const promptEnhancer = usePromptEnhancer({
    onEnhance: async (params: PromptEnhancementParams) => {
      console.log("Enhancing prompt:", params);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return `Enhanced: ${params.originalPrompt} with ${params.enhancementLevel || "detailed"} level`;
    },
  });

  const handleImageGeneration = () => {
    imageGenerator.generateImage({
      prompt: "A beautiful sunset over mountains",
      model: "flux-pro",
      style: "photographic",
      resolution: "1024x1024",
      shotSize: "wide_shot",
    });
  };

  const handleVideoGeneration = () => {
    videoGenerator.generateVideo({
      prompt: "A cat playing in the garden",
      model: "veo3",
      duration: 10,
      frameRate: 30,
      generationType: "text-to-video",
    });
  };

  const handlePromptEnhancement = () => {
    promptEnhancer.enhancePrompt({
      originalPrompt: "A cat",
      enhancementLevel: "detailed",
      mediaType: "image",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Пример использования AI Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleImageGeneration}
              disabled={imageGenerator.isGenerating}
            >
              {imageGenerator.isGenerating
                ? "Генерируем..."
                : "Генерировать изображение"}
            </Button>

            <Button
              onClick={handleVideoGeneration}
              disabled={videoGenerator.isGenerating}
            >
              {videoGenerator.isGenerating
                ? "Генерируем..."
                : "Генерировать видео"}
            </Button>

            <Button
              onClick={handlePromptEnhancement}
              disabled={promptEnhancer.isEnhancing}
            >
              {promptEnhancer.isEnhancing ? "Улучшаем..." : "Улучшить промпт"}
            </Button>
          </div>

          {/* Результаты */}
          <div className="space-y-4">
            {imageGenerator.generatedImages.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">
                  Сгенерированные изображения:
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {imageGenerator.generatedImages.slice(0, 4).map((image) => (
                    <div
                      key={image.id}
                      className="border rounded p-2"
                    >
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-20 object-cover"
                      />
                      <p className="text-xs mt-1">{image.prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videoGenerator.generatedVideos.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Сгенерированные видео:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {videoGenerator.generatedVideos.slice(0, 2).map((video) => (
                    <div
                      key={video.id}
                      className="border rounded p-2"
                    >
                      <video
                        src={video.url}
                        className="w-full h-20 object-cover"
                        controls
                      />
                      <p className="text-xs mt-1">{video.prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {promptEnhancer.currentEnhanced && (
              <div>
                <h3 className="font-semibold mb-2">Улучшенный промпт:</h3>
                <div className="border rounded p-3 bg-gray-50">
                  <p className="text-sm">{promptEnhancer.currentEnhanced}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
