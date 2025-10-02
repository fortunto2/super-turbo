// AICODE-NOTE: Form component for Nano Banana image editing
// Provides comprehensive controls for all Nano Banana editing features

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
import { Edit3, Settings, Zap, Palette } from "lucide-react";
import type { NanoBananaImageEditingRequest } from "../api/nano-banana-api";

interface NanoBananaEditorFormProps {
  onEdit: (request: NanoBananaImageEditingRequest) => Promise<void>;
  isEditing: boolean;
  config?: {
    editTypes: string[];
    precisionLevels: string[];
    blendModes: string[];
  };
}

export function NanoBananaEditorForm({
  onEdit,
  isEditing,
  config = {
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
}: NanoBananaEditorFormProps) {
  const [formData, setFormData] = useState<NanoBananaImageEditingRequest>({
    editType: "remove_object",
    editPrompt: "",
    sourceImageUrl: "",
    precisionLevel: "high",
    blendMode: "normal",
    preserveOriginalStyle: true,
    enhanceLighting: true,
    preserveShadows: true,
    batchSize: 1,
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
    if (!formData.editPrompt.trim() || !formData.sourceImageUrl.trim()) {
      return;
    }

    await onEdit(formData);
  };

  // Update form data
  const updateFormData = (
    field: keyof NanoBananaImageEditingRequest,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Get edit type specific parameters
  const getEditTypeSpecificFields = () => {
    switch (formData.editType) {
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
              placeholder="e.g., 'person in the background', 'car on the left'"
              value={formData.objectToRemove || ""}
              onChange={(e) => updateFormData("objectToRemove", e.target.value)}
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
              placeholder="e.g., 'a golden retriever', 'a vintage car'"
              value={formData.targetObject || ""}
              onChange={(e) => updateFormData("targetObject", e.target.value)}
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
              placeholder="e.g., 'beach sunset', 'mountain landscape', 'urban cityscape'"
              value={formData.newBackground || ""}
              onChange={(e) => updateFormData("newBackground", e.target.value)}
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
              placeholder="e.g., 'Van Gogh style', 'anime art style', 'watercolor painting'"
              value={formData.styleToTransfer || ""}
              onChange={(e) =>
                updateFormData("styleToTransfer", e.target.value)
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
              placeholder="e.g., 'replace the car with a bicycle', 'replace the dog with a cat'"
              value={formData.replacementObject || ""}
              onChange={(e) =>
                updateFormData("replacementObject", e.target.value)
              }
              disabled={isEditing}
            />
          </div>
        );
      case "lighting_adjustment":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="lightingDirection"
              className="text-sm font-medium"
            >
              Lighting Direction
            </Label>
            <Input
              id="lightingDirection"
              placeholder="e.g., 'warm golden hour lighting', 'dramatic side lighting', 'soft diffused light'"
              value={formData.lightingDirection || ""}
              onChange={(e) =>
                updateFormData("lightingDirection", e.target.value)
              }
              disabled={isEditing}
            />
          </div>
        );
      case "color_adjustment":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="colorAdjustments"
              className="text-sm font-medium"
            >
              Color Adjustments
            </Label>
            <Input
              id="colorAdjustments"
              placeholder="e.g., 'make colors more vibrant', 'desaturate to black and white', 'add warm tones'"
              value={formData.colorAdjustments || ""}
              onChange={(e) =>
                updateFormData("colorAdjustments", e.target.value)
              }
              disabled={isEditing}
            />
          </div>
        );
      case "texture_enhancement":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="textureDetails"
              className="text-sm font-medium"
            >
              Texture Details
            </Label>
            <Input
              id="textureDetails"
              placeholder="e.g., 'enhance fabric textures', 'add wood grain details', 'smooth skin texture'"
              value={formData.textureDetails || ""}
              onChange={(e) => updateFormData("textureDetails", e.target.value)}
              disabled={isEditing}
            />
          </div>
        );
      case "composition_change":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="compositionChanges"
              className="text-sm font-medium"
            >
              Composition Changes
            </Label>
            <Input
              id="compositionChanges"
              placeholder="e.g., 'move subject to the left', 'add rule of thirds framing', 'create depth of field'"
              value={formData.compositionChanges || ""}
              onChange={(e) =>
                updateFormData("compositionChanges", e.target.value)
              }
              disabled={isEditing}
            />
          </div>
        );
      case "artistic_effect":
        return (
          <div className="space-y-2">
            <Label
              htmlFor="artisticEffect"
              className="text-sm font-medium"
            >
              Artistic Effect
            </Label>
            <Input
              id="artisticEffect"
              placeholder="e.g., 'add bokeh effect', 'create vintage film look', 'apply oil painting filter'"
              value={formData.artisticEffect || ""}
              onChange={(e) => updateFormData("artisticEffect", e.target.value)}
              disabled={isEditing}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Edit3 className="size-5 text-green-600" />
          <span>Nano Banana Image Editor</span>
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
              Source Image *
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="sourceImage"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="flex-1"
                disabled={isEditing}
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
                disabled={isEditing || !imageFile}
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
              Upload the image you want to edit.
            </p>
          </div>

          {/* Edit Type Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="editType"
              className="text-sm font-medium"
            >
              Edit Type *
            </Label>
            <Select
              value={formData.editType || ""}
              onValueChange={(value) => updateFormData("editType", value)}
              disabled={isEditing}
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

          {/* Edit Prompt */}
          <div className="space-y-2">
            <Label
              htmlFor="editPrompt"
              className="text-sm font-medium"
            >
              Edit Instructions *
            </Label>
            <Textarea
              id="editPrompt"
              placeholder="Describe what you want to edit... (e.g., 'Remove the person in the background and replace with a beautiful sunset')"
              value={formData.editPrompt}
              onChange={(e) => updateFormData("editPrompt", e.target.value)}
              className="min-h-[100px]"
              disabled={isEditing}
            />
            <p className="text-xs text-gray-500">
              Be specific about what you want to change and how.
            </p>
          </div>

          {/* Edit Type Specific Fields */}
          {getEditTypeSpecificFields()}

          <Separator />

          {/* Precision and Blend Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="precisionLevel"
                className="text-sm font-medium"
              >
                Precision Level
              </Label>
              <Select
                value={formData.precisionLevel || ""}
                onValueChange={(value) =>
                  updateFormData("precisionLevel", value)
                }
                disabled={isEditing}
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
                value={formData.blendMode || ""}
                onValueChange={(value) => updateFormData("blendMode", value)}
                disabled={isEditing}
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
                      {mode
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
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
                      e.target.value ? Number.parseInt(e.target.value) : undefined
                    )
                  }
                  disabled={isEditing}
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
                    updateFormData("batchSize", Number.parseInt(value))
                  }
                  disabled={isEditing}
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
              <Zap className="size-4 text-green-600" />
              <Label className="text-sm font-medium">
                Nano Banana Features
              </Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Preserve Original Style
                  </Label>
                  <p className="text-xs text-gray-500">
                    Maintains the original image&apos;s artistic style
                  </p>
                </div>
                <Switch
                  checked={formData.preserveOriginalStyle || false}
                  onCheckedChange={(checked) =>
                    updateFormData("preserveOriginalStyle", checked)
                  }
                  disabled={isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Enhance Lighting
                  </Label>
                  <p className="text-xs text-gray-500">
                    Automatically improves lighting and shadows
                  </p>
                </div>
                <Switch
                  checked={formData.enhanceLighting || false}
                  onCheckedChange={(checked) =>
                    updateFormData("enhanceLighting", checked)
                  }
                  disabled={isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Preserve Shadows
                  </Label>
                  <p className="text-xs text-gray-500">
                    Maintains realistic shadow details
                  </p>
                </div>
                <Switch
                  checked={formData.preserveShadows || false}
                  onCheckedChange={(checked) =>
                    updateFormData("preserveShadows", checked)
                  }
                  disabled={isEditing}
                />
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              isEditing ||
              !formData.editPrompt.trim() ||
              !formData.sourceImageUrl.trim()
            }
          >
            {isEditing ? (
              <>
                <Palette className="size-4 mr-2 animate-spin" />
                Editing...
              </>
            ) : (
              <>
                <Edit3 className="size-4 mr-2" />
                Edit Image
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
