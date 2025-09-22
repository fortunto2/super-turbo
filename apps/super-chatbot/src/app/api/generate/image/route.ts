import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getSuperduperAIConfigWithUserToken } from "@/lib/config/superduperai";
import {
  generateImageWithStrategy,
  type ImageGenerationParams,
} from "@turbo-super/api";
import {
  ensureNonEmptyPrompt,
  selectImageToImageModel,
} from "@/lib/generation/model-utils";

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
          return { width: Number.parseInt(w), height: Number.parseInt(h) };
        })(),
        style: { id: String(form.get("style") || "flux_watercolor") },
        shotSize: { id: String(form.get("shotSize") || "medium_shot") },
        seed: form.get("seed") ? Number(form.get("seed")) : undefined,
        chatId: form.get("chatId") || "image-generator-tool",
        generationType: "image-to-image",
        file: form.get("file") as File,
        mask: form.get("mask") as File,
        sourceImageId: form.get("sourceImageId") as string,
        sourceImageUrl: form.get("sourceImageUrl") as string,
        projectId: form.get("projectId"),
        sceneId: form.get("sceneId"),
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
    const config = getSuperduperAIConfigWithUserToken(session);

    const normalizeShotSize = (val: any) => {
      const raw = typeof val === "string" ? val : val?.id || val?.label || "";
      if (!raw) return undefined;
      // If already has spaces and capitalized, keep as is
      if (/[A-Z][a-z]+\s[A-Z][a-z]+/.test(raw)) return raw;
      // Convert snake_case to Title Case with space
      const pretty = String(raw)
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return pretty;
    };

    // Normalize shotSize for API (avoid 422)
    if (body.shotSize) {
      const pretty = normalizeShotSize(body.shotSize);
      if (pretty) {
        body.shotSize = { id: pretty };
      }
    }
    // Ensure non-empty prompt to avoid backend stalling
    body.prompt = ensureNonEmptyPrompt(body.prompt, "Enhance this image");

    // Create image generation config using OpenAPI types

    let result;

    if (body.generationType === "image-to-image") {
      try {
        const { getAvailableImageModels } = await import(
          "@/lib/config/superduperai"
        );
        const rawName =
          typeof body.model === "string"
            ? (body.model as string)
            : String(body.model?.name || "");
        const mapped = await selectImageToImageModel(
          rawName,
          getAvailableImageModels,
          {
            allowInpainting:
              /inpaint/i.test(rawName) ||
              Boolean(body.mask) ||
              Boolean(body.editingMode),
          }
        );
        if (mapped) {
          console.log(
            `🎯 Using image_to_image generation config: ${mapped} (was: ${rawName})`
          );
          body.model = { name: mapped };
        }
        const strategyParams: ImageGenerationParams = {
          ...body,
        };
        result = await generateImageWithStrategy(
          "image-to-image",
          strategyParams,
          config
        );
      } catch (e) {
        console.warn("⚠️ Failed to remap model for image_to_image (cache):", e);
      }
    } else {
      const strategyParams: ImageGenerationParams = {
        ...body,
      };
      // Use OpenAPI client to generate image
      result = await generateImageWithStrategy(
        "text-to-image",
        strategyParams,
        config
      );
    }

    console.log("✅ Image generation result:", result);

    // Check if generation was successful
    if (!result?.success) {
      console.log("❌ Image generation failed");
      return NextResponse.json(
        {
          success: false,
          error: result?.error || "Image generation failed",
        },
        { status: 500 }
      );
    }

    // Note: Balance is deducted in artifacts/image/server.ts when creating the artifact
    // No need to deduct here to avoid double deduction

    const response = {
      success: true,
      fileId: result.fileId,
      maskId: result?.maskId,
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
