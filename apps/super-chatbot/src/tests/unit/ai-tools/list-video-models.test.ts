import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listVideoModels,
  findBestVideoModel,
} from "@/lib/ai/tools/list-video-models";
import { getAvailableVideoModels } from "@/lib/config/superduperai";

// Mock dependencies
vi.mock("@/lib/config/superduperai");

describe("list-video-models", () => {
  const mockVideoModels = [
    {
      id: "comfyui/ltx",
      name: "LTX Video",
      description: "LTX Video - High quality video generation",
      maxDuration: 30,
      maxResolution: { width: 1216, height: 704 },
      supportedFrameRates: [30],
      price_per_second: 0.4,
      workflowPath: "LTX/default.json",
      supportedAspectRatios: ["16:9", "1:1", "9:16"],
      supportedQualities: ["hd"],
      params: {
        price_per_second: 0.4,
        max_duration: 30,
        max_resolution: { width: 1216, height: 704 },
      },
    },
    {
      id: "google-cloud/veo2",
      name: "Veo2",
      description: "Google Veo2 - Advanced video generation",
      maxDuration: 60,
      maxResolution: { width: 1920, height: 1080 },
      supportedFrameRates: [24, 30],
      price_per_second: 0.8,
      workflowPath: "Veo2/default.json",
      supportedAspectRatios: ["16:9", "9:16", "1:1"],
      supportedQualities: ["hd", "4k"],
      params: {
        price_per_second: 0.8,
        max_duration: 60,
        max_resolution: { width: 1920, height: 1080 },
      },
    },
    {
      id: "azure-openai/sora",
      name: "Sora",
      description: "OpenAI Sora - Premium video generation",
      maxDuration: 120,
      maxResolution: { width: 1920, height: 1080 },
      supportedFrameRates: [24, 30, 60],
      price_per_second: 1.2,
      workflowPath: "Sora/default.json",
      supportedAspectRatios: ["16:9", "9:16", "1:1", "4:3"],
      supportedQualities: ["hd", "4k", "8k"],
      vip_only: true,
      params: {
        price_per_second: 1.2,
        max_duration: 120,
        max_resolution: { width: 1920, height: 1080 },
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAvailableVideoModels).mockResolvedValue(mockVideoModels);
  });

  describe("listVideoModels", () => {
    it("should list all video models in agent-friendly format by default", async () => {
      const result = await listVideoModels.execute({});

      expect(result.success).toBe(true);
      expect(result.models).toHaveLength(3);
      expect(result.models[0]).toMatchObject({
        id: "comfyui/ltx",
        name: "LTX Video",
        price_per_second: 0.4,
        max_duration: 30,
      });
    });

    it("should list models in detailed format", async () => {
      const result = await listVideoModels.execute({ format: "detailed" });

      expect(result.success).toBe(true);
      expect(result.models).toHaveLength(3);
      expect(result.models[0]).toMatchObject({
        id: "comfyui/ltx",
        name: "LTX Video",
        description: "LTX Video - High quality video generation",
        maxDuration: 30,
        maxResolution: { width: 1216, height: 704 },
        supportedFrameRates: [30],
        price_per_second: 0.4,
        workflowPath: "LTX/default.json",
        supportedAspectRatios: ["16:9", "1:1", "9:16"],
        supportedQualities: ["hd"],
      });
    });

    it("should list models in simple format", async () => {
      const result = await listVideoModels.execute({ format: "simple" });

      expect(result.success).toBe(true);
      expect(result.models).toHaveLength(3);
      expect(result.models[0]).toMatchObject({
        id: "comfyui/ltx",
        name: "LTX Video",
      });
      // Should not have detailed properties
      expect(result.models[0]).not.toHaveProperty("description");
      expect(result.models[0]).not.toHaveProperty("maxDuration");
    });

    it("should filter models by price", async () => {
      const result = await listVideoModels.execute({ filterByPrice: 0.5 });

      expect(result.success).toBe(true);
      expect(result.models).toHaveLength(1);
      expect(result.models[0].id).toBe("comfyui/ltx");
    });

    it("should filter models by duration", async () => {
      const result = await listVideoModels.execute({ filterByDuration: 100 });

      expect(result.success).toBe(true);
      expect(result.models).toHaveLength(2);
      expect(result.models.map((m) => m.id)).toEqual([
        "comfyui/ltx",
        "google-cloud/veo2",
      ]);
    });

    it("should exclude VIP models when requested", async () => {
      const result = await listVideoModels.execute({ excludeVip: true });

      expect(result.success).toBe(true);
      expect(result.models).toHaveLength(2);
      expect(result.models.map((m) => m.id)).toEqual([
        "comfyui/ltx",
        "google-cloud/veo2",
      ]);
    });

    it("should apply multiple filters", async () => {
      const result = await listVideoModels.execute({
        filterByPrice: 1.0,
        filterByDuration: 50,
        excludeVip: true,
      });

      expect(result.success).toBe(true);
      expect(result.models).toHaveLength(1);
      expect(result.models[0].id).toBe("google-cloud/veo2");
    });

    it("should handle empty results", async () => {
      vi.mocked(getAvailableVideoModels).mockResolvedValue([]);

      const result = await listVideoModels.execute({});

      expect(result.success).toBe(true);
      expect(result.models).toHaveLength(0);
      expect(result.message).toContain("No video models available");
    });

    it("should handle API errors", async () => {
      vi.mocked(getAvailableVideoModels).mockRejectedValue(
        new Error("API Error")
      );

      const result = await listVideoModels.execute({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to fetch video models");
    });
  });

  describe("findBestVideoModel", () => {
    it("should find the best model for given requirements", async () => {
      const result = await findBestVideoModel.execute({
        duration: 10,
        resolution: "1920x1080",
        budget: 5.0,
      });

      expect(result.success).toBe(true);
      expect(result.model).toMatchObject({
        id: "comfyui/ltx",
        name: "LTX Video",
        price_per_second: 0.4,
      });
    });

    it("should prefer cheaper models when budget is limited", async () => {
      const result = await findBestVideoModel.execute({
        duration: 5,
        resolution: "1216x704",
        budget: 2.0,
      });

      expect(result.success).toBe(true);
      expect(result.model.id).toBe("comfyui/ltx");
    });

    it("should prefer higher quality models when budget allows", async () => {
      const result = await findBestVideoModel.execute({
        duration: 10,
        resolution: "1920x1080",
        budget: 20.0,
      });

      expect(result.success).toBe(true);
      expect(result.model.id).toBe("google-cloud/veo2");
    });

    it("should handle duration requirements", async () => {
      const result = await findBestVideoModel.execute({
        duration: 100,
        resolution: "1920x1080",
        budget: 100.0,
      });

      expect(result.success).toBe(true);
      expect(result.model.id).toBe("google-cloud/veo2");
    });

    it("should handle resolution requirements", async () => {
      const result = await findBestVideoModel.execute({
        duration: 5,
        resolution: "1216x704",
        budget: 10.0,
      });

      expect(result.success).toBe(true);
      expect(result.model.id).toBe("comfyui/ltx");
    });

    it("should return null when no suitable model found", async () => {
      const result = await findBestVideoModel.execute({
        duration: 200,
        resolution: "1920x1080",
        budget: 10.0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No suitable model found");
    });

    it("should handle API errors", async () => {
      vi.mocked(getAvailableVideoModels).mockRejectedValue(
        new Error("API Error")
      );

      const result = await findBestVideoModel.execute({
        duration: 10,
        resolution: "1920x1080",
        budget: 5.0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to fetch video models");
    });

    it("should validate required parameters", async () => {
      const result = await findBestVideoModel.execute({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Duration is required");
    });

    it("should validate duration parameter", async () => {
      const result = await findBestVideoModel.execute({
        duration: -1,
        resolution: "1920x1080",
        budget: 5.0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Duration must be positive");
    });

    it("should validate budget parameter", async () => {
      const result = await findBestVideoModel.execute({
        duration: 10,
        resolution: "1920x1080",
        budget: -1,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Budget must be positive");
    });
  });
});
