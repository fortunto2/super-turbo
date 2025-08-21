"use client";

import { useParams } from "next/navigation";
import { ProjectTimeline } from "@turbo-super/features";
import { ArrowLeft, Clock, Play, Eye } from "lucide-react";
import Link from "next/link";
import { DataTypeEnum, IProjectRead, useProjectData } from "@turbo-super/api";
import { useEffect, useState } from "react";

export default function VideoPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<IProjectRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="size-4 mr-2" />
            Вернуться к Story Editor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/tools/story-editor"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-all duration-300 hover:scale-105 group"
          >
            <div className="size-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <ArrowLeft className="size-4" />
            </div>
            <span className="font-medium">Вернуться к Story Editor</span>
          </Link>
        </div>

        {/* Timeline Editor Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700/50">
            {/* Фиксированная высота для всех состояний */}
            <div className="size-full min-h-[600px] flex items-center justify-center">
              {isLoading ? (
                <div className="size-full text-center space-y-4 items-center justify-center flex flex-col">
                  <div className="relative">
                    <div className="size-16 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 size-16 border-4 border-transparent border-t-purple-500 dark:border-t-purple-400 rounded-full animate-spin"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Загрузка проекта...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Подготавливаем Timeline Editor
                    </p>
                  </div>
                </div>
              ) : !project ? (
                <div className="size-full text-center space-y-4">
                  <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Eye className="size-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-medium text-red-600 dark:text-red-400">
                      Ошибка загрузки
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Не удалось загрузить данные проекта
                    </p>
                  </div>
                </div>
              ) : (
                <div className="size-full p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Timeline Editor
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Редактирование
                      </span>
                      <div className="size-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="size=full bg-gray-50 dark:bg-slate-900/50 rounded-xl overflow-hidden shadow-xl ">
                    <ProjectTimeline
                      projectId={projectId}
                      timeline={timeline}
                      project={project}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Info Cards */}
        {project && !isLoading && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Project Details */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Play className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Проект
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ID:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                    {projectId.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Статус:
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                    Завершен
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Тип:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {project.type || "Video"}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Info */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="size-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Timeline
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Состояние:
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                    Готов
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Редактирование:
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Активно
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Автосохранение:
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Включено
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="size-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Play className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Действия
                </h3>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg">
                  <Clock className="size-4" />
                  <span>Сохранить Timeline</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 hover:scale-105 shadow-lg">
                  <Play className="size-4" />
                  <span>Предпросмотр</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 dark:border-slate-700/50">
            <div className="size-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Powered by{" "}
              <strong className="text-gray-800 dark:text-gray-200">
                SuperDuperAI
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
