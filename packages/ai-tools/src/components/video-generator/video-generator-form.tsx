"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@turbo-super/ui";
import { Loader2, VideoIcon, Type, ImageIcon } from "lucide-react";
import { VideoGenerationParams } from "../../types";

interface VideoGeneratorFormProps {
  onGenerate: (params: VideoGenerationParams) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function VideoGeneratorForm({
  onGenerate,
  isGenerating,
  disabled = false,
}: VideoGeneratorFormProps) {
  const [formData, setFormData] = useState<VideoGenerationParams>({
    prompt: "",
    negativePrompt: "",
    style: "base",
    resolution: "1280x720 (HD)",
    shotSize: "",
    model: "",
    frameRate: 30,
    duration: 5,
    seed: Math.floor(Math.random() * 1000000000000),
    generationType: "text-to-video",
    file: undefined,
  });

  const [mode, setMode] = useState<"text-to-video" | "image-to-video">(
    "text-to-video"
  );

  const handleInputChange = (
    field: keyof VideoGenerationParams,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleModeChange = (value: string) => {
    setMode(value as "text-to-video" | "image-to-video");
    handleInputChange("generationType", value as "text-to-video" | "image-to-video");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.prompt.trim()) {
      onGenerate(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VideoIcon className="size-5" />
          AI Video Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate high-quality videos using AI models from SuperDuperAI
        </p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Generation Type Tabs */}
          <Tabs
            value={mode}
            onValueChange={handleModeChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="text-to-video"
                className="flex items-center gap-2"
              >
                <Type className="size-4" />
                Text to Video
              </TabsTrigger>
              <TabsTrigger
                value="image-to-video"
                className="flex items-center gap-2"
              >
                <ImageIcon className="size-4" />
                Image to Video
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="text-to-video"
              className="space-y-6 mt-6"
            >
              {/* Text-to-Video Mode */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Video Description *</Label>
                <textarea
                  id="prompt"
                  placeholder="Describe the video you want to generate..."
                  value={formData.prompt}
                  onChange={(e) => handleInputChange("prompt", e.target.value)}
                  disabled={disabled || isGenerating}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-muted-foreground">
                  Be detailed and specific for better results
                </p>
              </div>
            </TabsContent>
            <TabsContent
              value="image-to-video"
              className="space-y-6 mt-6"
            >
              {/* Image-to-Video Mode */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt *</Label>
                <textarea
                  id="prompt"
                  placeholder="Describe the transformation you want..."
                  value={formData.prompt}
                  onChange={(e) => handleInputChange("prompt", e.target.value)}
                  disabled={disabled || isGenerating}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-muted-foreground">
                  Describe how you want the source image to be animated
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label htmlFor="negativePrompt">Negative Prompt (Optional)</Label>
            <textarea
              id="negativePrompt"
              placeholder="What you don't want in the video..."
              value={formData.negativePrompt}
              onChange={(e) => handleInputChange("negativePrompt", e.target.value)}
              disabled={disabled || isGenerating}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-muted-foreground">
              Specify elements you want to avoid in the generated video
            </p>
          </div>

          {/* Model and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <select
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                disabled={disabled || isGenerating}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a model</option>
                <option value="veo3">Veo 3</option>
                <option value="pika-labs">Pika Labs</option>
                <option value="runway">Runway</option>
                <option value="stable-video">Stable Video</option>
              </select>
            </div>

            {/* Style Selection */}
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <select
                id="style"
                value={formData.style}
                onChange={(e) => handleInputChange("style", e.target.value)}
                disabled={disabled || isGenerating}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="base">Base</option>
                <option value="cinematic">Cinematic</option>
                <option value="artistic">Artistic</option>
                <option value="realistic">Realistic</option>
                <option value="animated">Animated</option>
              </select>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <select
                id="resolution"
                value={formData.resolution}
                onChange={(e) => handleInputChange("resolution", e.target.value)}
                disabled={disabled || isGenerating}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1280x720 (HD)">1280x720 (HD)</option>
                <option value="1920x1080 (Full HD)">1920x1080 (Full HD)</option>
                <option value="2560x1440 (2K)">2560x1440 (2K)</option>
                <option value="3840x2160 (4K)">3840x2160 (4K)</option>
              </select>
            </div>

            {/* Frame Rate */}
            <div className="space-y-2">
              <Label htmlFor="frameRate">Frame Rate</Label>
              <select
                id="frameRate"
                value={formData.frameRate}
                onChange={(e) => handleInputChange("frameRate", parseInt(e.target.value))}
                disabled={disabled || isGenerating}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={24}>24 FPS</option>
                <option value={30}>30 FPS</option>
                <option value={60}>60 FPS</option>
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <select
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                disabled={disabled || isGenerating}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={8}>8 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
                <option value={20}>20 seconds</option>
                <option value={30}>30 seconds</option>
              </select>
            </div>

            {/* Shot Size */}
            <div className="space-y-2">
              <Label htmlFor="shotSize">Shot Size</Label>
              <select
                id="shotSize"
                value={formData.shotSize}
                onChange={(e) => handleInputChange("shotSize", e.target.value)}
                disabled={disabled || isGenerating}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select shot size</option>
                <option value="close_up">Close Up</option>
                <option value="medium_shot">Medium Shot</option>
                <option value="wide_shot">Wide Shot</option>
                <option value="extreme_close_up">Extreme Close Up</option>
                <option value="long_shot">Long Shot</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isGenerating || disabled}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <VideoIcon className="size-4 mr-2" />
            )}
            Generate Video
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
