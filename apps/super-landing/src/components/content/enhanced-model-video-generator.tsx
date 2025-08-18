"use client";

import { Button } from "@turbo-super/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import { Video, Zap, Image as ImageIcon, CreditCard } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Locale } from "@/config/i18n-config";

interface EnhancedModelVideoGeneratorProps {
  modelName: string;
  modelConfig?: {
    maxDuration?: number;
    aspectRatio?: string;
    width?: number;
    height?: number;
    frameRate?: number;
    description?: string;
    supportsImageToVideo?: boolean;
  };
  locale?: Locale;
}

export function EnhancedModelVideoGenerator({
  modelName,
  modelConfig,
  locale = "tr",
}: EnhancedModelVideoGeneratorProps) {
  const { t } = useTranslation(locale);

  const defaultConfig = {
    maxDuration: 8,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
    supportsImageToVideo: false,
    description:
      t(
        `model_descriptions.${modelName.toLowerCase().replace(/\s+/g, "_").replace(/\./g, "")}`
      ) || `Генерация видео с моделью ${modelName}`,
  };

  const config = { ...defaultConfig, ...modelConfig };

  return (
    <div className="space-y-6">
      {/* Информация о модели */}
      <div className="bg-gradient-to-br from-purple-950/40 to-green-950/40 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-purple-300 mb-2 flex items-center gap-2">
              <Video className="w-5 h-5" />
              {modelName}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {config.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {config.width && config.height && (
                <Badge
                  variant="secondary"
                  className="bg-purple-500/20 border-purple-500/30 text-purple-300"
                >
                  {config.width}x{config.height}
                </Badge>
              )}
              {config.aspectRatio && (
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 border-green-500/30 text-green-300"
                >
                  {config.aspectRatio}
                </Badge>
              )}
              {config.maxDuration && (
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 border-blue-500/30 text-blue-300"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {config.maxDuration}s
                </Badge>
              )}
              {config.supportsImageToVideo && (
                <Badge
                  variant="secondary"
                  className="bg-orange-500/20 border-orange-500/30 text-orange-300"
                >
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Image-to-Video
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка оплаты Stripe */}
      <Card className="card-enhanced border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-green-950/30 to-blue-950/30 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold text-purple-300 flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t("video_generator.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {t("video_generator.payment_description") ||
              "Pay $1.00 to access video generation with this model"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fallback кнопка для создания Stripe checkout */}
          <Button
            onClick={async () => {
              try {
                console.log("Creating checkout session...");

                const response = await fetch("/api/create-checkout", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    prompt: "",
                    variant: "video",
                    toolSlug: "veo2-video-generator",
                    toolTitle: `${modelName} Video Generator`,
                    price: 1.0,
                    quantity: 1,
                    generationType: "text-to-video",
                    hasImageFile: false,
                    modelName: modelName,
                  }),
                });

                if (!response.ok) {
                  throw new Error("Failed to create checkout session");
                }

                const data = await response.json();
                console.log("Checkout session created:", data);

                // Перенаправляем на Stripe checkout
                if (data.url) {
                  window.location.href = data.url;
                } else {
                  alert("Failed to get checkout URL");
                }
              } catch (error) {
                console.error("Error creating checkout:", error);
                alert("Error creating checkout session. Please try again.");
              }
            }}
            className="w-full btn-accent bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay $1.00 to Generate Video
          </Button>

          {/* StripePaymentButton - закомментирован для отладки */}
          {/*
          <StripePaymentButton
            prompt=""
            variant="video"
            toolSlug="veo2-video-generator"
            toolTitle={`${modelName} Video Generator`}
            price={1.0}
            apiEndpoint="/api/stripe-prices"
            checkoutEndpoint="/api/create-checkout"
            onPaymentClick={() => console.log("Payment started")}
            className="w-full btn-accent bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            locale={locale}
            t={(key: string, params?: Record<string, string | number>) => {
              // Простая функция перевода для кнопки
              const translations: Record<string, string> = {
                "payment.pay": "Pay $1.00",
                "payment.processing": "Processing...",
                "payment.error": "Payment Error",
              };
              return translations[key] || key;
            }}
          />
          */}
        </CardContent>
      </Card>
    </div>
  );
}
