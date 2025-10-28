import { tool } from "ai";
import { z } from "zod";
import { getImageGenerationConfig } from "@/lib/config/media-settings-factory";
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from "@/lib/utils/ai-tools-balance";
import type { Session } from "next-auth";
import { analyzeImageContext } from "@/lib/ai/context";

interface CreateImageDocumentParams {
  createDocument: any;
  session?: Session | null;
  defaultSourceImageUrl?: string;
  chatId?: string;
  userMessage?: string;
  currentAttachments?: any[];
}

// Nano Banana specific styles and settings
const NANO_BANANA_STYLES = [
  {
    id: "realistic",
    label: "Realistic",
    description: "Photorealistic images",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Cinematic style with dramatic lighting",
  },
  { id: "anime", label: "Anime", description: "Japanese animation style" },
  {
    id: "cartoon",
    label: "Cartoon",
    description: "Cartoon style",
  },
  { id: "chibi", label: "Chibi", description: "Miniature cute style" },
  {
    id: "3d-render",
    label: "3D Render",
    description: "Three-dimensional computer graphics",
  },
  {
    id: "oil-painting",
    label: "Oil Painting",
    description: "Classic oil painting",
  },
  {
    id: "watercolor",
    label: "Watercolor",
    description: "Gentle watercolor technique",
  },
  { id: "sketch", label: "Sketch", description: "Pencil sketch" },
  {
    id: "digital-art",
    label: "Digital Art",
    description: "Modern digital creativity",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    description: "Magical fantasy world",
  },
  {
    id: "sci-fi",
    label: "Sci-Fi",
    description: "Futuristic science fiction style",
  },
  {
    id: "steampunk",
    label: "Steampunk",
    description: "Victorian era with technology",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    description: "Neon futuristic style",
  },
  {
    id: "vintage",
    label: "Vintage",
    description: "Retro style from past eras",
  },
  {
    id: "minimalist",
    label: "Minimalist",
    description: "Simple and clean design",
  },
  { id: "abstract", label: "Abstract", description: "Abstract art" },
  {
    id: "portrait",
    label: "Portrait",
    description: "Focus on face and character",
  },
  {
    id: "landscape",
    label: "Landscape",
    description: "Natural and urban views",
  },
  {
    id: "macro",
    label: "Macro",
    description: "Close-up of small objects",
  },
] as const;

const NANO_BANANA_QUALITY_LEVELS = [
  {
    id: "standard",
    label: "Standard",
    multiplier: 1.0,
    description: "Base quality",
  },
  {
    id: "high",
    label: "High",
    multiplier: 1.5,
    description: "Enhanced quality",
  },
  {
    id: "ultra",
    label: "Ultra",
    multiplier: 2.0,
    description: "Maximum quality",
  },
  {
    id: "masterpiece",
    label: "Masterpiece",
    multiplier: 3.0,
    description: "Professional quality",
  },
] as const;

const NANO_BANANA_ASPECT_RATIOS = [
  {
    id: "1:1",
    label: "Square (1:1)",
    width: 1024,
    height: 1024,
    description: "Square image",
  },
  {
    id: "4:3",
    label: "Classic (4:3)",
    width: 1024,
    height: 768,
    description: "Classic ratio",
  },
  {
    id: "16:9",
    label: "Widescreen (16:9)",
    width: 1920,
    height: 1080,
    description: "Widescreen format",
  },
  {
    id: "3:2",
    label: "Photo (3:2)",
    width: 1536,
    height: 1024,
    description: "Standard photo",
  },
  {
    id: "9:16",
    label: "Vertical (9:16)",
    width: 768,
    height: 1366,
    description: "Mobile format",
  },
  {
    id: "21:9",
    label: "Ultrawide (21:9)",
    width: 2560,
    height: 1080,
    description: "Cinematic",
  },
] as const;

export const nanoBananaImageGenerationForChat = (
  params?: CreateImageDocumentParams
) =>
  tool({
    description:
      "Generate images with Gemini-2.5-Flash-Image (Nano Banana) - advanced Google model for creating and editing images. Supports text-to-image and image-to-image generation with context-aware editing.",
    inputSchema: z.object({
      prompt: z
        .string()
        .describe(
          "Detailed description of the image to generate. Nano Banana understands context, lighting and physical logic."
        ),
      sourceImageUrl: z
        .string()
        .url()
        .optional()
        .describe(
          "URL of source image for image-to-image generation. Nano Banana can intelligently edit existing images."
        ),
      style: z
        .enum(NANO_BANANA_STYLES.map((s) => s.id) as [string, ...string[]])
        .optional()
        .describe(
          "Image style. Nano Banana supports multiple styles from realistic to abstract."
        ),
      quality: z
        .enum(
          NANO_BANANA_QUALITY_LEVELS.map((q) => q.id) as [string, ...string[]]
        )
        .optional()
        .default("high")
        .describe(
          "Quality level of generation. Affects detail and processing time."
        ),
      aspectRatio: z
        .enum(
          NANO_BANANA_ASPECT_RATIOS.map((a) => a.id) as [string, ...string[]]
        )
        .optional()
        .default("1:1")
        .describe("Image aspect ratio."),
      seed: z.number().optional().describe("Seed for reproducible results"),
      batchSize: z
        .number()
        .min(1)
        .max(4)
        .optional()
        .default(1)
        .describe(
          "Number of images to generate simultaneously (1-4). More variations at once."
        ),
      enableContextAwareness: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          "Enable context-aware editing. Nano Banana understands relationships between objects and environment."
        ),
      enableSurgicalPrecision: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          "Enable surgical precision editing. Precise handling of occlusions and boundaries."
        ),
      creativeMode: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Enable creative mode for more creative and unusual results."
        ),
    }),
    execute: async ({
      prompt,
      sourceImageUrl,
      style,
      quality,
      aspectRatio,
      seed,
      batchSize,
      enableContextAwareness,
      enableSurgicalPrecision,
      creativeMode,
    }) => {
      console.log("🍌🍌🍌 ===== NANO BANANA TOOL EXECUTE STARTED ===== 🍌🍌🍌");
      console.log("🍌 nanoBananaImageGenerationForChat called with:", {
        prompt,
        style,
        quality,
        aspectRatio,
        batchSize,
        enableContextAwareness,
        enableSurgicalPrecision,
        creativeMode,
      });
      console.log("🍌 Tool execution timestamp:", new Date().toISOString());

      // Get image configuration
      const config = await getImageGenerationConfig();

      // If no prompt, return Nano Banana configuration panel
      if (!prompt) {
        console.log(
          "🍌 No prompt provided, returning Nano Banana configuration panel"
        );
        return {
          ...config,
          nanoBananaStyles: NANO_BANANA_STYLES,
          nanoBananaQualityLevels: NANO_BANANA_QUALITY_LEVELS,
          nanoBananaAspectRatios: NANO_BANANA_ASPECT_RATIOS,
          model: "gemini-2.5-flash-image",
          capabilities: [
            "Context-aware editing",
            "Surgical precision",
            "Understanding physical logic",
            "Intelligent lighting",
            "Multimodal inputs",
            "Creative partnership",
          ],
        };
      }

      console.log(
        "🍌 ✅ PROMPT PROVIDED, CREATING NANO BANANA IMAGE DOCUMENT:",
        prompt
      );

      try {
        // Find selected options
        const selectedStyle = style
          ? NANO_BANANA_STYLES.find((s) => s.id === style) ||
            NANO_BANANA_STYLES[0]
          : NANO_BANANA_STYLES[0];

        const selectedQuality = quality
          ? NANO_BANANA_QUALITY_LEVELS.find((q) => q.id === quality) ||
            NANO_BANANA_QUALITY_LEVELS[1]
          : NANO_BANANA_QUALITY_LEVELS[1];

        const selectedAspectRatio = aspectRatio
          ? NANO_BANANA_ASPECT_RATIOS.find((a) => a.id === aspectRatio) ||
            NANO_BANANA_ASPECT_RATIOS[0]
          : NANO_BANANA_ASPECT_RATIOS[0];

        // Analyze image context
        let normalizedSourceUrl = sourceImageUrl;

        console.log("contextResult", normalizedSourceUrl);

        if (params?.chatId && params?.userMessage) {
          try {
            console.log("🔍 Analyzing image context for Nano Banana...");
            const contextResult = await analyzeImageContext(
              params.userMessage,
              params.chatId,
              params.currentAttachments,
              params.session?.user?.id
            );

            if (contextResult.sourceUrl && contextResult.confidence !== "low") {
              console.log(
                "🔍 Using sourceUrl from context analysis:",
                contextResult.sourceUrl
              );
              normalizedSourceUrl = contextResult.sourceUrl;
            }
          } catch (error) {
            console.warn("🔍 Error in context analysis, falling back:", error);
          }
        }

        // Determine operation type
        const operationType = normalizedSourceUrl
          ? "image-to-image"
          : "text-to-image";

        // Check balance
        const multipliers: string[] = [];
        if (selectedQuality.id === "high") multipliers.push("high-quality");
        if (selectedQuality.id === "ultra") multipliers.push("ultra-quality");
        if (selectedQuality.id === "masterpiece")
          multipliers.push("masterpiece-quality");
        if (batchSize && batchSize > 1) multipliers.push(`batch-${batchSize}`);

        const balanceCheck = await checkBalanceBeforeArtifact(
          params?.session || null,
          "image-generation",
          operationType,
          multipliers,
          getOperationDisplayName(operationType)
        );

        if (!balanceCheck.valid) {
          console.log("🍌 ❌ INSUFFICIENT BALANCE, NOT CREATING ARTIFACT");
          return {
            error:
              balanceCheck.userMessage ||
              "Insufficient funds for image generation",
            balanceError: true,
            requiredCredits: balanceCheck.cost,
          };
        }

        // Create prompt for Nano Banana
        let nanoBananaPrompt = prompt;

        // Add style instructions
        if (selectedStyle.id !== "realistic") {
          nanoBananaPrompt += `, ${selectedStyle.description.toLowerCase()}`;
        }

        // Add quality instructions
        if (selectedQuality.id !== "standard") {
          nanoBananaPrompt += `, ${selectedQuality.description.toLowerCase()}`;
        }

        // Add aspect ratio instructions
        nanoBananaPrompt += `, ${selectedAspectRatio.description.toLowerCase()}`;

        // Add Nano Banana specific instructions
        if (enableContextAwareness) {
          nanoBananaPrompt +=
            ", context-aware editing, intelligent lighting and reflections";
        }

        if (enableSurgicalPrecision) {
          nanoBananaPrompt +=
            ", surgical precision, perfect occlusion handling";
        }

        if (creativeMode) {
          nanoBananaPrompt +=
            ", creative interpretation, artistic vision, unique perspective";
        }

        // Create document parameters with Nano Banana marker
        const imageParams = {
          prompt: nanoBananaPrompt,
          model: "gemini-2.5-flash-image",
          provider: "nano-banana",
          style: selectedStyle,
          quality: selectedQuality,
          aspectRatio: selectedAspectRatio,
          seed: seed || undefined,
          batchSize: batchSize || 1,
          enableContextAwareness,
          enableSurgicalPrecision,
          creativeMode,
          ...(normalizedSourceUrl
            ? { sourceImageUrl: normalizedSourceUrl }
            : {}),
        };

        console.log(
          "🍌 ✅ CREATING NANO BANANA IMAGE DOCUMENT WITH PARAMS:",
          imageParams
        );

        // Use Nano Banana Provider (Gemini API)
        console.log("🍌 🚀 NANO BANANA: Using Gemini API");

        const { nanoBananaProvider } = await import("../providers/nano-banana");

        const nanoBananaParams = {
          prompt: nanoBananaPrompt,
          ...(normalizedSourceUrl && { sourceImageUrl: normalizedSourceUrl }),
          style: selectedStyle.id,
          quality: selectedQuality.id,
          aspectRatio: selectedAspectRatio.id,
          ...(seed && { seed }),
          nanoBananaFeatures: {
            enableContextAwareness,
            enableSurgicalPrecision,
            creativeMode,
          },
        };

        const result = await nanoBananaProvider.generateImage(nanoBananaParams);

        console.log("🍌 ✅ NANO BANANA API RESULT:", result);

        // Return artifact-compatible structure (matching video tool pattern)
        // CRITICAL: content must be JSON string with projectId/fileId for SSE connection
        const contentData = {
          status: "completed", // Image is already generated
          imageUrl: result.url,
          projectId: result.id, // Use result.id as projectId for SSE
          fileId: result.id, // Use result.id as fileId for SSE
          prompt: result.prompt,
          timestamp: result.timestamp,
          style: selectedStyle,
          quality: selectedQuality,
          aspectRatio: selectedAspectRatio,
          seed: seed,
          batchSize: batchSize || 1,
          enableContextAwareness,
          enableSurgicalPrecision,
          creativeMode,
          message: "Image generated successfully!",
        };

        return {
          success: true, // Required for AI model to understand tool succeeded
          id: result.id, // Unique ID for artifact
          kind: "image", // Required for artifact system
          title: `Image: ${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}`,
          content: JSON.stringify(contentData), // JSON string with projectId/fileId for SSE
          url: result.url, // Keep url for backward compatibility
          prompt: result.prompt,
          timestamp: result.timestamp,
          settings: result.settings,
          message: `Image generated successfully using Nano Banana (Gemini 2.5 Flash Image): "${prompt}". Style: ${selectedStyle.label}, Quality: ${selectedQuality.label}, Format: ${selectedAspectRatio.label}.`,
          nanoBananaInfo: {
            model: "gemini-2.5-flash-image",
            capabilities: [
              "Context-aware editing",
              "Surgical precision",
              "Physical logic understanding",
              "Intelligent lighting",
            ],
            style: selectedStyle,
            quality: selectedQuality,
            aspectRatio: selectedAspectRatio,
          },
        };
      } catch (error: any) {
        console.error("🍌 ❌ ERROR IN NANO BANANA IMAGE GENERATION:", error);
        // Throw error without fallback
        throw error;
      }
    },
  });
