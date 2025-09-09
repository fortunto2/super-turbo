"use client";

import { FileTypeEnum, OpenAPI, type IFileRead } from "@turbo-super/api";

import { MediaFile } from "./media-file";
import {
  useFileDelete,
  useFileList,
  useSceneGetById,
  useSceneUpdate,
} from "@/lib/api";

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
  console.log(OpenAPI);

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
  return (
    <>
      <div className="mb-2 text-sm font-medium text-muted-foreground">
        Storyboard
      </div>
      <div
        className="grid h-full gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}
      >
        {isLoading || !scene ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded-lg border bg-muted"
            />
          ))
        ) : files?.items ? (
          <>
            {files.items?.map((file) => (
              <MediaFile
                isActive={file.id === scene?.file_id}
                file={file}
                onDelete={handleDelete}
                onSelect={handleSelect}
                key={file.id}
              />
            ))}
          </>
        ) : (
          <div className="col-span-full py-6 text-center text-sm text-muted-foreground">
            No files for this scene
          </div>
        )}
      </div>
    </>
  );
}
