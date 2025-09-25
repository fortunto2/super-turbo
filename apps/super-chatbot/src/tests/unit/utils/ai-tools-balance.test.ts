import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from "@/lib/utils/ai-tools-balance";
import { validateOperationBalance } from "@/lib/utils/tools-balance";

// Mock dependencies
vi.mock("@/lib/utils/tools-balance");

describe("ai-tools-balance", () => {
  const mockSession = {
    user: { id: "test-user", email: "test@example.com" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkBalanceBeforeArtifact", () => {
    it("should return valid for unauthenticated users", async () => {
      const result = await checkBalanceBeforeArtifact(
        null,
        "image-generation",
        "text-to-image",
        [],
        "Image Generation"
      );

      expect(result.valid).toBe(true);
      expect(validateOperationBalance).not.toHaveBeenCalled();
    });

    it("should return valid for authenticated users with sufficient balance", async () => {
      vi.mocked(validateOperationBalance).mockResolvedValue({
        valid: true,
        cost: 10,
      });

      const result = await checkBalanceBeforeArtifact(
        mockSession,
        "image-generation",
        "text-to-image",
        [],
        "Image Generation"
      );

      expect(result.valid).toBe(true);
      expect(result.cost).toBe(10);
      expect(validateOperationBalance).toHaveBeenCalledWith(
        "test-user",
        "image-generation",
        "text-to-image",
        []
      );
    });

    it("should return invalid for users with insufficient balance", async () => {
      vi.mocked(validateOperationBalance).mockResolvedValue({
        valid: false,
        error: "Insufficient balance",
        cost: 10,
        currentBalance: 5,
      });

      const result = await checkBalanceBeforeArtifact(
        mockSession,
        "image-generation",
        "text-to-image",
        [],
        "Image Generation"
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Insufficient balance");
      expect(result.cost).toBe(10);
      expect(result.userMessage).toContain("Image Generation");
    });

    it("should handle different operation types", async () => {
      vi.mocked(validateOperationBalance).mockResolvedValue({
        valid: true,
        cost: 20,
      });

      const operations = [
        "image-generation",
        "video-generation",
        "script-generation",
      ] as const;

      for (const operation of operations) {
        const result = await checkBalanceBeforeArtifact(
          mockSession,
          operation,
          "test-type",
          [],
          "Test Operation"
        );

        expect(result.valid).toBe(true);
        expect(validateOperationBalance).toHaveBeenCalledWith(
          "test-user",
          operation,
          "test-type",
          []
        );
      }
    });

    it("should handle multipliers", async () => {
      vi.mocked(validateOperationBalance).mockResolvedValue({
        valid: true,
        cost: 30,
      });

      const result = await checkBalanceBeforeArtifact(
        mockSession,
        "image-generation",
        "text-to-image",
        ["batch_size:3", "quality:hd"],
        "Image Generation"
      );

      expect(result.valid).toBe(true);
      expect(validateOperationBalance).toHaveBeenCalledWith(
        "test-user",
        "image-generation",
        "text-to-image",
        ["batch_size:3", "quality:hd"]
      );
    });

    it("should handle validation errors", async () => {
      vi.mocked(validateOperationBalance).mockRejectedValue(
        new Error("Database error")
      );

      const result = await checkBalanceBeforeArtifact(
        mockSession,
        "image-generation",
        "text-to-image",
        [],
        "Image Generation"
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Ошибка проверки баланса");
    });
  });

  describe("getOperationDisplayName", () => {
    it("should return correct display names for different operations", () => {
      expect(getOperationDisplayName("image-generation")).toBe(
        "генерации изображения"
      );
      expect(getOperationDisplayName("video-generation")).toBe(
        "генерации видео"
      );
      expect(getOperationDisplayName("script-generation")).toBe(
        "генерации сценария"
      );
    });

    it("should handle unknown operations", () => {
      expect(getOperationDisplayName("unknown-operation" as any)).toBe(
        "unknown-operation"
      );
    });
  });
});
