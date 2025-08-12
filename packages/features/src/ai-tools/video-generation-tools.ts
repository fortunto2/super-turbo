// Placeholder for ai-sdk tool function
const tool = (config: any) => config;

// Placeholder types for external dependencies
interface CreateVideoDocumentParams {
  createDocument: any;
  session?: any;
}

interface MediaOption {
  id: string;
  label: string;
  description: string;
}

interface VideoGenerationConfig {
  type: string;
  availableResolutions: any[];
  availableStyles: MediaOption[];
  availableShotSizes: any[];
  availableModels: any[];
  availableFrameRates: any[];
  defaultSettings: any;
}

interface AdaptedModel {
  id: string;
  name: string;
  label: string;
  description: string;
  value: string;
  workflowPath: string;
  price: number;
  type: any;
  source: any;
}

// Placeholder enums
enum GenerationTypeEnum {
  TEXT_TO_VIDEO = "text_to_video",
  IMAGE_TO_VIDEO = "image_to_video",
  TEXT_TO_IMAGE = "text_to_image",
  IMAGE_TO_IMAGE = "image_to_image",
}

enum GenerationSourceEnum {
  LOCAL = "local",
  FAL_AI = "fal_ai",
  GOOGLE_CLOUD = "google_cloud",
  AZURE_OPENAI_SORA = "azure_openai_sora",
  AZURE_OPENAI_IMAGE = "azure_openai_image",
}

// Placeholder functions
async function getStyles() {
  return { items: [] };
}

function findStyle(style: string, styles: MediaOption[]) {
  return styles.find(s => s.id === style || s.label === style);
}

async function createVideoMediaSettings() {
  return { availableModels: [] };
}

async function getBestVideoModel(params: any) {
  return null;
}

// Placeholder constants
const VIDEO_RESOLUTIONS: any[] = [];
const SHOT_SIZES: any[] = [];
const VIDEO_FRAME_RATES: any[] = [];
const DEFAULT_VIDEO_RESOLUTION = { label: "HD" };
const DEFAULT_VIDEO_DURATION = 5;

function getModelCompatibleResolutions(modelName: string): any[] {
  return VIDEO_RESOLUTIONS;
}

function getDefaultResolutionForModel(modelName: string): any {
  return DEFAULT_VIDEO_RESOLUTION;
}

async function checkBalanceBeforeArtifact(session: any, operation: string, operationType: string, multipliers: string[], operationDisplayName: string): Promise<{ valid: boolean; cost: number; userMessage?: string }> {
  return { valid: true, cost: 0 };
}

function getOperationDisplayName(operationType: string): string {
  return operationType;
}

// Helper function to convert string source to enum
function convertSourceToEnum(source: string): GenerationSourceEnum {
  switch (source) {
    case "local":
      return GenerationSourceEnum.LOCAL;
    case "fal_ai":
      return GenerationSourceEnum.FAL_AI;
    case "google_cloud":
      return GenerationSourceEnum.GOOGLE_CLOUD;
    case "azure_openai_sora":
      return GenerationSourceEnum.AZURE_OPENAI_SORA;
    case "azure_openai_image":
      return GenerationSourceEnum.AZURE_OPENAI_IMAGE;
    default:
      return GenerationSourceEnum.LOCAL;
  }
}

// Helper function to convert string type to enum
function convertTypeToEnum(type: string): GenerationTypeEnum {
  switch (type) {
    case "text_to_video":
      return GenerationTypeEnum.TEXT_TO_VIDEO;
    case "image_to_video":
      return GenerationTypeEnum.IMAGE_TO_VIDEO;
    case "text_to_image":
      return GenerationTypeEnum.TEXT_TO_IMAGE;
    case "image_to_image":
      return GenerationTypeEnum.IMAGE_TO_IMAGE;
    default:
      return GenerationTypeEnum.TEXT_TO_VIDEO;
  }
}

export const configureVideoGeneration = (params?: CreateVideoDocumentParams) =>
  tool({
    description:
      "Configure video generation settings or generate a video directly if prompt is provided. When prompt is provided, this will create a video artifact that shows generation progress in real-time. Available models are loaded dynamically from SuperDuperAI API.",
    parameters: {
      prompt: {
        type: "string",
        optional: true,
        description: "Detailed description of the video to generate. If provided, will immediately create video artifact and start generation"
      },
      negativePrompt: {
        type: "string",
        optional: true,
        description: "What to avoid in the video generation"
      },
      style: {
        type: "string",
        optional: true,
        description: "Style of the video"
      },
      resolution: {
        type: "string",
        optional: true,
        description: 'Video resolution (e.g., "1344x768", "1024x1024"). Default is HD 1344x768 for cost efficiency.'
      },
      shotSize: {
        type: "string",
        optional: true,
        description: "Shot size for the video (extreme-long-shot, long-shot, medium-shot, medium-close-up, close-up, extreme-close-up, two-shot, detail-shot)"
      },
      model: {
        type: "string",
        optional: true,
        description: 'AI model to use. Models are loaded dynamically from SuperDuperAI API. Use model name like "LTX" or full model ID. For image-to-video models (VEO, KLING), a source image is required.'
      },
      frameRate: {
        type: "number",
        optional: true,
        description: "Frame rate in FPS (24, 30, 60, 120)"
      },
      duration: {
        type: "number",
        optional: true,
        description: "Video duration in seconds. Default is 5 seconds for cost efficiency."
      },
      sourceImageId: {
        type: "string",
        optional: true,
        description: "ID of source image for image-to-video models (VEO, KLING). Required for image-to-video generation."
      },
      sourceImageUrl: {
        type: "string",
        optional: true,
        description: "URL of source image for image-to-video models. Alternative to sourceImageId."
      },
      generationType: {
        type: "string",
        enum: ["text-to-video", "image-to-video"],
        optional: true,
        description: 'Generation mode: "text-to-video" for text prompts only, "image-to-video" when using source image'
      },
    },
    execute: async ({
      prompt,
      negativePrompt,
      style,
      resolution,
      shotSize,
      model,
      frameRate,
      duration,
      sourceImageId,
      sourceImageUrl,
      generationType,
    }: {
      prompt?: string;
      negativePrompt?: string;
      style?: string;
      resolution?: string;
      shotSize?: string;
      model?: string;
      frameRate?: number;
      duration?: number;
      sourceImageId?: string;
      sourceImageUrl?: string;
      generationType?: string;
    }) => {
      console.log("🔧 configureVideoGeneration called with:", {
        prompt,
        negativePrompt,
        style,
        resolution,
        shotSize,
        model,
        frameRate,
        duration,
      });
      console.log("🔧 createDocument available:", !!params?.createDocument);

      // AICODE-NOTE: Use economical defaults
      const defaultResolution = DEFAULT_VIDEO_RESOLUTION;
      const defaultStyle: MediaOption = {
        id: "flux_steampunk",
        label: "Steampunk",
        description: "Steampunk style",
      };
      const defaultShotSize =
        SHOT_SIZES.find((s: any) => s.id === "long-shot") || SHOT_SIZES[0];

      // AICODE-NOTE: Load models using new factory pattern
      console.log(
        "🎬 Loading video models from SuperDuperAI API via factory..."
      );
      const videoSettings = await createVideoMediaSettings();
      const availableModels = videoSettings.availableModels;

      console.log(
        "🎬 ✅ Loaded video models:",
        availableModels.map((m: any) => m.id)
      );

      // AICODE-NOTE: Use smart model selection that prioritizes text_to_video models like Sora!
      const bestModel: any = await getBestVideoModel({
        vipAllowed: true,
        requireTextToVideo: true, // Prioritize text_to_video for tools
      }); // Allow VIP models for better defaults

      const defaultModel: AdaptedModel = bestModel
        ? {
            ...bestModel,
            id: bestModel.name,
            label: bestModel.label || bestModel.name,
            description: `${bestModel.label || bestModel.name} - ${bestModel.type}`,
            value: bestModel.name,
            workflowPath: bestModel.params?.workflow_path || "",
            price: bestModel.params?.price_per_second || bestModel.price || 0,
            type: convertTypeToEnum(bestModel.type as string),
            source: convertSourceToEnum(bestModel.source as string),
          }
        : ((availableModels.find((m: any) => m.name === "azure-openai/sora") ||
            availableModels[0]) as any as AdaptedModel);

      console.log(
        "🎯 Smart default model selected:",
        defaultModel.label,
        "(type:",
        defaultModel.type,
        ")"
      );

      let styles: MediaOption[] = [];

      try {
        const response = await getStyles();
        if ("error" in response) {
          console.error(response.error);
        } else {
          styles = response.items.map((style: any) => ({
            id: style.name,
            label: style.title ?? style.name,
            description: style.title ?? style.name,
          }));
        }
      } catch (err) {
        console.log(err);
      }

      // If no prompt provided, return configuration panel
      if (!prompt) {
        console.log(
          "🔧 No prompt provided, returning video configuration panel"
        );
        const config: VideoGenerationConfig = {
          type: "video-generation-settings",
          availableResolutions: getModelCompatibleResolutions(
            defaultModel.name || defaultModel.id || ""
          ),
          availableStyles: styles,
          availableShotSizes: SHOT_SIZES,
          availableModels: availableModels,
          availableFrameRates: VIDEO_FRAME_RATES,
          defaultSettings: {
            resolution: getDefaultResolutionForModel(
              defaultModel.name || defaultModel.id || ""
            ),
            style: defaultStyle,
            shotSize: defaultShotSize,
            model: defaultModel,
            frameRate: 30,
            duration: DEFAULT_VIDEO_DURATION, // 5 seconds for economy
            negativePrompt: "",
            seed: undefined,
          },
        };
        return config;
      }

      console.log("🔧 ✅ PROMPT PROVIDED, CREATING VIDEO DOCUMENT:", prompt);
      console.log("🔧 ✅ PARAMS OBJECT:", !!params);
      console.log("🔧 ✅ CREATE DOCUMENT AVAILABLE:", !!params?.createDocument);

      if (!params?.createDocument) {
        console.log(
          "🔧 ❌ createDocument not available, returning basic config"
        );
        const config: VideoGenerationConfig = {
          type: "video-generation-settings",
          availableResolutions: getModelCompatibleResolutions(
            defaultModel.name || defaultModel.id || ""
          ),
          availableStyles: styles,
          availableShotSizes: SHOT_SIZES,
          availableModels: availableModels,
          availableFrameRates: VIDEO_FRAME_RATES,
          defaultSettings: {
            resolution: getDefaultResolutionForModel(
              defaultModel.name || defaultModel.id || ""
            ),
            style: defaultStyle,
            shotSize: defaultShotSize,
            model: defaultModel,
            frameRate: frameRate || 30,
            duration: duration || DEFAULT_VIDEO_DURATION,
            negativePrompt: negativePrompt || "",
            seed: undefined,
          },
        };
        return config;
      }

      try {
        // Find the selected model first (for resolution compatibility check)
        const selectedModel = model
          ? availableModels.find(
              (m: any) =>
                m.label === model ||
                m.id === model ||
                (m as any).apiName === model
            ) || defaultModel
          : defaultModel;

        // Get model-compatible resolutions
        const compatibleResolutions = getModelCompatibleResolutions(
          selectedModel.name || selectedModel.id || ""
        );

        // Find the selected resolution, but ensure it's compatible with the model
        let selectedResolution = defaultResolution;
        if (resolution) {
          const requestedResolution = VIDEO_RESOLUTIONS.find(
            (r: any) => r.label === resolution
          );
          if (requestedResolution) {
            // Check if requested resolution is compatible with the model
            const isCompatible = compatibleResolutions.some(
              (r: any) => r.label === requestedResolution.label
            );
            if (isCompatible) {
              selectedResolution = requestedResolution;
            } else {
              // Use model-compatible default instead
              selectedResolution = getDefaultResolutionForModel(
                selectedModel.name || selectedModel.id || ""
              );
              console.log(
                `🔧 ⚠️ Resolution ${resolution} not compatible with model ${selectedModel.name}, using ${selectedResolution.label} instead`
              );
            }
          }
        } else {
          // No resolution specified, use model-compatible default
          selectedResolution = getDefaultResolutionForModel(
            selectedModel.name || selectedModel.id || ""
          );
        }

        let selectedStyle: MediaOption = defaultStyle;
        if (style) {
          const foundStyle = findStyle(style, styles);
          if (foundStyle) {
            selectedStyle = foundStyle;
            console.log(
              "🔧 ✅ STYLE MATCHED:",
              style,
              "->",
              selectedStyle.label
            );
          } else {
            console.log(
              "🔧 ⚠️ STYLE NOT FOUND:",
              style,
              "using default:",
              defaultStyle.label
            );
            console.log(
              "🔧 📋 Available styles:",
              styles
                .map((s) => s.label)
                .slice(0, 5)
                .join(", "),
              "..."
            );

            // Additional fallback: try to find the most common style types
            const commonStyleFallbacks = [
              "flux_steampunk",
              "steampunk",
              "flux_realistic",
              "realistic",
              "flux_cinematic",
              "cinematic",
              "flux_anime",
              "anime",
              "flux_fantasy",
              "fantasy",
              "default",
            ];

            for (const fallbackId of commonStyleFallbacks) {
              const fallbackStyle = styles.find(
                (s) =>
                  s.id.toLowerCase().includes(fallbackId.toLowerCase()) ||
                  s.label.toLowerCase().includes(fallbackId.toLowerCase())
              );
              if (fallbackStyle) {
                selectedStyle = fallbackStyle;
                console.log(
                  "🔧 🔄 FALLBACK STYLE FOUND:",
                  fallbackId,
                  "->",
                  selectedStyle.label
                );
                break;
              }
            }

            // If still no style found, use the first available one
            if (selectedStyle === defaultStyle && styles.length > 0) {
              selectedStyle = styles[0];
              console.log(
                "🔧 🔄 USING FIRST AVAILABLE STYLE:",
                selectedStyle.label
              );
            }
          }
        } else {
          // No style specified, try to find a good default from available styles
          const preferredDefaults = [
            "flux_steampunk",
            "steampunk",
            "flux_realistic",
            "realistic",
          ];
          for (const preferredId of preferredDefaults) {
            const preferredStyle = styles.find(
              (s) =>
                s.id.toLowerCase().includes(preferredId.toLowerCase()) ||
                s.label.toLowerCase().includes(preferredId.toLowerCase())
            );
            if (preferredStyle) {
              selectedStyle = preferredStyle;
              console.log(
                "🔧 🎯 USING PREFERRED DEFAULT STYLE:",
                preferredStyle.label
              );
              break;
            }
          }

          // If no preferred default found, use first available
          if (selectedStyle === defaultStyle && styles.length > 0) {
            selectedStyle = styles[0];
            console.log(
              "🔧 🎯 USING FIRST AVAILABLE AS DEFAULT:",
              selectedStyle.label
            );
          }
        }

        const selectedShotSize = shotSize
          ? SHOT_SIZES.find((s: any) => s.label === shotSize || s.id === shotSize) ||
            defaultShotSize
          : defaultShotSize;

        // AICODE-NOTE: Check if selected model is image-to-video based on actual type field from API
        const isImageToVideoModel = selectedModel.type === "image_to_video";

        console.log("🔧 🎯 Model type check:", {
          modelId: selectedModel.id,
          modelName: selectedModel.label,
          apiType: selectedModel.type,
          isImageToVideo: isImageToVideoModel,
        });

        // AICODE-NOTE: Validate source image for image-to-video models
        if (isImageToVideoModel && !sourceImageId && !sourceImageUrl) {
          return {
            error: `The selected model "${selectedModel.label}" is an image-to-video model and requires a source image. Please provide either sourceImageId or sourceImageUrl parameter, or select a text-to-video model.`,
            suggestion:
              "You can use a recently generated image from this chat as the source, or upload a new image first.",
            availableTextToVideoModels: availableModels
              .filter(
                (m: any) => m.type === "text_to_video" || m.type !== "image_to_video"
              )
              .map((m: any) => `${m.label} (${m.id})`),
          };
        }

        // AICODE-NOTE: Auto-determine generation type for dual-mode compatibility
        const autoGenerationType =
          sourceImageId || sourceImageUrl ? "image-to-video" : "text-to-video";
        const finalGenerationType = generationType || autoGenerationType;

        console.log("🔧 🎯 Generation type determination:", {
          provided: generationType,
          autoDetected: autoGenerationType,
          final: finalGenerationType,
          hasSourceImage: !!(sourceImageId || sourceImageUrl),
        });

        // Create the video document with all parameters
        const videoParams = {
          prompt,
          negativePrompt: negativePrompt || "",
          style: selectedStyle,
          resolution: selectedResolution,
          shotSize: selectedShotSize,
          model: selectedModel,
          frameRate: frameRate || 30,
          duration: duration || DEFAULT_VIDEO_DURATION, // Use economical default
          sourceImageId: sourceImageId || undefined,
          sourceImageUrl: sourceImageUrl || undefined,
          generationType: finalGenerationType,
        };

        console.log("🔧 ✅ CREATING VIDEO DOCUMENT WITH PARAMS:", videoParams);

        // Check balance before creating artifact
        const operationType =
          finalGenerationType === "image-to-video"
            ? "image-to-video"
            : "text-to-video";
        const multipliers: string[] = [];

        // Add duration multipliers
        if (duration) {
          if (duration <= 5) multipliers.push("duration-5s");
          else if (duration <= 10) multipliers.push("duration-10s");
          else if (duration <= 15) multipliers.push("duration-15s");
          else if (duration <= 30) multipliers.push("duration-30s");
        } else {
          multipliers.push("duration-5s");
        }

        // Add quality multipliers
        if (
          selectedResolution.label.includes("HD") ||
          selectedResolution.label.includes("720")
        ) {
          multipliers.push("hd-quality");
        } else if (
          selectedResolution.label.includes("4K") ||
          selectedResolution.label.includes("2160")
        ) {
          multipliers.push("4k-quality");
        }

        const balanceCheck = await checkBalanceBeforeArtifact(
          params?.session || null,
          "video-generation",
          operationType,
          multipliers,
          getOperationDisplayName(operationType)
        );

        if (!balanceCheck.valid) {
          console.log("🔧 ❌ INSUFFICIENT BALANCE, NOT CREATING ARTIFACT");
          return {
            error:
              balanceCheck.userMessage ||
              "Недостаточно средств для генерации видео",
            balanceError: true,
            requiredCredits: balanceCheck.cost,
          };
        }

        if (params?.createDocument) {
          console.log("🔧 ✅ CALLING CREATE DOCUMENT WITH KIND: video");
          try {
            // Call createDocument with title that contains params for server parsing but shows only prompt to user
            const readableTitle = `Video: "${prompt}" ${JSON.stringify(videoParams)}`;
            const result = await params.createDocument.execute({
              title: readableTitle,
              kind: "video",
            });

            console.log("🔧 ✅ CREATE DOCUMENT RESULT:", result);

            return {
              ...result,
              message: `I'm creating a video with description: "${prompt}". Using economical HD settings (${selectedResolution.label}, ${duration || DEFAULT_VIDEO_DURATION}s) for cost efficiency. Artifact created and generation started.`,
            };
          } catch (error) {
            console.error("🔧 ❌ CREATE DOCUMENT ERROR:", error);
            console.error(
              "🔧 ❌ ERROR STACK:",
              error instanceof Error ? error.stack : "No stack"
            );
            throw error;
          }
        }

        console.log("🔧 ❌ CREATE DOCUMENT NOT AVAILABLE, RETURNING FALLBACK");
        // Fallback to simple message
        const readableTitle = `Video: "${prompt}" ${JSON.stringify(videoParams)}`;
        return {
          message: `I'll create a video with description: "${prompt}". However, artifact cannot be created - createDocument unavailable.`,
          parameters: {
            title: readableTitle,
            kind: "video",
          },
        };
      } catch (error: any) {
        console.error("🔧 ❌ ERROR CREATING VIDEO DOCUMENT:", error);
        return {
          error: `Failed to create video document: ${error.message}`,
          fallbackConfig: {
            type: "video-generation-settings",
            availableResolutions: getModelCompatibleResolutions(
              defaultModel.name || defaultModel.id || ""
            ),
            availableStyles: styles,
            availableShotSizes: SHOT_SIZES,
            availableModels: availableModels,
            availableFrameRates: VIDEO_FRAME_RATES,
            defaultSettings: {
              resolution: getDefaultResolutionForModel(
                defaultModel.name || defaultModel.id || ""
              ),
              style: defaultStyle,
              shotSize: defaultShotSize,
              model: defaultModel,
              frameRate: frameRate || 30,
              duration: duration || DEFAULT_VIDEO_DURATION,
              negativePrompt: negativePrompt || "",
              seed: undefined,
            },
          },
        };
      }
    },
  });
