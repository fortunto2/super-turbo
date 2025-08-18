"use client";

import { useState, useRef, useEffect } from "react";
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

export default function GenerateEnhancedVideoPage() {
  const searchParams = useSearchParams();
  const locale = (searchParams.get("locale") as Locale) || "en";
  const { t } = useTranslation(locale);
  const [prompt, setPrompt] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [generationType, setGenerationType] = useState<
    "text-to-video" | "image-to-video" | "text-to-image" | "image-to-image"
  >("text-to-video");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [generationResult, setGenerationResult] = useState<{
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    width?: number;
    height?: number;
  } | null>(null);
  const [_generationId, setGenerationId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modelName = searchParams.get("model") || "Unknown Model";
  const sessionId = searchParams.get("session_id");

  // Проверяем, есть ли session_id (оплата уже прошла)
  const hasValidPayment = !!sessionId;

  // Если есть session_id, показываем форму генерации
  useEffect(() => {
    if (sessionId) {
      console.log("Payment completed, session ID:", sessionId);
      setShowPayment(false); // Скрываем кнопку оплаты
    }
  }, [sessionId]);

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

  const handleGenerateClick = async () => {
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

    // Если оплата уже прошла (есть session_id), запускаем генерацию напрямую
    if (hasValidPayment && sessionId) {
      await startGeneration(sessionId);
      return;
    }

    // Иначе показываем кнопку оплаты
    setShowPayment(true);
  };

  const startGeneration = async (paymentSessionId: string) => {
    setIsGenerating(true);
    setGenerationStatus("Starting video generation...");

    try {
      // Создаем FormData если есть изображение
      const requestBody = selectedImage
        ? (() => {
            const formData = new FormData();
            formData.append("modelName", modelName);
            formData.append("prompt", prompt.trim());
            formData.append("paymentSessionId", paymentSessionId);
            formData.append("generationType", generationType);
            formData.append("imageFile", selectedImage);
            console.log("🎬 Created FormData with image");
            return formData;
          })()
        : JSON.stringify({
            modelName,
            prompt: prompt.trim(),
            paymentSessionId: paymentSessionId,
            generationType,
          });

      const response = await fetch("/api/generate-model-video", {
        method: "POST",
        headers: selectedImage
          ? {} // FormData автоматически устанавливает Content-Type
          : { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error("Failed to start generation");
      }

      const data = await response.json();

      if (data.success && data.taskId) {
        setGenerationId(data.taskId); // Используем taskId (fileId из SuperDuperAI)
        setGenerationStatus("Generation started! Monitoring progress...");

        // Запускаем мониторинг статуса используя taskId
        startStatusMonitoring(data.taskId);
      } else {
        setGenerationStatus("Failed to start generation. Please try again.");
      }
    } catch (error) {
      console.error("Generation error:", error);
      setGenerationStatus("Generation failed. Please try again.");
      setIsGenerating(false);
    }
  };

  const startStatusMonitoring = async (generationId: string) => {
    setIsGenerating(true);
    setGenerationStatus("Monitoring generation progress...");

    try {
      while (true) {
        const response = await fetch(
          `/api/get-generation-status/${generationId}`
        );
        if (!response.ok) {
          throw new Error("Failed to get generation status");
        }
        const data = await response.json();

        if (data.status === "completed") {
          setGenerationStatus("Generation completed successfully!");
          setGenerationResult(data.result);
          setIsGenerating(false);
          break;
        } else if (data.status === "failed") {
          setGenerationStatus(
            `Generation failed: ${data.error || "Unknown error"}`
          );
          setIsGenerating(false);
          break;
        } else if (data.status === "error") {
          setGenerationStatus(
            `Generation error: ${data.error || "Unknown error"}`
          );
          setIsGenerating(false);
          break;
        } else {
          // Показываем прогресс если есть
          const progressText = data.progress ? ` (${data.progress}%)` : "";
          const timeText = data.estimatedTime
            ? ` - Est. ${data.estimatedTime}s remaining`
            : "";
          setGenerationStatus(
            `${data.message || data.status}${progressText}${timeText}`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Check every 2 seconds
        }
      }
    } catch (error) {
      console.error("Status monitoring error:", error);
      setGenerationStatus("Failed to monitor generation progress.");
      setIsGenerating(false);
    }
  };

  const handlePaymentSuccess = (sessionId: string) => {
    // Здесь можно добавить логику для запуска генерации
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
                {/* Generation Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">
                    Generation Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
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
                    <Button
                      variant={
                        generationType === "text-to-image"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setGenerationType("text-to-image")}
                      className={
                        generationType === "text-to-image"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      }
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Text-to-Image
                    </Button>
                    <Button
                      variant={
                        generationType === "image-to-image"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setGenerationType("image-to-image")}
                      className={
                        generationType === "image-to-image"
                          ? "bg-green-600 hover:bg-green-700"
                          : "border-green-500/30 text-green-300 hover:bg-green-500/10"
                      }
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Image-to-Image
                    </Button>
                  </div>
                </div>

                {/* Image Upload for Image-based generation */}
                {(generationType === "image-to-video" ||
                  generationType === "image-to-image") && (
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
                      : generationType === "image-to-image"
                        ? "Describe how to transform the image"
                        : "Video description"}
                  </label>
                  <Textarea
                    placeholder={
                      generationType === "image-to-video"
                        ? "For example: slowly sway, smoothly rotate, add cloud movement..."
                        : generationType === "image-to-image"
                          ? "For example: make it more vibrant, add sunset colors, transform to watercolor style..."
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
                    ((generationType === "image-to-video" ||
                      generationType === "image-to-image") &&
                      !selectedImage) ||
                    showPayment ||
                    isGenerating
                  }
                  className="w-full btn-accent bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video className="w-4 h-4 mr-2" />
                  {isGenerating
                    ? "Generating..."
                    : hasValidPayment
                      ? "Generate Video"
                      : "Generate for $1.00"}
                </Button>

                {/* Показываем статус генерации */}
                {generationStatus && (
                  <div className="text-center p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">{generationStatus}</p>
                  </div>
                )}
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
                    Advanced AI video generation model with enhanced features
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-6">
            {showPayment && !hasValidPayment && (
              <DirectPaymentButton
                modelName={modelName}
                modelType="video"
                prompt={prompt}
                price={1.0}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                locale={locale}
              />
            )}

            {/* Generation Status */}
            {generationStatus && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Generation Status
                </h3>
                <p className="text-gray-300">{generationStatus}</p>
                {generationResult && (
                  <div className="mt-4 p-3 bg-green-900 rounded">
                    <h4 className="font-medium text-green-200">
                      Video Generated Successfully!
                    </h4>
                    <div className="mt-2 space-y-2 text-sm text-green-100">
                      {generationResult.videoUrl && (
                        <div>
                          <strong>Video:</strong>
                          <a
                            href={generationResult.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-300 hover:underline"
                          >
                            Download Video
                          </a>
                        </div>
                      )}
                      {generationResult.thumbnailUrl && (
                        <div>
                          <strong>Thumbnail:</strong>
                          <a
                            href={generationResult.thumbnailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-300 hover:underline"
                          >
                            View Thumbnail
                          </a>
                        </div>
                      )}
                      {generationResult.duration && (
                        <div>
                          <strong>Duration:</strong> {generationResult.duration}
                          s
                        </div>
                      )}
                      {generationResult.width && generationResult.height && (
                        <div>
                          <strong>Resolution:</strong> {generationResult.width}x
                          {generationResult.height}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
