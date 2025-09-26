import { vi } from "vitest";
import {
  saveArtifactState,
  loadArtifactState,
  clearArtifactState,
  hasArtifactState,
  clearAllArtifactStates,
} from "@/lib/utils/artifact-persistence";
import type { UIArtifact } from "@/components/artifacts/artifact";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Artifact Persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockArtifact: UIArtifact = {
    documentId: "test-doc-123",
    content: "Test content",
    kind: "image",
    title: "Test Image",
    status: "idle",
    isVisible: true,
    boundingBox: {
      top: 0,
      left: 0,
      width: 100,
      height: 100,
    },
  };

  describe("saveArtifactState", () => {
    it("should save artifact state to localStorage", () => {
      const chatId = "test-chat-123";

      saveArtifactState(chatId, mockArtifact);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "super-chatbot-artifact-test-chat-123",
        expect.stringContaining(chatId)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "super-chatbot-artifact-state",
        expect.stringContaining(chatId)
      );
    });

    it("should handle errors gracefully", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation();

      saveArtifactState("test-chat", mockArtifact);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to save artifact state:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("loadArtifactState", () => {
    it("should load artifact state from localStorage", () => {
      const chatId = "test-chat-123";
      const savedState = {
        artifact: mockArtifact,
        chatId,
        timestamp: Date.now(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const result = loadArtifactState(chatId);

      expect(result).toEqual(mockArtifact);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "super-chatbot-artifact-test-chat-123"
      );
    });

    it("should return null if no saved state", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadArtifactState("test-chat");

      expect(result).toBeNull();
    });

    it("should return null for expired state", () => {
      const chatId = "test-chat-123";
      const expiredState = {
        artifact: mockArtifact,
        chatId,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredState));

      const result = loadArtifactState(chatId);

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "super-chatbot-artifact-test-chat-123"
      );
    });
  });

  describe("clearArtifactState", () => {
    it("should clear artifact state for specific chat", () => {
      const chatId = "test-chat-123";

      clearArtifactState(chatId);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "super-chatbot-artifact-test-chat-123"
      );
    });
  });

  describe("hasArtifactState", () => {
    it("should return true if state exists", () => {
      localStorageMock.getItem.mockReturnValue("some-state");

      const result = hasArtifactState("test-chat");

      expect(result).toBe(true);
    });

    it("should return false if no state exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = hasArtifactState("test-chat");

      expect(result).toBe(false);
    });
  });

  describe("clearAllArtifactStates", () => {
    it("should clear all artifact states", () => {
      clearAllArtifactStates();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "super-chatbot-artifact-state"
      );
    });
  });
});
