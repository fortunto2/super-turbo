import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FilmProjectsService {
    /**
     * Test Token
     * Test endpoint to check token verification
     * @returns any Successful Response
     * @throws ApiError
     */
    static projectTestToken({ authorization, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/project/film/test-token',
            headers: {
                'authorization': authorization,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Film Project
     * Create a new film project and start generating script
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectCreateFilmProject({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/project/film',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Txt2Script
     * Regenerate project script (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectTxt2Script({ id, requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/project/film/{id}/txt2script',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Script2Entities
     * Extract entities from script (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectScript2Entities({ id, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/project/film/{id}/script2entities',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Script2Storyboard
     * Generate storyboard from script (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectScript2Storyboard({ id, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/project/film/{id}/script2storyboard',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Storyboard2Video
     * Render final video from storyboard (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectStoryboard2Video({ id, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/project/film/{id}/storyboard2video',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Timeline2Video
     * Render video from timeline (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectTimeline2Video({ id, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/project/film/{id}/timeline2video',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Animate All
     * Animate all scenes in project (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectAnimateAll({ id, generationConfigName, duration = 5, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/project/film/{id}/animate-all',
            path: {
                'id': id,
            },
            query: {
                'generation_config_name': generationConfigName,
                'duration': duration,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Sync To Beats
     * Sync scenes to music beats (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectSyncToBeats({ id, dynamic, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/project/film/{id}/sync_to_beats',
            path: {
                'id': id,
            },
            query: {
                'dynamic': dynamic,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Regenerate Timeline
     * Regenerate project timeline (film projects only)
     * @returns IProjectFilmRead Successful Response
     * @throws ApiError
     */
    static projectRegenerateTimeline({ id, }) {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/project/film/{id}/timeline',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=FilmProjectsService.js.map