"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, Share2, Eye } from "lucide-react";
import { ISceneRead } from "@turbo-super/api";
import { ShareDialog } from "@/components/share-dialog";
import Image from "next/image";

interface SceneData {
  success: boolean;
  scene?: ISceneRead;
  error?: string;
}

export default function ScenePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const sceneId = params.sceneId as string;

  const [scene, setScene] = useState<ISceneRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  useEffect(() => {
    const fetchScene = async () => {
      try {
        if (sceneId !== scene?.id) {
          setIsLoading(true);
        }
        setError(null);

        const response = await fetch(
          `/api/story-editor/scene?sceneId=${sceneId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("Scene not found");
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data: SceneData = await response.json();

        if (data.success && data.scene) {
          setScene(data.scene);
        } else {
          setError(data.error || "Failed to load scene");
        }
      } catch (error) {
        console.error("Error fetching scene:", error);
        setError("Scene loading error");
      } finally {
        setIsLoading(false);
      }
    };

    if (sceneId) {
      fetchScene();
    }
  }, [sceneId]);

  if (!projectId || !sceneId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Scene ID not found
          </h1>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="size-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
          >
            <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <ArrowLeft className="size-4" />
            </div>
            <span className="font-medium">Go Back</span>
          </button>

          <Link
            href={`/project/video/${projectId}/timeline`}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
          >
            <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <ArrowRight className="size-4" />
            </div>
            <span className="font-medium">Go to Timeline</span>
          </Link>
        </div>

        {/* Scene Content */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Fixed height for all states */}
            <div className="min-h-[600px] flex items-center justify-center">
              {isLoading ? (
                <div className="text-center space-y-4 size-full items-center justify-center flex flex-col">
                  <div className="relative">
                    <div className="size-16 border-4 border-muted rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 size-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">
                      Loading scene...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Preparing your scene
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="size-full text-center space-y-4">
                  <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Eye className="size-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-medium text-red-600 dark:text-red-400">
                      Loading Error
                    </p>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                </div>
              ) : scene ? (
                <div className="size-full p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      Scene {scene.order + 1}
                    </h3>
                  </div>

                  {/* Scene Image */}
                  <div className="bg-black rounded-xl overflow-hidden shadow-2xl h-[400px] mb-6 flex items-center justify-center">
                    {scene.file?.url ? (
                      <Image
                        src={scene.file?.url}
                        alt={`Scene ${scene.id}`}
                        className="max-w-full max-h-full object-contain"
                        width={1000}
                        height={1000}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Eye className="size-16 mx-auto mb-4" />
                        <p>Scene image unavailable</p>
                      </div>
                    )}
                  </div>

                  {/* Scene Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Scene Info */}
                    <div className="bg-muted/50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Scene Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">ID:</span>
                          <span className="font-mono text-sm text-foreground">
                            {scene.id.slice(-12)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Order:</span>
                          <span className="px-3 py-1 bg-muted text-foreground rounded-full text-sm font-medium">
                            {scene.order + 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scene Actions */}
                    <div className="bg-muted/50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Actions
                      </h4>
                      <div className="space-y-3">
                        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg">
                          <Download className="size-4" />
                          <span>Download Image</span>
                        </button>
                        <button
                          onClick={() => setIsShareDialogOpen(true)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                          <Share2 className="size-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scene Description */}
                  {scene.visual_description && (
                    <div className="mt-6 bg-muted/50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Scene Description
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {scene.visual_description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Eye className="size-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-medium text-muted-foreground">
                      Scene not found
                    </p>
                    <p className="text-muted-foreground">
                      Failed to load scene data
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share Dialog */}
        <ShareDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
