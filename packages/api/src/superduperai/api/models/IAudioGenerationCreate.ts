// @ts-nocheck
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AudioTypeEnum } from './AudioTypeEnum';
export type IAudioGenerationCreate = {
    type: AudioTypeEnum;
    prompt: string;
    model?: (string | null);
    duration?: (number | null);
    voice_name?: (string | null);
    generation_config_name?: (string | null);
};

