// @ts-nocheck
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IFileRead } from './IFileRead';
import type { INextCursor } from './INextCursor';
export type IResponsePaginated_IFileRead_ = {
    items: Array<IFileRead>;
    total: (number | null);
    limit: (number | null);
    offset: (number | null);
    next?: (INextCursor | null);
};

