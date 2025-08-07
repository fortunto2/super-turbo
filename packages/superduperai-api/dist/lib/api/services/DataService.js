import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DataService {
    /**
     * Get List
     * @returns IResponsePaginated_IDataRead_ Successful Response
     * @throws ApiError
     */
    static dataGetList({ orderBy = 'id', order = 'descendent', limit = 50, offset, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/data',
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
     * @returns IDataRead Successful Response
     * @throws ApiError
     */
    static dataCreate({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/data',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get List By Ids
     * @returns IDataRead Successful Response
     * @throws ApiError
     */
    static dataGetListByIds({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/data/list',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get By Id
     * @returns IDataRead Successful Response
     * @throws ApiError
     */
    static dataGetById({ id, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/data/{id}',
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
     * @returns IDataRead Successful Response
     * @throws ApiError
     */
    static dataUpdate({ id, requestBody, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/data/{id}',
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
     * @returns IDataRead Successful Response
     * @throws ApiError
     */
    static dataDelete({ id, }) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/data/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=DataService.js.map