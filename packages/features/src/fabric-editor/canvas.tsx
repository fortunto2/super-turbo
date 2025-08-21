"use client";

import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { Canvas, Textbox } from "fabric";
import {
  AlignGuidelines,
  CenteringGuidelines,
} from "@superduperai/fabric-guideline-plugin";
import { FONTS, loadFonts } from "super-timeline";

type Props = {
  className?: string;
  onReady?: (canvas: Canvas) => void;
  initialObjects?: any[];
  readonly?: boolean;
  width?: number;
  height?: number;
};

export const FabricCanvas: FC<Props> = ({
  className,
  onReady,
  readonly,
  initialObjects,
  width: initialWidth,
  height: initialHeight,
}) => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  const alignGuidelines = useRef<AlignGuidelines | null>(null);

  const centeringGuidelines = useRef<CenteringGuidelines | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadObjects = async (canvas: Canvas) => {
    if (!initialObjects) return;

    const objectsFonts: string[] = [];
    canvas.remove(...canvas.getObjects());

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const canvasSquare = canvasWidth * canvasHeight;
    const canvasSqrt = Math.round(Math.sqrt(canvasSquare) * 100) / 100;

    initialObjects.forEach((object) => {
      if (
        object.fontFamily &&
        !objectsFonts.includes(object.fontFamily as string)
      ) {
        objectsFonts.push(object.fontFamily as string);
      }
    });

    const fontsData = objectsFonts.map((objectFont) => {
      const obj = initialObjects.find((obj) => obj.fontFamily === objectFont);
      if (obj) {
        return { name: objectFont, url: obj.fontUrl };
      }
      const defaultFont = FONTS.find(
        (font) =>
          font.family === objectFont || font.postScriptName === objectFont
      );
      return {
        name: defaultFont?.fullName ?? objectFont,
        url: defaultFont?.url ?? "",
      };
    });

    await loadFonts(fontsData);
    await Promise.all(
      fontsData
        .filter((f) => f.name)
        .map((f) => document.fonts.load(`1em "${f.name}"`))
    );
    await document.fonts.ready;

    const canvasObjects = initialObjects.map((object) => {
      const { text, type, left, top, width, height, fontSize, ...objectData } =
        object;

      const relativeData = {
        left: left * canvasWidth,
        top: top * canvasHeight,
        width: width * canvasWidth,
        height: height * canvasHeight,
        fontSize: fontSize
          ? Math.round((canvasSqrt / fontSize) * 100) / 100
          : undefined,
      };

      if (type === "Textbox") {
        const textbox = new Textbox(text as string, {
          ...objectData,
          ...relativeData,
          fontFamily: object.fontFamily,
        });
        textbox.setControlsVisibility({ mt: false, mb: false });
        return textbox;
      }

      throw new Error(`Unsupported object type: ${object.type}`);
    });

    canvas.add(...canvasObjects);
    canvas.requestRenderAll();
  };

  const setCurrentDimensions = (canvas: Canvas) => {
    const oldWidth = canvas.getWidth();
    const oldHeight = canvas.getHeight();

    canvas.setDimensions({
      width: containerRef.current?.clientWidth ?? 0,
      height: containerRef.current?.clientHeight ?? 0,
    });

    const scaleX = canvas.getWidth() / oldWidth;
    const scaleY = canvas.getHeight() / oldHeight;

    canvas.getObjects().forEach((object: any) => {
      object.set({
        width: object.width * scaleX,
        height: object.height * scaleY,
        left: object.left * scaleX,
        top: object.top * scaleY,
        fontSize: object.fontSize ? object.fontSize * scaleX : undefined,
      });
    });

    canvas.renderAll();
  };
  useEffect(() => {
    if (!canvas || !initialObjects || canvas.getActiveObject()) return;
    void loadObjects(canvas);
  }, [initialObjects, canvas]);

  useEffect(() => {
    if (!canvas) return;

    setGuidelines(canvas);

    if (onReady) {
      onReady(canvas);
    }
  }, [canvas]);

  const setGuidelines = (canvas: Canvas) => {
    alignGuidelines.current = new AlignGuidelines({
      canvas: canvas,
      aligningOptions: {
        lineColor: "#32D10A",
        lineMargin: 8,
      },
    });

    alignGuidelines.current.init();

    centeringGuidelines.current = new CenteringGuidelines({
      canvas: canvas,
      color: "#32D10A",
      verticalOffset: 8,
      horizontalOffset: 8,
    });

    centeringGuidelines.current.init();
  };

  useEffect(() => {
    const width = containerRef.current?.clientWidth ?? initialWidth ?? 0;
    const height = containerRef.current?.clientHeight ?? initialHeight ?? 0;

    const fabricCanvas = new Canvas(canvasRef.current ?? undefined, {
      width,
      height,
    });

    const observeTarget = containerRef.current;

    if (!observeTarget) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      if (width !== 0 && height !== 0) {
        setCurrentDimensions(fabricCanvas);
        setCanvas(fabricCanvas);
      }
    });

    resizeObserver.observe(observeTarget);

    return () => {
      resizeObserver.unobserve(observeTarget);
      resizeObserver.disconnect();
      void fabricCanvas.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        pointerEvents: readonly ? "none" : undefined,
        width: initialWidth ? `${initialWidth}px` : undefined,
        height: initialHeight ? `${initialHeight}px` : undefined,
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};
