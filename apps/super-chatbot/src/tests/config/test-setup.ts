/**
 * Конфигурация для тестов
 * Настройка моков, утилит и общих функций для всех типов тестов
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";

// Глобальные моки для всех тестов
export function setupGlobalMocks() {
  // Mock для Next.js
  vi.mock("next/navigation", () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/",
  }));

  // Mock для Next.js auth
  vi.mock("@/app/(auth)/auth", () => ({
    auth: () =>
      Promise.resolve({
        user: {
          id: "test-user-id",
          email: "test@example.com",
          name: "Test User",
        },
      }),
  }));

  // Mock для fetch
  global.fetch = vi.fn();

  // Mock для WebSocket
  global.WebSocket = vi.fn(() => ({
    readyState: 1, // OPEN
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as any;

  // Mock для EventSource
  global.EventSource = vi.fn(() => ({
    readyState: 1, // OPEN
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as any;

  // Mock для localStorage
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });

  // Mock для sessionStorage
  Object.defineProperty(window, "sessionStorage", {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });

  // Mock для console для подавления логов в тестах
  global.console = {
    ...console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
}

// Утилиты для тестирования API
export class APITestUtils {
  static mockSuccessResponse(data: any, status = 200) {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  }

  static mockErrorResponse(error: string, status = 500) {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status,
      json: () => Promise.resolve({ error }),
      text: () => Promise.resolve(JSON.stringify({ error })),
    });
  }

  static mockNetworkError() {
    (global.fetch as any).mockRejectedValue(new Error("Network error"));
  }

  static resetMocks() {
    vi.clearAllMocks();
  }
}

// Утилиты для тестирования WebSocket
export class WebSocketTestUtils {
  static createMockWebSocket() {
    const mockWS: any = {
      readyState: 1, // OPEN
      close: vi.fn(),
      send: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
    };

    // Симулируем подключение
    setTimeout(() => {
      mockWS.readyState = 1;
      if (mockWS.onopen) {
        mockWS.onopen(new Event("open"));
      }
    }, 10);

    return mockWS;
  }

  static simulateMessage(mockWS: any, data: any) {
    const event = new MessageEvent("message", {
      data: JSON.stringify(data),
    });
    if (mockWS.onmessage) {
      mockWS.onmessage(event);
    }
  }

  static simulateError(mockWS: any) {
    mockWS.readyState = 3; // CLOSED
    if (mockWS.onerror) {
      mockWS.onerror(new Event("error"));
    }
  }
}

// Утилиты для тестирования базы данных
export class DatabaseTestUtils {
  static mockQueryResult(data: any[]) {
    return {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(data),
          orderBy: vi.fn().mockResolvedValue(data),
          limit: vi.fn().mockResolvedValue(data),
          offset: vi.fn().mockResolvedValue(data),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(data),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(data),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    };
  }

  static mockTransaction(callback: (db: any) => Promise<any>) {
    return vi.fn().mockImplementation(callback);
  }
}

// Утилиты для тестирования компонентов
export class ComponentTestUtils {
  static mockProps<T>(props: Partial<T>): T {
    return props as T;
  }

  static createMockEvent(type: string, data?: any) {
    return new Event(type, { bubbles: true, cancelable: true });
  }

  static createMockMouseEvent(type: string, data?: any) {
    return new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      ...data,
    });
  }

  static createMockKeyboardEvent(type: string, data?: any) {
    return new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      ...data,
    });
  }
}

// Утилиты для тестирования производительности
export class PerformanceTestUtils {
  static measureExecutionTime(fn: () => void | Promise<void>): Promise<number> {
    return new Promise(async (resolve) => {
      const start = performance.now();
      await fn();
      const end = performance.now();
      resolve(end - start);
    });
  }

  static async waitForCondition(
    condition: () => boolean,
    timeout = 5000,
    interval = 100
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - start > timeout) {
          reject(new Error("Condition timeout"));
        } else {
          setTimeout(check, interval);
        }
      };
      check();
    });
  }
}

// Утилиты для тестирования безопасности
export class SecurityTestUtils {
  static createMaliciousInput() {
    return {
      xss: "<script>alert('xss')</script>",
      sqlInjection: "'; DROP TABLE users; --",
      pathTraversal: "../../../etc/passwd",
      commandInjection: "; rm -rf /",
    };
  }

  static createValidInput() {
    return {
      email: "test@example.com",
      name: "Test User",
      message: "Hello, world!",
    };
  }
}

// Настройка тестовой среды
export function setupTestEnvironment() {
  beforeAll(() => {
    setupGlobalMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    APITestUtils.resetMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
}
