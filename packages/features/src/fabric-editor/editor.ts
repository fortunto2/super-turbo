import type { Canvas, IText, TextboxProps } from "fabric";
import { Textbox } from "fabric";

export const buildFabricEditor = (canvas: Canvas) => {
    return {
        canvas,
        addText(text: string, options?: Partial<TextboxProps>) {
            const textObject = new Textbox(text, options);
            canvas.add(textObject);
            canvas.setActiveObject(textObject);
            canvas.renderAll();
        },
        removeText() {
            const activeObject = this.getActiveText();
            if (activeObject) {
                canvas.remove(activeObject);
                canvas.renderAll();
            }
        },
        setStyleText(style: string) {
            const activeObject = this.getActiveText() as Textbox | undefined;
            if (!activeObject) return false;

            const currentValue = activeObject.get(styleMap[style]);

            if (style === "bold") {
                const newValue = currentValue === "bold" ? "normal" : "bold";
                this.updateText(activeObject, { fontWeight: newValue });
            } else if (style === "italic") {
                const newValue =
                    currentValue === "italic" ? "normal" : "italic";
                this.updateText(activeObject, { fontStyle: newValue });
            } else if (style === "uppercase") {
                const newText = isUppercase(activeObject.text);
                this.updateText(activeObject, { text: newText });
            } else {
                this.updateText(activeObject, {
                    [styleMap[style]]: !currentValue,
                });
            }
        },
        updateText(
            object: Textbox,
            options?: Partial<TextboxProps & { text: string }>,
        ) {
            object.set(options);
            canvas.fire("text:changed", { target: object as unknown as IText });
            canvas.renderAll();
        },
        getActiveText() {
            const object = canvas.getActiveObject();
            if (object instanceof Textbox) {
                return object;
            }
        },
        exportObjects() {
            const canvasJSON = canvas.toJSON();

            // Convert object position from pixel to percentage

            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();

            const canvasSquare = canvasWidth * canvasHeight;
            const canvasSqrt = Math.round(Math.sqrt(canvasSquare) * 100) / 100;

            return canvasJSON.objects.map((object: any) => {
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
        },
    };
};

export type FabricEditor = ReturnType<typeof buildFabricEditor>;

const isUppercase = (text: string) => {
    const isUppercase = text === text.toUpperCase();
    const newText = isUppercase ? text.toLowerCase() : text.toUpperCase();
    return newText;
};

const styleMap: Record<string, keyof TextboxProps> = {
    bold: "fontWeight",
    italic: "fontStyle",
    underline: "underline",
    linethrough: "linethrough",
};
