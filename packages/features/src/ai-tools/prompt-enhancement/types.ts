// Prompt enhancement types

export interface PromptEnhancementParams {
  prompt: string;
  language?: string;
  style?: 'professional' | 'creative' | 'technical' | 'casual';
  length?: 'short' | 'medium' | 'long';
  targetModel?: 'image' | 'video' | 'text';
  includeExamples?: boolean;
}

export interface EnhancedPrompt {
  original: string;
  enhanced: string;
  suggestions: string[];
  confidence: number;
  metadata: {
    language: string;
    style: string;
    length: string;
    targetModel: string;
    wordCount: number;
    estimatedTokens: number;
  };
}

export interface PromptStyle {
  id: string;
  name: string;
  description: string;
  examples: string[];
  keywords: string[];
}

export interface LanguageSupport {
  code: string;
  name: string;
  nativeName: string;
  supported: boolean;
}
