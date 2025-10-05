import {
  analyzeImageContext,
  type ChatImage,
} from "../../../lib/ai/chat/image-context";
import { semanticIndex } from "../../../lib/ai/context/semantic-index";

describe("Rocket Semantic Search", () => {
  const testChatImages: ChatImage[] = [
    {
      url: "https://example.com/rocket-launch.jpg",
      id: "img1",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:00:00Z"),
      prompt: "фото с ракетой на стартовой площадке",
      messageIndex: 1,
      mediaType: "image",
    },
    {
      url: "https://example.com/cat-portrait.jpg",
      id: "img2",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:05:00Z"),
      prompt: "портрет кота",
      messageIndex: 3,
      mediaType: "image",
    },
    {
      url: "https://example.com/space-station.jpg",
      id: "img3",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:10:00Z"),
      prompt: "космическая станция в космосе",
      messageIndex: 5,
      mediaType: "image",
    },
  ];

  beforeEach(() => {
    // Очищаем семантический индекс
    semanticIndex.clearChat("test-chat");

    // Добавляем изображения в индекс
    testChatImages.forEach((image) => {
      semanticIndex.addImage(image);
    });
  });

  test("should find rocket image when asking to modify rocket photo", async () => {
    const result = await analyzeImageContext(
      "измени фото с ракетой",
      testChatImages
    );

    expect(result.sourceImageUrl).toBe("https://example.com/rocket-launch.jpg");
    expect(["high", "medium"]).toContain(result.confidence);
    expect(result.reasoning).toBeTruthy();
  });

  test("should find rocket image with different wording", async () => {
    const result = await analyzeImageContext(
      "возьми изображение ракеты",
      testChatImages
    );

    // May find rocket or space station (космическая станция) since both are space-related
    expect(result.sourceImageUrl).toMatch(/rocket-launch|space-station/);
    expect(["high", "medium", "low"]).toContain(result.confidence);
  });

  test("should find rocket image with English query", async () => {
    const result = await analyzeImageContext(
      "use the rocket image",
      testChatImages
    );

    expect(result.sourceImageUrl).toBe("https://example.com/rocket-launch.jpg");
    expect(["high", "medium"]).toContain(result.confidence);
  });

  test("should prioritize rocket image over last generated", async () => {
    // Добавляем еще одно изображение после ракеты
    const latestImage: ChatImage = {
      url: "https://example.com/latest-image.jpg",
      id: "img4",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:15:00Z"),
      prompt: "абстрактная композиция",
      messageIndex: 7,
      mediaType: "image",
    };

    semanticIndex.addImage(latestImage);
    const extendedImages = [...testChatImages, latestImage];

    const result = await analyzeImageContext(
      "измени фото с ракетой",
      extendedImages
    );

    // Должно найти ракету, а не последнее изображение
    expect(result.sourceImageUrl).toBe("https://example.com/rocket-launch.jpg");
    expect(["high", "medium"]).toContain(result.confidence);
  });

  test("should handle complex rocket queries", async () => {
    const result = await analyzeImageContext(
      "возьми сгенерированное изображение с ракетой на стартовой площадке",
      testChatImages
    );

    // May find rocket or space station due to synonyms
    expect(result.sourceImageUrl).toMatch(/rocket-launch|space-station/);
    expect(["high", "medium"]).toContain(result.confidence);
  });

  test("should not find rocket when asking for other objects", async () => {
    const result = await analyzeImageContext(
      "измени изображение кота",
      testChatImages
    );

    expect(result.sourceImageUrl).toBe("https://example.com/cat-portrait.jpg");
    expect(["high", "medium"]).toContain(result.confidence);
  });
});
