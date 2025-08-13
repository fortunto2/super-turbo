// Balance management types
export interface UserBalance {
  userId: string;
  credits: number;
  currency: string;
  lastUpdated: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "purchase" | "usage" | "refund" | "bonus";
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CreditUsage {
  service: "image-generation" | "video-generation" | "audio-generation";
  cost: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface BalanceConfig {
  imageGenerationCost: number;
  videoGenerationCost: number;
  audioGenerationCost: number;
  currency: string;
  minCreditsForPurchase: number;
}
