import { Suspense } from "react";
import { SystemStatsCards } from "@/components/admin/system-stats-cards";
import { SystemHealthMonitor } from "@/components/admin/system-health-monitor";
import { ActivityOverview } from "@/components/admin/activity-overview";
import { DatabaseInfoCard } from "@/components/admin/database-info-card";
import { PerformanceMetricsCard } from "@/components/admin/performance-metrics-card";
import { UptimeStatusCard } from "@/components/admin/uptime-status-card";

export default async function SystemPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system statistics and health monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Online
          </div>
        </div>
      </div>

      {/* System Statistics */}
      <Suspense fallback={<div>Loading system stats...</div>}>
        <SystemStatsCards />
      </Suspense>

      {/* System Health */}
      <Suspense fallback={<div>Loading system health...</div>}>
        <SystemHealthMonitor />
      </Suspense>

      {/* Activity Overview */}
      <Suspense fallback={<div>Loading activity data...</div>}>
        <ActivityOverview />
      </Suspense>

      {/* Database Information */}
      <Suspense fallback={<div>Loading database info...</div>}>
        <DatabaseInfoCard />
      </Suspense>

      {/* Performance Metrics & Uptime */}
      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<div>Loading performance metrics...</div>}>
          <PerformanceMetricsCard />
        </Suspense>
        <Suspense fallback={<div>Loading uptime info...</div>}>
          <UptimeStatusCard />
        </Suspense>
      </div>
    </div>
  );
}
