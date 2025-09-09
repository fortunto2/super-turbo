"use client";

import {
  useRef,
  useCallback,
  useMemo,
  RefObject,
  useState,
  useEffect,
} from "react";
import { FabricCanvas, FabricControllerType } from "@turbo-super/features";
import type { ISceneRead, SceneTextbox_Output } from "@turbo-super/api";
import { debounce, isEqual } from "lodash";
import { useNextSceneUpdate } from "@/lib/api/next/scene/update/mutation";
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

  useEffect(() => {
    if (!scene || !scene.objects || isEqual(scene.objects, initialObjects))
      return;
    setInitialObjects(scene.objects);
  }, [scene?.objects, initialObjects]);

  const handleSceneUpdate = useCallback(
    async (objects: any[]) => {
      if (!scene || !scene.file_id) return;

      try {
        // use react-query mutation instead of direct fetch
        await mutateAsync({
          id: scene.id,
          requestBody: {
            ...scene,
            file_id: scene.file_id,
            objects: objects,
          } as any,
        });
      } catch (e) {
        console.error("Scene update error", e);
      }
    },
    [scene, mutateAsync]
  );

  const debouncedUpdate = useMemo(
    () => debounce(handleSceneUpdate, 700),
    [handleSceneUpdate]
  );

  const handleChange = useCallback(() => {
    if (!scene || !scene.file_id) return;

    const updatedObjects = controller?.exportObjects();
    if (updatedObjects) {
      debouncedUpdate(updatedObjects);
    }
  }, [scene, debouncedUpdate, controller]);

  const handleControllerReady = useCallback(
    (newController: FabricControllerType) => {
      setController(newController);

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
    },
    [controller, onToolbarUpdate]
  );

  if (width <= 0 || height <= 0) {
    return null;
  }

  return (
    <FabricCanvas
      className="absolute top-0 left-0"
      initialObjects={initialObjects}
      onReady={() => {}}
      onControllerReady={handleControllerReady}
      onChange={handleChange}
      readonly={false}
      width={width}
      height={height}
    />
  );
}
