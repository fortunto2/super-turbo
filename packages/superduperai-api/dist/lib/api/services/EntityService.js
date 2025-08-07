import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EntityService {
    /**
     * Get List
     * @returns IResponsePaginated_IEntityRead_ Successful Response
     * @throws ApiError
     */
    static entityGetList({ searchText, projectId, userId, type, _public, limit = 50, offset, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/entity',
            query: {
                'search_text': searchText,
                'project_id': projectId,
                'user_id': userId,
                'type': type,
                'public': _public,
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
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityCreate({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/entity',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get List By Ids
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityGetListByIds({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/entity/list',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get By Id
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityGetById({ id, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/entity/{id}',
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
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityUpdate({ id, requestBody, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/entity/{id}',
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
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityDelete({ id, }) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/entity/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Favorite
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityAddFavorite({ id, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/entity/{id}/add-favorite',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Remove Favorite
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityRemoveFavorite({ id, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/entity/{id}/remove-favorite',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add To Project
     * @returns IEntityRead Successful Response
     * @throws ApiError
     */
    static entityAddToProject({ id, projectId, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/entity/{id}/add-to-project/{project_id}',
            path: {
                'id': id,
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=EntityService.js.map