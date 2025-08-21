"use client";

import { useParams } from "next/navigation";
import {
  ProjectTimeline,
  VideoPlayer,
  useProject,
} from "@turbo-super/features";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DataTypeEnum, IProjectRead, useProjectData } from "@turbo-super/api";
import { useEffect, useState } from "react";

export default function VideoPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const getProject = async () => {
    const response = await fetch(
      `/api/story-editor/project?projectId=${projectId}`
    );
    const data = await response.json();
    return data;
  };
  const [project, setProject] = useState<IProjectRead | null>(null);

  useEffect(() => {
    getProject().then((data) => {
      if (data.success) {
        setProject(data.project);
      }
    });
  }, [projectId]);

  const timeline = useProjectData(project, DataTypeEnum.TIMELINE);

  console.log(project);

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
        <div className="max-w-6xl mx-auto">
          {!project && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-8">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Ошибка загрузки проекта
              </h3>
            </div>
          )}

          {project && (
            <>
              <ProjectTimeline
                projectId={projectId}
                timeline={timeline}
                project={project}
              />
            </>
          )}
        </div>

        {/* Project Info */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Информация о проекте
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">ID проекта:</span> {projectId}
              </div>
              <div>
                <span className="font-medium">Статус:</span> Завершен
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
