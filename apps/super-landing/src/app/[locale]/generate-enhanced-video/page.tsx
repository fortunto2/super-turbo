"use client";

import { useState, useRef } from "react";
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
import { Video, Image as ImageIcon, ArrowLeft, Upload, X } from "lucide-react";
import { DirectPaymentButton } from "@/components/ui/direct-payment-button";
import { useTranslation } from "@/hooks/use-translation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Locale } from "@/config/i18n-config";
import {
  getModelConfig,
  supportsImageToVideo,
  supportsTextToVideo,
} from "@/lib/models-config";

export default function GenerateEnhancedVideoPage() {
  const searchParams = useSearchParams();
  const locale = (searchParams.get("locale") as Locale) || "en";
  const { t } = useTranslation(locale);
  const [prompt, setPrompt] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  // Определяем начальный тип генерации на основе поддерживаемых возможностей
  const getInitialGenerationType = () => {
    if (supportsTextToVideoMode) return "text-to-video";
    if (supportsImageToVideoMode) return "image-to-video";
    return "text-to-video"; // fallback
  };

  const [generationType, setGenerationType] = useState<
    "text-to-video" | "image-to-video"
  >(getInitialGenerationType());
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modelName = searchParams.get("model") || "Unknown Model";
  const modelConfig = getModelConfig(modelName);
  const supportsImageToVideoMode = supportsImageToVideo(modelName);
  const supportsTextToVideoMode = supportsTextToVideo(modelName);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Создаем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedImage(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerateClick = () => {
    if (!prompt.trim()) {
      alert(t("video_generator.error") || "Please enter a video description");
      return;
    }

    if (generationType === "image-to-video" && !selectedImage) {
      alert(
        t("video_generator.upload_image_required") ||
          "Please upload an image for image-to-video generation"
      );
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = (sessionId: string) => {
    console.log("Payment successful, session ID:", sessionId);
    alert("Payment successful! Enhanced video generation will start soon.");
    setShowPayment(false);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    alert(
      t("video_generator.payment_error") || "Payment failed. Please try again."
    );
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950/40 via-green-950/40 to-blue-950/40 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/blog/${modelName.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "")}`}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {modelName}
          </Link>
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
            Generate Enhanced Video with {modelName}
          </h1>
          <p className="text-muted-foreground text-lg">
            Create amazing AI-generated videos with advanced features for just
            $1.00
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            <Card className="card-enhanced border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-green-950/30 to-blue-950/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-purple-300 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Generation
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose generation type and describe what you want to create
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Generation Type Selection - только поддерживаемые типы */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">
                    Generation Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {supportsTextToVideoMode && (
                      <Button
                        variant={
                          generationType === "text-to-video"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setGenerationType("text-to-video")}
                        className={
                          generationType === "text-to-video"
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                        }
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Text-to-Video
                      </Button>
                    )}
                    {supportsImageToVideoMode && (
                      <Button
                        variant={
                          generationType === "image-to-video"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setGenerationType("image-to-video")}
                        className={
                          generationType === "image-to-video"
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                        }
                      >
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Image-to-Video
                      </Button>
                    )}
                    {/* Убираем text-to-image и image-to-image, так как это страница для видео */}
                  </div>
                </div>

                {/* Image Upload - только для image-to-video */}
                {generationType === "image-to-video" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-orange-300">
                      Upload Image
                    </label>
                    <div className="border-2 border-dashed border-orange-500/30 rounded-lg p-4 text-center">
                      {imagePreview ? (
                        <div className="space-y-3">
                          <div className="relative inline-block">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-green-300">
                            ✓ Image uploaded successfully
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 mx-auto text-orange-400" />
                          <p className="text-sm text-muted-foreground">
                            Click to select image or drag and drop file
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Select File
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Prompt Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">
                    {generationType === "image-to-video"
                      ? "Describe how to animate the image"
                      : "Video description"}
                  </label>
                  <Textarea
                    placeholder={
                      generationType === "image-to-video"
                        ? "For example: slowly sway, smoothly rotate, add cloud movement..."
                        : "For example: Beautiful sunset over ocean with waves, bird's eye view, cinematic quality..."
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="input-enhanced border-purple-500/30 bg-purple-950/20 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>

                <Button
                  onClick={handleGenerateClick}
                  disabled={
                    !prompt.trim() ||
                    (generationType === "image-to-video" && !selectedImage) ||
                    showPayment
                  }
                  className="w-full btn-accent bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Generate for $1.00
                </Button>
              </CardContent>
            </Card>

            {/* Model Info */}
            <Card className="card-enhanced border-green-500/20 bg-gradient-to-br from-green-950/30 via-blue-950/30 to-purple-950/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-green-300">
                  Model Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-500/20 border-green-500/30 text-green-300"
                    >
                      {modelName}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {modelConfig?.description ||
                      "Advanced AI video generation model with enhanced features"}
                  </p>
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
                generationType={generationType}
                imageFile={selectedImage}
              />
            )}

            {/* Payment Info */}
            <Card className="card-enhanced border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-purple-950/30 to-green-950/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-blue-300 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  What You Get
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-300">
                      High-quality AI-generated video
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-300">
                      Full commercial usage rights
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-300">
                      Instant download after generation
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-300">
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
