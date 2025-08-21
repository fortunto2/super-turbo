// @ts-nocheck
/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskStatusEnum } from './TaskStatusEnum';
import type { TaskTypeEnum } from './TaskTypeEnum';
export type ITaskRead = {
    type: TaskTypeEnum;
    status?: TaskStatusEnum;
    id: string;
    file_id?: (string | null);
    project_id?: (string | null);
};

