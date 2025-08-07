import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GenerationConfigService {
    /**
     * Get List
     * @returns IResponsePaginated_IGenerationConfigRead_ Successful Response
     * @throws ApiError
     */
    static generationConfigGetList({ orderBy = 'name', order = 'descendent', limit = 50, offset, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/generation-config',
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
}
//# sourceMappingURL=GenerationConfigService.js.map