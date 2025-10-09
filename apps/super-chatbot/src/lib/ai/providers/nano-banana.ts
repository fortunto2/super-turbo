/**
 * Nano Banana Image Provider
 * Временная заглушка - возвращает успешный ответ с placeholder изображением
 * TODO: Интегрировать с настоящим Gemini-2.5-Flash-Image API когда получим правильный ключ
 */

import type {
  GeminiImageParams,
  GeminiEditParams,
  GeminiImageResult,
  GeminiEditResult,
} from '../types/gemini';
import { callGeminiDirect } from '../gemini-direct';

export class NanoBananaProvider {
  /**
   * Генерация изображения с помощью Nano Banana (заглушка)
   * TODO: Заменить на реальный вызов Gemini-2.5-Flash-Image API
   */
  async generateImage(
    params: GeminiImageParams,
    config?: any,
  ): Promise<GeminiImageResult> {
    console.log(
      '🍌 🚀 NANO BANANA: Generating image with enhanced prompt (placeholder mode)',
    );
    console.log('🍌 📝 Original Prompt:', params.prompt);
    console.log('🍌 🎨 Style:', params.style);
    console.log('🍌 ⚙️ Features:', params.nanoBananaFeatures);

    // Улучшаем промпт с Nano Banana особенностями
    const enhancedPrompt = this.enhancePrompt(params);

    console.log('🍌 ✨ Enhanced Prompt:', enhancedPrompt);

    // Получаем размеры из aspectRatio
    const dimensions = this.getAspectRatioDimensions(params.aspectRatio);

    // Пытаемся сгенерировать реальное изображение через Gemini 2.5 Flash Image (Vertex AI)
    let generatedImageUrl: string | null = null;
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY || '';
      if (apiKey) {
        const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
        const requestBody = {
          contents: [
            {
              role: 'user',
              parts: [{ text: enhancedPrompt }],
            },
          ],
          // Явно просим изображение в ответе
          responseModalities: ['IMAGE'],
          generationConfig: {
            temperature: 0.4,
            topP: 0.8,
            topK: 40,
            // Для image токены не критичны, оставим по-умолчанию
          },
        } as any;

        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!resp.ok) {
          const errorText = await resp.text();
          throw new Error(
            `Gemini Image API error: ${resp.status} - ${errorText}`,
          );
        }

        const data: any = await resp.json();
        // Ищем бинарные данные изображения
        const candidates = data?.candidates || [];
        for (const c of candidates) {
          const parts = c?.content?.parts || [];
          for (const part of parts) {
            const inline = part?.inlineData;
            if (inline?.data && inline?.mimeType?.startsWith('image/')) {
              generatedImageUrl = `data:${inline.mimeType};base64,${inline.data}`;
              break;
            }
          }
          if (generatedImageUrl) break;
        }
      } else {
        console.warn(
          '⚠️ GOOGLE_AI_API_KEY is not configured; skipping Gemini image call',
        );
      }
    } catch (e) {
      console.warn(
        '⚠️ Gemini image generation failed, will fallback to placeholder',
        e,
      );
    }

    // Если реальное изображение не удалось получить, создаём placeholder
    const placeholderImage =
      generatedImageUrl ||
      this.createPlaceholderImage(
        enhancedPrompt,
        dimensions.width,
        dimensions.height,
        params.style,
      );

    const result: GeminiImageResult = {
      id: `nano-banana-${Date.now()}`,
      url: placeholderImage,
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
        model: 'gemini-2.5-flash-image',
        capabilities: [
          'Контекстно-осознанное редактирование',
          'Хирургическая точность',
          'Понимание физической логики',
          'Интеллектуальное освещение',
        ],
        style: {
          id: params.style,
          label: params.style,
          description: 'Nano Banana style',
        },
        quality: {
          id: params.quality,
          label: params.quality,
          multiplier: 1.0,
          description: 'Nano Banana quality',
        },
        aspectRatio: {
          id: params.aspectRatio,
          label: params.aspectRatio,
          width: dimensions.width,
          height: dimensions.height,
          description: 'Nano Banana aspect ratio',
        },
      },
      geminiResponse: enhancedPrompt,
    };

    // Параллельно запрашиваем ответ у Gemini 2.5 Flash Lite через Vertex AI (текстовая часть)
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY || '';
      if (apiKey) {
        const geminiText = await callGeminiDirect(
          [
            {
              role: 'user',
              parts: [
                {
                  text: `Summarize this image generation request in one sentence and list 3 key visual requirements:\n\n${enhancedPrompt}`,
                },
              ],
            },
          ],
          apiKey,
          { temperature: 0.6, maxTokens: 256 },
        );
        result.geminiResponse = geminiText || enhancedPrompt;
      } else {
        console.warn(
          '⚠️ GOOGLE_AI_API_KEY is not configured; skipping Gemini direct call',
        );
      }
    } catch (err) {
      console.warn(
        '⚠️ Gemini direct call failed, using enhanced prompt only',
        err,
      );
    }

    console.log(
      '🍌 ✅ NANO BANANA: Image generated (placeholder + Gemini text)',
    );
    return result;
  }

  /**
   * Редактирование изображения с помощью Nano Banana (заглушка)
   * TODO: Заменить на реальный вызов Gemini-2.5-Flash-Image API
   */
  async editImage(
    params: GeminiEditParams,
    config?: any,
  ): Promise<GeminiEditResult> {
    console.log('🍌 🚀 NANO BANANA: Editing image with real Gemini API');

    const enhancedEditPrompt = this.enhanceEditPrompt(params);
    console.log('🍌 ✨ Enhanced Edit Prompt:', enhancedEditPrompt);

    let editedImageUrl: string | null = null;

    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY || '';
      if (!apiKey) {
        throw new Error('GOOGLE_AI_API_KEY is not set');
      }

      const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: enhancedEditPrompt },
              {
                inlineData: {
                  mimeType: 'image/png',
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Gemini edit API error: ${response.status} - ${errorText}`,
        );
      }

      const resultData = await response.json();

      const candidates = resultData?.candidates || [];
      for (const c of candidates) {
        const parts = c?.content?.parts || [];
        for (const part of parts) {
          const inline = part?.inlineData;
          if (inline?.data && inline?.mimeType?.startsWith('image/')) {
            editedImageUrl = `data:${inline.mimeType};base64,${inline.data}`;
            break;
          }
        }
        if (editedImageUrl) break;
      }

      if (!editedImageUrl) {
        throw new Error('No image returned from Gemini API');
      }
    } catch (error) {
      console.error('❌ Gemini image edit error:', error);

      return {
        id: `nano-banana-edit-${Date.now()}`,
        url: this.createPlaceholderImage(
          `Error: ${enhancedEditPrompt}`,
          1024,
          1024,
          'realistic',
        ),
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
          model: 'gemini-2.5-flash-image',
          editType: {
            id: params.editType,
            label: params.editType,
            description: 'Nano Banana edit type',
          },
          precisionLevel: {
            id: params.precisionLevel,
            label: params.precisionLevel,
            description: 'Nano Banana precision level',
          },
          blendMode: {
            id: params.blendMode,
            label: params.blendMode,
            description: 'Nano Banana blend mode',
          },
          capabilities: [
            'Контекстно-осознанное редактирование',
            'Хирургическая точность',
            'Интеллектуальное освещение',
            'Сохранение стиля',
            'Естественное смешивание',
          ],
        },
      };
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
        model: 'gemini-2.5-flash-image',
        editType: {
          id: params.editType,
          label: params.editType,
          description: 'Nano Banana edit type',
        },
        precisionLevel: {
          id: params.precisionLevel,
          label: params.precisionLevel,
          description: 'Nano Banana precision level',
        },
        blendMode: {
          id: params.blendMode,
          label: params.blendMode,
          description: 'Nano Banana blend mode',
        },
        capabilities: [
          'Контекстно-осознанное редактирование',
          'Хирургическая точность',
          'Интеллектуальное освещение',
          'Сохранение стиля',
          'Естественное смешивание',
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
      enhanced += ', context-aware editing for natural object relationships';
    }

    if (params.nanoBananaFeatures.enableSurgicalPrecision) {
      enhanced += ', surgical precision in placement and integration';
    }

    if (params.nanoBananaFeatures.creativeMode) {
      enhanced +=
        ', creative and artistic interpretation while maintaining realism';
    }

    enhanced += `, ${params.style} style, ${params.quality} quality`;
    enhanced +=
      ', intelligent lighting and reflections, perfect occlusion handling';

    return enhanced;
  }

  /**
   * Улучшение промпта для редактирования
   */
  private enhanceEditPrompt(params: GeminiEditParams): string {
    let enhanced = params.editPrompt;

    if (params.nanoBananaEditFeatures.enableContextAwareness) {
      enhanced += ', maintain relationships between objects and environment';
    }

    if (params.nanoBananaEditFeatures.enableSurgicalPrecision) {
      enhanced += ', surgical precision for accurate editing';
    }

    if (params.nanoBananaEditFeatures.preserveOriginalStyle) {
      enhanced += ', preserve the original style and aesthetic';
    }

    if (params.nanoBananaEditFeatures.enhanceLighting) {
      enhanced += ', enhance lighting naturally';
    }

    if (params.nanoBananaEditFeatures.preserveShadows) {
      enhanced += ', preserve realistic shadows and reflections';
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
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1024, height: 576 },
      '9:16': { width: 576, height: 1024 },
      '4:3': { width: 1024, height: 768 },
      '3:4': { width: 768, height: 1024 },
      '21:9': { width: 1024, height: 439 },
    };

    return ratios[aspectRatio] || { width: 1024, height: 1024 };
  }

  /**
   * Создание красивого placeholder изображения
   */
  private createPlaceholderImage(
    prompt: string,
    width: number,
    height: number,
    style: string,
  ): string {
    // Цветовые схемы для разных стилей
    const styleColors: Record<
      string,
      { bg: string; primary: string; text: string }
    > = {
      realistic: { bg: '#f5f5f5', primary: '#4a90e2', text: '#333' },
      photorealistic: { bg: '#fafafa', primary: '#3b82f6', text: '#1f2937' },
      cinematic: { bg: '#1a1a2e', primary: '#ff6b6b', text: '#eee' },
      anime: { bg: '#fff0f5', primary: '#ff69b4', text: '#444' },
      cartoon: { bg: '#ffebcd', primary: '#ff8c00', text: '#333' },
      artistic: { bg: '#f0e6ff', primary: '#9c27b0', text: '#4a148c' },
      fantasy: { bg: '#e6f3ff', primary: '#6a5acd', text: '#2c1a4d' },
      'sci-fi': { bg: '#001a33', primary: '#00ffff', text: '#b3ecff' },
    };

    const colors = styleColors[style] || styleColors.realistic;

    // Обрезаем промпт для отображения
    const displayPrompt =
      prompt.length > 100 ? `${prompt.substring(0, 100)}...` : prompt;

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors?.bg};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors?.primary};stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        
        <!-- Декоративные элементы -->
        <circle cx="10%" cy="10%" r="30" fill="${colors?.primary}" opacity="0.1"/>
            <circle cx="90%" cy="90%" r="40" fill="${colors?.primary}" opacity="0.15"/>
        <circle cx="80%" cy="20%" r="25" fill="${colors?.primary}" opacity="0.1"/>
        
        <!-- Иконка Nano Banana -->
        <text x="50%" y="35%" text-anchor="middle" font-size="60" fill="${colors?.primary}">🍌</text>
        
        <!-- Заголовок -->
        <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="${colors?.text}">
          Nano Banana Generated
        </text>
        
        <!-- Промпт -->
        <text x="50%" y="52%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${colors?.text}" opacity="0.7">
          ${displayPrompt.substring(0, 50)}
        </text>
        <text x="50%" y="56%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${colors?.text}" opacity="0.7">
          ${displayPrompt.substring(50, 100)}
        </text>
        
        <!-- Стиль и размер -->
        <text x="50%" y="65%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${colors?.primary}">
          Style: ${style} • ${width}x${height}
        </text>
        
        <!-- Сообщение -->
        <text x="50%" y="75%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="${colors?.text}" opacity="0.5">
          Placeholder - Waiting for Gemini-2.5-Flash-Image API key
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  private async fetchImageAsBase64(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch source image: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  }
}

// Экспортируем синглтон
export const nanoBananaProvider = new NanoBananaProvider();
