"use client";

import type { DropResult } from "@hello-pangea/dnd";
import type { ISceneRead } from "@turbo-super/api";
import { GripVertical } from "lucide-react";
import { useEffect, useState, type FC, type ReactNode } from "react";
import { Dragging } from "../";

type ItemProps = {
  children: ReactNode;
  index: number;
};

const Item: FC<ItemProps> = ({ children, index }) => {
  return (
    <Dragging.Card
      key={index}
      idx={index}
    >
      {(dragHandleProps) => (
        <div className="flex items-center gap-3 w-full scroll-my-3">
          <div
            {...dragHandleProps}
            className="cursor-grab"
          >
            <GripVertical
              size={30}
              color="gray"
            />
          </div>
          <div className="flex-grow">{children}</div>
        </div>
      )}
    </Dragging.Card>
  );
};

type RootProps = {
  scenes?: ISceneRead[];
  onDragChange: (scene: ISceneRead, order: number) => void;
  children: (storyboardScenes: ISceneRead, index: number) => ReactNode;
};

const Root: FC<RootProps> = ({ children, scenes, onDragChange }) => {
  const [storyboard, setStoryboard] = useState(scenes);

  useEffect(() => {
    if (!scenes) return;
    setStoryboard(scenes);
  }, [scenes]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (
      !destination ||
      destination.index === source.index ||
      !storyboard?.length
    )
      return;

    const updatedStoryboard = [...storyboard];
    const [movedScene] = updatedStoryboard.splice(source.index, 1);
    const order = destination.index;
    
    if (movedScene) {
      updatedStoryboard.splice(order, 0, movedScene);
      onDragChange(movedScene, order);
    }
    setStoryboard(updatedStoryboard);
  };

  return (
    <Dragging.Root onDragEnd={handleDragEnd}>
      <Dragging.List>
        {storyboard?.map((scene, index) => {
          return (
            <div
              key={scene.id}
              className="flex flex-grow w-full"
            >
              <ScenesList.Item index={index}>
                {children(scene, index)}
              </ScenesList.Item>
            </div>
          );
        })}
      </Dragging.List>
    </Dragging.Root>
  );
};

export const ScenesList = {
  Root,
  Item,
};
