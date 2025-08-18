import React from "react";
import "@testing-library/jest-dom";
import { vi, beforeAll, afterAll } from "vitest";

// Мокаем Next.js router
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
  notFound: vi.fn(),
}));

// Мокаем Next.js Image component
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => {
    return React.createElement("img", { src, alt, ...props });
  },
}));

// Мокаем window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Мокаем ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Мокаем IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Мокаем Framer Motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
    section: ({ children, ...props }: { children?: React.ReactNode }) => (
      <section {...props}>{children}</section>
    ),
    button: ({ children, ...props }: { children?: React.ReactNode }) => (
      <button {...props}>{children}</button>
    ),
    span: ({ children, ...props }: { children?: React.ReactNode }) => (
      <span {...props}>{children}</span>
    ),
    p: ({ children, ...props }: { children?: React.ReactNode }) => (
      <p {...props}>{children}</p>
    ),
    h1: ({ children, ...props }: { children?: React.ReactNode }) => (
      <h1 {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: { children?: React.ReactNode }) => (
      <h2 {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: { children?: React.ReactNode }) => (
      <h3 {...props}>{children}</h3>
    ),
    ul: ({ children, ...props }: { children?: React.ReactNode }) => (
      <ul {...props}>{children}</ul>
    ),
    li: ({ children, ...props }: { children?: React.ReactNode }) => (
      <li {...props}>{children}</li>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
  useAnimationControls: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
  useMotionValue: (initial: unknown) => ({
    get: () => initial,
    set: vi.fn(),
    on: vi.fn(),
  }),
  useTransform: (value: unknown, transform: (v: unknown) => unknown) => ({
    get: () => transform(value),
    on: vi.fn(),
  }),
}));

// Мокаем environment variables
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_SUPERDUPERAI_URL = "https://dev-editor.superduperai.co";

// Мокаем console methods в тестах
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render is no longer supported") ||
        args[0].includes("Warning: componentWillReceiveProps has been renamed"))
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Мокаем WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
})) as unknown as typeof WebSocket;
