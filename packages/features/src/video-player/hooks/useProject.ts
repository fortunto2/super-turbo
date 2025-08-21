import { useState, useEffect } from "react";
import {
  getClientSuperduperAIConfig,
  OpenAPI,
  ProjectService,
} from "@turbo-super/api";
import type { IProjectRead } from "@turbo-super/api";

export function useProject(projectId: string) {
  const [project, setProject] = useState<IProjectRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setError("Project ID is required");
      setIsLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const config = await getClientSuperduperAIConfig();
        if (config.token) {
          OpenAPI.TOKEN = config.token;
        }
        if (config.url) {
          OpenAPI.BASE = config.url;
        }
        const projectData = await ProjectService.projectGetById({
          id: projectId,
        });
        setProject(projectData);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch project"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return {
    project,
    isLoading,
    error,
  };
}
