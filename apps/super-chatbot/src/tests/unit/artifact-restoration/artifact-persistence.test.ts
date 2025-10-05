import { vi, beforeEach } from "vitest";
import {
  saveArtifactToStorage,
  loadArtifactFromStorage,
  clearArtifactFromStorage,
  hasSavedArtifact,
  getAllSavedArtifacts,
} from "@/lib/utils/artifact-persistence";
import type { SavedArtifactData } from "@/lib/utils/artifact-persistence";

// Mock localStorage with stateful implementation
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
    getStore: () => store, // For debugging
  };
};

const localStorageMock = createLocalStorageMock();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("Artifact Persistence", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const mockArtifact = {
    documentId: "test-doc-123",
    content: "Test content",
    kind: "image",
    title: "Test Image",
    status: "idle" as const,
    isVisible: true,
  };

  describe("saveArtifactToStorage", () => {
    it("should save artifact state to localStorage", () => {
      const chatId = "test-chat-123";

      saveArtifactToStorage(chatId, mockArtifact);

      const saved = localStorageMock.getItem("artifact-test-chat-123");
      expect(saved).toBeTruthy();
      expect(saved).toContain("test-doc-123");
    });

    it("should handle errors gracefully", () => {
      // Create a mock that throws
      const originalSetItem = localStorageMock.setItem;
      let callCount = 0;

      // Replace setItem with a version that throws
      Object.defineProperty(localStorageMock, 'setItem', {
        value: () => {
          callCount++;
          throw new Error("Storage error");
        },
        writable: true,
        configurable: true,
      });

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Should not throw
      expect(() => {
        saveArtifactToStorage("test-chat", mockArtifact);
      }).not.toThrow();

      // Function should log warning
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();

      // Restore original setItem
      Object.defineProperty(localStorageMock, 'setItem', {
        value: originalSetItem,
        writable: true,
        configurable: true,
      });
    });
  });

  describe("loadArtifactFromStorage", () => {
    it("should load artifact state from localStorage", () => {
      const chatId = "test-chat-123";
      const savedState: SavedArtifactData = {
        documentId: "test-doc-123",
        status: "idle",
        kind: "image",
        title: "Test Image",
        content: "Test content",
        isVisible: true,
        timestamp: Date.now(),
        version: "2.0",
      };

      localStorageMock.setItem("artifact-test-chat-123", JSON.stringify(savedState));

      const result = loadArtifactFromStorage(chatId);

      expect(result).toEqual(savedState);
    });

    it("should return null if no saved state", () => {
      const result = loadArtifactFromStorage("test-chat");

      expect(result).toBeNull();
    });

    it("should return null for expired state", () => {
      const chatId = "test-chat-123";
      const expiredState: SavedArtifactData = {
        documentId: "test-doc-123",
        status: "idle",
        kind: "image",
        title: "Test Image",
        content: "Test content",
        isVisible: true,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        version: "2.0",
      };

      localStorageMock.setItem("artifact-test-chat-123", JSON.stringify(expiredState));

      const result = loadArtifactFromStorage(chatId);

      expect(result).toBeNull();
      // Check that expired data was removed
      expect(localStorageMock.getItem("artifact-test-chat-123")).toBeNull();
    });
  });

  describe("clearArtifactFromStorage", () => {
    it("should clear artifact state for specific chat", () => {
      const chatId = "test-chat-123";

      // First save something
      localStorageMock.setItem("artifact-test-chat-123", "some data");

      clearArtifactFromStorage(chatId);

      expect(localStorageMock.getItem("artifact-test-chat-123")).toBeNull();
    });
  });

  describe("hasSavedArtifact", () => {
    it("should return true if state exists", () => {
      localStorageMock.setItem("artifact-test-chat", "some-state");

      const result = hasSavedArtifact("test-chat");

      expect(result).toBe(true);
    });

    it("should return false if no state exists", () => {
      const result = hasSavedArtifact("test-chat");

      expect(result).toBe(false);
    });
  });

  describe("getAllSavedArtifacts", () => {
    it("should return all saved artifacts", () => {
      const mockArtifacts = [
        {
          chatId: "chat1",
          data: {
            documentId: "doc1",
            status: "idle" as const,
            kind: "image",
            title: "Test",
            content: "Content",
            isVisible: true,
            timestamp: Date.now(),
            version: "2.0",
          },
        },
        {
          chatId: "chat2",
          data: {
            documentId: "doc2",
            status: "idle" as const,
            kind: "video",
            title: "Test2",
            content: "Content2",
            isVisible: true,
            timestamp: Date.now(),
            version: "2.0",
          },
        },
      ];

      // Save artifacts directly to storage
      localStorageMock.setItem("artifact-chat-1", JSON.stringify(mockArtifacts[0]?.data));
      localStorageMock.setItem("artifact-chat-2", JSON.stringify(mockArtifacts[1]?.data));

      const result = getAllSavedArtifacts();

      expect(result).toHaveLength(2);
      expect(result[0]?.chatId).toBe("chat-1");
      expect(result[1]?.chatId).toBe("chat-2");
    });
  });
});
