// @ts-nocheck
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IDataRead } from './IDataRead';
import type { INextCursor } from './INextCursor';
export type IResponsePaginated_IDataRead_ = {
    items: Array<IDataRead>;
    total: (number | null);
    limit: (number | null);
    offset: (number | null);
    next?: (INextCursor | null);
};

