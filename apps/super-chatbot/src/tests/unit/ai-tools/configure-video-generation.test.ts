import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureVideoGeneration } from "@/lib/ai/tools/configure-video-generation";
import { getVideoGenerationConfig } from "@/lib/config/media-settings-factory";
import { checkBalanceBeforeArtifact } from "@/lib/utils/ai-tools-balance";
import { analyzeVideoContext } from "@/lib/ai/context";

vi.mock("@/lib/config/media-settings-factory");
vi.mock("@/lib/utils/ai-tools-balance");
vi.mock("@/lib/ai/context");

describe("configureVideoGeneration", () => {
  const mockExecute = vi.fn();
  const mockCreateDocument = { execute: mockExecute };
  const mockSession = {
    user: { id: "test-user", email: "test@example.com", type: "user" as any },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ success: true, id: "test-doc" });

    vi.mocked(getVideoGenerationConfig).mockResolvedValue({
      type: "video" as any,
      availableResolutions: [
        { id: "1024x1024", label: "1024x1024", value: "1024x1024" } as any,
      ],
      availableStyles: [
        { id: "realistic", label: "realistic", value: "realistic" } as any,
      ],
      availableShotSizes: [
        { id: "close-up", label: "close-up", value: "close-up" } as any,
      ],
      availableModels: [] as any,
      availableFrameRates: [24, 30, 60] as any,
      availableDurations: [5, 10, 15, 30] as any,
      defaultSettings: {
        resolution: {
          id: "1024x1024",
          label: "1024x1024",
          value: "1024x1024",
        } as any,
        style: { id: "realistic", label: "realistic", value: "realistic" } as any,
        shotSize: {
          id: "close-up",
          label: "close-up",
          value: "close-up",
        } as any,
        model: { id: "ltx", name: "LTX", value: "ltx" } as any,
        duration: 10,
        frameRate: 30,
      } as any,
    });

    vi.mocked(checkBalanceBeforeArtifact).mockResolvedValue({
      valid: true,
      cost: 0,
    });
    vi.mocked(analyzeVideoContext).mockResolvedValue({
      sourceUrl: undefined as any,
      sourceId: undefined as any,
      mediaType: "video" as const,
      confidence: "high" as const,
      reasoning: "Test reasoning",
      metadata: undefined as any,
    });
  });

  it("should create video generation tool with correct schema", () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    expect(tool).toBeDefined();
    expect(tool.description).toContain("Configure video generation settings");
    expect(tool.parameters).toBeDefined();
  });

  it("should handle text-to-video generation", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
      chatId: "test-chat",
      userMessage: "A beautiful sunset over mountains with gentle wind",
    });

    const result = await tool.execute(
      {
        prompt: "A beautiful sunset over mountains with gentle wind",
        style: "cinematic",
        resolution: "1920x1080",
        duration: "10",
      },
      { toolCallId: "test-call", messages: [] }
    );

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "video",
        title: expect.any(String),
      })
    );
  });

  it("should handle image-to-video generation with source image URL", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
      chatId: "test-chat",
      userMessage: "Animate this image with gentle movement",
    });

    const result = await tool.execute(
      {
        prompt: "Animate this image with gentle movement",
        sourceVideoUrl: "https://example.com/image.jpg",
        style: "cinematic",
        resolution: "1920x1080",
        duration: "8",
      },
      { toolCallId: "test-call", messages: [] }
    );

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "video",
        title: expect.any(String),
      })
    );
  });

  it("should handle video-to-video generation with source video", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
      chatId: "test-chat",
      userMessage: "Transform this video into a different style",
    });

    const result = await tool.execute(
      {
        prompt: "Transform this video into a different style",
        sourceVideoUrl: "https://example.com/video.mp4",
        style: "artistic",
        resolution: "1920x1080",
        duration: "15",
      },
      { toolCallId: "test-call", messages: [] }
    );

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "video",
        title: expect.any(String),
      })
    );
  });

  it("should validate required parameters", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    // Test with missing prompt - should return config instead of throwing
    const result = await tool.execute({}, { toolCallId: "test-call", messages: [] });

    expect(result).toHaveProperty("type", "video");
    expect(result).toHaveProperty("availableResolutions");
    expect(result).toHaveProperty("availableStyles");
  });

  it("should handle balance check failure", async () => {
    vi.mocked(checkBalanceBeforeArtifact).mockResolvedValue({
      valid: false,
      cost: 0,
      userMessage: "Недостаточно средств для генерации видео",
    });

    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
      chatId: "test-chat",
      userMessage: "A beautiful sunset over mountains with gentle wind",
    });

    const result = await tool.execute(
      {
        prompt: "A beautiful sunset over mountains with gentle wind",
      },
      { toolCallId: "test-call", messages: [] }
    );

    expect(result).toMatchObject({
      balanceError: true,
      error: expect.stringContaining("Недостаточно средств"),
      requiredCredits: 0,
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("should handle createDocument failure", async () => {
    mockExecute.mockRejectedValue(new Error("Document creation failed"));

    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
      chatId: "test-chat",
      userMessage: "A beautiful sunset over mountains with gentle wind",
    });

    const result = await tool.execute(
      {
        prompt: "A beautiful sunset over mountains with gentle wind",
      },
      { toolCallId: "test-call", messages: [] }
    );

    expect(result).toMatchObject({
      error: expect.stringContaining("Ошибка создания видео"),
      fallbackConfig: expect.objectContaining({
        type: "video",
      }),
    });
  });

  it("should analyze video context correctly", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
      chatId: "test-chat",
      userMessage: "A beautiful sunset over mountains with gentle wind",
      currentAttachments: [
        { type: "video", url: "https://example.com/video.mp4" },
      ],
    });

    await tool.execute(
      {
        prompt: "A beautiful sunset over mountains with gentle wind",
      },
      { toolCallId: "test-call", messages: [] }
    );

    expect(analyzeVideoContext).toHaveBeenCalledWith(
      "A beautiful sunset over mountains with gentle wind",
      "test-chat",
      [{ type: "video", url: "https://example.com/video.mp4" }],
      "test-user"
    );
  });

  it("should handle different resolution formats", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
      chatId: "test-chat",
      userMessage: "A beautiful sunset over mountains with gentle wind",
    });

    const resolutions = [
      "1920x1080",
      "1920×1080",
      "1920 x 1080",
      "full hd",
      "fhd",
      "1080p",
      "4k",
      "square",
      "vertical",
      "horizontal",
    ];

    for (const resolution of resolutions) {
      await tool.execute(
        {
          prompt: "A beautiful sunset over mountains with gentle wind",
          resolution,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "video",
          title: expect.any(String),
        })
      );
    }
  });

  it("should handle different duration values", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
      chatId: "test-chat",
      userMessage: "A beautiful sunset over mountains with gentle wind",
    });

    const durations = ["5", "8", "10", "15", "30"];

    for (const duration of durations) {
      await tool.execute(
        {
          prompt: "A beautiful sunset over mountains with gentle wind",
          duration,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "video",
          title: expect.any(String),
        })
      );
    }
  });

  it("should handle different style formats", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
      chatId: "test-chat",
      userMessage: "A beautiful sunset over mountains with gentle wind",
    });

    const styles = [
      "realistic",
      "cinematic",
      "anime",
      "cartoon",
      "documentary",
      "vlog",
      "tutorial",
      "promotional",
      "artistic",
      "minimalist",
      "abstract",
    ];

    for (const style of styles) {
      await tool.execute(
        {
          prompt: "A beautiful sunset over mountains with gentle wind",
          style,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(mockExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "video",
          title: expect.any(String),
        })
      );
    }
  });
});
