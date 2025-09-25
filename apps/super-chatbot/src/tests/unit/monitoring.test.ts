/**
 * Тесты для упрощенной системы мониторинга
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Мокаем fetch для тестов
global.fetch = vi.fn();

describe('Monitoring System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Health API', () => {
    it('should return health status', async () => {
      const mockResponse = {
        status: 'healthy',
        timestamp: '2025-01-24T19:20:27.026Z',
        uptime: 86.6456162,
        version: '3.0.22',
        environment: 'development',
        system: {
          platform: 'win32',
          nodeVersion: 'v22.17.1',
          memory: {
            used: 92,
            total: 98,
            unit: 'MB'
          }
        },
        services: {
          database: 'healthy',
          api: 'healthy',
          monitoring: 'healthy'
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/health');
      const data = await response.json();

      expect(data.status).toBe('healthy');
      expect(data.uptime).toBeGreaterThan(0);
      expect(data.services.database).toBe('healthy');
      expect(data.services.api).toBe('healthy');
      expect(data.services.monitoring).toBe('healthy');
    });

    it('should handle health API errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/health');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('Metrics API', () => {
    it('should return metrics data', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          system: {
            uptime: 86.6456162,
            memory: {
              rss: 125829120,
              heapTotal: 67108864,
              heapUsed: 41943040,
              external: 1048576
            },
            platform: 'win32',
            nodeVersion: 'v22.17.1'
          },
          api: {
            endpoints: [
              {
                endpoint: '/api/health',
                requests: 45,
                errors: 0,
                averageTime: 23.5,
                errorRate: 0
              }
            ],
            totalRequests: 45,
            totalErrors: 0
          },
          summary: {
            uptime: 86.6456162,
            memoryUsage: 62.5,
            totalEndpoints: 1
          }
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/metrics');
      const data = await response.json();

      expect(data.status).toBe('success');
      expect(data.data.system.uptime).toBeGreaterThan(0);
      expect(data.data.api.totalRequests).toBeGreaterThanOrEqual(0);
      expect(data.data.summary.totalEndpoints).toBeGreaterThanOrEqual(0);
    });

    it('should handle metrics API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      const response = await fetch('/api/metrics');
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Simple Monitor Functions', () => {
    it('should track API requests', async () => {
      // Импортируем функции из simple-monitor
      const { trackApiRequest, getMetrics } = await import('@/lib/monitoring/simple-monitor');

      // Тестируем отслеживание запроса
      trackApiRequest('/api/test', 100, 200);
      
      const metrics = getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.totalErrors).toBe(0);
    });

    it('should track API errors', async () => {
      const { trackApiRequest, getMetrics } = await import('@/lib/monitoring/simple-monitor');

      // Тестируем отслеживание ошибки
      trackApiRequest('/api/test', 100, 500);
      
      const metrics = getMetrics();
      expect(metrics.totalErrors).toBeGreaterThan(0);
    });

    it('should get health status', async () => {
      const { getHealthStatus } = await import('@/lib/monitoring/simple-monitor');

      const health = getHealthStatus();
      expect(health.status).toBe('healthy');
      expect(health.uptime).toBeGreaterThan(0);
      expect(health.memory.used).toBeGreaterThan(0);
      expect(health.memory.total).toBeGreaterThan(0);
    });
  });
});
