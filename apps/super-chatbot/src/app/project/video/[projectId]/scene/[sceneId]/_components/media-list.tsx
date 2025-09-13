"use client";

import { FileTypeEnum } from "@turbo-super/api";

import { MediaFile } from "./media-file";
import { useFileList, useSceneGetById } from "@/lib/api/superduperai";
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
  const { data: scene, isLoading: isSceneLoading } = useSceneGetById({
    id: sceneId,
  });

  const { data: files, isLoading: isFilesLoading } = useFileList({
    projectId,
    sceneId,
    types: [FileTypeEnum.IMAGE, FileTypeEnum.VIDEO],
  });

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
                file={file}
                scene={scene}
                key={file.id}
              />
            ))}
          </QueryState>
        </div>
      </ScrollArea>
    </div>
  );
}
