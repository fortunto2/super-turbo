'use client';

import { useState, useEffect, Suspense } from 'react';
import { Separator } from '@turbo-super/ui';
import { Badge } from '@turbo-super/ui';
import { ImageIcon, Sparkles, Zap, Settings } from 'lucide-react';
import { ImageGenerationForm } from './components/image-generation-form';
import { ImageGenerationGallery } from './components/image-generation-gallery';
import { GenerationProgress } from './components/generation-progress';
import { useImageGeneration } from './hooks/use-image-generation';
import { getImageGenerationConfig } from './api/image-generation-api';

export default function ImageGenerationPage() {
  const {
    generationStatus,
    currentGeneration,
    generatedImages,
    isGenerating,
    isConnected,
    connectionStatus,
    generateImage,
    clearCurrentGeneration,
    deleteImage,
    clearAllImages,
    forceCheckResults,
    downloadImage,
    copyImageUrl,
  } = useImageGeneration();

  const [config, setConfig] = useState({
    styles: [] as Array<{ id: string; label: string; description: string }>,
    qualityLevels: [] as Array<{ id: string; label: string; description: string }>,
    aspectRatios: [] as Array<{ id: string; label: string; description: string }>,
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configData = await getImageGenerationConfig();
        setConfig(configData);
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    loadConfig();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 rounded-full bg-blue-950/50 border border-blue-900">
            <ImageIcon className="size-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Image Generation
          </h1>
          <Badge variant="secondary" className="ml-2">
            Nano Banana AI
          </Badge>

          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-2 ml-4">
            <div
              className={`size-3 rounded-full ${
                isGenerating && connectionStatus === 'connected'
                  ? 'bg-green-500'
                  : isGenerating && connectionStatus === 'connecting'
                    ? 'bg-yellow-500 animate-pulse'
                    : isGenerating
                      ? 'bg-red-500'
                      : 'bg-gray-600'
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {isGenerating && connectionStatus === 'connected'
                ? 'Connected'
                : isGenerating && connectionStatus === 'connecting'
                  ? 'Connecting...'
                  : isGenerating
                    ? 'Disconnected'
                    : 'Idle'}
            </span>
          </div>
        </div>

        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Create stunning images using Nano Banana AI technology. Simply describe
          what you want to see and let AI bring your ideas to life.
        </p>

        {/* Feature highlights */}
        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Sparkles className="size-4" />
            <span>High Quality</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="size-4" />
            <span>Fast Generation</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="size-4" />
            <span>Customizable</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Form and Progress */}
        <div className="space-y-4">
          <Suspense fallback={<div>Loading form...</div>}>
            <ImageGenerationForm
              onGenerate={generateImage}
              isGenerating={isGenerating}
              config={config}
            />
          </Suspense>
          <GenerationProgress
            generationStatus={generationStatus}
            prompt={generationStatus.message ?? ''}
          />
        </div>

        {/* Right column - Gallery */}
        <div>
          <Suspense fallback={<div>Loading gallery...</div>}>
            <ImageGenerationGallery
              generatedImages={generatedImages}
              currentGeneration={currentGeneration}
              onDeleteImage={deleteImage}
              onClearAll={clearAllImages}
              onDownloadImage={(url, filename) => {
                const image =
                  generatedImages.find((img) => img.url === url) || currentGeneration;
                if (image) downloadImage(image);
              }}
              onCopyImageUrl={(url) => {
                const image =
                  generatedImages.find((img) => img.url === url) || currentGeneration;
                if (image) copyImageUrl(image);
              }}
              isGenerating={isGenerating}
            />
          </Suspense>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-sm text-muted-foreground border-t pt-8">
        <p>
          Powered by <strong>Nano Banana AI</strong> • Images are generated using
          advanced AI models • For best results, be specific and detailed in your
          prompts
        </p>
      </div>
    </div>
  );
}
