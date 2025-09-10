"use client";

import { useParams, useRouter } from "next/navigation";
import { ProjectTimeline, useGenerateTimeline } from "@turbo-super/features";
import { ArrowLeft, Eye } from "lucide-react";
import {
  DataTypeEnum,
  type IDataUpdate,
  type IFileRead,
  TaskTypeEnum,
  useProjectData,
  useTaskStatus,
} from "@turbo-super/api";
import { useState } from "react";
import { ProjectVideoExportDialog } from "@/components/project-video-export-dialog";
import {
  useDataUpdate,
  useProjectGetById,
  useProjectTimeline2Video,
} from "@/lib/api/superduperai";
import { QueryState } from "@/components/ui/query-state";

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Используем React Query для загрузки данных
  const {
    data: project,
    isLoading,
    isError,
    error,
  } = useProjectGetById({
    id: projectId,
  });

  const { mutate: generateTimeline } = useGenerateTimeline();

  const { mutate: timeline2video, isPending } = useProjectTimeline2Video();

  const { mutate: updateTimeline } = useDataUpdate(false);

  const handleTimeline2Video = () => {
    timeline2video({ id: projectId });
  };

  const handleGenerateTimeline = () => {
    generateTimeline({ id: projectId });
  };

  const handleUpdateTimeline = (payload: IDataUpdate) => {
    updateTimeline(payload);
  };

  const timeline = useProjectData(project, DataTypeEnum.TIMELINE);

  const { isPending: isRendering } = useTaskStatus(
    TaskTypeEnum.TIMELINE2VIDEO_FLOW,
    project?.tasks
  );

  const handleDownload = (file: IFileRead) => {
    if (!file.url) {
      console.error("❌ No download URL available");
      return;
    }

    // Create temporary download link
    const link = document.createElement("a");
    link.href = file.url;
    link.download = `video-${projectId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Project ID not found
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
    <div className="w-full min-h-screen">
      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!project}
        emptyMessage="Project not found"
        loadingMessage="Loading project..."
        errorMessage="Failed to load project"
      >
        <ProjectTimeline
          timeline={timeline}
          project={project!}
          onBack={() => router.back()}
          onExport={() => setIsExportDialogOpen(true)}
          onUpdateTimeline={handleUpdateTimeline}
          onRegenerateTimeline={handleGenerateTimeline}
        />
      </QueryState>

      {/* Export Dialog */}
      <ProjectVideoExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleTimeline2Video}
        onDownload={handleDownload}
        title="Export Timeline to Video"
        description="Confirm timeline export to video for further processing"
        isRendering={isRendering}
        isPending={isPending}
      />
    </div>
  );
}
