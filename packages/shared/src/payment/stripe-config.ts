/**
 * Общая конфигурация Stripe для turbo-super
 * Автоматически выбирает правильные цены на основе окружения
 */

export interface StripePrices {
  single: string;
  triple: string;
}

export interface StripeConfig {
  prices: StripePrices;
  mode: "live" | "test";
}

export const STRIPE_PRICES = {
  // Production prices (live mode)
  production: {
    single: "price_1Rkse5K9tHMoWhKiQ0tg0b2N", // $1.00 for 1 video
    triple: "price_1Rkse7K9tHMoWhKise2iYOXL", // $2.00 for 3 videos
  },
  // Test prices (test mode)
  test: {
    single: "price_1RktnoK9tHMoWhKim5uqXiAe", // $1.00 for 1 video (TEST)
    triple: "price_1Rkto1K9tHMoWhKinvpEwntH", // $2.00 for 3 videos (TEST)
  },
};

// Auto-select prices based on environment
export const getCurrentPrices = (): StripePrices => {
  const isLiveMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_");

  if (isLiveMode) {
    return STRIPE_PRICES.production;
  }
  return STRIPE_PRICES.test;
};

// Helper functions
export const getSingleVideoPrice = (): string => getCurrentPrices().single;
export const getTripleVideoPrice = (): string => getCurrentPrices().triple;

// Export current prices for easy access
export const CURRENT_PRICES = getCurrentPrices();

// Get current mode
export const getCurrentMode = (): "live" | "test" => {
  const isLiveMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_");
  return isLiveMode ? "live" : "test";
};

// Get full config
export const getStripeConfig = (): StripeConfig => ({
  prices: getCurrentPrices(),
  mode: getCurrentMode(),
});

// Log current configuration in development
if (process.env.NODE_ENV === "development") {
  console.log("🏪 Stripe Configuration:", {
    isLiveMode: getCurrentMode() === "live",
    currentPrices: CURRENT_PRICES,
    mode: getCurrentMode(),
  });
}
