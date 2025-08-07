import type { IResponsePaginated_ITemplateRead_ } from '../models/IResponsePaginated_ITemplateRead_';
import type { ListOrderEnum } from '../models/ListOrderEnum';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class TemplateService {
    /**
     * Get List
     * @returns IResponsePaginated_ITemplateRead_ Successful Response
     * @throws ApiError
     */
    static templateGetList({ orderBy, order, limit, offset, }: {
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
    }): CancelablePromise<IResponsePaginated_ITemplateRead_>;
}
//# sourceMappingURL=TemplateService.d.ts.map