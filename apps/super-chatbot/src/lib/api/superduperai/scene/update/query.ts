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
      // Отменяем только запросы для конкретной сцены, а не все запросы
      await queryClient.cancelQueries({
        queryKey: sceneKeys.getById({ id: newScene.id }).queryKey,
      });

      // Временно отключаем оптимистичные обновления для canvas, чтобы избежать циклических обновлений
      // Обновления будут происходить только в onSuccess после успешного ответа сервера
    },
    onError: async (error, variables) => {
      // При ошибке откатываем изменения только для конкретной сцены
      await queryClient.invalidateQueries({
        queryKey: sceneKeys.getById({ id: variables.id }).queryKey,
      });
    },
    onSuccess: async (data, variables) => {
      // При успехе обновляем данные конкретной сцены
      queryClient.setQueryData(
        sceneKeys.getById({ id: variables.id }).queryKey,
        data
      );

      // Также обновляем список сцен
      queryClient.setQueriesData({ queryKey: sceneKeys.list._def }, (old) => {
        if (!old) return old;
        const oldData =
          old as IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__;
        const items = oldData.items.map((item) => {
          if (item.id === variables.id) {
            return { ...item, ...data };
          }
          return item;
        });
        return {
          ...oldData,
          items,
        };
      });
    },
  });
};
