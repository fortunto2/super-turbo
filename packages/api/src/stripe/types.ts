// Stripe API types
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  created: number;
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  status: string;
  currentPeriodEnd: number;
  items: StripeSubscriptionItem[];
}

export interface StripeSubscriptionItem {
  id: string;
  priceId: string;
  quantity: number;
}

export interface StripePrice {
  id: string;
  productId: string;
  active: boolean;
  currency: string;
  unitAmount: number;
  recurring?: {
    interval: "day" | "week" | "month" | "year";
    intervalCount: number;
  };
}
