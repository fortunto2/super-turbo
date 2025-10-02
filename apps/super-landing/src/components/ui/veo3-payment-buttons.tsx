"use client";

import { StripePaymentButton } from "@turbo-super/payment";

interface Veo3PaymentButtonsProps {
  prompt: string;
  onPaymentClick: () => void;
  toolSlug?: string;
  toolTitle?: string;
  locale?: string;
}

export function Veo3PaymentButtons({
  prompt,
  onPaymentClick,
  toolSlug,
  toolTitle,
  locale,
}: Veo3PaymentButtonsProps) {
  return (
    <StripePaymentButton
      prompt={prompt}
      onPaymentClick={onPaymentClick}
      toolSlug={toolSlug || ""}
      toolTitle={toolTitle || ""}
      variant="video"
      price={1.0}
      apiEndpoint="/api/stripe-prices"
      checkoutEndpoint="/api/create-checkout"
      locale={locale || "en"}
    />
  );
}
