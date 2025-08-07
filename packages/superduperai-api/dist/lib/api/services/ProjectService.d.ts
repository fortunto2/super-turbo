import type { IProjectFilmCreate } from '../models/IProjectFilmCreate';
import type { IProjectFilmRead } from '../models/IProjectFilmRead';
import type { IProjectMediaCreate } from '../models/IProjectMediaCreate';
import type { IProjectMediaRead } from '../models/IProjectMediaRead';
import type { IProjectRead } from '../models/IProjectRead';
import type { IProjectUpdate } from '../models/IProjectUpdate';
import type { IProjectVideoCreate } from '../models/IProjectVideoCreate';
import type { IProjectVideoRead } from '../models/IProjectVideoRead';
import type { IResponsePaginated_IProjectRead_ } from '../models/IResponsePaginated_IProjectRead_';
import type { ListOrderEnum } from '../models/ListOrderEnum';
import type { ProjectTypeEnum } from '../models/ProjectTypeEnum';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class ProjectService {
    /**
     * Get List
     * @returns IResponsePaginated_IProjectRead_ Successful Response
     * @throws ApiError
     */
    static projectGetList({ type, searchText, userId, orderBy, order, limit, offset, }: {
        type?: (ProjectTypeEnum | null);
        searchText?: (string | null);
        userId?: (string | null);
        orderBy?: string;
        order?: ListOrderEnum;
        /**
         * Page size limit
         */
        limit?: number;
        /**
         * Page offset
         */
        offset?: number;
    }): CancelablePromise<IResponsePaginated_IProjectRead_>;
    /**
     * Get By Id
     * @returns IProjectRead Successful Response
     * @throws ApiError
     */
    static projectGetById({ id, }: {
        id: string;
    }): CancelablePromise<IProjectRead>;
    /**
     * Update
     * @returns IProjectRead Successful Response
     * @throws ApiError
     */
    static projectUpdate({ id, requestBody, }: {
        id: string;
        requestBody: IProjectUpdate;
    }): CancelablePromise<IProjectRead>;
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
     * Create Film Project
     * Create a new film project and start generating script
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectCreateFilmProject({ requestBody, }: {
        requestBody: IProjectFilmCreate;
    }): CancelablePromise<IProjectFilmRead>;
    /**
     * Txt2Script
     * Regenerate project script (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectTxt2Script({ id, requestBody, }: {
        id: string;
        requestBody: string;
    }): CancelablePromise<IProjectFilmRead>;
    /**
     * Script2Entities
     * Extract entities from script (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectScript2Entities({ id, }: {
        id: string;
    }): CancelablePromise<IProjectFilmRead>;
    /**
     * Script2Storyboard
     * Generate storyboard from script (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectScript2Storyboard({ id, }: {
        id: string;
    }): CancelablePromise<IProjectFilmRead>;
    /**
     * Storyboard2Video
     * Render final video from storyboard (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectStoryboard2Video({ id, }: {
        id: string;
    }): CancelablePromise<IProjectFilmRead>;
    /**
     * Timeline2Video
     * Render video from timeline (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectTimeline2Video({ id, }: {
        id: string;
    }): CancelablePromise<IProjectFilmRead>;
    /**
     * Animate All
     * Animate all scenes in project (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectAnimateAll({ id, generationConfigName, duration, }: {
        id: string;
        generationConfigName: string;
        duration?: number;
    }): CancelablePromise<IProjectFilmRead>;
    /**
     * Sync To Beats
     * Sync scenes to music beats (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectSyncToBeats({ id, dynamic, }: {
        id: string;
        dynamic: number;
    }): CancelablePromise<IProjectFilmRead>;
    /**
     * Regenerate Timeline
     * Regenerate project timeline (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectRegenerateTimeline({ id, }: {
        id: string;
    }): CancelablePromise<IProjectFilmRead>;
    /**
     * Create Media Project
     * Create a new media project for collecting media files (images, videos, audio)
     * @returns IProjectMediaRead Successful Response
     * @throws ApiError
     */
    static projectCreateMediaProject({ requestBody, }: {
        requestBody: IProjectMediaCreate;
    }): CancelablePromise<IProjectMediaRead>;
    /**
     * Test Token
     * Test endpoint to check token verification
     * @returns any Successful Response
     * @throws ApiError
     */
    static projectTestToken1({ authorization, }: {
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
    static projectTxt2Script1({ id, requestBody, }: {
        id: string;
        requestBody: string;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Script2Entities
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectScript2Entities1({ id, }: {
        id: string;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Script2Storyboard
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectScript2Storyboard1({ id, }: {
        id: string;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Storyboard2Video
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectStoryboard2Video1({ id, }: {
        id: string;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Timeline2Video
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectTimeline2Video1({ id, }: {
        id: string;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Animate All
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectAnimateAll1({ id, generationConfigName, duration, }: {
        id: string;
        generationConfigName: string;
        duration?: number;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Sync To Beats
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectSyncToBeats1({ id, dynamic, }: {
        id: string;
        dynamic: number;
    }): CancelablePromise<IProjectVideoRead>;
    /**
     * Regenerate Timeline
     * @returns IProjectVideoRead Successful Response
     * @throws ApiError
     */
    static projectRegenerateTimeline1({ id, }: {
        id: string;
    }): CancelablePromise<IProjectVideoRead>;
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
//# sourceMappingURL=ProjectService.d.ts.map