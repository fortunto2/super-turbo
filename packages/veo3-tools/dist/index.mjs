// src/components/Veo3PromptGenerator.tsx
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@turbo-super/ui";
import { BookOpen } from "lucide-react";

// src/components/PromptBuilder.tsx
import {
  Card as Card2,
  CardHeader as CardHeader2,
  CardTitle as CardTitle2,
  CardContent as CardContent2,
  Button,
  Textarea,
  Label as Label2,
  Badge as Badge2
} from "@turbo-super/ui";
import { Trash2 } from "lucide-react";

// src/components/MoodboardUploader.tsx
import { useRef } from "react";
import { Label, Badge, Card, CardContent, CardHeader, CardTitle } from "@turbo-super/ui";
import { jsx, jsxs } from "react/jsx-runtime";
function MoodboardUploader({
  enabled,
  onEnabledChange,
  onImagesChange,
  maxImages = 3,
  value = []
}) {
  const fileInputRef = useRef(null);
  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (!files)
      return;
    const newImages = [];
    for (let i = 0; i < Math.min(files.length, maxImages - value.length); i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          var _a;
          const base64 = (_a = e.target) == null ? void 0 : _a.result;
          const newImage = {
            id: Date.now().toString() + i,
            file,
            base64,
            tags: [],
            description: "",
            weight: 1
          };
          const updatedImages = [...value, newImage];
          onImagesChange(updatedImages);
        };
        reader.readAsDataURL(file);
      }
    }
  };
  const handleDropZoneClick = () => {
    var _a;
    (_a = fileInputRef.current) == null ? void 0 : _a.click();
  };
  const removeImage = (imageId) => {
    const updatedImages = value.filter((img) => img.id !== imageId);
    onImagesChange(updatedImages);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            id: "moodboard-toggle",
            checked: enabled,
            onChange: (e) => onEnabledChange(e.target.checked),
            className: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          }
        ),
        /* @__PURE__ */ jsx(
          Label,
          {
            htmlFor: "moodboard-toggle",
            className: "text-sm font-medium",
            children: "Enable Moodboard References"
          }
        )
      ] }),
      enabled && /* @__PURE__ */ jsxs(
        Badge,
        {
          variant: "outline",
          className: "text-xs",
          children: [
            value.length,
            "/",
            maxImages,
            " images"
          ]
        }
      )
    ] }),
    enabled && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Visual References" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileInputRef,
              type: "file",
              multiple: true,
              accept: "image/*",
              onChange: handleFileSelect,
              className: "hidden"
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors",
              onClick: handleDropZoneClick,
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-gray-500 dark:text-gray-400 mb-2", children: "\u{1F4C1} Click to Upload Images" }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-400 dark:text-gray-500", children: [
                  "Select up to ",
                  maxImages,
                  " images to use as visual references"
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 dark:text-gray-500 mt-1", children: "Supported formats: JPG, PNG, GIF, WebP" })
              ]
            }
          )
        ] })
      ] }),
      value.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-4", children: value.map((image) => /* @__PURE__ */ jsx(
        Card,
        {
          className: "group relative",
          children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => removeImage(image.id),
                className: "absolute top-2 right-2 z-10 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                title: "Remove image",
                children: "\u2715"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
              /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsx("div", { className: "aspect-square relative rounded-lg overflow-hidden bg-muted", children: image.url ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: image.url,
                  alt: "Moodboard reference",
                  className: "w-full h-full object-cover"
                }
              ) : image.base64 ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: image.base64,
                  alt: "Moodboard reference",
                  className: "w-full h-full object-cover"
                }
              ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center text-muted-foreground", children: "Image Preview" }) }) }),
              /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsxs("p", { children: [
                  "Image ID: ",
                  image.id
                ] }),
                image.description && /* @__PURE__ */ jsxs("p", { children: [
                  "Description: ",
                  image.description
                ] }),
                image.tags.length > 0 && /* @__PURE__ */ jsxs("p", { children: [
                  "Tags: ",
                  image.tags.join(", ")
                ] }),
                /* @__PURE__ */ jsxs("p", { children: [
                  "Weight: ",
                  image.weight
                ] })
              ] }) })
            ] })
          ] })
        },
        image.id
      )) }),
      /* @__PURE__ */ jsx(Card, { className: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2", children: "\u{1F3A8} Moodboard Tips" }),
        /* @__PURE__ */ jsxs("ul", { className: "text-sm text-blue-800 dark:text-blue-200 space-y-2", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-blue-600 dark:text-blue-400", children: "\u2022" }),
            /* @__PURE__ */ jsx("span", { children: "Upload reference images to influence your VEO3 generation" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-blue-600 dark:text-blue-400", children: "\u2022" }),
            /* @__PURE__ */ jsx("span", { children: "Add descriptions to highlight specific elements you want emphasized" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-blue-600 dark:text-blue-400", children: "\u2022" }),
            /* @__PURE__ */ jsx("span", { children: "Adjust influence weight to control how much each image affects the result" })
          ] })
        ] })
      ] }) }) })
    ] })
  ] });
}

// src/components/PromptBuilder.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function PromptBuilder({
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
  MoodboardUploader: MoodboardUploader2
}) {
  return /* @__PURE__ */ jsxs2(Card2, { className: "w-full", children: [
    /* @__PURE__ */ jsx2(CardHeader2, { children: /* @__PURE__ */ jsx2(CardTitle2, { children: "VEO3 Prompt Builder" }) }),
    /* @__PURE__ */ jsxs2(CardContent2, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs2("div", { className: "space-y-2 p-4 border-l-4 border-blue-500 bg-blue-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsx2(
          Label2,
          {
            htmlFor: "scene",
            className: "flex items-center gap-2 text-blue-300 font-medium",
            children: "\u{1F3AC} Scene Description"
          }
        ),
        /* @__PURE__ */ jsx2(
          Textarea,
          {
            id: "scene",
            placeholder: "Describe the main scene (e.g., A cozy coffee shop in the morning)",
            value: promptData.scene,
            onChange: (e) => setPromptData({ ...promptData, scene: e.target.value }),
            className: "min-h-[80px] border-blue-600 bg-blue-950/10 focus:border-blue-400 focus:ring-blue-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "space-y-4 p-4 border-l-4 border-green-500 bg-green-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs2(Label2, { className: "flex items-center gap-2 text-green-300 font-medium", children: [
            "\u{1F465} Characters (",
            promptData.characters.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx2(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              onClick: addCharacter,
              className: "text-xs border-green-600 text-green-300 hover:bg-green-950/30",
              children: "+ Add Character"
            }
          )
        ] }),
        promptData.characters.length === 0 && /* @__PURE__ */ jsx2("div", { className: "text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center", children: 'No characters added yet. Click "Add Character" to start.' }),
        promptData.characters.map((character, index) => /* @__PURE__ */ jsxs2(
          "div",
          {
            className: "p-4 border border-green-600 bg-green-950/10 rounded-lg space-y-3",
            children: [
              /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs2(Label2, { className: "text-sm font-medium", children: [
                  "Character ",
                  index + 1
                ] }),
                promptData.characters.length > 1 && /* @__PURE__ */ jsx2(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "sm",
                    onClick: () => removeCharacter(character.id),
                    className: "text-red-500 hover:text-red-700 size-6 p-0",
                    children: /* @__PURE__ */ jsx2(Trash2, { className: "size-3" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-1 gap-3", children: [
                /* @__PURE__ */ jsxs2("div", { children: [
                  /* @__PURE__ */ jsx2(
                    Label2,
                    {
                      htmlFor: `char-name-${character.id}`,
                      className: "text-xs",
                      children: "Name"
                    }
                  ),
                  /* @__PURE__ */ jsx2(
                    "input",
                    {
                      id: `char-name-${character.id}`,
                      type: "text",
                      placeholder: "Character name (e.g., Sarah, Vendor)",
                      value: character.name,
                      onChange: (e) => updateCharacter(character.id, "name", e.target.value),
                      className: "w-full px-3 py-2 border border-green-600 bg-green-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs2("div", { children: [
                  /* @__PURE__ */ jsx2(
                    Label2,
                    {
                      htmlFor: `char-desc-${character.id}`,
                      className: "text-xs",
                      children: "Description"
                    }
                  ),
                  /* @__PURE__ */ jsx2(
                    Textarea,
                    {
                      id: `char-desc-${character.id}`,
                      placeholder: "Describe the character (e.g., A young woman with wavy brown hair)",
                      value: character.description,
                      onChange: (e) => updateCharacter(
                        character.id,
                        "description",
                        e.target.value
                      ),
                      className: "min-h-[60px] text-sm border-green-600 bg-green-950/10 focus:border-green-400 focus:ring-green-400"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs2("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx2(
                      Label2,
                      {
                        htmlFor: `char-speech-${character.id}`,
                        className: "text-xs",
                        children: "Speech/Dialogue"
                      }
                    ),
                    character.speech && /* @__PURE__ */ jsx2(
                      Badge2,
                      {
                        variant: "secondary",
                        className: "text-xs px-2 py-0.5",
                        children: "\u{1F399}\uFE0F Has Voice"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx2(
                    Textarea,
                    {
                      id: `char-speech-${character.id}`,
                      placeholder: "What they say (e.g., Hello there! or \u041F\u0440\u0438\u0432\u0435\u0442!)",
                      value: character.speech,
                      onChange: (e) => updateCharacter(character.id, "speech", e.target.value),
                      className: `min-h-[50px] text-sm border-green-600 bg-green-950/10 focus:border-green-400 focus:ring-green-400 ${character.speech ? "border-blue-400 bg-blue-950/20" : ""}`
                    }
                  ),
                  character.speech && /* @__PURE__ */ jsxs2("div", { className: "mt-1 text-xs text-blue-300 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx2("span", { children: "\u{1F50A}" }),
                    /* @__PURE__ */ jsx2("span", { children: "This dialogue will be highlighted in the enhanced prompt" })
                  ] })
                ] })
              ] })
            ]
          },
          character.id
        ))
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "space-y-2 p-4 border-l-4 border-orange-500 bg-orange-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsx2(
          Label2,
          {
            htmlFor: "action",
            className: "flex items-center gap-2 text-orange-300 font-medium",
            children: "\u{1F3AD} Action/Activity"
          }
        ),
        /* @__PURE__ */ jsx2(
          Textarea,
          {
            id: "action",
            placeholder: "What are they doing? (e.g., slowly sipping coffee while turning pages)",
            value: promptData.action,
            onChange: (e) => setPromptData({ ...promptData, action: e.target.value }),
            className: "border-orange-600 bg-orange-950/10 focus:border-orange-400 focus:ring-orange-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "space-y-2 p-4 border-l-4 border-yellow-500 bg-yellow-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsx2(
          Label2,
          {
            htmlFor: "language",
            className: "flex items-center gap-2 text-yellow-300 font-medium",
            children: "\u{1F5E3}\uFE0F Speech Language"
          }
        ),
        /* @__PURE__ */ jsxs2("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx2(
            "input",
            {
              id: "language",
              type: "text",
              placeholder: "Enter language (e.g., English, Russian, Spanish...)",
              value: promptData.language,
              onChange: (e) => setPromptData({ ...promptData, language: e.target.value }),
              className: "w-full px-3 py-2 border border-yellow-600 bg-yellow-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            }
          ),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx2(Label2, { className: "text-xs text-yellow-300", children: "Quick select:" }),
            presetOptions.languages.map((language) => /* @__PURE__ */ jsx2(
              Badge2,
              {
                variant: promptData.language === language ? "default" : "outline",
                className: `cursor-pointer text-xs ${promptData.language === language ? "bg-yellow-600 text-white" : "border-yellow-600 text-yellow-300 hover:bg-yellow-950/30"}`,
                onClick: () => setPromptData({ ...promptData, language }),
                children: language
              },
              language
            ))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "space-y-2 p-4 border-l-4 border-purple-500 bg-purple-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsx2(
          Label2,
          {
            htmlFor: "style",
            className: "flex items-center gap-2 text-purple-300 font-medium",
            children: "\u{1F3A8} Visual Style"
          }
        ),
        /* @__PURE__ */ jsxs2("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx2(
            "input",
            {
              id: "style",
              type: "text",
              placeholder: "Enter visual style (e.g., Cinematic, Documentary, Anime...)",
              value: promptData.style,
              onChange: (e) => setPromptData({ ...promptData, style: e.target.value }),
              className: "w-full px-3 py-2 border border-purple-600 bg-purple-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            }
          ),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx2(Label2, { className: "text-xs text-purple-300", children: "Quick select:" }),
            presetOptions.styles.map((style) => /* @__PURE__ */ jsx2(
              Badge2,
              {
                variant: promptData.style === style ? "default" : "outline",
                className: `cursor-pointer text-xs ${promptData.style === style ? "bg-purple-600 text-white" : "border-purple-600 text-purple-300 hover:bg-purple-950/30"}`,
                onClick: () => setPromptData({ ...promptData, style }),
                children: style
              },
              style
            ))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "space-y-2 p-4 border-l-4 border-indigo-500 bg-indigo-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsx2(
          Label2,
          {
            htmlFor: "camera",
            className: "flex items-center gap-2 text-indigo-300 font-medium",
            children: "\u{1F4F9} Camera Angle"
          }
        ),
        /* @__PURE__ */ jsxs2("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx2(
            "input",
            {
              id: "camera",
              type: "text",
              placeholder: "Enter camera angle (e.g., Close-up, Wide shot, Drone view...)",
              value: promptData.camera,
              onChange: (e) => setPromptData({ ...promptData, camera: e.target.value }),
              className: "w-full px-3 py-2 border border-indigo-600 bg-indigo-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            }
          ),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx2(Label2, { className: "text-xs text-indigo-300", children: "Quick select:" }),
            presetOptions.cameras.map((camera) => /* @__PURE__ */ jsx2(
              Badge2,
              {
                variant: promptData.camera === camera ? "default" : "outline",
                className: `cursor-pointer text-xs ${promptData.camera === camera ? "bg-indigo-600 text-white" : "border-indigo-600 text-indigo-300 hover:bg-indigo-950/30"}`,
                onClick: () => setPromptData({ ...promptData, camera }),
                children: camera
              },
              camera
            ))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "space-y-2 p-4 border-l-4 border-pink-500 bg-pink-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsx2(
          Label2,
          {
            htmlFor: "lighting",
            className: "flex items-center gap-2 text-pink-300 font-medium",
            children: "\u{1F4A1} Lighting"
          }
        ),
        /* @__PURE__ */ jsxs2("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx2(
            "input",
            {
              id: "lighting",
              type: "text",
              placeholder: "Enter lighting type (e.g., Natural, Golden hour, Dramatic...)",
              value: promptData.lighting,
              onChange: (e) => setPromptData({ ...promptData, lighting: e.target.value }),
              className: "w-full px-3 py-2 border border-pink-600 bg-pink-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            }
          ),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx2(Label2, { className: "text-xs text-pink-300", children: "Quick select:" }),
            presetOptions.lighting.map((light) => /* @__PURE__ */ jsx2(
              Badge2,
              {
                variant: promptData.lighting === light ? "default" : "outline",
                className: `cursor-pointer text-xs ${promptData.lighting === light ? "bg-pink-600 text-white" : "border-pink-600 text-pink-300 hover:bg-pink-950/30"}`,
                onClick: () => setPromptData({ ...promptData, lighting: light }),
                children: light
              },
              light
            ))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "space-y-2 p-4 border-l-4 border-rose-500 bg-rose-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsx2(
          Label2,
          {
            htmlFor: "mood",
            className: "flex items-center gap-2 text-rose-300 font-medium",
            children: "\u{1F31F} Mood"
          }
        ),
        /* @__PURE__ */ jsxs2("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx2(
            "input",
            {
              id: "mood",
              type: "text",
              placeholder: "Enter mood (e.g., Peaceful, Energetic, Mysterious...)",
              value: promptData.mood,
              onChange: (e) => setPromptData({ ...promptData, mood: e.target.value }),
              className: "w-full px-3 py-2 border border-rose-600 bg-rose-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            }
          ),
          /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx2(Label2, { className: "text-xs text-rose-300", children: "Quick select:" }),
            presetOptions.moods.map((mood) => /* @__PURE__ */ jsx2(
              Badge2,
              {
                variant: promptData.mood === mood ? "default" : "outline",
                className: `cursor-pointer text-xs ${promptData.mood === mood ? "bg-rose-600 text-white" : "border-rose-600 text-rose-300 hover:bg-rose-950/30"}`,
                onClick: () => setPromptData({ ...promptData, mood }),
                children: mood
              },
              mood
            ))
          ] })
        ] })
      ] }),
      moodboardEnabled !== void 0 && setMoodboardEnabled && setMoodboardImages && /* @__PURE__ */ jsx2(
        MoodboardUploader,
        {
          enabled: moodboardEnabled,
          onEnabledChange: setMoodboardEnabled,
          onImagesChange: setMoodboardImages,
          maxImages: 3,
          value: moodboardImages
        }
      )
    ] })
  ] });
}

// src/components/PromptPreview.tsx
import {
  Card as Card3,
  CardHeader as CardHeader3,
  CardTitle as CardTitle3,
  CardContent as CardContent3,
  Button as Button2,
  Textarea as Textarea2,
  Badge as Badge3
} from "@turbo-super/ui";
import { Copy, Shuffle, Sparkles, Trash2 as Trash22 } from "lucide-react";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function PromptPreview({
  generatedPrompt,
  setGeneratedPrompt,
  randomizePrompt,
  clearAll,
  copyToClipboard: copyToClipboard2,
  copied,
  setActiveTab,
  isEnhancing,
  enhancePrompt
}) {
  return /* @__PURE__ */ jsxs3(Card3, { className: "w-full", children: [
    /* @__PURE__ */ jsx3(CardHeader3, { children: /* @__PURE__ */ jsxs3(CardTitle3, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx3(Copy, { className: "w-5 h-5" }),
      "Generated Prompt",
      /* @__PURE__ */ jsx3(
        Badge3,
        {
          variant: "secondary",
          className: "ml-auto text-xs",
          children: "Preview"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx3(CardContent3, { children: /* @__PURE__ */ jsxs3("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs3("div", { className: "relative", children: [
        /* @__PURE__ */ jsx3(
          Textarea2,
          {
            value: generatedPrompt,
            onChange: (e) => setGeneratedPrompt(e.target.value),
            placeholder: "Your generated prompt will appear here, or type your own prompt...",
            className: "min-h-[400px] font-mono text-sm resize-none pr-20 bg-background border-border text-foreground"
          }
        ),
        /* @__PURE__ */ jsxs3("div", { className: "absolute top-2 right-2 flex gap-1", children: [
          /* @__PURE__ */ jsx3(
            Button2,
            {
              size: "sm",
              variant: "ghost",
              onClick: () => setGeneratedPrompt(""),
              disabled: !generatedPrompt,
              className: "size-8 p-0 hover:bg-background/80",
              title: "Clear text",
              children: /* @__PURE__ */ jsx3(Trash22, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsx3(
            Button2,
            {
              size: "sm",
              variant: "ghost",
              onClick: () => copyToClipboard2(generatedPrompt),
              disabled: !generatedPrompt,
              className: "size-8 p-0 hover:bg-background/80",
              title: copied ? "Copied!" : "Copy to clipboard",
              children: /* @__PURE__ */ jsx3(Copy, { className: "size-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs3(
            Button2,
            {
              onClick: randomizePrompt,
              variant: "outline",
              className: "flex-1",
              children: [
                /* @__PURE__ */ jsx3(Shuffle, { className: "size-4 mr-2" }),
                "Randomize All"
              ]
            }
          ),
          /* @__PURE__ */ jsxs3(
            Button2,
            {
              onClick: clearAll,
              variant: "outline",
              className: "flex-1",
              children: [
                /* @__PURE__ */ jsx3(Trash22, { className: "size-4 mr-2" }),
                "Clear All"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs3(
          Button2,
          {
            onClick: () => {
              setActiveTab("enhance");
              setTimeout(() => {
                if (generatedPrompt && !isEnhancing) {
                  enhancePrompt();
                }
              }, 100);
            },
            disabled: !generatedPrompt,
            size: "lg",
            className: "w-full h-16 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-200",
            children: [
              /* @__PURE__ */ jsx3(Sparkles, { className: "size-6 mr-3" }),
              "Continue to AI Enhancement \u2192"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}

// src/components/AIEnhancement.tsx
import {
  Card as Card4,
  CardHeader as CardHeader4,
  CardTitle as CardTitle4,
  CardContent as CardContent4,
  Button as Button3,
  Textarea as Textarea3,
  Badge as Badge4
} from "@turbo-super/ui";
import {
  Sparkles as Sparkles2,
  Loader2,
  Settings,
  ChevronDown,
  ChevronUp,
  Copy as Copy2
} from "lucide-react";
import { Fragment, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function AIEnhancement({
  enhancedPrompt,
  setEnhancedPrompt,
  enhanceWithSelectedFocus,
  isEnhancing,
  enhanceError,
  enhancementInfo,
  selectedFocusTypes,
  toggleFocusType,
  includeAudio,
  setIncludeAudio,
  customCharacterLimit,
  setCustomCharacterLimit,
  showSettings,
  setShowSettings,
  copied,
  copyToClipboard: copyToClipboard2
}) {
  return /* @__PURE__ */ jsxs4(Card4, { className: "w-full", children: [
    /* @__PURE__ */ jsx4(CardHeader4, { children: /* @__PURE__ */ jsxs4(CardTitle4, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx4(Sparkles2, { className: "w-5 h-5 text-purple-600" }),
      "AI Enhanced Prompt"
    ] }) }),
    /* @__PURE__ */ jsx4(CardContent4, { children: /* @__PURE__ */ jsxs4("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx4(
        Button3,
        {
          onClick: enhanceWithSelectedFocus,
          disabled: isEnhancing,
          size: "lg",
          className: "w-full h-16 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-200",
          children: isEnhancing ? /* @__PURE__ */ jsxs4(Fragment, { children: [
            /* @__PURE__ */ jsx4(Loader2, { className: "w-6 h-6 mr-3 animate-spin" }),
            "Enhancing with AI..."
          ] }) : /* @__PURE__ */ jsxs4(Fragment, { children: [
            /* @__PURE__ */ jsx4(Sparkles2, { className: "w-6 h-6 mr-3" }),
            enhancedPrompt.trim() ? "Re-enhance with AI" : "Enhance with AI",
            selectedFocusTypes.length > 0 && /* @__PURE__ */ jsxs4("span", { className: "ml-2 text-sm opacity-90", children: [
              "(",
              selectedFocusTypes.length,
              " focus",
              selectedFocusTypes.length !== 1 ? "es" : "",
              ")"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs4("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2", children: [
        /* @__PURE__ */ jsx4(
          Button3,
          {
            variant: selectedFocusTypes.includes("character") ? "default" : "outline",
            size: "sm",
            onClick: () => toggleFocusType("character"),
            className: "text-xs",
            children: "\u{1F464} Focus Character"
          }
        ),
        /* @__PURE__ */ jsx4(
          Button3,
          {
            variant: selectedFocusTypes.includes("action") ? "default" : "outline",
            size: "sm",
            onClick: () => toggleFocusType("action"),
            className: "text-xs",
            children: "\u{1F3AC} Focus Action"
          }
        ),
        /* @__PURE__ */ jsx4(
          Button3,
          {
            variant: selectedFocusTypes.includes("cinematic") ? "default" : "outline",
            size: "sm",
            onClick: () => toggleFocusType("cinematic"),
            className: "text-xs",
            children: "\u{1F3A5} More Cinematic"
          }
        ),
        /* @__PURE__ */ jsx4(
          Button3,
          {
            variant: includeAudio ? "default" : "outline",
            size: "sm",
            onClick: () => setIncludeAudio(!includeAudio),
            className: `text-xs ${includeAudio ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "bg-blue-50 border-blue-200 hover:bg-blue-100"}`,
            children: "\u{1F50A} Audio & Voice"
          }
        ),
        /* @__PURE__ */ jsx4(
          Button3,
          {
            variant: selectedFocusTypes.includes("safe") ? "default" : "outline",
            size: "sm",
            onClick: () => toggleFocusType("safe"),
            className: `text-xs ${selectedFocusTypes.includes("safe") ? "bg-green-600 text-white border-green-600 hover:bg-green-700" : "bg-green-50 border-green-200 hover:bg-green-100"}`,
            children: "\u{1F6E1}\uFE0F Safe Content"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: "border rounded-lg", children: [
        /* @__PURE__ */ jsxs4(
          Button3,
          {
            variant: "ghost",
            onClick: () => setShowSettings(!showSettings),
            className: "w-full justify-between p-3 h-auto",
            children: [
              /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx4(Settings, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx4("span", { className: "text-sm", children: "Enhancement Settings" }),
                /* @__PURE__ */ jsxs4(
                  Badge4,
                  {
                    variant: "outline",
                    className: "text-xs",
                    children: [
                      customCharacterLimit,
                      " chars \u2022 GPT-4.1"
                    ]
                  }
                )
              ] }),
              showSettings ? /* @__PURE__ */ jsx4(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx4(ChevronDown, { className: "w-4 h-4" })
            ]
          }
        ),
        showSettings && /* @__PURE__ */ jsxs4("div", { className: "px-3 pb-3 space-y-3 border-t", children: [
          /* @__PURE__ */ jsxs4("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx4("span", { className: "text-xs text-muted-foreground", children: "Character Limit" }),
              /* @__PURE__ */ jsxs4(
                Badge4,
                {
                  variant: "outline",
                  className: "text-xs",
                  children: [
                    customCharacterLimit,
                    " chars"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs4("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx4(
                "input",
                {
                  type: "range",
                  min: "200",
                  max: "10000",
                  step: "100",
                  value: customCharacterLimit,
                  onChange: (e) => setCustomCharacterLimit(Number(e.target.value)),
                  className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                }
              ),
              /* @__PURE__ */ jsxs4("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsx4("span", { children: "200" }),
                /* @__PURE__ */ jsx4("span", { children: "2K" }),
                /* @__PURE__ */ jsx4("span", { children: "5K" }),
                /* @__PURE__ */ jsx4("span", { children: "10K" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs4("div", { className: "text-xs text-muted-foreground", children: [
              customCharacterLimit < 600 && "Concise and focused",
              customCharacterLimit >= 600 && customCharacterLimit < 1500 && "Balanced detail",
              customCharacterLimit >= 1500 && customCharacterLimit < 3e3 && "Rich and detailed",
              customCharacterLimit >= 3e3 && "Extremely detailed"
            ] })
          ] }),
          /* @__PURE__ */ jsxs4("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx4("span", { className: "text-xs text-muted-foreground", children: "AI Model" }),
            /* @__PURE__ */ jsxs4("div", { className: "p-2 bg-muted rounded text-xs", children: [
              /* @__PURE__ */ jsx4("div", { className: "font-medium", children: "GPT-4.1" }),
              /* @__PURE__ */ jsx4("div", { className: "text-muted-foreground", children: "Best quality enhancement model" })
            ] })
          ] })
        ] })
      ] }),
      enhanceError && /* @__PURE__ */ jsx4("div", { className: "p-3 bg-red-50 border border-red-200 rounded-lg", children: /* @__PURE__ */ jsx4("p", { className: "text-sm text-red-600", children: enhanceError }) }),
      /* @__PURE__ */ jsxs4("div", { className: "relative", children: [
        /* @__PURE__ */ jsx4(
          Textarea3,
          {
            value: enhancedPrompt,
            onChange: (e) => setEnhancedPrompt(e.target.value),
            placeholder: "Click 'Enhance with AI' to generate a professional, detailed prompt...",
            className: "min-h-[500px] font-mono text-sm resize-none whitespace-pre-wrap pr-12 bg-background border-border text-foreground"
          }
        ),
        /* @__PURE__ */ jsx4(
          Button3,
          {
            size: "sm",
            variant: "ghost",
            onClick: () => copyToClipboard2(enhancedPrompt),
            disabled: !enhancedPrompt,
            className: "absolute top-2 right-2 h-8 w-8 p-0 hover:bg-background/80",
            title: copied ? "Copied!" : "Copy enhanced prompt",
            children: /* @__PURE__ */ jsx4(Copy2, { className: "w-4 h-4" })
          }
        )
      ] }),
      enhancementInfo && /* @__PURE__ */ jsx4("div", { className: "p-3 bg-muted/50 rounded-lg", children: /* @__PURE__ */ jsxs4("div", { className: "flex justify-between items-center text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs4("span", { children: [
            "Model:",
            " ",
            /* @__PURE__ */ jsx4("span", { className: "font-medium text-foreground", children: enhancementInfo.modelName || enhancementInfo.model })
          ] }),
          /* @__PURE__ */ jsxs4("span", { children: [
            "Length:",
            " ",
            /* @__PURE__ */ jsx4("span", { className: "font-medium text-foreground", children: enhancementInfo.length })
          ] })
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs4("span", { children: [
            "Characters:",
            " ",
            /* @__PURE__ */ jsxs4("span", { className: "font-medium text-foreground", children: [
              enhancementInfo.actualCharacters,
              " /",
              " ",
              enhancementInfo.targetCharacters
            ] })
          ] }),
          /* @__PURE__ */ jsx4(
            Badge4,
            {
              variant: enhancementInfo.actualCharacters <= enhancementInfo.targetCharacters ? "default" : "secondary",
              className: "text-xs",
              children: enhancementInfo.actualCharacters <= enhancementInfo.targetCharacters ? "\u2713 Within limit" : "\u26A0 Over limit"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsx4(
        Button3,
        {
          onClick: enhanceWithSelectedFocus,
          disabled: isEnhancing,
          size: "lg",
          className: "w-full h-16 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-200",
          children: isEnhancing ? /* @__PURE__ */ jsxs4(Fragment, { children: [
            /* @__PURE__ */ jsx4(Loader2, { className: "w-6 h-6 mr-3 animate-spin" }),
            "Enhancing with AI..."
          ] }) : /* @__PURE__ */ jsxs4(Fragment, { children: [
            /* @__PURE__ */ jsx4(Sparkles2, { className: "w-6 h-6 mr-3" }),
            enhancedPrompt.trim() ? "Re-enhance with AI" : "Enhance with AI",
            selectedFocusTypes.length > 0 && /* @__PURE__ */ jsxs4("span", { className: "ml-2 text-sm opacity-90", children: [
              "(",
              selectedFocusTypes.length,
              " focus",
              selectedFocusTypes.length !== 1 ? "es" : "",
              ")"
            ] })
          ] })
        }
      )
    ] }) })
  ] });
}

// src/components/PromptHistory.tsx
import {
  Card as Card5,
  CardHeader as CardHeader5,
  CardTitle as CardTitle5,
  CardContent as CardContent5,
  Button as Button4,
  Badge as Badge5
} from "@turbo-super/ui";
import { Copy as Copy3, Trash2 as Trash23 } from "lucide-react";
import { Fragment as Fragment2, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function PromptHistory({
  promptHistory,
  loadFromHistory,
  clearHistory,
  setActiveTab
}) {
  return /* @__PURE__ */ jsx5(Card5, { className: "w-full", children: promptHistory.length > 0 ? /* @__PURE__ */ jsxs5(Fragment2, { children: [
    /* @__PURE__ */ jsx5(CardHeader5, { children: /* @__PURE__ */ jsxs5("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs5(CardTitle5, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx5(Copy3, { className: "w-5 h-5" }),
        "Recent Prompts History",
        /* @__PURE__ */ jsxs5(
          Badge5,
          {
            variant: "outline",
            className: "ml-2",
            children: [
              promptHistory.length,
              "/10"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx5(
        Button4,
        {
          onClick: clearHistory,
          variant: "ghost",
          size: "sm",
          className: "text-muted-foreground hover:text-destructive",
          children: /* @__PURE__ */ jsx5(Trash23, { className: "w-4 h-4" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx5(CardContent5, { children: /* @__PURE__ */ jsx5("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: promptHistory.slice(0, 10).map((historyItem) => /* @__PURE__ */ jsxs5(
      "div",
      {
        className: "p-4 border rounded-lg hover:bg-muted/50 transition-colors",
        children: [
          /* @__PURE__ */ jsxs5("div", { className: "flex justify-between items-start mb-3", children: [
            /* @__PURE__ */ jsx5("p", { className: "text-xs text-muted-foreground", children: historyItem.timestamp && typeof historyItem.timestamp === "object" && "toLocaleString" in historyItem.timestamp ? historyItem.timestamp.toLocaleString() : String(historyItem.timestamp) }),
            /* @__PURE__ */ jsxs5("div", { className: "flex gap-1", children: [
              historyItem.model && /* @__PURE__ */ jsx5(
                Badge5,
                {
                  variant: "outline",
                  className: "text-xs",
                  children: historyItem.model
                }
              ),
              /* @__PURE__ */ jsx5(
                Badge5,
                {
                  variant: "secondary",
                  className: "text-xs",
                  children: historyItem.length
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx5("p", { className: "text-sm mb-3 line-clamp-3", children: historyItem.basicPrompt && historyItem.basicPrompt.length > 120 ? historyItem.basicPrompt.substring(0, 120) + "..." : historyItem.basicPrompt }),
          /* @__PURE__ */ jsx5(
            Button4,
            {
              onClick: () => loadFromHistory(historyItem),
              variant: "outline",
              size: "sm",
              className: "w-full",
              children: "Load This Version"
            }
          )
        ]
      },
      historyItem.id
    )) }) })
  ] }) : /* @__PURE__ */ jsxs5(CardContent5, { className: "flex flex-col items-center justify-center py-12", children: [
    /* @__PURE__ */ jsx5(Copy3, { className: "w-12 h-12 text-muted-foreground mb-4" }),
    /* @__PURE__ */ jsx5("h3", { className: "text-lg font-semibold mb-2", children: "No History Yet" }),
    /* @__PURE__ */ jsx5("p", { className: "text-muted-foreground text-center mb-4", children: "Generate and enhance prompts to see them here" }),
    /* @__PURE__ */ jsx5(
      Button4,
      {
        variant: "outline",
        onClick: () => setActiveTab("builder"),
        children: "Start Building"
      }
    )
  ] }) });
}

// src/utils/index.ts
var generatePrompt = (data) => {
  const parts = [];
  if (data.scene)
    parts.push(data.scene);
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
  if (data.action)
    parts.push(`${data.action}`);
  if (data.camera)
    parts.push(`Shot with ${data.camera.toLowerCase()}`);
  if (data.style)
    parts.push(`${data.style.toLowerCase()} style`);
  if (data.lighting)
    parts.push(`${data.lighting.toLowerCase()} lighting`);
  if (data.mood)
    parts.push(`${data.mood.toLowerCase()} mood`);
  return parts.length > 0 ? parts.join(", ") + "." : "Your generated prompt will appear here, or type your own prompt...";
};
var createRandomPromptData = () => {
  const styles = [
    "Cinematic",
    "Documentary",
    "Anime",
    "Realistic",
    "Artistic",
    "Vintage",
    "Modern"
  ];
  const cameras = [
    "Close-up",
    "Wide shot",
    "Over-the-shoulder",
    "Drone view",
    "Handheld",
    "Static"
  ];
  const lighting = [
    "Natural",
    "Golden hour",
    "Blue hour",
    "Dramatic",
    "Soft",
    "Neon",
    "Candlelight"
  ];
  const moods = [
    "Peaceful",
    "Energetic",
    "Mysterious",
    "Romantic",
    "Tense",
    "Joyful",
    "Melancholic"
  ];
  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Russian",
    "Japanese",
    "Chinese"
  ];
  return {
    scene: "A serene lakeside at sunset",
    characters: [
      {
        id: "1",
        name: "Person",
        description: "A person in casual clothes",
        speech: Math.random() > 0.5 ? "Perfect evening for this!" : ""
      }
    ],
    action: "skipping stones across the water",
    language: languages[Math.floor(Math.random() * languages.length)],
    style: styles[Math.floor(Math.random() * styles.length)],
    camera: cameras[Math.floor(Math.random() * cameras.length)],
    lighting: lighting[Math.floor(Math.random() * lighting.length)],
    mood: moods[Math.floor(Math.random() * moods.length)]
  };
};
var createEmptyPromptData = () => ({
  scene: "",
  style: "",
  camera: "",
  characters: [],
  action: "",
  lighting: "",
  mood: "",
  language: "English"
});
var createCharacter = (id) => ({
  id: id || Date.now().toString(),
  name: "",
  description: "",
  speech: ""
});
var copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};
var getLocaleLanguage = () => {
  if (typeof window === "undefined")
    return "English";
  const locale = window.location.pathname.split("/")[1];
  const localeToLanguage = {
    en: "English",
    ru: "Russian",
    es: "Spanish",
    hi: "Hindi",
    tr: "Turkish"
  };
  return localeToLanguage[locale] || "English";
};

// src/constants/index.ts
var PRESET_OPTIONS = {
  styles: ["Cinematic", "Documentary", "Anime", "Realistic", "Artistic", "Vintage", "Modern"],
  cameras: ["Close-up", "Wide shot", "Over-the-shoulder", "Drone view", "Handheld", "Static"],
  lighting: ["Natural", "Golden hour", "Blue hour", "Dramatic", "Soft", "Neon", "Candlelight"],
  moods: ["Peaceful", "Energetic", "Mysterious", "Romantic", "Tense", "Joyful", "Melancholic"],
  languages: ["English", "Spanish", "French", "German", "Italian", "Russian", "Japanese", "Chinese"]
};
var STORAGE_KEYS = {
  PROMPT_HISTORY: "veo3-prompt-history",
  CUSTOM_CHARACTER_LIMIT: "veo3-custom-character-limit",
  INCLUDE_AUDIO: "veo3-include-audio",
  MOODBOARD_ENABLED: "veo3-moodboard-enabled"
};
var DEFAULT_VALUES = {
  CHARACTER_LIMIT: 4e3,
  LANGUAGE: "English",
  INCLUDE_AUDIO: true,
  MOODBOARD_ENABLED: true,
  HISTORY_LIMIT: 10
};

// src/components/Veo3PromptGenerator.tsx
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function Veo3PromptGenerator({
  enhancePromptFunction,
  MoodboardUploader: MoodboardUploader2,
  showInfoBanner = true,
  className = ""
}) {
  const [promptData, setPromptData] = useState({
    scene: "",
    style: "",
    camera: "",
    characters: [{ id: "default", name: "", description: "", speech: "" }],
    action: "",
    lighting: "",
    mood: "",
    language: "English"
  });
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState("");
  const [customCharacterLimit, setCustomCharacterLimit] = useState(
    DEFAULT_VALUES.CHARACTER_LIMIT
  );
  const [selectedModel] = useState("gpt-4.1");
  const [promptHistory, setPromptHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enhancementInfo, setEnhancementInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("builder");
  const [selectedFocusTypes, setSelectedFocusTypes] = useState(["safe"]);
  const [includeAudio, setIncludeAudio] = useState(
    DEFAULT_VALUES.INCLUDE_AUDIO
  );
  const [moodboardEnabled, setMoodboardEnabled] = useState(
    DEFAULT_VALUES.MOODBOARD_ENABLED
  );
  const [moodboardImages, setMoodboardImages] = useState([]);
  useEffect(() => {
    const savedHistory = localStorage.getItem("veo3-prompt-history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const historyWithDates = parsed.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setPromptHistory(historyWithDates);
      } catch (error) {
        console.error("Failed to load prompt history:", error);
      }
    }
  }, []);
  useEffect(() => {
    if (promptHistory.length > 0) {
      localStorage.setItem(
        "veo3-prompt-history",
        JSON.stringify(promptHistory)
      );
    }
  }, [promptHistory]);
  useEffect(() => {
    const hasValidCharacter = promptData.characters.some(
      (char) => char.name || char.description
    );
    if (promptData.scene || hasValidCharacter) {
      const prompt = generatePrompt(promptData);
      setGeneratedPrompt(prompt);
    }
  }, [promptData]);
  useEffect(() => {
    const defaultLanguage = getLocaleLanguage();
    setPromptData((prev) => ({ ...prev, language: defaultLanguage }));
  }, []);
  const addCharacter = () => {
    setPromptData((prev) => ({
      ...prev,
      characters: [
        ...prev.characters,
        { id: Date.now().toString(), name: "", description: "", speech: "" }
      ]
    }));
  };
  const updateCharacter = (id, field, value) => {
    setPromptData((prev) => ({
      ...prev,
      characters: prev.characters.map(
        (char) => char.id === id ? { ...char, [field]: value } : char
      )
    }));
  };
  const removeCharacter = (id) => {
    setPromptData((prev) => ({
      ...prev,
      characters: prev.characters.filter((char) => char.id !== id)
    }));
  };
  const clearAll = () => {
    const emptyData = {
      scene: "",
      style: "",
      camera: "",
      characters: [],
      action: "",
      lighting: "",
      mood: "",
      language: "English"
    };
    setPromptData(emptyData);
    setGeneratedPrompt("");
    setEnhancedPrompt("");
    setEnhanceError("");
  };
  const saveToHistory = (basicPrompt, enhancedPrompt2, length, model, promptData2) => {
    const newHistoryItem = {
      id: Date.now().toString(),
      timestamp: /* @__PURE__ */ new Date(),
      basicPrompt,
      enhancedPrompt: enhancedPrompt2,
      length,
      model,
      promptData: promptData2
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
  const copyToClipboard2 = async (text) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    }
  };
  const loadFromHistory = (historyItem) => {
    setPromptData(historyItem.promptData);
    setGeneratedPrompt(historyItem.basicPrompt);
    setEnhancedPrompt(historyItem.enhancedPrompt);
    if (historyItem.length) {
      const match = historyItem.length.match(/(\d+)/);
      if (match) {
        const charLimit = parseInt(match[1]);
        if (charLimit >= 200 && charLimit <= 1e4) {
          setCustomCharacterLimit(charLimit);
        }
      }
    }
  };
  const toggleFocusType = (focusType) => {
    setSelectedFocusTypes((prev) => {
      if (prev.includes(focusType)) {
        return prev.filter((type) => type !== focusType);
      } else {
        return [...prev, focusType];
      }
    });
  };
  const enhancePrompt = async (focusType) => {
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
        focusType,
        includeAudio,
        promptData,
        ...moodboardEnabled && moodboardImages.length > 0 ? {
          moodboard: {
            enabled: true,
            images: moodboardImages.map((img) => ({
              id: img.id,
              url: img.url,
              base64: img.base64,
              tags: img.tags,
              description: img.description,
              weight: img.weight
            }))
          }
        } : {}
      });
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
        setEnhancementInfo({
          model: data.model || selectedModel,
          modelName: data.model || selectedModel,
          length: `${data.characterLimit || customCharacterLimit} chars`,
          actualCharacters: data.characterCount || data.enhancedPrompt.length,
          targetCharacters: data.targetCharacters || customCharacterLimit
        });
        const basicPromptForHistory = activeTab === "enhance" && enhancedPrompt.trim() ? promptToEnhance : generatedPrompt;
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
  return /* @__PURE__ */ jsxs6("div", { className: `w-full max-w-6xl mx-auto ${className}`, children: [
    showInfoBanner && /* @__PURE__ */ jsx6("div", { className: "mb-6 p-4 bg-gradient-to-r from-green-50/10 to-blue-50/10 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200/20 dark:border-green-600/20 rounded-lg", children: /* @__PURE__ */ jsxs6("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx6("div", { className: "flex-shrink-0 w-8 h-8 bg-green-100/20 dark:bg-green-900/30 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx6(BookOpen, { className: "w-4 h-4 text-green-600 dark:text-green-400" }) }),
      /* @__PURE__ */ jsxs6("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx6("h3", { className: "font-semibold text-green-900 dark:text-green-100 mb-1", children: "Master VEO3 Video Generation" }),
        /* @__PURE__ */ jsx6("p", { className: "text-sm text-green-700 dark:text-green-300 mb-2", children: "Learn professional prompting techniques and best practices for Google's most advanced AI video model." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs6(
      Tabs,
      {
        value: activeTab,
        onValueChange: setActiveTab,
        className: "space-y-6",
        children: [
          /* @__PURE__ */ jsxs6(TabsList, { className: "grid w-full grid-cols-3", children: [
            /* @__PURE__ */ jsx6(TabsTrigger, { value: "builder", children: "Prompt Builder" }),
            /* @__PURE__ */ jsx6(TabsTrigger, { value: "enhance", children: "AI Enhancement" }),
            /* @__PURE__ */ jsxs6(TabsTrigger, { value: "history", children: [
              "History (",
              promptHistory.length,
              "/10)"
            ] })
          ] }),
          /* @__PURE__ */ jsx6(TabsContent, { value: "builder", children: /* @__PURE__ */ jsxs6("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsx6(
              PromptBuilder,
              {
                promptData,
                setPromptData,
                addCharacter,
                updateCharacter,
                removeCharacter,
                presetOptions: PRESET_OPTIONS,
                moodboardEnabled,
                setMoodboardEnabled,
                moodboardImages,
                setMoodboardImages,
                MoodboardUploader: MoodboardUploader2
              }
            ),
            /* @__PURE__ */ jsx6(
              PromptPreview,
              {
                generatedPrompt,
                setGeneratedPrompt,
                randomizePrompt,
                clearAll,
                copyToClipboard: copyToClipboard2,
                copied,
                setActiveTab,
                isEnhancing,
                enhancePrompt
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx6(TabsContent, { value: "enhance", children: /* @__PURE__ */ jsx6(
            AIEnhancement,
            {
              enhancedPrompt,
              setEnhancedPrompt,
              enhanceWithSelectedFocus,
              isEnhancing,
              enhanceError,
              enhancementInfo,
              selectedFocusTypes,
              toggleFocusType,
              includeAudio,
              setIncludeAudio,
              customCharacterLimit,
              setCustomCharacterLimit,
              showSettings,
              setShowSettings,
              copied,
              copyToClipboard: copyToClipboard2
            }
          ) }),
          /* @__PURE__ */ jsx6(TabsContent, { value: "history", children: /* @__PURE__ */ jsx6(
            PromptHistory,
            {
              promptHistory,
              loadFromHistory,
              clearHistory,
              setActiveTab
            }
          ) })
        ]
      }
    )
  ] });
}
export {
  AIEnhancement,
  DEFAULT_VALUES,
  MoodboardUploader,
  PRESET_OPTIONS,
  PromptBuilder,
  PromptHistory,
  PromptPreview,
  STORAGE_KEYS,
  Veo3PromptGenerator,
  copyToClipboard,
  createCharacter,
  createEmptyPromptData,
  createRandomPromptData,
  generatePrompt,
  getLocaleLanguage
};
//# sourceMappingURL=index.mjs.map