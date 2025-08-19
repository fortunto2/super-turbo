import type { IDataRead, IProjectRead, ITaskRead } from "@/shared/api";
import { DataTypeEnum, TaskTypeEnum } from "@/shared/api";
import { useTaskStatus } from "@/entities/task";

export const useProjectData = (
    project: IProjectRead | undefined | null,
    dataType: DataTypeEnum,
): IDataRead | undefined => {
    const data = project?.data.find((item) => item.type === dataType);
    return data;
};

const prioritizedTypes = [
    DataTypeEnum.STORYBOARD,
    DataTypeEnum.ENTITIES_JSON,
    DataTypeEnum.SCRIPT,
];

export const useProjectDataStatus = (
    project: IProjectRead | undefined | null,
): IDataRead | undefined => {
    if (!project) return;

    for (const type of prioritizedTypes) {
        const foundData = project.data.find((data) => data.type === type);
        if (foundData) {
            return foundData;
        }
    }

    return undefined;
};

export const useProjectScript = (
    project: IProjectRead | undefined | null,
): {
    text: string;
    data: IDataRead | undefined;
    isPending: boolean;
    isError: boolean;
    isCompleted: boolean;
} => {
    const data = useProjectData(project, DataTypeEnum.SCRIPT);
    const { isPending, isError, isCompleted } = useTaskStatus(
        TaskTypeEnum.TXT2SCRIPT_FLOW,
        project?.tasks,
    );
    const text = data?.value?.text ?? "";
    return { text, data, isPending, isError, isCompleted };
};

export const useProjectTasks = (projectTasks?: ITaskRead[]) => {
    const {
        isPending: isTxtPending,
        isCompleted: isTxtCompleted,
        isExists: isTxtExists,
        isError: isTxtError,
    } = useTaskStatus(TaskTypeEnum.TXT2SCRIPT_FLOW, projectTasks);

    const {
        isPending: isEntityPending,
        isCompleted: isEntityCompleted,
        isExists: isEntityExists,
        isError: isEntityError,
    } = useTaskStatus(TaskTypeEnum.SCRIPT2ENTITIES_FLOW, projectTasks);

    const {
        isPending: isStoryboardPending,
        isCompleted: isStoryboardCompleted,
        isExists: isStoryboardExists,
        isError: isStoryboardError,
    } = useTaskStatus(TaskTypeEnum.SCRIPT2STORYBOARD_FLOW, projectTasks);

    const tasks = [
        {
            pending: isTxtPending,
            completed: isTxtCompleted,
            exists: isTxtExists,
            rejected: isTxtError,
        },
        {
            pending: isEntityPending,
            completed: isEntityCompleted,
            exists: isEntityExists,
            rejected: isEntityError,
        },
        {
            pending: isStoryboardPending,
            completed: isStoryboardCompleted,
            exists: isStoryboardExists,
            rejected: isStoryboardError,
        },
    ];

    const completedTasks = tasks.filter((task) => task.completed);

    const errorTasks = tasks.filter((task) => task.rejected);

    return {
        isTxtPending,
        isTxtCompleted,
        isTxtExists,
        isTxtError,
        isEntityPending,
        isEntityCompleted,
        isEntityExists,
        isEntityError,
        isStoryboardPending,
        isStoryboardCompleted,
        isStoryboardExists,
        isStoryboardError,
        tasks,
        errorTasks,
        completedTasks,
    };
};
