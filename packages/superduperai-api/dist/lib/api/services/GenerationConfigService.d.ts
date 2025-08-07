import type { IResponsePaginated_IGenerationConfigRead_ } from '../models/IResponsePaginated_IGenerationConfigRead_';
import type { ListOrderEnum } from '../models/ListOrderEnum';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class GenerationConfigService {
    /**
     * Get List
     * @returns IResponsePaginated_IGenerationConfigRead_ Successful Response
     * @throws ApiError
     */
    static generationConfigGetList({ orderBy, order, limit, offset, }: {
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
    }): CancelablePromise<IResponsePaginated_IGenerationConfigRead_>;
}
//# sourceMappingURL=GenerationConfigService.d.ts.map