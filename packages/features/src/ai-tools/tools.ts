// AI Tools for document creation and management

// Placeholder types for AI SDK compatibility
interface DataStreamWriter {
  writeData: (data: { type: string; content: any }) => void;
}

interface ToolFunction {
  description: string;
  parameters: any;
  execute: (params: any) => Promise<any>;
}

// Placeholder tool function - this should be imported from the actual application
const tool = (config: ToolFunction) => config;

// Placeholder types - these should be imported from the actual application
interface Document {
  id: string;
  title: string;
  kind: string;
  content?: string;
  createdAt: Date;
}

interface Suggestion {
  id: string;
  documentId: string;
  originalText: string;
  suggestedText: string;
  description: string;
  isResolved: boolean;
}

interface Session {
  user?: {
    id: string;
    email?: string;
  };
}

// Placeholder functions - these should be imported from the actual application
const generateUUID = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const getDocumentById = async ({
  id,
}: {
  id: string;
}): Promise<Document | null> => {
  // This should be imported from the actual application
  return null;
};

const saveSuggestions = async ({
  suggestions,
}: {
  suggestions: any[];
}): Promise<void> => {
  // This should be imported from the actual application
};

const documentHandlersByArtifactKind: Array<{
  kind: string;
  onCreateDocument: (params: any) => Promise<void>;
  onUpdateDocument: (params: any) => Promise<void>;
}> = [
  // This should be imported from the actual application
];

const artifactKinds = ["text", "sheet", "image", "video", "script"] as const;

interface CreateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      "Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.",
    parameters: {
      title: { type: "string" },
      kind: { type: "string", enum: artifactKinds },
      content: { type: "string", optional: true },
    },
    execute: async ({
      title,
      kind,
      content,
    }: {
      title: string;
      kind: string;
      content?: string;
    }) => {
      console.log("📄 ===== CREATE DOCUMENT TOOL CALLED =====");
      console.log("📄 KIND:", kind);
      console.log("📄 TITLE (first 100 chars):", title.substring(0, 100));
      console.log("📄 CONTENT provided:", content ? "Yes" : "No");
      console.log("📄 CONTENT length:", content?.length || 0);

      const id = generateUUID();
      console.log("📄 GENERATED ID:", id);

      console.log("📄 ✅ WRITING KIND TO DATA STREAM...");
      dataStream.writeData({
        type: "kind",
        content: kind,
      });

      console.log("📄 ✅ WRITING ID TO DATA STREAM...");
      dataStream.writeData({
        type: "id",
        content: id,
      });

      console.log("📄 ✅ WRITING TITLE TO DATA STREAM...");
      dataStream.writeData({
        type: "title",
        content: title,
      });

      console.log("📄 ✅ WRITING CLEAR TO DATA STREAM...");
      dataStream.writeData({
        type: "clear",
        content: "",
      });

      console.log("📄 🔍 LOOKING FOR DOCUMENT HANDLER FOR KIND:", kind);
      console.log(
        "📄 📋 AVAILABLE HANDLERS:",
        documentHandlersByArtifactKind.map((h) => h.kind)
      );

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind
      );

      if (!documentHandler) {
        console.error("📄 ❌ NO DOCUMENT HANDLER FOUND FOR KIND:", kind);
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      console.log("📄 ✅ FOUND DOCUMENT HANDLER, CALLING onCreateDocument...");

      try {
        await documentHandler.onCreateDocument({
          id,
          title,
          content,
          dataStream,
          session,
        });
        console.log("📄 ✅ DOCUMENT HANDLER COMPLETED SUCCESSFULLY");
      } catch (error) {
        console.error("📄 ❌ DOCUMENT HANDLER ERROR:", error);
        console.error(
          "📄 ❌ ERROR STACK:",
          error instanceof Error ? error.stack : "No stack"
        );
        throw error;
      }

      console.log("📄 ✅ WRITING FINISH TO DATA STREAM...");
      dataStream.writeData({ type: "finish", content: "" });

      const result = {
        id,
        title,
        kind,
        content: "Document created successfully",
      };

      console.log("📄 ✅ FINAL RESULT:", result);
      return result;
    },
  });

interface UpdateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const updateDocument = ({ session, dataStream }: UpdateDocumentProps) =>
  tool({
    description: "Update a document with the given description.",
    parameters: {
      id: { type: "string", description: "The ID of the document to update" },
      description: {
        type: "string",
        description: "The description of changes that need to be made",
      },
    },
    execute: async ({
      id,
      description,
    }: {
      id: string;
      description: string;
    }) => {
      const document = await getDocumentById({ id });

      if (!document) {
        return {
          error: "Document not found",
        };
      }

      dataStream.writeData({
        type: "clear",
        content: document.title,
      });

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
        dataStream,
        session,
      });

      dataStream.writeData({ type: "finish", content: "" });

      return {
        id,
        title: document.title,
        kind: document.kind,
        content: "The document has been updated successfully.",
      };
    },
  });

interface RequestSuggestionsProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: "Request suggestions for a document",
    parameters: {
      documentId: {
        type: "string",
        description: "The ID of the document to request edits",
      },
    },
    execute: async ({ documentId }: { documentId: string }) => {
      const document = await getDocumentById({ id: documentId });

      if (!document || !document.content) {
        return {
          error: "Document not found",
        };
      }

      const suggestions: Array<
        Omit<Suggestion, "userId" | "createdAt" | "documentCreatedAt">
      > = [];

      // Note: This requires myProvider to be available
      // For now, we'll create a placeholder implementation
      const mockSuggestions = [
        {
          originalText: "This is a sample sentence.",
          suggestedText: "This is an improved sample sentence.",
          description: "Enhanced clarity and flow",
          id: generateUUID(),
          documentId: documentId,
          isResolved: false,
        },
      ];

      for (const suggestion of mockSuggestions) {
        dataStream.writeData({
          type: "suggestion",
          content: suggestion,
        });

        suggestions.push(suggestion);
      }

      if (session.user?.id) {
        const userId = session.user.id;

        await saveSuggestions({
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId,
            createdAt: new Date(),
            documentCreatedAt: document.createdAt,
          })),
        });
      }

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: "Suggestions have been added to the document",
      };
    },
  });
