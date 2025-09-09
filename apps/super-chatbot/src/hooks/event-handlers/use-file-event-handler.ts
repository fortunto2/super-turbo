import {
  IFileRead,
  IResponsePaginated_IFileRead_,
  WSMessage,
  WSMessageTypeEnum,
} from "@turbo-super/api";
import { useQueryClient } from "@tanstack/react-query";
import { EventHandler } from "@/lib/utils/event-source-store-factory";
import { unshiftOrReplace } from "@/lib/utils/array";
import { fileKeys } from "@/lib/api";

export const useFileEventHandler = (): EventHandler => {
  const queryClient = useQueryClient();

  return (eventData: WSMessage) => {
    if (eventData.type === WSMessageTypeEnum.FILE) {
      const object = eventData.object as IFileRead;

      queryClient.setQueriesData(
        { queryKey: fileKeys.list._def },
        (oldData?: IResponsePaginated_IFileRead_) => {
          if (!oldData) return;

          return {
            ...oldData,
            items: unshiftOrReplace(oldData.items, object, "id"),
          };
        }
      );

      queryClient.setQueriesData(
        { queryKey: fileKeys.getById._def },
        () => object
      );
    }
  };
};
