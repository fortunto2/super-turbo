import {
  SemanticIndex,
  type ChatImage,
} from "../../../lib/ai/context/semantic-index";

describe("SemanticIndex", () => {
  let semanticIndex: SemanticIndex;

  const testImages: ChatImage[] = [
    {
      url: "https://example.com/sunset-beach.jpg",
      id: "img1",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:00:00Z"),
      prompt: "закат на пляже с ярким солнцем и оранжевым небом",
      messageIndex: 1,
      mediaType: "image",
    },
    {
      url: "https://example.com/moon-landscape.jpg",
      id: "img2",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:05:00Z"),
      prompt: "лунный пейзаж с ночным небом и звездами",
      messageIndex: 3,
      mediaType: "image",
    },
    {
      url: "https://example.com/cat-portrait.jpg",
      id: "img3",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:10:00Z"),
      prompt: "портрет рыжего кота с зелеными глазами",
      messageIndex: 5,
      mediaType: "image",
    },
    {
      url: "https://example.com/forest-path.jpg",
      id: "img4",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:15:00Z"),
      prompt: "тропинка в густом лесу с высокими деревьями",
      messageIndex: 7,
      mediaType: "image",
    },
  ];

  beforeEach(() => {
    semanticIndex = new SemanticIndex();
    // Добавляем все тестовые изображения в индекс
    testImages.forEach((image) => {
      semanticIndex.addImage(image);
    });
  });

  test("should find image with sun by semantic search", () => {
    const results = semanticIndex.search("фото с солнцем", testImages);

    expect(results).toHaveLength(1);
    expect(results[0].image.url).toBe("https://example.com/sunset-beach.jpg");
    expect(results[0].relevanceScore).toBeGreaterThan(0.3);
    expect(results[0].matchedKeywords).toContain("солнцем");
  });

  test("should find image with moon by semantic search", () => {
    const results = semanticIndex.search("картинка с луной", testImages);

    expect(results).toHaveLength(1);
    expect(results[0].image.url).toBe("https://example.com/moon-landscape.jpg");
    expect(results[0].relevanceScore).toBeGreaterThan(0.3);
    expect(results[0].matchedKeywords).toContain("лунным");
  });

  test("should find image with cat by semantic search", () => {
    const results = semanticIndex.search("изображение кота", testImages);

    expect(results).toHaveLength(1);
    expect(results[0].image.url).toBe("https://example.com/cat-portrait.jpg");
    expect(results[0].relevanceScore).toBeGreaterThan(0.3);
    expect(results[0].matchedKeywords).toContain("кота");
  });

  test("should find image with forest by semantic search", () => {
    const results = semanticIndex.search("лес с деревьями", testImages);

    expect(results).toHaveLength(1);
    expect(results[0].image.url).toBe("https://example.com/forest-path.jpg");
    expect(results[0].relevanceScore).toBeGreaterThan(0.3);
    expect(results[0].matchedKeywords).toContain("лесу");
  });

  test("should handle English queries", () => {
    const results = semanticIndex.search("sunset with sun", testImages);

    expect(results).toHaveLength(1);
    expect(results[0].image.url).toBe("https://example.com/sunset-beach.jpg");
    expect(results[0].relevanceScore).toBeGreaterThan(0.3);
  });

  test("should handle synonyms", () => {
    const results = semanticIndex.search("ночное небо", testImages);

    expect(results).toHaveLength(1);
    expect(results[0].image.url).toBe("https://example.com/moon-landscape.jpg");
    expect(results[0].relevanceScore).toBeGreaterThan(0.3);
  });

  test("should return empty results for irrelevant queries", () => {
    const results = semanticIndex.search("машина самолет", testImages);

    expect(results).toHaveLength(0);
  });

  test("should rank results by relevance", () => {
    // Добавляем изображение с частичным совпадением
    const partialMatchImage: ChatImage = {
      url: "https://example.com/sunny-day.jpg",
      id: "img5",
      role: "assistant",
      timestamp: new Date("2024-01-01T10:20:00Z"),
      prompt: "солнечный день на улице",
      messageIndex: 9,
      mediaType: "image",
    };

    semanticIndex.addImage(partialMatchImage);

    const results = semanticIndex.search("солнце", [
      partialMatchImage,
      testImages[0],
    ]);

    expect(results).toHaveLength(2);
    // Более релевантное изображение должно быть первым
    expect(results[0].relevanceScore).toBeGreaterThanOrEqual(
      results[1].relevanceScore
    );
  });

  test("should provide index statistics", () => {
    const stats = semanticIndex.getStats();

    expect(stats.totalImages).toBe(4);
    expect(stats.totalKeywords).toBeGreaterThan(0);
    expect(stats.averageKeywordsPerImage).toBeGreaterThan(0);
  });

  test("should extract keywords correctly", () => {
    const testPrompt = "красивый закат на пляже с ярким солнцем";
    const keywords = (semanticIndex as any).extractKeywords(testPrompt);

    expect(keywords).toContain("красивый");
    expect(keywords).toContain("закат");
    expect(keywords).toContain("пляже");
    expect(keywords).toContain("ярким");
    expect(keywords).toContain("солнцем");
    expect(keywords).not.toContain("на"); // стоп-слово
  });
});
