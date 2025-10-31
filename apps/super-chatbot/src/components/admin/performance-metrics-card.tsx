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
import { Cpu } from 'lucide-react';

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: number;
}

export function PerformanceMetricsCard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch performance metrics');
        }

        // Извлекаем метрики из ответа
        const memoryUsage = data.data?.summary?.memoryUsage || 0;

        setMetrics({
          cpuUsage: 0, // Не доступно в упрощенной системе
          memoryUsage: memoryUsage,
          diskUsage: 0, // Не доступно в упрощенной системе
          networkIO: 0, // Не доступно в упрощенной системе
        });
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching performance metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceMetrics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPerformanceMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
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

  if (error || !metrics) {
    return (
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
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">
              Error loading performance metrics: {error}
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
          <Cpu className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
        <CardDescription>System performance and resource usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">CPU Usage</span>
            <Badge variant="secondary">
              {metrics.cpuUsage > 0 ? `${metrics.cpuUsage}%` : 'N/A'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Memory Usage</span>
            <Badge variant="secondary">
              {metrics.memoryUsage > 0 ? `${metrics.memoryUsage}%` : 'N/A'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Disk Usage</span>
            <Badge variant="secondary">
              {metrics.diskUsage > 0 ? `${metrics.diskUsage}%` : 'N/A'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Network I/O</span>
            <Badge variant="secondary">
              {metrics.networkIO > 0 ? `${metrics.networkIO} MB/s` : 'N/A'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
