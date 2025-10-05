import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/generate/video/route";
import { auth } from "@/app/(auth)/auth";
import { getSuperduperAIConfigWithUserToken } from "@/lib/config/superduperai";
import { generateVideoWithStrategy } from "@turbo-super/api";
import { validateOperationBalance } from "@/lib/utils/tools-balance";

// Mock dependencies
vi.mock("@/app/(auth)/auth");
vi.mock("@/lib/config/superduperai");
vi.mock("@turbo-super/api");
vi.mock("@/lib/utils/tools-balance");
vi.mock("@/lib/monitoring/simple-monitor", () => ({
  withMonitoring: (fn: any) => fn,
}));

describe("/api/generate/video/route", () => {
  const mockSession = {
    user: { id: "test-user", email: "test@example.com" },
  };

  const mockConfig = {
    url: "https://api.example.com",
    token: "test-token",
    wsURL: "wss://api.example.com",
    isUserToken: false,
  };

  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(getSuperduperAIConfigWithUserToken).mockReturnValue(mockConfig);
    vi.mocked(validateOperationBalance).mockResolvedValue({
      valid: true,
      cost: 10,
      currentBalance: 100,
      required: 10
    });
    vi.mocked(generateVideoWithStrategy).mockClear();
  });

  it("should return 401 for unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: "A beautiful sunset over mountains",
        generationType: "text-to-video",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should handle text-to-video generation without file", async () => {
    const mockResult = {
      success: true,
      data: { id: "test-video-id" },
    };

    vi.mocked(generateVideoWithStrategy).mockResolvedValue(mockResult);

    const request = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: "A beautiful sunset over mountains with gentle wind",
        generationType: "text-to-video",
        model: "Veo2",
        resolution: "1920x1080",
        duration: 10,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(generateVideoWithStrategy).toHaveBeenCalledWith(
      "text-to-video",
      expect.objectContaining({
        prompt: "A beautiful sunset over mountains with gentle wind",
        model: "google-cloud/veo2-text2video",
        resolution: expect.objectContaining({
          width: 1920,
          height: 1080,
        }),
        duration: 10,
        // Should NOT have file property for text-to-video
      }),
      mockConfig
    );

    // Verify that file is NOT passed for text-to-video
    const callArgs = vi.mocked(generateVideoWithStrategy).mock.calls[0];
    expect(callArgs?.[1]).not.toHaveProperty("file");
  });

  it("should handle image-to-video generation with source image URL", async () => {
    const mockResult = {
      success: true,
      data: { id: "test-video-id" },
    };

    vi.mocked(generateVideoWithStrategy).mockResolvedValue(mockResult);

    const request = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Animate this image with gentle movement",
        generationType: "image-to-video",
        sourceImageUrl: "https://example.com/image.jpg",
        model: "Veo3",
        resolution: "1920x1080",
        duration: 8,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(generateVideoWithStrategy).toHaveBeenCalledWith(
      "image-to-video",
      expect.objectContaining({
        prompt: "Animate this image with gentle movement",
        sourceImageUrl: "https://example.com/image.jpg",
        model: "google-cloud/veo3",
        resolution: expect.objectContaining({
          width: 1920,
          height: 1080,
        }),
        duration: 8,
      }),
      mockConfig
    );
  });

  it("should handle multipart form data for image-to-video", async () => {
    const mockResult = {
      success: true,
      data: { id: "test-video-id" },
    };

    vi.mocked(generateVideoWithStrategy).mockResolvedValue(mockResult);

    const formData = new FormData();
    formData.append("prompt", "Animate this image with gentle movement");
    formData.append("generationType", "image-to-video");
    formData.append("model", "Sora");
    formData.append("resolution", "1920x1080");
    formData.append("duration", "10");
    // Add a mock file for image-to-video
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    formData.append("file", file);

    const request = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.creditsUsed).toBeDefined();
    expect(generateVideoWithStrategy).toHaveBeenCalledWith(
      "image-to-video",
      expect.objectContaining({
        prompt: "Animate this image with gentle movement",
        model: "azure-openai/sora",
        duration: 10,
      }),
      mockConfig
    );
  });

  it("should handle generation failure", async () => {
    const mockResult = {
      success: false,
      error: "Generation failed",
    };

    vi.mocked(generateVideoWithStrategy).mockResolvedValue(mockResult);

    const request = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: "A beautiful sunset over mountains with gentle wind",
        generationType: "text-to-video",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Generation failed");
  });

  it("should handle balance validation failure", async () => {
    vi.mocked(validateOperationBalance).mockResolvedValue({
      valid: false,
      cost: 100,
      currentBalance: 50,
      required: 100
    });

    const request = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: "A beautiful sunset over mountains with gentle wind",
        generationType: "text-to-video",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(402);
    expect(data.error).toBeDefined();
  });

  it("should handle invalid JSON", async () => {
    const request = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: "invalid json",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to generate video");
  });

  it("should handle missing prompt", async () => {
    const mockResult = {
      success: true,
      data: { id: "test-video-id" },
    };

    vi.mocked(generateVideoWithStrategy).mockResolvedValue(mockResult);

    const request = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: JSON.stringify({
        generationType: "text-to-video",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    // Implementation allows missing prompt, defaults to empty string
    expect(response.status).toBe(200);
    expect(generateVideoWithStrategy).toHaveBeenCalledWith(
      "text-to-video",
      expect.objectContaining({
        prompt: "",
      }),
      mockConfig
    );
  });

  it("should handle image-to-video without file by falling back to text-to-video", async () => {
    const mockResult = {
      success: true,
      data: { id: "test-video-id" },
    };

    vi.mocked(generateVideoWithStrategy).mockResolvedValue(mockResult);

    const request = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Animate this image",
        generationType: "image-to-video",
        model: "Veo3",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    // Implementation falls back to text-to-video when no file provided
    expect(response.status).toBe(200);
    expect(generateVideoWithStrategy).toHaveBeenCalledWith(
      "text-to-video",
      expect.objectContaining({
        prompt: "Animate this image",
        model: "google-cloud/veo3-text2video",
      }),
      mockConfig
    );
  });

  it("should map model names correctly", async () => {
    const mockResult = {
      success: true,
      data: { id: "test-video-id" },
    };

    vi.mocked(generateVideoWithStrategy).mockResolvedValue(mockResult);

    // Test Veo2 mapping
    const request1 = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Test video",
        generationType: "text-to-video",
        model: "Veo2",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await POST(request1);

    expect(generateVideoWithStrategy).toHaveBeenCalledWith(
      "text-to-video",
      expect.objectContaining({
        model: "google-cloud/veo2-text2video",
      }),
      mockConfig
    );

    // Test Veo3 mapping
    const request2 = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Test video",
        generationType: "image-to-video",
        model: "Veo3",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await POST(request2);

    expect(generateVideoWithStrategy).toHaveBeenCalledWith(
      "image-to-video",
      expect.objectContaining({
        model: "google-cloud/veo3",
      }),
      mockConfig
    );

    // Test Sora mapping
    const request3 = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Test video",
        generationType: "text-to-video",
        model: "Sora",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await POST(request3);

    expect(generateVideoWithStrategy).toHaveBeenCalledWith(
      "text-to-video",
      expect.objectContaining({
        model: "azure-openai/sora",
      }),
      mockConfig
    );
  });

  it("should handle unknown model names", async () => {
    const mockResult = {
      success: true,
      data: { id: "test-video-id" },
    };

    vi.mocked(generateVideoWithStrategy).mockResolvedValue(mockResult);

    const request = new NextRequest("http://localhost/api/generate/video", {
      method: "POST",
      body: JSON.stringify({
        prompt: "Test video",
        generationType: "text-to-video",
        model: "UnknownModel",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(generateVideoWithStrategy).toHaveBeenCalledWith(
      "text-to-video",
      expect.objectContaining({
        model: "UnknownModel", // Should pass through unchanged
      }),
      mockConfig
    );
  });
});
