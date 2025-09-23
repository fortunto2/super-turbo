/**
 * Система структурированного логирования
 * Обеспечивает централизованное логирование с различными уровнями и форматами
 */

import * as Sentry from "@sentry/nextjs";

// Уровни логирования
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

// Контекст логирования
export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  duration?: number;
  metadata?: Record<string, any>;
  tags?: Record<string, string>;
}

// Конфигурация логирования
export interface LoggingConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableSentry: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  remoteToken?: string;
  maxLogSize: number;
  logRetentionDays: number;
  sensitiveFields: string[];
  format: "json" | "text";
}

// Структура лога
export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  performance?: {
    duration: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
  };
  request?: {
    method: string;
    url: string;
    userAgent?: string;
    ip?: string;
    statusCode?: number;
  };
}

// Класс для структурированного логирования
export class LoggingSystem {
  private config: LoggingConfig;
  private logBuffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: LoggingConfig) {
    this.config = config;
    this.startFlushInterval();
  }

  /**
   * Логирует сообщение с указанным уровнем
   */
  log(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context: this.sanitizeContext(context),
      error: error ? this.formatError(error) : undefined,
      performance: this.getPerformanceMetrics(),
    };

    this.logBuffer.push(logEntry);

    // Немедленно выводим в консоль для критических уровней
    if (level === "error" || level === "fatal") {
      this.flushLogs();
    }

    // Отправляем в Sentry для ошибок
    if (this.config.enableSentry && (level === "error" || level === "fatal")) {
      this.sendToSentry(logEntry);
    }
  }

  /**
   * Логирует отладочную информацию
   */
  debug(message: string, context: LogContext = {}): void {
    this.log("debug", message, context);
  }

  /**
   * Логирует информационное сообщение
   */
  info(message: string, context: LogContext = {}): void {
    this.log("info", message, context);
  }

  /**
   * Логирует предупреждение
   */
  warn(message: string, context: LogContext = {}): void {
    this.log("warn", message, context);
  }

  /**
   * Логирует ошибку
   */
  error(message: string, context: LogContext = {}, error?: Error): void {
    this.log("error", message, context, error);
  }

  /**
   * Логирует критическую ошибку
   */
  fatal(message: string, context: LogContext = {}, error?: Error): void {
    this.log("fatal", message, context, error);
  }

  /**
   * Логирует HTTP запрос
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context: LogContext = {}
  ): void {
    const level = this.getRequestLogLevel(statusCode);
    const message = `${method} ${url} - ${statusCode} (${duration}ms)`;

    this.log(level, message, {
      ...context,
      duration,
    });
  }

  /**
   * Логирует API вызов
   */
  logApiCall(
    endpoint: string,
    method: string,
    duration: number,
    success: boolean,
    context: LogContext = {}
  ): void {
    const level = success ? "info" : "error";
    const message = `API ${method} ${endpoint} - ${success ? "success" : "failed"} (${duration}ms)`;

    this.log(level, message, {
      ...context,
      component: "api",
      action: "call",
      duration,
      metadata: {
        endpoint,
        method,
        success,
      },
    });
  }

  /**
   * Логирует пользовательское действие
   */
  logUserAction(
    action: string,
    userId: string,
    context: LogContext = {}
  ): void {
    this.log("info", `User action: ${action}`, {
      ...context,
      userId,
      component: "user",
      action,
    });
  }

  /**
   * Логирует производительность
   */
  logPerformance(
    operation: string,
    duration: number,
    context: LogContext = {}
  ): void {
    const level = duration > 5000 ? "warn" : "info";
    const message = `Performance: ${operation} took ${duration}ms`;

    this.log(level, message, {
      ...context,
      component: "performance",
      action: operation,
      duration,
    });
  }

  /**
   * Логирует безопасность
   */
  logSecurity(
    event: string,
    severity: "low" | "medium" | "high" | "critical",
    context: LogContext = {}
  ): void {
    const level =
      severity === "critical"
        ? "fatal"
        : severity === "high"
          ? "error"
          : severity === "medium"
            ? "warn"
            : "info";

    const message = `Security event: ${event} (${severity})`;

    this.log(level, message, {
      ...context,
      component: "security",
      action: event,
      tags: {
        security_event: event,
        severity,
      },
    });
  }

  /**
   * Получает логи за период
   */
  getLogs(
    startTime?: number,
    endTime?: number,
    level?: LogLevel,
    component?: string
  ): LogEntry[] {
    let filtered = [...this.logBuffer];

    if (startTime) {
      filtered = filtered.filter((log) => log.timestamp >= startTime);
    }

    if (endTime) {
      filtered = filtered.filter((log) => log.timestamp <= endTime);
    }

    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }

    if (component) {
      filtered = filtered.filter((log) => log.context.component === component);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Получает статистику логов
   */
  getLogStats(timeWindowMs: number = 60 * 60 * 1000): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byComponent: Record<string, number>;
    errorRate: number;
    averageResponseTime: number;
  } {
    const cutoffTime = Date.now() - timeWindowMs;
    const recentLogs = this.logBuffer.filter(
      (log) => log.timestamp > cutoffTime
    );

    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
    };

    const byComponent: Record<string, number> = {};
    let totalDuration = 0;
    let durationCount = 0;

    recentLogs.forEach((log) => {
      byLevel[log.level]++;

      if (log.context.component) {
        byComponent[log.context.component] =
          (byComponent[log.context.component] || 0) + 1;
      }

      if (log.context.duration) {
        totalDuration += log.context.duration;
        durationCount++;
      }
    });

    const errorCount = byLevel.error + byLevel.fatal;
    const errorRate =
      recentLogs.length > 0 ? (errorCount / recentLogs.length) * 100 : 0;

    return {
      total: recentLogs.length,
      byLevel,
      byComponent,
      errorRate,
      averageResponseTime:
        durationCount > 0 ? totalDuration / durationCount : 0,
    };
  }

  /**
   * Очищает старые логи
   */
  cleanup(): void {
    const cutoffTime =
      Date.now() - this.config.logRetentionDays * 24 * 60 * 60 * 1000;
    this.logBuffer = this.logBuffer.filter((log) => log.timestamp > cutoffTime);
  }

  /**
   * Проверяет, нужно ли логировать сообщение
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error", "fatal"];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Очищает контекст от чувствительных данных
   */
  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context };

    this.config.sensitiveFields.forEach((field) => {
      if (sanitized.metadata?.[field]) {
        sanitized.metadata[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Форматирует ошибку для логирования
   */
  private formatError(error: Error): LogEntry["error"] {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
    };
  }

  /**
   * Получает метрики производительности
   */
  private getPerformanceMetrics(): LogEntry["performance"] {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      duration: 0, // Будет установлено вызывающим кодом
      memoryUsage,
      cpuUsage,
    };
  }

  /**
   * Определяет уровень логирования для HTTP запроса
   */
  private getRequestLogLevel(statusCode: number): LogLevel {
    if (statusCode >= 500) return "error";
    if (statusCode >= 400) return "warn";
    return "info";
  }

  /**
   * Отправляет лог в Sentry
   */
  private sendToSentry(logEntry: LogEntry): void {
    Sentry.withScope((scope) => {
      scope.setLevel(logEntry.level as any);
      scope.setContext("log_context", logEntry.context as any);

      if (logEntry.error) {
        scope.setContext("error", logEntry.error);
      }

      if (logEntry.performance) {
        scope.setContext("performance", logEntry.performance);
      }

      Sentry.captureMessage(logEntry.message, logEntry.level as any);
    });
  }

  /**
   * Запускает периодическую отправку логов
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, 5000); // Каждые 5 секунд
  }

  /**
   * Отправляет накопленные логи
   */
  private flushLogs(): void {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    // Выводим в консоль
    if (this.config.enableConsole) {
      this.outputToConsole(logsToFlush);
    }

    // Отправляем на удаленный сервер
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(logsToFlush);
    }
  }

  /**
   * Выводит логи в консоль
   */
  private outputToConsole(logs: LogEntry[]): void {
    logs.forEach((log) => {
      const timestamp = new Date(log.timestamp).toISOString();
      const contextStr =
        Object.keys(log.context).length > 0
          ? ` ${JSON.stringify(log.context)}`
          : "";

      if (this.config.format === "json") {
        console.log(JSON.stringify(log));
      } else {
        console.log(
          `[${timestamp}] ${log.level.toUpperCase()}: ${log.message}${contextStr}`
        );
      }
    });
  }

  /**
   * Отправляет логи на удаленный сервер
   */
  private async sendToRemote(logs: LogEntry[]): Promise<void> {
    if (!this.config.remoteEndpoint || !this.config.remoteToken) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.remoteToken}`,
        },
        body: JSON.stringify({ logs }),
      });
    } catch (error) {
      console.error("Failed to send logs to remote server:", error);
    }
  }
}

// Предустановленная конфигурация
export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || "info",
  enableConsole: true,
  enableSentry: true,
  enableFile: false,
  enableRemote: !!process.env.LOG_REMOTE_ENDPOINT,
  remoteEndpoint: process.env.LOG_REMOTE_ENDPOINT,
  remoteToken: process.env.LOG_REMOTE_TOKEN,
  maxLogSize: 1000,
  logRetentionDays: 7,
  sensitiveFields: ["password", "token", "secret", "key", "authorization"],
  format: "json",
};

// Глобальная система логирования
export const loggingSystem = new LoggingSystem(DEFAULT_LOGGING_CONFIG);

// Экспорт удобных функций
export const logger = {
  debug: (message: string, context?: LogContext) =>
    loggingSystem.debug(message, context),
  info: (message: string, context?: LogContext) =>
    loggingSystem.info(message, context),
  warn: (message: string, context?: LogContext) =>
    loggingSystem.warn(message, context),
  error: (message: string, context?: LogContext, error?: Error) =>
    loggingSystem.error(message, context, error),
  fatal: (message: string, context?: LogContext, error?: Error) =>
    loggingSystem.fatal(message, context, error),
  request: (
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ) => loggingSystem.logRequest(method, url, statusCode, duration, context),
  api: (
    endpoint: string,
    method: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ) => loggingSystem.logApiCall(endpoint, method, duration, success, context),
  user: (action: string, userId: string, context?: LogContext) =>
    loggingSystem.logUserAction(action, userId, context),
  performance: (operation: string, duration: number, context?: LogContext) =>
    loggingSystem.logPerformance(operation, duration, context),
  security: (
    event: string,
    severity: "low" | "medium" | "high" | "critical",
    context?: LogContext
  ) => loggingSystem.logSecurity(event, severity, context),
};
