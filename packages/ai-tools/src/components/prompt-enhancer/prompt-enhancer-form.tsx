"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
} from "@turbo-super/ui";
import { Loader2, Sparkles, Copy, RefreshCw } from "lucide-react";
import { PromptEnhancementParams } from "../../types";

interface PromptEnhancerFormProps {
  onEnhance: (params: PromptEnhancementParams) => void;
  isEnhancing: boolean;
  disabled?: boolean;
  enhancedPrompt?: string;
  onCopyEnhanced?: () => void;
  onReset?: () => void;
}

export function PromptEnhancerForm({
  onEnhance,
  isEnhancing,
  disabled = false,
  enhancedPrompt,
  onCopyEnhanced,
  onReset,
}: PromptEnhancerFormProps) {
  const [formData, setFormData] = useState<PromptEnhancementParams>({
    originalPrompt: "",
    mediaType: "image",
    enhancementLevel: "detailed",
    targetAudience: "",
    includeNegativePrompt: false,
    modelHint: "",
  });

  const handleInputChange = (
    field: keyof PromptEnhancementParams,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.originalPrompt.trim()) {
      onEnhance(formData);
    }
  };

  const handleExamplePrompt = (prompt: string) => {
    setFormData((prev) => ({
      ...prev,
      originalPrompt: prompt,
    }));
  };

  const examplePrompts = {
    image: [
      "мальчик с мячиком",
      "портрет девочки",
      "beautiful landscape",
      "cat playing piano",
    ],
    video: [
      "fast car racing",
      "человек идёт по дороге",
      "bird flying in sky",
      "ocean waves crashing",
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5" />
          AI Prompt Enhancer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Transform your basic prompts into detailed, professional descriptions
          for better AI results
        </p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Original Prompt */}
          <div className="space-y-2">
            <Label htmlFor="originalPrompt">Original Prompt *</Label>
            <Textarea
              id="originalPrompt"
              placeholder="Enter your basic prompt here... (any language is supported)"
              value={formData.originalPrompt}
              onChange={(e) =>
                handleInputChange("originalPrompt", e.target.value)
              }
              disabled={disabled || isEnhancing}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Start with a simple description of what you want
            </p>
          </div>

          {/* Enhancement Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Media Type */}
            <div className="space-y-2">
              <Label htmlFor="mediaType">Media Type</Label>
              <select
                id="mediaType"
                value={formData.mediaType}
                onChange={(e) =>
                  handleInputChange(
                    "mediaType",
                    e.target.value as "image" | "video" | "text" | "general"
                  )
                }
                disabled={disabled || isEnhancing}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="text">Text</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Enhancement Level */}
            <div className="space-y-2">
              <Label htmlFor="enhancementLevel">Enhancement Level</Label>
              <select
                id="enhancementLevel"
                value={formData.enhancementLevel}
                onChange={(e) =>
                  handleInputChange(
                    "enhancementLevel",
                    e.target.value as "basic" | "detailed" | "creative"
                  )
                }
                disabled={disabled || isEnhancing}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="detailed">Detailed</option>
                <option value="creative">Creative</option>
              </select>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
            <input
              id="targetAudience"
              type="text"
              value={formData.targetAudience}
              onChange={(e) =>
                handleInputChange("targetAudience", e.target.value)
              }
              disabled={disabled || isEnhancing}
              placeholder="e.g., Young professionals, Students, etc."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-muted-foreground">
              Specify your target audience for better context
            </p>
          </div>

          {/* Model Hint */}
          <div className="space-y-2">
            <Label htmlFor="modelHint">Model Hint (Optional)</Label>
            <input
              id="modelHint"
              type="text"
              value={formData.modelHint}
              onChange={(e) => handleInputChange("modelHint", e.target.value)}
              disabled={disabled || isEnhancing}
              placeholder="e.g., DALL-E 3, Midjourney, etc."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-muted-foreground">
              Specify the AI model you plan to use
            </p>
          </div>

          {/* Include Negative Prompt */}
          <div className="flex items-center space-x-2">
            <input
              id="includeNegativePrompt"
              type="checkbox"
              checked={formData.includeNegativePrompt}
              onChange={(e) =>
                handleInputChange("includeNegativePrompt", e.target.checked)
              }
              disabled={disabled || isEnhancing}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label
              htmlFor="includeNegativePrompt"
              className="text-sm"
            >
              Include negative prompt suggestions
            </Label>
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Example Prompts</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Image Examples:
                </p>
                <div className="space-y-1">
                  {examplePrompts.image.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleExamplePrompt(prompt)}
                      disabled={disabled || isEnhancing}
                      className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Video Examples:
                </p>
                <div className="space-y-1">
                  {examplePrompts.video.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleExamplePrompt(prompt)}
                      disabled={disabled || isEnhancing}
                      className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isEnhancing || disabled}
          >
            {isEnhancing ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="size-4 mr-2" />
            )}
            Enhance Prompt
          </Button>
        </form>

        {/* Enhanced Result */}
        {enhancedPrompt && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Enhanced Prompt</Label>
              <div className="flex gap-2">
                {onCopyEnhanced && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCopyEnhanced}
                    className="h-8 px-3"
                  >
                    <Copy className="size-3 mr-1" />
                    Copy
                  </Button>
                )}
                {onReset && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onReset}
                    className="h-8 px-3"
                  >
                    <RefreshCw className="size-3 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border rounded-md">
              <pre className="text-sm whitespace-pre-wrap font-sans">
                {enhancedPrompt}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
