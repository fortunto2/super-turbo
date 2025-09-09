"use client";

import { useParams, useRouter } from "next/navigation";
import { ProjectTimeline } from "@turbo-super/features";
import { ArrowLeft, Eye } from "lucide-react";
import {
  DataTypeEnum,
  type IDataUpdate,
  IFileRead,
  type IProjectRead,
  useProjectData,
} from "@turbo-super/api";
import { useEffect, useState } from "react";
import { ProjectVideoExportDialog } from "@/components/project-video-export-dialog";
import { useProjectGetById, useSceneList } from "@/lib/api/superduperai";
import { QueryState, QueryCard } from "@/components/ui/query-state";

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

  const { data: scenes } = useSceneList({
    projectId,
  });

  const timeline = useProjectData(project, DataTypeEnum.TIMELINE);

  // Function for exporting timeline to video
  const handleExport = async (projectId: string) => {
    try {
      const response = await fetch(
        "/api/story-editor/project/timeline2storyboard",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error exporting timeline to video");
      }

      console.log("🎬 Timeline to video export started successfully:", result);
    } catch (error) {
      console.error("❌ Error exporting timeline to storyboard:", error);
      throw error;
    }
  };

  // Function for downloading file
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

  const handleUpdateTimeline = async (payload: IDataUpdate) => {
    try {
      const response = await fetch(
        "/api/story-editor/project/update-timeline",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error updating timeline");
      }

      console.log("🎬 Timeline updated successfully:", result);
    } catch (error) {
      console.error("❌ Error updating timeline:", error);
      throw error;
    }
  };

  const handleRegenerateTimeline = async () => {
    try {
      const response = await fetch(
        "/api/story-editor/project/regenerate-timeline",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error regenerating timeline");
      }

      console.log("🎬 Timeline regenerated successfully:", result);
    } catch (error) {
      console.error("❌ Error regenerating timeline:", error);
      throw error;
    }
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
    <>
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
          onRegenerateTimeline={handleRegenerateTimeline}
        />
      </QueryState>

      {/* Export Dialog */}
      <ProjectVideoExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExport}
        onDownload={handleDownload}
        title="Export Timeline to Video"
        description="Confirm timeline export to video for further processing"
        exportType="timeline2video"
      />
    </>
  );
}
