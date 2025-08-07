import type { IUserRead } from '../models/IUserRead';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class UserService {
    /**
     * Me
     * @returns IUserRead Successful Response
     * @throws ApiError
     */
    static userMe(): CancelablePromise<IUserRead>;
}
//# sourceMappingURL=UserService.d.ts.map