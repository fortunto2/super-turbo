/**
 * Тесты для компонентов админ панели
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// Мокаем fetch для тестов
global.fetch = vi.fn();

// Мокаем компоненты UI
vi.mock("@turbo-super/ui", () => ({
  Card: ({ children, ...props }: any) => (
    <div
      data-testid="card"
      {...props}
    >
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div
      data-testid="card-content"
      {...props}
    >
      {children}
    </div>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <div
      data-testid="card-description"
      {...props}
    >
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div
      data-testid="card-header"
      {...props}
    >
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <div
      data-testid="card-title"
      {...props}
    >
      {children}
    </div>
  ),
  Badge: ({ children, ...props }: any) => (
    <span
      data-testid="badge"
      {...props}
    >
      {children}
    </span>
  ),
}));

// Мокаем иконки
vi.mock("lucide-react", () => ({
  Database: () => <div data-testid="database-icon">Database</div>,
  HardDrive: () => <div data-testid="harddrive-icon">HardDrive</div>,
  Server: () => <div data-testid="server-icon">Server</div>,
  Wifi: () => <div data-testid="wifi-icon">Wifi</div>,
  Cpu: () => <div data-testid="cpu-icon">Cpu</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Award: () => <div data-testid="award-icon">Award</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  FileText: () => <div data-testid="filetext-icon">FileText</div>,
  FolderOpen: () => <div data-testid="folderopen-icon">FolderOpen</div>,
  BarChart3: () => <div data-testid="barchart3-icon">BarChart3</div>,
  TrendingUp: () => <div data-testid="trendingup-icon">TrendingUp</div>,
  Activity: () => <div data-testid="activity-icon">Activity</div>,
}));

describe("Admin Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Мокаем fetch для всех тестов
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("DatabaseInfoCard", () => {
    it("should render loading state", async () => {
      // Мокаем медленный ответ
      (global.fetch as any).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ stats: { system: {} } }),
                }),
              100
            )
          )
      );

      const { DatabaseInfoCard } = await import(
        "@/components/admin/database-info-card"
      );

      render(<DatabaseInfoCard />);

      expect(screen.getAllByText("Loading...")).toHaveLength(6); // 3 labels + 3 values
    });

    it("should render database information", async () => {
      const mockData = {
        stats: {
          system: {
            databaseSize: "16 MB",
            databaseName: "neondb",
            postgresVersion:
              "PostgreSQL 17.5 (84bec44) on aarch64-unknown-linux-gnu, compiled by gcc (Debian 12.2.0-14+deb12u1) 12.2.0, 64-bit",
            uptime: 2925.088545,
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { DatabaseInfoCard } = await import(
        "@/components/admin/database-info-card"
      );

      render(<DatabaseInfoCard />);

      await waitFor(() => {
        expect(screen.getByText("16 MB")).toBeInTheDocument();
        expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
      });
    });

    it("should handle errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const { DatabaseInfoCard } = await import(
        "@/components/admin/database-info-card"
      );

      render(<DatabaseInfoCard />);

      await waitFor(() => {
        expect(
          screen.getByText(/Error loading database info/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("PerformanceMetricsCard", () => {
    it("should render performance metrics", async () => {
      const mockData = {
        data: {
          summary: {
            memoryUsage: 92.73,
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { PerformanceMetricsCard } = await import(
        "@/components/admin/performance-metrics-card"
      );

      render(<PerformanceMetricsCard />);

      await waitFor(() => {
        expect(screen.getByText("92.73%")).toBeInTheDocument();
      });
    });

    it("should handle missing metrics", async () => {
      const mockData = {
        data: {
          summary: {},
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { PerformanceMetricsCard } = await import(
        "@/components/admin/performance-metrics-card"
      );

      render(<PerformanceMetricsCard />);

      await waitFor(() => {
        expect(screen.getAllByText("N/A")).toHaveLength(4); // CPU, Memory, Disk, Network
      });
    });
  });

  describe("UptimeStatusCard", () => {
    it("should render uptime and status", async () => {
      const healthData = {
        status: "healthy",
        uptime: 2925.088545,
        services: {
          database: "healthy",
          api: "healthy",
        },
      };

      const statsData = {
        stats: {
          system: {
            uptime: 2925.088545,
          },
        },
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => healthData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => statsData,
        });

      const { UptimeStatusCard } = await import(
        "@/components/admin/uptime-status-card"
      );

      render(<UptimeStatusCard />);

      await waitFor(() => {
        expect(screen.getByText(/0d 0h 48m/)).toBeInTheDocument(); // Форматированный uptime
        expect(screen.getAllByText("Online")).toHaveLength(2); // API Status + Database Status
      });
    });

    it("should format uptime correctly", async () => {
      const healthData = {
        status: "healthy",
        uptime: 3661, // 1 час 1 минута 1 секунда
        services: {
          database: "healthy",
          api: "healthy",
        },
      };

      const statsData = {
        stats: {
          system: {
            uptime: 3661,
          },
        },
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => healthData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => statsData,
        });

      const { UptimeStatusCard } = await import(
        "@/components/admin/uptime-status-card"
      );

      render(<UptimeStatusCard />);

      await waitFor(() => {
        expect(screen.getByText(/0d 1h 1m/)).toBeInTheDocument();
      });
    });
  });

  describe("ActivityOverview", () => {
    it("should render activity data", async () => {
      const mockData = {
        stats: {
          activity: {
            recentUsers: 5,
            recentDocuments: 12,
            recentProjects: 2,
            topCreators: [],
            topProjectCreators: [],
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { ActivityOverview } = await import(
        "@/components/admin/activity-overview"
      );

      render(<ActivityOverview />);

      await waitFor(() => {
        expect(screen.getByText("5")).toBeInTheDocument(); // Recent Users
        expect(screen.getByText("12")).toBeInTheDocument(); // Recent Documents
        expect(screen.getByText("2")).toBeInTheDocument(); // Recent Projects
      });
    });
  });
});
