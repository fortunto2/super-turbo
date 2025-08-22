"use client";

import { useParams } from "next/navigation";
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
  const projectId = params.projectId as string;

  const [project, setProject] = useState<IProjectRead | null>(null);
  const [scenes, setScenes] = useState<ISceneRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

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

        // Retry logic для временных ошибок
        if (
          retryCount < 2 &&
          error instanceof Error &&
          (error.message.includes("Invalid URL") ||
            error.message.includes("Network"))
        ) {
          console.log(`Retrying... attempt ${retryCount + 1}`);
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
          <Link
            href="/tools/story-editor"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300  hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="size-4 mr-2" />
            Вернуться к Story Editor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyles }} />
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/tools/story-editor"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-all duration-300  hover:scale-105 group"
            >
              <div className="size-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="size-4" />
              </div>
              <span className="font-medium">Вернуться к Story Editor</span>
            </Link>
            <Link
              href={`/project/video/${projectId}/timeline`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-all duration-300  hover:scale-105 group"
            >
              <div className="size-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ArrowRight className="size-4" />
              </div>
              <span className="font-medium">Перейти к Timeline</span>
            </Link>
          </div>

          {/* Video Player Section */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700/50">
              {/* Фиксированная высота для всех состояний */}
              <div className="h-[500px] flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center space-y-4 size-full items-center justify-center flex flex-col">
                    <div className="relative">
                      <div className="size-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full animate-spin"></div>
                      <div className="absolute top-0 left-0 size-16 border-4 border-transparent border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Загрузка проекта и сцен...
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Подготавливаем ваш видеоплеер
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="size-full text-center space-y-4">
                    <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                      <Eye className="size-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-medium text-red-600 dark:text-red-400">
                        Ошибка загрузки
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {error}
                      </p>
                    </div>
                  </div>
                ) : project && scenes.length > 0 ? (
                  <div className="size-full p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Видеоплеер
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {scenes.length} сцен
                        </span>
                        <div className="size-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
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
                    <div className="size-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                      <Eye className="size-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-medium text-gray-600 dark:text-gray-300">
                        Нет данных для отображения
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
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
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Проект
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Статус:
                    </span>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                      Завершен
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Сцены:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {scenes.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Соотношение:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {project.config?.aspect_ratio || "16:9"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scenes Overview */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="size-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Play className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Сцены ({scenes.length})
                  </h3>
                </div>
                <div className="max-h-48 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {scenes.map((scene, index) => (
                    <div
                      key={scene.id}
                      className="flex  space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="size-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-xs font-medium text-purple-700 dark:text-purple-300 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {scene.visual_description ||
                          "Описание сцены недоступно"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="size-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Share2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Действия
                  </h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300  hover:scale-105 shadow-lg">
                    <Download className="size-4" />
                    <span>Скачать видео</span>
                  </button>
                  <button
                    onClick={() => setIsShareDialogOpen(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300  hover:scale-105 shadow-lg"
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
            <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 dark:border-slate-700/50">
              <div className="size-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Powered by{" "}
                <strong className="text-gray-800 dark:text-gray-200">
                  SuperDuperAI
                </strong>
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
      </div>
    </>
  );
}
