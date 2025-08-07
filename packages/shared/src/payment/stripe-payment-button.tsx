"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@turbo-super/ui";
import { ExternalLink, Zap, Video, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useStripePrices } from "./use-stripe-prices";

interface StripePaymentButtonProps {
  prompt?: string;
  onPaymentClick?: () => void;
  toolSlug?: string;
  toolTitle?: string;
  variant?: "video" | "credits";
  creditAmount?: number;
  price?: number;
  apiEndpoint?: string;
  checkoutEndpoint?: string;
  className?: string;
  locale?: string;
  t?: (key: string, params?: Record<string, string | number>) => string;
}

export function StripePaymentButton({
  prompt,
  onPaymentClick,
  toolSlug,
  toolTitle,
  variant = "video",
  creditAmount = 100,
  price = 1.0,
  apiEndpoint = "/api/stripe-prices",
  checkoutEndpoint = "/api/create-checkout",
  className,
  locale = "en",
  t,
}: StripePaymentButtonProps) {
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const { prices, mode, loading, error } = useStripePrices(apiEndpoint);

  // Функция для получения перевода с поддержкой параметров
  const getTranslation = (
    key: string,
    params?: Record<string, string | number>
  ) => {
    if (!t) {
      // Fallback переводы если функция t не предоставлена
      const fallbackTranslations: Record<string, string> = {
        "stripe_payment.loading_payment_options": "Loading payment options...",
        "stripe_payment.failed_load_payment": "Failed to load payment options",
        "stripe_payment.top_up_balance": "Top Up Balance",
        "stripe_payment.generate_veo3_videos": "Generate VEO3 Videos",
        "stripe_payment.top_up_balance_desc": `Top up your balance with ${creditAmount} credits for using AI tools`,
        "stripe_payment.generate_video_desc":
          "Your prompt is ready! Choose a plan to generate professional AI videos with Google VEO3.",
        "stripe_payment.top_up_credits": `Top up ${creditAmount} credits`,
        "stripe_payment.generate_video": "Generate Video",
        "stripe_payment.get_credits_desc": `Get ${creditAmount} credits for generating images, videos and scripts`,
        "stripe_payment.generate_video_desc_short":
          "Generate 1 high-quality AI video with your custom prompt",
        "stripe_payment.creating_payment": "Creating Payment...",
        "stripe_payment.top_up_for": `Top up for $${price.toFixed(2)}`,
        "stripe_payment.generate_for": `Generate Video for $${price.toFixed(2)}`,
        "stripe_payment.instant_access":
          "✓ Instant access • ✓ No subscription • ✓ Secure Stripe payment",
        "stripe_payment.test_mode":
          "🧪 Test mode - Use test card 4242 4242 4242 4242",
        "stripe_payment.generate_prompt_first":
          "Please generate a prompt first",
        "stripe_payment.prices_not_loaded":
          "Prices not loaded yet, please try again",
        "stripe_payment.failed_create_checkout":
          "Failed to create checkout session",
      };
      return fallbackTranslations[key] || key;
    }

    let translation = t(key);

    // Заменяем параметры в переводе
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value));
      });
    }

    return translation;
  };

  const handlePayment = async () => {
    if (variant === "video" && !prompt?.trim()) {
      toast.error(getTranslation("stripe_payment.generate_prompt_first"));
      return;
    }

    if (!prices) {
      toast.error(getTranslation("stripe_payment.prices_not_loaded"));
      return;
    }

    setIsCreatingCheckout(true);
    onPaymentClick?.();

    try {
      // Получаем текущий URL для cancel_url
      const currentUrl = typeof window !== "undefined" ? window.location.href : "";

      const response = await fetch(checkoutEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: prices.single,
          quantity: 1,
          prompt: prompt?.trim(),
          toolSlug: toolSlug,
          toolTitle: toolTitle,
          creditAmount: variant === "credits" ? creditAmount : undefined,
          cancelUrl: currentUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect directly to Stripe
      window.location.href = url;
    } catch (error) {
      console.error("❌ Checkout creation failed:", error);
      toast.error(getTranslation("stripe_payment.failed_create_checkout"));
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  if (variant === "video" && !prompt?.trim()) {
    return null;
  }

  if (loading) {
    return (
      <Card
        className={`border-2 border-purple-500/50 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 dark:border-purple-400/30 ${className}`}
      >
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin mr-2" />
          <span>
            {getTranslation("stripe_payment.loading_payment_options")}
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error || !prices) {
    return (
      <Card
        className={`border-2 border-red-500/50 bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/30 dark:to-orange-950/30 dark:border-red-400/30 ${className}`}
      >
        <CardContent className="flex items-center justify-center py-8">
          <span className="text-red-600 dark:text-red-400">
            {error || getTranslation("stripe_payment.failed_load_payment")}
          </span>
        </CardContent>
      </Card>
    );
  }

  const isCreditsVariant = variant === "credits";

  return (
    <Card
      className={`border-2 border-purple-500/50 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 dark:border-purple-400/30 ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="size-5 text-yellow-500 dark:text-yellow-400" />
          {isCreditsVariant
            ? getTranslation("stripe_payment.top_up_balance")
            : getTranslation("stripe_payment.generate_veo3_videos")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isCreditsVariant
            ? getTranslation("stripe_payment.top_up_balance_desc", {
                amount: creditAmount,
              })
            : getTranslation("stripe_payment.generate_video_desc")}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-w-md mx-auto">
          {/* Payment Option */}
          <div className="p-6 border-2 border-blue-200 dark:border-blue-700/50 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              {isCreditsVariant ? (
                <CreditCard className="size-5 text-blue-500 dark:text-blue-400" />
              ) : (
                <Video className="size-5 text-blue-500 dark:text-blue-400" />
              )}
              <span className="font-semibold text-lg">
                {isCreditsVariant
                  ? getTranslation("stripe_payment.top_up_credits", {
                      amount: creditAmount,
                    })
                  : getTranslation("stripe_payment.generate_video")}
              </span>
            </div>
            <div className="mb-4">
              <Badge
                variant="outline"
                className="bg-blue-600 dark:bg-blue-500 text-white text-lg px-4 py-1"
              >
                ${price.toFixed(2)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {isCreditsVariant
                ? getTranslation("stripe_payment.get_credits_desc", {
                    amount: creditAmount,
                  })
                : getTranslation("stripe_payment.generate_video_desc_short")}
            </p>
            <Button
              onClick={handlePayment}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              size="lg"
              disabled={isCreatingCheckout}
            >
              {isCreatingCheckout ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
                  {getTranslation("stripe_payment.creating_payment")}
                </>
              ) : (
                <>
                  <ExternalLink className="size-5 mr-2" />
                  {isCreditsVariant
                    ? getTranslation("stripe_payment.top_up_for", {
                        price: price.toFixed(2),
                      })
                    : getTranslation("stripe_payment.generate_for", {
                        price: price.toFixed(2),
                      })}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          <p>{getTranslation("stripe_payment.instant_access")}</p>
          {mode === "test" && (
            <p className="text-yellow-600 dark:text-yellow-400 mt-1">
              {getTranslation("stripe_payment.test_mode")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
