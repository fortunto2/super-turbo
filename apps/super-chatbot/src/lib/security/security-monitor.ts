/**
 * Система мониторинга безопасности
 * Отслеживает подозрительную активность и генерирует алерты
 */

import type { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

// Интерфейсы для мониторинга
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: number;
  source: string;
  details: Record<string, any>;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

export type SecurityEventType =
  | "RATE_LIMIT_EXCEEDED"
  | "MALICIOUS_INPUT"
  | "UNAUTHORIZED_ACCESS"
  | "SUSPICIOUS_ACTIVITY"
  | "FILE_UPLOAD_ABUSE"
  | "API_ABUSE"
  | "BRUTE_FORCE_ATTEMPT"
  | "XSS_ATTEMPT"
  | "SQL_INJECTION_ATTEMPT"
  | "PATH_TRAVERSAL_ATTEMPT";

export type SecuritySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Конфигурация мониторинга
export interface SecurityMonitorConfig {
  enableSentry: boolean;
  enableLogging: boolean;
  enableAlerts: boolean;
  alertThresholds: {
    [K in SecuritySeverity]: number;
  };
  cooldownPeriods: {
    [K in SecurityEventType]: number;
  };
}

// Класс для мониторинга безопасности
export class SecurityMonitor {
  private config: SecurityMonitorConfig;
  private events: SecurityEvent[] = [];
  private alertCooldowns = new Map<string, number>();

  constructor(config: SecurityMonitorConfig) {
    this.config = config;
  }

  /**
   * Регистрирует событие безопасности
   */
  logEvent(event: Omit<SecurityEvent, "id" | "timestamp">): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: Date.now(),
    };

    // Добавляем событие в список
    this.events.push(securityEvent);

    // Очищаем старые события (старше 24 часов)
    this.cleanupOldEvents();

    // Отправляем в Sentry если включено
    if (this.config.enableSentry) {
      this.sendToSentry(securityEvent);
    }

    // Логируем если включено
    if (this.config.enableLogging) {
      this.logToConsole(securityEvent);
    }

    // Проверяем на алерты
    if (this.config.enableAlerts) {
      this.checkForAlerts(securityEvent);
    }
  }

  /**
   * Регистрирует попытку превышения rate limit
   */
  logRateLimitExceeded(req: NextRequest, limit: number, current: number): void {
    this.logEvent({
      type: "RATE_LIMIT_EXCEEDED",
      severity: "MEDIUM",
      source: "rate_limiter",
      details: {
        limit,
        current,
        path: req.nextUrl.pathname,
        method: req.method,
      },
      userAgent: req.headers.get("user-agent") || undefined,
      ip: this.getClientIP(req),
    });
  }

  /**
   * Регистрирует попытку внедрения вредоносного кода
   */
  logMaliciousInput(req: NextRequest, input: string, pattern: string): void {
    this.logEvent({
      type: "MALICIOUS_INPUT",
      severity: "HIGH",
      source: "input_validator",
      details: {
        input: input.substring(0, 100), // Ограничиваем длину
        pattern,
        path: req.nextUrl.pathname,
        method: req.method,
      },
      userAgent: req.headers.get("user-agent") || undefined,
      ip: this.getClientIP(req),
    });
  }

  /**
   * Регистрирует попытку несанкционированного доступа
   */
  logUnauthorizedAccess(
    req: NextRequest,
    resource: string,
    reason: string
  ): void {
    this.logEvent({
      type: "UNAUTHORIZED_ACCESS",
      severity: "HIGH",
      source: "auth_middleware",
      details: {
        resource,
        reason,
        path: req.nextUrl.pathname,
        method: req.method,
      },
      userAgent: req.headers.get("user-agent") || undefined,
      ip: this.getClientIP(req),
    });
  }

  /**
   * Регистрирует подозрительную активность
   */
  logSuspiciousActivity(
    req: NextRequest,
    activity: string,
    details: Record<string, any>
  ): void {
    this.logEvent({
      type: "SUSPICIOUS_ACTIVITY",
      severity: "MEDIUM",
      source: "security_monitor",
      details: {
        activity,
        ...details,
        path: req.nextUrl.pathname,
        method: req.method,
      },
      userAgent: req.headers.get("user-agent") || undefined,
      ip: this.getClientIP(req),
    });
  }

  /**
   * Регистрирует злоупотребление загрузкой файлов
   */
  logFileUploadAbuse(
    req: NextRequest,
    fileName: string,
    fileSize: number,
    reason: string
  ): void {
    this.logEvent({
      type: "FILE_UPLOAD_ABUSE",
      severity: "MEDIUM",
      source: "file_upload",
      details: {
        fileName,
        fileSize,
        reason,
        path: req.nextUrl.pathname,
        method: req.method,
      },
      userAgent: req.headers.get("user-agent") || undefined,
      ip: this.getClientIP(req),
    });
  }

  /**
   * Регистрирует попытку атаки на API
   */
  logAPIAbuse(
    req: NextRequest,
    abuseType: string,
    details: Record<string, any>
  ): void {
    this.logEvent({
      type: "API_ABUSE",
      severity: "HIGH",
      source: "api_monitor",
      details: {
        abuseType,
        ...details,
        path: req.nextUrl.pathname,
        method: req.method,
      },
      userAgent: req.headers.get("user-agent") || undefined,
      ip: this.getClientIP(req),
    });
  }

  /**
   * Регистрирует попытку брутфорса
   */
  logBruteForceAttempt(
    req: NextRequest,
    target: string,
    attempts: number
  ): void {
    this.logEvent({
      type: "BRUTE_FORCE_ATTEMPT",
      severity: "CRITICAL",
      source: "auth_monitor",
      details: {
        target,
        attempts,
        path: req.nextUrl.pathname,
        method: req.method,
      },
      userAgent: req.headers.get("user-agent") || undefined,
      ip: this.getClientIP(req),
    });
  }

  /**
   * Получает статистику событий безопасности
   */
  getStats(timeWindowMs: number = 24 * 60 * 60 * 1000): {
    totalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsBySeverity: Record<SecuritySeverity, number>;
    topIPs: Array<{ ip: string; count: number }>;
    topUserAgents: Array<{ userAgent: string; count: number }>;
  } {
    const cutoffTime = Date.now() - timeWindowMs;
    const recentEvents = this.events.filter(
      (event) => event.timestamp > cutoffTime
    );

    const eventsByType: Record<SecurityEventType, number> = {
      RATE_LIMIT_EXCEEDED: 0,
      MALICIOUS_INPUT: 0,
      UNAUTHORIZED_ACCESS: 0,
      SUSPICIOUS_ACTIVITY: 0,
      FILE_UPLOAD_ABUSE: 0,
      API_ABUSE: 0,
      BRUTE_FORCE_ATTEMPT: 0,
      XSS_ATTEMPT: 0,
      SQL_INJECTION_ATTEMPT: 0,
      PATH_TRAVERSAL_ATTEMPT: 0,
    };

    const eventsBySeverity: Record<SecuritySeverity, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    const ipCounts = new Map<string, number>();
    const userAgentCounts = new Map<string, number>();

    recentEvents.forEach((event) => {
      eventsByType[event.type]++;
      eventsBySeverity[event.severity]++;

      if (event.ip) {
        ipCounts.set(event.ip, (ipCounts.get(event.ip) || 0) + 1);
      }

      if (event.userAgent) {
        userAgentCounts.set(
          event.userAgent,
          (userAgentCounts.get(event.userAgent) || 0) + 1
        );
      }
    });

    const topIPs = Array.from(ipCounts.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topUserAgents = Array.from(userAgentCounts.entries())
      .map(([userAgent, count]) => ({ userAgent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: recentEvents.length,
      eventsByType,
      eventsBySeverity,
      topIPs,
      topUserAgents,
    };
  }

  /**
   * Получает события по IP адресу
   */
  getEventsByIP(
    ip: string,
    timeWindowMs: number = 24 * 60 * 60 * 1000
  ): SecurityEvent[] {
    const cutoffTime = Date.now() - timeWindowMs;
    return this.events.filter(
      (event) => event.ip === ip && event.timestamp > cutoffTime
    );
  }

  /**
   * Получает события по типу
   */
  getEventsByType(
    type: SecurityEventType,
    timeWindowMs: number = 24 * 60 * 60 * 1000
  ): SecurityEvent[] {
    const cutoffTime = Date.now() - timeWindowMs;
    return this.events.filter(
      (event) => event.type === type && event.timestamp > cutoffTime
    );
  }

  /**
   * Проверяет, заблокирован ли IP
   */
  isIPBlocked(ip: string): boolean {
    const recentEvents = this.getEventsByIP(ip, 60 * 60 * 1000); // Последний час
    const criticalEvents = recentEvents.filter(
      (event) => event.severity === "CRITICAL"
    );
    return criticalEvents.length >= 3; // 3 критических события = блокировка
  }

  /**
   * Очищает старые события
   */
  private cleanupOldEvents(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 часа
    this.events = this.events.filter((event) => event.timestamp > cutoffTime);
  }

  /**
   * Генерирует уникальный ID события
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Получает IP адрес клиента
   */
  private getClientIP(req: NextRequest): string {
    return (
      (req as any).ip ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown"
    );
  }

  /**
   * Отправляет событие в Sentry
   */
  private sendToSentry(event: SecurityEvent): void {
    Sentry.withScope((scope) => {
      scope.setTag("security_event", event.type);
      scope.setLevel(this.getSentryLevel(event.severity));
      scope.setContext("security_details", event.details);

      if (event.ip) scope.setTag("ip", event.ip);
      if (event.userId) scope.setUser({ id: event.userId });

      Sentry.captureMessage(
        `Security Event: ${event.type}`,
        this.getSentryLevel(event.severity)
      );
    });
  }

  /**
   * Логирует событие в консоль
   */
  private logToConsole(event: SecurityEvent): void {
    const logLevel = this.getConsoleLevel(event.severity);
    console[logLevel](`[SECURITY] ${event.type} - ${event.severity}`, {
      id: event.id,
      timestamp: new Date(event.timestamp).toISOString(),
      source: event.source,
      details: event.details,
      ip: event.ip,
      userAgent: event.userAgent,
    });
  }

  /**
   * Проверяет на необходимость отправки алерта
   */
  private checkForAlerts(event: SecurityEvent): void {
    const cooldownKey = `${event.type}_${event.ip || "unknown"}`;
    const cooldownPeriod = this.config.cooldownPeriods[event.type];
    const lastAlert = this.alertCooldowns.get(cooldownKey) || 0;

    if (Date.now() - lastAlert < cooldownPeriod) {
      return; // В периоде кулдауна
    }

    const threshold = this.config.alertThresholds[event.severity];
    const recentEvents = this.getEventsByType(event.type, 60 * 60 * 1000); // Последний час

    if (recentEvents.length >= threshold) {
      this.sendAlert(event, recentEvents.length);
      this.alertCooldowns.set(cooldownKey, Date.now());
    }
  }

  /**
   * Отправляет алерт
   */
  private sendAlert(event: SecurityEvent, count: number): void {
    // В реальном приложении здесь была бы отправка в Slack, email, etc.
    console.warn(
      `[SECURITY ALERT] ${event.type} detected ${count} times in the last hour`,
      {
        severity: event.severity,
        ip: event.ip,
        details: event.details,
      }
    );
  }

  /**
   * Преобразует уровень серьезности в уровень Sentry
   */
  private getSentryLevel(
    severity: SecuritySeverity
  ): "info" | "warning" | "error" | "fatal" {
    switch (severity) {
      case "LOW":
        return "info";
      case "MEDIUM":
        return "warning";
      case "HIGH":
        return "error";
      case "CRITICAL":
        return "fatal";
    }
  }

  /**
   * Преобразует уровень серьезности в уровень консоли
   */
  private getConsoleLevel(
    severity: SecuritySeverity
  ): "log" | "warn" | "error" {
    switch (severity) {
      case "LOW":
        return "log";
      case "MEDIUM":
        return "warn";
      case "HIGH":
        return "error";
      case "CRITICAL":
        return "error";
    }
  }
}

// Глобальный экземпляр монитора безопасности
export const securityMonitor = new SecurityMonitor({
  enableSentry: true,
  enableLogging: true,
  enableAlerts: true,
  alertThresholds: {
    LOW: 100,
    MEDIUM: 50,
    HIGH: 10,
    CRITICAL: 3,
  },
  cooldownPeriods: {
    RATE_LIMIT_EXCEEDED: 5 * 60 * 1000, // 5 минут
    MALICIOUS_INPUT: 10 * 60 * 1000, // 10 минут
    UNAUTHORIZED_ACCESS: 15 * 60 * 1000, // 15 минут
    SUSPICIOUS_ACTIVITY: 30 * 60 * 1000, // 30 минут
    FILE_UPLOAD_ABUSE: 60 * 60 * 1000, // 1 час
    API_ABUSE: 15 * 60 * 1000, // 15 минут
    BRUTE_FORCE_ATTEMPT: 60 * 60 * 1000, // 1 час
    XSS_ATTEMPT: 30 * 60 * 1000, // 30 минут
    SQL_INJECTION_ATTEMPT: 30 * 60 * 1000, // 30 минут
    PATH_TRAVERSAL_ATTEMPT: 30 * 60 * 1000, // 30 минут
  },
});
