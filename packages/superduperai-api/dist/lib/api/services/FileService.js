import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FileService {
    /**
     * Get List
     * @returns IResponsePaginated_IFileRead_ Successful Response
     * @throws ApiError
     */
    static fileGetList({ userId, projectId, entityId, sceneId, types, orderBy = 'created_at', order = 'descendent', limit = 50, offset, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/file',
            query: {
                'user_id': userId,
                'project_id': projectId,
                'entity_id': entityId,
                'scene_id': sceneId,
                'types': types,
                'order_by': orderBy,
                'order': order,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get By Id
     * @returns IFileRead Successful Response
     * @throws ApiError
     */
    static fileGetById({ id, }) {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/file/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete
     * @returns IFileRead Successful Response
     * @throws ApiError
     */
    static fileDelete({ id, }) {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/file/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload
     * @returns IFileRead Successful Response
     * @throws ApiError
     */
    static fileUpload({ formData, projectId, entityId, sceneId, type, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/file/upload',
            query: {
                'project_id': projectId,
                'entity_id': entityId,
                'scene_id': sceneId,
                'type': type,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Image
     * Legacy endpoint for generating images.
     * @returns IFileRead Successful Response
     * @throws ApiError
     */
    static fileGenerateImage({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/file/generate-image',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Video
     * Legacy endpoint for generating videos.
     * @returns IFileRead Successful Response
     * @throws ApiError
     */
    static fileGenerateVideo({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/file/generate-video',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Generate Audio
     * @returns IFileRead Successful Response
     * @throws ApiError
     */
    static fileGenerateAudio({ requestBody, }) {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/file/generate-audio',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
//# sourceMappingURL=FileService.js.map