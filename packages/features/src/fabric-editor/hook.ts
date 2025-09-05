"use client";

import type { Canvas, FabricObject, IText } from "fabric";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildFabricEditor } from "./editor";

type Props = {
  onChange?: (object: FabricObject) => void;
};

type SelectEvent = {
  selected: FabricObject[];
};

type ObjectEvent = {
  target: FabricObject;
};

type TextEvent = {
  target: IText;
};

export const useFabricEditor = ({ onChange }: Props) => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  const isInitializing = useRef(true);

  const [selectedObjects, setSelectedObject] = useState<FabricObject[]>([]);

  useEffect(() => {
    const onSelectionCleared = () => {
      setSelectedObject([]);
    };

    const onSelectionCreated = (event: SelectEvent) => {
      setSelectedObject(event.selected);
    };

    const onSelectionUpdated = (event: SelectEvent) => {
      setSelectedObject(event.selected);
    };

    const onObjectAdded = (event: ObjectEvent) => {
      if (!isInitializing.current) {
        onChange?.(event.target);
      }
    };

    const onObjectRemoved = (event: ObjectEvent) => {
      onChange?.(event.target);
    };

    const onObjectModified = (event: ObjectEvent) => {
      onChange?.(event.target);
    };

    const onTextChange = (event: TextEvent) => {
      onChange?.(event.target);
    };

    const bindEvents = (canvas: Canvas) => {
      canvas.on("selection:cleared", onSelectionCleared);
      canvas.on("selection:created", onSelectionCreated);
      canvas.on("selection:updated", onSelectionUpdated);
      canvas.on("object:added", onObjectAdded);
      canvas.on("object:removed", onObjectRemoved);
      canvas.on("object:modified", onObjectModified);
      canvas.on("text:changed", onTextChange);
    };

    if (canvas) {
      bindEvents(canvas);

      setTimeout(() => {
        isInitializing.current = false;
      }, 0);
    }

    return () => {
      if (!canvas) return;
      canvas.off("selection:cleared", onSelectionCleared);
      canvas.off("selection:created", onSelectionCreated);
      canvas.off("selection:updated", onSelectionUpdated);
      canvas.off("object:added", onObjectAdded);
      canvas.off("object:removed", onObjectRemoved);
      canvas.off("object:modified", onObjectModified);
      canvas.off("text:changed", onTextChange);
    };
  }, [canvas, onChange]);

  const editor = useMemo(
    () => (canvas ? buildFabricEditor(canvas) : undefined),
    [canvas]
  );

  const handleReady = (canvas: Canvas) => {
    console.log("Fabric canvas ready");
    setCanvas(canvas);
  };

  return {
    selectedObjects,
    handleReady,
    editor,
  };
};
