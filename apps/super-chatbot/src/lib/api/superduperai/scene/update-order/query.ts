import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SceneService } from '@turbo-super/api';
import { sceneKeys } from '../query';

type ISceneUpdateOrder = Parameters<typeof SceneService.sceneUpdateOrder>[0];

export const useSceneUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ISceneUpdateOrder) =>
      SceneService.sceneUpdateOrder(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: sceneKeys.list._def,
      });
    },
  });
};
