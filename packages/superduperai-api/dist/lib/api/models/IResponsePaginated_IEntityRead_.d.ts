import type { IEntityRead } from './IEntityRead';
import type { INextCursor } from './INextCursor';
export type IResponsePaginated_IEntityRead_ = {
    items: Array<IEntityRead>;
    total: (number | null);
    limit: (number | null);
    offset: (number | null);
    next?: (INextCursor | null);
};
//# sourceMappingURL=IResponsePaginated_IEntityRead_.d.ts.map