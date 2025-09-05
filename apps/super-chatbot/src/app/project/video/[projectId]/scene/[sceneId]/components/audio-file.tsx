import type { IFileRead, ISceneRead } from "@turbo-super/api";
import { FileMetadataModal } from "./file-metadata-modal";
import { hasMetadata } from "./file-metadata-utils";
import { useState } from "react";
import { Play, Download, Info, MicVocal, AudioLines } from "lucide-react";

interface AudioFileProps {
  file: IFileRead;
  scene: ISceneRead | null;
  onSelect: (file: IFileRead) => void;
  type: "voiceover" | "soundeffect";
  isActive: boolean;
}

export function AudioFile({
  file,
  scene,
  onSelect,
  type,
  isActive,
}: AudioFileProps) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleInfoClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMetadata(true);
  };

  const handlePlayClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (file.url && !isPlaying) {
      try {
        const audio = new Audio(file.url);
        await audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      }
    }
  };

  const handleDownloadClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (file.url) {
      try {
        const link = document.createElement("a");
        link.href = file.url;
        link.download = `${type}-${file.id}.mp3`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    }
  };

  const getTypeIcon = () => {
    return type === "voiceover" ? (
      <MicVocal className="w-5 h-5" />
    ) : (
      <AudioLines className="w-5 h-5" />
    );
  };

  return (
    <div
      key={file.id}
      className="group relative aspect-video max-w-[300px]"
      onMouseEnter={() => setHoveredFile(file.id)}
      onMouseLeave={() => setHoveredFile(null)}
    >
      <div
        className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-lg border transition-all duration-200 ${
          isActive
            ? "border-primary ring-2 ring-primary bg-primary/5"
            : "border-border hover:border-primary/60 hover:shadow-md bg-muted/20"
        }`}
      >
        {/* Иконка типа файла */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-6">
          {getTypeIcon()}
        </div>

        {/* Кнопки действий - только иконки */}
        <div className="flex gap-4 relative z-10">
          <button
            onClick={handlePlayClick}
            disabled={!file.url || isPlaying}
            className="p-2 bg-primary text-primary-foreground rounded-md transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isPlaying ? "Playing..." : "Play audio"}
          >
            <Play className="size-5" />
          </button>

          <button
            onClick={handleDownloadClick}
            disabled={!file.url}
            className="p-2 bg-secondary text-secondary-foreground rounded-md transition-all duration-200 hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download audio"
          >
            <Download className="size-5" />
          </button>
        </div>

        {/* Overlay при hover */}
        {hoveredFile === file.id && (
          <div className="absolute inset-0 bg-black/10 transition-opacity duration-200" />
        )}
      </div>

      {/* Кнопка выбора - только если не активен */}
      {!isActive && (
        <button
          onClick={() => onSelect(file)}
          className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity duration-200 z-0"
          title="Select this file"
        />
      )}

      {/* Кнопка информации о метаданных - появляется при hover */}
      {hoveredFile === file.id && hasMetadata(file) && (
        <button
          onClick={handleInfoClick}
          className="absolute top-1 right-1 p-1.5 bg-blue-500/90 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-20"
          title="Show metadata"
        >
          <Info className="w-3 h-3" />
        </button>
      )}

      {/* Индикатор активного файла */}
      {isActive && (
        <div className="absolute top-1 left-1 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg z-20">
          <div className="w-2 h-2 bg-current rounded-full" />
        </div>
      )}

      {/* Модальное окно с метаданными */}
      <FileMetadataModal
        file={file}
        isOpen={showMetadata}
        onClose={() => setShowMetadata(false)}
      />
    </div>
  );
}
