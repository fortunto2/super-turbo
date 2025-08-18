"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@turbo-super/ui";
import { BookOpen } from "lucide-react";
import { PromptBuilder } from "./PromptBuilder";
import { PromptPreview } from "./PromptPreview";
import { AIEnhancement } from "./AIEnhancement";
import { PromptHistory } from "./PromptHistory";
import {
  PromptData,
  EnhancementInfo,
  MoodboardImage,
  PresetOptions,
  HistoryItem,
  Character,
} from "../types";
import {
  generatePrompt,
  createRandomPromptData,
  copyToClipboard as copyToClipboardUtil,
  getLocaleLanguage,
} from "../utils";
import { PRESET_OPTIONS, DEFAULT_VALUES } from "../constants";

interface Veo3PromptGeneratorProps {
  enhancePromptFunction?: (params: {
    prompt: string;
    customLimit: number;
    model: string;
    focusType?: string;
    includeAudio: boolean;
    promptData: PromptData;
    moodboard?: {
      enabled: boolean;
      images: MoodboardImage[];
    };
  }) => Promise<{
    enhancedPrompt: string;
    model?: string;
    characterLimit?: number;
    characterCount?: number;
    targetCharacters?: number;
    metadata?: any;
  }>;
  MoodboardUploader?: React.ComponentType<{
    images: MoodboardImage[];
    setImages: (images: MoodboardImage[]) => void;
  }>;
  showInfoBanner?: boolean;
  className?: string;
}

export function Veo3PromptGenerator({
  enhancePromptFunction,
  MoodboardUploader,
  showInfoBanner = true,
  className = "",
}: Veo3PromptGeneratorProps) {
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
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState("");
  const [customCharacterLimit, setCustomCharacterLimit] = useState<number>(
    DEFAULT_VALUES.CHARACTER_LIMIT
  );
  const [selectedModel] = useState<"gpt-4.1">("gpt-4.1");
  const [promptHistory, setPromptHistory] = useState<HistoryItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enhancementInfo, setEnhancementInfo] =
    useState<EnhancementInfo | null>(null);
  const [activeTab, setActiveTab] = useState("builder");
  const [selectedFocusTypes, setSelectedFocusTypes] = useState<
    Array<"character" | "action" | "cinematic" | "safe">
  >(["safe"]);
  const [includeAudio, setIncludeAudio] = useState<boolean>(
    DEFAULT_VALUES.INCLUDE_AUDIO
  );
  const [moodboardEnabled, setMoodboardEnabled] = useState<boolean>(
    DEFAULT_VALUES.MOODBOARD_ENABLED
  );
  const [moodboardImages, setMoodboardImages] = useState<MoodboardImage[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("veo3-prompt-history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setPromptHistory(historyWithDates);
      } catch (error) {
        console.error("Failed to load prompt history:", error);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (promptHistory.length > 0) {
      localStorage.setItem(
        "veo3-prompt-history",
        JSON.stringify(promptHistory)
      );
    }
  }, [promptHistory]);

  // Generate prompt when promptData changes
  useEffect(() => {
    const hasValidCharacter = promptData.characters.some(
      (char) => char.name || char.description
    );
    if (promptData.scene || hasValidCharacter) {
      const prompt = generatePrompt(promptData);
      setGeneratedPrompt(prompt);
    }
  }, [promptData]);

  // Set language based on locale
  useEffect(() => {
    const defaultLanguage = getLocaleLanguage();
    setPromptData((prev) => ({ ...prev, language: defaultLanguage }));
  }, []);

  const addCharacter = () => {
    setPromptData((prev) => ({
      ...prev,
      characters: [
        ...prev.characters,
        { id: Date.now().toString(), name: "", description: "", speech: "" },
      ],
    }));
  };

  const updateCharacter = (
    id: string,
    field: keyof Character,
    value: string
  ) => {
    setPromptData((prev) => ({
      ...prev,
      characters: prev.characters.map((char) =>
        char.id === id ? { ...char, [field]: value } : char
      ),
    }));
  };

  const removeCharacter = (id: string) => {
    setPromptData((prev) => ({
      ...prev,
      characters: prev.characters.filter((char) => char.id !== id),
    }));
  };

  const clearAll = () => {
    const emptyData: PromptData = {
      scene: "",
      style: "",
      camera: "",
      characters: [],
      action: "",
      lighting: "",
      mood: "",
      language: "English",
    };
    setPromptData(emptyData);
    setGeneratedPrompt("");
    setEnhancedPrompt("");
    setEnhanceError("");
  };

  const saveToHistory = (
    basicPrompt: string,
    enhancedPrompt: string,
    length: string,
    model: string,
    promptData: PromptData
  ) => {
    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      basicPrompt,
      enhancedPrompt,
      length,
      model,
      promptData,
    };
    setPromptHistory((prev) => {
      const updated = [newHistoryItem, ...prev];
      return updated.slice(0, 10);
    });
  };

  const clearHistory = () => {
    setPromptHistory([]);
    localStorage.removeItem("veo3-prompt-history");
  };

  const randomizePrompt = () => {
    const randomData = createRandomPromptData();
    setPromptData(randomData);
  };

  const copyToClipboard = async (text: string) => {
    const success = await copyToClipboardUtil(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadFromHistory = (historyItem: HistoryItem) => {
    setPromptData(historyItem.promptData);
    setGeneratedPrompt(historyItem.basicPrompt);
    setEnhancedPrompt(historyItem.enhancedPrompt);
    if (historyItem.length) {
      const match = historyItem.length.match(/(\d+)/);
      if (match) {
        const charLimit = parseInt(match[1]);
        if (charLimit >= 200 && charLimit <= 10000) {
          setCustomCharacterLimit(charLimit);
        }
      }
    }
  };

  const toggleFocusType = (
    focusType: "character" | "action" | "cinematic" | "safe"
  ) => {
    setSelectedFocusTypes((prev) => {
      if (prev.includes(focusType)) {
        return prev.filter((type) => type !== focusType);
      } else {
        return [...prev, focusType];
      }
    });
  };

  const enhancePrompt = async (focusType?: string) => {
    if (!enhancePromptFunction) {
      console.warn("No enhance function provided");
      return;
    }

    let promptToEnhance = "";
    if (activeTab === "enhance" && enhancedPrompt.trim()) {
      promptToEnhance = enhancedPrompt.trim();
    } else if (generatedPrompt.trim()) {
      promptToEnhance = generatedPrompt.trim();
    } else {
      return;
    }

    setIsEnhancing(true);
    setEnhanceError("");

    try {
      const data = await enhancePromptFunction({
        prompt: promptToEnhance,
        customLimit: customCharacterLimit,
        model: selectedModel,
        focusType: focusType,
        includeAudio: includeAudio,
        promptData: promptData,
        ...(moodboardEnabled && moodboardImages.length > 0
          ? {
              moodboard: {
                enabled: true,
                images: moodboardImages.map((img) => ({
                  id: img.id,
                  url: img.url,
                  base64: img.base64,
                  tags: img.tags,
                  description: img.description,
                  weight: img.weight,
                })),
              },
            }
          : {}),
      });

      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
        setEnhancementInfo({
          model: data.model || selectedModel,
          modelName: data.model || selectedModel,
          length: `${data.characterLimit || customCharacterLimit} chars`,
          actualCharacters: data.characterCount || data.enhancedPrompt.length,
          targetCharacters: data.targetCharacters || customCharacterLimit,
        });

        const basicPromptForHistory =
          activeTab === "enhance" && enhancedPrompt.trim()
            ? promptToEnhance
            : generatedPrompt;
        saveToHistory(
          basicPromptForHistory,
          data.enhancedPrompt,
          `${data.characterLimit || customCharacterLimit} chars`,
          data.model || selectedModel,
          promptData
        );
      } else {
        throw new Error("No enhanced prompt received");
      }
    } catch (error) {
      console.error("Enhancement error:", error);
      setEnhanceError(
        error instanceof Error ? error.message : "Failed to enhance prompt"
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  const enhanceWithSelectedFocus = async () => {
    if (selectedFocusTypes.length === 0) {
      await enhancePrompt();
    } else {
      await enhancePrompt(selectedFocusTypes.join(","));
    }
  };

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {/* Info Banner */}
      {showInfoBanner && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50/10 to-blue-50/10 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200/20 dark:border-green-600/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100/20 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                Master VEO3 Video Generation
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                Learn professional prompting techniques and best practices for
                Google&apos;s most advanced AI video model.
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Prompt Builder</TabsTrigger>
          <TabsTrigger value="enhance">AI Enhancement</TabsTrigger>
          <TabsTrigger value="history">
            History ({promptHistory.length}/10)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PromptBuilder
              promptData={promptData}
              setPromptData={setPromptData}
              addCharacter={addCharacter}
              updateCharacter={updateCharacter}
              removeCharacter={removeCharacter}
              presetOptions={PRESET_OPTIONS}
              moodboardEnabled={moodboardEnabled}
              setMoodboardEnabled={setMoodboardEnabled}
              moodboardImages={moodboardImages}
              setMoodboardImages={setMoodboardImages}
              MoodboardUploader={MoodboardUploader || undefined}
            />
            <PromptPreview
              generatedPrompt={generatedPrompt}
              setGeneratedPrompt={setGeneratedPrompt}
              randomizePrompt={randomizePrompt}
              clearAll={clearAll}
              copyToClipboard={copyToClipboard}
              copied={copied}
              setActiveTab={setActiveTab}
              isEnhancing={isEnhancing}
              enhancePrompt={enhancePrompt}
            />
          </div>
        </TabsContent>

        <TabsContent value="enhance">
          <AIEnhancement
            enhancedPrompt={enhancedPrompt}
            setEnhancedPrompt={setEnhancedPrompt}
            generatedPrompt={generatedPrompt}
            enhanceWithSelectedFocus={enhanceWithSelectedFocus}
            isEnhancing={isEnhancing}
            enhanceError={enhanceError}
            enhancementInfo={enhancementInfo}
            selectedFocusTypes={selectedFocusTypes}
            toggleFocusType={toggleFocusType}
            includeAudio={includeAudio}
            setIncludeAudio={setIncludeAudio}
            customCharacterLimit={customCharacterLimit}
            setCustomCharacterLimit={setCustomCharacterLimit}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            copied={copied}
            copyToClipboard={copyToClipboard}
          />
        </TabsContent>

        <TabsContent value="history">
          <PromptHistory
            promptHistory={promptHistory}
            loadFromHistory={loadFromHistory}
            clearHistory={clearHistory}
            setActiveTab={setActiveTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
