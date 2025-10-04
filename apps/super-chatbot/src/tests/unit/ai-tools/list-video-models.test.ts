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
      type: "video" as any,
      source: "comfyui",
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
      type: "video" as any,
      source: "google-cloud" as any,
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
      type: "video" as any,
      source: "azure-openai" as any,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAvailableVideoModels).mockResolvedValue(mockVideoModels);
  });

  describe("listVideoModels", () => {
    it("should list all video models in agent-friendly format by default", async () => {
      const result = await listVideoModels.execute(
        {},
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      expect(
        Array.isArray(result.data) ? result.data : result.data?.models
      ).toHaveLength(3);
      const models = Array.isArray(result.data)
        ? result.data
        : result.data?.models;
      expect(models?.[0]).toMatchObject({
        id: "LTX Video",
        name: "LTX Video",
        price_per_second: 0.4,
        max_duration: 30,
      });
    });

    it("should list models in detailed format", async () => {
      const result = await listVideoModels.execute(
        { format: "detailed" },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      expect(
        Array.isArray(result.data) ? result.data : result.data?.models
      ).toHaveLength(3);
      const models = Array.isArray(result.data)
        ? result.data
        : result.data?.models;
      expect(models?.[0]).toMatchObject({
        id: "LTX Video",
        name: "LTX Video",
        description: "LTX Video - High quality video generation",
        max_duration: 30,
        price_per_second: 0.4,
      });
    });

    it("should list models in simple format", async () => {
      const result = await listVideoModels.execute(
        { format: "simple" },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      expect(
        Array.isArray(result.data) ? result.data : result.data?.models
      ).toHaveLength(3);
      const models = Array.isArray(result.data)
        ? result.data
        : result.data?.models;
      expect(models?.[0]).toMatchObject({
        id: "LTX Video",
        name: "LTX Video",
      });
    });

    it("should filter models by price", async () => {
      const result = await listVideoModels.execute(
        { filterByPrice: 0.5 },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      const models = Array.isArray(result.data)
        ? result.data
        : result.data?.models;
      expect(models).toHaveLength(1);
      expect(models?.[0]?.id).toBe("LTX Video");
    });

    it("should filter models by duration", async () => {
      const result = await listVideoModels.execute(
        { filterByDuration: 100 },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      const models = Array.isArray(result.data)
        ? result.data
        : result.data?.models;
      expect(models).toHaveLength(2);
      expect(models?.map((m: any) => m.id)).toEqual([
        "LTX Video",
        "Veo2",
      ]);
    });

    it("should exclude VIP models when requested", async () => {
      const result = await listVideoModels.execute(
        { excludeVip: true },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      const models = Array.isArray(result.data)
        ? result.data
        : result.data?.models;
      expect(models).toHaveLength(2);
      expect(models?.map((m: any) => m.id)).toEqual([
        "LTX Video",
        "Veo2",
      ]);
    });

    it("should apply multiple filters", async () => {
      const result = await listVideoModels.execute(
        {
          filterByPrice: 1.0,
          filterByDuration: 50,
          excludeVip: true,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      const models = Array.isArray(result.data)
        ? result.data
        : result.data?.models;
      expect(models).toHaveLength(1);
      expect(models?.[0]?.id).toBe("Veo2");
    });

    it("should handle empty results", async () => {
      vi.mocked(getAvailableVideoModels).mockResolvedValue([]);

      const result = await listVideoModels.execute(
        {},
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      const models = Array.isArray(result.data)
        ? result.data
        : result.data?.models;
      expect(models).toHaveLength(0);
      expect(result.message).toContain("Found 0 video models");
    });

    it("should handle API errors", async () => {
      vi.mocked(getAvailableVideoModels).mockRejectedValue(
        new Error("API Error")
      );

      const result = await listVideoModels.execute(
        {},
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to list video models");
    });
  });

  describe("findBestVideoModel", () => {
    it("should find the best model for given requirements", async () => {
      const result = await findBestVideoModel.execute(
        {
          maxPrice: 5.0,
          preferredDuration: 10,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: "LTX Video",
        name: "LTX Video",
        price_per_second: 0.4,
      });
    });

    it("should prefer cheaper models when budget is limited", async () => {
      const result = await findBestVideoModel.execute(
        {
          maxPrice: 2.0,
          preferredDuration: 5,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("LTX Video");
    });

    it("should prefer higher quality models when budget allows", async () => {
      const result = await findBestVideoModel.execute(
        {
          maxPrice: 20.0,
          preferredDuration: 10,
          prioritizeQuality: true,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("Veo2");
    });

    it("should handle duration requirements", async () => {
      const result = await findBestVideoModel.execute(
        {
          maxPrice: 100.0,
          preferredDuration: 100,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("Veo2");
    });

    it("should handle resolution requirements", async () => {
      const result = await findBestVideoModel.execute(
        {
          maxPrice: 10.0,
          preferredDuration: 5,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("LTX Video");
    });

    it("should return null when no suitable model found", async () => {
      const result = await findBestVideoModel.execute(
        {
          maxPrice: 10.0,
          preferredDuration: 200,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain(
        "No video model found matching your criteria"
      );
    });

    it("should handle API errors", async () => {
      vi.mocked(getAvailableVideoModels).mockRejectedValue(
        new Error("API Error")
      );

      const result = await findBestVideoModel.execute(
        {
          maxPrice: 5.0,
          preferredDuration: 10,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to find best video model");
    });

    it("should validate required parameters", async () => {
      const result = await findBestVideoModel.execute(
        {},
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should validate duration parameter", async () => {
      const result = await findBestVideoModel.execute(
        {
          maxPrice: 5.0,
          preferredDuration: -1,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should validate budget parameter", async () => {
      const result = await findBestVideoModel.execute(
        {
          maxPrice: -1,
          preferredDuration: 10,
        },
        { toolCallId: "test-call", messages: [] }
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});
