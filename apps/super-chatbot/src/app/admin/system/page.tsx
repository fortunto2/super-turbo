import { Suspense } from "react";
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
  Users,
  FileText,
  Activity,
  TrendingUp,
  Clock,
  HardDrive,
  Cpu,
  Wifi,
} from "lucide-react";
import { SystemStatsCards } from "@/components/admin/system-stats-cards";
import { SystemHealthMonitor } from "@/components/admin/system-health-monitor";
import { ActivityOverview } from "@/components/admin/activity-overview";

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
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Information
          </CardTitle>
          <CardDescription>
            Database configuration and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Database Size</span>
              </div>
              <div className="text-lg font-bold">Loading...</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">PostgreSQL Version</span>
              </div>
              <div className="text-lg font-bold">Loading...</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Active Connections</span>
              </div>
              <div className="text-lg font-bold">Loading...</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              System performance and resource usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">CPU Usage</span>
                <Badge variant="secondary">Loading...</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Memory Usage</span>
                <Badge variant="secondary">Loading...</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Disk Usage</span>
                <Badge variant="secondary">Loading...</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Network I/O</span>
                <Badge variant="secondary">Loading...</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Uptime & Status
            </CardTitle>
            <CardDescription>System uptime and service status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">System Uptime</span>
                <Badge variant="secondary">Loading...</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Restart</span>
                <Badge variant="secondary">Loading...</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <Badge
                  variant="default"
                  className="bg-green-500"
                >
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Status</span>
                <Badge
                  variant="default"
                  className="bg-green-500"
                >
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
