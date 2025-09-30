import { getVideoGenerationConfig } from "@/lib/config/media-settings-factory";
import {
  type GenerationSourceEnum,
  GenerationTypeEnum,
} from "@turbo-super/api";
import { Card, CardContent, CardHeader, CardTitle } from "@turbo-super/ui";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNextGenerateVideo } from "@/lib/api";

type IGenerationConfigRead = {
  name: string;
  label?: string | null;
  type: GenerationTypeEnum;
  source: GenerationSourceEnum;
  params: Record<string, any>;
};

export function AnimatingTool({
  sceneId,
  projectId,
  imageUrl,
  onStarted,
}: {
  sceneId: string;
  projectId: string;
  imageUrl?: string | null;
  onStarted: (fileId: string) => void;
}) {
  const [models, setModels] = useState<IGenerationConfigRead[]>([]);
  const [model, setModel] = useState<IGenerationConfigRead>();
  const [duration, setDuration] = useState<number>(5);
  const [prompt, setPrompt] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const generateVideoMutation = useNextGenerateVideo();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoadingConfig(true);
        setConfigError(null);

        const videoConfig = await getVideoGenerationConfig();

        const imageToVideoModels = videoConfig.availableModels.filter(
          (m) => m.type === GenerationTypeEnum.IMAGE_TO_VIDEO
        );
        setModel(imageToVideoModels[0]);
        setModels(imageToVideoModels);
      } catch (error) {
        console.error("🎬 ❌ Failed to load configuration:", error);
        setConfigError(
          error instanceof Error
            ? error.message
            : "Failed to load configuration"
        );
        toast.error("Failed to load video generation models");
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadConfig();
  }, []);

  const handleGenerate = async () => {
    if (!imageUrl) return;
    try {
      setIsSubmitting(true);
      setError(null);

      // Скачаем исходное изображение и отправим как файл
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();
      const file = new File([blob], `scene-${sceneId}.jpg`, {
        type: blob.type || "image/jpeg",
      });

      const form = new FormData();
      form.append("prompt", prompt || "Animate this image");
      form.append("model", model?.name || "veo3");
      form.append("resolution", "1280x720 (HD)");
      form.append("style", "base");
      form.append("shotSize", "medium_shot");
      form.append("duration", String(duration));
      form.append("frameRate", String(30));
      form.append("generationType", "image-to-video");
      form.append("file", file);
      form.append("projectId", projectId);
      form.append("sceneId", sceneId);

      const json = await generateVideoMutation.mutateAsync(form);
      const newFileId = json?.fileId || json?.projectId;
      if (newFileId) onStarted(newFileId);
    } catch (e: any) {
      setError(e?.message || "Generation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Animating </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin" />
            <span className="ml-2">Loading video generation models...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleChangeModel = (name: string) => {
    const selectedOption = models.find((m) => m.name === name);
    setModel(selectedOption);
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 text-sm font-medium text-muted-foreground">
        Animating
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="space-y-1 md:col-span-3">
          <label
            htmlFor="animation-prompt"
            className="text-xs text-muted-foreground"
          >
            Prompt
          </label>
          <input
            id="animation-prompt"
            type="text"
            placeholder="Describe the animation..."
            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="model-select"
            className="text-xs text-muted-foreground"
          >
            Model
          </label>
          <select
            id="model-select"
            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            value={model?.name}
            onChange={(e) => handleChangeModel(e.target.value)}
          >
            {models.length === 0 ? (
              <option value="Veo3">Veo3</option>
            ) : (
              models.map((m) => (
                <option
                  key={m.name}
                  value={m.name}
                >
                  {m.label || m.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="duration-select"
            className="text-xs text-muted-foreground"
          >
            Duration (sec)
          </label>
          <select
            id="duration-select"
            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
            value={String(duration)}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {(
              model?.params?.available_durations || [3, 5, 8, 10, 15, 20, 30]
            ).map((d: number) => (
              <option
                key={d}
                value={String(d)}
              >
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            className="inline-flex items-center px-4 h-10 rounded-md border bg-primary text-primary-foreground text-sm disabled:opacity-50"
            onClick={handleGenerate}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
      {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
    </div>
  );
}
