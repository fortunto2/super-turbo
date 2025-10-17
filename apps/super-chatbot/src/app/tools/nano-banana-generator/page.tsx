// AICODE-NOTE: Main page for Nano Banana Generator
// Integrates all four main functionalities: unified generation/editing, prompt enhancement, and style guide

"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import {
  Wand2,
  Sparkles,
  BookOpen,
  Zap,
  Settings,
  Palette,
  Lightbulb,
} from "lucide-react";

// Hooks
import { useNanoBananaGenerator } from "./hooks/use-nano-banana-generator";
import { useNanoBananaEditor } from "./hooks/use-nano-banana-editor";
import { useNanoBananaPromptEnhancer } from "./hooks/use-nano-banana-prompt-enhancer";
import { useNanoBananaStyleGuide } from "./hooks/use-nano-banana-style-guide";

// Components
import { NanoBananaUnifiedForm } from "./components/nano-banana-unified-form";
import { NanoBananaUnifiedGallery } from "./components/nano-banana-unified-gallery";
import { NanoBananaPromptEnhancerForm } from "./components/nano-banana-prompt-enhancer-form";
import { NanoBananaStyleGuideForm } from "./components/nano-banana-style-guide-form";
import { NanoBananaEnhancedPromptDisplay } from "./components/nano-banana-enhanced-prompt-display";
import { NanoBananaStyleGuideDisplay } from "./components/nano-banana-style-guide-display";

// API
import { getNanoBananaConfig } from "./api/nano-banana-api";

export default function NanoBananaGeneratorPage() {
  // State for active tab
  const [activeTab, setActiveTab] = useState("generate");

  // Configuration state
  const [config, setConfig] = useState({
    styles: [] as string[],
    qualityLevels: [] as string[],
    aspectRatios: [] as string[],
    editTypes: [] as string[],
    precisionLevels: [] as string[],
    blendModes: [] as string[],
    enhancementTechniques: [] as string[],
    techniques: [] as string[],
  });

  // Hooks for different functionalities
  const generator = useNanoBananaGenerator();
  const editor = useNanoBananaEditor();
  const promptEnhancer = useNanoBananaPromptEnhancer();
  const styleGuide = useNanoBananaStyleGuide();

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configData = await getNanoBananaConfig();
        setConfig(configData);
      } catch (error) {
        console.error("Failed to load Nano Banana config:", error);
      }
    };

    loadConfig();
  }, []);

  // Tab configuration
  const tabs = [
    {
      id: "generate",
      label: "Generate & Edit",
      icon: Wand2,
      description: "Create and edit images with AI",
      color: "text-blue-600",
    },
    {
      id: "enhance",
      label: "Enhance Prompts",
      icon: Sparkles,
      description: "Optimize your prompts",
      color: "text-purple-600",
    },
    {
      id: "guide",
      label: "Style Guide",
      icon: BookOpen,
      description: "Explore styles and techniques",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 rounded-full bg-blue-100">
                <Zap className="size-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Nano Banana Generator
              </h1>
              <Badge
                variant="secondary"
                className="ml-2"
              >
                AI-Powered
              </Badge>
            </div>

            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Advanced AI image generation and editing with context awareness,
              surgical precision, and physical logic understanding. Create and
              edit images in one unified interface with cutting-edge AI
              technology.
            </p>

            {/* Feature highlights */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Settings className="size-4" />
                <span>Context Awareness</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="size-4" />
                <span>Surgical Precision</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lightbulb className="size-4" />
                <span>Physical Logic</span>
              </div>
              <div className="flex items-center space-x-2">
                <Palette className="size-4" />
                <span>Advanced Editing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center space-x-2"
                >
                  {/* <Icon className="size-4" /> */}
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Generate & Edit Tab */}
            <TabsContent
              value="generate"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<div>Loading form...</div>}>
                  <NanoBananaUnifiedForm
                    onGenerate={generator.generateImage}
                    onEdit={editor.editImage}
                    isGenerating={generator.isGenerating}
                    isEditing={editor.isEditing}
                    config={config}
                  />
                </Suspense>
                <Suspense fallback={<div>Loading gallery...</div>}>
                  <NanoBananaUnifiedGallery
                    generatedImages={generator.generatedImages}
                    editedImages={editor.editedImages}
                    currentGeneration={generator.currentGeneration}
                    currentEdit={editor.currentEdit}
                    onDeleteGeneratedImage={generator.deleteImage}
                    onDeleteEditedImage={editor.deleteEditedImage}
                    onClearAllGenerated={generator.clearAllImages}
                    onClearAllEdited={editor.clearAllEditedImages}
                    onDownloadGeneratedImage={(url, filename) => {
                      const image = generator.generatedImages.find(img => img.url === url) || generator.currentGeneration;
                      if (image) generator.downloadImage(image);
                    }}
                    onDownloadEditedImage={(url, filename) => {
                      const image = editor.editedImages.find(img => img.url === url) || editor.currentEdit;
                      if (image) editor.downloadEditedImage(image);
                    }}
                    onCopyGeneratedImageUrl={(url) => {
                      const image = generator.generatedImages.find(img => img.url === url) || generator.currentGeneration;
                      if (image) generator.copyImageUrl(image);
                    }}
                    onCopyEditedImageUrl={(url) => {
                      const image = editor.editedImages.find(img => img.url === url) || editor.currentEdit;
                      if (image) editor.copyEditedImageUrl(image);
                    }}
                    isGenerating={generator.isGenerating}
                    isEditing={editor.isEditing}
                  />
                </Suspense>
              </div>
            </TabsContent>

            {/* Enhance Tab */}
            <TabsContent
              value="enhance"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<div>Loading form...</div>}>
                  <NanoBananaPromptEnhancerForm
                    onEnhance={promptEnhancer.enhancePrompt}
                    isEnhancing={promptEnhancer.isEnhancing}
                    config={{
                      techniques: config.techniques,
                      styles: config.styles,
                    }}
                  />
                </Suspense>
                <Suspense fallback={<div>Loading results...</div>}>
                  <NanoBananaEnhancedPromptDisplay
                    enhancedPrompts={promptEnhancer.enhancedPrompts}
                    currentEnhancement={promptEnhancer.currentEnhancement}
                    onClearAll={promptEnhancer.clearAllEnhancements}
                    onCopyPrompt={promptEnhancer.copyEnhancedPrompt}
                  />
                </Suspense>
              </div>
            </TabsContent>

            {/* Style Guide Tab */}
            <TabsContent
              value="guide"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<div>Loading form...</div>}>
                  <NanoBananaStyleGuideForm
                    onSearch={styleGuide.searchStyles}
                    isLoading={styleGuide.isLoading}
                    searchQuery={styleGuide.searchQuery}
                    selectedCategory={styleGuide.selectedCategory}
                    selectedTechnique={styleGuide.selectedTechnique}
                    selectedDifficulty={styleGuide.selectedDifficulty}
                    selectedTags={styleGuide.selectedTags}
                    onSearchQueryChange={styleGuide.setSearchQuery}
                    onCategoryChange={styleGuide.setSelectedCategory}
                    onTechniqueChange={styleGuide.setSelectedTechnique}
                    onDifficultyChange={styleGuide.setSelectedDifficulty}
                    onTagsChange={styleGuide.setSelectedTags}
                    onClearResults={styleGuide.clearResults}
                    onLoadAll={styleGuide.loadAllStyles}
                  />
                </Suspense>
                <Suspense fallback={<div>Loading results...</div>}>
                  <NanoBananaStyleGuideDisplay
                    styleInfos={styleGuide.styleInfos}
                    isLoading={styleGuide.isLoading}
                    currentQuery={styleGuide.currentQuery}
                  />
                </Suspense>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>
              Powered by <strong>Nano Banana AI</strong> • Advanced image
              generation and editing with context awareness and surgical
              precision • For best results, be specific and detailed in your
              prompts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
