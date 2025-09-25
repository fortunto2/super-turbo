import { tool } from "ai";
import { z } from "zod";
import {
  createVeo3Video,
  getVeo3VideoStatus,
  generateVeo3Ideas,
} from "@/lib/ai/veo3-api";

export const createVeo3VideoTool = tool({
  description: "Создает видео с помощью VEO3 (Google Video Generation)",
  parameters: z.object({
    prompt: z.string().describe("Описание видео для генерации"),
    duration: z
      .number()
      .min(1)
      .max(60)
      .optional()
      .describe("Длительность видео в секундах (1-60)"),
    style: z
      .enum(["realistic", "animated", "cinematic", "documentary"])
      .optional()
      .describe("Стиль видео"),
    resolution: z
      .enum(["720p", "1080p", "4k"])
      .optional()
      .describe("Разрешение видео"),
    aspectRatio: z
      .enum(["16:9", "9:16", "1:1"])
      .optional()
      .describe("Соотношение сторон"),
    seed: z
      .number()
      .optional()
      .describe("Seed для воспроизводимости результатов"),
  }),
  execute: async ({
    prompt,
    duration,
    style,
    resolution,
    aspectRatio,
    seed,
  }) => {
    try {
      console.log("🎬 Creating VEO3 video:", {
        prompt,
        duration,
        style,
        resolution,
      });

      const result = await createVeo3Video({
        prompt,
        duration,
        style,
        resolution,
        aspectRatio,
        seed,
      });

      if (result.status === "failed") {
        return {
          success: false,
          error: result.error,
          videoId: result.id,
        };
      }

      return {
        success: true,
        videoId: result.id,
        status: result.status,
        prompt: result.prompt,
        duration: result.duration,
        resolution: result.resolution,
        createdAt: result.createdAt,
        message:
          result.status === "processing"
            ? "Видео создается, используйте checkVeo3VideoStatus для проверки статуса"
            : "Видео готово!",
      };
    } catch (error) {
      console.error("🎬 VEO3 video creation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const checkVeo3VideoStatusTool = tool({
  description: "Проверяет статус создания видео VEO3",
  parameters: z.object({
    videoId: z.string().describe("ID видео для проверки статуса"),
  }),
  execute: async ({ videoId }) => {
    try {
      console.log("🎬 Checking VEO3 video status:", { videoId });

      const result = await getVeo3VideoStatus(videoId);

      return {
        success: true,
        videoId: result.id,
        status: result.status,
        prompt: result.prompt,
        duration: result.duration,
        resolution: result.resolution,
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        createdAt: result.createdAt,
        completedAt: result.completedAt,
        error: result.error,
        isReady: result.status === "completed",
        isProcessing: result.status === "processing",
        isFailed: result.status === "failed",
      };
    } catch (error) {
      console.error("🎬 VEO3 video status error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const generateVeo3IdeasTool = tool({
  description: "Генерирует идеи для видео VEO3 на основе промпта",
  parameters: z.object({
    prompt: z.string().describe("Базовый промпт для генерации идей видео"),
  }),
  execute: async ({ prompt }) => {
    try {
      console.log("🎬 Generating VEO3 video ideas:", { prompt });

      const ideas = generateVeo3Ideas(prompt);

      return {
        success: true,
        originalPrompt: prompt,
        ideas,
        totalIdeas: ideas.length,
        suggestions: [
          "Попробуйте разные стили: realistic, animated, cinematic, documentary",
          "Экспериментируйте с длительностью: от 5 до 60 секунд",
          "Используйте разные разрешения: 720p, 1080p, 4k",
          "Попробуйте разные соотношения сторон: 16:9, 9:16, 1:1",
        ],
      };
    } catch (error) {
      console.error("🎬 VEO3 ideas generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
