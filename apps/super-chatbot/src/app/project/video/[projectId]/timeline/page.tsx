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
    <>
      {isLoading ? (
        <div className="min-h-screen size-full text-center space-y-4 items-center justify-center flex flex-col">
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
        <ProjectTimeline
          projectId={projectId}
          timeline={timeline}
          project={project}
        />
      )}
    </>
  );
}
