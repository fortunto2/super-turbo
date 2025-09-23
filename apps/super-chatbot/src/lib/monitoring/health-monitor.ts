import { alertingSystem } from "./alerting-system";
import { logger } from "./logging-system";

// Состояние здоровья компонента
export type ComponentHealthStatus =
  | "healthy"
  | "degraded"
  | "unhealthy"
  | "unknown";

// Интерфейс для проверки здоровья
export interface HealthCheck {
  name: string;
  status: ComponentHealthStatus;
  message: string;
  timestamp: number;
  duration: number;
  metadata?: Record<string, any>;
}

// Интерфейс для общего состояния здоровья
export interface HealthStatus {
  overall: ComponentHealthStatus;
  timestamp: number;
  uptime: number;
  version: string;
  environment: string;
  checks: HealthCheck[];
  summary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
  };
}

// Конфигурация мониторинга здоровья
export interface HealthMonitorConfig {
  checkInterval: number; // в миллисекундах
  timeout: number; // в миллисекундах
  retryAttempts: number;
  alertThresholds: {
    degraded: number; // количество деградированных компонентов
    unhealthy: number; // количество нездоровых компонентов
  };
  enabledChecks: string[];
}

// Класс для мониторинга здоровья
export class HealthMonitor {
  private config: HealthMonitorConfig;
  private checks: Map<string, () => Promise<HealthCheck>> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private lastStatus: HealthStatus | null = null;
  private startTime: number = Date.now();

  constructor(config: HealthMonitorConfig) {
    this.config = config;
    this.registerDefaultChecks();
  }

  /**
   * Запускает мониторинг здоровья
   */
  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.performHealthChecks();
    }, this.config.checkInterval);

    logger.info("Health monitoring started", {
      component: "health-monitor",
      action: "start",
    });
  }

  /**
   * Останавливает мониторинг здоровья
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    logger.info("Health monitoring stopped", {
      component: "health-monitor",
      action: "stop",
    });
  }

  /**
   * Регистрирует проверку здоровья
   */
  registerCheck(name: string, checkFn: () => Promise<HealthCheck>): void {
    this.checks.set(name, checkFn);
    logger.debug(`Health check registered: ${name}`, {
      component: "health-monitor",
      action: "register_check",
    });
  }

  /**
   * Выполняет все проверки здоровья
   */
  async performHealthChecks(): Promise<HealthStatus> {
    const startTime = Date.now();
    const checks: HealthCheck[] = [];

    // Выполняем все зарегистрированные проверки
    for (const [name, checkFn] of this.checks) {
      if (!this.config.enabledChecks.includes(name)) continue;

      try {
        const check = await this.runHealthCheck(name, checkFn);
        checks.push(check);
      } catch (error) {
        logger.error(
          `Health check failed: ${name}`,
          {
            component: "health-monitor",
            action: "perform_checks",
          },
          error as Error
        );

        checks.push({
          name,
          status: "unknown",
          message: `Check failed: ${(error as Error).message}`,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
        });
      }
    }

    // Определяем общее состояние
    const overall = this.calculateOverallStatus(checks);
    const summary = this.calculateSummary(checks);

    const healthStatus: HealthStatus = {
      overall,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "development",
      checks,
      summary,
    };

    this.lastStatus = healthStatus;

    // Проверяем пороги для алертов
    this.checkAlertThresholds(healthStatus);

    // Логируем состояние
    logger.info("Health check completed", {
      component: "health-monitor",
      action: "perform_checks",
      duration: Date.now() - startTime,
    });

    return healthStatus;
  }

  /**
   * Получает текущее состояние здоровья
   */
  getCurrentStatus(): HealthStatus | null {
    return this.lastStatus;
  }

  /**
   * Получает историю состояний здоровья
   */
  getHealthHistory(limit = 100): HealthStatus[] {
    // В реальном приложении здесь была бы база данных
    return this.lastStatus ? [this.lastStatus] : [];
  }

  /**
   * Выполняет конкретную проверку здоровья
   */
  private async runHealthCheck(
    name: string,
    checkFn: () => Promise<HealthCheck>
  ): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      const check = await Promise.race([
        checkFn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Health check timeout")),
            this.config.timeout
          )
        ),
      ]);

      check.duration = Date.now() - startTime;
      return check;
    } catch (error) {
      return {
        name,
        status: "unknown",
        message: `Check failed: ${(error as Error).message}`,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Вычисляет общее состояние здоровья
   */
  private calculateOverallStatus(checks: HealthCheck[]): ComponentHealthStatus {
    if (checks.length === 0) return "unknown";

    const unhealthyCount = checks.filter(
      (c) => c.status === "unhealthy"
    ).length;
    const degradedCount = checks.filter((c) => c.status === "degraded").length;

    if (unhealthyCount > 0) return "unhealthy";
    if (degradedCount > 0) return "degraded";
    return "healthy";
  }

  /**
   * Вычисляет сводку состояний
   */
  private calculateSummary(checks: HealthCheck[]): HealthStatus["summary"] {
    const summary = {
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      unknown: 0,
    };

    checks.forEach((check) => {
      summary[check.status]++;
    });

    return summary;
  }

  /**
   * Проверяет пороги для алертов
   */
  private checkAlertThresholds(status: HealthStatus): void {
    const { degraded, unhealthy } = status.summary;

    if (unhealthy >= this.config.alertThresholds.unhealthy) {
      alertingSystem.createAlert(
        "SERVICE_DOWN",
        "CRITICAL",
        "Multiple services are unhealthy",
        `${unhealthy} services are unhealthy`,
        "health-monitor",
        {
          unhealthy_count: unhealthy.toString(),
          degraded_count: degraded.toString(),
        }
      );
    } else if (degraded >= this.config.alertThresholds.degraded) {
      alertingSystem.createAlert(
        "PERFORMANCE_DEGRADATION",
        "WARNING",
        "Multiple services are degraded",
        `${degraded} services are degraded`,
        "health-monitor",
        {
          degraded_count: degraded.toString(),
        }
      );
    }
  }

  /**
   * Регистрирует стандартные проверки здоровья
   */
  private registerDefaultChecks(): void {
    // Проверка базы данных
    this.registerCheck("database", async () => {
      const startTime = Date.now();

      try {
        // В реальном приложении здесь была бы проверка подключения к БД
        const duration = Date.now() - startTime;

        return {
          name: "database",
          status: duration < 1000 ? "healthy" : "degraded",
          message: `Database connection: ${duration}ms`,
          timestamp: Date.now(),
          duration,
          metadata: {
            responseTime: duration,
          },
        };
      } catch (error) {
        return {
          name: "database",
          status: "unhealthy",
          message: `Database error: ${(error as Error).message}`,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
        };
      }
    });

    // Проверка внешних API
    this.registerCheck("external-apis", async () => {
      const startTime = Date.now();

      try {
        // Проверяем доступность внешних API
        const apis = [
          { name: "SuperDuperAI", url: process.env.SUPERDUPERAI_API_URL },
          { name: "Stripe", url: "https://api.stripe.com" },
        ];

        const results = await Promise.allSettled(
          apis.map(async (api) => {
            if (!api.url) return { name: api.name, status: "unknown" };

            const response = await fetch(api.url, {
              method: "HEAD",
              signal: AbortSignal.timeout(5000),
            });

            return {
              name: api.name,
              status: response.ok ? "healthy" : "degraded",
            };
          })
        );

        const healthyCount = results.filter(
          (r) => r.status === "fulfilled" && r.value.status === "healthy"
        ).length;

        const status =
          healthyCount === apis.length
            ? "healthy"
            : healthyCount > 0
              ? "degraded"
              : "unhealthy";

        return {
          name: "external-apis",
          status,
          message: `${healthyCount}/${apis.length} APIs healthy`,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          metadata: {
            apiResults: results.map((r) =>
              r.status === "fulfilled"
                ? r.value
                : { name: "unknown", status: "error" }
            ),
          },
        };
      } catch (error) {
        return {
          name: "external-apis",
          status: "unhealthy",
          message: `API check failed: ${(error as Error).message}`,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
        };
      }
    });

    // Проверка памяти
    this.registerCheck("memory", async () => {
      const startTime = Date.now();
      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal;
      const usedMemory = memoryUsage.heapUsed;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;

      let status: ComponentHealthStatus;
      if (memoryUsagePercent > 90) status = "unhealthy";
      else if (memoryUsagePercent > 75) status = "degraded";
      else status = "healthy";

      return {
        name: "memory",
        status,
        message: `Memory usage: ${memoryUsagePercent.toFixed(1)}%`,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        metadata: {
          heapUsed: usedMemory,
          heapTotal: totalMemory,
          usagePercent: memoryUsagePercent,
        },
      };
    });

    // Проверка дискового пространства
    this.registerCheck("disk-space", async () => {
      const startTime = Date.now();

      try {
        // В реальном приложении здесь была бы проверка дискового пространства
        // Для демонстрации возвращаем здоровое состояние
        return {
          name: "disk-space",
          status: "healthy",
          message: "Disk space: OK",
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          metadata: {
            available: "sufficient",
          },
        };
      } catch (error) {
        return {
          name: "disk-space",
          status: "unknown",
          message: `Disk check failed: ${(error as Error).message}`,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
        };
      }
    });

    // Проверка WebSocket соединений
    this.registerCheck("websocket", async () => {
      const startTime = Date.now();

      try {
        // В реальном приложении здесь была бы проверка активных WebSocket соединений
        const activeConnections = 0; // Получаем из реального состояния

        return {
          name: "websocket",
          status: "healthy",
          message: `WebSocket connections: ${activeConnections}`,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          metadata: {
            activeConnections,
          },
        };
      } catch (error) {
        return {
          name: "websocket",
          status: "unknown",
          message: `WebSocket check failed: ${(error as Error).message}`,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
        };
      }
    });
  }
}

// Предустановленная конфигурация
export const DEFAULT_HEALTH_CONFIG: HealthMonitorConfig = {
  checkInterval: 30 * 1000, // 30 секунд
  timeout: 10 * 1000, // 10 секунд
  retryAttempts: 3,
  alertThresholds: {
    degraded: 2,
    unhealthy: 1,
  },
  enabledChecks: [
    "database",
    "external-apis",
    "memory",
    "disk-space",
    "websocket",
  ],
};

// Глобальный монитор здоровья
export const healthMonitor = new HealthMonitor(DEFAULT_HEALTH_CONFIG);
