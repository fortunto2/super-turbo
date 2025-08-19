// @ts-nocheck
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { INextCursor } from './INextCursor';
import type { IStyleRead } from './IStyleRead';
export type IResponsePaginated_IStyleRead_ = {
    items: Array<IStyleRead>;
    total: (number | null);
    limit: (number | null);
    offset: (number | null);
    next?: (INextCursor | null);
};

