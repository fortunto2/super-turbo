/**
 * Система мониторинга производительности контекстного анализа
 * Отслеживает метрики производительности, точность и использование ресурсов
 */

import type { MediaContext } from "./universal-context";

interface PerformanceMetrics {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

interface AccuracyMetrics {
  totalRequests: number;
  successfulMatches: number;
  accuracyRate: number;
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  averageConfidence: number;
}

interface ResourceUsage {
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
  averageResponseTime: number;
}

interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  issues: string[];
  recommendations: string[];
  uptime: number;
  lastHealthCheck: Date;
}

/**
 * Система мониторинга производительности
 */
export class ContextPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private accuracyMetrics: AccuracyMetrics = {
    totalRequests: 0,
    successfulMatches: 0,
    accuracyRate: 0,
    confidenceDistribution: { high: 0, medium: 0, low: 0 },
    averageConfidence: 0,
  };
  private resourceUsage: ResourceUsage = {
    memoryUsage: 0,
    cpuUsage: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
  };
  private systemHealth: SystemHealth = {
    status: "healthy",
    issues: [],
    recommendations: [],
    uptime: Date.now(),
    lastHealthCheck: new Date(),
  };

  // Настройки мониторинга
  private readonly maxMetricsHistory = 1000;
  private readonly healthCheckInterval = 60000; // 1 минута
  private readonly performanceThresholds = {
    maxResponseTime: 5000, // 5 секунд
    minAccuracyRate: 0.7, // 70%
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    minCacheHitRate: 0.3, // 30%
  };

  constructor() {
    // Запускаем периодическую проверку здоровья системы
    setInterval(() => this.performHealthCheck(), this.healthCheckInterval);
  }

  /**
   * Запускает измерение производительности операции
   */
  startOperation(
    operation: string,
    metadata?: Record<string, any>
  ): () => void {
    const startTime = performance.now();
    const metric: PerformanceMetrics = {
      operation,
      startTime,
      endTime: 0,
      duration: 0,
      success: false,
      ...(metadata && { metadata }),
    };

    // Возвращаем функцию для завершения измерения
    return (success = true, error?: string) => {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - startTime;
      metric.success = success;
      if (error) metric.error = error;

      this.recordMetric(metric);
    };
  }

  /**
   * Записывает метрику производительности
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Ограничиваем историю метрик
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Обновляем среднее время ответа
    this.updateAverageResponseTime();

    // Проверяем производительность
    this.checkPerformanceThresholds(metric);

    console.log(
      `📊 PerformanceMonitor: ${metric.operation} completed in ${Math.round(metric.duration)}ms (${metric.success ? "success" : "failed"})`
    );
  }

  /**
   * Обновляет метрики точности
   */
  updateAccuracyMetrics(context: MediaContext): void {
    this.accuracyMetrics.totalRequests++;

    if (context.sourceUrl) {
      this.accuracyMetrics.successfulMatches++;
    }

    // Обновляем распределение уверенности
    switch (context.confidence) {
      case "high":
        this.accuracyMetrics.confidenceDistribution.high++;
        break;
      case "medium":
        this.accuracyMetrics.confidenceDistribution.medium++;
        break;
      case "low":
        this.accuracyMetrics.confidenceDistribution.low++;
        break;
    }

    // Пересчитываем точность
    this.accuracyMetrics.accuracyRate =
      this.accuracyMetrics.successfulMatches /
      this.accuracyMetrics.totalRequests;

    // Пересчитываем среднюю уверенность
    this.updateAverageConfidence();

    console.log(
      `📊 PerformanceMonitor: Accuracy updated: ${Math.round(this.accuracyMetrics.accuracyRate * 100)}%`
    );
  }

  /**
   * Обновляет среднюю уверенность
   */
  private updateAverageConfidence(): void {
    const total =
      this.accuracyMetrics.confidenceDistribution.high +
      this.accuracyMetrics.confidenceDistribution.medium +
      this.accuracyMetrics.confidenceDistribution.low;

    if (total > 0) {
      const weightedSum =
        this.accuracyMetrics.confidenceDistribution.high * 1.0 +
        this.accuracyMetrics.confidenceDistribution.medium * 0.6 +
        this.accuracyMetrics.confidenceDistribution.low * 0.3;

      this.accuracyMetrics.averageConfidence = weightedSum / total;
    }
  }

  /**
   * Обновляет среднее время ответа
   */
  private updateAverageResponseTime(): void {
    const recentMetrics = this.metrics.slice(-100); // Последние 100 операций
    if (recentMetrics.length > 0) {
      const totalDuration = recentMetrics.reduce(
        (sum, metric) => sum + metric.duration,
        0
      );
      this.resourceUsage.averageResponseTime =
        totalDuration / recentMetrics.length;
    }
  }

  /**
   * Проверяет пороги производительности
   */
  private checkPerformanceThresholds(metric: PerformanceMetrics): void {
    const issues: string[] = [];

    // Проверяем время ответа
    if (metric.duration > this.performanceThresholds.maxResponseTime) {
      issues.push(
        `Slow response time: ${Math.round(metric.duration)}ms for ${metric.operation}`
      );
    }

    // Проверяем точность
    if (
      this.accuracyMetrics.accuracyRate <
      this.performanceThresholds.minAccuracyRate
    ) {
      issues.push(
        `Low accuracy rate: ${Math.round(this.accuracyMetrics.accuracyRate * 100)}%`
      );
    }

    // Обновляем статус здоровья
    if (issues.length > 0) {
      this.systemHealth.status = issues.length > 3 ? "critical" : "warning";
      this.systemHealth.issues = issues;
      this.generateRecommendations();
    } else {
      this.systemHealth.status = "healthy";
      this.systemHealth.issues = [];
      this.systemHealth.recommendations = [];
    }
  }

  /**
   * Генерирует рекомендации по улучшению производительности
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Рекомендации по времени ответа
    if (
      this.resourceUsage.averageResponseTime >
      this.performanceThresholds.maxResponseTime
    ) {
      recommendations.push(
        "Consider optimizing database queries or adding more caching"
      );
      recommendations.push(
        "Review complex pattern matching algorithms for optimization"
      );
    }

    // Рекомендации по точности
    if (
      this.accuracyMetrics.accuracyRate <
      this.performanceThresholds.minAccuracyRate
    ) {
      recommendations.push("Review and expand pattern matching rules");
      recommendations.push("Consider improving semantic search algorithms");
      recommendations.push(
        "Add more training data for user preference learning"
      );
    }

    // Рекомендации по использованию памяти
    if (
      this.resourceUsage.memoryUsage > this.performanceThresholds.maxMemoryUsage
    ) {
      recommendations.push("Implement memory cleanup for old cache entries");
      recommendations.push(
        "Consider reducing cache size or implementing LRU eviction"
      );
    }

    // Рекомендации по кэшу
    if (
      this.resourceUsage.cacheHitRate <
      this.performanceThresholds.minCacheHitRate
    ) {
      recommendations.push("Review cache key generation strategy");
      recommendations.push(
        "Consider increasing cache TTL for frequently accessed data"
      );
    }

    this.systemHealth.recommendations = recommendations;
    return recommendations;
  }

  /**
   * Выполняет проверку здоровья системы
   */
  private performHealthCheck(): void {
    this.systemHealth.lastHealthCheck = new Date();

    // Обновляем использование ресурсов
    this.updateResourceUsage();

    // Проверяем метрики
    const recentMetrics = this.metrics.slice(-50);
    const failureRate =
      recentMetrics.filter((m) => !m.success).length / recentMetrics.length;

    if (failureRate > 0.1) {
      // Более 10% ошибок
      this.systemHealth.status = "critical";
      this.systemHealth.issues.push(
        `High failure rate: ${Math.round(failureRate * 100)}%`
      );
    }

    console.log(
      `📊 PerformanceMonitor: Health check completed - Status: ${this.systemHealth.status}`
    );
  }

  /**
   * Обновляет информацию об использовании ресурсов
   */
  private updateResourceUsage(): void {
    // Получаем информацию о памяти (упрощенная версия)
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.resourceUsage.memoryUsage = memUsage.heapUsed;
    }

    // Обновляем hit rate кэша (будет интегрировано с ContextCache)
    // this.resourceUsage.cacheHitRate = contextCache.getStats().hitRate;
  }

  /**
   * Получает детальную статистику производительности
   */
  getDetailedStats(): {
    performance: PerformanceMetrics[];
    accuracy: AccuracyMetrics;
    resources: ResourceUsage;
    health: SystemHealth;
    recommendations: string[];
  } {
    return {
      performance: [...this.metrics],
      accuracy: { ...this.accuracyMetrics },
      resources: { ...this.resourceUsage },
      health: { ...this.systemHealth },
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Получает краткую статистику
   */
  getSummaryStats(): {
    totalOperations: number;
    averageResponseTime: number;
    accuracyRate: number;
    systemStatus: string;
    uptime: number;
  } {
    return {
      totalOperations: this.metrics.length,
      averageResponseTime: Math.round(this.resourceUsage.averageResponseTime),
      accuracyRate: Math.round(this.accuracyMetrics.accuracyRate * 100) / 100,
      systemStatus: this.systemHealth.status,
      uptime: Date.now() - this.systemHealth.uptime,
    };
  }

  /**
   * Экспортирует метрики в формате для анализа
   */
  exportMetrics(format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = [
        "operation",
        "duration",
        "success",
        "timestamp",
        "error",
      ];
      const rows = this.metrics.map((metric) => [
        metric.operation,
        metric.duration,
        metric.success,
        new Date(metric.startTime).toISOString(),
        metric.error || "",
      ]);

      return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }

    return JSON.stringify(
      {
        metrics: this.metrics,
        accuracy: this.accuracyMetrics,
        resources: this.resourceUsage,
        health: this.systemHealth,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Очищает старые метрики
   */
  cleanup(daysToKeep = 7): void {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const initialCount = this.metrics.length;

    this.metrics = this.metrics.filter(
      (metric) => metric.startTime > cutoffTime
    );

    const removedCount = initialCount - this.metrics.length;
    if (removedCount > 0) {
      console.log(
        `📊 PerformanceMonitor: Cleaned up ${removedCount} old metrics`
      );
    }
  }

  /**
   * Сбрасывает все метрики
   */
  reset(): void {
    this.metrics = [];
    this.accuracyMetrics = {
      totalRequests: 0,
      successfulMatches: 0,
      accuracyRate: 0,
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
      averageConfidence: 0,
    };
    this.systemHealth = {
      status: "healthy",
      issues: [],
      recommendations: [],
      uptime: Date.now(),
      lastHealthCheck: new Date(),
    };

    console.log("📊 PerformanceMonitor: All metrics reset");
  }

  /**
   * Устанавливает пороги производительности
   */
  setThresholds(thresholds: Partial<typeof this.performanceThresholds>): void {
    this.performanceThresholds.maxResponseTime =
      thresholds.maxResponseTime ?? this.performanceThresholds.maxResponseTime;
    this.performanceThresholds.minAccuracyRate =
      thresholds.minAccuracyRate ?? this.performanceThresholds.minAccuracyRate;
    this.performanceThresholds.maxMemoryUsage =
      thresholds.maxMemoryUsage ?? this.performanceThresholds.maxMemoryUsage;
    this.performanceThresholds.minCacheHitRate =
      thresholds.minCacheHitRate ?? this.performanceThresholds.minCacheHitRate;

    console.log("📊 PerformanceMonitor: Thresholds updated");
  }
}

/**
 * Глобальный экземпляр монитора производительности
 */
export const contextPerformanceMonitor = new ContextPerformanceMonitor();
