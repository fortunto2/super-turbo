import { API_NEXT_ROUTES } from "@/lib/config/next-api-routes";
import { Inpainting } from "@turbo-super/features";
import { useState, useEffect } from "react";

export const ImageEditing = ({
  imageUrl,
  prompt,
  documentId,
  chatId,
  onCancelEdit,
  onSaveEdit,
  onEditModeChange,
  editMode,
}: {
  imageUrl: string;
  prompt: string;
  documentId: string;
  chatId: string;
  onCancelEdit: () => void;
  onSaveEdit: (imageUrl: string) => void;
  onEditModeChange: (mode: string) => void;
  editMode: string;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (editMode === "advanced-edit") {
      console.log("Advanced edit mode activated");
    }
  }, [editMode, imageUrl]);

  const handleGenerating = () => {
    setIsGenerating(true);
  };

  const handleInpaintingComplete = async (result: {
    prompt: string;
    mask: File;
    config: string;
  }) => {
    setIsGenerating(false);
    console.log("Inpainting completed:", result);

    try {
      const formData = new FormData();
      formData.append("prompt", result.prompt);
      formData.append("mask", result.mask);
      formData.append("config", result.config);
      formData.append("generationType", "image-to-image");
      formData.append("mask", result.mask);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${API_NEXT_ROUTES.GENERATE_IMAGE}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      console.log("Inpainting response:", data);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const mockFile = {
    id: documentId,
    name: "image.jpg",
    url: imageUrl,
    type: "image/jpeg",
    size: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Редактирование изображения</h3>
        <div className="flex gap-2">
          <button
            onClick={onCancelEdit}
            className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={() => onSaveEdit(imageUrl)}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Сохранить
          </button>
        </div>
      </div>

      {/* Выбор режима редактирования */}
      <div className="flex gap-2 justify-center mb-4">
        <button
          onClick={() => onEditModeChange("basic-edit")}
          className={`px-4 py-2 rounded-md transition-colors ${
            editMode === "basic-edit"
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-muted"
          }`}
        >
          Базовое редактирование
        </button>
        <button
          onClick={() => onEditModeChange("advanced-edit")}
          className={`px-4 py-2 rounded-md transition-colors ${
            editMode === "advanced-edit"
              ? "bg-primary text-primary-foreground"
              : "border border-border hover:bg-muted"
          }`}
        >
          Расширенное редактирование (Inpainting)
        </button>
      </div>

      {/* Интегрированный компонент Inpainting */}
      {editMode === "advanced-edit" && (
        <div className="border border-border rounded-lg overflow-hidden">
          <Inpainting
            file={mockFile}
            projectId={documentId}
            sceneId={chatId}
            entityId={documentId}
            imageUrl={imageUrl}
            onGenerating={handleGenerating}
            onComplete={handleInpaintingComplete}
            initialPrompt={prompt}
          />
        </div>
      )}

      {/* Базовое редактирование */}
      {editMode === "basic-edit" && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <div className="space-y-4">
            <h4 className="text-xl font-medium">Базовое редактирование</h4>
            <p className="text-muted-foreground">
              Простые инструменты для базового редактирования изображения
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
