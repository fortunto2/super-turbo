/**
 * Nano Banana Image Provider
 * Uses Gemini 2.5 Flash Image API for image generation
 */

import type {
  GeminiImageParams,
  GeminiEditParams,
  GeminiImageResult,
  GeminiEditResult,
} from "../types/gemini";

export class NanoBananaProvider {
  /**
   * Генерация изображения с помощью Nano Banana
   * Uses Gemini 2.5 Flash Image API
   */
  async generateImage(
    params: GeminiImageParams,
    config?: any
  ): Promise<GeminiImageResult> {
    console.log("🍌 🚀 NANO BANANA: Generating image with Gemini API");
    console.log("🍌 📝 Original Prompt:", params.prompt);
    console.log("🍌 🎨 Style:", params.style);
    console.log("🍌 ⚙️ Features:", params.nanoBananaFeatures);

    // Улучшаем промпт с Nano Banana особенностями
    const enhancedPrompt = this.enhancePrompt(params);

    console.log("🍌 ✨ Enhanced Prompt:", enhancedPrompt);

    // Получаем размеры из aspectRatio
    const dimensions = this.getAspectRatioDimensions(params.aspectRatio);

    // Пытаемся сгенерировать реальное изображение через Gemini 2.5 Flash Image (Vertex AI)
    const apiKey = process.env.VERTEX_AI_API_KEY || "";
    if (!apiKey) {
      throw new Error(
        "VERTEX_AI_API_KEY is not configured. Please add your Gemini API key to environment variables."
      );
    }

    const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: enhancedPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
      },
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Gemini Image API error: ${resp.status} - ${errorText}`);
    }

    const data: any = await resp.json();

    // Ищем бинарные данные изображения
    let generatedImageUrl: string | null = null;
    const candidates = data?.candidates || [];
    for (const c of candidates) {
      const parts = c?.content?.parts || [];
      for (const part of parts) {
        const inline = part?.inlineData;
        if (inline?.data && inline?.mimeType?.startsWith("image/")) {
          generatedImageUrl = `data:${inline.mimeType};base64,${inline.data}`;
          break;
        }
      }
      if (generatedImageUrl) break;
    }

    if (!generatedImageUrl) {
      throw new Error(
        "No image data returned from Gemini API. The API might not support image generation yet or returned an unexpected response format."
      );
    }

    const result: GeminiImageResult = {
      id: `nano-banana-${Date.now()}`,
      url: generatedImageUrl,
      prompt: params.prompt,
      timestamp: Date.now(),
      settings: {
        style: params.style,
        quality: params.quality,
        aspectRatio: params.aspectRatio,
        seed: params.seed,
        enableContextAwareness:
          params.nanoBananaFeatures.enableContextAwareness,
        enableSurgicalPrecision:
          params.nanoBananaFeatures.enableSurgicalPrecision,
        creativeMode: params.nanoBananaFeatures.creativeMode,
      },
      nanoBananaInfo: {
        model: "gemini-2.5-flash-image",
        capabilities: [
          "Context-aware editing",
          "Surgical precision",
          "Physical logic understanding",
          "Intelligent lighting",
        ],
        style: {
          id: params.style,
          label: params.style,
          description: "Nano Banana style",
        },
        quality: {
          id: params.quality,
          label: params.quality,
          multiplier: 1.0,
          description: "Nano Banana quality",
        },
        aspectRatio: {
          id: params.aspectRatio,
          label: params.aspectRatio,
          width: dimensions.width,
          height: dimensions.height,
          description: "Nano Banana aspect ratio",
        },
      },
      geminiResponse: enhancedPrompt,
    };

    console.log("🍌 ✅ NANO BANANA: Image generated successfully");
    return result;
  }

  /**
   * Редактирование изображения с помощью Nano Banana
   * Uses Gemini 2.5 Flash Image API
   */
  async editImage(
    params: GeminiEditParams,
    config?: any
  ): Promise<GeminiEditResult> {
    console.log("🍌 🚀 NANO BANANA: Editing image with Gemini API");

    const enhancedEditPrompt = this.enhanceEditPrompt(params);
    console.log("🍌 ✨ Enhanced Edit Prompt:", enhancedEditPrompt);

    const apiKey = process.env.VERTEX_AI_API_KEY || "";
    if (!apiKey) {
      throw new Error(
        "VERTEX_AI_API_KEY is not configured. Please add your Gemini API key to environment variables."
      );
    }

    const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: enhancedEditPrompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: await this.fetchImageAsBase64(params.sourceImageUrl),
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini edit API error: ${response.status} - ${errorText}`
      );
    }

    const resultData = await response.json();

    let editedImageUrl: string | null = null;
    const candidates = resultData?.candidates || [];
    for (const c of candidates) {
      const parts = c?.content?.parts || [];
      for (const part of parts) {
        const inline = part?.inlineData;
        if (inline?.data && inline?.mimeType?.startsWith("image/")) {
          editedImageUrl = `data:${inline.mimeType};base64,${inline.data}`;
          break;
        }
      }
      if (editedImageUrl) break;
    }

    if (!editedImageUrl) {
      throw new Error(
        "No image returned from Gemini edit API. The API might not support image editing yet or returned an unexpected response format."
      );
    }

    return {
      id: `nano-banana-edit-${Date.now()}`,
      url: editedImageUrl,
      editType: params.editType,
      editPrompt: params.editPrompt,
      timestamp: Date.now(),
      settings: {
        precisionLevel: params.precisionLevel,
        blendMode: params.blendMode,
        preserveOriginalStyle: params.preserveOriginalStyle,
        enhanceLighting: params.enhanceLighting,
        preserveShadows: params.preserveShadows,
      },
      nanoBananaEditInfo: {
        model: "gemini-2.5-flash-image",
        editType: {
          id: params.editType,
          label: params.editType,
          description: "Nano Banana edit type",
        },
        precisionLevel: {
          id: params.precisionLevel,
          label: params.precisionLevel,
          description: "Nano Banana precision level",
        },
        blendMode: {
          id: params.blendMode,
          label: params.blendMode,
          description: "Nano Banana blend mode",
        },
        capabilities: [
          "Context-aware editing",
          "Surgical precision",
          "Intelligent lighting",
          "Style preservation",
          "Natural blending",
        ],
      },
    };
  }

  /**
   * Улучшение промпта для генерации
   */
  private enhancePrompt(params: GeminiImageParams): string {
    let enhanced = params.prompt;

    if (params.nanoBananaFeatures.enableContextAwareness) {
      enhanced += ", context-aware editing for natural object relationships";
    }

    if (params.nanoBananaFeatures.enableSurgicalPrecision) {
      enhanced += ", surgical precision in placement and integration";
    }

    if (params.nanoBananaFeatures.creativeMode) {
      enhanced +=
        ", creative and artistic interpretation while maintaining realism";
    }

    enhanced += `, ${params.style} style, ${params.quality} quality`;
    enhanced +=
      ", intelligent lighting and reflections, perfect occlusion handling";

    return enhanced;
  }

  /**
   * Улучшение промпта для редактирования
   */
  private enhanceEditPrompt(params: GeminiEditParams): string {
    let enhanced = params.editPrompt;

    if (params.nanoBananaEditFeatures.enableContextAwareness) {
      enhanced += ", maintain relationships between objects and environment";
    }

    if (params.nanoBananaEditFeatures.enableSurgicalPrecision) {
      enhanced += ", surgical precision for accurate editing";
    }

    if (params.nanoBananaEditFeatures.preserveOriginalStyle) {
      enhanced += ", preserve the original style and aesthetic";
    }

    if (params.nanoBananaEditFeatures.enhanceLighting) {
      enhanced += ", enhance lighting naturally";
    }

    if (params.nanoBananaEditFeatures.preserveShadows) {
      enhanced += ", preserve realistic shadows and reflections";
    }

    enhanced += `, ${params.editType} editing with ${params.precisionLevel} precision`;
    enhanced += `, ${params.blendMode} blend mode`;

    return enhanced;
  }

  /**
   * Получение размеров из aspect ratio
   */
  private getAspectRatioDimensions(aspectRatio: string): {
    width: number;
    height: number;
  } {
    const ratios: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "16:9": { width: 1024, height: 576 },
      "9:16": { width: 576, height: 1024 },
      "4:3": { width: 1024, height: 768 },
      "3:4": { width: 768, height: 1024 },
      "3:2": { width: 1536, height: 1024 },
      "21:9": { width: 2560, height: 1080 },
    };

    return ratios[aspectRatio] || { width: 1024, height: 1024 };
  }

  private async fetchImageAsBase64(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch source image: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  }
}

// Экспортируем синглтон
export const nanoBananaProvider = new NanoBananaProvider();
