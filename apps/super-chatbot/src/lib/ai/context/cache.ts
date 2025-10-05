/**
 * Система кэширования контекста для улучшения производительности
 * Кэширует результаты анализа контекста изображений, видео и аудио
 */

import type { MediaContext } from "./universal-context";

interface CachedContext {
  context: MediaContext;
  timestamp: number;
  messageHash: string;
  chatId: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
}

/**
 * Кэш для хранения результатов анализа контекста
 */
export class ContextCache {
  private cache = new Map<string, CachedContext>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
  };

  // Настройки кэша
  private maxSize = 1000; // Максимальное количество записей
  private readonly ttl = 300000; // 5 минут в миллисекундах
  private readonly cleanupInterval = 60000; // 1 минута

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    // Запускаем периодическую очистку устаревших записей
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Получает кэшированный контекст
   */
  async getCachedContext(
    chatId: string,
    messageHash: string,
    mediaType: string
  ): Promise<MediaContext | null> {
    this.stats.totalRequests++;

    const key = this.generateKey(chatId, messageHash, mediaType);
    const cached = this.cache.get(key);

    if (cached && this.isValid(cached)) {
      this.stats.hits++;
      console.log(
        `🎯 ContextCache: Cache HIT for ${mediaType} in chat ${chatId}`
      );
      return cached.context;
    }

    if (cached) {
      // Запись устарела, удаляем
      this.cache.delete(key);
      this.stats.evictions++;
    }

    this.stats.misses++;
    console.log(
      `❌ ContextCache: Cache MISS for ${mediaType} in chat ${chatId}`
    );
    return null;
  }

  /**
   * Сохраняет контекст в кэш
   */
  async setCachedContext(
    chatId: string,
    messageHash: string,
    mediaType: string,
    context: MediaContext
  ): Promise<void> {
    const key = this.generateKey(chatId, messageHash, mediaType);

    // Проверяем, не превышает ли кэш максимальный размер
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const cachedContext: CachedContext = {
      context,
      timestamp: Date.now(),
      messageHash,
      chatId,
    };

    this.cache.set(key, cachedContext);
    console.log(
      `💾 ContextCache: Cached ${mediaType} context for chat ${chatId}`
    );
  }

  /**
   * Генерирует ключ для кэша
   */
  private generateKey(
    chatId: string,
    messageHash: string,
    mediaType: string
  ): string {
    return `${chatId}:${mediaType}:${messageHash}`;
  }

  /**
   * Проверяет, действительна ли кэшированная запись
   */
  private isValid(cached: CachedContext): boolean {
    return Date.now() - cached.timestamp < this.ttl;
  }

  /**
   * Удаляет устаревшие записи из кэша
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.ttl) {
        this.cache.delete(key);
        cleaned++;
        this.stats.evictions++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 ContextCache: Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Удаляет самую старую запись при превышении лимита
   */
  private evictOldest(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, cached] of this.cache.entries()) {
      if (cached.timestamp < oldestTime) {
        oldestTime = cached.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      console.log(`🗑️ ContextCache: Evicted oldest entry: ${oldestKey}`);
    }
  }

  /**
   * Очищает кэш для конкретного чата
   */
  clearChatCache(chatId: string): void {
    let cleared = 0;

    for (const [key, cached] of this.cache.entries()) {
      if (cached.chatId === chatId) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(
        `🧹 ContextCache: Cleared ${cleared} entries for chat ${chatId}`
      );
    }
  }

  /**
   * Получает статистику кэша
   */
  getStats(): CacheStats & { size: number; hitRate: number } {
    const hitRate =
      this.stats.totalRequests > 0
        ? this.stats.hits / this.stats.totalRequests
        : 0;

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Сбрасывает статистику
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
    };
  }

  /**
   * Полностью очищает кэш
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🧹 ContextCache: Cleared entire cache (${size} entries)`);
  }
}

/**
 * Генерирует хэш сообщения для кэширования
 */
export function generateMessageHash(
  message: string,
  attachments?: any[]
): string {
  const crypto = require("node:crypto");

  // Создаем строку для хэширования
  let hashInput = message.toLowerCase().trim();

  // Добавляем информацию о вложениях
  if (attachments && attachments.length > 0) {
    const attachmentInfo = attachments
      .map((att) => `${att.url || ""}:${att.contentType || ""}`)
      .sort()
      .join("|");
    hashInput += `|attachments:${attachmentInfo}`;
  }

  // Генерируем MD5 хэш
  return crypto.createHash("md5").update(hashInput).digest("hex");
}

/**
 * Глобальный экземпляр кэша
 */
export const contextCache = new ContextCache();

/**
 * Проверяет, нужно ли использовать кэш для данного запроса
 */
export function shouldUseCache(message: string, attachments?: any[]): boolean {
  // Не кэшируем очень короткие сообщения
  if (message.trim().length < 3) return false;

  // Не кэшируем сообщения с большим количеством вложений
  if (attachments && attachments.length > 10) return false;

  // Кэшируем все остальные запросы
  return true;
}

/**
 * Получает ключ кэша для отладки
 */
export function getCacheKey(
  chatId: string,
  message: string,
  mediaType: string,
  attachments?: any[]
): string {
  const messageHash = generateMessageHash(message, attachments);
  return `${chatId}:${mediaType}:${messageHash}`;
}
