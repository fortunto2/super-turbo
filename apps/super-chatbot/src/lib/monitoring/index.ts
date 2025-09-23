/**
 * Главный файл для систем мониторинга
 * Экспортирует все компоненты мониторинга
 */

// Система метрик производительности
export { performanceMetrics } from "./performance-metrics";
export type { PerformanceMetric } from "./performance-metrics";

// Система алертов
export { alertingSystem } from "./alerting-system";
export type {
  Alert,
  AlertType,
  AlertSeverity,
  AlertConfig,
  AlertChannel,
  EscalationRule,
} from "./alerting-system";

// Система логирования
export { loggingSystem, logger } from "./logging-system";
export type {
  LogLevel,
  LogContext,
  LoggingConfig,
  LogEntry,
} from "./logging-system";

// Мониторинг здоровья
export { healthMonitor } from "./health-monitor";
export type {
  ComponentHealthStatus,
  HealthCheck,
  HealthStatus as AppHealthStatus,
  HealthMonitorConfig,
} from "./health-monitor";

// Middleware мониторинга
export { monitoringMiddleware } from "./monitoring-middleware";
export type { MonitoringMiddlewareConfig } from "./monitoring-middleware";

// Утилиты для инициализации
export class MonitoringManager {
  private static initialized = false;

  /**
   * Инициализирует все системы мониторинга
   */
  static async initialize(): Promise<void> {
    if (MonitoringManager.initialized) return;

    try {
      // Запускаем мониторинг здоровья
      const { healthMonitor } = await import("./health-monitor");
      healthMonitor.start();

      // Логируем успешную инициализацию
      const { logger } = await import("./logging-system");
      logger.info("Monitoring systems initialized", {
        component: "monitoring",
        action: "initialize",
      });

      MonitoringManager.initialized = true;
    } catch (error) {
      const { logger } = await import("./logging-system");
      logger.error(
        "Failed to initialize monitoring systems",
        {
          component: "monitoring",
          action: "initialize",
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Останавливает все системы мониторинга
   */
  static async shutdown(): Promise<void> {
    if (!MonitoringManager.initialized) return;

    try {
      // Останавливаем мониторинг здоровья
      const { healthMonitor } = await import("./health-monitor");
      healthMonitor.stop();

      // Логируем завершение работы
      const { logger } = await import("./logging-system");
      logger.info("Monitoring systems shutdown", {
        component: "monitoring",
        action: "shutdown",
      });

      MonitoringManager.initialized = false;
    } catch (error) {
      const { logger } = await import("./logging-system");
      logger.error(
        "Failed to shutdown monitoring systems",
        {
          component: "monitoring",
          action: "shutdown",
        },
        error as Error
      );
    }
  }

  /**
   * Получает общую статистику мониторинга
   */
  static async getMonitoringStats(): Promise<{
    performance: any;
    alerts: any;
    logs: any;
    health: any;
    requests: any;
  }> {
    const { performanceMetrics } = await import("./performance-metrics");
    const { alertingSystem } = await import("./alerting-system");
    const { loggingSystem } = await import("./logging-system");
    const { healthMonitor } = await import("./health-monitor");
    const { monitoringMiddleware } = await import("./monitoring-middleware");

    return {
      performance: performanceMetrics.getStats(),
      alerts: alertingSystem.getAlertStats(),
      logs: loggingSystem.getLogStats(),
      health: healthMonitor.getCurrentStatus(),
      requests: monitoringMiddleware.getRequestStats(),
    };
  }
}

// Автоматическая инициализация в браузере
if (typeof window !== "undefined") {
  MonitoringManager.initialize().catch((error) => {
    console.error("Failed to initialize monitoring:", error);
  });
}
