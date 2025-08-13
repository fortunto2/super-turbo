"use client";

import { StripePaymentButton } from '@turbo-super/ui';

interface Veo3PaymentButtonsProps {
  prompt: string;
  onPaymentClick?: () => void;
  toolSlug?: string;
  toolTitle?: string;
}

export function Veo3PaymentButtons({
  prompt,
  onPaymentClick,
  toolSlug,
  toolTitle,
}: Veo3PaymentButtonsProps) {
  return (
    <StripePaymentButton
      prompt={prompt}
      onPaymentClick={onPaymentClick}
      toolSlug={toolSlug}
      toolTitle={toolTitle}
      variant="video"
      price={1.00}
      apiEndpoint="/api/stripe-prices"
      checkoutEndpoint="/api/create-checkout"
    />
  );
}
