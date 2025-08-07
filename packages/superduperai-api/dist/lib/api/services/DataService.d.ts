import type { IDataCreate } from '../models/IDataCreate';
import type { IDataRead } from '../models/IDataRead';
import type { IDataUpdate } from '../models/IDataUpdate';
import type { IResponsePaginated_IDataRead_ } from '../models/IResponsePaginated_IDataRead_';
import type { ListOrderEnum } from '../models/ListOrderEnum';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class DataService {
    /**
     * Get List
     * @returns IResponsePaginated_IDataRead_ Successful Response
     * @throws ApiError
     */
    static dataGetList({ orderBy, order, limit, offset, }: {
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
    }): CancelablePromise<IResponsePaginated_IDataRead_>;
    /**
     * Create
     * @returns IDataRead Successful Response
     * @throws ApiError
     */
    static dataCreate({ requestBody, }: {
        requestBody: IDataCreate;
    }): CancelablePromise<IDataRead>;
    /**
     * Get List By Ids
     * @returns IDataRead Successful Response
     * @throws ApiError
     */
    static dataGetListByIds({ requestBody, }: {
        requestBody: Array<string>;
    }): CancelablePromise<Array<IDataRead>>;
    /**
     * Get By Id
     * @returns IDataRead Successful Response
     * @throws ApiError
     */
    static dataGetById({ id, }: {
        id: string;
    }): CancelablePromise<IDataRead>;
    /**
     * Update
     * @returns IDataRead Successful Response
     * @throws ApiError
     */
    static dataUpdate({ id, requestBody, }: {
        id: string;
        requestBody: IDataUpdate;
    }): CancelablePromise<IDataRead>;
    /**
     * Delete
     * @returns IDataRead Successful Response
     * @throws ApiError
     */
    static dataDelete({ id, }: {
        id: string;
    }): CancelablePromise<IDataRead>;
}
//# sourceMappingURL=DataService.d.ts.map