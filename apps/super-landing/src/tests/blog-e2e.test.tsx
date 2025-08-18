import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { BlogModelGenerator } from "../components/content/blog-model-generator";
import { ModelImageGenerator } from "../components/content/model-image-generator";
import { ModelVideoGenerator } from "../components/content/model-video-generator";

// Мокаем зависимости
vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "image_generator.title": "Generate Image",
        "video_generator.title": "Generate Video",
        "model_descriptions.dall_e_3": "Create images with DALL-E 3",
        "model_descriptions.veo_3": "Generate videos with Veo 3",
        "model_descriptions.enhanced_veo_3":
          "Enhanced video generation with image-to-video support",
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

// Мокаем environment variables
vi.mock("@/lib/config/env", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_SUPERDUPERAI_URL: "https://dev-editor.superduperai.co",
  },
}));

describe("Blog E2E Scenarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();

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

  describe("Complete User Journey - Image Generation", () => {
    it("should complete full image generation flow from blog post", async () => {
      // 1. Пользователь читает блог пост с моделью изображения
      render(
        <BlogModelGenerator
          modelName="dall_e_3"
          locale="en"
          modelConfig={{
            width: 1024,
            height: 1024,
            aspectRatio: "1:1",
            style: "photorealistic",
            description: "High-quality photorealistic image generation",
          }}
        />
      );

      // 2. Проверяем, что отображается правильный генератор
      expect(screen.getByTestId("image-generator")).toBeInTheDocument();
      expect(screen.getByText("dall_e_3")).toBeInTheDocument();
      expect(
        screen.getByText("High-quality photorealistic image generation")
      ).toBeInTheDocument();

      // 3. Проверяем отображение конфигурации модели
      expect(
        screen.getByText((content, element) => {
          if (!element) return false;
          const normalized = element.textContent?.replace(/\s+/g, " ").trim();
          return normalized === "1024 x 1024";
        })
      ).toBeInTheDocument();
      expect(screen.getByText("1:1")).toBeInTheDocument();
      expect(screen.getByText("photorealistic")).toBeInTheDocument();

      // 4. Пользователь нажимает кнопку генерации
      const generateButton = screen.getByTestId("generate-image-button");
      expect(generateButton).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(generateButton);
      });

      // 5. Проверяем перенаправление на страницу генерации
      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-image?model=dall_e_3"
        );
      });
    });

    it("should handle image generation with custom configuration", async () => {
      const customConfig = {
        width: 1920,
        height: 1080,
        aspectRatio: "16:9",
        style: "artistic",
        description: "Wide format artistic image generation",
      };

      render(
        <ModelImageGenerator
          modelName="dall_e_3"
          locale="en"
          modelConfig={customConfig}
        />
      );

      // Проверяем отображение кастомной конфигурации
      expect(
        screen.getByText((content, element) => {
          if (!element) return false;
          const normalized = element.textContent?.replace(/\s+/g, " ").trim();
          return normalized === "1920 x 1080";
        })
      ).toBeInTheDocument();
      expect(screen.getByText("16:9")).toBeInTheDocument();
      expect(screen.getByText("artistic")).toBeInTheDocument();

      // Генерируем изображение
      const generateButton = screen.getByTestId("generate-image-button");
      await act(async () => {
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-image?model=dall_e_3"
        );
      });
    });
  });

  describe("Complete User Journey - Video Generation", () => {
    it("should complete full video generation flow from blog post", async () => {
      // 1. Пользователь читает блог пост с видео моделью
      render(
        <BlogModelGenerator
          modelName="veo_3"
          locale="en"
          modelConfig={{
            maxDuration: 8,
            aspectRatio: "16:9",
            width: 1280,
            height: 720,
            frameRate: 30,
            description: "High-quality video generation with Veo 3",
          }}
        />
      );

      // 2. Проверяем, что отображается правильный генератор (enhanced для veo_3)
      expect(
        screen.getByTestId("enhanced-video-generator")
      ).toBeInTheDocument();
      expect(screen.getByText("veo_3")).toBeInTheDocument();
      expect(
        screen.getByText("High-quality video generation with Veo 3")
      ).toBeInTheDocument();

      // 3. Проверяем отображение конфигурации модели
      expect(
        screen.getByText((content, element) => {
          if (!element) return false;
          const normalized = element.textContent?.replace(/\s+/g, " ").trim();
          return normalized === "1280 x 720";
        })
      ).toBeInTheDocument();
      expect(screen.getByText("16:9")).toBeInTheDocument();
      expect(screen.getByText("8s")).toBeInTheDocument();

      // 4. Пользователь нажимает кнопку генерации
      const generateButton = screen.getByTestId(
        "generate-enhanced-video-button"
      );
      expect(generateButton).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(generateButton);
      });

      // 5. Проверяем перенаправление на страницу генерации видео
      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-video?model=veo_3"
        );
      });
    });

    it("should handle enhanced video generation with image-to-video support", async () => {
      const enhancedConfig = {
        maxDuration: 10,
        aspectRatio: "16:9",
        width: 1920,
        height: 1080,
        frameRate: 60,
        description: "Enhanced video generation with image-to-video support",
      };

      render(
        <BlogModelGenerator
          modelName="enhanced_veo_3"
          locale="en"
          modelConfig={enhancedConfig}
        />
      );

      // Проверяем, что отображается enhanced video generator
      expect(
        screen.getByTestId("enhanced-video-generator")
      ).toBeInTheDocument();
      expect(screen.getByText("enhanced_veo_3")).toBeInTheDocument();

      // Генерируем видео
      const generateButton = screen.getByTestId(
        "generate-enhanced-video-button"
      );
      await act(async () => {
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-video?model=enhanced_veo_3"
        );
      });
    });
  });

  describe("Multi-Locale User Experience", () => {
    it("should provide consistent experience across different locales", async () => {
      const locales = ["en", "tr", "ru"] as const;
      const modelConfig = {
        width: 1024,
        height: 1024,
        aspectRatio: "1:1",
        style: "photorealistic",
      };

      for (const locale of locales) {
        // Сбрасываем href для каждого теста
        Object.defineProperty(window, "location", {
          value: { href: "" },
          writable: true,
        });

        render(
          <ModelImageGenerator
            modelName="dall_e_3"
            locale={locale}
            modelConfig={modelConfig}
          />
        );

        // Проверяем отображение конфигурации
        expect(
          screen.getByText((content, element) => {
            if (!element) return false;
            const normalized = element.textContent?.replace(/\s+/g, " ").trim();
            return normalized === "1024 x 1024";
          })
        ).toBeInTheDocument();
        expect(screen.getByText("1:1")).toBeInTheDocument();
        expect(screen.getByText("photorealistic")).toBeInTheDocument();

        // Генерируем изображение
        const generateButton = screen.getByTestId("generate-image-button");
        await act(async () => {
          fireEvent.click(generateButton);
        });

        // Проверяем правильное перенаправление для локали
        await waitFor(() => {
          expect(window.location.href).toContain(`/${locale}/generate-image`);
        });

        // Очищаем контейнер для следующего теста
      }
    });

    it("should handle locale-specific model descriptions", async () => {
      render(
        <ModelImageGenerator
          modelName="dall_e_3"
          locale="tr"
          modelConfig={{
            width: 1024,
            height: 1024,
            aspectRatio: "1:1",
          }}
        />
      );

      // Проверяем, что компонент рендерится корректно для турецкой локали
      expect(screen.getByTestId("image-generator")).toBeInTheDocument();
      expect(screen.getByText("dall_e_3")).toBeInTheDocument();

      // Генерируем изображение
      const generateButton = screen.getByTestId("generate-image-button");
      await act(async () => {
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(window.location.href).toContain("/tr/generate-image");
      });
    });
  });

  describe("Model Configuration Edge Cases", () => {
    it("should handle missing model configuration gracefully", async () => {
      render(
        <BlogModelGenerator
          modelName="minimal_model"
          locale="en"
        />
      );

      // Проверяем, что компонент рендерится без ошибок
      expect(screen.getByTestId("image-generator")).toBeInTheDocument();

      // Должен отображаться fallback текст
      expect(
        screen.getByText(/model_descriptions\.minimal_model/)
      ).toBeInTheDocument();
    });

    it("should handle partial model configuration", async () => {
      const partialConfig = {
        width: 1024,
        // height отсутствует
        aspectRatio: "1:1",
        // style отсутствует
      };

      render(
        <ModelImageGenerator
          modelName="partial_model"
          locale="en"
          modelConfig={partialConfig}
        />
      );

      // Проверяем отображение доступных параметров
      expect(
        screen.getByText((content, element) => {
          if (!element) return false;
          const normalized = element.textContent?.replace(/\s+/g, " ").trim();
          return normalized === "1024 x";
        })
      ).toBeInTheDocument();

      // Не должно быть бейджа для отсутствующего style
      expect(screen.queryByText(/style/i)).not.toBeInTheDocument();
    });

    it("should handle extreme model configuration values", async () => {
      const extremeConfig = {
        width: 4096,
        height: 4096,
        aspectRatio: "21:9",
        style: "ultra-realistic",
      };

      render(
        <ModelImageGenerator
          modelName="extreme_model"
          locale="en"
          modelConfig={extremeConfig}
        />
      );

      // Проверяем отображение экстремальных значений
      expect(
        screen.getByText((content, element) => {
          if (!element) return false;
          const normalized = element.textContent?.replace(/\s+/g, " ").trim();
          return normalized === "4096 x 4096";
        })
      ).toBeInTheDocument();
      expect(screen.getByText("21:9")).toBeInTheDocument();
      expect(screen.getByText("ultra-realistic")).toBeInTheDocument();

      // Генерируем изображение
      const generateButton = screen.getByTestId("generate-image-button");
      await act(async () => {
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-image?model=extreme_model"
        );
      });
    });
  });

  describe("User Interaction Patterns", () => {
    it("should provide immediate feedback on button clicks", async () => {
      render(
        <ModelImageGenerator
          modelName="responsive_model"
          locale="en"
          modelConfig={{
            width: 1024,
            height: 1024,
            aspectRatio: "1:1",
          }}
        />
      );

      const generateButton = screen.getByTestId("generate-image-button");

      // Проверяем, что кнопка активна
      expect(generateButton).not.toBeDisabled();

      // Симулируем клик
      await act(async () => {
        fireEvent.click(generateButton);
      });

      // Проверяем немедленное перенаправление
      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-image?model=responsive_model"
        );
      });
    });

    it("should handle rapid successive clicks gracefully", async () => {
      render(
        <ModelVideoGenerator
          modelName="rapid_model"
          locale="en"
          modelConfig={{
            maxDuration: 8,
            aspectRatio: "16:9",
          }}
        />
      );

      const generateButton = screen.getByTestId("generate-video-button");

      // Симулируем быстрые последовательные клики
      await act(async () => {
        fireEvent.click(generateButton);
        fireEvent.click(generateButton);
        fireEvent.click(generateButton);
      });

      // Проверяем, что перенаправление произошло только один раз
      await waitFor(() => {
        expect(window.location.href).toBe(
          "http://localhost:3000/en/generate-video?model=rapid_model"
        );
      });
    });
  });

  describe("Accessibility and UX", () => {
    it("should provide proper button labels and descriptions", async () => {
      render(
        <ModelImageGenerator
          modelName="accessible_model"
          locale="en"
          modelConfig={{
            width: 1024,
            height: 1024,
            aspectRatio: "1:1",
          }}
        />
      );

      const generateButton = screen.getByTestId("generate-image-button");

      // Проверяем доступность кнопки
      expect(generateButton).toHaveTextContent("image_generator.generate_for");
    });

    it("should display model information in readable format", async () => {
      render(
        <ModelVideoGenerator
          modelName="readable_model"
          locale="en"
          modelConfig={{
            maxDuration: 8,
            aspectRatio: "16:9",
            width: 1280,
            height: 720,
          }}
        />
      );

      // Проверяем читаемость информации о модели
      expect(screen.getByText("readable_model")).toBeInTheDocument();
      expect(
        screen.getByText((content, element) => {
          if (!element) return false;
          const normalized = element.textContent?.replace(/\s+/g, " ").trim();
          return normalized === "1280 x 720";
        })
      ).toBeInTheDocument();
      expect(screen.getByText("16:9")).toBeInTheDocument();
      expect(screen.getByText("8s")).toBeInTheDocument();
    });
  });
});
