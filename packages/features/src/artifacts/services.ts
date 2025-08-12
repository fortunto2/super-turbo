import {
  Artifact,
  ArtifactCollection,
  ArtifactSearchParams,
  ArtifactKind,
  SaveDocumentProps,
  CreateDocumentCallbackProps,
  UpdateDocumentCallbackProps,
  DocumentHandler,
} from "./types";
import { superDuperAIClient } from "@turbo-super/api";

export class ArtifactService {
  private client = superDuperAIClient;

  async getArtifact(id: string): Promise<Artifact> {
    try {
      const response = await this.client.request<Artifact>({
        method: "GET",
        url: `/artifacts/${id}`,
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get artifact: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getUserArtifacts(
    userId: string,
    params?: ArtifactSearchParams
  ): Promise<Artifact[]> {
    try {
      const response = await this.client.request<Artifact[]>({
        method: "GET",
        url: `/user/${userId}/artifacts`,
        params,
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get user artifacts: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async createArtifact(
    artifact: Omit<Artifact, "id" | "metadata">
  ): Promise<Artifact> {
    try {
      const response = await this.client.request<Artifact>({
        method: "POST",
        url: "/artifacts",
        data: artifact,
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to create artifact: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async updateArtifact(
    id: string,
    updates: Partial<Artifact>
  ): Promise<Artifact> {
    try {
      const response = await this.client.request<Artifact>({
        method: "PUT",
        url: `/artifacts/${id}`,
        data: updates,
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to update artifact: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async deleteArtifact(id: string): Promise<void> {
    try {
      await this.client.request({
        method: "DELETE",
        url: `/artifacts/${id}`,
      });
    } catch (error) {
      throw new Error(
        `Failed to delete artifact: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getCollections(userId: string): Promise<ArtifactCollection[]> {
    try {
      const response = await this.client.request<ArtifactCollection[]>({
        method: "GET",
        url: `/user/${userId}/collections`,
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to get collections: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async createCollection(
    collection: Omit<ArtifactCollection, "id" | "createdAt" | "updatedAt">
  ): Promise<ArtifactCollection> {
    try {
      const response = await this.client.request<ArtifactCollection>({
        method: "POST",
        url: "/collections",
        data: collection,
      });
      return response;
    } catch (error) {
      throw new Error(
        `Failed to create collection: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async addArtifactToCollection(
    collectionId: string,
    artifactId: string
  ): Promise<void> {
    try {
      await this.client.request({
        method: "POST",
        url: `/collections/${collectionId}/artifacts`,
        data: { artifactId },
      });
    } catch (error) {
      throw new Error(
        `Failed to add artifact to collection: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Utility functions from existing artifacts server.ts
  static getThumbnailUrl(content: string): string | null {
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

  static createDocumentHandler<T extends ArtifactKind>(config: {
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
          content: args.content,
          dataStream: args.dataStream,
          session: args.session,
        });

        console.log("📄 Draft content generated:", draftContent);

        // Send the content to the stream so it reaches the client
        args.dataStream.writeData({
          type: "text-delta",
          content: draftContent,
        });

        if (args.session?.user?.id) {
          // Extract human-readable title from JSON if needed
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
                const promptMatch = args.title.match(/Video: "([^"]+)"/);
                if (promptMatch) {
                  readableTitle = promptMatch[1];
                }
              }
            }
          } catch (e) {
            console.warn("Failed to parse title for readable version:", e);
          }

          // Save document to database
          // Note: This would need to be implemented based on your database setup
          console.log("📄 Saving document:", {
            id: args.id,
            title: readableTitle,
            kind: config.kind,
            content: draftContent,
            userId: args.session.user.id,
          });
        }
      },
      onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
        console.log(
          "📄 createDocumentHandler.onUpdateDocument called for kind:",
          config.kind
        );

        const updatedContent = await config.onUpdateDocument({
          document: args.document,
          description: args.description,
          dataStream: args.dataStream,
          session: args.session,
        });

        console.log("📄 Updated content generated:", updatedContent);

        // Send the content to the stream so it reaches the client
        args.dataStream.writeData({
          type: "text-delta",
          content: updatedContent,
        });

        if (args.session?.user?.id) {
          // Update document in database
          // Note: This would need to be implemented based on your database setup
          console.log("📄 Updating document:", {
            id: args.document.id,
            content: updatedContent,
            userId: args.session.user.id,
          });
        }
      },
    };
  }
}

// Export default instance
export const artifactService = new ArtifactService();
