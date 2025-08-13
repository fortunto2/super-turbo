export interface StripePrices {
  single: string;
  bulk?: string;
}

export interface StripeConfig {
  prices: StripePrices;
  mode: "live" | "test";
}

export function useStripePrices(apiEndpoint?: string): {
  prices: StripePrices | null;
  mode: "live" | "test";
  loading: boolean;
  error: string | null;
};

export function useStripeConfig(apiEndpoint?: string): StripeConfig | null;