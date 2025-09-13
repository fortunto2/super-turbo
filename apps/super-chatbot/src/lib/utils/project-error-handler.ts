import { addUserBalance } from "./tools-balance";
import {
  deleteUserProject,
  updateProjectStatus,
  type ProjectStatus,
} from "@/lib/db/project-queries";

export interface ProjectError {
  type: "prefect_failure" | "api_failure" | "balance_error" | "unknown";
  message: string;
  projectId: string;
  userId: string;
  creditsUsed: number;
  originalError?: any;
}

/**
 * Обрабатывает ошибки проекта и выполняет откат транзакций
 */
export async function handleProjectError(error: ProjectError): Promise<void> {
  console.error(`🚨 Project error for ${error.projectId}:`, error);

  try {
    // 1. Обновляем статус проекта на "failed"
    await updateProjectStatus(error.projectId, "failed", error.message);

    // 2. Возвращаем кредиты пользователю, если они были списаны
    if (error.creditsUsed > 0) {
      try {
        await addUserBalance(
          error.userId,
          error.creditsUsed,
          `Refund for failed project ${error.projectId}`,
          {
            projectId: error.projectId,
            errorType: error.type,
            originalError: error.originalError,
            timestamp: new Date().toISOString(),
          }
        );
        console.log(
          `💰 Refunded ${error.creditsUsed} credits to user ${error.userId} for failed project ${error.projectId}`
        );
      } catch (refundError) {
        console.error(
          `❌ Failed to refund credits for project ${error.projectId}:`,
          refundError
        );
        // Не прерываем выполнение, если не удалось вернуть кредиты
      }
    }

    // 3. Логируем ошибку для мониторинга
    console.error(
      `📊 Project ${error.projectId} marked as failed: ${error.message}`
    );
  } catch (handlerError) {
    console.error(
      `❌ Critical error in project error handler for ${error.projectId}:`,
      handlerError
    );
    // В случае критической ошибки, пытаемся хотя бы удалить проект
    try {
      await deleteUserProject(error.projectId);
      console.log(`🗑️ Emergency cleanup: deleted project ${error.projectId}`);
    } catch (cleanupError) {
      console.error(
        `💥 Emergency cleanup failed for project ${error.projectId}:`,
        cleanupError
      );
    }
  }
}

/**
 * Создает объект ошибки проекта
 */
export function createProjectError(
  type: ProjectError["type"],
  message: string,
  projectId: string,
  userId: string,
  creditsUsed: number = 0,
  originalError?: any
): ProjectError {
  return {
    type,
    message,
    projectId,
    userId,
    creditsUsed,
    originalError,
  };
}

/**
 * Обрабатывает ошибку Prefect пайплайна
 */
export async function handlePrefectError(
  projectId: string,
  userId: string,
  creditsUsed: number,
  error: any
): Promise<void> {
  const projectError = createProjectError(
    "prefect_failure",
    `Prefect pipeline failed: ${error.message || "Unknown error"}`,
    projectId,
    userId,
    creditsUsed,
    error
  );

  await handleProjectError(projectError);
}

/**
 * Обрабатывает ошибку API
 */
export async function handleApiError(
  projectId: string,
  userId: string,
  creditsUsed: number,
  error: any
): Promise<void> {
  const projectError = createProjectError(
    "api_failure",
    `API error: ${error.message || "Unknown API error"}`,
    projectId,
    userId,
    creditsUsed,
    error
  );

  await handleProjectError(projectError);
}

/**
 * Обрабатывает ошибку баланса
 */
export async function handleBalanceError(
  projectId: string,
  userId: string,
  creditsUsed: number,
  error: any
): Promise<void> {
  const projectError = createProjectError(
    "balance_error",
    `Balance error: ${error.message || "Unknown balance error"}`,
    projectId,
    userId,
    creditsUsed,
    error
  );

  await handleProjectError(projectError);
}

/**
 * Проверяет, нужно ли выполнить откат проекта
 */
export function shouldRollbackProject(error: any): boolean {
  // Откатываем при ошибках Prefect, API или критических ошибках
  if (error?.message?.includes("AuthenticationError")) return true;
  if (error?.message?.includes("401")) return true;
  if (error?.message?.includes("prefect")) return true;
  if (error?.message?.includes("pipeline")) return true;

  return false;
}
