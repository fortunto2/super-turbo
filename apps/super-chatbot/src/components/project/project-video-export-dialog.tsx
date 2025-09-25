"use client";

import { useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "@turbo-super/ui";
import { Loader2, Download, CheckCircle } from "lucide-react";
import type { IFileRead } from "@turbo-super/api";
import { useProjectVideoRenderStore } from "@/lib/store";

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
  onExport: () => void;
  onDownload: (file: IFileRead) => void;
  title?: string;
  description?: string;
  isRendering: boolean;
  isPending: boolean;
}

export const ProjectVideoExportDialog: React.FC<
  ProjectVideoExportDialogProps
> = ({
  isOpen,
  onClose,
  onExport,
  onDownload,
  title = "Export Video",
  description = "Confirm video export from storyboard",
  isRendering,
  isPending,
}) => {
  const { progress, result, setState } = useProjectVideoRenderStore();

  useEffect(() => {
    if (!result || !progress) return;
    onDownload(result);
    setState({ progress: null });
    onClose();
  }, [result]);

  useEffect(() => {
    return () => {
      if (progress !== null) {
        setState({ progress: null });
      }
    };
  }, []);

  const handleExport = () => {
    onExport();
    setState({ result: null });
  };
  const handleDownload = () => {
    if (!result) return;
    onDownload(result);
  };

  const exportText = useMemo(() => {
    if (!isRendering) {
      return "Confirm and export →";
    }
    if (progress === 100) {
      return "Downloading...";
    }
    return progress === null ? "Preparing..." : `Rendering... ${progress}%`;
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
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {progress !== null ? (
                <div className="w-full space-y-2">
                  <ProgressBar value={progress} />
                  <p className="text-center text-sm text-muted-foreground">
                    {progress}% completed
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Preparing...
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
                  Download Video
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
