import { memo } from 'react';
import { CrossIcon } from '../';
import { initialArtifactData, useArtifactLegacy } from '@/hooks/use-artifact';
import { useArtifactContext } from '@/contexts/artifact-context';
import {
  saveArtifactToStorage,
  clearArtifactFromStorage,
} from '@/lib/utils/artifact-persistence';

import { Button } from '@turbo-super/ui';
function PureArtifactCloseButton() {
  // Всегда вызываем оба хука
  const legacy = useArtifactLegacy();

  // Пытаемся использовать контекст, если доступен
  let setArtifact: any;
  let chatId: string | undefined;

  try {
    const context = useArtifactContext();
    setArtifact = context.setArtifact;
    chatId = context.chatId;
  } catch {
    // Fallback на legacy хук
    console.log('🔍 ArtifactCloseButton: Context not available, using legacy');
    setArtifact = legacy.setArtifact;
  }

  return (
    <Button
      data-testid="artifact-close-button"
      variant="outline"
      className="h-fit p-2 dark:hover:bg-zinc-700"
      onClick={() => {
        setArtifact((currentArtifact: any) => {
          if (currentArtifact.status === 'streaming') {
            // Если генерация в процессе, скрываем но сохраняем
            return {
              ...currentArtifact,
              isVisible: false,
            };
          } else {
            // Если генерация завершена, полностью сбрасываем
            return { ...initialArtifactData, status: 'idle' };
          }
        });

        // Умная очистка localStorage
        if (chatId && typeof window !== 'undefined') {
          const currentArtifact = (window as any).artifactInstance?.artifact;
          if (currentArtifact && currentArtifact.status === 'streaming') {
            // Для активных генераций сохраняем скрытое состояние
            const hiddenArtifact = {
              ...currentArtifact,
              isVisible: false, // Помечаем как скрытый
            };
            saveArtifactToStorage(chatId, hiddenArtifact);
          } else {
            // Для завершенных артефактов полностью очищаем
            clearArtifactFromStorage(chatId);
          }
        }
      }}
    >
      <CrossIcon size={18} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);
