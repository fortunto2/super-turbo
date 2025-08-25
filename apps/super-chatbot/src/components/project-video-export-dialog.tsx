"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@turbo-super/ui";
import { Loader2, Download, CheckCircle } from "lucide-react";
import { useArtifactSSE } from "@/hooks/use-artifact-sse";
import { WSMessageTypeEnum } from "@/lib/api";
import type { IFileRead } from "@/lib/api";

// Simple Progress component since it's not available in UI library
function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={`w-full bg-muted rounded-full h-2 ${className}`}>
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

interface ProjectVideoExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (projectId: string) => Promise<void>;
  onDownload: (file: IFileRead) => void;
  title?: string;
  description?: string;
  exportType?: "storyboard2video" | "timeline2video";
}

export const ProjectVideoExportDialog: React.FC<
  ProjectVideoExportDialogProps
> = ({
  isOpen,
  onClose,
  onExport,
  onDownload,
  title = "Экспорт видео",
  description = "Подтвердите экспорт видео из storyboard",
  exportType = "storyboard2video",
}) => {
  const params = useParams();
  const projectId = params.projectId as string;

  const [isRendering, setIsRendering] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<IFileRead | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Функция для получения ключа localStorage в зависимости от типа экспорта
  const getStorageKey = useCallback(
    (projectId: string) => {
      return `${exportType}-result-${projectId}`;
    },
    [exportType]
  );

  // Загружаем сохраненный результат из localStorage при открытии диалога
  useEffect(() => {
    if (isOpen && projectId) {
      const storageKey = getStorageKey(projectId);
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsedResult = JSON.parse(saved);
          setResult(parsedResult);
        } catch (error) {
          console.error("Error parsing saved result:", error);
        }
      }
    }
  }, [isOpen, projectId, getStorageKey]);

  // SSE event handler for project events
  const projectEventHandler = useCallback((eventData: any) => {
    console.log("🎬 Project SSE event received:", eventData);

    if (eventData.type === WSMessageTypeEnum.RENDER_PROGRESS) {
      const { progress } = eventData.object as { progress: number };
      setProgress(progress);
      setIsRendering(true);
      setError(null);
    } else if (eventData.type === WSMessageTypeEnum.RENDER_RESULT) {
      const result = eventData.object as IFileRead;
      setResult(result);
      setProgress(100);
      setIsRendering(false);
      setError(null);

      // Сохраняем результат в localStorage
      if (projectId && result.url) {
        const storageKey = getStorageKey(projectId);
        localStorage.setItem(storageKey, JSON.stringify(result));
      }
    } else if (
      eventData.type === "error" ||
      eventData.type === "render_error"
    ) {
      setError(
        eventData.error ||
          eventData.message ||
          "Произошла ошибка при рендеринге"
      );
      setIsRendering(false);
      setProgress(null);
    }
  }, []);

  // SSE connection for project events
  useArtifactSSE({
    channel: `project.${projectId}`,
    eventHandlers: [projectEventHandler],
    enabled: isOpen && !!projectId,
  });

  // Auto-download when result is ready
  useEffect(() => {
    if (result && progress === 100) {
      onDownload(result);
      setProgress(null);
      // Не закрываем диалог и не сбрасываем result, чтобы можно было скачать снова
    }
  }, [result, progress, onDownload]);

  const handleExport = async () => {
    if (!projectId) return;

    try {
      setIsPending(true);
      setError(null);
      setProgress(null);
      setResult(null);
      setIsRendering(false);

      // Очищаем старый результат при новом рендеринге
      clearSavedResult();

      await onExport(projectId);

      // Start monitoring for SSE events
      setIsRendering(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Произошла ошибка при экспорте"
      );
      setIsRendering(false);
    } finally {
      setIsPending(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    onDownload(result);
  };

  // Очищаем сохраненный результат из localStorage
  const clearSavedResult = useCallback(() => {
    if (projectId) {
      const storageKey = getStorageKey(projectId);
      localStorage.removeItem(storageKey);
      setResult(null);
    }
  }, [projectId, getStorageKey]);

  const exportText = useMemo(() => {
    if (!isRendering) {
      return "Подтвердить и экспортировать →";
    }
    if (progress === 100) {
      return "Скачивание...";
    }
    return progress === null ? "Подготовка..." : `Рендеринг... ${progress}%`;
  }, [isRendering, progress]);

  const isDisabled = isPending || isRendering;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 ">
          {!isRendering ? (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground">
                <p>{description}</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {progress !== null ? (
                <div className="w-full space-y-2">
                  <ProgressBar value={progress} />
                  <p className="text-center text-sm text-muted-foreground">
                    {progress}% завершено
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Подготовка...
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between gap-3">
            <div className="flex-1">
              {result && (
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="w-full"
                >
                  <Download />
                  Скачать видео
                </Button>
              )}
            </div>
            <Button
              onClick={handleExport}
              disabled={isDisabled}
              className="flex-1"
            >
              {isPending ? (
                <Loader2 className=" animate-spin" />
              ) : progress === 100 ? (
                <CheckCircle />
              ) : null}
              {exportText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
