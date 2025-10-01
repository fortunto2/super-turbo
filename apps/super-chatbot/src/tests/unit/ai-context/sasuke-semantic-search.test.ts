/**
 * Тест для проверки семантического поиска Sasuke Uchiha
 * Проверяет, что система правильно находит изображение с Sasuke Uchiha
 * когда пользователь запрашивает "take photo with saske and add next itachi uchiha"
 */

import { SemanticIndex } from "../../../lib/ai/context/semantic-index";
import type { ChatImage } from "../../../lib/ai/chat/image-context";

describe("Sasuke Semantic Search", () => {
  let semanticIndex: SemanticIndex;

  beforeEach(() => {
    semanticIndex = new SemanticIndex();
  });

  test("should find Sasuke Uchiha image when searching for 'saske'", () => {
    // Создаем тестовые изображения
    const chatImages: ChatImage[] = [
      {
        id: "sasuke-image-1",
        url: "https://example.com/sasuke-uchiha.jpg",
        prompt: "make image with saske uchiha",
        timestamp: new Date("2024-01-20T10:00:00Z"),
        messageIndex: 1,
        role: "assistant",
        mediaType: "image",
      },
      {
        id: "last-image-2",
        url: "https://example.com/last-generated.jpg",
        prompt: "Cha...", // Последнее сгенерированное изображение
        timestamp: new Date("2024-01-20T12:00:00Z"),
        messageIndex: 2,
        role: "assistant",
        mediaType: "image",
      },
    ];

    // Добавляем изображения в семантический индекс
    chatImages.forEach((image) => {
      semanticIndex.addImage(image);
    });

    // Ищем изображение с Sasuke
    const searchQuery = "take photo with saske and add next itachi uchiha";
    const results = semanticIndex.search(searchQuery, chatImages);

    console.log("🔍 Sasuke Search Results:", {
      query: searchQuery,
      results: results.map((r) => ({
        imageId: r.image.id,
        prompt: r.image.prompt,
        relevanceScore: r.relevanceScore,
        matchedKeywords: r.matchedKeywords,
        reasoningText: r.reasoningText,
      })),
    });

    // Проверяем, что найдено хотя бы одно изображение
    expect(results.length).toBeGreaterThan(0);

    // Проверяем, что лучшее совпадение - это изображение с Sasuke
    const bestMatch = results[0];
    expect(bestMatch).toBeDefined();
    expect(bestMatch?.image.id).toBe("sasuke-image-1");
    expect(bestMatch?.image.prompt).toContain("saske");
    expect(bestMatch?.relevanceScore).toBeGreaterThan(0.3);

    // Проверяем, что в совпавших ключевых словах есть "saske"
    const hasSasukeKeyword = bestMatch?.matchedKeywords.some((keyword) =>
      keyword.toLowerCase().includes("saske")
    );
    expect(hasSasukeKeyword).toBe(true);
  });

  test("should extract keywords correctly from Sasuke-related prompts", () => {
    const testPrompts = [
      "make image with saske uchiha",
      "take photo with saske and add next itachi uchiha",
      "saske uchiha character",
      "naruto saske uchiha",
    ];

    testPrompts.forEach((prompt) => {
      const keywords = semanticIndex.extractKeywords(prompt);
      console.log(`🔍 Keywords for "${prompt}":`, keywords);

      // Проверяем, что извлекаются релевантные ключевые слова
      const hasSasukeKeyword = keywords.some(
        (keyword) =>
          keyword.toLowerCase().includes("saske") ||
          keyword.toLowerCase().includes("sasuke")
      );
      expect(hasSasukeKeyword).toBe(true);
    });
  });

  test("should handle variations of Sasuke name", () => {
    const variations = ["saske", "sasuke", "саске", "Саске"];

    variations.forEach((variation) => {
      const keywords = semanticIndex.extractKeywords(variation);
      console.log(`🔍 Keywords for variation "${variation}":`, keywords);

      // Проверяем, что вариации обрабатываются
      expect(keywords.length).toBeGreaterThan(0);
    });
  });

  test("should prioritize exact matches over partial matches", () => {
    const chatImages: ChatImage[] = [
      {
        id: "exact-sasuke",
        url: "https://example.com/exact-sasuke.jpg",
        prompt: "saske uchiha",
        timestamp: new Date("2024-01-20T10:00:00Z"),
        messageIndex: 1,
        role: "assistant",
        mediaType: "image",
      },
      {
        id: "partial-match",
        url: "https://example.com/partial.jpg",
        prompt: "some other character",
        timestamp: new Date("2024-01-20T11:00:00Z"),
        messageIndex: 2,
        role: "assistant",
        mediaType: "image",
      },
    ];

    chatImages.forEach((image) => {
      semanticIndex.addImage(image);
    });

    const results = semanticIndex.search("saske uchiha", chatImages);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toBeDefined();
    expect(results[0]?.image.id).toBe("exact-sasuke");
    expect(results[0]?.relevanceScore).toBeGreaterThan(0.8);
  });
});
