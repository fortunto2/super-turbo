import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getSessionData, updateSessionData } from "@/lib/kv";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// SuperDuperAI configuration
const configureSuperduperAI = () => {
  if (
    !process.env.SUPERDUPERAI_TOKEN ||
    process.env.SUPERDUPERAI_TOKEN === "your_superduperai_token"
  ) {
    throw new Error("SUPERDUPERAI_TOKEN environment variable is not set");
  }
};

const getSuperduperAIConfig = () => ({
  url: process.env.SUPERDUPERAI_URL || "https://api.superduperai.com",
  token: process.env.SUPERDUPERAI_TOKEN || "your_superduperai_token",
});

const API_ENDPOINTS = {
  GENERATE_VIDEO: "/api/v1/file/generate-video",
  GENERATE_IMAGE: "/api/v1/file/generate-image",
};

// Helper functions for prompt enhancement
function enhanceVideoPrompt(prompt: string, style: string): string {
  // If prompt is too short or generic, enhance it
  if (prompt.length < 10 || prompt.toLowerCase().includes("animate")) {
    const styleEnhancements: Record<string, string> = {
      cinematic:
        "cinematic, professional lighting, high quality, smooth camera movement",
      realistic: "realistic, detailed, natural lighting, high resolution",
      artistic: "artistic, creative, vibrant colors, dynamic composition",
      dramatic: "dramatic, intense lighting, emotional, powerful",
      peaceful: "peaceful, calm, soft lighting, gentle movement",
      action: "action-packed, dynamic, fast-paced, exciting",
      fantasy: "fantastical, magical, otherworldly, dreamlike",
    };

    const enhancement = styleEnhancements[style] || styleEnhancements.cinematic;
    return `${prompt}, ${enhancement}`;
  }

  return prompt;
}

function getNegativePrompt(style: string): string {
  const negativePrompts: Record<string, string> = {
    cinematic: "blurry, low quality, distorted, poor lighting, amateur",
    realistic: "cartoon, anime, unrealistic, artificial, fake",
    artistic: "boring, plain, dull, uncreative, static",
    dramatic: "calm, peaceful, boring, uneventful, static",
    peaceful: "chaotic, violent, disturbing, aggressive, loud",
    action: "slow, static, boring, uneventful, calm",
    fantasy: "realistic, mundane, ordinary, everyday, realistic",
  };

  return negativePrompts[style] || negativePrompts.cinematic || "";
}

const uploadImage = async (imageFile: {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content: string; // base64 encoded file content
}) => {
  const config = getSuperduperAIConfig();

  // Convert base64 back to Buffer
  const base64Data = imageFile.content;
  const buffer = Buffer.from(base64Data, "base64");

  // Create a File object for FormData (more compatible with upload APIs)
  const file = new File([buffer], imageFile.name, {
    type: imageFile.type,
    lastModified: imageFile.lastModified,
  });

  const uploadFormData = new FormData();
  uploadFormData.append("payload", file);
  uploadFormData.append("type", "image");

  console.log("📤 Uploading image to SuperDuperAI:", {
    url: `${config.url}/api/v1/file/upload`,
    fileName: imageFile.name,
    fileSize: imageFile.size,
    fileType: imageFile.type,
    fileObjectSize: file.size,
    formDataEntries: Array.from(uploadFormData.entries()).map(
      ([key, value]) => ({
        key,
        type: typeof value,
        size: value instanceof File ? value.size : "N/A",
      })
    ),
  });

  const uploadResponse = await fetch(`${config.url}/api/v1/file/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "User-Agent": "SuperDuperAI-Landing/1.0",
    },
    body: uploadFormData,
  });

  console.log("📡 Upload response status:", uploadResponse.status);
  console.log(
    "📡 Upload response headers:",
    Object.fromEntries(uploadResponse.headers.entries())
  );

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("❌ Upload error response:", errorText);
    throw new Error(
      `Failed to upload image: ${uploadResponse.status} - ${errorText}`
    );
  }

  const uploadResult = await uploadResponse.json();
  const referenceImageId = uploadResult.id;

  return referenceImageId;
};

// Generate single video using SuperDuperAI API
async function generateVideoWithSuperDuperAI(
  prompt: string,
  modelName: string,
  duration: number = 8,
  resolution: string = "1280x720",
  style: string = "cinematic",
  generationType: "text-to-video" | "image-to-video" = "text-to-video",
  imageId?: string
): Promise<string> {
  console.log("🎬 Starting SuperDuperAI video generation:", {
    prompt,
    modelName,
    duration,
    resolution,
    style,
  });

  // Configure SuperDuperAI client
  configureSuperduperAI();
  const config = getSuperduperAIConfig();

  const [width, height] = resolution.split("x").map(Number);

  // Get appropriate duration for the model
  const getModelDuration = (model: string, requestedDuration: number) => {
    const modelLower = model.toLowerCase();
    if (modelLower === "sora") {
      // Sora only accepts 5, 10, 15, or 20 seconds
      const validDurations = [5, 10, 15, 20];
      // Find the closest valid duration
      const closest = validDurations.reduce((prev, curr) =>
        Math.abs(curr - requestedDuration) < Math.abs(prev - requestedDuration)
          ? curr
          : prev
      );
      console.log(
        `🎬 Sora model: adjusting duration from ${requestedDuration} to ${closest} seconds`
      );
      return closest;
    }
    return requestedDuration;
  };

  const getModelConfig = async (
    model: string,
    generationType: "text-to-video" | "image-to-video"
  ) => {
    console.log("🔍 Model name:", model, "Generation type:", generationType);

    // Import models config
    const { MODELS_CONFIG } = await import("@/lib/models-config");

    // Find model in config
    const modelConfig = MODELS_CONFIG[model] || MODELS_CONFIG["Veo3"]; // fallback to Veo3

    if (
      generationType === "image-to-video" &&
      modelConfig?.imageToVideoConfigName
    ) {
      console.log(
        "🎨 Using image-to-video config:",
        modelConfig?.imageToVideoConfigName
      );
      return modelConfig.imageToVideoConfigName;
    } else {
      console.log(
        "📝 Using text-to-video config:",
        modelConfig?.generationConfigName
      );
      return (
        modelConfig?.generationConfigName || "google-cloud/veo3-text2video"
      );
    }
  };

  // Enhance prompt for better video generation results
  const enhancedPrompt = enhanceVideoPrompt(prompt, style);

  const payload = {
    config: {
      prompt: enhancedPrompt,
      negative_prompt: getNegativePrompt(style),
      width,
      height,
      aspect_ratio:
        width && height
          ? width > height
            ? "16:9"
            : height > width
              ? "9:16"
              : "1:1"
          : "1:1",
      duration: getModelDuration(modelName, duration),
      seed: Math.floor(Math.random() * 1000000),
      generation_config_name: await getModelConfig(modelName, generationType),
      frame_rate: 30,
      batch_size: 1,
      references: imageId
        ? [
            {
              type: "source",
              reference_id: imageId,
            },
          ]
        : [],
    },
  };

  console.log("📤 Sending request to SuperDuperAI:", payload);
  console.log("🔧 Enhanced prompt:", enhancedPrompt);
  console.log("🚫 Negative prompt:", getNegativePrompt(style));

  const response = await fetch(`${config.url}${API_ENDPOINTS.GENERATE_VIDEO}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
      "User-Agent": "SuperDuperAI-Landing/1.0",
    },
    body: JSON.stringify(payload),
    // Add timeout to prevent webhook from hanging
    signal: AbortSignal.timeout(15000), // 15 seconds timeout
  });

  console.log(`📡 SuperDuperAI API Response Status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ SuperDuperAI API Error:", errorText);
    console.error(
      "🔧 Request payload that failed:",
      JSON.stringify(payload, null, 2)
    );
    throw new Error(
      `SuperDuperAI API failed: ${response.status} - ${errorText}`
    );
  }

  const result = await response.json();
  console.log("✅ SuperDuperAI response:", result);

  // Additional logging for debugging Google Cloud issues
  if (result.tasks && Array.isArray(result.tasks)) {
    console.log(
      "📋 Tasks in response:",
      result.tasks.map(
        (task: { type?: string; status?: string; id?: string }) => ({
          type: task.type,
          status: task.status,
          id: task.id,
        })
      )
    );
  }

  // Extract file ID from response
  const fileId = result.id;
  if (!fileId) {
    throw new Error("No file ID returned from SuperDuperAI API");
  }

  console.log(`🚀 Video generation task created successfully!`);
  console.log(`📁 FileId: ${fileId}`);
  console.log(`⏱️ Client can now poll /api/file/${fileId} for status updates`);
  return fileId;
}

// Generate single image using SuperDuperAI API
async function generateImageWithSuperDuperAI(
  prompt: string,
  modelName: string,
  width: number = 1024,
  height: number = 1024,
  style: string = "realistic"
): Promise<string> {
  console.log("🎨 Starting SuperDuperAI image generation:", {
    prompt,
    modelName,
    width,
    height,
    style,
  });

  // Configure SuperDuperAI client
  configureSuperduperAI();
  const config = getSuperduperAIConfig();

  const getModelConfig = (model: string, type: "video" | "image" = "video") => {
    console.log("🔍 Model name:", model, "Type:", type);

    switch (model.toLowerCase()) {
      case "gpt-image-1":
      case "gpt image 1":
        return "azure-openai/gpt-image-1";
      case "google imagen 4":
      case "google-imagen-4":
        return "google-cloud/imagen4";
      case "google imagen 3":
      case "google-imagen-3":
        return "google-cloud/imagen3";
      case "flux kontext":
      case "flux":
        return "comfyui/flux";
      case "flux pro":
      case "flux-pro":
        return "fal-ai/flux-pro/v1.1-ultra";
      case "imagen4 ultra":
      case "imagen4-ultra":
        return "google-cloud/imagen4-ultra";

      // Default based on type
      default:
        return "azure-openai/gpt-image-1"; // Default image model
    }
  };

  const payload = {
    config: {
      prompt,
      negative_prompt: "",
      width,
      height,
      aspect_ratio: width > height ? "16:9" : height > width ? "9:16" : "1:1",
      seed: Math.floor(Math.random() * 1000000),
      generation_config_name: getModelConfig(modelName, "image"),
      batch_size: 1,
      references: [],
      // Убираем параметры, которые не нужны для изображений
      // frame_rate и duration только для видео
    },
  };

  console.log("📤 Sending request to SuperDuperAI:", payload);

  const response = await fetch(`${config.url}${API_ENDPOINTS.GENERATE_IMAGE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
      "User-Agent": "SuperDuperAI-Landing/1.0",
    },
    body: JSON.stringify(payload),
    // Add timeout to prevent webhook from hanging
    signal: AbortSignal.timeout(15000), // 15 seconds timeout
  });

  console.log(`📡 SuperDuperAI API Response Status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ SuperDuperAI API Error:", errorText);
    throw new Error(
      `SuperDuperAI API failed: ${response.status} - ${errorText}`
    );
  }

  const result = await response.json();
  console.log("✅ SuperDuperAI response:", result);

  // Extract file ID from response - API returns an array for image generation
  let fileId: string;
  if (Array.isArray(result) && result.length > 0) {
    // For image generation, API returns an array of file objects
    fileId = result[0].id;
  } else if (result.id) {
    // For video generation, API returns a single object
    fileId = result.id;
  } else {
    throw new Error("No file ID returned from SuperDuperAI API");
  }

  console.log(`🚀 Image generation task created successfully!`);
  console.log(`📁 FileId: ${fileId}`);
  console.log(`⏱️ Client can now poll /api/file/${fileId} for status updates`);
  return fileId;
}

// Simplified - no more complex prompt handling needed

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  // Check for empty body
  if (!body) {
    console.error("❌ Empty webhook payload received");
    return NextResponse.json({ error: "Empty payload" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (error) {
    console.error("❌ Stripe webhook signature verification failed:", error);
    console.error("Expected secret:", endpointSecret?.substring(0, 10) + "...");
    console.error("Signature:", signature?.substring(0, 50) + "...");
    console.error("Body length:", body.length);
    console.error("Environment:", process.env.NODE_ENV);
    console.error("Vercel URL:", process.env.VERCEL_URL);

    // В режиме разработки показываем больше информации
    if (process.env.NODE_ENV === "development") {
      console.error("Full error:", error);
      console.error("Full body (first 200 chars):", body.substring(0, 200));
    }

    // Для отладки на тестовой ветке - временно пропускаем проверку подписи
    if (process.env.VERCEL_URL?.includes("git-stripe")) {
      console.warn(
        "⚠️ TEMPORARILY SKIPPING SIGNATURE VERIFICATION FOR TESTING"
      );
      try {
        event = JSON.parse(body);
      } catch (parseError) {
        console.error("❌ Failed to parse webhook body:", parseError);
        return NextResponse.json(
          { error: "Invalid JSON body" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  console.log("🔔 Stripe webhook event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`🔔 Unhandled event type: ${event.type} (ignoring)`);
        // Не обрабатываем это событие, но это не ошибка
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Stripe webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("✅ Checkout completed:", session.id);
  const sessionId = session.id;

  // Get session data from Redis (no more dependency on Stripe metadata)
  const sessionData = await getSessionData(sessionId);

  console.log("🔍 Session data:", sessionData);

  if (!sessionData) {
    console.error("❌ No session data found in Redis for:", sessionId);
    console.error("This means checkout creation failed to store data properly");
    return;
  }

  console.log("📊 Retrieved session data:", {
    promptLength: sessionData.prompt.length,
    videoCount: sessionData.videoCount,
    tool: sessionData.toolSlug,
    cancelUrl: sessionData.cancelUrl,
    modelName: sessionData.modelName,
    generationType: sessionData.generationType,
    imageFile: sessionData.imageFile
      ? {
          name: sessionData.imageFile.name,
          size: sessionData.imageFile.size,
          type: sessionData.imageFile.type,
          contentLength: sessionData.imageFile.content.length,
        }
      : null,
  });

  // Update status to processing (starting generation)
  await updateSessionData(sessionId, { status: "processing" });

  try {
    let fileId: string;

    // Determine generation type based on tool slug or generation type
    const isImageGeneration =
      sessionData.toolSlug?.includes("image") ||
      sessionData.generationType === "text-to-image" ||
      sessionData.generationType === "image-to-image";

    if (isImageGeneration) {
      // Launch image generation through SuperDuperAI API
      console.log("🎨 Starting image generation for session:", sessionId);

      fileId = await generateImageWithSuperDuperAI(
        sessionData.prompt,
        sessionData.modelName || "veo3", // Use modelName from session data
        sessionData.width || 1024,
        sessionData.height || 1024,
        sessionData.style || "realistic"
      );

      console.log("🎨 Image generation started successfully:", fileId);
    } else {
      // Launch video generation through SuperDuperAI API
      console.log("🎬 Starting video generation for session:", sessionId);

      let imageId: string | undefined;

      // Check if we have an image file for image-to-video generation
      if (
        sessionData.generationType === "image-to-video" &&
        sessionData.imageFile &&
        sessionData.imageFile.content
      ) {
        try {
          console.log("🎨 Uploading image for image-to-video generation...");
          imageId = await uploadImage(sessionData.imageFile);
          console.log("🎨 Image uploaded successfully:", imageId);
        } catch (error) {
          console.error("❌ Failed to upload image:", error);
          throw new Error("Failed to upload source image for video generation");
        }
      } else if (
        sessionData.generationType === "image-to-video" &&
        (!sessionData.imageFile || !sessionData.imageFile.content)
      ) {
        console.log(
          "🔄 Image-to-video requested but no image provided, switching to text-to-video"
        );
        // Автоматически переключаемся на text-to-video если изображение не предоставлено
        sessionData.generationType = "text-to-video";
      }

      fileId = await generateVideoWithSuperDuperAI(
        sessionData.prompt,
        sessionData.modelName || "veo3", // Use modelName from session data
        sessionData.duration || 8,
        sessionData.resolution || "1280x720",
        sessionData.style || "cinematic",
        sessionData.generationType as "text-to-video" | "image-to-video",
        imageId
      );

      console.log("🎬 Video generation started successfully:", fileId);
    }

    // Save fileId in session
    await updateSessionData(sessionId, {
      status: "processing",
      fileId,
    });
  } catch (error) {
    console.error("❌ Failed to start generation:", error);

    // Update status to error
    await updateSessionData(sessionId, {
      status: "error",
      error: error instanceof Error ? error.message : "Generation failed",
    });
  }

  // TODO: Send email notification
  const email = session.customer_details?.email;
  if (email) {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://superduperai.co";
    const returnUrl =
      sessionData.cancelUrl || `${baseUrl}/en/tool/veo3-prompt-generator`;
    console.log("📧 TODO: Send email to", email, "with return URL:", returnUrl);
  }
}

async function _handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log("✅ Payment succeeded:", paymentIntent.id);

  // Get the checkout session from payment intent
  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    });

    if (sessions.data.length === 0) {
      console.error(
        "❌ No checkout session found for payment intent:",
        paymentIntent.id
      );
      return;
    }

    const session = sessions.data[0];
    const sessionId = session?.id;
    console.log("🔍 Found checkout session:", sessionId);

    // Get session data from Redis
    const sessionData = await getSessionData(sessionId || "");

    if (!sessionData) {
      console.error("❌ No session data found in Redis for:", sessionId);
      return;
    }

    // Update status to completed (payment successful, ready for generation)
    await updateSessionData(sessionId!, { status: "completed" });

    console.log(
      "✅ Payment completed successfully. Generation can now proceed with paymentSessionId."
    );

    // TODO: Send email notification
    const email = session?.customer_details?.email;
    if (email) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://superduperai.co";
      const returnUrl =
        sessionData.cancelUrl || `${baseUrl}/en/tool/veo3-prompt-generator`;
      console.log(
        "📧 TODO: Send email to",
        email,
        "with return URL:",
        returnUrl
      );
    }
  } catch (sessionError) {
    console.error(
      "❌ Failed to get checkout session for payment intent:",
      paymentIntent.id,
      sessionError
    );
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("❌ Payment failed:", paymentIntent.id);

  const { customer_email } = paymentIntent.metadata;

  // TODO: Send payment failure notification
  if (customer_email) {
    console.log("📧 TODO: Send payment failure email to", customer_email);
  }
}

// Function to retry video generation with improved prompt
async function _retryVideoGenerationWithImprovedPrompt(
  sessionId: string,
  originalPrompt: string,
  modelName: string,
  duration: number,
  resolution: string,
  style: string,
  generationType: "text-to-video" | "image-to-video" = "text-to-video",
  imageId?: string
): Promise<string> {
  console.log(
    "🔄 Retrying video generation with improved prompt for session:",
    sessionId
  );

  // Create a more detailed prompt based on the original
  const improvedPrompt = createImprovedPrompt(originalPrompt, style);

  console.log("🔧 Original prompt:", originalPrompt);
  console.log("🔧 Improved prompt:", improvedPrompt);

  // Try with improved prompt
  return await generateVideoWithSuperDuperAI(
    improvedPrompt,
    modelName,
    duration,
    resolution,
    style,
    generationType,
    imageId
  );
}

// Function to create improved prompt for retry
function createImprovedPrompt(originalPrompt: string, style: string): string {
  // If prompt is too short, add more context
  if (originalPrompt.length < 20) {
    const styleContexts: Record<string, string> = {
      cinematic:
        "A cinematic scene with professional lighting and smooth camera movement",
      realistic:
        "A realistic scene with natural lighting and detailed textures",
      artistic:
        "An artistic scene with creative composition and vibrant colors",
      dramatic: "A dramatic scene with intense lighting and emotional impact",
      peaceful: "A peaceful scene with calm atmosphere and gentle movement",
      action: "An action-packed scene with dynamic movement and excitement",
      fantasy:
        "A fantastical scene with magical elements and otherworldly atmosphere",
    };

    const context = styleContexts[style] || styleContexts.cinematic;
    return `${context} featuring ${originalPrompt}`;
  }

  // If prompt is already detailed, just enhance it slightly
  const enhancements: Record<string, string> = {
    cinematic: "cinematic quality, professional lighting",
    realistic: "realistic details, natural lighting",
    artistic: "artistic composition, creative style",
    dramatic: "dramatic lighting, emotional impact",
    peaceful: "peaceful atmosphere, calm mood",
    action: "dynamic movement, exciting action",
    fantasy: "magical atmosphere, fantastical elements",
  };

  const enhancement = enhancements[style] || enhancements.cinematic;
  return `${originalPrompt}, ${enhancement}`;
}
