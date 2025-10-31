import {
  type IFileRead,
  type IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__,
  type ISceneRead,
  type WSMessage,
  WSMessageTypeEnum,
} from '@turbo-super/api';
import { useQueryClient } from '@tanstack/react-query';
import type { EventHandler } from '@/lib/utils/event-source-store-factory';
import { sceneKeys } from '@/lib/api';
import { pushOrReplace } from '@/lib/utils/array';

export const useSceneEventHandler = (projectId: string): EventHandler => {
  const queryClient = useQueryClient();

  return (eventData: WSMessage) => {
    if (eventData.type === WSMessageTypeEnum.FILE) {
      const object = eventData.object as IFileRead;

      queryClient.setQueriesData(
        { queryKey: sceneKeys.getById._def },
        (oldData?: ISceneRead) => {
          if (!oldData || oldData.file_id !== object.id) return;

          return {
            ...oldData,
            file: object,
          };
        },
      );
    }

    if (eventData.type !== WSMessageTypeEnum.SCENE) {
      return;
    }
    const object = eventData.object as ISceneRead;

    const queryKey = sceneKeys.list({ projectId }).queryKey;

    queryClient.setQueryData(
      queryKey,
      (oldData?: IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__) => {
        if (!oldData) {
          return oldData;
        }
        return {
          ...oldData,
          items: pushOrReplace(oldData.items as ISceneRead[], object, 'id'),
        };
      },
    );
  };
};
