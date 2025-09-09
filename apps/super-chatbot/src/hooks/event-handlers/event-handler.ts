import {
  WSMessageTypeEnum,
  type IDataRead,
  type IProjectRead,
  type ITaskRead,
  type WSMessage,
} from "@turbo-super/api";

import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "@/lib/api";
import { unshiftOrReplace } from "@/lib/utils/array";
import { EventHandler } from "@/lib/utils/event-source-store-factory";

export const useProjectEventHandler = (projectId: string): EventHandler => {
  const queryClient = useQueryClient();

  return (eventData: WSMessage) => {
    if (eventData.type === WSMessageTypeEnum.DATA) {
      const object = eventData.object as IDataRead;

      const queryKey = projectKeys.getById({ id: projectId }).queryKey;

      queryClient.setQueryData(queryKey, (oldData: IProjectRead) => {
        return {
          ...oldData,
          data: unshiftOrReplace(oldData.data, object, "type"),
        };
      });
    } else if (eventData.type === WSMessageTypeEnum.TASK) {
      const object = eventData.object as ITaskRead;

      if (object.file_id) {
        return;
      }

      const queryKey = projectKeys.getById({ id: projectId }).queryKey;

      queryClient.setQueryData(queryKey, (oldData: IProjectRead) => {
        return {
          ...oldData,
          tasks: unshiftOrReplace(oldData.tasks, object, "id"),
        };
      });
    }
  };
};
