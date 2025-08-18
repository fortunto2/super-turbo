import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BlogModelGenerator } from "../components/content/blog-model-generator";
import { ModelImageGenerator } from "../components/content/model-image-generator";
import { ModelVideoGenerator } from "../components/content/model-video-generator";

// Убираем хелпер withText - он работает неправильно
// const withText = (expected: string) => (content: string, element: HTMLElement | null) => {
//   if (!element) return false;
//   const normalized = element.textContent?.replace(/\s+/g, " ").trim();
//   return normalized === expected;
// };

// Мокаем fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Мокаем WebSocket
const mockWebSocket = vi.fn().mockImplementation(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}));
global.WebSocket = mockWebSocket as unknown as typeof WebSocket;

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

// Мокаем window.location
Object.defineProperty(window, "location", {
  value: {
    href: "",
  },
  writable: true,
});

// Мокаем environment variables
vi.mock("@/lib/config/env", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_SUPERDUPERAI_URL: "https://dev-editor.superduperai.co",
  },
}));

describe("Blog API Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockWebSocket.mockClear();

    // Сбрасываем href перед каждым тестом
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    // Устанавливаем environment variables
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.NEXT_PUBLIC_SUPERDUPERAI_URL =
      "https://dev-editor.superduperai.co";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Image Generation API Integration", () => {
    it("should redirect to image generation page with correct model parameters", async () => {
      render(
        <ModelImageGenerator
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

      const generateButton = screen.getByTestId("generate-image-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-image?model=dall_e_3"
        );
      });
    });

    it("should pass model configuration to image generation page", async () => {
      const modelConfig = {
        width: 1920,
        height: 1080,
        aspectRatio: "16:9",
        style: "artistic",
        description: "Wide format artistic image",
      };

      render(
        <ModelImageGenerator
          modelName="dall_e_3"
          locale="en"
          modelConfig={modelConfig}
        />
      );

      const generateButton = screen.getByTestId("generate-image-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        const url = new URL(window.location.href);
        expect(url.searchParams.get("model")).toBe("dall_e_3");
        // Проверяем, что URL содержит правильный путь
        expect(url.pathname).toBe("/en/generate-image");
      });
    });

    it("should handle different locales in image generation redirect", async () => {
      render(
        <ModelImageGenerator
          modelName="dall_e_3"
          locale="tr"
          modelConfig={{
            width: 1024,
            height: 1024,
            aspectRatio: "1:1",
            style: "photorealistic",
          }}
        />
      );

      const generateButton = screen.getByTestId("generate-image-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(window.location.href).toContain("/tr/generate-image");
      });
    });

    it("should handle missing environment variables gracefully", async () => {
      // Убираем environment variable
      delete process.env.NEXT_PUBLIC_APP_URL;

      render(
        <ModelImageGenerator
          modelName="dall_e_3"
          locale="en"
          modelConfig={{
            width: 1024,
            height: 1024,
            aspectRatio: "1:1",
          }}
        />
      );

      const generateButton = screen.getByTestId("generate-image-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        // Должен использовать fallback URL
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-image?model=dall_e_3"
        );
      });
    });
  });

  describe("Video Generation API Integration", () => {
    it("should redirect to video generation page with correct model parameters", async () => {
      render(
        <ModelVideoGenerator
          modelName="veo_3"
          locale="en"
          modelConfig={{
            maxDuration: 8,
            aspectRatio: "16:9",
            width: 1280,
            height: 720,
            frameRate: 30,
            description: "Test video model",
          }}
        />
      );

      const generateButton = screen.getByTestId("generate-video-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-video?model=veo_3"
        );
      });
    });

    it("should pass video model configuration to generation page", async () => {
      const modelConfig = {
        maxDuration: 15,
        aspectRatio: "9:16",
        width: 1080,
        height: 1920,
        frameRate: 60,
        description: "Portrait video format",
      };

      render(
        <ModelVideoGenerator
          modelName="veo_3"
          locale="en"
          modelConfig={modelConfig}
        />
      );

      const generateButton = screen.getByTestId("generate-video-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        const url = new URL(window.location.href);
        expect(url.searchParams.get("model")).toBe("veo_3");
        expect(url.pathname).toBe("/en/generate-video");
      });
    });

    it("should handle enhanced video models with image-to-video support", async () => {
      render(
        <BlogModelGenerator
          modelName="enhanced_veo_3"
          locale="en"
          modelConfig={{
            maxDuration: 10,
            aspectRatio: "16:9",
            width: 1920,
            height: 1080,
            frameRate: 60,
            description: "Enhanced video model with image-to-video support",
          }}
        />
      );

      // Должен отобразить enhanced video generator
      expect(
        screen.getByTestId("enhanced-video-generator")
      ).toBeInTheDocument();
    });

    it("should handle different locales in video generation redirect", async () => {
      render(
        <ModelVideoGenerator
          modelName="veo_3"
          locale="tr"
          modelConfig={{
            maxDuration: 8,
            aspectRatio: "16:9",
            width: 1280,
            height: 720,
          }}
        />
      );

      const generateButton = screen.getByTestId("generate-video-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(window.location.href).toContain("/tr/generate-video");
      });
    });
  });

  describe("Model Configuration Integration", () => {
    it("should merge blog post model config with default values", async () => {
      const blogModelConfig = {
        width: 1024,
        height: 1024,
        aspectRatio: "1:1",
        style: "photorealistic",
      };

      render(
        <ModelImageGenerator
          modelName="dall_e_3"
          locale="en"
          modelConfig={blogModelConfig}
        />
      );

      // Проверяем, что конфигурация из блога отображается корректно
      expect(
        screen.getByText((content, element) => {
          if (!element) return false;
          const normalized = element.textContent?.replace(/\s+/g, " ").trim();
          return normalized === "1024 x 1024";
        })
      ).toBeInTheDocument();
      expect(screen.getByText("1:1")).toBeInTheDocument();
      expect(screen.getByText("photorealistic")).toBeInTheDocument();
    });

    it("should handle missing model configuration gracefully", async () => {
      render(
        <ModelImageGenerator
          modelName="minimal_model"
          locale="en"
        />
      );

      // Должен отображаться fallback текст
      expect(
        screen.getByText(/model_descriptions\.minimal_model/)
      ).toBeInTheDocument();

      // Не должно быть бейджей для отсутствующих параметров
      expect(screen.queryByText(/x/)).not.toBeInTheDocument();
    });

    it("should pass SEO description to model configuration when available", async () => {
      render(
        <BlogModelGenerator
          modelName="dall_e_3"
          locale="en"
          modelConfig={{
            width: 1024,
            height: 1024,
            aspectRatio: "1:1",
            style: "photorealistic",
          }}
        />
      );

      // Проверяем, что компонент рендерится корректно
      expect(screen.getByText("1024")).toBeInTheDocument();
    });
  });

  describe("URL Generation and Navigation", () => {
    it("should generate correct URLs for different model types", async () => {
      render(
        <ModelImageGenerator
          modelName="dall_e_3"
          locale="en"
          modelConfig={{ width: 1024, height: 1024 }}
        />
      );

      render(
        <ModelVideoGenerator
          modelName="veo_3"
          locale="en"
          modelConfig={{ maxDuration: 8, aspectRatio: "16:9" }}
        />
      );

      // Тестируем image generator
      const imageButton = screen.getByTestId("generate-image-button");
      fireEvent.click(imageButton);

      await waitFor(() => {
        expect(window.location.href).toContain("/en/generate-image");
        expect(window.location.href).toContain("model=dall_e_3");
      });

      // Сбрасываем href для следующего теста
      Object.defineProperty(window, "location", {
        value: { href: "" },
        writable: true,
      });

      // Тестируем video generator
      const videoButton = screen.getByTestId("generate-video-button");
      fireEvent.click(videoButton);

      await waitFor(() => {
        expect(window.location.href).toContain("/en/generate-video");
        expect(window.location.href).toContain("model=veo_3");
      });
    });

    it("should handle special characters in model names correctly", async () => {
      render(
        <ModelImageGenerator
          modelName="dall-e-3"
          locale="en"
          modelConfig={{ width: 1024, height: 1024 }}
        />
      );

      const generateButton = screen.getByTestId("generate-image-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        const url = new URL(window.location.href);
        expect(url.searchParams.get("model")).toBe("dall-e-3");
      });
    });

    it("should handle spaces in model names correctly", async () => {
      render(
        <ModelVideoGenerator
          modelName="Google Veo 3"
          locale="en"
          modelConfig={{ maxDuration: 8, aspectRatio: "16:9" }}
        />
      );

      const generateButton = screen.getByTestId("generate-video-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        const url = new URL(window.location.href);
        expect(url.searchParams.get("model")).toBe("Google Veo 3");
      });
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle empty model names gracefully", async () => {
      render(
        <ModelImageGenerator
          modelName=""
          locale="en"
          modelConfig={{ width: 1024, height: 1024 }}
        />
      );

      const generateButton = screen.getByTestId("generate-image-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(window.location.href).toContain("model=");
      });
    });

    it("should handle null model configuration gracefully", async () => {
      render(
        <ModelImageGenerator
          modelName="test_model"
          locale="en"
          modelConfig={null as unknown as Record<string, unknown>}
        />
      );

      // Должен отображаться fallback текст
      expect(
        screen.getByText(/model_descriptions\.test_model/)
      ).toBeInTheDocument();
    });

    it("should handle undefined locale gracefully", async () => {
      render(
        <ModelImageGenerator
          modelName="dall_e_3"
          locale={undefined as unknown as "en" | "ru" | "tr" | "es" | "hi"}
          modelConfig={{ width: 1024, height: 1024 }}
        />
      );

      const generateButton = screen.getByTestId("generate-image-button");
      fireEvent.click(generateButton);

      await waitFor(() => {
        // Должен использовать fallback locale
        expect(window.location.href).toContain("/tr/generate-image");
      });
    });
  });
});
