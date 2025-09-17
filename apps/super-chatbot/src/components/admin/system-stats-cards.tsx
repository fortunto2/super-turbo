"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@turbo-super/ui";
import {
  Users,
  FileText,
  Activity,
  TrendingUp,
  Database,
  Clock,
} from "lucide-react";

interface SystemStats {
  overview: {
    totalUsers: number;
    guestUsers: number;
    regularUsers: number;
    totalDocuments: number;
    totalProjects: number;
  };
  content: {
    totalDocuments: number;
    images: number;
    videos: number;
    texts: number;
  };
  activity: {
    recentUsers: number;
    recentDocuments: number;
    recentProjects: number;
  };
  balance: {
    total: number;
    average: number;
    max: number;
    min: number;
  };
  system: {
    databaseSize: string;
    databaseName: string;
    postgresVersion: string;
    uptime: number;
  };
}

export function SystemStatsCards() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/system/stats");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch system stats");
        }

        setStats(data.stats);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching system stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">
          Error loading system stats: {error}
        </div>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.overview.totalUsers,
      description: `${stats.overview.guestUsers} guests, ${stats.overview.regularUsers} registered`,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Documents",
      value: stats.overview.totalDocuments,
      description: `${stats.content.images} images, ${stats.content.videos} videos`,
      icon: FileText,
      color: "text-green-500",
    },
    {
      title: "Total Projects",
      value: stats.overview.totalProjects,
      description: "User-created projects",
      icon: Activity,
      color: "text-purple-500",
    },
    {
      title: "Recent Activity",
      value: stats.activity.recentDocuments,
      description: "Documents created in last 24h",
      icon: TrendingUp,
      color: "text-orange-500",
    },
    {
      title: "Database Size",
      value: stats.system.databaseSize,
      description: stats.system.databaseName,
      icon: Database,
      color: "text-cyan-500",
    },
    {
      title: "System Uptime",
      value: formatUptime(stats.system.uptime),
      description: "Current session uptime",
      icon: Clock,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
