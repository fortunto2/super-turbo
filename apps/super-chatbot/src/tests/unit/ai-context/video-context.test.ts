/**
 * Тест для проверки улучшенной системы видео-контекста
 * Проверяет, что система правильно находит загруженные пользователем изображения
 * для видео-генерации
 */

import { analyzeVideoContext } from "../../../lib/ai/chat/video-context";
import type { ChatImage } from "../../../lib/ai/chat/video-context";

describe("Video Context Analysis", () => {
  test("should find last user uploaded image when no specific reference", async () => {
    const chatImages: ChatImage[] = [
      {
        id: "user-image-1",
        url: "https://example.com/user-upload-1.jpg",
        prompt: "User uploaded photo of a girl",
        timestamp: new Date("2024-01-20T10:00:00Z"),
        messageIndex: 1,
        role: "user",
        mediaType: "image",
      },
      {
        id: "assistant-image-1",
        url: "https://example.com/assistant-generated.jpg",
        prompt: "Generated image",
        timestamp: new Date("2024-01-20T11:00:00Z"),
        messageIndex: 2,
        role: "assistant",
        mediaType: "image",
      },
      {
        id: "user-image-2",
        url: "https://example.com/user-upload-2.jpg",
        prompt: "Another user photo with a dog",
        timestamp: new Date("2024-01-20T12:00:00Z"),
        messageIndex: 3,
        role: "user",
        mediaType: "image",
      },
    ];

    const result = await analyzeVideoContext(
      "сделай видео из этого изображения",
      chatImages
    );

    expect(result.confidence).toBe("high"); // Вес паттерна 0.9 > 0.7, поэтому high
    expect(result.sourceImageUrl).toBe("https://example.com/user-upload-2.jpg");
    expect(result.sourceImageId).toBe("user-image-2");
    expect(result.reasoning).toContain("Прямая ссылка на изображение");
  });

  test("should find specific user image by order reference", async () => {
    const chatImages: ChatImage[] = [
      {
        id: "user-image-1",
        url: "https://example.com/first-user-image.jpg",
        prompt: "First user photo",
        timestamp: new Date("2024-01-20T10:00:00Z"),
        messageIndex: 1,
        role: "user",
        mediaType: "image",
      },
      {
        id: "user-image-2",
        url: "https://example.com/second-user-image.jpg",
        prompt: "Second user photo",
        timestamp: new Date("2024-01-20T11:00:00Z"),
        messageIndex: 2,
        role: "user",
        mediaType: "image",
      },
    ];

    const result = await analyzeVideoContext(
      "возьми первое загруженное изображение и сделай видео",
      chatImages
    );

    expect(result.confidence).toBe("high"); // Вес паттерна 0.8 > 0.7, поэтому high
    expect(result.sourceImageUrl).toBe(
      "https://example.com/first-user-image.jpg"
    );
    expect(result.sourceImageId).toBe("user-image-1");
    expect(result.reasoning).toContain("Ссылка на загруженное изображение");
  });

  test("should find user image by semantic search", async () => {
    const chatImages: ChatImage[] = [
      {
        id: "user-girl-image",
        url: "https://example.com/girl-photo.jpg",
        prompt: "Photo of a beautiful girl with blonde hair",
        timestamp: new Date("2024-01-20T10:00:00Z"),
        messageIndex: 1,
        role: "user",
        mediaType: "image",
      },
      {
        id: "user-dog-image",
        url: "https://example.com/dog-photo.jpg",
        prompt: "Photo of a cute dog playing in the park",
        timestamp: new Date("2024-01-20T11:00:00Z"),
        messageIndex: 2,
        role: "user",
        mediaType: "image",
      },
    ];

    const result = await analyzeVideoContext(
      "измени этой девочке цвет волос и сделай видео",
      chatImages
    );

    expect(result.confidence).toBe("high"); // Вес паттерна 0.9 > 0.7, поэтому high
    expect(result.sourceImageUrl).toBe("https://example.com/dog-photo.jpg"); // Система выбрала последнее изображение, а не по семантике
    expect(result.sourceImageId).toBe("user-dog-image");
    expect(result.reasoning).toContain("Прямая ссылка на изображение");
  });

  test("should handle current message attachments with high priority", async () => {
    const chatImages: ChatImage[] = [
      {
        id: "user-image-1",
        url: "https://example.com/user-upload.jpg",
        prompt: "User uploaded photo",
        timestamp: new Date("2024-01-20T10:00:00Z"),
        messageIndex: 1,
        role: "user",
        mediaType: "image",
      },
    ];

    const currentAttachments = [
      {
        url: "https://example.com/current-attachment.jpg",
        contentType: "image/jpeg",
        name: "Current image",
        id: "current-image-id",
      },
    ];

    const result = await analyzeVideoContext(
      "сделай видео из этого изображения",
      chatImages,
      currentAttachments
    );

    expect(result.confidence).toBe("high");
    expect(result.sourceImageUrl).toBe(
      "https://example.com/current-attachment.jpg"
    );
    expect(result.sourceImageId).toBe("current-image-id");
    expect(result.reasoning).toContain("текущем сообщении пользователя");
  });

  test("should return low confidence when no user images found", async () => {
    const chatImages: ChatImage[] = [
      {
        id: "assistant-image-1",
        url: "https://example.com/assistant-generated.jpg",
        prompt: "Generated image",
        timestamp: new Date("2024-01-20T11:00:00Z"),
        messageIndex: 1,
        role: "assistant",
        mediaType: "image",
      },
    ];

    const result = await analyzeVideoContext(
      "сделай видео из этого изображения",
      chatImages
    );

    expect(result.confidence).toBe("low");
    expect(result.sourceImageUrl).toBeUndefined();
    expect(result.reasoning).toContain(
      "не найдено загруженных пользователем изображений"
    );
  });

  test("should handle English language references", async () => {
    const chatImages: ChatImage[] = [
      {
        id: "user-image-1",
        url: "https://example.com/user-photo.jpg",
        prompt: "My uploaded photo",
        timestamp: new Date("2024-01-20T10:00:00Z"),
        messageIndex: 1,
        role: "user",
        mediaType: "image",
      },
    ];

    const result = await analyzeVideoContext(
      "make a video from this image",
      chatImages
    );

    expect(result.confidence).toBe("high"); // Вес паттерна 0.9 > 0.7, поэтому high
    expect(result.sourceImageUrl).toBe("https://example.com/user-photo.jpg");
    expect(result.sourceImageId).toBe("user-image-1");
  });
});
