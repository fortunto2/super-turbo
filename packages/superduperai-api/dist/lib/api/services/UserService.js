import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * Me
     * @returns IUserRead Successful Response
     * @throws ApiError
     */
    static userMe() {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/user/me',
        });
    }
}
//# sourceMappingURL=UserService.js.map