/**
 * Компонент дашборда мониторинга для админ панели
 * Отображает метрики производительности, алерты и состояние здоровья
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Server,
  Activity,
  AlertCircle,
} from "lucide-react";

interface MonitoringData {
  health: {
    overall: string;
    uptime: number;
    checks: Array<{
      name: string;
      status: string;
      message: string;
      duration: number;
    }>;
    summary: {
      healthy: number;
      degraded: number;
      unhealthy: number;
      unknown: number;
    };
  };
  performance: {
    api: {
      totalRequests: number;
      averageResponseTime: number;
      successRate: number;
    };
    components: {
      totalRenders: number;
      averageRenderTime: number;
    };
  };
  alerts: {
    active: number;
    critical: number;
    error: number;
    warning: number;
  };
  logs: {
    total: number;
    errorRate: number;
    byLevel: Record<string, number>;
  };
}

export function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Загружаем данные мониторинга
  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [healthResponse, metricsResponse] = await Promise.all([
        fetch("/api/health"),
        fetch("/api/metrics"),
      ]);

      if (!healthResponse.ok || !metricsResponse.ok) {
        throw new Error("Failed to fetch monitoring data");
      }

      const healthData = await healthResponse.json();
      const metricsData = await metricsResponse.json();

      setData({
        health: {
          overall: healthData.status,
          uptime: healthData.uptime,
          checks: healthData.checks || [],
          summary: healthData.summary || {
            healthy: 0,
            degraded: 0,
            unhealthy: 0,
            unknown: 0,
          },
        },
        performance: {
          api: {
            totalRequests: metricsData.performance?.api?.totalRequests || 0,
            averageResponseTime:
              metricsData.performance?.api?.averageResponseTime || 0,
            successRate: metricsData.performance?.api?.successRate || 0,
          },
          components: {
            totalRenders:
              metricsData.performance?.components?.totalRenders || 0,
            averageRenderTime:
              metricsData.performance?.components?.averageRenderTime || 0,
          },
        },
        alerts: {
          active: metricsData.alerts?.active || 0,
          critical: metricsData.alerts?.critical || 0,
          error: metricsData.alerts?.error || 0,
          warning: metricsData.alerts?.warning || 0,
        },
        logs: {
          total: metricsData.logs?.total || 0,
          errorRate: metricsData.logs?.errorRate || 0,
          byLevel: metricsData.logs?.byLevel || {},
        },
      });

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Автообновление каждые 30 секунд
  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Форматирование времени
  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Получение цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "unhealthy":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Получение иконки статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "unhealthy":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Loading monitoring data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">
            Error loading monitoring data: {error}
          </span>
        </div>
        <button
          onClick={fetchMonitoringData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-gray-600">
            {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={fetchMonitoringData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Общее состояние */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(data.health.overall)}
              </div>
              <div className="text-sm font-medium">Overall Status</div>
              <div
                className={`text-lg font-bold ${getStatusColor(data.health.overall)}`}
              >
                {data.health.overall.toUpperCase()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatUptime(data.health.uptime)}
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.health.summary.healthy}
              </div>
              <div className="text-sm text-gray-600">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.health.summary.unhealthy + data.health.summary.degraded}
              </div>
              <div className="text-sm text-gray-600">Issues</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Проверки здоровья */}
      <Card>
        <CardHeader>
          <CardTitle>Health Checks</CardTitle>
          <CardDescription>
            Status of individual system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.health.checks.map((check, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  {getStatusIcon(check.status)}
                  <div className="ml-3">
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-gray-600">{check.message}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{check.duration}ms</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Метрики производительности */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              API Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Requests</span>
                <span className="font-bold">
                  {data.performance.api.totalRequests.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Response Time</span>
                <span className="font-bold">
                  {data.performance.api.averageResponseTime.toFixed(0)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate</span>
                <span className="font-bold">
                  {data.performance.api.successRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Component Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Renders</span>
                <span className="font-bold">
                  {data.performance.components.totalRenders.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Render Time</span>
                <span className="font-bold">
                  {data.performance.components.averageRenderTime.toFixed(0)}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Алерты и логи */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-red-600">Critical</span>
                <span className="font-bold text-red-600">
                  {data.alerts.critical}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">Error</span>
                <span className="font-bold text-orange-600">
                  {data.alerts.error}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Warning</span>
                <span className="font-bold text-yellow-600">
                  {data.alerts.warning}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Active</span>
                <span className="font-bold">{data.alerts.active}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Logs</span>
                <span className="font-bold">
                  {data.logs.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate</span>
                <span className="font-bold">
                  {data.logs.errorRate.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Errors</span>
                <span className="font-bold text-red-600">
                  {data.logs.byLevel.error || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Warnings</span>
                <span className="font-bold text-yellow-600">
                  {data.logs.byLevel.warn || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
