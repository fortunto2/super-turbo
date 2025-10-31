'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  RemotionPlayer,
  sceneToMediaFormatting,
  useMediaPrefetch,
} from '@turbo-super/features';
import {
  Play,
  Download,
  Share2,
  Eye,
  CheckCircle,
  ArrowRight,
  FileText,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/shared/back-button';
import {
  TaskTypeEnum,
  useTaskStatus,
  type IFileRead,
  type IProjectVideoRead,
} from '@turbo-super/api';
import { useMemo, useState } from 'react';
import { ShareDialog, ProjectVideoExportDialog } from '@/components';
import {
  useProjectGetById,
  useProjectStoryboard2Video,
  useSceneList,
} from '@/lib/api/superduperai';
import { QueryState } from '@/components/ui/query-state';

// CSS for custom scrollbar
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.8);
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.5);
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(75, 85, 99, 0.8);
  }
`;

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useProjectGetById({ id: projectId });
  const {
    data: scenes,
    isLoading: isScenesLoading,
    isError: isScenesError,
  } = useSceneList({ projectId });

  const { mutate: projectStoryboard2Video, isPending } =
    useProjectStoryboard2Video();

  const { isPending: isRendering } = useTaskStatus(
    TaskTypeEnum.STORYBOARD2VIDEO_FLOW,
    project?.tasks,
  );

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const music = useMemo(() => project?.music ?? null, [project]);

  const scenesMedia = useMemo(
    () => sceneToMediaFormatting((scenes?.items as any) ?? []),
    [scenes?.items],
  );

  const files = useMemo(() => [...scenesMedia], [scenesMedia]);

  const { loaded: isLoaded } = useMediaPrefetch({ files });

  const aspectRatio = useMemo(() => {
    if (!project) return;
    const videoProject = project as IProjectVideoRead;
    const value = videoProject.config.aspect_ratio ?? '16:9';
    const [numerator, denominator] = value.split(':').map(Number);
    if (numerator && denominator) {
      return numerator / denominator;
    }
    return 16 / 9; // default aspect ratio
  }, [project]);

  // Function for exporting video
  const handleExport = () => {
    projectStoryboard2Video({ id: projectId });
  };

  // Function for downloading file
  const handleDownload = (file: IFileRead) => {
    if (!file.url) {
      console.error('❌ No download URL available');
      return;
    }

    // Create temporary download link
    const link = document.createElement('a');
    link.href = file.url;
    link.download = `video-${projectId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = isProjectLoading || isScenesLoading;
  const isError = isProjectError || isScenesError;
  const error = isProjectError
    ? 'Failed to load project'
    : isScenesError
      ? 'Failed to load scenes'
      : null;

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Project ID not found
          </h1>
          <BackButton href="/project/video/projects" />
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyles }} />
      <div className="w-full h-screen bg-background flex flex-col">
        <div className="size-full mx-auto px-4 py-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <BackButton href="/project/video/projects" />

            <div className="flex items-center space-x-4">
              <Link
                href={`/project/video/${projectId}/entities`}
                className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
              >
                <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Users className="size-4" />
                </div>
                <span className="font-medium">Entities</span>
              </Link>

              <Link
                href={`/project/video/${projectId}/script`}
                className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
              >
                <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <FileText className="size-4" />
                </div>
                <span className="font-medium">Edit Script</span>
              </Link>

              <Link
                href={`/project/video/${projectId}/timeline`}
                className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
              >
                <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Settings className="size-4" />
                </div>
                <span className="font-medium">Timeline Editor</span>
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
            {/* Page Title */}
            <div className="text-center mb-4 flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
                Video Preview
              </h1>
              <p className="text-sm text-muted-foreground">
                Preview your finished video before final processing
              </p>
            </div>

            {/* Video Player Section */}
            <div className="w-full max-w-6xl mx-auto mb-4 flex-1 flex flex-col">
              <div className="w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col">
                {/* Flexible height for all states */}
                <div className="w-full flex-1 flex items-center justify-center">
                  <QueryState
                    isLoading={isLoading}
                    isError={isError}
                    error={error as any}
                    isEmpty={!project || !scenes?.items}
                    emptyMessage="No data to display"
                    loadingMessage="Loading project and scenes..."
                    errorMessage="Failed to load data"
                  >
                    {project && !!scenes?.items ? (
                      <div className="size-full p-4 flex flex-col">
                        <div className="bg-black rounded-lg overflow-hidden shadow-lg flex-1 min-h-[280px] flex">
                          <RemotionPlayer
                            scenes={scenes?.items as any}
                            music={music}
                            isLoading={!isLoaded}
                            aspectRatio={aspectRatio ?? 16 / 9}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <Eye className="size-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xl font-medium text-muted-foreground">
                            No data to display
                          </p>
                          <p className="text-muted-foreground">
                            {!project
                              ? 'Project not found'
                              : 'Scenes not found'}
                          </p>
                        </div>
                      </div>
                    )}
                  </QueryState>
                </div>
              </div>
            </div>

            {/* Project Info Cards */}
            {project && !!scenes?.items && (
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 flex-shrink-0">
                {/* Project Details */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="size-8 bg-muted rounded-lg flex items-center justify-center">
                      <CheckCircle className="size-4 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      Project
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Status:
                      </span>
                      <span className="px-2 py-1 bg-muted text-foreground rounded-full text-xs font-medium">
                        Completed
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Scenes:
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {scenes.items.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Aspect Ratio:
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {project.config?.aspect_ratio || '16:9'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scenes Overview */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="size-8 bg-muted rounded-lg flex items-center justify-center">
                      <Play className="size-4 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      Scenes ({scenes.items.length})
                    </h3>
                  </div>
                  <div className="max-h-32 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {scenes?.items?.map((scene, index) => (
                      <Link
                        key={scene.id}
                        href={`/project/video/${projectId}/scene/${scene.id}`}
                        className="block"
                      >
                        <div className="flex space-x-2 p-2 rounded-md hover:bg-muted transition-colors cursor-pointer group">
                          <div className="size-5 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-foreground shrink-0 group-hover:bg-muted/80">
                            {index + 1}
                          </div>
                          <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground line-clamp-2">
                            {scene.visual_description ||
                              'Scene description unavailable'}
                          </span>
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="size-3 text-primary" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="size-8 bg-muted rounded-lg flex items-center justify-center">
                      <Share2 className="size-4 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      Actions
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href={`/project/video/${projectId}/entities`}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-all duration-300 hover:scale-105 shadow-md text-sm"
                    >
                      <Users className="size-3" />
                      <span>Manage Entities</span>
                    </Link>
                    <button
                      onClick={() => setIsExportDialogOpen(true)}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-md text-sm"
                    >
                      <Download className="size-3" />
                      <span>Export Video</span>
                    </button>
                    <button
                      onClick={() => setIsShareDialogOpen(true)}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-all duration-300 hover:scale-105 shadow-md text-sm"
                    >
                      <Share2 className="size-3" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-4 flex-shrink-0">
              <div className="inline-flex items-center space-x-2 bg-card border border-border px-4 py-2 rounded-full shadow-md">
                <div className="size-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  Powered by{' '}
                  <strong className="text-foreground">SuperDuperAI</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Share Dialog */}
          <ShareDialog
            isOpen={isShareDialogOpen}
            onClose={() => setIsShareDialogOpen(false)}
            projectId={projectId}
          />

          {/* Export Dialog */}
          <ProjectVideoExportDialog
            isOpen={isExportDialogOpen}
            onClose={() => setIsExportDialogOpen(false)}
            onExport={handleExport}
            onDownload={handleDownload}
            isRendering={isRendering}
            isPending={isPending}
          />
        </div>
      </div>
    </>
  );
}
