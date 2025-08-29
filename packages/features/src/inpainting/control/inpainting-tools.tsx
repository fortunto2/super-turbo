"use client";

import clsx from "clsx";
import { Circle as FabricCircle } from "fabric";
import { PencilBrush, type Canvas, type TPointerEventInfo } from "fabric";
import { Circle, Palette, Trash2, X } from "lucide-react";
import { useEffect, useState, type FC } from "react";

type Props = {
  canvas?: Canvas | null;
  active?: boolean;
  onActiveChange: (value: string) => void;
  isCombined?: boolean;
  onClose: () => void;
};

export const cursorName = "cursor";

export const InpaintingTools: FC<Props> = ({
  canvas,
  onActiveChange,
  active,
  isCombined,
  onClose,
}) => {
  const [width, setWidth] = useState(100);
  const [cursor, setCursor] = useState<FabricCircle | null>(null);

  const maxBrushWidth = 200;

  const handleWidthChange = (value: number) => {
    const newWidth = value === 0 ? 1 : value;
    if (cursor) {
      cursor.set({
        radius: newWidth / 2,
      });
      canvas?.renderAll();
    }
    setWidth(newWidth);
  };

  useEffect(() => {
    if (!canvas) return;

    const circle = new FabricCircle({
      radius: width / 2,
      fill: "rgba(0, 0, 0, 0.3)",
      selectable: false,
      evented: false,
      visible: false,
    });

    circle.set("name", cursorName);
    canvas.add(circle);
    setCursor(circle);

    const updateCursorPosition = (options: TPointerEventInfo) => {
      const pointer = canvas.getScenePoint(options.e);
      circle.set({
        left: pointer.x - width / 2,
        top: pointer.y - width / 2,
        visible: active,
      });
      canvas.renderAll();
    };

    canvas.on("mouse:move", updateCursorPosition);

    return () => {
      canvas.off("mouse:move", updateCursorPosition);
      canvas.remove(circle);
    };
  }, [canvas, width, active]);

  useEffect(() => {
    if (!canvas) return;
    if (!canvas.freeDrawingBrush) return;
    canvas.freeDrawingBrush.width = width;
  }, [width, canvas]);

  const handleDrawingModeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!canvas) return;

    if (active) {
      onActiveChange("");
      if (isCombined) {
        onClose();
      }
    } else {
      onActiveChange("inpainting");
    }
  };

  const handleDeleteObjects = () => {
    if (!canvas) return;
    canvas.clear();

    if (cursor) {
      canvas.add(cursor);
      canvas.renderAll();
    }
  };

  const switchToPencil = () => {
    if (!canvas) return;
    canvas.freeDrawingBrush ??= new PencilBrush(canvas);

    canvas.renderAll();
    canvas.freeDrawingBrush.width = width;
    canvas.freeDrawingBrush.color = "#a3e635";
  };

  useEffect(() => {
    if (!canvas) return;

    if (active) {
      canvas.isDrawingMode = true;
      switchToPencil();
    } else {
      canvas.isDrawingMode = false;
    }
  }, [active, canvas]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        role="button"
        className={clsx(
          "flex gap-3 items-center cursor-pointer p-3 rounded-lg border-2 transition-all",
          {
            "border-red-400 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/70":
              active,
            "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/70":
              !active,
          }
        )}
        onClick={handleDrawingModeChange}
      >
        {active ? (
          <>
            <X className="w-5 h-5" />
            <span className="font-semibold">CLOSE</span>
          </>
        ) : (
          <>
            <Palette className="w-5 h-5" />
            <span className="font-semibold">INPAINTING</span>
          </>
        )}
      </div>

      <div
        className={clsx(
          "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 transition-all duration-300",
          active ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-center gap-3 mb-2">
          <Circle
            size={15}
            className="text-gray-500 dark:text-gray-400"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Brush Size
          </span>
          <Circle
            size={30}
            className="text-gray-500 dark:text-gray-400"
          />
        </div>
        <input
          type="range"
          min="1"
          max={maxBrushWidth}
          value={width}
          onChange={(e) => handleWidthChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
          {width}px
        </div>
      </div>

      <div
        role="button"
        className={clsx(
          "flex gap-3 items-center cursor-pointer p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-all",
          {
            "opacity-100": active,
            "opacity-0 pointer-events-none": !active,
          }
        )}
        onClick={handleDeleteObjects}
      >
        <Trash2 className="w-5 h-5 text-red-500" />
        <span className="font-medium">Clear selection</span>
      </div>
    </div>
  );
};
