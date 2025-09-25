import { generateUUID } from "@/lib/utils";

export const saveImageToChat = async (
  chatId: string,
  imageUrl: string,
  prompt: string,
  setMessages: (updater: (prev: any[]) => any[]) => void,
  thumbnailUrl?: string
) => {
  if (!setMessages || !chatId) return;

  let alreadyExists = false;
  setMessages((prev) => {
    alreadyExists = prev.some((msg) =>
      msg.experimental_attachments?.some((att: any) => att.url === imageUrl)
    );
    return prev;
  });

  if (alreadyExists) return;

  const message = {
    id: generateUUID(),
    role: "assistant" as const,
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
    await fetch("/api/save-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message }),
    });
  } catch (e) {
    console.warn("❌ Failed to persist image to DB", e);
  }
};

const mediaType = {
  image: "image/webp",
  video: "video/mp4",
};
// Function to save video to chat history
export const saveMediaToChat = async (
  chatId: string,
  videoUrl: string,
  prompt: string,
  setMessages: any,
  type: "image" | "video",
  thumbnailUrl?: string,
  fileId?: string
) => {
  try {
    // Check for duplicates
    let videoExists = false;
    setMessages((prevMessages: any[]) => {
      videoExists = prevMessages.some((message) =>
        message.experimental_attachments?.some(
          (attachment: any) => attachment.url === videoUrl
        )
      );
      return prevMessages;
    });

    if (videoExists) {
      console.log("🎬 Video already exists in chat, skipping duplicate save");
      return;
    }

    // Встраиваем fileId в имя, если он есть
    const attachmentNameWithFileId = fileId
      ? `[FILE_ID:${fileId}] ${prompt}`
      : prompt;
    const displayPromptForAttachment =
      attachmentNameWithFileId.length > 200
        ? `${attachmentNameWithFileId.substring(0, 200)}...`
        : attachmentNameWithFileId;

    const videoAttachment = {
      name: displayPromptForAttachment, // Используем новое имя с встроенным fileId
      url: videoUrl,
      contentType: mediaType[type],
      thumbnailUrl: thumbnailUrl, // Add thumbnail for preview
      // id: fileId, // Удаляем это, так как оно не сохраняется
    };

    console.log(
      "💾 saveMediaToChat: Saving attachment with fileId embedded in name:",
      {
        fileId: fileId || "none",
        url: videoUrl ? `${videoUrl.substring(0, 50)}...` : "none",
        type,
        attachmentName: videoAttachment.name,
      }
    );

    // AICODE-DEBUG: Логирование стека вызовов
    console.log("🔍 saveMediaToChat: Call stack:", new Error().stack);

    // AICODE-DEBUG: Подробное логирование fileId в saveMediaToChat
    console.log("🔍 saveMediaToChat: FileId details:", {
      receivedFileId: fileId || "none",
      receivedChatId: chatId || "none",
      willEmbedFileId: fileId || "none",
      fallbackReason: fileId ? "using received fileId" : "no fileId provided",
      fileIdType: typeof fileId,
      chatIdType: typeof chatId,
      attachmentNameWithFileId: attachmentNameWithFileId,
      displayPromptForAttachment: displayPromptForAttachment,
    });

    const videoMessage = {
      id: generateUUID(),
      role: "assistant" as const,
      // content: `Generated video: "${prompt}"`,
      content: ``,
      parts: [
        {
          type: "text" as const,
          // text: `Generated video: "${prompt}"`,
          text: ``,
        },
      ],
      experimental_attachments: [videoAttachment],
      createdAt: new Date(),
    };

    setMessages((prevMessages: any[]) => [...prevMessages, videoMessage]);
    console.log("🎬 ✅ Video added to chat history!");

    // Save to database
    try {
      const response = await fetch("/api/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          message: {
            id: videoMessage.id,
            role: videoMessage.role,
            parts: videoMessage.parts,
            attachments: videoMessage.experimental_attachments,
            createdAt: videoMessage.createdAt,
          },
        }),
      });

      if (response.ok) {
        console.log("🎬 ✅ Video saved to database!");
      } else {
        console.warn(
          "🎬 ⚠️ Failed to save to database, but video is in chat locally"
        );
      }
    } catch (dbError) {
      console.warn("🎬 ⚠️ Database save failed:", dbError);
    }
  } catch (error) {
    console.error("🎬 ❌ Failed to save video to chat:", error);
  }
};

// Function to save artifact updates to database
export const saveArtifactToDatabase = async (
  id: string | undefined,
  title: string,
  content: string,
  type: "image" | "video",
  thumbnailUrl?: string
) => {
  if (!id || id === "undefined") {
    return;
  }
  try {
    let readableTitle = title;
    if (title.startsWith("{") && title.endsWith("}")) {
      const titleParams = JSON.parse(title);
      const defaultTitle = titles[type];
      readableTitle = titleParams.prompt || defaultTitle;
    }
    if (readableTitle.length > 255) {
      readableTitle = `${readableTitle.substring(0, 252)}...`;
    }
    const payload: any = { title: readableTitle, content, kind: type };
    if (thumbnailUrl) {
      payload.thumbnailUrl = thumbnailUrl;
    }
    await fetch(`/api/document?id=${encodeURIComponent(id)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("💾 ❌ Failed to save artifact to database:", error);
  }
};

const titles = {
  video: "AI Generated Video",
  image: "AI Generated Image",
};
