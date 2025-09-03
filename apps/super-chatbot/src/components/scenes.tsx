"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { ISceneRead } from "@turbo-super/api";
import Image from "next/image";

interface SceneData {
  success: boolean;
  scene?: ISceneRead;
  error?: string;
}

export function Scenes() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const sceneId = params.sceneId as string;

  const [scenes, setScenes] = useState<ISceneRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScenes = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/story-editor/scenes?projectId=${projectId}`
        );
        const json = await res.json();
        if (json.success && Array.isArray(json.scenes)) {
          setScenes(json.scenes);
        }
      } catch (e) {
        console.error("Error fetching scenes list", e);
        setError("Failed to load scenes");
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) fetchScenes();
  }, [projectId]);

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
    <div className="flex flex-col gap-2">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg border border-border animate-pulse"
            >
              <div className="size-12 rounded-md bg-muted" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-2 w-14 bg-muted rounded" />
              </div>
            </div>
          ))
        : scenes.map((s) => (
            <Scene
              scene={s}
              projectId={projectId}
              sceneId={sceneId}
              key={s.id}
            />
          ))}
    </div>
  );
}

const Scene = ({
  scene,
  sceneId,
  projectId,
}: {
  scene: ISceneRead;
  sceneId?: string;
  projectId?: string;
}) => {
  const router = useRouter();

  return (
    <button
      key={scene.id}
      onClick={() =>
        router.push(`/project/video/${projectId}/scene/${scene.id}`)
      }
      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg border ${
        scene.id === sceneId
          ? "border-primary bg-primary/10"
          : "border-border hover:bg-muted/60"
      }`}
    >
      <div className="size-12 rounded-md bg-black overflow-hidden flex items-center justify-center">
        {scene.file?.thumbnail_url || scene.file?.url ? (
          <Image
            src={(scene.file?.thumbnail_url || scene.file?.url) as string}
            alt={`S${scene.order + 1}`}
            width={48}
            height={48}
            className="object-cover w-full h-full"
          />
        ) : (
          <Eye className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="text-left">
        <div className="text-sm text-foreground">Scene {scene.order + 1}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[160px]">
          {scene.id.slice(-8)}
        </div>
      </div>
    </button>
  );
};
