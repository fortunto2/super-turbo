// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  id?: string;
}

export interface WebSocketEvent {
  type: "open" | "message" | "close" | "error";
  data?: any;
  error?: Event;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
}
