import { tool, generateText } from "ai";
import { z } from "zod";
import { myProvider } from "../providers";

// Специфичные для Nano Banana техники промптинга
const NANO_BANANA_TECHNIQUES = [
  {
    id: "context-awareness",
    label: "Контекстная осведомленность",
    description: "Использование контекстно-осознанных описаний",
    keywords: ["context-aware", "intelligent", "understanding", "relationship"],
  },
  {
    id: "surgical-precision",
    label: "Хирургическая точность",
    description: "Точные описания для хирургического редактирования",
    keywords: ["precise", "exact", "surgical", "detailed", "specific"],
  },
  {
    id: "physical-logic",
    label: "Физическая логика",
    description: "Описание физических свойств и логики сцены",
    keywords: ["physics", "realistic", "logical", "natural", "believable"],
  },
  {
    id: "lighting-mastery",
    label: "Мастерство освещения",
    description: "Детальное описание освещения и теней",
    keywords: [
      "lighting",
      "shadows",
      "reflections",
      "illumination",
      "atmosphere",
    ],
  },
  {
    id: "composition-expertise",
    label: "Экспертиза композиции",
    description: "Профессиональные принципы композиции",
    keywords: [
      "composition",
      "framing",
      "rule of thirds",
      "balance",
      "harmony",
    ],
  },
  {
    id: "creative-partnership",
    label: "Творческое партнерство",
    description: "Поощрение творческой интерпретации",
    keywords: ["creative", "artistic", "unique", "inspired", "visionary"],
  },
] as const;

// Стили Nano Banana
const NANO_BANANA_STYLES = [
  {
    id: "realistic",
    label: "Реалистичный",
    prompt: "photorealistic, high resolution, detailed, sharp focus",
  },
  {
    id: "cinematic",
    label: "Кинематографический",
    prompt:
      "cinematic, dramatic lighting, professional cinematography, movie quality",
  },
  {
    id: "artistic",
    label: "Художественный",
    prompt: "artistic, creative interpretation, unique perspective, inspired",
  },
  {
    id: "minimalist",
    label: "Минималистичный",
    prompt: "minimalist, clean, simple, elegant, uncluttered",
  },
  {
    id: "dramatic",
    label: "Драматичный",
    prompt: "dramatic, intense, powerful, striking, bold",
  },
  {
    id: "soft",
    label: "Мягкий",
    prompt: "soft, gentle, delicate, subtle, tender",
  },
  {
    id: "vibrant",
    label: "Яркий",
    prompt: "vibrant, colorful, energetic, lively, dynamic",
  },
  {
    id: "moody",
    label: "Настроенческий",
    prompt: "moody, atmospheric, emotional, evocative, contemplative",
  },
] as const;

// Качественные дескрипторы для Nano Banana
const NANO_BANANA_QUALITY_DESCRIPTORS = [
  "masterpiece quality",
  "award-winning",
  "professional photography",
  "high resolution",
  "sharp focus",
  "excellent composition",
  "perfect lighting",
  "stunning detail",
  "breathtaking",
  "exceptional",
  "outstanding",
  "remarkable",
  "extraordinary",
  "magnificent",
  "spectacular",
] as const;

// Технические термины для Nano Banana
const NANO_BANANA_TECHNICAL_TERMS = [
  "context-aware editing",
  "surgical precision",
  "intelligent lighting",
  "physical accuracy",
  "seamless integration",
  "natural shadows",
  "realistic reflections",
  "perfect occlusion",
  "intelligent composition",
  "creative interpretation",
] as const;

export const nanoBananaPromptEnhancer = tool({
  description:
    "Специализированный улучшитель промптов для Gemini-2.5-Flash-Image (Nano Banana). Оптимизирует промпты с учетом уникальных возможностей Nano Banana: контекстно-осознанное редактирование, хирургическая точность и понимание физической логики.",
  parameters: z.object({
    originalPrompt: z
      .string()
      .describe(
        "Исходный промпт для улучшения. Может быть на любом языке, простым или сложным."
      ),
    enhancementTechnique: z
      .enum(NANO_BANANA_TECHNIQUES.map((t) => t.id) as [string, ...string[]])
      .optional()
      .describe(
        "Специфичная техника улучшения для Nano Banana. Если не указана, будет применена комбинация техник."
      ),
    targetStyle: z
      .enum(NANO_BANANA_STYLES.map((s) => s.id) as [string, ...string[]])
      .optional()
      .describe("Целевой стиль для оптимизации промпта."),
    includeTechnicalTerms: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        "Включить технические термины Nano Banana в улучшенный промпт."
      ),
    includeQualityDescriptors: z
      .boolean()
      .optional()
      .default(true)
      .describe("Включить качественные дескрипторы для лучшего результата."),
    enhanceForEditing: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Оптимизировать промпт для редактирования существующих изображений."
      ),
    creativeMode: z
      .boolean()
      .optional()
      .default(false)
      .describe("Включить творческий режим для более креативных результатов."),
    preserveOriginalIntent: z
      .boolean()
      .optional()
      .default(true)
      .describe("Сохранить оригинальный замысел и основные элементы промпта."),
    customInstructions: z
      .string()
      .optional()
      .describe("Дополнительные инструкции для улучшения промпта."),
  }),
  execute: async ({
    originalPrompt,
    enhancementTechnique,
    targetStyle,
    includeTechnicalTerms,
    includeQualityDescriptors,
    enhanceForEditing,
    creativeMode,
    preserveOriginalIntent,
    customInstructions,
  }) => {
    console.log("🍌 nanoBananaPromptEnhancer called with:", {
      originalPrompt,
      enhancementTechnique,
      targetStyle,
      includeTechnicalTerms,
      includeQualityDescriptors,
      enhanceForEditing,
      creativeMode,
    });

    try {
      // Строим системный промпт для Nano Banana
      const systemPrompt = buildNanoBananaSystemPrompt(
        enhancementTechnique,
        targetStyle,
        includeTechnicalTerms,
        includeQualityDescriptors,
        enhanceForEditing,
        creativeMode,
        customInstructions
      );

      // Строим пользовательский промпт
      const userPrompt = buildNanoBananaUserPrompt(
        originalPrompt,
        enhancementTechnique,
        targetStyle,
        enhanceForEditing,
        creativeMode,
        customInstructions
      );

      console.log("🔄 Calling LLM for Nano Banana prompt enhancement...");

      const result = await generateText({
        model: myProvider.languageModel("artifact-model"),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: creativeMode ? 0.8 : 0.7,
        maxTokens: 1200,
      });

      console.log("✅ LLM response received:", result.text);

      // Парсим результат улучшения
      const parsedResult = parseNanoBananaEnhancementResult(
        result.text,
        originalPrompt
      );

      // Получаем информацию о примененных техниках
      const appliedTechniques = getAppliedTechniques(
        enhancementTechnique,
        targetStyle,
        includeTechnicalTerms,
        includeQualityDescriptors,
        enhanceForEditing,
        creativeMode
      );

      return {
        originalPrompt,
        enhancedPrompt: parsedResult.enhancedPrompt,
        negativePrompt: parsedResult.negativePrompt,
        appliedTechniques,
        nanoBananaOptimizations: parsedResult.nanoBananaOptimizations,
        style: targetStyle
          ? NANO_BANANA_STYLES.find((s) => s.id === targetStyle)
          : null,
        enhancementLevel: parsedResult.enhancementLevel,
        reasoning: parsedResult.reasoning,
        usage: {
          copyPrompt:
            "Скопируйте улучшенный промпт для использования в Nano Banana",
          negativePrompt: parsedResult.negativePrompt
            ? "Используйте негативный промпт для избежания нежелательных элементов"
            : undefined,
          techniques: appliedTechniques.map((t) => t.description),
        },
        metadata: {
          model: "gemini-2.5-flash-image",
          capabilities: [
            "Контекстно-осознанное редактирование",
            "Хирургическая точность",
            "Понимание физической логики",
            "Интеллектуальное освещение",
            "Творческое партнерство",
          ],
          techniques: NANO_BANANA_TECHNIQUES,
          styles: NANO_BANANA_STYLES,
        },
      };
    } catch (error) {
      console.error("❌ Error in Nano Banana prompt enhancement:", error);
      return {
        error: `Ошибка улучшения промпта Nano Banana: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        originalPrompt,
        enhancedPrompt: originalPrompt, // Возвращаем оригинал как fallback
        fallback: true,
        appliedTechniques: [],
      };
    }
  },
});

// Строит системный промпт для Nano Banana
function buildNanoBananaSystemPrompt(
  enhancementTechnique?: string,
  targetStyle?: string,
  includeTechnicalTerms?: boolean,
  includeQualityDescriptors?: boolean,
  enhanceForEditing?: boolean,
  creativeMode?: boolean,
  customInstructions?: string
): string {
  const basePrompt = `You are a specialized prompt engineering expert for Gemini-2.5-Flash-Image (Nano Banana), Google's revolutionary AI image generation and editing model.

NANO BANANA UNIQUE CAPABILITIES:
- Context-Aware Editing: Understands relationships between people and environments
- Surgical Precision: Adds or replaces items with extreme precision
- Physical Logic Understanding: Comprehends lighting, physics, and scene logic
- Intelligent Lighting: Automatically adjusts lighting and reflections
- Creative Partnership: Goes beyond passive execution to creative collaboration

CORE RESPONSIBILITIES:
1. Translate non-English text to English while preserving meaning
2. Apply Nano Banana-specific prompt engineering techniques
3. Optimize for context-aware editing and surgical precision
4. Structure prompts for maximum effectiveness with Nano Banana
5. Leverage Nano Banana's unique understanding of physical logic

ENHANCEMENT PRINCIPLES:
- Preserve original creative intent and core elements
- Add context-aware descriptions that Nano Banana can understand
- Include physical logic and lighting details
- Use surgical precision terminology for editing tasks
- Encourage creative interpretation when appropriate
- Maintain realistic and believable scenarios`;

  let techniqueGuidance = "";
  if (enhancementTechnique) {
    const technique = NANO_BANANA_TECHNIQUES.find(
      (t) => t.id === enhancementTechnique
    );
    if (technique) {
      techniqueGuidance = `
SPECIFIC TECHNIQUE: ${technique.label}
${technique.description}
Keywords to emphasize: ${technique.keywords.join(", ")}`;
    }
  } else {
    techniqueGuidance = `
APPLY MULTIPLE TECHNIQUES:
- Context-Aware Editing: Use relationship and environment descriptions
- Surgical Precision: Be specific and detailed about changes
- Physical Logic: Include realistic physics and lighting
- Lighting Mastery: Describe lighting, shadows, and reflections
- Composition Expertise: Apply professional composition principles
- Creative Partnership: Encourage artistic interpretation`;
  }

  let styleGuidance = "";
  if (targetStyle) {
    const style = NANO_BANANA_STYLES.find((s) => s.id === targetStyle);
    if (style) {
      styleGuidance = `
TARGET STYLE: ${style.label}
Apply these style descriptors: ${style.prompt}`;
    }
  }

  let technicalGuidance = "";
  if (includeTechnicalTerms) {
    technicalGuidance = `
INCLUDE NANO BANANA TECHNICAL TERMS:
${NANO_BANANA_TECHNICAL_TERMS.join(", ")}`;
  }

  let qualityGuidance = "";
  if (includeQualityDescriptors) {
    qualityGuidance = `
INCLUDE QUALITY DESCRIPTORS:
${NANO_BANANA_QUALITY_DESCRIPTORS.join(", ")}`;
  }

  let editingGuidance = "";
  if (enhanceForEditing) {
    editingGuidance = `
EDITING OPTIMIZATION:
- Focus on specific changes and modifications
- Use surgical precision terminology
- Include context-aware editing descriptions
- Emphasize seamless integration
- Describe physical accuracy requirements`;
  }

  let creativeGuidance = "";
  if (creativeMode) {
    creativeGuidance = `
CREATIVE MODE:
- Encourage artistic interpretation
- Use inspiring and visionary language
- Allow for unique perspectives
- Emphasize creative partnership with AI`;
  }

  let customGuidance = "";
  if (customInstructions) {
    customGuidance = `
CUSTOM INSTRUCTIONS:
${customInstructions}`;
  }

  return `${basePrompt}

${techniqueGuidance}
${styleGuidance}
${technicalGuidance}
${qualityGuidance}
${editingGuidance}
${creativeGuidance}
${customGuidance}

OUTPUT FORMAT:
Provide your response as a JSON object with these fields:
{
  "enhancedPrompt": "the improved prompt optimized for Nano Banana",
  "negativePrompt": "what to avoid (if applicable)",
  "nanoBananaOptimizations": ["list of Nano Banana-specific optimizations applied"],
  "enhancementLevel": "basic|detailed|creative",
  "reasoning": "brief explanation of enhancement strategy for Nano Banana"
}`;
}

// Строит пользовательский промпт
function buildNanoBananaUserPrompt(
  originalPrompt: string,
  enhancementTechnique?: string,
  targetStyle?: string,
  enhanceForEditing?: boolean,
  creativeMode?: boolean,
  customInstructions?: string
): string {
  let prompt = `Please enhance this prompt for Nano Banana (Gemini-2.5-Flash-Image):

ORIGINAL PROMPT: "${originalPrompt}"

REQUIREMENTS:
- Optimize for Nano Banana's unique capabilities
- Preserve original creative intent`;

  if (enhancementTechnique) {
    const technique = NANO_BANANA_TECHNIQUES.find(
      (t) => t.id === enhancementTechnique
    );
    if (technique) {
      prompt += `\n- Apply ${technique.label} technique: ${technique.description}`;
    }
  }

  if (targetStyle) {
    const style = NANO_BANANA_STYLES.find((s) => s.id === targetStyle);
    if (style) {
      prompt += `\n- Target style: ${style.label}`;
    }
  }

  if (enhanceForEditing) {
    prompt += `\n- Optimize for image editing tasks`;
  }

  if (creativeMode) {
    prompt += `\n- Enable creative mode for artistic interpretation`;
  }

  if (customInstructions) {
    prompt += `\n- Custom instructions: ${customInstructions}`;
  }

  prompt += `\n\nPlease enhance this prompt following Nano Banana's unique capabilities and prompt engineering best practices.`;

  return prompt;
}

// Парсит результат улучшения
function parseNanoBananaEnhancementResult(
  llmResponse: string,
  originalPrompt: string
) {
  try {
    // Пытаемся парсить как JSON
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        enhancedPrompt: parsed.enhancedPrompt || originalPrompt,
        negativePrompt: parsed.negativePrompt || undefined,
        nanoBananaOptimizations: parsed.nanoBananaOptimizations || [
          "Nano Banana optimization applied",
        ],
        enhancementLevel: parsed.enhancementLevel || "detailed",
        reasoning:
          parsed.reasoning || "Enhanced using Nano Banana-specific techniques",
      };
    }

    // Fallback: извлекаем улучшенный промпт из текста
    const lines = llmResponse.split("\n").filter((line) => line.trim());
    let enhancedPrompt = originalPrompt;

    // Ищем индикаторы улучшенного промпта
    for (const line of lines) {
      if (
        line.toLowerCase().includes("enhanced") ||
        line.toLowerCase().includes("improved") ||
        line.toLowerCase().includes("prompt:")
      ) {
        const promptText = line.replace(/^[^:]*:?\s*/, "").trim();
        if (promptText.length > 10) {
          enhancedPrompt = promptText;
          break;
        }
      }
    }

    return {
      enhancedPrompt,
      negativePrompt: undefined,
      nanoBananaOptimizations: ["Nano Banana optimization applied"],
      enhancementLevel: "detailed",
      reasoning: "Enhanced using Nano Banana-specific techniques",
    };
  } catch (error) {
    console.error("Failed to parse LLM response:", error);
    return {
      enhancedPrompt: originalPrompt,
      negativePrompt: undefined,
      nanoBananaOptimizations: ["Enhancement failed, returned original"],
      enhancementLevel: "basic",
      reasoning: "Error in processing enhancement",
    };
  }
}

// Получает примененные техники
function getAppliedTechniques(
  enhancementTechnique?: string,
  targetStyle?: string,
  includeTechnicalTerms?: boolean,
  includeQualityDescriptors?: boolean,
  enhanceForEditing?: boolean,
  creativeMode?: boolean
) {
  const techniques = [];

  if (enhancementTechnique) {
    const technique = NANO_BANANA_TECHNIQUES.find(
      (t) => t.id === enhancementTechnique
    );
    if (technique) {
      techniques.push(technique);
    }
  } else {
    // Применяем все основные техники
    techniques.push(
      NANO_BANANA_TECHNIQUES[0], // context-awareness
      NANO_BANANA_TECHNIQUES[1], // surgical-precision
      NANO_BANANA_TECHNIQUES[2] // physical-logic
    );
  }

  if (targetStyle) {
    const style = NANO_BANANA_STYLES.find((s) => s.id === targetStyle);
    if (style) {
      techniques.push({
        id: "style-optimization",
        label: "Оптимизация стиля",
        description: `Применен стиль: ${style.label}`,
        keywords: style.prompt.split(", "),
      });
    }
  }

  if (includeTechnicalTerms) {
    techniques.push({
      id: "technical-terms",
      label: "Технические термины",
      description: "Добавлены технические термины Nano Banana",
      keywords: NANO_BANANA_TECHNICAL_TERMS,
    });
  }

  if (includeQualityDescriptors) {
    techniques.push({
      id: "quality-descriptors",
      label: "Качественные дескрипторы",
      description: "Добавлены качественные дескрипторы",
      keywords: NANO_BANANA_QUALITY_DESCRIPTORS,
    });
  }

  if (enhanceForEditing) {
    techniques.push({
      id: "editing-optimization",
      label: "Оптимизация для редактирования",
      description: "Оптимизировано для задач редактирования изображений",
      keywords: [
        "editing",
        "modification",
        "surgical precision",
        "seamless integration",
      ],
    });
  }

  if (creativeMode) {
    techniques.push({
      id: "creative-mode",
      label: "Творческий режим",
      description: "Включен творческий режим для художественной интерпретации",
      keywords: ["creative", "artistic", "inspired", "visionary"],
    });
  }

  return techniques;
}
