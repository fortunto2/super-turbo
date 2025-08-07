import type { Body_scene_set_entity } from '../models/Body_scene_set_entity';
import type { Body_scene_update_order } from '../models/Body_scene_update_order';
import type { GenerateScenePayload } from '../models/GenerateScenePayload';
import type { IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__ } from '../models/IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__';
import type { ISceneCreate } from '../models/ISceneCreate';
import type { ISceneDetailedRead } from '../models/ISceneDetailedRead';
import type { ISceneRead } from '../models/ISceneRead';
import type { ISceneUpdate } from '../models/ISceneUpdate';
import type { ListOrderEnum } from '../models/ListOrderEnum';
import type { SelectRelatedEnum } from '../models/SelectRelatedEnum';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class SceneService {
    /**
     * Get List
     * @returns IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__ Successful Response
     * @throws ApiError
     */
    static sceneGetList({ projectId, orderBy, order, selectRelated, limit, offset, }: {
        projectId?: (string | null);
        orderBy?: string;
        order?: ListOrderEnum;
        selectRelated?: SelectRelatedEnum;
        /**
         * Page size limit
         */
        limit?: number;
        /**
         * Page offset
         */
        offset?: number;
    }): CancelablePromise<IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__>;
    /**
     * Create
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneCreate({ requestBody, }: {
        requestBody: ISceneCreate;
    }): CancelablePromise<ISceneRead>;
    /**
     * Get List By Ids
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneGetListByIds({ requestBody, }: {
        requestBody: Array<string>;
    }): CancelablePromise<Array<ISceneRead>>;
    /**
     * Get By Id
     * @returns ISceneDetailedRead Successful Response
     * @throws ApiError
     */
    static sceneGetById({ id, }: {
        id: string;
    }): CancelablePromise<ISceneDetailedRead>;
    /**
     * Update
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneUpdate({ id, requestBody, }: {
        id: string;
        requestBody: ISceneUpdate;
    }): CancelablePromise<ISceneRead>;
    /**
     * Delete
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneDelete({ id, }: {
        id: string;
    }): CancelablePromise<ISceneRead>;
    /**
     * Generate
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneGenerate({ requestBody, }: {
        requestBody: GenerateScenePayload;
    }): CancelablePromise<ISceneRead>;
    /**
     * Set Entity
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneSetEntity({ id, requestBody, }: {
        id: string;
        requestBody: Body_scene_set_entity;
    }): CancelablePromise<ISceneRead>;
    /**
     * Update Order
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneUpdateOrder({ id, requestBody, }: {
        id: string;
        requestBody: Body_scene_update_order;
    }): CancelablePromise<ISceneRead>;
}
//# sourceMappingURL=SceneService.d.ts.map