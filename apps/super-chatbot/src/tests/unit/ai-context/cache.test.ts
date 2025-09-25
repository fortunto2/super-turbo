/**
 * Тесты для системы кэширования контекста
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  ContextCache,
  generateMessageHash,
  CacheUtils,
} from "@/lib/ai/context/cache";

describe("ContextCache", () => {
  let cache: ContextCache;

  beforeEach(() => {
    cache = new ContextCache();
  });

  afterEach(() => {
    cache.clear();
  });

  describe("Basic Operations", () => {
    it("should cache and retrieve context", async () => {
      const mockContext = {
        sourceUrl: "https://example.com/image.jpg",
        sourceId: "img123",
        mediaType: "image" as const,
        confidence: "high" as const,
        reasoning: "Test context",
      };

      const chatId = "test-chat";
      const messageHash = "test-hash";
      const mediaType = "image";

      // Кэшируем контекст
      await cache.setCachedContext(chatId, messageHash, mediaType, mockContext);

      // Получаем из кэша
      const retrievedContext = await cache.getCachedContext(
        chatId,
        messageHash,
        mediaType
      );

      expect(retrievedContext).toEqual(mockContext);
    });

    it("should return null for non-existent cache entry", async () => {
      const result = await cache.getCachedContext(
        "non-existent",
        "hash",
        "image"
      );
      expect(result).toBeNull();
    });

    it("should handle cache expiration", async () => {
      // Создаем кэш с очень коротким TTL
      const shortCache = new ContextCache();
      // @ts-ignore - доступ к приватному свойству для тестирования
      shortCache.ttl = 1; // 1ms

      const mockContext = {
        sourceUrl: "https://example.com/image.jpg",
        sourceId: "img123",
        mediaType: "image" as const,
        confidence: "high" as const,
        reasoning: "Test context",
      };

      await shortCache.setCachedContext("chat", "hash", "image", mockContext);

      // Ждем истечения TTL
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = await shortCache.getCachedContext("chat", "hash", "image");
      expect(result).toBeNull();
    });
  });

  describe("Statistics", () => {
    it("should track cache hits and misses", async () => {
      const mockContext = {
        sourceUrl: "https://example.com/image.jpg",
        sourceId: "img123",
        mediaType: "image" as const,
        confidence: "high" as const,
        reasoning: "Test context",
      };

      // Cache miss
      await cache.getCachedContext("chat", "hash1", "image");

      // Cache hit
      await cache.setCachedContext("chat", "hash1", "image", mockContext);
      await cache.getCachedContext("chat", "hash1", "image");

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.totalRequests).toBe(2);
      expect(stats.hitRate).toBe(0.5);
    });

    it("should reset statistics", () => {
      cache.resetStats();
      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.totalRequests).toBe(0);
    });
  });

  describe("Cache Management", () => {
    it("should clear chat-specific cache", async () => {
      const mockContext = {
        sourceUrl: "https://example.com/image.jpg",
        sourceId: "img123",
        mediaType: "image" as const,
        confidence: "high" as const,
        reasoning: "Test context",
      };

      await cache.setCachedContext("chat1", "hash1", "image", mockContext);
      await cache.setCachedContext("chat2", "hash2", "image", mockContext);

      cache.clearChatCache("chat1");

      const result1 = await cache.getCachedContext("chat1", "hash1", "image");
      const result2 = await cache.getCachedContext("chat2", "hash2", "image");

      expect(result1).toBeNull();
      expect(result2).toEqual(mockContext);
    });

    it("should handle cache size limits", async () => {
      // Создаем кэш с очень маленьким лимитом
      const smallCache = new ContextCache();
      // @ts-ignore - доступ к приватному свойству для тестирования
      smallCache.maxSize = 2;

      const mockContext = {
        sourceUrl: "https://example.com/image.jpg",
        sourceId: "img123",
        mediaType: "image" as const,
        confidence: "high" as const,
        reasoning: "Test context",
      };

      // Добавляем больше записей, чем позволяет лимит
      await smallCache.setCachedContext("chat", "hash1", "image", mockContext);
      await smallCache.setCachedContext("chat", "hash2", "image", mockContext);
      await smallCache.setCachedContext("chat", "hash3", "image", mockContext);

      const stats = smallCache.getStats();
      expect(stats.size).toBeLessThanOrEqual(2);
      expect(stats.evictions).toBeGreaterThan(0);
    });
  });
});

describe("generateMessageHash", () => {
  it("should generate consistent hash for same input", () => {
    const message = "test message";
    const attachments = [{ url: "https://example.com/image.jpg" }];

    const hash1 = generateMessageHash(message, attachments);
    const hash2 = generateMessageHash(message, attachments);

    expect(hash1).toBe(hash2);
    expect(hash1).toBeTypeOf("string");
    expect(hash1.length).toBeGreaterThan(0);
  });

  it("should generate different hashes for different inputs", () => {
    const message1 = "test message 1";
    const message2 = "test message 2";
    const attachments = [{ url: "https://example.com/image.jpg" }];

    const hash1 = generateMessageHash(message1, attachments);
    const hash2 = generateMessageHash(message2, attachments);

    expect(hash1).not.toBe(hash2);
  });

  it("should handle attachments in hash generation", () => {
    const message = "test message";
    const attachments1 = [{ url: "https://example.com/image1.jpg" }];
    const attachments2 = [{ url: "https://example.com/image2.jpg" }];

    const hash1 = generateMessageHash(message, attachments1);
    const hash2 = generateMessageHash(message, attachments2);

    expect(hash1).not.toBe(hash2);
  });
});

describe("CacheUtils", () => {
  it("should determine when to use cache", () => {
    expect(CacheUtils.shouldUseCache("test message")).toBe(true);
    expect(CacheUtils.shouldUseCache("ab")).toBe(false); // Too short
    expect(CacheUtils.shouldUseCache("test", new Array(15).fill({}))).toBe(
      false
    ); // Too many attachments
  });

  it("should generate cache keys for debugging", () => {
    const chatId = "test-chat";
    const message = "test message";
    const mediaType = "image";
    const attachments = [{ url: "https://example.com/image.jpg" }];

    const key = CacheUtils.getCacheKey(chatId, message, mediaType, attachments);

    expect(key).toContain(chatId);
    expect(key).toContain(mediaType);
    expect(key).toBeTypeOf("string");
  });
});
