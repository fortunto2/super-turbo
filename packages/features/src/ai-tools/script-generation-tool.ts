import { ScriptGenerator } from './script-generation/generator';

// Create a tool function for script generation
export const configureScriptGeneration = (config?: any) => ({
  description: "Generate scripts for various content types (educational, storytelling, commercial)",
  parameters: {
    topic: { type: "string", description: "The main topic or theme for the script" },
    genre: { type: "string", enum: ["educational", "storytelling", "commercial"], optional: true },
    length: { type: "string", enum: ["short", "medium", "long"], optional: true },
    format: { type: "string", enum: ["markdown", "plain", "structured"], optional: true },
    targetAudience: { type: "string", optional: true },
    tone: { type: "string", optional: true },
    includeDialogue: { type: "boolean", optional: true },
    includeStageDirections: { type: "boolean", optional: true }
  },
  execute: async (params: any) => {
    try {
      const generator = new ScriptGenerator();
      const result = await generator.generateScript(params);
      return result;
    } catch (error) {
      throw new Error(`Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});
