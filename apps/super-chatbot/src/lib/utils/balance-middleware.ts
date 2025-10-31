import type { NextResponse } from 'next/server';
import {
  validateOperationBalance,
  deductOperationBalance,
} from './tools-balance';
import {
  handleBalanceError,
  createBalanceError,
  createBalanceErrorResponse,
} from './balance-error-handler';

/**
 * Middleware для проверки баланса в артефактах
 */
export async function checkBalanceForArtifact(
  userId: string,
  operation: 'image-generation' | 'video-generation' | 'script-generation',
  operationType: string,
  multipliers: string[],
): Promise<{ valid: boolean; errorContent?: string }> {
  const balanceValidation = await validateOperationBalance(
    userId,
    operation,
    operationType,
    multipliers,
  );

  if (!balanceValidation.valid) {
    const balanceError = createBalanceError(balanceValidation);
    const errorContent = handleBalanceError(balanceError, operationType);

    return { valid: false, errorContent };
  }

  return { valid: true };
}

/**
 * Middleware для проверки баланса в API маршрутах
 */
export async function checkBalanceForAPI(
  userId: string,
  operation: 'image-generation' | 'video-generation' | 'script-generation',
  operationType: string,
  multipliers: string[],
): Promise<{ valid: boolean; errorResponse?: NextResponse }> {
  const balanceValidation = await validateOperationBalance(
    userId,
    operation,
    operationType,
    multipliers,
  );

  if (!balanceValidation.valid) {
    const errorResponse = createBalanceErrorResponse(
      balanceValidation,
      operationType,
    );

    return {
      valid: false,
      errorResponse: Response.json(errorResponse, {
        status: 402,
      }) as NextResponse,
    };
  }

  return { valid: true };
}

/**
 * Списание баланса после успешной операции
 */
export async function deductBalanceAfterSuccess(
  userId: string,
  operation: 'image-generation' | 'video-generation' | 'script-generation',
  operationType: string,
  multipliers: string[],
  operationDetails: Record<string, any>,
): Promise<void> {
  try {
    await deductOperationBalance(
      userId,
      operation,
      operationType,
      multipliers,
      operationDetails,
    );
    console.log(
      `💳 Balance deducted for user ${userId} after ${operationType}`,
    );
  } catch (balanceError) {
    console.error(
      `⚠️ Failed to deduct balance after ${operationType}:`,
      balanceError,
    );
    // Продолжаем выполнение - операция уже завершена
  }
}

/**
 * Полный пример использования для артефакта
 */
export async function withBalanceCheck<T>(
  userId: string,
  operation: 'image-generation' | 'video-generation' | 'script-generation',
  operationType: string,
  multipliers: string[],
  callback: () => Promise<T>,
  operationDetails?: Record<string, any>,
): Promise<T | string> {
  // Проверка баланса
  const { valid, errorContent } = await checkBalanceForArtifact(
    userId,
    operation,
    operationType,
    multipliers,
  );

  if (!valid) {
    return errorContent || 'Insufficient balance';
  }

  // Выполнение операции
  const result = await callback();

  // Списание баланса после успешной операции
  if (operationDetails) {
    await deductBalanceAfterSuccess(
      userId,
      operation,
      operationType,
      multipliers,
      operationDetails,
    );
  }

  return result;
}
