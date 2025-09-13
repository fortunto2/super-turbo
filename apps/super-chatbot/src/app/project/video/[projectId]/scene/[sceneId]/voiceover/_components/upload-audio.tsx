"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/ai/api/upload-file";
import { Button } from "@turbo-super/ui";
import type { FileTypeEnum, IFileRead } from "@turbo-super/api";

export function UploadAudio({
  projectId,
  sceneId,
  onUploaded,
  type,
}: {
  projectId: string;
  sceneId: string;
  onUploaded: (file: IFileRead) => void;
  type: FileTypeEnum.VOICEOVER | FileTypeEnum.SOUND_EFFECT;
}) {
  const [pending, setPending] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPending(true);
      const res = await uploadFile(file, type);
      if (res?.id) onUploaded(res as unknown as IFileRead);
    } finally {
      setPending(false);
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
        id="voiceover-upload-input"
      />
      <label htmlFor="voiceover-upload-input">
        <Button
          disabled={pending}
          asChild
        >
          <span>{pending ? "Uploading..." : "Upload Own Audio"}</span>
        </Button>
      </label>
    </div>
  );
}
