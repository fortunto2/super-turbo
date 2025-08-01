"use client";

import { Suspense } from "react";
import { VideoGeneratorForm } from "./video-generator-form";
import { GenerationProgress } from "../image-generator/generation-progress";
import { VideoGallery } from "./video-gallery";
import { useVideoGenerator } from "../../hooks/use-video-generator";
import { Separator } from "@turbo-super/ui";
import { VideoIcon, Sparkles, Zap } from "lucide-react";
import { VideoGenerationParams } from "../../types";

interface VideoGeneratorPageProps {
  onGenerate?: (params: VideoGenerationParams) => Promise<any>;
  onError?: (error: string) => void;
  onSuccess?: (result: any) => void;
  title?: string;
  description?: string;
}

export function VideoGeneratorPage({
  onGenerate,
  onError,
  onSuccess,
  title = "AI Video Generator",
  description = "Create stunning videos using advanced AI models like Veo3, Pika Labs, and more. Transform your ideas into dynamic visual content with just a text description.",
}: VideoGeneratorPageProps) {
  const {
    generationStatus,
    currentGeneration,
    generatedVideos,
    isGenerating,
    generateVideo,
    clearCurrentGeneration,
    deleteVideo,
    clearAllVideos,
    forceCheckResults,
    downloadVideo,
    copyVideoUrl,
  } = useVideoGenerator({
    onGenerate,
    onError,
    onSuccess,
  });

  const handleGenerate = async (params: VideoGenerationParams) => {
    await generateVideo(params);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="p-3 rounded-full bg-purple-100">
            <VideoIcon className="size-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>

        {/* Feature highlights */}
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Sparkles className="size-4" />
            <span>Advanced Models</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="size-4" />
            <span>Real-time Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <VideoIcon className="size-4" />
            <span>Multiple Formats</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Form and Progress */}
        <div className="space-y-4">
          <Suspense fallback={<div>Loading form...</div>}>
            <VideoGeneratorForm
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </Suspense>
          <GenerationProgress
            generationStatus={generationStatus}
            onForceCheck={forceCheckResults}
          />
        </div>

        {/* Right column - Gallery */}
        <div>
          <Suspense fallback={<div>Loading gallery...</div>}>
            <VideoGallery
              videos={generatedVideos}
              currentGeneration={currentGeneration}
              onDeleteVideo={deleteVideo}
              onClearAll={clearAllVideos}
              onDownloadVideo={downloadVideo}
              onCopyVideoUrl={copyVideoUrl}
            />
          </Suspense>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-sm text-gray-500 border-t pt-8">
        <p>
          Powered by <strong>SuperDuperAI</strong> • Videos are generated using
          state-of-the-art AI models • For best results, be specific and
          detailed in your prompts
        </p>
      </div>
    </div>
  );
}
