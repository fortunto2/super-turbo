'use strict';

var react = require('react');
var ui = require('@turbo-super/ui');
var lucideReact = require('lucide-react');
var jsxRuntime = require('react/jsx-runtime');
var api = require('@turbo-super/api');
var remotion = require('remotion');
var player = require('@remotion/player');
var fabric = require('fabric');
var fabricGuidelinePlugin = require('@superduperai/fabric-guideline-plugin');
var superTimeline = require('super-timeline');
var fade = require('@remotion/transitions/fade');
var transitions = require('@remotion/transitions');
require('super-timeline/style.css');

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
  enhancePrompt,
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
                  enhancePrompt();
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
  showPaymentButton = true,
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
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-muted-foreground", children: t(
                "veo3PromptGenerator.aiEnhancement.settings.characterLimit"
              ) }),
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
      showPaymentButton && generatedPrompt.trim() && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-6 p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200/50 dark:border-purple-600/30 rounded-lg", children: [
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
  locale = "en",
  showPaymentButton = true
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
        error instanceof Error ? error.message : t("veo3PromptGenerator.aiEnhancement.enhanceError")
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
                enhancePrompt,
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
              locale,
              showPaymentButton
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
function useVideoScenes(projectId) {
  const [scenes, setScenes] = react.useState([]);
  const [isLoading, setIsLoading] = react.useState(true);
  const [error, setError] = react.useState(null);
  const [projectStatus, setProjectStatus] = react.useState("unknown");
  const [projectProgress, setProjectProgress] = react.useState(0);
  react.useEffect(() => {
    if (!projectId) return;
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const statusResponse = await fetch(
          `/api/story-editor/status?projectId=${projectId}`
        );
        const statusResult = await statusResponse.json();
        if (statusResult.success) {
          setProjectStatus(statusResult.status);
          setProjectProgress(statusResult.progress || 0);
          if (statusResult.status === "completed" && statusResult.project?.scenes) {
            setScenes(statusResult.project.scenes);
          } else if (statusResult.status === "completed") {
            const scenesResponse = await fetch(
              `/api/story-editor/scenes?projectId=${projectId}`
            );
            const scenesResult = await scenesResponse.json();
            if (scenesResult.success && scenesResult.scenes) {
              const fullScenes = scenesResult.scenes.filter(
                (scene) => scene.visual_description || scene.action_description
              );
              setScenes(fullScenes);
            } else {
              setError("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u0446\u0435\u043D\u044B");
            }
          }
        } else {
          setError("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0441\u0442\u0430\u0442\u0443\u0441 \u043F\u0440\u043E\u0435\u043A\u0442\u0430");
        }
      } catch (err) {
        setError("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0434\u0430\u043D\u043D\u044B\u0445 \u043F\u0440\u043E\u0435\u043A\u0442\u0430");
        console.error("Error fetching project data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectData();
    if (projectStatus !== "completed") {
      const interval = setInterval(fetchProjectData, 5e3);
      return () => clearInterval(interval);
    }
  }, [projectId, projectStatus]);
  return {
    scenes,
    isLoading,
    error,
    projectStatus,
    projectProgress
  };
}
function useProject(projectId) {
  const [project, setProject] = react.useState(null);
  const [isLoading, setIsLoading] = react.useState(true);
  const [error, setError] = react.useState(null);
  react.useEffect(() => {
    if (!projectId) {
      setError("Project ID is required");
      setIsLoading(false);
      return;
    }
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const config = await api.getClientSuperduperAIConfig();
        if (config.token) {
          api.OpenAPI.TOKEN = config.token;
        }
        if (config.url) {
          api.OpenAPI.BASE = config.url;
        }
        const projectData = await api.ProjectService.projectGetById({
          id: projectId
        });
        setProject(projectData);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch project"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);
  return {
    project,
    isLoading,
    error
  };
}
var useMediaPrefetch = ({ files, cleanable = false }) => {
  const [loaded, setLoaded] = react.useState(false);
  const [progress, setProgress] = react.useState({ totalBytes: 0, loadedBytes: 0 });
  react.useEffect(() => {
    if (!files || files.length === 0) return;
    let isCancelled = false;
    let totalBytes = 0;
    let loadedBytes = 0;
    const cleanupResources = () => {
      files.forEach((file) => {
        const { free } = remotion.prefetch(file.url);
        free();
      });
      setLoaded(false);
    };
    const prefetchPromises = files.map((file) => {
      const contentType = mediaTypeMap[file.type] || "application/octet-stream";
      const { free, waitUntilDone } = remotion.prefetch(file.url, {
        contentType,
        onProgress: (bytes) => {
          if (bytes.totalBytes) totalBytes = bytes.totalBytes;
          if (bytes.loadedBytes > progress.loadedBytes) {
            loadedBytes = bytes.loadedBytes;
            setProgress({ loadedBytes, totalBytes });
          }
        }
      });
      return waitUntilDone().then(() => {
        if (isCancelled) free();
        return file.url;
      }).catch((error) => {
        console.error(`Failed to preload file: ${file.url}`, error);
      });
    });
    Promise.all(prefetchPromises).then(() => {
      if (!isCancelled) setLoaded(true);
    }).catch((error) => {
      console.error("Failed to preload media files", error);
    });
    return () => {
      isCancelled = true;
      if (cleanable) cleanupResources();
    };
  }, [files, cleanable]);
  const progressValue = react.useMemo(
    () => progress.totalBytes ? Math.floor(progress.loadedBytes / progress.totalBytes * 100) : 0,
    [progress]
  );
  return {
    loaded,
    progress: progressValue
  };
};
var mediaTypeMap = {
  [api.FileTypeEnum.IMAGE]: "image/webp",
  [api.FileTypeEnum.VIDEO]: "video/mp4",
  [api.FileTypeEnum.VOICEOVER]: "audio/mpeg",
  [api.FileTypeEnum.SOUND_EFFECT]: "audio/mpeg",
  [api.FileTypeEnum.AUDIO]: "audio/mpeg",
  [api.FileTypeEnum.MUSIC]: "audio/mpeg",
  [api.FileTypeEnum.TEXT]: "text/plain",
  [api.FileTypeEnum.OTHER]: "application/octet-stream"
};
var sceneToMediaFormatting = (scenes) => {
  if (!scenes) return [];
  const media = [];
  for (const scene of scenes) {
    if (scene.file?.url) {
      media.push({
        url: scene.file.url,
        type: scene.file.type
      });
    }
    if (scene.voiceover?.url) {
      media.push({
        url: scene.voiceover.url,
        type: scene.voiceover.type
      });
    }
    if (scene.sound_effect?.url) {
      media.push({
        url: scene.sound_effect.url,
        type: scene.sound_effect.type
      });
    }
  }
  return media;
};

// src/video-player/utils/video-utils.ts
function calculateTotalDuration(scenes) {
  const total = scenes.reduce((acc, scene) => acc + (scene.duration || 5), 0);
  return Math.round(total);
}
function createVideoTimeline(scenes, fps = 30) {
  return scenes.map((scene, index) => {
    const sceneDuration = scene.duration || 5;
    const startTime = scenes.slice(0, index).reduce((acc, s) => acc + (s.duration || 5), 0);
    return {
      scene,
      startTime: startTime * fps,
      endTime: (startTime + sceneDuration) * fps,
      duration: sceneDuration * fps
    };
  });
}
function getVideoConfig(aspectRatio) {
  const configs = {
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "1:1": { width: 1080, height: 1080 },
    "4:3": { width: 1440, height: 1080 }
  };
  const dimensions = configs[aspectRatio];
  return {
    ...dimensions,
    fps: 30,
    duration: 0,
    // Будет вычислено позже
    aspectRatio
  };
}
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
function isSceneReady(scene) {
  return !!(scene.visual_description || scene.action_description || scene.dialogue || scene.file);
}
function getScenePreview(scene) {
  if (scene.file?.url) {
    return scene.file.url;
  }
  return null;
}
function calculatePlaybackProgress(currentTime, totalDuration) {
  if (totalDuration === 0) return 0;
  return Math.min(100, currentTime / totalDuration * 100);
}

// src/video-player/remotion/utils.ts
var FPS = 30;
var transitionDuration = 10;
var minSceneDurationInFrames = 30;
var calculateDuration = (scenes) => {
  let totalDuration = 0;
  for (const scene of scenes ?? []) {
    const durationInFrames = scene.duration * FPS;
    totalDuration += durationInFrames;
  }
  return Math.ceil(totalDuration);
};
var SceneComponent = ({ type, url, playbackRate = 1 }) => {
  if (!url) return null;
  return type === "video" ? /* @__PURE__ */ jsxRuntime.jsx(
    remotion.OffthreadVideo,
    {
      src: url,
      className: "size-full object-cover",
      playbackRate
    }
  ) : /* @__PURE__ */ jsxRuntime.jsx(
    remotion.Img,
    {
      src: url,
      className: "size-full object-cover"
    }
  );
};
var Scene = react.memo(SceneComponent);
var FabricCanvas = ({
  className,
  onReady,
  readonly,
  initialObjects,
  width: initialWidth,
  height: initialHeight
}) => {
  const [canvas, setCanvas] = react.useState(null);
  const alignGuidelines = react.useRef(null);
  const centeringGuidelines = react.useRef(null);
  const canvasRef = react.useRef(null);
  const containerRef = react.useRef(null);
  const loadObjects = async (canvas2) => {
    if (!initialObjects) return;
    const objectsFonts = [];
    canvas2.remove(...canvas2.getObjects());
    const canvasWidth = canvas2.getWidth();
    const canvasHeight = canvas2.getHeight();
    const canvasSquare = canvasWidth * canvasHeight;
    const canvasSqrt = Math.round(Math.sqrt(canvasSquare) * 100) / 100;
    initialObjects.forEach((object) => {
      if (object.fontFamily && !objectsFonts.includes(object.fontFamily)) {
        objectsFonts.push(object.fontFamily);
      }
    });
    const fontsData = objectsFonts.map((objectFont) => {
      const obj = initialObjects.find((obj2) => obj2.fontFamily === objectFont);
      if (obj) {
        return { name: objectFont, url: obj.fontUrl };
      }
      const defaultFont = superTimeline.FONTS.find(
        (font) => font.family === objectFont || font.postScriptName === objectFont
      );
      return {
        name: defaultFont?.fullName ?? objectFont,
        url: defaultFont?.url ?? ""
      };
    });
    await superTimeline.loadFonts(fontsData);
    await Promise.all(
      fontsData.filter((f) => f.name).map((f) => document.fonts.load(`1em "${f.name}"`))
    );
    await document.fonts.ready;
    const canvasObjects = initialObjects.map((object) => {
      const { text, type, left, top, width, height, fontSize, ...objectData } = object;
      const relativeData = {
        left: left * canvasWidth,
        top: top * canvasHeight,
        width: width * canvasWidth,
        height: height * canvasHeight,
        fontSize: fontSize ? Math.round(canvasSqrt / fontSize * 100) / 100 : void 0
      };
      if (type === "Textbox") {
        const textbox = new fabric.Textbox(text, {
          ...objectData,
          ...relativeData,
          fontFamily: object.fontFamily
        });
        textbox.setControlsVisibility({ mt: false, mb: false });
        return textbox;
      }
      throw new Error(`Unsupported object type: ${object.type}`);
    });
    canvas2.add(...canvasObjects);
    canvas2.requestRenderAll();
  };
  const setCurrentDimensions = (canvas2) => {
    const oldWidth = canvas2.getWidth();
    const oldHeight = canvas2.getHeight();
    canvas2.setDimensions({
      width: containerRef.current?.clientWidth ?? 0,
      height: containerRef.current?.clientHeight ?? 0
    });
    const scaleX = canvas2.getWidth() / oldWidth;
    const scaleY = canvas2.getHeight() / oldHeight;
    canvas2.getObjects().forEach((object) => {
      object.set({
        width: object.width * scaleX,
        height: object.height * scaleY,
        left: object.left * scaleX,
        top: object.top * scaleY,
        fontSize: object.fontSize ? object.fontSize * scaleX : void 0
      });
    });
    canvas2.renderAll();
  };
  react.useEffect(() => {
    if (!canvas || !initialObjects || canvas.getActiveObject()) return;
    void loadObjects(canvas);
  }, [initialObjects, canvas]);
  react.useEffect(() => {
    if (!canvas) return;
    setGuidelines(canvas);
    if (onReady) {
      onReady(canvas);
    }
  }, [canvas]);
  const setGuidelines = (canvas2) => {
    alignGuidelines.current = new fabricGuidelinePlugin.AlignGuidelines({
      canvas: canvas2,
      aligningOptions: {
        lineColor: "#32D10A",
        lineMargin: 8
      }
    });
    alignGuidelines.current.init();
    centeringGuidelines.current = new fabricGuidelinePlugin.CenteringGuidelines({
      canvas: canvas2,
      color: "#32D10A",
      verticalOffset: 8,
      horizontalOffset: 8
    });
    centeringGuidelines.current.init();
  };
  react.useEffect(() => {
    const width = containerRef.current?.clientWidth ?? initialWidth ?? 0;
    const height = containerRef.current?.clientHeight ?? initialHeight ?? 0;
    const fabricCanvas = new fabric.Canvas(canvasRef.current ?? void 0, {
      width,
      height
    });
    const observeTarget = containerRef.current;
    if (!observeTarget) return;
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const width2 = containerRef.current.clientWidth;
      const height2 = containerRef.current.clientHeight;
      if (width2 !== 0 && height2 !== 0) {
        setCurrentDimensions(fabricCanvas);
        setCanvas(fabricCanvas);
      }
    });
    resizeObserver.observe(observeTarget);
    return () => {
      resizeObserver.unobserve(observeTarget);
      resizeObserver.disconnect();
      void fabricCanvas.dispose();
    };
  }, []);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      ref: containerRef,
      className,
      style: {
        pointerEvents: readonly ? "none" : void 0,
        width: initialWidth ? `${initialWidth}px` : void 0,
        height: initialHeight ? `${initialHeight}px` : void 0
      },
      children: /* @__PURE__ */ jsxRuntime.jsx("canvas", { ref: canvasRef })
    }
  );
};
var ScenesComponent = ({ scenes }) => {
  const { width, height } = remotion.useVideoConfig();
  return /* @__PURE__ */ jsxRuntime.jsxs(remotion.AbsoluteFill, { style: { backgroundColor: "black" }, children: [
    /* @__PURE__ */ jsxRuntime.jsx(transitions.TransitionSeries, { children: scenes?.map((scene, index) => {
      const durationInFrames = scene.duration * FPS;
      return /* @__PURE__ */ jsxRuntime.jsxs(react.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          transitions.TransitionSeries.Sequence,
          {
            durationInFrames,
            premountFor: 120,
            children: /* @__PURE__ */ jsxRuntime.jsx(
              Scene,
              {
                type: scene.file?.type ?? "image",
                url: scene.file?.url
              }
            )
          },
          index
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          transitions.TransitionSeries.Transition,
          {
            presentation: fade.fade(),
            timing: transitions.linearTiming({ durationInFrames: transitionDuration })
          },
          index
        )
      ] });
    }) }),
    /* @__PURE__ */ jsxRuntime.jsx(transitions.TransitionSeries, { children: scenes?.map((scene, index) => {
      const sceneDurationInFrames = scene.duration * FPS;
      const durationWithTransition = sceneDurationInFrames > 30 ? sceneDurationInFrames - transitionDuration : sceneDurationInFrames;
      return /* @__PURE__ */ jsxRuntime.jsxs(react.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          transitions.TransitionSeries.Sequence,
          {
            durationInFrames: durationWithTransition,
            children: /* @__PURE__ */ jsxRuntime.jsx(
              FabricCanvas,
              {
                initialObjects: scene.objects,
                className: "absolute left-0 top-0 size-full",
                width,
                height,
                readonly: true
              },
              index
            )
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(transitions.TransitionSeries.Sequence, { durationInFrames: transitionDuration, children: /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, {}) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          transitions.TransitionSeries.Transition,
          {
            presentation: fade.fade(),
            timing: transitions.linearTiming({
              durationInFrames: transitionDuration,
              easing: remotion.Easing.in(remotion.Easing.ease)
            })
          }
        )
      ] });
    }) })
  ] });
};
var Scenes = react.memo(ScenesComponent);
var AudioPlayer = ({ src, volume = 0.4 }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    remotion.Audio,
    {
      src,
      volume
    }
  );
};
var Volumes = ({ scenes, musicUrl }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(remotion.Series, { children: scenes?.map((scene, index) => {
      const sceneDurationInFrames = scene.duration * FPS;
      const durationWithTransition = sceneDurationInFrames > minSceneDurationInFrames ? sceneDurationInFrames - transitionDuration : sceneDurationInFrames;
      return /* @__PURE__ */ jsxRuntime.jsxs(
        remotion.Series.Sequence,
        {
          durationInFrames: durationWithTransition,
          premountFor: 10,
          children: [
            scene.sound_effect?.url && /* @__PURE__ */ jsxRuntime.jsx(
              remotion.Audio,
              {
                src: scene.sound_effect.url,
                volume: 0.3
              }
            ),
            scene.voiceover?.url && scene.file?.video_generation?.generation_config_name !== "comfyui/lip-sync" && /* @__PURE__ */ jsxRuntime.jsx(
              remotion.Audio,
              {
                src: scene.voiceover.url,
                volume: 1
              }
            )
          ]
        },
        index
      );
    }) }),
    musicUrl && /* @__PURE__ */ jsxRuntime.jsx(
      AudioPlayer,
      {
        src: musicUrl,
        volume: 0.4
      }
    )
  ] });
};
var VolumesComponent = react.memo(Volumes);
var VideoComponent = ({ scenes, musicUrl }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs(remotion.AbsoluteFill, { style: { backgroundColor: "black", position: "relative" }, children: [
    /* @__PURE__ */ jsxRuntime.jsx(Scenes, { scenes }),
    /* @__PURE__ */ jsxRuntime.jsx(
      VolumesComponent,
      {
        musicUrl,
        scenes
      }
    )
  ] });
};
var VideoPlayer = ({
  scenes,
  music,
  aspectRatio = 16 / 9,
  isLoading
}) => {
  const containerRef = react.useRef(null);
  const playerRef = react.useRef(null);
  const [metadata, setMetadata] = react.useState(null);
  react.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver(() => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      let compositionWidth;
      let compositionHeight;
      if (containerWidth / aspectRatio <= containerHeight) {
        compositionWidth = containerWidth;
        compositionHeight = containerWidth / aspectRatio;
      } else {
        compositionHeight = containerHeight;
        compositionWidth = containerHeight * aspectRatio;
      }
      if (!compositionWidth || !compositionHeight) return;
      const totalDuration = calculateDuration(scenes || []);
      setMetadata({
        durationInFrames: totalDuration,
        fps: FPS,
        compositionWidth: Math.round(compositionWidth - 5),
        compositionHeight: Math.round(compositionHeight - 5)
      });
    });
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, [aspectRatio, scenes]);
  const inputProps = {
    scenes,
    musicUrl: music?.file?.url
  };
  const renderPlayPauseButton = react.useCallback(() => {
    if (isLoading) {
      return /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          onClick: (e) => {
            e.stopPropagation();
          },
          title: "Loading",
          children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" })
        }
      );
    }
    return null;
  }, [isLoading]);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grow p-3 pt-6 w-full h-full", children: /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      ref: containerRef,
      className: "flex-1 flex justify-center items-center relative w-full h-full",
      children: metadata && /* @__PURE__ */ jsxRuntime.jsx(
        player.Player,
        {
          ref: playerRef,
          ...metadata,
          component: () => VideoComponent(inputProps),
          renderPlayPauseButton,
          clickToPlay: !isLoading,
          numberOfSharedAudioTags: 10,
          controls: true,
          moveToBeginningWhenEnded: false
        }
      )
    }
  ) });
};
var RemotionPlayer = react.memo(VideoPlayer);
var useProjectTimeline2Video = (options) => {
  const [isLoading, setIsLoading] = react.useState(false);
  const [error, setError] = react.useState(null);
  const mutate = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await api.ProjectService.projectTimeline2Video(data);
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Unknown error");
      setError(error2);
      if (options?.onError) {
        options.onError(error2);
      }
      throw error2;
    } finally {
      setIsLoading(false);
    }
  };
  return {
    mutate,
    isLoading,
    error
  };
};
var useGenerateTimeline = (mutationKey, options) => {
  const [isLoading, setIsLoading] = react.useState(false);
  const [error, setError] = react.useState(null);
  const mutate = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await api.ProjectService.projectRegenerateTimeline(data);
      console.log("result", result);
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Unknown error");
      setError(error2);
      if (options?.onError) {
        options.onError(error2);
      }
      throw error2;
    } finally {
      setIsLoading(false);
    }
  };
  return {
    mutate,
    isLoading,
    error
  };
};
var useDataUpdate = (updateKeys = true, options) => {
  const [isLoading, setIsLoading] = react.useState(false);
  const [error, setError] = react.useState(null);
  const mutate = async (payload) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await api.DataService.dataUpdate({
        id: payload.id,
        requestBody: payload
      });
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    } catch (err) {
      const error2 = err instanceof Error ? err : new Error("Unknown error");
      setError(error2);
      if (options?.onError) {
        options.onError(error2);
      }
      throw error2;
    } finally {
      setIsLoading(false);
    }
  };
  return {
    mutate,
    isLoading,
    error
  };
};

// src/project-timeline/utils/project-utils.ts
function convertSceneToTimeline(scene) {
  return {
    id: scene.id,
    project_id: scene.id,
    // Временно используем scene.id, нужно будет исправить
    order: scene.order,
    visual_description: scene.visual_description,
    action_description: scene.action_description,
    dialogue: scene.dialogue,
    duration: scene.duration,
    file: scene.file ? {
      id: scene.file.id,
      url: scene.file.url || "",
      type: scene.file.type || "image"
    } : void 0
  };
}
function convertScenesToTimeline(scenes) {
  return scenes.sort((a, b) => a.order - b.order).map(convertSceneToTimeline);
}
function isProjectReadyForVideo(project) {
  return project.status === "completed" && project.scenes && project.scenes.length > 0;
}
function getTimelineDuration(timeline) {
  return timeline.reduce((acc, item) => acc + (item.duration || 5), 0);
}
var projectQueryKeys = {
  all: ["projects"],
  byId: (id) => ["projects", id],
  timeline: (id) => ["projects", id, "timeline"],
  video: (id) => ["projects", id, "video"]
};
var mediaTypeMap2 = {
  [api.FileTypeEnum.IMAGE]: "image",
  [api.FileTypeEnum.VIDEO]: "video",
  [api.FileTypeEnum.VOICEOVER]: "audio",
  [api.FileTypeEnum.SOUND_EFFECT]: "audio",
  [api.FileTypeEnum.AUDIO]: "audio",
  [api.FileTypeEnum.MUSIC]: "audio",
  [api.FileTypeEnum.TEXT]: "text",
  [api.FileTypeEnum.OTHER]: "text"
};
var createMusicTrackItem = ({ duration, file, from }) => {
  const fileDurationMs = file.duration ? file.duration * 1e3 : duration;
  const trimTo = Math.min(fileDurationMs, duration);
  const displayTo = from + trimTo;
  return {
    id: file.id,
    name: "",
    type: "audio",
    display: {
      from,
      to: displayTo
    },
    trim: {
      from: 0,
      to: trimTo
    },
    isMain: false,
    details: {
      src: file.url,
      duration: fileDurationMs,
      volume: 100,
      text: file.type
    }
  };
};
var createImageTrackItem = ({ duration, file, from }) => {
  return {
    id: file.id,
    type: "image",
    name: "",
    display: {
      from,
      to: from + duration
    },
    metadata: {},
    isMain: false,
    details: {
      src: file.url,
      // width: 1280,
      // height: 1920,
      opacity: 100,
      // transform: "scale(0.84375)",
      border: "none",
      borderRadius: "0",
      boxShadow: "none",
      top: "0px"
      // left: "-100px",
    }
  };
};
var createVideoTrackItem = ({ duration, file, from }) => {
  const fileDurationMs = file.duration ? file.duration * 1e3 : duration;
  return {
    id: file.id,
    type: "video",
    preview: file.thumbnail_url,
    display: {
      from,
      to: from + duration
    },
    trim: {
      from: 0,
      to: fileDurationMs
    },
    isMain: false,
    details: {
      width: 1280,
      height: 720,
      duration: fileDurationMs,
      src: file.url,
      volume: 100,
      top: "600px",
      left: "-100px",
      text: "Scene"
    }
  };
};
var createTextTrackItem = ({ duration, from, id }) => {
  return {
    id,
    name: "",
    type: "text",
    display: { from, to: from + duration },
    metadata: {},
    isMain: false
  };
};
var trackItemTrackMap = {
  [api.FileTypeEnum.IMAGE]: createImageTrackItem,
  [api.FileTypeEnum.VIDEO]: createVideoTrackItem,
  [api.FileTypeEnum.VOICEOVER]: createMusicTrackItem,
  [api.FileTypeEnum.SOUND_EFFECT]: createMusicTrackItem,
  [api.FileTypeEnum.AUDIO]: createMusicTrackItem,
  [api.FileTypeEnum.MUSIC]: createMusicTrackItem,
  [api.FileTypeEnum.TEXT]: createTextTrackItem,
  [api.FileTypeEnum.OTHER]: createTextTrackItem
};
var createMusicDetails = ({ file }) => {
  return {
    type: "audio",
    details: {
      src: file.url,
      duration: file.duration ? file.duration * 1e3 : null,
      volume: 100,
      text: file.audio_generation?.prompt ?? file.type
    }
  };
};
var createImageDetails = ({ file }) => {
  return {
    type: "image",
    details: {
      src: file.url,
      // width: 1280,
      // height: 1920,
      opacity: 100,
      // transform: "scale(0.84375)",
      border: "none",
      borderRadius: "0",
      boxShadow: "none",
      top: "0px"
      // left: "-100px",
    }
  };
};
var createVideoDetails = ({ file }) => {
  return {
    type: "video",
    details: {
      width: 1280,
      height: 720,
      src: file.url,
      volume: 100,
      top: "600px",
      left: "-100px",
      text: file.video_generation?.prompt?.length ? file.video_generation.prompt : "Video",
      duration: file.duration ? file.duration * 1e3 : void 0
    }
  };
};
var createTextDetails = ({
  text,
  textDetails,
  size
}) => {
  const canvasWidth = Number(size?.width ?? 1920);
  const canvasHeight = Number(size?.height ?? 1080);
  const canvasSquare = canvasWidth * canvasHeight;
  const canvasSqrt = Math.round(Math.sqrt(canvasSquare) * 100) / 115;
  const fontSize = textDetails.fontSize ? Math.round(canvasSqrt / textDetails.fontSize * 100) / 100 : void 0;
  return {
    type: "text",
    details: {
      ...textDetails,
      fontFamily: "Roboto-Bold",
      fontSize,
      text,
      opacity: 100,
      textAlign: textDetails.textAlign ?? "right",
      wordWrap: "break-word",
      wordBreak: "normal",
      WebkitTextStrokeColor: "#ffffff",
      WebkitTextStrokeWidth: "0px",
      top: `${textDetails.top * canvasHeight - textDetails?.height * canvasHeight / 2}px`,
      left: `${textDetails.left * canvasWidth - textDetails?.width * canvasWidth / 2}px`,
      width: textDetails.width * canvasWidth,
      height: textDetails.height * canvasHeight,
      fontUrl: "https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf"
    }
  };
};
var trackItemDetailsMap = {
  [api.FileTypeEnum.IMAGE]: createImageDetails,
  [api.FileTypeEnum.VIDEO]: createVideoDetails,
  [api.FileTypeEnum.VOICEOVER]: createMusicDetails,
  [api.FileTypeEnum.SOUND_EFFECT]: createMusicDetails,
  [api.FileTypeEnum.AUDIO]: createMusicDetails,
  [api.FileTypeEnum.MUSIC]: createMusicDetails,
  [api.FileTypeEnum.TEXT]: createTextDetails,
  [api.FileTypeEnum.OTHER]: createTextDetails
};
var createTrackItemMap = (type) => {
  return trackItemTrackMap[type];
};
var createTrackDetailsMap = (type) => {
  return trackItemDetailsMap[type];
};
var createTrack = (trackId, type, items) => {
  return {
    id: trackId,
    accepts: ["text", "audio", "helper", "video", "image"],
    type: mediaTypeMap2[type],
    items,
    magnetic: false,
    static: false
  };
};
var Player2 = () => {
  const playerRef = react.useRef(null);
  const { setPlayerRef, duration, fps, size } = superTimeline.useStore();
  react.useEffect(() => {
    setPlayerRef(playerRef);
  }, []);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "size-full flex", children: /* @__PURE__ */ jsxRuntime.jsx(
    player.Player,
    {
      ref: playerRef,
      component: superTimeline.Composition,
      durationInFrames: Math.round(duration / 1e3 * fps) || 5 * 30,
      compositionWidth: size.width,
      compositionHeight: size.height,
      style: { width: "100%", height: "100%" },
      fps,
      overflowVisible: true,
      numberOfSharedAudioTags: 10
    }
  ) });
};
var Scene2 = () => {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-scene py-3 size-full flex justify-center flex-1", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "max-w-3xl flex-1 size-full flex relative", children: /* @__PURE__ */ jsxRuntime.jsx(Player2, {}) }) });
};
var stateManager = new superTimeline.StateManager();
var ProjectTimeline = ({
  projectId,
  timeline,
  project
}) => {
  const [isComponentsLoaded, setIsComponentsLoaded] = react.useState(false);
  const [isClient, setIsClient] = react.useState(false);
  const { mutate: generateTimeline, isLoading: isGenerating } = useGenerateTimeline();
  const { mutate: timeline2video, isLoading: isPending } = useProjectTimeline2Video();
  const { playerRef } = superTimeline.useStore();
  const store = superTimeline.useStore();
  const [data, setData] = react.useState([]);
  const stableData = react.useMemo(() => {
    return data;
  }, [data]);
  console.log(store);
  react.useEffect(() => {
    if (!stableData) return;
    superTimeline.eventBus.dispatch(superTimeline.SCENE_LOAD, {
      payload: stableData
    });
  }, [stableData]);
  react.useEffect(() => {
    if (!timeline) return;
    const timer = setTimeout(() => {
      const timelineData = timeline.value;
      setData(timelineData);
    }, 1e3);
    return () => {
      clearTimeout(timer);
    };
  }, [timeline]);
  superTimeline.useTimelineEvents();
  superTimeline.useTimelineHotkeys();
  superTimeline.useItemsHotkeys();
  react.useEffect(() => {
    setIsClient(true);
  }, []);
  react.useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => {
        console.log("\u23F0 Setting isComponentsLoaded to true");
        setIsComponentsLoaded(true);
      }, 1e3);
      return () => clearTimeout(timer);
    }
  }, [isClient]);
  react.useEffect(() => {
    if (!project || timeline) return;
    handleGenerateTimeline();
  }, [timeline, project]);
  const handleGenerateTimeline = () => {
    generateTimeline({ id: projectId });
  };
  if (!isComponentsLoaded || !isClient) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex min-h-screen size-full items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-600", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 timeline \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u043E\u0432..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative flex size-full flex-col min-h-screen", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "320px 1fr 320px"
        },
        className: "pointer-events-none absolute inset-x-0 top-0 z-[205] flex h-[72px] items-center px-2",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "pointer-events-auto flex h-14 items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex h-12 items-center bg-background px-1.5", children: /* @__PURE__ */ jsxRuntime.jsxs(
              ui.Button,
              {
                className: "flex gap-2 text-muted-foreground",
                variant: "ghost",
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowLeft, {}),
                  " Back"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntime.jsx(superTimeline.HistoryButtons, {})
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", {})
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          position: "relative",
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        },
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(superTimeline.MenuList, {}),
          /* @__PURE__ */ jsxRuntime.jsx(superTimeline.MenuItem, {}),
          /* @__PURE__ */ jsxRuntime.jsx(superTimeline.ControlList, {}),
          /* @__PURE__ */ jsxRuntime.jsx(superTimeline.ControlItem, {}),
          stableData && stableData.id ? /* @__PURE__ */ jsxRuntime.jsx(Scene2, {}) : /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" }),
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-600", children: !stableData || !stableData.id ? "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 timeline \u0434\u0430\u043D\u043D\u044B\u0445..." : "\u0418\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u043F\u043B\u0435\u0435\u0440\u0430..." })
          ] }) }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: " w-full", children: playerRef && /* @__PURE__ */ jsxRuntime.jsx(superTimeline.TimelineComponent, { stateManager }) })
  ] });
};

exports.CharacterType = CharacterType;
exports.EnhancementInfoType = EnhancementInfoType;
exports.HistoryItemType = HistoryItemType;
exports.MoodboardImageType = MoodboardImageType;
exports.PresetOptionsType = PresetOptionsType;
exports.ProjectTimeline = ProjectTimeline;
exports.PromptDataType = PromptDataType;
exports.RemotionPlayer = RemotionPlayer;
exports.Veo3PromptGenerator = Veo3PromptGenerator;
exports.calculatePlaybackProgress = calculatePlaybackProgress;
exports.calculateTotalDuration = calculateTotalDuration;
exports.convertSceneToTimeline = convertSceneToTimeline;
exports.convertScenesToTimeline = convertScenesToTimeline;
exports.createTrack = createTrack;
exports.createTrackDetailsMap = createTrackDetailsMap;
exports.createTrackItemMap = createTrackItemMap;
exports.createVideoTimeline = createVideoTimeline;
exports.defaultLocale = defaultLocale;
exports.en = en_default;
exports.es = es_default;
exports.formatTime = formatTime;
exports.getScenePreview = getScenePreview;
exports.getTimelineDuration = getTimelineDuration;
exports.getVideoConfig = getVideoConfig;
exports.hi = hi_default;
exports.isProjectReadyForVideo = isProjectReadyForVideo;
exports.isSceneReady = isSceneReady;
exports.locales = locales;
exports.mediaTypeMap = mediaTypeMap2;
exports.projectQueryKeys = projectQueryKeys;
exports.ru = ru_default;
exports.sceneToMediaFormatting = sceneToMediaFormatting;
exports.tr = tr_default;
exports.useDataUpdate = useDataUpdate;
exports.useGenerateTimeline = useGenerateTimeline;
exports.useMediaPrefetch = useMediaPrefetch;
exports.useProject = useProject;
exports.useProjectTimeline2Video = useProjectTimeline2Video;
exports.useTranslation = useTranslation;
exports.useVideoScenes = useVideoScenes;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map