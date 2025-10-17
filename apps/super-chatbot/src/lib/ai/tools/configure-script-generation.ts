import { tool, generateText } from 'ai';
import { z } from 'zod';
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from '@/lib/utils/ai-tools-balance';
import { myProvider } from '@/lib/ai/providers';
import type { Session } from 'next-auth';

interface CreateScriptDocumentParams {
  createDocument: any;
  session?: Session | null;
}

export const configureScriptGeneration = (
  params?: CreateScriptDocumentParams,
) =>
  tool({
    description:
      'Generate a script (scenario) and create a document artifact. When prompt is provided, creates a script artifact that displays in the right panel. The tool returns a message field that describes the created script - use this to generate a conversational response to the user.',
    inputSchema: z.object({
      prompt: z
        .string()
        .describe('Detailed description of the script to generate.'),
    }),
    execute: async ({ prompt }) => {
      if (!params?.createDocument) {
        return { error: 'createDocument function is not available.' };
      }

      // Check balance before creating artifact
      const operationType = 'basic-script';
      const multipliers: string[] = [];

      // Determine if it's a long script
      if (prompt && prompt.length > 200) {
        multipliers.push('long-form');
      }

      const balanceCheck = await checkBalanceBeforeArtifact(
        params.session || null,
        'script-generation',
        operationType,
        multipliers,
        getOperationDisplayName(operationType),
      );

      if (!balanceCheck.valid) {
        console.log('🔧 ❌ INSUFFICIENT BALANCE, NOT CREATING ARTIFACT');
        return {
          error:
            balanceCheck.userMessage ||
            'Недостаточно средств для генерации сценария',
          balanceError: true,
          requiredCredits: balanceCheck.cost,
        };
      }

      try {
        // 1. Generate script content directly using AI SDK
        const systemPrompt = `
You are a professional scriptwriter AI. Generate a detailed scenario in Markdown format based on the user's prompt. 
- Structure the script with headings (scenes, acts, etc.)
- Use lists for actions or dialogues
- Make the script clear, creative, and easy to edit
- Output only valid Markdown
`;

        const userPrompt = `PROMPT: ${prompt}\n\nWrite a full scenario in Markdown.`;

        const generationResult = await generateText({
          model: myProvider.languageModel('artifact-model'),
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.7,
          maxOutputTokens: 1200,
        });

        const script = generationResult.text;
        if (!script) {
          throw new Error('Script generation failed: Empty script returned.');
        }

        // 2. Create document artifact using the provided function
        const documentResult = await params.createDocument.execute({
          title: prompt,
          kind: 'script',
          content: script,
        });

        console.log('🔧 ✅ CREATE DOCUMENT RESULT:', documentResult);

        // 3. Return simple result like video generation
        // The LLM will generate a text response, and the script artifact is already created
        return {
          ...documentResult,
          message: `I've created a script: "${prompt}". The script is ready and you can view it in the artifact panel.`,
        };
      } catch (error) {
        console.error('Error during script generation tool execution:', error);
        return {
          error:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred.',
        };
      }
    },
  });
