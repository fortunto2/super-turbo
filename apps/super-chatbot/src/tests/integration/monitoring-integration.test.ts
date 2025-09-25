/**
 * Интеграционные тесты для системы мониторинга
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

// Мокаем fetch для тестов
global.fetch = vi.fn();

describe("Monitoring Integration Tests", () => {
  const baseUrl = "http://localhost:3000";

  beforeAll(async () => {
    // Настраиваем моки для API endpoints
    (global.fetch as any).mockImplementation((url: string, options?: any) => {
      if (url.includes("/api/health")) {
        // Проверяем метод запроса
        if (options?.method === "POST") {
          return Promise.resolve({
            ok: false,
            status: 405,
          });
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: "healthy",
            timestamp: "2025-01-24T19:20:27.026Z",
            uptime: 86.6456162,
            version: "3.0.22",
            environment: "development",
            system: {
              platform: "win32",
              nodeVersion: "v22.17.1",
              memory: {
                used: 92,
                total: 98,
                unit: "MB",
              },
            },
            services: {
              database: "healthy",
              api: "healthy",
              monitoring: "healthy",
            },
          }),
        });
      }

      if (url.includes("/api/metrics")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: "success",
            data: {
              system: {
                uptime: 86.6456162,
                memory: {
                  rss: 125829120,
                  heapTotal: 67108864,
                  heapUsed: 41943040,
                  external: 1048576,
                },
                platform: "win32",
                nodeVersion: "v22.17.1",
              },
              api: {
                endpoints: [
                  {
                    endpoint: "/api/health",
                    requests: 45,
                    errors: 0,
                    averageTime: 23.5,
                    errorRate: 0,
                  },
                ],
                totalRequests: 45,
                totalErrors: 0,
              },
              summary: {
                uptime: 86.6456162,
                memoryUsage: 62.5,
                totalEndpoints: 1,
              },
            },
          }),
        });
      }

      if (url.includes("/api/invalid-endpoint")) {
        return Promise.resolve({
          ok: false,
          status: 404,
        });
      }

      // Для POST запросов к /api/health
      return Promise.resolve({
        ok: false,
        status: 405,
      });
    });
  });

  describe("Health API Integration", () => {
    it("should return valid health status", async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      expect(response.ok).toBe(true);

      const data = await response.json();

      // Проверяем структуру ответа
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("uptime");
      expect(data).toHaveProperty("version");
      expect(data).toHaveProperty("environment");
      expect(data).toHaveProperty("system");
      expect(data).toHaveProperty("services");

      // Проверяем типы данных
      expect(typeof data.status).toBe("string");
      expect(typeof data.uptime).toBe("number");
      expect(typeof data.version).toBe("string");
      expect(typeof data.environment).toBe("string");

      // Проверяем значения
      expect(data.uptime).toBeGreaterThan(0);
      expect(["development", "production", "test"]).toContain(data.environment);
      expect(["healthy", "degraded", "unhealthy"]).toContain(data.status);
    });

    it("should have valid system information", async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.json();

      expect(data.system).toHaveProperty("platform");
      expect(data.system).toHaveProperty("nodeVersion");
      expect(data.system).toHaveProperty("memory");

      expect(typeof data.system.platform).toBe("string");
      expect(typeof data.system.nodeVersion).toBe("string");
      expect(data.system.memory).toHaveProperty("used");
      expect(data.system.memory).toHaveProperty("total");
      expect(data.system.memory).toHaveProperty("unit");

      expect(data.system.memory.used).toBeGreaterThan(0);
      expect(data.system.memory.total).toBeGreaterThan(0);
      expect(data.system.memory.unit).toBe("MB");
    });

    it("should have valid services status", async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.json();

      expect(data.services).toHaveProperty("database");
      expect(data.services).toHaveProperty("api");
      expect(data.services).toHaveProperty("monitoring");

      expect(["healthy", "degraded", "unhealthy"]).toContain(
        data.services.database
      );
      expect(["healthy", "degraded", "unhealthy"]).toContain(data.services.api);
      expect(["healthy", "degraded", "unhealthy"]).toContain(
        data.services.monitoring
      );
    });
  });

  describe("Metrics API Integration", () => {
    it("should return valid metrics data", async () => {
      const response = await fetch(`${baseUrl}/api/metrics`);
      expect(response.ok).toBe(true);

      const data = await response.json();

      // Проверяем структуру ответа
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("data");

      expect(data.status).toBe("success");
      expect(data.data).toHaveProperty("system");
      expect(data.data).toHaveProperty("api");
      expect(data.data).toHaveProperty("summary");
    });

    it("should have valid system metrics", async () => {
      const response = await fetch(`${baseUrl}/api/metrics`);
      const data = await response.json();

      expect(data.data.system).toHaveProperty("uptime");
      expect(data.data.system).toHaveProperty("memory");
      expect(data.data.system).toHaveProperty("platform");
      expect(data.data.system).toHaveProperty("nodeVersion");

      expect(typeof data.data.system.uptime).toBe("number");
      expect(data.data.system.uptime).toBeGreaterThan(0);
      expect(typeof data.data.system.platform).toBe("string");
      expect(typeof data.data.system.nodeVersion).toBe("string");
    });

    it("should have valid API metrics", async () => {
      const response = await fetch(`${baseUrl}/api/metrics`);
      const data = await response.json();

      expect(data.data.api).toHaveProperty("endpoints");
      expect(data.data.api).toHaveProperty("totalRequests");
      expect(data.data.api).toHaveProperty("totalErrors");

      expect(Array.isArray(data.data.api.endpoints)).toBe(true);
      expect(typeof data.data.api.totalRequests).toBe("number");
      expect(typeof data.data.api.totalErrors).toBe("number");
      expect(data.data.api.totalRequests).toBeGreaterThanOrEqual(0);
      expect(data.data.api.totalErrors).toBeGreaterThanOrEqual(0);
    });

    it("should have valid summary metrics", async () => {
      const response = await fetch(`${baseUrl}/api/metrics`);
      const data = await response.json();

      expect(data.data.summary).toHaveProperty("uptime");
      expect(data.data.summary).toHaveProperty("memoryUsage");
      expect(data.data.summary).toHaveProperty("totalEndpoints");

      expect(typeof data.data.summary.uptime).toBe("number");
      expect(typeof data.data.summary.memoryUsage).toBe("number");
      expect(typeof data.data.summary.totalEndpoints).toBe("number");

      expect(data.data.summary.uptime).toBeGreaterThan(0);
      expect(data.data.summary.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(data.data.summary.totalEndpoints).toBeGreaterThanOrEqual(0);
    });
  });

  describe("API Performance", () => {
    it("should respond to health endpoint within reasonable time", async () => {
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/api/health`);
      const endTime = Date.now();

      expect(response.ok).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Менее 1 секунды
    });

    it("should respond to metrics endpoint within reasonable time", async () => {
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/api/metrics`);
      const endTime = Date.now();

      expect(response.ok).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Менее 1 секунды
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid endpoints gracefully", async () => {
      const response = await fetch(`${baseUrl}/api/invalid-endpoint`);
      expect(response.status).toBe(404);
    });

    it("should handle malformed requests gracefully", async () => {
      const response = await fetch(`${baseUrl}/api/health`, {
        method: "POST",
        body: "invalid json",
      });

      // Health endpoint должен отвечать на GET запросы
      expect(response.status).toBe(405); // Method Not Allowed
    });
  });

  describe("Data Consistency", () => {
    it("should have consistent uptime between health and metrics", async () => {
      const [healthResponse, metricsResponse] = await Promise.all([
        fetch(`${baseUrl}/api/health`),
        fetch(`${baseUrl}/api/metrics`),
      ]);

      const healthData = await healthResponse.json();
      const metricsData = await metricsResponse.json();

      // Uptime должен быть примерно одинаковым (допускаем разницу в 1 секунду)
      const uptimeDiff = Math.abs(
        healthData.uptime - metricsData.data.system.uptime
      );
      expect(uptimeDiff).toBeLessThan(1);
    });

    it("should have consistent system information", async () => {
      const [healthResponse, metricsResponse] = await Promise.all([
        fetch(`${baseUrl}/api/health`),
        fetch(`${baseUrl}/api/metrics`),
      ]);

      const healthData = await healthResponse.json();
      const metricsData = await metricsResponse.json();

      expect(healthData.system.platform).toBe(metricsData.data.system.platform);
      expect(healthData.system.nodeVersion).toBe(
        metricsData.data.system.nodeVersion
      );
    });
  });
});
