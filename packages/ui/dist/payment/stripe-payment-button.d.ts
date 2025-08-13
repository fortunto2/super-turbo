import * as React from "react";

export interface StripePaymentButtonProps {
  prompt?: string;
  onPaymentClick?: () => void;
  toolSlug?: string;
  toolTitle?: string;
  variant?: "video" | "credits";
  creditAmount?: number;
  price?: number;
  apiEndpoint?: string;
  checkoutEndpoint?: string;
  className?: string;
  locale?: string;
  t?: (key: string, params?: Record<string, string | number>) => string;
}

export declare const StripePaymentButton: React.ForwardRefExoticComponent<
  StripePaymentButtonProps & React.RefAttributes<HTMLDivElement>
>;