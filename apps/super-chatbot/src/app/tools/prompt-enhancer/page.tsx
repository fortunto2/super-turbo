"use client";

import { useState } from "react";
import {
  Veo3PromptGenerator,
  PromptDataType,
  MoodboardImageType,
} from "@turbo-super/features";
import { enhancePromptVeo3 } from "@/lib/ai/api/enhance-prompt-veo3";

import { Button } from "@turbo-super/ui";
import { Wand2, Video, Sparkles } from "lucide-react";
import { PromptEnhancer } from "./components/prompt-enhancer";

// Define types from exported values
type PromptData = typeof PromptDataType;
type MoodboardImage = typeof MoodboardImageType;

type EnhancementMode = "general" | "veo3";

export default function PromptEnhancerPage() {
  const [mode, setMode] = useState<EnhancementMode>("general");

  const enhancePromptFunction = async (params: {
    prompt: string;
    customLimit: number;
    model: string;
    focusType?: string;
    includeAudio: boolean;
    promptData: PromptData;
    moodboard?: {
      enabled: boolean;
      images: MoodboardImage[];
    };
  }) => {
    if (mode === "veo3") {
      const response = await enhancePromptVeo3({
        body: JSON.stringify(params),
      });
      return response;
    } else {
      // For general mode, we'll use the API endpoint
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalPrompt: params.prompt,
          mediaType: "video", // Default for general mode
          enhancementLevel: "detailed",
          includeNegativePrompt: true,
        }),
      });
      return response.json();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="p-3 rounded-full bg-purple-100">
            <Wand2 className="size-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Prompt Enhancer
          </h1>
        </div>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your simple prompts into detailed, professional descriptions
          for better AI generation results. Choose between general enhancement
          or specialized VEO3 video prompts.
        </p>

        {/* Mode Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={mode === "general" ? "default" : "outline"}
            onClick={() => setMode("general")}
            className="flex items-center space-x-2"
          >
            <Sparkles className="size-4" />
            <span>General Mode</span>
          </Button>
          <Button
            variant={mode === "veo3" ? "default" : "outline"}
            onClick={() => setMode("veo3")}
            className="flex items-center space-x-2"
          >
            <Video className="size-4" />
            <span>VEO3 Mode</span>
          </Button>
        </div>

        {/* Mode Description */}
        <div className="max-w-2xl mx-auto">
          {mode === "general" ? (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                General Enhancement Mode
              </h3>
              <p className="text-sm text-blue-700">
                Perfect for images, videos, and text generation. Automatically
                translates text, adds quality terms, and optimizes for different
                AI models.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">
                VEO3 Video Enhancement Mode
              </h3>
              <p className="text-sm text-purple-700">
                Specialized for VEO3 video generation with professional
                cinematography, character focus, action sequences, and audio
                cues.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {mode === "veo3" ? (
        <Veo3PromptGenerator
          enhancePromptFunction={enhancePromptFunction}
          MoodboardUploader={undefined}
          showInfoBanner={true}
          showPaymentButton={false}
        />
      ) : (
        <PromptEnhancer />
      )}
    </div>
  );
}
