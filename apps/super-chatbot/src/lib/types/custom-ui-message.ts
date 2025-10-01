import type { UIMessage } from "ai";

// Custom metadata type for our application
export interface CustomMetadata {
  chatId?: string;
  userId?: string;
  visibility?: string;
  createdAt?: Date;
}

// Custom data parts for our application
export interface CustomDataParts {
  "data-redirect": {
    url: string;
  };
  "data-image-progress": {
    progress: number;
    message: string;
    projectId: string;
  };
  "data-video-progress": {
    progress: number;
    message: string;
    projectId: string;
  };
  "data-script-progress": {
    progress: number;
    message: string;
    docId: string;
  };
  "data-error": {
    error: string;
    details?: string;
  };
  [key: string]: any; // Add index signature for UIDataTypes constraint
}

// Custom tools type for our application
export interface CustomTools {
  configureImageGeneration: any;
  configureVideoGeneration: any;
  configureAudioGeneration: any;
  configureScriptGeneration: any;
  createDocument: any;
  updateDocument: any;
  requestSuggestions: any;
  listVideoModels: any;
  findBestVideoModel: any;
  enhancePromptUnified: any;
  [key: string]: any; // Index signature for UITools constraint
}

// Custom UIMessage type for our application
export type CustomUIMessage = UIMessage<
  CustomMetadata,
  CustomDataParts,
  CustomTools
>;
