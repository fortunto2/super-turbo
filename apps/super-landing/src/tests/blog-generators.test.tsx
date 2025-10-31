import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BlogModelGenerator } from "../components/content/blog-model-generator";
import { ModelImageGenerator } from "../components/content/model-image-generator";
import { ModelVideoGenerator } from "../components/content/model-video-generator";
import { EnhancedModelVideoGenerator } from "../components/content/enhanced-model-video-generator";

// Мокаем зависимости
vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "image_generator.title": "Generate Image",
        "video_generator.title": "Generate Video",
        "model_descriptions.dall_e_3": "Create images with DALL-E 3",
        "model_descriptions.veo_3": "Generate videos with Veo 3",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("@/lib/models-config", () => ({
  getModelType: (modelName: string) => {
    if (modelName.includes("veo") || modelName.includes("video")) {
      return "video";
    }
    return "image";
  },
  supportsImageToVideo: (modelName: string) => {
    return modelName.includes("veo") || modelName.includes("enhanced");
  },
  getModelConfig: (modelName: string) => ({
    name: modelName,
    type:
      modelName.includes("veo") || modelName.includes("video")
        ? "video"
        : "image",
    description: `Test description for ${modelName}`,
    supportsImageToVideo:
      modelName.includes("veo") || modelName.includes("enhanced"),
  }),
}));

// Убираем хелпер withText - он работает неправильно
// const withText = (expected: string) => (content: string, element: HTMLElement | null) => {
//   if (!element) return false;
//   const normalized = element.textContent?.replace(/\s+/g, " ").trim();
//   return normalized === expected;
// };

// Мокаем window.location
Object.defineProperty(window, "location", {
  value: {
    href: "",
  },
  writable: true,
});

describe("Blog Generators", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Сбрасываем href перед каждым тестом
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  describe("BlogModelGenerator", () => {
    it("should render image generator for image models", () => {
      render(
        <BlogModelGenerator
          modelName="dall_e_3"
          locale="en"
          modelConfig={{
            width: 1024,
            height: 1024,
            aspectRatio: "1:1",
            style: "photorealistic",
            description: "Test image model",
          }}
        />
      );

      expect(screen.getByTestId("image-generator")).toBeInTheDocument();
      expect(screen.getByText("dall_e_3")).toBeInTheDocument();
    });

    it("should render video generator for video models", () => {
      render(
        <BlogModelGenerator
          modelName="veo_3"
          locale="en"
          modelConfig={{
            maxDuration: 8,
            aspectRatio: "16:9",
            description: "Test video model",
          }}
        />
      );

      // Для veo_3 рендерится enhanced video generator
      expect(
        screen.getByTestId("enhanced-video-generator")
      ).toBeInTheDocument();
      expect(screen.getByText("veo_3")).toBeInTheDocument();
    });

    it("should render enhanced video generator for models supporting image-to-video", () => {
      render(
        <BlogModelGenerator
          modelName="enhanced_veo_3"
          locale="en"
          modelConfig={{
            maxDuration: 10,
            aspectRatio: "16:9",
            description: "Enhanced video model",
          }}
        />
      );

      expect(
        screen.getByTestId("enhanced-video-generator")
      ).toBeInTheDocument();
      expect(screen.getByText("enhanced_veo_3")).toBeInTheDocument();
    });

    it("should handle missing modelConfig gracefully", () => {
      render(
        <BlogModelGenerator
          modelName="test_model"
          locale="en"
        />
      );

      expect(screen.getByTestId("image-generator")).toBeInTheDocument();
    });
  });

  describe("ModelImageGenerator", () => {
    const defaultProps = {
      modelName: "dall_e_3",
      locale: "en" as const,
      modelConfig: {
        width: 1024,
        height: 1024,
        aspectRatio: "1:1",
        style: "photorealistic",
        description: "Test image model",
      },
    };

    it("should render image generator with correct model information", () => {
      render(<ModelImageGenerator {...defaultProps} />);

      // Проверяем отображение информации о модели
      expect(screen.getByText("dall_e_3")).toBeInTheDocument();
      expect(screen.getByText("Test image model")).toBeInTheDocument();
      expect(screen.getByText("1024x1024")).toBeInTheDocument();
      expect(screen.getByText("1:1")).toBeInTheDocument();
      expect(screen.getByText("photorealistic")).toBeInTheDocument();
    });

    it("should render generate button with correct text", () => {
      render(<ModelImageGenerator {...defaultProps} />);

      const generateButton = screen.getByTestId("generate-image-button");
      expect(generateButton).toBeInTheDocument();
    });

    it("should redirect to image generation page when generate button is clicked", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

      render(<ModelImageGenerator {...defaultProps} />);

      const generateButton = screen.getByTestId("generate-image-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-image?model=dall_e_3"
        );
      });
    });

    it("should handle missing modelConfig properties gracefully", () => {
      const minimalProps = {
        modelName: "minimal_model",
        locale: "en" as const,
      };

      render(<ModelImageGenerator {...minimalProps} />);

      expect(screen.getByText("minimal_model")).toBeInTheDocument();
      // Должен отображаться fallback текст
      expect(
        screen.getByText(/model_descriptions\.minimal_model/)
      ).toBeInTheDocument();
    });

    it("should display correct badges based on modelConfig", () => {
      render(<ModelImageGenerator {...defaultProps} />);

      // Проверяем наличие всех бейджей
      expect(screen.getByText("1024x1024")).toBeInTheDocument();
      expect(screen.getByText("1:1")).toBeInTheDocument();
      expect(screen.getByText("photorealistic")).toBeInTheDocument();
    });

    it("should handle different locales correctly", () => {
      render(
        <ModelImageGenerator
          {...defaultProps}
          locale="tr"
        />
      );

      const generateButton = screen.getByTestId("generate-image-button");
      fireEvent.click(generateButton);

      expect(window.location.href).toContain("/tr/generate-image");
    });
  });

  describe("ModelVideoGenerator", () => {
    const defaultProps = {
      modelName: "veo_3",
      locale: "en" as const,
      modelConfig: {
        maxDuration: 8,
        aspectRatio: "16:9",
        width: 1280,
        height: 720,
        frameRate: 30,
        description: "Test video model",
      },
    };

    it("should render video generator with correct model information", () => {
      render(<ModelVideoGenerator {...defaultProps} />);

      // Проверяем отображение информации о модели
      expect(screen.getByText("veo_3")).toBeInTheDocument();
      expect(screen.getByText("Test video model")).toBeInTheDocument();
      expect(screen.getByText("1280x720")).toBeInTheDocument();
      expect(screen.getByText("16:9")).toBeInTheDocument();
      expect(screen.getByText("8s")).toBeInTheDocument();
    });

    it("should render generate button with correct text", () => {
      render(<ModelVideoGenerator {...defaultProps} />);

      const generateButton = screen.getByTestId("generate-video-button");
      expect(generateButton).toBeInTheDocument();
    });

    it("should redirect to video generation page when generate button is clicked", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

      render(<ModelVideoGenerator {...defaultProps} />);

      const generateButton = screen.getByTestId("generate-video-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-video?model=veo_3"
        );
      });
    });

    it("should use default config when modelConfig is missing", () => {
      const minimalProps = {
        modelName: "minimal_video_model",
        locale: "en" as const,
      };

      render(<ModelVideoGenerator {...minimalProps} />);

      expect(screen.getByText("minimal_video_model")).toBeInTheDocument();
      // Должны отображаться значения по умолчанию
      expect(screen.getByText("1280x720")).toBeInTheDocument();
      expect(screen.getByText("16:9")).toBeInTheDocument();
      expect(screen.getByText("8s")).toBeInTheDocument();
    });

    it("should merge custom config with defaults correctly", () => {
      const customProps = {
        modelName: "custom_video_model",
        locale: "en" as const,
        modelConfig: {
          maxDuration: 15,
          aspectRatio: "9:16",
          width: 1080,
          height: 1920,
        },
      };

      render(<ModelVideoGenerator {...customProps} />);

      expect(screen.getByText("1080x1920")).toBeInTheDocument();
      expect(screen.getByText("9:16")).toBeInTheDocument();
      expect(screen.getByText("15s")).toBeInTheDocument();
    });

    it("should handle different locales correctly", () => {
      render(
        <ModelVideoGenerator
          {...defaultProps}
          locale="tr"
        />
      );

      const generateButton = screen.getByTestId("generate-video-button");
      fireEvent.click(generateButton);

      expect(window.location.href).toContain("/tr/generate-video");
    });
  });

  describe("EnhancedModelVideoGenerator", () => {
    const defaultProps = {
      modelName: "enhanced_veo_3",
      locale: "en" as const,
      modelConfig: {
        maxDuration: 10,
        aspectRatio: "16:9",
        width: 1920,
        height: 1080,
        frameRate: 60,
        description: "Enhanced video model with image-to-video support",
      },
    };

    it("should render enhanced video generator with correct model information", () => {
      render(<EnhancedModelVideoGenerator {...defaultProps} />);

      expect(screen.getByText("enhanced_veo_3")).toBeInTheDocument();
      expect(
        screen.getByText("Enhanced video model with image-to-video support")
      ).toBeInTheDocument();
    });

    it("should render generate button with correct text", () => {
      render(<EnhancedModelVideoGenerator {...defaultProps} />);

      const generateButton = screen.getByTestId(
        "generate-enhanced-video-button"
      );
      expect(generateButton).toBeInTheDocument();
    });

    it("should redirect to enhanced video generation page when generate button is clicked", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

      render(<EnhancedModelVideoGenerator {...defaultProps} />);

      const generateButton = screen.getByTestId(
        "generate-enhanced-video-button"
      );
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-video?model=enhanced_veo_3"
        );
      });
    });

    it("should handle missing modelConfig gracefully", () => {
      const minimalProps = {
        modelName: "minimal_enhanced_model",
        locale: "en" as const,
      };

      render(<EnhancedModelVideoGenerator {...minimalProps} />);

      expect(screen.getByText("minimal_enhanced_model")).toBeInTheDocument();
    });

    it("should handle different locales correctly", () => {
      render(
        <EnhancedModelVideoGenerator
          {...defaultProps}
          locale="tr"
        />
      );

      const generateButton = screen.getByTestId(
        "generate-enhanced-video-button"
      );
      fireEvent.click(generateButton);

      expect(window.location.href).toContain("/tr/generate-video");
    });
  });
});
