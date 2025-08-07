import type { ILoraCreate } from '../models/ILoraCreate';
import type { ILoraRead } from '../models/ILoraRead';
import type { ILoraUpdate } from '../models/ILoraUpdate';
import type { IResponsePaginated_ILoraRead_ } from '../models/IResponsePaginated_ILoraRead_';
import type { ListOrderEnum } from '../models/ListOrderEnum';
import type { LoraStatusEnum } from '../models/LoraStatusEnum';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class LoraService {
    /**
     * Get List
     * @returns IResponsePaginated_ILoraRead_ Successful Response
     * @throws ApiError
     */
    static loraGetList({ searchText, status, userId, orderBy, order, limit, offset, }: {
        searchText?: (string | null);
        status?: (LoraStatusEnum | null);
        userId?: (string | null);
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
    }): CancelablePromise<IResponsePaginated_ILoraRead_>;
    /**
     * Create
     * @returns ILoraRead Successful Response
     * @throws ApiError
     */
    static loraCreate({ requestBody, }: {
        requestBody: ILoraCreate;
    }): CancelablePromise<ILoraRead>;
    /**
     * Get By Id
     * @returns ILoraRead Successful Response
     * @throws ApiError
     */
    static loraGetById({ id, }: {
        id: string;
    }): CancelablePromise<ILoraRead>;
    /**
     * Update
     * @returns ILoraRead Successful Response
     * @throws ApiError
     */
    static loraUpdate({ id, requestBody, }: {
        id: string;
        requestBody: ILoraUpdate;
    }): CancelablePromise<ILoraRead>;
    /**
     * Delete
     * @returns ILoraRead Successful Response
     * @throws ApiError
     */
    static loraDelete({ id, }: {
        id: string;
    }): CancelablePromise<ILoraRead>;
}
//# sourceMappingURL=LoraService.d.ts.map