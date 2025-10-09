import type { DataStreamWriter } from 'ai';

export interface BalanceError {
  type: 'insufficient_balance' | 'payment_required' | 'quota_exceeded';
  message: string;
  cost?: number;
  availableCredits?: number;
  requiredCredits?: number;
}

/**
 * Централизованная обработка ошибок баланса
 * Записывает ошибку в dataStream и возвращает JSON с ошибкой
 */
export function handleBalanceError(
  error: BalanceError,
  dataStream: DataStreamWriter,
  operationType = 'operation',
): string {
  const errorMessage = formatBalanceErrorMessage(error, operationType);

  console.error(`💳 Balance error for ${operationType}:`, error);

  // AICODE-NOTE: AI SDK 5.0 - custom 'error' type removed
  // Errors are now thrown and handled by the framework
  // Balance errors should be returned in tool response, not streamed

  // Возвращаем JSON с ошибкой для сохранения в документе
  return JSON.stringify({
    status: 'failed',
    error: errorMessage,
    errorType: error.type,
    timestamp: Date.now(),
  });
}

/**
 * Форматирует сообщение об ошибке баланса для пользователя
 */
function formatBalanceErrorMessage(
  error: BalanceError,
  operationType: string,
): string {
  switch (error.type) {
    case 'insufficient_balance':
      if (error.requiredCredits && error.availableCredits !== undefined) {
        return `Недостаточно средств для ${getOperationDisplayName(operationType)}. Требуется: ${error.requiredCredits} кредитов, доступно: ${error.availableCredits} кредитов. Пожалуйста, пополните баланс.`;
      }
      return `Недостаточно средств для ${getOperationDisplayName(operationType)}. ${error.message}`;

    case 'payment_required':
      return `Для выполнения ${getOperationDisplayName(operationType)} требуется оплата. ${error.message}`;

    case 'quota_exceeded':
      return `Превышен лимит для ${getOperationDisplayName(operationType)}. ${error.message}`;

    default:
      return `Ошибка при выполнении ${getOperationDisplayName(operationType)}: ${error.message}`;
  }
}

/**
 * Получает человекочитаемое название операции
 */
function getOperationDisplayName(operationType: string): string {
  const operationNames: Record<string, string> = {
    'text-to-image': 'генерации изображения',
    'image-to-image': 'редактирования изображения',
    'text-to-video': 'генерации видео',
    'image-to-video': 'создания видео из изображения',
    'image-generation': 'генерации изображения',
    'video-generation': 'генерации видео',
    operation: 'операции',
  };

  return operationNames[operationType] || operationType;
}

/**
 * Создает BalanceError из результата validateOperationBalance
 */
export function createBalanceError(
  balanceValidation: { valid: boolean; error?: string; cost?: number },
  availableCredits?: number,
): BalanceError {
  return {
    type: 'insufficient_balance',
    message: balanceValidation.error || 'Недостаточно средств',
    ...(balanceValidation.cost !== undefined && {
      cost: balanceValidation.cost,
    }),
    ...(balanceValidation.cost !== undefined && {
      requiredCredits: balanceValidation.cost,
    }),
    ...(availableCredits !== undefined && { availableCredits }),
  };
}

/**
 * Создает ответ об ошибке баланса для API маршрутов
 */
export function createBalanceErrorResponse(
  balanceValidation: { valid: boolean; error?: string; cost?: number },
  operationType = 'operation',
) {
  const balanceError = createBalanceError(balanceValidation);
  const errorMessage = formatBalanceErrorMessage(balanceError, operationType);

  console.error(`💳 Balance error for ${operationType}:`, balanceError);

  return {
    success: false,
    error: 'Insufficient balance',
    message: errorMessage,
    details: balanceValidation.error,
    requiredCredits: balanceValidation.cost,
    errorType: balanceError.type,
  };
}
