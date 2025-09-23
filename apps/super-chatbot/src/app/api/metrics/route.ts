/**
 * API endpoint для получения метрик производительности
 * GET /api/metrics - возвращает детальные метрики
 */

import { type NextRequest, NextResponse } from "next/server";
import { performanceMetrics } from "@/lib/monitoring/performance-metrics";
import { alertingSystem } from "@/lib/monitoring/alerting-system";
import { loggingSystem, logger } from "@/lib/monitoring/logging-system";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const url = new URL(request.url);
  const timeWindow = url.searchParams.get("timeWindow") || "1h";
  const format = url.searchParams.get("format") || "json";

  try {
    // Парсим временное окно
    const timeWindowMs = parseTimeWindow(timeWindow);

    // Получаем метрики производительности
    const perfMetrics = performanceMetrics.getStats();

    // Получаем статистику алертов
    const alertStats = alertingSystem.getAlertStats(timeWindowMs);

    // Получаем статистику логов
    const logStats = loggingSystem.getLogStats(timeWindowMs);

    // Формируем ответ
    const response = {
      timestamp: Date.now(),
      timeWindow: {
        requested: timeWindow,
        actual: timeWindowMs,
      },
      performance: perfMetrics,
      alerts: alertStats,
      logs: logStats,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    // Логируем запрос
    logger.request("GET", "/api/metrics", 200, Date.now() - startTime, {
      component: "api",
      action: "get_metrics",
    });

    // Возвращаем в запрошенном формате
    if (format === "prometheus") {
      return new NextResponse(formatPrometheusMetrics(response), {
        status: 200,
        headers: {
          "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    logger.error(
      "Metrics retrieval failed",
      {
        component: "api",
        action: "get_metrics",
      },
      error as Error
    );

    return NextResponse.json(
      {
        error: "Metrics retrieval failed",
        message: (error as Error).message,
        timestamp: Date.now(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}

/**
 * Парсит строку временного окна в миллисекунды
 */
function parseTimeWindow(timeWindow: string): number {
  const match = timeWindow.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid time window format: ${timeWindow}`);
  }

  const value = Number.parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
}

/**
 * Форматирует метрики в формате Prometheus
 */
function formatPrometheusMetrics(data: any): string {
  const lines: string[] = [];

  // Системные метрики
  lines.push(`# HELP nodejs_memory_usage_bytes Memory usage in bytes`);
  lines.push(`# TYPE nodejs_memory_usage_bytes gauge`);
  lines.push(`nodejs_memory_usage_bytes{type="rss"} ${data.system.memory.rss}`);
  lines.push(
    `nodejs_memory_usage_bytes{type="heapTotal"} ${data.system.memory.heapTotal}`
  );
  lines.push(
    `nodejs_memory_usage_bytes{type="heapUsed"} ${data.system.memory.heapUsed}`
  );
  lines.push(
    `nodejs_memory_usage_bytes{type="external"} ${data.system.memory.external}`
  );

  lines.push(`# HELP nodejs_uptime_seconds Process uptime in seconds`);
  lines.push(`# TYPE nodejs_uptime_seconds counter`);
  lines.push(`nodejs_uptime_seconds ${data.system.uptime}`);

  // Метрики производительности
  if (data.performance.api) {
    lines.push(`# HELP api_requests_total Total number of API requests`);
    lines.push(`# TYPE api_requests_total counter`);
    lines.push(`api_requests_total ${data.performance.api.totalRequests}`);

    lines.push(`# HELP api_request_duration_seconds API request duration`);
    lines.push(`# TYPE api_request_duration_seconds histogram`);
    lines.push(
      `api_request_duration_seconds_bucket{le="0.1"} ${data.performance.api.requestsUnder100ms || 0}`
    );
    lines.push(
      `api_request_duration_seconds_bucket{le="0.5"} ${data.performance.api.requestsUnder500ms || 0}`
    );
    lines.push(
      `api_request_duration_seconds_bucket{le="1.0"} ${data.performance.api.requestsUnder1s || 0}`
    );
    lines.push(
      `api_request_duration_seconds_bucket{le="+Inf"} ${data.performance.api.totalRequests}`
    );
    lines.push(
      `api_request_duration_seconds_sum ${data.performance.api.totalDuration || 0}`
    );
    lines.push(
      `api_request_duration_seconds_count ${data.performance.api.totalRequests}`
    );
  }

  // Метрики алертов
  lines.push(`# HELP alerts_total Total number of alerts`);
  lines.push(`# TYPE alerts_total counter`);
  lines.push(`alerts_total{status="active"} ${data.alerts.active}`);
  lines.push(`alerts_total{status="resolved"} ${data.alerts.resolved}`);

  lines.push(`# HELP alerts_by_severity_total Alerts by severity`);
  lines.push(`# TYPE alerts_by_severity_total counter`);
  lines.push(
    `alerts_by_severity_total{severity="critical"} ${data.alerts.bySeverity.CRITICAL || 0}`
  );
  lines.push(
    `alerts_by_severity_total{severity="error"} ${data.alerts.bySeverity.ERROR || 0}`
  );
  lines.push(
    `alerts_by_severity_total{severity="warning"} ${data.alerts.bySeverity.WARNING || 0}`
  );
  lines.push(
    `alerts_by_severity_total{severity="info"} ${data.alerts.bySeverity.INFO || 0}`
  );

  // Метрики логов
  lines.push(`# HELP logs_total Total number of log entries`);
  lines.push(`# TYPE logs_total counter`);
  lines.push(`logs_total ${data.logs.total}`);

  lines.push(`# HELP logs_by_level_total Logs by level`);
  lines.push(`# TYPE logs_by_level_total counter`);
  lines.push(
    `logs_by_level_total{level="debug"} ${data.logs.byLevel.debug || 0}`
  );
  lines.push(
    `logs_by_level_total{level="info"} ${data.logs.byLevel.info || 0}`
  );
  lines.push(
    `logs_by_level_total{level="warn"} ${data.logs.byLevel.warn || 0}`
  );
  lines.push(
    `logs_by_level_total{level="error"} ${data.logs.byLevel.error || 0}`
  );
  lines.push(
    `logs_by_level_total{level="fatal"} ${data.logs.byLevel.fatal || 0}`
  );

  return `${lines.join("\n")}\n`;
}
