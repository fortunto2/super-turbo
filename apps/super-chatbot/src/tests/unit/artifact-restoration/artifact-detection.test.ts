import { detectActiveArtifactFromMessages } from "@/lib/utils/artifact-detection";
import type { UIMessage } from "ai";

describe("Artifact Detection", () => {
  describe("detectActiveArtifactFromMessages", () => {
    it("should detect image artifact from attachment", () => {
      const messages: UIMessage[] = [
        {
          id: "1",
          role: "user",
          content: "Generate an image",
        },
        {
          id: "2",
          role: "assistant",
          content: "Here's your image",
          experimental_attachments: [
            {
              url: "https://example.com/image.jpg",
              name: "Generated Image",
              contentType: "image/jpeg",
              documentId: "doc-123",
            },
          ],
        },
      ];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).not.toBeNull();
      expect(result?.artifact.kind).toBe("image");
      expect(result?.artifact.isVisible).toBe(true);
      expect(result?.confidence).toBe(0.9);
      expect(result?.source).toBe("attachment");
    });

    it("should detect video artifact from attachment", () => {
      const messages: UIMessage[] = [
        {
          id: "1",
          role: "assistant",
          content: "Here's your video",
          experimental_attachments: [
            {
              url: "https://example.com/video.mp4",
              name: "Generated Video",
              contentType: "video/mp4",
              documentId: "doc-456",
            },
          ],
        },
      ];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).not.toBeNull();
      expect(result?.artifact.kind).toBe("video");
      expect(result?.confidence).toBe(0.9);
    });

    it("should detect text artifact from attachment", () => {
      const messages: UIMessage[] = [
        {
          id: "1",
          role: "assistant",
          content: "Here's your document",
          experimental_attachments: [
            {
              url: "https://example.com/document.md",
              name: "Document.md",
              contentType: "text/markdown",
              documentId: "doc-789",
            },
          ],
        },
      ];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).not.toBeNull();
      expect(result?.artifact.kind).toBe("text");
      expect(result?.confidence).toBe(0.9);
    });

    it("should detect script artifact from attachment", () => {
      const messages: UIMessage[] = [
        {
          id: "1",
          role: "assistant",
          content: "Here's your script",
          experimental_attachments: [
            {
              url: "https://example.com/script.js",
              name: "Script.js",
              contentType: "text/javascript",
              documentId: "script-123",
            },
          ],
        },
      ];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).not.toBeNull();
      expect(result?.artifact.kind).toBe("script");
      expect(result?.confidence).toBe(0.9);
    });

    it("should detect artifact from tool call", () => {
      const messages: UIMessage[] = [
        {
          id: "1",
          role: "assistant",
          content: "Generated image",
          toolInvocations: [
            {
              toolName: "generateImage",
              toolCallId: "call-123",
              result: {
                id: "img-123",
                url: "https://example.com/image.jpg",
                prompt: "A beautiful sunset",
                fileId: "file-123",
              },
            },
          ],
        },
      ];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).not.toBeNull();
      expect(result?.artifact.kind).toBe("image");
      expect(result?.confidence).toBe(0.8);
      expect(result?.source).toBe("tool_call");
    });

    it("should detect artifact from content", () => {
      const messages: UIMessage[] = [
        {
          id: "1",
          role: "assistant",
          content:
            "Here's an image: ![Alt text](https://example.com/image.jpg)",
        },
      ];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).not.toBeNull();
      expect(result?.artifact.kind).toBe("image");
      expect(result?.confidence).toBe(0.6);
      expect(result?.source).toBe("content");
    });

    it("should return null if no artifacts found", () => {
      const messages: UIMessage[] = [
        {
          id: "1",
          role: "user",
          content: "Hello",
        },
        {
          id: "2",
          role: "assistant",
          content: "Hi there!",
        },
      ];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).toBeNull();
    });

    it("should limit lookback to maxLookback messages", () => {
      const messages: UIMessage[] = Array.from({ length: 15 }, (_, i) => ({
        id: `${i}`,
        role: "user" as const,
        content: `Message ${i}`,
      }));

      // Add artifact to the 5th message from the end
      messages[messages.length - 5] = {
        id: "artifact-message",
        role: "assistant",
        content: "Here's an image",
        experimental_attachments: [
          {
            url: "https://example.com/image.jpg",
            name: "Image",
            contentType: "image/jpeg",
            documentId: "doc-123",
          },
        ],
      };

      const result = detectActiveArtifactFromMessages(messages, 3);

      expect(result).toBeNull(); // Should not find it because it's beyond lookback limit
    });

    it("should prioritize recent messages", () => {
      const messages: UIMessage[] = [
        {
          id: "1",
          role: "assistant",
          content: "Old image",
          experimental_attachments: [
            {
              url: "https://example.com/old.jpg",
              name: "Old Image",
              contentType: "image/jpeg",
              documentId: "old-doc",
            },
          ],
        },
        {
          id: "2",
          role: "assistant",
          content: "New image",
          experimental_attachments: [
            {
              url: "https://example.com/new.jpg",
              name: "New Image",
              contentType: "image/jpeg",
              documentId: "new-doc",
            },
          ],
        },
      ];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).not.toBeNull();
      expect(result?.artifact.documentId).toBe("new-doc");
    });
  });
});
