import type { IProjectFilmCreate } from '../models/IProjectFilmCreate';
import type { IProjectFilmRead } from '../models/IProjectFilmRead';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class FilmProjectsService {
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
}
//# sourceMappingURL=FilmProjectsService.d.ts.map