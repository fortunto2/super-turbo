// @ts-nocheck
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ILoraRead } from './ILoraRead';
import type { INextCursor } from './INextCursor';
export type IResponsePaginated_ILoraRead_ = {
    items: Array<ILoraRead>;
    total: (number | null);
    limit: (number | null);
    offset: (number | null);
    next?: (INextCursor | null);
};

