import { Plus, CircleSlash2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface EmptyAudioFileProps {
  onSelect: () => void;
  isActive: boolean;
  onCreateAudio?: () => void;
  isPending?: boolean;
}

export function EmptyAudioFile({
  onSelect,
  isActive,
  onCreateAudio,
  isPending,
}: EmptyAudioFileProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleSelect = async () => {
    if (isPending || isCreating || isActive) return; // Блокируем повторный выбор активного элемента
    try {
      await onSelect();
    } catch (error) {
      console.error('Error selecting empty audio:', error);
    }
  };
  const handleCreateAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isCreating || !onCreateAudio) return; // Убираем isPending из блокировки

    setIsCreating(true);
    try {
      await onCreateAudio();
    } catch (error) {
      console.error('Error creating audio:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const isLoading = isPending || isCreating;
  const isDisabled = isLoading || isActive;

  return (
    <div
      className="group relative aspect-video max-w-[300px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={handleSelect}
        disabled={isDisabled}
        className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-lg border-2 transition-all duration-200 ${
          isActive
            ? 'border-primary bg-primary/5 ring-2 ring-primary hover:bg-primary/10 hover:ring-primary/80'
            : 'border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/20'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {/* Иконка типа файла */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full mb-6 transition-all duration-200 ${
            isActive
              ? 'bg-primary/20 group-hover:bg-primary/30'
              : 'bg-muted/20 group-hover:bg-muted/30'
          }`}
        >
          <CircleSlash2
            className={`size-6 transition-colors duration-200 ${
              isActive
                ? 'text-primary group-hover:text-primary/80'
                : 'text-muted-foreground group-hover:text-foreground'
            }`}
          />
        </div>

        {/* Текст под кнопкой */}
        <div className="mt-3 text-center">
          <p
            className={`text-xs transition-colors duration-200 ${
              isActive
                ? 'text-primary group-hover:text-primary/80'
                : 'text-muted-foreground group-hover:text-foreground'
            }`}
          >
            {isCreating ? 'Creating...' : 'No audio selected'}
          </p>
        </div>

        {/* Overlay при hover */}
        {hovered && !isDisabled && (
          <div className="absolute inset-0 bg-black/5 transition-opacity duration-200" />
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-200">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {isCreating ? 'Creating audio...' : 'Processing...'}
              </p>
            </div>
          </div>
        )}
      </button>

      {/* Кнопка создания аудио - отдельно от основной кнопки */}
      <button
        onClick={handleCreateAudio}
        disabled={isCreating}
        className={`absolute bottom-4 right-4 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 z-30 ${
          isCreating
            ? 'bg-muted/50 cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110 hover:shadow-lg shadow-md'
        }`}
        title={isCreating ? 'Creating audio...' : 'Create new audio'}
      >
        {isCreating ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Plus className="size-5 transition-transform duration-200 hover:rotate-90" />
        )}
      </button>

      {/* Индикатор активного состояния */}
      {isActive && !isLoading && (
        <div className="absolute top-1 left-1 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg z-20">
          <div className="w-2 h-2 bg-current rounded-full" />
        </div>
      )}
    </div>
  );
}
