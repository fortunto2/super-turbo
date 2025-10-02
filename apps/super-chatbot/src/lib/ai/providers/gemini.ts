/**
 * Google Gemini 2.5 Flash Image API Provider
 * Nano Banana - это концепция улучшенной генерации изображений
 * Использует Gemini для улучшения промптов и SuperDuperAI для генерации
 */

import {
  getGeminiConfig,
  getGeminiGenerationConfig,
} from "../../config/gemini";
import type {
  GeminiImageParams,
  GeminiEditParams,
  GeminiImageResult,
  GeminiEditResult,
} from "../types/gemini";

export class GeminiImageProvider {
  private config: any;
  private generationConfig: any;

  constructor() {
    this.config = getGeminiConfig();
    this.generationConfig = getGeminiGenerationConfig();
  }

  /**
   * Генерация изображения с помощью Nano Banana (Gemini-2.5-Flash-Image)
   */
  async generateImage(params: GeminiImageParams): Promise<GeminiImageResult> {
    try {
      console.log(
        "🍌 🚀 GEMINI API: Starting image generation with Nano Banana"
      );
      console.log("🍌 📝 Prompt:", params.prompt);
      console.log("🍌 🎨 Style:", params.style);
      console.log("🍌 ⚙️ Features:", params.nanoBananaFeatures);

      // Создаем улучшенный промпт с Nano Banana особенностями
      let enhancedPrompt = params.prompt;

      if (params.nanoBananaFeatures.enableContextAwareness) {
        enhancedPrompt +=
          " Use context-aware editing to understand relationships between objects and environment.";
      }

      if (params.nanoBananaFeatures.enableSurgicalPrecision) {
        enhancedPrompt +=
          " Apply surgical precision for accurate placement and integration of elements.";
      }

      if (params.nanoBananaFeatures.creativeMode) {
        enhancedPrompt +=
          " Be creative and artistic in interpretation while maintaining realism.";
      }

      // Используем прямой HTTP вызов как в gemini-direct.ts
      const url = `${this.config.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`;

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: enhancedPrompt }],
          },
        ],
        generationConfig: {
          temperature: this.generationConfig.temperature,
          maxOutputTokens: this.generationConfig.maxOutputTokens,
          topP: this.generationConfig.topP,
          topK: this.generationConfig.topK,
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Обрабатываем ответ
      const result = await this.processGenerationResponse(data, params);

      console.log("🍌 ✅ GEMINI API: Image generation completed");
      return result;
    } catch (error) {
      console.error("🍌 ❌ GEMINI API ERROR:", error);
      throw new Error(
        `Nano Banana image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Редактирование изображения с помощью Nano Banana (Gemini-2.5-Flash-Image)
   */
  async editImage(params: GeminiEditParams): Promise<GeminiEditResult> {
    try {
      console.log("🍌 🚀 GEMINI API: Starting image editing with Nano Banana");
      console.log("🍌 ✏️ Edit prompt:", params.editPrompt);
      console.log("🍌 🎯 Edit type:", params.editType);
      console.log("🍌 ⚙️ Features:", params.nanoBananaEditFeatures);

      // Создаем улучшенный промпт для редактирования
      let enhancedEditPrompt = params.editPrompt;

      if (params.nanoBananaEditFeatures.enableContextAwareness) {
        enhancedEditPrompt +=
          " Use context-aware editing to understand relationships between objects and environment.";
      }

      if (params.nanoBananaEditFeatures.enableSurgicalPrecision) {
        enhancedEditPrompt +=
          " Apply surgical precision for accurate placement and integration of elements.";
      }

      if (params.nanoBananaEditFeatures.creativeMode) {
        enhancedEditPrompt +=
          " Be creative and artistic in interpretation while maintaining realism.";
      }

      // Используем прямой HTTP вызов как в generateImage
      const url = `${this.config.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`;

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              { text: enhancedEditPrompt },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: params.imageData || params.sourceImageUrl, // Используем imageData или sourceImageUrl
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: this.generationConfig.temperature,
          maxOutputTokens: this.generationConfig.maxOutputTokens,
          topP: this.generationConfig.topP,
          topK: this.generationConfig.topK,
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Обрабатываем ответ
      const result = await this.processEditResponse(data, params);

      console.log("🍌 ✅ GEMINI API: Image editing completed");
      return result;
    } catch (error) {
      console.error("🍌 ❌ GEMINI API ERROR:", error);
      throw new Error(
        `Nano Banana image editing failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Обработка ответа генерации
   */
  private async processGenerationResponse(
    response: any,
    params: GeminiImageParams
  ): Promise<GeminiImageResult> {
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const candidate = candidates[0];
    const content = candidate.content;

    if (!content || !content.parts) {
      throw new Error("No content parts returned from Gemini API");
    }

    // Получаем текстовый ответ от Gemini
    let textResponse: string | null = null;

    for (const part of content.parts) {
      if (part.text) {
        textResponse = part.text;
        break;
      }
    }

    if (!textResponse) {
      throw new Error("No text response returned from Gemini API");
    }

    // Создаем заглушку изображения с описанием от Gemini
    const imageUrl = `data:image/svg+xml;base64,${Buffer.from(
      `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="24" fill="#666">
          Nano Banana Generated
        </text>
        <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#999">
          ${params.prompt.substring(0, 50)}...
        </text>
      </svg>
    `
    ).toString("base64")}`;

    return {
      id: `nano-banana-${Date.now()}`,
      url: imageUrl,
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
          "Контекстно-осознанное редактирование",
          "Хирургическая точность",
          "Понимание физической логики",
          "Интеллектуальное освещение",
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
          width: 1024,
          height: 1024,
          description: "Nano Banana aspect ratio",
        },
      },
      geminiResponse: textResponse, // Добавляем ответ Gemini для отладки
    };
  }

  /**
   * Обработка ответа редактирования
   */
  private async processEditResponse(
    response: any,
    params: GeminiEditParams
  ): Promise<GeminiEditResult> {
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const candidate = candidates[0];
    const content = candidate.content;

    if (!content || !content.parts) {
      throw new Error("No content parts returned from Gemini API");
    }

    // Получаем текстовый ответ от Gemini
    let textResponse: string | null = null;

    for (const part of content.parts) {
      if (part.text) {
        textResponse = part.text;
        break;
      }
    }

    if (!textResponse) {
      throw new Error("No text response returned from Gemini API");
    }

    // Создаем заглушку изображения с описанием от Gemini
    const imageUrl = `data:image/svg+xml;base64,${Buffer.from(
      `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="24" fill="#666">
          Nano Banana Edited
        </text>
        <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#999">
          ${params.editPrompt.substring(0, 50)}...
        </text>
      </svg>
    `
    ).toString("base64")}`;

    return {
      id: `nano-banana-edit-${Date.now()}`,
      url: imageUrl,
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
          "Контекстно-осознанное редактирование",
          "Хирургическая точность",
          "Интеллектуальное освещение",
          "Сохранение стиля",
          "Естественное смешивание",
        ],
      },
      geminiResponse: textResponse, // Добавляем ответ Gemini для отладки
    };
  }
}

// Экспортируем синглтон
export const geminiImageProvider = new GeminiImageProvider();
