import type { Canvas, IText, TextboxProps } from "fabric";
import { Textbox } from "fabric";
import { FONTS, loadFonts } from "super-timeline";

export type FabricControllerEvents =
  | { type: "selection:changed" }
  | { type: "object:added"; target: any }
  | { type: "object:removed"; target: any }
  | { type: "object:modified"; target: any }
  | { type: "text:changed"; target: IText }
  | { type: "object:hover"; target: any }
  | { type: "object:hover:out" }
  | { type: "object:clicked"; target: any }
  | { type: "canvas:clicked" };

type Listener = (event: FabricControllerEvents) => void;

export class FabricController {
  private canvas: Canvas;
  private listeners: Set<Listener> = new Set();

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.bindEvents();
  }

  private bindEvents() {
    const emit = (event: FabricControllerEvents) => {
      this.listeners.forEach((l) => l(event));
    };

    this.canvas.on("selection:cleared", () =>
      emit({ type: "selection:changed" })
    );
    this.canvas.on("selection:created", () =>
      emit({ type: "selection:changed" })
    );
    this.canvas.on("selection:updated", () =>
      emit({ type: "selection:changed" })
    );
    this.canvas.on("object:added", (e: any) =>
      emit({ type: "object:added", target: e.target })
    );
    this.canvas.on("object:removed", (e: any) =>
      emit({ type: "object:removed", target: e.target })
    );
    this.canvas.on("object:modified", (e: any) =>
      emit({ type: "object:modified", target: e.target })
    );
    this.canvas.on("text:changed", (e: any) =>
      emit({ type: "text:changed", target: e.target })
    );
    this.canvas.on("mouse:over", (e: any) =>
      emit({ type: "object:hover", target: e.target })
    );
    this.canvas.on("mouse:out", () => emit({ type: "object:hover:out" }));
    this.canvas.on("mouse:down", (e: any) => {
      if (e && e.target) {
        emit({ type: "object:clicked", target: e.target });
      } else {
        emit({ type: "canvas:clicked" });
      }
    });
  }

  getCanvasElement() {
    return this.canvas.getElement();
  }

  on(listener: Listener) {
    this.listeners.add(listener);
    return () => this.off(listener);
  }

  off(listener: Listener) {
    this.listeners.delete(listener);
  }

  async importObjects(objects: any[], replace = true) {
    if (!objects) return;
    await this.loadFontsForObjects(objects);

    if (replace) {
      this.canvas.remove(...this.canvas.getObjects());
    }

    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();
    const canvasSquare = canvasWidth * canvasHeight;
    const canvasSqrt = Math.round(Math.sqrt(canvasSquare) * 100) / 100;

    const canvasObjects = objects.map((object) => {
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

    this.canvas.add(...canvasObjects);
    this.canvas.requestRenderAll();
  }

  private async loadFontsForObjects(objects: any[]) {
    const objectsFonts: string[] = [];
    objects.forEach((object) => {
      if (
        object.fontFamily &&
        !objectsFonts.includes(object.fontFamily as string)
      ) {
        objectsFonts.push(object.fontFamily as string);
      }
    });

    const fontsData = objectsFonts.map((objectFont) => {
      const obj = objects.find((obj: any) => obj.fontFamily === objectFont);
      if (obj) {
        return { name: obj.fontFamily as string, url: obj.fontUrl as string };
      }
      const defaultFont = FONTS.find(
        (font) =>
          font.family === objectFont || font.postScriptName === objectFont
      );
      console.log(defaultFont);
      return {
        name: defaultFont?.postScriptName ?? objectFont,
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
  }

  exportObjects() {
    const canvasJSON = this.canvas.toJSON();
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();
    const canvasSquare = canvasWidth * canvasHeight;
    const canvasSqrt = Math.round(Math.sqrt(canvasSquare) * 100) / 100;
    return (canvasJSON.objects as any[]).map((object: any) => {
      const { left, top, width, height, fontSize } = object;
      return {
        ...object,
        left: left / canvasWidth,
        top: top / canvasHeight,
        width: width / canvasWidth,
        height: height / canvasHeight,
        fontSize: fontSize
          ? Math.round((canvasSqrt / fontSize) * 100) / 100
          : undefined,
      };
    });
  }

  addText(text: string, options?: Partial<TextboxProps>) {
    const textObject = new Textbox(text, options);
    this.canvas.add(textObject);
    this.canvas.setActiveObject(textObject);
    this.canvas.renderAll();
  }

  removeSelected() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      this.canvas.remove(activeObject);
      this.canvas.renderAll();
    }
  }

  getActiveText() {
    const object = this.canvas.getActiveObject();
    if (object instanceof Textbox) {
      return object;
    }
  }

  setStyle(style: string) {
    const activeObject = this.getActiveText();
    if (!activeObject) return false;
    const currentValue = activeObject.get(
      styleMap[style as keyof typeof styleMap]
    );
    if (style === "bold") {
      const newValue = currentValue === "bold" ? "normal" : "bold";
      this.updateText(activeObject, { fontWeight: newValue });
    } else if (style === "italic") {
      const newValue = currentValue === "italic" ? "normal" : "italic";
      this.updateText(activeObject, { fontStyle: newValue });
    } else if (style === "uppercase") {
      const newText = isUppercase(activeObject.text);
      this.updateText(activeObject, { text: newText });
    } else {
      this.updateText(activeObject, {
        [styleMap[style]]: !currentValue,
      } as any);
    }
  }

  setFontFamily(fontFamily: string) {
    const activeObject = this.getActiveText();
    if (!activeObject) return;
    this.updateText(activeObject, { fontFamily });
  }

  setProperty(properties: Partial<TextboxProps>) {
    const activeObject = this.getActiveText();
    if (!activeObject) return;
    this.updateText(activeObject, { ...properties });
  }

  setFontSize(fontSize: number) {
    const activeObject = this.getActiveText();
    if (!activeObject) return;
    this.updateText(activeObject, { fontSize });
  }

  setFill(color: string) {
    const activeObject = this.getActiveText();
    if (!activeObject) return;
    this.updateText(activeObject, { fill: color } as any);
  }

  setTextAlign(align: "left" | "center" | "right" | "justify") {
    const activeObject = this.getActiveText();
    if (!activeObject) return;
    this.updateText(activeObject, { textAlign: align } as any);
  }

  setText(text: string) {
    const activeObject = this.getActiveText();
    if (!activeObject) return;
    this.updateText(activeObject, { text });
  }

  updateText(
    object: Textbox,
    options?: Partial<TextboxProps & { text: string }>
  ) {
    object.set(options);
    // Не вызываем text:changed событие здесь, чтобы избежать циклических обновлений
    // Событие будет вызвано автоматически при изменении объекта
    this.canvas.renderAll();
  }
}

export const buildFabricController = (canvas: Canvas) =>
  new FabricController(canvas);

const isUppercase = (text: string) => {
  const isUpper = text === text.toUpperCase();
  const newText = isUpper ? text.toLowerCase() : text.toUpperCase();
  return newText;
};

const styleMap: Record<string, keyof TextboxProps> = {
  bold: "fontWeight",
  italic: "fontStyle",
  underline: "underline",
  linethrough: "linethrough",
  overline: "overline",
};

export type FabricControllerType = FabricController;
