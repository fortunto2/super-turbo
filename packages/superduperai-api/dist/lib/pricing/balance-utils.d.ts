import { TOOLS_PRICING } from "./tools-pricing";
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
export declare function checkOperationBalance(currentBalance: number, toolCategory: keyof typeof TOOLS_PRICING, operationType: string, multipliers?: string[]): BalanceCheckResult;
/**
 * Calculate the cost for an operation without checking balance
 */
export declare function getOperationCost(toolCategory: keyof typeof TOOLS_PRICING, operationType: string, multipliers?: string[]): number;
/**
 * Create a balance transaction record
 */
export declare function createBalanceTransaction(userId: string, operationType: string, operationCategory: string, balanceBefore: number, balanceAfter: number, metadata?: Record<string, any>): BalanceTransaction;
/**
 * Get pricing information for UI display
 */
export declare function getPricingInfo(toolCategory: keyof typeof TOOLS_PRICING, operationType: string): {
    baseCost: any;
    name: any;
    description: any;
    multipliers: any;
} | null;
//# sourceMappingURL=balance-utils.d.ts.map