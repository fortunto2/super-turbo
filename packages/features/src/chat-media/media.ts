// Chat Media functions

import type {
  MediaAttachment,
  ChatMessage,
  MediaSaveOptions,
  MediaTypeConfig,
  MediaSaveResult,
  MessageUpdater,
} from "./types";

// Utility function to generate UUID (placeholder - should be imported from utils)
function generateUUID(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const mediaType: MediaTypeConfig = {
  image: "image/webp",
  video: "video/mp4",
};

export const saveImageToChat = async (
  chatId: string,
  imageUrl: string,
  prompt: string,
  setMessages: MessageUpdater<any>,
  thumbnailUrl?: string
): Promise<MediaSaveResult> => {
  if (!setMessages || !chatId) {
    return { success: false, error: "Missing required parameters" };
  }

  let alreadyExists = false;
  setMessages((prev) => {
    alreadyExists = prev.some((msg) =>
      msg.experimental_attachments?.some(
        (att: MediaAttachment) => att.url === imageUrl
      )
    );
    return prev;
  });

  if (alreadyExists) {
    return { success: false, duplicate: true };
  }

  const message: ChatMessage = {
    id: generateUUID(),
    role: "assistant",
    parts: [{ type: "text", text: "" }],
    experimental_attachments: [
      {
        name: prompt.length > 50 ? `${prompt.slice(0, 50)}...` : prompt,
        url: imageUrl,
        contentType: "image/webp",
        thumbnailUrl: thumbnailUrl,
      },
    ],
    createdAt: new Date(),
  };

  setMessages((prev) => [...prev, message]);

  try {
    const response = await fetch("/api/save-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message }),
    });

    if (response.ok) {
      return { success: true, messageId: message.id };
    } else {
      return { success: false, error: "Failed to save message" };
    }
  } catch (e) {
    console.warn("❌ Failed to persist image to DB", e);
    return { success: false, error: "Network error" };
  }
};

export const saveMediaToChat = async (
  chatId: string,
  mediaUrl: string,
  prompt: string,
  setMessages: MessageUpdater<any>,
  type: "image" | "video",
  thumbnailUrl?: string
): Promise<MediaSaveResult> => {
  try {
    // Check for duplicates
    let mediaExists = false;
    setMessages((prevMessages: ChatMessage[]) => {
      mediaExists = prevMessages.some((message) =>
        message.experimental_attachments?.some(
          (attachment: MediaAttachment) => attachment.url === mediaUrl
        )
      );
      return prevMessages;
    });

    if (mediaExists) {
      console.log(`🎬 ${type} already exists in chat, skipping duplicate save`);
      return { success: false, duplicate: true };
    }

    const mediaAttachment: MediaAttachment = {
      name: prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt,
      url: mediaUrl,
      contentType: mediaType[type],
      thumbnailUrl: thumbnailUrl,
    };

    const mediaMessage: ChatMessage = {
      id: generateUUID(),
      role: "assistant",
      content: ``,
      parts: [
        {
          type: "text",
          text: ``,
        },
      ],
      experimental_attachments: [mediaAttachment],
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, mediaMessage]);

    try {
      const response = await fetch("/api/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message: mediaMessage }),
      });

      if (response.ok) {
        return { success: true, messageId: mediaMessage.id };
      } else {
        return { success: false, error: "Failed to save message" };
      }
    } catch (e) {
      console.warn(`❌ Failed to persist ${type} to DB`, e);
      return { success: false, error: "Network error" };
    }
  } catch (error) {
    console.error(`Error saving ${type} to chat:`, error);
    return { success: false, error: "Unknown error" };
  }
};

export const saveVideoToChat = async (
  chatId: string,
  videoUrl: string,
  prompt: string,
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void,
  thumbnailUrl?: string
): Promise<MediaSaveResult> => {
  return saveMediaToChat(
    chatId,
    videoUrl,
    prompt,
    setMessages,
    "video",
    thumbnailUrl
  );
};

export const saveArtifactToChat = async (
  chatId: string,
  artifactUrl: string,
  prompt: string,
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void,
  type: "image" | "video" = "image",
  thumbnailUrl?: string
): Promise<MediaSaveResult> => {
  return saveMediaToChat(
    chatId,
    artifactUrl,
    prompt,
    setMessages,
    type,
    thumbnailUrl
  );
};

export const checkMediaExists = (
  messages: ChatMessage[],
  mediaUrl: string
): boolean => {
  return messages.some((message) =>
    message.experimental_attachments?.some(
      (attachment: MediaAttachment) => attachment.url === mediaUrl
    )
  );
};

export const getMediaAttachments = (
  messages: ChatMessage[]
): MediaAttachment[] => {
  const attachments: MediaAttachment[] = [];

  messages.forEach((message) => {
    if (message.experimental_attachments) {
      attachments.push(...message.experimental_attachments);
    }
  });

  return attachments;
};
