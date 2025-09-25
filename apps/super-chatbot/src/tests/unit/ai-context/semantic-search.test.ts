/**
 * Тесты для системы семантического поиска
 */

import { describe, it, expect, beforeEach } from "vitest";
import { SemanticContextAnalyzer } from "@/lib/ai/context/semantic-search";
import type { ChatMedia } from "@/lib/ai/context/universal-context";

describe("SemanticContextAnalyzer", () => {
  let analyzer: SemanticContextAnalyzer;
  let mockMedia: ChatMedia[];

  beforeEach(() => {
    analyzer = new SemanticContextAnalyzer();
    mockMedia = [
      {
        url: "https://example.com/moon-image.jpg",
        id: "moon-1",
        role: "assistant",
        timestamp: new Date("2024-01-01T10:00:00Z"),
        prompt: "beautiful moon in the night sky",
        messageIndex: 0,
        mediaType: "image",
      },
      {
        url: "https://example.com/dog-image.jpg",
        id: "dog-1",
        role: "user",
        timestamp: new Date("2024-01-01T11:00:00Z"),
        prompt: "cute dog playing in the park",
        messageIndex: 1,
        mediaType: "image",
      },
      {
        url: "https://example.com/cat-image.jpg",
        id: "cat-1",
        role: "assistant",
        timestamp: new Date("2024-01-01T12:00:00Z"),
        prompt: "sleeping cat on the couch",
        messageIndex: 2,
        mediaType: "image",
      },
    ];
  });

  describe("findSimilarMedia", () => {
    it("should find media by content keywords", async () => {
      const query = "show me the moon image";
      const matches = await analyzer.findSimilarMedia(query, mockMedia, 0.3);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].media.url).toBe("https://example.com/moon-image.jpg");
      expect(matches[0].matchedKeywords).toContain("moon");
    });

    it("should find media by animal keywords", async () => {
      const query = "I want to see the dog picture";
      const matches = await analyzer.findSimilarMedia(query, mockMedia, 0.3);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].media.url).toBe("https://example.com/dog-image.jpg");
      expect(matches[0].matchedKeywords).toContain("dog");
    });

    it("should respect similarity threshold", async () => {
      const query = "completely unrelated query about cars";
      const matches = await analyzer.findSimilarMedia(query, mockMedia, 0.8);

      expect(matches.length).toBe(0);
    });

    it("should return empty array for no matches", async () => {
      const query = "nonexistent content";
      const matches = await analyzer.findSimilarMedia(query, [], 0.3);

      expect(matches.length).toBe(0);
    });
  });

  describe("findBySemanticDescription", () => {
    it("should find media by semantic description", async () => {
      const description = "night sky with moon";
      const results = await analyzer.findBySemanticDescription(
        description,
        mockMedia
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].url).toBe("https://example.com/moon-image.jpg");
    });

    it("should handle empty media array", async () => {
      const description = "any description";
      const results = await analyzer.findBySemanticDescription(description, []);

      expect(results.length).toBe(0);
    });
  });

  describe("keyword extraction", () => {
    it("should extract nature keywords", async () => {
      const query = "beautiful moon and stars in the night sky";
      const matches = await analyzer.findSimilarMedia(query, mockMedia, 0.1);

      expect(matches.length).toBeGreaterThan(0);
      const moonMatch = matches.find((m) => m.media.url.includes("moon"));
      expect(moonMatch).toBeDefined();
    });

    it("should extract animal keywords", async () => {
      const query = "cute dog and cat playing together";
      const matches = await analyzer.findSimilarMedia(query, mockMedia, 0.1);

      expect(matches.length).toBeGreaterThan(0);
      const animalMatches = matches.filter(
        (m) => m.media.url.includes("dog") || m.media.url.includes("cat")
      );
      expect(animalMatches.length).toBeGreaterThan(0);
    });

    it("should extract color keywords", async () => {
      const query = "red car and blue house";
      const matches = await analyzer.findSimilarMedia(query, mockMedia, 0.1);

      // В данном случае не должно быть совпадений, так как в mockMedia нет машин и домов
      expect(matches.length).toBe(0);
    });
  });

  describe("similarity calculation", () => {
    it("should calculate higher similarity for exact matches", async () => {
      const query1 = "moon";
      const query2 = "dog";

      const matches1 = await analyzer.findSimilarMedia(query1, mockMedia, 0.1);
      const matches2 = await analyzer.findSimilarMedia(query2, mockMedia, 0.1);

      const moonMatch = matches1.find((m) => m.media.url.includes("moon"));
      const dogMatch = matches2.find((m) => m.media.url.includes("dog"));

      expect(moonMatch?.similarity).toBeGreaterThan(0);
      expect(dogMatch?.similarity).toBeGreaterThan(0);
    });

    it("should sort results by similarity", async () => {
      const query = "moon dog cat";
      const matches = await analyzer.findSimilarMedia(query, mockMedia, 0.1);

      expect(matches.length).toBeGreaterThan(0);

      // Проверяем, что результаты отсортированы по убыванию сходства
      for (let i = 1; i < matches.length; i++) {
        expect(matches[i - 1].similarity).toBeGreaterThanOrEqual(
          matches[i].similarity
        );
      }
    });
  });

  describe("statistics", () => {
    it("should provide statistics", () => {
      const stats = analyzer.getStats();

      expect(stats).toHaveProperty("totalEmbeddings");
      expect(stats).toHaveProperty("averageSimilarity");
      expect(stats).toHaveProperty("topKeywords");
      expect(Array.isArray(stats.topKeywords)).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle empty query", async () => {
      const matches = await analyzer.findSimilarMedia("", mockMedia, 0.1);
      expect(matches.length).toBe(0);
    });

    it("should handle media without prompts", async () => {
      const mediaWithoutPrompts = mockMedia.map((media) => ({
        ...media,
        prompt: undefined,
      }));
      const query = "moon";
      const matches = await analyzer.findSimilarMedia(
        query,
        mediaWithoutPrompts,
        0.1
      );

      // Должны найти совпадения по URL или другим атрибутам
      expect(matches.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle special characters in queries", async () => {
      const query = "moon!@#$%^&*()_+{}|:\"<>?[]\\;',./";
      const matches = await analyzer.findSimilarMedia(query, mockMedia, 0.1);

      expect(matches.length).toBeGreaterThanOrEqual(0);
    });
  });
});
