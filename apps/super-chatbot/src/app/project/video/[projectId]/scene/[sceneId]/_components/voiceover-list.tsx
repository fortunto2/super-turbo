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

export function VoiceoverList({
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
    types: [FileTypeEnum.VOICEOVER],
  });

  const { mutate: update, isPending } = useSceneUpdate();

  const handleSelectPlaceholder = async () => {
    if (!scene) return;
    if (!scene.file_id) return;

    try {
      await update({
        id: scene.id,
        requestBody: {
          ...scene,
          file_id: scene.file_id,
          voiceover_id: null,
        },
      });
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const isLoading = isFilesLoading || isSceneLoading;
  const isError = !scene || !files;

  return (
    <div className="flex size-full flex-col">
      <div className="mb-4 text-sm font-medium text-muted-foreground">
        Voiceover Files
      </div>
      <ScrollArea
        scrollBehavior="hover"
        hideDelay={400}
        className="w-full h-full scroll-vertical"
      >
        <div className="flex gap-3 pb-2">
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
                onSelect={handleSelectPlaceholder}
                isActive={!scene?.voiceover_id}
                onCreateAudio={onCreateAudio}
                isPending={isPending}
              />

              {/* Файлы */}
              {files?.items?.map((file) => (
                <AudioFile
                  key={file.id}
                  file={file}
                  isActive={scene?.voiceover_id === file.id}
                  scene={scene}
                />
              ))}
            </>
          </QueryState>
        </div>
      </ScrollArea>
    </div>
  );
}
