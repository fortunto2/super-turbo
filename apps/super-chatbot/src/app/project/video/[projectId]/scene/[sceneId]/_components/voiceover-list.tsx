import {
  FileTypeEnum,
  type IFileRead,
  type ISceneRead,
} from "@turbo-super/api";
import { AudioFile } from "./audio-file";
import { EmptyAudioFile } from "./empty-audio-file";

export function VoiceoverList({
  files,
  scene,
  onSelect,
  isLoading,
  onCreateAudio,
}: {
  files: IFileRead[];
  scene?: ISceneRead | null;
  onSelect: (file: IFileRead, isPlaceholder?: boolean) => void;
  isLoading?: boolean;
  onCreateAudio?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 text-sm font-medium text-muted-foreground">
        Voiceover Files
      </div>
      <div className="flex size-full gap-3 overflow-auto">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse aspect-video rounded-lg border bg-muted"
            />
          ))
        ) : (
          <>
            {/* Пустая карточка для сброса выбора */}
            <EmptyAudioFile
              onSelect={() => {
                // Создаем placeholder объект для voiceover
                const placeholderFile: IFileRead = {
                  id: "placeholder-voiceover",
                  url: null,
                  thumbnail_url: null,
                  type: FileTypeEnum.VOICEOVER,
                  image_generation_id: null,
                  image_generation: null,
                  video_generation_id: null,
                  video_generation: null,
                  audio_generation_id: null,
                  audio_generation: null,
                  duration: null,
                  tasks: [],
                };
                onSelect(placeholderFile, true);
              }}
              isActive={!scene?.voiceover_id}
              onCreateAudio={onCreateAudio}
            />

            {/* Файлы */}
            {files.map((file) => (
              <AudioFile
                key={file.id}
                file={file}
                scene={scene}
                onSelect={onSelect}
                type="voiceover"
                isActive={scene?.voiceover_id === file.id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
