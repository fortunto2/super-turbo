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
        return <Clock className="h-5 w-5 text-muted-foreground" />;
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
        return "text-green-600 dark:text-green-400";
      case "failed":
        return "text-red-600 dark:text-red-400";
      case "processing":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
            >
              <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="size-4" />
              </div>
              <span className="font-medium">Вернуться</span>
            </button>
          </div>

          <div className="flex items-center justify-center ">
            <div className="size-full text-center bg-card border border-border rounded-2xl p-8 shadow-2xl min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
              <Loader2 className="size-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Загрузка проектов...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
            >
              <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="size-4" />
              </div>
              <span className="font-medium">Вернуться</span>
            </button>
          </div>

          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center bg-card border border-border rounded-2xl p-8 shadow-2xl">
              <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Ошибка загрузки
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="space-y-3 space-x-3">
                <Button onClick={() => window.location.reload()}>
                  Попробовать снова
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Вернуться
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
            >
              <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="size-4" />
              </div>
              <span className="font-medium">Вернуться</span>
            </button>
          </div>

          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center bg-card border border-border rounded-2xl p-8 shadow-2xl">
              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                У вас пока нет проектов
              </h2>
              <p className="text-muted-foreground mb-4">
                Создайте свой первый проект в Story Editor и он появится здесь
              </p>
              <div className="space-y-3">
                <Link href="/tools/story-editor">
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Создать первый проект
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">
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
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-flex items-center flex justify-between mb-8 w-full">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
          >
            <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <ArrowLeft className="size-4" />
            </div>
            <span className="font-medium">Вернуться</span>
          </button>
          <Link href="/tools/story-editor">
            <Button>Создать новый проект</Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Мои проекты</h1>
            <p className="text-muted-foreground mt-2">
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
                className="bg-card border border-border hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate text-foreground">
                      Проект {project.projectId.slice(-8)}
                    </CardTitle>
                    {getStatusIcon(status)}
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Создан{" "}
                    {new Date(project.createdAt).toLocaleDateString("ru-RU")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
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
                          <span className="text-sm font-medium text-muted-foreground">
                            Прогресс:
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {details.completedTasks}/{details.totalTasks} задач
                          </span>
                        </div>

                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
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
                          className="w-full hover:scale-105 transition-all duration-300"
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
