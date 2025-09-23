/**
 * API endpoint для проверки здоровья приложения
 * GET /api/health - возвращает текущее состояние здоровья
 */

import { type NextRequest, NextResponse } from "next/server";
import { healthMonitor } from "@/lib/monitoring/health-monitor";
import { performanceMetrics } from "@/lib/monitoring/performance-metrics";
import { alertingSystem } from "@/lib/monitoring/alerting-system";
import { logger } from "@/lib/monitoring/logging-system";

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Получаем текущее состояние здоровья
    const healthStatus = await healthMonitor.performHealthChecks();

    // Получаем метрики производительности
    const metrics = performanceMetrics.getStats();

    // Получаем активные алерты
    const activeAlerts = alertingSystem.getActiveAlerts();

    // Формируем полный ответ
    const response = {
      status: healthStatus.overall,
      timestamp: healthStatus.timestamp,
      uptime: healthStatus.uptime,
      version: healthStatus.version,
      environment: healthStatus.environment,
      checks: healthStatus.checks,
      summary: healthStatus.summary,
      metrics: {
        performance: metrics,
        alerts: {
          active: activeAlerts.length,
          critical: activeAlerts.filter((a) => a.severity === "CRITICAL")
            .length,
          error: activeAlerts.filter((a) => a.severity === "ERROR").length,
          warning: activeAlerts.filter((a) => a.severity === "WARNING").length,
        },
      },
    };

    // Логируем запрос
    logger.request("GET", "/api/health", 200, Date.now() - startTime, {
      component: "api",
      action: "health_check",
    });

    return NextResponse.json(response, {
      status: healthStatus.overall === "unhealthy" ? 503 : 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    logger.error(
      "Health check failed",
      {
        component: "api",
        action: "health_check",
      },
      error as Error
    );

    return NextResponse.json(
      {
        status: "unknown",
        timestamp: Date.now(),
        error: "Health check failed",
        message: (error as Error).message,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}
