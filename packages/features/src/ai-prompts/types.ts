// AI Prompts types

export interface PromptCategory {
  id: string;
  name: string;
  description: string;
  content: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  description: string;
}

export interface PromptContext {
  userType?: string;
  language?: string;
  tool?: string;
  complexity?: "simple" | "medium" | "advanced";
}

export interface PromptEnhancementOptions {
  language?: string;
  style?: "casual" | "formal" | "technical" | "creative";
  length?: "short" | "medium" | "long";
  detail?: "basic" | "detailed" | "comprehensive";
}

export interface ToolPrompt {
  toolName: string;
  description: string;
  usage: string;
  examples: string[];
  parameters?: string[];
  restrictions?: string[];
}

export interface PromptLibrary {
  categories: PromptCategory[];
  templates: PromptTemplate[];
  tools: ToolPrompt[];
  version: string;
  lastUpdated: string;
}

// Request hints for geolocation
export interface RequestHints {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

// Artifact kind types for prompts
export type PromptArtifactKind =
  | "text"
  | "sheet"
  | "image"
  | "video"
  | "script";
