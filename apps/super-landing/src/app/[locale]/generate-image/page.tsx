"use client";

import React, { useState } from "react";
import { Button } from "@turbo-super/ui";
import { Textarea } from "@turbo-super/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import { Image, Sparkles, ArrowLeft } from "lucide-react";
import { StripePaymentButton } from "@turbo-super/ui";
import { useTranslation } from "@/hooks/use-translation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Locale } from "@/config/i18n-config";
import { getModelConfig } from "@/lib/models-config";

export default function GenerateImagePage() {
  const searchParams = useSearchParams();
  const locale = (searchParams.get("locale") as Locale) || "en";
  const { t } = useTranslation(locale);
  const [prompt, setPrompt] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const modelName = searchParams.get("model") || "Unknown Model";
  const modelConfig = getModelConfig(modelName);

  const getToolSlug = () => {
    const baseSlug = modelName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\./g, "");
    return `${baseSlug}-image-generator`;
  };

  const getToolTitle = () => {
    return `${modelName} Image Generator`;
  };

  const handleGenerateClick = () => {
    setShowPayment(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950/40 via-purple-950/40 to-green-950/40 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/blog/${modelName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/\./g, "")
              .replace(/-image$/, "")
              .replace(/-video$/, "")}`}
            className="flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {modelName}
          </Link>
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            Generate Image with {modelName}
          </h1>
          <p className="text-muted-foreground text-lg">
            Create stunning AI-generated images for just $1.00
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            <Card className="card-enhanced border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-purple-950/30 to-green-950/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-300 flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Image Description
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Describe the image you want to create in detail
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-300">
                    Your prompt
                  </label>
                  <Textarea
                    placeholder="For example: Modern cityscape, skyscrapers, sunset lights, high quality, realistic style..."
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                    }}
                    rows={4}
                    className="input-enhanced border-blue-500/30 bg-blue-950/20 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>

                {/* Image Upload - убираем для моделей изображений, так как они не поддерживают image-to-image */}
                {/* Модели изображений работают только с text-to-image */}

                <Button
                  disabled={!prompt.trim() || showPayment}
                  onClick={handleGenerateClick}
                  className="w-full btn-accent bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Generate for $1.00
                </Button>
              </CardContent>
            </Card>

            {/* Model Info */}
            <Card className="card-enhanced border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-blue-950/30 to-green-950/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-purple-300">
                  Model Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-purple-500/20 border-purple-500/30 text-purple-300"
                    >
                      {modelName}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {modelConfig?.description ||
                      "High-quality AI image generation model"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-6">
            {showPayment && (
              <StripePaymentButton
                prompt={prompt}
                variant="image"
                toolSlug={getToolSlug()}
                toolTitle={getToolTitle()}
                price={1.0}
                apiEndpoint="/api/stripe-prices"
                checkoutEndpoint="/api/create-checkout"
                className="w-full"
                locale={locale}
                generationType="text-to-image"
                imageFile={null}
                modelName={modelName}
                t={t}
              />
            )}

            {/* Payment Info */}
            <Card className="card-enhanced border-green-500/20 bg-gradient-to-br from-green-950/30 via-blue-950/30 to-purple-950/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-green-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  What You Get
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-300">
                      High-quality AI-generated image
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-300">
                      Full commercial usage rights
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-300">
                      Instant download after generation
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-300">
                      No subscription required
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
