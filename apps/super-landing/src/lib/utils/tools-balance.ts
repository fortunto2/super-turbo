// Демо-система баланса для super-landing
// В реальном приложении здесь была бы интеграция с базой данных

import {
  calculateOperationCost,
  createBalanceTransaction,
  type BalanceTransaction,
} from "@turbo-super/superduperai-api";

// Простое хранилище баланса в памяти для демо
const demoBalances = new Map<string, number>();

/**
 * Get demo balance for user
 */
function getDemoBalance(userId: string): number {
  if (!demoBalances.has(userId)) {
    demoBalances.set(userId, 0); // Начальный баланс - 0 кредитов
  }
  return demoBalances.get(userId)!;
}

/**
 * Set demo balance for user
 */
function setDemoBalance(userId: string, balance: number): void {
  demoBalances.set(userId, balance);
}

/**
 * Validate operation before execution
 */
export async function validateOperationBalance(
  userId: string,
  toolCategory: string,
  operationType: string,
  multipliers: string[] = []
): Promise<{ valid: boolean; error?: string; cost?: number }> {
  const cost = calculateOperationCost(
    toolCategory as any,
    operationType,
    multipliers
  );
  const currentBalance = getDemoBalance(userId);

  if (currentBalance < cost) {
    return {
      valid: false,
      error: `Insufficient balance. Required: ${cost} credits, Available: ${currentBalance} credits`,
      cost,
    };
  }

  return { valid: true, cost };
}

/**
 * Deduct balance after successful operation
 */
export async function deductOperationBalance(
  userId: string,
  toolCategory: string,
  operationType: string,
  multipliers: string[] = [],
  metadata?: Record<string, any>
): Promise<BalanceTransaction> {
  const cost = calculateOperationCost(
    toolCategory as any,
    operationType,
    multipliers
  );
  const balanceBefore = getDemoBalance(userId);

  if (balanceBefore < cost) {
    throw new Error(
      `Insufficient balance. Required: ${cost}, Available: ${balanceBefore}`
    );
  }

  const balanceAfter = balanceBefore - cost;
  setDemoBalance(userId, balanceAfter);

  const transaction = createBalanceTransaction(
    userId,
    operationType,
    toolCategory,
    balanceBefore,
    balanceAfter,
    metadata
  );

  console.log(
    `💳 Demo balance deducted for user ${userId}: ${operationType} (${toolCategory}) - Cost: ${cost} credits (${balanceBefore} → ${balanceAfter})`
  );

  return transaction;
}

/**
 * Get current demo balance
 */
export function getCurrentDemoBalance(userId: string): number {
  return getDemoBalance(userId);
}
