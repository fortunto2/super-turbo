import { useImageSSE } from "../hooks/use-image-sse";
import { saveArtifactToDatabase, saveMediaToChat } from "@/lib/ai/chat/media";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ImageErrorDisplay } from "@/components/chat/error-display";
import { toast } from "sonner";

import { Skeleton } from "@turbo-super/ui";
import { ImageEditing } from "./editing";
export const ImageArtifactWrapper = memo(
  function ImageArtifactWrapper(props: any) {
    const { content, setArtifact, documentId, title, chatId, setMessages } =
      props;
    const [localContent, setLocalContent] = useState(content);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editMode, setEditMode] = useState<string | null>(null);

    useEffect(() => {
      setLocalContent(content);
    }, [content]);

    // Synchronize edit state with artifact
    useEffect(() => {
      if (props.isEditing !== undefined) {
        setIsEditing(props.isEditing);
      }
      if (props.editMode !== undefined) {
        setEditMode(props.editMode);
      }
    }, [props.isEditing, props.editMode]);

    const parsedContent = useMemo(() => {
      try {
        const parsed = JSON.parse(localContent);
        return parsed;
      } catch (error) {
        // Only log parsing errors for debugging if needed
        if (localContent?.trim()) {
          console.log("🖼️ ❌ Failed to parse image content:", {
            contentPreview: localContent?.substring(0, 100),
            error: error instanceof Error ? error.message : String(error),
          });
        }
        return null;
      }
    }, [localContent]);

    const { status, imageUrl, prompt, projectId, fileId, requestId, error } =
      parsedContent || {};

    // Logging for inpainting debugging
    useEffect(() => {
      if (status === "completed" && imageUrl) {
        console.log("🖼️ ImageArtifactWrapper - parsed content:", {
          status,
          imageUrl: `${imageUrl?.substring(0, 50)}...`,
          prompt: `${prompt?.substring(0, 50)}...`,
          projectId,
          fileId,
          requestId,
        });
      }
    }, [status, imageUrl, prompt, projectId, fileId, requestId]);

    const updateContent = useCallback(
      (newContent: any) => {
        const finalContent = JSON.stringify(newContent);
        setLocalContent(finalContent);
        setArtifact((prev: any) => ({
          ...prev,
          content: finalContent,
          status: "idle",
        }));

        // AICODE-FIX: Remove duplicate save - database save is now handled in server.ts
        // Only save to database when generation is completed
        if (newContent.status === "completed" && newContent.imageUrl) {
          const thumbnailUrl =
            newContent.thumbnailUrl ||
            (newContent.status === "completed"
              ? newContent.imageUrl
              : undefined);
          saveArtifactToDatabase(
            documentId,
            title,
            finalContent,
            "image",
            thumbnailUrl
          );

          // AICODE-FIX: Debug thumbnail save conditions
          console.log("🖼️ 🔍 updateContent called:", {
            status: newContent.status,
            hasImageUrl: !!newContent.imageUrl,
            hasThumbnailUrl: !!newContent.thumbnailUrl,
            documentId,
            documentIdValid: documentId && documentId !== "undefined",
            thumbnailUrl: newContent.thumbnailUrl,
            finalThumbnailUrl: thumbnailUrl,
            fileId: newContent.fileId || "none", // AICODE-DEBUG: Add fileId to logging
            projectId: newContent.projectId || "none", // AICODE-DEBUG: Add projectId to logging
          });
        }

        console.log("🖼️ 🔍 About to check saveMediaToChat conditions...");

        // AICODE-FIX: Add generated image to chat history
        // AICODE-DEBUG: Logging conditions for saveMediaToChat
        const saveConditions = {
          statusIsCompleted: newContent.status === "completed",
          hasImageUrl: !!newContent.imageUrl,
          hasChatId: !!chatId,
          hasSetMessages: !!setMessages,
          hasPrompt: !!newContent.prompt,
        };

        console.log("🖼️ 🔍 SaveMediaToChat conditions check:", saveConditions);
        console.log(
          "🖼️ 🔍 All conditions met:",
          Object.values(saveConditions).every(Boolean)
        );

        // AICODE-DEBUG: Detailed logging of each condition
        console.log("🖼️ 🔍 Detailed conditions:", {
          status: newContent.status,
          statusIsCompleted: newContent.status === "completed",
          imageUrl: newContent.imageUrl
            ? `${newContent.imageUrl.substring(0, 50)}...`
            : "none",
          hasImageUrl: !!newContent.imageUrl,
          chatId: chatId || "none",
          hasChatId: !!chatId,
          setMessages: setMessages ? "function" : "none",
          hasSetMessages: !!setMessages,
          prompt: newContent.prompt
            ? `${newContent.prompt.substring(0, 30)}...`
            : "none",
          hasPrompt: !!newContent.prompt,
        });

        // AICODE-DEBUG: Логирование каждого условия отдельно для точной диагностики
        console.log("🖼️ 🔍 Individual condition checks:", {
          "newContent.status === 'completed'":
            newContent.status === "completed",
          "!!newContent.imageUrl": !!newContent.imageUrl,
          "!!chatId": !!chatId,
          "!!setMessages": !!setMessages,
          "!!newContent.prompt": !!newContent.prompt,
        });

        if (
          newContent.status === "completed" &&
          newContent.imageUrl &&
          chatId &&
          setMessages &&
          newContent.prompt
        ) {
          // AICODE-DEBUG: Логирование перед вызовом saveMediaToChat
          console.log("🖼️ 🔍 Calling saveMediaToChat with:", {
            chatId: chatId || "none",
            imageUrl: newContent.imageUrl
              ? `${newContent.imageUrl.substring(0, 50)}...`
              : "none",
            prompt: newContent.prompt
              ? `${newContent.prompt.substring(0, 30)}...`
              : "none",
            fileId: newContent.fileId || "none",
            fileIdType: typeof newContent.fileId,
            projectId: newContent.projectId || "none",
            projectIdType: typeof newContent.projectId,
          });

          const thumbnailUrl =
            newContent.thumbnailUrl ||
            (newContent.status === "completed"
              ? newContent.imageUrl
              : undefined);

          saveMediaToChat(
            chatId,
            newContent.imageUrl,
            newContent.prompt,
            setMessages,
            "image",
            thumbnailUrl,
            newContent.fileId // AICODE-FIX: Передаем fileId для встраивания в имя вложения
          );
        }
      },
      [setArtifact, documentId, title, chatId, setMessages]
    );

    useEffect(() => {
      if (!projectId) return;

      // AICODE-FIX: Also poll if completed but missing thumbnail
      const needsThumbnail =
        status === "completed" && imageUrl && !parsedContent?.thumbnailUrl;
      if (status === "completed" && !needsThumbnail) return;

      const pollTimeout = setTimeout(async () => {
        try {
          const { pollFileCompletion } = await import(
            "@/lib/utils/smart-polling-manager"
          );
          const result = await pollFileCompletion(projectId, {
            maxDuration: 7 * 60 * 1000,
          });
          console.log("🖼️ 🔄 Polling result:", {
            success: result.success,
            hasUrl: !!result.data?.url,
            hasThumbnail: !!result.data?.thumbnail_url,
            url: result.data?.url,
            thumbnail_url: result.data?.thumbnail_url,
          });
          if (result.success && result.data?.url) {
            // AICODE-FIX: Always force thumbnail update from polling, even if image already completed
            const newContent = {
              ...parsedContent,
              status: "completed",
              imageUrl: result.data.url,
              thumbnailUrl: result.data.thumbnail_url, // AICODE-FIX: Include thumbnail from polling
              prompt:
                result.data.image_generation?.prompt || parsedContent?.prompt, // Use prompt from polling result
              progress: 100,
            };
            console.log("🖼️ 🔄 Forcing thumbnail update from polling:", {
              imageUrl: result.data.url,
              thumbnailUrl: result.data.thumbnail_url,
              currentStatus: parsedContent?.status,
            });
            updateContent(newContent);
          }
        } catch (error) {
          console.error("❌ Artifact smart polling system error:", error);
        }
      }, 20000); // 20s delay

      return () => clearTimeout(pollTimeout);
    }, [projectId, status, updateContent, parsedContent, imageUrl]);

    useImageSSE({
      fileId: fileId,
      eventHandlers: useMemo(
        () => [
          (message: any) => {
            console.log("🖼️ 📡 SSE message received:", {
              type: message.type,
              hasUrl: !!message.object?.url,
              hasThumbnail: !!message.object?.thumbnail_url,
            });
            if (
              message.type === "file" &&
              message.object?.url &&
              message.object?.contentType?.startsWith("image/")
            ) {
              console.log("🖼️ 📡 Processing file completion from SSE:", {
                url: message.object.url,
                thumbnail_url: message.object.thumbnail_url,
              });
              updateContent({
                ...parsedContent,
                status: "completed",
                imageUrl: message.object.url,
                thumbnailUrl: message.object.thumbnail_url, // AICODE-FIX: Include thumbnail from SSE
                prompt:
                  message.object.image_generation?.prompt ||
                  parsedContent?.prompt,
                progress: 100,
              });
            } else if (
              message.type === "render_progress" &&
              message.object?.progress !== undefined
            ) {
              setLocalContent(
                JSON.stringify({
                  ...parsedContent,
                  status: "processing",
                  progress: message.object.progress,
                })
              );
            } else if (
              message.type === "render_result" &&
              (message.object?.url || message.object?.file_url)
            ) {
              console.log("🖼️ 📡 Processing render_result from SSE:", {
                url: message.object.url || message.object.file_url,
                thumbnail_url: message.object.thumbnail_url,
              });
              updateContent({
                ...parsedContent,
                status: "completed",
                imageUrl: message.object.url || message.object.file_url,
                thumbnailUrl: message.object.thumbnail_url, // AICODE-FIX: Include thumbnail from SSE
                prompt: parsedContent?.prompt,
                progress: 100,
              });
            } else if (
              message.type === "error" ||
              message.type === "image_error"
            ) {
              console.error("🖼️ ❌ Image generation error via SSE:", message);

              updateContent({
                ...parsedContent,
                status: "error",
                error:
                  message.error || message.message || "Image generation failed",
                timestamp: Date.now(),
              });

              // Show error toast
              toast.error(
                `Ошибка генерации изображения: ${message.error || message.message || "Неизвестная ошибка"}`
              );
            }
          },
        ],
        [updateContent, parsedContent]
      ),
      enabled: !!projectId && status !== "completed" && !!requestId,
    });

    // Show skeleton while loading or if content cannot be parsed
    if (!parsedContent) {
      return (
        <div className="space-y-2">
          <Skeleton className="w-full h-[400px] rounded-lg" />
          <Skeleton className="w-3/4 h-4 rounded-lg" />
        </div>
      );
    }

    // Show error state
    if (status === "failed" || status === "error" || error) {
      const handleRetry = () => {
        // Clear error and reset state for retry
        updateContent({
          ...parsedContent,
          status: "idle",
          error: undefined,
        });
        toast.info("Функция повтора будет добавлена в следующей версии");
      };

      return (
        <ImageErrorDisplay
          error={error || "Ошибка генерации изображения"}
          prompt={prompt}
          onRetry={handleRetry}
        />
      );
    }

    if (status === "completed" && imageUrl) {
      return (
        <ImageDisplay
          imageUrl={imageUrl}
          prompt={prompt}
          documentId={documentId}
          chatId={chatId}
          projectId={projectId}
          fileId={fileId}
          isEditing={isEditing}
          editMode={editMode}
          setArtifact={setArtifact}
          onEditToggle={() => setIsEditing(!isEditing)}
          onEditModeChange={setEditMode}
          onSaveEdit={(editedImageUrl: string) => {
            // Здесь будет ваша логика сохранения отредактированного изображения
            console.log("🔧 Saving edited image:", editedImageUrl);

            // Обновляем контент с новым изображением
            const newContent = {
              ...parsedContent,
              imageUrl: editedImageUrl,
              editedAt: new Date().toISOString(),
              originalImageUrl: parsedContent.imageUrl, // Сохраняем оригинал
            };

            updateContent(newContent);
            setIsEditing(false);
            setEditMode(null);
          }}
          onCancelEdit={() => {
            setIsEditing(false);
            setEditMode(null);
          }}
        />
      );
    }

    // Show skeleton for pending/processing states
    return (
      <div className="space-y-2">
        <Skeleton className="w-full h-[400px] rounded-lg" />
        <Skeleton className="w-3/4 h-4 rounded-lg" />
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

const ImageDisplay = ({
  imageUrl,
  prompt,
  documentId,
  chatId,
  projectId,
  fileId,
  isEditing,
  editMode,
  setArtifact,
  onEditToggle,
  onEditModeChange,
  onSaveEdit,
  onCancelEdit,
}: {
  imageUrl: string;
  prompt: string;
  documentId: string;
  chatId: string;
  projectId?: string;
  fileId?: string;
  isEditing: boolean;
  editMode: string | null;
  setArtifact: (fn: (prev: any) => any) => void;
  onEditToggle: () => void;
  onEditModeChange: (mode: string | null) => void;
  onSaveEdit: (editedImageUrl: string) => void;
  onCancelEdit: () => void;
}) => {
  // Если включен режим редактирования, показываем редактор
  if (isEditing) {
    return (
      <ImageEditing
        imageUrl={imageUrl}
        prompt={prompt}
        documentId={documentId}
        chatId={chatId}
        projectId={projectId}
        fileId={fileId}
        setArtifact={setArtifact}
        onCancelEdit={onCancelEdit}
        onSaveEdit={onSaveEdit}
        onEditModeChange={onEditModeChange}
        editMode={editMode || "inpainting"}
      />
    );
  }

  // Обычный режим просмотра
  return (
    <div className="space-y-2">
      <div className="rounded-lg overflow-hidden border">
        <Image
          src={imageUrl}
          alt={prompt || "AI-generated artwork"}
          width={800}
          height={600}
          className="w-full h-auto object-contain"
          style={{ maxHeight: "70vh" }}
          unoptimized
        />
      </div>
      <p className="text-sm text-gray-500 px-1">{prompt}</p>

      {/* Edit mode toggle button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onEditToggle}
          className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          ✏️ Edit Image
        </button>
      </div>
    </div>
  );
};
