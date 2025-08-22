"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Download,
  Share2,
  Eye,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ISceneRead } from "@turbo-super/api";
import { ShareDialog } from "@/components/share-dialog";

interface SceneData {
  success: boolean;
  scene?: ISceneRead;
  error?: string;
}

export default function ScenePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const sceneId = params.sceneId as string;

  const [scene, setScene] = useState<ISceneRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  useEffect(() => {
    const fetchScene = async () => {
      try {
        if (sceneId !== scene?.id) {
          setIsLoading(true);
        }
        setError(null);

        const response = await fetch(
          `/api/story-editor/scene?sceneId=${sceneId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("Сцена не найдена");
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data: SceneData = await response.json();

        if (data.success && data.scene) {
          setScene(data.scene);
        } else {
          setError(data.error || "Не удалось загрузить сцену");
        }
      } catch (error) {
        console.error("Error fetching scene:", error);
        setError("Ошибка загрузки сцены");
      } finally {
        setIsLoading(false);
      }
    };

    if (sceneId) {
      fetchScene();
    }
  }, [sceneId]);

  if (!projectId || !sceneId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            ID сцены не найден
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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href={`/project/video/${projectId}/preview`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-all duration-300  hover:scale-105 group"
          >
            <div className="size-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <ArrowLeft className="size-4" />
            </div>
            <span className="font-medium">Вернуться к проекту</span>
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

        {/* Scene Content */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700/50">
            {/* Фиксированная высота для всех состояний */}
            <div className="min-h-[600px] flex items-center justify-center">
              {isLoading ? (
                <div className="text-center space-y-4 size-full items-center justify-center flex flex-col">
                  <div className="relative">
                    <div className="size-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full animate-spin"></div>
                    <div className="absolute top-0 left-0 size-16 border-4 border-transparent border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Загрузка сцены...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Подготавливаем вашу сцену
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="size-full text-center space-y-4">
                  <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-medium text-red-600 dark:text-red-400">
                      Ошибка загрузки
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">{error}</p>
                  </div>
                </div>
              ) : scene ? (
                <div className="size-full p-6">
                  <div className="mb-4 flex items-center ">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Сцена {Number(scene.order) + 1}
                    </h3>
                  </div>

                  {/* Scene Media */}
                  <div className="bg-black rounded-xl overflow-hidden shadow-2xl h-[400px] mb-6 flex items-center justify-center">
                    {scene.file?.url ? (
                      <img
                        src={scene.file.url}
                        alt="Scene media"
                        className="size-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Eye className="size-16 mx-auto mb-4" />
                        <p>Медиа сцены недоступно</p>
                      </div>
                    )}
                  </div>

                  {/* Scene Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Описание сцены
                      </h4>
                      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {scene.visual_description ||
                            "Описание сцены недоступно"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Детали сцены
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Порядок:
                          </span>
                          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                            {Number(scene.order) + 1}
                          </span>
                        </div>

                        {scene.duration && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">
                              Длительность:
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {scene.duration}с
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="size-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                    <Eye className="size-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-medium text-gray-600 dark:text-gray-300">
                      Сцена не найдена
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Запрошенная сцена не существует
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scene Actions */}
        {scene && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Scene Info */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Информация
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Порядок:
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                    {Number(scene.order) + 1}
                  </span>
                </div>

                {scene.duration && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Длительность:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {scene.duration}с
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Scene Media */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="size-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Play className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Медиа
                </h3>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  {scene.file?.url ? (
                    <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
                      <img
                        src={scene.file.url}
                        alt="Scene preview"
                        className="object-contain rounded-lg"
                        style={{
                          height: "100%",
                          width: "100%",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-8 text-center">
                      <Eye className="size-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Медиа недоступно</p>
                    </div>
                  )}
                </div>
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
                {scene.file?.url && (
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300  hover:scale-105 shadow-lg">
                    <Download className="size-4" />
                    <span>Скачать сцену</span>
                  </button>
                )}
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

        {/* Share Dialog */}
        <ShareDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
