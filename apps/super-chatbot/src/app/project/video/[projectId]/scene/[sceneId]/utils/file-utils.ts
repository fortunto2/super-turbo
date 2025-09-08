import {
  FileTypeEnum,
  IFileRead,
  type ISceneRead,
  type ISceneUpdate,
} from "@turbo-super/api";

// ---------- File Selection Logic ----------
export function getFileIdType(file: IFileRead, isPlaceholder?: boolean) {
  const id = isPlaceholder ? null : file.id;

  // Для placeholder файлов определяем тип по ID
  if (file.id.startsWith("placeholder-") || isPlaceholder) {
    if (file.id.includes("voiceover")) {
      return { voiceover_id: null };
    } else if (file.id.includes("soundeffect")) {
      return { sound_effect_id: null };
    } else {
      return { file_id: null };
    }
  }

  // Для обычных файлов определяем по типу
  switch (file.type) {
    case FileTypeEnum.SOUND_EFFECT:
      return { sound_effect_id: id };
    case FileTypeEnum.VOICEOVER:
      return { voiceover_id: id };
    default:
      return { file_id: id };
  }
}

export function createUpdatedSceneData(
  scene: ISceneRead,
  file: IFileRead,
  isPlaceholder?: boolean
) {
  const idType = getFileIdType(file, isPlaceholder);

  return {
    ...scene,
    ...idType,
  } as ISceneUpdate;
}

// ---------- File Download ----------
export function downloadSceneFile(scene: ISceneRead) {
  if (!scene?.file?.url) return;

  const a = document.createElement("a");
  a.href = scene.file.url;
  a.download = `scene-${scene.id}.asset`;
  a.click();
}
