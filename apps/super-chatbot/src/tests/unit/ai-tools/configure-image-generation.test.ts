import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureImageGeneration } from "@/lib/ai/tools/configure-image-generation";
import { getImageGenerationConfig } from "@/lib/config/media-settings-factory";
import { checkBalanceBeforeArtifact } from "@/lib/utils/ai-tools-balance";
import { analyzeImageContext } from "@/lib/ai/context";

// Mock dependencies
vi.mock("@/lib/config/media-settings-factory");
vi.mock("@/lib/utils/ai-tools-balance");
vi.mock("@/lib/ai/context");

describe("configureImageGeneration", () => {
  const mockCreateDocument = vi.fn();
  const mockSession = {
    user: { id: "test-user", email: "test@example.com", type: "user" as any },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful responses
    vi.mocked(getImageGenerationConfig).mockResolvedValue({
      type: "image" as any,
      availableResolutions: ["1024x1024" as any],
      availableStyles: ["realistic" as any],
      availableShotSizes: ["close-up" as any],
      availableModels: [] as any,
      defaultSettings: {} as any,
    });

    vi.mocked(checkBalanceBeforeArtifact).mockResolvedValue({
      valid: true,
      cost: 0,
    });
    vi.mocked(analyzeImageContext).mockResolvedValue({
      sourceUrl: undefined as any,
      sourceId: undefined as any,
      mediaType: "image" as const,
      confidence: "high" as const,
      reasoningText: "Test reasoning",
      metadata: undefined as any,
    });
  });

  it("should create image generation tool with correct schema", () => {
    const tool = configureImageGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    expect(tool).toBeDefined();
    expect(tool.description).toContain("Configure image generation settings");
    expect(tool.inputSchema).toBeDefined();
  });

  it("should handle text-to-image generation", async () => {
    const tool = configureImageGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    expect(tool.execute).toBeDefined();
    mockCreateDocument.mockResolvedValue({ success: true, id: "test-doc" });

    const result = await tool.execute?.(
      {
        prompt: "A beautiful sunset over mountains",
        style: "realistic",
        resolution: "1024x1024",
      },
      { toolCallId: "test-call", messages: [] }
    );

    expect(mockCreateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "image",
        content: expect.stringContaining("A beautiful sunset over mountains"),
        metadata: expect.objectContaining({
          generationType: "text-to-image",
          style: "realistic",
          resolution: "1024x1024",
        }),
      })
    );
  });

  it("should handle image-to-image generation with source image", async () => {
    const tool = configureImageGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    mockCreateDocument.mockResolvedValue({ success: true, id: "test-doc" });

    const result = await tool.execute?.(
      {
        prompt: "Transform this image into a watercolor painting",
        sourceImageUrl: "https://example.com/image.jpg",
        style: "watercolor",
        resolution: "1024x1024",
      },
      { toolCallId: "test-call", messages: [] }
    );

    expect(mockCreateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "image",
        content: expect.stringContaining(
          "Transform this image into a watercolor painting"
        ),
        metadata: expect.objectContaining({
          generationType: "image-to-image",
          sourceImageUrl: "https://example.com/image.jpg",
          style: "watercolor",
        }),
      })
    );
  });

  it("should validate required parameters", async () => {
    const tool = configureImageGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    // Test with missing prompt
    await expect(
      tool.execute?.({}, { toolCallId: "test-call", messages: [] })
    ).rejects.toThrow();
  });

  it("should handle balance check failure", async () => {
    vi.mocked(checkBalanceBeforeArtifact).mockResolvedValue({
      valid: false,
      cost: 0,
    });

    const tool = configureImageGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    const result = await tool.execute?.(
      {
        prompt: "A beautiful sunset over mountains",
      },
      { toolCallId: "test-call", messages: [] }
    );

    expect(result).toEqual({
      success: false,
      error: "Insufficient balance for image generation",
    });
    expect(mockCreateDocument).not.toHaveBeenCalled();
  });

  it("should handle createDocument failure", async () => {
    mockCreateDocument.mockRejectedValue(new Error("Document creation failed"));

    const tool = configureImageGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    const result = await tool.execute?.(
      {
        prompt: "A beautiful sunset over mountains",
      },
      { toolCallId: "test-call", messages: [] }
    );

    expect(result).toEqual({
      success: false,
      error: "Failed to create image document: Document creation failed",
    });
  });

  it("should analyze image context correctly", async () => {
    const tool = configureImageGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
      currentAttachments: [
        { type: "image", url: "https://example.com/image.jpg" },
      ],
    });

    mockCreateDocument.mockResolvedValue({ success: true, id: "test-doc" });

    await tool.execute?.(
      {
        prompt: "A beautiful sunset over mountains",
      },
      { toolCallId: "test-call", messages: [] }
    );

    expect(analyzeImageContext).toHaveBeenCalledWith([
      { type: "image", url: "https://example.com/image.jpg" },
    ]);
  });

  it("should handle different resolution formats", async () => {
    const tool = configureImageGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    mockCreateDocument.mockResolvedValue({ success: true, id: "test-doc" });

    // Test various resolution formats
    const resolutions = [
      "1920x1080",
      "1920×1080",
      "1920 x 1080",
      "full hd",
      "fhd",
      "1080p",
      "square",
      "vertical",
      "horizontal",
    ];

    for (const resolution of resolutions) {
      await tool.execute?.(
        {
          prompt: "A beautiful sunset over mountains",
          resolution,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(mockCreateDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            resolution,
          }),
        })
      );
    }
  });

  it("should handle different style formats", async () => {
    const tool = configureImageGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    mockCreateDocument.mockResolvedValue({ success: true, id: "test-doc" });

    // Test various style formats
    const styles = [
      "realistic",
      "cinematic",
      "anime",
      "cartoon",
      "sketch",
      "painting",
      "steampunk",
      "fantasy",
      "sci-fi",
      "horror",
      "minimalist",
      "abstract",
      "portrait",
      "landscape",
    ];

    for (const style of styles) {
      await tool.execute?.(
        {
          prompt: "A beautiful sunset over mountains",
          style,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(mockCreateDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            style,
          }),
        })
      );
    }
  });
});
