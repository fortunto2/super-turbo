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
import { Loader2, ImageIcon, Type } from "lucide-react";
import { ImageGenerationParams } from "../../types";

interface ImageGeneratorFormProps {
  onGenerate: (params: ImageGenerationParams) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function ImageGeneratorForm({
  onGenerate,
  isGenerating,
  disabled = false,
}: ImageGeneratorFormProps) {
  const [formData, setFormData] = useState<ImageGenerationParams>({
    prompt: "",
    style: "base",
    resolution: "1024x1024",
    shotSize: "medium_shot",
    model: "",
    seed: Math.floor(Math.random() * 1000000000000),
  });

  const [mode, setMode] = useState<"text-to-image" | "image-to-image">(
    "text-to-image"
  );

  const handleInputChange = (
    field: keyof ImageGenerationParams,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleModeChange = (value: string) => {
    setMode(value as "text-to-image" | "image-to-image");
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
          <ImageIcon className="size-5" />
          AI Image Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate high-quality images using AI models from SuperDuperAI
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
                value="text-to-image"
                className="flex items-center gap-2"
              >
                <Type className="size-4" />
                Text to Image
              </TabsTrigger>
              <TabsTrigger
                value="image-to-image"
                className="flex items-center gap-2"
              >
                <ImageIcon className="size-4" />
                Image to Image
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="text-to-image"
              className="space-y-6 mt-6"
            >
              {/* Text-to-Image Mode */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Image Description *</Label>
                <textarea
                  id="prompt"
                  placeholder="Describe the image you want to generate..."
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
              value="image-to-image"
              className="space-y-6 mt-6"
            >
              {/* Image-to-Image Mode */}
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
                  Describe how you want the source image to be changed
                </p>
              </div>
            </TabsContent>
          </Tabs>

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
                <option value="flux-pro">FLUX Pro</option>
                <option value="flux-dev">FLUX Dev</option>
                <option value="dall-e-3">DALL-E 3</option>
                <option value="midjourney">Midjourney</option>
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
                <option value="photographic">Photographic</option>
                <option value="artistic">Artistic</option>
                <option value="cinematic">Cinematic</option>
                <option value="anime">Anime</option>
                <option value="digital-art">Digital Art</option>
              </select>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <select
                id="resolution"
                value={formData.resolution}
                onChange={(e) =>
                  handleInputChange("resolution", e.target.value)
                }
                disabled={disabled || isGenerating}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1024x1024">1024x1024 (Square)</option>
                <option value="1024x1792">1024x1792 (Portrait)</option>
                <option value="1792x1024">1792x1024 (Landscape)</option>
                <option value="1152x896">1152x896 (Widescreen)</option>
                <option value="896x1152">896x1152 (Tall)</option>
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
                <option value="medium_shot">Medium Shot</option>
                <option value="close_up">Close Up</option>
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
              <ImageIcon className="size-4 mr-2" />
            )}
            Generate Image
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
