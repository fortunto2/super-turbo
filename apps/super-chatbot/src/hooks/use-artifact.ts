'use client';

import useSWR from 'swr';
import type { UIArtifact } from '@/components/artifacts/artifact';
import { useCallback, useMemo, useEffect, useRef } from 'react';
import type { UIMessage } from 'ai';
import {
  saveArtifactToStorage,
  loadArtifactFromStorage,
  clearArtifactFromStorage,
  restoreArtifactFromData,
} from '@/lib/utils/artifact-persistence';

export const initialArtifactData: UIArtifact = {
  documentId: 'init',
  content: '',
  kind: 'text',
  title: '',
  status: 'idle',
  isVisible: false,
  boundingBox: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

type Selector<T> = (state: UIArtifact) => T;

export function useArtifactSelector<Selected>(selector: Selector<Selected>) {
  const { data: localArtifact } = useSWR<UIArtifact>('artifact', null, {
    fallbackData: initialArtifactData,
  });

  const selectedValue = useMemo(() => {
    if (!localArtifact) return selector(initialArtifactData);
    return selector(localArtifact);
  }, [localArtifact, selector]);

  return selectedValue;
}

// Простой хук для управления артефактами
export const useArtifact = (chatId?: string, initialMessages?: UIMessage[]) => {
  console.log('🔍 useArtifact hook called with:', {
    chatId,
    initialMessagesLength: initialMessages?.length,
  });

  const { data: localArtifact, mutate: setLocalArtifact } = useSWR<UIArtifact>(
    'artifact',
    null,
    {
      fallbackData: initialArtifactData,
    },
  );

  const artifact = useMemo(() => {
    return localArtifact || initialArtifactData;
  }, [localArtifact]);

  const setArtifact = useCallback(
    (updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => {
      console.log('🔍 setArtifact called with chatId:', chatId);

      setLocalArtifact((currentArtifact) => {
        const artifactToUpdate = currentArtifact || initialArtifactData;

        let newArtifact: UIArtifact;
        if (typeof updaterFn === 'function') {
          newArtifact = updaterFn(artifactToUpdate);
        } else {
          newArtifact = updaterFn;
        }

        // Улучшенное сохранение в localStorage
        if (chatId && typeof window !== 'undefined') {
          console.log('💾 Artifact state changed:', {
            chatId,
            documentId: newArtifact.documentId,
            status: newArtifact.status,
            isVisible: newArtifact.isVisible,
            kind: newArtifact.kind,
          });

          // Сохраняем артефакт если он имеет реальный контент или статус
          const shouldSave =
            newArtifact.documentId !== 'init' ||
            (newArtifact.status !== 'idle' && newArtifact.status !== 'error') ||
            newArtifact.content ||
            newArtifact.title ||
            newArtifact.isVisible;

          if (shouldSave) {
            // Используем утилиту для сохранения
            console.log('💾 Saving artifact to storage:', {
              chatId,
              artifact: newArtifact,
            });
            saveArtifactToStorage(chatId, newArtifact);
          } else {
            // Очищаем только если это действительно инициализация
            console.log(
              '🗑️ Clearing artifact from storage (init state):',
              chatId,
            );
            clearArtifactFromStorage(chatId);
          }
        } else {
          console.log('⚠️ Skipping save - no chatId or window:', {
            chatId,
            hasWindow: typeof window !== 'undefined',
            chatIdType: typeof chatId,
          });
        }

        return newArtifact;
      });
    },
    [setLocalArtifact, chatId],
  );

  const { data: localArtifactMetadata, mutate: setLocalArtifactMetadata } =
    useSWR<any>(
      () =>
        artifact.documentId ? `artifact-metadata-${artifact.documentId}` : null,
      null,
      {
        fallbackData: null,
      },
    );

  // Улучшенное восстановление при загрузке чата
  // ВАЖНО: Используем ref для отслеживания первого рендера
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    console.log('🔍 useArtifact useEffect triggered:', {
      chatId,
      isFirstRender: isFirstRenderRef.current,
      window: typeof window,
      chatIdType: typeof chatId,
    });

    // Только восстанавливаем при первом рендере для данного chatId
    // Это предотвращает перезапись состояния при последующих обновлениях
    if (!isFirstRenderRef.current) {
      console.log('🔍 Skipping restoration - not first render');
      return;
    }

    if (chatId && typeof window !== 'undefined') {
      console.log('🔍 Loading artifact from storage for chatId:', chatId);
      const savedData = loadArtifactFromStorage(chatId);
      console.log('🔍 Loaded data from storage:', savedData);

      if (savedData) {
        // ВАЖНО: Если артефакт был скрыт (isVisible: false), НЕ восстанавливаем его
        // Пользователь специально закрыл его
        // Исключение: если статус 'streaming' или 'pending', восстанавливаем
        if (!savedData.isVisible && savedData.status !== 'streaming' && savedData.status !== 'pending') {
          console.log('🔍 Skipping restore - artifact was closed by user');
          clearArtifactFromStorage(chatId);
          return;
        }

        // Определяем, нужно ли восстанавливать артефакт
        const shouldRestore =
          savedData.isVisible ||
          savedData.status === 'streaming' ||
          savedData.status === 'pending';

        console.log('🔍 Should restore artifact:', shouldRestore, {
          documentId: savedData.documentId,
          isVisible: savedData.isVisible,
          status: savedData.status,
        });

        if (shouldRestore) {

          console.log('🔄 Restoring artifact:', {
            ...savedData,
            content: savedData.content
              ? `${savedData.content.substring(0, 100)}...`
              : 'empty',
          });

          const restoredArtifact = restoreArtifactFromData(savedData);
          setLocalArtifact((draft) => {
            console.log('🔍 Setting restored artifact:', restoredArtifact);
            return {
              ...draft,
              ...restoredArtifact,
              boundingBox: draft?.boundingBox || {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
              },
            };
          });
        } else {
          // Очищаем неактивные артефакты
          console.log('🗑️ Clearing inactive artifact for chatId:', chatId);
          clearArtifactFromStorage(chatId);
        }
      } else {
        console.log('🔍 No saved data found for chatId:', chatId);
      }

      // Помечаем, что первый рендер завершен
      isFirstRenderRef.current = false;
    } else {
      console.log('🔍 Skipping restoration - no chatId or window:', {
        chatId,
        hasWindow: typeof window !== 'undefined',
        chatIdType: typeof chatId,
      });
    }
  }, [chatId, setLocalArtifact]);

  // Сбрасываем флаг при смене chatId
  useEffect(() => {
    isFirstRenderRef.current = true;
  }, [chatId]);

  // Expose artifact globally for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).artifactInstance = {
        artifact,
        setArtifact,
        metadata: localArtifactMetadata,
        setMetadata: setLocalArtifactMetadata,
      };
    }
  }, [artifact, setArtifact, localArtifactMetadata, setLocalArtifactMetadata]);

  const updateMessages = useCallback(
    (newMessages: UIMessage[]) => {
      console.log('🔍 updateMessages called with:', {
        messagesCount: newMessages.length,
        chatId,
      });

      // AI SDK v5: Отслеживаем tool invocations в message.parts
      const lastMessage = newMessages[newMessages.length - 1];
      if (!lastMessage || lastMessage.role !== 'assistant') {
        console.log('🔍 No assistant message to process');
        return;
      }

      console.log('🔍 Checking last assistant message:', {
        id: lastMessage.id,
        partsCount: lastMessage.parts?.length || 0,
      });

      // Логируем все parts для отладки
      console.log(
        '🔍 Message parts:',
        lastMessage.parts?.map((part: any) => ({
          type: part.type,
          state: part.state,
          hasOutput: !!part.output,
        })),
      );

      // AI SDK v5: Ищем tool invocations с createDocument или tool outputs с documentId
      // В v5 createDocument может быть вызван внутри другого tool на сервере

      // Сначала ищем прямой вызов createDocument
      // AI SDK v5: После нормализации может быть как "tool-createDocument" так и "tool-call"
      let createDocumentPart = lastMessage.parts?.find((part: any) => {
        if (part.state !== 'output-available') return false;

        // Проверяем tool-specific тип
        if (part.type === 'tool-createDocument') return true;

        // Проверяем generic tool-call с toolName
        if (part.type === 'tool-call') {
          const toolName = part.toolName || part.toolCallId;
          return toolName?.includes('createDocument');
        }

        return false;
      });

      // Если не нашли прямой вызов, ищем в outputs других tools (configureImageGeneration, configureVideoGeneration)
      if (!createDocumentPart) {
        // AI SDK v5: После нормализации tool-specific типы становятся "tool-call"
        // Проверяем tool-call с toolName или ищем по tool-specific типу
        const toolPart = lastMessage.parts?.find((part: any) => {
          if (part.state !== 'output-available') return false;

          // Проверяем generic tool-call с toolName
          if (part.type === 'tool-call') {
            const toolName = part.toolName || part.toolCallId;
            return (
              toolName?.includes('ImageGeneration') ||
              toolName?.includes('VideoGeneration') ||
              toolName === 'falVideoGeneration' || // Explicit check for Fal.ai video generation
              toolName?.includes('ScriptGeneration') ||
              toolName?.includes('createDocument')
            );
          }

          // Или tool-specific тип (для обратной совместимости)
          return (
            part.type === 'tool-configureImageGeneration' ||
            part.type === 'tool-configureVideoGeneration' ||
            part.type === 'tool-configureScriptGeneration' ||
            part.type === 'tool-createDocument'
          );
        });

        if (toolPart) {
          console.log('🎯 Found tool with potential artifact:', {
            toolType: toolPart.type,
            toolName: (toolPart as any).toolName || (toolPart as any).toolCallId,
            output: (toolPart as any).output,
          });

          // AI SDK v5: Check if artifact is in output.parts[0] (nested structure)
          const artifactData = (toolPart as any).output?.parts?.[0] || (toolPart as any).output;

          console.log('🔍 Checking artifact data:', {
            hasId: !!artifactData?.id,
            hasArtifactId: !!artifactData?.artifactId,
            hasKind: !!artifactData?.kind,
            kind: artifactData?.kind,
            id: artifactData?.id,
            artifactId: artifactData?.artifactId,
          });

          // Check for both id and artifactId (different tools use different field names)
          const documentId = artifactData?.id || artifactData?.artifactId;

          if (documentId && artifactData.kind) {
            console.log('✅ Found artifact data:', {
              ...artifactData,
              documentId,
            });
            // Normalize to always use 'id' field
            createDocumentPart = {
              ...toolPart,
              output: { ...artifactData, id: documentId },
            } as any;
          } else {
            console.warn('⚠️ Tool part found but missing required fields:', {
              hasDocumentId: !!documentId,
              hasKind: !!artifactData?.kind,
              artifactData,
            });
          }
        }
      }

      if (createDocumentPart) {
        console.log('🎯 Found document/artifact:', createDocumentPart);

        // Открываем артефакт ТОЛЬКО если он еще не был закрыт пользователем
        const output = (createDocumentPart as any).output;
        if (output?.id) {
          console.log('📄 Found artifact in messages:', {
            id: output.id,
            kind: output.kind,
            title: output.title,
          });

          setArtifact((prev) => {
            // Если артефакт с тем же ID уже существует и был закрыт (isVisible: false),
            // НЕ открываем его снова
            if (prev.documentId === output.id && !prev.isVisible) {
              console.log('🔍 Artifact was closed by user, not reopening');
              return prev;
            }

            // Иначе открываем/обновляем артефакт
            console.log('📄 Opening/updating artifact');
            return {
              ...prev,
              documentId: output.id,
              kind: output.kind || 'text',
              title: output.title || '',
              content: output.content || '',
              isVisible: true,
              status: 'streaming',
            };
          });
        }
      } else {
        console.log('🔍 No artifact found in last message');
      }
    },
    [chatId, setArtifact],
  );

  const metadata = localArtifactMetadata || null;

  const setMetadata = useCallback(
    (updaterFn: any | ((currentMetadata: any) => any)) => {
      setLocalArtifactMetadata((currentMetadata: any) => {
        if (typeof updaterFn === 'function') {
          return updaterFn(currentMetadata);
        } else {
          return updaterFn;
        }
      });
    },
    [setLocalArtifactMetadata],
  );

  return useMemo(
    () => ({
      artifact,
      setArtifact,
      metadata,
      setMetadata,
      updateMessages,
    }),
    [artifact, setArtifact, metadata, setMetadata, updateMessages],
  );
};

// Хук для обратной совместимости (без chatId) - просто возвращает useArtifact
export const useArtifactLegacy = (
  chatId?: string,
  initialMessages?: UIMessage[],
) => {
  console.log('🔍 useArtifactLegacy called - using fallback without chatId');
  return useArtifact(chatId, initialMessages);
};

// Хук для использования в компонентах, которые должны использовать контекст
// Используйте useArtifactContext напрямую в компонентах
