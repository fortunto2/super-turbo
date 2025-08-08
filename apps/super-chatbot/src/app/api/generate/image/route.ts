import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getSuperduperAIConfigWithUserToken,
  getSuperduperAIConfig,
} from "@/lib/config/superduperai";
import { OpenAPI } from "@/lib/api/core/OpenAPI";
import {
  generateImageWithStrategy,
  ImageGenerationParams,
  ImageToImageParams,
} from "@turbo-super/superduperai-api";

import { validateOperationBalance } from "@/lib/utils/tools-balance";
import { createBalanceErrorResponse } from "@/lib/utils/balance-error-handler";

export async function POST(request: NextRequest) {
  try {
    // Check authentication first
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");

    let body: any;
    if (isMultipart) {
      const form = await request.formData();
      body = {
        prompt: form.get("prompt"),
        model: { name: String(form.get("model") || "comfyui/flux") },
        resolution: (() => {
          const res = String(form.get("resolution") || "1024x1024");
          const [w, h] = res.split("x");
          return { width: parseInt(w), height: parseInt(h) };
        })(),
        style: { id: String(form.get("style") || "flux_watercolor") },
        shotSize: { id: String(form.get("shotSize") || "medium_shot") },
        seed: form.get("seed") ? Number(form.get("seed")) : undefined,
        chatId: form.get("chatId") || "image-generator-tool",
        generationType: "image-to-image",
        file: form.get("file") as File,
      };
    } else {
      body = await request.json();
    }

    console.log("🖼️ Image API: Processing image generation request");
    console.log("📦 Request parameters:", JSON.stringify(body, null, 2));

    // Validate user balance before proceeding
    const userId = session.user.id;
    const generationType = body.generationType || "text-to-image";

    // Determine cost multipliers based on request
    const multipliers: string[] = [];
    if (body.style?.id === "high-quality") multipliers.push("high-quality");
    if (body.style?.id === "ultra-quality") multipliers.push("ultra-quality");

    const balanceValidation = await validateOperationBalance(
      userId,
      "image-generation",
      generationType,
      multipliers
    );

    if (!balanceValidation.valid) {
      const errorResponse = createBalanceErrorResponse(
        balanceValidation,
        generationType
      );
      return NextResponse.json(errorResponse, { status: 402 });
    }

    console.log(
      `💳 User ${userId} has sufficient balance for ${generationType} (${balanceValidation.cost} credits)`
    );

    const { chatId } = body;

    // Configure OpenAPI client with user token from session (with system token fallback)
    console.log("SESSION USER", session);
    let config = getSuperduperAIConfigWithUserToken(session);

    // If using user token, ensure user exists in SuperDuperAI
    if (config.isUserToken && session?.user?.email) {
      console.log(
        `🔍 Checking if user ${session.user.email} exists in SuperDuperAI...`
      );
      try {
        // Use system token to check if user exists (more reliable)
        const systemConfig = getSuperduperAIConfig();
        const testUrl = `${config.url}/api/v1/user/profile`;
        console.log(`🔍 Testing SuperDuperAI endpoint: ${testUrl}`);

        const testResponse = await fetch(testUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${systemConfig.token}`,
            "Content-Type": "application/json",
          },
        });

        console.log(
          `🔍 SuperDuperAI user check response: ${testResponse.status} ${testResponse.statusText}`
        );

        if (!testResponse.ok) {
          console.log(
            `⚠️ User ${session.user.email} not found in SuperDuperAI (${testResponse.status}), falling back to system token`
          );
          // Fall back to system token
          config = { ...config, token: systemConfig.token, isUserToken: false };
          OpenAPI.BASE = systemConfig.url;
          OpenAPI.TOKEN = systemConfig.token;
          console.log("🔄 Switched to system token for SuperDuperAI");
        } else {
          console.log(
            `✅ User ${session.user.email} exists in SuperDuperAI, using user token`
          );
          // User exists, but we'll still use system token for now since user token seems to be invalid
          config = { ...config, token: systemConfig.token, isUserToken: false };
          OpenAPI.BASE = systemConfig.url;
          OpenAPI.TOKEN = systemConfig.token;
          console.log(
            "🔄 Using system token for SuperDuperAI (user token validation pending)"
          );
        }
      } catch (error) {
        console.log(`❌ Error checking user existence in SuperDuperAI:`, error);
        console.log(`🔄 Falling back to system token due to error`);
        // Fall back to system token on error
        const systemConfig = getSuperduperAIConfig();
        config = { ...config, token: systemConfig.token, isUserToken: false };
        OpenAPI.BASE = systemConfig.url;
        OpenAPI.TOKEN = systemConfig.token;
      }
    } else {
      OpenAPI.BASE = config.url;
      OpenAPI.TOKEN = config.token;
    }

    // If multipart with file: upload image first to obtain sourceImageId
    if (body.generationType === "image-to-image" && body.file instanceof File) {
      try {
        const fd = new FormData();
        fd.append("payload", body.file);
        fd.append("type", "image");

        const uploadResp = await fetch(`${config.url}/api/v1/file/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.token}`,
            "User-Agent": "SuperDuperAI-Chatbot/1.0",
          },
          body: fd,
        });

        if (!uploadResp.ok) {
          const txt = await uploadResp.text();
          throw new Error(`Upload failed: ${uploadResp.status} ${txt}`);
        }
        const up = await uploadResp.json();
        console.log("🖼️ Upload success, imageId:", up?.id);
        if (up?.id) {
          body.sourceImageId = up.id as string;
        }
      } catch (e) {
        console.error("❌ Image upload failed before generation:", e);
        return NextResponse.json(
          { success: false, error: "Image upload failed" },
          { status: 400 }
        );
      } finally {
        // prevent duplicate uploads by strategy
        delete body.file;
      }
    }

    // Normalize model for image-to-image: select proper image_to_image generation config (via cached models)
    if (body.generationType === "image-to-image") {
      try {
        const { getAvailableImageModels } = await import(
          "@/lib/config/superduperai"
        );
        const allImageModels = await getAvailableImageModels();
        // Prefer non-inpainting configs unless explicitly requested
        const allI2I = allImageModels.filter(
          (m: any) => m.type === "image_to_image"
        );

        const rawName =
          typeof body.model === "string"
            ? (body.model as string)
            : String(body.model?.name || "");
        const baseToken = rawName.toLowerCase().includes("flux")
          ? "flux"
          : rawName.split("/").pop()?.split("-")[0] || rawName.toLowerCase();

        const wantsInpainting =
          /inpaint/i.test(rawName) ||
          Boolean(body.mask) ||
          Boolean(body.editingMode);
        const candidates = wantsInpainting
          ? allI2I
          : allI2I.filter((m: any) => !/inpaint/i.test(String(m.name || "")));

        let pick = candidates.find(
          (m: any) =>
            String(m.name || "").toLowerCase() === rawName.toLowerCase() ||
            String(m.label || "").toLowerCase() === rawName.toLowerCase()
        );
        if (!pick && baseToken) {
          pick = candidates.find(
            (m: any) =>
              String(m.name || "")
                .toLowerCase()
                .includes(baseToken) ||
              String(m.label || "")
                .toLowerCase()
                .includes(baseToken)
          );
        }
        if (!pick && candidates.length > 0) pick = candidates[0];

        if (pick?.name) {
          console.log(
            `🎯 Using image_to_image generation config: ${pick.name} (was: ${rawName})`
          );
          body.model = { name: pick.name };
        }
      } catch (e) {
        console.warn("⚠️ Failed to remap model for image_to_image (cache):", e);
      }
    }

    // Ensure non-empty prompt to avoid backend stalling
    if (!body.prompt || String(body.prompt).trim().length === 0) {
      body.prompt = "Enhance this image";
    }

    // Create image generation config using OpenAPI types
    const strategyParams: ImageGenerationParams | ImageToImageParams = {
      ...body,
    };

    // Use OpenAPI client to generate image
    const result = await generateImageWithStrategy(
      generationType,
      strategyParams,
      config
    );

    console.log("✅ Image generation result:", result);

    // Check if generation was successful
    if (!result.success) {
      console.log("❌ Image generation failed");
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Image generation failed",
        },
        { status: 500 }
      );
    }

    // Note: Balance is deducted in artifacts/image/server.ts when creating the artifact
    // No need to deduct here to avoid double deduction

    const response = {
      success: true,
      fileId: result.fileId,
      projectId: result.projectId || chatId,
      url: result.url,
      message: result.message,
      creditsUsed: balanceValidation.cost,
      usingUserToken: config.isUserToken,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 Image API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Specific handling for backend magic library error
    if (
      errorMessage.includes("magic") ||
      errorMessage.includes("AttributeError")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Backend file processing error",
          details:
            "The SuperDuperAI service is experiencing issues with file type detection. Please try using a different image format (PNG, JPG, WEBP) or try again later.",
        },
        { status: 500 }
      );
    }

    // Handle image upload failures specifically
    if (errorMessage.includes("upload") || errorMessage.includes("image")) {
      return NextResponse.json(
        {
          success: false,
          error: "Image processing failed",
          details:
            "Failed to process the source image. Please try using a different image or check the file format (PNG, JPG, WEBP supported).",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate Image",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
