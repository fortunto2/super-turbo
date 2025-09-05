"use client";

import {
  useRef,
  useCallback,
  useMemo,
  RefObject,
  useState,
  useEffect,
} from "react";
import { FabricCanvas } from "@turbo-super/features";
import type { ISceneRead, SceneTextbox_Output } from "@turbo-super/api";
import { debounce, isEqual } from "lodash";

interface CanvasWrapperProps {
  scene: ISceneRead;
  width: number;
  height: number;
  controllerRef: any;
  onToolbarUpdate: (target?: any) => void;
}

export function CanvasWrapper({
  scene,
  width,
  height,
  controllerRef,
  onToolbarUpdate,
}: CanvasWrapperProps) {
  const [initialObjects, setInitialObjects] = useState<SceneTextbox_Output[]>(
    []
  );

  useEffect(() => {
    console.log(isEqual(scene.objects, initialObjects));
    if (!scene || !scene.objects || isEqual(scene.objects, initialObjects))
      return;
    console.log("objects updated");
    setInitialObjects(scene.objects);
  }, [scene.objects, initialObjects]);

  const handleSceneUpdate = useCallback(
    async (objects: any[]) => {
      if (!scene || !scene.file_id) return;

      try {
        console.log("Updating scene with objects:", objects.length);

        const response = await fetch(`/api/scene/update?sceneId=${scene.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId: scene.id,
            requestBody: {
              ...scene,
              file_id: scene.file_id,
              objects: objects,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Scene update failed: ${errText}`);
        }
      } catch (e) {
        console.error("Scene update error", e);
      }
    },
    [scene]
  );

  const debouncedUpdate = useMemo(
    () => debounce(handleSceneUpdate, 400),
    [handleSceneUpdate]
  );

  const handleChange = useCallback(() => {
    if (!scene || !scene.file_id) return;

    const updatedObjects = controllerRef.current?.exportObjects();
    if (updatedObjects) {
      debouncedUpdate(updatedObjects);
    }
  }, [scene, debouncedUpdate, controllerRef]);

  const handleControllerReady = useCallback(
    (controller: any) => {
      controllerRef.current = controller;

      // Добавляем обработчики событий для тулбара
      controller.on((evt: any) => {
        if (evt.type === "object:clicked") {
          if (evt.target && evt.target.type === "textbox") {
            onToolbarUpdate(evt.target);
          }
        } else if (evt.type === "canvas:clicked") {
          onToolbarUpdate();
        } else if (evt.type === "selection:changed") {
          const active = controller.getActiveText();
          if (active) onToolbarUpdate(active);
          else {
            onToolbarUpdate();
          }
        }
      });
    },
    [controllerRef, onToolbarUpdate]
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
