import type { EntityTypeEnum } from '../models/EntityTypeEnum';
import type { IEntityCreate } from '../models/IEntityCreate';
import type { IEntityRead } from '../models/IEntityRead';
import type { IEntityUpdate } from '../models/IEntityUpdate';
import type { IResponsePaginated_IEntityRead_ } from '../models/IResponsePaginated_IEntityRead_';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class EntityService {
    /**
     * Get List
     * @returns IResponsePaginated_IEntityRead_ Successful Response
     * @throws ApiError
     */
    static entityGetList({ searchText, projectId, userId, type, _public, limit, offset, }: {
        searchText?: (string | null);
        projectId?: (string | null);
        userId?: (string | null);
        type?: (EntityTypeEnum | null);
        _public?: (boolean | null);
        /**
         * Page size limit
         */
        limit?: number;
        /**
         * Page offset
         */
        offset?: number;
    }): CancelablePromise<IResponsePaginated_IEntityRead_>;
    /**
     * Create
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityCreate({ requestBody, }: {
        requestBody: IEntityCreate;
    }): CancelablePromise<IEntityRead>;
    /**
     * Get List By Ids
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityGetListByIds({ requestBody, }: {
        requestBody: Array<string>;
    }): CancelablePromise<Array<IEntityRead>>;
    /**
     * Get By Id
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityGetById({ id, }: {
        id: string;
    }): CancelablePromise<IEntityRead>;
    /**
     * Update
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityUpdate({ id, requestBody, }: {
        id: string;
        requestBody: IEntityUpdate;
    }): CancelablePromise<IEntityRead>;
    /**
     * Delete
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityDelete({ id, }: {
        id: string;
    }): CancelablePromise<IEntityRead>;
    /**
     * Add Favorite
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityAddFavorite({ id, }: {
        id: string;
    }): CancelablePromise<IEntityRead>;
    /**
     * Remove Favorite
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityRemoveFavorite({ id, }: {
        id: string;
    }): CancelablePromise<IEntityRead>;
    /**
     * Add To Project
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityAddToProject({ id, projectId, }: {
        id: string;
        projectId: string;
    }): CancelablePromise<IEntityRead>;
}
//# sourceMappingURL=EntityService.d.ts.map