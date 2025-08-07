import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Login Callback
     * @returns any Successful Response
     * @throws ApiError
     */
    static authLoginCallback({ redirectUrl, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/callback',
            query: {
                'redirect_url': redirectUrl,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login
     * @returns any Successful Response
     * @throws ApiError
     */
    static authLogin({ redirectUrl, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/login',
            query: {
                'redirect_url': redirectUrl,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Token
     * @returns any Successful Response
     * @throws ApiError
     */
    static authToken() {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/token',
        });
    }
    /**
     * Logout
     * @returns any Successful Response
     * @throws ApiError
     */
    static authLogout({ redirectUrl, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/logout',
            query: {
                'redirect_url': redirectUrl,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=AuthService.js.map