import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatErrorResponse,
  handleForeignKeyError,
  createErrorContext,
  type ErrorContext,
  type ForeignKeyErrorType,
} from "@/lib/ai/chat/error-handler";

function createStandardError(message: string): Error {
  return new Error(message);
}

function createForeignKeyError(
  constraintName: string,
  keyName?: string
): Error {
  let message = `foreign key constraint "${constraintName}" violated`;
  if (keyName) {
    message += ` Key (${keyName})`;
  }
  return new Error(message);
}

function createProductionEnvironment() {
  vi.stubEnv("NODE_ENV", "production");
}

function createDevelopmentEnvironment() {
  vi.stubEnv("NODE_ENV", "development");
}

async function parseJSONResponse(response: Response): Promise<any> {
  return await response.json();
}

async function parseTextResponse(response: Response): Promise<string> {
  return await response.text();
}

describe("error-handler", () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (originalNodeEnv !== undefined) {
      //@ts-ignore
      process.env.NODE_ENV = originalNodeEnv;
    }
    vi.unstubAllEnvs();
  });

  describe("formatErrorResponse", () => {
    it("should return 500 status code", () => {
      createDevelopmentEnvironment();
      const error = createStandardError("Test error");

      const response = formatErrorResponse(error);

      expect(response.status).toBe(500);
    });

    it("should include Content-Type header in development", async () => {
      createDevelopmentEnvironment();
      const error = createStandardError("Test error");

      const response = formatErrorResponse(error);

      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("should include error details in development mode", async () => {
      createDevelopmentEnvironment();
      const error = createStandardError("Database connection failed");

      const response = formatErrorResponse(error, "Database");
      const data = await parseJSONResponse(response);

      expect(data.error).toBe("Error in Database");
      expect(data.details).toContain("Database connection failed");
      expect(data.timestamp).toBeDefined();
    });

    it("should include stack trace in development mode", async () => {
      createDevelopmentEnvironment();
      const error = createStandardError("Test error");

      const response = formatErrorResponse(error);
      const data = await parseJSONResponse(response);

      expect(data.details).toContain("Test error");
      expect(data.details).toContain("at ");
    });

    it("should use default context when not provided", async () => {
      createDevelopmentEnvironment();
      const error = createStandardError("Test error");

      const response = formatErrorResponse(error);
      const data = await parseJSONResponse(response);

      expect(data.error).toBe("Error in API");
    });

    it("should use custom context when provided", async () => {
      createDevelopmentEnvironment();
      const error = createStandardError("Test error");

      const response = formatErrorResponse(error, "Chat Service");
      const data = await parseJSONResponse(response);

      expect(data.error).toBe("Error in Chat Service");
    });

    it("should return generic message in production mode", async () => {
      createProductionEnvironment();
      const error = createStandardError("Sensitive database error");

      const response = formatErrorResponse(error);
      const text = await parseTextResponse(response);

      expect(text).toBe("An error occurred while processing your request!");
      expect(text).not.toContain("Sensitive database error");
    });

    it("should not include error details in production mode", async () => {
      createProductionEnvironment();
      const error = createStandardError("Internal error");

      const response = formatErrorResponse(error, "Database");
      const text = await parseTextResponse(response);

      expect(text).not.toContain("Internal error");
      expect(text).not.toContain("Database");
    });

    it("should handle unknown error types in development", async () => {
      createDevelopmentEnvironment();
      const error = { notAnError: true };

      const response = formatErrorResponse(error);
      const data = await parseJSONResponse(response);

      expect(data.details).toBe("Unknown error");
    });

    it("should handle null error in development", async () => {
      createDevelopmentEnvironment();

      const response = formatErrorResponse(null);
      const data = await parseJSONResponse(response);

      expect(data.details).toBe("Unknown error");
    });

    it("should handle undefined error in development", async () => {
      createDevelopmentEnvironment();

      const response = formatErrorResponse(undefined);
      const data = await parseJSONResponse(response);

      expect(data.details).toBe("Unknown error");
    });

    it("should format timestamp as ISO string", async () => {
      createDevelopmentEnvironment();
      const error = createStandardError("Test error");
      const beforeTest = new Date();

      const response = formatErrorResponse(error);
      const data = await parseJSONResponse(response);

      const timestamp = new Date(data.timestamp);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
    });
  });

  describe("handleForeignKeyError", () => {
    it("should detect Chat foreign key error", () => {
      const error = createForeignKeyError("Chat_userId_User_id_fk");

      const result = handleForeignKeyError(error, "Chat");

      expect(result).toBe(true);
    });

    it("should detect Message foreign key error", () => {
      const error = createForeignKeyError("Message_v2_chatId_Chat_id_fk");

      const result = handleForeignKeyError(error, "Message");

      expect(result).toBe(true);
    });

    it("should detect Stream foreign key error", () => {
      const error = createForeignKeyError("Stream_chatId_Chat_id_fk");

      const result = handleForeignKeyError(error, "Stream");

      expect(result).toBe(true);
    });

    it("should detect foreign key error with Key syntax", () => {
      const error = createForeignKeyError("Chat_userId_User_id_fk", "userId");

      const result = handleForeignKeyError(error, "Chat");

      expect(result).toBe(true);
    });

    it("should return false for non-foreign-key errors", () => {
      const error = createStandardError("Regular database error");

      const result = handleForeignKeyError(error, "Chat");

      expect(result).toBe(false);
    });

    it("should return false for wrong entity type", () => {
      const error = createForeignKeyError("Message_v2_chatId_Chat_id_fk");

      const result = handleForeignKeyError(error, "Chat");

      expect(result).toBe(false);
    });

    it("should return false for non-Error objects", () => {
      const error = { message: "Not an Error instance" };

      const result = handleForeignKeyError(error as any, "Chat");

      expect(result).toBe(false);
    });

    it("should handle error without message property", () => {
      const error = new Error();
      error.message = "";

      const result = handleForeignKeyError(error, "Chat");

      expect(result).toBe(false);
    });

    it("should be case-sensitive for constraint names", () => {
      const error = createStandardError(
        'foreign key constraint "chat_userid_user_id_fk"'
      );

      const result = handleForeignKeyError(error, "Chat");

      expect(result).toBe(false);
    });

    it("should handle multiple Key patterns in error message", () => {
      const error = createStandardError(
        'foreign key constraint "Chat_userId_User_id_fk" Key (userId) Key (chatId)'
      );

      const result = handleForeignKeyError(error, "Chat");

      expect(result).toBe(true);
    });
  });

  describe("createErrorContext", () => {
    it("should create context with string", () => {
      const context = createErrorContext("Database Operation");

      expect(context).toBe("[Database Operation]");
    });

    it("should create context with metadata", () => {
      const metadata = { userId: "user-123", operation: "save" };

      const context = createErrorContext("Chat Service", metadata);

      expect(context).toContain("[Chat Service]");
      expect(context).toContain("userId");
      expect(context).toContain("user-123");
      expect(context).toContain("operation");
      expect(context).toContain("save");
    });

    it("should handle empty metadata object", () => {
      const context = createErrorContext("API Handler", {});

      expect(context).toBe("[API Handler] {}");
    });

    it("should format nested metadata objects", () => {
      const metadata = {
        user: { id: "user-123", email: "test@example.com" },
        action: "create",
      };

      const context = createErrorContext("User Service", metadata);

      expect(context).toContain("[User Service]");
      expect(context).toContain("user");
      expect(context).toContain("id");
      expect(context).toContain("user-123");
    });

    it("should handle metadata with null values", () => {
      const metadata = { userId: null, chatId: "chat-123" };

      const context = createErrorContext("Handler", metadata);

      expect(context).toContain("userId");
      expect(context).toContain("null");
      expect(context).toContain("chatId");
      expect(context).toContain("chat-123");
    });

    it("should handle metadata with undefined values", () => {
      const metadata = { userId: undefined, chatId: "chat-123" };

      const context = createErrorContext("Handler", metadata);

      expect(context).toContain("chatId");
      expect(context).toContain("chat-123");
    });

    it("should handle metadata with arrays", () => {
      const metadata = { messageIds: ["msg-1", "msg-2", "msg-3"] };

      const context = createErrorContext("Message Handler", metadata);

      expect(context).toContain("messageIds");
      expect(context).toContain("msg-1");
      expect(context).toContain("msg-2");
      expect(context).toContain("msg-3");
    });

    it("should handle metadata with numbers", () => {
      const metadata = { retryCount: 3, timeout: 5000 };

      const context = createErrorContext("Retry Handler", metadata);

      expect(context).toContain("retryCount");
      expect(context).toContain("3");
      expect(context).toContain("timeout");
      expect(context).toContain("5000");
    });

    it("should create readable context for logging", () => {
      const metadata = {
        chatId: "chat-123",
        userId: "user-456",
        operation: "saveMessage",
        timestamp: new Date("2024-01-01T00:00:00Z"),
      };

      const context = createErrorContext("Chat API", metadata);

      expect(context).toContain("[Chat API]");
      expect(context).toContain("chatId");
      expect(context).toContain("userId");
      expect(context).toContain("operation");
      expect(context).toContain("timestamp");
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete foreign key error recovery flow", async () => {
      createDevelopmentEnvironment();
      const fkError = createForeignKeyError("Chat_userId_User_id_fk", "userId");

      const isFKError = handleForeignKeyError(fkError, "Chat");
      expect(isFKError).toBe(true);

      const context = createErrorContext("Chat Creation", {
        chatId: "chat-123",
        userId: "user-456",
      });
      expect(context).toContain("Chat Creation");

      const response = formatErrorResponse(fkError, context);
      expect(response.status).toBe(500);

      const data = await parseJSONResponse(response);
      expect(data.error).toContain("Chat Creation");
      expect(data.details).toContain("foreign key constraint");
    });

    it("should format different error types consistently", async () => {
      createDevelopmentEnvironment();
      const errors = [
        createStandardError("Database error"),
        createForeignKeyError("Chat_userId_User_id_fk"),
        new TypeError("Invalid type"),
      ];

      const responses = errors.map((error) => formatErrorResponse(error));

      for (const response of responses) {
        expect(response.status).toBe(500);
        expect(response.headers.get("Content-Type")).toBe("application/json");
      }
    });

    it("should create context for different entity types", () => {
      const entityTypes: Array<{
        type: ForeignKeyErrorType;
        constraint: string;
      }> = [
        { type: "Chat", constraint: "Chat_userId_User_id_fk" },
        { type: "Message", constraint: "Message_v2_chatId_Chat_id_fk" },
        { type: "Stream", constraint: "Stream_chatId_Chat_id_fk" },
      ];

      for (const { type, constraint } of entityTypes) {
        const error = createForeignKeyError(constraint);
        const isFKError = handleForeignKeyError(error, type);
        expect(isFKError).toBe(true);

        const context = createErrorContext(`${type} Operation`, {
          entityType: type,
        });
        expect(context).toContain(type);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle circular references in metadata", () => {
      const metadata: any = { name: "test" };
      metadata.self = metadata;

      const context = createErrorContext("Circular Test", metadata);

      expect(context).toContain("[Circular Test]");
    });

    it("should handle very long error messages", async () => {
      createDevelopmentEnvironment();
      const longMessage = "A".repeat(10000);
      const error = createStandardError(longMessage);

      const response = formatErrorResponse(error);
      const data = await parseJSONResponse(response);

      expect(data.details).toContain(longMessage);
    });

    it("should handle special characters in context", () => {
      const context = createErrorContext("API/Handler<>'\"{}&", {
        key: "value<>",
      });

      expect(context).toContain("API/Handler");
      expect(context).toContain("value");
    });

    it("should handle Error subclasses", async () => {
      createDevelopmentEnvironment();
      const typeError = new TypeError("Type mismatch");
      const rangeError = new RangeError("Out of range");

      const response1 = formatErrorResponse(typeError);
      const response2 = formatErrorResponse(rangeError);

      const data1 = await parseJSONResponse(response1);
      const data2 = await parseJSONResponse(response2);

      expect(data1.details).toContain("Type mismatch");
      expect(data2.details).toContain("Out of range");
    });
  });

  describe("Type Safety", () => {
    it("should accept all valid foreign key error types", () => {
      const error = createForeignKeyError("Chat_userId_User_id_fk");
      const validTypes: ForeignKeyErrorType[] = ["Chat", "Message", "Stream"];

      for (const type of validTypes) {
        const result = handleForeignKeyError(error, type);
        expect(typeof result).toBe("boolean");
      }
    });

    it("should create ErrorContext with proper typing", () => {
      const context1: ErrorContext = createErrorContext("Test");
      const context2: ErrorContext = createErrorContext("Test", {
        key: "value",
      });

      expect(typeof context1).toBe("string");
      expect(typeof context2).toBe("string");
    });

    it("should return Response type from formatErrorResponse", () => {
      const error = createStandardError("Test");

      const response = formatErrorResponse(error);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBeDefined();
      expect(response.headers).toBeDefined();
    });
  });
});
