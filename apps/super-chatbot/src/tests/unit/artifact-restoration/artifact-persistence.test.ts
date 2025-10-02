import { vi } from "vitest";
import {
  saveArtifactToStorage,
  loadArtifactFromStorage,
  clearArtifactFromStorage,
  hasSavedArtifact,
  getAllSavedArtifacts,
} from "@/lib/utils/artifact-persistence";
import type { SavedArtifactData } from "@/lib/utils/artifact-persistence";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Artifact Persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "artifact-test-chat-123",
        expect.stringContaining(chatId)
      );
    });

    it("should handle errors gracefully", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      saveArtifactToStorage("test-chat", mockArtifact);

      // Function should not throw, but may log errors
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
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

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const result = loadArtifactFromStorage(chatId);

      expect(result).toEqual(savedState);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "artifact-test-chat-123"
      );
    });

    it("should return null if no saved state", () => {
      localStorageMock.getItem.mockReturnValue(null);

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

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredState));

      const result = loadArtifactFromStorage(chatId);

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "artifact-test-chat-123"
      );
    });
  });

  describe("clearArtifactFromStorage", () => {
    it("should clear artifact state for specific chat", () => {
      const chatId = "test-chat-123";

      clearArtifactFromStorage(chatId);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "artifact-test-chat-123"
      );
    });
  });

  describe("hasSavedArtifact", () => {
    it("should return true if state exists", () => {
      localStorageMock.getItem.mockReturnValue("some-state");

      const result = hasSavedArtifact("test-chat");

      expect(result).toBe(true);
    });

    it("should return false if no state exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

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

      localStorageMock.length = 2;
      localStorageMock.key = vi
        .fn()
        .mockReturnValueOnce("artifact-chat1")
        .mockReturnValueOnce("artifact-chat2");
      localStorageMock.getItem = vi
        .fn()
        .mockReturnValueOnce(JSON.stringify(mockArtifacts[0]?.data))
        .mockReturnValueOnce(JSON.stringify(mockArtifacts[1]?.data));

      const result = getAllSavedArtifacts();

      expect(result).toHaveLength(2);
      expect(result[0]?.chatId).toBe("chat1");
      expect(result[1]?.chatId).toBe("chat2");
    });
  });
});
