"use client";

import { useParams, useRouter } from "next/navigation";
import {
  RemotionPlayer,
  sceneToMediaFormatting,
  useMediaPrefetch,
} from "@turbo-super/features";
import {
  ArrowLeft,
  Play,
  Download,
  Share2,
  Eye,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { IProjectRead, IProjectVideoRead, ISceneRead } from "@turbo-super/api";
import { useEffect, useMemo, useState } from "react";
import { ShareDialog } from "@/components/share-dialog";
import { ProjectVideoExportDialog } from "@/components/project-video-export-dialog";
import type { IFileRead } from "@/lib/api";

// CSS для кастомного скроллбара
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

  const [project, setProject] = useState<IProjectRead | null>(null);
  const [scenes, setScenes] = useState<ISceneRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const music = useMemo(() => project?.music ?? null, [project?.music]);

  const scenesMedia = useMemo(() => sceneToMediaFormatting(scenes), [scenes]);

  const files = useMemo(() => [...scenesMedia], [scenesMedia]);

  const { loaded: isLoaded } = useMediaPrefetch({ files });

  const aspectRatio = useMemo(() => {
    if (!project) return;
    const videoProject = project as IProjectVideoRead;
    const value = videoProject.config.aspect_ratio ?? "16:9";
    const [numerator, denominator] = value.split(":").map(Number);
    return numerator / denominator;
  }, [project?.config?.aspect_ratio]);

  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        setError(null);

        const [projectData, scenesData] = await Promise.all([
          getProject(),
          getScenes(),
        ]);

        if (projectData.success) {
          setProject(projectData.project);
        } else {
          console.error("Failed to fetch project:", projectData.error);
          setError("Не удалось загрузить проект");
        }

        if (scenesData.success) {
          setScenes(scenesData.scenes);
        } else {
          console.error("Failed to fetch scenes:", scenesData.error);
          setError("Не удалось загрузить сцены");
          setScenes([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        if (retryCount < 3) {
          console.log(`Retrying... Attempt ${retryCount + 1}`);
          setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }

        setError("Ошибка загрузки данных");
      } finally {
        setIsLoading(false);
      }
    };

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

    const getScenes = async () => {
      try {
        const response = await fetch(
          `/api/story-editor/scenes?projectId=${projectId}`
        );
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching scenes:", error);
        return { success: false, scenes: [] };
      }
    };

    fetchData();
  }, [projectId]);

  // Функция для экспорта видео
  const handleExport = async (projectId: string) => {
    try {
      const response = await fetch(
        "/api/story-editor/project/storyboard2video",
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
        throw new Error(result.error || "Ошибка при экспорте видео");
      }

      console.log("🎬 Video export started successfully:", result);
    } catch (error) {
      console.error("❌ Error exporting video:", error);
      throw error;
    }
  };

  // Функция для скачивания файла
  const handleDownload = (file: IFileRead) => {
    if (!file.url) {
      console.error("❌ No download URL available");
      return;
    }

    // Создаем временную ссылку для скачивания
    const link = document.createElement("a");
    link.href = file.url;
    link.download = `video-${projectId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            ID проекта не найден
          </h1>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="size-4 mr-2" />
            Вернуться
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyles }} />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
            >
              <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="size-4" />
              </div>
              <span className="font-medium">Вернуться</span>
            </button>

            <Link
              href={`/project/video/${projectId}/timeline`}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
            >
              <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ArrowRight className="size-4" />
              </div>
              <span className="font-medium">Перейти к Timeline Edtitor</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
                Предварительный просмотр
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Просмотрите готовое видео перед финальной обработкой
              </p>
            </div>

            {/* Video Player Section */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Фиксированная высота для всех состояний */}
                <div className="h-[500px] flex items-center justify-center">
                  {isLoading ? (
                    <div className="w-screen text-center space-y-4 size-full items-center justify-center flex flex-col">
                      <div className="relative">
                        <div className="size-16 border-4 border-muted rounded-full animate-spin"></div>
                        <div className="absolute top-0 left-0 size-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-foreground">
                          Загрузка проекта и сцен...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Подготавливаем ваш видеоплеер
                        </p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="size-full text-center space-y-4 flex flex-col items-center justify-center">
                      <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                        <Eye className="size-8 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-medium text-red-600 dark:text-red-400">
                          Ошибка загрузки
                        </p>
                        <p className="text-muted-foreground">{error}</p>
                      </div>
                    </div>
                  ) : project && scenes.length > 0 ? (
                    <div className="size-full p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">
                          Видеоплеер
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {scenes.length} сцен
                          </span>
                          <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="bg-black rounded-xl overflow-hidden shadow-2xl h-[400px]">
                        <RemotionPlayer
                          scenes={scenes}
                          music={music}
                          isLoading={!isLoaded}
                          aspectRatio={aspectRatio}
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
                          Нет данных для отображения
                        </p>
                        <p className="text-muted-foreground">
                          {!project ? "Проект не найден" : "Сцены не найдены"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Project Info Cards */}
            {project && scenes.length > 0 && (
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Project Details */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="size-10 bg-muted rounded-lg flex items-center justify-center">
                      <CheckCircle className="size-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Проект
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Статус:</span>
                      <span className="px-3 py-1 bg-muted text-foreground rounded-full text-sm font-medium">
                        Завершен
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Сцены:</span>
                      <span className="font-semibold text-foreground">
                        {scenes.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Соотношение:
                      </span>
                      <span className="font-semibold text-foreground">
                        {project.config?.aspect_ratio || "16:9"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scenes Overview */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="size-10 bg-muted rounded-lg flex items-center justify-center">
                      <Play className="size-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Сцены ({scenes.length})
                    </h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {scenes.map((scene, index) => (
                      <Link
                        key={scene.id}
                        href={`/project/video/${projectId}/scene/${scene.id}`}
                        className="block"
                      >
                        <div className="flex space-x-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                          <div className="size-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-foreground shrink-0 group-hover:bg-muted/80">
                            {index + 1}
                          </div>
                          <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground">
                            {scene.visual_description ||
                              "Описание сцены недоступно"}
                          </span>
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="size-4 text-primary" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="size-10 bg-muted rounded-lg flex items-center justify-center">
                      <Share2 className="size-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Действия
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsExportDialogOpen(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Download className="size-4" />
                      <span>Экспортировать видео</span>
                    </button>
                    <button
                      onClick={() => setIsShareDialogOpen(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Share2 className="size-4" />
                      <span>Поделиться</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-card border border-border px-6 py-3 rounded-full shadow-lg">
                <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  Powered by{" "}
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
            exportType="storyboard2video"
          />
        </div>
      </div>
    </>
  );
}
