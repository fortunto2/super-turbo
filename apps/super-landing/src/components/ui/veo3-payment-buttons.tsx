"use client";

import { useTranslation } from "@turbo-super/features";
import { StripePaymentButton } from "@turbo-super/ui";

interface Veo3PaymentButtonsProps {
  prompt: string;
  onPaymentClick?: () => void;
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
  const { t } = useTranslation();
  return (
    <StripePaymentButton
      prompt={prompt}
      onPaymentClick={onPaymentClick}
      toolSlug={toolSlug}
      toolTitle={toolTitle}
      variant="video"
      price={1.0}
      apiEndpoint="/api/stripe-prices"
      checkoutEndpoint="/api/create-checkout"
      t={t}
      locale={locale}
    />
  );
}
