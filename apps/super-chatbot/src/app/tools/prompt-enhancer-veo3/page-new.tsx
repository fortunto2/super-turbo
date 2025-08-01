"use client";

import { Veo3PromptGenerator } from "@turbo-super/veo3-tools";
import type { PromptData, MoodboardImage } from "@turbo-super/veo3-tools";
import { enhancePromptVeo3 } from "@/lib/ai/api/enhance-prompt-veo3";

export default function Veo3PromptGeneratorPage() {
  const enhancePromptFunction = async (params: {
    prompt: string;
    customLimit: number;
    model: string;
    focusType?: string;
    includeAudio: boolean;
    promptData: PromptData;
    moodboard?: {
      enabled: boolean;
      images: MoodboardImage[];
    };
  }) => {
    const response = await enhancePromptVeo3({
      body: JSON.stringify(params),
    });
    return response;
  };

  return (
    <Veo3PromptGenerator
      enhancePromptFunction={enhancePromptFunction}
      showInfoBanner={true}
    />
  );
}
