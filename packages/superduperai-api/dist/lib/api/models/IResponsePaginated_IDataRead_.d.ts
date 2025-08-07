import type { IDataRead } from './IDataRead';
import type { INextCursor } from './INextCursor';
export type IResponsePaginated_IDataRead_ = {
    items: Array<IDataRead>;
    total: (number | null);
    limit: (number | null);
    offset: (number | null);
    next?: (INextCursor | null);
};
//# sourceMappingURL=IResponsePaginated_IDataRead_.d.ts.map