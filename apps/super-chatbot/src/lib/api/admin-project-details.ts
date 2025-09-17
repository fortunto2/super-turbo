import "server-only";

import {
  getSuperduperAIConfig,
  ProjectService,
  type IProjectRead,
} from "@turbo-super/api";

/**
 * Получает детали проекта с задачами из SuperDuperAI API
 */
export async function getProjectDetails(
  projectId: string
): Promise<IProjectRead | null> {
  try {
    const config = await getSuperduperAIConfig();

    const project = await ProjectService.projectGetById({
      id: projectId,
    });

    return project;
  } catch (error) {
    console.error(`Error fetching project details for ${projectId}:`, error);
    return null;
  }
}

/**
 * Получает детали для нескольких проектов
 */
export async function getMultipleProjectDetails(
  projectIds: string[]
): Promise<Map<string, IProjectRead>> {
  const projectDetails = new Map<string, IProjectRead>();

  // Получаем детали проектов параллельно
  const promises = projectIds.map(async (projectId) => {
    const details = await getProjectDetails(projectId);
    if (details) {
      projectDetails.set(projectId, details);
    }
  });

  await Promise.all(promises);

  return projectDetails;
}
