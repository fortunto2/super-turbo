"use client";

import { Veo3PromptGenerator, PromptDataType, MoodboardImageType } from "@turbo-super/features";
import { enhancePromptVeo3 } from "@/lib/ai/api/enhance-prompt-veo3";

// Define types from exported values
type PromptData = typeof PromptDataType;
type MoodboardImage = typeof MoodboardImageType;

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
      MoodboardUploader={undefined}
      showInfoBanner={true}
    />
  );
}
