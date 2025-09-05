"use client";

import type { FC } from "react";
import { useEffect, useState } from "react";
import type { FabricController } from "./controller";
import {
  FONTS,
  getCompactFontData,
  loadFonts,
  ScrollArea,
  FontFamily,
  Alignment,
  TextDecoration,
  FontStyle,
  FontSize,
  FontColor,
  Opacity,
  BackgroundColor,
} from "super-timeline";
import { ShoppingBasket, Trash2, X } from "lucide-react";
import "super-timeline/style.css";
// Types from super-timeline
import type { ICompactFont, IFont } from "super-timeline";
import { TextboxProps } from "fabric";

type Props = {
  controller: FabricController;
  visible: boolean;
  onClose?: () => void;
};

export const TextToolbar: FC<Props> = ({ controller, visible, onClose }) => {
  type TextProperties = {
    color: string;
    colorDisplay: string;
    fontSize: number;
    fontSizeDisplay: string;
    fontFamily: string;
    fontFamilyDisplay: string;
    opacity: number;
    opacityDisplay: string;
    textAlign: "left" | "center" | "right" | "justify";
    textDecoration: string;
    borderWidth: number;
    borderColor: string;
    backgroundColor?: string;
  };

  console.log(controller);

  const [properties, setProperties] = useState<TextProperties>({
    color: "#ffffff",
    colorDisplay: "#ffffff",
    fontSize: 40,
    fontSizeDisplay: "40px",
    fontFamily: "Open Sans",
    fontFamilyDisplay: "Open Sans",
    opacity: 100,
    opacityDisplay: "100%",
    textAlign: "left",
    textDecoration: "none",
    borderWidth: 0,
    borderColor: "#000000",
    backgroundColor: "#00000000",
  });

  const [selectedFont, setSelectedFont] = useState<ICompactFont>({
    family: "Open Sans",
    styles: [],
    // @ts-expect-error default is required by ICompactFont at runtime; we only need shape
    default: {
      family: "Open Sans",
      postScriptName: "OpenSans-Regular",
      url: "",
    },
    name: "Regular",
  });

  const handleSetProperties = () => {
    const active = controller.getActiveText();
    if (active) {
      const activeFontFamily =
        (active.get("fontFamily") as string) || "Open Sans";
      const activeFontSize = (active.get("fontSize") as number) || 40;
      const activeFill = (active.get("fill") as string) || "#ffffff";
      const activeAlign = (active.get("textAlign") as any) || "left";
      const activeBackground =
        (active.get("backgroundColor") as any) || "#00000000";
      const activeOpacity = (active.get("opacity") as number) ?? 1; // fabric хранит в 0-1
      const activeDecoration =
        (active.get("underline") ? "underline " : "") +
        (active.get("linethrough") ? "line-through " : "") +
        (active.get("overline") ? "overline" : "");

      const compactFonts = getCompactFontData(FONTS);
      const found = compactFonts.find((f) => f.family === activeFontFamily);

      setSelectedFont(
        found
          ? {
              ...found,
              name:
                found.default?.postScriptName?.split("-")?.slice(-1)[0] ||
                "Regular",
            }
          : selectedFont
      );

      setProperties((prev) => ({
        ...prev,
        fontFamily: activeFontFamily,
        fontFamilyDisplay: activeFontFamily,
        fontSize: activeFontSize,
        fontSizeDisplay: `${activeFontSize}px`,
        color: activeFill,
        colorDisplay: activeFill,
        textAlign: activeAlign,
        backgroundColor: activeBackground,
        opacity: Math.round(activeOpacity * 100),
        opacityDisplay: `${Math.round(activeOpacity * 100)}%`,
        textDecoration: activeDecoration.trim() || "none",
      }));
    }
  };

  useEffect(() => {
    const handler = (evt: any) => {
      if (evt.type !== "selection:changed") return;
      if (!visible) return;

      const active = controller.getActiveText();
      if (active) {
        handleSetProperties();
      }
    };
    controller.on(handler);
    return () => {
      controller.off(handler);
    };
  }, [visible, controller]);

  useEffect(() => {
    if (visible) {
      handleSetProperties();
    }
  }, [visible]);

  const handleChangeFont = async (font: ICompactFont) => {
    const fontName = font.default.postScriptName;
    const fontUrl = font.default.url;
    await loadFonts([{ name: fontName, url: fontUrl }]).then(() => {
      controller.setFontFamily(fontName);
    });
    setSelectedFont({
      ...font,
      name: fontName.split("-").slice(-1)[0] || "Regular",
    });
    setProperties((prev) => ({
      ...prev,
      fontFamily: font.default.family,
      fontFamilyDisplay: font.default.family,
    }));
  };

  const handleChangeFontStyle = async (font: IFont) => {
    const fontName = font.postScriptName;
    const fontUrl = font.url;
    await loadFonts([{ name: fontName, url: fontUrl }]).then(() => {
      controller.setFontFamily(fontName);
    });
    setSelectedFont((prev) => ({
      ...prev,
      name: fontName.split("-").slice(-1)[0] || prev.name,
    }));
  };

  const handleChangeFontSize = (v: number) => {
    setProperties((prev) => ({
      ...prev,
      fontSize: v,
      fontSizeDisplay: `${v}px`,
    }));
    controller.setFontSize(v);
  };

  const handleColorChange = (color: string) => {
    setProperties((prev) => ({ ...prev, color, colorDisplay: color }));
    controller.setProperty({ fill: color });
  };

  const handleChangeTextAlign = (
    v: "left" | "center" | "right" | "justify" | string
  ) => {
    const textAlign = v as any as "left" | "center" | "right" | "justify";
    setProperties((prev) => ({ ...prev, textAlign }));
    controller.setProperty({ textAlign });
  };

  const handleChangeTextDecoration = (v: string) => {
    const properties: Partial<TextboxProps> = {
      underline: v.includes("underline"),
      linethrough: v.includes("line-through"),
      overline: v.includes("overline"),
    };

    setProperties((prev) => ({ ...prev, textDecoration: v }));
    controller.setProperty(properties);
  };

  const handleChangeOpacity = (v: number) => {
    setProperties((prev) => ({ ...prev, opacity: v, opacityDisplay: `${v}%` }));
    controller.setProperty({ opacity: v / 100 });
  };

  const handleBackgroundChange = (backgroundColor: string) => {
    setProperties((prev) => ({ ...prev, backgroundColor }));
    controller.setProperty({ backgroundColor });
  };

  const handleRemoveSelected = () => {
    controller.removeSelected();
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translate(0, -50%)",
        // zIndex: 2,
        height: "300px",
        // overflow: "hidden",
        // overflowY: "scroll",
        maxWidth: "250px",
      }}
      className="flex flex-1 flex-col pointer-events-auto rounded-lg border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-2 pb-2 px-1">
        <div className="text-xs text-muted-foreground">Text</div>
        <button
          aria-label="Close"
          className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted/50"
          onClick={onClose}
        >
          <X size={14} />
        </button>
      </div>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-2 px-4">
          <div className="flex flex-col gap-2">
            <FontFamily
              handleChangeFont={handleChangeFont}
              fontFamilyDisplay={properties.fontFamilyDisplay}
            />
            <div className="grid grid-cols-2 gap-3">
              <FontStyle
                selectedFont={selectedFont}
                handleChangeFontStyle={handleChangeFontStyle}
              />
              <FontSize
                value={properties.fontSize}
                onChange={handleChangeFontSize}
              />
            </div>
            <FontColor
              value={properties.color}
              handleColorChange={handleColorChange}
            />

            <div className="grid grid-cols-2 gap-2">
              <Alignment
                value={properties.textAlign}
                onChange={handleChangeTextAlign}
              />
              <TextDecoration
                value={properties.textDecoration}
                onChange={handleChangeTextDecoration}
              />
            </div>
          </div>

          <Opacity
            onChange={(v: number) => handleChangeOpacity(v)}
            value={properties.opacity!}
          />

          <BackgroundColor
            value={properties.backgroundColor || "#ffffff"}
            handleBackgroundChange={handleBackgroundChange}
          />
          <div className="flex justify-center pt-2">
            <button
              onClick={handleRemoveSelected}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-red-500/90 text-white text-sm py-2 transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <Trash2 size="17px" />
              Remove
            </button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
