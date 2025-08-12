// Stripe API endpoint constants
export const STRIPE_ENDPOINTS = {
  // Customers
  CUSTOMERS: {
    CREATE: "/customers",
    GET: "/customers/:id",
    UPDATE: "/customers/:id",
    DELETE: "/customers/:id",
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    CREATE: "/subscriptions",
    GET: "/subscriptions/:id",
    UPDATE: "/subscriptions/:id",
    CANCEL: "/subscriptions/:id/cancel",
  },

  // Prices
  PRICES: {
    LIST: "/prices",
    GET: "/prices/:id",
  },

  // Checkout
  CHECKOUT: {
    SESSIONS: "/checkout/sessions",
    SESSION: "/checkout/sessions/:id",
  },
} as const;
