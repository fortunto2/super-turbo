"use client";

import { useParams } from "next/navigation";
import { RemotionPlayer } from "@turbo-super/features";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { IProjectRead, IProjectVideoRead, ISceneRead } from "@turbo-super/api";
import { useEffect, useMemo, useState } from "react";

export default function VideoPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<IProjectRead | null>(null);
  const [scenes, setScenes] = useState<ISceneRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const music = useMemo(() => project?.music ?? null, [project?.music]);

  const aspectRatio = useMemo(() => {
    if (!project) return;
    const videoProject = project as IProjectVideoRead;
    const value = videoProject.config.aspect_ratio ?? "16:9";
    const [numerator, denominator] = value.split(":").map(Number);
    return numerator / denominator;
  }, [project?.config?.aspect_ratio]);

  useEffect(() => {
    const fetchData = async () => {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            ID проекта не найден
          </h1>
          <Link
            href="/tools/story-editor"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Вернуться к Story Editor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/tools/story-editor"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к Story Editor
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Просмотр видео
          </h1>
          <p className="text-gray-600">ID проекта: {projectId}</p>
        </div>

        {/* Video Player */}
        <div className="max-w-6xl mx-auto w-full h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">
                  Загрузка проекта и сцен...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <p className="text-lg font-medium mb-2">Ошибка загрузки</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : project && scenes.length > 0 ? (
            <RemotionPlayer
              scenes={scenes}
              music={music}
              isLoading={false}
              aspectRatio={aspectRatio}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-600">
                <p className="text-lg font-medium mb-2">
                  Нет данных для отображения
                </p>
                <p className="text-sm">
                  {!project ? "Проект не найден" : "Сцены не найдены"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
