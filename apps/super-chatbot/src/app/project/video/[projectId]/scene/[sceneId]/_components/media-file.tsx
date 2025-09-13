import { FileTypeEnum, ISceneRead, type IFileRead } from "@turbo-super/api";
import { FileGenerationStatus } from "./helper";
import { FileMetadataModal } from "./file-metadata-modal";
import { hasMetadata } from "./file-metadata-utils";
import { useState } from "react";
import Image from "next/image";
import { Play, Trash2, Info } from "lucide-react";
import { useFileDelete, useSceneUpdate } from "@/lib/api";

export function MediaFile({
  file,
  isActive,
  scene,
}: {
  file: IFileRead;
  isActive?: boolean;
  scene?: ISceneRead;
}) {
  const { mutate: deleteFile, isPending: isDeleting } = useFileDelete();

  const { mutate: update, isPending: isSelecting } = useSceneUpdate();

  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  const [showMetadata, setShowMetadata] = useState(false);

  const handleDelete = async (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await deleteFile({ id: fileId });
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleSelect = async () => {
    if (!scene) return;
    try {
      await update({
        id: scene.id,
        requestBody: {
          ...scene,
          file_id: file.id,
        },
      });
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const handleInfoClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMetadata(true);
  };

  return (
    <div
      key={file.id}
      className="group relative aspect-video w-[300px] flex-shrink-0"
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
          onClick={handleSelect}
          disabled={isSelecting}
          className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg border transition-all duration-200 ${
            isActive
              ? "border-primary ring-2 ring-primary"
              : "border-border hover:border-primary/60 hover:shadow-md"
          } ${isSelecting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {file.type === FileTypeEnum.VIDEO && (
            <div className="absolute">
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
          {hoveredFile === file.id && !isSelecting && (
            <div className="absolute inset-0 bg-black/20 transition-opacity duration-200" />
          )}

          {/* Pending overlay */}
          {isSelecting && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
      )}

      {/* Кнопки действий - появляются при hover */}
      {hoveredFile === file.id && (
        <div className="absolute top-1 right-1 flex gap-1">
          {/* Кнопка информации о метаданных */}
          {hasMetadata(file) && (
            <button
              onClick={handleInfoClick}
              className="p-1.5 bg-blue-500/90 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              title="Show metadata"
            >
              <Info className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => handleDelete(file.id, e)}
            disabled={isDeleting}
            className="p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete file"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* Индикатор активного файла */}
      {isActive && (
        <div className="absolute top-1 left-1 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg">
          <div className="w-2 h-2 bg-current rounded-full" />
        </div>
      )}

      {/* Модальное окно с метаданными */}
      <FileMetadataModal
        file={file}
        isOpen={showMetadata}
        onClose={() => setShowMetadata(false)}
      />
    </div>
  );
}
