"use client";

import React, { useState } from "react";
import {
  Button,
  Textarea,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@turbo-super/ui";
import { Video, Sparkles, ArrowLeft } from "lucide-react";
import { DirectPaymentButton } from "@/components/ui/direct-payment-button";
import { ImageUpload } from "@/components/ui/image-upload";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";
import type { Locale } from "@/config/i18n-config";
import { getModelConfig, supportsImageToVideo } from "@/lib/models-config";

interface GenerateVideoFormProps {
  locale: Locale;
  modelName: string;
}

export function GenerateVideoForm({
  locale,
  modelName,
}: GenerateVideoFormProps) {
  const { t } = useTranslation(locale);
  const [prompt, setPrompt] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const modelConfig = getModelConfig(modelName);
  const supportsImageToVideoMode = supportsImageToVideo(modelName);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
  };

  const handleGenerateClick = () => {
    if (!prompt.trim()) {
      alert(t("video_generator.error") ?? "Please enter a video description");
      return;
    }

    // Изображение не обязательно - пользователь может выбрать text-to-video или image-to-video
    setShowPayment(true);
  };

  const handlePaymentSuccess = (sessionId: string) => {
    console.log("Payment successful, session ID:", sessionId);
    alert(
      t("video_generator.payment_successful") ??
        "Payment successful! Video generation will start soon."
    );
    setShowPayment(false);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    alert(
      t("video_generator.payment_error") ?? "Payment failed. Please try again."
    );
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950/40 via-blue-950/40 to-purple-950/40 p-6">
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
            className="flex items-center gap-2 text-green-300 hover:text-green-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("video_generator.back_to", `Back to ${modelName}`).replace(
              "{model}",
              modelName
            )}
          </Link>
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t(
              "video_generator.generate_video_with",
              `Generate Video with ${modelName}`
            ).replace("{model}", modelName)}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t(
              "video_generator.create_amazing_videos",
              "Create amazing AI-generated videos for just $1.00"
            )}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            <Card className="card-enhanced border-green-500/20 bg-gradient-to-br from-green-950/30 via-blue-950/30 to-purple-950/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-green-300 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  {t("video_generator.video_description", "Video Description")}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t(
                    "video_generator.describe_video_detail",
                    "Describe the video you want to create in detail"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="video-prompt"
                    className="text-sm font-medium text-green-300"
                  >
                    {t("video_generator.your_prompt", "Your prompt")}
                  </label>
                  <Textarea
                    id="video-prompt"
                    placeholder={t(
                      "video_generator.placeholder",
                      "For example: Beautiful sunset over ocean with waves, bird's eye view, cinematic quality, smooth camera movements..."
                    )}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                    }}
                    rows={4}
                    className="input-enhanced border-green-500/30 bg-green-950/20 focus:border-green-400 focus:ring-green-400/20"
                  />
                </div>

                {/* Image Upload for Image-to-Video - только для моделей, которые это поддерживают */}
                {supportsImageToVideoMode && (
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    selectedImage={selectedImage}
                    className="mt-4"
                    title={t(
                      "video_generator.upload_source_image",
                      "Upload Source Image (Optional)"
                    )}
                    description={t(
                      "video_generator.upload_image_description",
                      "Upload an image for image-to-video generation, or leave empty for text-to-video"
                    )}
                    required={false}
                    locale={locale}
                  />
                )}

                <Button
                  onClick={handleGenerateClick}
                  disabled={!prompt.trim() || showPayment}
                  className="w-full btn-accent bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                >
                  <Video className="w-4 h-4 mr-2" />
                  {t(
                    "video_generator.generate_for_dollar",
                    "Generate for $1.00"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Model Info */}
            <Card className="card-enhanced border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-purple-950/30 to-green-950/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-blue-300">
                  {t("video_generator.model_information", "Model Information")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-500/20 border-blue-500/30 text-blue-300"
                    >
                      {modelName}
                    </Badge>
                    {supportsImageToVideoMode && (
                      <Badge
                        variant="secondary"
                        className="bg-orange-500/20 border-orange-500/30 text-orange-300"
                      >
                        {t("video_generator.image_to_video", "Image-to-Video")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {modelConfig?.description ??
                      t(
                        "video_generator.advanced_ai_model",
                        "Advanced AI video generation model"
                      )}
                  </p>
                  {supportsImageToVideoMode && (
                    <p className="text-sm text-blue-300">
                      {t(
                        "video_generator.supports_both_modes",
                        "✨ This model supports both text-to-video and image-to-video generation"
                      )}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-6">
            {showPayment && (
              <DirectPaymentButton
                modelName={modelName}
                modelType="video"
                prompt={prompt}
                price={1.0}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                locale={locale}
                // Автоматически определяем тип генерации на основе наличия изображения
                generationType={
                  selectedImage ? "image-to-video" : "text-to-video"
                }
                imageFile={selectedImage}
              />
            )}

            {/* Payment Info */}
            <Card className="card-enhanced border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-green-950/30 to-blue-950/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {t("video_generator.what_you_get", "What You Get")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-300">
                      {t(
                        "video_generator.high_quality_video",
                        "High-quality AI-generated video"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-300">
                      {t(
                        "video_generator.commercial_rights",
                        "Full commercial usage rights"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-300">
                      {t(
                        "video_generator.instant_download",
                        "Instant download after generation"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-300">
                      {t(
                        "video_generator.no_subscription",
                        "No subscription required"
                      )}
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
