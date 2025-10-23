import { tool } from "ai";
import { z } from "zod";
import type { MediaOption } from "@/lib/types/media-settings";
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from "@/lib/utils/ai-tools-balance";
import type { Session } from "next-auth";
import { analyzeImageContext } from "@/lib/ai/context";

interface CreateImageDocumentParams {
  createDocument: any;
  session?: Session | null;
  defaultSourceImageUrl?: string | undefined;
  chatId?: string;
  userMessage?: string;
  currentAttachments?: any[];
}

export const configureImageGeneration = (params?: CreateImageDocumentParams) =>
  tool({
    description:
      "Configure image generation settings or generate an image directly if prompt is provided. Supports text-to-image by default, and image-to-image when a sourceImageUrl is provided. When triggered, creates an image artifact that shows generation progress in real-time.",
    inputSchema: z.object({
      prompt: z
        .string()
        .optional()
        .describe(
          "Detailed description of the image to generate. If provided, will immediately create image artifact and start generation"
        ),
      sourceImageUrl: z
        .string()
        .url()
        .optional()
        .describe(
          "Optional source image URL for image-to-image generation (e.g., when the user uploaded an image in chat). If provided, the system will run image-to-image."
        ),
      style: z
        .string()
        .optional()
        .describe(
          'Style of the image. Supports many formats: "realistic", "cinematic", "anime", "cartoon", "sketch", "painting", "steampunk", "fantasy", "sci-fi", "horror", "minimalist", "abstract", "portrait", "landscape", and many more available styles'
        ),
      resolution: z
        .string()
        .optional()
        .describe(
          'Image resolution. Accepts various formats: "1920x1080", "1920×1080", "1920 x 1080", "full hd", "fhd", "1080p", "square", "vertical", "horizontal", etc.'
        ),
      shotSize: z
        .string()
        .optional()
        .describe(
          'Shot size/camera angle. Accepts: "close-up", "medium-shot", "long-shot", "extreme-close-up", "portrait", "two-shot", etc.'
        ),
      model: z
        .string()
        .optional()
        .describe(
          'AI model to use. Models are loaded dynamically from SuperDuperAI API. Use model name like "FLUX" or full model ID.'
        ),
      seed: z.number().optional().describe("Seed for reproducible results"),
      batchSize: z
        .number()
        .min(1)
        .max(3)
        .optional()
        .describe(
          "Number of images to generate simultaneously (1-3). Higher batch sizes generate multiple variations at once."
        ),
    }),
    execute: async ({
      prompt,
      sourceImageUrl,
      style,
      resolution,
      shotSize,
      model,
      seed,
      batchSize,
    }) => {
      console.log("🔧 configureImageGeneration called with:", {
        prompt,
        style,
        resolution,
        shotSize,
        model,
        seed,
        batchSize,
      });

      // AICODE-NOTE: Define Nano Banana constants at the top of execute function
      const NANO_BANANA_STYLES = [
        { id: "realistic", label: "Realistic", description: "Photorealistic images" },
        { id: "cinematic", label: "Cinematic", description: "Cinematic style with dramatic lighting" },
        { id: "anime", label: "Anime", description: "Japanese animation style" },
        { id: "cartoon", label: "Cartoon", description: "Cartoon style" },
        { id: "chibi", label: "Chibi", description: "Miniature cute style" },
        { id: "3d-render", label: "3D Render", description: "Three-dimensional computer graphics" },
        { id: "oil-painting", label: "Oil Painting", description: "Classic oil painting" },
        { id: "watercolor", label: "Watercolor", description: "Gentle watercolor technique" },
        { id: "sketch", label: "Sketch", description: "Pencil sketch" },
        { id: "digital-art", label: "Digital Art", description: "Modern digital creativity" },
      ];

      const NANO_BANANA_QUALITY_LEVELS = [
        { id: "standard", label: "Standard", multiplier: 1.0, description: "Base quality" },
        { id: "high", label: "High", multiplier: 1.5, description: "Enhanced quality" },
        { id: "ultra", label: "Ultra", multiplier: 2.0, description: "Maximum quality" },
      ];

      const NANO_BANANA_ASPECT_RATIOS = [
        { id: "1:1", label: "Square (1:1)", width: 1024, height: 1024 },
        { id: "16:9", label: "Widescreen (16:9)", width: 1920, height: 1080 },
        { id: "9:16", label: "Vertical (9:16)", width: 768, height: 1366 },
        { id: "4:3", label: "Classic (4:3)", width: 1024, height: 768 },
      ];

      // If no prompt provided, return Nano Banana configuration panel
      if (!prompt) {
        console.log(
          "🍌 No prompt provided, returning Nano Banana configuration panel"
        );
        return {
          model: "gemini-2.5-flash-image",
          provider: "nano-banana",
          availableStyles: NANO_BANANA_STYLES,
          availableQualityLevels: NANO_BANANA_QUALITY_LEVELS,
          availableAspectRatios: NANO_BANANA_ASPECT_RATIOS,
          capabilities: [
            "Context-aware editing",
            "Surgical precision",
            "Understanding physical logic",
            "Intelligent lighting",
            "Multimodal inputs",
            "Creative partnership",
          ],
        };
      }

      console.log("🍌 ✅ PROMPT PROVIDED, GENERATING WITH NANO BANANA:", prompt);

      // Check style for quality multipliers
      const multipliers: string[] = [];
      if (style?.includes("high-quality")) multipliers.push("high-quality");
      if (style?.includes("ultra-quality")) multipliers.push("ultra-quality");

      try {
        // Map old resolution format to Nano Banana aspect ratio
        const foundAspectRatio = resolution
          ? NANO_BANANA_ASPECT_RATIOS.find((r) => r.label.includes(resolution) || resolution.includes(r.id))
          : null;
        const selectedAspectRatio = (foundAspectRatio || NANO_BANANA_ASPECT_RATIOS[0])!; // Always has value from array

        // Map old style to Nano Banana style
        const foundStyle = style
          ? NANO_BANANA_STYLES.find((s) => s.label.toLowerCase().includes(style.toLowerCase()) || style.toLowerCase().includes(s.label.toLowerCase()))
          : null;
        const selectedStyle = (foundStyle || NANO_BANANA_STYLES[0])!; // Always has value from array

        // Use high quality by default
        const selectedQuality = NANO_BANANA_QUALITY_LEVELS[1]!; // "high" - Always has value from array

        // Используем новую систему анализа контекста
        let normalizedSourceUrl = sourceImageUrl;

        console.log("🔍 configureImageGeneration sourceImageUrl resolution:", {
          sourceImageUrl,
          defaultSourceImageUrl: params?.defaultSourceImageUrl,
          chatId: params?.chatId,
          userMessage: params?.userMessage,
        });

        // Приоритет 1: defaultSourceImageUrl (legacy поддержка)
        if (
          params?.defaultSourceImageUrl &&
          /^https?:\/\//.test(params.defaultSourceImageUrl)
        ) {
          console.log(
            "🔍 Using defaultSourceImageUrl from legacy context analysis:",
            params.defaultSourceImageUrl
          );
          normalizedSourceUrl = params.defaultSourceImageUrl;
        }
        // Приоритет 2: новая система анализа контекста
        else if (params?.chatId && params?.userMessage) {
          try {
            console.log("🔍 Analyzing image context with new system...");
            const contextResult = await analyzeImageContext(
              params.userMessage,
              params.chatId,
              params.currentAttachments,
              params.session?.user?.id
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
        // Приоритет 3: AI-provided sourceImageUrl
        else if (
          normalizedSourceUrl &&
          /^https?:\/\//.test(normalizedSourceUrl) &&
          !normalizedSourceUrl.startsWith("attachment://")
        ) {
          console.log(
            "🔍 Using AI-provided sourceImageUrl:",
            normalizedSourceUrl
          );
        }
        // Fallback: text-to-image
        else {
          console.log(
            "🔍 No valid source image URL available, will be text-to-image"
          );
          normalizedSourceUrl = undefined;
        }

        // Determine operation type and check balance
        const operationType = normalizedSourceUrl
          ? "image-to-image"
          : "text-to-image";

        // Проверяем, был ли найден подходящий источник для семантического поиска
        if (
          params?.userMessage &&
          normalizedSourceUrl &&
          operationType === "image-to-image"
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
              params.defaultSourceImageUrl === normalizedSourceUrl;

            console.log("🔍 Fallback check:", {
              normalizedSourceUrl,
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
                  "Описать сцену для редактирования",
                ],
              };
            }
          }
        }

        const balanceCheck = await checkBalanceBeforeArtifact(
          params?.session || null,
          "image-generation",
          operationType,
          multipliers,
          getOperationDisplayName(operationType)
        );

        if (!balanceCheck.valid) {
          console.log("🔧 ❌ INSUFFICIENT BALANCE, NOT CREATING ARTIFACT");
          return {
            error:
              balanceCheck.userMessage ||
              "Insufficient funds for image generation",
            balanceError: true,
            requiredCredits: balanceCheck.cost,
          };
        }

        // AICODE-NOTE: Use Nano Banana provider directly instead of old SuperDuperAI artifact system
        console.log("🍌 ✅ USING NANO BANANA PROVIDER FOR IMAGE GENERATION");

        // Create prompt for Nano Banana
        let nanoBananaPrompt = prompt;

        // Add style instructions
        if (selectedStyle.id !== "realistic") {
          nanoBananaPrompt += `, ${selectedStyle.description.toLowerCase()}`;
        }

        // Add quality instructions
        if (selectedQuality.id !== "standard") {
          nanoBananaPrompt += `, ${selectedQuality.description.toLowerCase()}`;
        }

        // Add aspect ratio instructions
        nanoBananaPrompt += `, ${selectedAspectRatio.label.toLowerCase()}`;

        console.log("🍌 Final Nano Banana prompt:", nanoBananaPrompt);

        try {
          // Use Nano Banana Provider (Gemini API)
          const { nanoBananaProvider } = await import("../providers/nano-banana");

          const nanoBananaParams = {
            prompt: nanoBananaPrompt,
            ...(normalizedSourceUrl && { sourceImageUrl: normalizedSourceUrl }),
            style: selectedStyle.id,
            quality: selectedQuality.id,
            aspectRatio: selectedAspectRatio.id,
            ...(seed && { seed }),
            nanoBananaFeatures: {
              enableContextAwareness: true,
              enableSurgicalPrecision: true,
              creativeMode: false,
            },
          };

          const result = await nanoBananaProvider.generateImage(nanoBananaParams);

          console.log("🍌 ✅ NANO BANANA API RESULT:", result);

          return {
            ...result,
            message: `Image generated successfully using Nano Banana (Gemini 2.5 Flash Image): "${prompt}". Style: ${selectedStyle.label}, Quality: ${selectedQuality.label}, Format: ${selectedAspectRatio.label}.`,
            nanoBananaInfo: {
              model: "gemini-2.5-flash-image",
              capabilities: [
                "Context-aware editing",
                "Surgical precision",
                "Physical logic understanding",
                "Intelligent lighting",
              ],
              style: selectedStyle,
              quality: selectedQuality,
              aspectRatio: selectedAspectRatio,
            },
          };
        } catch (error) {
          console.error("🍌 ❌ NANO BANANA ERROR:", error);
          throw error;
        }
      } catch (error: any) {
        console.error("🔧 ❌ ERROR IN IMAGE GENERATION:", error);
        return {
          error: `Failed to generate image: ${error.message}`,
          message: `Unfortunately, image generation failed: "${prompt}". Error: ${error.message}`,
        };
      }
    },
  });

// Helper function to find style (kept for backward compatibility)
export function findStyle(
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
