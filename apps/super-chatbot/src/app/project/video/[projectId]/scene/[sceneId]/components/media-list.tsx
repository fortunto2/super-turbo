import type { IFileRead, ISceneRead } from "@turbo-super/api";

import { MediaFile } from "./media-file";

export function MediaList({
  files,
  scene,
  onSelect,
  onDelete,
  isLoading,
}: {
  files: IFileRead[];
  scene: ISceneRead | null;
  onSelect: (file: IFileRead) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}) {
  return (
    <>
      <div className="mb-2 text-sm font-medium text-muted-foreground">
        Storyboard
      </div>
      <div
        className="grid h-full gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded-lg border bg-muted"
            />
          ))
        ) : files.length > 0 ? (
          <>
            {files.map((file) => (
              <MediaFile
                file={file}
                scene={scene}
                onDelete={onDelete}
                onSelect={onSelect}
                key={file.id}
              />
            ))}
          </>
        ) : (
          <div className="col-span-full py-6 text-center text-sm text-muted-foreground">
            Нет файлов для этой сцены
          </div>
        )}
      </div>
    </>
  );
}
