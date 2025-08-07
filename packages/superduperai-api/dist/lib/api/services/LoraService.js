import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LoraService {
    /**
     * Get List
     * @returns IResponsePaginated_ILoraRead_ Successful Response
     * @throws ApiError
     */
    static loraGetList({ searchText, status, userId, orderBy = 'id', order = 'descendent', limit = 50, offset, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/lora',
            query: {
                'search_text': searchText,
                'status': status,
                'user_id': userId,
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
     * @returns ILoraRead Successful Response
     * @throws ApiError
     */
    static loraCreate({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/lora',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get By Id
     * @returns ILoraRead Successful Response
     * @throws ApiError
     */
    static loraGetById({ id, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/lora/{id}',
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
     * @returns ILoraRead Successful Response
     * @throws ApiError
     */
    static loraUpdate({ id, requestBody, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/lora/{id}',
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
     * @returns ILoraRead Successful Response
     * @throws ApiError
     */
    static loraDelete({ id, }) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/lora/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=LoraService.js.map