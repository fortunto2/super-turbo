/**
 * Система алертов и уведомлений
 * Отправляет уведомления о критических событиях и проблемах
 */

import * as Sentry from "@sentry/nextjs";

// Интерфейсы для алертов
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  source: string;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: number;
}

export type AlertType =
  | "PERFORMANCE_DEGRADATION"
  | "HIGH_ERROR_RATE"
  | "MEMORY_LEAK"
  | "CPU_SPIKE"
  | "DATABASE_SLOW"
  | "API_TIMEOUT"
  | "WEBSOCKET_DISCONNECTIONS"
  | "SECURITY_BREACH"
  | "RATE_LIMIT_EXCEEDED"
  | "DISK_SPACE_LOW"
  | "SERVICE_DOWN"
  | "CUSTOM";

export type AlertSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

// Конфигурация алертов
export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  cooldownPeriods: Record<AlertType, number>; // в миллисекундах
  escalationRules: EscalationRule[];
}

export interface AlertChannel {
  type: "slack" | "email" | "webhook" | "sentry";
  config: Record<string, any>;
  enabled: boolean;
}

export interface EscalationRule {
  alertType: AlertType;
  severity: AlertSeverity;
  conditions: {
    count: number;
    timeWindow: number; // в миллисекундах
  };
  actions: string[];
}

// Класс для управления алертами
export class AlertingSystem {
  private alerts: Alert[] = [];
  private config: AlertConfig;
  private cooldowns: Map<string, number> = new Map();
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: AlertConfig) {
    this.config = config;
  }

  /**
   * Создает новый алерт
   */
  createAlert(
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    message: string,
    source: string,
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): Alert {
    const alert: Alert = {
      id: this.generateAlertId(),
      type,
      severity,
      title,
      message,
      timestamp: Date.now(),
      source,
      tags,
      metadata,
      resolved: false,
    };

    this.alerts.push(alert);

    // Проверяем кулдаун
    if (this.isInCooldown(alert)) {
      return alert;
    }

    // Отправляем алерт
    this.sendAlert(alert);

    // Проверяем правила эскалации
    this.checkEscalationRules(alert);

    return alert;
  }

  /**
   * Разрешает алерт
   */
  resolveAlert(alertId: string, resolvedBy?: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert || alert.resolved) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = Date.now();

    // Отправляем уведомление о разрешении
    this.sendAlertResolution(alert, resolvedBy);

    return true;
  }

  /**
   * Получает активные алерты
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter((alert) => !alert.resolved);
  }

  /**
   * Получает алерты по типу
   */
  getAlertsByType(type: AlertType, timeWindowMs?: number): Alert[] {
    let filtered = this.alerts.filter((alert) => alert.type === type);

    if (timeWindowMs) {
      const cutoffTime = Date.now() - timeWindowMs;
      filtered = filtered.filter((alert) => alert.timestamp > cutoffTime);
    }

    return filtered;
  }

  /**
   * Получает алерты по серьезности
   */
  getAlertsBySeverity(severity: AlertSeverity, timeWindowMs?: number): Alert[] {
    let filtered = this.alerts.filter((alert) => alert.severity === severity);

    if (timeWindowMs) {
      const cutoffTime = Date.now() - timeWindowMs;
      filtered = filtered.filter((alert) => alert.timestamp > cutoffTime);
    }

    return filtered;
  }

  /**
   * Получает статистику алертов
   */
  getAlertStats(timeWindowMs: number = 24 * 60 * 60 * 1000): {
    total: number;
    active: number;
    resolved: number;
    byType: Record<AlertType, number>;
    bySeverity: Record<AlertSeverity, number>;
    averageResolutionTime: number;
  } {
    const cutoffTime = Date.now() - timeWindowMs;
    const recentAlerts = this.alerts.filter(
      (alert) => alert.timestamp > cutoffTime
    );

    const byType: Record<AlertType, number> = {
      PERFORMANCE_DEGRADATION: 0,
      HIGH_ERROR_RATE: 0,
      MEMORY_LEAK: 0,
      CPU_SPIKE: 0,
      DATABASE_SLOW: 0,
      API_TIMEOUT: 0,
      WEBSOCKET_DISCONNECTIONS: 0,
      SECURITY_BREACH: 0,
      RATE_LIMIT_EXCEEDED: 0,
      DISK_SPACE_LOW: 0,
      SERVICE_DOWN: 0,
      CUSTOM: 0,
    };

    const bySeverity: Record<AlertSeverity, number> = {
      INFO: 0,
      WARNING: 0,
      ERROR: 0,
      CRITICAL: 0,
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    recentAlerts.forEach((alert) => {
      byType[alert.type]++;
      bySeverity[alert.severity]++;

      if (alert.resolved && alert.resolvedAt) {
        totalResolutionTime += alert.resolvedAt - alert.timestamp;
        resolvedCount++;
      }
    });

    return {
      total: recentAlerts.length,
      active: recentAlerts.filter((alert) => !alert.resolved).length,
      resolved: recentAlerts.filter((alert) => alert.resolved).length,
      byType,
      bySeverity,
      averageResolutionTime:
        resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0,
    };
  }

  /**
   * Отправляет алерт через настроенные каналы
   */
  private async sendAlert(alert: Alert): Promise<void> {
    if (!this.config.enabled) return;

    for (const channel of this.config.channels) {
      if (!channel.enabled) continue;

      try {
        switch (channel.type) {
          case "slack":
            await this.sendSlackAlert(alert, channel.config);
            break;
          case "email":
            await this.sendEmailAlert(alert, channel.config);
            break;
          case "webhook":
            await this.sendWebhookAlert(alert, channel.config);
            break;
          case "sentry":
            await this.sendSentryAlert(alert, channel.config);
            break;
        }
      } catch (error) {
        console.error(`Failed to send alert via ${channel.type}:`, error);
      }
    }
  }

  /**
   * Отправляет уведомление о разрешении алерта
   */
  private async sendAlertResolution(
    alert: Alert,
    resolvedBy?: string
  ): Promise<void> {
    const message = `✅ Alert resolved: ${alert.title}${resolvedBy ? ` (resolved by ${resolvedBy})` : ""}`;

    // Отправляем в Sentry
    Sentry.captureMessage(message, "info");

    // Логируем в консоль
    console.log(`[ALERT RESOLVED] ${message}`, {
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
      resolutionTime: alert.resolvedAt! - alert.timestamp,
    });
  }

  /**
   * Отправляет алерт в Slack
   */
  private async sendSlackAlert(alert: Alert, config: any): Promise<void> {
    const webhookUrl = config.webhookUrl;
    if (!webhookUrl) return;

    const color = this.getSeverityColor(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    const payload = {
      text: `${emoji} ${alert.title}`,
      attachments: [
        {
          color,
          fields: [
            {
              title: "Type",
              value: alert.type,
              short: true,
            },
            {
              title: "Severity",
              value: alert.severity,
              short: true,
            },
            {
              title: "Source",
              value: alert.source,
              short: true,
            },
            {
              title: "Message",
              value: alert.message,
              short: false,
            },
            {
              title: "Timestamp",
              value: new Date(alert.timestamp).toISOString(),
              short: true,
            },
          ],
        },
      ],
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  /**
   * Отправляет алерт по email
   */
  private async sendEmailAlert(alert: Alert, config: any): Promise<void> {
    // В реальном приложении здесь была бы интеграция с email сервисом
    console.log(`[EMAIL ALERT] ${alert.title}: ${alert.message}`, {
      to: config.to,
      subject: `[${alert.severity}] ${alert.title}`,
    });
  }

  /**
   * Отправляет алерт через webhook
   */
  private async sendWebhookAlert(alert: Alert, config: any): Promise<void> {
    const webhookUrl = config.url;
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify(alert),
    });
  }

  /**
   * Отправляет алерт в Sentry
   */
  private async sendSentryAlert(alert: Alert, config: any): Promise<void> {
    Sentry.withScope((scope) => {
      scope.setTag("alert_type", alert.type);
      scope.setTag("alert_severity", alert.severity);
      scope.setLevel(this.getSentryLevel(alert.severity));
      scope.setContext("alert_details", {
        title: alert.title,
        message: alert.message,
        source: alert.source,
        tags: alert.tags,
        metadata: alert.metadata,
      });

      Sentry.captureMessage(alert.title, this.getSentryLevel(alert.severity));
    });
  }

  /**
   * Проверяет правила эскалации
   */
  private checkEscalationRules(alert: Alert): void {
    const rule = this.config.escalationRules.find(
      (r) => r.alertType === alert.type && r.severity === alert.severity
    );

    if (!rule) return;

    const escalationKey = `${alert.type}_${alert.severity}`;
    const recentAlerts = this.getAlertsByType(
      alert.type,
      rule.conditions.timeWindow
    );

    if (recentAlerts.length >= rule.conditions.count) {
      // Запускаем эскалацию
      this.escalateAlert(alert, rule.actions);
    }
  }

  /**
   * Эскалирует алерт
   */
  private escalateAlert(alert: Alert, actions: string[]): void {
    console.warn(`[ALERT ESCALATION] ${alert.title}`, {
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
      actions,
    });

    // В реальном приложении здесь были бы конкретные действия эскалации
    actions.forEach((action) => {
      console.log(`[ESCALATION ACTION] ${action} for alert ${alert.id}`);
    });
  }

  /**
   * Проверяет, находится ли алерт в периоде кулдауна
   */
  private isInCooldown(alert: Alert): boolean {
    const cooldownKey = `${alert.type}_${alert.source}`;
    const cooldownPeriod = this.config.cooldownPeriods[alert.type];
    const lastAlert = this.cooldowns.get(cooldownKey) || 0;

    if (Date.now() - lastAlert < cooldownPeriod) {
      return true;
    }

    this.cooldowns.set(cooldownKey, Date.now());
    return false;
  }

  /**
   * Получает цвет для серьезности алерта
   */
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case "INFO":
        return "#36a2eb";
      case "WARNING":
        return "#ffcc02";
      case "ERROR":
        return "#ff6b6b";
      case "CRITICAL":
        return "#e74c3c";
    }
  }

  /**
   * Получает эмодзи для серьезности алерта
   */
  private getSeverityEmoji(severity: AlertSeverity): string {
    switch (severity) {
      case "INFO":
        return "ℹ️";
      case "WARNING":
        return "⚠️";
      case "ERROR":
        return "❌";
      case "CRITICAL":
        return "🚨";
    }
  }

  /**
   * Преобразует серьезность алерта в уровень Sentry
   */
  private getSentryLevel(
    severity: AlertSeverity
  ): "info" | "warning" | "error" | "fatal" {
    switch (severity) {
      case "INFO":
        return "info";
      case "WARNING":
        return "warning";
      case "ERROR":
        return "error";
      case "CRITICAL":
        return "fatal";
    }
  }

  /**
   * Генерирует уникальный ID алерта
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

// Предустановленные конфигурации алертов
export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  enabled: true,
  channels: [
    {
      type: "sentry",
      config: {},
      enabled: true,
    },
    {
      type: "webhook",
      config: {
        url: process.env.ALERT_WEBHOOK_URL,
        headers: {
          Authorization: `Bearer ${process.env.ALERT_WEBHOOK_TOKEN}`,
        },
      },
      enabled: !!process.env.ALERT_WEBHOOK_URL,
    },
  ],
  cooldownPeriods: {
    PERFORMANCE_DEGRADATION: 5 * 60 * 1000, // 5 минут
    HIGH_ERROR_RATE: 2 * 60 * 1000, // 2 минуты
    MEMORY_LEAK: 10 * 60 * 1000, // 10 минут
    CPU_SPIKE: 5 * 60 * 1000, // 5 минут
    DATABASE_SLOW: 3 * 60 * 1000, // 3 минуты
    API_TIMEOUT: 1 * 60 * 1000, // 1 минута
    WEBSOCKET_DISCONNECTIONS: 2 * 60 * 1000, // 2 минуты
    SECURITY_BREACH: 0, // Немедленно
    RATE_LIMIT_EXCEEDED: 1 * 60 * 1000, // 1 минута
    DISK_SPACE_LOW: 30 * 60 * 1000, // 30 минут
    SERVICE_DOWN: 0, // Немедленно
    CUSTOM: 5 * 60 * 1000, // 5 минут
  },
  escalationRules: [
    {
      alertType: "PERFORMANCE_DEGRADATION",
      severity: "ERROR",
      conditions: {
        count: 3,
        timeWindow: 10 * 60 * 1000, // 10 минут
      },
      actions: ["notify_team_lead", "create_incident"],
    },
    {
      alertType: "SECURITY_BREACH",
      severity: "CRITICAL",
      conditions: {
        count: 1,
        timeWindow: 60 * 1000, // 1 минута
      },
      actions: [
        "notify_security_team",
        "create_incident",
        "escalate_to_management",
      ],
    },
  ],
};

// Глобальная система алертов
export const alertingSystem = new AlertingSystem(DEFAULT_ALERT_CONFIG);
