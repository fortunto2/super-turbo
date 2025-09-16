"use client";

import {
  FileTypeEnum,
  type IFileRead,
  type IEntityRead,
} from "@turbo-super/api";
import { useState } from "react";
import Image from "next/image";
import { Play, Trash2, Check } from "lucide-react";
import { useFileDelete, useEntityUpdate } from "@/lib/api/superduperai";

export function MediaFile({
  file,
  isActive,
  entity,
}: {
  file: IFileRead;
  isActive?: boolean;
  entity?: IEntityRead;
}) {
  const { mutate: deleteFile, isPending: isDeleting } = useFileDelete();
  const { mutate: updateEntity, isPending: isSelecting } = useEntityUpdate();

  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  const handleDelete = async (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await deleteFile({ id: fileId });
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleSelect = async () => {
    if (!entity) return;
    try {
      await updateEntity({
        id: entity.id,
        file_id: file.id,
      } as any);
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  return (
    <div
      key={file.id}
      className="group relative aspect-video w-full"
      onMouseEnter={() => setHoveredFile(file.id)}
      onMouseLeave={() => setHoveredFile(null)}
    >
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
          <div className="absolute z-10">
            <Play
              opacity="0.8"
              className="shadow-lg"
              size="30px"
              color="white"
              fill="white"
            />
          </div>
        )}

        {file.url || file.thumbnail_url ? (
          <Image
            src={(file.thumbnail_url || file.url) as string}
            alt={file.id}
            width={320}
            height={180}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-muted-foreground text-sm">No preview</div>
          </div>
        )}

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

      {/* Кнопки действий - появляются при hover */}
      {hoveredFile === file.id && (
        <div className="absolute top-1 right-1 flex gap-1">
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
          <Check className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
