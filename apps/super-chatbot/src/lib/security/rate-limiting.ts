/**
 * Система ограничения скорости запросов (Rate Limiting)
 * Защищает от DDoS атак и злоупотреблений
 */

import { type NextRequest, NextResponse } from 'next/server';

// Интерфейсы для конфигурации rate limiting
export interface RateLimitConfig {
  windowMs: number; // Временное окно в миллисекундах
  maxRequests: number; // Максимальное количество запросов
  keyGenerator?: (req: NextRequest) => string; // Функция генерации ключа
  skipSuccessfulRequests?: boolean; // Пропускать успешные запросы
  skipFailedRequests?: boolean; // Пропускать неудачные запросы
}

// Интерфейс для хранения данных о запросах
interface RateLimitData {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// In-memory хранилище для rate limiting (в продакшене лучше использовать Redis)
class RateLimitStore {
  private store = new Map<string, RateLimitData>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Очищаем устаревшие записи каждые 5 минут
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }

  get(key: string): RateLimitData | undefined {
    return this.store.get(key);
  }

  set(key: string, data: RateLimitData): void {
    this.store.set(key, data);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (data.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Глобальное хранилище
const rateLimitStore = new RateLimitStore();

// Предустановленные конфигурации для разных типов запросов
export const RATE_LIMIT_CONFIGS = {
  // Общие API запросы
  API: {
    windowMs: 15 * 60 * 1000, // 15 минут
    maxRequests: 100,
  },

  // Генерация контента (более строгие ограничения)
  GENERATION: {
    windowMs: 60 * 60 * 1000, // 1 час
    maxRequests: 10,
  },

  // Аутентификация
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 минут
    maxRequests: 5,
  },

  // Админские операции
  ADMIN: {
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 20,
  },

  // Загрузка файлов
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 час
    maxRequests: 50,
  },

  // WebSocket соединения
  WEBSOCKET: {
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 30,
  },
} as const;

/**
 * Генерирует ключ на основе IP адреса
 */
export function generateKeyByIP(req: NextRequest): string {
  const ip = (req as any).ip || req.headers.get('x-forwarded-for') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Генерирует ключ на основе IP и User-Agent
 */
export function generateKeyByIPAndUserAgent(req: NextRequest): string {
  const ip = (req as any).ip || req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `ip_ua:${ip}:${userAgent}`;
}

/**
 * Генерирует ключ на основе IP и пути запроса
 */
export function generateKeyByIPAndPath(req: NextRequest): string {
  const ip = (req as any).ip || req.headers.get('x-forwarded-for') || 'unknown';
  const path = req.nextUrl.pathname;
  return `ip_path:${ip}:${path}`;
}

/**
 * Генерирует ключ на основе пользователя (требует аутентификации)
 */
export function generateKeyByUser(req: NextRequest): string {
  const userId = req.headers.get('x-user-id') || 'anonymous';
  return `user:${userId}`;
}

/**
 * Генерирует ключ на основе пользователя и действия
 */
export function generateKeyByUserAndAction(req: NextRequest): string {
  const userId = req.headers.get('x-user-id') || 'anonymous';
  const action = req.nextUrl.pathname.split('/').pop() || 'unknown';
  return `user_action:${userId}:${action}`;
}

// Основной класс для rate limiting
export class RateLimiter {
  private config: RateLimitConfig;
  private store: RateLimitStore;

  constructor(config: RateLimitConfig, store: RateLimitStore = rateLimitStore) {
    this.config = config;
    this.store = store;
  }

  /**
   * Проверяет, не превышен ли лимит запросов
   */
  check(req: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const key = this.config.keyGenerator?.(req) || generateKeyByIP(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    let data = this.store.get(key);

    // Если данных нет или окно сбросилось, создаем новые
    if (!data || data.resetTime < now) {
      data = {
        count: 0,
        resetTime: now + this.config.windowMs,
        blocked: false,
      };
    }

    // Увеличиваем счетчик
    data.count++;

    // Проверяем лимит
    const allowed = data.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - data.count);
    const resetTime = data.resetTime;

    // Если лимит превышен, блокируем
    if (!allowed) {
      data.blocked = true;
    }

    // Сохраняем данные
    this.store.set(key, data);

    return {
      allowed,
      remaining,
      resetTime,
      ...(allowed ? {} : { retryAfter: Math.ceil((resetTime - now) / 1000) }),
    };
  }

  /**
   * Создает middleware для Next.js API routes
   */
  createMiddleware() {
    return (req: NextRequest) => {
      const result = this.check(req);

      if (!result.allowed) {
        return NextResponse.json(
          {
            error: 'Too Many Requests',
            message: 'Превышен лимит запросов. Попробуйте позже.',
            retryAfter: result.retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': result.retryAfter?.toString() || '60',
              'X-RateLimit-Limit': this.config.maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            },
          },
        );
      }

      return NextResponse.next({
        headers: {
          'X-RateLimit-Limit': this.config.maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        },
      });
    };
  }
}

/**
 * Создает rate limiter для API запросов
 */
export function createAPIRateLimiter(): RateLimiter {
  return new RateLimiter({
    ...RATE_LIMIT_CONFIGS.API,
    keyGenerator: generateKeyByIPAndPath,
  });
}

/**
 * Создает rate limiter для генерации контента
 */
export function createGenerationRateLimiter(): RateLimiter {
  return new RateLimiter({
    ...RATE_LIMIT_CONFIGS.GENERATION,
    keyGenerator: generateKeyByUser,
  });
}

/**
 * Создает rate limiter для аутентификации
 */
export function createAuthRateLimiter(): RateLimiter {
  return new RateLimiter({
    ...RATE_LIMIT_CONFIGS.AUTH,
    keyGenerator: generateKeyByIPAndUserAgent,
  });
}

/**
 * Создает rate limiter для админских операций
 */
export function createAdminRateLimiter(): RateLimiter {
  return new RateLimiter({
    ...RATE_LIMIT_CONFIGS.ADMIN,
    keyGenerator: generateKeyByUser,
  });
}

/**
 * Создает rate limiter для загрузки файлов
 */
export function createUploadRateLimiter(): RateLimiter {
  return new RateLimiter({
    ...RATE_LIMIT_CONFIGS.UPLOAD,
    keyGenerator: generateKeyByUser,
  });
}

/**
 * Создает rate limiter для WebSocket соединений
 */
export function createWebSocketRateLimiter(): RateLimiter {
  return new RateLimiter({
    ...RATE_LIMIT_CONFIGS.WEBSOCKET,
    keyGenerator: generateKeyByIP,
  });
}

/**
 * Получает статистику по rate limiting
 */
export function getRateLimitStats(): {
  totalKeys: number;
  blockedKeys: number;
  topKeys: Array<{ key: string; count: number }>;
} {
  const store = rateLimitStore as any;
  const entries = Array.from(store.store.entries()) as Array<
    [string, RateLimitData]
  >;

  const blockedKeys = entries.filter(([, data]) => data.blocked).length;

  const topKeys = entries
    .map(([key, data]) => ({ key, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalKeys: entries.length,
    blockedKeys,
    topKeys,
  };
}

/**
 * Очищает заблокированные ключи
 */
export function clearBlockedRateLimitKeys(): void {
  const store = rateLimitStore as any;
  for (const [key, data] of store.store.entries() as Array<
    [string, RateLimitData]
  >) {
    if (data.blocked) {
      store.store.delete(key);
    }
  }
}

/**
 * Сбрасывает все данные rate limiting
 */
export function resetRateLimit(): void {
  rateLimitStore.destroy();
}

// Экспорт готовых middleware для использования в API routes
export const apiRateLimit = createAPIRateLimiter().createMiddleware();
export const generationRateLimit =
  createGenerationRateLimiter().createMiddleware();
export const authRateLimit = createAuthRateLimiter().createMiddleware();
export const adminRateLimit = createAdminRateLimiter().createMiddleware();
export const uploadRateLimit = createUploadRateLimiter().createMiddleware();
export const websocketRateLimit =
  createWebSocketRateLimiter().createMiddleware();
