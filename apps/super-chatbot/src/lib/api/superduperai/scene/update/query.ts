import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__,
  SceneService,
} from "@turbo-super/api";
import { sceneKeys } from "../query";

type ISceneUpdate = Parameters<typeof SceneService.sceneUpdate>[0];

export const useSceneUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ISceneUpdate) => SceneService.sceneUpdate(payload),
    onMutate: async (newScene) => {
      await queryClient.cancelQueries({ queryKey: sceneKeys.list._def });

      queryClient.setQueriesData({ queryKey: sceneKeys.list._def }, (old) => {
        const oldData =
          old as IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__;
        const items = oldData.items.map((item) => {
          if (item.id === newScene.id) {
            return { ...item, ...newScene };
          }
          return item;
        });
        return {
          ...oldData,
          items,
        };
      });
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: sceneKeys._def });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sceneKeys._def });
    },
  });
};
