// AICODE-NOTE: Unified form component for Nano Banana image generation and editing
// Combines functionality from both generator and editor forms into a single interface

"use client";

import { useState } from "react";
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
import { Wand2, Edit3, Sparkles, Settings, Zap, } from "lucide-react";
import type {
  NanoBananaImageGenerationRequest,
  NanoBananaImageEditingRequest,
} from "../api/nano-banana-api";

interface NanoBananaUnifiedFormProps {
  onGenerate: (request: NanoBananaImageGenerationRequest) => Promise<void>;
  onEdit: (request: NanoBananaImageEditingRequest) => Promise<void>;
  isGenerating: boolean;
  isEditing: boolean;
  config?: {
    styles: string[];
    qualityLevels: string[];
    aspectRatios: string[];
    editTypes: string[];
    precisionLevels: string[];
    blendModes: string[];
  };
}

export function NanoBananaUnifiedForm({
  onGenerate,
  onEdit,
  isGenerating,
  isEditing,
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
    editTypes: [
      "remove_object",
      "add_object",
      "replace_background",
      "style_transfer",
      "color_adjustment",
      "lighting_adjustment",
      "texture_enhancement",
      "composition_change",
      "artistic_effect",
      "object_replacement",
    ],
    precisionLevels: ["low", "medium", "high", "ultra"],
    blendModes: [
      "normal",
      "overlay",
      "soft_light",
      "hard_light",
      "multiply",
      "screen",
    ],
  },
}: NanoBananaUnifiedFormProps) {
  // Form data for generation
  const [generateData, setGenerateData] =
    useState<NanoBananaImageGenerationRequest>({
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

  // Form data for editing
  const [editData, setEditData] = useState<NanoBananaImageEditingRequest>({
    editType: "object-removal",
    editPrompt: "",
    sourceImageUrl: "",
    precisionLevel: "automatic",
    blendMode: "natural",
    preserveOriginalStyle: true,
    enhanceLighting: true,
    preserveShadows: true,
    batchSize: 1,
  });

  // File upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const mode = imageFile ? "edit" : "generate";

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        setGenerateData((prev) => ({ ...prev, sourceImageUrl: imageUrl }));
        setEditData((prev) => ({ ...prev, sourceImageUrl: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setGenerateData((prev) => ({ ...prev, sourceImageUrl: "" }));
    setEditData((prev) => ({ ...prev, sourceImageUrl: "" }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "generate") {
      if (!generateData.prompt.trim()) return;
      await onGenerate(generateData);
    } else {
      if (!editData.editPrompt.trim() || !editData.sourceImageUrl.trim())
        return;
      await onEdit(editData);
    }
  };

  // Update form data
  const updateGenerateData = (
    field: keyof NanoBananaImageGenerationRequest,
    value: any
  ) => {
    setGenerateData((prev) => ({ ...prev, [field]: value }));
  };

  const updateEditData = (
    field: keyof NanoBananaImageEditingRequest,
    value: any
  ) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Get edit type specific fields
  const getEditTypeSpecificFields = () => {
    switch (editData.editType) {
      case "remove_object":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="objectToRemove"
              className="text-sm font-medium"
            >
              Object to Remove
            </Label>
            <Input
              id="objectToRemove"
              placeholder="e.g., 'person in the background'"
              value={editData.objectToRemove || ""}
              onChange={(e) => updateEditData("objectToRemove", e.target.value)}
              disabled={isEditing}
            />
          </div>
        );
      case "add_object":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="targetObject"
              className="text-sm font-medium"
            >
              Object to Add
            </Label>
            <Input
              id="targetObject"
              placeholder="e.g., 'a golden retriever'"
              value={editData.targetObject || ""}
              onChange={(e) => updateEditData("targetObject", e.target.value)}
              disabled={isEditing}
            />
          </div>
        );
      case "replace_background":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="newBackground"
              className="text-sm font-medium"
            >
              New Background
            </Label>
            <Input
              id="newBackground"
              placeholder="e.g., 'beach sunset'"
              value={editData.newBackground || ""}
              onChange={(e) => updateEditData("newBackground", e.target.value)}
              disabled={isEditing}
            />
          </div>
        );
      case "style_transfer":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="styleToTransfer"
              className="text-sm font-medium"
            >
              Style to Transfer
            </Label>
            <Input
              id="styleToTransfer"
              placeholder="e.g., 'Van Gogh style'"
              value={editData.styleToTransfer || ""}
              onChange={(e) =>
                updateEditData("styleToTransfer", e.target.value)
              }
              disabled={isEditing}
            />
          </div>
        );
      case "object_replacement":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="replacementObject"
              className="text-sm font-medium"
            >
              Replacement Object
            </Label>
            <Input
              id="replacementObject"
              placeholder="e.g., 'replace the car with a bicycle'"
              value={editData.replacementObject || ""}
              onChange={(e) =>
                updateEditData("replacementObject", e.target.value)
              }
              disabled={isEditing}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const isProcessing = isGenerating || isEditing;
  const canSubmit =
    mode === "generate"
      ? generateData.prompt.trim()
      : editData.editPrompt.trim() && editData.sourceImageUrl.trim();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="size-5 text-blue-600" />
          <span>Nano Banana Generator</span>
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
          {/* Source Image Upload */}
          <div className="space-y-2">
            <Label
              htmlFor="sourceImage"
              className="text-sm font-medium"
            >
              Source Image{" "}
              {mode === "edit"
                ? "(Required for editing)"
                : "(Optional - upload to edit mode)"}
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="sourceImage"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="flex-1"
                disabled={isProcessing}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearImage}
                disabled={isProcessing || !imageFile}
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
              {mode === "generate"
                ? "Upload an image for image-to-image generation or style reference."
                : "Upload the image you want to edit."}
            </p>
          </div>

          {/* Main Prompt/Instructions */}
          <div className="space-y-2">
            <Label
              htmlFor={mode === "generate" ? "prompt" : "editPrompt"}
              className="text-sm font-medium"
            >
              {mode === "generate" ? "Prompt" : "Edit Instructions"} *
            </Label>
            <Textarea
              id={mode === "generate" ? "prompt" : "editPrompt"}
              placeholder={
                mode === "generate"
                  ? "Describe the image you want to generate... (e.g., 'A majestic lion in a golden savanna at sunset, photorealistic style')"
                  : "Describe what you want to edit... (e.g., 'Remove the person in the background and replace with a sunset')"
              }
              value={
                mode === "generate" ? generateData.prompt : editData.editPrompt
              }
              onChange={(e) => {
                if (mode === "generate") {
                  updateGenerateData("prompt", e.target.value);
                } else {
                  updateEditData("editPrompt", e.target.value);
                }
              }}
              className="min-h-[100px]"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500">
              {mode === "generate"
                ? "Be specific and detailed for best results. Include style, lighting, composition details."
                : "Be specific about what changes you want to make to the image."}
            </p>
          </div>

          {/* Edit Type Selection (only for edit mode) */}
          {mode === "edit" && (
            <div className="space-y-2">
              <Label
                htmlFor="editType"
                className="text-sm font-medium"
              >
                Edit Type *
              </Label>
              <Select
                value={editData.editType || ""}
                onValueChange={(value) => updateEditData("editType", value)}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select edit type" />
                </SelectTrigger>
                <SelectContent>
                  {config.editTypes.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                    >
                      {type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Edit Type Specific Fields */}
          {mode === "edit" && getEditTypeSpecificFields()}

          <Separator />

          {/* Style and Quality Settings (for generate mode) */}
          {mode === "generate" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="style"
                  className="text-sm font-medium"
                >
                  Style
                </Label>
                <Select
                  value={generateData.style || ""}
                  onValueChange={(value) => updateGenerateData("style", value)}
                  disabled={isProcessing}
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
                  value={generateData.quality || ""}
                  onValueChange={(value) =>
                    updateGenerateData("quality", value)
                  }
                  disabled={isProcessing}
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
                  value={generateData.aspectRatio || ""}
                  onValueChange={(value) =>
                    updateGenerateData("aspectRatio", value)
                  }
                  disabled={isProcessing}
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
          )}

          {/* Precision and Blend Settings (for edit mode) */}
          {mode === "edit" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="precisionLevel"
                  className="text-sm font-medium"
                >
                  Precision Level
                </Label>
                <Select
                  value={editData.precisionLevel || ""}
                  onValueChange={(value) =>
                    updateEditData("precisionLevel", value)
                  }
                  disabled={isProcessing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select precision level" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.precisionLevels.map((level) => (
                      <SelectItem
                        key={level}
                        value={level}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="blendMode"
                  className="text-sm font-medium"
                >
                  Blend Mode
                </Label>
                <Select
                  value={editData.blendMode || ""}
                  onValueChange={(value) => updateEditData("blendMode", value)}
                  disabled={isProcessing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blend mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.blendModes.map((mode) => (
                      <SelectItem
                        key={mode}
                        value={mode}
                      >
                        {mode.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

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
                  value={
                    mode === "generate"
                      ? generateData.seed || ""
                      : editData.seed || ""
                  }
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number.parseInt(e.target.value)
                      : undefined;
                    if (mode === "generate") {
                      updateGenerateData("seed", value);
                    } else {
                      updateEditData("seed", value);
                    }
                  }}
                  disabled={isProcessing}
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
                  value={
                    mode === "generate"
                      ? generateData.batchSize?.toString() || "1"
                      : editData.batchSize?.toString() || "1"
                  }
                  onValueChange={(value) => {
                    const batchSize = Number.parseInt(value);
                    if (mode === "generate") {
                      updateGenerateData("batchSize", batchSize);
                    } else {
                      updateEditData("batchSize", batchSize);
                    }
                  }}
                  disabled={isProcessing}
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
              {mode === "generate" ? (
                // Generate mode features
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Context Awareness
                      </Label>
                      <p className="text-xs text-gray-500">
                        Understands relationships between objects and
                        environment
                      </p>
                    </div>
                    <Switch
                      checked={generateData.enableContextAwareness || false}
                      onCheckedChange={(checked) =>
                        updateGenerateData("enableContextAwareness", checked)
                      }
                      disabled={isProcessing}
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
                      checked={generateData.enableSurgicalPrecision || false}
                      onCheckedChange={(checked) =>
                        updateGenerateData("enableSurgicalPrecision", checked)
                      }
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Creative Mode
                      </Label>
                      <p className="text-xs text-gray-500">
                        Enables more experimental and creative outputs
                      </p>
                    </div>
                    <Switch
                      checked={generateData.creativeMode || false}
                      onCheckedChange={(checked) =>
                        updateGenerateData("creativeMode", checked)
                      }
                      disabled={isProcessing}
                    />
                  </div>
                </>
              ) : (
                // Edit mode features
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Preserve Original Style
                    </Label>
                    <Switch
                      checked={editData.preserveOriginalStyle || false}
                      onCheckedChange={(checked) =>
                        updateEditData("preserveOriginalStyle", checked)
                      }
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Enhance Lighting
                    </Label>
                    <Switch
                      checked={editData.enhanceLighting || false}
                      onCheckedChange={(checked) =>
                        updateEditData("enhanceLighting", checked)
                      }
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Preserve Shadows
                    </Label>
                    <Switch
                      checked={editData.preserveShadows || false}
                      onCheckedChange={(checked) =>
                        updateEditData("preserveShadows", checked)
                      }
                      disabled={isProcessing}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing || !canSubmit}
          >
            {isProcessing ? (
              <>
                <Sparkles className="size-4 mr-2 animate-spin" />
                {mode === "generate" ? "Generating..." : "Editing..."}
              </>
            ) : (
              <>
                {mode === "generate" ? (
                  <Wand2 className="size-4 mr-2" />
                ) : (
                  <Edit3 className="size-4 mr-2" />
                )}
                {mode === "generate" ? "Generate Image" : "Edit Image"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
