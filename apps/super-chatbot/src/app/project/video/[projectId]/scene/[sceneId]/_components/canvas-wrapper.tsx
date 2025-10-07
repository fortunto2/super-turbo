"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { FabricCanvas, useFabricEditor } from "@turbo-super/features";
import type { SceneTextbox_Output } from "@turbo-super/api";
import { debounce, isEqual } from "lodash";
import { useToolbarStore } from "@/lib/store";
import { useSceneGetById, useSceneUpdate } from "@/lib/api";

interface CanvasWrapperProps {
  width: number;
  height: number;
  onToolbarUpdate: (target?: any) => void;
  sceneId: string;
}

export function CanvasWrapper({
  width,
  height,
  sceneId,
  onToolbarUpdate,
}: CanvasWrapperProps) {
  const { data: scene } = useSceneGetById({ id: sceneId });

  const { mutateAsync } = useSceneUpdate();

  const { controller, setController } = useToolbarStore();

  const [initialObjects, setInitialObjects] = useState<SceneTextbox_Output[]>(
    []
  );
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!scene || !scene.objects || isEqual(scene.objects, initialObjects))
      return;
    setInitialObjects(scene.objects);
  }, [scene, initialObjects]);

  const handleSceneUpdate = useCallback(
    async (objects: any[]) => {
      if (!scene || !scene.file_id || isUpdating) return;

      // Проверяем, действительно ли объекты изменились
      if (isEqual(scene.objects, objects)) {
        return;
      }

      setIsUpdating(true);
      try {
        // use react-query mutation instead of direct fetch
        await mutateAsync({
          id: scene.id,
          requestBody: {
            ...scene,
            file_id: scene.file_id,
            objects: objects,
          },
        });
      } catch (e) {
        console.error("Scene update error", e);
      } finally {
        setIsUpdating(false);
      }
    },
    [scene, mutateAsync, isUpdating]
  );

  const debouncedUpdate = useMemo(
    () => debounce(handleSceneUpdate, 700),
    [handleSceneUpdate]
  );

  // Отменяем debounce при размонтировании компонента
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const handleChange = () => {
    if (!scene || !scene.file_id || isUpdating) return;

    const updatedObjects = controller?.exportObjects();
    if (updatedObjects) {
      debouncedUpdate(updatedObjects);
    }
  };

  const handleControllerReady = useCallback(
    (newController: any) => {
      // Добавляем обработчики событий для тулбара
      newController.on((evt: any) => {
        if (evt.type === "object:clicked") {
          if (evt.target && evt.target.type === "textbox") {
            onToolbarUpdate(evt.target);
          }
        } else if (evt.type === "canvas:clicked") {
          onToolbarUpdate();
        } else if (evt.type === "selection:changed") {
          const active = newController.getActiveText();
          if (active) onToolbarUpdate(active);
          else {
            onToolbarUpdate();
          }
        }
      });
      setController(newController);
    },
    [onToolbarUpdate, setController]
  );

  const { handleReady, controller: updatedController } = useFabricEditor({
    onChange: handleChange,
  });

  useEffect(() => {
    if (updatedController) {
      handleControllerReady(updatedController);
    }
  }, [updatedController, handleControllerReady]);

  if (width <= 0 || height <= 0) {
    return null;
  }

  return (
    <FabricCanvas
      className="absolute top-0 left-0"
      initialObjects={initialObjects}
      onReady={handleReady}
      readonly={false}
      width={width}
      height={height}
    />
  );
}
