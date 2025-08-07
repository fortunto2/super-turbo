import type { IProjectVideoCreate } from '../models/IProjectVideoCreate';
import type { IProjectVideoRead } from '../models/IProjectVideoRead';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class VideoProjectsLegacyService {
    /**
     * Test Token
     * Test endpoint to check token verification
     * @returns any Successful Response
     * @throws ApiError
     */
    static projectTestToken({ authorization, }: {
        authorization: string;
    }): CancelablePromise<any>;
    /**
     * Video
     * Create a new video project and start generating script
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectVideo({ requestBody, }: {
        requestBody: IProjectVideoCreate;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Txt2Script
     * Regenerate project script
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectTxt2Script({ id, requestBody, }: {
        id: string;
        requestBody: string;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Script2Entities
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectScript2Entities({ id, }: {
        id: string;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Script2Storyboard
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectScript2Storyboard({ id, }: {
        id: string;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Storyboard2Video
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectStoryboard2Video({ id, }: {
        id: string;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Timeline2Video
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectTimeline2Video({ id, }: {
        id: string;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Animate All
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectAnimateAll({ id, generationConfigName, duration, }: {
        id: string;
        generationConfigName: string;
        duration?: number;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Sync To Beats
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectSyncToBeats({ id, dynamic, }: {
        id: string;
        dynamic: number;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Regenerate Timeline
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectRegenerateTimeline({ id, }: {
        id: string;
    }): CancelablePromise<IProjectVideoRead>;
}
//# sourceMappingURL=VideoProjectsLegacyService.d.ts.map