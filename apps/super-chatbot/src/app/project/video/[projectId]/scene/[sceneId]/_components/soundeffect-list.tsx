import { useState } from "react";
import { FileTypeEnum, type IFileRead } from "@turbo-super/api";
import { AudioFile } from "./audio-file";
import { EmptyAudioFile } from "./empty-audio-file";
import {
  useFileList,
  useSceneGetById,
  useSceneUpdate,
} from "@/lib/api/superduperai";
import { QueryState } from "@/components/ui/query-state";
import { Skeleton } from "@turbo-super/ui";
import { ScrollArea } from "@/components/ui";

export function SoundEffectList({
  projectId,
  sceneId,
  onCreateAudio,
}: {
  projectId: string;
  sceneId: string;
  onCreateAudio?: () => void;
}) {
  const [selectingFileId, setSelectingFileId] = useState<string | null>(null);
  const { data: scene, isLoading: isSceneLoading } = useSceneGetById({
    id: sceneId,
  });

  const { data: files, isLoading: isFilesLoading } = useFileList({
    projectId,
    sceneId,
    types: [FileTypeEnum.SOUND_EFFECT],
  });

  const { mutate: update } = useSceneUpdate();

  const handleSelect = async (
    file: IFileRead | null,
    isPlaceholder?: boolean
  ) => {
    if (!scene) return;
    if (!scene.file_id) return;

    const id = isPlaceholder ? null : file?.id;
    const fileId = file?.id || "placeholder";

    setSelectingFileId(fileId);
    try {
      await update({
        id: scene.id,
        requestBody: {
          ...scene,
          file_id: scene.file_id,
          sound_effect_id: id,
        },
      });
    } finally {
      setSelectingFileId(null);
    }
  };

  const isLoading = isFilesLoading || isSceneLoading;
  const isError = !scene || !files;
  const isEmpty =
    !isLoading && !isError && (!files?.items || files.items.length === 0);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 text-sm font-medium text-muted-foreground">
        Sound Effect Files
      </div>
      <ScrollArea
        scrollBehavior="hover"
        hideDelay={400}
        className="w-full h-full scroll-vertical"
      >
        <div className="flex size-full gap-3">
          <QueryState
            isLoading={isLoading}
            isError={isError}
            isEmpty={isEmpty}
            emptyMessage="No sound effect files"
            loadingComponent={
              <div className="flex size-full gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="aspect-video max-w-[300px] rounded-lg"
                  />
                ))}
              </div>
            }
          >
            <>
              {/* Пустая карточка для сброса выбора */}
              <EmptyAudioFile
                onSelect={() => {
                  // Создаем placeholder объект для sound effect
                  const placeholderFile: IFileRead = {
                    id: "placeholder-soundeffect",
                    url: null,
                    thumbnail_url: null,
                    type: FileTypeEnum.SOUND_EFFECT,
                    image_generation_id: null,
                    image_generation: null,
                    video_generation_id: null,
                    video_generation: null,
                    audio_generation_id: null,
                    audio_generation: null,
                    duration: null,
                    tasks: [],
                  };
                  handleSelect(placeholderFile, true);
                }}
                onCreateAudio={onCreateAudio}
                isActive={!scene?.sound_effect_id}
              />

              {/* Файлы */}
              {files?.items?.map((file) => (
                <AudioFile
                  key={file.id}
                  file={file}
                  onSelect={handleSelect}
                  type="soundeffect"
                  isActive={scene?.sound_effect_id === file.id}
                  isSelecting={selectingFileId === file.id}
                />
              ))}
            </>
          </QueryState>
        </div>
      </ScrollArea>
    </div>
  );
}
