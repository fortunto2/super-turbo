/**
 * Система ограничения скорости запросов (Rate Limiting)
 * Защищает от DDoS атак и злоупотреблений
 */

import { type NextRequest, NextResponse } from "next/server";

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
      5 * 60 * 1000
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

// Утилиты для генерации ключей
export class RateLimitKeyGenerator {
  /**
   * Генерирует ключ на основе IP адреса
   */
  static byIP(req: NextRequest): string {
    const ip =
      (req as any).ip || req.headers.get("x-forwarded-for") || "unknown";
    return `ip:${ip}`;
  }

  /**
   * Генерирует ключ на основе IP и User-Agent
   */
  static byIPAndUserAgent(req: NextRequest): string {
    const ip =
      (req as any).ip || req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    return `ip_ua:${ip}:${userAgent}`;
  }

  /**
   * Генерирует ключ на основе IP и пути запроса
   */
  static byIPAndPath(req: NextRequest): string {
    const ip =
      (req as any).ip || req.headers.get("x-forwarded-for") || "unknown";
    const path = req.nextUrl.pathname;
    return `ip_path:${ip}:${path}`;
  }

  /**
   * Генерирует ключ на основе пользователя (требует аутентификации)
   */
  static byUser(req: NextRequest): string {
    const userId = req.headers.get("x-user-id") || "anonymous";
    return `user:${userId}`;
  }

  /**
   * Генерирует ключ на основе пользователя и действия
   */
  static byUserAndAction(req: NextRequest): string {
    const userId = req.headers.get("x-user-id") || "anonymous";
    const action = req.nextUrl.pathname.split("/").pop() || "unknown";
    return `user_action:${userId}:${action}`;
  }
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
    const key =
      this.config.keyGenerator?.(req) || RateLimitKeyGenerator.byIP(req);
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
      retryAfter: allowed ? undefined : Math.ceil((resetTime - now) / 1000),
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
            error: "Too Many Requests",
            message: "Превышен лимит запросов. Попробуйте позже.",
            retryAfter: result.retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": result.retryAfter?.toString() || "60",
              "X-RateLimit-Limit": this.config.maxRequests.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
            },
          }
        );
      }

      return NextResponse.next({
        headers: {
          "X-RateLimit-Limit": this.config.maxRequests.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
        },
      });
    };
  }
}

// Фабрика для создания rate limiter'ов
export class RateLimiterFactory {
  /**
   * Создает rate limiter для API запросов
   */
  static createAPI(): RateLimiter {
    return new RateLimiter({
      ...RATE_LIMIT_CONFIGS.API,
      keyGenerator: RateLimitKeyGenerator.byIPAndPath,
    });
  }

  /**
   * Создает rate limiter для генерации контента
   */
  static createGeneration(): RateLimiter {
    return new RateLimiter({
      ...RATE_LIMIT_CONFIGS.GENERATION,
      keyGenerator: RateLimitKeyGenerator.byUser,
    });
  }

  /**
   * Создает rate limiter для аутентификации
   */
  static createAuth(): RateLimiter {
    return new RateLimiter({
      ...RATE_LIMIT_CONFIGS.AUTH,
      keyGenerator: RateLimitKeyGenerator.byIPAndUserAgent,
    });
  }

  /**
   * Создает rate limiter для админских операций
   */
  static createAdmin(): RateLimiter {
    return new RateLimiter({
      ...RATE_LIMIT_CONFIGS.ADMIN,
      keyGenerator: RateLimitKeyGenerator.byUser,
    });
  }

  /**
   * Создает rate limiter для загрузки файлов
   */
  static createUpload(): RateLimiter {
    return new RateLimiter({
      ...RATE_LIMIT_CONFIGS.UPLOAD,
      keyGenerator: RateLimitKeyGenerator.byUser,
    });
  }

  /**
   * Создает rate limiter для WebSocket соединений
   */
  static createWebSocket(): RateLimiter {
    return new RateLimiter({
      ...RATE_LIMIT_CONFIGS.WEBSOCKET,
      keyGenerator: RateLimitKeyGenerator.byIP,
    });
  }
}

// Утилиты для мониторинга rate limiting
export class RateLimitMonitor {
  /**
   * Получает статистику по rate limiting
   */
  static getStats(): {
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
  static clearBlocked(): void {
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
  static reset(): void {
    rateLimitStore.destroy();
  }
}

// Экспорт готовых middleware для использования в API routes
export const apiRateLimit = RateLimiterFactory.createAPI().createMiddleware();
export const generationRateLimit =
  RateLimiterFactory.createGeneration().createMiddleware();
export const authRateLimit = RateLimiterFactory.createAuth().createMiddleware();
export const adminRateLimit =
  RateLimiterFactory.createAdmin().createMiddleware();
export const uploadRateLimit =
  RateLimiterFactory.createUpload().createMiddleware();
export const websocketRateLimit =
  RateLimiterFactory.createWebSocket().createMiddleware();
