/**
 * Тесты для проверки восстановления артефактов после перезагрузки
 */

import {
  saveArtifactToStorage,
  loadArtifactFromStorage,
  clearArtifactFromStorage,
  getAllSavedArtifacts,
  restoreArtifactFromData,
  type SavedArtifactData,
} from "@/lib/utils/artifact-persistence";

// Мокаем localStorage
const localStorageMock = (() => {
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
    length: Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Artifact Persistence", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("saveArtifactToStorage", () => {
    it("should save artifact data to localStorage", () => {
      const chatId = "test-chat-123";
      const artifact = {
        documentId: "doc-456",
        status: "completed" as const,
        kind: "image",
        title: "Test Image",
        content: '{"imageUrl": "https://example.com/image.jpg"}',
        isVisible: true,
        boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        timestamp: Date.now(),
      };

      saveArtifactToStorage(chatId, artifact);

      const saved = localStorageMock.getItem(`artifact-${chatId}`);
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed.documentId).toBe("doc-456");
      expect(parsed.status).toBe("completed");
      expect(parsed.kind).toBe("image");
      expect(parsed.title).toBe("Test Image");
      expect(parsed.isVisible).toBe(true);
      expect(parsed.version).toBe("2.0");
    });

    it("should not save artifact with init documentId", () => {
      const chatId = "test-chat-123";
      const artifact = {
        documentId: "init",
        status: "idle" as const,
        kind: "text",
        title: "",
        content: "",
        isVisible: false,
        boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        timestamp: Date.now(),
      };

      saveArtifactToStorage(chatId, artifact);

      const saved = localStorageMock.getItem(`artifact-${chatId}`);
      expect(saved).toBeNull();
    });
  });

  describe("loadArtifactFromStorage", () => {
    it("should load valid artifact data", () => {
      const chatId = "test-chat-123";
      const artifactData: SavedArtifactData = {
        documentId: "doc-456",
        status: "completed",
        kind: "image",
        title: "Test Image",
        content: '{"imageUrl": "https://example.com/image.jpg"}',
        isVisible: true,
        timestamp: Date.now(),
        version: "2.0",
      };

      localStorageMock.setItem(
        `artifact-${chatId}`,
        JSON.stringify(artifactData)
      );

      const loaded = loadArtifactFromStorage(chatId);
      expect(loaded).toEqual(artifactData);
    });

    it("should return null for non-existent artifact", () => {
      const loaded = loadArtifactFromStorage("non-existent-chat");
      expect(loaded).toBeNull();
    });

    it("should return null for expired artifact", () => {
      const chatId = "test-chat-123";
      const expiredData: SavedArtifactData = {
        documentId: "doc-456",
        status: "completed",
        kind: "image",
        title: "Test Image",
        content: '{"imageUrl": "https://example.com/image.jpg"}',
        isVisible: true,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        version: "2.0",
      };

      localStorageMock.setItem(
        `artifact-${chatId}`,
        JSON.stringify(expiredData)
      );

      const loaded = loadArtifactFromStorage(chatId);
      expect(loaded).toBeNull();

      // Should also clear the expired data
      const saved = localStorageMock.getItem(`artifact-${chatId}`);
      expect(saved).toBeNull();
    });

    it("should return null for invalid JSON", () => {
      const chatId = "test-chat-123";
      localStorageMock.setItem(`artifact-${chatId}`, "invalid-json");

      const loaded = loadArtifactFromStorage(chatId);
      expect(loaded).toBeNull();

      // Should also clear the invalid data
      const saved = localStorageMock.getItem(`artifact-${chatId}`);
      expect(saved).toBeNull();
    });
  });

  describe("restoreArtifactFromData", () => {
    it("should restore artifact from saved data", () => {
      const savedData: SavedArtifactData = {
        documentId: "doc-456",
        status: "completed",
        kind: "image",
        title: "Test Image",
        content: '{"imageUrl": "https://example.com/image.jpg"}',
        isVisible: true,
        timestamp: Date.now(),
        version: "2.0",
      };

      const restored = restoreArtifactFromData(savedData);

      expect(restored.documentId).toBe("doc-456");
      expect(restored.kind).toBe("image");
      expect(restored.status).toBe("completed");
      expect(restored.isVisible).toBe(true);
      expect(restored.title).toBe("Test Image");
      expect(restored.content).toBe(
        '{"imageUrl": "https://example.com/image.jpg"}'
      );
      expect(restored.timestamp).toBe(savedData.timestamp);
      expect(restored.boundingBox).toEqual({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      });
    });
  });

  describe("getAllSavedArtifacts", () => {
    it("should return all saved artifacts", () => {
      const artifacts = [
        {
          chatId: "chat-1",
          data: {
            documentId: "doc-1",
            status: "completed" as const,
            kind: "image",
            title: "Image 1",
            content: '{"imageUrl": "https://example.com/image1.jpg"}',
            isVisible: true,
            timestamp: Date.now(),
            version: "2.0",
          },
        },
        {
          chatId: "chat-2",
          data: {
            documentId: "doc-2",
            status: "streaming" as const,
            kind: "video",
            title: "Video 1",
            content: '{"videoUrl": "https://example.com/video1.mp4"}',
            isVisible: false,
            timestamp: Date.now(),
            version: "2.0",
          },
        },
      ];

      artifacts.forEach(({ chatId, data }) => {
        localStorageMock.setItem(`artifact-${chatId}`, JSON.stringify(data));
      });

      const allArtifacts = getAllSavedArtifacts();
      expect(allArtifacts).toHaveLength(2);
      expect(allArtifacts[0].chatId).toBe("chat-1");
      expect(allArtifacts[1].chatId).toBe("chat-2");
    });

    it("should filter out expired artifacts", () => {
      const validData = {
        documentId: "doc-1",
        status: "completed" as const,
        kind: "image",
        title: "Valid Image",
        content: '{"imageUrl": "https://example.com/image.jpg"}',
        isVisible: true,
        timestamp: Date.now(),
        version: "2.0",
      };

      const expiredData = {
        documentId: "doc-2",
        status: "completed" as const,
        kind: "image",
        title: "Expired Image",
        content: '{"imageUrl": "https://example.com/expired.jpg"}',
        isVisible: true,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
        version: "2.0",
      };

      localStorageMock.setItem("artifact-chat-1", JSON.stringify(validData));
      localStorageMock.setItem("artifact-chat-2", JSON.stringify(expiredData));

      const allArtifacts = getAllSavedArtifacts();
      expect(allArtifacts).toHaveLength(1);
      expect(allArtifacts[0].chatId).toBe("chat-1");
    });
  });

  describe("clearArtifactFromStorage", () => {
    it("should remove artifact from localStorage", () => {
      const chatId = "test-chat-123";
      const artifactData: SavedArtifactData = {
        documentId: "doc-456",
        status: "completed",
        kind: "image",
        title: "Test Image",
        content: '{"imageUrl": "https://example.com/image.jpg"}',
        isVisible: true,
        timestamp: Date.now(),
        version: "2.0",
      };

      localStorageMock.setItem(
        `artifact-${chatId}`,
        JSON.stringify(artifactData)
      );
      expect(localStorageMock.getItem(`artifact-${chatId}`)).toBeTruthy();

      clearArtifactFromStorage(chatId);
      expect(localStorageMock.getItem(`artifact-${chatId}`)).toBeNull();
    });
  });

  describe("Integration test: Complete workflow", () => {
    it("should save, load, and restore artifact correctly", () => {
      const chatId = "integration-test-chat";
      const originalArtifact = {
        documentId: "doc-integration",
        status: "completed" as const,
        kind: "image",
        title: "Integration Test Image",
        content:
          '{"imageUrl": "https://example.com/integration.jpg", "status": "completed"}',
        isVisible: true,
        boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        timestamp: Date.now(),
      };

      // 1. Save artifact
      saveArtifactToStorage(chatId, originalArtifact);
      expect(localStorageMock.getItem(`artifact-${chatId}`)).toBeTruthy();

      // 2. Load artifact
      const loadedData = loadArtifactFromStorage(chatId);
      expect(loadedData).toBeTruthy();
      expect(loadedData!.documentId).toBe("doc-integration");
      expect(loadedData!.status).toBe("completed");

      // 3. Restore artifact
      const restoredArtifact = restoreArtifactFromData(loadedData!);
      expect(restoredArtifact.documentId).toBe(originalArtifact.documentId);
      expect(restoredArtifact.kind).toBe(originalArtifact.kind);
      expect(restoredArtifact.status).toBe(originalArtifact.status);
      expect(restoredArtifact.title).toBe(originalArtifact.title);
      expect(restoredArtifact.content).toBe(originalArtifact.content);
      expect(restoredArtifact.isVisible).toBe(originalArtifact.isVisible);

      // 4. Clear artifact
      clearArtifactFromStorage(chatId);
      expect(localStorageMock.getItem(`artifact-${chatId}`)).toBeNull();
    });
  });
});
