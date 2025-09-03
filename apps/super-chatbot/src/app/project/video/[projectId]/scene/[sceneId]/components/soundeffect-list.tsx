import { IFileRead, ISceneRead } from "@turbo-super/api";
import { AudioLines } from "lucide-react";

export function SoundEffectList({
  files,
  scene,
  onSelect,
  isLoading,
}: {
  files: IFileRead[];
  scene: ISceneRead | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 overflow-auto">
        {isLoading ? (
          // 🟢 Показываем скелетоны пока идёт загрузка
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted" />
                  <div>
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="mt-1 h-3 w-16 rounded bg-muted" />
                  </div>
                </div>
                <div className="h-6 w-16 rounded bg-muted" />
              </div>
              <div className="h-10 rounded-lg bg-muted" />
            </div>
          ))
        ) : files.length > 0 ? (
          files.map((f) => (
            <div
              key={f.id}
              className={`rounded-lg border p-4 transition-all ${
                scene?.sound_effect_id === f.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/60"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <AudioLines className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Sound Effect</div>
                    <div className="text-xs text-muted-foreground">{f.id}</div>
                  </div>
                </div>
                <button
                  className={`rounded-md border px-3 py-1 text-xs transition-all ${
                    scene?.sound_effect_id === f.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/60"
                  }`}
                  onClick={() => onSelect(f.id)}
                >
                  {scene?.sound_effect_id === f.id ? "Active" : "Select"}
                </button>
              </div>
              {f.url && (
                <div className="rounded-lg bg-muted p-3">
                  <audio
                    controls
                    className="w-full"
                    src={f.url}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Нет sound effect файлов
          </div>
        )}
      </div>
    </div>
  );
}
