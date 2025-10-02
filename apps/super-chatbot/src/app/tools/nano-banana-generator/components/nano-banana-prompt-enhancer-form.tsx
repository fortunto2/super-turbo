// AICODE-NOTE: Form component for Nano Banana prompt enhancement
// Provides comprehensive controls for prompt optimization

"use client";

import { useState } from "react";
import { Button } from "@turbo-super/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@turbo-super/ui";
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
import { Sparkles, Wand2, Settings, Zap, } from "lucide-react";
import type { NanoBananaPromptEnhancementRequest } from "../api/nano-banana-api";

interface NanoBananaPromptEnhancerFormProps {
  onEnhance: (request: NanoBananaPromptEnhancementRequest) => Promise<void>;
  isEnhancing: boolean;
  config?: {
    techniques: string[];
    styles: string[];
  };
}

export function NanoBananaPromptEnhancerForm({
  onEnhance,
  isEnhancing,
  config = {
    techniques: [
      "context_awareness",
      "surgical_precision",
      "physical_logic",
      "technical_enhancement",
      "artistic_enhancement",
      "composition_optimization",
      "lighting_enhancement",
      "style_consistency",
    ],
    styles: [
      "photorealistic",
      "artistic",
      "minimalist",
      "vintage",
      "futuristic",
      "cinematic",
      "painterly",
      "sketch",
    ],
  },
}: NanoBananaPromptEnhancerFormProps) {
  const [formData, setFormData] = useState<NanoBananaPromptEnhancementRequest>({
    originalPrompt: "",
    enhancementTechnique: "context_awareness",
    targetStyle: "photorealistic",
    includeTechnicalTerms: true,
    includeQualityDescriptors: true,
    enhanceForEditing: false,
    creativeMode: false,
    preserveOriginalIntent: true,
    customInstructions: "",
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.originalPrompt.trim()) {
      return;
    }

    await onEnhance(formData);
  };

  // Update form data
  const updateFormData = (
    field: keyof NanoBananaPromptEnhancementRequest,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="size-5 text-purple-600" />
          <span>Nano Banana Prompt Enhancer</span>
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
          {/* Original Prompt Input */}
          <div className="space-y-2">
            <Label
              htmlFor="originalPrompt"
              className="text-sm font-medium"
            >
              Original Prompt *
            </Label>
            <Textarea
              id="originalPrompt"
              placeholder="Enter your original prompt here... (e.g., 'a cat sitting on a chair')"
              value={formData.originalPrompt}
              onChange={(e) => updateFormData("originalPrompt", e.target.value)}
              className="min-h-[120px]"
              disabled={isEnhancing}
            />
            <p className="text-xs text-gray-500">
              Enter the prompt you want to enhance for better AI generation
              results.
            </p>
          </div>

          {/* Enhancement Technique */}
          <div className="space-y-2">
            <Label
              htmlFor="enhancementTechnique"
              className="text-sm font-medium"
            >
              Enhancement Technique
            </Label>
            <Select
              value={formData.enhancementTechnique || ""}
              onValueChange={(value) =>
                updateFormData("enhancementTechnique", value)
              }
              disabled={isEnhancing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select enhancement technique" />
              </SelectTrigger>
              <SelectContent>
                {config.techniques.map((technique) => (
                  <SelectItem
                    key={technique}
                    value={technique}
                  >
                    {technique
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Choose the primary technique for enhancing your prompt.
            </p>
          </div>

          {/* Target Style */}
          <div className="space-y-2">
            <Label
              htmlFor="targetStyle"
              className="text-sm font-medium"
            >
              Target Style
            </Label>
            <Select
              value={formData.targetStyle || ""}
              onValueChange={(value) => updateFormData("targetStyle", value)}
              disabled={isEnhancing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target style" />
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
            <p className="text-xs text-gray-500">
              The artistic style you want the enhanced prompt to target.
            </p>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label
              htmlFor="customInstructions"
              className="text-sm font-medium"
            >
              Custom Instructions (Optional)
            </Label>
            <Textarea
              id="customInstructions"
              placeholder="Add any specific instructions for the enhancement... (e.g., 'Focus on lighting details', 'Emphasize composition', 'Include technical photography terms')"
              value={formData.customInstructions}
              onChange={(e) =>
                updateFormData("customInstructions", e.target.value)
              }
              className="min-h-[80px]"
              disabled={isEnhancing}
            />
            <p className="text-xs text-gray-500">
              Provide specific guidance for how you want the prompt to be
              enhanced.
            </p>
          </div>

          <Separator />

          {/* Enhancement Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Settings className="size-4 text-gray-500" />
              <Label className="text-sm font-medium">Enhancement Options</Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Include Technical Terms
                  </Label>
                  <p className="text-xs text-gray-500">
                    Adds photography and art technical terminology
                  </p>
                </div>
                <Switch
                  checked={formData.includeTechnicalTerms || false}
                  onCheckedChange={(checked) =>
                    updateFormData("includeTechnicalTerms", checked)
                  }
                  disabled={isEnhancing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Include Quality Descriptors
                  </Label>
                  <p className="text-xs text-gray-500">
                    Adds quality and detail descriptors
                  </p>
                </div>
                <Switch
                  checked={formData.includeQualityDescriptors || false}
                  onCheckedChange={(checked) =>
                    updateFormData("includeQualityDescriptors", checked)
                  }
                  disabled={isEnhancing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Enhance for Editing
                  </Label>
                  <p className="text-xs text-gray-500">
                    Optimizes prompt for image editing operations
                  </p>
                </div>
                <Switch
                  checked={formData.enhanceForEditing || false}
                  onCheckedChange={(checked) =>
                    updateFormData("enhanceForEditing", checked)
                  }
                  disabled={isEnhancing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Preserve Original Intent
                  </Label>
                  <p className="text-xs text-gray-500">
                    Maintains the core meaning of your original prompt
                  </p>
                </div>
                <Switch
                  checked={formData.preserveOriginalIntent || false}
                  onCheckedChange={(checked) =>
                    updateFormData("preserveOriginalIntent", checked)
                  }
                  disabled={isEnhancing}
                />
              </div>
            </div>
          </div>

          {/* Nano Banana Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="size-4 text-purple-600" />
              <Label className="text-sm font-medium">
                Nano Banana Features
              </Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Creative Mode</Label>
                  <p className="text-xs text-gray-500">
                    Enables more experimental and creative enhancements
                  </p>
                </div>
                <Switch
                  checked={formData.creativeMode || false}
                  onCheckedChange={(checked) =>
                    updateFormData("creativeMode", checked)
                  }
                  disabled={isEnhancing}
                />
              </div>
            </div>
          </div>

          {/* Enhance Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isEnhancing || !formData.originalPrompt.trim()}
          >
            {isEnhancing ? (
              <>
                <Wand2 className="size-4 mr-2 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="size-4 mr-2" />
                Enhance Prompt
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
