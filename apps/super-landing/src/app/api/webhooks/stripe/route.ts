import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getSessionData, updateSessionData } from "@/lib/kv";
import { addDemoBalance } from "@/lib/utils/tools-balance";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_your_stripe_secret_key",
  {
    apiVersion: "2025-06-30.basil",
  }
);

const endpointSecret =
  process.env.STRIPE_WEBHOOK_SECRET || "whsec_your_webhook_secret";

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
};

// Generate single video using SuperDuperAI API (currently unused)
async function _generateVideoWithSuperDuperAI(
  prompt: string,
  duration: number = 8,
  resolution: string = "1280x720",
  style: string = "cinematic"
): Promise<string> {
  console.log("🎬 Starting SuperDuperAI video generation:", {
    prompt,
    duration,
    resolution,
    style,
  });

  // Configure SuperDuperAI client
  configureSuperduperAI();
  const config = getSuperduperAIConfig();

  const [width, height] = resolution.split("x").map(Number);

  const payload = {
    config: {
      prompt,
      negative_prompt: "",
      width,
      height,
      aspect_ratio: width > height ? "16:9" : height > width ? "9:16" : "1:1",
      duration,
      seed: Math.floor(Math.random() * 1000000),
      generation_config_name: "google-cloud/veo3", // Use VEO3 model
      frame_rate: 30,
      batch_size: 1,
      references: [],
    },
  };

  console.log("📤 Sending request to SuperDuperAI:", payload);

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
    throw new Error(
      `SuperDuperAI API failed: ${response.status} - ${errorText}`
    );
  }

  const result = await response.json();
  console.log("✅ SuperDuperAI response:", result);

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
  });

  // Add credits to user balance
  const userId = sessionData.userId || "demo-user-fallback"; // Use userId from session data

  console.log(`💰 Webhook handler - userId: ${userId}`);

  // Fixed 100 credits per successful payment
  const creditsToAdd = 100;

  if (creditsToAdd > 0) {
    try {
      const newBalance = addDemoBalance(userId, creditsToAdd);
      console.log(
        `💰 Added ${creditsToAdd} credits to user ${userId}. New balance: ${newBalance} credits`
      );
    } catch (error) {
      console.error("❌ Error adding credits:", error);
    }
  }

  // Update status to completed (payment successful, no automatic generation)
  await updateSessionData(sessionId, { status: "completed" });

  console.log(
    "✅ Payment completed successfully. User can manually start generation when ready."
  );

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
    const sessionId = session.id;
    console.log("🔍 Found checkout session:", sessionId);

    // Get session data from Redis
    const sessionData = await getSessionData(sessionId);

    if (!sessionData) {
      console.error("❌ No session data found in Redis for:", sessionId);
      return;
    }

    // Add credits to user balance
    const userId = sessionData.userId || "demo-user-fallback"; // Use userId from session data

    // Fixed 100 credits per successful payment
    const creditsToAdd = 100;

    if (creditsToAdd > 0) {
      try {
        const newBalance = addDemoBalance(userId, creditsToAdd);
        console.log(
          `💰 Added ${creditsToAdd} credits to user ${userId}. New balance: ${newBalance} credits`
        );
      } catch (error) {
        console.error("❌ Error adding credits:", error);
      }
    }

    // Update status to completed (payment successful, no automatic generation)
    await updateSessionData(sessionId, { status: "completed" });

    console.log(
      "✅ Payment completed successfully. User can manually start generation when ready."
    );

    // TODO: Send email notification
    const email = session.customer_details?.email;
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
