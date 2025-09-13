"use client";

import { useEffect, useState } from "react";
import { Download, Pause, Play } from "lucide-react";
import { useCustomAudio } from "@/hooks/use-audio";
import { cn } from "@turbo-super/ui";

type Props = {
  src?: string | null;
  allowDownload?: boolean;
};

export const AudioPlayer = ({ src, allowDownload }: Props) => {
  const { audioRef, isPlaying, play, pause, time, duration } =
    useCustomAudio(src);

  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    pause(); // остановить воспроизведение при смене src
  }, [src, pause]);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isPlaying ? pause() : play();
  };

  const handleDownload = async () => {
    if (!src) return;
    try {
      setIsDownloading(true);
      const response = await fetch(src);
      if (!response.ok) throw new Error("Failed to download audio");

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = src;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading audio:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <button
        className={cn(
          "p-2 rounded-md border border-gray-300  disabled:opacity-50"
        )}
        onClick={handleToggle}
        disabled={!src}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
        <audio
          ref={audioRef}
          style={{ display: "none" }}
        />
      </button>

      {allowDownload && (
        <button
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          onClick={handleDownload}
          disabled={!src || isDownloading}
          aria-label="Download audio"
        >
          {isDownloading ? (
            <span className="inline-block w-5 h-5 animate-spin border-2 border-gray-300 border-t-transparent rounded-full" />
          ) : (
            <Download className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
};
