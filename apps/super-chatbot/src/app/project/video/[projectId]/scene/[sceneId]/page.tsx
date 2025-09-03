"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye } from "lucide-react";

import {
  FileTypeEnum,
  ISceneRead,
  ITaskRead,
  TaskStatusEnum,
} from "@turbo-super/api";
import type { IFileRead } from "@/lib/api/models/IFileRead";
import { Toolbar, ToolType } from "./components/toolbar";
import { AnimatingTool } from "./components/animating-tool";
import { Placeholder } from "./components/helper";
import { SoundEffectList } from "./components/soundeffect-list";
import { MediaList } from "./components/media-list";
import { ScenePreview } from "./components/scene-preview";
import { VoiceoverList } from "./components/voiceover-list";

// ---------- Types ----------
interface SceneData {
  success: boolean;
  scene?: ISceneRead;
  error?: string;
}

// ---------- Main component ----------
export default function ScenePage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.projectId as string;
  const sceneId = params.sceneId as string;

  const [scene, setScene] = useState<ISceneRead | null>(null);
  const [files, setFiles] = useState<IFileRead[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType | null>("mediaList");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pendingFileIds, setPendingFileIds] = useState<string[]>([]);

  const [fileGenerationStartTimes, setFileGenerationStartTimes] = useState<
    Record<string, number>
  >({});

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ---------- Data fetching ----------
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

    Promise.all([fetchScene(), fetchFiles()]).finally(() => {
      setIsLoading(false);
    });
  }, [sceneId, projectId, scene?.id, activeTool]);

  // Poll pending files until ready, then refresh files list
  useEffect(() => {
    const TIMEOUT_MS = 8 * 60 * 1000; // 8 минут
    const POLL_INTERVAL_MS = 10000; // 10 секунд

    const checkPending = async () => {
      let remaining: string[] = [];
      const currentTime = Date.now();

      // Получаем актуальные значения из состояния
      const currentPendingFileIds = pendingFileIds;
      const currentStartTimes = fileGenerationStartTimes;

      for (const id of currentPendingFileIds) {
        const startTime = currentStartTimes[id];

        // Проверяем таймаут
        if (startTime && currentTime - startTime > TIMEOUT_MS) {
          console.warn(
            `File generation timeout for ${id} after ${TIMEOUT_MS}ms`
          );
          // Не добавляем в remaining - считаем что файл "провалился"
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

      // Очищаем время генерации для завершенных файлов
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

      // If any finished, refresh files
      if (remaining.length < currentPendingFileIds.length) {
        try {
          const res = await fetch(
            `/api/file?sceneId=${sceneId}&projectId=${projectId}&types=${FileTypeEnum.IMAGE},${FileTypeEnum.VIDEO}`
          );
          if (res.ok) {
            const json = await res.json();
            setFiles(json.items as IFileRead[]);
          }
        } catch {
          // ignore
        }
      }
    };

    // Очищаем предыдущий интервал
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Запускаем пулинг только если есть pending файлы
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
  }, [pendingFileIds.length, projectId, sceneId, fileGenerationStartTimes]); // Зависим от длины массива и времен генерации

  // ---------- Handlers ----------
  const handleSelectFile = async (fileId: string) => {
    if (!sceneId) return;

    try {
      // Обновляем сцену
      const response = await fetch(`/api/scene/update?sceneId=${sceneId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId,
          requestBody: { ...scene, file_id: fileId },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Scene update failed: ${errText}`);
      }

      const updatedScene: ISceneRead = await response.json();
      if (!!updatedScene) setScene(updatedScene);
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
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

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

      // Обновляем список файлов
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

      // Если удаленный файл был активным, очищаем сцену
      if (scene?.file?.id === fileId) {
        setScene((prev) => (prev ? { ...prev, file: null } : null));
      }

      // Очищаем время генерации для удаленного файла
      setFileGenerationStartTimes((prev) => {
        const updated = { ...prev };
        delete updated[fileId];
        return updated;
      });

      // Удаляем из pending файлов если он там был
      setPendingFileIds((prev) => prev.filter((id) => id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error; // Пробрасываем ошибку для обработки в MediaList
    }
  };

  // ---------- UI states ----------
  if (!projectId || !sceneId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 text-center bg-card border rounded-2xl shadow-2xl">
          <div className="size-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Eye className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-foreground">
            Scene ID not found
          </h1>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary/90"
          >
            <ArrowLeft className="mr-2 size-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="flex-1 flex gap-4 overflow-hidden rounded-xl border bg-card p-4">
      {/* Left: scene preview & content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Scene {scene?.order != null ? scene.order + 1 : ""}
          </h3>
          <div className="text-xs text-muted-foreground">
            Duration: {scene?.duration}
          </div>
        </div>

        {/* Scene preview */}
        <ScenePreview
          scene={scene}
          activeTool={activeTool}
          isLoading={isLoading && !scene}
          error={error}
          onActiveToolChange={setActiveTool}
          isPlaying={isPlaying}
          onPlayingChange={setIsPlaying}
          projectId={projectId}
          onStarted={(newFileId) => {
            setPendingFileIds((prev) => {
              return [...prev, newFileId];
            });
            setFileGenerationStartTimes((prev) => ({
              ...prev,
              [newFileId]: Date.now(),
            }));
            setActiveTool("mediaList");
          }}
        />

        {/* Tools content */}
        <div className="mt-4 flex-1 overflow-hidden">
          {activeTool === "mediaList" && (
            <MediaList
              files={files}
              scene={scene}
              onSelect={handleSelectFile}
              onDelete={handleDeleteFile}
              isLoading={isLoading}
            />
          )}
          {activeTool === "voiceover" && (
            <VoiceoverList
              files={files}
              scene={scene}
              onSelect={handleSelectFile}
              isLoading={isLoading}
            />
          )}
          {activeTool === "soundEffect" && (
            <SoundEffectList
              files={files}
              scene={scene}
              onSelect={handleSelectFile}
              isLoading={isLoading}
            />
          )}
          {activeTool === "addText" && (
            <Placeholder text="Добавление текстовых объектов" />
          )}
          {activeTool === "animating" && (
            <AnimatingTool
              sceneId={sceneId}
              projectId={projectId}
              imageUrl={scene?.file?.url}
              onStarted={(newFileId) => {
                setPendingFileIds((prev) => {
                  return [...prev, newFileId];
                });
                setFileGenerationStartTimes((prev) => ({
                  ...prev,
                  [newFileId]: Date.now(),
                }));
                setActiveTool("mediaList");
              }}
            />
          )}
        </div>
      </div>

      {/* Right: toolbar */}
      <Toolbar
        scene={scene}
        isPlaying={isPlaying}
        onDownload={handleDownload}
        activeTool={activeTool}
        onChangeTool={handleChangeTool}
        togglePlay={togglePlay}
        isLoading={isLoading && !scene}
      />
    </div>
  );
}

// export function ScenePreview({
//   scene,
//   isLoading,
//   error,
//   activeTool,
// }: ScenePreviewProps) {
//   const imgRef = useRef<HTMLImageElement>(null);
//   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
//   const containerRef = useRef<HTMLDivElement>(null);

//   const aspectRatio: number = useMemo(() => {
//     const value = "16:9";
//     const [width, height] = value.split(":").map(Number);
//     return width / height;
//   }, []);

//   // Определяем размеры картинки для канваса
//   const updateCanvasSize = () => {
//     const img = imgRef.current;
//     const container = containerRef.current;
//     if (!img || !container) return;

//     const naturalWidth = img.naturalWidth || 0;
//     const naturalHeight = img.naturalHeight || 0;
//     const containerWidth = container.clientWidth || 0;
//     const containerHeight = container.clientHeight || 0;

//     if (!naturalWidth || !naturalHeight || !containerWidth || !containerHeight)
//       return;

//     const scale = Math.min(
//       containerWidth / naturalWidth,
//       containerHeight / naturalHeight
//     );
//     const width = Math.floor(naturalWidth * scale);
//     const height = Math.floor(naturalHeight * scale);
//     setCanvasSize({ width, height });
//   };

//   useEffect(() => {
//     window.addEventListener("resize", updateCanvasSize);
//     return () => window.removeEventListener("resize", updateCanvasSize);
//   }, []);

//   const containerHeight =
//     activeTool === null ||
//     activeTool === "animating" ||
//     activeTool === "inpainting"
//       ? "100%"
//       : "60%";

//   return (
//     <div
//       style={{ height: containerHeight }}
//       className="flex items-center justify-center overflow-hidden rounded-lg bg-black relative"
//       ref={containerRef}
//     >
//       {isLoading ? (
//         <Loader />
//       ) : error ? (
//         <ErrorMessage message={error} />
//       ) : scene?.file?.url ? (
//         <div className="flex justify-center items-center w-full h-full">
//           <div
//             className="relative"
//             style={{
//               width: `${canvasSize.width}px`,
//               height: `${canvasSize.height}px`,
//             }}
//           >
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={scene.file.url}
//               alt={`Scene ${scene.id}`}
//               className="absolute inset-0 w-full h-full object-contain"
//               ref={imgRef}
//               onLoad={updateCanvasSize}
//             />
//             {canvasSize.width > 0 && canvasSize.height > 0 && (
//               <FabricCanvas
//                 className="absolute top-0 left-0"
//                 initialObjects={scene.objects}
//                 onReady={() => {}}
//                 readonly={false}
//                 width={canvasSize.width}
//                 height={canvasSize.height}
//               />
//             )}
//           </div>
//         </div>
//       ) : (
//         <EmptyPreview />
//       )}
//     </div>
//   );
// }
