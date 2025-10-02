import { tool } from "ai";
import { z } from "zod";
import { runBananaInference, getBananaModels } from "@/lib/ai/banana-api";

export const bananaInferenceTool = tool({
  description:
    "Запускает inference на Banana GPU платформе для обработки данных",
  parameters: z.object({
    modelId: z.string().describe("ID модели Banana для inference"),
    inputs: z.record(z.any()).describe("Входные данные для модели"),
    config: z
      .object({
        maxTokens: z
          .number()
          .optional()
          .describe("Максимальное количество токенов"),
        temperature: z
          .number()
          .min(0)
          .max(2)
          .optional()
          .describe("Температура для генерации (0-2)"),
        topP: z
          .number()
          .min(0)
          .max(1)
          .optional()
          .describe("Top-p параметр (0-1)"),
      })
      .optional()
      .describe("Конфигурация для inference"),
  }),
  execute: async ({ modelId, inputs, config }) => {
    try {
      console.log("🍌 Starting Banana inference:", { modelId, inputs, config });

      const result = await runBananaInference({
        modelId,
        inputs,
        ...(config && {
          config: {
            ...(config.maxTokens !== undefined && {
              maxTokens: config.maxTokens,
            }),
            ...(config.temperature !== undefined && {
              temperature: config.temperature,
            }),
            ...(config.topP !== undefined && { topP: config.topP }),
          },
        }),
      });

      if (result.status === "error") {
        return {
          success: false,
          error: result.error,
          inferenceId: result.id,
        };
      }

      return {
        success: true,
        inferenceId: result.id,
        outputs: result.outputs,
        metrics: result.metrics,
        inferenceTime: result.metrics?.inferenceTime,
        gpuUtilization: result.metrics?.gpuUtilization,
        memoryUsed: result.metrics?.memoryUsed,
      };
    } catch (error) {
      console.error("🍌 Banana inference error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const listBananaModelsTool = tool({
  description: "Получает список доступных моделей Banana для inference",
  parameters: z.object({
    framework: z
      .string()
      .optional()
      .describe("Фильтр по фреймворку (PyTorch, TensorFlow, etc.)"),
    status: z
      .enum(["active", "inactive"])
      .optional()
      .describe("Фильтр по статусу модели"),
  }),
  execute: async ({ framework, status }) => {
    try {
      console.log("🍌 Fetching Banana models:", { framework, status });

      const models = await getBananaModels();

      let filteredModels = models;

      if (framework) {
        filteredModels = filteredModels.filter((model) =>
          model.framework.toLowerCase().includes(framework.toLowerCase())
        );
      }

      if (status) {
        filteredModels = filteredModels.filter(
          (model) => model.status === status
        );
      }

      return {
        success: true,
        models: filteredModels,
        totalCount: filteredModels.length,
        frameworks: [...new Set(models.map((m) => m.framework))],
      };
    } catch (error) {
      console.error("🍌 Banana models error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
