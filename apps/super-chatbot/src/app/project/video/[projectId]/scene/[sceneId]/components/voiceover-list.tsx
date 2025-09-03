import { IFileRead, ISceneRead } from "@turbo-super/api";
import { MicVocal } from "lucide-react";

export function VoiceoverList({
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
      <div className="mb-2 text-sm font-medium text-muted-foreground">
        Voiceover Files
      </div>
      <div className="space-y-3 overflow-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 rounded-full bg-muted" />
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
                scene?.voiceover_id === f.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/60"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <MicVocal className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Voiceover</div>
                    <div className="text-xs text-muted-foreground">{f.id}</div>
                  </div>
                </div>
                <button
                  className={`rounded-md border px-3 py-1 text-xs transition-all ${
                    scene?.voiceover_id === f.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/60"
                  }`}
                  onClick={() => onSelect(f.id)}
                >
                  {scene?.voiceover_id === f.id ? "Active" : "Select"}
                </button>
              </div>
              {f.url && (
                <div className="rounded-lg bg-muted p-3">
                  <audio
                    controls
                    className="w-full"
                    src={f.url}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Нет voiceover файлов
          </div>
        )}
      </div>
    </div>
  );
}
