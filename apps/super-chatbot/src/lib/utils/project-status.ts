import { TaskTypeEnum, TaskStatusEnum, type ITaskRead } from '@turbo-super/api';

// Основные задачи, которые определяют статус проекта
const MAIN_TASKS = [
  TaskTypeEnum.TXT2SCRIPT_FLOW, // script
  TaskTypeEnum.SCRIPT2ENTITIES_FLOW, // entities
  TaskTypeEnum.SCRIPT2STORYBOARD_FLOW, // storyboard
];

export type ProjectStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ProjectStatusInfo {
  status: ProjectStatus;
  errorStage?: 'script' | 'entities' | 'storyboard';
  errorMessage?: string;
  completedStages: string[];
  failedStages: string[];
}

/**
 * Определяет статус проекта на основе задач
 */
export function getProjectStatus(tasks: ITaskRead[]): ProjectStatusInfo {
  const mainTasks = tasks.filter((task) => MAIN_TASKS.includes(task.type));

  const completedStages: string[] = [];
  const failedStages: string[] = [];
  let hasError = false;
  let errorStage: 'script' | 'entities' | 'storyboard' | undefined;
  let errorMessage: string | undefined;

  // Проверяем каждую основную задачу
  for (const task of mainTasks) {
    const stageName = getStageName(task.type);

    if (task.status === TaskStatusEnum.COMPLETED) {
      completedStages.push(stageName);
    } else if (task.status === TaskStatusEnum.ERROR) {
      failedStages.push(stageName);
      hasError = true;

      // Определяем этап ошибки
      if (task.type === TaskTypeEnum.TXT2SCRIPT_FLOW) {
        errorStage = 'script';
      } else if (task.type === TaskTypeEnum.SCRIPT2ENTITIES_FLOW) {
        errorStage = 'entities';
      } else if (task.type === TaskTypeEnum.SCRIPT2STORYBOARD_FLOW) {
        errorStage = 'storyboard';
      }

      // TODO: Получить сообщение об ошибке из задачи
      errorMessage = `Error in ${stageName} stage`;
    }
  }

  // Определяем общий статус
  let status: ProjectStatus;

  if (hasError) {
    status = 'failed';
  } else if (completedStages.length === MAIN_TASKS.length) {
    status = 'completed';
  } else if (
    completedStages.length > 0 ||
    mainTasks.some((task) => task.status === TaskStatusEnum.IN_PROGRESS)
  ) {
    status = 'processing';
  } else {
    status = 'pending';
  }

  return {
    status,
    ...(errorStage !== undefined && { errorStage }),
    ...(errorMessage !== undefined && { errorMessage }),
    completedStages,
    failedStages,
  };
}

/**
 * Получает человекочитаемое название этапа
 */
function getStageName(taskType: TaskTypeEnum): string {
  switch (taskType) {
    case TaskTypeEnum.TXT2SCRIPT_FLOW:
      return 'script';
    case TaskTypeEnum.SCRIPT2ENTITIES_FLOW:
      return 'entities';
    case TaskTypeEnum.SCRIPT2STORYBOARD_FLOW:
      return 'storyboard';
    default:
      return taskType;
  }
}

/**
 * Получает иконку для статуса
 */
export function getStatusIcon(status: ProjectStatus) {
  switch (status) {
    case 'completed':
      return '✅';
    case 'failed':
      return '❌';
    case 'processing':
      return '⏳';
    default:
      return '⏸️';
  }
}

/**
 * Получает цвет для статуса
 */
export function getStatusColor(status: ProjectStatus): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 dark:text-green-400';
    case 'failed':
      return 'text-red-600 dark:text-red-400';
    case 'processing':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Получает текст статуса
 */
export function getStatusText(status: ProjectStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'processing':
      return 'Processing';
    default:
      return 'Pending';
  }
}
