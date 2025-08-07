import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PingService {
    /**
     * Ping
     * @returns any Successful Response
     * @throws ApiError
     */
    static pingPing() {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/ping',
        });
    }
    /**
     * Ping Head
     * @returns any Successful Response
     * @throws ApiError
     */
    static pingPingHead() {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/api/v1/ping',
        });
    }
}
//# sourceMappingURL=PingService.js.map