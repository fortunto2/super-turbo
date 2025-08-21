import React, { useState } from "react";
import type { ProjectTimelineProps, TimelineData } from "../types";
import {
  useProjectTimeline2Video,
  useGenerateTimeline,
  useDataUpdate,
} from "../hooks";
import {
  convertScenesToTimeline,
  isProjectReadyForVideo,
} from "../utils/project-utils";

export const ProjectTimeline2: React.FC<ProjectTimelineProps> = ({
  projectId,
  className = "",
  onTimelineUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Хуки для работы с проектом
  const {
    mutate: convertToVideo,
    isLoading: isConverting,
    error: convertError,
  } = useProjectTimeline2Video({
    onSuccess: (data) => {
      console.log("Timeline конвертирован в видео:", data);
      onTimelineUpdate?.(data);
    },
    onError: (error) => {
      console.error("Ошибка конвертации:", error);
    },
  });

  const { mutate: regenerateTimeline, isLoading: isRegenerating } =
    useGenerateTimeline(["regenerate-timeline"], {
      onSuccess: (data) => {
        console.log("Timeline регенерирован:", data);
      },
    });

  const { mutate: updateData, isLoading: isUpdating } = useDataUpdate(true, {
    onSuccess: (data) => {
      console.log("Данные обновлены:", data);
    },
  });

  const handleConvertToVideo = () => {
    convertToVideo({ projectId });
  };

  const handleRegenerateTimeline = () => {
    regenerateTimeline({ projectId });
  };

  const handleUpdateData = (timelineData: TimelineData) => {
    updateData({
      id: timelineData.id,
      project_id: projectId,
      // Добавьте другие поля для обновления
    });
  };

  return (
    <div className={`project-timeline ${className}`}>
      <div className="timeline-header">
        <h3>Timeline проекта {projectId}</h3>

        <div className="timeline-actions">
          <button
            onClick={handleConvertToVideo}
            disabled={isConverting}
            className="btn btn-primary"
          >
            {isConverting ? "Конвертация..." : "Конвертировать в видео"}
          </button>

          <button
            onClick={handleRegenerateTimeline}
            disabled={isRegenerating}
            className="btn btn-secondary"
          >
            {isRegenerating ? "Регенерация..." : "Регенерировать Timeline"}
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-outline"
          >
            {isEditing ? "Отменить редактирование" : "Редактировать"}
          </button>
        </div>
      </div>

      {convertError && (
        <div className="error-message">
          Ошибка конвертации: {convertError.message}
        </div>
      )}

      <div className="timeline-content">
        {/* Здесь будет содержимое timeline */}
        <p>Timeline будет отображаться здесь...</p>
      </div>

      {isEditing && (
        <div className="timeline-editor">
          <h4>Редактор Timeline</h4>
          {/* Здесь будет редактор для изменения timeline */}
          <p>Редактор timeline будет здесь...</p>
        </div>
      )}
    </div>
  );
};
