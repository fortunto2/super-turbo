import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VoiceService {
    /**
     * Get List
     * @returns IResponsePaginated_IVoiceRead_ Successful Response
     * @throws ApiError
     */
    static voiceGetList({ orderBy = 'name', order = 'descendent', limit = 50, offset, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/voice',
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
//# sourceMappingURL=VoiceService.js.map