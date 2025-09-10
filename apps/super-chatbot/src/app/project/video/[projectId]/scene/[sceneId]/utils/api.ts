import {
  FileTypeEnum,
  type IFileRead,
  type ISceneRead,
  type ISceneUpdate,
  type ITaskRead,
  TaskStatusEnum,
} from "@turbo-super/api";

// ---------- API Types ----------
export interface SceneData {
  success: boolean;
  scene?: ISceneRead;
  error?: string;
}

// ---------- API Functions ----------
export async function fetchScene(sceneId: string): Promise<SceneData> {
  const res = await fetch(`/api/story-editor/scene?sceneId=${sceneId}`);

  if (!res.ok) {
    if (res.status === 404) {
      return { success: false, error: "Scene not found" };
    }
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchFiles(
  sceneId: string,
  projectId: string,
  activeTool: string | null
): Promise<IFileRead[]> {
  const types = getFileTypesForTool(activeTool);

  const res = await fetch(
    `/api/file?sceneId=${sceneId}&projectId=${projectId}&types=${types}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch files: ${res.status}`);
  }

  const json = await res.json();
  return json.items as IFileRead[];
}

export async function updateScene(
  sceneId: string,
  updatedSceneData: ISceneUpdate
): Promise<ISceneRead> {
  const response = await fetch(`/api/scene/update?sceneId=${sceneId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sceneId,
      requestBody: updatedSceneData,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Scene update failed: ${errText}`);
  }

  return response.json();
}

export async function deleteFile(fileId: string): Promise<void> {
  const response = await fetch("/api/file/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: fileId }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete file");
  }
}

export async function checkFileStatus(fileId: string): Promise<{
  isReady: boolean;
  hasError: boolean;
}> {
  const res = await fetch(`/api/file/${fileId}`);

  if (!res.ok) {
    return { isReady: false, hasError: false };
  }

  const json = await res.json();
  const hasError = json.tasks?.some(
    (task: ITaskRead) => task.status === TaskStatusEnum.ERROR
  );

  return {
    isReady: !!json?.url,
    hasError: !!hasError,
  };
}

// ---------- Helper Functions ----------
function getFileTypesForTool(activeTool: string | null): string {
  switch (activeTool) {
    case "soundEffect":
      return FileTypeEnum.SOUND_EFFECT;
    case "voiceover":
      return FileTypeEnum.VOICEOVER;
    default:
      return `${FileTypeEnum.IMAGE},${FileTypeEnum.VIDEO}`;
  }
}
