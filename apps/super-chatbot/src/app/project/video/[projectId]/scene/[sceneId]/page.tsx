"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { FileTypeEnum, type ITaskRead, TaskStatusEnum } from "@turbo-super/api";
import { Toolbar, type ToolType } from "./_components/toolbar";

import { ScenePreview } from "./_components/scene-preview";

import { useSceneGetById } from "@/lib/api/superduperai";

import { MediaList } from "./_components/media-list";
import { VoiceoverList } from "./_components/voiceover-list";
import { SoundEffectList } from "./_components/soundeffect-list";
import { AnimatingTool } from "./_components/animating-tool";

// ---------- Custom hooks (replaced by React Query hooks) ----------

function useFilePolling(projectId: string, sceneId: string) {
  const [pendingFileIds, setPendingFileIds] = useState<string[]>([]);
  const [fileGenerationStartTimes, setFileGenerationStartTimes] = useState<
    Record<string, number>
  >({});
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Polling logic here...
  useEffect(() => {
    const TIMEOUT_MS = 8 * 60 * 1000; // 8 минут
    const POLL_INTERVAL_MS = 10000; // 10 секунд

    const checkPending = async () => {
      let remaining: string[] = [];
      const currentTime = Date.now();

      const currentPendingFileIds = pendingFileIds;
      const currentStartTimes = fileGenerationStartTimes;

      for (const id of currentPendingFileIds) {
        const startTime = currentStartTimes[id];

        if (startTime && currentTime - startTime > TIMEOUT_MS) {
          console.warn(
            `File generation timeout for ${id} after ${TIMEOUT_MS}ms`
          );
          continue;
        }

        try {
          const res = await fetch(`/api/file/${id}`);

          if (!res.ok) {
            remaining.push(id);
            continue;
          }
          const json = await res.json();
          if (!json?.url) {
            remaining.push(id);
          }
          if (
            json.tasks.some(
              (task: ITaskRead) => task.status === TaskStatusEnum.ERROR
            )
          ) {
            remaining = remaining.filter((pendingId) => pendingId !== id);

            setFileGenerationStartTimes((prev) => {
              const updated = { ...prev };
              delete updated[id];
              return updated;
            });
          }
        } catch {
          remaining.push(id);
        }
      }

      setPendingFileIds(remaining);

      const finishedFileIds = currentPendingFileIds.filter(
        (id) => !remaining.includes(id)
      );
      if (finishedFileIds.length > 0) {
        setFileGenerationStartTimes((prev) => {
          const updated = { ...prev };
          finishedFileIds.forEach((id) => delete updated[id]);
          return updated;
        });
      }

      if (remaining.length < currentPendingFileIds.length) {
        try {
          const res = await fetch(
            `/api/file?sceneId=${sceneId}&projectId=${projectId}&types=${FileTypeEnum.IMAGE},${FileTypeEnum.VIDEO}`
          );
          if (res.ok) {
            const json = await res.json();
            // This will be handled by the parent component
          }
        } catch {
          // ignore
        }
      }
    };

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (pendingFileIds.length > 0) {
      pollingIntervalRef.current = setInterval(checkPending, POLL_INTERVAL_MS);
      void checkPending();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [pendingFileIds, projectId, sceneId, fileGenerationStartTimes]);

  return {
    pendingFileIds,
    setPendingFileIds,
    fileGenerationStartTimes,
    setFileGenerationStartTimes,
  };
}

// ---------- Main component ----------
export default function ScenePage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.projectId as string;
  const sceneId = params.sceneId as string;

  const [activeTool, setActiveTool] = useState<ToolType | null | string>(
    "mediaList"
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const controllerRef = useRef<any>(null);

  const { data: scene, isLoading: sceneLoading } = useSceneGetById({
    id: sceneId,
  });

  const {
    pendingFileIds,
    setPendingFileIds,
    fileGenerationStartTimes,
    setFileGenerationStartTimes,
  } = useFilePolling(projectId, sceneId);

  // ---------- Handlers ----------

  const handleChangeTool = (tool: ToolType | null) => setActiveTool(tool);
  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleStarted = (newFileId: string) => {
    setPendingFileIds((prev) => [...prev, newFileId]);
    setFileGenerationStartTimes((prev) => ({
      ...prev,
      [newFileId]: Date.now(),
    }));
    setActiveTool("mediaList");
  };

  // ---------- Render ----------
  return (
    <div className="flex-1 flex gap-4 overflow-hidden rounded-xl border bg-card p-4">
      {/* Left: scene preview & content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Scene {scene?.order != null ? scene.order + 1 : ""}
          </h3>
          <div className="text-xs text-muted-foreground">
            Duration: {scene?.duration}
          </div>
        </div>

        <ScenePreview
          activeTool={activeTool}
          onActiveToolChange={setActiveTool}
          isPlaying={isPlaying}
          onPlayingChange={setIsPlaying}
          projectId={projectId}
          onStarted={handleStarted}
          sceneId={sceneId}
        />

        <div className="mt-4 flex-1 overflow-hidden">
          {activeTool === "mediaList" ? (
            <MediaList
              projectId={projectId}
              sceneId={sceneId}
            />
          ) : activeTool === "voiceover" ? (
            <VoiceoverList
              projectId={projectId}
              sceneId={sceneId}
              onCreateAudio={() => {
                router.push(
                  `/project/video/${projectId}/scene/${sceneId}/voiceover`
                );
              }}
            />
          ) : activeTool === "soundEffect" ? (
            <SoundEffectList
              projectId={projectId}
              sceneId={sceneId}
              onCreateAudio={() => {
                router.push(
                  `/project/video/${projectId}/scene/${sceneId}/soundEffect`
                );
              }}
            />
          ) : activeTool === "animating" ? (
            <AnimatingTool
              sceneId={sceneId}
              projectId={projectId}
              imageUrl={scene?.file?.url}
              onStarted={handleStarted}
            />
          ) : (
            <></>
          )}
        </div>
      </div>

      <Toolbar
        scene={scene}
        isPlaying={isPlaying}
        activeTool={activeTool}
        onChangeTool={handleChangeTool}
        togglePlay={togglePlay}
        isLoading={sceneLoading}
      />
    </div>
  );
}
