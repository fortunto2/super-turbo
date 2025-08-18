'use strict';

var react = require('react');
var ui = require('@turbo-super/ui');
var lucideReact = require('lucide-react');
var jsxRuntime = require('react/jsx-runtime');
var api = require('@turbo-super/api');
var zod = require('zod');
var Link = require('next/link');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Link__default = /*#__PURE__*/_interopDefault(Link);

// src/veo3-tools/components/Veo3PromptGenerator.tsx

// src/veo3-tools/translations/en.json
var en_default = {
  veo3PromptGenerator: {
    infoBanner: {
      title: "Master VEO3 Video Generation",
      description: "Learn professional prompting techniques and best practices for Google's most advanced AI video model."
    },
    tabs: {
      builder: "Prompt Builder",
      enhance: "AI Enhancement",
      history: "History"
    },
    promptBuilder: {
      scene: "Scene",
      scenePlaceholder: "Describe the setting, environment, or location...",
      style: "Style",
      stylePlaceholder: "Artistic, photorealistic, cinematic, etc...",
      camera: "Camera",
      cameraPlaceholder: "Camera movement, angle, shot type...",
      characters: "Characters",
      addCharacter: "Add Character",
      characterName: "Name",
      characterNamePlaceholder: "Character name (e.g., Sarah, Vendor)",
      characterDescription: "Description",
      characterDescriptionPlaceholder: "Describe the character (e.g., A young woman with wavy brown hair)",
      characterSpeech: "Speech/Dialogue",
      characterSpeechPlaceholder: "What they say (e.g., Hello there! or \u041F\u0440\u0438\u0432\u0435\u0442!)",
      characterNumber: "Character",
      hasVoice: "Has Voice",
      voiceHighlight: "This dialogue will be highlighted in the enhanced prompt",
      removeCharacter: "Remove",
      action: "Action",
      actionPlaceholder: "What's happening in the scene...",
      lighting: "Lighting",
      lightingPlaceholder: "Natural, dramatic, soft, etc...",
      mood: "Mood",
      moodPlaceholder: "Emotional atmosphere, tone...",
      language: "Language",
      languagePlaceholder: "Enter language (e.g., English, Russian, Spanish...)",
      quickSelect: "Quick select:",
      moodboard: "Moodboard",
      moodboardEnabled: "Enable moodboard",
      moodboardDescription: "Upload reference images to guide generation",
      noCharacters: 'No characters added yet. Click "Add Character" to start.',
      moodboardTitle: "Enable Moodboard References",
      moodboardImages: "0/3 images",
      visualReferences: "Visual References",
      uploadImages: "\u{1F4C1} Click to Upload Images",
      uploadDescription: "Select up to 3 images to use as visual references",
      supportedFormats: "Supported formats: JPG, PNG, GIF, WebP",
      moodboardTips: "\u{1F3A8} Moodboard Tips",
      tip1: "Upload reference images to influence your VEO3 generation",
      tip2: "Add descriptions to highlight specific elements you want emphasized",
      tip3: "Adjust influence weight to control how much each image affects the result"
    },
    promptPreview: {
      title: "Generated Prompt",
      copyButton: "Copy",
      copied: "Copied!",
      randomizeButton: "Randomize",
      clearButton: "Clear All",
      enhanceButton: "Continue to AI Enhancement \u2192",
      placeholder: "Your generated prompt will appear here, or type your own prompt...",
      preview: "Preview"
    },
    aiEnhancement: {
      title: "AI Enhancement",
      description: "Enhance your prompt with advanced AI techniques",
      focusTypes: {
        character: "Character Focus",
        action: "Action Focus",
        cinematic: "Cinematic Focus",
        safe: "Safe Content"
      },
      settings: {
        title: "Enhancement Settings",
        characterLimit: "Character Limit",
        includeAudio: "Include Audio Description",
        model: "AI Model"
      },
      enhanceButton: "Enhance Prompt",
      enhancing: "Enhancing...",
      enhanceError: "Enhancement failed",
      enhancementInfo: {
        model: "Model",
        length: "Length",
        actualCharacters: "Actual Characters",
        targetCharacters: "Target Characters"
      },
      focus: "focus"
    },
    promptHistory: {
      title: "Prompt History",
      empty: "No prompts in history yet",
      loadButton: "Load",
      clearButton: "Clear History",
      columns: {
        timestamp: "Date",
        basicPrompt: "Basic Prompt",
        enhancedPrompt: "Enhanced Prompt",
        length: "Length",
        model: "Model"
      }
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close"
    }
  }
};

// src/veo3-tools/translations/ru.json
var ru_default = {
  veo3PromptGenerator: {
    infoBanner: {
      title: "\u041E\u0441\u0432\u043E\u0439\u0442\u0435 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044E \u0432\u0438\u0434\u0435\u043E VEO3",
      description: "\u0418\u0437\u0443\u0447\u0438\u0442\u0435 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0442\u0435\u0445\u043D\u0438\u043A\u0438 \u043F\u0440\u043E\u043C\u043F\u0442\u0438\u043D\u0433\u0430 \u0438 \u043B\u0443\u0447\u0448\u0438\u0435 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438 \u0434\u043B\u044F \u0441\u0430\u043C\u043E\u0439 \u043F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u043E\u0439 AI-\u043C\u043E\u0434\u0435\u043B\u0438 \u0432\u0438\u0434\u0435\u043E \u043E\u0442 Google."
    },
    tabs: {
      builder: "\u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440 \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u0432",
      enhance: "AI-\u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435",
      history: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F"
    },
    promptBuilder: {
      scene: "\u0421\u0446\u0435\u043D\u0430",
      scenePlaceholder: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u043E\u0431\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0443, \u043E\u043A\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 \u043C\u0435\u0441\u0442\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F...",
      style: "\u0421\u0442\u0438\u043B\u044C",
      stylePlaceholder: "\u0425\u0443\u0434\u043E\u0436\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439, \u0444\u043E\u0442\u043E\u0440\u0435\u0430\u043B\u0438\u0441\u0442\u0438\u0447\u043D\u044B\u0439, \u043A\u0438\u043D\u0435\u043C\u0430\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u043D\u044B\u0439 \u0438 \u0442.\u0434...",
      camera: "\u041A\u0430\u043C\u0435\u0440\u0430",
      cameraPlaceholder: "\u0414\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u043A\u0430\u043C\u0435\u0440\u044B, \u0443\u0433\u043E\u043B, \u0442\u0438\u043F \u043A\u0430\u0434\u0440\u0430...",
      characters: "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0438",
      addCharacter: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0430",
      characterName: "\u0418\u043C\u044F",
      characterNamePlaceholder: "\u0418\u043C\u044F \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0430 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0421\u0430\u0440\u0430, \u041F\u0440\u043E\u0434\u0430\u0432\u0435\u0446)",
      characterDescription: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",
      characterDescriptionPlaceholder: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0430 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u041C\u043E\u043B\u043E\u0434\u0430\u044F \u0436\u0435\u043D\u0449\u0438\u043D\u0430 \u0441 \u0432\u043E\u043B\u043D\u0438\u0441\u0442\u044B\u043C\u0438 \u043A\u0430\u0448\u0442\u0430\u043D\u043E\u0432\u044B\u043C\u0438 \u0432\u043E\u043B\u043E\u0441\u0430\u043C\u0438)",
      characterSpeech: "\u0420\u0435\u0447\u044C/\u0414\u0438\u0430\u043B\u043E\u0433",
      characterSpeechPlaceholder: "\u0427\u0442\u043E \u043E\u043D\u0438 \u0433\u043E\u0432\u043E\u0440\u044F\u0442 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u041F\u0440\u0438\u0432\u0435\u0442! \u0438\u043B\u0438 Hello!)",
      characterNumber: "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u0436",
      hasVoice: "\u0415\u0441\u0442\u044C \u0433\u043E\u043B\u043E\u0441",
      voiceHighlight: "\u042D\u0442\u043E\u0442 \u0434\u0438\u0430\u043B\u043E\u0433 \u0431\u0443\u0434\u0435\u0442 \u0432\u044B\u0434\u0435\u043B\u0435\u043D \u0432 \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u043D\u043E\u043C \u043F\u0440\u043E\u043C\u043F\u0442\u0435",
      removeCharacter: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
      action: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
      actionPlaceholder: "\u0427\u0442\u043E \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442 \u0432 \u0441\u0446\u0435\u043D\u0435...",
      lighting: "\u041E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u0435",
      lightingPlaceholder: "\u0415\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435, \u0434\u0440\u0430\u043C\u0430\u0442\u0438\u0447\u043D\u043E\u0435, \u043C\u044F\u0433\u043A\u043E\u0435 \u0438 \u0442.\u0434...",
      mood: "\u041D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435",
      moodPlaceholder: "\u042D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u0430\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u0430, \u0442\u043E\u043D...",
      language: "\u042F\u0437\u044B\u043A",
      languagePlaceholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u044F\u0437\u044B\u043A (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0410\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439, \u0420\u0443\u0441\u0441\u043A\u0438\u0439, \u0418\u0441\u043F\u0430\u043D\u0441\u043A\u0438\u0439...)",
      quickSelect: "\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0432\u044B\u0431\u043E\u0440:",
      moodboard: "\u041C\u0443\u0434\u0431\u043E\u0440\u0434",
      moodboardEnabled: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043C\u0443\u0434\u0431\u043E\u0440\u0434",
      moodboardDescription: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0440\u0435\u0444\u0435\u0440\u0435\u043D\u0441\u043D\u044B\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438",
      noCharacters: "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0438 \u0435\u0449\u0435 \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0430\xBB, \u0447\u0442\u043E\u0431\u044B \u043D\u0430\u0447\u0430\u0442\u044C.",
      moodboardTitle: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043C\u0443\u0434\u0431\u043E\u0440\u0434",
      moodboardImages: "0/3 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439",
      visualReferences: "\u0412\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
      uploadImages: "\u{1F4C1} \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0434\u043B\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439",
      uploadDescription: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u043E 3 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0432 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u044B\u0445 \u0441\u0441\u044B\u043B\u043E\u043A",
      supportedFormats: "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043C\u044B\u0435 \u0444\u043E\u0440\u043C\u0430\u0442\u044B: JPG, PNG, GIF, WebP",
      moodboardTips: "\u{1F3A8} \u0421\u043E\u0432\u0435\u0442\u044B \u043F\u043E \u043C\u0443\u0434\u0431\u043E\u0440\u0434\u0443",
      tip1: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0440\u0435\u0444\u0435\u0440\u0435\u043D\u0441\u043D\u044B\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u0432\u043B\u0438\u044F\u043D\u0438\u044F \u043D\u0430 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044E VEO3",
      tip2: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F \u0434\u043B\u044F \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u044F \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u044B\u0445 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0445\u043E\u0442\u0438\u0442\u0435 \u043F\u043E\u0434\u0447\u0435\u0440\u043A\u043D\u0443\u0442\u044C",
      tip3: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u0432\u0435\u0441 \u0432\u043B\u0438\u044F\u043D\u0438\u044F \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044F \u0442\u043E\u0433\u043E, \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043A\u0430\u0436\u0434\u043E\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0432\u043B\u0438\u044F\u0435\u0442 \u043D\u0430 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442"
    },
    promptPreview: {
      title: "\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043F\u0440\u043E\u043C\u043F\u0442",
      copyButton: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
      copied: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E!",
      randomizeButton: "\u0421\u043B\u0443\u0447\u0430\u0439\u043D\u043E",
      clearButton: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0432\u0441\u0451",
      enhanceButton: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u043A AI-\u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044E \u2192",
      placeholder: "\u0412\u0430\u0448 \u0441\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043F\u0440\u043E\u043C\u043F\u0442 \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C, \u0438\u043B\u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0432\u043E\u0439 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043F\u0440\u043E\u043C\u043F\u0442...",
      preview: "\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440"
    },
    aiEnhancement: {
      title: "AI-\u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435",
      description: "\u0423\u043B\u0443\u0447\u0448\u0438\u0442\u0435 \u0432\u0430\u0448 \u043F\u0440\u043E\u043C\u043F\u0442 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u043F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u044B\u0445 AI-\u0442\u0435\u0445\u043D\u0438\u043A",
      focusTypes: {
        character: "\u0424\u043E\u043A\u0443\u0441 \u043D\u0430 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0430\u0445",
        action: "\u0424\u043E\u043A\u0443\u0441 \u043D\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0438",
        cinematic: "\u041A\u0438\u043D\u0435\u043C\u0430\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u043E\u043A\u0443\u0441",
        safe: "\u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u043D\u0442"
      },
      settings: {
        title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044F",
        characterLimit: "\u041B\u0438\u043C\u0438\u0442 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432",
        includeAudio: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0430\u0443\u0434\u0438\u043E",
        model: "AI-\u043C\u043E\u0434\u0435\u043B\u044C"
      },
      enhanceButton: "\u0423\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u043F\u0440\u043E\u043C\u043F\u0442",
      enhancing: "\u0423\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435...",
      enhanceError: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044F",
      enhancementInfo: {
        model: "\u041C\u043E\u0434\u0435\u043B\u044C",
        length: "\u0414\u043B\u0438\u043D\u0430",
        actualCharacters: "\u0424\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432",
        targetCharacters: "\u0426\u0435\u043B\u0435\u0432\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432"
      },
      focus: "\u0444\u043E\u043A\u0443\u0441"
    },
    promptHistory: {
      title: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u0432",
      empty: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u0432 \u043F\u043E\u043A\u0430 \u043F\u0443\u0441\u0442\u0430",
      loadButton: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C",
      clearButton: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0438\u0441\u0442\u043E\u0440\u0438\u044E",
      columns: {
        timestamp: "\u0414\u0430\u0442\u0430",
        basicPrompt: "\u0411\u0430\u0437\u043E\u0432\u044B\u0439 \u043F\u0440\u043E\u043C\u043F\u0442",
        enhancedPrompt: "\u0423\u043B\u0443\u0447\u0448\u0435\u043D\u043D\u044B\u0439 \u043F\u0440\u043E\u043C\u043F\u0442",
        length: "\u0414\u043B\u0438\u043D\u0430",
        model: "\u041C\u043E\u0434\u0435\u043B\u044C"
      }
    },
    common: {
      loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...",
      error: "\u041E\u0448\u0438\u0431\u043A\u0430",
      success: "\u0423\u0441\u043F\u0435\u0448\u043D\u043E",
      cancel: "\u041E\u0442\u043C\u0435\u043D\u0430",
      save: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",
      delete: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
      edit: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
      close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"
    }
  }
};

// src/veo3-tools/translations/tr.json
var tr_default = {
  veo3PromptGenerator: {
    infoBanner: {
      title: "VEO3 Video \xDCretiminde Uzmanla\u015F\u0131n",
      description: "Google'\u0131n en geli\u015Fmi\u015F AI video modeli i\xE7in profesyonel prompt tekniklerini ve en iyi uygulamalar\u0131 \xF6\u011Frenin."
    },
    tabs: {
      builder: "Prompt Olu\u015Fturucu",
      enhance: "AI Geli\u015Ftirme",
      history: "Ge\xE7mi\u015F"
    },
    promptBuilder: {
      scene: "Sahne",
      scenePlaceholder: "Ortam\u0131, \xE7evreyi veya konumu a\xE7\u0131klay\u0131n...",
      style: "Stil",
      stylePlaceholder: "Sanatsal, foto-ger\xE7ek\xE7i, sinematik, vb...",
      camera: "Kamera",
      cameraPlaceholder: "Kamera hareketi, a\xE7\u0131, \xE7ekim t\xFCr\xFC...",
      characters: "Karakterler",
      addCharacter: "Karakter Ekle",
      characterName: "\u0130sim",
      characterDescription: "A\xE7\u0131klama",
      characterSpeech: "Konu\u015Fma/Diyalog",
      removeCharacter: "Kald\u0131r",
      action: "Aksiyon",
      actionPlaceholder: "Sahnede ne oluyor...",
      lighting: "Ayd\u0131nlatma",
      lightingPlaceholder: "Do\u011Fal, dramatik, yumu\u015Fak, vb...",
      mood: "Ruh Hali",
      moodPlaceholder: "Duygusal atmosfer, ton...",
      language: "Dil",
      moodboard: "Moodboard",
      moodboardEnabled: "Moodboard'u etkinle\u015Ftir",
      moodboardDescription: "\xDCretimi y\xF6nlendirmek i\xE7in referans g\xF6rseller y\xFCkleyin"
    },
    promptPreview: {
      title: "Olu\u015Fturulan Prompt",
      copyButton: "Kopyala",
      copied: "Kopyaland\u0131!",
      randomizeButton: "Rastgele",
      clearButton: "T\xFCm\xFCn\xFC Temizle",
      enhanceButton: "AI ile Geli\u015Ftir"
    },
    aiEnhancement: {
      title: "AI Geli\u015Ftirme",
      description: "Prompt'unuzu geli\u015Fmi\u015F AI teknikleriyle geli\u015Ftirin",
      focusTypes: {
        character: "Karakter Odakl\u0131",
        action: "Aksiyon Odakl\u0131",
        cinematic: "Sinematik Odak",
        safe: "G\xFCvenli \u0130\xE7erik"
      },
      settings: {
        title: "Geli\u015Ftirme Ayarlar\u0131",
        characterLimit: "Karakter Limiti",
        includeAudio: "Ses A\xE7\u0131klamas\u0131n\u0131 Dahil Et",
        model: "AI Modeli"
      },
      enhanceButton: "Prompt'u Geli\u015Ftir",
      enhancing: "Geli\u015Ftiriliyor...",
      enhanceError: "Geli\u015Ftirme ba\u015Far\u0131s\u0131z",
      enhancementInfo: {
        model: "Model",
        length: "Uzunluk",
        actualCharacters: "Ger\xE7ek Karakterler",
        targetCharacters: "Hedef Karakterler"
      }
    },
    promptHistory: {
      title: "Prompt Ge\xE7mi\u015Fi",
      empty: "Hen\xFCz prompt ge\xE7mi\u015Fi yok",
      loadButton: "Y\xFCkle",
      clearButton: "Ge\xE7mi\u015Fi Temizle",
      columns: {
        timestamp: "Tarih",
        basicPrompt: "Temel Prompt",
        enhancedPrompt: "Geli\u015Ftirilmi\u015F Prompt",
        length: "Uzunluk",
        model: "Model"
      }
    },
    common: {
      loading: "Y\xFCkleniyor...",
      error: "Hata",
      success: "Ba\u015Far\u0131l\u0131",
      cancel: "\u0130ptal",
      save: "Kaydet",
      delete: "Sil",
      edit: "D\xFCzenle",
      close: "Kapat"
    }
  }
};

// src/veo3-tools/translations/es.json
var es_default = {
  veo3PromptGenerator: {
    infoBanner: {
      title: "Domina la Generaci\xF3n de Video VEO3",
      description: "Aprende t\xE9cnicas profesionales de prompting y mejores pr\xE1cticas para el modelo de video AI m\xE1s avanzado de Google."
    },
    tabs: {
      builder: "Constructor de Prompts",
      enhance: "Mejora con AI",
      history: "Historial"
    },
    promptBuilder: {
      scene: "Escena",
      scenePlaceholder: "Describe el entorno, ambiente o ubicaci\xF3n...",
      style: "Estilo",
      stylePlaceholder: "Art\xEDstico, fotorrealista, cinematogr\xE1fico, etc...",
      camera: "C\xE1mara",
      cameraPlaceholder: "Movimiento de c\xE1mara, \xE1ngulo, tipo de toma...",
      characters: "Personajes",
      addCharacter: "Agregar Personaje",
      characterName: "Nombre",
      characterDescription: "Descripci\xF3n",
      characterSpeech: "Habla/Di\xE1logo",
      removeCharacter: "Eliminar",
      action: "Acci\xF3n",
      actionPlaceholder: "\xBFQu\xE9 est\xE1 pasando en la escena...",
      lighting: "Iluminaci\xF3n",
      lightingPlaceholder: "Natural, dram\xE1tica, suave, etc...",
      mood: "Estado de \xC1nimo",
      moodPlaceholder: "Atm\xF3sfera emocional, tono...",
      language: "Idioma",
      moodboard: "Moodboard",
      moodboardEnabled: "Habilitar moodboard",
      moodboardDescription: "Sube im\xE1genes de referencia para guiar la generaci\xF3n"
    },
    promptPreview: {
      title: "Prompt Generado",
      copyButton: "Copiar",
      copied: "\xA1Copiado!",
      randomizeButton: "Aleatorizar",
      clearButton: "Limpiar Todo",
      enhanceButton: "Mejorar con AI"
    },
    aiEnhancement: {
      title: "Mejora con AI",
      description: "Mejora tu prompt con t\xE9cnicas avanzadas de AI",
      focusTypes: {
        character: "Enfoque en Personajes",
        action: "Enfoque en Acci\xF3n",
        cinematic: "Enfoque Cinematogr\xE1fico",
        safe: "Contenido Seguro"
      },
      settings: {
        title: "Configuraci\xF3n de Mejora",
        characterLimit: "L\xEDmite de Caracteres",
        includeAudio: "Incluir Descripci\xF3n de Audio",
        model: "Modelo AI"
      },
      enhanceButton: "Mejorar Prompt",
      enhancing: "Mejorando...",
      enhanceError: "La mejora fall\xF3",
      enhancementInfo: {
        model: "Modelo",
        length: "Longitud",
        actualCharacters: "Caracteres Reales",
        targetCharacters: "Caracteres Objetivo"
      }
    },
    promptHistory: {
      title: "Historial de Prompts",
      empty: "A\xFAn no hay prompts en el historial",
      loadButton: "Cargar",
      clearButton: "Limpiar Historial",
      columns: {
        timestamp: "Fecha",
        basicPrompt: "Prompt B\xE1sico",
        enhancedPrompt: "Prompt Mejorado",
        length: "Longitud",
        model: "Modelo"
      }
    },
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "\xC9xito",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      close: "Cerrar"
    }
  }
};

// src/veo3-tools/translations/hi.json
var hi_default = {
  veo3PromptGenerator: {
    infoBanner: {
      title: "VEO3 \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u0936\u0928 \u092E\u0947\u0902 \u092E\u0939\u093E\u0930\u0924 \u0939\u093E\u0938\u093F\u0932 \u0915\u0930\u0947\u0902",
      description: "Google \u0915\u0947 \u0938\u092C\u0938\u0947 \u0909\u0928\u094D\u0928\u0924 AI \u0935\u0940\u0921\u093F\u092F\u094B \u092E\u0949\u0921\u0932 \u0915\u0947 \u0932\u093F\u090F \u092A\u0947\u0936\u0947\u0935\u0930 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F\u093F\u0902\u0917 \u0924\u0915\u0928\u0940\u0915\u094B\u0902 \u0914\u0930 \u0938\u0930\u094D\u0935\u094B\u0924\u094D\u0924\u092E \u092A\u094D\u0930\u0925\u093E\u0913\u0902 \u0915\u094B \u0938\u0940\u0916\u0947\u0902\u0964"
    },
    tabs: {
      builder: "\u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u092C\u093F\u0932\u094D\u0921\u0930",
      enhance: "AI \u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F",
      history: "\u0907\u0924\u093F\u0939\u093E\u0938"
    },
    promptBuilder: {
      scene: "\u0926\u0943\u0936\u094D\u092F",
      scenePlaceholder: "\u0938\u0947\u091F\u093F\u0902\u0917, \u0935\u093E\u0924\u093E\u0935\u0930\u0923 \u092F\u093E \u0938\u094D\u0925\u093E\u0928 \u0915\u093E \u0935\u0930\u094D\u0923\u0928 \u0915\u0930\u0947\u0902...",
      style: "\u0936\u0948\u0932\u0940",
      stylePlaceholder: "\u0915\u0932\u093E\u0924\u094D\u092E\u0915, \u092B\u094B\u091F\u094B\u0930\u093F\u092F\u0932\u093F\u0938\u094D\u091F\u093F\u0915, \u0938\u093F\u0928\u0947\u092E\u0948\u091F\u093F\u0915, \u0906\u0926\u093F...",
      camera: "\u0915\u0948\u092E\u0930\u093E",
      cameraPlaceholder: "\u0915\u0948\u092E\u0930\u093E \u0906\u0902\u0926\u094B\u0932\u0928, \u0915\u094B\u0923, \u0936\u0949\u091F \u092A\u094D\u0930\u0915\u093E\u0930...",
      characters: "\u092A\u093E\u0924\u094D\u0930",
      addCharacter: "\u092A\u093E\u0924\u094D\u0930 \u091C\u094B\u0921\u093C\u0947\u0902",
      characterName: "\u0928\u093E\u092E",
      characterDescription: "\u0935\u093F\u0935\u0930\u0923",
      characterSpeech: "\u092D\u093E\u0937\u0923/\u0938\u0902\u0935\u093E\u0926",
      removeCharacter: "\u0939\u091F\u093E\u090F\u0902",
      action: "\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908",
      actionPlaceholder: "\u0926\u0943\u0936\u094D\u092F \u092E\u0947\u0902 \u0915\u094D\u092F\u093E \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
      lighting: "\u092A\u094D\u0930\u0915\u093E\u0936 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E",
      lightingPlaceholder: "\u092A\u094D\u0930\u093E\u0915\u0943\u0924\u093F\u0915, \u0928\u093E\u091F\u0915\u0940\u092F, \u0928\u0930\u092E, \u0906\u0926\u093F...",
      mood: "\u092E\u0942\u0921",
      moodPlaceholder: "\u092D\u093E\u0935\u0928\u093E\u0924\u094D\u092E\u0915 \u0935\u093E\u0924\u093E\u0935\u0930\u0923, \u0938\u094D\u0935\u0930...",
      language: "\u092D\u093E\u0937\u093E",
      moodboard: "\u092E\u0942\u0921\u092C\u094B\u0930\u094D\u0921",
      moodboardEnabled: "\u092E\u0942\u0921\u092C\u094B\u0930\u094D\u0921 \u0938\u0915\u094D\u0937\u092E \u0915\u0930\u0947\u0902",
      moodboardDescription: "\u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u094B \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0924 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0938\u0902\u0926\u0930\u094D\u092D \u091B\u0935\u093F\u092F\u093E\u0902 \u0905\u092A\u0932\u094B\u0921 \u0915\u0930\u0947\u0902"
    },
    promptPreview: {
      title: "\u0909\u0924\u094D\u092A\u0928\u094D\u0928 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F",
      copyButton: "\u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902",
      copied: "\u0915\u0949\u092A\u0940 \u0915\u093F\u092F\u093E \u0917\u092F\u093E!",
      randomizeButton: "\u0930\u0948\u0902\u0921\u092E\u093E\u0907\u091C\u093C",
      clearButton: "\u0938\u092C \u0915\u0941\u091B \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902",
      enhanceButton: "AI \u0915\u0947 \u0938\u093E\u0925 \u092C\u0922\u093C\u093E\u090F\u0902"
    },
    aiEnhancement: {
      title: "AI \u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F",
      description: "\u0909\u0928\u094D\u0928\u0924 AI \u0924\u0915\u0928\u0940\u0915\u094B\u0902 \u0915\u0947 \u0938\u093E\u0925 \u0905\u092A\u0928\u0947 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0915\u094B \u092C\u0922\u093C\u093E\u090F\u0902",
      focusTypes: {
        character: "\u092A\u093E\u0924\u094D\u0930 \u092B\u094B\u0915\u0938",
        action: "\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908 \u092B\u094B\u0915\u0938",
        cinematic: "\u0938\u093F\u0928\u0947\u092E\u0948\u091F\u093F\u0915 \u092B\u094B\u0915\u0938",
        safe: "\u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0938\u093E\u092E\u0917\u094D\u0930\u0940"
      },
      settings: {
        title: "\u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F \u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938",
        characterLimit: "\u0905\u0915\u094D\u0937\u0930 \u0938\u0940\u092E\u093E",
        includeAudio: "\u0911\u0921\u093F\u092F\u094B \u0935\u093F\u0935\u0930\u0923 \u0936\u093E\u092E\u093F\u0932 \u0915\u0930\u0947\u0902",
        model: "AI \u092E\u0949\u0921\u0932"
      },
      enhanceButton: "\u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u092C\u0922\u093C\u093E\u090F\u0902",
      enhancing: "\u092C\u0922\u093C\u093E \u0930\u0939\u093E \u0939\u0948...",
      enhanceError: "\u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F \u0935\u093F\u092B\u0932",
      enhancementInfo: {
        model: "\u092E\u0949\u0921\u0932",
        length: "\u0932\u0902\u092C\u093E\u0908",
        actualCharacters: "\u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u0905\u0915\u094D\u0937\u0930",
        targetCharacters: "\u0932\u0915\u094D\u0937\u094D\u092F \u0905\u0915\u094D\u0937\u0930"
      }
    },
    promptHistory: {
      title: "\u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0907\u0924\u093F\u0939\u093E\u0938",
      empty: "\u0905\u092D\u0940 \u0924\u0915 \u0907\u0924\u093F\u0939\u093E\u0938 \u092E\u0947\u0902 \u0915\u094B\u0908 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0928\u0939\u0940\u0902",
      loadButton: "\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
      clearButton: "\u0907\u0924\u093F\u0939\u093E\u0938 \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902",
      columns: {
        timestamp: "\u0926\u093F\u0928\u093E\u0902\u0915",
        basicPrompt: "\u092C\u0941\u0928\u093F\u092F\u093E\u0926\u0940 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F",
        enhancedPrompt: "\u092C\u0922\u093C\u093E\u092F\u093E \u0917\u092F\u093E \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F",
        length: "\u0932\u0902\u092C\u093E\u0908",
        model: "\u092E\u0949\u0921\u0932"
      }
    },
    common: {
      loading: "\u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
      error: "\u0924\u094D\u0930\u0941\u091F\u093F",
      success: "\u0938\u092B\u0932\u0924\u093E",
      cancel: "\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902",
      save: "\u0938\u0939\u0947\u091C\u0947\u0902",
      delete: "\u0939\u091F\u093E\u090F\u0902",
      edit: "\u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0947\u0902",
      close: "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902"
    }
  }
};

// src/veo3-tools/translations/index.ts
var locales = ["en", "ru", "tr", "es", "hi"];
var defaultLocale = "en";

// src/veo3-tools/hooks/use-translation.ts
var dictionaries = {
  en: en_default,
  ru: ru_default,
  tr: tr_default,
  es: es_default,
  hi: hi_default
};
function getNested(obj, path) {
  const keys = Array.isArray(path) ? path : path.split(".");
  return keys.reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return acc[key];
    }
    return void 0;
  }, obj);
}
function useTranslation(locale) {
  const dict = dictionaries[locale] || dictionaries.en;
  function t(key, fallback) {
    const value = getNested(dict, key);
    if (value !== void 0) return value;
    if (fallback !== void 0) return fallback;
    return key;
  }
  return { t };
}
function MoodboardUploader({
  enabled,
  onEnabledChange,
  onImagesChange,
  maxImages = 3,
  value = [],
  locale = "en"
}) {
  const { t } = useTranslation(locale);
  const fileInputRef = react.useRef(null);
  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (!files) return;
    for (let i = 0; i < Math.min(files.length, maxImages - value.length); i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result;
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
    fileInputRef.current?.click();
  };
  const removeImage = (imageId) => {
    const updatedImages = value.filter((img) => img.id !== imageId);
    onImagesChange(updatedImages);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-3", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "checkbox",
            id: "moodboard-toggle",
            checked: enabled,
            onChange: (e) => onEnabledChange(e.target.checked),
            className: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Label,
          {
            htmlFor: "moodboard-toggle",
            className: "text-sm font-medium",
            children: t("veo3PromptGenerator.promptBuilder.moodboardTitle")
          }
        )
      ] }),
      enabled && /* @__PURE__ */ jsxRuntime.jsx(
        ui.Badge,
        {
          variant: "outline",
          className: "text-xs",
          children: t("veo3PromptGenerator.promptBuilder.moodboardImages").replace(
            "0/3",
            `${value.length}/${maxImages}`
          )
        }
      )
    ] }),
    enabled && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ui.Card, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.CardHeader, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.CardTitle, { className: "text-lg", children: t("veo3PromptGenerator.promptBuilder.visualReferences") }) }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.CardContent, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(
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
          /* @__PURE__ */ jsxRuntime.jsxs(
            "div",
            {
              className: "border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors",
              onClick: handleDropZoneClick,
              children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-gray-500 dark:text-gray-400 mb-2", children: [
                  "\u{1F4C1} ",
                  t("veo3PromptGenerator.promptBuilder.uploadImages")
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-400 dark:text-gray-500", children: t(
                  "veo3PromptGenerator.promptBuilder.uploadDescription"
                ).replace("3", maxImages.toString()) }),
                /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-gray-400 dark:text-gray-500 mt-1", children: t("veo3PromptGenerator.promptBuilder.supportedFormats") })
              ]
            }
          )
        ] })
      ] }),
      value.length > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-4", children: value.map((image) => /* @__PURE__ */ jsxRuntime.jsx(
        ui.Card,
        {
          className: "group relative",
          children: /* @__PURE__ */ jsxRuntime.jsxs(ui.CardContent, { className: "pt-6", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                onClick: () => removeImage(image.id),
                className: "absolute top-2 right-2 z-10 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                title: "Remove image",
                children: "\u2715"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "aspect-square relative rounded-lg overflow-hidden bg-muted", children: image.url ? /* @__PURE__ */ jsxRuntime.jsx(
                "img",
                {
                  src: image.url,
                  alt: "Moodboard reference",
                  className: "w-full h-full object-cover"
                }
              ) : image.base64 ? /* @__PURE__ */ jsxRuntime.jsx(
                "img",
                {
                  src: image.base64,
                  alt: "Moodboard reference",
                  className: "w-full h-full object-cover"
                }
              ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full flex items-center justify-center text-muted-foreground", children: "Image Preview" }) }) }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "lg:col-span-2 space-y-4", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
                  "Image ID: ",
                  image.id
                ] }),
                image.description && /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
                  "Description: ",
                  image.description
                ] }),
                image.tags.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
                  "Tags: ",
                  image.tags.join(", ")
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
                  "Weight: ",
                  image.weight
                ] })
              ] }) })
            ] })
          ] })
        },
        image.id
      )) }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Card, { className: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20", children: /* @__PURE__ */ jsxRuntime.jsx(ui.CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("h4", { className: "text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2", children: [
          "\u{1F3A8} ",
          t("veo3PromptGenerator.promptBuilder.moodboardTips")
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "text-sm text-blue-800 dark:text-blue-200 space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-blue-600 dark:text-blue-400", children: "\u2022" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: t("veo3PromptGenerator.promptBuilder.tip1") })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-blue-600 dark:text-blue-400", children: "\u2022" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: t("veo3PromptGenerator.promptBuilder.tip2") })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-blue-600 dark:text-blue-400", children: "\u2022" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: t("veo3PromptGenerator.promptBuilder.tip3") })
          ] })
        ] })
      ] }) }) })
    ] })
  ] });
}
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
  MoodboardUploader: MoodboardUploader2,
  locale = "en"
}) {
  const { t } = useTranslation(locale);
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Card, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardHeader, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.CardTitle, { children: t("veo3PromptGenerator.tabs.builder") }) }),
    /* @__PURE__ */ jsxRuntime.jsxs(ui.CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2 p-4 border-l-4 border-blue-500 bg-blue-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Label,
          {
            htmlFor: "scene",
            className: "flex items-center gap-2 text-blue-300 font-medium",
            children: [
              "\u{1F3AC} ",
              t("veo3PromptGenerator.promptBuilder.scene")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Textarea,
          {
            id: "scene",
            placeholder: t(
              "veo3PromptGenerator.promptBuilder.scenePlaceholder"
            ),
            value: promptData.scene,
            onChange: (e) => setPromptData({ ...promptData, scene: e.target.value }),
            className: "min-h-[80px] border-blue-600 bg-blue-950/10 focus:border-blue-400 focus:ring-blue-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4 p-4 border-l-4 border-green-500 bg-green-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntime.jsxs(ui.Label, { className: "flex items-center gap-2 text-green-300 font-medium", children: [
            "\u{1F465} ",
            t("veo3PromptGenerator.promptBuilder.characters"),
            " (",
            promptData.characters.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            ui.Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              onClick: addCharacter,
              className: "text-xs border-green-600 text-green-300 hover:bg-green-950/30",
              children: [
                "+ ",
                t("veo3PromptGenerator.promptBuilder.addCharacter")
              ]
            }
          )
        ] }),
        promptData.characters.length === 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center", children: t("veo3PromptGenerator.promptBuilder.noCharacters") }),
        promptData.characters.map((character, index) => /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: "p-4 border border-green-600 bg-green-950/10 rounded-lg space-y-3",
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntime.jsxs(ui.Label, { className: "text-sm font-medium", children: [
                  t("veo3PromptGenerator.promptBuilder.characterNumber"),
                  " ",
                  index + 1
                ] }),
                promptData.characters.length > 1 && /* @__PURE__ */ jsxRuntime.jsx(
                  ui.Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "sm",
                    onClick: () => removeCharacter(character.id),
                    className: "text-red-500 hover:text-red-700 size-6 p-0",
                    children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "size-3" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 gap-3", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(
                    ui.Label,
                    {
                      htmlFor: `char-name-${character.id}`,
                      className: "text-xs",
                      children: t("veo3PromptGenerator.promptBuilder.characterName")
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "input",
                    {
                      id: `char-name-${character.id}`,
                      type: "text",
                      placeholder: t(
                        "veo3PromptGenerator.promptBuilder.characterNamePlaceholder"
                      ),
                      value: character.name,
                      onChange: (e) => updateCharacter(character.id, "name", e.target.value),
                      className: "w-full px-3 py-2 border border-green-600 bg-green-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(
                    ui.Label,
                    {
                      htmlFor: `char-desc-${character.id}`,
                      className: "text-xs",
                      children: t(
                        "veo3PromptGenerator.promptBuilder.characterDescription"
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    ui.Textarea,
                    {
                      id: `char-desc-${character.id}`,
                      placeholder: t(
                        "veo3PromptGenerator.promptBuilder.characterDescriptionPlaceholder"
                      ),
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
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ui.Label,
                      {
                        htmlFor: `char-speech-${character.id}`,
                        className: "text-xs",
                        children: t("veo3PromptGenerator.promptBuilder.characterSpeech")
                      }
                    ),
                    character.speech && /* @__PURE__ */ jsxRuntime.jsxs(
                      ui.Badge,
                      {
                        variant: "secondary",
                        className: "text-xs px-2 py-0.5",
                        children: [
                          "\u{1F399}\uFE0F ",
                          t("veo3PromptGenerator.promptBuilder.hasVoice")
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    ui.Textarea,
                    {
                      id: `char-speech-${character.id}`,
                      placeholder: t(
                        "veo3PromptGenerator.promptBuilder.characterSpeechPlaceholder"
                      ),
                      value: character.speech,
                      onChange: (e) => updateCharacter(character.id, "speech", e.target.value),
                      className: `min-h-[50px] text-sm border-green-600 bg-green-950/10 focus:border-green-400 focus:ring-green-400 ${character.speech ? "border-blue-400 bg-blue-950/20" : ""}`
                    }
                  ),
                  character.speech && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-1 text-xs text-blue-300 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntime.jsx("span", { children: "\u{1F50A}" }),
                    /* @__PURE__ */ jsxRuntime.jsx("span", { children: t("veo3PromptGenerator.promptBuilder.voiceHighlight") })
                  ] })
                ] })
              ] })
            ]
          },
          character.id
        ))
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2 p-4 border-l-4 border-orange-500 bg-orange-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Label,
          {
            htmlFor: "action",
            className: "flex items-center gap-2 text-orange-300 font-medium",
            children: [
              "\u{1F3AD} ",
              t("veo3PromptGenerator.promptBuilder.action")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Textarea,
          {
            id: "action",
            placeholder: t(
              "veo3PromptGenerator.promptBuilder.actionPlaceholder"
            ),
            value: promptData.action,
            onChange: (e) => setPromptData({ ...promptData, action: e.target.value }),
            className: "border-orange-600 bg-orange-950/10 focus:border-orange-400 focus:ring-orange-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2 p-4 border-l-4 border-yellow-500 bg-yellow-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Label,
          {
            htmlFor: "language",
            className: "flex items-center gap-2 text-yellow-300 font-medium",
            children: [
              "\u{1F5E3}\uFE0F ",
              t("veo3PromptGenerator.promptBuilder.language")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              id: "language",
              type: "text",
              placeholder: t(
                "veo3PromptGenerator.promptBuilder.languagePlaceholder"
              ),
              value: promptData.language,
              onChange: (e) => setPromptData({ ...promptData, language: e.target.value }),
              className: "w-full px-3 py-2 border border-yellow-600 bg-yellow-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "text-xs text-yellow-300", children: t("veo3PromptGenerator.promptBuilder.quickSelect") }),
            presetOptions.languages.map((language) => /* @__PURE__ */ jsxRuntime.jsx(
              ui.Badge,
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
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2 p-4 border-l-4 border-purple-500 bg-purple-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Label,
          {
            htmlFor: "style",
            className: "flex items-center gap-2 text-purple-300 font-medium",
            children: [
              "\u{1F3A8} ",
              t("veo3PromptGenerator.promptBuilder.style")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              id: "style",
              type: "text",
              placeholder: t(
                "veo3PromptGenerator.promptBuilder.stylePlaceholder"
              ),
              value: promptData.style,
              onChange: (e) => setPromptData({ ...promptData, style: e.target.value }),
              className: "w-full px-3 py-2 border border-purple-600 bg-purple-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "text-xs text-purple-300", children: t("veo3PromptGenerator.promptBuilder.quickSelect") }),
            presetOptions.styles.map((style) => /* @__PURE__ */ jsxRuntime.jsx(
              ui.Badge,
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
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2 p-4 border-l-4 border-indigo-500 bg-indigo-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Label,
          {
            htmlFor: "camera",
            className: "flex items-center gap-2 text-indigo-300 font-medium",
            children: [
              "\u{1F4F9} ",
              t("veo3PromptGenerator.promptBuilder.camera")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              id: "camera",
              type: "text",
              placeholder: t(
                "veo3PromptGenerator.promptBuilder.cameraPlaceholder"
              ),
              value: promptData.camera,
              onChange: (e) => setPromptData({ ...promptData, camera: e.target.value }),
              className: "w-full px-3 py-2 border border-indigo-600 bg-indigo-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "text-xs text-indigo-300", children: t("veo3PromptGenerator.promptBuilder.quickSelect") }),
            presetOptions.cameras.map((camera) => /* @__PURE__ */ jsxRuntime.jsx(
              ui.Badge,
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
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2 p-4 border-l-4 border-pink-500 bg-pink-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Label,
          {
            htmlFor: "lighting",
            className: "flex items-center gap-2 text-pink-300 font-medium",
            children: [
              "\u{1F4A1} ",
              t("veo3PromptGenerator.promptBuilder.lighting")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              id: "lighting",
              type: "text",
              placeholder: t(
                "veo3PromptGenerator.promptBuilder.lightingPlaceholder"
              ),
              value: promptData.lighting,
              onChange: (e) => setPromptData({ ...promptData, lighting: e.target.value }),
              className: "w-full px-3 py-2 border border-pink-600 bg-pink-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "text-xs text-pink-300", children: t("veo3PromptGenerator.promptBuilder.quickSelect") }),
            presetOptions.lighting.map((light) => /* @__PURE__ */ jsxRuntime.jsx(
              ui.Badge,
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
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2 p-4 border-l-4 border-rose-500 bg-rose-950/20 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Label,
          {
            htmlFor: "mood",
            className: "flex items-center gap-2 text-rose-300 font-medium",
            children: [
              "\u{1F31F} ",
              t("veo3PromptGenerator.promptBuilder.mood")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              id: "mood",
              type: "text",
              placeholder: t(
                "veo3PromptGenerator.promptBuilder.moodPlaceholder"
              ),
              value: promptData.mood,
              onChange: (e) => setPromptData({ ...promptData, mood: e.target.value }),
              className: "w-full px-3 py-2 border border-rose-600 bg-rose-950/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "text-xs text-rose-300", children: t("veo3PromptGenerator.promptBuilder.quickSelect") }),
            presetOptions.moods.map((mood) => /* @__PURE__ */ jsxRuntime.jsx(
              ui.Badge,
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
      moodboardEnabled !== void 0 && setMoodboardEnabled && setMoodboardImages && (MoodboardUploader2 ? /* @__PURE__ */ jsxRuntime.jsx(
        MoodboardUploader2,
        {
          images: moodboardImages,
          setImages: setMoodboardImages
        }
      ) : /* @__PURE__ */ jsxRuntime.jsx(
        MoodboardUploader,
        {
          enabled: moodboardEnabled,
          onEnabledChange: setMoodboardEnabled,
          onImagesChange: setMoodboardImages,
          maxImages: 3,
          value: moodboardImages,
          locale
        }
      ))
    ] })
  ] });
}
function PromptPreview({
  generatedPrompt,
  setGeneratedPrompt,
  randomizePrompt,
  clearAll,
  copyToClipboard: copyToClipboard2,
  copied,
  setActiveTab,
  isEnhancing,
  enhancePrompt: enhancePrompt2,
  locale = "en"
}) {
  const { t } = useTranslation(locale);
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Card, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardHeader, { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.CardTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "w-5 h-5" }),
      t("veo3PromptGenerator.promptPreview.title"),
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Badge,
        {
          variant: "secondary",
          className: "ml-auto text-xs",
          children: t("veo3PromptGenerator.promptPreview.preview")
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardContent, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Textarea,
          {
            value: generatedPrompt,
            onChange: (e) => setGeneratedPrompt(e.target.value),
            placeholder: t("veo3PromptGenerator.promptPreview.placeholder"),
            className: "min-h-[400px] font-mono text-sm resize-none pr-20 bg-background border-border text-foreground"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute top-2 right-2 flex gap-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Button,
            {
              size: "sm",
              variant: "ghost",
              onClick: () => setGeneratedPrompt(""),
              disabled: !generatedPrompt,
              className: "size-8 p-0 hover:bg-background/80",
              title: "Clear text",
              children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Button,
            {
              size: "sm",
              variant: "ghost",
              onClick: () => copyToClipboard2(generatedPrompt),
              disabled: !generatedPrompt,
              className: "size-8 p-0 hover:bg-background/80",
              title: copied ? "Copied!" : "Copy to clipboard",
              children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "size-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsxs(
            ui.Button,
            {
              onClick: randomizePrompt,
              variant: "outline",
              className: "flex-1",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Shuffle, { className: "size-4 mr-2" }),
                t("veo3PromptGenerator.promptPreview.randomizeButton")
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs(
            ui.Button,
            {
              onClick: clearAll,
              variant: "outline",
              className: "flex-1",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "size-4 mr-2" }),
                t("veo3PromptGenerator.promptPreview.clearButton")
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Button,
          {
            onClick: () => {
              setActiveTab("enhance");
              setTimeout(() => {
                if (generatedPrompt && !isEnhancing) {
                  enhancePrompt2();
                }
              }, 100);
            },
            disabled: !generatedPrompt,
            size: "lg",
            className: "w-full h-16 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-200",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sparkles, { className: "size-6 mr-3" }),
              t("veo3PromptGenerator.promptPreview.enhanceButton")
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
function AIEnhancement({
  enhancedPrompt,
  setEnhancedPrompt,
  generatedPrompt,
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
  copyToClipboard: copyToClipboard2,
  locale = "en"
}) {
  const { t } = useTranslation(locale);
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Card, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardHeader, { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.CardTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sparkles, { className: "w-5 h-5 text-purple-600" }),
      t("veo3PromptGenerator.aiEnhancement.title")
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardContent, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          onClick: enhanceWithSelectedFocus,
          disabled: isEnhancing,
          size: "lg",
          className: "w-full h-16 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-200",
          children: isEnhancing ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "w-6 h-6 mr-3 animate-spin" }),
            t("veo3PromptGenerator.aiEnhancement.enhancing")
          ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sparkles, { className: "w-6 h-6 mr-3" }),
            enhancedPrompt.trim() ? t("veo3PromptGenerator.aiEnhancement.enhanceButton") : t("veo3PromptGenerator.aiEnhancement.enhanceButton"),
            selectedFocusTypes.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "ml-2 text-sm opacity-90", children: [
              "(",
              selectedFocusTypes.length,
              " ",
              t("veo3PromptGenerator.aiEnhancement.focus"),
              selectedFocusTypes.length !== 1 ? "es" : "",
              ")"
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Button,
          {
            variant: selectedFocusTypes.includes("character") ? "default" : "outline",
            size: "sm",
            onClick: () => toggleFocusType("character"),
            className: "text-xs",
            children: [
              "\u{1F464} ",
              t("veo3PromptGenerator.aiEnhancement.focusTypes.character")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Button,
          {
            variant: selectedFocusTypes.includes("action") ? "default" : "outline",
            size: "sm",
            onClick: () => toggleFocusType("action"),
            className: "text-xs",
            children: [
              "\u{1F3AC} ",
              t("veo3PromptGenerator.aiEnhancement.focusTypes.action")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Button,
          {
            variant: selectedFocusTypes.includes("cinematic") ? "default" : "outline",
            size: "sm",
            onClick: () => toggleFocusType("cinematic"),
            className: "text-xs",
            children: [
              "\u{1F3A5} ",
              t("veo3PromptGenerator.aiEnhancement.focusTypes.cinematic")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Button,
          {
            variant: includeAudio ? "default" : "outline",
            size: "sm",
            onClick: () => setIncludeAudio(!includeAudio),
            className: `text-xs ${includeAudio ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "bg-blue-50 border-blue-200 hover:bg-blue-100"}`,
            children: [
              "\u{1F50A} ",
              t("veo3PromptGenerator.aiEnhancement.settings.includeAudio")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Button,
          {
            variant: selectedFocusTypes.includes("safe") ? "default" : "outline",
            size: "sm",
            onClick: () => toggleFocusType("safe"),
            className: `text-xs ${selectedFocusTypes.includes("safe") ? "bg-green-600 text-white border-green-600 hover:bg-green-700" : "bg-green-50 border-green-200 hover:bg-green-100"}`,
            children: [
              "\u{1F6E1}\uFE0F ",
              t("veo3PromptGenerator.aiEnhancement.focusTypes.safe")
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border rounded-lg", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Button,
          {
            variant: "ghost",
            onClick: () => setShowSettings(!showSettings),
            className: "w-full justify-between p-3 h-auto",
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Settings, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm", children: t("veo3PromptGenerator.aiEnhancement.settings.title") }),
                /* @__PURE__ */ jsxRuntime.jsxs(
                  ui.Badge,
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
              showSettings ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "w-4 h-4" })
            ]
          }
        ),
        showSettings && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-3 pb-3 space-y-3 border-t", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-muted-foreground", children: t("veo3PromptGenerator.aiEnhancement.settings.characterLimit") }),
              /* @__PURE__ */ jsxRuntime.jsxs(
                ui.Badge,
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
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(
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
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { children: "200" }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { children: "2K" }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { children: "5K" }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { children: "10K" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              customCharacterLimit < 600 && "Concise and focused",
              customCharacterLimit >= 600 && customCharacterLimit < 1500 && "Balanced detail",
              customCharacterLimit >= 1500 && customCharacterLimit < 3e3 && "Rich and detailed",
              customCharacterLimit >= 3e3 && "Extremely detailed"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-muted-foreground", children: t("veo3PromptGenerator.aiEnhancement.settings.model") }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-2 bg-muted rounded text-xs", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "font-medium", children: "GPT-4.1" }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-muted-foreground", children: "Best quality enhancement model" })
            ] })
          ] })
        ] })
      ] }),
      enhanceError && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-3 bg-red-50 border border-red-200 rounded-lg", children: /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-red-600", children: enhanceError }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Textarea,
          {
            value: enhancedPrompt,
            onChange: (e) => setEnhancedPrompt(e.target.value),
            placeholder: "Click 'Enhance with AI' to generate a professional, detailed prompt...",
            className: "min-h-[500px] font-mono text-sm resize-none whitespace-pre-wrap pr-12 bg-background border-border text-foreground"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Button,
          {
            size: "sm",
            variant: "ghost",
            onClick: () => copyToClipboard2(enhancedPrompt),
            disabled: !enhancedPrompt,
            className: "absolute top-2 right-2 h-8 w-8 p-0 hover:bg-background/80",
            title: copied ? "Copied!" : "Copy enhanced prompt",
            children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "w-4 h-4" })
          }
        )
      ] }),
      enhancementInfo && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-3 bg-muted/50 rounded-lg", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between items-center text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            "Model:",
            " ",
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium text-foreground", children: enhancementInfo.modelName || enhancementInfo.model })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            "Length:",
            " ",
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium text-foreground", children: enhancementInfo.length })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            "Characters:",
            " ",
            /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-medium text-foreground", children: [
              enhancementInfo.actualCharacters,
              " /",
              " ",
              enhancementInfo.targetCharacters
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Badge,
            {
              variant: enhancementInfo.actualCharacters <= enhancementInfo.targetCharacters ? "default" : "secondary",
              className: "text-xs",
              children: enhancementInfo.actualCharacters <= enhancementInfo.targetCharacters ? "\u2713 Within limit" : "\u26A0 Over limit"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          onClick: enhanceWithSelectedFocus,
          disabled: isEnhancing,
          size: "lg",
          className: "w-full h-16 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-200",
          children: isEnhancing ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "w-6 h-6 mr-3 animate-spin" }),
            t("veo3PromptGenerator.aiEnhancement.enhancing")
          ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Sparkles, { className: "w-6 h-6 mr-3" }),
            enhancedPrompt.trim() ? t("veo3PromptGenerator.aiEnhancement.enhanceButton") : t("veo3PromptGenerator.aiEnhancement.enhanceButton"),
            selectedFocusTypes.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "ml-2 text-sm opacity-90", children: [
              "(",
              selectedFocusTypes.length,
              " ",
              t("veo3PromptGenerator.aiEnhancement.focus"),
              selectedFocusTypes.length !== 1 ? "es" : "",
              ")"
            ] })
          ] })
        }
      ),
      generatedPrompt.trim() && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-6 p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200/50 dark:border-purple-600/30 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center mb-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2", children: "Ready to Generate Your Video?" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-purple-700 dark:text-purple-300", children: "Your enhanced prompt is ready! Generate a professional VEO3 video for just $1.00" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.StripePaymentButton,
          {
            variant: "video",
            toolSlug: "veo3-prompt-generator",
            toolTitle: "VEO3 Video Generator",
            price: 1,
            apiEndpoint: "/api/stripe-prices",
            checkoutEndpoint: "/api/create-checkout",
            className: "border-0 shadow-none",
            prompt: generatedPrompt
          }
        )
      ] })
    ] }) })
  ] });
}
function PromptHistory({
  promptHistory,
  loadFromHistory,
  clearHistory,
  setActiveTab,
  locale = "en"
}) {
  const { t } = useTranslation(locale);
  return /* @__PURE__ */ jsxRuntime.jsx(ui.Card, { className: "w-full", children: promptHistory.length > 0 ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardHeader, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ui.CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "w-5 h-5" }),
        t("veo3PromptGenerator.promptHistory.title"),
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Badge,
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
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          onClick: clearHistory,
          variant: "ghost",
          size: "sm",
          className: "text-muted-foreground hover:text-destructive",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Trash2, { className: "w-4 h-4" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardContent, { children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: promptHistory.slice(0, 10).map((historyItem) => /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "p-4 border rounded-lg hover:bg-muted/50 transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between items-start mb-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground", children: historyItem.timestamp && typeof historyItem.timestamp === "object" && "toLocaleString" in historyItem.timestamp ? historyItem.timestamp.toLocaleString() : String(historyItem.timestamp) }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
              historyItem.model && /* @__PURE__ */ jsxRuntime.jsx(
                ui.Badge,
                {
                  variant: "outline",
                  className: "text-xs",
                  children: historyItem.model
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Badge,
                {
                  variant: "secondary",
                  className: "text-xs",
                  children: historyItem.length
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm mb-3 line-clamp-3", children: historyItem.basicPrompt && historyItem.basicPrompt.length > 120 ? historyItem.basicPrompt.substring(0, 120) + "..." : historyItem.basicPrompt }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Button,
            {
              onClick: () => loadFromHistory(historyItem),
              variant: "outline",
              size: "sm",
              className: "w-full",
              children: t("veo3PromptGenerator.promptHistory.loadButton")
            }
          )
        ]
      },
      historyItem.id
    )) }) })
  ] }) : /* @__PURE__ */ jsxRuntime.jsxs(ui.CardContent, { className: "flex flex-col items-center justify-center py-12", children: [
    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "w-12 h-12 text-muted-foreground mb-4" }),
    /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-lg font-semibold mb-2", children: t("veo3PromptGenerator.promptHistory.empty") }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground text-center mb-4", children: t("veo3PromptGenerator.promptHistory.empty") }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.Button,
      {
        variant: "outline",
        onClick: () => setActiveTab("builder"),
        children: t("veo3PromptGenerator.promptHistory.loadButton")
      }
    )
  ] }) });
}

// src/veo3-tools/utils/index.ts
var generatePrompt = (data) => {
  const parts = [];
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
var copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};
var getLocaleLanguage = (locale) => {
  if (typeof window === "undefined") return "English";
  if (locale) {
    const localeToLanguage2 = {
      en: "English",
      ru: "Russian",
      es: "Spanish",
      hi: "Hindi",
      tr: "Turkish"
    };
    return localeToLanguage2[locale] || "English";
  }
  const urlLocale = window.location.pathname.split("/")[1];
  const localeToLanguage = {
    en: "English",
    ru: "Russian",
    es: "Spanish",
    hi: "Hindi",
    tr: "Turkish"
  };
  return localeToLanguage[urlLocale] || "English";
};

// src/veo3-tools/constants/index.ts
var PRESET_OPTIONS = {
  styles: [
    "Cinematic",
    "Documentary",
    "Anime",
    "Realistic",
    "Artistic",
    "Vintage",
    "Modern"
  ],
  cameras: [
    "Close-up",
    "Wide shot",
    "Over-the-shoulder",
    "Drone view",
    "Handheld",
    "Static"
  ],
  lighting: [
    "Natural",
    "Golden hour",
    "Blue hour",
    "Dramatic",
    "Soft",
    "Neon",
    "Candlelight"
  ],
  moods: [
    "Peaceful",
    "Energetic",
    "Mysterious",
    "Romantic",
    "Tense",
    "Joyful",
    "Melancholic"
  ],
  languages: [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Russian",
    "Japanese",
    "Chinese"
  ]
};
var DEFAULT_VALUES = {
  CHARACTER_LIMIT: 4e3,
  INCLUDE_AUDIO: true,
  MOODBOARD_ENABLED: true};
function Veo3PromptGenerator({
  enhancePromptFunction,
  MoodboardUploader: MoodboardUploader2,
  showInfoBanner = true,
  className = "",
  locale = "en"
}) {
  const { t } = useTranslation(locale);
  const [promptData, setPromptData] = react.useState({
    scene: "",
    style: "",
    camera: "",
    characters: [{ id: "default", name: "", description: "", speech: "" }],
    action: "",
    lighting: "",
    mood: "",
    language: "English"
  });
  const [generatedPrompt, setGeneratedPrompt] = react.useState("");
  const [enhancedPrompt, setEnhancedPrompt] = react.useState("");
  const [isEnhancing, setIsEnhancing] = react.useState(false);
  const [enhanceError, setEnhanceError] = react.useState("");
  const [customCharacterLimit, setCustomCharacterLimit] = react.useState(
    DEFAULT_VALUES.CHARACTER_LIMIT
  );
  const [selectedModel] = react.useState("gpt-4.1");
  const [promptHistory, setPromptHistory] = react.useState([]);
  const [showSettings, setShowSettings] = react.useState(false);
  const [copied, setCopied] = react.useState(false);
  const [enhancementInfo, setEnhancementInfo] = react.useState(null);
  const [activeTab, setActiveTab] = react.useState("builder");
  const [selectedFocusTypes, setSelectedFocusTypes] = react.useState(["safe"]);
  const [includeAudio, setIncludeAudio] = react.useState(
    DEFAULT_VALUES.INCLUDE_AUDIO
  );
  const [moodboardEnabled, setMoodboardEnabled] = react.useState(
    DEFAULT_VALUES.MOODBOARD_ENABLED
  );
  const [moodboardImages, setMoodboardImages] = react.useState([]);
  react.useEffect(() => {
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
  react.useEffect(() => {
    if (promptHistory.length > 0) {
      localStorage.setItem(
        "veo3-prompt-history",
        JSON.stringify(promptHistory)
      );
    }
  }, [promptHistory]);
  react.useEffect(() => {
    const hasValidCharacter = promptData.characters.some(
      (char) => char.name || char.description
    );
    if (promptData.scene || hasValidCharacter) {
      const prompt = generatePrompt(promptData);
      setGeneratedPrompt(prompt);
    }
  }, [promptData]);
  react.useEffect(() => {
    const defaultLanguage = getLocaleLanguage(locale);
    setPromptData((prev) => ({ ...prev, language: defaultLanguage }));
  }, [locale]);
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
  const enhancePrompt2 = async (focusType) => {
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
        error instanceof Error ? error.message : t("veo3PromptGenerator.aiEnhancement.enhanceError")
      );
    } finally {
      setIsEnhancing(false);
    }
  };
  const enhanceWithSelectedFocus = async () => {
    if (selectedFocusTypes.length === 0) {
      await enhancePrompt2();
    } else {
      await enhancePrompt2(selectedFocusTypes.join(","));
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `w-full max-w-6xl mx-auto ${className}`, children: [
    showInfoBanner && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-6 p-4 bg-gradient-to-r from-green-50/10 to-blue-50/10 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200/20 dark:border-green-600/20 rounded-lg", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-green-100/20 dark:bg-green-900/30 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.BookOpen, { className: "w-4 h-4 text-green-600 dark:text-green-400" }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "font-semibold text-green-900 dark:text-green-100 mb-1", children: t("veo3PromptGenerator.infoBanner.title") }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-green-700 dark:text-green-300 mb-2", children: t("veo3PromptGenerator.infoBanner.description") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      ui.Tabs,
      {
        value: activeTab,
        onValueChange: setActiveTab,
        className: "space-y-6",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs(ui.TabsList, { className: "grid w-full grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.TabsTrigger, { value: "builder", children: t("veo3PromptGenerator.tabs.builder") }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.TabsTrigger, { value: "enhance", children: t("veo3PromptGenerator.tabs.enhance") }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.TabsTrigger, { value: "history", children: [
              t("veo3PromptGenerator.tabs.history"),
              " (",
              promptHistory.length,
              "/10)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.TabsContent, { value: "builder", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
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
                MoodboardUploader: MoodboardUploader2 || void 0,
                locale
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
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
                enhancePrompt: enhancePrompt2,
                locale
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.TabsContent, { value: "enhance", children: /* @__PURE__ */ jsxRuntime.jsx(
            AIEnhancement,
            {
              enhancedPrompt,
              setEnhancedPrompt,
              generatedPrompt,
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
              copyToClipboard: copyToClipboard2,
              locale
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntime.jsx(
            PromptHistory,
            {
              promptHistory,
              loadFromHistory,
              clearHistory,
              setActiveTab,
              locale
            }
          ) })
        ]
      }
    )
  ] });
}

// src/veo3-tools/types/index.ts
var PromptDataType = {};
var MoodboardImageType = {};
var CharacterType = {};
var EnhancementInfoType = {};
var PresetOptionsType = {};
var HistoryItemType = {};
var TextToImageStrategy = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async generate(params) {
    try {
      this.validateParams(params);
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        width: params.width,
        height: params.height,
        steps: params.steps || 20,
        cfg_scale: params.cfgScale || 7.5,
        seed: params.seed || -1,
        model: params.model || "stable-diffusion-xl"
      };
      const response = await this.client.request({
        method: "POST",
        url: "/generation/image",
        data: payload
      });
      return response;
    } catch (error) {
      throw new Error(
        `Text-to-image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }
    if (params.steps && (params.steps < 1 || params.steps > 100)) {
      throw new Error("Steps must be between 1 and 100");
    }
    if (params.cfgScale && (params.cfgScale < 1 || params.cfgScale > 20)) {
      throw new Error("CFG Scale must be between 1 and 20");
    }
  }
};
var textToImageStrategy = new TextToImageStrategy();
var ImageToImageStrategy = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async generate(params) {
    try {
      this.validateParams(params);
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        input_image: params.inputImage,
        width: params.width,
        height: params.height,
        steps: params.steps || 20,
        cfg_scale: params.cfgScale || 7.5,
        seed: params.seed || -1,
        model: params.model || "stable-diffusion-xl",
        strength: params.strength || 0.75,
        denoising_strength: params.denoisingStrength || 0.75
      };
      const response = await this.client.request({
        method: "POST",
        url: "/generation/image-to-image",
        data: payload
      });
      return response;
    } catch (error) {
      throw new Error(
        `Image-to-image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (!params.inputImage) {
      throw new Error("Input image is required");
    }
    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }
    if (params.steps && (params.steps < 1 || params.steps > 100)) {
      throw new Error("Steps must be between 1 and 100");
    }
    if (params.cfgScale && (params.cfgScale < 1 || params.cfgScale > 20)) {
      throw new Error("CFG Scale must be between 1 and 20");
    }
    if (params.strength && (params.strength < 0 || params.strength > 1)) {
      throw new Error("Strength must be between 0 and 1");
    }
    if (params.denoisingStrength && (params.denoisingStrength < 0 || params.denoisingStrength > 1)) {
      throw new Error("Denoising strength must be between 0 and 1");
    }
  }
};
var imageToImageStrategy = new ImageToImageStrategy();
var InpaintingStrategy = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async generate(params) {
    try {
      this.validateParams(params);
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        input_image: params.inputImage,
        mask: params.mask,
        width: params.width,
        height: params.height,
        steps: params.steps || 20,
        cfg_scale: params.cfgScale || 7.5,
        seed: params.seed || -1,
        model: params.model || "stable-diffusion-xl",
        strength: params.strength || 0.75,
        mask_blur: params.maskBlur || 4
      };
      const response = await this.client.request({
        method: "POST",
        url: "/generation/inpainting",
        data: payload
      });
      return response;
    } catch (error) {
      throw new Error(
        `Inpainting generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (!params.inputImage) {
      throw new Error("Input image is required");
    }
    if (!params.mask) {
      throw new Error("Mask is required for inpainting");
    }
    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }
    if (params.steps && (params.steps < 1 || params.steps > 100)) {
      throw new Error("Steps must be between 1 and 100");
    }
    if (params.cfgScale && (params.cfgScale < 1 || params.cfgScale > 20)) {
      throw new Error("CFG Scale must be between 1 and 20");
    }
    if (params.strength && (params.strength < 0 || params.strength > 1)) {
      throw new Error("Strength must be between 0 and 1");
    }
    if (params.maskBlur && (params.maskBlur < 0 || params.maskBlur > 64)) {
      throw new Error("Mask blur must be between 0 and 64");
    }
  }
};
var inpaintingStrategy = new InpaintingStrategy();

// src/image-generation/utils.ts
var DEFAULT_IMAGE_CONFIG = {
  defaultModel: "stable-diffusion-xl",
  maxSteps: 50,
  maxCfgScale: 20,
  supportedResolutions: [
    { width: 512, height: 512 },
    { width: 768, height: 768 },
    { width: 1024, height: 1024 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 }
  ],
  defaultStrength: 0.75
};
var ImageGenerationUtils = class {
  /**
   * Validate if resolution is supported
   */
  static isResolutionSupported(width, height) {
    return DEFAULT_IMAGE_CONFIG.supportedResolutions.some(
      (res) => res.width === width && res.height === height
    );
  }
  /**
   * Get closest supported resolution
   */
  static getClosestResolution(width, height) {
    let closest = DEFAULT_IMAGE_CONFIG.supportedResolutions[0];
    let minDistance = Infinity;
    for (const res of DEFAULT_IMAGE_CONFIG.supportedResolutions) {
      const distance = Math.sqrt(
        Math.pow(res.width - width, 2) + Math.pow(res.height - height, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = res;
      }
    }
    return closest;
  }
  /**
   * Calculate aspect ratio
   */
  static getAspectRatio(width, height) {
    return width / height;
  }
  /**
   * Check if image is square
   */
  static isSquare(width, height) {
    return width === height;
  }
  /**
   * Check if image is portrait
   */
  static isPortrait(width, height) {
    return height > width;
  }
  /**
   * Check if image is landscape
   */
  static isLandscape(width, height) {
    return width > height;
  }
  /**
   * Generate a random seed
   */
  static generateRandomSeed() {
    return Math.floor(Math.random() * 2147483647);
  }
  /**
   * Validate prompt length
   */
  static validatePromptLength(prompt, maxLength = 1e3) {
    return prompt.length <= maxLength;
  }
  /**
   * Sanitize prompt text
   */
  static sanitizePrompt(prompt) {
    return prompt.trim().replace(/\s+/g, " ").replace(/[^\w\s\-.,!?()]/g, "");
  }
  /**
   * Normalize image generation type
   */
  static normalizeImageGenerationType(value) {
    return value === "image-to-image" ? "image-to-image" : "text-to-image";
  }
  /**
   * Ensure non-empty prompt with fallback
   */
  static ensureNonEmptyPrompt(input, fallback) {
    const str = typeof input === "string" ? input.trim() : "";
    return str.length > 0 ? str : fallback;
  }
  /**
   * Select image-to-image model
   */
  static async selectImageToImageModel(rawModelName, getAvailableImageModels, options) {
    const allowInpainting = options?.allowInpainting ?? false;
    const allImageModels = await getAvailableImageModels();
    const allI2I = allImageModels.filter(
      (m) => m.type === "image_to_image"
    );
    const wants = String(rawModelName || "");
    const baseToken = wants.toLowerCase().includes("flux") ? "flux" : wants.split("/").pop()?.split("-")[0] || wants.toLowerCase();
    const candidates = allowInpainting ? allI2I : allI2I.filter((m) => !/inpaint/i.test(String(m.name || "")));
    let pick = candidates.find(
      (m) => String(m.name || "").toLowerCase() === wants.toLowerCase() || String(m.label || "").toLowerCase() === wants.toLowerCase()
    );
    if (!pick && baseToken) {
      pick = candidates.find(
        (m) => String(m.name || "").toLowerCase().includes(baseToken) || String(m.label || "").toLowerCase().includes(baseToken)
      );
    }
    if (!pick && candidates.length > 0) pick = candidates[0];
    return pick?.name || null;
  }
};
var TextToVideoStrategy = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async generate(params) {
    try {
      this.validateParams(params);
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        width: params.width,
        height: params.height,
        duration: params.duration,
        fps: params.fps || 24,
        model: params.model || "veo-2",
        seed: params.seed || -1
      };
      const response = await this.client.request({
        method: "POST",
        url: "/generation/video",
        data: payload
      });
      return response;
    } catch (error) {
      throw new Error(
        `Text-to-video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }
    if (params.duration <= 0 || params.duration > 60) {
      throw new Error("Duration must be between 0 and 60 seconds");
    }
    if (params.fps && (params.fps < 1 || params.fps > 60)) {
      throw new Error("FPS must be between 1 and 60");
    }
  }
};
var textToVideoStrategy = new TextToVideoStrategy();
var VideoToVideoStrategy = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  async generate(params) {
    try {
      this.validateParams(params);
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        input_video: params.inputVideo,
        width: params.width,
        height: params.height,
        duration: params.duration,
        fps: params.fps || 24,
        model: params.model || "veo-2",
        seed: params.seed || -1,
        strength: params.strength || 0.75
      };
      const response = await this.client.request({
        method: "POST",
        url: "/generation/video-to-video",
        data: payload
      });
      return response;
    } catch (error) {
      throw new Error(
        `Video-to-video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (!params.inputVideo) {
      throw new Error("Input video is required");
    }
    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }
    if (params.duration <= 0 || params.duration > 60) {
      throw new Error("Duration must be between 0 and 60 seconds");
    }
    if (params.fps && (params.fps < 1 || params.fps > 60)) {
      throw new Error("FPS must be between 1 and 60");
    }
    if (params.strength && (params.strength < 0 || params.strength > 1)) {
      throw new Error("Strength must be between 0 and 1");
    }
  }
};
var videoToVideoStrategy = new VideoToVideoStrategy();

// src/video-generation/utils.ts
var DEFAULT_VIDEO_CONFIG = {
  defaultModel: "veo-2",
  maxDuration: 60,
  minDuration: 1,
  supportedFps: [24, 25, 30, 60],
  supportedResolutions: [
    { width: 512, height: 512 },
    { width: 768, height: 768 },
    { width: 1024, height: 1024 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 }
  ],
  defaultStrength: 0.75
};
var VideoGenerationUtils = class {
  /**
   * Validate if resolution is supported
   */
  static isResolutionSupported(width, height) {
    return DEFAULT_VIDEO_CONFIG.supportedResolutions.some(
      (res) => res.width === width && res.height === height
    );
  }
  /**
   * Get closest supported resolution
   */
  static getClosestResolution(width, height) {
    let closest = DEFAULT_VIDEO_CONFIG.supportedResolutions[0];
    let minDistance = Infinity;
    for (const res of DEFAULT_VIDEO_CONFIG.supportedResolutions) {
      const distance = Math.sqrt(
        Math.pow(res.width - width, 2) + Math.pow(res.height - height, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = res;
      }
    }
    return closest;
  }
  /**
   * Validate duration
   */
  static validateDuration(duration) {
    return duration >= DEFAULT_VIDEO_CONFIG.minDuration && duration <= DEFAULT_VIDEO_CONFIG.maxDuration;
  }
  /**
   * Validate FPS
   */
  static validateFps(fps) {
    return DEFAULT_VIDEO_CONFIG.supportedFps.includes(fps);
  }
  /**
   * Get closest supported FPS
   */
  static getClosestFps(fps) {
    let closest = DEFAULT_VIDEO_CONFIG.supportedFps[0];
    let minDistance = Infinity;
    for (const supportedFps of DEFAULT_VIDEO_CONFIG.supportedFps) {
      const distance = Math.abs(supportedFps - fps);
      if (distance < minDistance) {
        minDistance = distance;
        closest = supportedFps;
      }
    }
    return closest;
  }
  /**
   * Calculate video file size estimate
   */
  static estimateFileSize(width, height, duration, fps) {
    const pixelsPerFrame = width * height;
    const totalFrames = duration * fps;
    return pixelsPerFrame * totalFrames;
  }
};
var _PromptEnhancer = class _PromptEnhancer {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  /**
   * Enhance a prompt using AI
   */
  async enhancePrompt(params) {
    try {
      this.validateParams(params);
      const enhancementRequest = {
        prompt: params.prompt,
        style: params.style || "professional",
        language: params.language || "en",
        targetModel: params.targetModel || "image",
        length: params.length || "medium",
        includeExamples: params.includeExamples || false
      };
      const response = await this.client.request({
        method: "POST",
        url: "/ai/enhance-prompt",
        data: enhancementRequest
      });
      const metadata = {
        language: params.language || "en",
        style: params.style || "professional",
        length: params.length || "medium",
        targetModel: params.targetModel || "image",
        wordCount: this.countWords(response.enhancedPrompt),
        estimatedTokens: this.estimateTokens(response.enhancedPrompt)
      };
      return {
        original: params.prompt,
        enhanced: response.enhancedPrompt,
        suggestions: response.suggestions,
        confidence: response.confidence,
        metadata
      };
    } catch (error) {
      throw new Error(
        `Prompt enhancement failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Get available prompt styles
   */
  getPromptStyles() {
    return _PromptEnhancer.DEFAULT_STYLES;
  }
  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return _PromptEnhancer.SUPPORTED_LANGUAGES;
  }
  /**
   * Get style by ID
   */
  getStyleById(styleId) {
    return _PromptEnhancer.DEFAULT_STYLES.find((style) => style.id === styleId);
  }
  /**
   * Get language by code
   */
  getLanguageByCode(code) {
    return _PromptEnhancer.SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  }
  /**
   * Validate enhancement parameters
   */
  validateParams(params) {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }
    if (params.prompt.length > 1e3) {
      throw new Error("Prompt is too long (max 1000 characters)");
    }
    if (params.style && !this.getStyleById(params.style)) {
      throw new Error(`Invalid style: ${params.style}`);
    }
    if (params.language && !this.getLanguageByCode(params.language)) {
      throw new Error(`Unsupported language: ${params.language}`);
    }
  }
  /**
   * Count words in text
   */
  countWords(text) {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }
  /**
   * Estimate token count (rough approximation)
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }
};
// Default prompt styles
_PromptEnhancer.DEFAULT_STYLES = [
  {
    id: "professional",
    name: "Professional",
    description: "Formal, business-like language with clear structure",
    examples: [
      "A high-quality, professional photograph of a modern office space",
      "A sophisticated, elegant design suitable for corporate use"
    ],
    keywords: ["professional", "business", "corporate", "formal", "sophisticated"]
  },
  {
    id: "creative",
    name: "Creative",
    description: "Artistic, imaginative language with vivid descriptions",
    examples: [
      "A whimsical, dreamlike scene with vibrant colors and magical elements",
      "An artistic masterpiece with bold brushstrokes and dramatic lighting"
    ],
    keywords: ["creative", "artistic", "imaginative", "vibrant", "dramatic"]
  },
  {
    id: "technical",
    name: "Technical",
    description: "Precise, detailed language with specific parameters",
    examples: [
      "A technical diagram with precise measurements and clear labeling",
      "A schematic illustration with detailed specifications and annotations"
    ],
    keywords: ["technical", "precise", "detailed", "specific", "accurate"]
  },
  {
    id: "casual",
    name: "Casual",
    description: "Relaxed, friendly language with natural expressions",
    examples: [
      "A cozy, relaxed scene that feels warm and inviting",
      "A friendly, approachable design with a welcoming atmosphere"
    ],
    keywords: ["casual", "friendly", "relaxed", "warm", "inviting"]
  }
];
// Supported languages
_PromptEnhancer.SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", supported: true },
  { code: "es", name: "Spanish", nativeName: "Espa\xF1ol", supported: true },
  { code: "fr", name: "French", nativeName: "Fran\xE7ais", supported: true },
  { code: "de", name: "German", nativeName: "Deutsch", supported: true },
  { code: "it", name: "Italian", nativeName: "Italiano", supported: true },
  { code: "pt", name: "Portuguese", nativeName: "Portugu\xEAs", supported: true },
  { code: "ru", name: "Russian", nativeName: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", supported: true },
  { code: "ja", name: "Japanese", nativeName: "\u65E5\u672C\u8A9E", supported: true },
  { code: "ko", name: "Korean", nativeName: "\uD55C\uAD6D\uC5B4", supported: true },
  { code: "zh", name: "Chinese", nativeName: "\u4E2D\u6587", supported: true }
];
var PromptEnhancer = _PromptEnhancer;

// src/ai-tools/prompt-enhancement-tool.ts
var enhancePrompt = (config) => ({
  description: "Enhance and improve prompts for better AI generation results",
  parameters: {
    originalPrompt: { type: "string", description: "The original prompt text to enhance" },
    mediaType: { type: "string", enum: ["image", "video", "text", "general"], optional: true },
    enhancementLevel: { type: "string", enum: ["basic", "detailed", "creative"], optional: true },
    targetAudience: { type: "string", optional: true },
    includeNegativePrompt: { type: "boolean", optional: true },
    modelHint: { type: "string", optional: true }
  },
  execute: async (params) => {
    try {
      const enhancer = new PromptEnhancer();
      const result = await enhancer.enhancePrompt(params);
      return result;
    } catch (error) {
      throw new Error(`Prompt enhancement failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
});
var _ScriptGenerator = class _ScriptGenerator {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  /**
   * Generate a script using AI
   */
  async generateScript(params) {
    try {
      this.validateParams(params);
      const generationRequest = {
        topic: params.topic,
        genre: params.genre || "educational",
        length: params.length || "medium",
        format: params.format || "markdown",
        targetAudience: params.targetAudience || "general",
        tone: params.tone || "informative",
        includeDialogue: params.includeDialogue || false,
        includeStageDirections: params.includeStageDirections || false
      };
      const response = await this.client.request({
        method: "POST",
        url: "/ai/generate-script",
        data: generationRequest
      });
      const id = this.generateId();
      const generatedScript = {
        id,
        topic: params.topic,
        script: response.script,
        outline: this.parseOutline(response.outline),
        metadata: this.parseMetadata(response.metadata, params),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "draft"
      };
      return generatedScript;
    } catch (error) {
      throw new Error(
        `Script generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Get available script templates
   */
  getScriptTemplates() {
    return _ScriptGenerator.DEFAULT_TEMPLATES;
  }
  /**
   * Get template by ID
   */
  getTemplateById(templateId) {
    return _ScriptGenerator.DEFAULT_TEMPLATES.find((template) => template.id === templateId);
  }
  /**
   * Get templates by genre
   */
  getTemplatesByGenre(genre) {
    return _ScriptGenerator.DEFAULT_TEMPLATES.filter(
      (template) => template.genre.includes(genre)
    );
  }
  /**
   * Get templates suitable for target audience
   */
  getTemplatesByAudience(audience) {
    return _ScriptGenerator.DEFAULT_TEMPLATES.filter(
      (template) => template.suitableFor.includes(audience)
    );
  }
  /**
   * Validate generation parameters
   */
  validateParams(params) {
    if (!params.topic || params.topic.trim().length === 0) {
      throw new Error("Topic is required");
    }
    if (params.topic.length > 500) {
      throw new Error("Topic is too long (max 500 characters)");
    }
    if (params.genre && !this.isValidGenre(params.genre)) {
      throw new Error(`Invalid genre: ${params.genre}`);
    }
    if (params.length && !this.isValidLength(params.length)) {
      throw new Error(`Invalid length: ${params.length}`);
    }
    if (params.format && !this.isValidFormat(params.format)) {
      throw new Error(`Invalid format: ${params.format}`);
    }
  }
  /**
   * Check if genre is valid
   */
  isValidGenre(genre) {
    const validGenres = ["drama", "comedy", "action", "romance", "thriller", "documentary", "educational"];
    return validGenres.includes(genre);
  }
  /**
   * Check if length is valid
   */
  isValidLength(length) {
    const validLengths = ["short", "medium", "long"];
    return validLengths.includes(length);
  }
  /**
   * Check if format is valid
   */
  isValidFormat(format) {
    const validFormats = ["markdown", "plain", "structured", "screenplay"];
    return validFormats.includes(format);
  }
  /**
   * Parse outline from API response
   */
  parseOutline(outlineData) {
    return outlineData.map((item, index) => ({
      section: item.section || `Section ${index + 1}`,
      title: item.title || `Title ${index + 1}`,
      description: item.description || "",
      duration: item.duration,
      keyPoints: Array.isArray(item.keyPoints) ? item.keyPoints : []
    }));
  }
  /**
   * Parse metadata from API response and params
   */
  parseMetadata(metadataData, params) {
    return {
      genre: params.genre || "educational",
      estimatedDuration: metadataData.estimatedDuration || "5-10 minutes",
      scenes: metadataData.scenes || 3,
      characters: metadataData.characters || 2,
      wordCount: this.countWords(metadataData.script || ""),
      targetAudience: params.targetAudience || "general",
      tone: params.tone || "informative",
      format: params.format || "markdown",
      language: "en"
    };
  }
  /**
   * Generate unique ID
   */
  generateId() {
    return `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Count words in text
   */
  countWords(text) {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }
};
// Default script templates
_ScriptGenerator.DEFAULT_TEMPLATES = [
  {
    id: "educational",
    name: "Educational Script",
    description: "Structured format for educational content",
    structure: ["Introduction", "Main Content", "Examples", "Summary", "Quiz/Questions"],
    examples: ["Science lesson", "History documentary", "Tutorial video"],
    genre: ["educational", "documentary"],
    suitableFor: ["children", "teens", "adults"]
  },
  {
    id: "storytelling",
    name: "Storytelling Script",
    description: "Narrative format for engaging stories",
    structure: ["Hook", "Setup", "Conflict", "Rising Action", "Climax", "Resolution"],
    examples: ["Fairy tale", "Adventure story", "Mystery tale"],
    genre: ["drama", "adventure", "mystery"],
    suitableFor: ["children", "teens", "adults"]
  },
  {
    id: "commercial",
    name: "Commercial Script",
    description: "Persuasive format for marketing content",
    structure: ["Attention", "Interest", "Desire", "Action"],
    examples: ["Product advertisement", "Service promotion", "Brand story"],
    genre: ["commercial", "marketing"],
    suitableFor: ["teens", "adults"]
  }
];
var ScriptGenerator = _ScriptGenerator;

// src/ai-tools/script-generation-tool.ts
var configureScriptGeneration = (config) => ({
  description: "Generate scripts for various content types (educational, storytelling, commercial)",
  parameters: {
    topic: { type: "string", description: "The main topic or theme for the script" },
    genre: { type: "string", enum: ["educational", "storytelling", "commercial"], optional: true },
    length: { type: "string", enum: ["short", "medium", "long"], optional: true },
    format: { type: "string", enum: ["markdown", "plain", "structured"], optional: true },
    targetAudience: { type: "string", optional: true },
    tone: { type: "string", optional: true },
    includeDialogue: { type: "boolean", optional: true },
    includeStageDirections: { type: "boolean", optional: true }
  },
  execute: async (params) => {
    try {
      const generator = new ScriptGenerator();
      const result = await generator.generateScript(params);
      return result;
    } catch (error) {
      throw new Error(`Script generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
});

// src/ai-tools/video-models-tools.ts
var tool = (config) => config;
async function getAvailableVideoModels() {
  return [];
}
var listVideoModels = tool({
  description: "List all available video generation models from SuperDuperAI API with their capabilities, pricing, and requirements. Use this to see what models are available before generating videos.",
  parameters: {
    format: {
      type: "string",
      enum: ["detailed", "simple", "agent-friendly"],
      optional: true,
      description: "Format of the output: detailed (full info), simple (names only), agent-friendly (formatted for AI agents)"
    },
    filterByPrice: {
      type: "number",
      optional: true,
      description: "Filter models by maximum price per second"
    },
    filterByDuration: {
      type: "number",
      optional: true,
      description: "Filter models that support this duration in seconds"
    },
    excludeVip: {
      type: "boolean",
      optional: true,
      description: "Exclude VIP-only models"
    }
  },
  execute: async ({
    format = "agent-friendly",
    filterByPrice,
    filterByDuration,
    excludeVip
  }) => {
    try {
      console.log(
        "\u{1F3AC} \u{1F4CB} Listing video models from SuperDuperAI with format:",
        format
      );
      const allModels = await getAvailableVideoModels();
      let videoModels = allModels.map((m) => m);
      if (filterByPrice) {
        videoModels = videoModels.filter(
          (m) => (m.params.price_per_second || m.params.price || 0) <= filterByPrice
        );
      }
      if (filterByDuration) {
        videoModels = videoModels.filter(
          (m) => (m.params.max_duration || m.params.available_durations?.[0] || 60) >= filterByDuration
        );
      }
      if (excludeVip) {
        videoModels = videoModels.filter((m) => !m.params.is_vip);
      }
      if (format === "agent-friendly") {
        const agentInfo = {
          models: videoModels.map((m) => ({
            id: m.name,
            // Use name as id
            name: m.name,
            description: m.label || m.name,
            price_per_second: m.params.price_per_second || m.params.price || 0,
            max_duration: m.params.max_duration || 60,
            vip_required: m.params.is_vip || false,
            supported_resolutions: `${m.params.max_width || 1920}x${m.params.max_height || 1080}`,
            frame_rates: m.params.frame_rates || [24, 30],
            aspect_ratios: m.params.aspect_ratios || ["16:9"]
          })),
          usage_examples: [
            'Use model ID like "comfyui/ltx" when calling configureVideoGeneration',
            "Check max_duration before setting video duration",
            "Consider price_per_second for cost optimization"
          ],
          total: videoModels.length
        };
        return {
          success: true,
          data: agentInfo,
          message: `Found ${videoModels.length} video models from SuperDuperAI API`
        };
      }
      if (format === "simple") {
        const simpleList = videoModels.map((m) => ({
          id: m.name,
          name: m.name,
          price: m.params.price_per_second || m.params.price || 0,
          max_duration: m.params.max_duration || 60,
          vip: m.params.is_vip || false
        }));
        return {
          success: true,
          data: simpleList,
          total: simpleList.length,
          message: `Found ${simpleList.length} video models`
        };
      }
      const detailedList = videoModels.map((m) => ({
        id: m.name,
        name: m.name,
        description: m.label || m.name,
        price_per_second: m.params.price_per_second || m.params.price || 0,
        max_duration: m.params.max_duration || 60,
        max_resolution: {
          width: m.params.max_width || 1920,
          height: m.params.max_height || 1080
        },
        supported_frame_rates: m.params.frame_rates || [24, 30],
        supported_aspect_ratios: m.params.aspect_ratios || ["16:9"],
        supported_qualities: m.params.qualities || ["hd"],
        vip_required: m.params.is_vip || false,
        workflow_path: m.params.workflow_path || ""
      }));
      return {
        success: true,
        data: detailedList,
        total: detailedList.length,
        message: `Found ${detailedList.length} video models with detailed information`,
        filters_applied: {
          max_price: filterByPrice,
          duration: filterByDuration,
          exclude_vip: excludeVip
        }
      };
    } catch (error) {
      console.error("\u{1F3AC} \u274C Error listing video models:", error);
      return {
        success: false,
        error: error?.message || "Failed to list video models from SuperDuperAI API",
        message: "Could not retrieve video models. Please check SUPERDUPERAI_TOKEN and SUPERDUPERAI_URL environment variables."
      };
    }
  }
});
var findBestVideoModel = tool({
  description: "Find the best video model from SuperDuperAI based on specific requirements like price, duration, and VIP access. Use this to automatically select the optimal model for your needs.",
  parameters: {
    maxPrice: {
      type: "number",
      optional: true,
      description: "Maximum price per second you want to pay"
    },
    preferredDuration: {
      type: "number",
      optional: true,
      description: "Preferred video duration in seconds"
    },
    vipAllowed: {
      type: "boolean",
      optional: true,
      description: "Whether VIP models are allowed (default: true)"
    },
    prioritizeQuality: {
      type: "boolean",
      optional: true,
      description: "Prioritize quality over price (default: false)"
    }
  },
  execute: async ({
    maxPrice,
    preferredDuration,
    vipAllowed = true,
    prioritizeQuality = false
  }) => {
    try {
      console.log("\u{1F3AC} \u{1F50D} Finding best video model with criteria:", {
        maxPrice,
        preferredDuration,
        vipAllowed,
        prioritizeQuality
      });
      const allModels = await getAvailableVideoModels();
      let candidates = allModels.map((m) => m);
      if (maxPrice) {
        candidates = candidates.filter(
          (m) => (m.params.price_per_second || m.params.price || 0) <= maxPrice
        );
      }
      if (preferredDuration) {
        candidates = candidates.filter(
          (m) => (m.params.max_duration || 60) >= preferredDuration
        );
      }
      if (!vipAllowed) {
        candidates = candidates.filter((m) => !m.params.is_vip);
      }
      if (candidates.length === 0) {
        return {
          success: false,
          message: "No video model found matching your criteria",
          suggestion: "Try relaxing your requirements (higher price limit, allow VIP models, etc.)",
          available_models: allModels.map((m) => ({
            id: m.name,
            name: m.name,
            price: m.params.price_per_second || m.params.price || 0,
            max_duration: m.params.max_duration || 60,
            vip: m.params.is_vip || false
          }))
        };
      }
      let bestModel;
      if (prioritizeQuality) {
        bestModel = candidates.sort(
          (a, b) => (b.params.price_per_second || b.params.price || 0) - (a.params.price_per_second || a.params.price || 0)
        )[0];
      } else {
        bestModel = candidates.sort(
          (a, b) => (a.params.price_per_second || a.params.price || 0) - (b.params.price_per_second || b.params.price || 0)
        )[0];
      }
      return {
        success: true,
        data: {
          id: bestModel.name,
          name: bestModel.name,
          description: bestModel.label || bestModel.name,
          price_per_second: bestModel.params.price_per_second || bestModel.params.price || 0,
          max_duration: bestModel.params.max_duration || 60,
          max_resolution: {
            width: bestModel.params.max_width || 1920,
            height: bestModel.params.max_height || 1080
          },
          vip_required: bestModel.params.is_vip || false,
          recommendation_reason: `Selected based on ${prioritizeQuality ? "quality" : "price"} optimization`
        },
        message: `Best model found: ${bestModel.name} at $${bestModel.params.price_per_second || bestModel.params.price || 0}/sec`,
        usage_tip: `Use model ID "${bestModel.name}" when calling configureVideoGeneration`
      };
    } catch (error) {
      console.error("\u{1F3AC} \u274C Error finding best video model:", error);
      return {
        success: false,
        error: error?.message || "Failed to find best video model",
        message: "Could not find optimal video model. Please check SuperDuperAI API connection."
      };
    }
  }
});

// src/ai-tools/video-generation-tools.ts
var tool2 = (config) => config;
async function getStyles() {
  return { items: [] };
}
function findStyle(style, styles) {
  return styles.find((s) => s.id === style || s.label === style);
}
async function createVideoMediaSettings() {
  return { availableModels: [] };
}
async function getBestVideoModel(params) {
  return null;
}
var VIDEO_RESOLUTIONS = [];
var SHOT_SIZES = [];
var VIDEO_FRAME_RATES = [];
var DEFAULT_VIDEO_RESOLUTION = { label: "HD" };
var DEFAULT_VIDEO_DURATION = 5;
function getModelCompatibleResolutions(modelName) {
  return VIDEO_RESOLUTIONS;
}
function getDefaultResolutionForModel(modelName) {
  return DEFAULT_VIDEO_RESOLUTION;
}
async function checkBalanceBeforeArtifact(session, operation, operationType, multipliers, operationDisplayName) {
  return { valid: true, cost: 0 };
}
function getOperationDisplayName(operationType) {
  return operationType;
}
function convertSourceToEnum(source) {
  switch (source) {
    case "local":
      return "local" /* LOCAL */;
    case "fal_ai":
      return "fal_ai" /* FAL_AI */;
    case "google_cloud":
      return "google_cloud" /* GOOGLE_CLOUD */;
    case "azure_openai_sora":
      return "azure_openai_sora" /* AZURE_OPENAI_SORA */;
    case "azure_openai_image":
      return "azure_openai_image" /* AZURE_OPENAI_IMAGE */;
    default:
      return "local" /* LOCAL */;
  }
}
function convertTypeToEnum(type) {
  switch (type) {
    case "text_to_video":
      return "text_to_video" /* TEXT_TO_VIDEO */;
    case "image_to_video":
      return "image_to_video" /* IMAGE_TO_VIDEO */;
    case "text_to_image":
      return "text_to_image" /* TEXT_TO_IMAGE */;
    case "image_to_image":
      return "image_to_image" /* IMAGE_TO_IMAGE */;
    default:
      return "text_to_video" /* TEXT_TO_VIDEO */;
  }
}
var configureVideoGeneration = (params) => tool2({
  description: "Configure video generation settings or generate a video directly if prompt is provided. When prompt is provided, this will create a video artifact that shows generation progress in real-time. Available models are loaded dynamically from SuperDuperAI API.",
  parameters: {
    prompt: {
      type: "string",
      optional: true,
      description: "Detailed description of the video to generate. If provided, will immediately create video artifact and start generation"
    },
    negativePrompt: {
      type: "string",
      optional: true,
      description: "What to avoid in the video generation"
    },
    style: {
      type: "string",
      optional: true,
      description: "Style of the video"
    },
    resolution: {
      type: "string",
      optional: true,
      description: 'Video resolution (e.g., "1344x768", "1024x1024"). Default is HD 1344x768 for cost efficiency.'
    },
    shotSize: {
      type: "string",
      optional: true,
      description: "Shot size for the video (extreme-long-shot, long-shot, medium-shot, medium-close-up, close-up, extreme-close-up, two-shot, detail-shot)"
    },
    model: {
      type: "string",
      optional: true,
      description: 'AI model to use. Models are loaded dynamically from SuperDuperAI API. Use model name like "LTX" or full model ID. For image-to-video models (VEO, KLING), a source image is required.'
    },
    frameRate: {
      type: "number",
      optional: true,
      description: "Frame rate in FPS (24, 30, 60, 120)"
    },
    duration: {
      type: "number",
      optional: true,
      description: "Video duration in seconds. Default is 5 seconds for cost efficiency."
    },
    sourceImageId: {
      type: "string",
      optional: true,
      description: "ID of source image for image-to-video models (VEO, KLING). Required for image-to-video generation."
    },
    sourceImageUrl: {
      type: "string",
      optional: true,
      description: "URL of source image for image-to-video models. Alternative to sourceImageId."
    },
    generationType: {
      type: "string",
      enum: ["text-to-video", "image-to-video"],
      optional: true,
      description: 'Generation mode: "text-to-video" for text prompts only, "image-to-video" when using source image'
    }
  },
  execute: async ({
    prompt,
    negativePrompt,
    style,
    resolution,
    shotSize,
    model,
    frameRate,
    duration,
    sourceImageId,
    sourceImageUrl,
    generationType
  }) => {
    console.log("\u{1F527} configureVideoGeneration called with:", {
      prompt,
      negativePrompt,
      style,
      resolution,
      shotSize,
      model,
      frameRate,
      duration
    });
    console.log("\u{1F527} createDocument available:", !!params?.createDocument);
    const defaultResolution = DEFAULT_VIDEO_RESOLUTION;
    const defaultStyle = {
      id: "flux_steampunk",
      label: "Steampunk",
      description: "Steampunk style"
    };
    const defaultShotSize = SHOT_SIZES.find((s) => s.id === "long-shot") || SHOT_SIZES[0];
    console.log(
      "\u{1F3AC} Loading video models from SuperDuperAI API via factory..."
    );
    const videoSettings = await createVideoMediaSettings();
    const availableModels = videoSettings.availableModels;
    console.log(
      "\u{1F3AC} \u2705 Loaded video models:",
      availableModels.map((m) => m.id)
    );
    const bestModel = await getBestVideoModel();
    const defaultModel = bestModel ? {
      ...bestModel,
      id: bestModel.name,
      label: bestModel.label || bestModel.name,
      description: `${bestModel.label || bestModel.name} - ${bestModel.type}`,
      value: bestModel.name,
      workflowPath: bestModel.params?.workflow_path || "",
      price: bestModel.params?.price_per_second || bestModel.price || 0,
      type: convertTypeToEnum(bestModel.type),
      source: convertSourceToEnum(bestModel.source)
    } : availableModels.find((m) => m.name === "azure-openai/sora") || availableModels[0];
    console.log(
      "\u{1F3AF} Smart default model selected:",
      defaultModel.label,
      "(type:",
      defaultModel.type,
      ")"
    );
    let styles = [];
    try {
      const response = await getStyles();
      if ("error" in response) {
        console.error(response.error);
      } else {
        styles = response.items.map((style2) => ({
          id: style2.name,
          label: style2.title ?? style2.name,
          description: style2.title ?? style2.name
        }));
      }
    } catch (err) {
      console.log(err);
    }
    if (!prompt) {
      console.log(
        "\u{1F527} No prompt provided, returning video configuration panel"
      );
      const config = {
        type: "video-generation-settings",
        availableResolutions: getModelCompatibleResolutions(
          defaultModel.name || defaultModel.id || ""
        ),
        availableStyles: styles,
        availableShotSizes: SHOT_SIZES,
        availableModels,
        availableFrameRates: VIDEO_FRAME_RATES,
        defaultSettings: {
          resolution: getDefaultResolutionForModel(
            defaultModel.name || defaultModel.id || ""
          ),
          style: defaultStyle,
          shotSize: defaultShotSize,
          model: defaultModel,
          frameRate: 30,
          duration: DEFAULT_VIDEO_DURATION,
          // 5 seconds for economy
          negativePrompt: "",
          seed: void 0
        }
      };
      return config;
    }
    console.log("\u{1F527} \u2705 PROMPT PROVIDED, CREATING VIDEO DOCUMENT:", prompt);
    console.log("\u{1F527} \u2705 PARAMS OBJECT:", !!params);
    console.log("\u{1F527} \u2705 CREATE DOCUMENT AVAILABLE:", !!params?.createDocument);
    if (!params?.createDocument) {
      console.log(
        "\u{1F527} \u274C createDocument not available, returning basic config"
      );
      const config = {
        type: "video-generation-settings",
        availableResolutions: getModelCompatibleResolutions(
          defaultModel.name || defaultModel.id || ""
        ),
        availableStyles: styles,
        availableShotSizes: SHOT_SIZES,
        availableModels,
        availableFrameRates: VIDEO_FRAME_RATES,
        defaultSettings: {
          resolution: getDefaultResolutionForModel(
            defaultModel.name || defaultModel.id || ""
          ),
          style: defaultStyle,
          shotSize: defaultShotSize,
          model: defaultModel,
          frameRate: frameRate || 30,
          duration: duration || DEFAULT_VIDEO_DURATION,
          negativePrompt: negativePrompt || "",
          seed: void 0
        }
      };
      return config;
    }
    try {
      const selectedModel = model ? availableModels.find(
        (m) => m.label === model || m.id === model || m.apiName === model
      ) || defaultModel : defaultModel;
      const compatibleResolutions = getModelCompatibleResolutions(
        selectedModel.name || selectedModel.id || ""
      );
      let selectedResolution = defaultResolution;
      if (resolution) {
        const requestedResolution = VIDEO_RESOLUTIONS.find(
          (r) => r.label === resolution
        );
        if (requestedResolution) {
          const isCompatible = compatibleResolutions.some(
            (r) => r.label === requestedResolution.label
          );
          if (isCompatible) {
            selectedResolution = requestedResolution;
          } else {
            selectedResolution = getDefaultResolutionForModel(
              selectedModel.name || selectedModel.id || ""
            );
            console.log(
              `\u{1F527} \u26A0\uFE0F Resolution ${resolution} not compatible with model ${selectedModel.name}, using ${selectedResolution.label} instead`
            );
          }
        }
      } else {
        selectedResolution = getDefaultResolutionForModel(
          selectedModel.name || selectedModel.id || ""
        );
      }
      let selectedStyle = defaultStyle;
      if (style) {
        const foundStyle = findStyle(style, styles);
        if (foundStyle) {
          selectedStyle = foundStyle;
          console.log(
            "\u{1F527} \u2705 STYLE MATCHED:",
            style,
            "->",
            selectedStyle.label
          );
        } else {
          console.log(
            "\u{1F527} \u26A0\uFE0F STYLE NOT FOUND:",
            style,
            "using default:",
            defaultStyle.label
          );
          console.log(
            "\u{1F527} \u{1F4CB} Available styles:",
            styles.map((s) => s.label).slice(0, 5).join(", "),
            "..."
          );
          const commonStyleFallbacks = [
            "flux_steampunk",
            "steampunk",
            "flux_realistic",
            "realistic",
            "flux_cinematic",
            "cinematic",
            "flux_anime",
            "anime",
            "flux_fantasy",
            "fantasy",
            "default"
          ];
          for (const fallbackId of commonStyleFallbacks) {
            const fallbackStyle = styles.find(
              (s) => s.id.toLowerCase().includes(fallbackId.toLowerCase()) || s.label.toLowerCase().includes(fallbackId.toLowerCase())
            );
            if (fallbackStyle) {
              selectedStyle = fallbackStyle;
              console.log(
                "\u{1F527} \u{1F504} FALLBACK STYLE FOUND:",
                fallbackId,
                "->",
                selectedStyle.label
              );
              break;
            }
          }
          if (selectedStyle === defaultStyle && styles.length > 0) {
            selectedStyle = styles[0];
            console.log(
              "\u{1F527} \u{1F504} USING FIRST AVAILABLE STYLE:",
              selectedStyle.label
            );
          }
        }
      } else {
        const preferredDefaults = [
          "flux_steampunk",
          "steampunk",
          "flux_realistic",
          "realistic"
        ];
        for (const preferredId of preferredDefaults) {
          const preferredStyle = styles.find(
            (s) => s.id.toLowerCase().includes(preferredId.toLowerCase()) || s.label.toLowerCase().includes(preferredId.toLowerCase())
          );
          if (preferredStyle) {
            selectedStyle = preferredStyle;
            console.log(
              "\u{1F527} \u{1F3AF} USING PREFERRED DEFAULT STYLE:",
              preferredStyle.label
            );
            break;
          }
        }
        if (selectedStyle === defaultStyle && styles.length > 0) {
          selectedStyle = styles[0];
          console.log(
            "\u{1F527} \u{1F3AF} USING FIRST AVAILABLE AS DEFAULT:",
            selectedStyle.label
          );
        }
      }
      const selectedShotSize = shotSize ? SHOT_SIZES.find((s) => s.label === shotSize || s.id === shotSize) || defaultShotSize : defaultShotSize;
      const isImageToVideoModel = selectedModel.type === "image_to_video";
      console.log("\u{1F527} \u{1F3AF} Model type check:", {
        modelId: selectedModel.id,
        modelName: selectedModel.label,
        apiType: selectedModel.type,
        isImageToVideo: isImageToVideoModel
      });
      if (isImageToVideoModel && !sourceImageId && !sourceImageUrl) {
        return {
          error: `The selected model "${selectedModel.label}" is an image-to-video model and requires a source image. Please provide either sourceImageId or sourceImageUrl parameter, or select a text-to-video model.`,
          suggestion: "You can use a recently generated image from this chat as the source, or upload a new image first.",
          availableTextToVideoModels: availableModels.filter(
            (m) => m.type === "text_to_video" || m.type !== "image_to_video"
          ).map((m) => `${m.label} (${m.id})`)
        };
      }
      const autoGenerationType = sourceImageId || sourceImageUrl ? "image-to-video" : "text-to-video";
      const finalGenerationType = generationType || autoGenerationType;
      console.log("\u{1F527} \u{1F3AF} Generation type determination:", {
        provided: generationType,
        autoDetected: autoGenerationType,
        final: finalGenerationType,
        hasSourceImage: !!(sourceImageId || sourceImageUrl)
      });
      const videoParams = {
        prompt,
        negativePrompt: negativePrompt || "",
        style: selectedStyle,
        resolution: selectedResolution,
        shotSize: selectedShotSize,
        model: selectedModel,
        frameRate: frameRate || 30,
        duration: duration || DEFAULT_VIDEO_DURATION,
        // Use economical default
        sourceImageId: sourceImageId || void 0,
        sourceImageUrl: sourceImageUrl || void 0,
        generationType: finalGenerationType
      };
      console.log("\u{1F527} \u2705 CREATING VIDEO DOCUMENT WITH PARAMS:", videoParams);
      const operationType = finalGenerationType === "image-to-video" ? "image-to-video" : "text-to-video";
      const multipliers = [];
      if (duration) {
        if (duration <= 5) multipliers.push("duration-5s");
        else if (duration <= 10) multipliers.push("duration-10s");
        else if (duration <= 15) multipliers.push("duration-15s");
        else if (duration <= 30) multipliers.push("duration-30s");
      } else {
        multipliers.push("duration-5s");
      }
      if (selectedResolution.label.includes("HD") || selectedResolution.label.includes("720")) {
        multipliers.push("hd-quality");
      } else if (selectedResolution.label.includes("4K") || selectedResolution.label.includes("2160")) {
        multipliers.push("4k-quality");
      }
      const balanceCheck = await checkBalanceBeforeArtifact(
        params?.session || null,
        "video-generation",
        operationType,
        multipliers,
        getOperationDisplayName(operationType)
      );
      if (!balanceCheck.valid) {
        console.log("\u{1F527} \u274C INSUFFICIENT BALANCE, NOT CREATING ARTIFACT");
        return {
          error: balanceCheck.userMessage || "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u0434\u043B\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0432\u0438\u0434\u0435\u043E",
          balanceError: true,
          requiredCredits: balanceCheck.cost
        };
      }
      if (params?.createDocument) {
        console.log("\u{1F527} \u2705 CALLING CREATE DOCUMENT WITH KIND: video");
        try {
          const readableTitle2 = `Video: "${prompt}" ${JSON.stringify(videoParams)}`;
          const result = await params.createDocument.execute({
            title: readableTitle2,
            kind: "video"
          });
          console.log("\u{1F527} \u2705 CREATE DOCUMENT RESULT:", result);
          return {
            ...result,
            message: `I'm creating a video with description: "${prompt}". Using economical HD settings (${selectedResolution.label}, ${duration || DEFAULT_VIDEO_DURATION}s) for cost efficiency. Artifact created and generation started.`
          };
        } catch (error) {
          console.error("\u{1F527} \u274C CREATE DOCUMENT ERROR:", error);
          console.error(
            "\u{1F527} \u274C ERROR STACK:",
            error instanceof Error ? error.stack : "No stack"
          );
          throw error;
        }
      }
      console.log("\u{1F527} \u274C CREATE DOCUMENT NOT AVAILABLE, RETURNING FALLBACK");
      const readableTitle = `Video: "${prompt}" ${JSON.stringify(videoParams)}`;
      return {
        message: `I'll create a video with description: "${prompt}". However, artifact cannot be created - createDocument unavailable.`,
        parameters: {
          title: readableTitle,
          kind: "video"
        }
      };
    } catch (error) {
      console.error("\u{1F527} \u274C ERROR CREATING VIDEO DOCUMENT:", error);
      return {
        error: `Failed to create video document: ${error.message}`,
        fallbackConfig: {
          type: "video-generation-settings",
          availableResolutions: getModelCompatibleResolutions(
            defaultModel.name || defaultModel.id || ""
          ),
          availableStyles: styles,
          availableShotSizes: SHOT_SIZES,
          availableModels,
          availableFrameRates: VIDEO_FRAME_RATES,
          defaultSettings: {
            resolution: getDefaultResolutionForModel(
              defaultModel.name || defaultModel.id || ""
            ),
            style: defaultStyle,
            shotSize: defaultShotSize,
            model: defaultModel,
            frameRate: frameRate || 30,
            duration: duration || DEFAULT_VIDEO_DURATION,
            negativePrompt: negativePrompt || "",
            seed: void 0
          }
        }
      };
    }
  }
});

// src/ai-tools/image-generation-tools.ts
var tool3 = (config) => config;
var getImageGenerationConfig = async () => {
  return {
    availableModels: [],
    availableResolutions: [],
    availableStyles: []
  };
};
var checkBalanceBeforeArtifact2 = async (session, operation) => {
  return { hasBalance: true };
};
var getOperationDisplayName2 = (operation) => {
  return operation;
};
var configureImageGeneration = (params) => tool3({
  description: "Configure image generation settings or generate an image directly if prompt is provided. Supports text-to-image by default, and image-to-image when a sourceImageUrl is provided. When triggered, creates an image artifact that shows generation progress in real-time.",
  parameters: {
    prompt: {
      type: "string",
      optional: true,
      description: "Detailed description of the image to generate. If provided, will immediately create image artifact and start generation"
    },
    sourceImageUrl: {
      type: "string",
      optional: true,
      description: "Optional source image URL for image-to-image generation (e.g., when the user uploaded an image in chat). If provided, the system will run image-to-image."
    },
    style: {
      type: "string",
      optional: true,
      description: 'Style of the image. Supports many formats: "realistic", "cinematic", "anime", "cartoon", "sketch", "painting", "steampunk", "fantasy", "sci-fi", "horror", "minimalist", "abstract", "portrait", "landscape", and many more available styles'
    },
    resolution: {
      type: "string",
      optional: true,
      description: 'Image resolution. Accepts various formats: "1920x1080", "1920\xD71080", "1920 x 1080", "full hd", "fhd", "1080p", "square", "vertical", "horizontal", etc.'
    },
    shotSize: {
      type: "string",
      optional: true,
      description: 'Shot size/camera angle. Accepts: "close-up", "medium-shot", "long-shot", "extreme-close-up", "portrait", "two-shot", etc.'
    },
    model: {
      type: "string",
      optional: true,
      description: 'AI model to use. Models are loaded dynamically from SuperDuperAI API. Use model name like "FLUX" or full model ID.'
    },
    seed: {
      type: "number",
      optional: true,
      description: "Seed for reproducible results"
    },
    batchSize: {
      type: "number",
      optional: true,
      min: 1,
      max: 3,
      description: "Number of images to generate simultaneously (1-3). Higher batch sizes generate multiple variations at once."
    }
  },
  execute: async ({
    prompt,
    sourceImageUrl,
    style,
    resolution,
    shotSize,
    model,
    seed,
    batchSize
  }) => {
    console.log("\u{1F527} configureImageGeneration called with:", {
      prompt,
      style,
      resolution,
      shotSize,
      model,
      seed,
      batchSize
    });
    console.log("\u{1F5BC}\uFE0F Loading image configuration from OpenAPI factory...");
    const config = await getImageGenerationConfig();
    console.log("\u{1F5BC}\uFE0F \u2705 Loaded image config:", {
      modelsCount: config.availableModels.length,
      resolutionsCount: config.availableResolutions.length,
      stylesCount: config.availableStyles.length
    });
    if (!prompt) {
      console.log("\u{1F5BC}\uFE0F No prompt provided, returning configuration panel");
      return {
        type: "configuration_panel",
        message: "Image generation configuration panel opened. Please provide a prompt to generate an image.",
        config: {
          availableModels: config.availableModels,
          availableResolutions: config.availableResolutions,
          availableStyles: config.availableStyles
        }
      };
    }
    if (params?.session) {
      const balanceCheck = await checkBalanceBeforeArtifact2(
        params.session);
      if (!balanceCheck.hasBalance) {
        return {
          error: "Insufficient balance for image generation",
          operation: getOperationDisplayName2("image_generation")
        };
      }
    }
    console.log("\u{1F5BC}\uFE0F Creating image artifact and starting generation...");
    return {
      type: "image_generation_started",
      message: "Image generation started successfully",
      prompt,
      sourceImageUrl,
      style,
      resolution,
      shotSize,
      model,
      seed,
      batchSize,
      artifactId: "placeholder-artifact-id"
    };
  }
});

// src/ai-tools/tools.ts
var tool4 = (config) => config;
var generateUUID = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
var getDocumentById = async ({
  id
}) => {
  return null;
};
var saveSuggestions = async ({
  suggestions
}) => {
};
var documentHandlersByArtifactKind = [
  // This should be imported from the actual application
];
var artifactKinds = ["text", "sheet", "image", "video", "script"];
var createDocument = ({ session, dataStream }) => tool4({
  description: "Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.",
  parameters: {
    title: { type: "string" },
    kind: { type: "string", enum: artifactKinds },
    content: { type: "string", optional: true }
  },
  execute: async ({
    title,
    kind,
    content
  }) => {
    console.log("\u{1F4C4} ===== CREATE DOCUMENT TOOL CALLED =====");
    console.log("\u{1F4C4} KIND:", kind);
    console.log("\u{1F4C4} TITLE (first 100 chars):", title.substring(0, 100));
    console.log("\u{1F4C4} CONTENT provided:", content ? "Yes" : "No");
    console.log("\u{1F4C4} CONTENT length:", content?.length || 0);
    const id = generateUUID();
    console.log("\u{1F4C4} GENERATED ID:", id);
    console.log("\u{1F4C4} \u2705 WRITING KIND TO DATA STREAM...");
    dataStream.writeData({
      type: "kind",
      content: kind
    });
    console.log("\u{1F4C4} \u2705 WRITING ID TO DATA STREAM...");
    dataStream.writeData({
      type: "id",
      content: id
    });
    console.log("\u{1F4C4} \u2705 WRITING TITLE TO DATA STREAM...");
    dataStream.writeData({
      type: "title",
      content: title
    });
    console.log("\u{1F4C4} \u2705 WRITING CLEAR TO DATA STREAM...");
    dataStream.writeData({
      type: "clear",
      content: ""
    });
    console.log("\u{1F4C4} \u{1F50D} LOOKING FOR DOCUMENT HANDLER FOR KIND:", kind);
    console.log(
      "\u{1F4C4} \u{1F4CB} AVAILABLE HANDLERS:",
      documentHandlersByArtifactKind.map((h) => h.kind)
    );
    const documentHandler = documentHandlersByArtifactKind.find(
      (documentHandlerByArtifactKind) => documentHandlerByArtifactKind.kind === kind
    );
    if (!documentHandler) {
      console.error("\u{1F4C4} \u274C NO DOCUMENT HANDLER FOUND FOR KIND:", kind);
      throw new Error(`No document handler found for kind: ${kind}`);
    }
    console.log("\u{1F4C4} \u2705 FOUND DOCUMENT HANDLER, CALLING onCreateDocument...");
    try {
      await documentHandler.onCreateDocument({
        id,
        title,
        content,
        dataStream,
        session
      });
      console.log("\u{1F4C4} \u2705 DOCUMENT HANDLER COMPLETED SUCCESSFULLY");
    } catch (error) {
      console.error("\u{1F4C4} \u274C DOCUMENT HANDLER ERROR:", error);
      console.error(
        "\u{1F4C4} \u274C ERROR STACK:",
        error instanceof Error ? error.stack : "No stack"
      );
      throw error;
    }
    console.log("\u{1F4C4} \u2705 WRITING FINISH TO DATA STREAM...");
    dataStream.writeData({ type: "finish", content: "" });
    const result = {
      id,
      title,
      kind,
      content: "Document created successfully"
    };
    console.log("\u{1F4C4} \u2705 FINAL RESULT:", result);
    return result;
  }
});
var updateDocument = ({ session, dataStream }) => tool4({
  description: "Update a document with the given description.",
  parameters: {
    id: { type: "string", description: "The ID of the document to update" },
    description: {
      type: "string",
      description: "The description of changes that need to be made"
    }
  },
  execute: async ({
    id,
    description
  }) => {
    const document2 = await getDocumentById({ id });
    if (!document2) {
      return {
        error: "Document not found"
      };
    }
    dataStream.writeData({
      type: "clear",
      content: document2.title
    });
    const documentHandler = documentHandlersByArtifactKind.find(
      (documentHandlerByArtifactKind) => documentHandlerByArtifactKind.kind === document2.kind
    );
    if (!documentHandler) {
      throw new Error(`No document handler found for kind: ${document2.kind}`);
    }
    await documentHandler.onUpdateDocument({
      document: document2,
      description,
      dataStream,
      session
    });
    dataStream.writeData({ type: "finish", content: "" });
    return {
      id,
      title: document2.title,
      kind: document2.kind,
      content: "The document has been updated successfully."
    };
  }
});
var requestSuggestions = ({
  session,
  dataStream
}) => tool4({
  description: "Request suggestions for a document",
  parameters: {
    documentId: {
      type: "string",
      description: "The ID of the document to request edits"
    }
  },
  execute: async ({ documentId }) => {
    const document2 = await getDocumentById({ id: documentId });
    if (!document2 || !document2.content) {
      return {
        error: "Document not found"
      };
    }
    const suggestions = [];
    const mockSuggestions = [
      {
        originalText: "This is a sample sentence.",
        suggestedText: "This is an improved sample sentence.",
        description: "Enhanced clarity and flow",
        id: generateUUID(),
        documentId,
        isResolved: false
      }
    ];
    for (const suggestion of mockSuggestions) {
      dataStream.writeData({
        type: "suggestion",
        content: suggestion
      });
      suggestions.push(suggestion);
    }
    if (session.user?.id) {
      const userId = session.user.id;
      await saveSuggestions({
        suggestions: suggestions.map((suggestion) => ({
          ...suggestion,
          userId,
          createdAt: /* @__PURE__ */ new Date(),
          documentCreatedAt: document2.createdAt
        }))
      });
    }
    return {
      id: documentId,
      title: document2.title,
      kind: document2.kind,
      message: "Suggestions have been added to the document"
    };
  }
});
var enhancePromptSchema = zod.z.object({
  originalPrompt: zod.z.string().describe("The original prompt text that needs enhancement. Can be in any language, simple or complex."),
  mediaType: zod.z.enum(["image", "video", "text", "general"]).optional().describe("The type of content being generated. Helps optimize the prompt for specific AI models."),
  enhancementLevel: zod.z.enum(["basic", "detailed", "creative"]).optional().describe("Level of enhancement: basic (translation + cleanup), detailed (add structure + quality terms), creative (add artistic style + composition details)"),
  targetAudience: zod.z.string().optional().describe('Target audience or use case (e.g., "professional presentation", "social media", "artistic portfolio")'),
  includeNegativePrompt: zod.z.boolean().optional().describe("Whether to generate a negative prompt for what to avoid (useful for image/video generation)"),
  modelHint: zod.z.string().optional().describe('Specific AI model being used (e.g., "FLUX", "Sora", "VEO2") to optimize prompt for that model')
});
var PromptEnhancementTool = class {
  constructor() {
    this.client = api.superDuperAIClient;
  }
  /**
   * Enhance a prompt using AI
   */
  async enhancePrompt(params) {
    try {
      const validatedParams = enhancePromptSchema.parse(params);
      const enhancementRequest = {
        originalPrompt: validatedParams.originalPrompt,
        mediaType: validatedParams.mediaType || "general",
        enhancementLevel: validatedParams.enhancementLevel || "detailed",
        targetAudience: validatedParams.targetAudience,
        includeNegativePrompt: validatedParams.includeNegativePrompt || false,
        modelHint: validatedParams.modelHint
      };
      const response = await this.client.request({
        method: "POST",
        url: "/ai/enhance-prompt",
        data: enhancementRequest
      });
      return {
        originalPrompt: validatedParams.originalPrompt,
        enhancedPrompt: response.enhancedPrompt,
        negativePrompt: response.negativePrompt,
        mediaType: validatedParams.mediaType || "general",
        enhancementLevel: validatedParams.enhancementLevel || "detailed",
        modelHint: validatedParams.modelHint,
        improvements: response.improvements || [],
        reasoning: response.reasoning || "",
        usage: {
          copyPrompt: "Copy the enhanced prompt to use in image/video generation tools",
          negativePrompt: response.negativePrompt ? "Use the negative prompt to avoid unwanted elements" : void 0
        }
      };
    } catch (error) {
      throw new Error(
        `Prompt enhancement failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Build system prompt for enhancement
   */
  buildSystemPrompt(mediaType, enhancementLevel, modelHint) {
    const basePrompt = `You are a professional prompt engineering expert specializing in improving prompts for AI generation. Your task is to enhance user prompts to achieve the best possible results.

CORE RESPONSIBILITIES:
1. Translate non-English text to English while preserving meaning and intent
2. Apply prompt engineering best practices (specificity, clarity, quality keywords)
3. Optimize for the target media type and AI model
4. Structure prompts for maximum effectiveness

ENHANCEMENT PRINCIPLES:
- Keep the original creative intent intact
- Add relevant technical terms and quality descriptors
- Optimize for the specific AI model if provided
- Consider the target media type requirements
- Maintain natural, readable language`;
    const mediaSpecific = this.getMediaSpecificInstructions(mediaType);
    const levelSpecific = this.getLevelSpecificInstructions(enhancementLevel);
    const modelSpecific = modelHint ? this.getModelSpecificInstructions(modelHint) : "";
    return `${basePrompt}

${mediaSpecific}

${levelSpecific}

${modelSpecific}

RESPONSE FORMAT:
Return a JSON object with:
- enhancedPrompt: The improved prompt
- negativePrompt: What to avoid (if requested)
- improvements: List of specific improvements made
- reasoning: Brief explanation of changes`;
  }
  /**
   * Get media-specific enhancement instructions
   */
  getMediaSpecificInstructions(mediaType) {
    switch (mediaType) {
      case "image":
        return `IMAGE GENERATION OPTIMIZATION:
- Add visual descriptors (lighting, composition, style, mood)
- Include technical parameters (resolution, aspect ratio, quality)
- Specify artistic style and technique
- Add environmental and atmospheric details`;
      case "video":
        return `VIDEO GENERATION OPTIMIZATION:
- Include motion and temporal elements
- Specify camera angles and movement
- Add scene composition and pacing
- Include audio and visual effects considerations`;
      case "text":
        return `TEXT GENERATION OPTIMIZATION:
- Add structure and organization elements
- Specify tone, style, and voice
- Include context and audience considerations
- Add formatting and presentation details`;
      default:
        return `GENERAL OPTIMIZATION:
- Focus on clarity and specificity
- Add relevant context and details
- Optimize for general AI model understanding`;
    }
  }
  /**
   * Get level-specific enhancement instructions
   */
  getLevelSpecificInstructions(level) {
    switch (level) {
      case "basic":
        return `BASIC ENHANCEMENT:
- Translate to English if needed
- Clean up grammar and spelling
- Add basic quality descriptors
- Maintain simplicity and clarity`;
      case "detailed":
        return `DETAILED ENHANCEMENT:
- Add comprehensive visual/contextual details
- Include technical specifications
- Optimize for professional results
- Balance detail with readability`;
      case "creative":
        return `CREATIVE ENHANCEMENT:
- Add artistic and stylistic elements
- Include mood and atmosphere details
- Enhance creative expression
- Add inspirational and evocative language`;
      default:
        return `STANDARD ENHANCEMENT:
- Apply balanced improvements
- Focus on clarity and effectiveness
- Maintain original intent`;
    }
  }
  /**
   * Get model-specific optimization instructions
   */
  getModelSpecificInstructions(model) {
    const modelLower = model.toLowerCase();
    if (modelLower.includes("flux")) {
      return `FLUX MODEL OPTIMIZATION:
- Focus on artistic and creative elements
- Include style and technique specifications
- Optimize for visual quality and composition
- Add relevant artistic terminology`;
    } else if (modelLower.includes("veo") || modelLower.includes("sora")) {
      return `VIDEO MODEL OPTIMIZATION:
- Emphasize motion and temporal elements
- Include scene composition details
- Add camera and cinematography elements
- Specify visual effects and transitions`;
    } else if (modelLower.includes("dalle") || modelLower.includes("midjourney")) {
      return `IMAGE MODEL OPTIMIZATION:
- Focus on visual composition and style
- Include artistic and technical details
- Add quality and resolution specifications
- Optimize for visual impact`;
    }
    return `GENERAL MODEL OPTIMIZATION:
- Apply standard prompt engineering practices
- Focus on clarity and specificity
- Optimize for general AI understanding`;
  }
};
var promptEnhancementTool = new PromptEnhancementTool();
var iconMap = {
  image: lucideReact.ImageIcon,
  video: lucideReact.VideoIcon,
  wand: lucideReact.Wand2Icon,
  sparkles: lucideReact.SparklesIcon,
  zap: lucideReact.ZapIcon,
  play: lucideReact.PlayIcon,
  languages: lucideReact.LanguagesIcon,
  gallery: lucideReact.ImagesIcon
};
var ToolIcon = ({ name, className }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    console.warn(`Unknown icon name: ${name}`);
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(IconComponent, { className: ui.cn("size-4", className) });
};
var ToolsGrid = ({ tools, className }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: `grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${className || ""}`,
      children: tools.map((tool5) => /* @__PURE__ */ jsxRuntime.jsx(
        Link__default.default,
        {
          href: tool5.href,
          children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Card, { className: "hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group", children: [
            /* @__PURE__ */ jsxRuntime.jsxs(ui.CardHeader, { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntime.jsx(
                "div",
                {
                  className: `p-4 rounded-full bg-${tool5.bgColor} group-hover:bg-${tool5.hoverBgColor} transition-colors`,
                  children: /* @__PURE__ */ jsxRuntime.jsx(
                    ToolIcon,
                    {
                      name: tool5.iconName,
                      className: `size-8 text-${tool5.primaryColor}`
                    }
                  )
                }
              ) }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.CardTitle, { className: "text-2xl", children: tool5.name }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.CardDescription, { className: "text-base", children: tool5.description })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.CardContent, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-center space-x-6 text-sm text-muted-foreground", children: tool5.features.map((feature, index) => /* @__PURE__ */ jsxRuntime.jsxs(
                "div",
                {
                  className: "flex items-center space-x-2",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ToolIcon, { name: feature.iconName }),
                    /* @__PURE__ */ jsxRuntime.jsx("span", { children: feature.label })
                  ]
                },
                index
              )) }),
              /* @__PURE__ */ jsxRuntime.jsxs(
                ui.Button,
                {
                  className: `w-full group-hover:bg-${tool5.hoverColor}`,
                  size: "lg",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ToolIcon,
                      {
                        name: tool5.iconName,
                        className: "size-4 mr-2"
                      }
                    ),
                    tool5.id === "image-generator" ? "Generate Images" : tool5.id === "video-generator" ? "Generate Videos" : "Enhance Prompts"
                  ]
                }
              )
            ] }) })
          ] })
        },
        tool5.id
      ))
    }
  );
};

// src/ai-tools/config/tools-config.ts
var TOOLS_CONFIG = [
  {
    id: "image-generator",
    name: "Image Generator",
    description: "Generate high-quality images using AI models like FLUX Pro, FLUX Dev, and more from SuperDuperAI",
    shortDescription: "AI Image Generator",
    iconName: "image",
    href: "/tools/image-generator",
    category: "generation",
    features: [
      { iconName: "sparkles", label: "Professional Quality" },
      { iconName: "zap", label: "Real-time Progress" }
    ],
    primaryColor: "blue-600",
    hoverColor: "blue-600",
    bgColor: "blue-100",
    hoverBgColor: "blue-200"
  },
  {
    id: "video-generator",
    name: "Video Generator",
    description: "Generate high-quality videos using AI models like VEO3, KLING, LTX, and more from SuperDuperAI",
    shortDescription: "AI Video Generator",
    iconName: "video",
    href: "/tools/video-generator",
    category: "generation",
    features: [
      { iconName: "play", label: "Professional Quality" },
      { iconName: "zap", label: "Real-time Progress" }
    ],
    primaryColor: "purple-600",
    hoverColor: "purple-600",
    bgColor: "purple-100",
    hoverBgColor: "purple-200"
  },
  {
    id: "prompt-enhancer",
    name: "Prompt Enhancer",
    description: "Transform simple prompts into detailed, professional descriptions for better AI generation results",
    shortDescription: "AI Prompt Enhancer",
    iconName: "wand",
    href: "/tools/prompt-enhancer",
    category: "enhancement",
    features: [
      { iconName: "languages", label: "Auto Translation" },
      { iconName: "sparkles", label: "Smart Enhancement" }
    ],
    primaryColor: "pink-600",
    hoverColor: "pink-600",
    bgColor: "pink-100",
    hoverBgColor: "pink-200"
  },
  {
    id: "prompt-enhancer-veo3",
    name: "Prompt Enhancer Veo3",
    description: "Transform simple prompts into detailed, professional descriptions for better AI generation results",
    shortDescription: "AI Prompt Enhancer VEO3",
    iconName: "wand",
    href: "/tools/prompt-enhancer-veo3",
    category: "enhancement",
    features: [
      { iconName: "languages", label: "Auto Translation" },
      { iconName: "sparkles", label: "Smart Enhancement" }
    ],
    primaryColor: "pink-600",
    hoverColor: "pink-600",
    bgColor: "pink-100",
    hoverBgColor: "pink-200"
  },
  {
    id: "script-generator",
    name: "Script Generator",
    description: "Generate detailed scripts and scenarios in Markdown format using AI. Edit and refine your script with a powerful Markdown editor.",
    shortDescription: "AI Script Generator",
    iconName: "wand",
    href: "/tools/script-generator",
    category: "generation",
    features: [
      { iconName: "sparkles", label: "Markdown Output" },
      { iconName: "sparkles", label: "Script Structuring" }
    ],
    primaryColor: "green-600",
    hoverColor: "green-600",
    bgColor: "green-100",
    hoverBgColor: "green-200"
  },
  {
    id: "gallery",
    name: "Artifact Gallery",
    description: "Browse and discover AI-generated images, videos, text documents, and spreadsheets. View your own creations or explore public artifacts from the community.",
    shortDescription: "Artifacts",
    iconName: "image",
    href: "/gallery",
    category: "gallery",
    features: [
      { iconName: "sparkles", label: "All Artifact Types" },
      { iconName: "zap", label: "Advanced Search & Filters" }
    ],
    primaryColor: "indigo-600",
    hoverColor: "indigo-600",
    bgColor: "indigo-100",
    hoverBgColor: "indigo-200"
  }
];
var getToolById = (id) => {
  return TOOLS_CONFIG.find((tool5) => tool5.id === id);
};
var getToolByHref = (href) => {
  return TOOLS_CONFIG.find((tool5) => tool5.href === href);
};
var getToolsByCategory = (category) => {
  return TOOLS_CONFIG.filter((tool5) => tool5.category === category);
};
var getToolNavigation = () => {
  return TOOLS_CONFIG.map((tool5) => ({
    id: tool5.id,
    name: tool5.name,
    shortName: tool5.shortDescription || tool5.name,
    iconName: tool5.iconName,
    href: tool5.href
  }));
};
var getToolDisplayName = (pathname) => {
  const tool5 = TOOLS_CONFIG.find((tool6) => pathname.includes(tool6.href));
  return tool5?.name || "Unknown Tool";
};
var ToolsPage = ({
  title = "AI Tools",
  description = "Powerful AI-powered tools for generating high-quality images, videos, and enhancing your prompts. Choose the tool that fits your creative needs.",
  className = ""
}) => {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: `min-h-screen bg-background ${className}`, children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-w-4xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", children: title }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolsGrid,
      {
        tools: TOOLS_CONFIG,
        className: "mt-12"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-center text-sm text-muted-foreground border-t pt-8 mt-12", children: /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
      "Powered by ",
      /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "SuperDuperAI" }),
      " \u2022 State-of-the-art AI models for creative content generation \u2022 Fast, reliable, and high-quality results"
    ] }) })
  ] }) }) });
};
function useImageGenerator(options = {}) {
  const [isGenerating, setIsGenerating] = react.useState(false);
  const [generatedImages, setGeneratedImages] = react.useState([]);
  const [currentGeneration, setCurrentGeneration] = react.useState(null);
  const [generationStatus, setGenerationStatus] = react.useState({
    status: "idle",
    message: ""
  });
  const generateImage = react.useCallback(
    async (params) => {
      if (!options.onGenerate) {
        console.warn("No onGenerate function provided to useImageGenerator");
        return;
      }
      try {
        setIsGenerating(true);
        setGenerationStatus({
          status: "generating",
          message: "Starting image generation...",
          progress: 0
        });
        const image = await options.onGenerate(params);
        setCurrentGeneration(image);
        setGeneratedImages((prev) => [image, ...prev]);
        setGenerationStatus({
          status: "completed",
          message: "Image generation completed!",
          progress: 100
        });
        options.onSuccess?.(image);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Image generation failed";
        setGenerationStatus({
          status: "error",
          message: errorMessage,
          error: errorMessage
        });
        options.onError?.(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );
  const clearCurrentGeneration = react.useCallback(() => {
    setCurrentGeneration(null);
    setGenerationStatus({
      status: "idle",
      message: ""
    });
  }, []);
  const deleteImage = react.useCallback((imageId) => {
    setGeneratedImages((prev) => prev.filter((img) => img.id !== imageId));
  }, []);
  const clearAllImages = react.useCallback(() => {
    setGeneratedImages([]);
  }, []);
  const downloadImage = react.useCallback(async (image) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  }, []);
  const copyImageUrl = react.useCallback(async (image) => {
    try {
      await navigator.clipboard.writeText(image.imageUrl);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  }, []);
  return {
    isGenerating,
    generationStatus,
    generatedImages,
    currentGeneration,
    generateImage,
    clearCurrentGeneration,
    deleteImage,
    clearAllImages,
    downloadImage,
    copyImageUrl
  };
}
function useVideoGenerator(options = {}) {
  const [isGenerating, setIsGenerating] = react.useState(false);
  const [generatedVideos, setGeneratedVideos] = react.useState([]);
  const [currentGeneration, setCurrentGeneration] = react.useState(null);
  const [generationStatus, setGenerationStatus] = react.useState({
    status: "idle",
    message: ""
  });
  const generateVideo = react.useCallback(
    async (params) => {
      if (!options.onGenerate) {
        console.warn("No onGenerate function provided to useVideoGenerator");
        return;
      }
      try {
        setIsGenerating(true);
        setGenerationStatus({
          status: "generating",
          message: "Starting video generation...",
          progress: 0
        });
        const video = await options.onGenerate(params);
        setCurrentGeneration(video);
        setGeneratedVideos((prev) => [video, ...prev]);
        setGenerationStatus({
          status: "completed",
          message: "Video generation completed!",
          progress: 100
        });
        options.onSuccess?.(video);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Video generation failed";
        setGenerationStatus({
          status: "error",
          message: errorMessage,
          error: errorMessage
        });
        options.onError?.(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );
  const clearCurrentGeneration = react.useCallback(() => {
    setCurrentGeneration(null);
    setGenerationStatus({
      status: "idle",
      message: ""
    });
  }, []);
  const deleteVideo = react.useCallback((videoId) => {
    setGeneratedVideos((prev) => prev.filter((video) => video.id !== videoId));
  }, []);
  const clearAllVideos = react.useCallback(() => {
    setGeneratedVideos([]);
  }, []);
  const downloadVideo = react.useCallback(async (video) => {
    try {
      const response = await fetch(video.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `video-${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download video:", error);
    }
  }, []);
  const copyVideoUrl = react.useCallback(async (video) => {
    try {
      await navigator.clipboard.writeText(video.videoUrl);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  }, []);
  return {
    isGenerating,
    generationStatus,
    generatedVideos,
    currentGeneration,
    generateVideo,
    clearCurrentGeneration,
    deleteVideo,
    clearAllVideos,
    downloadVideo,
    copyVideoUrl
  };
}
function usePromptEnhancer(options = {}) {
  const [isEnhancing, setIsEnhancing] = react.useState(false);
  const [enhancedPrompts, setEnhancedPrompts] = react.useState([]);
  const [currentEnhanced, setCurrentEnhanced] = react.useState(null);
  const enhancePrompt2 = react.useCallback(
    async (params) => {
      if (!options.onEnhance) {
        console.warn("No onEnhance function provided to usePromptEnhancer");
        return;
      }
      try {
        setIsEnhancing(true);
        const enhanced = await options.onEnhance(params);
        const enhancedPrompt = {
          id: Date.now().toString(),
          original: params.originalPrompt,
          enhanced,
          mediaType: params.mediaType || "general",
          enhancementLevel: params.enhancementLevel || "detailed",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        setCurrentEnhanced(enhanced);
        setEnhancedPrompts((prev) => [enhancedPrompt, ...prev]);
        options.onSuccess?.(enhanced);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Prompt enhancement failed";
        options.onError?.(errorMessage);
      } finally {
        setIsEnhancing(false);
      }
    },
    [options]
  );
  const clearCurrent = react.useCallback(() => {
    setCurrentEnhanced(null);
  }, []);
  const deleteEnhanced = react.useCallback((id) => {
    setEnhancedPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
  }, []);
  const clearAll = react.useCallback(() => {
    setEnhancedPrompts([]);
    setCurrentEnhanced(null);
  }, []);
  const copyEnhanced = react.useCallback(async (enhancedPrompt) => {
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
    } catch (error) {
      console.error("Failed to copy enhanced prompt:", error);
    }
  }, []);
  return {
    isEnhancing,
    enhancedPrompts,
    currentEnhanced,
    enhancePrompt: enhancePrompt2,
    clearCurrent,
    deleteEnhanced,
    clearAll,
    copyEnhanced
  };
}

exports.CharacterType = CharacterType;
exports.DEFAULT_IMAGE_CONFIG = DEFAULT_IMAGE_CONFIG;
exports.DEFAULT_VIDEO_CONFIG = DEFAULT_VIDEO_CONFIG;
exports.EnhancementInfoType = EnhancementInfoType;
exports.HistoryItemType = HistoryItemType;
exports.ImageGenerationUtils = ImageGenerationUtils;
exports.ImageToImageStrategy = ImageToImageStrategy;
exports.InpaintingStrategy = InpaintingStrategy;
exports.MoodboardImageType = MoodboardImageType;
exports.PresetOptionsType = PresetOptionsType;
exports.PromptDataType = PromptDataType;
exports.PromptEnhancementTool = PromptEnhancementTool;
exports.TOOLS_CONFIG = TOOLS_CONFIG;
exports.TextToImageStrategy = TextToImageStrategy;
exports.TextToVideoStrategy = TextToVideoStrategy;
exports.ToolIcon = ToolIcon;
exports.ToolsGrid = ToolsGrid;
exports.ToolsPage = ToolsPage;
exports.Veo3PromptGenerator = Veo3PromptGenerator;
exports.VideoGenerationUtils = VideoGenerationUtils;
exports.VideoToVideoStrategy = VideoToVideoStrategy;
exports.configureImageGeneration = configureImageGeneration;
exports.configureScriptGeneration = configureScriptGeneration;
exports.configureVideoGeneration = configureVideoGeneration;
exports.createDocument = createDocument;
exports.defaultLocale = defaultLocale;
exports.en = en_default;
exports.enhancePrompt = enhancePrompt;
exports.enhancePromptSchema = enhancePromptSchema;
exports.es = es_default;
exports.findBestVideoModel = findBestVideoModel;
exports.getToolByHref = getToolByHref;
exports.getToolById = getToolById;
exports.getToolDisplayName = getToolDisplayName;
exports.getToolNavigation = getToolNavigation;
exports.getToolsByCategory = getToolsByCategory;
exports.hi = hi_default;
exports.imageToImageStrategy = imageToImageStrategy;
exports.inpaintingStrategy = inpaintingStrategy;
exports.listVideoModels = listVideoModels;
exports.locales = locales;
exports.promptEnhancementTool = promptEnhancementTool;
exports.requestSuggestions = requestSuggestions;
exports.ru = ru_default;
exports.textToImageStrategy = textToImageStrategy;
exports.textToVideoStrategy = textToVideoStrategy;
exports.tr = tr_default;
exports.updateDocument = updateDocument;
exports.useImageGenerator = useImageGenerator;
exports.usePromptEnhancer = usePromptEnhancer;
exports.useTranslation = useTranslation;
exports.useVideoGenerator = useVideoGenerator;
exports.videoToVideoStrategy = videoToVideoStrategy;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map