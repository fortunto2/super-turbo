"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useArtifact } from "@/hooks/use-artifact";
import type { UIMessage } from "ai";

interface ArtifactContextType {
  artifact: ReturnType<typeof useArtifact>["artifact"];
  setArtifact: ReturnType<typeof useArtifact>["setArtifact"];
  metadata: ReturnType<typeof useArtifact>["metadata"];
  setMetadata: ReturnType<typeof useArtifact>["setMetadata"];
  updateMessages: (messages: UIMessage[]) => void;
  chatId?: string;
}

const ArtifactContext = createContext<ArtifactContextType | null>(null);

interface ArtifactProviderProps {
  children: ReactNode;
  chatId?: string;
  messages?: UIMessage[];
}

export function ArtifactProvider({
  children,
  chatId,
  messages,
}: ArtifactProviderProps) {
  console.log("🔍 ArtifactProvider initialized with:", {
    chatId,
    messagesLength: messages?.length,
  });

  const artifactHook = useArtifact(chatId, messages);

  return (
    <ArtifactContext.Provider value={{ ...artifactHook, chatId }}>
      {children}
    </ArtifactContext.Provider>
  );
}

export function useArtifactContext() {
  const context = useContext(ArtifactContext);
  if (!context) {
    throw new Error(
      "useArtifactContext must be used within an ArtifactProvider"
    );
  }
  return context;
}

// Обратная совместимость - экспортируем хук, который использует контекст
export function useArtifactWithContext() {
  return useArtifactContext();
}
