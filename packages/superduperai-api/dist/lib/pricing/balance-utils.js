import { calculateOperationCost, TOOLS_PRICING } from "./tools-pricing";
/**
 * Check if user has enough balance for an operation
 */
export function checkOperationBalance(currentBalance, toolCategory, operationType, multipliers = []) {
    const requiredBalance = calculateOperationCost(toolCategory, operationType, multipliers);
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
export function getOperationCost(toolCategory, operationType, multipliers = []) {
    return calculateOperationCost(toolCategory, operationType, multipliers);
}
/**
 * Create a balance transaction record
 */
export function createBalanceTransaction(userId, operationType, operationCategory, balanceBefore, balanceAfter, metadata) {
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
export function getPricingInfo(toolCategory, operationType) {
    const tool = TOOLS_PRICING[toolCategory];
    if (!tool)
        return null;
    const operation = tool[operationType];
    if (!operation)
        return null;
    return {
        baseCost: operation.baseCost,
        name: operation.name,
        description: operation.description,
        multipliers: operation.costMultipliers,
    };
}
//# sourceMappingURL=balance-utils.js.map