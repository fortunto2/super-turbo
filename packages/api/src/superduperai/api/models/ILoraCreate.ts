// @ts-nocheck
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EntityTypeEnum } from './EntityTypeEnum';
import type { ILoraReferenceCreate } from './ILoraReferenceCreate';
export type ILoraCreate = {
    name: string;
    trigger: string;
    references: Array<ILoraReferenceCreate>;
    entity_type?: (EntityTypeEnum | null);
};

