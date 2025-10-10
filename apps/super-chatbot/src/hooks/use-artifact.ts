"use client";

import useSWR from "swr";
import type { UIArtifact } from "@/components/artifacts/artifact";
import { useCallback, useMemo, useEffect } from "react";
import type { UIMessage } from "ai";
import {
  saveArtifactToStorage,
  loadArtifactFromStorage,
  clearArtifactFromStorage,
  restoreArtifactFromData,
} from "@/lib/utils/artifact-persistence";

export const initialArtifactData: UIArtifact = {
  documentId: "init",
  content: "",
  kind: "text",
  title: "",
  status: "idle",
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
  const { data: localArtifact } = useSWR<UIArtifact>("artifact", null, {
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
  console.log("🔍 useArtifact hook called with:", {
    chatId,
    initialMessagesLength: initialMessages?.length,
  });

  const { data: localArtifact, mutate: setLocalArtifact } = useSWR<UIArtifact>(
    "artifact",
    null,
    {
      fallbackData: initialArtifactData,
    }
  );

  const artifact = useMemo(() => {
    return localArtifact || initialArtifactData;
  }, [localArtifact]);

  const setArtifact = useCallback(
    (updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => {
      console.log("🔍 setArtifact called with chatId:", chatId);

      setLocalArtifact((currentArtifact) => {
        const artifactToUpdate = currentArtifact || initialArtifactData;

        let newArtifact: UIArtifact;
        if (typeof updaterFn === "function") {
          newArtifact = updaterFn(artifactToUpdate);
        } else {
          newArtifact = updaterFn;
        }

        // Улучшенное сохранение в localStorage
        if (chatId && typeof window !== "undefined") {
          console.log("💾 Artifact state changed:", {
            chatId,
            documentId: newArtifact.documentId,
            status: newArtifact.status,
            isVisible: newArtifact.isVisible,
            kind: newArtifact.kind,
          });

          // Сохраняем артефакт если он имеет реальный контент или статус
          const shouldSave =
            newArtifact.documentId !== "init" ||
            (newArtifact.status !== "idle" && newArtifact.status !== "error") ||
            newArtifact.content ||
            newArtifact.title ||
            newArtifact.isVisible;

          if (shouldSave) {
            // Используем утилиту для сохранения
            console.log("💾 Saving artifact to storage:", {
              chatId,
              artifact: newArtifact,
            });
            saveArtifactToStorage(chatId, newArtifact);
          } else {
            // Очищаем только если это действительно инициализация
            console.log(
              "🗑️ Clearing artifact from storage (init state):",
              chatId
            );
            clearArtifactFromStorage(chatId);
          }
        } else {
          console.log("⚠️ Skipping save - no chatId or window:", {
            chatId,
            hasWindow: typeof window !== "undefined",
            chatIdType: typeof chatId,
          });
        }

        return newArtifact;
      });
    },
    [setLocalArtifact, chatId]
  );

  const { data: localArtifactMetadata, mutate: setLocalArtifactMetadata } =
    useSWR<any>(
      () =>
        artifact.documentId ? `artifact-metadata-${artifact.documentId}` : null,
      null,
      {
        fallbackData: null,
      }
    );

  // Улучшенное восстановление при загрузке чата
  useEffect(() => {
    console.log("🔍 useArtifact useEffect triggered:", {
      chatId,
      window: typeof window,
      chatIdType: typeof chatId,
    });

    if (chatId && typeof window !== "undefined") {
      console.log("🔍 Loading artifact from storage for chatId:", chatId);
      const savedData = loadArtifactFromStorage(chatId);
      console.log("🔍 Loaded data from storage:", savedData);

      if (savedData) {
        // Определяем, нужно ли восстанавливать артефакт
        const shouldRestore =
          (savedData.documentId && savedData.documentId !== "init") ||
          savedData.isVisible ||
          savedData.status === "streaming" ||
          savedData.status === "pending" ||
          savedData.status === "completed" ||
          savedData.content ||
          savedData.title;

        console.log("🔍 Should restore artifact:", shouldRestore, {
          documentId: savedData.documentId,
          isVisible: savedData.isVisible,
          status: savedData.status,
        });

        if (shouldRestore) {
          console.log("🔄 Restoring artifact:", {
            ...savedData,
            content: savedData.content
              ? `${savedData.content.substring(0, 100)}...`
              : "empty",
          });

          const restoredArtifact = restoreArtifactFromData(savedData);
          setLocalArtifact((draft) => {
            console.log("🔍 Setting restored artifact:", restoredArtifact);
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
          console.log("🗑️ Clearing inactive artifact for chatId:", chatId);
          clearArtifactFromStorage(chatId);
        }
      } else {
        console.log("🔍 No saved data found for chatId:", chatId);
      }
    } else {
      console.log("🔍 Skipping restoration - no chatId or window:", {
        chatId,
        hasWindow: typeof window !== "undefined",
        chatIdType: typeof chatId,
      });
    }
  }, [chatId, setLocalArtifact]);

  // Expose artifact globally for debugging
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).artifactInstance = {
        artifact,
        setArtifact,
        metadata: localArtifactMetadata,
        setMetadata: setLocalArtifactMetadata,
      };
    }
  }, [artifact, setArtifact, localArtifactMetadata, setLocalArtifactMetadata]);

  const updateMessages = useCallback((newMessages: UIMessage[]) => {
    // Не используется в упрощенной версии
  }, []);

  const metadata = localArtifactMetadata || null;

  const setMetadata = useCallback(
    (updaterFn: any | ((currentMetadata: any) => any)) => {
      setLocalArtifactMetadata((currentMetadata: any) => {
        if (typeof updaterFn === "function") {
          return updaterFn(currentMetadata);
        } else {
          return updaterFn;
        }
      });
    },
    [setLocalArtifactMetadata]
  );

  return useMemo(
    () => ({
      artifact,
      setArtifact,
      metadata,
      setMetadata,
      updateMessages,
    }),
    [artifact, setArtifact, metadata, setMetadata, updateMessages]
  );
};

// Хук для обратной совместимости (без chatId) - просто возвращает useArtifact
export const useArtifactLegacy = (
  chatId?: string,
  initialMessages?: UIMessage[]
) => {
  console.log("🔍 useArtifactLegacy called - using fallback without chatId");
  return useArtifact(chatId, initialMessages);
};

// Хук для использования в компонентах, которые должны использовать контекст
// Используйте useArtifactContext напрямую в компонентах
