import type { IResponsePaginated_IVoiceRead_ } from '../models/IResponsePaginated_IVoiceRead_';
import type { ListOrderEnum } from '../models/ListOrderEnum';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class VoiceService {
    /**
     * Get List
     * @returns IResponsePaginated_IVoiceRead_ Successful Response
     * @throws ApiError
     */
    static voiceGetList({ orderBy, order, limit, offset, }: {
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
    }): CancelablePromise<IResponsePaginated_IVoiceRead_>;
}
//# sourceMappingURL=VoiceService.d.ts.map