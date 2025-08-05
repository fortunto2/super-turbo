import { API_NEXT_ROUTES } from "@/lib/config/next-api-routes";
import { tool } from "ai";
import { z } from "zod";
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from "@/lib/utils/ai-tools-balance";
import type { Session } from "next-auth";

interface CreateScriptDocumentParams {
  createDocument: any;
  session?: Session | null;
}

export const configureScriptGeneration = (
  params?: CreateScriptDocumentParams
) =>
  tool({
    description:
      "Generate a script (scenario) and create a document artifact. When prompt is provided, this will create a script artifact and show it in chat.",
    parameters: z.object({
      prompt: z
        .string()
        .describe("Detailed description of the script to generate."),
    }),
    execute: async ({ prompt }) => {
      if (!params?.createDocument) {
        return { error: "createDocument function is not available." };
      }

      // Check balance before creating artifact
      const operationType = "basic-script";
      const multipliers: string[] = [];

      // Determine if it's a long script
      if (prompt && prompt.length > 200) {
        multipliers.push("long-form");
      }

      const balanceCheck = await checkBalanceBeforeArtifact(
        params.session || null,
        "script-generation",
        operationType,
        multipliers,
        getOperationDisplayName(operationType)
      );

      if (!balanceCheck.valid) {
        console.log("🔧 ❌ INSUFFICIENT BALANCE, NOT CREATING ARTIFACT");
        return {
          error:
            balanceCheck.userMessage ||
            "Недостаточно средств для генерации сценария",
          balanceError: true,
          requiredCredits: balanceCheck.cost,
        };
      }

      try {
        // 1. Generate script content via API
        const scriptRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${API_NEXT_ROUTES.GENERATE_SCRIPT}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          }
        );

        if (!scriptRes.ok) {
          throw new Error(
            `Script generation API failed with status ${scriptRes.status}`
          );
        }

        const data = await scriptRes.json();
        const script = data?.script || "";
        if (!script) {
          throw new Error("Script generation failed: Empty script returned.");
        }

        // 2. Create document artifact using the provided function
        const result = await params.createDocument.execute({
          title: prompt,
          kind: "script",
          content: script,
        });

        // 3. Return the result which will be sent to the client
        return {
          id: result.id,
          title: "📝 Script created!",
          kind: "script",
        };
      } catch (error) {
        console.error("Error during script generation tool execution:", error);
        return {
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
        };
      }
    },
  });
