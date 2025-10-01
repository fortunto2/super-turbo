import {
  analyzeImageContext,
  type ChatImage,
} from "../../../lib/ai/chat/image-context";

describe("Sun Semantic Search", () => {
  const mockChatImages: ChatImage[] = [
    {
      url: "https://example.com/moon-landscape.jpg",
      id: "img1",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:00:00Z"),
      prompt: "лунный пейзаж с ночным небом",
      messageIndex: 1,
      mediaType: "image",
    },
    {
      url: "https://example.com/sunset-beach.jpg",
      id: "img2",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:05:00Z"),
      prompt: "закат на пляже с солнцем",
      messageIndex: 3,
      mediaType: "image",
    },
    {
      url: "https://example.com/cat-portrait.jpg",
      id: "img3",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:10:00Z"),
      prompt: "портрет кота",
      messageIndex: 5,
      mediaType: "image",
    },
  ];

  test("should find image with sun by semantic search", async () => {
    const result = await analyzeImageContext(
      "возьми фото с солнцем которое ты сгенерировал",
      mockChatImages
    );

    expect(result.confidence).toBe("high");
    expect(result.sourceImageUrl).toBe("https://example.com/sunset-beach.jpg");
    expect(result.reasoningText).toContain("семантический поиск");
  });

  test("should find image with sun by English pattern", async () => {
    const result = await analyzeImageContext(
      "use the image with sun that you generated",
      mockChatImages
    );

    expect(result.confidence).toBe("high");
    expect(result.sourceImageUrl).toBe("https://example.com/sunset-beach.jpg");
    expect(result.reasoningText).toContain("семантический поиск");
  });

  test("should prioritize semantic search over generated pattern", async () => {
    // Добавляем еще одно изображение с солнцем, но более новое
    const extendedImages = [
      ...mockChatImages,
      {
        url: "https://example.com/recent-cat.jpg",
        id: "img4",
        role: "assistant" as const,
        timestamp: new Date("2024-01-01T10:15:00Z"),
        prompt: "кот в солнечном свете",
        messageIndex: 7,
        mediaType: "image" as const,
      },
    ];

    const result = await analyzeImageContext(
      "возьми фото с солнцем",
      extendedImages
    );

    // Должно найти изображение с солнцем, а не последнее сгенерированное
    expect(result.sourceImageUrl).toMatch(/sunset-beach|recent-cat/);
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
  });
});
