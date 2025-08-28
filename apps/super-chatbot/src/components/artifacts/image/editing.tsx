import { API_NEXT_ROUTES } from "@/lib/config/next-api-routes";
import { Inpainting } from "@turbo-super/features";
import { useState, useEffect } from "react";

export const ImageEditing = ({
  imageUrl,
  prompt,
  documentId,
  chatId,
  projectId,
  fileId,
  setArtifact,
  onCancelEdit,
  onSaveEdit,
  onEditModeChange,
  editMode,
  isGenerating: externalIsGenerating = false,
}: {
  imageUrl: string;
  prompt: string;
  documentId: string;
  chatId: string;
  projectId?: string;
  fileId?: string;
  setArtifact: (fn: (prev: any) => any) => void;
  onCancelEdit: () => void;
  onSaveEdit: (imageUrl: string) => void;
  onEditModeChange: (mode: string) => void;
  editMode: string;
  isGenerating?: boolean;
}) => {
  const [internalIsGenerating, setInternalIsGenerating] = useState(false);

  // Объединяем внешнее и внутреннее состояние загрузки
  const isGenerating = externalIsGenerating || internalIsGenerating;

  useEffect(() => {
    if (editMode === "advanced-edit") {
      console.log("Advanced edit mode activated");
    }
  }, [editMode, imageUrl]);

  const handleGenerating = () => {
    setInternalIsGenerating(true);
  };

  // Функция пулинга для инпаинтинга
  const startInpaintingPolling = async (
    newProjectId: string,
    newPrompt: string
  ) => {
    try {
      console.log("🔄 Starting inpainting polling for project:", newProjectId);

      // Polling function for inpainting result
      const checkInpaintingResult = async (attempts = 0): Promise<void> => {
        if (attempts > 30) {
          // 5 minutes max
          throw new Error("Inpainting timeout");
        }

        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds

        try {
          // Check if we have a result
          const checkResponse = await fetch(`/api/file/${newProjectId}`);
          if (checkResponse.ok) {
            const fileData = await checkResponse.json();
            if (fileData.url) {
              // Success! Update existing artifact with inpainting result
              console.log("✅ Inpainting completed:", fileData.url);

              // Update existing artifact with the result
              setArtifact((prev) => ({
                ...prev,
                isVisible: true,
                kind: "image",
                content: JSON.stringify({
                  status: "completed",
                  imageUrl: fileData.url, // Используем URL результата инпаинтинга
                  prompt: newPrompt,
                  projectId: newProjectId,
                  fileId: fileData?.fileId || fileId || newProjectId, // projectId is the fileId for the new image
                }),
                title: `Inpainting: ${newPrompt}`,
              }));

              // AICODE-NOTE: Save the inpainting result to chat so it can be used for future inpainting
              // This ensures the fileId is properly stored in the database
              try {
                const saveResponse = await fetch("/api/save-message", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    chatId: chatId,
                    messageId: `inpainting-${newProjectId}`,
                    role: "assistant",
                    content: "",
                    parts: [
                      {
                        type: "text",
                        text: `Inpainting result: ${newPrompt}`,
                      },
                    ],
                    experimental_attachments: [
                      {
                        name: `[FILE_ID:${newProjectId}] ${newPrompt}`,
                        url: fileData.url, // Используем URL результата инпаинтинга
                        contentType: "image/png",
                        thumbnailUrl: fileData.thumbnail_url,
                      },
                    ],
                  }),
                });

                if (saveResponse.ok) {
                  console.log(
                    "✅ Inpainting result saved to chat with fileId:",
                    newProjectId
                  );
                } else {
                  console.warn("⚠️ Failed to save inpainting result to chat");
                }
              } catch (error) {
                console.error(
                  "❌ Error saving inpainting result to chat:",
                  error
                );
              }

              setInternalIsGenerating(false);
              return;
            }
          }
        } catch (error) {
          console.log(
            "Inpainting polling attempt",
            attempts + 1,
            "failed, retrying..."
          );
        }

        // Continue polling
        return checkInpaintingResult(attempts + 1);
      };

      await checkInpaintingResult();
    } catch (error) {
      console.error("Inpainting polling error:", error);
      setInternalIsGenerating(false);
    }
  };

  const handleInpaintingComplete = async (result: {
    prompt: string;
    mask: File;
    config: string;
  }) => {
    console.log("Inpainting completed:", result);

    // Block immediately when inpainting starts
    setInternalIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("prompt", result.prompt);
      formData.append("mask", result.mask);
      formData.append("config", result.config);
      formData.append("generationType", "image-to-image");
      formData.append("mask", result.mask);

      // Извлекаем fileId из URL изображения
      const extractFileIdFromUrl = (url: string): string | null => {
        console.log("🔍 extractFileIdFromUrl: Analyzing URL:", url);

        // Пытаемся извлечь fileId из URL (например, из /file/{fileId})
        const fileIdMatch = url.match(/\/file\/([^/]+)/);
        if (fileIdMatch) {
          console.log(
            "🔍 extractFileIdFromUrl: Found fileId from /file/ pattern:",
            fileIdMatch[1]
          );
          return fileIdMatch[1];
        }

        // Если это URL сгенерированного изображения, извлекаем ID из пути
        // Паттерн: generated/image/YYYY/M/D/H/filename.ext
        const generatedMatch = url.match(/generated\/image\/[^/]+\/([^/]+)\./);
        if (generatedMatch) {
          console.log(
            "🔍 extractFileIdFromUrl: Found fileId from generated pattern:",
            generatedMatch[1]
          );
          return generatedMatch[1];
        }

        // Дополнительный паттерн для URL сгенерированных изображений без слеша в начале
        const generatedMatch2 = url.match(/generated\/image\/[^/]+\/([^/]+)\./);
        if (generatedMatch2) {
          console.log(
            "🔍 extractFileIdFromUrl: Found fileId from generated pattern (no slash):",
            generatedMatch2[1]
          );
          return generatedMatch2[1];
        }

        // Дополнительный паттерн для других форматов URL
        const altMatch = url.match(/\/([a-f0-9-]{36})\./);
        if (altMatch) {
          console.log(
            "🔍 extractFileIdFromUrl: Found fileId from UUID pattern:",
            altMatch[1]
          );
          return altMatch[1];
        }

        // AICODE-NOTE: Если не можем извлечь fileId из URL, возвращаем null
        // Это предотвратит использование chatId как запасного варианта
        console.log(
          "🔍 extractFileIdFromUrl: No fileId found in URL - cannot proceed with inpainting"
        );
        return null;
      };

      // Добавляем sourceImageId и sourceImageUrl для инпаинтинга
      console.log("🔧 Chat inpainting - Starting fileId extraction:", {
        fileId: fileId || "none",
        projectId: projectId || "none",
        imageUrl: imageUrl,
      });

      const extractedFileId = extractFileIdFromUrl(imageUrl);

      // AICODE-NOTE: НЕ используем chatId как запасной вариант, так как это вызывает Foreign Key Constraint Violation
      // Если нет fileId, то не делаем инпаинтинг
      const sourceImageId = fileId || extractedFileId;

      console.log("🔧 Chat inpainting - sourceImageId selection:", {
        fileId: fileId || "none",
        extractedFileId: extractedFileId || "none",
        projectId: projectId || "none",
        finalSourceImageId: sourceImageId,
        imageUrl: imageUrl,
      });

      if (sourceImageId) {
        formData.append("sourceImageId", sourceImageId);
        formData.append("sourceImageUrl", imageUrl);
        formData.append("model", "comfyui/flux/inpainting");
        console.log(
          "🔧 Chat inpainting - using sourceImageId:",
          sourceImageId,
          "source:",
          fileId
            ? "fileId prop"
            : extractedFileId
              ? "extracted from URL"
              : "none",
          "imageUrl:",
          imageUrl
        );
      } else {
        console.error(
          "❌ Chat inpainting - sourceImageId is missing! Cannot proceed with inpainting."
        );
        setInternalIsGenerating(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/${API_NEXT_ROUTES.GENERATE_IMAGE}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      console.log("Inpainting response:", data);

      // Если успешно, создаем новый артефакт и запускаем пулинг
      if (data.success && data.projectId) {
        // Create new artifact immediately with pending status
        setArtifact((prev) => ({
          ...prev,
          isVisible: true,
          kind: "image",
          content: JSON.stringify({
            status: "pending",
            imageUrl: imageUrl, // Показываем оригинальное изображение
            prompt: result.prompt,
            projectId: data.projectId,
            fileId: data.fileId || data.projectId,
          }),
          title: `Inpainting: ${result.prompt}`,
        }));

        // Close edit mode immediately after successful request
        onCancelEdit();

        // Start polling for the result
        await startInpaintingPolling(data.projectId, result.prompt);
      } else {
        console.error("Inpainting failed:", data);
        setInternalIsGenerating(false);
      }
    } catch (error) {
      console.error("Error during inpainting:", error);
      setInternalIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Редактирование изображения</h3>
        <div className="flex gap-2">
          <button
            onClick={onCancelEdit}
            disabled={isGenerating}
            className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отмена
          </button>
          <button
            onClick={() => onSaveEdit(imageUrl)}
            disabled={isGenerating}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Обработка..." : "Сохранить"}
          </button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Inpainting
          imageUrl={imageUrl}
          onGenerating={handleGenerating}
          onComplete={handleInpaintingComplete}
          initialPrompt={prompt}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};
