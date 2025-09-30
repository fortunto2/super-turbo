import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { addUserBalance } from "@/lib/utils/tools-balance";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey || !webhookSecret) {
  throw new Error("Stripe configuration is missing");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook endpoint called");
    console.log("🔍 Request URL:", request.url);
    console.log("🔍 Request method:", request.method);

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    console.log("📋 Webhook headers:", {
      signature: signature ? "present" : "missing",
      contentType: request.headers.get("content-type"),
      userAgent: request.headers.get("user-agent"),
    });

    console.log("📦 Body length:", body.length);
    console.log(
      "🔑 Webhook secret configured:",
      !!process.env.STRIPE_WEBHOOK_SECRET
    );

    let event: Stripe.Event;

    try {
      if (!webhookSecret) {
        throw new Error("Stripe webhook secret is not configured");
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("✅ Webhook signature verified");
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("🔔 Webhook event received:", event.type);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log("✅ Checkout completed:", session.id);
    console.log(
      "📋 Session metadata:",
      JSON.stringify(session.metadata, null, 2)
    );

    const { metadata } = session;
    const userId = metadata?.user_id;
    const paymentType = metadata?.payment_type;
    const creditAmount = metadata?.credit_amount;

    console.log("🔍 Parsed metadata:", {
      userId,
      paymentType,
      creditAmount,
      hasUserId: !!userId,
      hasPaymentType: !!paymentType,
      hasCreditAmount: !!creditAmount,
    });

    if (!userId) {
      console.error("❌ No user_id in session metadata");
      return;
    }

    if (paymentType === "credits" && creditAmount) {
      // Add credits to user balance
      const amount = Number.parseInt(creditAmount, 10);
      console.log(
        `💰 Processing credit payment: ${amount} credits for user ${userId}`
      );

      try {
        await addUserBalance(userId, amount, "stripe_payment", {
          sessionId: session.id,
          paymentIntentId: session.payment_intent as string,
          amount: session.amount_total,
          currency: session.currency,
        });

        console.log(
          `✅ Successfully added ${amount} credits to user ${userId}`
        );
      } catch (balanceError) {
        console.error("❌ Error adding balance:", balanceError);
        throw balanceError;
      }
    } else if (paymentType === "video") {
      // Handle video generation payment
      console.log("🎬 Video payment completed, processing video generation...");
      // Здесь можно добавить логику для генерации видео
    } else {
      console.log("⚠️ Unknown payment type or missing credit amount:", {
        paymentType,
        creditAmount,
      });
    }
  } catch (error) {
    console.error("❌ Error handling checkout completion:", error);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("✅ Payment succeeded:", paymentIntent.id);
  // Дополнительная логика обработки успешного платежа
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("❌ Payment failed:", paymentIntent.id);
  // Логика обработки неудачного платежа
}
