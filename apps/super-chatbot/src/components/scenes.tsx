"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Grid3X3, List } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"compact" | "full">("full");

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
    <aside
      style={{
        width: viewMode === "compact" ? "6%" : "20%",
        minWidth: viewMode === "compact" ? "87px" : "220px",
      }}
      className="bg-card border border-border rounded-xl p-2 overflow-hidden"
    >
      <div className="h-full grid grid-cols-1 auto-rows-[minmax(56px,auto)] gap-2 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-2">
            {/* Переключатель режимов просмотра */}
            <div className="flex items-center justify-between mb-2">
              {viewMode === "full" ? (
                <h3 className="text-sm font-medium text-muted-foreground">
                  Scenes
                </h3>
              ) : (
                <div></div>
              )}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setViewMode("full")}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    viewMode === "full"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Full"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    viewMode === "compact"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Compact"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Список сцен */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                viewMode === "compact"
                  ? "flex flex-col gap-2"
                  : "flex flex-col gap-2"
              }`}
            >
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <>
                      {viewMode === "full" ? (
                        <div
                          key={i}
                          className={`flex items-center gap-2 px-2 py-2 rounded-lg border border-border animate-pulse`}
                        >
                          <div className="size-12 rounded-md bg-muted" />
                          <div className="flex flex-col gap-1">
                            <div className="h-3 w-20 bg-muted rounded" />
                            <div className="h-2 w-14 bg-muted rounded" />
                          </div>
                        </div>
                      ) : (
                        <div
                          key={i}
                          className={`flex items-center justify-center gap-2 px-2 py-2 rounded-lg border border-border animate-pulse "w-full"`}
                        >
                          <div className="size-12 rounded-md bg-muted" />
                        </div>
                      )}
                    </>
                  ))
                : scenes.map((s) => (
                    <Scene
                      scene={s}
                      projectId={projectId}
                      sceneId={sceneId}
                      viewMode={viewMode}
                      key={s.id}
                    />
                  ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

const Scene = ({
  scene,
  sceneId,
  projectId,
  viewMode,
}: {
  scene: ISceneRead;
  sceneId?: string;
  projectId?: string;
  viewMode: "compact" | "full";
}) => {
  const router = useRouter();

  if (viewMode === "full") {
    return (
      <button
        key={scene.id}
        onClick={() =>
          router.push(`/project/video/${projectId}/scene/${scene.id}`)
        }
        className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg border transition-all duration-300  ${
          scene.id === sceneId
            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
            : "border-border hover:bg-muted/60 hover:border-primary/40"
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
  }

  return (
    <button
      key={scene.id}
      onClick={() =>
        router.push(`/project/video/${projectId}/scene/${scene.id}`)
      }
      className={`w-full flex items-center justify-center px-2 py-2 rounded-lg border transition-all duration-300  ${
        scene.id === sceneId
          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
          : "border-border hover:bg-muted/60 hover:border-primary/40"
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
          <Eye className="size-6 text-muted-foreground" />
        )}
      </div>
    </button>
  );
};
