import type { IProjectMediaCreate } from '../models/IProjectMediaCreate';
import type { IProjectMediaRead } from '../models/IProjectMediaRead';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class MediaProjectsService {
    /**
     * Create Media Project
     * Create a new media project for collecting media files (images, videos, audio)
     * @returns IProjectMediaRead Successful Response
     * @throws ApiError
     */
    static projectCreateMediaProject({ requestBody, }: {
        requestBody: IProjectMediaCreate;
    }): CancelablePromise<IProjectMediaRead>;
}
//# sourceMappingURL=MediaProjectsService.d.ts.map