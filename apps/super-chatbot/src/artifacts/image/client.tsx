import { Artifact } from "@/components/artifacts/create-artifact";
import {
  CopyIcon,
  RedoIcon,
  UndoIcon,
  ShareIcon,
  PencilEditIcon,
} from "@/components/common/icons";
import { toast } from "sonner";
import "@/lib/utils/console-helpers";
import { ImageArtifactWrapper } from "@/artifacts/image";

export default function ArtifactContentImage(props: any) {
  return <ImageArtifactWrapper {...props} />;
}

export const imageArtifact = new Artifact({
  kind: "image",
  description: "Useful for image generation with real-time progress tracking",
  onCreateDocument: ({ setArtifact }) => {
    // Устанавливаем статус streaming при создании артефакта
    setArtifact((draft) => ({
      ...draft,
      status: "streaming",
      isVisible: true,
    }));
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "text-delta") {
      // AICODE-FIX: Validate JSON content before overwriting to prevent skeleton disappearing
      const newContent = streamPart.content as string;
      try {
        const parsedContent = JSON.parse(newContent);
        setArtifact((draft) => ({
          ...draft,
          content: newContent,
          status: parsedContent.status || "streaming", // Обновляем статус из контента
          // Открываем артефакт если генерация завершена, в процессе или только началась
          isVisible:
            parsedContent.status === "completed" ||
            parsedContent.status === "pending" ||
            parsedContent.status === "streaming" ||
            draft.status === "streaming",
        }));
      } catch {
        // Invalid JSON - don't overwrite existing content
        console.log("🖼️ ⚠️ Skipping invalid JSON content in stream part");
      }
    }
    if (streamPart.type === "finish") {
      setArtifact((draft) => ({ ...draft, status: "completed" }));
    }
  },
  content: ImageArtifactWrapper,
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => handleVersionChange("prev"),
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => handleVersionChange("next"),
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy image to clipboard",
      onClick: ({ content }) => {
        try {
          const parsed = JSON.parse(content);
          if (parsed.status === "completed" && parsed.imageUrl) {
            fetch(parsed.imageUrl)
              .then((res) => res.blob())
              .then((blob) =>
                navigator.clipboard.write([
                  new ClipboardItem({ [blob.type]: blob }),
                ])
              )
              .then(() => toast.success("Image copied to clipboard!"));
          } else {
            toast.error("Image is not ready yet");
          }
        } catch {
          toast.error("Failed to copy image");
        }
      },
      isDisabled: ({ content }) => {
        try {
          return JSON.parse(content).status !== "completed";
        } catch {
          return true;
        }
      },
    },
    {
      icon: <ShareIcon size={18} />,
      description: "Copy artifact link",
      onClick: (context) => {
        const docId = (context as any).documentId;
        if (docId && docId !== "init") {
          navigator.clipboard.writeText(
            `${window.location.origin}/artifact/${docId}`
          );
          toast.success("Artifact link copied!");
        } else {
          toast.error("Artifact not saved yet");
        }
      },
    },
    {
      icon: <PencilEditIcon size={18} />,
      description: "Edit image",
      onClick: ({ content }) => {
        // Получаем доступ к артефакту через глобальный объект
        const artifactInstance = (window as any).artifactInstance;
        if (artifactInstance) {
          console.log("🔧 Edit mode activated for image:", {
            documentId: artifactInstance.artifact.documentId,
            title: artifactInstance.artifact.title,
          });

          // Переключаем в режим редактирования
          artifactInstance.setArtifact((prev: any) => ({
            ...prev,
            isEditing: true,
            editMode: "image-editor",
          }));
        } else {
          console.error("❌ Artifact instance not found");
        }
      },
      isDisabled: ({ content }) => {
        try {
          // Кнопка активна только для завершенных изображений
          return JSON.parse(content).status !== "completed";
        } catch {
          return true;
        }
      },
    },
  ],
  toolbar: [],
});
