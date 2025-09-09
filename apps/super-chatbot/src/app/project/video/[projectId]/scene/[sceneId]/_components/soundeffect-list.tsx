import { FileTypeEnum, type IFileRead } from "@turbo-super/api";
import { AudioFile } from "./audio-file";
import { EmptyAudioFile } from "./empty-audio-file";
import {
  useFileList,
  useSceneGetById,
  useSceneUpdate,
} from "@/lib/api/superduperai";
import { QueryState } from "@/components/ui/query-state";

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
    types: [FileTypeEnum.VOICEOVER],
  });

  const { mutate: update } = useSceneUpdate();

  const handleSelect = (file: IFileRead | null, isPlaceholder?: boolean) => {
    if (!scene) return;
    if (!scene.file_id) return;

    const id = isPlaceholder ? null : file?.id;

    update({
      id: scene.id,
      requestBody: {
        ...scene,
        file_id: scene.file_id,
        sound_effect_id: id,
      },
    });
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
      <div className="flex size-full gap-3 overflow-auto">
        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          emptyMessage="No sound effect files"
          loadingMessage="Loading sound effect files..."
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
              />
            ))}
          </>
        </QueryState>
      </div>
    </div>
  );
}
