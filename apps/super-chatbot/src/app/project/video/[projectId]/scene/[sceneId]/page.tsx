"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye } from "lucide-react";

import {
  FileTypeEnum,
  type ISceneRead,
  type ISceneUpdate,
  type ITaskRead,
  TaskStatusEnum,
} from "@turbo-super/api";
import type { IFileRead } from "@/lib/api/models/IFileRead";
import { Toolbar, type ToolType } from "./components/toolbar";
import { AnimatingTool } from "./components/animating-tool";
import { SoundEffectList } from "./components/soundeffect-list";
import { MediaList } from "./components/media-list";
import { ScenePreview } from "./components/scene-preview";
import { VoiceoverList } from "./components/voiceover-list";
import { SceneHeader } from "./components/scene-header";
import { SceneContent } from "./components/scene-content";
import { ErrorState } from "./components/error-state";

// ---------- Types ----------
interface SceneData {
  success: boolean;
  scene?: ISceneRead;
  error?: string;
}

interface ScenePageState {
  scene: ISceneRead | null;
  files: IFileRead[];
  activeTool: ToolType | null;
  isLoading: boolean;
  error: string | null;
  isPlaying: boolean;
  pendingFileIds: string[];
  fileGenerationStartTimes: Record<string, number>;
}

// ---------- Custom hooks ----------
function useSceneData(projectId: string, sceneId: string) {
  const [scene, setScene] = useState<ISceneRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sceneId) return;

    setIsLoading(true);
    const fetchScene = async () => {
      try {
        if (sceneId !== scene?.id) setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/story-editor/scene?sceneId=${sceneId}`);
        if (!res.ok) {
          if (res.status === 404) setError("Scene not found");
          else throw new Error(`HTTP ${res.status}`);
          return;
        }

        const data: SceneData = await res.json();
        if (data.success && data.scene) setScene(data.scene);
        else setError(data.error || "Failed to load scene");
      } catch (e) {
        console.error("Error fetching scene:", e);
        setError("Scene loading error");
      }
    };

    fetchScene().finally(() => {
      setIsLoading(false);
    });
  }, [sceneId, projectId, scene?.id]);

  return { scene, setScene, isLoading, error };
}

function useFilesData(
  projectId: string,
  sceneId: string,
  activeTool: ToolType | null
) {
  const [files, setFiles] = useState<IFileRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchFiles = async () => {
      const types =
        activeTool === "soundEffect"
          ? FileTypeEnum.SOUND_EFFECT
          : activeTool === "voiceover"
            ? FileTypeEnum.VOICEOVER
            : `${FileTypeEnum.IMAGE},${FileTypeEnum.VIDEO}`;

      try {
        const res = await fetch(
          `/api/file?sceneId=${sceneId}&projectId=${projectId}&types=${types}`
        );
        if (!res.ok) return;

        const json = await res.json();
        setFiles(json.items as IFileRead[]);
      } catch (e) {
        console.error("Error fetching files", e);
      }
    };
    fetchFiles().finally(() => {
      setIsLoading(false);
    });
  }, [activeTool, projectId, sceneId]);

  return { files, setFiles, isLoading };
}

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

  const [activeTool, setActiveTool] = useState<ToolType | null>("mediaList");
  const [isPlaying, setIsPlaying] = useState(false);

  const controllerRef = useRef<any>(null);

  // Custom hooks
  const {
    scene,
    setScene,
    isLoading: sceneLoading,
    error,
  } = useSceneData(projectId, sceneId);
  const {
    files,
    setFiles,
    isLoading: filesLoading,
  } = useFilesData(projectId, sceneId, activeTool);
  const {
    pendingFileIds,
    setPendingFileIds,
    fileGenerationStartTimes,
    setFileGenerationStartTimes,
  } = useFilePolling(projectId, sceneId);

  const isLoading = sceneLoading || filesLoading;

  // ---------- Handlers ----------
  const handleSelectFile = async (file: IFileRead, isPlaceholder?: boolean) => {
    if (!sceneId || !scene) return;

    let idType;
    const id = isPlaceholder ? null : file.id;

    if (file.id.startsWith("placeholder-") || isPlaceholder) {
      if (file.id.includes("voiceover")) {
        idType = { voiceover_id: null };
      } else if (file.id.includes("soundeffect")) {
        idType = { sound_effect_id: null };
      } else {
        idType = { file_id: null };
      }
    } else {
      switch (file.type) {
        case FileTypeEnum.SOUND_EFFECT:
          idType = { sound_effect_id: id };
          break;
        case FileTypeEnum.VOICEOVER:
          idType = { voiceover_id: id };
          break;
        default:
          idType = { file_id: id };
      }
    }

    try {
      const updatedSceneData = { ...scene, ...idType };
      const response = await fetch(`/api/scene/update?sceneId=${sceneId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId,
          requestBody: updatedSceneData as ISceneUpdate,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Scene update failed: ${errText}`);
      }

      const updatedScene: ISceneRead = await response.json();
      if (updatedScene) {
        setScene(updatedScene);
      }
    } catch (e) {
      console.error("Select file error", e);
    }
  };

  const handleDownload = () => {
    if (!scene?.file?.url) return;
    const a = document.createElement("a");
    a.href = scene.file.url;
    a.download = `scene-${scene.id}.asset`;
    a.click();
  };

  const handleChangeTool = (tool: ToolType | null) => setActiveTool(tool);
  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch("/api/file/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fileId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      const types =
        activeTool === "soundEffect"
          ? FileTypeEnum.SOUND_EFFECT
          : activeTool === "voiceover"
            ? FileTypeEnum.VOICEOVER
            : `${FileTypeEnum.IMAGE},${FileTypeEnum.VIDEO}`;

      const res = await fetch(
        `/api/file?sceneId=${sceneId}&projectId=${projectId}&types=${types}`
      );
      if (res.ok) {
        const json = await res.json();
        setFiles(json.items as IFileRead[]);
      }

      if (scene?.file?.id === fileId) {
        setScene((prev) => (prev ? { ...prev, file: null } : null));
      }

      setFileGenerationStartTimes((prev) => {
        const updated = { ...prev };
        delete updated[fileId];
        return updated;
      });

      setPendingFileIds((prev) => prev.filter((id) => id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  };

  const handleStarted = (newFileId: string) => {
    setPendingFileIds((prev) => [...prev, newFileId]);
    setFileGenerationStartTimes((prev) => ({
      ...prev,
      [newFileId]: Date.now(),
    }));
    setActiveTool("mediaList");
  };

  // ---------- Early returns ----------
  if (!projectId || !sceneId || error) {
    return (
      <ErrorState
        projectId={projectId}
        sceneId={sceneId}
        error={error}
      />
    );
  }

  // ---------- Render ----------
  return (
    <div className="flex-1 flex gap-4 overflow-hidden rounded-xl border bg-card p-4">
      {/* Left: scene preview & content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <SceneHeader scene={scene} />

        <ScenePreview
          scene={scene}
          activeTool={activeTool}
          isLoading={isLoading && !scene}
          error={error}
          onActiveToolChange={setActiveTool}
          isPlaying={isPlaying}
          onPlayingChange={setIsPlaying}
          projectId={projectId}
          onStarted={handleStarted}
          controllerRef={controllerRef}
        />

        <div className="mt-4 flex-1 overflow-hidden">
          <SceneContent
            activeTool={activeTool}
            files={files}
            scene={scene}
            isLoading={isLoading}
            onSelect={handleSelectFile}
            onDelete={handleDeleteFile}
            onStarted={handleStarted}
            projectId={projectId}
            sceneId={sceneId}
          />
        </div>
      </div>

      <Toolbar
        scene={scene}
        isPlaying={isPlaying}
        onDownload={handleDownload}
        activeTool={activeTool}
        onChangeTool={handleChangeTool}
        togglePlay={togglePlay}
        isLoading={isLoading && !scene}
        onAddText={() => {
          if (!controllerRef?.current) return;
          controllerRef.current.addText("Text", {
            fill: "white",
          });
        }}
      />
    </div>
  );
}
