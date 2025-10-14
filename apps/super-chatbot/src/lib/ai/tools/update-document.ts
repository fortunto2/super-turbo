import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getDocumentById } from "@/lib/db/queries";
import { documentHandlersByArtifactKind } from "@/lib/artifacts/server";

interface UpdateDocumentProps {
  session: Session;
}

export const updateDocument = ({ session }: UpdateDocumentProps) =>
  tool({
    description: "Update a document with the given description.",
    inputSchema: z.object({
      id: z.string().describe("The ID of the document to update"),
      description: z
        .string()
        .describe("The description of changes that need to be made"),
    }),
    execute: async ({ id, description }) => {
      const document = await getDocumentById({ id });

      if (!document) {
        return {
          error: "Document not found",
        };
      }

      // AICODE-NOTE: AI SDK 5.0 removed 'clear' event, metadata sent via return value
      console.log("📄 ✅ UPDATING DOCUMENT:", document.title);

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === document.kind
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${document.kind}`);
      }

      await documentHandler.onUpdateDocument({
        document,
        description,
        session,
      });

      // AICODE-NOTE: AI SDK 5.0 - 'finish' event removed, tool completion signals finish
      console.log("📄 ✅ DOCUMENT UPDATE COMPLETE");

      return {
        id,
        title: document.title,
        kind: document.kind,
        content: "The document has been updated successfully.",
      };
    },
  });
