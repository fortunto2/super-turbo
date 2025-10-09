'use client';

import { useState, useEffect } from 'react';
import { Button } from '@turbo-super/ui';
import {
  getAllSavedArtifacts,
  loadArtifactFromStorage,
  clearArtifactFromStorage,
  type SavedArtifactData,
} from '@/lib/utils/artifact-persistence';
import { useArtifactContext } from '@/contexts/artifact-context';

interface ArtifactManagerProps {
  chatId: string;
  className?: string;
}

export function ArtifactManager({ chatId, className }: ArtifactManagerProps) {
  const { setArtifact } = useArtifactContext();
  const [savedArtifacts, setSavedArtifacts] = useState<
    Array<{ chatId: string; data: SavedArtifactData }>
  >([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const artifacts = getAllSavedArtifacts();
    setSavedArtifacts(artifacts);
  }, []);

  const handleRestoreArtifact = (artifactChatId: string) => {
    const data = loadArtifactFromStorage(artifactChatId);
    if (data) {
      // Восстанавливаем артефакт
      setArtifact((current) => ({
        ...current,
        documentId: data.documentId,
        kind: data.kind as any,
        status: data.status,
        isVisible: true, // Принудительно показываем
        title: data.title,
        content: data.content,
        timestamp: data.timestamp,
      }));

      console.log('🔄 Restored artifact:', {
        chatId: artifactChatId,
        documentId: data.documentId,
        status: data.status,
      });
    }
  };

  const handleClearArtifact = (artifactChatId: string) => {
    clearArtifactFromStorage(artifactChatId);
    setSavedArtifacts((prev) =>
      prev.filter((a) => a.chatId !== artifactChatId),
    );
    console.log('🗑️ Cleared artifact:', artifactChatId);
  };

  const currentChatArtifacts = savedArtifacts.filter(
    (a) => a.chatId === chatId,
  );
  const otherChatArtifacts = savedArtifacts.filter((a) => a.chatId !== chatId);

  if (savedArtifacts.length === 0) {
    return null;
  }

  return (
    <div className={`border rounded-lg bg-muted/50 ${className}`}>
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Artifact Manager</h3>
          <span className="text-xs text-muted-foreground">
            ({savedArtifacts.length} total)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="h-6 px-2 text-xs"
        >
          {isVisible ? '▼' : '▶'}
        </Button>
      </div>

      {isVisible && (
        <div className="border-t p-2 space-y-2 max-h-40 overflow-y-auto">
          {/* Артефакты текущего чата */}
          {currentChatArtifacts.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1">Текущий чат:</h4>
              {currentChatArtifacts.map(({ chatId: artifactChatId, data }) => (
                <div
                  key={artifactChatId}
                  className="flex items-center justify-between p-1 bg-background rounded text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {data.title || `${data.kind} artifact`}
                    </div>
                    <div className="text-muted-foreground">
                      {data.status} •{' '}
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreArtifact(artifactChatId)}
                      className="h-5 px-1 text-xs"
                    >
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClearArtifact(artifactChatId)}
                      className="h-5 px-1 text-xs text-destructive"
                    >
                      Del
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Артефакты других чатов */}
          {otherChatArtifacts.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1">Другие чаты:</h4>
              {otherChatArtifacts.map(({ chatId: artifactChatId, data }) => (
                <div
                  key={artifactChatId}
                  className="flex items-center justify-between p-1 bg-background rounded text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {data.title || `${data.kind} artifact`}
                    </div>
                    <div className="text-muted-foreground">
                      {artifactChatId.substring(0, 8)}... • {data.status}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreArtifact(artifactChatId)}
                      className="h-5 px-1 text-xs"
                    >
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClearArtifact(artifactChatId)}
                      className="h-5 px-1 text-xs text-destructive"
                    >
                      Del
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
