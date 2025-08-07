import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StyleService {
    /**
     * Get List
     * @returns IResponsePaginated_IStyleRead_ Successful Response
     * @throws ApiError
     */
    static styleGetList({ searchText, tags, excludeTags, orderBy = 'name', order = 'descendent', limit = 50, offset, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/style',
            query: {
                'search_text': searchText,
                'tags': tags,
                'exclude_tags': excludeTags,
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
//# sourceMappingURL=StyleService.js.map