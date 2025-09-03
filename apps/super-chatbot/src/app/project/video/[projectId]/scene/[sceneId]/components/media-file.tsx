import { FileTypeEnum, IFileRead, ISceneRead } from "@turbo-super/api";
import { FileGenerationStatus } from "./helper";
import { useState } from "react";
import Image from "next/image";
import { Play, Trash2 } from "lucide-react";

export function MediaFile({
  file,
  onDelete,
  onSelect,
  scene,
}: {
  file: IFileRead;
  scene: ISceneRead | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const handleDelete = async (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Предотвращаем выбор файла при клике на удаление
    setDeletingFile(fileId);

    try {
      await onDelete(fileId);
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setDeletingFile(null);
    }
  };

  return (
    <div
      key={file.id}
      className="group relative aspect-video"
      onMouseEnter={() => setHoveredFile(file.id)}
      onMouseLeave={() => setHoveredFile(null)}
    >
      {!file.url && !file.thumbnail_url ? (
        <FileGenerationStatus
          file={file}
          key={file.id}
        />
      ) : (
        <button
          onClick={() => onSelect(file.id)}
          className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg border transition-all duration-200 ${
            scene?.file?.id === file.id
              ? "border-primary ring-2 ring-primary"
              : "border-border hover:border-primary/60 hover:shadow-md"
          }`}
        >
          {file.type === FileTypeEnum.VIDEO && (
            <div className="z-10 absolute">
              <Play
                opacity="0.8"
                className="shadow-lg"
                size="30px"
                color="white"
                fill="white"
              />
            </div>
          )}
          <Image
            src={(file.thumbnail_url || file.url) as string}
            alt={file.id}
            width={320}
            height={180}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />

          {/* Overlay при hover */}
          {hoveredFile === file.id && (
            <div className="absolute inset-0 bg-black/20 transition-opacity duration-200" />
          )}
        </button>
      )}

      {/* Кнопка удаления - появляется при hover */}
      {hoveredFile === file.id && (
        <button
          onClick={(e) => handleDelete(file.id, e)}
          disabled={deletingFile === file.id}
          className="absolute top-1 right-1 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Удалить файл"
        >
          {deletingFile === file.id ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Индикатор активного файла */}
      {scene?.file?.id === file.id && (
        <div className="absolute top-1 left-1 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg">
          <div className="w-2 h-2 bg-current rounded-full" />
        </div>
      )}
    </div>
  );
}
