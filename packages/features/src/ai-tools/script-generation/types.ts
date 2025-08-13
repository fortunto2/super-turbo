// Script generation types

export interface ScriptGenerationParams {
  topic: string;
  genre?: 'drama' | 'comedy' | 'action' | 'romance' | 'thriller' | 'documentary' | 'educational';
  length?: 'short' | 'medium' | 'long';
  format?: 'markdown' | 'plain' | 'structured' | 'screenplay';
  targetAudience?: 'children' | 'teens' | 'adults' | 'general';
  tone?: 'serious' | 'humorous' | 'inspirational' | 'informative';
  includeDialogue?: boolean;
  includeStageDirections?: boolean;
}

export interface GeneratedScript {
  id: string;
  topic: string;
  script: string;
  outline: ScriptOutline[];
  metadata: ScriptMetadata;
  createdAt: string;
  status: 'draft' | 'completed' | 'revised';
}

export interface ScriptOutline {
  section: string;
  title: string;
  description: string;
  duration?: string;
  keyPoints: string[];
}

export interface ScriptMetadata {
  genre: string;
  estimatedDuration: string;
  scenes: number;
  characters: number;
  wordCount: number;
  targetAudience: string;
  tone: string;
  format: string;
  language: string;
}

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  structure: string[];
  examples: string[];
  genre: string[];
  suitableFor: string[];
}
