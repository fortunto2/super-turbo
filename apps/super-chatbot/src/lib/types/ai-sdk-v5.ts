
import type { UIMessage } from 'ai';

/**
 * Extended UseChatHelpers that includes v5 properties
 *
 * In AI SDK v5:
 * - input/setInput are NOT provided by useChat
 * - append is replaced by sendMessage
 * - handleSubmit must be implemented manually
 * - reload is now regenerate
 *
 * Note: This is a simplified compatibility type, not a strict extension
 */
export interface ExtendedUseChatHelpers {
  // V5 properties (from SDK5UseChatHelpers)
  readonly id: string;
  setMessages: (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void;
  error?: Error | undefined;
  sendMessage?: (message?: any, options?: any) => Promise<string | null | undefined>;
  regenerate?: () => void;
  stop?: () => void;
  resumeStream?: () => void;
  addToolResult?: (options: any) => void;
  status?: string;
  messages?: UIMessage[];
  clearError?: () => void;

  // Properties that need to be managed manually (v4 compatibility)
  input?: string;
  setInput?: (value: string) => void;
  append?: (message: any, options?: any) => Promise<string | null | undefined>;
  handleSubmit?: (event?: any, options?: any) => void;
  reload?: () => void;
}

/**
 * Type guard to check if a chat helper has sendMessage
 */
export function hasSendMessage(helpers: any): helpers is { sendMessage: NonNullable<ExtendedUseChatHelpers['sendMessage']> } {
  return typeof helpers?.sendMessage === 'function';
}

/**
 * Type guard to check if a chat helper has regenerate
 */
export function hasRegenerate(helpers: any): helpers is { regenerate: NonNullable<ExtendedUseChatHelpers['regenerate']> } {
  return typeof helpers?.regenerate === 'function';
}

/**
 * Extended UIMessage type that includes all possible fields from v4 and v5
 */
export interface ExtendedUIMessage extends UIMessage {
  // V4 compatibility
  content?: string;
  experimental_attachments?: Array<{
    url: string;
    name: string;
    contentType: string;
    documentId?: string;
  }>;

  // Tool invocation fields
  toolInvocations?: Array<{
    state: 'input-streaming' | 'result' | 'call' | 'partial-call' | 'error';
    toolCallId: string;
    toolName?: string;
    args?: any;
    result?: any;
    error?: string;
  }>;
}

/**
 * Tool part type from message.parts
 */
export interface ToolPart {
  type: `tool-${string}`;
  toolCallId: string;
  toolName?: string;
  state: 'input-streaming' | 'output-available' | 'result' | 'error';
  input?: unknown;
  output?: any;
  errorText?: string;
}

/**
 * Helper to check if a part is a tool part
 */
export function isToolPart(part: any): part is ToolPart {
  return part && typeof part.type === 'string' && part.type.startsWith('tool-');
}

/**
 * Helper to extract tool name from tool part
 */
export function getToolName(part: ToolPart): string {
  return part.toolName || part.type.replace('tool-', '');
}

/**
 * Helper to check if message has content
 */
export function hasContent(message: any): message is { content: string } {
  return typeof message?.content === 'string';
}

/**
 * Helper to check if message has attachments
 */
export function hasAttachments(message: any): message is { experimental_attachments: any[] } {
  return Array.isArray(message?.experimental_attachments);
}
