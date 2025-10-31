'use client';

import { useProjectVideoRenderStore } from '@/lib/store';
import type { EventHandler } from '@/lib/utils/event-source-store-factory';
import {
  type IFileRead,
  type WSMessage,
  WSMessageTypeEnum,
  type IDataRead,
} from '@turbo-super/api';
import { useQueryClient } from '@tanstack/react-query';
import { projectKeys } from '@/lib/api';
import { unshiftOrReplace } from '@/lib/utils/array';

export const useProjectVideoEventHandler = (
  projectId: string,
): EventHandler => {
  const { setState } = useProjectVideoRenderStore();
  const queryClient = useQueryClient();

  return (eventData: WSMessage) => {
    if (eventData.type === WSMessageTypeEnum.RENDER_PROGRESS) {
      const { progress } = eventData.object as { progress: number };
      setState({ progress });
    } else if (eventData.type === WSMessageTypeEnum.RENDER_RESULT) {
      const result = eventData.object as IFileRead;
      setState({ result });
    } else if (eventData.type === WSMessageTypeEnum.DATA) {
      // Обрабатываем события типа "data" для обновления данных проекта
      const object = eventData.object as IDataRead;
      console.log('📊 Project data updated:', object);

      const queryKey = projectKeys.getById({ id: projectId }).queryKey;

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: unshiftOrReplace(oldData.data || [], object, 'type'),
        };
      });
    } else {
      console.log('🎬 Unhandled event type:', eventData.type, eventData);
    }
  };
};
