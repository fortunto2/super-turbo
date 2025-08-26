"use client";

import { useParams } from "next/navigation";
import { getValidLocale } from "@/lib/get-valid-locale";
import { useState } from "react";

// Упрощенные типы
interface PromptData {
  scene: string;
  style: string;
  camera: string;
  characters: Array<{
    id: string;
    name: string;
    description: string;
    speech: string;
  }>;
  action: string;
  lighting: string;
  mood: string;
  language: string;
}

interface MoodboardImage {
  url: string;
  alt: string;
}

// Упрощенная версия Veo3PromptGenerator
function SimpleVeo3PromptGenerator({
  enhancePromptFunction,
  locale,
}: {
  enhancePromptFunction: (params: any) => Promise<any>;
  locale: string;
}) {
  const [promptData, setPromptData] = useState<PromptData>({
    scene: "",
    style: "",
    camera: "",
    characters: [{ id: "default", name: "", description: "", speech: "" }],
    action: "",
    lighting: "",
    mood: "",
    language: "English",
  });

  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const generatePrompt = () => {
    const prompt = `Scene: ${promptData.scene}
Style: ${promptData.style}
Camera: ${promptData.camera}
Characters: ${promptData.characters.map((c) => `${c.name}: ${c.description}`).join(", ")}
Action: ${promptData.action}
Lighting: ${promptData.lighting}
Mood: ${promptData.mood}
Language: ${promptData.language}`;

    setGeneratedPrompt(prompt);
  };

  return (
    <div className="bg-card border rounded-lg p-6 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-foreground">
        VEO3 Prompt Generator
      </h3>

      <div className="space-y-6">
        {/* Scene */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Scene Description
          </label>
          <textarea
            className="w-full p-3 border rounded-md bg-background text-foreground"
            placeholder="Describe the scene..."
            value={promptData.scene}
            onChange={(e) =>
              setPromptData({ ...promptData, scene: e.target.value })
            }
            rows={3}
          />
        </div>

        {/* Style and Camera */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Style
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-md bg-background text-foreground"
              placeholder="Cinematic, artistic, etc."
              value={promptData.style}
              onChange={(e) =>
                setPromptData({ ...promptData, style: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Camera
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-md bg-background text-foreground"
              placeholder="Close-up, wide shot, etc."
              value={promptData.camera}
              onChange={(e) =>
                setPromptData({ ...promptData, camera: e.target.value })
              }
            />
          </div>
        </div>

        {/* Action and Lighting */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Action
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-md bg-background text-foreground"
              placeholder="What's happening..."
              value={promptData.action}
              onChange={(e) =>
                setPromptData({ ...promptData, action: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Lighting
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-md bg-background text-foreground"
              placeholder="Natural, dramatic, etc."
              value={promptData.lighting}
              onChange={(e) =>
                setPromptData({ ...promptData, lighting: e.target.value })
              }
            />
          </div>
        </div>

        {/* Mood */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Mood
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded-md bg-background text-foreground"
            placeholder="Tense, peaceful, mysterious..."
            value={promptData.mood}
            onChange={(e) =>
              setPromptData({ ...promptData, mood: e.target.value })
            }
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePrompt}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md hover:bg-primary/90 transition-colors font-medium"
        >
          Generate Prompt
        </button>

        {/* Generated Prompt */}
        {generatedPrompt && (
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2 text-foreground">
              Generated Prompt
            </label>
            <textarea
              className="w-full p-3 border rounded-md bg-muted text-foreground"
              value={generatedPrompt}
              readOnly
              rows={8}
            />
            <button
              onClick={() => navigator.clipboard.writeText(generatedPrompt)}
              className="mt-2 bg-secondary text-secondary-foreground py-2 px-4 rounded-md hover:bg-secondary/90 transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function SimpleVeo3Generator() {
  const params = useParams();
  const locale = getValidLocale(params.locale);

  const enhancePromptFunction = async (enhanceParams: any) => {
    // Заглушка для API функции
    console.log("Enhance prompt function called with:", enhanceParams);
    return { enhancedPrompt: "Enhanced prompt placeholder" };
  };

  return (
    <div className="max-w-7xl veo3-fixes">
      <SimpleVeo3PromptGenerator
        enhancePromptFunction={enhancePromptFunction}
        locale={locale}
      />
    </div>
  );
}
