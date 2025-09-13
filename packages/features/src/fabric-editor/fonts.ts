import { FONTS, loadFonts } from "super-timeline";

export const loadFontsForObjects = async (objects: any[]) => {
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
    const obj = objects.find((obj) => obj.fontFamily === objectFont);
    if (obj) {
      return { name: obj.fontFamily as string, url: obj.fontUrl as string };
    }
    const defaultFont = FONTS.find(
      (font) => font.family === objectFont || font.postScriptName === objectFont
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
};
