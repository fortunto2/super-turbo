import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';

// Типы для утилит
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

// Кастомная функция рендеринга с провайдерами
export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Утилита для создания моков
export function createMock<T>(defaultImplementation: Partial<T> = {}): T {
  return {
    ...defaultImplementation,
  } as T;
}

// Утилита для создания spy функций
export function createSpy<T extends (...args: any[]) => any>(
  implementation?: T
): T & { mock: { calls: any[]; results: any[] } } {
  const spy = vi.fn(implementation) as any;
  spy.mock = {
    calls: [],
    results: [],
  };
  
  const originalFn = spy;
  spy.mockImplementation = (...args: any[]) => {
    spy.mock.calls.push(args);
    const result = originalFn(...args);
    spy.mock.results.push({ type: 'return', value: result });
    return result;
  };
  
  return spy;
}

// Утилита для создания моков компонентов
export function createMockComponent(
  displayName: string,
  defaultProps: Record<string, any> = {}
) {
  const MockComponent = (props: any) => {
    return (
      <div data-testid={`mock-${displayName.toLowerCase()}`} {...props}>
        {props.children}
      </div>
    );
  };
  
  MockComponent.displayName = displayName;
  MockComponent.defaultProps = defaultProps;
  
  return MockComponent;
}

// Утилита для создания моков хуков
export function createMockHook<T>(returnValue: T) {
  return vi.fn(() => returnValue);
}

// Утилита для создания моков API
export function createMockApi() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  };
}

// Утилита для создания моков WebSocket
export function createMockWebSocket() {
  const mockWs = {
    readyState: 1, // OPEN
    url: 'wss://test.com',
    protocol: '',
    extensions: '',
    bufferedAmount: 0,
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null,
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  
  return mockWs;
}

// Утилита для создания моков localStorage
export function createMockLocalStorage() {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: Object.keys(store).length,
  };
}

// Утилита для создания моков sessionStorage
export function createMockSessionStorage() {
  return createMockLocalStorage();
}

// Утилита для создания моков cookies
export function createMockCookies() {
  const cookies: Record<string, string> = {};
  
  return {
    get: vi.fn((name: string) => cookies[name]),
    set: vi.fn((name: string, value: string, options?: any) => {
      cookies[name] = value;
    }),
    remove: vi.fn((name: string) => {
      delete cookies[name];
    }),
    getAll: vi.fn(() => cookies),
  };
}

// Утилита для создания моков window
export function createMockWindow() {
  const originalWindow = global.window;
  
  const mockWindow = {
    ...originalWindow,
    location: {
      href: '',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    },
    history: {
      length: 1,
      scrollRestoration: 'auto',
      state: null,
      back: vi.fn(),
      forward: vi.fn(),
      go: vi.fn(),
      pushState: vi.fn(),
      replaceState: vi.fn(),
    },
    navigator: {
      userAgent: 'test-user-agent',
      language: 'en-US',
      languages: ['en-US', 'en'],
      cookieEnabled: true,
      onLine: true,
      platform: 'Win32',
      vendor: 'test-vendor',
    },
    screen: {
      availHeight: 1080,
      availWidth: 1920,
      colorDepth: 24,
      height: 1080,
      width: 1920,
      orientation: {
        angle: 0,
        type: 'landscape-primary',
      },
    },
    matchMedia: vi.fn(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    ResizeObserver: vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
    IntersectionObserver: vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
    requestAnimationFrame: vi.fn((callback) => setTimeout(callback, 0)),
    cancelAnimationFrame: vi.fn(),
    requestIdleCallback: vi.fn((callback) => setTimeout(callback, 0)),
    cancelIdleCallback: vi.fn(),
  };
  
  return mockWindow;
}

// Утилита для создания моков fetch
export function createMockFetch() {
  const mockFetch = vi.fn();
  
  // Устанавливаем глобальный fetch
  global.fetch = mockFetch;
  
  return mockFetch;
}

// Утилита для создания моков console
export function createMockConsole() {
  const originalConsole = { ...console };
  
  const mockConsole = {
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
    groupCollapsed: vi.fn(),
    time: vi.fn(),
    timeEnd: vi.fn(),
    timeLog: vi.fn(),
    count: vi.fn(),
    countReset: vi.fn(),
    clear: vi.fn(),
    dir: vi.fn(),
    dirxml: vi.fn(),
    table: vi.fn(),
    assert: vi.fn(),
    profile: vi.fn(),
    profileEnd: vi.fn(),
  };
  
  // Заменяем глобальный console
  Object.defineProperty(global, 'console', {
    value: mockConsole,
    writable: true,
  });
  
  return {
    mockConsole,
    restore: () => {
      Object.defineProperty(global, 'console', {
        value: originalConsole,
        writable: true,
      });
    },
  };
}

// Утилита для создания моков setTimeout/setInterval
export function createMockTimers() {
  const originalSetTimeout = global.setTimeout;
  const originalSetInterval = global.setInterval;
  const originalClearTimeout = global.clearTimeout;
  const originalClearInterval = global.clearInterval;
  
  const mockSetTimeout = vi.fn((callback, delay) => {
    return originalSetTimeout(callback, delay);
  });
  
  const mockSetInterval = vi.fn((callback, delay) => {
    return originalSetInterval(callback, delay);
  });
  
  const mockClearTimeout = vi.fn((id) => {
    return originalClearTimeout(id);
  });
  
  const mockClearInterval = vi.fn((id) => {
    return originalClearInterval(id);
  });
  
  // Заменяем глобальные таймеры
  global.setTimeout = mockSetTimeout;
  global.setInterval = mockSetInterval;
  global.clearTimeout = mockClearTimeout;
  global.clearInterval = mockClearInterval;
  
  return {
    mockSetTimeout,
    mockSetInterval,
    mockClearTimeout,
    mockClearInterval,
    restore: () => {
      global.setTimeout = originalSetTimeout;
      global.setInterval = originalSetInterval;
      global.clearTimeout = originalClearTimeout;
      global.clearInterval = originalClearInterval;
    },
  };
}

// Утилита для создания моков Math.random
export function createMockMathRandom(returnValue: number = 0.5) {
  const originalRandom = Math.random;
  
  Math.random = vi.fn(() => returnValue);
  
  return {
    restore: () => {
      Math.random = originalRandom;
    },
  };
}

// Утилита для создания моков Date
export function createMockDate(fixedDate: Date | string | number = new Date('2024-01-01T00:00:00Z')) {
  const originalDate = global.Date;
  const mockDate = vi.fn((...args: any[]) => {
    if (args.length === 0) {
      return new originalDate(fixedDate);
    }
    return new originalDate(...args);
  });
  
  // Копируем статические методы
  Object.setPrototypeOf(mockDate, originalDate);
  Object.assign(mockDate, originalDate);
  
  // Заменяем глобальный Date
  global.Date = mockDate as any;
  
  return {
    restore: () => {
      global.Date = originalDate;
    },
  };
}

// Утилита для создания моков crypto
export function createMockCrypto() {
  const originalCrypto = global.crypto;
  
  const mockCrypto = {
    getRandomValues: vi.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
    randomUUID: vi.fn(() => 'test-uuid-1234-5678-9012-345678901234'),
    subtle: {
      digest: vi.fn(),
      generateKey: vi.fn(),
      sign: vi.fn(),
      verify: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      deriveKey: vi.fn(),
      deriveBits: vi.fn(),
      importKey: vi.fn(),
      exportKey: vi.fn(),
      wrapKey: vi.fn(),
      unwrapKey: vi.fn(),
    },
  };
  
  // Заменяем глобальный crypto
  global.crypto = mockCrypto as any;
  
  return {
    restore: () => {
      global.crypto = originalCrypto;
    },
  };
}

// Утилита для очистки всех моков
export function clearAllMocks() {
  vi.clearAllMocks();
  vi.clearAllTimers();
  vi.resetAllMocks();
  vi.restoreAllMocks();
}

// Утилита для восстановления всех моков
export function restoreAllMocks() {
  vi.restoreAllMocks();
}

// Утилита для создания тестового окружения
export function createTestEnvironment() {
  const mocks = {
    console: createMockConsole(),
    timers: createMockTimers(),
    mathRandom: createMockMathRandom(),
    date: createMockDate(),
    crypto: createMockCrypto(),
    fetch: createMockFetch(),
    webSocket: createMockWebSocket(),
    localStorage: createMockLocalStorage(),
    sessionStorage: createMockSessionStorage(),
    cookies: createMockCookies(),
    window: createMockWindow(),
  };
  
  return {
    mocks,
    setup: async () => {
      // Настройка тестового окружения
    },
    teardown: async () => {
      // Очистка тестового окружения
      mocks.console.restore();
      mocks.timers.restore();
      mocks.mathRandom.restore();
      mocks.date.restore();
      mocks.crypto.restore();
      clearAllMocks();
    },
  };
}

// Экспортируем все утилиты
export * from './types';
export * from './test-data';
