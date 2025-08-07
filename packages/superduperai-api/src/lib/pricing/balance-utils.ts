import { calculateOperationCost, TOOLS_PRICING } from "./tools-pricing";

export interface BalanceTransaction {
  userId: string;
  operationType: string;
  operationCategory: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface BalanceCheckResult {
  hasEnoughBalance: boolean;
  currentBalance: number;
  requiredBalance: number;
  shortfall?: number;
}

/**
 * Check if user has enough balance for an operation
 */
export function checkOperationBalance(
  currentBalance: number,
  toolCategory: keyof typeof TOOLS_PRICING,
  operationType: string,
  multipliers: string[] = []
): BalanceCheckResult {
  const requiredBalance = calculateOperationCost(
    toolCategory,
    operationType,
    multipliers
  );
  const hasEnoughBalance = currentBalance >= requiredBalance;
  const shortfall = hasEnoughBalance ? 0 : requiredBalance - currentBalance;

  return {
    hasEnoughBalance,
    currentBalance,
    requiredBalance,
    shortfall,
  };
}

/**
 * Calculate the cost for an operation without checking balance
 */
export function getOperationCost(
  toolCategory: keyof typeof TOOLS_PRICING,
  operationType: string,
  multipliers: string[] = []
): number {
  return calculateOperationCost(toolCategory, operationType, multipliers);
}

/**
 * Create a balance transaction record
 */
export function createBalanceTransaction(
  userId: string,
  operationType: string,
  operationCategory: string,
  balanceBefore: number,
  balanceAfter: number,
  metadata?: Record<string, any>
): BalanceTransaction {
  return {
    userId,
    operationType,
    operationCategory,
    amount: balanceAfter - balanceBefore,
    balanceBefore,
    balanceAfter,
    timestamp: new Date(),
    metadata,
  };
}

/**
 * Get pricing information for UI display
 */
export function getPricingInfo(
  toolCategory: keyof typeof TOOLS_PRICING,
  operationType: string
) {
  const tool = TOOLS_PRICING[toolCategory];
  if (!tool) return null;

  const operation = tool[operationType as keyof typeof tool] as any;
  if (!operation) return null;

  return {
    baseCost: operation.baseCost,
    name: operation.name,
    description: operation.description,
    multipliers: operation.costMultipliers,
  };
}
