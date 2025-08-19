// @ts-nocheck
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IFileReferenceRead } from './IFileReferenceRead';
import type { ReferenceTypeEnum } from './ReferenceTypeEnum';
export type IVideoGenerationReferenceRead = {
    type: ReferenceTypeEnum;
    reference_id: (string | null);
    reference: (IFileReferenceRead | null);
};

