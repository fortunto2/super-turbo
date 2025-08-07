import type { AudioTypeEnum } from './AudioTypeEnum';
export type IAudioGenerationCreate = {
    type: AudioTypeEnum;
    prompt: string;
    model?: (string | null);
    duration?: (number | null);
    voice_name?: (string | null);
    generation_config_name?: (string | null);
};
//# sourceMappingURL=IAudioGenerationCreate.d.ts.map