import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, cn } from '@turbo-super/ui';
import { ImagesIcon, LanguagesIcon, PlayIcon, ZapIcon, SparklesIcon, Wand2Icon, VideoIcon, ImageIcon } from 'lucide-react';
import { jsx, jsxs } from 'react/jsx-runtime';

var iconMap = {
  image: ImageIcon,
  video: VideoIcon,
  wand: Wand2Icon,
  sparkles: SparklesIcon,
  zap: ZapIcon,
  play: PlayIcon,
  languages: LanguagesIcon,
  gallery: ImagesIcon
};
var ToolIcon = ({ name, className }) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    console.warn(`Unknown icon name: ${name}`);
    return null;
  }
  return /* @__PURE__ */ jsx(IconComponent, { className: cn("size-4", className) });
};
var ToolsGrid = ({ tools, className }) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${className || ""}`,
      children: tools.map((tool) => /* @__PURE__ */ jsx(
        Link,
        {
          href: tool.href,
          children: /* @__PURE__ */ jsxs(Card, { className: "hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group", children: [
            /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `p-4 rounded-full bg-${tool.bgColor} group-hover:bg-${tool.hoverBgColor} transition-colors`,
                  children: /* @__PURE__ */ jsx(
                    ToolIcon,
                    {
                      name: tool.iconName,
                      className: `size-8 text-${tool.primaryColor}`
                    }
                  )
                }
              ) }),
              /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl", children: tool.name }),
              /* @__PURE__ */ jsx(CardDescription, { className: "text-base", children: tool.description })
            ] }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center space-x-6 text-sm text-muted-foreground", children: tool.features.map((feature, index) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center space-x-2",
                  children: [
                    /* @__PURE__ */ jsx(ToolIcon, { name: feature.iconName }),
                    /* @__PURE__ */ jsx("span", { children: feature.label })
                  ]
                },
                index
              )) }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  className: `w-full group-hover:bg-${tool.hoverColor}`,
                  size: "lg",
                  children: [
                    /* @__PURE__ */ jsx(
                      ToolIcon,
                      {
                        name: tool.iconName,
                        className: "size-4 mr-2"
                      }
                    ),
                    tool.id === "image-generator" ? "Generate Images" : tool.id === "video-generator" ? "Generate Videos" : "Enhance Prompts"
                  ]
                }
              )
            ] }) })
          ] })
        },
        tool.id
      ))
    }
  );
};

// src/config/tools-config.ts
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
var ToolsPage = ({
  title = "AI Tools",
  description = "Powerful AI-powered tools for generating high-quality images, videos, and enhancing your prompts. Choose the tool that fits your creative needs.",
  className = ""
}) => {
  return /* @__PURE__ */ jsx("div", { className: `min-h-screen bg-background ${className}`, children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: description })
    ] }),
    /* @__PURE__ */ jsx(
      ToolsGrid,
      {
        tools: TOOLS_CONFIG,
        className: "mt-12"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "text-center text-sm text-muted-foreground border-t pt-8 mt-12", children: /* @__PURE__ */ jsxs("p", { children: [
      "Powered by ",
      /* @__PURE__ */ jsx("strong", { children: "SuperDuperAI" }),
      " \u2022 State-of-the-art AI models for creative content generation \u2022 Fast, reliable, and high-quality results"
    ] }) })
  ] }) }) });
};

export { ToolsPage };
//# sourceMappingURL=tools-page.mjs.map
//# sourceMappingURL=tools-page.mjs.map