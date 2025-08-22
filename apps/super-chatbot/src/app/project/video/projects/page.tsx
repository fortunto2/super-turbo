"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import { Button } from "@turbo-super/ui";
import {
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface UserProject {
  id: string;
  projectId: string;
  createdAt: string;
}

interface ProjectDetails {
  id: string;
  status: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [projectDetails, setProjectDetails] = useState<
    Record<string, ProjectDetails>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка проектов пользователя
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/user-projects");

        if (!response.ok) {
          // Если таблица не существует или другая ошибка БД
          if (response.status === 500) {
            console.log("База данных не готова, показываем пустое состояние");
            setProjects([]);
            setIsLoading(false);
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setProjects(result.projects);
          // Загружаем детали для каждого проекта
          result.projects.forEach((project: UserProject) => {
            fetchProjectDetails(project.projectId);
          });
        } else {
          setError("Ошибка загрузки проектов");
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        // Не показываем ошибку пользователю, показываем пустое состояние
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Загрузка деталей проекта
  const fetchProjectDetails = async (projectId: string) => {
    try {
      const response = await fetch(
        `/api/story-editor/status?projectId=${projectId}`
      );
      const result = await response.json();

      if (result.success) {
        setProjectDetails((prev) => ({
          ...prev,
          [projectId]: {
            id: projectId,
            status: result.status,
            progress: result.progress || 0,
            completedTasks: result.completedTasks || 0,
            totalTasks: result.totalTasks || 0,
          },
        }));
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Завершен";
      case "failed":
        return "Ошибка";
      case "processing":
        return "В обработке";
      default:
        return "Ожидает";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "processing":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Back Button */}
          <div className="mb-6">
            <Link
              href="/tools/story-editor"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-300  hover:scale-105 group"
            >
              <div className="size-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="size-4" />
              </div>
              <span className="font-medium">Вернуться к Story Editor</span>
            </Link>
          </div>

          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Загрузка проектов...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Back Button */}
          <div className="mb-6">
            <Link
              href="/tools/story-editor"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-300  hover:scale-105 group"
            >
              <div className="size-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="size-4" />
              </div>
              <span className="font-medium">Вернуться к Story Editor</span>
            </Link>
          </div>

          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
              <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Ошибка загрузки
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <div className="space-y-3">
                <Button onClick={() => window.location.reload()}>
                  Попробовать снова
                </Button>
                <Link href="/tools/story-editor">
                  <Button variant="outline">Вернуться к Story Editor</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Back Button */}
          <div className="mb-6">
            <Link
              href="/tools/story-editor"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-300  hover:scale-105 group"
            >
              <div className="size-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="size-4" />
              </div>
              <span className="font-medium">Вернуться к Story Editor</span>
            </Link>
          </div>

          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
              <div className="h-24 w-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                У вас пока нет проектов
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Создайте свой первый проект в Story Editor и он появится здесь
              </p>
              <div className="space-y-3">
                <Link href="/tools/story-editor">
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Создать первый проект
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  💡 Каждый проект стоит 40 кредитов
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className=" mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-flex items-center flex justify-between mb-8 w-full">
          <Link
            href="/tools/story-editor"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-300  hover:scale-105 group"
          >
            <div className="size-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <ArrowLeft className="size-4" />
            </div>
            <span className="font-medium">Вернуться к Story Editor</span>
          </Link>
          <Link href="/tools/story-editor">
            <Button>Создать новый проект</Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Мои проекты
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Все ваши проекты Story Editor в одном месте
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const details = projectDetails[project.projectId];
            const status = details?.status || "pending";

            return (
              <Card
                key={project.id}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate text-gray-800 dark:text-gray-200">
                      Проект {project.projectId.slice(-8)}
                    </CardTitle>
                    {getStatusIcon(status)}
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Создан{" "}
                    {new Date(project.createdAt).toLocaleDateString("ru-RU")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Статус:
                      </span>
                      <span
                        className={`text-sm font-medium ${getStatusColor(status)}`}
                      >
                        {getStatusText(status)}
                      </span>
                    </div>

                    {details && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Прогресс:
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {details.completedTasks}/{details.totalTasks} задач
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${details.progress}%` }}
                          />
                        </div>
                      </>
                    )}

                    <div className="pt-2">
                      <Link
                        href={`/project/video/${project.projectId}/generate`}
                      >
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 hover:scale-105 transition-all duration-300"
                          variant="outline"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Открыть проект
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
