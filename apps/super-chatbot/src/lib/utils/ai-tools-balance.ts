import type { Session } from "next-auth";
import { validateOperationBalance } from "./tools-balance";

export interface BalanceCheckResult {
  valid: boolean;
  error?: string;
  cost?: number;
  userMessage?: string;
}

/**
 * Проверяет баланс пользователя перед созданием артефакта
 * Возвращает понятное сообщение для пользователя при недостатке средств
 */
export async function checkBalanceBeforeArtifact(
  session: Session | null,
  operation: string,
  operationType: string,
  multipliers: string[] = [],
  operationDisplayName: string
): Promise<BalanceCheckResult> {
  // Если пользователь не авторизован, разрешаем операцию
  // (может быть гостевой режим или другая логика)
  if (!session?.user?.id) {
    return { valid: true };
  }

  console.log(
    `💳 Checking balance for ${operationType} before creating artifact...`
  );

  try {
    const balanceValidation = await validateOperationBalance(
      session.user.id,
      operation,
      operationType,
      multipliers
    );

    if (!balanceValidation.valid) {
      console.error(`💳 Insufficient balance for ${operationType}`);

      const userMessage = formatBalanceErrorForUser(
        balanceValidation,
        operationDisplayName
      );

      return {
        valid: false,
        error: balanceValidation.error,
        cost: balanceValidation.cost,
        userMessage,
      };
    }

    console.log(
      `💳 Balance validated: ${balanceValidation.cost} credits required for ${operationType}`
    );

    return { valid: true, cost: balanceValidation.cost };
  } catch (error) {
    console.error(`💳 Error checking balance for ${operationType}:`, error);
    return {
      valid: false,
      error: "Ошибка проверки баланса",
      userMessage: `Не удалось проверить баланс для ${operationDisplayName}. Попробуйте позже.`,
    };
  }
}

/**
 * Форматирует ошибку баланса для отображения пользователю
 */
function formatBalanceErrorForUser(
  balanceValidation: { error?: string; cost?: number },
  operationDisplayName: string
): string {
  if (balanceValidation.cost) {
    return `Недостаточно средств для ${operationDisplayName}. Требуется: ${balanceValidation.cost} кредитов. Пожалуйста, пополните баланс.`;
  }

  return `Недостаточно средств для ${operationDisplayName}. ${balanceValidation.error || "Пополните баланс."}`;
}

/**
 * Получает человекочитаемое название операции для AI tools
 */
export function getOperationDisplayName(operationType: string): string {
  const operationNames: Record<string, string> = {
    "text-to-image": "генерации изображения",
    "image-to-image": "редактирования изображения",
    "text-to-video": "генерации видео",
    "image-to-video": "создания видео из изображения",
    "basic-script": "генерации сценария",
    "image-generation": "генерации изображения",
    "video-generation": "генерации видео",
    "script-generation": "генерации сценария",
  };

  return operationNames[operationType] || operationType;
}
