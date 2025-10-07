import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js router
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

// Mock Next.js auth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
      },
    },
    status: "authenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next-auth to prevent it from importing next/server
// This returns FACTORY FUNCTIONS that create new mocks each time they're called
// This way, when auth.ts calls NextAuth(), it gets a fresh set of mocks
// that test files can then configure with mockResolvedValue, etc.
vi.mock("next-auth", () => ({
  default: () => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

// Mock next/server for next-auth and API routes
vi.mock("next/server", () => {
  // Use the global Request class from Node.js as the base for NextRequest
  class MockNextRequest extends Request {
  }

  return {
    NextResponse: {
      json: vi.fn((data, init) => ({
        json: () => Promise.resolve(data),
        status: init?.status || 200,
        statusText: init?.statusText || 'OK',
        headers: init?.headers || {},
      })),
      redirect: vi.fn((url) => ({ redirect: url })),
    },
    NextRequest: MockNextRequest,
  };
});

// Mock environment variables
vi.mock("process", () => ({
  env: {
    NODE_ENV: "test",
    SUPERDUPERAI_URL: "https://test-api.example.com",
    SUPERDUPERAI_TOKEN: "test-token",
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock WebSocket
global.WebSocket = vi.fn(() => ({
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

// Mock EventSource
global.EventSource = vi.fn(() => ({
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;
