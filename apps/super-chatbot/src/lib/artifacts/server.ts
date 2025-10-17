import { imageDocumentHandler } from "@/artifacts/image/server";
// Utility: extract thumbnail URL from JSON content string
function getThumbnailUrl(content: string): string | null {
  try {
    const data = JSON.parse(content);
    if (!data) return null;
    // Common fields
    if (typeof data.thumbnailUrl === "string") return data.thumbnailUrl;
    if (typeof data.thumbnail_url === "string") return data.thumbnail_url;
    // Fallbacks for image/video specific
    if (typeof data.imageUrl === "string") return data.imageUrl;
    if (typeof data.videoUrl === "string") return data.videoUrl;
  } catch (_) {
    // ignore parse errors
  }
  return null;
}

import { sheetDocumentHandler } from "@/artifacts/sheet/server";
import { textDocumentHandler } from "@/artifacts/text/server";
import { videoDocumentHandler } from "@/artifacts/video/server";
import type { ArtifactKind } from "@/components/artifacts/artifact";
// DataStreamWriter removed in AI SDK v5
import type { Document } from "../db/schema";
import { saveDocument } from "../db/queries";
import type { Session } from "next-auth";
import { scriptDocumentHandler } from "@/artifacts/script/server";

export interface SaveDocumentProps {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
  visibility?: "public" | "private";
}

export interface CreateDocumentCallbackProps {
  id: string;
  title: string;
  content?: string; // Optional content for artifacts that generate their own content
  session: Session;
}

export interface UpdateDocumentCallbackProps {
  document: Document;
  description: string;
  session: Session;
}

export interface DocumentHandler<T = ArtifactKind> {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<string>; // AI SDK v5: Returns draft content
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<string>; // AI SDK v5: Returns updated content
}

export function createDocumentHandler<T extends ArtifactKind>(config: {
  kind: T;
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      console.log(
        "📄 createDocumentHandler.onCreateDocument called for kind:",
        config.kind
      );

      const draftContent = await config.onCreateDocument({
        id: args.id,
        title: args.title,
        content: args.content || "", // Now properly typed
        session: args.session,
      });

      console.log("📄 Draft content generated:", draftContent);

      // AICODE-NOTE: AI SDK 5.0 - data is now sent via tool return value, not dataStream
      // Content will be sent to client through the tool's return value

      // AICODE-FIX: Only save to database if we have meaningful content
      // For image/video artifacts, only save when generation is completed
      const shouldSaveToDatabase =
        args.session?.user?.id &&
        (config.kind === "text" || // Text artifacts can be saved immediately
          config.kind === "sheet" || // Sheet artifacts can be saved immediately
          config.kind === "script" || // Script artifacts can be saved immediately (content is pre-generated)
          (config.kind === "image" && !!draftContent) ||
          (config.kind === "video" &&
            draftContent &&
            JSON.parse(draftContent || "{}").status === "completed"));

      if (shouldSaveToDatabase) {
        // AICODE-FIX: Extract human-readable title from JSON if needed
        let readableTitle = args.title;
        try {
          // Check if title is JSON for image/video artifacts
          if (config.kind === "image" || config.kind === "video") {
            if (args.title.startsWith("{") && args.title.endsWith("}")) {
              const titleParams = JSON.parse(args.title);
              // Use prompt as readable title
              readableTitle =
                titleParams.prompt || `AI Generated ${config.kind}`;
            } else if (args.title.includes('Video: "')) {
              // Handle video format: 'Video: "prompt" {...}'
              const match = args.title.match(/Video: "([^"]+)"/);
              if (match) {
                readableTitle = match[1] || "";
              }
            }
          }
        } catch (e) {
          // If parse fails, keep original title
          console.log("📄 Could not parse title, using as-is");
        }

        await saveDocument({
          id: args.id,
          title: readableTitle,
          content: draftContent,
          kind: config.kind,
          userId: args.session.user.id,
          thumbnailUrl: getThumbnailUrl(draftContent),
        });

        console.log("📄 Document saved to database with title:", readableTitle);
      } else if (
        args.session?.user?.id &&
        (config.kind === "image" || config.kind === "video")
      ) {
        console.log(
          "📄 Skipping database save for",
          config.kind,
          "artifact - waiting for completion"
        );
      }

      // AI SDK v5: Return draft content to be sent to client via tool result
      return draftContent;
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      console.log(
        "📄 createDocumentHandler.onUpdateDocument called for kind:",
        config.kind
      );

      const draftContent = await config.onUpdateDocument({
        document: args.document,
        description: args.description,
        session: args.session,
      });

      console.log("📄 Updated content generated:", draftContent);

      // AICODE-NOTE: AI SDK 5.0 - data is now sent via tool return value, not dataStream
      // Updated content will be sent to client through the tool's return value

      // AICODE-FIX: Only save to database if we have meaningful content
      // For image/video artifacts, only save when generation is completed
      const shouldSaveToDatabase =
        args.session?.user?.id &&
        (config.kind === "text" || // Text artifacts can be saved immediately
          config.kind === "sheet" || // Sheet artifacts can be saved immediately
          (config.kind === "image" &&
            draftContent &&
            JSON.parse(draftContent || "{}").status === "completed") ||
          (config.kind === "video" &&
            draftContent &&
            JSON.parse(draftContent || "{}").status === "completed"));

      if (shouldSaveToDatabase) {
        // AICODE-FIX: Use document's existing title for updates
        // Title is already set when document was created, no need to re-parse
        await saveDocument({
          id: args.document.id,
          title: args.document.title,
          content: draftContent,
          kind: config.kind,
          userId: args.session.user.id,
          thumbnailUrl: getThumbnailUrl(draftContent),
        });

        console.log("📄 Document updated in database");
      } else if (
        args.session?.user?.id &&
        (config.kind === "image" || config.kind === "video")
      ) {
        console.log(
          "📄 Skipping database update for",
          config.kind,
          "artifact - waiting for completion"
        );
      }

      // AI SDK v5: Return updated content to be sent to client via tool result
      return draftContent;
    },
  };
}

/*
 * Use this array to define the document handlers for each artifact kind.
 */
export const documentHandlersByArtifactKind: Array<DocumentHandler> = [
  textDocumentHandler,
  imageDocumentHandler,
  sheetDocumentHandler,
  videoDocumentHandler,
  scriptDocumentHandler,
];

export const artifactKinds = [
  "text",
  "image",
  "sheet",
  "video",
  "script",
] as const;

// Zod-compatible enum format for AI SDK tool() parameters
export const artifactKindsEnum = [
  "text",
  "image",
  "sheet",
  "video",
  "script",
] as [string, string, ...string[]];
