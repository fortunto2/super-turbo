import { PromptData, Character } from "../types";
import { Locale } from "../translations";

export const generatePrompt = (data: PromptData): string => {
  const parts: string[] = [];

  if (data.scene) parts.push(data.scene);

  if (data.characters.length > 0) {
    const validCharacters = data.characters.filter(
      (char) => char.name || char.description
    );
    if (validCharacters.length > 0) {
      const characterDescriptions = validCharacters.map((char) => {
        let desc = char.description || char.name || "a character";
        if (char.speech && data.language) {
          desc += ` who says in ${data.language.toLowerCase()}: "${char.speech}"`;
        }
        return desc;
      });
      parts.push(`featuring ${characterDescriptions.join(", ")}`);
    }
  }

  if (data.action) parts.push(`${data.action}`);
  if (data.camera) parts.push(`Shot with ${data.camera.toLowerCase()}`);
  if (data.style) parts.push(`${data.style.toLowerCase()} style`);
  if (data.lighting) parts.push(`${data.lighting.toLowerCase()} lighting`);
  if (data.mood) parts.push(`${data.mood.toLowerCase()} mood`);

  return parts.length > 0
    ? parts.join(", ") + "."
    : "Your generated prompt will appear here, or type your own prompt...";
};

export const createRandomPromptData = (): PromptData => {
  const styles = [
    "Cinematic",
    "Documentary",
    "Anime",
    "Realistic",
    "Artistic",
    "Vintage",
    "Modern",
  ];
  const cameras = [
    "Close-up",
    "Wide shot",
    "Over-the-shoulder",
    "Drone view",
    "Handheld",
    "Static",
  ];
  const lighting = [
    "Natural",
    "Golden hour",
    "Blue hour",
    "Dramatic",
    "Soft",
    "Neon",
    "Candlelight",
  ];
  const moods = [
    "Peaceful",
    "Energetic",
    "Mysterious",
    "Romantic",
    "Tense",
    "Joyful",
    "Melancholic",
  ];
  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Russian",
    "Japanese",
    "Chinese",
  ];

  return {
    scene: "A serene lakeside at sunset",
    characters: [
      {
        id: "1",
        name: "Person",
        description: "A person in casual clothes",
        speech: Math.random() > 0.5 ? "Perfect evening for this!" : "",
      },
    ],
    action: "skipping stones across the water",
    language: languages[Math.floor(Math.random() * languages.length)],
    style: styles[Math.floor(Math.random() * styles.length)],
    camera: cameras[Math.floor(Math.random() * cameras.length)],
    lighting: lighting[Math.floor(Math.random() * lighting.length)],
    mood: moods[Math.floor(Math.random() * moods.length)],
  };
};

export const createEmptyPromptData = (): PromptData => ({
  scene: "",
  style: "",
  camera: "",
  characters: [],
  action: "",
  lighting: "",
  mood: "",
  language: "English",
});

export const createCharacter = (id?: string): Character => ({
  id: id || Date.now().toString(),
  name: "",
  description: "",
  speech: "",
});

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

export const getLocaleLanguage = (locale?: Locale): string => {
  if (typeof window === "undefined") return "English";

  // Если передан locale как параметр, используем его
  if (locale) {
    const localeToLanguage: Record<Locale, string> = {
      en: "English",
      ru: "Russian",
      es: "Spanish",
      hi: "Hindi",
      tr: "Turkish",
    };

    return localeToLanguage[locale] || "English";
  }

  // Иначе получаем из URL (для обратной совместимости)
  const urlLocale = window.location.pathname.split("/")[1];
  const localeToLanguage: Record<string, string> = {
    en: "English",
    ru: "Russian",
    es: "Spanish",
    hi: "Hindi",
    tr: "Turkish",
  };

  return localeToLanguage[urlLocale] || "English";
};
