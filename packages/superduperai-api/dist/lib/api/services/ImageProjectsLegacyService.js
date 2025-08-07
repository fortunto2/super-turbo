import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImageProjectsLegacyService {
    /**
     * Image
     * Create a new image project and start generating image file
     * @returns IProjectMediaRead Successful Response
     * @throws ApiError
     */
    static projectImage({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/project/image',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=ImageProjectsLegacyService.js.map