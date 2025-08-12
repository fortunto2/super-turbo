// AI Tools types

export interface AIToolConfig {
  id: string;
  name: string;
  description: string;
  category: 'generation' | 'enhancement' | 'utility';
  iconName: string;
  features: string[];
}

export interface GenerationRequest {
  prompt: string;
  model?: string;
  parameters?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface GenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  progress?: number;
}

export interface PromptEnhancementRequest {
  prompt: string;
  language?: string;
  style?: string;
  length?: 'short' | 'medium' | 'long';
}

export interface PromptEnhancementResponse {
  enhancedPrompt: string;
  suggestions: string[];
  confidence: number;
}

export interface ScriptGenerationRequest {
  topic: string;
  genre?: string;
  length?: 'short' | 'medium' | 'long';
  format?: 'markdown' | 'plain' | 'structured';
}

export interface ScriptGenerationResponse {
  script: string;
  outline: string[];
  metadata: {
    genre: string;
    estimatedDuration: string;
    scenes: number;
  };
}
