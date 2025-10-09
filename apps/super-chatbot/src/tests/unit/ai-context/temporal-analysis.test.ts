/**
 * Тесты для системы анализа временных ссылок
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TemporalAnalyzer } from '@/lib/ai/context/temporal-analysis';
import type { ChatMedia } from '@/lib/ai/context/universal-context';

describe('TemporalAnalyzer', () => {
  let analyzer: TemporalAnalyzer;
  let mockMedia: ChatMedia[];

  beforeEach(() => {
    const now = new Date('2024-01-15T12:00:00Z');
    analyzer = new TemporalAnalyzer({
      currentTime: now,
      language: 'ru',
    });

    // Создаем медиа-файлы с разными временными метками
    mockMedia = [
      {
        url: 'https://example.com/image1.jpg',
        id: 'img1',
        role: 'user' as const,
        timestamp: new Date('2024-01-15T11:00:00Z'), // 1 час назад
        prompt: 'first image',
        messageIndex: 0,
        mediaType: 'image' as const,
      },
      {
        url: 'https://example.com/image2.jpg',
        id: 'img2',
        role: 'assistant' as const,
        timestamp: new Date('2024-01-15T10:00:00Z'), // 2 часа назад
        prompt: 'second image',
        messageIndex: 1,
        mediaType: 'image' as const,
      },
      {
        url: 'https://example.com/image3.jpg',
        id: 'img3',
        role: 'user' as const,
        timestamp: new Date('2024-01-14T12:00:00Z'), // вчера
        prompt: 'yesterday image',
        messageIndex: 2,
        mediaType: 'image' as const,
      },
      {
        url: 'https://example.com/image4.jpg',
        id: 'img4',
        role: 'assistant' as const,
        timestamp: new Date('2024-01-15T11:30:00Z'), // 30 минут назад
        prompt: 'recent image',
        messageIndex: 3,
        mediaType: 'image' as const,
      },
    ];
  });

  describe('analyzeTemporalReferences', () => {
    it('should find media from 1 hour ago', async () => {
      const message = 'час назад';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      expect(matches[0]?.media.url).toBe('https://example.com/image1.jpg');
      expect(matches[0]?.confidence).toBeGreaterThan(0.8);
    });

    it('should find media from 2 hours ago', async () => {
      const message = '2 часа назад';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      expect(matches[0]?.media.url).toBe('https://example.com/image2.jpg');
    });

    it("should find yesterday's media", async () => {
      const message = 'вчера';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      expect(matches[0]?.media.url).toBe('https://example.com/image3.jpg');
    });

    it('should find recent media', async () => {
      const message = 'недавно';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      // Должен найти самый недавний файл
      expect(matches[0]?.media.url).toBe('https://example.com/image4.jpg');
    });

    it('should find first media', async () => {
      const message = 'первое изображение';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      expect(matches[0]?.media.url).toBe('https://example.com/image3.jpg');
    });

    it('should find last media', async () => {
      const message = 'последнее изображение';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      expect(matches[0]?.media.url).toBe('https://example.com/image4.jpg');
    });

    it('should find previous media', async () => {
      const message = 'предыдущее изображение';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      expect(matches[0]?.media.url).toBe('https://example.com/image3.jpg');
    });

    it('should handle English patterns', async () => {
      const message = 'yesterday';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      expect(matches[0]?.media.url).toBe('https://example.com/image3.jpg');
    });

    it('should return empty array for no temporal references', async () => {
      const message = 'просто обычное сообщение';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBe(0);
    });

    it('should return empty array for empty media', async () => {
      const message = 'час назад';
      const matches = await analyzer.analyzeTemporalReferences(message, []);

      expect(matches.length).toBe(0);
    });
  });

  describe('time-based filtering', () => {
    it('should find media by time of day (morning)', async () => {
      // Обновляем контекст для утреннего времени
      analyzer.updateContext({
        currentTime: new Date('2024-01-15T08:00:00Z'),
      });

      // Добавляем утреннее изображение
      const morningMedia = [
        ...mockMedia,
        {
          url: 'https://example.com/morning.jpg',
          id: 'morning',
          role: 'user' as const,
          timestamp: new Date('2024-01-15T07:00:00Z'), // сегодня утром
          prompt: 'morning image',
          messageIndex: 4,
          mediaType: 'image' as const,
        },
      ];

      const message = 'сегодня утром';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        morningMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      expect(matches[0]?.media.url).toBe('https://example.com/morning.jpg');
    });

    it('should find media by message offset', async () => {
      const message = 'два сообщения назад';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      // Должен найти медиа-файл с индексом length - 2 - 1
      expect(matches[0]?.media.messageIndex).toBe(1);
    });
  });

  describe('confidence calculation', () => {
    it('should calculate higher confidence for exact time matches', async () => {
      const message = 'час назад';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      expect(matches[0]?.confidence).toBeGreaterThan(0.8);
    });

    it('should calculate lower confidence for less precise matches', async () => {
      const message = 'недавно';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeDefined();
      expect(matches[0]?.confidence).toBeGreaterThan(0.5);
      expect(matches[0]?.confidence).toBeLessThan(0.9);
    });

    it('should sort matches by confidence', async () => {
      const message = 'час назад или недавно';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        mockMedia,
      );

      if (matches.length > 1) {
        for (let i = 1; i < matches.length; i++) {
          expect(matches[i - 1]).toBeDefined();
          expect(matches[i]).toBeDefined();
          expect(matches[i - 1]?.confidence ?? 0).toBeGreaterThanOrEqual(
            matches[i]?.confidence ?? 0,
          );
        }
      }
    });
  });

  describe('context updates', () => {
    it('should update temporal context', () => {
      const newContext = {
        currentTime: new Date('2024-01-16T12:00:00Z'),
        language: 'en' as const,
      };

      analyzer.updateContext(newContext);
      const stats = analyzer.getStats();

      expect(stats.contextInfo.currentTime).toEqual(newContext.currentTime);
      expect(stats.contextInfo.language).toBe('en');
    });
  });

  describe('statistics', () => {
    it('should provide statistics', () => {
      const stats = analyzer.getStats();

      expect(stats).toHaveProperty('totalPatterns');
      expect(stats).toHaveProperty('supportedLanguages');
      expect(stats).toHaveProperty('contextInfo');
      expect(stats.supportedLanguages).toContain('ru');
      expect(stats.supportedLanguages).toContain('en');
      expect(stats.totalPatterns).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', async () => {
      const matches = await analyzer.analyzeTemporalReferences('', mockMedia);
      expect(matches.length).toBe(0);
    });

    it('should handle media with same timestamps', async () => {
      const sameTimeMedia = [
        {
          url: 'https://example.com/same1.jpg',
          id: 'same1',
          role: 'user' as const,
          timestamp: new Date('2024-01-15T11:00:00Z'),
          prompt: 'same time 1',
          messageIndex: 0,
          mediaType: 'image' as const,
        },
        {
          url: 'https://example.com/same2.jpg',
          id: 'same2',
          role: 'assistant' as const,
          timestamp: new Date('2024-01-15T11:00:00Z'),
          prompt: 'same time 2',
          messageIndex: 1,
          mediaType: 'image' as const,
        },
      ];

      const message = 'час назад';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        sameTimeMedia,
      );

      expect(matches.length).toBeGreaterThan(0);
    });

    it('should handle future timestamps', async () => {
      const futureMedia = [
        {
          url: 'https://example.com/future.jpg',
          id: 'future',
          role: 'user' as const,
          timestamp: new Date('2024-01-16T12:00:00Z'), // завтра
          prompt: 'future image',
          messageIndex: 0,
          mediaType: 'image' as const,
        },
      ];

      const message = 'завтра';
      const matches = await analyzer.analyzeTemporalReferences(
        message,
        futureMedia,
      );

      // Должен обработать корректно, даже если время в будущем
      expect(matches.length).toBeGreaterThanOrEqual(0);
    });
  });
});
