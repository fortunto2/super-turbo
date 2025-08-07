import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EventsService {
    /**
     * Subscribe
     * @returns any Successful Response
     * @throws ApiError
     */
    static subscribeApiV1EventsChannelGet({ channel, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/events/{channel}',
            path: {
                'channel': channel,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=EventsService.js.map