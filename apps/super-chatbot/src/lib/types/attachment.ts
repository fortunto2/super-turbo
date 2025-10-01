// AI SDK v5: Attachment type is no longer exported, so we define our own
export interface Attachment {
  name: string;
  contentType: string;
  url: string;
  size?: number;
}

// Helper function to create attachment from file part
export function createAttachmentFromPart(part: any): Attachment | null {
  if (part.type === "file" && part.file) {
    return {
      name: part.file.name || "unknown",
      contentType: part.file.type || "application/octet-stream",
      url: part.file.url || "",
      size: part.file.size,
    };
  }
  return null;
}

// Helper function to get attachments from message parts
export function getAttachmentsFromMessage(message: any): Attachment[] {
  const attachments: Attachment[] = [];

  if (message.parts) {
    for (const part of message.parts) {
      const attachment = createAttachmentFromPart(part);
      if (attachment) {
        attachments.push(attachment);
      }
    }
  }

  // Also check experimental_attachments for backward compatibility
  if (message.experimental_attachments) {
    for (const attachment of message.experimental_attachments) {
      attachments.push({
        name: attachment.name || "unknown",
        contentType: attachment.contentType || "application/octet-stream",
        url: attachment.url || "",
        size: attachment.size,
      });
    }
  }

  return attachments;
}
