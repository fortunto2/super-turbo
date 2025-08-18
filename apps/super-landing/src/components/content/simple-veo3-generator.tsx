"use client";

import { useParams } from "next/navigation";
import {
  Veo3PromptGenerator,
  PromptDataType,
  MoodboardImageType,
} from "@turbo-super/features";
import { getValidLocale } from "@/lib/get-valid-locale";

// Define types from exported values
type PromptData = typeof PromptDataType;
type MoodboardImage = typeof MoodboardImageType;

export function SimpleVeo3Generator() {
  const params = useParams();
  const locale = getValidLocale(params.locale);
  const enhancePromptFunction = async (enhanceParams: {
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
    const response = await fetch("/api/enhance-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...enhanceParams,
      }),
    });
    return response.json();
  };

  return (
    <div className="max-w-7xl veo3-fixes">
      {/* Credit Balance Section */}
      {/* <div className="mb-6">
        <StripePaymentButton
          variant="video"
          toolSlug="veo3-prompt-generator"
          toolTitle="VEO3 Video Generator"
          price={1.0}
          apiEndpoint="/api/stripe-prices"
          checkoutEndpoint="/api/create-checkout"
          className="border-0 shadow-none"
          locale={locale}
          t={translateWithParams}
        />
      </div> */}

      <Veo3PromptGenerator
        enhancePromptFunction={enhancePromptFunction}
        MoodboardUploader={undefined}
        showInfoBanner={true}
        locale={locale}
      />
    </div>
  );
}
