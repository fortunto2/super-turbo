import {
  FileTypeEnum,
  type IFileRead,
  type ISceneRead,
} from '@turbo-super/api';
import { FileMetadataModal } from './file-metadata-modal';
import { hasMetadata } from './file-metadata-utils';
import { useMemo, useState } from 'react';
import { Play, Download, Info, MicVocal, AudioLines } from 'lucide-react';
import { useSceneUpdate } from '@/lib/api';

interface AudioFileProps {
  file: IFileRead;
  isActive: boolean;
  scene?: ISceneRead;
}

export function AudioFile({ file, isActive, scene }: AudioFileProps) {
  const { mutate: update, isPending: isSelecting } = useSceneUpdate();

  const type = useMemo(() => {
    return file.type === FileTypeEnum.VOICEOVER ? 'voiceover' : 'soundeffect';
  }, [file.type]);

  const handleSelect = async () => {
    if (!scene) return;
    if (!scene.file_id) return;

    let id:
      | { voiceover_id: string | null }
      | { sound_effect_id: string | null }
      | undefined;
    if (type === 'voiceover') {
      id = { voiceover_id: file?.id ?? null };
    } else if (type === 'soundeffect') {
      id = { sound_effect_id: file?.id ?? null };
    }

    try {
      await update({
        id: scene.id,
        requestBody: {
          ...scene,
          file_id: scene.file_id,
          ...id,
        },
      });
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  };

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
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleDownloadClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (file.url) {
      try {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = `${type}-${file.id}.mp3`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  };

  const getTypeIcon = () => {
    return type === 'voiceover' ? (
      <MicVocal className="w-5 h-5" />
    ) : (
      <AudioLines className="w-5 h-5" />
    );
  };

  if (!file.url) {
    return (
      <div className="animate-pulse rounded-lg border bg-muted flex justify-center items-center aspect-video max-w-[300px]">
        Generating...
      </div>
    );
  }

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
            ? 'border-primary ring-2 ring-primary bg-primary/5'
            : 'border-border hover:border-primary/60 hover:shadow-md bg-muted/20'
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
            disabled={!file.url || isPlaying || isSelecting}
            className="p-2 bg-primary text-primary-foreground rounded-md transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isPlaying ? 'Playing...' : 'Play audio'}
          >
            <Play className="size-5" />
          </button>

          <button
            onClick={handleDownloadClick}
            disabled={!file.url || isSelecting}
            className="p-2 bg-secondary text-secondary-foreground rounded-md transition-all duration-200 hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download audio"
          >
            <Download className="size-5" />
          </button>
        </div>

        {/* Overlay при hover */}
        {hoveredFile === file.id && !isSelecting && (
          <div className="absolute inset-0 bg-black/10 transition-opacity duration-200" />
        )}

        {/* Pending overlay */}
        {isSelecting && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Кнопка выбора - только если не активен */}
      {!isActive && (
        <button
          onClick={handleSelect}
          disabled={isSelecting}
          className={`absolute inset-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity duration-200 z-0 ${isSelecting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
