import { detectActiveArtifactFromMessages } from "@/lib/utils/artifact-detection";
import type { UIMessage } from "ai";

describe("Artifact Restoration Integration", () => {
  describe("detectActiveArtifactFromMessages with real chat data", () => {
    it("should detect image artifact from tool call result", () => {
      const messages: UIMessage[] = [
        {
          id: "user-1",
          role: "user",
          content: "Create a cinematic wide shot of a futuristic cityscape",
        },
        {
          id: "assistant-1",
          role: "assistant",
          content: "I'll create that image for you.",
          toolInvocations: [
            {
              toolName: "createDocument",
              toolCallId: "call-123",
              result: {
                id: "43f97a62-c5de-417e-bfe9-5570ecb27006",
                title:
                  '{"prompt":"A cinematic, ultra-wide angle shot...","style":{"id":"flux_watercolor","label":"Watercolor"}}',
                kind: "image",
                content:
                  "A document was created and is now visible to the user.",
              },
            },
          ],
        },
      ];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).not.toBeNull();
      expect(result?.artifact.kind).toBe("image");
      expect(result?.artifact.documentId).toBe(
        "43f97a62-c5de-417e-bfe9-5570ecb27006"
      );
      expect(result?.confidence).toBe(0.8);
      expect(result?.source).toBe("tool_call");
    });

    it("should detect image artifact from attachment", () => {
      const messages: UIMessage[] = [
        {
          id: "user-1",
          role: "user",
          content: "Generate an image",
        },
        {
          id: "assistant-1",
          role: "assistant",
          content: "Here's your generated image",
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
      expect(result?.artifact.documentId).toBe("doc-123");
      expect(result?.confidence).toBe(0.9);
      expect(result?.source).toBe("attachment");
    });

    it("should handle multiple messages and find the most recent artifact", () => {
      const messages: UIMessage[] = [
        {
          id: "user-1",
          role: "user",
          content: "Create an image",
        },
        {
          id: "assistant-1",
          role: "assistant",
          content: "Here's your first image",
          experimental_attachments: [
            {
              url: "https://example.com/image1.jpg",
              name: "First Image",
              contentType: "image/jpeg",
              documentId: "doc-1",
            },
          ],
        },
        {
          id: "user-2",
          role: "user",
          content: "Create another image",
        },
        {
          id: "assistant-2",
          role: "assistant",
          content: "Here's your second image",
          experimental_attachments: [
            {
              url: "https://example.com/image2.jpg",
              name: "Second Image",
              contentType: "image/jpeg",
              documentId: "doc-2",
            },
          ],
        },
      ];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).not.toBeNull();
      expect(result?.artifact.kind).toBe("image");
      expect(result?.artifact.documentId).toBe("doc-2"); // Should find the most recent
      expect(result?.confidence).toBe(0.9);
    });

    it("should return null for messages without artifacts", () => {
      const messages: UIMessage[] = [
        {
          id: "user-1",
          role: "user",
          content: "Hello",
        },
        {
          id: "assistant-1",
          role: "assistant",
          content: "Hi there! How can I help you?",
        },
      ];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).toBeNull();
    });

    it("should handle empty messages array", () => {
      const messages: UIMessage[] = [];

      const result = detectActiveArtifactFromMessages(messages);

      expect(result).toBeNull();
    });

    it("should respect maxLookback limit", () => {
      const messages: UIMessage[] = Array.from({ length: 15 }, (_, i) => ({
        id: `message-${i}`,
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
  });
});
