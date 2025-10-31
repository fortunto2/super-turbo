import { imageWebsocketStore } from '@/artifacts/image/stores/image-websocket-store';

/**
 * Utility to clean up WebSocket connections when switching between chats
 */
let currentChatId: string | null = null;

/**
 * Set the current active chat and cleanup previous connections
 */
export function setActiveChat(chatId: string) {
  if (currentChatId && currentChatId !== chatId) {
    console.log(
      '🧹 ChatWebSocketCleanup: Switching from',
      currentChatId,
      'to',
      chatId,
    );

    // Clean up previous chat connections
    imageWebsocketStore.cleanupProject(currentChatId);

    // Force cleanup if too many handlers are accumulating
    const debugInfo = imageWebsocketStore.getDebugInfo();
    if (debugInfo.totalHandlers > 3) {
      console.log(
        '🧹 ChatWebSocketCleanup: Force cleanup due to handler accumulation',
      );
      imageWebsocketStore.forceCleanup();
    }
  }

  currentChatId = chatId;
}

/**
 * Get the current active chat ID
 */
export function getCurrentChatId(): string | null {
  return currentChatId;
}

/**
 * Cleanup all connections (useful on app unmount)
 */
export function cleanupAll() {
  console.log('🧹 ChatWebSocketCleanup: Cleaning up all connections');
  imageWebsocketStore.forceCleanup();
  currentChatId = null;
}

/**
 * Get debug information about current connections
 */
export function getDebugInfo() {
  return {
    currentChatId,
    websocketInfo: imageWebsocketStore.getDebugInfo(),
  };
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).chatWebSocketCleanup = {
    setActiveChat,
    getCurrentChatId,
    cleanupAll,
    getDebugInfo,
  };
}
