import type { IFileRead, FileTypeEnum } from '@turbo-super/api';

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
    if (imgGen.negative_prompt)
      metadata.negativePrompt = imgGen.negative_prompt;
    if (imgGen.seed !== undefined) metadata.seed = imgGen.seed;
    if (imgGen.generation_config_name)
      metadata.generationConfig = imgGen.generation_config_name;
    if (imgGen.style_name) metadata.styleName = imgGen.style_name;
    if (imgGen.width !== undefined) metadata.width = imgGen.width;
    if (imgGen.height !== undefined) metadata.height = imgGen.height;
    if (imgGen.steps !== undefined) metadata.steps = imgGen.steps;
    if (imgGen.shot_size) metadata.shotSize = imgGen.shot_size;

    // Извлекаем references
    if (imgGen.references && imgGen.references.length > 0) {
      metadata.references = imgGen.references.map((ref) => ({
        type: 'image',
        ...(ref.reference?.url && { url: ref.reference.url }),
        ...(ref.reference?.id && { name: ref.reference.id }),
      }));
    }
  }

  if (file.video_generation) {
    const vidGen = file.video_generation;
    metadata.prompt = vidGen.prompt ?? '';
    if (vidGen.negative_prompt)
      metadata.negativePrompt = vidGen.negative_prompt;
    if (vidGen.seed !== undefined) metadata.seed = vidGen.seed;
    if (vidGen.generation_config_name)
      metadata.generationConfig = vidGen.generation_config_name;
    if (vidGen.duration !== undefined && vidGen.duration !== null)
      metadata.duration = vidGen.duration;
    if (vidGen.width !== undefined && vidGen.width !== null)
      metadata.width = vidGen.width;
    if (vidGen.height !== undefined && vidGen.height !== null)
      metadata.height = vidGen.height;
    if (vidGen.aspect_ratio) metadata.aspectRatio = vidGen.aspect_ratio;

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
        type: 'video',
        ...(ref.reference?.url && { url: ref.reference.url }),
        ...(ref.reference?.id && { name: ref.reference.id }),
      }));
    }
  }

  if (file.audio_generation) {
    const audGen = file.audio_generation;
    metadata.prompt = audGen.prompt;
    if (audGen.model) metadata.modelName = audGen.model;
    if (audGen.generation_config_name)
      metadata.generationConfig = audGen.generation_config_name;
    if (audGen.voice_name) metadata.voiceName = audGen.voice_name;
    metadata.audioType = audGen.type;
    if (audGen.duration) metadata.duration = audGen.duration;
  }

  // Общие метаданные файла
  if (file.duration !== undefined && file.duration !== null) {
    metadata.duration = file.duration;
  }

  return metadata;
}

export function hasMetadata(file: IFileRead): boolean {
  return !!(
    file.image_generation ||
    file.video_generation ||
    file.audio_generation
  );
}
