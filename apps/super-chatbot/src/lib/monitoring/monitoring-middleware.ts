/**
 * Middleware для интеграции мониторинга
 * Автоматически собирает метрики и логирует запросы
 */

import { type NextRequest, NextResponse } from "next/server";
import { performanceMetrics } from "./performance-metrics";
import { alertingSystem } from "./alerting-system";
import { logger } from "./logging-system";

// Конфигурация middleware
export interface MonitoringMiddlewareConfig {
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableSecurityMonitoring: boolean;
  slowRequestThreshold: number; // в миллисекундах
  errorRateThreshold: number; // процент ошибок
  excludedPaths: string[];
  excludedMethods: string[];
}

// Класс для middleware мониторинга
export class MonitoringMiddleware {
  private config: MonitoringMiddlewareConfig;
  private requestCounts: Map<string, number> = new Map();
  private errorCounts: Map<string, number> = new Map();
  private lastResetTime: number = Date.now();

  constructor(config: MonitoringMiddlewareConfig) {
    this.config = config;
    this.startResetInterval();
  }

  /**
   * Обрабатывает HTTP запрос
   */
  async handleRequest(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now();
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Пропускаем исключенные пути и методы
    if (this.shouldSkipRequest(path, method)) {
      return handler();
    }

    // Увеличиваем счетчик запросов
    this.incrementRequestCount(path, method);

    let response: NextResponse;
    let error: Error | null = null;

    try {
      // Выполняем обработчик
      response = await handler();

      // Проверяем статус код
      if (response.status >= 400) {
        this.incrementErrorCount(path, method);
        this.trackError(request, response, null);
      }
    } catch (err) {
      error = err as Error;
      this.incrementErrorCount(path, method);
      this.trackError(request, null, error);

      // Создаем ответ об ошибке
      response = new NextResponse(
        JSON.stringify({ error: "Internal Server Error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const duration = Date.now() - startTime;

    // Логируем запрос
    this.logRequest(request, response, duration, error);

    // Отслеживаем производительность
    if (this.config.enablePerformanceTracking) {
      this.trackPerformance(path, method, duration, response.status);
    }

    // Проверяем медленные запросы
    if (duration > this.config.slowRequestThreshold) {
      this.trackSlowRequest(request, duration);
    }

    // Проверяем порог ошибок
    this.checkErrorRate();

    return response;
  }

  /**
   * Отслеживает производительность запроса
   */
  private trackPerformance(
    path: string,
    method: string,
    duration: number,
    statusCode: number
  ): void {
    performanceMetrics.recordAPIResponseTime(
      path,
      method,
      duration,
      statusCode
    );

    // Логируем производительность
    logger.performance(`API ${method} ${path}`, duration, {
      component: "api",
      action: "request",
    });
  }

  /**
   * Отслеживает ошибку
   */
  private trackError(
    request: NextRequest,
    response: NextResponse | null,
    error: Error | null
  ): void {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Логируем ошибку
    logger.error(
      `API Error: ${method} ${path}`,
      {
        component: "api",
        action: "error",
      },
      error || undefined
    );

    // Создаем алерт для критических ошибок
    if (response && response.status >= 500) {
      alertingSystem.createAlert(
        "API_TIMEOUT",
        response.status >= 500 ? "ERROR" : "WARNING",
        `API Error: ${method} ${path}`,
        `Status: ${response.status}, Error: ${error?.message || "Unknown"}`,
        "api-middleware",
        {
          path,
          method,
          status_code: response.status.toString(),
        }
      );
    }
  }

  /**
   * Отслеживает медленный запрос
   */
  private trackSlowRequest(request: NextRequest, duration: number): void {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    logger.warn(`Slow request detected: ${method} ${path}`, {
      component: "api",
      action: "slow_request",
    });

    // Создаем алерт для очень медленных запросов
    if (duration > this.config.slowRequestThreshold * 2) {
      alertingSystem.createAlert(
        "PERFORMANCE_DEGRADATION",
        "WARNING",
        `Slow request: ${method} ${path}`,
        `Duration: ${duration}ms (threshold: ${this.config.slowRequestThreshold}ms)`,
        "api-middleware",
        {
          path,
          method,
          duration: duration.toString(),
        }
      );
    }
  }

  /**
   * Логирует HTTP запрос
   */
  private logRequest(
    request: NextRequest,
    response: NextResponse,
    duration: number,
    error: Error | null
  ): void {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    logger.request(method, path, response.status, duration, {
      component: "api",
      action: "request",
    });
  }

  /**
   * Увеличивает счетчик запросов
   */
  private incrementRequestCount(path: string, method: string): void {
    const key = `${method}:${path}`;
    const count = this.requestCounts.get(key) || 0;
    this.requestCounts.set(key, count + 1);
  }

  /**
   * Увеличивает счетчик ошибок
   */
  private incrementErrorCount(path: string, method: string): void {
    const key = `${method}:${path}`;
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);
  }

  /**
   * Проверяет порог ошибок
   */
  private checkErrorRate(): void {
    const now = Date.now();
    const timeWindow = 5 * 60 * 1000; // 5 минут

    if (now - this.lastResetTime > timeWindow) {
      this.resetCounters();
      this.lastResetTime = now;
      return;
    }

    // Вычисляем общий процент ошибок
    let totalRequests = 0;
    let totalErrors = 0;

    for (const [key, count] of this.requestCounts) {
      totalRequests += count;
      totalErrors += this.errorCounts.get(key) || 0;
    }

    if (totalRequests === 0) return;

    const errorRate = (totalErrors / totalRequests) * 100;

    if (errorRate > this.config.errorRateThreshold) {
      alertingSystem.createAlert(
        "HIGH_ERROR_RATE",
        "ERROR",
        "High error rate detected",
        `Error rate: ${errorRate.toFixed(2)}% (${totalErrors}/${totalRequests})`,
        "api-middleware",
        {
          error_rate: errorRate.toFixed(2),
          total_requests: totalRequests.toString(),
          total_errors: totalErrors.toString(),
        }
      );
    }
  }

  /**
   * Сбрасывает счетчики
   */
  private resetCounters(): void {
    this.requestCounts.clear();
    this.errorCounts.clear();
  }

  /**
   * Проверяет, нужно ли пропустить запрос
   */
  private shouldSkipRequest(path: string, method: string): boolean {
    // Пропускаем исключенные пути
    if (
      this.config.excludedPaths.some((excluded) => path.startsWith(excluded))
    ) {
      return true;
    }

    // Пропускаем исключенные методы
    if (this.config.excludedMethods.includes(method)) {
      return true;
    }

    return false;
  }

  /**
   * Получает IP адрес клиента
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    return "unknown";
  }

  /**
   * Запускает периодический сброс счетчиков
   */
  private startResetInterval(): void {
    setInterval(
      () => {
        this.resetCounters();
      },
      5 * 60 * 1000
    ); // Каждые 5 минут
  }

  /**
   * Получает статистику запросов
   */
  getRequestStats(): {
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    topPaths: Array<{ path: string; count: number; errorRate: number }>;
  } {
    let totalRequests = 0;
    let totalErrors = 0;
    const pathStats: Array<{ path: string; count: number; errors: number }> =
      [];

    for (const [key, count] of this.requestCounts) {
      const [method, path] = key.split(":", 2);
      const errors = this.errorCounts.get(key) || 0;

      totalRequests += count;
      totalErrors += errors;

      pathStats.push({ path, count, errors });
    }

    const errorRate =
      totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    const topPaths = pathStats
      .map((stat) => ({
        path: stat.path,
        count: stat.count,
        errorRate: stat.count > 0 ? (stat.errors / stat.count) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests,
      totalErrors,
      errorRate,
      topPaths,
    };
  }
}

// Предустановленная конфигурация
export const DEFAULT_MONITORING_CONFIG: MonitoringMiddlewareConfig = {
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  enableSecurityMonitoring: true,
  slowRequestThreshold: 2000, // 2 секунды
  errorRateThreshold: 10, // 10%
  excludedPaths: ["/api/health", "/api/metrics", "/_next", "/favicon.ico"],
  excludedMethods: ["OPTIONS"],
};

// Глобальный middleware мониторинга
export const monitoringMiddleware = new MonitoringMiddleware(
  DEFAULT_MONITORING_CONFIG
);
