import type { IProjectMediaCreate } from '../models/IProjectMediaCreate';
import type { IProjectMediaRead } from '../models/IProjectMediaRead';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ImageProjectsLegacyService {
    /**
     * Image
     * Create a new image project and start generating image file
     * @returns IProjectMediaRead Successful Response
     * @throws ApiError
     */
    static projectImage({ requestBody, }: {
        requestBody: IProjectMediaCreate;
    }): CancelablePromise<IProjectMediaRead>;
}
//# sourceMappingURL=ImageProjectsLegacyService.d.ts.map