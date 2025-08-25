"use client";

import { TaskTypeEnum } from "@turbo-super/api";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ProjectTask {
  type: string;
  status: string;
}

interface ProjectTaskListProps {
  tasks: ProjectTask[];
}

export const ProjectTaskList: React.FC<ProjectTaskListProps> = ({ tasks }) => {
  // Определяем понятное название для типа задачи
  const getTaskTypeName = (type: string) => {
    switch (type) {
      case TaskTypeEnum.TXT2SCRIPT_FLOW:
        return "Генерация сценария";
      case TaskTypeEnum.SCRIPT2ENTITIES_FLOW:
        return "Извлечение сущностей";
      case TaskTypeEnum.SCRIPT2STORYBOARD_FLOW:
        return "Создание раскадровки";
      case TaskTypeEnum.STORYBOARD2VIDEO_FLOW:
        return "Генерация видео";
      case TaskTypeEnum.AUDIO_GENERATION_FLOW:
        return "Добавление аудио";
      default:
        return type?.replace(/_/g, " ").toLowerCase() || "Неизвестная задача";
    }
  };

  // Получаем статус задачи на русском языке
  const getTaskStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Завершено";
      case "error":
        return "Ошибка";
      case "in_progress":
        return "В процессе";
      case "pending":
        return "Ожидание";
      default:
        return "Неизвестно";
    }
  };

  // Получаем иконку для статуса задачи
  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="size-3 text-green-600" />;
      case "error":
        return <AlertCircle className="size-3 text-red-600" />;
      case "in_progress":
        return <Loader2 className="size-3 animate-spin text-primary" />;
      default:
        return <div className="size-3 rounded-full bg-muted" />;
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <h4 className="font-medium text-sm text-foreground">Детали задач:</h4>
      <div className="space-y-2">
        {tasks.map((task: ProjectTask, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="capitalize text-foreground">
              {getTaskTypeName(task.type)}
            </span>
            <div className="flex items-center space-x-2">
              {getTaskStatusIcon(task.status)}
              <span className="text-xs capitalize text-muted-foreground">
                {getTaskStatusText(task.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
