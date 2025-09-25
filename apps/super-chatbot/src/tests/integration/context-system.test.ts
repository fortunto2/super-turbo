import {
  analyzeImageContext,
  getChatImages,
  type ChatImage,
} from "../../lib/ai/chat/image-context";
import { semanticIndex } from "../../lib/ai/context/semantic-index";

describe("Enhanced Context System Integration", () => {
  const testChatImages: ChatImage[] = [
    {
      url: "https://example.com/sunset-ocean.jpg",
      id: "img1",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:00:00Z"),
      prompt: "закат над океаном с ярким оранжевым солнцем и розовыми облаками",
      messageIndex: 1,
      mediaType: "image",
    },
    {
      url: "https://example.com/moon-night.jpg",
      id: "img2",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:05:00Z"),
      prompt: "полная луна в ночном небе со звездами",
      messageIndex: 3,
      mediaType: "image",
    },
    {
      url: "https://example.com/cat-sunny.jpg",
      id: "img3",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:10:00Z"),
      prompt: "рыжий кот на подоконнике в солнечном свете",
      messageIndex: 5,
      mediaType: "image",
    },
    {
      url: "https://example.com/latest-image.jpg",
      id: "img4",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:15:00Z"),
      prompt: "абстрактная композиция",
      messageIndex: 7,
      mediaType: "image",
    },
  ];

  beforeEach(() => {
    // Очищаем семантический индекс перед каждым тестом
    semanticIndex.clearChat("test-chat");

    // Добавляем изображения в индекс
    testChatImages.forEach((image) => {
      semanticIndex.addImage(image);
    });
  });

  test("should find image with sun using semantic search instead of last generated", async () => {
    const result = await analyzeImageContext(
      "возьми фото с солнцем которое ты сгенерировал",
      testChatImages
    );

    // Должно найти изображение с солнцем, а не последнее сгенерированное
    expect(result.sourceImageUrl).toBe("https://example.com/sunset-ocean.jpg");
    expect(result.confidence).toBe("high");
    expect(result.reasoning).toContain("семантический поиск");
  });

  test("should find image with moon using semantic search", async () => {
    const result = await analyzeImageContext(
      "используй картинку с луной",
      testChatImages
    );

    expect(result.sourceImageUrl).toBe("https://example.com/moon-night.jpg");
    expect(result.confidence).toBe("high");
    expect(result.reasoning).toContain("семантический поиск");
  });

  test("should find image with cat using semantic search", async () => {
    const result = await analyzeImageContext(
      "возьми изображение кота",
      testChatImages
    );

    expect(result.sourceImageUrl).toBe("https://example.com/cat-sunny.jpg");
    expect(result.confidence).toBe("high");
    expect(result.reasoning).toContain("семантический поиск");
  });

  test("should handle complex semantic queries", async () => {
    const result = await analyzeImageContext(
      "используй фото где есть солнце и океан",
      testChatImages
    );

    expect(result.sourceImageUrl).toBe("https://example.com/sunset-ocean.jpg");
    expect(result.confidence).toBe("high");
  });

  test("should handle English semantic queries", async () => {
    const result = await analyzeImageContext(
      "use the image with moon and stars",
      testChatImages
    );

    expect(result.sourceImageUrl).toBe("https://example.com/moon-night.jpg");
    expect(result.confidence).toBe("high");
  });

  test("should fallback to last image when no semantic match", async () => {
    const result = await analyzeImageContext(
      "используй изображение с машиной",
      testChatImages
    );

    // Должно вернуться к последнему изображению, так как нет изображений с машиной
    expect(result.sourceImageUrl).toBe("https://example.com/latest-image.jpg");
    expect(result.confidence).toBe("low");
    expect(result.reasoning).toContain("последнее изображение");
  });

  test("should handle synonyms in semantic search", async () => {
    const result = await analyzeImageContext(
      "возьми ночное небо",
      testChatImages
    );

    expect(result.sourceImageUrl).toBe("https://example.com/moon-night.jpg");
    expect(result.confidence).toBe("high");
  });

  test("should prioritize semantic search over pattern matching", async () => {
    // Запрос содержит и семантический контент ("солнце"), и паттерн ("сгенерированное")
    const result = await analyzeImageContext(
      "возьми сгенерированное изображение с солнцем",
      testChatImages
    );

    // Должно найти изображение с солнцем, а не просто последнее сгенерированное
    expect(result.sourceImageUrl).toBe("https://example.com/sunset-ocean.jpg");
    expect(result.confidence).toBe("high");
  });

  test("should provide detailed reasoning for semantic matches", async () => {
    const result = await analyzeImageContext(
      "фото с ярким солнцем",
      testChatImages
    );

    expect(result.sourceImageUrl).toBe("https://example.com/sunset-ocean.jpg");
    expect(result.reasoning).toContain("семантический поиск");
    expect(result.reasoning).toContain("солнцем");
  });

  test("should handle multiple semantic matches and rank by relevance", async () => {
    // Добавляем еще одно изображение с солнцем
    const additionalImage: ChatImage = {
      url: "https://example.com/sunny-field.jpg",
      id: "img5",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:20:00Z"),
      prompt: "солнечное поле с цветами",
      messageIndex: 9,
      mediaType: "image",
    };

    semanticIndex.addImage(additionalImage);
    const extendedImages = [...testChatImages, additionalImage];

    const result = await analyzeImageContext(
      "возьми фото с солнцем",
      extendedImages
    );

    // Должно найти одно из изображений с солнцем
    expect([
      "https://example.com/sunset-ocean.jpg",
      "https://example.com/sunny-field.jpg",
    ]).toContain(result.sourceImageUrl);
    expect(result.confidence).toBe("high");
  });
});
