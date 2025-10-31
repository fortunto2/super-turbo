'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@turbo-super/ui';
import { Badge } from '@turbo-super/ui';
import { Clock } from 'lucide-react';

interface UptimeStatus {
  systemUptime: number;
  lastRestart: string;
  apiStatus: string;
  databaseStatus: string;
}

export function UptimeStatusCard() {
  const [status, setStatus] = useState<UptimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUptimeStatus = async () => {
      try {
        const [healthResponse, statsResponse] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/admin/system/stats'),
        ]);

        if (!healthResponse.ok || !statsResponse.ok) {
          throw new Error('Failed to fetch uptime status');
        }

        const healthData = await healthResponse.json();
        const statsData = await statsResponse.json();

        // Вычисляем время последнего перезапуска
        const uptime = healthData.uptime || 0;
        const lastRestart = new Date(
          Date.now() - uptime * 1000,
        ).toLocaleString();

        setStatus({
          systemUptime: uptime,
          lastRestart: lastRestart,
          apiStatus: healthData.status || 'unknown',
          databaseStatus: healthData.services?.database || 'unknown',
        });
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching uptime status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUptimeStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUptimeStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-500">
            Online
          </Badge>
        );
      case 'warning':
      case 'degraded':
        return (
          <Badge variant="default" className="bg-yellow-500">
            Warning
          </Badge>
        );
      case 'error':
      case 'offline':
      case 'disconnected':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
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
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">Loading...</span>
                <Badge variant="secondary">Loading...</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Uptime & Status
          </CardTitle>
          <CardDescription>System uptime and service status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">
              Error loading uptime status: {error}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
            <Badge variant="secondary">
              {formatUptime(status.systemUptime)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Last Restart</span>
            <Badge variant="secondary">{status.lastRestart}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">API Status</span>
            {getStatusBadge(status.apiStatus)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Database Status</span>
            {getStatusBadge(status.databaseStatus)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
