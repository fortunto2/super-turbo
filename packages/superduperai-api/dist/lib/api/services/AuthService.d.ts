import type { CancelablePromise } from '../core/CancelablePromise';
export declare class AuthService {
    /**
     * Login Callback
     * @returns any Successful Response
     * @throws ApiError
     */
    static authLoginCallback({ redirectUrl, }: {
        redirectUrl: string;
    }): CancelablePromise<any>;
    /**
     * Login
     * @returns any Successful Response
     * @throws ApiError
     */
    static authLogin({ redirectUrl, }: {
        redirectUrl: string;
    }): CancelablePromise<any>;
    /**
     * Token
     * @returns any Successful Response
     * @throws ApiError
     */
    static authToken(): CancelablePromise<any>;
    /**
     * Logout
     * @returns any Successful Response
     * @throws ApiError
     */
    static authLogout({ redirectUrl, }: {
        redirectUrl: string;
    }): CancelablePromise<any>;
}
//# sourceMappingURL=AuthService.d.ts.map