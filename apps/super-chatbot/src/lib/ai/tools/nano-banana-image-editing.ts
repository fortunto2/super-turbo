import { tool } from "ai";
import { z } from 'zod/v3';
import { getImageGenerationConfig } from "@/lib/config/media-settings-factory";
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from "@/lib/utils/ai-tools-balance";
import type { Session } from "next-auth";
import { analyzeImageContext } from "@/lib/ai/context";

interface CreateImageDocumentParams {
  createDocument: any;
  session?: Session | null;
  defaultSourceImageUrl?: string;
  chatId?: string;
  userMessage?: string;
  currentAttachments?: any[];
}

// Типы редактирования Nano Banana
const NANO_BANANA_EDIT_TYPES = [
  {
    id: "background-replacement",
    label: "Замена фона",
    description:
      "Интеллектуальная замена фона с сохранением освещения и отражений",
    requiresSource: true,
  },
  {
    id: "object-addition",
    label: "Добавление объектов",
    description: "Добавление новых объектов в сцену с правильной перспективой",
    requiresSource: true,
  },
  {
    id: "object-removal",
    label: "Удаление объектов",
    description: "Удаление нежелательных объектов с восстановлением фона",
    requiresSource: true,
  },
  {
    id: "style-transfer",
    label: "Перенос стиля",
    description: "Изменение художественного стиля изображения",
    requiresSource: true,
  },
  {
    id: "color-correction",
    label: "Коррекция цвета",
    description: "Улучшение цветовой палитры и освещения",
    requiresSource: true,
  },
  {
    id: "resolution-upscale",
    label: "Увеличение разрешения",
    description: "Улучшение качества и детализации изображения",
    requiresSource: true,
  },
  {
    id: "face-enhancement",
    label: "Улучшение лиц",
    description: "Улучшение качества портретов и лиц",
    requiresSource: true,
  },
  {
    id: "text-addition",
    label: "Добавление текста",
    description: "Добавление текста на изображение",
    requiresSource: true,
  },
  {
    id: "composition-improvement",
    label: "Улучшение композиции",
    description: "Улучшение композиции и кадрирования",
    requiresSource: true,
  },
  {
    id: "lighting-adjustment",
    label: "Коррекция освещения",
    description: "Изменение освещения и теней",
    requiresSource: true,
  },
] as const;

// Уровни точности редактирования
const NANO_BANANA_PRECISION_LEVELS = [
  {
    id: "automatic",
    label: "Автоматический",
    description: "Nano Banana автоматически определяет лучший подход",
    multiplier: 1.0,
  },
  {
    id: "precise",
    label: "Точный",
    description: "Высокая точность с сохранением деталей",
    multiplier: 1.5,
  },
  {
    id: "surgical",
    label: "Хирургический",
    description: "Максимальная точность для сложных случаев",
    multiplier: 2.0,
  },
] as const;

// Режимы смешивания
const NANO_BANANA_BLEND_MODES = [
  {
    id: "natural",
    label: "Естественный",
    description: "Естественное смешивание с окружением",
  },
  {
    id: "seamless",
    label: "Бесшовный",
    description: "Полное слияние с исходным изображением",
  },
  {
    id: "artistic",
    label: "Художественный",
    description: "Творческая интерпретация изменений",
  },
  {
    id: "realistic",
    label: "Реалистичный",
    description: "Фотореалистичный результат",
  },
] as const;

export const nanoBananaImageEditing = (params?: CreateImageDocumentParams) =>
  tool({
    description:
      "Редактирование изображений с помощью Gemini-2.5-Flash-Image (Nano Banana). Поддерживает контекстно-осознанное редактирование, хирургическую точность и интеллектуальное понимание сцены. Требует исходное изображение для редактирования.",
    inputSchema: z.object({
      editType: z
        .enum(NANO_BANANA_EDIT_TYPES.map((t) => t.id) as [string, ...string[]])
        .describe(
          "Тип редактирования изображения. Nano Banana понимает контекст и может выполнять сложные операции."
        ),
      editPrompt: z
        .string()
        .describe(
          "Детальное описание желаемых изменений. Будьте конкретны в описании того, что нужно изменить."
        ),
      sourceImageUrl: z
        .string()
        .url()
        .describe(
          "URL исходного изображения для редактирования. Обязательный параметр для всех операций редактирования."
        ),
      precisionLevel: z
        .enum(
          NANO_BANANA_PRECISION_LEVELS.map((p) => p.id) as [string, ...string[]]
        )
        .optional()
        .default("automatic")
        .describe(
          "Уровень точности редактирования. Влияет на качество и время обработки."
        ),
      blendMode: z
        .enum(NANO_BANANA_BLEND_MODES.map((b) => b.id) as [string, ...string[]])
        .optional()
        .default("natural")
        .describe("Режим смешивания изменений с исходным изображением."),
      preserveOriginalStyle: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          "Сохранить оригинальный стиль изображения при редактировании."
        ),
      enhanceLighting: z
        .boolean()
        .optional()
        .default(true)
        .describe("Автоматически улучшить освещение после редактирования."),
      preserveShadows: z
        .boolean()
        .optional()
        .default(true)
        .describe("Сохранить оригинальные тени и отражения."),
      seed: z
        .number()
        .optional()
        .describe("Seed для воспроизводимых результатов"),
      batchSize: z
        .number()
        .min(1)
        .max(3)
        .optional()
        .default(1)
        .describe("Количество вариантов редактирования (1-3)."),
      // Дополнительные параметры для специфичных типов редактирования
      objectToRemove: z
        .string()
        .optional()
        .describe("Описание объекта для удаления (для типа object-removal)."),
      newBackground: z
        .string()
        .optional()
        .describe("Описание нового фона (для типа background-replacement)."),
      textToAdd: z
        .string()
        .optional()
        .describe(
          "Текст для добавления на изображение (для типа text-addition)."
        ),
      textStyle: z
        .string()
        .optional()
        .describe(
          "Стиль текста: font, color, size, position (для типа text-addition)."
        ),
      targetStyle: z
        .string()
        .optional()
        .describe("Целевой стиль для переноса (для типа style-transfer)."),
    }),
    execute: async ({
      editType,
      editPrompt,
      sourceImageUrl,
      precisionLevel,
      blendMode,
      preserveOriginalStyle,
      enhanceLighting,
      preserveShadows,
      seed,
      batchSize,
      objectToRemove,
      newBackground,
      textToAdd,
      textStyle,
      targetStyle,
    }) => {
      console.log("🍌 nanoBananaImageEditing called with:", {
        editType,
        editPrompt,
        precisionLevel,
        blendMode,
        preserveOriginalStyle,
        enhanceLighting,
        preserveShadows,
        batchSize,
      });

      // Получаем конфигурацию изображений
      const config = await getImageGenerationConfig();

      // Проверяем наличие исходного изображения
      if (!sourceImageUrl) {
        return {
          error: "Исходное изображение обязательно для редактирования",
          editTypes: NANO_BANANA_EDIT_TYPES,
          precisionLevels: NANO_BANANA_PRECISION_LEVELS,
          blendModes: NANO_BANANA_BLEND_MODES,
        };
      }

      // Находим выбранный тип редактирования
      const selectedEditType = NANO_BANANA_EDIT_TYPES.find(
        (t) => t.id === editType
      );
      if (!selectedEditType) {
        return {
          error: "Неизвестный тип редактирования",
          availableTypes: NANO_BANANA_EDIT_TYPES,
        };
      }

      // Проверяем, требует ли тип редактирования исходное изображение
      if (selectedEditType.requiresSource && !sourceImageUrl) {
        return {
          error: `Тип редактирования "${selectedEditType.label}" требует исходное изображение`,
          editType: selectedEditType,
        };
      }

      console.log(
        "🍌 ✅ EDIT PROMPT PROVIDED, CREATING NANO BANANA EDIT DOCUMENT:",
        editPrompt
      );

      if (!params?.createDocument) {
        console.log(
          "🍌 ❌ createDocument not available, returning basic config"
        );
        return config;
      }

      try {
        // Находим выбранные опции
        const selectedPrecision =
          NANO_BANANA_PRECISION_LEVELS.find((p) => p.id === precisionLevel) ||
          NANO_BANANA_PRECISION_LEVELS[0];
        const selectedBlendMode =
          NANO_BANANA_BLEND_MODES.find((b) => b.id === blendMode) ||
          NANO_BANANA_BLEND_MODES[0];

        // Анализируем контекст изображения
        let normalizedSourceUrl = sourceImageUrl;

        if (params?.chatId && params?.userMessage) {
          try {
            console.log(
              "🔍 Analyzing image context for Nano Banana editing..."
            );
            const contextResult = await analyzeImageContext(
              params.userMessage,
              params.chatId,
              params.currentAttachments,
              params.session?.user?.id
            );

            if (contextResult.sourceUrl && contextResult.confidence !== "low") {
              console.log(
                "🔍 Using sourceUrl from context analysis:",
                contextResult.sourceUrl
              );
              normalizedSourceUrl = contextResult.sourceUrl;
            }
          } catch (error) {
            console.warn("🔍 Error in context analysis, falling back:", error);
          }
        }

        // Создаем детальный промпт для редактирования
        let nanoBananaEditPrompt = `Edit the image: ${editPrompt}`;

        // Добавляем специфичные указания в зависимости от типа редактирования
        switch (editType) {
          case "background-replacement":
            if (newBackground) {
              nanoBananaEditPrompt += `. Replace background with: ${newBackground}`;
            }
            nanoBananaEditPrompt += `. Maintain original lighting, shadows, and reflections. Context-aware background replacement.`;
            break;

          case "object-addition":
            nanoBananaEditPrompt += `. Add the object with proper perspective, lighting, and shadows. Seamless integration with existing scene.`;
            break;

          case "object-removal":
            if (objectToRemove) {
              nanoBananaEditPrompt += `. Remove: ${objectToRemove}`;
            }
            nanoBananaEditPrompt += `. Restore background naturally. Perfect inpainting.`;
            break;

          case "style-transfer":
            if (targetStyle) {
              nanoBananaEditPrompt += `. Apply style: ${targetStyle}`;
            }
            nanoBananaEditPrompt += `. Maintain composition and subject while changing artistic style.`;
            break;

          case "color-correction":
            nanoBananaEditPrompt += `. Improve colors, contrast, and lighting. Professional color grading.`;
            break;

          case "resolution-upscale":
            nanoBananaEditPrompt += `. Enhance resolution and details. AI upscaling with quality preservation.`;
            break;

          case "face-enhancement":
            nanoBananaEditPrompt += `. Enhance facial features, skin texture, and portrait quality. Professional retouching.`;
            break;

          case "text-addition":
            if (textToAdd) {
              nanoBananaEditPrompt += `. Add text: "${textToAdd}"`;
              if (textStyle) {
                nanoBananaEditPrompt += ` with style: ${textStyle}`;
              }
            }
            nanoBananaEditPrompt += `. Integrate text naturally into the image.`;
            break;

          case "composition-improvement":
            nanoBananaEditPrompt += `. Improve composition, framing, and visual balance. Professional photography principles.`;
            break;

          case "lighting-adjustment":
            nanoBananaEditPrompt += `. Adjust lighting, shadows, and highlights. Professional lighting correction.`;
            break;
        }

        // Добавляем общие указания для Nano Banana
        nanoBananaEditPrompt += `. ${selectedPrecision.description.toLowerCase()}. ${selectedBlendMode.description.toLowerCase()}.`;

        if (preserveOriginalStyle) {
          nanoBananaEditPrompt += ` Preserve original artistic style.`;
        }

        if (enhanceLighting) {
          nanoBananaEditPrompt += ` Enhance lighting and atmosphere.`;
        }

        if (preserveShadows) {
          nanoBananaEditPrompt += ` Maintain realistic shadows and reflections.`;
        }

        // Проверяем баланс
        const multipliers: string[] = [];
        if (selectedPrecision.id === "precise")
          multipliers.push("high-precision");
        if (selectedPrecision.id === "surgical")
          multipliers.push("surgical-precision");
        if (batchSize && batchSize > 1) multipliers.push(`batch-${batchSize}`);

        const balanceCheck = await checkBalanceBeforeArtifact(
          params.session || null,
          "image-generation",
          "image-to-image",
          multipliers,
          getOperationDisplayName("image-to-image")
        );

        if (!balanceCheck.valid) {
          console.log("🍌 ❌ INSUFFICIENT BALANCE, NOT CREATING ARTIFACT");
          return {
            error:
              balanceCheck.userMessage ||
              "Недостаточно средств для редактирования изображения",
            balanceError: true,
            requiredCredits: balanceCheck.cost,
          };
        }

        // Создаем параметры для документа
        const editParams = {
          prompt: nanoBananaEditPrompt,
          model: "gemini-2.5-flash-image",
          editType: selectedEditType,
          precisionLevel: selectedPrecision,
          blendMode: selectedBlendMode,
          sourceImageUrl: normalizedSourceUrl,
          seed: seed || undefined,
          batchSize: batchSize || 1,
          preserveOriginalStyle,
          enhanceLighting,
          preserveShadows,
          // Дополнительные параметры
          ...(objectToRemove && { objectToRemove }),
          ...(newBackground && { newBackground }),
          ...(textToAdd && { textToAdd }),
          ...(textStyle && { textStyle }),
          ...(targetStyle && { targetStyle }),
        };

        console.log(
          "🍌 ✅ CREATING NANO BANANA EDIT DOCUMENT WITH PARAMS:",
          editParams
        );

        try {
          // Используем Nano Banana Provider (Gemini + SuperDuperAI)
          console.log(
            "🍌 🚀 NANO BANANA: Using hybrid Gemini + SuperDuperAI approach for editing"
          );

          const { nanoBananaProvider } = await import(
            "../providers/nano-banana"
          );

          const nanoBananaParams = {
            editPrompt: nanoBananaEditPrompt,
            sourceImageUrl: normalizedSourceUrl,
            editType: selectedEditType.id,
            precisionLevel: selectedPrecision.id,
            blendMode: selectedBlendMode.id,
            preserveOriginalStyle,
            enhanceLighting,
            preserveShadows,
            nanoBananaEditFeatures: {
              enableContextAwareness: true,
              enableSurgicalPrecision: true,
              creativeMode: false,
              preserveOriginalStyle,
              enhanceLighting,
              preserveShadows,
            },
          };

          const result = await nanoBananaProvider.editImage(nanoBananaParams);

          console.log("🍌 ✅ NANO BANANA EDIT API RESULT:", result);

          return {
            ...result,
            message: `Редактирую изображение с помощью Nano Banana (Gemini + SuperDuperAI): "${editPrompt}". Тип: ${selectedEditType.label}, Точность: ${selectedPrecision.label}, Смешивание: ${selectedBlendMode.label}. Редактирование завершено.`,
            nanoBananaEditInfo: {
              model: "gemini-2.5-flash-image",
              editType: selectedEditType,
              precisionLevel: selectedPrecision,
              blendMode: selectedBlendMode,
              capabilities: [
                "Контекстно-осознанное редактирование",
                "Хирургическая точность",
                "Интеллектуальное освещение",
                "Сохранение стиля",
                "Естественное смешивание",
              ],
            },
          };
        } catch (error) {
          console.error("🍌 ❌ NANO BANANA EDIT API ERROR:", error);

          // Fallback на createDocument если Gemini API недоступен
          console.log(
            "🍌 🔄 FALLBACK: Using createDocument as fallback for editing"
          );

          const fallbackResult = await params.createDocument({
            session: params.session,
            dataStream: {
              title: JSON.stringify({
                ...editParams,
                nanoBananaEditFeatures: {
                  enableContextAwareness: true,
                  enableSurgicalPrecision: true,
                  preserveOriginalStyle,
                  enhanceLighting,
                  preserveShadows,
                },
                enhancedEditPrompt: nanoBananaEditPrompt,
                model: "gemini-2.5-flash-image",
                apiProvider: "google-gemini",
                fallback: true,
                error: error instanceof Error ? error.message : "Unknown error",
              }),
              kind: "image",
            },
          });

          return {
            ...fallbackResult,
            message: `Редактирую изображение с помощью Nano Banana (fallback mode): "${editPrompt}". Тип: ${selectedEditType.label}, Точность: ${selectedPrecision.label}, Смешивание: ${selectedBlendMode.label}. Артефакт создан.`,
            nanoBananaEditInfo: {
              model: "gemini-2.5-flash-image",
              editType: selectedEditType,
              precisionLevel: selectedPrecision,
              blendMode: selectedBlendMode,
              capabilities: [
                "Контекстно-осознанное редактирование",
                "Хирургическая точность",
                "Интеллектуальное освещение",
                "Сохранение стиля",
                "Естественное смешивание",
              ],
            },
            fallbackMode: true,
            note: "Используется fallback режим из-за ошибки Gemini API",
          };
        }
      } catch (error: any) {
        console.error("🍌 ❌ ERROR CREATING NANO BANANA EDIT DOCUMENT:", error);
        return {
          error: `Ошибка создания документа редактирования Nano Banana: ${error.message}`,
          fallbackConfig: config,
        };
      }
    },
  });
