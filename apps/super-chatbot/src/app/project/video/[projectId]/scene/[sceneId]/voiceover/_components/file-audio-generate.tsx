"use client";

import { useMemo, useState } from "react";
import { useFileGenerateAudio, useSceneGetById } from "@/lib/api";

import { AudioTypeEnum, type IFileRead } from "@turbo-super/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
} from "@turbo-super/ui";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { VoiceSelect } from "./voice-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const FileAudioGenerate = ({
  sceneId,
  projectId,
  onComplete,
  type,
}: {
  sceneId: string;
  projectId: string;
  onComplete: (file: IFileRead) => void;
  type: AudioTypeEnum;
}) => {
  const { data: scene } = useSceneGetById({ id: sceneId });
  const { mutateAsync, isPending } = useFileGenerateAudio();

  const initialValue = useMemo(() => {
    return scene?.voiceover?.audio_generation ?? undefined;
  }, [scene]);

  const [prompt, setPrompt] = useState<string>(initialValue?.prompt ?? "");
  const [voiceName, setVoiceName] = useState<string>(
    initialValue?.voice_name ?? ""
  );
  const [duration, setDuration] = useState<number>(
    initialValue?.duration ?? 10
  );

  const handleGenerate = async (params: {
    prompt?: string;
    voice_name?: string | null;
    duration?: number;
  }) => {
    try {
      const file: IFileRead = await mutateAsync({
        requestBody: {
          project_id: projectId,
          scene_id: sceneId,
          config: {
            ...(initialValue ?? {}),
            type,
            prompt: params.prompt ?? initialValue?.prompt ?? "",
            voice_name: params.voice_name ?? initialValue?.voice_name ?? null,
            duration: params.duration ?? initialValue?.duration ?? 10,
          },
        },
      });
      if (file) await onComplete(file);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="size-full grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vo-prompt">Prompt</Label>
            <EnhancedTextarea
              id="vo-prompt"
              placeholder={`Describe the audio to generate...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              fullscreenTitle="Voiceover Prompt"
            />
          </div>

          <div className="size-full flex md:grid-cols-2 gap-4">
            {type === AudioTypeEnum.VOICEOVER && (
              <VoiceSelect
                value={voiceName || null}
                onChange={(v) => setVoiceName(v ?? "")}
              />
            )}
            {type === AudioTypeEnum.SOUND_EFFECT && (
              <div className="space-y-2 w-full ">
                <Label htmlFor="vo-duration">Duration (sec)</Label>
                <Select
                  value={String(duration)}
                  onValueChange={(v) => setDuration(Number(v))}
                >
                  <SelectTrigger className="w-full ">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                      <SelectItem
                        key={v}
                        value={String(v)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs">{v}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              onClick={() =>
                handleGenerate({
                  prompt,
                  voice_name: voiceName || null,
                  duration,
                })
              }
              disabled={isPending}
            >
              {isPending ? "Generating..." : "Generate Audio"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scene?.voiceover?.audio_generation?.voice_name && (
            <div className="text-sm text-muted-foreground">
              Active voice: {scene.voiceover.audio_generation.voice_name}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Tip: For better results, write clear prompts and specify tone (e.g.,
            &quot;warm, calm, narrator&quot;).
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
