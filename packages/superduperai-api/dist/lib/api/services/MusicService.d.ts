import type { Body_music_create } from '../models/Body_music_create';
import type { IMusicDetailedRead } from '../models/IMusicDetailedRead';
import type { IMusicRead } from '../models/IMusicRead';
import type { IMusicUpdate } from '../models/IMusicUpdate';
import type { IResponsePaginated_IMusicRead_ } from '../models/IResponsePaginated_IMusicRead_';
import type { ListOrderEnum } from '../models/ListOrderEnum';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class MusicService {
    /**
     * Get List
     * @returns IResponsePaginated_IMusicRead_ Successful Response
     * @throws ApiError
     */
    static musicGetList({ orderBy, order, limit, offset, }: {
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
    }): CancelablePromise<IResponsePaginated_IMusicRead_>;
    /**
     * Create
     * @returns IMusicRead Successful Response
     * @throws ApiError
     */
    static musicCreate({ formData, }: {
        formData: Body_music_create;
    }): CancelablePromise<IMusicRead>;
    /**
     * Get List By Ids
     * @returns IMusicRead Successful Response
     * @throws ApiError
     */
    static musicGetListByIds({ requestBody, }: {
        requestBody: Array<string>;
    }): CancelablePromise<Array<IMusicRead>>;
    /**
     * Get By Id
     * @returns IMusicDetailedRead Successful Response
     * @throws ApiError
     */
    static musicGetById({ id, }: {
        id: string;
    }): CancelablePromise<IMusicDetailedRead>;
    /**
     * Update
     * @returns IMusicRead Successful Response
     * @throws ApiError
     */
    static musicUpdate({ id, requestBody, }: {
        id: string;
        requestBody: IMusicUpdate;
    }): CancelablePromise<IMusicRead>;
    /**
     * Delete
     * @returns IMusicRead Successful Response
     * @throws ApiError
     */
    static musicDelete({ id, }: {
        id: string;
    }): CancelablePromise<IMusicRead>;
}
//# sourceMappingURL=MusicService.d.ts.map