"use client";

import { Suspense } from "react";
import { PromptEnhancerForm } from "./prompt-enhancer-form";
import { usePromptEnhancer } from "../../hooks/use-prompt-enhancer";
import { Separator } from "@turbo-super/ui";
import { Sparkles, Zap, Lightbulb } from "lucide-react";
import { PromptEnhancementParams } from "../../types";

interface PromptEnhancerPageProps {
  onEnhance?: (params: PromptEnhancementParams) => Promise<string>;
  onError?: (error: string) => void;
  onSuccess?: (result: string) => void;
  title?: string;
  description?: string;
}

export function PromptEnhancerPage({
  onEnhance,
  onError,
  onSuccess,
  title = "AI Prompt Enhancer",
  description = "Transform your basic prompts into detailed, professional descriptions that generate better AI results. Get more accurate and creative outputs with enhanced prompts.",
}: PromptEnhancerPageProps) {
  const {
    isEnhancing,
    currentEnhanced,
    enhancePrompt,
    copyToClipboard,
    reset,
  } = usePromptEnhancer({
    onEnhance,
    onError,
    onSuccess,
  });

  const handleEnhance = async (params: PromptEnhancementParams) => {
    await enhancePrompt(params);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="p-3 rounded-full bg-yellow-100">
            <Sparkles className="size-8 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>

        {/* Feature highlights */}
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Sparkles className="size-4" />
            <span>Smart Enhancement</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="size-4" />
            <span>Multiple Styles</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lightbulb className="size-4" />
            <span>Better Results</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main content */}
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<div>Loading form...</div>}>
          <PromptEnhancerForm
            onEnhance={handleEnhance}
            isEnhancing={isEnhancing}
            enhancedPrompt={currentEnhanced}
            onCopyEnhanced={copyToClipboard}
            onReset={reset}
          />
        </Suspense>
      </div>

      {/* Tips Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Lightbulb className="size-5" />
            Tips for Better Prompts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Be Specific</h4>
              <p>
                Include details about style, mood, lighting, composition, and
                technical specifications.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Use Descriptive Language</h4>
              <p>
                Describe colors, textures, emotions, and atmosphere to guide the
                AI's interpretation.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Add Context</h4>
              <p>
                Provide background information, purpose, and target audience for
                better results.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Reference Styles</h4>
              <p>
                Mention specific artists, art movements, or visual styles to
                guide the aesthetic direction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-sm text-gray-500 border-t pt-8">
        <p>
          Powered by <strong>SuperDuperAI</strong> • Enhanced prompts lead to
          better AI generation results • Experiment with different enhancement
          types and styles for optimal outcomes
        </p>
      </div>
    </div>
  );
}
