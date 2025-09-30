import { tool, generateText, generateObject } from "ai";
import { z } from "zod";
import { myProvider } from "../providers";
import { createAzure } from "@ai-sdk/azure";

// Initialize Azure provider for VEO3
const resourceName = process.env.AZURE_OPENAI_RESOURCE_NAME;
const apiKey = process.env.AZURE_OPENAI_API_KEY;

if (!resourceName || !apiKey) {
  throw new Error("Azure OpenAI configuration is missing");
}

const azure = createAzure({
  resourceName,
  apiKey,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview",
});

// VEO3 Model configuration
const VEO3_MODEL_CONFIG = {
  "gpt-4.1": {
    name: "GPT-4.1",
    deploymentName: "gpt-4.1",
    maxChars: { short: 500, medium: 1000, long: 2000 },
    maxTokens: { short: 150, medium: 300, long: 600 },
    supportsSystem: true,
    isReasoning: false,
    type: "chat",
  },
} as const;

// VEO3 Schema types
type BaseVEO3Schema = {
  scene_description: z.ZodString;
  visual_style: z.ZodString;
  camera_movement: z.ZodString;
  main_subject: z.ZodString;
  background_setting: z.ZodString;
  lighting_mood: z.ZodString;
  color_palette: z.ZodString;
};

type ExtendedVEO3Schema = BaseVEO3Schema & {
  audio_cue?: z.ZodString;
  character_speech?: z.ZodOptional<
    z.ZodArray<
      z.ZodObject<{
        character_name: z.ZodString;
        dialogue: z.ZodString;
        language: z.ZodOptional<z.ZodString>;
      }>
    >
  >;
  character_details?: z.ZodOptional<z.ZodString>;
  action_sequence?: z.ZodOptional<z.ZodString>;
  cinematography_notes?: z.ZodOptional<z.ZodString>;
  safety_compliance?: z.ZodOptional<z.ZodString>;
  total_character_count: z.ZodNumber;
  focus_areas: z.ZodArray<z.ZodString>;
};

// Dynamic VEO3 schema builder
function createVEO3Schema(
  focusTypes: string[],
  includeAudio: boolean,
  hasCharacterSpeech: boolean
) {
  const baseSchema: ExtendedVEO3Schema = {
    scene_description: z
      .string()
      .describe(
        "Detailed description of the overall scene, what's happening, who's involved, and general atmosphere"
      ),
    visual_style: z
      .string()
      .describe(
        "Overall look and feel - specify if cinematic, realistic, animated, stylized, or surreal"
      ),
    camera_movement: z
      .string()
      .describe(
        "Specific camera movements - slow pan, static shot, tracking shot, aerial zoom, etc."
      ),
    main_subject: z
      .string()
      .describe(
        "Primary person, character, or object that should be the focus of the video"
      ),
    background_setting: z
      .string()
      .describe("Specific location or environment where scene takes place"),
    lighting_mood: z
      .string()
      .describe(
        "Type of lighting and emotional tone - golden hour, dramatic shadows, soft lighting, etc."
      ),
    color_palette: z
      .string()
      .describe(
        "Dominant colors or tones - bold, pastel, muted, monochrome, warm, cool, etc."
      ),
    total_character_count: z
      .number()
      .describe("Total character count of the enhanced prompt"),
    focus_areas: z
      .array(z.string())
      .describe("Applied focus types for this enhancement"),
  };

  if (includeAudio) {
    baseSchema.audio_cue = z
      .string()
      .describe(
        "Detailed sound design: character dialogue, ambient sounds, music, sound effects, voice characteristics"
      );
  }

  if (hasCharacterSpeech) {
    baseSchema.character_speech = z
      .array(
        z.object({
          character_name: z
            .string()
            .describe("Name or identifier of the character"),
          dialogue: z
            .string()
            .describe("Exact speech/dialogue in original language"),
          language: z
            .string()
            .optional()
            .describe("Language of the dialogue if specified"),
        })
      )
      .optional()
      .describe("Extracted character speech information for audio processing");
  }

  if (focusTypes.includes("character")) {
    baseSchema.character_details = z
      .string()
      .optional()
      .describe(
        "Additional character appearance, expressions, and personality details"
      );
  }

  if (focusTypes.includes("action")) {
    baseSchema.action_sequence = z
      .string()
      .optional()
      .describe(
        "Detailed breakdown of movements, timing, and dynamic interactions"
      );
  }

  if (focusTypes.includes("cinematic")) {
    baseSchema.cinematography_notes = z
      .string()
      .optional()
      .describe(
        "Professional filming techniques, composition, and visual effects"
      );
  }

  if (focusTypes.includes("safe")) {
    baseSchema.safety_compliance = z
      .string()
      .optional()
      .describe("Notes on content safety and family-friendly elements");
  }

  return z.object(baseSchema);
}

export const enhancePromptUnified = tool({
  description:
    "AI Prompt Enhancer that combines general prompt enhancement and VEO3-specific video prompt enhancement. Automatically translates text, applies prompt engineering best practices, and optimizes for specific media types and AI models. Supports both general enhancement mode and VEO3 structured video enhancement mode.",
  parameters: z.object({
    originalPrompt: z
      .string()
      .describe(
        "The original prompt text that needs enhancement. Can be in any language, simple or complex."
      ),
    mode: z
      .enum(["general", "veo3"])
      .describe(
        "Enhancement mode: general (for images/text) or veo3 (for structured video prompts)"
      ),

    // General mode parameters
    mediaType: z
      .enum(["image", "video", "text", "general"])
      .optional()
      .describe("The type of content being generated (for general mode)."),
    enhancementLevel: z
      .enum(["basic", "detailed", "creative"])
      .optional()
      .describe(
        "Level of enhancement for general mode: basic, detailed, or creative"
      ),
    targetAudience: z
      .string()
      .optional()
      .describe(
        'Target audience or use case (e.g., "professional presentation", "social media")'
      ),
    includeNegativePrompt: z
      .boolean()
      .optional()
      .describe("Whether to generate a negative prompt for what to avoid"),
    modelHint: z
      .string()
      .optional()
      .describe(
        "Specific AI model being used to optimize prompt for that model"
      ),

    // VEO3 mode parameters
    customLimit: z
      .number()
      .min(200)
      .max(10000)
      .optional()
      .describe("Character limit for VEO3 mode (default: 1000)"),
    focusType: z
      .string()
      .optional()
      .describe(
        "Focus types for VEO3 mode (comma-separated: character,action,cinematic,safe)"
      ),
    includeAudio: z
      .boolean()
      .optional()
      .describe("Include audio cues in VEO3 enhancement"),
    promptData: z
      .object({
        characters: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string(),
              speech: z.string(),
            })
          )
          .optional(),
        language: z.string().optional(),
      })
      .optional()
      .describe("Character data for VEO3 mode"),
    moodboard: z
      .object({
        images: z
          .array(
            z.object({
              id: z.string(),
              url: z.string().url().optional(),
              base64: z.string().optional(),
              tags: z.array(
                z.enum([
                  "character",
                  "style",
                  "background",
                  "lighting",
                  "mood",
                  "action",
                ])
              ),
              description: z.string().optional(),
              weight: z.number().min(0.1).max(1.0).default(1.0),
            })
          )
          .refine((images) => images.every((img) => img.url || img.base64), {
            message: "Each image must have either url or base64",
          }),
        enabled: z.boolean().default(false),
      })
      .optional()
      .describe("Moodboard images for VEO3 mode"),
  }),
  execute: async ({
    originalPrompt,
    mode = "general",
    // General mode parameters
    mediaType = "general",
    enhancementLevel = "detailed",
    targetAudience,
    includeNegativePrompt = false,
    modelHint,
    // VEO3 mode parameters
    customLimit = 1000,
    focusType,
    includeAudio = true,
    promptData,
    moodboard,
  }) => {
    console.log("🚀 enhancePromptUnified called with:", {
      originalPrompt,
      mode,
      mediaType,
      enhancementLevel,
      targetAudience,
      includeNegativePrompt,
      modelHint,
      customLimit,
      focusType,
      includeAudio,
      moodboardEnabled: moodboard?.enabled || false,
    });

    try {
      if (mode === "general") {
        return await enhanceGeneralPrompt({
          originalPrompt,
          mediaType,
          enhancementLevel,
          targetAudience,
          includeNegativePrompt,
          modelHint,
        });
      } else if (mode === "veo3") {
        return await enhanceVEO3Prompt({
          originalPrompt,
          customLimit,
          focusType,
          includeAudio,
          promptData,
          moodboard,
        });
      } else {
        throw new Error(`Unknown enhancement mode: ${mode}`);
      }
    } catch (error) {
      console.error("❌ Error in unified prompt enhancement:", error);
      return {
        error: `Failed to enhance prompt: ${error instanceof Error ? error.message : "Unknown error"}`,
        originalPrompt,
        enhancedPrompt: originalPrompt, // Return original as fallback
        fallback: true,
        mode,
      };
    }
  },
});

// General prompt enhancement function
async function enhanceGeneralPrompt(params: {
  originalPrompt: string;
  mediaType: string;
  enhancementLevel: string;
  targetAudience?: string;
  includeNegativePrompt: boolean;
  modelHint?: string;
}) {
  const {
    originalPrompt,
    mediaType,
    enhancementLevel,
    targetAudience,
    includeNegativePrompt,
    modelHint,
  } = params;

  // Build system prompt based on media type and enhancement level
  const systemPrompt = buildSystemPrompt(
    mediaType,
    enhancementLevel,
    modelHint
  );

  // Build user prompt with context
  const userPrompt = buildUserPrompt(
    originalPrompt,
    mediaType,
    enhancementLevel,
    targetAudience,
    includeNegativePrompt
  );

  console.log("🔄 Calling LLM for general prompt enhancement...");

  const result = await generateText({
    model: myProvider.languageModel("artifact-model"),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
    maxTokens: 1000,
  });

  console.log("✅ LLM response received:", result.text);

  // Parse the enhanced prompt from LLM response
  const parsedResult = parseEnhancementResult(result.text, originalPrompt);

  return {
    originalPrompt,
    enhancedPrompt: parsedResult.enhancedPrompt,
    negativePrompt: parsedResult.negativePrompt,
    mediaType,
    enhancementLevel,
    modelHint,
    improvements: parsedResult.improvements,
    reasoning: parsedResult.reasoning,
    mode: "general",
    usage: {
      copyPrompt:
        "Copy the enhanced prompt to use in image/video generation tools",
      negativePrompt: parsedResult.negativePrompt
        ? "Use the negative prompt to avoid unwanted elements"
        : undefined,
    },
  };
}

// VEO3 prompt enhancement function
async function enhanceVEO3Prompt(params: {
  originalPrompt: string;
  customLimit: number;
  focusType?: string;
  includeAudio: boolean;
  promptData?: any;
  moodboard?: any;
}) {
  const {
    originalPrompt,
    customLimit,
    focusType,
    includeAudio,
    promptData,
    moodboard,
  } = params;

  // Check environment variables
  if (
    !process.env.AZURE_OPENAI_RESOURCE_NAME ||
    !process.env.AZURE_OPENAI_API_KEY
  ) {
    throw new Error(
      "Azure OpenAI not configured. Please set AZURE_OPENAI_RESOURCE_NAME and AZURE_OPENAI_API_KEY environment variables."
    );
  }

  // Process focus types
  const focusTypes = focusType
    ? focusType.split(",").map((type) => type.trim())
    : [];

  // Check if we have characters with speech
  const hasCharacterSpeech =
    (includeAudio &&
      promptData?.characters?.some((char: any) => char.speech.trim())) ||
    false;

  // Process moodboard images
  let moodboardContext = "";
  let moodboardImages: Array<{ type: "image"; image: string }> = [];

  if (moodboard?.enabled && moodboard.images?.length > 0) {
    const imagesByTag: Record<
      string,
      Array<{
        id: string;
        description?: string;
        weight: number;
        index: number;
        tags: string[];
      }>
    > = {};

    moodboard.images.forEach((img: any, index: number) => {
      img.tags.forEach((tag: string) => {
        if (!imagesByTag[tag]) imagesByTag[tag] = [];
        imagesByTag[tag].push({
          ...img,
          index: index + 1,
        });
      });
    });

    const tagDescriptions = {
      character:
        "character appearance, expressions, clothing, and personality traits",
      style:
        "visual style, artistic approach, cinematography, and overall aesthetic",
      background: "environments, settings, locations, and background elements",
      lighting:
        "lighting conditions, mood, time of day, and atmospheric effects",
      mood: "emotional tone, atmosphere, and feeling",
      action: "movements, activities, dynamics, and interactions",
    };

    moodboardContext = "\n\nMOODBOARD VISUAL REFERENCES:\n";
    moodboardContext +=
      "The user has provided visual references to guide the enhancement. PRIORITIZE incorporating these visual elements prominently into the appropriate VEO3 sections:\n\n";

    Object.entries(imagesByTag).forEach(([tag, images]) => {
      moodboardContext += `${tag.toUpperCase()} REFERENCES (${images.length} image${images.length > 1 ? "s" : ""}):\n`;
      images.forEach((img) => {
        moodboardContext += `- Image ${img.index}${img.description ? `: ${img.description}` : ""} (weight: ${img.weight}) - INTEGRATE PROMINENTLY\n`;
      });
      moodboardContext += `MANDATORY: Incorporate specific visual elements from these references into ${tagDescriptions[tag as keyof typeof tagDescriptions]} sections. Reference the moodboard images directly in your descriptions.\n\n`;
    });

    moodboardImages = moodboard.images
      .filter((img: any) => img.url || img.base64)
      .map((img: any) => ({
        type: "image" as const,
        image: img.url || `data:image/jpeg;base64,${img.base64}`,
      }));
  }

  // Extract character speech for context
  let characterSpeechInfo = "";
  if (hasCharacterSpeech && promptData?.characters) {
    const charactersWithSpeech = promptData.characters.filter((char: any) =>
      char.speech.trim()
    );
    characterSpeechInfo = `\n\nCHARACTER SPEECH CONTEXT:\n${charactersWithSpeech
      .map(
        (char: any) =>
          `- ${char.name || "Character"}: "${char.speech}" ${promptData.language ? `(in ${promptData.language})` : ""}`
      )
      .join("\n")}\n`;
  }

  const targetChars = Math.floor(customLimit * 0.75);
  const maxChars = customLimit;
  const maxTokens = Math.min(Math.ceil(customLimit / 2.5) + 500, 4000);

  // Create focus-specific instruction
  const focusInstructions = {
    character:
      "FOCUS ON CHARACTER: Pay special attention to character development, appearance details, facial expressions, body language, and personality traits. Allocate extra detail budget to character descriptions.",
    action:
      "FOCUS ON ACTION: Emphasize dynamic movements, activities, and sequences. Add details about how actions unfold, timing, and physical interactions with the environment.",
    cinematic:
      "FOCUS ON CINEMATOGRAPHY: Enhance camera work, lighting, and visual composition with professional filming techniques. Focus on visual storytelling and cinematic quality.",
    safe: "SAFE CONTENT MODE: Ensure all content strictly complies with Google VEO3 content policies. Focus on family-friendly, educational, artistic content suitable for all audiences.",
  };

  let focusInstruction = "";
  if (focusTypes.length > 0) {
    const validFocusTypes = focusTypes.filter(
      (type) => type in focusInstructions
    );
    if (validFocusTypes.length > 0) {
      const instructions = validFocusTypes.map(
        (type) => focusInstructions[type as keyof typeof focusInstructions]
      );
      focusInstruction = `\n\nAPPLIED FOCUS STRATEGIES:\n${instructions.join("\n\n")}\n`;
    }
  }

  // Create dynamic schema based on settings
  const veo3Schema = createVEO3Schema(
    focusTypes,
    includeAudio,
    hasCharacterSpeech
  );

  const enhancementPrompt = `Enhance this VEO3 video prompt using structured output format. Target length: ${targetChars} characters (max: ${maxChars}): "${originalPrompt}"${focusInstruction}${characterSpeechInfo}${moodboardContext}

CRITICAL REQUIREMENTS:
1. LANGUAGE: Write everything in ENGLISH except preserve direct speech in original language
2. LENGTH: Stay under ${targetChars} characters total across all sections
3. STRUCTURE: Use the exact VEO3 format with all required sections
4. QUALITY: Professional video production terminology and specific details
${moodboard?.enabled ? "5. VISUAL REFERENCES: Incorporate visual elements from the provided moodboard images into relevant sections" : ""}

VEO3 ENHANCEMENT GUIDELINES:
- Scene Description: Overall action, participants, atmosphere
- Visual Style: Cinematic look - realistic, animated, stylized, surreal
- Camera Movement: Specific movements - pan, tracking, static, aerial
- Main Subject: Primary focus person/character/object  
- Background Setting: Specific location and environment
- Lighting/Mood: Lighting type and emotional tone
- Color Palette: Dominant colors and visual tones
${includeAudio ? "- Audio Cue: Sound design, dialogue, ambient sounds, music" : ""}

${
  moodboard?.enabled
    ? `MOODBOARD INTEGRATION INSTRUCTIONS:
- Analyze the provided ${moodboard.images?.length || 0} reference image(s)
- Extract visual elements relevant to each VEO3 section
- Prioritize images with higher weight values
- Maintain consistency with the original prompt intent
- Use specific visual details from the references
- IMPORTANT: Make direct references to "the moodboard image" or "reference image" in your descriptions
- MANDATORY: Transform at least 30% of each tagged section to reflect the visual references

`
    : ""
}SMART LENGTH DISTRIBUTION:
${focusTypes.includes("character") ? "- Allocate 30% to character descriptions and main subject" : ""}
${focusTypes.includes("action") ? "- Allocate 25% each to scene description and camera movement" : ""}
${focusTypes.includes("cinematic") ? "- Allocate 25% to camera movement, 20% each to visual style and lighting" : ""}
${focusTypes.includes("safe") ? "- Ensure all content is family-friendly and policy-compliant" : ""}

ENHANCEMENT PRINCIPLES:
1. Preserve original intent and core elements
2. Add cinematic and technical details
3. Include vivid sensory descriptions
4. Specify professional video terminology
5. Maintain original style and tone
6. Add cultural context (described in English)
7. Include specific color and lighting details
8. Preserve direct speech in original language
${moodboard?.enabled ? "9. Incorporate visual references from moodboard images" : ""}

Generate a structured enhancement that follows VEO3 format exactly.`;

  // Configure model for structured output
  const modelConfig = VEO3_MODEL_CONFIG["gpt-4.1"];
  const modelInstance = azure(modelConfig.deploymentName);

  // Prepare messages for multimodal input
  const messages = [
    {
      role: "system" as const,
      content: `You are an expert VEO3 video prompt engineer with structured output capabilities. 

CRITICAL INSTRUCTIONS:
1. Generate content that EXACTLY fits the character limit: ${targetChars} characters
2. Use professional video production terminology
3. Write everything in ENGLISH except preserve direct speech in original language
4. Follow VEO3 structure precisely
5. Apply focus-specific enhancements as requested
6. Include character count tracking
7. Extract character speech information if present
${moodboard?.enabled ? "8. Analyze provided moodboard images and incorporate visual elements" : ""}

FOCUS STRATEGY APPLICATION:
${focusTypes.map((type) => `- ${type.toUpperCase()}: ${focusInstructions[type as keyof typeof focusInstructions]}`).join("\n")}

Your output will be automatically formatted for VEO3 usage.`,
    },
    {
      role: "user" as const,
      content:
        moodboardImages.length > 0
          ? [
              { type: "text" as const, text: enhancementPrompt },
              ...moodboardImages,
            ]
          : enhancementPrompt,
    },
  ];

  const result = await generateObject({
    model: modelInstance,
    maxTokens: maxTokens,
    temperature: 0.7,
    messages,
    schema: veo3Schema,
    schemaName: "VEO3VideoPromptEnhancement",
    schemaDescription: `Enhanced VEO3 video prompt with dynamic structured output. Contains ${includeAudio ? "audio-enabled" : "audio-disabled"} sections${hasCharacterSpeech ? " with character speech extraction" : ""}${focusTypes.length > 0 ? ` and focus enhancements for: ${focusTypes.join(", ")}` : ""}${moodboard?.enabled ? ` with ${moodboard.images?.length || 0} moodboard image references` : ""}. Target length: ${targetChars} characters.`,
  });

  // Format the structured output back to VEO3 format
  const structuredData = result.object;

  // Build the formatted prompt
  let formattedPrompt = `SCENE DESCRIPTION: ${structuredData.scene_description}

VISUAL STYLE: ${structuredData.visual_style}

CAMERA MOVEMENT: ${structuredData.camera_movement}

MAIN SUBJECT: ${structuredData.main_subject}

BACKGROUND SETTING: ${structuredData.background_setting}

LIGHTING/MOOD: ${structuredData.lighting_mood}`;

  // Add audio section if enabled
  if (includeAudio && "audio_cue" in structuredData) {
    formattedPrompt += `\n\nAUDIO CUE: ${structuredData.audio_cue}`;
  }

  formattedPrompt += `\n\nCOLOR PALETTE: ${structuredData.color_palette}`;

  // Calculate actual character count
  const actualCharCount = formattedPrompt.length;

  return {
    originalPrompt,
    enhancedPrompt: formattedPrompt,
    characterCount: actualCharCount,
    characterLimit: maxChars,
    targetCharacters: targetChars,
    model: modelConfig.name,
    focusTypes: structuredData.focus_areas || focusTypes,
    includeAudio,
    mode: "veo3",
    metadata: {
      structuredData,
      hasCharacterSpeech,
      speechExtracted: hasCharacterSpeech
        ? structuredData.character_speech
        : null,
      focusEnhancements: {
        character: focusTypes.includes("character")
          ? structuredData.character_details
          : null,
        action: focusTypes.includes("action")
          ? structuredData.action_sequence
          : null,
        cinematic: focusTypes.includes("cinematic")
          ? structuredData.cinematography_notes
          : null,
        safe: focusTypes.includes("safe")
          ? structuredData.safety_compliance
          : null,
      },
      moodboard: moodboard?.enabled
        ? {
            enabled: true,
            imageCount: moodboard.images?.length || 0,
            tags: [
              ...new Set(
                moodboard.images?.flatMap((img: any) => img.tags) || []
              ),
            ],
            totalWeight:
              moodboard.images?.reduce(
                (sum: number, img: any) => sum + img.weight,
                0
              ) || 0,
          }
        : {
            enabled: false,
            imageCount: 0,
            tags: [],
            totalWeight: 0,
          },
    },
  };
}

// Helper functions for general mode (copied from original enhance-prompt.ts)
function buildSystemPrompt(
  mediaType: string,
  enhancementLevel: string,
  modelHint?: string
): string {
  const basePrompt = `You are a professional prompt engineering expert specializing in improving prompts for AI generation. Your task is to enhance user prompts to achieve the best possible results.

CORE RESPONSIBILITIES:
1. Translate non-English text to English while preserving meaning and intent
2. Apply prompt engineering best practices (specificity, clarity, quality keywords)
3. Optimize for the target media type and AI model
4. Structure prompts for maximum effectiveness

ENHANCEMENT PRINCIPLES:
- Keep the original creative intent intact
- Add technical and quality descriptors
- Include appropriate style and composition terms
- Ensure compatibility with target AI models
- Use professional terminology when appropriate`;

  const mediaSpecificGuidance = {
    image: `
IMAGE GENERATION FOCUS:
- Add photography/artistic quality terms (e.g., "professional photography", "high resolution", "sharp focus")
- Include composition guidance (e.g., "excellent composition", "rule of thirds", "dramatic lighting")
- Specify visual style and mood descriptors
- Add technical camera/lens terminology when relevant
- Include quality markers like "masterpiece", "award-winning", "trending on artstation"`,

    video: `
VIDEO GENERATION FOCUS:
- Add cinematography terms (e.g., "cinematic quality", "professional cinematography", "smooth motion")
- Include camera movement and framing guidance
- Specify visual style and mood for motion
- Add production quality terms (e.g., "Hollywood production", "IMAX quality")
- Include temporal aspects like pacing and rhythm`,

    general: `
GENERAL ENHANCEMENT FOCUS:
- Improve clarity and specificity
- Add professional quality terms
- Enhance structure and flow
- Remove ambiguity while preserving creativity`,
  };

  const levelGuidance = {
    basic:
      "Apply minimal enhancements - focus on translation, basic cleanup, and essential quality terms.",
    detailed:
      "Apply comprehensive enhancements - add professional terminology, improve structure, include quality descriptors.",
    creative:
      "Apply maximum enhancements - add artistic language, advanced composition terms, creative direction guidance.",
  };

  let modelOptimization = "";
  if (modelHint) {
    modelOptimization = `
MODEL OPTIMIZATION for ${modelHint}:
- Tailor the prompt style to work best with this specific AI model
- Use terminology and structure that this model responds well to
- Include model-specific quality triggers and style guidance`;
  }

  return `${basePrompt}

${mediaSpecificGuidance[mediaType as keyof typeof mediaSpecificGuidance] || mediaSpecificGuidance.general}

ENHANCEMENT LEVEL: ${levelGuidance[enhancementLevel as keyof typeof levelGuidance]}${modelOptimization}

OUTPUT FORMAT:
Provide your response as a JSON object with these fields:
{
  "enhancedPrompt": "the improved prompt text",
  "negativePrompt": "what to avoid (if requested)",
  "improvements": ["list of improvements made"],
  "reasoning": "brief explanation of enhancement strategy"
}`;
}

function buildUserPrompt(
  originalPrompt: string,
  mediaType: string,
  enhancementLevel: string,
  targetAudience?: string,
  includeNegativePrompt?: boolean
): string {
  let prompt = `Please enhance this prompt for ${mediaType} generation:

ORIGINAL PROMPT: "${originalPrompt}"

REQUIREMENTS:
- Enhancement level: ${enhancementLevel}
- Media type: ${mediaType}`;

  if (targetAudience) {
    prompt += `\n- Target audience: ${targetAudience}`;
  }

  if (includeNegativePrompt) {
    prompt += `\n- Include negative prompt to avoid unwanted elements`;
  }

  prompt += `\n\nPlease enhance this prompt following your expertise in prompt engineering. Translate any non-English text to English while preserving the creative intent. Apply appropriate enhancements for the specified media type and level.`;

  return prompt;
}

function parseEnhancementResult(llmResponse: string, originalPrompt: string) {
  try {
    // Try to parse as JSON first
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        enhancedPrompt: parsed.enhancedPrompt || originalPrompt,
        negativePrompt: parsed.negativePrompt || undefined,
        improvements: parsed.improvements || ["LLM enhancement applied"],
        reasoning: parsed.reasoning || "Enhanced using AI prompt engineering",
      };
    }

    // Fallback: extract enhanced prompt from text
    const lines = llmResponse.split("\n").filter((line) => line.trim());
    let enhancedPrompt = originalPrompt;

    // Look for enhanced prompt indicators
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
      improvements: ["LLM enhancement applied"],
      reasoning: "Enhanced using AI prompt engineering",
    };
  } catch (error) {
    console.error("Failed to parse LLM response:", error);
    return {
      enhancedPrompt: originalPrompt,
      negativePrompt: undefined,
      improvements: ["Enhancement failed, returned original"],
      reasoning: "Error in processing enhancement",
    };
  }
}
