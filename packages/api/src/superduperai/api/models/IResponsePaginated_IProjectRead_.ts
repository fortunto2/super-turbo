// @ts-nocheck
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { INextCursor } from './INextCursor';
import type { IProjectRead } from './IProjectRead';
export type IResponsePaginated_IProjectRead_ = {
    items: Array<IProjectRead>;
    total: (number | null);
    limit: (number | null);
    offset: (number | null);
    next?: (INextCursor | null);
};

