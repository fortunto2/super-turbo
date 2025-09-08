"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Eye, Grid3X3, List } from "lucide-react";
import type { ISceneRead } from "@turbo-super/api";
import Image from "next/image";
import { ScenesList } from "./scene-list";
import { cn, Textarea } from "@turbo-super/ui";
import { debounce } from "lodash";

export function Scenes() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const sceneId = params.sceneId as string;

  const [scenes, setScenes] = useState<ISceneRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        console.error("Failed to fetch scenes", e);
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) fetchScenes();
  }, [projectId]);

  const handleUpdateOrder = async (scene: ISceneRead, order: number) => {
    if (!sceneId) return;

    try {
      // Обновляем сцену
      const response = await fetch(
        `/api/scene/update-order?sceneId=${sceneId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: scene.id,
            requestBody: { id: scene.id, order },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Scene update failed: ${errText}`);
      }
    } catch (e) {
      console.error("Select file error", e);
    }
  };

  const handleDragChange = (scene: ISceneRead, order: number) => {
    handleUpdateOrder(scene, order);
  };

  const handleSceneUpdate = async (scene: ISceneRead, text: string) => {
    if (!scene || !scene.file_id) return;
    try {
      const response = await fetch(`/api/scene/update?sceneId=${scene.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId: scene.id,
          requestBody: {
            ...scene,
            file_id: scene.file_id,
            action_description: text,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Scene update failed: ${errText}`);
      }
    } catch (e) {
      console.error("Scene update error", e);
    }
  };

  const debouncedUpdate = debounce(handleSceneUpdate, 1000);

  const handleTextChange = (scene: ISceneRead, text: string) => {
    if (!scene.objects) return;
    if (!scene.file_id) return;

    debouncedUpdate(scene, text);
  };

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
        minWidth: viewMode === "compact" ? "160px" : "350px",
      }}
      className="bg-card border border-border rounded-xl p-2 overflow-hidden"
    >
      <div className="h-full flex flex-col gap-2 overflow-auto pr-2 no-scrollbar">
        {/* Переключатель viewMode */}
        <div className="flex items-center justify-between mb-2">
          {viewMode === "full" && (
            <h3 className="text-sm font-medium text-muted-foreground">
              Scenes
            </h3>
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

        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-2 py-2 rounded-lg border border-border animate-pulse"
            >
              <div className="size-12 rounded-md bg-muted" />
              {viewMode === "full" && (
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-2 w-14 bg-muted rounded" />
                </div>
              )}
            </div>
          ))
        ) : (
          <ScenesList.Root
            scenes={scenes}
            onDragChange={handleDragChange}
          >
            {(scene, index) => (
              <div
                key={scene.id}
                className="flex flex-col flex-grow relative"
              >
                <Scene
                  scene={scene}
                  isActive={sceneId === scene.id}
                  viewMode={viewMode}
                  index={index}
                  projectId={projectId}
                  onTextChange={handleTextChange}
                />
              </div>
            )}
          </ScenesList.Root>
        )}
      </div>
    </aside>
  );
}

const Scene = ({
  scene,
  projectId,
  viewMode,
  isActive,
  index,
  onTextChange,
}: {
  scene: ISceneRead;
  projectId: string;
  viewMode: "compact" | "full";
  isActive: boolean;
  index: number;
  onTextChange: (scene: ISceneRead, text: string) => void;
}) => {
  const router = useRouter();

  const sceneText = scene.action_description;

  const [text, setText] = useState(sceneText ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onTextChange(scene, value);
    setText(value);
  };

  if (viewMode === "full") {
    return (
      <button
        key={scene.id}
        onClick={() =>
          router.push(`/project/video/${projectId}/scene/${scene.id}`)
        }
        className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg  transition-all duration-300  ${
          isActive
            ? "border-primary ring-2 ring-primary/20"
            : "hover:bg-muted/60 hover:border-primary/40"
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
        <div className="text-left grow flex flex-col gap-1">
          <div className="text-sm text-foreground">Scene {index + 1}</div>
          <Textarea
            color="gray"
            className={cn(
              "no-scrollbar h-full grow shadow-none outline-none bg-transparent resize-none w-full border-none p-0",
              {
                // ["line-clamp-none"]: isActive,
                "line-clamp-3": !isActive,
              }
            )}
            value={text}
            onChange={handleChange}
            variant="none"
          />
          {/* <div
            className={`text-xs text-muted-foreground  max-w-[160px] overflow-hidden text-ellipsis ${
              isActive ? "line-clamp-none " : "line-clamp-2"
            }`}
          >
            <Textarea
                            color="gray"
                            className={"h-full grow"}
                            value={text}
                            onChange={handleChange}
                            // disabled={readonly}
                        />
            {scene.action_description}
          </div> */}
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
        isActive
          ? "border-primary  ring-2 ring-primary/20"
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
