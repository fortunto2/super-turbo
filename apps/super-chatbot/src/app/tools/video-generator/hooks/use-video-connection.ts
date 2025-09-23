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

  const { isConnected, connect, disconnect, sendMessage } =
    useVideoSSE(projectId);

  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("connected");
    } else {
      setConnectionStatus("disconnected");
    }
  }, [isConnected]);

  const connectToProject = useCallback(
    async (targetProjectId: string) => {
      setConnectionStatus("connecting");
      try {
        await connect(targetProjectId);
      } catch (error) {
        console.error("Failed to connect to project:", error);
        setConnectionStatus("disconnected");
      }
    },
    [connect]
  );

  const disconnectFromProject = useCallback(async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    connectToProject,
    disconnectFromProject,
    sendMessage,
  };
}
