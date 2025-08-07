import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TemplateService {
    /**
     * Get List
     * @returns IResponsePaginated_ITemplateRead_ Successful Response
     * @throws ApiError
     */
    static templateGetList({ orderBy = 'name', order = 'descendent', limit = 50, offset, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/template',
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
//# sourceMappingURL=TemplateService.js.map