import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { storeSessionData, type SessionData } from "@/lib/kv";

// Helper function to convert File to base64 (Node.js compatible)
async function fileToBase64(file: File): Promise<string> {
  // Convert File to Buffer and then to base64
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    // Проверяем Content-Type для определения типа запроса
    const contentType = request.headers.get("content-type");

    let priceId: string;
    let quantity = 1;
    let prompt: string | undefined;
    let toolSlug: string | undefined;
    let toolTitle: string | undefined;
    let cancelUrl: string | undefined;
    let generationType:
      | "text-to-video"
      | "image-to-video"
      | "text-to-image"
      | "image-to-image" = "text-to-video";
    let successUrl: string | undefined;
    let modelName: string | undefined;
    let imageFile: File | undefined;

    if (contentType && contentType.includes("multipart/form-data")) {
      // Обрабатываем FormData
      const formData = await request.formData();
      priceId = formData.get("priceId") as string;
      quantity = parseInt(formData.get("quantity") as string) || 1;
      prompt = formData.get("prompt") as string;
      toolSlug = formData.get("toolSlug") as string;
      toolTitle = formData.get("toolTitle") as string;
      cancelUrl = formData.get("cancelUrl") as string;
      const generationTypeStr = formData.get("generationType") as string;
      if (
        generationTypeStr &&
        [
          "text-to-video",
          "image-to-video",
          "text-to-image",
          "image-to-image",
        ].includes(generationTypeStr)
      ) {
        generationType = generationTypeStr as
          | "text-to-video"
          | "image-to-video"
          | "text-to-image"
          | "image-to-image";
      }
      successUrl = formData.get("successUrl") as string;
      modelName = formData.get("modelName") as string;

      // Получаем файл изображения
      const file = formData.get("imageFile") as File;
      if (file) {
        imageFile = file;
        console.log("📁 Received image file:", file.name, file.size, file.type);
      }
    } else {
      // Обрабатываем JSON (для обратной совместимости)
      const body = await request.json();
      priceId = body.priceId;
      quantity = body.quantity || 1;
      prompt = body.prompt;
      toolSlug = body.toolSlug;
      toolTitle = body.toolTitle;
      cancelUrl = body.cancelUrl;
      if (
        body.generationType &&
        [
          "text-to-video",
          "image-to-video",
          "text-to-image",
          "image-to-image",
        ].includes(body.generationType)
      ) {
        generationType = body.generationType as
          | "text-to-video"
          | "image-to-video"
          | "text-to-image"
          | "image-to-image";
      }
      successUrl = body.successUrl;
      modelName = body.modelName;
      imageFile = body.imageFile;
    }

    // Get the app URL with proper fallback
    const getAppUrl = () => {
      // First try NEXT_PUBLIC_APP_URL (manually set)
      if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
      }

      // Then try VERCEL_URL (automatically set by Vercel)
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
      }

      // Finally fallback to localhost for development
      return "http://localhost:3000";
    };

    const appUrl = getAppUrl();
    console.log("🔗 Using app URL:", appUrl);

    // Логируем полученные данные
    console.log("📥 Received checkout data:", {
      priceId,
      quantity,
      prompt:
        prompt?.substring(0, 50) + (prompt && prompt.length > 50 ? "..." : ""),
      toolSlug,
      toolTitle,
      generationType,
      modelName,
      imageFile: imageFile
        ? {
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type,
          }
        : null,
    });

    // Store everything in Redis, keep Stripe metadata minimal
    const sessionData: SessionData = {
      prompt: prompt || "",
      videoCount: quantity,
      duration: 8,
      resolution: "1920x1080",
      style: "cinematic",
      toolSlug: toolSlug || "veo3-prompt-generator",
      toolTitle: toolTitle || "Free VEO3 Viral Prompt Generator",
      cancelUrl: cancelUrl || "",
      createdAt: new Date().toISOString(),
      status: "pending" as const,
      // Добавляем информацию для перенаправления на страницу генерации
      modelName: modelName || "",
      // Новые поля для поддержки image-to-video
      generationType,
      // Преобразуем File в сериализуемый объект только если файл существует
      ...(imageFile && {
        imageFile: {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type,
          lastModified: imageFile.lastModified,
          // Сохраняем содержимое файла как base64 для передачи в webhook
          content: await fileToBase64(imageFile),
        },
      }),
    };

    // Minimal Stripe metadata - only essential info
    const metadata = {
      video_count: quantity.toString(),
      tool: "veo3-generator",
    };

    // Определяем правильный URL для перенаправления
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url:
        successUrl || `${appUrl}/en/payment-success/{CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${appUrl}/en/tool/veo3-prompt-generator`,
      metadata,
    });

    // Store complete session data in Redis
    try {
      await storeSessionData(session.id, sessionData);
      console.log("💾 Session data stored in Redis:", session.id);
    } catch (error) {
      console.error("❌ Failed to store session data in Redis:", error);
      // This is critical - if we can't store session data, webhook will fail
      throw new Error("Failed to store session data");
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
