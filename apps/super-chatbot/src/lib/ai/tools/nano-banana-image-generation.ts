import { tool } from 'ai';
import { z } from 'zod';
import { getImageGenerationConfig } from '@/lib/config/media-settings-factory';
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from '@/lib/utils/ai-tools-balance';
import type { Session } from 'next-auth';
import { analyzeImageContext } from '@/lib/ai/context';

interface CreateImageDocumentParams {
  createDocument: any;
  session?: Session | null;
  defaultSourceImageUrl?: string;
  chatId?: string;
  userMessage?: string;
  currentAttachments?: any[];
}

// Nano Banana специфичные стили и настройки
const NANO_BANANA_STYLES = [
  {
    id: 'realistic',
    label: 'Реалистичный',
    description: 'Фотореалистичные изображения',
  },
  {
    id: 'cinematic',
    label: 'Кинематографический',
    description: 'Киношный стиль с драматичным освещением',
  },
  { id: 'anime', label: 'Аниме', description: 'Японский анимационный стиль' },
  {
    id: 'cartoon',
    label: 'Мультфильм',
    description: 'Детский мультипликационный стиль',
  },
  { id: 'chibi', label: 'Чиби', description: 'Миниатюрный кавайный стиль' },
  {
    id: '3d-render',
    label: '3D Рендер',
    description: 'Трехмерная компьютерная графика',
  },
  {
    id: 'oil-painting',
    label: 'Масляная живопись',
    description: 'Классическая живопись маслом',
  },
  {
    id: 'watercolor',
    label: 'Акварель',
    description: 'Нежная акварельная техника',
  },
  { id: 'sketch', label: 'Эскиз', description: 'Карандашный набросок' },
  {
    id: 'digital-art',
    label: 'Цифровое искусство',
    description: 'Современное цифровое творчество',
  },
  {
    id: 'fantasy',
    label: 'Фэнтези',
    description: 'Магический фэнтезийный мир',
  },
  {
    id: 'sci-fi',
    label: 'Научная фантастика',
    description: 'Футуристический научно-фантастический стиль',
  },
  {
    id: 'steampunk',
    label: 'Стимпанк',
    description: 'Викторианская эпоха с технологиями',
  },
  {
    id: 'cyberpunk',
    label: 'Киберпанк',
    description: 'Неоновый футуристический стиль',
  },
  { id: 'vintage', label: 'Винтаж', description: 'Ретро стиль прошлых эпох' },
  {
    id: 'minimalist',
    label: 'Минимализм',
    description: 'Простой и чистый дизайн',
  },
  { id: 'abstract', label: 'Абстракция', description: 'Абстрактное искусство' },
  {
    id: 'portrait',
    label: 'Портрет',
    description: 'Фокус на лице и характере',
  },
  {
    id: 'landscape',
    label: 'Пейзаж',
    description: 'Природные и городские виды',
  },
  {
    id: 'macro',
    label: 'Макросъемка',
    description: 'Крупный план мелких объектов',
  },
  {
    id: 'night-photography',
    label: 'Ночная фотография',
    description: 'Съемка в условиях низкой освещенности',
  },
  {
    id: 'golden-hour',
    label: 'Золотой час',
    description: 'Мягкое теплое освещение на закате/рассвете',
  },
  {
    id: 'dramatic-lighting',
    label: 'Драматичное освещение',
    description: 'Контрастное театральное освещение',
  },
  {
    id: 'soft-lighting',
    label: 'Мягкое освещение',
    description: 'Рассеянное нежное освещение',
  },
  {
    id: 'high-contrast',
    label: 'Высокий контраст',
    description: 'Резкие переходы света и тени',
  },
  {
    id: 'monochrome',
    label: 'Монохром',
    description: 'Черно-белое изображение',
  },
  { id: 'sepia', label: 'Сепия', description: 'Винтажный коричневый оттенок' },
  {
    id: 'vibrant',
    label: 'Яркие цвета',
    description: 'Насыщенные и сочные цвета',
  },
  { id: 'pastel', label: 'Пастель', description: 'Мягкие приглушенные тона' },
  { id: 'neon', label: 'Неон', description: 'Яркие неоновые цвета' },
] as const;

const NANO_BANANA_QUALITY_LEVELS = [
  {
    id: 'standard',
    label: 'Стандартное',
    multiplier: 1.0,
    description: 'Базовое качество',
  },
  {
    id: 'high',
    label: 'Высокое',
    multiplier: 1.5,
    description: 'Улучшенное качество',
  },
  {
    id: 'ultra',
    label: 'Ультра',
    multiplier: 2.0,
    description: 'Максимальное качество',
  },
  {
    id: 'masterpiece',
    label: 'Шедевр',
    multiplier: 3.0,
    description: 'Профессиональное качество',
  },
] as const;

const NANO_BANANA_ASPECT_RATIOS = [
  {
    id: '1:1',
    label: 'Квадрат (1:1)',
    width: 1024,
    height: 1024,
    description: 'Квадратное изображение',
  },
  {
    id: '4:3',
    label: 'Классический (4:3)',
    width: 1024,
    height: 768,
    description: 'Классическое соотношение',
  },
  {
    id: '16:9',
    label: 'Широкоэкранный (16:9)',
    width: 1920,
    height: 1080,
    description: 'Широкоэкранный формат',
  },
  {
    id: '3:2',
    label: 'Фото (3:2)',
    width: 1536,
    height: 1024,
    description: 'Стандартное фото',
  },
  {
    id: '9:16',
    label: 'Вертикальный (9:16)',
    width: 768,
    height: 1366,
    description: 'Мобильный формат',
  },
  {
    id: '21:9',
    label: 'Ультраширокий (21:9)',
    width: 2560,
    height: 1080,
    description: 'Кинематографический',
  },
] as const;

export const nanoBananaImageGeneration = (params?: CreateImageDocumentParams) =>
  tool({
    description:
      'Генерация изображений с помощью Gemini-2.5-Flash-Image (Nano Banana) - передовой модели Google для создания и редактирования изображений. Поддерживает text-to-image и image-to-image генерацию с контекстно-осознанным редактированием.',
    inputSchema: z.object({
      prompt: z
        .string()
        .describe(
          'Детальное описание изображения для генерации. Nano Banana понимает контекст, освещение и физическую логику.',
        ),
      sourceImageUrl: z
        .string()
        .url()
        .optional()
        .describe(
          'URL исходного изображения для image-to-image генерации. Nano Banana может интеллектуально редактировать существующие изображения.',
        ),
      style: z
        .enum(NANO_BANANA_STYLES.map((s) => s.id) as [string, ...string[]])
        .optional()
        .describe(
          'Стиль изображения. Nano Banana поддерживает множество стилей от реалистичных до абстрактных.',
        ),
      quality: z
        .enum(
          NANO_BANANA_QUALITY_LEVELS.map((q) => q.id) as [string, ...string[]],
        )
        .optional()
        .default('high')
        .describe(
          'Уровень качества генерации. Влияет на детализацию и время обработки.',
        ),
      aspectRatio: z
        .enum(
          NANO_BANANA_ASPECT_RATIOS.map((a) => a.id) as [string, ...string[]],
        )
        .optional()
        .default('1:1')
        .describe('Соотношение сторон изображения.'),
      seed: z
        .number()
        .optional()
        .describe('Seed для воспроизводимых результатов'),
      batchSize: z
        .number()
        .min(1)
        .max(4)
        .optional()
        .default(1)
        .describe(
          'Количество изображений для генерации одновременно (1-4). Больше вариантов за один раз.',
        ),
      enableContextAwareness: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          'Включить контекстно-осознанное редактирование. Nano Banana понимает отношения между объектами и окружением.',
        ),
      enableSurgicalPrecision: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          'Включить хирургическую точность редактирования. Точная обработка окклюзий и границ.',
        ),
      creativeMode: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          'Включить творческий режим для более креативных и необычных результатов.',
        ),
    }),
    execute: async ({
      prompt,
      sourceImageUrl,
      style,
      quality,
      aspectRatio,
      seed,
      batchSize,
      enableContextAwareness,
      enableSurgicalPrecision,
      creativeMode,
    }) => {
      console.log('🍌 nanoBananaImageGeneration called with:', {
        prompt,
        style,
        quality,
        aspectRatio,
        batchSize,
        enableContextAwareness,
        enableSurgicalPrecision,
        creativeMode,
      });

      // Получаем конфигурацию изображений
      const config = await getImageGenerationConfig();

      // Если нет промпта, возвращаем панель конфигурации
      if (!prompt) {
        console.log(
          '🍌 No prompt provided, returning Nano Banana configuration panel',
        );
        return {
          ...config,
          nanoBananaStyles: NANO_BANANA_STYLES,
          nanoBananaQualityLevels: NANO_BANANA_QUALITY_LEVELS,
          nanoBananaAspectRatios: NANO_BANANA_ASPECT_RATIOS,
          model: 'gemini-2.5-flash-image',
          capabilities: [
            'Контекстно-осознанное редактирование',
            'Хирургическая точность',
            'Понимание физической логики',
            'Интеллектуальное освещение',
            'Мультимодальные входы',
            'Творческое партнерство',
          ],
        };
      }

      console.log(
        '🍌 ✅ PROMPT PROVIDED, CREATING NANO BANANA IMAGE DOCUMENT:',
        prompt,
      );

      if (!params?.createDocument) {
        console.log(
          '🍌 ❌ createDocument not available, returning basic config',
        );
        return config;
      }

      try {
        // Находим выбранные опции
        const selectedStyle = style
          ? NANO_BANANA_STYLES.find((s) => s.id === style) ||
            NANO_BANANA_STYLES[0]
          : NANO_BANANA_STYLES[0];

        const selectedQuality = quality
          ? NANO_BANANA_QUALITY_LEVELS.find((q) => q.id === quality) ||
            NANO_BANANA_QUALITY_LEVELS[1]
          : NANO_BANANA_QUALITY_LEVELS[1];

        const selectedAspectRatio = aspectRatio
          ? NANO_BANANA_ASPECT_RATIOS.find((a) => a.id === aspectRatio) ||
            NANO_BANANA_ASPECT_RATIOS[0]
          : NANO_BANANA_ASPECT_RATIOS[0];

        // Анализируем контекст изображения
        let normalizedSourceUrl = sourceImageUrl;

        if (params?.chatId && params?.userMessage) {
          try {
            console.log('🔍 Analyzing image context for Nano Banana...');
            const contextResult = await analyzeImageContext(
              params.userMessage,
              params.chatId,
              params.currentAttachments,
              params.session?.user?.id,
            );

            if (contextResult.sourceUrl && contextResult.confidence !== 'low') {
              console.log(
                '🔍 Using sourceUrl from context analysis:',
                contextResult.sourceUrl,
              );
              normalizedSourceUrl = contextResult.sourceUrl;
            }
          } catch (error) {
            console.warn('🔍 Error in context analysis, falling back:', error);
          }
        }

        // Определяем тип операции
        const operationType = normalizedSourceUrl
          ? 'image-to-image'
          : 'text-to-image';

        // Проверяем баланс
        const multipliers: string[] = [];
        if (selectedQuality.id === 'high') multipliers.push('high-quality');
        if (selectedQuality.id === 'ultra') multipliers.push('ultra-quality');
        if (selectedQuality.id === 'masterpiece')
          multipliers.push('masterpiece-quality');
        if (batchSize && batchSize > 1) multipliers.push(`batch-${batchSize}`);

        const balanceCheck = await checkBalanceBeforeArtifact(
          params.session || null,
          'image-generation',
          operationType,
          multipliers,
          getOperationDisplayName(operationType),
        );

        if (!balanceCheck.valid) {
          console.log('🍌 ❌ INSUFFICIENT BALANCE, NOT CREATING ARTIFACT');
          return {
            error:
              balanceCheck.userMessage ||
              'Недостаточно средств для генерации изображения',
            balanceError: true,
            requiredCredits: balanceCheck.cost,
          };
        }

        // Создаем промпт для Nano Banana
        let nanoBananaPrompt = prompt;

        // Добавляем стилевые указания
        if (selectedStyle.id !== 'realistic') {
          nanoBananaPrompt += `, ${selectedStyle.description.toLowerCase()}`;
        }

        // Добавляем качественные указания
        if (selectedQuality.id !== 'standard') {
          nanoBananaPrompt += `, ${selectedQuality.description.toLowerCase()}`;
        }

        // Добавляем указания по соотношению сторон
        nanoBananaPrompt += `, ${selectedAspectRatio.description.toLowerCase()}`;

        // Добавляем Nano Banana специфичные указания
        if (enableContextAwareness) {
          nanoBananaPrompt +=
            ', context-aware editing, intelligent lighting and reflections';
        }

        if (enableSurgicalPrecision) {
          nanoBananaPrompt +=
            ', surgical precision, perfect occlusion handling';
        }

        if (creativeMode) {
          nanoBananaPrompt +=
            ', creative interpretation, artistic vision, unique perspective';
        }

        // Создаем параметры для документа
        const imageParams = {
          prompt: nanoBananaPrompt,
          model: 'gemini-2.5-flash-image',
          style: selectedStyle,
          quality: selectedQuality,
          aspectRatio: selectedAspectRatio,
          seed: seed || undefined,
          batchSize: batchSize || 1,
          enableContextAwareness,
          enableSurgicalPrecision,
          creativeMode,
          ...(normalizedSourceUrl
            ? { sourceImageUrl: normalizedSourceUrl }
            : {}),
        };

        console.log(
          '🍌 ✅ CREATING NANO BANANA IMAGE DOCUMENT WITH PARAMS:',
          imageParams,
        );

        // Используем Nano Banana Provider (Gemini API)
        console.log('🍌 🚀 NANO BANANA: Using Gemini API');

        const { nanoBananaProvider } = await import(
          '../providers/nano-banana'
        );

        const nanoBananaParams = {
          prompt: nanoBananaPrompt,
          ...(normalizedSourceUrl && { sourceImageUrl: normalizedSourceUrl }),
          style: selectedStyle.id,
          quality: selectedQuality.id,
          aspectRatio: selectedAspectRatio.id,
          ...(seed && { seed }),
          nanoBananaFeatures: {
            enableContextAwareness,
            enableSurgicalPrecision,
            creativeMode,
          },
        };

        const result =
          await nanoBananaProvider.generateImage(nanoBananaParams);

        console.log('🍌 ✅ NANO BANANA API RESULT:', result);

        return {
          ...result,
          message: `Image generated successfully using Nano Banana (Gemini 2.5 Flash Image): "${prompt}". Style: ${selectedStyle.label}, Quality: ${selectedQuality.label}, Format: ${selectedAspectRatio.label}.`,
          nanoBananaInfo: {
            model: 'gemini-2.5-flash-image',
            capabilities: [
              'Context-aware editing',
              'Surgical precision',
              'Physical logic understanding',
              'Intelligent lighting',
            ],
            style: selectedStyle,
            quality: selectedQuality,
            aspectRatio: selectedAspectRatio,
          },
        };
      } catch (error: any) {
        console.error(
          '🍌 ❌ ERROR IN NANO BANANA IMAGE GENERATION:',
          error,
        );
        // Пробрасываем ошибку наружу без fallback
        throw error;
      }
    },
  });
