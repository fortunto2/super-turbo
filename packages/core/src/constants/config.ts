// Application configuration constants

// Next.js API routes
export const API_NEXT_ROUTES = {
  GENERATE_IMAGE: '/api/generate/image',
  GENERATE_VIDEO: '/api/generate/video',
  FILE: (id: string) => `/api/file/${id}`,
  FILE_UPLOAD: '/api/file/upload',
  PROJECT: (id: string) => `/api/project/${id}`,
  PROJECT_VIDEO: '/api/project/video',
  ENHANCE_PROMPT: '/api/enhance-prompt',
  MODELS: '/api/config/models',
  SUPERDUPERAI: '/api/config/superduperai',
  EVENTS_FILE: (fileId: string) => `/api/events/file.${fileId}`,
  GENERATE_SCRIPT: '/api/generate/script',
} as const;

// Tool configuration types
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  iconName: 'image' | 'video' | 'wand' | 'sparkles' | 'zap' | 'play' | 'languages' | 'gallery';
  href: string;
  category: 'generation' | 'enhancement' | 'utility' | 'gallery';
  features: {
    iconName: 'sparkles' | 'zap' | 'play' | 'languages';
    label: string;
  }[];
  primaryColor: string;
  hoverColor: string;
  bgColor: string;
  hoverBgColor: string;
}

// Tools configuration
export const TOOLS_CONFIG: ToolConfig[] = [
  {
    id: 'image-generator',
    name: 'Image Generator',
    description: 'Generate high-quality images using AI models like FLUX Pro, FLUX Dev, and more from SuperDuperAI',
    shortDescription: 'AI Image Generator',
    iconName: 'image',
    href: '/tools/image-generator',
    category: 'generation',
    features: [
      { iconName: 'sparkles', label: 'Professional Quality' },
      { iconName: 'zap', label: 'Real-time Progress' }
    ],
    primaryColor: 'blue-600',
    hoverColor: 'blue-600',
    bgColor: 'blue-100',
    hoverBgColor: 'blue-200'
  },
  {
    id: 'video-generator',
    name: 'Video Generator',
    description: 'Generate high-quality videos using AI models like VEO3, KLING, LTX, and more from SuperDuperAI',
    shortDescription: 'AI Video Generator',
    iconName: 'video',
    href: '/tools/video-generator',
    category: 'generation',
    features: [
      { iconName: 'play', label: 'Professional Quality' },
      { iconName: 'zap', label: 'Real-time Progress' }
    ],
    primaryColor: 'purple-600',
    hoverColor: 'purple-600',
    bgColor: 'purple-100',
    hoverBgColor: 'purple-200'
  },
  {
    id: 'prompt-enhancer',
    name: 'Prompt Enhancer',
    description: 'Transform simple prompts into detailed, professional descriptions for better AI generation results',
    shortDescription: 'AI Prompt Enhancer',
    iconName: 'wand',
    href: '/tools/prompt-enhancer',
    category: 'enhancement',
    features: [
      { iconName: 'languages', label: 'Auto Translation' },
      { iconName: 'sparkles', label: 'Smart Enhancement' }
    ],
    primaryColor: 'pink-600',
    hoverColor: 'pink-600',
    bgColor: 'pink-100',
    hoverBgColor: 'pink-200'
  },
  {
    id: 'prompt-enhancer-veo3',
    name: 'Prompt Enhancer Veo3',
    description: 'Transform simple prompts into detailed, professional descriptions for better AI generation results',
    shortDescription: 'AI Prompt Enhancer VEO3',
    iconName: 'wand',
    href: '/tools/prompt-enhancer-veo3',
    category: 'enhancement',
    features: [
      { iconName: 'languages', label: 'Auto Translation' },
      { iconName: 'sparkles', label: 'Smart Enhancement' }
    ],
    primaryColor: 'pink-600',
    hoverColor: 'pink-600',
    bgColor: 'pink-100',
    hoverBgColor: 'pink-200'
  },
  {
    id: 'script-generator',
    name: 'Script Generator',
    description: 'Generate detailed scripts and scenarios in Markdown format using AI. Edit and refine your script with a powerful Markdown editor.',
    shortDescription: 'AI Script Generator',
    iconName: 'wand',
    href: '/tools/script-generator',
    category: 'generation',
    features: [
      { iconName: 'sparkles', label: 'Markdown Output' },
      { iconName: 'sparkles', label: 'Script Structuring' }
    ],
    primaryColor: 'green-600',
    hoverColor: 'green-600',
    bgColor: 'green-100',
    hoverBgColor: 'green-200'
  }
];

// Tool categories
export const TOOL_CATEGORIES = {
  GENERATION: 'generation',
  ENHANCEMENT: 'enhancement',
  UTILITY: 'utility',
  GALLERY: 'gallery',
} as const;

// Tool icon names
export const TOOL_ICONS = {
  IMAGE: 'image',
  VIDEO: 'video',
  WAND: 'wand',
  SPARKLES: 'sparkles',
  ZAP: 'zap',
  PLAY: 'play',
  LANGUAGES: 'languages',
  GALLERY: 'gallery',
} as const;
