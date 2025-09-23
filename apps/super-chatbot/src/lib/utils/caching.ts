/**
 * Утилиты для кэширования данных
 * Улучшают производительность за счет кэширования часто используемых данных
 */

import type { ComponentType } from "react";

// Простой in-memory кэш
class MemoryCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    // 5 минут по умолчанию
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    // Удаляем старые записи если кэш переполнен
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiry });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Очистка просроченных записей
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Получение всех ключей для статистики
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Глобальные кэши для разных типов данных
export const apiCache = new MemoryCache<any>(50, 2 * 60 * 1000); // 2 минуты
export const componentCache = new MemoryCache<ComponentType<any>>(
  20,
  10 * 60 * 1000
); // 10 минут
export const dataCache = new MemoryCache<any>(100, 5 * 60 * 1000); // 5 минут

// Утилита для кэширования API запросов
export function withApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = apiCache.get(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetcher().then((result) => {
    apiCache.set(key, result, ttl);
    return result;
  });
}

// Утилита для кэширования компонентов
export function withComponentCache<T extends ComponentType<any>>(
  key: string,
  component: T,
  ttl?: number
): T {
  const cached = componentCache.get(key);
  if (cached) {
    return cached as T;
  }

  componentCache.set(key, component, ttl);
  return component;
}

// Утилита для кэширования данных
export function withDataCache<T>(key: string, data: T, ttl?: number): T {
  const cached = dataCache.get(key);
  if (cached) {
    return cached as T;
  }

  dataCache.set(key, data, ttl);
  return data;
}

// Утилита для кэширования с автоматической инвалидацией
export function withAutoInvalidation<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number,
  invalidateKeys?: string[]
): Promise<T> {
  const cached = apiCache.get(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetcher().then((result) => {
    apiCache.set(key, result, ttl);

    // Инвалидируем связанные ключи
    if (invalidateKeys) {
      invalidateKeys.forEach((invalidateKey) => {
        apiCache.delete(invalidateKey);
      });
    }

    return result;
  });
}

// Утилита для кэширования с зависимостями
export function withDependencyCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  dependencies: string[],
  ttl?: number
): Promise<T> {
  // Проверяем зависимости
  const hasValidDependencies = dependencies.every((dep) => apiCache.has(dep));

  if (!hasValidDependencies) {
    // Если зависимости недействительны, очищаем кэш
    apiCache.delete(key);
  }

  return withApiCache(key, fetcher, ttl);
}

// Утилита для кэширования с тегами
export function withTaggedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  tags: string[],
  ttl?: number
): Promise<T> {
  const cached = apiCache.get(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetcher().then((result) => {
    apiCache.set(key, result, ttl);

    // Сохраняем теги для инвалидации
    tags.forEach((tag) => {
      const tagKey = `tag:${tag}`;
      const existingKeys = apiCache.get(tagKey) || [];
      if (!existingKeys.includes(key)) {
        apiCache.set(tagKey, [...existingKeys, key], ttl);
      }
    });

    return result;
  });
}

// Утилита для инвалидации по тегам
export function invalidateByTag(tag: string): void {
  const tagKey = `tag:${tag}`;
  const keys = apiCache.get(tagKey) || [];
  keys.forEach((key: string) => apiCache.delete(key));
  apiCache.delete(tagKey);
}

// Утилита для очистки всех кэшей
export function clearAllCaches(): void {
  apiCache.clear();
  componentCache.clear();
  dataCache.clear();
}

// Утилита для получения статистики кэша
export function getCacheStats() {
  return {
    api: {
      size: apiCache.size(),
      entries: apiCache.getKeys(),
    },
    component: {
      size: componentCache.size(),
      entries: componentCache.getKeys(),
    },
    data: {
      size: dataCache.size(),
      entries: dataCache.getKeys(),
    },
  };
}

// Автоматическая очистка кэша каждые 5 минут
if (typeof window !== "undefined") {
  setInterval(
    () => {
      apiCache.cleanup();
      componentCache.cleanup();
      dataCache.cleanup();
    },
    5 * 60 * 1000
  );
}
