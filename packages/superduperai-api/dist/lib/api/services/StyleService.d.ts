import type { IResponsePaginated_IStyleRead_ } from '../models/IResponsePaginated_IStyleRead_';
import type { ListOrderEnum } from '../models/ListOrderEnum';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class StyleService {
    /**
     * Get List
     * @returns IResponsePaginated_IStyleRead_ Successful Response
     * @throws ApiError
     */
    static styleGetList({ searchText, tags, excludeTags, orderBy, order, limit, offset, }: {
        searchText?: (string | null);
        tags?: (Array<string> | null);
        excludeTags?: (Array<string> | null);
        orderBy?: string;
        order?: ListOrderEnum;
        /**
         * Page size limit
         */
        limit?: number;
        /**
         * Page offset
         */
        offset?: number;
    }): CancelablePromise<IResponsePaginated_IStyleRead_>;
}
//# sourceMappingURL=StyleService.d.ts.map