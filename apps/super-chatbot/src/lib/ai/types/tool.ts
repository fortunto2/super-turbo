import type { z } from "zod/v3";

export interface ToolProps {
  dataStream: {
    write: any;
    end: any;
    error: any;
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
