/**
 * Система метрик производительности
 * Отслеживает производительность приложения в реальном времени
 */

import type { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// Интерфейсы для метрик
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface PerformanceThreshold {
  name: string;
  warning: number;
  critical: number;
  unit: string;
}

// Конфигурация метрик
export const PERFORMANCE_THRESHOLDS: PerformanceThreshold[] = [
  {
    name: "api_response_time",
    warning: 1000, // 1 секунда
    critical: 3000, // 3 секунды
    unit: "ms",
  },
  {
    name: "image_generation_time",
    warning: 30000, // 30 секунд
    critical: 60000, // 1 минута
    unit: "ms",
  },
  {
    name: "video_generation_time",
    warning: 300000, // 5 минут
    critical: 600000, // 10 минут
    unit: "ms",
  },
  {
    name: "memory_usage",
    warning: 500, // 500MB
    critical: 1000, // 1GB
    unit: "MB",
  },
  {
    name: "cpu_usage",
    warning: 70, // 70%
    critical: 90, // 90%
    unit: "%",
  },
  {
    name: "database_query_time",
    warning: 100, // 100ms
    critical: 500, // 500ms
    unit: "ms",
  },
  {
    name: "websocket_connections",
    warning: 1000, // 1000 соединений
    critical: 2000, // 2000 соединений
    unit: "count",
  },
  {
    name: "error_rate",
    warning: 5, // 5%
    critical: 10, // 10%
    unit: "%",
  },
];

// Класс для сбора метрик производительности
export class PerformanceMetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private alerts: Map<string, number> = new Map(); // Время последнего алерта

  constructor() {
    // Инициализируем пороги
    PERFORMANCE_THRESHOLDS.forEach((threshold) => {
      this.thresholds.set(threshold.name, threshold);
    });
  }

  /**
   * Записывает метрику производительности
   */
  recordMetric(
    name: string,
    value: number,
    unit: string,
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
      metadata,
    };

    this.metrics.push(metric);

    // Проверяем пороги
    this.checkThresholds(metric);

    // Очищаем старые метрики (старше 1 часа)
    this.cleanupOldMetrics();
  }

  /**
   * Измеряет время выполнения функции
   */
  async measureExecutionTime<T>(
    name: string,
    fn: () => Promise<T>,
    tags: Record<string, string> = {}
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - start;

      this.recordMetric(name, duration, "ms", tags);

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.recordMetric(name, duration, "ms", { ...tags, error: "true" });

      throw error;
    }
  }

  /**
   * Измеряет время выполнения синхронной функции
   */
  measureSyncExecutionTime<T>(
    name: string,
    fn: () => T,
    tags: Record<string, string> = {}
  ): T {
    const start = performance.now();

    try {
      const result = fn();
      const duration = performance.now() - start;

      this.recordMetric(name, duration, "ms", tags);

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.recordMetric(name, duration, "ms", { ...tags, error: "true" });

      throw error;
    }
  }

  /**
   * Записывает метрику использования памяти
   */
  recordMemoryUsage(tags: Record<string, string> = {}): void {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memoryUsage = process.memoryUsage();

      this.recordMetric(
        "memory_usage",
        memoryUsage.heapUsed / 1024 / 1024,
        "MB",
        tags
      );
      this.recordMetric(
        "memory_rss",
        memoryUsage.rss / 1024 / 1024,
        "MB",
        tags
      );
      this.recordMetric(
        "memory_external",
        memoryUsage.external / 1024 / 1024,
        "MB",
        tags
      );
    }
  }

  /**
   * Записывает метрику использования CPU
   */
  recordCPUUsage(tags: Record<string, string> = {}): void {
    if (typeof process !== "undefined" && process.cpuUsage) {
      const cpuUsage = process.cpuUsage();
      const totalUsage = (cpuUsage.user + cpuUsage.system) / 1000000; // Конвертируем в секунды

      this.recordMetric("cpu_usage", totalUsage, "s", tags);
    }
  }

  /**
   * Записывает метрику времени ответа API
   */
  recordAPIResponseTime(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric("api_response_time", duration, "ms", {
      endpoint,
      method,
      status_code: statusCode.toString(),
      ...tags,
    });
  }

  /**
   * Записывает метрику времени генерации контента
   */
  recordGenerationTime(
    type: "image" | "video" | "text",
    duration: number,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric(`${type}_generation_time`, duration, "ms", {
      type,
      ...tags,
    });
  }

  /**
   * Записывает метрику времени запроса к базе данных
   */
  recordDatabaseQueryTime(
    query: string,
    duration: number,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric("database_query_time", duration, "ms", {
      query: query.substring(0, 50), // Ограничиваем длину
      ...tags,
    });
  }

  /**
   * Записывает метрику количества WebSocket соединений
   */
  recordWebSocketConnections(
    count: number,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric("websocket_connections", count, "count", tags);
  }

  /**
   * Записывает метрику частоты ошибок
   */
  recordErrorRate(
    totalRequests: number,
    errorCount: number,
    tags: Record<string, string> = {}
  ): void {
    const errorRate = (errorCount / totalRequests) * 100;
    this.recordMetric("error_rate", errorRate, "%", tags);
  }

  /**
   * Получает статистику метрик
   */
  getStats(timeWindowMs: number = 60 * 60 * 1000): {
    totalMetrics: number;
    metricsByName: Record<
      string,
      {
        count: number;
        avg: number;
        min: number;
        max: number;
        p95: number;
        p99: number;
      }
    >;
    alerts: Array<{
      name: string;
      value: number;
      threshold: number;
      severity: "warning" | "critical";
      timestamp: number;
    }>;
  } {
    const cutoffTime = Date.now() - timeWindowMs;
    const recentMetrics = this.metrics.filter(
      (metric) => metric.timestamp > cutoffTime
    );

    const metricsByName: Record<string, any> = {};
    const alerts: any[] = [];

    // Группируем метрики по имени
    recentMetrics.forEach((metric) => {
      if (!metricsByName[metric.name]) {
        metricsByName[metric.name] = {
          values: [],
          count: 0,
        };
      }
      metricsByName[metric.name].values.push(metric.value);
      metricsByName[metric.name].count++;
    });

    // Вычисляем статистику для каждой метрики
    Object.keys(metricsByName).forEach((name) => {
      const values = metricsByName[name].values.sort(
        (a: number, b: number) => a - b
      );
      const count = values.length;
      const sum = values.reduce((a: number, b: number) => a + b, 0);

      metricsByName[name] = {
        count,
        avg: sum / count,
        min: values[0],
        max: values[count - 1],
        p95: values[Math.floor(count * 0.95)],
        p99: values[Math.floor(count * 0.99)],
      };
    });

    return {
      totalMetrics: recentMetrics.length,
      metricsByName,
      alerts,
    };
  }

  /**
   * Получает метрики по имени
   */
  getMetricsByName(
    name: string,
    timeWindowMs: number = 60 * 60 * 1000
  ): PerformanceMetric[] {
    const cutoffTime = Date.now() - timeWindowMs;
    return this.metrics.filter(
      (metric) => metric.name === name && metric.timestamp > cutoffTime
    );
  }

  /**
   * Очищает старые метрики
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - 60 * 60 * 1000; // 1 час
    this.metrics = this.metrics.filter(
      (metric) => metric.timestamp > cutoffTime
    );
  }

  /**
   * Проверяет пороги и генерирует алерты
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return;

    const alertKey = `${metric.name}_${metric.tags.endpoint || "global"}`;
    const lastAlert = this.alerts.get(alertKey) || 0;
    const cooldownPeriod = 5 * 60 * 1000; // 5 минут

    // Проверяем критический порог
    if (metric.value >= threshold.critical) {
      if (Date.now() - lastAlert > cooldownPeriod) {
        this.sendAlert(metric, threshold, "critical");
        this.alerts.set(alertKey, Date.now());
      }
    }
    // Проверяем предупреждающий порог
    else if (metric.value >= threshold.warning) {
      if (Date.now() - lastAlert > cooldownPeriod) {
        this.sendAlert(metric, threshold, "warning");
        this.alerts.set(alertKey, Date.now());
      }
    }
  }

  /**
   * Отправляет алерт
   */
  private sendAlert(
    metric: PerformanceMetric,
    threshold: PerformanceThreshold,
    severity: "warning" | "critical"
  ): void {
    const message = `Performance ${severity.toUpperCase()}: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold[severity]}${threshold.unit})`;

    // Отправляем в Sentry
    Sentry.withScope((scope) => {
      scope.setTag("metric_name", metric.name);
      scope.setTag("severity", severity);
      scope.setLevel(severity === "critical" ? "error" : "warning");
      scope.setContext("metric_details", {
        value: metric.value,
        unit: metric.unit,
        threshold: threshold[severity],
        tags: metric.tags,
      });

      Sentry.captureMessage(
        message,
        severity === "critical" ? "error" : "warning"
      );
    });

    // Логируем в консоль
    console.warn(`[PERFORMANCE ${severity.toUpperCase()}] ${message}`, {
      metric,
      threshold,
      severity,
    });
  }

  /**
   * Генерирует уникальный ID метрики
   */
  private generateMetricId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

// Глобальный коллектор метрик
export const performanceMetrics = new PerformanceMetricsCollector();

// Утилиты для измерения производительности
export class PerformanceUtils {
  /**
   * Создает middleware для измерения времени ответа API
   */
  static createAPIMiddleware() {
    return async (req: NextRequest, next: () => Promise<NextResponse>) => {
      const start = performance.now();
      const method = req.method;
      const endpoint = req.nextUrl.pathname;

      try {
        const response = await next();
        const duration = performance.now() - start;

        performanceMetrics.recordAPIResponseTime(
          endpoint,
          method,
          response.status,
          duration,
          {
            endpoint,
            method,
          }
        );

        return response;
      } catch (error) {
        const duration = performance.now() - start;

        performanceMetrics.recordAPIResponseTime(
          endpoint,
          method,
          500,
          duration,
          {
            endpoint,
            method,
            error: "true",
          }
        );

        throw error;
      }
    };
  }

  /**
   * Создает декоратор для измерения времени выполнения функций
   */
  static measureFunction<T extends (...args: any[]) => any>(
    name: string,
    fn: T,
    tags: Record<string, string> = {}
  ): T {
    return ((...args: any[]) => {
      return performanceMetrics.measureSyncExecutionTime(
        name,
        () => fn(...args),
        tags
      );
    }) as T;
  }

  /**
   * Создает декоратор для измерения времени выполнения асинхронных функций
   */
  static measureAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    name: string,
    fn: T,
    tags: Record<string, string> = {}
  ): T {
    return (async (...args: any[]) => {
      return performanceMetrics.measureExecutionTime(
        name,
        () => fn(...args),
        tags
      );
    }) as T;
  }
}

// Автоматический сбор системных метрик
if (typeof process !== "undefined") {
  // Собираем метрики каждые 30 секунд
  setInterval(() => {
    performanceMetrics.recordMemoryUsage();
    performanceMetrics.recordCPUUsage();
  }, 30000);
}
