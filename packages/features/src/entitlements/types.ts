// Entitlements types

export interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: string[];
  maxImageGenerationsPerDay?: number;
  maxVideoGenerationsPerDay?: number;
  maxScriptGenerationsPerDay?: number;
  maxPromptEnhancementsPerDay?: number;
  vipAccess?: boolean;
  customModelAccess?: boolean;
  prioritySupport?: boolean;
}

export type UserType = 'guest' | 'regular' | 'premium' | 'vip';

export interface UserEntitlements {
  userType: UserType;
  entitlements: Entitlements;
  isActive: boolean;
  expiresAt?: Date;
  features: string[];
}

export interface FeatureAccess {
  featureId: string;
  isEnabled: boolean;
  usageLimit?: number;
  usageCount: number;
  resetDate: Date;
}

export interface EntitlementCheck {
  hasAccess: boolean;
  reason?: string;
  remainingUsage?: number;
  nextReset?: Date;
}
