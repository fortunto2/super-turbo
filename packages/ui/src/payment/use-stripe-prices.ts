"use client";

import { useState, useEffect } from "react";
import type { StripePrices, StripeConfig } from "@turbo-super/shared";

interface StripePricesResponse {
  success: boolean;
  prices: StripePrices;
  mode: "live" | "test";
}

export function useStripePrices(apiEndpoint = "/api/stripe-prices") {
  const [prices, setPrices] = useState<StripePrices | null>(null);
  const [mode, setMode] = useState<"live" | "test">("test");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(apiEndpoint);
        const data: StripePricesResponse = await response.json();

        if (data.success) {
          setPrices(data.prices);
          setMode(data.mode);
        } else {
          setError("Failed to fetch prices");
        }
      } catch (err) {
        setError("Network error");
        console.error("Error fetching Stripe prices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [apiEndpoint]);

  return { prices, mode, loading, error };
}

export function useStripeConfig(
  apiEndpoint = "/api/stripe-prices"
): StripeConfig | null {
  const { prices, mode, loading, error } = useStripePrices(apiEndpoint);

  if (loading || error || !prices) {
    return null;
  }

  return { prices, mode };
}
