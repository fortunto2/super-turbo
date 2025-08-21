// @ts-nocheck
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { INextCursor } from './INextCursor';
import type { IVoiceRead } from './IVoiceRead';
export type IResponsePaginated_IVoiceRead_ = {
    items: Array<IVoiceRead>;
    total: (number | null);
    limit: (number | null);
    offset: (number | null);
    next?: (INextCursor | null);
};

