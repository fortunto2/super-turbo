import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureVideoGeneration } from "@/lib/ai/tools/configure-video-generation";
import { getVideoGenerationConfig } from "@/lib/config/media-settings-factory";
import { checkBalanceBeforeArtifact } from "@/lib/utils/ai-tools-balance";
import { analyzeVideoContext } from "@/lib/ai/context";

// Mock dependencies
vi.mock("@/lib/config/media-settings-factory");
vi.mock("@/lib/utils/ai-tools-balance");
vi.mock("@/lib/ai/context");

describe("configureVideoGeneration", () => {
  const mockCreateDocument = vi.fn();
  const mockSession = {
    user: { id: "test-user", email: "test@example.com" },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful responses
    vi.mocked(getVideoGenerationConfig).mockResolvedValue({
      styles: [{ id: "cinematic", label: "Cinematic" }],
      resolutions: [{ width: 1920, height: 1080, label: "1920x1080" }],
      models: [{ id: "ltx", label: "LTX Video" }],
      durations: [5, 10, 15, 30],
    });

    vi.mocked(checkBalanceBeforeArtifact).mockResolvedValue(true);
    vi.mocked(analyzeVideoContext).mockResolvedValue({
      hasVideo: false,
      hasImage: false,
      videoCount: 0,
      imageCount: 0,
      context: "text-only",
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
    });

    mockCreateDocument.mockResolvedValue({ success: true, id: "test-doc" });

    const result = await tool.execute({
      prompt: "A beautiful sunset over mountains with gentle wind",
      style: "cinematic",
      resolution: "1920x1080",
      duration: 10,
    });

    expect(mockCreateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "video",
        content: expect.stringContaining(
          "A beautiful sunset over mountains with gentle wind"
        ),
        metadata: expect.objectContaining({
          generationType: "text-to-video",
          style: "cinematic",
          resolution: "1920x1080",
          duration: 10,
        }),
      })
    );
  });

  it("should handle image-to-video generation with source image", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    mockCreateDocument.mockResolvedValue({ success: true, id: "test-doc" });

    const result = await tool.execute({
      prompt: "Animate this image with gentle movement",
      sourceVideoUrl: "https://example.com/image.jpg",
      style: "cinematic",
      resolution: "1920x1080",
      duration: 8,
    });

    expect(mockCreateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "video",
        content: expect.stringContaining(
          "Animate this image with gentle movement"
        ),
        metadata: expect.objectContaining({
          generationType: "image-to-video",
          sourceVideoUrl: "https://example.com/image.jpg",
          style: "cinematic",
        }),
      })
    );
  });

  it("should handle video-to-video generation with source video", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    mockCreateDocument.mockResolvedValue({ success: true, id: "test-doc" });

    const result = await tool.execute({
      prompt: "Transform this video into a different style",
      sourceVideoUrl: "https://example.com/video.mp4",
      style: "artistic",
      resolution: "1920x1080",
      duration: 15,
    });

    expect(mockCreateDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "video",
        content: expect.stringContaining(
          "Transform this video into a different style"
        ),
        metadata: expect.objectContaining({
          generationType: "video-to-video",
          sourceVideoUrl: "https://example.com/video.mp4",
          style: "artistic",
        }),
      })
    );
  });

  it("should validate required parameters", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    // Test with missing prompt
    await expect(tool.execute({})).rejects.toThrow();
  });

  it("should handle balance check failure", async () => {
    vi.mocked(checkBalanceBeforeArtifact).mockResolvedValue(false);

    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    const result = await tool.execute({
      prompt: "A beautiful sunset over mountains with gentle wind",
    });

    expect(result).toEqual({
      success: false,
      error: "Insufficient balance for video generation",
    });
    expect(mockCreateDocument).not.toHaveBeenCalled();
  });

  it("should handle createDocument failure", async () => {
    mockCreateDocument.mockRejectedValue(new Error("Document creation failed"));

    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    const result = await tool.execute({
      prompt: "A beautiful sunset over mountains with gentle wind",
    });

    expect(result).toEqual({
      success: false,
      error: "Failed to create video document: Document creation failed",
    });
  });

  it("should analyze video context correctly", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
      currentAttachments: [
        { type: "video", url: "https://example.com/video.mp4" },
      ],
    });

    mockCreateDocument.mockResolvedValue({ success: true, id: "test-doc" });

    await tool.execute({
      prompt: "A beautiful sunset over mountains with gentle wind",
    });

    expect(analyzeVideoContext).toHaveBeenCalledWith([
      { type: "video", url: "https://example.com/video.mp4" },
    ]);
  });

  it("should handle different resolution formats", async () => {
    const tool = configureVideoGeneration({
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
      "4k",
      "square",
      "vertical",
      "horizontal",
    ];

    for (const resolution of resolutions) {
      await tool.execute({
        prompt: "A beautiful sunset over mountains with gentle wind",
        resolution,
      });

      expect(mockCreateDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            resolution,
          }),
        })
      );
    }
  });

  it("should handle different duration values", async () => {
    const tool = configureVideoGeneration({
      createDocument: mockCreateDocument,
      session: mockSession,
    });

    mockCreateDocument.mockResolvedValue({ success: true, id: "test-doc" });

    // Test various duration values
    const durations = [5, 8, 10, 15, 30];

    for (const duration of durations) {
      await tool.execute({
        prompt: "A beautiful sunset over mountains with gentle wind",
        duration,
      });

      expect(mockCreateDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            duration,
          }),
        })
      );
    }
  });

  it("should handle different style formats", async () => {
    const tool = configureVideoGeneration({
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
      "documentary",
      "vlog",
      "tutorial",
      "promotional",
      "artistic",
      "minimalist",
      "abstract",
    ];

    for (const style of styles) {
      await tool.execute({
        prompt: "A beautiful sunset over mountains with gentle wind",
        style,
      });

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
