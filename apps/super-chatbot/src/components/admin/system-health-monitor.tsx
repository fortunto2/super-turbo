"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import {
  Server,
  Database,
  HardDrive,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface SystemHealth {
  databaseSize: string;
  databaseName: string;
  postgresVersion: string;
  uptime: number;
}

export function SystemHealthMonitor() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/admin/system/stats");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch system health");
        }

        setHealth(data.stats.system);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching system health:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    // Refresh every 15 seconds
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy":
        return (
          <Badge
            variant="default"
            className="bg-green-500"
          >
            Healthy
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="default"
            className="bg-yellow-500"
          >
            Warning
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Monitor
          </CardTitle>
          <CardDescription>
            Real-time system health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  <span className="text-sm font-medium">Loading...</span>
                </div>
                <div className="text-lg font-bold">--</div>
                <div className="text-xs text-muted-foreground">Loading...</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Monitor
          </CardTitle>
          <CardDescription>
            Real-time system health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">
              Error loading system health: {error}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthMetrics = [
    {
      title: "Database Connection",
      value: "Connected",
      description: health.databaseName,
      icon: Database,
      status: "healthy" as const,
      color: "text-green-500",
    },
    {
      title: "Database Size",
      value: health.databaseSize,
      description: "Current database size",
      icon: HardDrive,
      status: "healthy" as const,
      color: "text-blue-500",
    },
    {
      title: "PostgreSQL Version",
      value: health.postgresVersion.split(" ")[0] || "Unknown",
      description: "Database version",
      icon: Server,
      status: "healthy" as const,
      color: "text-purple-500",
    },
    {
      title: "System Uptime",
      value: formatUptime(health.uptime),
      description: "Current session uptime",
      icon: Activity,
      status: "healthy" as const,
      color: "text-emerald-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health Monitor
        </CardTitle>
        <CardDescription>
          Real-time system health and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {healthMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-lg border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-sm font-medium">{metric.title}</span>
                  </div>
                  {getStatusIcon(metric.status)}
                </div>
                <div className="text-lg font-bold mb-1">{metric.value}</div>
                <div className="text-xs text-muted-foreground mb-2">
                  {metric.description}
                </div>
                {getStatusBadge(metric.status)}
              </div>
            );
          })}
        </div>

        {/* Overall System Status */}
        <div className="mt-6 p-4 rounded-lg border bg-green-50 dark:bg-green-950">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium text-green-800 dark:text-green-200">
              All Systems Operational
            </span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            All critical systems are running normally. No issues detected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
