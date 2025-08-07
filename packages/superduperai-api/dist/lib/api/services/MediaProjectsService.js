import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MediaProjectsService {
    /**
     * Create Media Project
     * Create a new media project for collecting media files (images, videos, audio)
     * @returns IProjectMediaRead Successful Response
     * @throws ApiError
     */
    static projectCreateMediaProject({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/project/media',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=MediaProjectsService.js.map