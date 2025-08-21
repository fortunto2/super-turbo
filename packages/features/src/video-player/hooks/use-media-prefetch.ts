import { FileTypeEnum, ISceneRead } from "@turbo-super/api";
import { useEffect, useMemo, useState } from "react";
import { prefetch } from "remotion";

export type MediaPrefetchFileType = {
  url: string;
  type: FileTypeEnum;
};

type Props = {
  files?: MediaPrefetchFileType[];
  cleanable?: boolean;
};

export const useMediaPrefetch = ({ files, cleanable = false }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState<{
    totalBytes: number;
    loadedBytes: number;
  }>({ totalBytes: 0, loadedBytes: 0 });

  useEffect(() => {
    if (!files || files.length === 0) return;

    let isCancelled = false;
    let totalBytes = 0;
    let loadedBytes = 0;

    const cleanupResources = () => {
      files.forEach((file) => {
        const { free } = prefetch(file.url);
        free();
      });
      setLoaded(false);
    };

    const prefetchPromises = files.map((file) => {
      const contentType = mediaTypeMap[file.type] || "application/octet-stream";
      const { free, waitUntilDone } = prefetch(file.url, {
        contentType,
        onProgress: (bytes) => {
          if (bytes.totalBytes) totalBytes = bytes.totalBytes;
          if (bytes.loadedBytes > progress.loadedBytes) {
            loadedBytes = bytes.loadedBytes;
            setProgress({ loadedBytes, totalBytes });
          }
        },
      });

      return waitUntilDone()
        .then(() => {
          if (isCancelled) free();
          return file.url;
        })
        .catch((error: unknown) => {
          console.error(`Failed to preload file: ${file.url}`, error);
        });
    });

    Promise.all(prefetchPromises)
      .then(() => {
        if (!isCancelled) setLoaded(true);
      })
      .catch((error: unknown) => {
        console.error("Failed to preload media files", error);
      });

    return () => {
      isCancelled = true;
      if (cleanable) cleanupResources();
    };
  }, [files, cleanable]);

  const progressValue = useMemo(
    () =>
      progress.totalBytes
        ? Math.floor((progress.loadedBytes / progress.totalBytes) * 100)
        : 0,
    [progress]
  );

  return {
    loaded,
    progress: progressValue,
  };
};

const mediaTypeMap = {
  [FileTypeEnum.IMAGE]: "image/webp",
  [FileTypeEnum.VIDEO]: "video/mp4",
  [FileTypeEnum.VOICEOVER]: "audio/mpeg",
  [FileTypeEnum.SOUND_EFFECT]: "audio/mpeg",
  [FileTypeEnum.AUDIO]: "audio/mpeg",
  [FileTypeEnum.MUSIC]: "audio/mpeg",
  [FileTypeEnum.TEXT]: "text/plain",
  [FileTypeEnum.OTHER]: "application/octet-stream",
};

export const sceneToMediaFormatting = (scenes?: ISceneRead[]) => {
  if (!scenes) return [];
  const media: MediaPrefetchFileType[] = [];

  for (const scene of scenes) {
    if (scene.file?.url) {
      media.push({
        url: scene.file.url,
        type: scene.file.type,
      });
    }
    if (scene.voiceover?.url) {
      media.push({
        url: scene.voiceover.url,
        type: scene.voiceover.type,
      });
    }
    if (scene.sound_effect?.url) {
      media.push({
        url: scene.sound_effect.url,
        type: scene.sound_effect.type,
      });
    }
  }
  return media;
};
