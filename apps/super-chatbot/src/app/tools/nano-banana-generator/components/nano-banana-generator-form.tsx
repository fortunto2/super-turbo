// AICODE-NOTE: Form component for Nano Banana image generation
// Provides comprehensive controls for all Nano Banana generation features

"use client";

import { useState, useEffect } from "react";
import { Button } from "@turbo-super/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@turbo-super/ui";
import { Input } from "@turbo-super/ui";
import { Label } from "@turbo-super/ui";
import { Textarea } from "@turbo-super/ui";
import { Separator } from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui";
import { Switch } from "../../../../components/ui";
import {
  Wand2,
  ImageIcon,
  Upload,
  Sparkles,
  Settings,
  Zap,
} from "lucide-react";
import type { NanoBananaImageGenerationRequest } from "../api/nano-banana-api";

interface NanoBananaGeneratorFormProps {
  onGenerate: (request: NanoBananaImageGenerationRequest) => Promise<void>;
  isGenerating: boolean;
  config?: {
    styles: string[];
    qualityLevels: string[];
    aspectRatios: string[];
  };
}

export function NanoBananaGeneratorForm({
  onGenerate,
  isGenerating,
  config = {
    styles: [
      "photorealistic",
      "artistic",
      "minimalist",
      "vintage",
      "futuristic",
    ],
    qualityLevels: ["standard", "high", "ultra"],
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
  },
}: NanoBananaGeneratorFormProps) {
  const [formData, setFormData] = useState<NanoBananaImageGenerationRequest>({
    prompt: "",
    sourceImageUrl: "",
    style: "photorealistic",
    quality: "high",
    aspectRatio: "1:1",
    batchSize: 1,
    enableContextAwareness: true,
    enableSurgicalPrecision: true,
    creativeMode: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setFormData((prev) => ({
          ...prev,
          sourceImageUrl: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt.trim()) {
      return;
    }

    await onGenerate(formData);
  };

  // Update form data
  const updateFormData = (
    field: keyof NanoBananaImageGenerationRequest,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="size-5 text-yellow-600" />
          <span>Nano Banana Image Generator</span>
          <Badge
            variant="secondary"
            className="ml-auto"
          >
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label
              htmlFor="prompt"
              className="text-sm font-medium"
            >
              Prompt *
            </Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate... (e.g., 'A majestic lion in a golden savanna at sunset, photorealistic style')"
              value={formData.prompt}
              onChange={(e) => updateFormData("prompt", e.target.value)}
              className="min-h-[100px]"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500">
              Be specific and detailed for best results. Include style,
              lighting, composition details.
            </p>
          </div>

          {/* Source Image Upload */}
          <div className="space-y-2">
            <Label
              htmlFor="sourceImage"
              className="text-sm font-medium"
            >
              Source Image (Optional)
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="sourceImage"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="flex-1"
                disabled={isGenerating}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  updateFormData("sourceImageUrl", "");
                }}
                disabled={isGenerating || !imageFile}
              >
                Clear
              </Button>
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
            <p className="text-xs text-gray-500">
              Upload an image for image-to-image generation or style reference.
            </p>
          </div>

          <Separator />

          {/* Style and Quality Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="style"
                className="text-sm font-medium"
              >
                Style
              </Label>
              <Select
                value={formData.style || ""}
                onValueChange={(value) => updateFormData("style", value)}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {config.styles.map((style) => (
                    <SelectItem
                      key={style}
                      value={style}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="quality"
                className="text-sm font-medium"
              >
                Quality
              </Label>
              <Select
                value={formData.quality || ""}
                onValueChange={(value) => updateFormData("quality", value)}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  {config.qualityLevels.map((quality) => (
                    <SelectItem
                      key={quality}
                      value={quality}
                    >
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="aspectRatio"
                className="text-sm font-medium"
              >
                Aspect Ratio
              </Label>
              <Select
                value={formData.aspectRatio || ""}
                onValueChange={(value) => updateFormData("aspectRatio", value)}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  {config.aspectRatios.map((ratio) => (
                    <SelectItem
                      key={ratio}
                      value={ratio}
                    >
                      {ratio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Settings className="size-4 text-gray-500" />
              <Label className="text-sm font-medium">Advanced Settings</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="seed"
                  className="text-sm font-medium"
                >
                  Seed (Optional)
                </Label>
                <Input
                  id="seed"
                  type="number"
                  placeholder="Random seed for reproducible results"
                  value={formData.seed || ""}
                  onChange={(e) =>
                    updateFormData(
                      "seed",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="batchSize"
                  className="text-sm font-medium"
                >
                  Batch Size
                </Label>
                <Select
                  value={formData.batchSize?.toString() || "1"}
                  onValueChange={(value) =>
                    updateFormData("batchSize", parseInt(value))
                  }
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 image</SelectItem>
                    <SelectItem value="2">2 images</SelectItem>
                    <SelectItem value="4">4 images</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Nano Banana Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="size-4 text-blue-600" />
              <Label className="text-sm font-medium">
                Nano Banana Features
              </Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Context Awareness
                  </Label>
                  <p className="text-xs text-gray-500">
                    Understands relationships between objects and environment
                  </p>
                </div>
                <Switch
                  checked={formData.enableContextAwareness || false}
                  onCheckedChange={(checked) =>
                    updateFormData("enableContextAwareness", checked)
                  }
                  disabled={isGenerating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Surgical Precision
                  </Label>
                  <p className="text-xs text-gray-500">
                    Adds or replaces items with extreme accuracy
                  </p>
                </div>
                <Switch
                  checked={formData.enableSurgicalPrecision || false}
                  onCheckedChange={(checked) =>
                    updateFormData("enableSurgicalPrecision", checked)
                  }
                  disabled={isGenerating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Creative Mode</Label>
                  <p className="text-xs text-gray-500">
                    Enables more experimental and creative outputs
                  </p>
                </div>
                <Switch
                  checked={formData.creativeMode || false}
                  onCheckedChange={(checked) =>
                    updateFormData("creativeMode", checked)
                  }
                  disabled={isGenerating}
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isGenerating || !formData.prompt.trim()}
          >
            {isGenerating ? (
              <>
                <Sparkles className="size-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="size-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
