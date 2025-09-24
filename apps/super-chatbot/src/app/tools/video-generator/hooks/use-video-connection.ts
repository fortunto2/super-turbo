/**
 * Хук для управления подключением к WebSocket
 * Вынесен в отдельный файл для лучшей организации кода
 */

import { useState, useCallback, useEffect } from "react";
import { useVideoSSE } from "@/artifacts/video";

export function useVideoConnection(projectId?: string) {
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");

  const { isConnected, disconnect } = useVideoSSE({
    projectId: projectId || "",
    eventHandlers: [],
    enabled: !!projectId,
  });

  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("connected");
    } else {
      setConnectionStatus("disconnected");
    }
  }, [isConnected]);

  const disconnectFromProject = useCallback(async () => {
    try {
      disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    disconnectFromProject,
  };
}
