"use client";

import { useState } from "react";
import { FileTypeEnum, type IFileRead } from "@turbo-super/api";

import { MediaFile } from "./media-file";
import {
  useFileDelete,
  useFileList,
  useSceneGetById,
  useSceneUpdate,
} from "@/lib/api/superduperai";
import { QueryState } from "@/components/ui/query-state";
import { Skeleton } from "@turbo-super/ui";
import { ScrollArea } from "@/components/ui";

export function MediaList({
  projectId,
  sceneId,
}: {
  projectId: string;
  sceneId: string;
}) {
  const [selectingFileId, setSelectingFileId] = useState<string | null>(null);
  const { data: scene, isLoading: isSceneLoading } = useSceneGetById({
    id: sceneId,
  });

  const { data: files, isLoading: isFilesLoading } = useFileList({
    projectId,
    sceneId,
    types: [FileTypeEnum.IMAGE, FileTypeEnum.VIDEO],
  });

  const { mutate: update } = useSceneUpdate();

  const { mutate: deleteFile } = useFileDelete();

  const handleDelete = (id: string) => {
    deleteFile({ id });
  };

  const handleSelect = async (file: IFileRead) => {
    if (!scene) return;

    setSelectingFileId(file.id);
    try {
      await update({
        id: scene.id,
        requestBody: {
          ...scene,
          file_id: file.id,
        },
      });
    } finally {
      setSelectingFileId(null);
    }
  };

  const isLoading = isSceneLoading || isFilesLoading;
  const isError = !scene || !files;
  const isEmpty =
    !isLoading && !isError && (!files?.items || files.items.length === 0);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 text-sm font-medium text-muted-foreground">
        Media Files
      </div>
      <ScrollArea
        scrollBehavior="hover"
        hideDelay={400}
        className="w-full h-full scroll-horizontal"
      >
        <div
          className="flex gap-3"
          style={{ minWidth: "max-content" }}
        >
          <QueryState
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            emptyMessage="No files for this scene"
            loadingComponent={
              <div className="flex gap-3 min-w-max">
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="aspect-video rounded-lg w-[300px] flex-shrink-0"
                  />
                ))}
              </div>
            }
          >
            {files?.items?.map((file) => (
              <MediaFile
                isActive={file.id === scene?.file_id}
                isSelecting={selectingFileId === file.id}
                file={file}
                onDelete={handleDelete}
                onSelect={handleSelect}
                key={file.id}
              />
            ))}
          </QueryState>
        </div>
      </ScrollArea>
    </div>
  );
}
