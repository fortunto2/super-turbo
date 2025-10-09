import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ISceneCreate, SceneService } from '@turbo-super/api';
import { sceneKeys } from '../query';

export const useSceneCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ISceneCreate) =>
      SceneService.sceneCreate({ requestBody: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sceneKeys._def });
    },
  });
};
