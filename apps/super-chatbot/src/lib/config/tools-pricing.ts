import type { UserType } from "@/app/(auth)/auth";
import {
  TOOLS_PRICING,
  calculateOperationCost,
  getOperationCost,
  getPricingInfo,
} from "@turbo-super/api";

// Re-export shared pricing configuration
export {
  TOOLS_PRICING,
  calculateOperationCost,
  getOperationCost,
  getPricingInfo,
};

/**
 * Free balance allocations for different user types
 * Extends the shared configuration with local user types
 */
export const FREE_BALANCE_BY_USER_TYPE: Record<UserType, number> = {
  guest: 100,
  regular: 500,
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
