"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import { CreditCard, Loader2, Sparkles, Zap } from "lucide-react";
import { StripePaymentButton } from "@turbo-super/ui";
import { useTranslation } from "@/hooks/use-translation";
import { Locale } from "@/config/i18n-config";

interface DirectPaymentButtonProps {
  modelName: string;
  modelType: "image" | "video";
  prompt: string;
  price: number;
  onPaymentSuccess?: (sessionId: string) => void;
  onPaymentError?: (error: string) => void;
  className?: string;
  locale?: Locale;
  // Новые поля для поддержки image-to-video
  generationType?: "text-to-video" | "image-to-video";
  imageFile?: File | null;
}

export function DirectPaymentButton({
  modelName,
  modelType,
  prompt,
  price,
  onPaymentSuccess,
  onPaymentError,
  className,
  locale = "tr",
  // Новые поля для поддержки image-to-video
  generationType = "text-to-video",
  imageFile = null,
}: DirectPaymentButtonProps) {
  const { t } = useTranslation(locale);
  const [isProcessing, setIsProcessing] = useState(false);

  const _handlePaymentSuccess = (sessionId: string) => {
    setIsProcessing(false);
    onPaymentSuccess?.(sessionId);

    // Stripe автоматически перенаправит на success_url, поэтому здесь ничего не делаем
    console.log("Payment successful, session ID:", sessionId);
  };

  const _handlePaymentError = (error: string) => {
    setIsProcessing(false);
    onPaymentError?.(error);
  };

  const handlePaymentClick = () => {
    setIsProcessing(true);
  };

  const getToolSlug = () => {
    const baseSlug = modelName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\./g, "");
    return `${baseSlug}-${modelType}-generator`;
  };

  const getToolTitle = () => {
    return `${modelName} ${modelType === "image" ? "Image" : "Video"} Generator`;
  };

  return (
    <Card
      className={`card-enhanced border-green-500/20 bg-gradient-to-br from-green-950/30 via-blue-950/30 to-purple-950/30 backdrop-blur-sm ${className}`}
    >
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-green-300 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" />
          {modelType === "image"
            ? t("direct_payment.generate_image").replace(
                "{model}",
                modelName
              ) || `Generate Image with ${modelName}`
            : t("direct_payment.generate_video").replace(
                "{model}",
                modelName
              ) || `Generate Video with ${modelName}`}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {modelType === "image"
            ? t("direct_payment.image_description") ||
              "Create stunning images with AI"
            : t("direct_payment.video_description") ||
              "Create amazing videos with AI"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Промпт */}
        {prompt && (
          <div className="bg-gradient-to-br from-blue-950/40 to-purple-950/40 border border-blue-500/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">
                {t("direct_payment.your_prompt") || "Your prompt"}:
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {prompt}
            </p>
          </div>
        )}

        {/* Информация о цене */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-950/40 to-blue-950/40 border border-green-500/20 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30">
              <CreditCard className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-300">
                {modelType === "image"
                  ? t("direct_payment.image_generation") || "Image Generation"
                  : t("direct_payment.video_generation") || "Video Generation"}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("direct_payment.one_time_payment") || "One-time payment"}
              </p>
            </div>
          </div>
          <Badge className="bg-green-600 text-white text-lg px-3 py-1">
            ${price.toFixed(2)}
          </Badge>
        </div>

        {/* Кнопка оплаты */}
        <StripePaymentButton
          prompt={prompt}
          variant="video"
          toolSlug={getToolSlug()}
          toolTitle={getToolTitle()}
          price={price}
          apiEndpoint="/api/stripe-prices"
          checkoutEndpoint="/api/create-checkout"
          onPaymentClick={handlePaymentClick}
          className="w-full"
          locale={locale}
          // Новые поля для поддержки image-to-video
          generationType={generationType}
          imageFile={imageFile}
          modelName={modelName}
          t={(key: string, params?: Record<string, string | number>) => {
            let translation = t(key);
            if (params) {
              Object.entries(params).forEach(([param, value]) => {
                translation = translation.replace(`{${param}}`, String(value));
              });
            }
            return translation;
          }}
        />

        {/* Обработка состояния */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-sm text-blue-300">
              {t("direct_payment.processing_payment") ||
                "Processing payment..."}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
