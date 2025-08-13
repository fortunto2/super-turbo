// AI Tool types

import type { z } from "zod";
import type { DataStreamWriter } from "../data-stream";

export interface ToolProps {
  dataStream: {
    write: DataStreamWriter["write"];
    end: DataStreamWriter["end"];
    error: DataStreamWriter["error"];
  };
}

export interface ToolResult {
  type: "success" | "error";
  message: string;
  data?: any;
}

export interface ToolDefinition {
  description: string;
  parameters: z.ZodType<any>;
  execute: (params: any) => Promise<ToolResult>;
}

export type Tool = {
  new (props: ToolProps): ToolDefinition;
};

export interface ToolExecutionContext {
  userId?: string;
  sessionId?: string;
  chatId?: string;
  metadata?: Record<string, any>;
}

export interface ToolValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface ToolMetadata {
  name: string;
  version: string;
  author?: string;
  description: string;
  tags?: string[];
  category?: string;
  requiresAuth?: boolean;
  rateLimit?: {
    requests: number;
    window: number;
  };
}
