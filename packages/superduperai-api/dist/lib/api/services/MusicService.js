import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MusicService {
    /**
     * Get List
     * @returns IResponsePaginated_IMusicRead_ Successful Response
     * @throws ApiError
     */
    static musicGetList({ orderBy = 'id', order = 'descendent', limit = 50, offset, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/music',
            query: {
                'order_by': orderBy,
                'order': order,
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
     * @returns IMusicRead Successful Response
     * @throws ApiError
     */
    static musicCreate({ formData, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/music',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get List By Ids
     * @returns IMusicRead Successful Response
     * @throws ApiError
     */
    static musicGetListByIds({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/music/list',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get By Id
     * @returns IMusicDetailedRead Successful Response
     * @throws ApiError
     */
    static musicGetById({ id, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/music/{id}',
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
     * @returns IMusicRead Successful Response
     * @throws ApiError
     */
    static musicUpdate({ id, requestBody, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/music/{id}',
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
     * @returns IMusicRead Successful Response
     * @throws ApiError
     */
    static musicDelete({ id, }) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/music/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=MusicService.js.map