import { FileTypeEnum } from "@turbo-super/api";
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
  const { data: scene, isLoading: isSceneLoading } = useSceneGetById({
    id: sceneId,
  });

  const { data: files, isLoading: isFilesLoading } = useFileList({
    projectId,
    sceneId,
    types: [FileTypeEnum.SOUND_EFFECT],
  });

  const { mutate: update, isPending } = useSceneUpdate();

  const handleSelect = async () => {
    if (!scene) return;
    if (!scene.file_id) return;

    try {
      await update({
        id: scene.id,
        requestBody: {
          ...scene,
          file_id: scene.file_id,
          sound_effect_id: null,
        },
      });
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const isLoading = isFilesLoading || isSceneLoading;
  const isError = !scene || !files;

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
                onSelect={handleSelect}
                onCreateAudio={onCreateAudio ?? (() => {})}
                isActive={!scene?.sound_effect_id}
                isPending={isPending}
              />

              {/* Файлы */}
              {files?.items?.map((file) => (
                <AudioFile
                  key={file.id}
                  file={file}
                  isActive={scene?.sound_effect_id === file.id}
                  scene={scene ?? undefined}
                />
              ))}
            </>
          </QueryState>
        </div>
      </ScrollArea>
    </div>
  );
}
