import {
  analyzeImageContext,
  type ChatImage,
} from '../../lib/ai/chat/image-context';
import { semanticIndex } from '../../lib/ai/context/semantic-index';

describe('Real-world Semantic Search Scenarios', () => {
  // Симулируем реальный чат с разными изображениями
  const realChatImages: ChatImage[] = [
    {
      url: 'https://example.com/rocket-launch.jpg',
      id: 'img1',
      role: 'assistant',
      timestamp: new Date('2024-01-01T10:00:00Z'),
      prompt: 'фото с ракетой на стартовой площадке в космическом центре',
      messageIndex: 1,
      mediaType: 'image',
    },
    {
      url: 'https://example.com/sunset-beach.jpg',
      id: 'img2',
      role: 'assistant',
      timestamp: new Date('2024-01-01T10:05:00Z'),
      prompt: 'закат на пляже с ярким солнцем и оранжевым небом',
      messageIndex: 3,
      mediaType: 'image',
    },
    {
      url: 'https://example.com/cat-window.jpg',
      id: 'img3',
      role: 'assistant',
      timestamp: new Date('2024-01-01T10:10:00Z'),
      prompt: 'рыжий кот сидит на подоконнике и смотрит в окно',
      messageIndex: 5,
      mediaType: 'image',
    },
    {
      url: 'https://example.com/forest-path.jpg',
      id: 'img4',
      role: 'assistant',
      timestamp: new Date('2024-01-01T10:15:00Z'),
      prompt: 'тропинка в густом лесу с высокими деревьями',
      messageIndex: 7,
      mediaType: 'image',
    },
    {
      url: 'https://example.com/moon-night.jpg',
      id: 'img5',
      role: 'assistant',
      timestamp: new Date('2024-01-01T10:20:00Z'),
      prompt: 'полная луна в ночном небе со звездами',
      messageIndex: 9,
      mediaType: 'image',
    },
    {
      url: 'https://example.com/latest-abstract.jpg',
      id: 'img6',
      role: 'assistant',
      timestamp: new Date('2024-01-01T10:25:00Z'),
      prompt: 'абстрактная композиция с геометрическими фигурами',
      messageIndex: 11,
      mediaType: 'image',
    },
  ];

  beforeEach(() => {
    // Очищаем семантический индекс
    semanticIndex.clearChat('real-chat');

    // Добавляем все изображения в индекс
    realChatImages.forEach((image) => {
      semanticIndex.addImage(image);
    });
  });

  describe('Rocket scenarios', () => {
    test('should find rocket image when asking to modify rocket photo', async () => {
      const result = await analyzeImageContext(
        'измени фото с ракетой',
        realChatImages,
      );

      expect(result.sourceImageUrl).toBe(
        'https://example.com/rocket-launch.jpg',
      );
      expect(result.confidence).toBe('high');
      expect(result.reasoning).toContain('семантический поиск');
    });

    test('should find rocket image with different wording', async () => {
      const result = await analyzeImageContext(
        'возьми изображение ракеты',
        realChatImages,
      );

      expect(result.sourceImageUrl).toBe(
        'https://example.com/rocket-launch.jpg',
      );
      expect(result.confidence).toBe('high');
    });

    test('should find rocket image with English query', async () => {
      const result = await analyzeImageContext(
        'use the rocket image',
        realChatImages,
      );

      expect(result.sourceImageUrl).toBe(
        'https://example.com/rocket-launch.jpg',
      );
      expect(result.confidence).toBe('high');
    });
  });

  describe('Sun scenarios', () => {
    test('should find sun image when asking to modify sunset photo', async () => {
      const result = await analyzeImageContext(
        'измени фото с солнцем',
        realChatImages,
      );

      expect(result.sourceImageUrl).toBe(
        'https://example.com/sunset-beach.jpg',
      );
      expect(result.confidence).toBe('high');
      expect(result.reasoning).toContain('семантический поиск');
    });

    test('should find sun image with different wording', async () => {
      const result = await analyzeImageContext(
        'возьми изображение заката',
        realChatImages,
      );

      expect(result.sourceImageUrl).toBe(
        'https://example.com/sunset-beach.jpg',
      );
      expect(result.confidence).toBe('high');
    });
  });

  describe('Cat scenarios', () => {
    test('should find cat image when asking to modify cat photo', async () => {
      const result = await analyzeImageContext(
        'измени фото кота',
        realChatImages,
      );

      expect(result.sourceImageUrl).toBe('https://example.com/cat-window.jpg');
      expect(result.confidence).toBe('high');
      expect(result.reasoning).toContain('семантический поиск');
    });

    test('should find cat image with different wording', async () => {
      const result = await analyzeImageContext(
        'возьми изображение кота на подоконнике',
        realChatImages,
      );

      expect(result.sourceImageUrl).toBe('https://example.com/cat-window.jpg');
      expect(result.confidence).toBe('high');
    });
  });

  describe('Moon scenarios', () => {
    test('should find moon image when asking to modify moon photo', async () => {
      const result = await analyzeImageContext(
        'измени фото с луной',
        realChatImages,
      );

      expect(result.sourceImageUrl).toBe('https://example.com/moon-night.jpg');
      expect(result.confidence).toBe('high');
      expect(result.reasoning).toContain('семантический поиск');
    });

    test('should find moon image with different wording', async () => {
      const result = await analyzeImageContext(
        'возьми ночное небо',
        realChatImages,
      );

      expect(result.sourceImageUrl).toBe('https://example.com/moon-night.jpg');
      expect(result.confidence).toBe('high');
    });
  });

  describe('Complex scenarios', () => {
    test('should prioritize semantic search over last generated', async () => {
      const result = await analyzeImageContext(
        'возьми сгенерированное изображение с ракетой',
        realChatImages,
      );

      // Должно найти ракету, а не последнее абстрактное изображение
      expect(result.sourceImageUrl).toBe(
        'https://example.com/rocket-launch.jpg',
      );
      expect(result.confidence).toBe('high');
    });

    test('should handle multiple semantic matches and rank by relevance', async () => {
      const result = await analyzeImageContext(
        'измени изображение с космической тематикой',
        realChatImages,
      );

      // Должно найти либо ракету, либо луну (оба космические)
      expect([
        'https://example.com/rocket-launch.jpg',
        'https://example.com/moon-night.jpg',
      ]).toContain(result.sourceImageUrl);
      expect(result.confidence).toBe('high');
    });

    test('should fallback to last image when no semantic match', async () => {
      const result = await analyzeImageContext(
        'измени изображение с машиной',
        realChatImages,
      );

      // Должно вернуться к последнему изображению
      expect(result.sourceImageUrl).toBe(
        'https://example.com/latest-abstract.jpg',
      );
      expect(result.confidence).toBe('low');
      expect(result.reasoning).toContain('последнее изображение');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty query gracefully', async () => {
      const result = await analyzeImageContext('', realChatImages);

      expect(result.sourceImageUrl).toBe(
        'https://example.com/latest-abstract.jpg',
      );
      expect(result.confidence).toBe('low');
    });

    test('should handle query with no matching images', async () => {
      const result = await analyzeImageContext(
        'измени изображение с динозавром',
        realChatImages,
      );

      expect(result.sourceImageUrl).toBe(
        'https://example.com/latest-abstract.jpg',
      );
      expect(result.confidence).toBe('low');
    });
  });
});
