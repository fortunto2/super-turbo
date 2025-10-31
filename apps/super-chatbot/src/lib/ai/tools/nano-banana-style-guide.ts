import { tool } from 'ai';
import { z } from 'zod';

// Стили и примеры из awesome-nano-banana репозитория
const NANO_BANANA_STYLE_CATEGORIES = [
  {
    id: 'realistic',
    label: 'Реалистичный',
    description: 'Фотореалистичные изображения с высокой детализацией',
    examples: [
      {
        title: '3D Chibi Proposal Scene',
        prompt:
          'Transform the two people in the photo into chibi-style 3D cartoon characters. Change the scene to a proposal setting, with a soft pastel-colored floral arch in the background. Use romantic tones for the overall background. Rose petals are scattered on the ground. While the characters are rendered in cute chibi 3D style, the environment—including the arch, lighting, and textures—should be realistic and photorealistic.',
        tags: ['chibi', '3d', 'proposal', 'romantic', 'realistic'],
        difficulty: 'intermediate',
      },
      {
        title: '3D Photo Frame',
        prompt:
          'Convert the character in the scene into a 3D chibi-style figure, placed inside a Polaroid photo. The photo paper is being held by a human hand. The character is stepping out of the Polaroid frame, creating a visual effect of breaking through the two-dimensional photo border and entering the real-world 3D space.',
        tags: ['3d', 'chibi', 'polaroid', 'breakout', 'realistic'],
        difficulty: 'advanced',
      },
    ],
  },
  {
    id: 'cinematic',
    label: 'Кинематографический',
    description: 'Драматичные сцены с профессиональным освещением',
    examples: [
      {
        title: 'Dramatic Portrait',
        prompt:
          'A dramatic portrait with cinematic lighting, golden hour atmosphere, professional photography, high contrast, shallow depth of field, award-winning composition',
        tags: ['portrait', 'cinematic', 'dramatic', 'lighting', 'professional'],
        difficulty: 'beginner',
      },
    ],
  },
  {
    id: 'artistic',
    label: 'Художественный',
    description: 'Творческие и креативные интерпретации',
    examples: [
      {
        title: 'Abstract Art',
        prompt:
          'Create an abstract artistic interpretation with vibrant colors, flowing forms, creative composition, unique perspective, inspired by modern art movements',
        tags: ['abstract', 'artistic', 'creative', 'vibrant', 'modern'],
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'fantasy',
    label: 'Фэнтези',
    description: 'Магические и фантастические сцены',
    examples: [
      {
        title: 'Fantasy Landscape',
        prompt:
          'A magical fantasy landscape with floating islands, mystical creatures, ethereal lighting, otherworldly atmosphere, detailed fantasy art style',
        tags: ['fantasy', 'magical', 'landscape', 'mystical', 'ethereal'],
        difficulty: 'advanced',
      },
    ],
  },
  {
    id: 'sci-fi',
    label: 'Научная фантастика',
    description: 'Футуристические и технологические сцены',
    examples: [
      {
        title: 'Cyberpunk City',
        prompt:
          'A cyberpunk cityscape at night with neon lights, futuristic architecture, rain-soaked streets, atmospheric fog, high-tech elements, vibrant neon colors',
        tags: ['cyberpunk', 'futuristic', 'neon', 'cityscape', 'atmospheric'],
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'portrait',
    label: 'Портрет',
    description: 'Фокус на лицах и характерах',
    examples: [
      {
        title: 'Professional Portrait',
        prompt:
          'A professional portrait with studio lighting, sharp focus on eyes, natural expression, high resolution, commercial photography quality, clean background',
        tags: ['portrait', 'professional', 'studio', 'sharp', 'commercial'],
        difficulty: 'beginner',
      },
    ],
  },
  {
    id: 'landscape',
    label: 'Пейзаж',
    description: 'Природные и городские виды',
    examples: [
      {
        title: 'Mountain Landscape',
        prompt:
          'A breathtaking mountain landscape at sunrise, golden hour lighting, misty valleys, dramatic clouds, wide-angle view, nature photography, high resolution',
        tags: ['landscape', 'mountains', 'sunrise', 'golden hour', 'nature'],
        difficulty: 'beginner',
      },
    ],
  },
  {
    id: 'macro',
    label: 'Макросъемка',
    description: 'Крупный план мелких объектов',
    examples: [
      {
        title: 'Macro Flower',
        prompt:
          'A macro photograph of a flower with water droplets, extreme close-up, shallow depth of field, natural lighting, detailed texture, macro photography',
        tags: ['macro', 'flower', 'close-up', 'water droplets', 'texture'],
        difficulty: 'intermediate',
      },
    ],
  },
] as const;

// Техники Nano Banana
const NANO_BANANA_TECHNIQUES = [
  {
    id: 'context-aware-editing',
    label: 'Контекстно-осознанное редактирование',
    description: 'Nano Banana понимает отношения между объектами и окружением',
    tips: [
      'Описывайте контекст сцены и отношения между объектами',
      'Указывайте, как изменения влияют на освещение и отражения',
      'Учитывайте физическую логику сцены',
    ],
    example:
      'Replace the background with a beach scene while maintaining the original lighting on the subject and adjusting reflections naturally',
  },
  {
    id: 'surgical-precision',
    label: 'Хирургическая точность',
    description: 'Точное добавление или удаление объектов',
    tips: [
      'Будьте конкретны в описании того, что нужно изменить',
      'Указывайте точное расположение и размеры',
      'Описывайте, как объекты должны взаимодействовать с окружением',
    ],
    example:
      'Add a small bird on the left branch of the tree, positioned naturally with proper shadows and perspective',
  },
  {
    id: 'lighting-mastery',
    label: 'Мастерство освещения',
    description: 'Интеллектуальное управление освещением',
    tips: [
      'Описывайте тип освещения (естественное, искусственное, драматичное)',
      'Указывайте направление света и его интенсивность',
      'Учитывайте, как освещение влияет на настроение сцены',
    ],
    example:
      'Change the lighting to dramatic sunset with warm golden tones, creating long shadows and atmospheric glow',
  },
  {
    id: 'physical-logic',
    label: 'Физическая логика',
    description: 'Понимание физических свойств и логики',
    tips: [
      'Описывайте физические свойства материалов',
      'Учитывайте гравитацию, вес и движение объектов',
      'Обеспечивайте реалистичность взаимодействий',
    ],
    example:
      'Add a glass of water on the table, showing realistic refraction and reflections, with water surface tension visible',
  },
] as const;

// Уровни сложности
const DIFFICULTY_LEVELS = [
  {
    id: 'beginner',
    label: 'Начинающий',
    description: 'Простые промпты с базовыми техниками',
    color: 'green',
  },
  {
    id: 'intermediate',
    label: 'Средний',
    description: 'Средней сложности с несколькими техниками',
    color: 'yellow',
  },
  {
    id: 'advanced',
    label: 'Продвинутый',
    description: 'Сложные промпты с множественными техниками',
    color: 'red',
  },
] as const;

// Популярные теги
const POPULAR_TAGS = [
  'realistic',
  'cinematic',
  'artistic',
  'fantasy',
  'sci-fi',
  'portrait',
  'landscape',
  '3d',
  'chibi',
  'dramatic',
  'soft',
  'vibrant',
  'moody',
  'minimalist',
  'abstract',
  'professional',
  'high resolution',
  'sharp focus',
  'excellent composition',
  'golden hour',
  'dramatic lighting',
  'atmospheric',
  'ethereal',
  'mystical',
] as const;

export const nanoBananaStyleGuide = tool({
  description:
    'Руководство по стилям и техникам для Gemini-2.5-Flash-Image (Nano Banana). Предоставляет примеры, техники и советы из awesome-nano-banana репозитория для создания лучших промптов.',
  inputSchema: z.object({
    category: z
      .enum(
        NANO_BANANA_STYLE_CATEGORIES.map((c) => c.id) as [string, ...string[]],
      )
      .optional()
      .describe('Категория стиля для получения примеров и техник.'),
    technique: z
      .enum(NANO_BANANA_TECHNIQUES.map((t) => t.id) as [string, ...string[]])
      .optional()
      .describe('Конкретная техника Nano Banana для изучения.'),
    difficulty: z
      .enum(DIFFICULTY_LEVELS.map((d) => d.id) as [string, ...string[]])
      .optional()
      .describe('Уровень сложности примеров для показа.'),
    tags: z
      .array(z.string())
      .optional()
      .describe('Теги для фильтрации примеров.'),
    searchQuery: z
      .string()
      .optional()
      .describe('Поисковый запрос для поиска по примерам и техникам.'),
    includeTips: z
      .boolean()
      .optional()
      .default(true)
      .describe('Включить советы и рекомендации.'),
    includeExamples: z
      .boolean()
      .optional()
      .default(true)
      .describe('Включить примеры промптов.'),
    limit: z
      .number()
      .min(1)
      .max(20)
      .optional()
      .default(10)
      .describe('Максимальное количество примеров для показа.'),
  }),
  execute: async ({
    category,
    technique,
    difficulty,
    tags,
    searchQuery,
    includeTips,
    includeExamples,
    limit,
  }) => {
    console.log('🍌 nanoBananaStyleGuide called with:', {
      category,
      technique,
      difficulty,
      tags,
      searchQuery,
      includeTips,
      includeExamples,
      limit,
    });

    try {
      let filteredCategories = NANO_BANANA_STYLE_CATEGORIES;
      let filteredTechniques = NANO_BANANA_TECHNIQUES;
      let filteredExamples: any[] = [];

      // Фильтрация по категории
      if (category) {
        filteredCategories = filteredCategories.filter(
          (c) => c.id === category,
        ) as any;
      }

      // Фильтрация по технике
      if (technique) {
        filteredTechniques = filteredTechniques.filter(
          (t) => t.id === technique,
        ) as any;
      }

      // Сбор примеров из всех категорий
      filteredCategories.forEach((cat) => {
        if (cat.examples) {
          filteredExamples.push(
            ...cat.examples.map((example) => ({
              ...example,
              category: cat,
            })),
          );
        }
      });

      // Фильтрация по сложности
      if (difficulty) {
        filteredExamples = filteredExamples.filter(
          (ex) => ex.difficulty === difficulty,
        );
      }

      // Фильтрация по тегам
      if (tags && tags.length > 0) {
        filteredExamples = filteredExamples.filter((ex) =>
          tags.some((tag) => ex.tags.includes(tag)),
        );
      }

      // Поиск по запросу
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredExamples = filteredExamples.filter(
          (ex) =>
            ex.title.toLowerCase().includes(query) ||
            ex.prompt.toLowerCase().includes(query) ||
            ex.tags.some((tag: string) => tag.toLowerCase().includes(query)),
        );
      }

      // Ограничение количества
      filteredExamples = filteredExamples.slice(0, limit);

      // Формируем результат
      const result: any = {
        categories: filteredCategories,
        techniques: filteredTechniques,
        examples: includeExamples ? filteredExamples : [],
        popularTags: POPULAR_TAGS,
        difficultyLevels: DIFFICULTY_LEVELS,
        totalExamples: filteredExamples.length,
        searchQuery,
        filters: {
          category,
          technique,
          difficulty,
          tags,
        },
      };

      // Добавляем советы если запрошены
      if (includeTips) {
        result.tips = {
          general: [
            'Используйте конкретные и детальные описания',
            'Указывайте стиль, освещение и композицию',
            'Добавляйте качественные дескрипторы',
            'Учитывайте физическую логику сцены',
            'Экспериментируйте с разными техниками',
          ],
          nanoBananaSpecific: [
            'Nano Banana понимает контекст - описывайте отношения между объектами',
            'Используйте хирургическую точность в описаниях изменений',
            'Указывайте, как освещение должно измениться после редактирования',
            'Описывайте физические свойства материалов и объектов',
            'Поощряйте творческую интерпретацию AI',
          ],
        };
      }

      // Добавляем рекомендации
      result.recommendations = {
        forBeginners: filteredExamples
          .filter((ex) => ex.difficulty === 'beginner')
          .slice(0, 3),
        forAdvanced: filteredExamples
          .filter((ex) => ex.difficulty === 'advanced')
          .slice(0, 3),
        mostPopular: filteredExamples.slice(0, 5),
      };

      // Добавляем статистику
      result.statistics = {
        totalCategories: NANO_BANANA_STYLE_CATEGORIES.length,
        totalTechniques: NANO_BANANA_TECHNIQUES.length,
        totalExamples: NANO_BANANA_STYLE_CATEGORIES.reduce(
          (sum, cat) => sum + (cat.examples?.length || 0),
          0,
        ),
        filteredExamples: filteredExamples.length,
        difficultyDistribution: {
          beginner: filteredExamples.filter(
            (ex) => ex.difficulty === 'beginner',
          ).length,
          intermediate: filteredExamples.filter(
            (ex) => ex.difficulty === 'intermediate',
          ).length,
          advanced: filteredExamples.filter(
            (ex) => ex.difficulty === 'advanced',
          ).length,
        },
      };

      console.log('✅ Style guide generated:', {
        categories: filteredCategories.length,
        techniques: filteredTechniques.length,
        examples: filteredExamples.length,
      });

      return result;
    } catch (error) {
      console.error('❌ Error in Nano Banana style guide:', error);
      return {
        error: `Ошибка генерации руководства по стилям: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        fallback: true,
        categories: NANO_BANANA_STYLE_CATEGORIES,
        techniques: NANO_BANANA_TECHNIQUES,
        examples: [],
      };
    }
  },
});
