"use client";

import { FileTypeEnum, OpenAPI, type IFileRead } from "@turbo-super/api";

import { MediaFile } from "./media-file";
import {
  useFileDelete,
  useFileList,
  useSceneGetById,
  useSceneUpdate,
} from "@/lib/api/superduperai";
import { QueryState } from "@/components/ui/query-state";

export function MediaList({
  projectId,
  sceneId,
}: {
  projectId: string;
  sceneId: string;
}) {
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

  const handleSelect = (file: IFileRead) => {
    if (!scene) return;
    update({
      id: scene.id,
      requestBody: {
        ...scene,
        file_id: file.id,
      },
    });
  };

  const isLoading = isSceneLoading || isFilesLoading;
  const isError = !scene || !files;
  const isEmpty =
    !isLoading && !isError && (!files?.items || files.items.length === 0);

  return (
    <>
      <div className="mb-2 text-sm font-medium text-muted-foreground">
        Storyboard
      </div>
      <div
        className="grid h-full gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}
      >
        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          emptyMessage="No files for this scene"
          loadingMessage="Loading media files..."
        >
          {files?.items?.map((file) => (
            <MediaFile
              isActive={file.id === scene?.file_id}
              file={file}
              onDelete={handleDelete}
              onSelect={handleSelect}
              key={file.id}
            />
          ))}
        </QueryState>
      </div>
    </>
  );
}
