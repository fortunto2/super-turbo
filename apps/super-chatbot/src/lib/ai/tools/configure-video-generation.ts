import { tool } from "ai";
import { z } from "zod";
import type { MediaOption } from "@/lib/types/media-settings";
import { getVideoGenerationConfig } from "@/lib/config/media-settings-factory";
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from "@/lib/utils/ai-tools-balance";
import type { Session } from "next-auth";
import { analyzeVideoContext } from "@/lib/ai/context";

interface CreateVideoDocumentParams {
  createDocument: any;
  session?: Session | null;
  defaultSourceVideoUrl?: string;
  defaultSourceImageUrl?: string;
  chatId?: string;
  userMessage?: string;
  currentAttachments?: any[];
}

export const configureVideoGeneration = (params?: CreateVideoDocumentParams) =>
  tool({
    description:
      "Configure video generation settings or generate a video directly if prompt is provided. Supports text-to-video by default, video-to-video when a video sourceVideoUrl is provided, and image-to-video when an image sourceVideoUrl is provided. When triggered, creates a video artifact that shows generation progress in real-time.",
    parameters: z.object({
      prompt: z
        .string()
        .optional()
        .describe(
          "Detailed description of the video to generate. If provided, will immediately create video artifact and start generation"
        ),
      sourceVideoUrl: z
        .string()
        .url()
        .optional()
        .describe(
          "Optional source URL for video generation. Can be a video URL for video-to-video generation, or an image URL for image-to-video generation (e.g., when the user uploaded media in chat). If provided, the system will run the appropriate generation type."
        ),
      style: z
        .string()
        .optional()
        .describe(
          'Style of the video. Supports many formats: "realistic", "cinematic", "anime", "cartoon", "documentary", "vlog", "tutorial", "promotional", "artistic", "minimalist", "abstract", and many more available styles'
        ),
      resolution: z
        .string()
        .optional()
        .describe(
          'Video resolution. Accepts various formats: "1920x1080", "1920×1080", "1920 x 1080", "full hd", "fhd", "1080p", "4k", "square", "vertical", "horizontal", etc.'
        ),
      duration: z
        .string()
        .optional()
        .describe(
          'Video duration. Accepts: "5s", "10s", "30s", "1m", "2m", "short", "medium", "long", etc.'
        ),
      model: z
        .string()
        .optional()
        .describe(
          'AI model to use. Models are loaded dynamically from SuperDuperAI API. Use model name like "VEO3" or full model ID.'
        ),
      seed: z.number().optional().describe("Seed for reproducible results"),
      batchSize: z
        .number()
        .min(1)
        .max(2)
        .optional()
        .describe(
          "Number of videos to generate simultaneously (1-2). Higher batch sizes generate multiple variations at once."
        ),
    }),
    execute: async ({
      prompt,
      sourceVideoUrl,
      style,
      resolution,
      duration,
      model,
      seed,
      batchSize,
    }) => {
      console.log("🎬 configureVideoGeneration called with:", {
        prompt,
        style,
        resolution,
        duration,
        model,
        seed,
        batchSize,
      });

      // AICODE-NOTE: Use new factory to get configuration with OpenAPI models
      console.log("🎬 Loading video configuration from OpenAPI factory...");
      const config = await getVideoGenerationConfig();

      console.log("🎬 ✅ Loaded video config:", {
        modelsCount: config.availableModels.length,
        resolutionsCount: config.availableResolutions.length,
        stylesCount: config.availableStyles.length,
      });

      // If no prompt provided, return configuration panel
      if (!prompt) {
        console.log(
          "🎬 No prompt provided, returning video configuration panel"
        );
        return config;
      }

      console.log("🎬 ✅ PROMPT PROVIDED, CREATING VIDEO DOCUMENT:", prompt);

      if (!params?.createDocument) {
        console.log(
          "🎬 ❌ createDocument not available, returning basic config"
        );
        return config;
      }

      // Check style for quality multipliers
      const multipliers: string[] = [];
      if (style?.includes("high-quality")) multipliers.push("high-quality");
      if (style?.includes("ultra-quality")) multipliers.push("ultra-quality");

      try {
        // Find the selected options or use defaults from factory
        const selectedResolution = resolution
          ? config.availableResolutions.find((r) => r.label === resolution) ||
            config.defaultSettings.resolution
          : config.defaultSettings.resolution;

        let selectedStyle: MediaOption = config.defaultSettings.style;
        if (style) {
          const foundStyle = findVideoStyle(style, config.availableStyles);
          if (foundStyle) {
            selectedStyle = foundStyle;
            console.log(
              "🎬 ✅ STYLE MATCHED:",
              style,
              "->",
              selectedStyle.label
            );
          } else {
            console.log(
              "🎬 ⚠️ STYLE NOT FOUND:",
              style,
              "using default:",
              selectedStyle.label
            );
          }
        }

        const selectedDuration = duration
          ? config.availableDurations.find(
              (d) => d.label === duration || d.id === duration
            ) || config.defaultSettings.duration
          : config.defaultSettings.duration;

        const selectedModel = model
          ? config.availableModels.find(
              (m) => m.name === model || (m as any).id === model
            ) || config.defaultSettings.model
          : config.defaultSettings.model;

        // Используем новую систему анализа контекста
        let normalizedSourceUrl = sourceVideoUrl;

        console.log("🔍 configureVideoGeneration sourceVideoUrl resolution:", {
          sourceVideoUrl,
          defaultSourceVideoUrl: params?.defaultSourceVideoUrl,
          chatId: params?.chatId,
          userMessage: params?.userMessage,
        });

        // Приоритет 1: новая система анализа контекста (семантический поиск)
        if (params?.chatId && params?.userMessage) {
          try {
            console.log("🔍 Analyzing video context with new system...");
            const contextResult = await analyzeVideoContext(
              params.userMessage,
              params.chatId,
              params.currentAttachments
            );

            console.log("🔍 Context analysis result:", contextResult);

            if (contextResult.sourceUrl && contextResult.confidence !== "low") {
              console.log(
                "🔍 Using sourceUrl from new context analysis:",
                contextResult.sourceUrl,
                "confidence:",
                contextResult.confidence
              );
              normalizedSourceUrl = contextResult.sourceUrl;
            }
          } catch (error) {
            console.warn("🔍 Error in context analysis, falling back:", error);
          }
        }

        // Приоритет 2: defaultSourceVideoUrl (legacy поддержка) - только если семантический поиск не дал результата
        if (
          !normalizedSourceUrl &&
          params?.defaultSourceVideoUrl &&
          /^https?:\/\//.test(params.defaultSourceVideoUrl)
        ) {
          console.log(
            "🔍 Using defaultSourceVideoUrl from legacy context analysis:",
            params.defaultSourceVideoUrl
          );
          normalizedSourceUrl = params.defaultSourceVideoUrl;
        }

        // Приоритет 3: AI-provided sourceVideoUrl
        if (
          !normalizedSourceUrl &&
          sourceVideoUrl &&
          /^https?:\/\//.test(sourceVideoUrl) &&
          !sourceVideoUrl.startsWith("attachment://")
        ) {
          console.log("🔍 Using AI-provided sourceVideoUrl:", sourceVideoUrl);
          normalizedSourceUrl = sourceVideoUrl;
        }
        // Fallback: text-to-video
        if (!normalizedSourceUrl) {
          console.log(
            "🔍 No valid source video URL available, will be text-to-video"
          );
        }

        // Determine operation type and check balance
        let operationType = "text-to-video";
        if (normalizedSourceUrl) {
          // Проверяем, является ли источник изображением или видео
          const isImageSource =
            /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(normalizedSourceUrl) ||
            normalizedSourceUrl.includes("image/") ||
            params?.currentAttachments?.some(
              (att) =>
                att.url === normalizedSourceUrl &&
                String(att.contentType || "").startsWith("image/")
            );

          operationType = isImageSource ? "image-to-video" : "video-to-video";

          console.log("🔍 Operation type determined:", {
            sourceUrl: normalizedSourceUrl,
            isImageSource,
            operationType,
          });
        }

        // Проверяем, был ли найден подходящий источник для семантического поиска
        if (
          params?.userMessage &&
          normalizedSourceUrl &&
          operationType === "image-to-video"
        ) {
          // Проверяем, содержит ли сообщение запрос на поиск по содержимому
          const semanticSearchPatterns = [
            /(картинк[а-я]+\s+с\s+|изображение\s+с\s+|фото\s+с\s+|image\s+with\s+|picture\s+with\s+|photo\s+with\s+)/i,
            /(картинк[а-я]+\s+где\s+есть|изображение\s+где\s+есть|фото\s+где\s+есть|image\s+that\s+has|picture\s+that\s+contains|photo\s+that\s+shows)/i,
          ];

          const hasSemanticSearchRequest = semanticSearchPatterns.some(
            (pattern) => pattern.test(params.userMessage || "")
          );

          if (hasSemanticSearchRequest) {
            // Проверяем, был ли найден подходящий источник через семантический поиск
            // Если источник был найден через fallback (последнее изображение), это означает, что семантический поиск не сработал
            const isFallbackSource =
              params.defaultSourceVideoUrl === normalizedSourceUrl ||
              params.defaultSourceImageUrl === normalizedSourceUrl;

            console.log("🔍 Fallback check:", {
              normalizedSourceUrl,
              defaultSourceVideoUrl: params.defaultSourceVideoUrl,
              defaultSourceImageUrl: params.defaultSourceImageUrl,
              isFallbackSource,
              hasSemanticSearchRequest,
            });

            if (isFallbackSource) {
              console.log(
                "🔍 Semantic search failed, providing helpful message instead of balance error"
              );
              return {
                error: "semantic_search_failed",
                message:
                  "К сожалению, я не смог найти изображение с нужным содержимым в истории чата. Попробуйте:\n\n• Загрузить новое изображение с нужным содержимым\n• Описать сцену для создания нового изображения\n• Использовать более конкретное описание (например, 'первое изображение' или 'последнее изображение')",
                suggestions: [
                  "Загрузить изображение с луной",
                  "Создать новое изображение с луной",
                  "Использовать последнее изображение",
                  "Описать сцену для анимации",
                ],
              };
            }
          }
        }

        const balanceCheck = await checkBalanceBeforeArtifact(
          params.session || null,
          "video-generation",
          operationType,
          multipliers,
          getOperationDisplayName(operationType)
        );

        if (!balanceCheck.valid) {
          console.log("🎬 ❌ INSUFFICIENT BALANCE, NOT CREATING ARTIFACT");
          return {
            error:
              balanceCheck.userMessage ||
              "Недостаточно средств для генерации видео",
            balanceError: true,
            requiredCredits: balanceCheck.cost,
          };
        }

        // Create the video document with all parameters
        const videoParams = {
          prompt,
          style: selectedStyle,
          resolution: selectedResolution,
          duration: selectedDuration.value || selectedDuration, // Извлекаем value для API
          model: selectedModel,
          seed: seed || undefined,
          batchSize: batchSize || 1,
          ...(normalizedSourceUrl
            ? { sourceVideoUrl: normalizedSourceUrl }
            : {}),
        };

        console.log("🎬 ✅ CREATING VIDEO DOCUMENT WITH PARAMS:", videoParams);
        console.log("🔍 Final sourceVideoUrl used:", normalizedSourceUrl);

        try {
          // AICODE-NOTE: For now we pass params as JSON in title for backward compatibility
          // TODO: Refactor to use proper parameter passing mechanism
          const result = await params.createDocument.execute({
            title: JSON.stringify(videoParams),
            kind: "video",
          });

          console.log("🎬 ✅ CREATE DOCUMENT RESULT:", result);

          return {
            ...result,
            message: `I'm creating ${operationType.replace("-", " ")} with description: "${prompt}". Using model "${selectedModel.name}" with ${selectedResolution.label} resolution and ${selectedDuration.label} duration. Artifact created and generation started.`,
          };
        } catch (error) {
          console.error("🎬 ❌ CREATE DOCUMENT ERROR:", error);
          throw error;
        }
      } catch (error: any) {
        console.error("🎬 ❌ ERROR CREATING VIDEO DOCUMENT:", error);

        // Create error artifact for better user feedback
        if (params?.createDocument) {
          try {
            const errorResult = await params.createDocument.execute({
              title: JSON.stringify({
                prompt,
                status: "error",
                error: error.message || "Failed to create video document",
                timestamp: Date.now(),
                message: "Ошибка при создании видео",
              }),
              kind: "video",
            });

            return {
              ...errorResult,
              error: `Ошибка создания видео: ${error.message}`,
              message: `К сожалению, не удалось создать видео: "${prompt}". Ошибка: ${error.message}`,
            };
          } catch (artifactError) {
            console.error(
              "🎬 ❌ Failed to create error artifact:",
              artifactError
            );
          }
        }

        return {
          error: `Ошибка создания видео: ${error.message}`,
          message: `К сожалению, не удалось создать видео: "${prompt}". Ошибка: ${error.message}`,
          fallbackConfig: config,
        };
      }
    },
  });

// Helper function to find video style (similar to image style finder)
export function findVideoStyle(
  styleName: string,
  availableStyles: MediaOption[]
): MediaOption | null {
  const normalizedStyleName = styleName.toLowerCase().trim();

  // Direct match by label or id
  let foundStyle = availableStyles.find(
    (style) =>
      style.label.toLowerCase() === normalizedStyleName ||
      style.id.toLowerCase() === normalizedStyleName
  );

  if (foundStyle) return foundStyle;

  // Partial match
  foundStyle = availableStyles.find(
    (style) =>
      style.label.toLowerCase().includes(normalizedStyleName) ||
      style.id.toLowerCase().includes(normalizedStyleName) ||
      normalizedStyleName.includes(style.label.toLowerCase()) ||
      normalizedStyleName.includes(style.id.toLowerCase())
  );

  return foundStyle || null;
}
