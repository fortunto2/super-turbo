// Entitlements configuration

import type { Entitlements, UserType } from './types';

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: ["chat-model", "chat-model-reasoning", "o3-reasoning", "o3-pro-reasoning"],
    maxImageGenerationsPerDay: 5,
    maxVideoGenerationsPerDay: 2,
    maxScriptGenerationsPerDay: 3,
    maxPromptEnhancementsPerDay: 5,
    vipAccess: false,
    customModelAccess: false,
    prioritySupport: false,
  },
  regular: {
    maxMessagesPerDay: 1000,
    availableChatModelIds: ["chat-model", "chat-model-reasoning", "o3-reasoning", "o3-pro-reasoning"],
    maxImageGenerationsPerDay: 50,
    maxVideoGenerationsPerDay: 20,
    maxScriptGenerationsPerDay: 30,
    maxPromptEnhancementsPerDay: 50,
    vipAccess: false,
    customModelAccess: false,
    prioritySupport: false,
  },
  premium: {
    maxMessagesPerDay: 5000,
    availableChatModelIds: ["chat-model", "chat-model-reasoning", "o3-reasoning", "o3-pro-reasoning"],
    maxImageGenerationsPerDay: 200,
    maxVideoGenerationsPerDay: 100,
    maxScriptGenerationsPerDay: 150,
    maxPromptEnhancementsPerDay: 200,
    vipAccess: false,
    customModelAccess: true,
    prioritySupport: true,
  },
  vip: {
    maxMessagesPerDay: 10000,
    availableChatModelIds: ["chat-model", "chat-model-reasoning", "o3-reasoning", "o3-pro-reasoning"],
    maxImageGenerationsPerDay: 500,
    maxVideoGenerationsPerDay: 250,
    maxScriptGenerationsPerDay: 300,
    maxPromptEnhancementsPerDay: 500,
    vipAccess: true,
    customModelAccess: true,
    prioritySupport: true,
  },
};

export function getUserEntitlements(userType: UserType): Entitlements {
  return entitlementsByUserType[userType] || entitlementsByUserType.guest;
}

export function hasFeatureAccess(userType: UserType, featureId: string): boolean {
  const entitlements = getUserEntitlements(userType);
  
  switch (featureId) {
    case 'image-generation':
      return (entitlements.maxImageGenerationsPerDay || 0) > 0;
    case 'video-generation':
      return (entitlements.maxVideoGenerationsPerDay || 0) > 0;
    case 'script-generation':
      return (entitlements.maxScriptGenerationsPerDay || 0) > 0;
    case 'prompt-enhancement':
      return (entitlements.maxPromptEnhancementsPerDay || 0) > 0;
    case 'vip-access':
      return entitlements.vipAccess || false;
    case 'custom-model-access':
      return entitlements.customModelAccess || false;
    case 'priority-support':
      return entitlements.prioritySupport || false;
    default:
      return false;
  }
}

/**
 * Get available chat models for a user type
 */
export function getAvailableChatModels(userType: UserType): string[] {
  const entitlements = getUserEntitlements(userType);
  return entitlements.availableChatModelIds;
}

/**
 * Check if user can use a specific chat model
 */
export function canUseChatModel(
  userType: UserType,
  modelId: string
): boolean {
  const availableModels = getAvailableChatModels(userType);
  return availableModels.includes(modelId);
}

/**
 * Get usage limits for a user type
 */
export function getUsageLimits(userType: UserType) {
  const entitlements = getUserEntitlements(userType);
  return {
    messages: entitlements.maxMessagesPerDay,
    images: entitlements.maxImageGenerationsPerDay || 0,
    videos: entitlements.maxVideoGenerationsPerDay || 0,
    scripts: entitlements.maxScriptGenerationsPerDay || 0,
    promptEnhancements: entitlements.maxPromptEnhancementsPerDay || 0,
  };
}
