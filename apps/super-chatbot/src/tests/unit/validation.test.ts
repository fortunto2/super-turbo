import { describe, it, expect } from "vitest";
import { z } from 'zod/v3';

// Test schemas
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().min(0).max(150).optional(),
});

const chatMessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(10000),
  role: z.enum(["user", "assistant", "system"]),
  timestamp: z.date(),
  attachments: z.array(z.string().url()).optional(),
});

const imageGenerationSchema = z.object({
  prompt: z.string().min(1).max(1000),
  style: z.enum(["photorealistic", "artistic", "cinematic", "anime"]),
  size: z.enum(["1024x1024", "1024x1792", "1792x1024"]),
  quality: z.enum(["standard", "hd"]).optional(),
});

describe("Data Validation", () => {
  describe("User Schema", () => {
    it("should validate correct user data", () => {
      const validUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        name: "John Doe",
        age: 30,
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "invalid-email",
        name: "John Doe",
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["email"]);
      }
    });

    it("should reject invalid UUID", () => {
      const invalidUser = {
        id: "invalid-uuid",
        email: "test@example.com",
        name: "John Doe",
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["id"]);
      }
    });

    it("should reject empty name", () => {
      const invalidUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        name: "",
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["name"]);
      }
    });
  });

  describe("Chat Message Schema", () => {
    it("should validate correct message data", () => {
      const validMessage = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        content: "Hello, world!",
        role: "user" as const,
        timestamp: new Date(),
        attachments: ["https://example.com/image.jpg"],
      };

      const result = chatMessageSchema.safeParse(validMessage);
      expect(result.success).toBe(true);
    });

    it("should reject invalid role", () => {
      const invalidMessage = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        content: "Hello, world!",
        role: "invalid-role",
        timestamp: new Date(),
      };

      const result = chatMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["role"]);
      }
    });

    it("should reject invalid attachment URL", () => {
      const invalidMessage = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        content: "Hello, world!",
        role: "user" as const,
        timestamp: new Date(),
        attachments: ["invalid-url"],
      };

      const result = chatMessageSchema.safeParse(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["attachments", 0]);
      }
    });
  });

  describe("Image Generation Schema", () => {
    it("should validate correct generation data", () => {
      const validGeneration = {
        prompt: "A beautiful sunset over the ocean",
        style: "photorealistic" as const,
        size: "1024x1024" as const,
        quality: "hd" as const,
      };

      const result = imageGenerationSchema.safeParse(validGeneration);
      expect(result.success).toBe(true);
    });

    it("should reject empty prompt", () => {
      const invalidGeneration = {
        prompt: "",
        style: "photorealistic" as const,
        size: "1024x1024" as const,
      };

      const result = imageGenerationSchema.safeParse(invalidGeneration);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["prompt"]);
      }
    });

    it("should reject invalid style", () => {
      const invalidGeneration = {
        prompt: "A beautiful sunset",
        style: "invalid-style",
        size: "1024x1024" as const,
      };

      const result = imageGenerationSchema.safeParse(invalidGeneration);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["style"]);
      }
    });

    it("should reject invalid size", () => {
      const invalidGeneration = {
        prompt: "A beautiful sunset",
        style: "photorealistic" as const,
        size: "invalid-size",
      };

      const result = imageGenerationSchema.safeParse(invalidGeneration);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["size"]);
      }
    });
  });
});
