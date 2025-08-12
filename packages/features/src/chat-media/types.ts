// Chat Media types

export interface MediaAttachment {
  name: string;
  url: string;
  contentType: string;
  thumbnailUrl?: string;
}

// Compatible with AI SDK types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "data";
  parts: Array<{
    type: "text" | "image" | "video";
    text?: string;
    url?: string;
  }>;
  experimental_attachments?: MediaAttachment[];
  createdAt: Date;
  content?: string;
}

// Generic message updater function type
export type MessageUpdater<T> = (updater: (prev: T[]) => T[]) => void;

export interface MediaSaveOptions {
  chatId: string;
  mediaUrl: string;
  prompt: string;
  setMessages: MessageUpdater<any>; // Make it generic
  thumbnailUrl?: string;
  type?: "image" | "video";
}

export interface MediaTypeConfig {
  image: string;
  video: string;
}

export interface MediaSaveResult {
  success: boolean;
  messageId?: string;
  error?: string;
  duplicate?: boolean;
}
