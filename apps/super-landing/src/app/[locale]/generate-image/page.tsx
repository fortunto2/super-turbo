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
import { DirectPaymentButton } from "@/components/ui/direct-payment-button";
import { ImageUpload } from "@/components/ui/image-upload";
import { useTranslation } from "@/hooks/use-translation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Locale } from "@/config/i18n-config";
import { saveGenerationData } from "@/lib/generation-store";

export default function GenerateImagePage() {
  const searchParams = useSearchParams();
  const locale = (searchParams.get("locale") as Locale) || "en";
  const { t } = useTranslation(locale);
  const [prompt, setPrompt] = useState(() => {
    // Пытаемся восстановить промпт из localStorage
    if (typeof window !== "undefined") {
      const savedPrompt = localStorage.getItem("currentPrompt");
      return savedPrompt || "";
    }
    return "";
  });
  const [showPayment, setShowPayment] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [sessionUsed, setSessionUsed] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const modelName = searchParams.get("model") || "Unknown Model";
  const paymentSessionId = searchParams.get("session_id");

  // Автоматически запускаем генерацию если есть session_id (только один раз)
  React.useEffect(() => {
    if (paymentSessionId && !isGenerating && !sessionUsed) {
      // Проверяем, не была ли уже использована эта сессия
      const usedSessions = JSON.parse(
        localStorage.getItem("usedSessions") || "[]"
      );
      if (usedSessions.includes(paymentSessionId)) {
        setGenerationStatus(
          "This payment session has already been used. Please make a new payment."
        );
        setSessionUsed(true);
        return;
      }

      // Проверяем, есть ли сохраненные данные генерации в localStorage
      const savedGenerationData = localStorage.getItem("pendingGenerationData");
      if (savedGenerationData) {
        try {
          const parsedData = JSON.parse(savedGenerationData);
          console.log("💾 Found saved generation data:", parsedData);

          // Восстанавливаем данные из localStorage
          if (parsedData.prompt) {
            setPrompt(parsedData.prompt);
          }
          if (parsedData.generationType) {
            // Если это image-to-image, нужно восстановить файл
            if (
              parsedData.generationType === "image-to-image" &&
              parsedData.imageFile?.data
            ) {
              // Конвертируем base64 обратно в File
              const base64Data = parsedData.imageFile.data;
              const byteCharacters = atob(base64Data.split(",")[1]);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const file = new File([byteArray], parsedData.imageFile.name, {
                type: parsedData.imageFile.type,
              });
              setSelectedImage(file);
            }
          }

          // Запускаем генерацию с восстановленными данными
          startImageGeneration(paymentSessionId, false, parsedData);

          // Очищаем сохраненные данные после использования
          localStorage.removeItem("pendingGenerationData");
        } catch (error) {
          console.error("Error parsing saved generation data:", error);
          // Если не удалось распарсить, используем текущий промпт
          startImageGeneration(paymentSessionId, prompt.trim() === "");
        }
      } else {
        // Если нет сохраненных данных, используем текущий промпт
        console.log("🔍 Current prompt:", prompt);
        console.log("🔍 Prompt trimmed:", prompt.trim());
        console.log("🔍 Is prompt empty:", prompt.trim() === "");

        // Запускаем генерацию с текущим промптом (placeholder только если промпт действительно пустой)
        startImageGeneration(paymentSessionId, prompt.trim() === "");
      }
    }
  }, [paymentSessionId, sessionUsed]); // Убираем prompt из зависимостей чтобы избежать бесконечного цикла

  const startImageGeneration = async (
    sessionId: string,
    usePlaceholder: boolean = false,
    savedData?: {
      prompt?: string;
      generationType?: string;
      imageFile?: {
        name: string;
        type: string;
        size: number;
        data: string;
      };
    }
  ) => {
    // Предотвращаем повторный запуск
    if (isGenerating) {
      console.log("Generation already in progress, skipping...");
      return;
    }

    // Проверяем, не была ли уже использована эта сессия
    if (sessionId && sessionUsed) {
      console.log("Session already used, skipping...");
      return;
    }

    // Проверяем, не была ли уже запущена генерация для этой сессии
    if (sessionId && generatedImage) {
      console.log("Generation already completed for this session, skipping...");
      return;
    }

    let finalPrompt = prompt.trim();
    let finalGenerationType = "text-to-image";
    let finalSelectedImage = selectedImage;

    // Если есть сохраненные данные, используем их
    if (savedData) {
      finalPrompt = savedData.prompt || finalPrompt;
      finalGenerationType = savedData.generationType || finalGenerationType;
      if (savedData.imageFile?.data) {
        // Конвертируем base64 обратно в File если нужно
        if (!finalSelectedImage) {
          const base64Data = savedData.imageFile.data;
          const byteCharacters = atob(base64Data.split(",")[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          finalSelectedImage = new File([byteArray], savedData.imageFile.name, {
            type: savedData.imageFile.type,
          });
        }
      }
    }

    console.log("🎨 Starting generation with prompt:", finalPrompt);
    console.log("🎨 Generation type:", finalGenerationType);
    console.log("🎨 Has image:", !!finalSelectedImage);
    console.log("🎨 usePlaceholder:", usePlaceholder);

    // Если промпт пустой и нужно использовать placeholder
    if (!finalPrompt && usePlaceholder) {
      finalPrompt =
        "Modern cityscape, skyscrapers, sunset lights, high quality, realistic style";
      console.log("🎨 Using placeholder prompt:", finalPrompt);
      // НЕ устанавливаем промпт в состояние, чтобы не перезаписывать пользовательский ввод
    }

    console.log("🎨 Final prompt to send:", finalPrompt);

    if (!finalPrompt) return;

    setIsGenerating(true);
    setGenerationStatus("Starting image generation...");

    try {
      // Определяем тип генерации
      const generationType = finalSelectedImage
        ? "image-to-image"
        : "text-to-image";

      // Создаем FormData если есть изображение
      const requestBody = finalSelectedImage
        ? (() => {
            const formData = new FormData();
            formData.append("modelName", modelName);
            formData.append("prompt", finalPrompt);
            formData.append("paymentSessionId", sessionId);
            formData.append("generationType", generationType);
            formData.append("imageFile", finalSelectedImage);
            return formData;
          })()
        : JSON.stringify({
            modelName,
            prompt: finalPrompt,
            paymentSessionId: sessionId,
            generationType,
          });

      const response = await fetch("/api/generate-model-image", {
        method: "POST",
        headers: finalSelectedImage
          ? {} // FormData автоматически устанавливает Content-Type
          : { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error("Failed to start generation");
      }

      const data = await response.json();
      setGenerationStatus("Generation started! Polling for results...");

      // Сохраняем данные генерации в localStorage
      const generationData = {
        generationId: data.taskId || sessionId,
        status: "processing" as const,
        progress: 10,
        prompt: finalPrompt,
        modelName,
        modelType: "image" as const,
        paymentSessionId: sessionId,
        createdAt: new Date().toISOString(),
        generationType: generationType as "text-to-image" | "image-to-image",
        images: [
          {
            fileId: data.fileIds?.[0] || data.taskId || sessionId,
            status: "processing" as const,
          },
        ],
      };

      await saveGenerationData(generationData);

      // Начинаем опрос статуса
      pollGenerationStatus(data.taskId || sessionId);
    } catch (error) {
      console.error("Generation error:", error);
      setGenerationStatus("Generation failed. Please try again.");
      setIsGenerating(false);
    }
  };

  const pollGenerationStatus = async (taskId: string) => {
    const maxAttempts = 60; // 5 минут с интервалом 5 секунд
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setGenerationStatus("Generation timeout. Please contact support.");
        setIsGenerating(false);
        return;
      }

      try {
        const response = await fetch(`/api/generation-status?taskId=${taskId}`);
        const data = await response.json();

        if (data.status === "completed" && data.result) {
          // Проверяем разные возможные поля для URL изображения
          const imageUrl =
            data.result.imageUrl || data.result.url || data.result.fileUrl;
          if (imageUrl) {
            setGeneratedImage(imageUrl);
            setGenerationStatus("Generation completed!");
            setIsGenerating(false);

            // Отмечаем сессию как использованную только после успешного завершения
            const usedSessions = JSON.parse(
              localStorage.getItem("usedSessions") || "[]"
            );
            if (!usedSessions.includes(paymentSessionId)) {
              usedSessions.push(paymentSessionId);
              localStorage.setItem(
                "usedSessions",
                JSON.stringify(usedSessions)
              );
              setSessionUsed(true);
            }

            // Очищаем сохраненный промпт после успешной генерации
            localStorage.removeItem("currentPrompt");
          } else {
            // Если статус completed, но URL нет, продолжаем опрос
            setGenerationStatus(
              "Generation completed but no image URL found, continuing to poll..."
            );
            attempts++;
            setTimeout(poll, 5000);
          }
        } else if (data.status === "failed") {
          setGenerationStatus(
            "Generation failed: " + (data.error || "Unknown error")
          );
          setIsGenerating(false);
        } else if (data.status === "processing") {
          setGenerationStatus(
            `Generation in progress... (${data.progress || "processing"})`
          );
          attempts++;
          setTimeout(poll, 5000); // Опрашиваем каждые 5 секунд
        } else {
          // Неизвестный статус, продолжаем опрос
          setGenerationStatus(
            `Unknown status: ${data.status}, continuing to poll...`
          );
          attempts++;
          setTimeout(poll, 5000);
        }
      } catch (error) {
        console.error("Polling error:", error);
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    poll();
  };

  const handleGenerateClick = () => {
    if (!prompt.trim()) {
      alert(t("image_generator.error") || "Please enter an image description");
      return;
    }
    // Сохраняем промпт в localStorage
    localStorage.setItem("currentPrompt", prompt.trim());
    setShowPayment(true);
  };

  const handlePaymentSuccess = (sessionId: string) => {
    // Здесь можно добавить логику для запуска генерации
    console.log("Payment successful, session ID:", sessionId);
    alert("Payment successful! Image generation will start soon.");
    setShowPayment(false);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    alert(
      t("image_generator.payment_error") || "Payment failed. Please try again."
    );
    setShowPayment(false);
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
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

          {/* Сообщение об успешной оплате */}
          {paymentSessionId && (
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                <span className="text-green-300 font-medium">
                  ✓ Payment successful! Enter your prompt below to start
                  generation
                </span>
              </div>
            </div>
          )}
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
                      // Сохраняем промпт в localStorage при каждом изменении
                      localStorage.setItem("currentPrompt", e.target.value);
                    }}
                    rows={4}
                    className="input-enhanced border-blue-500/30 bg-blue-950/20 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>

                {/* Image Upload for Image-to-Image */}
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  selectedImage={selectedImage}
                  className="mt-4"
                />

                <Button
                  onClick={handleGenerateClick}
                  disabled={!prompt.trim() || showPayment || isGenerating}
                  className="w-full btn-accent bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                >
                  <Image className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate for $1.00"}
                </Button>

                {/* Generation Status */}
                {isGenerating && (
                  <div className="bg-gradient-to-br from-blue-950/40 to-purple-950/40 border border-blue-500/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-blue-300">
                        Status: {generationStatus}
                      </span>
                    </div>
                  </div>
                )}

                {/* Generated Image Result */}
                {generatedImage && (
                  <div className="bg-gradient-to-br from-green-950/40 to-blue-950/40 border border-green-500/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="space-y-3">
                      <h4 className="text-lg font-medium text-green-300">
                        Generated Image
                      </h4>
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className="w-full h-auto rounded-lg border border-green-500/30"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.open(generatedImage, "_blank")}
                          variant="outline"
                          size="sm"
                          className="border-green-500/30 text-green-300 hover:bg-green-500/10"
                        >
                          View Full Size
                        </Button>
                        <Button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = generatedImage;
                            link.download = `generated-image-${Date.now()}.png`;
                            link.click();
                          }}
                          variant="outline"
                          size="sm"
                          className="border-green-500/30 text-green-300 hover:bg-green-500/10"
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
                    High-quality AI image generation model
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
                modelType="image"
                prompt={prompt}
                price={1.0}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                locale={locale}
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
