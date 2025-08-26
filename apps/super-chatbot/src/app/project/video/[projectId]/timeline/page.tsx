"use client";

import { useParams, useRouter } from "next/navigation";
import { ProjectTimeline } from "@turbo-super/features";
import { ArrowLeft, Clock, Play, Eye } from "lucide-react";
import Link from "next/link";
import {
  DataTypeEnum,
  IDataUpdate,
  IProjectRead,
  useProjectData,
} from "@turbo-super/api";
import { useEffect, useState } from "react";
import { ProjectVideoExportDialog } from "@/components/project-video-export-dialog";
import type { IFileRead } from "@/lib/api";

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<IProjectRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const getProject = async () => {
    try {
      const response = await fetch(
        `/api/story-editor/project?projectId=${projectId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching project:", error);
      return { success: false, project: null };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getProject();
        if (data.success) {
          setProject(data.project);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

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
      {isLoading ? (
        <div className="min-h-screen size-full text-center space-y-4 items-center justify-center flex flex-col bg-background">
          <div className="relative">
            <div className="size-16 border-4 border-muted rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 size-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Loading project...
            </p>
            <p className="text-sm text-muted-foreground">
              Preparing Timeline Editor
            </p>
          </div>
        </div>
      ) : !project ? (
        <div className="size-full text-center space-y-4 bg-background">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <Eye className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-medium text-red-600 dark:text-red-400">
              Loading Error
            </p>
            <p className="text-muted-foreground">Failed to load project data</p>
          </div>
        </div>
      ) : (
        <ProjectTimeline
          timeline={timeline}
          project={project}
          onBack={() => router.back()}
          onExport={() => setIsExportDialogOpen(true)}
          onUpdateTimeline={handleUpdateTimeline}
          onRegenerateTimeline={handleRegenerateTimeline}
        />
      )}

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
