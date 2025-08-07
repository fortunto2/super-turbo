import type { UserType } from "@/app/(auth)/auth";
import {
  TOOLS_PRICING,
  FREE_BALANCE_BY_USER_TYPE as SHARED_FREE_BALANCE,
  type ToolOperation,
  calculateOperationCost,
  getToolOperations,
  getToolPricingDisplay,
} from "@turbo-super/superduperai-api";

// Re-export shared pricing configuration
export {
  TOOLS_PRICING,
  type ToolOperation,
  calculateOperationCost,
  getToolOperations,
  getToolPricingDisplay,
};

/**
 * Free balance allocations for different user types
 * Extends the shared configuration with local user types
 */
export const FREE_BALANCE_BY_USER_TYPE: Record<UserType, number> = {
  ...SHARED_FREE_BALANCE,
  // Add any local user types here if needed
};

/**
 * Examples of common operations and their costs
 */
export const PRICING_EXAMPLES = {
  "Basic image generation": calculateOperationCost(
    "image-generation",
    "text-to-image"
  ),
  "High-quality image": calculateOperationCost(
    "image-generation",
    "text-to-image",
    ["high-quality"]
  ),
  "Short video (5s)": calculateOperationCost(
    "video-generation",
    "text-to-video",
    ["duration-5s"]
  ),
  "HD video (10s)": calculateOperationCost(
    "video-generation",
    "text-to-video",
    ["duration-10s", "hd-quality"]
  ),
  "Script generation": calculateOperationCost(
    "script-generation",
    "basic-script"
  ),
  "Prompt enhancement": calculateOperationCost(
    "prompt-enhancement",
    "basic-enhancement"
  ),
} as const;
