import { createDocumentHandler } from "@/lib/artifacts/server";
import { generateImageWithStrategy } from "@turbo-super/api";
import { getSuperduperAIConfig } from "@/lib/config/superduperai";
import { getStyles } from "@/lib/ai/api/get-styles";
import type { MediaOption, MediaResolution } from "@/lib/types/media-settings";
import type { ImageModel } from "@/lib/config/superduperai";
import { getAvailableImageModels } from "@/lib/config/superduperai";
import { selectImageToImageModel } from "@/lib/generation/model-utils";
import { getMessagesByChatId } from "@/lib/db/queries";
import {
  deductOperationBalance,
} from "@/lib/utils/tools-balance";

// Import the same constants as in configure-image-generation
const RESOLUTIONS: MediaResolution[] = [
  {
    width: 1344,
    height: 768,
    label: "1344x768",
    aspectRatio: "16:9",
    qualityType: "hd",
  },
  {
    width: 1920,
    height: 1080,
    label: "1920×1080",
    aspectRatio: "16:9",
    qualityType: "full_hd",
  },
  {
    width: 1664,
    height: 1216,
    label: "1664x1216",
    aspectRatio: "4:3",
    qualityType: "full_hd",
  },
  {
    width: 1152,
    height: 896,
    label: "1152x896",
    aspectRatio: "4:3",
    qualityType: "hd",
  },
  {
    width: 1024,
    height: 1024,
    label: "1024x1024",
    aspectRatio: "1:1",
    qualityType: "hd",
  },
  {
    width: 1408,
    height: 1408,
    label: "1408×1408",
    aspectRatio: "1:1",
    qualityType: "full_hd",
  },
  {
    width: 1408,
    height: 1760,
    label: "1408×1760",
    aspectRatio: "4:5",
    qualityType: "full_hd",
  },
  {
    width: 1024,
    height: 1280,
    label: "1024x1280",
    aspectRatio: "4:5",
    qualityType: "hd",
  },
  {
    width: 1080,
    height: 1920,
    label: "1080×1920",
    aspectRatio: "9:16",
    qualityType: "full_hd",
  },
  {
    width: 768,
    height: 1344,
    label: "768x1344",
    aspectRatio: "9:16",
    qualityType: "hd",
  },
];

const SHOT_SIZES: MediaOption[] = [
  {
    id: "extreme_long_shot",
    label: "Extreme Long Shot",
    description: "Shows vast landscapes or cityscapes with tiny subjects",
  },
  {
    id: "long_shot",
    label: "Long Shot",
    description: "Shows full body of subject with surrounding environment",
  },
  {
    id: "medium_shot",
    label: "Medium Shot",
    description: "Shows subject from waist up, good for conversations",
  },
  {
    id: "medium_close_up",
    label: "Medium Close-Up",
    description: "Shows subject from chest up, good for portraits",
  },
  {
    id: "close_up",
    label: "Close-Up",
    description: "Shows a subject's face or a small object in detail",
  },
  {
    id: "extreme_close_up",
    label: "Extreme Close-Up",
    description:
      "Shows extreme detail of a subject, like eyes or small objects",
  },
  {
    id: "two_shot",
    label: "Two-Shot",
    description: "Shows two subjects in frame, good for interactions",
  },
  {
    id: "detail_shot",
    label: "Detail Shot",
    description: "Focuses on a specific object or part of a subject",
  },
];

// AICODE-NOTE: IMAGE_MODELS now loaded dynamically from API via getAvailableImageModels()

export const imageDocumentHandler = createDocumentHandler<"image">({
  kind: "image",
  onCreateDocument: async ({ id: chatId, title, dataStream, session }) => {
    let draftContent = "";
    try {
      // Parse the title to extract image generation parameters
      const params = JSON.parse(title);
      const {
        prompt,
        style = { id: "flux_steampunk", label: "Steampunk" },
        resolution = {
          width: 1024,
          height: 1024,
          label: "1024x1024",
          aspectRatio: "1:1",
          qualityType: "hd",
        },
        model = { id: "flux-dev", label: "Flux Dev" },
        // Use label form for shot size to match API enum expectations
        shotSize = { id: "Medium Shot", label: "Medium Shot" },
        negativePrompt = "",
        seed,
        batchSize,
      } = params;

      // Balance check is now done in AI tools before artifact creation
      // No need for balance validation here as it's already checked

      // Load dynamic models from SuperDuperAI API
      let availableModels: ImageModel[] = [];
      try {
        availableModels = await getAvailableImageModels();
      } catch (error) {
        console.error("🎨 ❌ Failed to load dynamic models:", error);
        availableModels = await getAvailableImageModels();
      }

      // Get available styles from API
      let availableStyles: MediaOption[] = [];
      try {
        const response = await getStyles();
        if ("error" in response) {
          console.error("🎨 ❌ FAILED TO GET STYLES:", response.error);
        } else {
          availableStyles = response.items.map((style) => ({
            id: style.name,
            label: style.title ?? style.name,
          }));
        }
      } catch (err) {
        console.error("🎨 ❌ ERROR GETTING STYLES:", err);
      }

      // Resolve source image URL (support attachment:// and missing param via chat history)
      const config = getSuperduperAIConfig();
      let effectiveSourceImageUrl: string | undefined = params.sourceImageUrl;

      console.log("🔍 Image artifact: resolving source image URL:", {
        sourceImageUrl: params.sourceImageUrl,
        chatId,
        needsResolve:
          !effectiveSourceImageUrl ||
          effectiveSourceImageUrl.startsWith("attachment://"),
      });

      try {
        const needsResolve =
          !effectiveSourceImageUrl ||
          effectiveSourceImageUrl.startsWith("attachment://");
        if (needsResolve) {
          const history = await getMessagesByChatId({ id: chatId });
          console.log("🔍 Image artifact: searching chat history:", {
            historyLength: history.length,
          });

          for (let i = history.length - 1; i >= 0; i--) {
            const m = history[i] as any;
            console.log("🔍 Image artifact: checking message:", {
              role: m.role,
              hasAttachments: !!m.attachments,
              attachmentsLength: m.attachments?.length || 0,
              attachments: m.attachments,
            });

            if (m.role === "user" && Array.isArray(m.attachments)) {
              const img = m.attachments.find(
                (a: any) =>
                  typeof a?.url === "string" &&
                  /^https?:\/\//.test(a.url) &&
                  String(a?.contentType || "").startsWith("image/")
              );
              if (img?.url) {
                effectiveSourceImageUrl = img.url;
                console.log(
                  "🔍 Image artifact: found source image in history:",
                  img.url
                );
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error(
          "🔍 Image artifact: error searching chat history:",
          error
        );
      }

      // Decide generation type based on resolved source URL
      const generationType = effectiveSourceImageUrl
        ? "image-to-image"
        : "text-to-image";

      console.log("🔍 Image artifact: generation type determined:", {
        effectiveSourceImageUrl,
        generationType,
      });

      // If image-to-image, create File object from URL instead of uploading
      let sourceFile: File | undefined = undefined;
      if (
        generationType === "image-to-image" &&
        effectiveSourceImageUrl &&
        /^https?:\/\//.test(effectiveSourceImageUrl)
      ) {
        try {
          const resp = await fetch(effectiveSourceImageUrl);
          if (!resp.ok)
            throw new Error(`Failed to fetch source image: ${resp.status}`);
          const blob = await resp.blob();
          const filename =
            effectiveSourceImageUrl.split("/").pop() || "source-image.jpg";
          sourceFile = new File([blob], filename, { type: blob.type });
          console.log("🔍 Image artifact: created File object from URL:", {
            filename,
            size: sourceFile.size,
            type: sourceFile.type,
          });
        } catch (e) {
          console.error(
            "🎨 ❌ Failed to create File from source image URL:",
            e
          );
        }
      }

      // Remap model for image-to-image if needed (e.g., inpainting variant)
      let modelForGeneration: any = model;
      if (generationType === "image-to-image") {
        try {
          const rawName = (model as any)?.name || (model as any)?.id || "";
          const availableModels = await getAvailableImageModels();
          console.log("🔍 Image artifact: remapping model for img2img:", {
            originalModel: rawName,
            availableModels: availableModels.map((m) => m.name),
          });

          const mapped = await selectImageToImageModel(
            rawName,
            getAvailableImageModels,
            { allowInpainting: true }
          );

          // Force fal-ai/flux-pro/kontext for img2img as it's proven to work
          const kontextModel = availableModels.find(
            (m) => m.name === "fal-ai/flux-pro/kontext"
          );

          if (kontextModel) {
            modelForGeneration = {
              ...(model as any),
              name: kontextModel.name,
            };
            console.log(
              "🔍 Image artifact: FORCED kontext model for img2img:",
              kontextModel.name
            );
          } else {
            // Fallback to mapped model if kontext not available
            if (mapped) {
              modelForGeneration = { ...(model as any), name: mapped };
              console.log(
                "🔍 Image artifact: fallback to mapped model:",
                mapped
              );
            } else {
              console.log(
                "🔍 Image artifact: kontext model not found, using original:",
                rawName
              );
            }
          }
        } catch (error) {
          console.error("🔍 Image artifact: error remapping model:", error);
        }
      }
      // For image-to-image: require sourceFile and send minimal payload (no style/resolution/shotSize)
      if (generationType === "image-to-image" && !sourceFile) {
        draftContent = JSON.stringify({
          status: "failed",
          error:
            "Failed to get source image for image-to-image (attachment did not resolve to URL)",
          prompt,
        });
        return draftContent;
      }

      const generationParams: any = {
        prompt,
        model: modelForGeneration,
        negativePrompt,
        seed,
        batchSize,
      };
      if (generationType === "image-to-image") {
        generationParams.file = sourceFile;
        if (
          effectiveSourceImageUrl &&
          /^https?:\/\//.test(effectiveSourceImageUrl)
        ) {
          generationParams.sourceImageUrl = effectiveSourceImageUrl;
        }
        // Add default resolution for img2img to prevent NaN values in SDK
        // Use 1024x1024 as it's proven to work with fal-ai/flux-pro/kontext
        generationParams.resolution = {
          width: 1024,
          height: 1024,
        };
      } else {
        generationParams.style = style;
        generationParams.resolution = resolution;
        generationParams.shotSize = shotSize;
      }

      console.log(
        "🔍 Image artifact: calling generateImageWithStrategy with params:",
        {
          generationType,
          generationParams,
          config: {
            url: config.url,
            hasToken: !!config.token,
          },
        }
      );

      const result = await generateImageWithStrategy(
        generationType,
        generationParams,
        config
      );

      console.log("🔍 Image artifact: generateImageWithStrategy result:", {
        success: result.success,
        projectId: result.projectId,
        requestId: result.requestId,
        fileId: result.fileId,
        error: result.error,
      });

      // AICODE-DEBUG: API payload removed to reduce duplication
      // If needed for debugging, can be reconstructed from stored parameters

      if (!result.success) {
        draftContent = JSON.stringify({
          status: "failed",
          error: result.error,
          prompt: prompt,
        });
        return draftContent;
      }

      // Формируем content только с выбранными параметрами (без available опций для оптимизации)
      draftContent = JSON.stringify({
        status: "pending",
        projectId: result.projectId || chatId,
        requestId: result.requestId,
        fileId: result.fileId,
        prompt: prompt,
        // Store only selected values, not all available options
        style,
        resolution,
        model,
        shotSize,
        negativePrompt,
        seed,
        batchSize,
        timestamp: Date.now(),
        message:
          result.message ||
          "Image generation started, connecting to WebSocket...",
      });

      // Deduct balance after successful generation start
      if (session?.user?.id) {
        try {
          const operationType = generationType;
          const multipliers: string[] = [];

          // Check style for quality multipliers
          if (style?.id?.includes("high-quality"))
            multipliers.push("high-quality");
          if (style?.id?.includes("ultra-quality"))
            multipliers.push("ultra-quality");

          await deductOperationBalance(
            session.user.id,
            "image-generation",
            operationType,
            multipliers,
            {
              projectId: result.projectId,
              fileId: result.fileId,
              prompt: prompt.substring(0, 100),
              operationType,
              timestamp: new Date().toISOString(),
            }
          );
          console.log(
            `💳 Balance deducted for user ${session.user.id} after image generation start`
          );
        } catch (balanceError) {
          console.error(
            "⚠️ Failed to deduct balance after image generation:",
            balanceError
          );
          // Continue - image generation already started
        }
      }
    } catch (error: any) {
      console.error("🎨 ❌ IMAGE GENERATION ERROR:", error);
      draftContent = JSON.stringify({
        status: "failed",
        error: error?.message || "Failed to parse image parameters",
      });
    }
    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = document.content;
    try {
      // Check if document already has completed content - don't recreate if so
      if (draftContent) {
        try {
          const existingContent = JSON.parse(draftContent);
          if (
            existingContent.status === "completed" &&
            existingContent.imageUrl
          ) {
            console.log(
              "🎨 ⚠️ Document already completed with image, skipping update to prevent reset"
            );
            return draftContent; // Return existing content without recreating
          }
        } catch (parseError) {
          // If we can't parse existing content, proceed with update
          console.log(
            "🎨 ℹ️ Could not parse existing content, proceeding with update"
          );
        }
      }
      // Extract chatId from document.id (which should be the chat ID)
      const chatId = document.id;
      // Parse the description to extract new image generation parameters
      const params = JSON.parse(description);
      const {
        prompt,
        style = { id: "flux_steampunk", label: "Steampunk" },
        resolution = {
          width: 1024,
          height: 1024,
          label: "1024x1024",
          aspectRatio: "1:1",
          qualityType: "hd",
        },
        model = { id: "flux-dev", label: "Flux Dev" },
        // Use label form for shot size to match API enum expectations
        shotSize = { id: "Medium Shot", label: "Medium Shot" },
        negativePrompt = "",
        seed,
        batchSize,
      } = params;
      // Start image generation using new architecture
      // NOTE: onUpdateDocument doesn't have access to session, so using system token fallback
      const config = getSuperduperAIConfig();
      // Resolve source image URL again for update flow
      let effectiveSourceImageUrl: string | undefined = params.sourceImageUrl;
      try {
        const needsResolve =
          !effectiveSourceImageUrl ||
          effectiveSourceImageUrl.startsWith("attachment://");
        if (needsResolve) {
          const history = await getMessagesByChatId({ id: chatId });
          for (let i = history.length - 1; i >= 0; i--) {
            const m = history[i] as any;
            if (m.role === "user" && Array.isArray(m.attachments)) {
              const img = m.attachments.find(
                (a: any) =>
                  typeof a?.url === "string" &&
                  /^https?:\/\//.test(a.url) &&
                  String(a?.contentType || "").startsWith("image/")
              );
              if (img?.url) {
                effectiveSourceImageUrl = img.url;
                break;
              }
            }
          }
        }
      } catch (_) {}

      const generationType = effectiveSourceImageUrl
        ? "image-to-image"
        : "text-to-image";

      // If img2img with source URL, create File object instead of uploading
      let sourceFile: File | undefined = undefined;
      if (
        generationType === "image-to-image" &&
        effectiveSourceImageUrl &&
        /^https?:\/\//.test(effectiveSourceImageUrl)
      ) {
        try {
          const resp = await fetch(effectiveSourceImageUrl);
          if (!resp.ok)
            throw new Error(`Failed to fetch source image: ${resp.status}`);
          const blob = await resp.blob();
          const filename =
            effectiveSourceImageUrl.split("/").pop() || "source-image.jpg";
          sourceFile = new File([blob], filename, { type: blob.type });
          console.log(
            "🔍 Image artifact update: created File object from URL:",
            {
              filename,
              size: sourceFile.size,
              type: sourceFile.type,
            }
          );
        } catch (e) {
          console.error(
            "🎨 ❌ Failed to create File from source image URL:",
            e
          );
        }
      }

      // Remap model for image-to-image
      let modelForUpdate: any = model;
      if (generationType === "image-to-image") {
        try {
          const rawName = (model as any)?.name || (model as any)?.id || "";
          const mapped = await selectImageToImageModel(
            rawName,
            getAvailableImageModels,
            { allowInpainting: true }
          );
          if (mapped) {
            modelForUpdate = { ...(model as any), name: mapped };
          }
        } catch (_) {}
      }
      if (generationType === "image-to-image" && !sourceFile) {
        draftContent = JSON.stringify({
          status: "failed",
          error:
            "Failed to get source image for image-to-image (attachment did not resolve to URL)",
          prompt,
        });
        return draftContent;
      }

      const updateParams: any = {
        prompt,
        model: modelForUpdate,
        negativePrompt,
        seed,
        batchSize,
      };
      if (generationType === "image-to-image") {
        updateParams.file = sourceFile;
        if (
          effectiveSourceImageUrl &&
          /^https?:\/\//.test(effectiveSourceImageUrl)
        ) {
          updateParams.sourceImageUrl = effectiveSourceImageUrl;
        }
      } else {
        updateParams.style = style;
        updateParams.resolution = resolution;
        updateParams.shotSize = shotSize;
      }

      const result = await generateImageWithStrategy(
        generationType,
        updateParams,
        config
      );
      if (!result.success) {
        draftContent = JSON.stringify({
          status: "failed",
          error: result.error,
          prompt: prompt,
        });
        return draftContent;
      }
      draftContent = JSON.stringify({
        status: "pending",
        projectId: result.projectId || chatId,
        requestId: result.requestId,
        fileId: result.fileId,
        prompt: prompt,
        // Store only selected values, not all available options
        style,
        resolution,
        model,
        shotSize,
        negativePrompt,
        seed,
        batchSize,
        timestamp: Date.now(),
        message:
          result.message ||
          "Image generation started, connecting to WebSocket...",
      });
    } catch (error: any) {
      console.error("🎨 ❌ IMAGE GENERATION ERROR:", error);
      draftContent = JSON.stringify({
        status: "failed",
        error: error?.message || "Failed to update image parameters",
      });
    }
    return draftContent;
  },
});
