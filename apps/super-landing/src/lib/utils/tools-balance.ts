// Демо-система баланса для super-landing
// В реальном приложении здесь была бы интеграция с базой данных

import {
  calculateOperationCost,
  createBalanceTransaction,
  type BalanceTransaction,
} from "@turbo-super/superduperai-api";
import { getUserBalance, setUserBalance, incrementUserBalance } from "@/lib/kv";

// Простое хранилище баланса в памяти для демо (fallback, если Redis недоступен)
const demoBalances = new Map<string, number>();

/**
 * Get demo balance for user
 */
async function getDemoBalance(userId: string): Promise<number> {
  // Пробуем Redis
  const persisted = await getUserBalance(userId);
  if (persisted != null) return persisted;
  // Фоллбек в память
  if (!demoBalances.has(userId)) demoBalances.set(userId, 0);
  return demoBalances.get(userId)!;
}

/**
 * Set demo balance for user
 */
async function setDemoBalance(userId: string, balance: number): Promise<void> {
  // Сохраняем в Redis, фоллбек в память
  await setUserBalance(userId, balance);
  demoBalances.set(userId, balance);
}

/**
 * Add demo balance to user
 */
export async function addDemoBalance(
  userId: string,
  amount: number
): Promise<number> {
  // Пробуем атомарное увеличение в Redis
  const inc = await incrementUserBalance(userId, amount);
  if (inc != null) {
    demoBalances.set(userId, inc);
    console.log(
      `💰 Demo balance added for user ${userId}: +${amount} credits (${inc - amount} → ${inc})`
    );
    return inc;
  }
  const currentBalance = await getDemoBalance(userId);
  const newBalance = currentBalance + amount;
  await setDemoBalance(userId, newBalance);
  console.log(
    `💰 Demo balance added for user ${userId}: +${amount} credits (${currentBalance} → ${newBalance})`
  );
  return newBalance;
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
  const currentBalance = await getDemoBalance(userId);

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
  const balanceBefore = await getDemoBalance(userId);

  if (balanceBefore < cost) {
    throw new Error(
      `Insufficient balance. Required: ${cost}, Available: ${balanceBefore}`
    );
  }

  const balanceAfter = balanceBefore - cost;
  await setDemoBalance(userId, balanceAfter);

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
export async function getCurrentDemoBalance(userId: string): Promise<number> {
  return getDemoBalance(userId);
}
