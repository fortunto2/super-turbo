import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SceneService {
    /**
     * Get List
     * @returns IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__ Successful Response
     * @throws ApiError
     */
    static sceneGetList({ projectId, orderBy = 'order', order = 'ascendent', selectRelated = 'full', limit = 50, offset, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/scene',
            query: {
                'project_id': projectId,
                'order_by': orderBy,
                'order': order,
                'select_related': selectRelated,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneCreate({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/scene',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get List By Ids
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneGetListByIds({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/scene/list',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get By Id
     * @returns ISceneDetailedRead Successful Response
     * @throws ApiError
     */
    static sceneGetById({ id, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/scene/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneUpdate({ id, requestBody, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/scene/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneDelete({ id, }) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/scene/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneGenerate({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/scene/generate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Set Entity
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneSetEntity({ id, requestBody, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/scene/{id}/entity',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Order
     * @returns ISceneRead Successful Response
     * @throws ApiError
     */
    static sceneUpdateOrder({ id, requestBody, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/scene/{id}/order',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=SceneService.js.map