// AI Artifact types

export interface ArtifactMetadata {
  [key: string]: any;
}

export interface ArtifactProps {
  title: string;
  content: string;
  mode: "edit" | "diff";
  status: "streaming" | "idle";
  currentVersionIndex: number;
  suggestions: any[];
  onSaveContent: (content: string, debounce?: boolean) => void;
  isInline: boolean;
  isCurrentVersion: boolean;
  getDocumentContentById: (index: number) => string;
  isLoading: boolean;
  metadata?: ArtifactMetadata;
  setMetadata?: (metadata: ArtifactMetadata) => void;
  chatId?: string;
}

export interface ArtifactDefinition {
  kind: string;
  description: string;
  content: any; // Component type placeholder
  initialize?: (props: {
    documentId: string;
    setMetadata: (metadata: ArtifactMetadata) => void;
  }) => Promise<void>;
  onStreamPart?: (props: {
    streamPart: { type: string; content: any };
    setArtifact: (artifact: any) => void;
    setMetadata: (metadata: ArtifactMetadata) => void;
  }) => void;
  actions?: Array<{
    icon: any; // React node placeholder
    description: string;
    onClick: (props: any) => void;
    isDisabled?: (props: any) => boolean;
  }>;
}

export interface ArtifactVersion {
  id: string;
  content: string;
  timestamp: Date;
  author?: string;
  metadata?: ArtifactMetadata;
}

export interface ArtifactHistory {
  versions: ArtifactVersion[];
  currentVersion: number;
  maxVersions: number;
}

export interface ArtifactStreamEvent {
  type: "content" | "metadata" | "status" | "error";
  content?: any;
  metadata?: ArtifactMetadata;
  status?: string;
  error?: string;
  timestamp: Date;
}

export interface ArtifactSaveOptions {
  debounce?: boolean;
  createVersion?: boolean;
  metadata?: ArtifactMetadata;
  notifyUser?: boolean;
}
