// Artifacts management types
export type ArtifactKind = "image" | "text" | "sheet" | "video";

export interface Artifact {
  id: string;
  userId: string;
  type: "image" | "video" | "audio" | "document";
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  mimeType: string;
  metadata: {
    prompt?: string;
    model?: string;
    generationParams?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  };
  tags?: string[];
  isPublic: boolean;
}

export interface ArtifactCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  artifacts: string[]; // Artifact IDs
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface ArtifactSearchParams {
  userId?: string;
  type?: "image" | "video" | "audio" | "document";
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

// Document handling types
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
  dataStream: any; // DataStreamWriter
  session: any; // Session
}

export interface UpdateDocumentCallbackProps {
  document: any; // Document
  description: string;
  dataStream: any; // DataStreamWriter
  session: any; // Session
}

export interface DocumentHandler<T = ArtifactKind> {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
}
