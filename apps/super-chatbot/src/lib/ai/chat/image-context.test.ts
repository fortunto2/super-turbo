import {
  analyzeImageContext,
  getChatImages,
  type ChatImage,
} from "./image-context";

// Mock data для тестирования - теперь используем ChatImage[]
const mockChatImages: ChatImage[] = [
  {
    url: "https://example.com/cat1.jpg",
    id: "img1",
    role: "assistant",
    timestamp: new Date("2024-01-01T10:01:00Z"),
    prompt: "Кот",
    messageIndex: 1,
    mediaType: "image",
  },
  {
    url: "https://example.com/dog1.jpg",
    id: "img2",
    role: "assistant",
    timestamp: new Date("2024-01-01T10:03:00Z"),
    prompt: "Собака",
    messageIndex: 3,
    mediaType: "image",
  },
];

describe("Image Context Analysis", () => {
  test("should find image in current message", async () => {
    const currentAttachments = [
      {
        url: "https://example.com/current.jpg",
        contentType: "image/webp",
      },
    ];

    const result = await analyzeImageContext(
      "Подправь это изображение",
      mockChatImages,
      currentAttachments
    );

    expect(result.confidence).toBe("high");
    expect(result.sourceImageUrl).toBe("https://example.com/current.jpg");
    expect(result.reasoningText).toContain("текущем сообщении");
  });

  test("should find last generated image when asking to edit", async () => {
    const result = await analyzeImageContext(
      "Сделай глаза голубыми",
      mockChatImages
    );

    expect(result.confidence).toBe("medium");
    expect(result.sourceImageUrl).toBe("https://example.com/dog1.jpg");
    expect(result.reasoningText).toContain("эвристике");
  });

  test("should find specific image by reference", async () => {
    const result = await analyzeImageContext(
      "Измени первое изображение",
      mockChatImages
    );

    expect(result.confidence).toBe("medium");
    expect(result.sourceImageUrl).toBe("https://example.com/cat1.jpg");
  });

  test("should find last image when no specific reference", async () => {
    const result = await analyzeImageContext("Подправь", mockChatImages);

    expect(result.confidence).toBe("low");
    expect(result.sourceImageUrl).toBe("https://example.com/dog1.jpg");
    expect(result.reasoningText).toContain("последнее изображение");
  });

  test("should handle Russian references", async () => {
    const result = await analyzeImageContext(
      "Исправь это изображение",
      mockChatImages
    );

    expect(result.confidence).toBe("medium");
    expect(result.sourceImageUrl).toBe("https://example.com/dog1.jpg");
  });

  test("should handle English references", async () => {
    const result = await analyzeImageContext(
      "Change the last image",
      mockChatImages
    );

    expect(result.confidence).toBe("medium");
    expect(result.sourceImageUrl).toBe("https://example.com/dog1.jpg");
  });

  test("should return low confidence when no images in chat", async () => {
    const result = await analyzeImageContext("Подправь изображение", []);

    expect(result.confidence).toBe("low");
    expect(result.reasoningText).toContain("не найдено изображений");
  });
});

// Тесты для функции getChatImages
describe("Get Chat Images", () => {
  test("should extract images from chat history", async () => {
    // Mock the database query
    const mockMessages = [
      {
        id: "1",
        chatId: "chat1",
        role: "user",
        parts: [{ type: "text", text: "Сгенерируй кота" }],
        attachments: [],
        createdAt: new Date("2024-01-01T10:00:00Z"),
      },
      {
        id: "2",
        chatId: "chat1",
        role: "assistant",
        parts: [{ type: "text", text: "Вот ваш кот" }],
        attachments: [
          {
            url: "https://example.com/cat1.jpg",
            id: "img1",
            contentType: "image/webp",
            name: "Кот",
          },
        ],
        createdAt: new Date("2024-01-01T10:01:00Z"),
      },
      {
        id: "3",
        chatId: "chat1",
        role: "user",
        parts: [{ type: "text", text: "Теперь сгенерируй собаку" }],
        attachments: [],
        createdAt: new Date("2024-01-01T10:02:00Z"),
      },
      {
        id: "4",
        chatId: "chat1",
        role: "assistant",
        parts: [{ type: "text", text: "Вот ваша собака" }],
        attachments: [
          {
            url: "https://example.com/dog1.jpg",
            id: "img2",
            contentType: "image/webp",
            name: "Собака",
          },
        ],
        createdAt: new Date("2024-01-01T10:03:00Z"),
      },
    ];

    // Mock the database query
    jest.mock("@/lib/db/queries", () => ({
      getMessagesByChatId: jest.fn().mockResolvedValue(mockMessages),
    }));

    const images = await getChatImages("chat1");

    expect(images).toHaveLength(2);
    expect(images[0]?.url).toBe("https://example.com/cat1.jpg");
    expect(images[0]?.role).toBe("assistant");
    expect(images[1]?.url).toBe("https://example.com/dog1.jpg");
    expect(images[1]?.role).toBe("assistant");
  });
});
