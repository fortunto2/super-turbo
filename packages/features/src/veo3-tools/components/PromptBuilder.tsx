import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Textarea,
  Label,
  Badge,
} from "@turbo-super/ui";
import { Trash2 } from "lucide-react";
import { Character, PromptData, PresetOptions, MoodboardImage } from "../types";
import { MoodboardUploader as DefaultMoodboardUploader } from "./MoodboardUploader";
import { useTranslation } from "../hooks/use-translation";
import { Locale } from "../translations";

interface PromptBuilderProps {
  promptData: PromptData;
  setPromptData: (data: PromptData) => void;
  addCharacter: () => void;
  updateCharacter: (id: string, field: keyof Character, value: string) => void;
  removeCharacter: (id: string) => void;
  presetOptions: PresetOptions;
  moodboardEnabled?: boolean;
  setMoodboardEnabled?: (enabled: boolean) => void;
  moodboardImages?: MoodboardImage[];
  setMoodboardImages?: (images: MoodboardImage[]) => void;
  MoodboardUploader?: React.ComponentType<{
    images: MoodboardImage[];
    setImages: (images: MoodboardImage[]) => void;
  }>;
  locale?: Locale;
}

export function PromptBuilder({
  promptData,
  setPromptData,
  addCharacter,
  updateCharacter,
  removeCharacter,
  presetOptions,
  moodboardEnabled = false,
  setMoodboardEnabled,
  moodboardImages = [],
  setMoodboardImages,
  MoodboardUploader,
  locale = "en",
}: PromptBuilderProps) {
  const { t } = useTranslation(locale);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("veo3PromptGenerator.tabs.builder")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scene Description */}
        <div className="space-y-2 p-4 border-l-4 border-blue-500 bg-blue-950/20 rounded-lg">
          <Label
            htmlFor="scene"
            className="flex items-center gap-2 text-blue-300 font-medium"
          >
            🎬 {t("veo3PromptGenerator.promptBuilder.scene")}
          </Label>
          <Textarea
            id="scene"
            placeholder={t(
              "veo3PromptGenerator.promptBuilder.scenePlaceholder"
            )}
            value={promptData.scene}
            onChange={(e) =>
              setPromptData({ ...promptData, scene: e.target.value })
            }
            className="min-h-[80px] border-blue-600 bg-blue-950/10 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
        {/* Characters */}
        <div className="space-y-4 p-4 border-l-4 border-green-500 bg-green-950/20 rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-green-300 font-medium">
              👥 {t("veo3PromptGenerator.promptBuilder.characters")} (
              {promptData.characters.length})
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCharacter}
              className="text-xs border-green-600 text-green-300 hover:bg-green-950/30"
            >
              + {t("veo3PromptGenerator.promptBuilder.addCharacter")}
            </Button>
          </div>
          {promptData.characters.length === 0 && (
            <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
              {t("veo3PromptGenerator.promptBuilder.noCharacters")}
            </div>
          )}
          {promptData.characters.map((character, index) => (
            <div
              key={character.id}
              className="p-4 border border-green-600 bg-green-950/10 rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t("veo3PromptGenerator.promptBuilder.characterNumber")}{" "}
                  {index + 1}
                </Label>
                {promptData.characters.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCharacter(character.id)}
                    className="text-red-500 hover:text-red-700 size-6 p-0"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label
                    htmlFor={`char-name-${character.id}`}
                    className="text-xs"
                  >
                    {t("veo3PromptGenerator.promptBuilder.characterName")}
                  </Label>
                  <input
                    id={`char-name-${character.id}`}
                    type="text"
                    placeholder={t(
                      "veo3PromptGenerator.promptBuilder.characterNamePlaceholder"
                    )}
                    value={character.name}
                    onChange={(e) =>
                      updateCharacter(character.id, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-green-600 bg-green-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <Label
                    htmlFor={`char-desc-${character.id}`}
                    className="text-xs"
                  >
                    {t(
                      "veo3PromptGenerator.promptBuilder.characterDescription"
                    )}
                  </Label>
                  <Textarea
                    id={`char-desc-${character.id}`}
                    placeholder={t(
                      "veo3PromptGenerator.promptBuilder.characterDescriptionPlaceholder"
                    )}
                    value={character.description}
                    onChange={(e) =>
                      updateCharacter(
                        character.id,
                        "description",
                        e.target.value
                      )
                    }
                    className="min-h-[60px] text-sm border-green-600 bg-green-950/10 focus:border-green-400 focus:ring-green-400"
                  />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`char-speech-${character.id}`}
                      className="text-xs"
                    >
                      {t("veo3PromptGenerator.promptBuilder.characterSpeech")}
                    </Label>
                    {character.speech && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        🎙️ {t("veo3PromptGenerator.promptBuilder.hasVoice")}
                      </Badge>
                    )}
                  </div>
                  <Textarea
                    id={`char-speech-${character.id}`}
                    placeholder={t(
                      "veo3PromptGenerator.promptBuilder.characterSpeechPlaceholder"
                    )}
                    value={character.speech}
                    onChange={(e) =>
                      updateCharacter(character.id, "speech", e.target.value)
                    }
                    className={`min-h-[50px] text-sm border-green-600 bg-green-950/10 focus:border-green-400 focus:ring-green-400 ${character.speech ? "border-blue-400 bg-blue-950/20" : ""}`}
                  />
                  {character.speech && (
                    <div className="mt-1 text-xs text-blue-300 flex items-center gap-1">
                      <span>🔊</span>
                      <span>
                        {t("veo3PromptGenerator.promptBuilder.voiceHighlight")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Action */}
        <div className="space-y-2 p-4 border-l-4 border-orange-500 bg-orange-950/20 rounded-lg">
          <Label
            htmlFor="action"
            className="flex items-center gap-2 text-orange-300 font-medium"
          >
            🎭 {t("veo3PromptGenerator.promptBuilder.action")}
          </Label>
          <Textarea
            id="action"
            placeholder={t(
              "veo3PromptGenerator.promptBuilder.actionPlaceholder"
            )}
            value={promptData.action}
            onChange={(e) =>
              setPromptData({ ...promptData, action: e.target.value })
            }
            className="border-orange-600 bg-orange-950/10 focus:border-orange-400 focus:ring-orange-400"
          />
        </div>
        {/* Language */}
        <div className="space-y-2 p-4 border-l-4 border-yellow-500 bg-yellow-950/20 rounded-lg">
          <Label
            htmlFor="language"
            className="flex items-center gap-2 text-yellow-300 font-medium"
          >
            🗣️ {t("veo3PromptGenerator.promptBuilder.language")}
          </Label>
          <div className="space-y-2">
            <input
              id="language"
              type="text"
              placeholder={t(
                "veo3PromptGenerator.promptBuilder.languagePlaceholder"
              )}
              value={promptData.language}
              onChange={(e) =>
                setPromptData({ ...promptData, language: e.target.value })
              }
              className="w-full px-3 py-2 border border-yellow-600 bg-yellow-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-2">
              <Label className="text-xs text-yellow-300">
                {t("veo3PromptGenerator.promptBuilder.quickSelect")}
              </Label>
              {presetOptions.languages.map((language: string) => (
                <Badge
                  key={language}
                  variant={
                    promptData.language === language ? "default" : "outline"
                  }
                  className={`cursor-pointer text-xs ${promptData.language === language ? "bg-yellow-600 text-white" : "border-yellow-600 text-yellow-300 hover:bg-yellow-950/30"}`}
                  onClick={() => setPromptData({ ...promptData, language })}
                >
                  {language}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {/* Visual Style */}
        <div className="space-y-2 p-4 border-l-4 border-purple-500 bg-purple-950/20 rounded-lg">
          <Label
            htmlFor="style"
            className="flex items-center gap-2 text-purple-300 font-medium"
          >
            🎨 {t("veo3PromptGenerator.promptBuilder.style")}
          </Label>
          <div className="space-y-2">
            <input
              id="style"
              type="text"
              placeholder={t(
                "veo3PromptGenerator.promptBuilder.stylePlaceholder"
              )}
              value={promptData.style}
              onChange={(e) =>
                setPromptData({ ...promptData, style: e.target.value })
              }
              className="w-full px-3 py-2 border border-purple-600 bg-purple-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-2">
              <Label className="text-xs text-purple-300">
                {t("veo3PromptGenerator.promptBuilder.quickSelect")}
              </Label>
              {presetOptions.styles.map((style: string) => (
                <Badge
                  key={style}
                  variant={promptData.style === style ? "default" : "outline"}
                  className={`cursor-pointer text-xs ${promptData.style === style ? "bg-purple-600 text-white" : "border-purple-600 text-purple-300 hover:bg-purple-950/30"}`}
                  onClick={() => setPromptData({ ...promptData, style })}
                >
                  {style}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {/* Camera Angle */}
        <div className="space-y-2 p-4 border-l-4 border-indigo-500 bg-indigo-950/20 rounded-lg">
          <Label
            htmlFor="camera"
            className="flex items-center gap-2 text-indigo-300 font-medium"
          >
            📹 {t("veo3PromptGenerator.promptBuilder.camera")}
          </Label>
          <div className="space-y-2">
            <input
              id="camera"
              type="text"
              placeholder={t(
                "veo3PromptGenerator.promptBuilder.cameraPlaceholder"
              )}
              value={promptData.camera}
              onChange={(e) =>
                setPromptData({ ...promptData, camera: e.target.value })
              }
              className="w-full px-3 py-2 border border-indigo-600 bg-indigo-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-2">
              <Label className="text-xs text-indigo-300">
                {t("veo3PromptGenerator.promptBuilder.quickSelect")}
              </Label>
              {presetOptions.cameras.map((camera: string) => (
                <Badge
                  key={camera}
                  variant={promptData.camera === camera ? "default" : "outline"}
                  className={`cursor-pointer text-xs ${promptData.camera === camera ? "bg-indigo-600 text-white" : "border-indigo-600 text-indigo-300 hover:bg-indigo-950/30"}`}
                  onClick={() => setPromptData({ ...promptData, camera })}
                >
                  {camera}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {/* Lighting */}
        <div className="space-y-2 p-4 border-l-4 border-pink-500 bg-pink-950/20 rounded-lg">
          <Label
            htmlFor="lighting"
            className="flex items-center gap-2 text-pink-300 font-medium"
          >
            💡 {t("veo3PromptGenerator.promptBuilder.lighting")}
          </Label>
          <div className="space-y-2">
            <input
              id="lighting"
              type="text"
              placeholder={t(
                "veo3PromptGenerator.promptBuilder.lightingPlaceholder"
              )}
              value={promptData.lighting}
              onChange={(e) =>
                setPromptData({ ...promptData, lighting: e.target.value })
              }
              className="w-full px-3 py-2 border border-pink-600 bg-pink-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-2">
              <Label className="text-xs text-pink-300">
                {t("veo3PromptGenerator.promptBuilder.quickSelect")}
              </Label>
              {presetOptions.lighting.map((light: string) => (
                <Badge
                  key={light}
                  variant={
                    promptData.lighting === light ? "default" : "outline"
                  }
                  className={`cursor-pointer text-xs ${promptData.lighting === light ? "bg-pink-600 text-white" : "border-pink-600 text-pink-300 hover:bg-pink-950/30"}`}
                  onClick={() =>
                    setPromptData({ ...promptData, lighting: light })
                  }
                >
                  {light}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {/* Mood */}
        <div className="space-y-2 p-4 border-l-4 border-rose-500 bg-rose-950/20 rounded-lg">
          <Label
            htmlFor="mood"
            className="flex items-center gap-2 text-rose-300 font-medium"
          >
            🌟 {t("veo3PromptGenerator.promptBuilder.mood")}
          </Label>
          <div className="space-y-2">
            <input
              id="mood"
              type="text"
              placeholder={t(
                "veo3PromptGenerator.promptBuilder.moodPlaceholder"
              )}
              value={promptData.mood}
              onChange={(e) =>
                setPromptData({ ...promptData, mood: e.target.value })
              }
              className="w-full px-3 py-2 border border-rose-600 bg-rose-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-2">
              <Label className="text-xs text-rose-300">
                {t("veo3PromptGenerator.promptBuilder.quickSelect")}
              </Label>
              {presetOptions.moods.map((mood: string) => (
                <Badge
                  key={mood}
                  variant={promptData.mood === mood ? "default" : "outline"}
                  className={`cursor-pointer text-xs ${promptData.mood === mood ? "bg-rose-600 text-white" : "border-rose-600 text-rose-300 hover:bg-rose-950/30"}`}
                  onClick={() => setPromptData({ ...promptData, mood })}
                >
                  {mood}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {/* MoodboardUploader */}
        {moodboardEnabled !== undefined &&
          setMoodboardEnabled &&
          setMoodboardImages &&
          (MoodboardUploader ? (
            <MoodboardUploader
              images={moodboardImages}
              setImages={setMoodboardImages}
            />
          ) : (
            <DefaultMoodboardUploader
              enabled={moodboardEnabled}
              onEnabledChange={setMoodboardEnabled}
              onImagesChange={setMoodboardImages}
              maxImages={3}
              value={moodboardImages}
              locale={locale}
            />
          ))}
      </CardContent>
    </Card>
  );
}
