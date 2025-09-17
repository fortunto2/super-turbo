import { tool } from "ai";
import { z } from "zod";
import type { MediaOption } from "@/lib/types/media-settings";
import { getAudioGenerationConfig } from "@/lib/config/media-settings-factory";
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from "@/lib/utils/ai-tools-balance";
import type { Session } from "next-auth";
import { analyzeAudioContext } from "@/lib/ai/context";

interface CreateAudioDocumentParams {
  createDocument: any;
  session?: Session | null;
  defaultSourceAudioUrl?: string;
  chatId?: string;
  userMessage?: string;
  currentAttachments?: any[];
}

export const configureAudioGeneration = (params?: CreateAudioDocumentParams) =>
  tool({
    description:
      "Configure audio generation settings or generate audio directly if prompt is provided. Supports text-to-speech, music generation, and audio-to-audio when a sourceAudioUrl is provided. When triggered, creates an audio artifact that shows generation progress in real-time.",
    parameters: z.object({
      prompt: z
        .string()
        .optional()
        .describe(
          "Detailed description of the audio to generate. If provided, will immediately create audio artifact and start generation"
        ),
      sourceAudioUrl: z
        .string()
        .url()
        .optional()
        .describe(
          "Optional source audio URL for audio-to-audio generation (e.g., when the user uploaded an audio file in chat). If provided, the system will run audio-to-audio."
        ),
      audioType: z
        .string()
        .optional()
        .describe(
          'Type of audio to generate. Supports: "speech", "music", "sound_effect", "voiceover", "narration", "podcast", "ambient", "instrumental", etc.'
        ),
      voice: z
        .string()
        .optional()
        .describe(
          'Voice to use for speech generation. Supports various voices like "male", "female", "child", "elderly", or specific voice names.'
        ),
      language: z
        .string()
        .optional()
        .describe(
          'Language for audio generation. Supports: "ru", "en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh", etc.'
        ),
      duration: z
        .string()
        .optional()
        .describe(
          'Audio duration. Accepts: "5s", "10s", "30s", "1m", "2m", "short", "medium", "long", etc.'
        ),
      model: z
        .string()
        .optional()
        .describe(
          'AI model to use. Models are loaded dynamically from SuperDuperAI API. Use model name like "TTS" or full model ID.'
        ),
      seed: z.number().optional().describe("Seed for reproducible results"),
      batchSize: z
        .number()
        .min(1)
        .max(3)
        .optional()
        .describe(
          "Number of audio files to generate simultaneously (1-3). Higher batch sizes generate multiple variations at once."
        ),
    }),
    execute: async ({
      prompt,
      sourceAudioUrl,
      audioType,
      voice,
      language,
      duration,
      model,
      seed,
      batchSize,
    }) => {
      console.log("🎵 configureAudioGeneration called with:", {
        prompt,
        audioType,
        voice,
        language,
        duration,
        model,
        seed,
        batchSize,
      });

      // AICODE-NOTE: Use new factory to get configuration with OpenAPI models
      console.log("🎵 Loading audio configuration from OpenAPI factory...");
      const config = await getAudioGenerationConfig();

      console.log("🎵 ✅ Loaded audio config:", {
        modelsCount: config.availableModels.length,
        voicesCount: config.availableVoices.length,
        languagesCount: config.availableLanguages.length,
        audioTypesCount: config.availableAudioTypes.length,
      });

      // If no prompt provided, return configuration panel
      if (!prompt) {
        console.log(
          "🎵 No prompt provided, returning audio configuration panel"
        );
        return config;
      }

      console.log("🎵 ✅ PROMPT PROVIDED, CREATING AUDIO DOCUMENT:", prompt);

      if (!params?.createDocument) {
        console.log(
          "🎵 ❌ createDocument not available, returning basic config"
        );
        return config;
      }

      // Check audioType for quality multipliers
      const multipliers: string[] = [];
      if (audioType?.includes("high-quality")) multipliers.push("high-quality");
      if (audioType?.includes("ultra-quality"))
        multipliers.push("ultra-quality");

      try {
        // Find the selected options or use defaults from factory
        const selectedAudioType = audioType
          ? config.availableAudioTypes.find(
              (t) => t.label === audioType || t.id === audioType
            ) || config.defaultSettings.audioType
          : config.defaultSettings.audioType;

        const selectedVoice = voice
          ? config.availableVoices.find(
              (v) => v.label === voice || v.id === voice
            ) || config.defaultSettings.voice
          : config.defaultSettings.voice;

        const selectedLanguage = language
          ? config.availableLanguages.find(
              (l) => l.id === language || l.label === language
            ) || config.defaultSettings.language
          : config.defaultSettings.language;

        const selectedDuration = duration
          ? config.availableDurations.find(
              (d) => d.label === duration || d.id === duration
            ) || config.defaultSettings.duration
          : config.defaultSettings.duration;

        const selectedModel = model
          ? config.availableModels.find(
              (m) => m.name === model || (m as any).id === model
            ) || config.defaultSettings.model
          : config.defaultSettings.model;

        // Используем новую систему анализа контекста
        let normalizedSourceUrl = sourceAudioUrl;

        console.log("🔍 configureAudioGeneration sourceAudioUrl resolution:", {
          sourceAudioUrl,
          defaultSourceAudioUrl: params?.defaultSourceAudioUrl,
          chatId: params?.chatId,
          userMessage: params?.userMessage,
        });

        // Приоритет 1: defaultSourceAudioUrl (legacy поддержка)
        if (
          params?.defaultSourceAudioUrl &&
          /^https?:\/\//.test(params.defaultSourceAudioUrl)
        ) {
          console.log(
            "🔍 Using defaultSourceAudioUrl from legacy context analysis:",
            params.defaultSourceAudioUrl
          );
          normalizedSourceUrl = params.defaultSourceAudioUrl;
        }
        // Приоритет 2: новая система анализа контекста
        else if (params?.chatId && params?.userMessage) {
          try {
            console.log("🔍 Analyzing audio context with new system...");
            const contextResult = await analyzeAudioContext(
              params.userMessage,
              params.chatId,
              params.currentAttachments
            );

            console.log("🔍 Context analysis result:", contextResult);

            if (contextResult.sourceUrl && contextResult.confidence !== "low") {
              console.log(
                "🔍 Using sourceUrl from new context analysis:",
                contextResult.sourceUrl,
                "confidence:",
                contextResult.confidence
              );
              normalizedSourceUrl = contextResult.sourceUrl;
            }
          } catch (error) {
            console.warn("🔍 Error in context analysis, falling back:", error);
          }
        }
        // Приоритет 3: AI-provided sourceAudioUrl
        else if (
          normalizedSourceUrl &&
          /^https?:\/\//.test(normalizedSourceUrl) &&
          !normalizedSourceUrl.startsWith("attachment://")
        ) {
          console.log(
            "🔍 Using AI-provided sourceAudioUrl:",
            normalizedSourceUrl
          );
        }
        // Fallback: text-to-audio
        else {
          console.log(
            "🔍 No valid source audio URL available, will be text-to-audio"
          );
          normalizedSourceUrl = undefined;
        }

        // Determine operation type and check balance
        const operationType = normalizedSourceUrl
          ? "audio-to-audio"
          : "text-to-audio";

        // const balanceCheck = await checkBalanceBeforeArtifact(
        //   params.session || null,
        //   "audio-generation",
        //   operationType,
        //   multipliers,
        //   getOperationDisplayName(operationType)
        // );

        // if (!balanceCheck.valid) {
        //   console.log("🎵 ❌ INSUFFICIENT BALANCE, NOT CREATING ARTIFACT");
        //   return {
        //     error:
        //       balanceCheck.userMessage ||
        //       "Недостаточно средств для генерации аудио",
        //     balanceError: true,
        //     requiredCredits: balanceCheck.cost,
        //   };
        // }

        // Create the audio document with all parameters
        const audioParams = {
          prompt,
          audioType: selectedAudioType,
          voice: selectedVoice,
          language: selectedLanguage,
          duration: selectedDuration.value || selectedDuration, // Извлекаем value для API
          model: selectedModel,
          seed: seed || undefined,
          batchSize: batchSize || 1,
          ...(normalizedSourceUrl
            ? { sourceAudioUrl: normalizedSourceUrl }
            : {}),
        };

        console.log("🎵 ✅ CREATING AUDIO DOCUMENT WITH PARAMS:", audioParams);
        console.log("🔍 Final sourceAudioUrl used:", normalizedSourceUrl);

        try {
          // AICODE-NOTE: For now we pass params as JSON in title for backward compatibility
          // TODO: Refactor to use proper parameter passing mechanism
          const result = await params.createDocument.execute({
            title: JSON.stringify(audioParams),
            kind: "audio",
          });

          console.log("🎵 ✅ CREATE DOCUMENT RESULT:", result);

          return {
            ...result,
            message: `I'm creating ${operationType.replace("-", " ")} with description: "${prompt}". Using model "${selectedModel.name}" with ${selectedVoice.label} voice in ${selectedLanguage.label} language and ${selectedDuration.label} duration. Artifact created and generation started.`,
          };
        } catch (error) {
          console.error("🎵 ❌ CREATE DOCUMENT ERROR:", error);
          throw error;
        }
      } catch (error: any) {
        console.error("🎵 ❌ ERROR CREATING AUDIO DOCUMENT:", error);
        return {
          error: `Failed to create audio document: ${error.message}`,
          fallbackConfig: config,
        };
      }
    },
  });

// Helper function to find audio type
export function findAudioType(
  typeName: string,
  availableTypes: MediaOption[]
): MediaOption | null {
  const normalizedTypeName = typeName.toLowerCase().trim();

  // Direct match by label or id
  let foundType = availableTypes.find(
    (type) =>
      type.label.toLowerCase() === normalizedTypeName ||
      type.id.toLowerCase() === normalizedTypeName
  );

  if (foundType) return foundType;

  // Partial match
  foundType = availableTypes.find(
    (type) =>
      type.label.toLowerCase().includes(normalizedTypeName) ||
      type.id.toLowerCase().includes(normalizedTypeName) ||
      normalizedTypeName.includes(type.label.toLowerCase()) ||
      normalizedTypeName.includes(type.id.toLowerCase())
  );

  return foundType || null;
}
