import type { IFileRead, FileTypeEnum } from "@turbo-super/api";

export interface FileMetadata {
  type: FileTypeEnum;
  prompt?: string;
  negativePrompt?: string;
  seed?: number;
  modelSid?: string;
  modelName?: string;
  generationConfig?: string;
  styleName?: string;
  duration?: number;
  width?: number;
  height?: number;
  aspectRatio?: string;
  steps?: number;
  shotSize?: string;
  voiceName?: string;
  audioType?: string;
  references?: Array<{
    type: string;
    url?: string;
    name?: string;
  }>;
}

export function extractFileMetadata(file: IFileRead): FileMetadata {
  const metadata: FileMetadata = {
    type: file.type,
  };

  // Извлекаем метаданные в зависимости от типа файла
  if (file.image_generation) {
    const imgGen = file.image_generation;
    metadata.prompt = imgGen.prompt;
    metadata.negativePrompt = imgGen.negative_prompt || undefined;
    metadata.seed = imgGen.seed;
    metadata.generationConfig = imgGen.generation_config_name || undefined;
    metadata.styleName = imgGen.style_name || undefined;
    metadata.width = imgGen.width;
    metadata.height = imgGen.height;
    metadata.steps = imgGen.steps;
    metadata.shotSize = imgGen.shot_size || undefined;

    // Извлекаем references
    if (imgGen.references && imgGen.references.length > 0) {
      metadata.references = imgGen.references.map((ref) => ({
        type: "image",
        url: ref.reference?.url || undefined,
        name: ref.reference?.id || undefined,
      }));
    }
  }

  if (file.video_generation) {
    const vidGen = file.video_generation;
    metadata.prompt = vidGen.prompt;
    metadata.negativePrompt = vidGen.negative_prompt || undefined;
    metadata.seed = vidGen.seed;
    metadata.generationConfig = vidGen.generation_config_name || undefined;
    metadata.duration = vidGen.duration;
    metadata.width = vidGen.width || undefined;
    metadata.height = vidGen.height || undefined;
    metadata.aspectRatio = vidGen.aspect_ratio || undefined;

    // Извлекаем model_sid из generation_config
    if (vidGen.generation_config?.params?.model_sid) {
      metadata.modelSid = vidGen.generation_config.params.model_sid;
    }
    if (vidGen.generation_config?.params?.model_name) {
      metadata.modelName = vidGen.generation_config.params.model_name;
    }

    // Извлекаем references
    if (vidGen.references && vidGen.references.length > 0) {
      metadata.references = vidGen.references.map((ref) => ({
        type: "video",
        url: ref.reference?.url || undefined,
        name: ref.reference?.id || undefined,
      }));
    }
  }

  if (file.audio_generation) {
    const audGen = file.audio_generation;
    metadata.prompt = audGen.prompt;
    metadata.modelName = audGen.model || undefined;
    metadata.generationConfig = audGen.generation_config_name || undefined;
    metadata.voiceName = audGen.voice_name || undefined;
    metadata.audioType = audGen.type;
    metadata.duration = audGen.duration ?? undefined;
  }

  // Общие метаданные файла
  metadata.duration = file.duration ?? metadata.duration;

  return metadata;
}

export function hasMetadata(file: IFileRead): boolean {
  return !!(
    file.image_generation ||
    file.video_generation ||
    file.audio_generation
  );
}
