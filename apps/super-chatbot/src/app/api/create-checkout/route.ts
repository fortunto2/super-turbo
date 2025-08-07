import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/app/(auth)/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const {
      priceId,
      quantity = 1,
      prompt,
      toolSlug,
      toolTitle,
      creditAmount,
      cancelUrl,
    } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
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

      // Try to detect the correct port from request headers
      const host = request.headers.get("host");
      if (host && host.includes("localhost")) {
        return `http://${host}`;
      }

      // Finally fallback to localhost for development
      return "http://localhost:3000";
    };

    const appUrl = getAppUrl();
    console.log("🔗 Using app URL:", appUrl);

    // Get current user session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Prepare metadata
    const metadata: Record<string, string> = {
      user_id: userId,
      quantity: quantity.toString(),
    };

    if (creditAmount) {
      metadata.credit_amount = creditAmount.toString();
      metadata.payment_type = "credits";
    } else if (prompt) {
      metadata.prompt = prompt;
      metadata.tool_slug = toolSlug || "veo3-generator";
      metadata.tool_title = toolTitle || "VEO3 Generator";
      metadata.payment_type = "video";
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: creditAmount
        ? `${appUrl}/payment-success/{CHECKOUT_SESSION_ID}`
        : `${appUrl}/en/payment-success/{CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || (creditAmount
        ? `${appUrl}/`
        : `${appUrl}/en/tool/veo3-prompt-generator`),
      metadata,
    });

    console.log("💳 Created checkout session:", checkoutSession.id);

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
