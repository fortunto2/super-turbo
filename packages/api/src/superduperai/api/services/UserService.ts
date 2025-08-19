// @ts-nocheck
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IUserRead } from '../models/IUserRead';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * Me
     * @returns IUserRead Successful Response
     * @throws ApiError
     */
    public static userMe(): CancelablePromise<IUserRead> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/user/me',
        });
    }
}
