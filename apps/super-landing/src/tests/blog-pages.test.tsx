import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
// Мокаем .contentlayer/generated
const allBlogs = [
  {
    slug: "test-blog-post",
    locale: "en",
    title: "Test Blog Post",
    description: "A test blog post for testing",
    body: {
      raw: "# Test Heading\n\nThis is test content.",
      code: "<h1>Test Heading</h1><p>This is test content.</p>",
    },
    seo: {
      title: "SEO Test Title",
      description: "SEO test description",
      keywords: ["test", "blog", "ai"],
      ogImage: "/test-image.jpg",
    },
    modelName: "dall_e_3",
    modelConfig: {
      width: 1024,
      height: 1024,
      aspectRatio: "1:1",
      style: "photorealistic",
    },
  },
  {
    slug: "video-blog-post",
    locale: "en",
    title: "Video Blog Post",
    description: "A blog post about video generation",
    body: {
      raw: "# Video Generation\n\nLearn about video generation.",
      code: "<h1>Video Generation</h1><p>Learn about video generation.</p>",
    },
    seo: {
      title: "Video Generation Blog",
      description: "Learn about AI video generation",
      keywords: ["video", "ai", "generation"],
      ogImage: "/video-image.jpg",
    },
    modelName: "veo_3",
    modelConfig: {
      maxDuration: 8,
      aspectRatio: "16:9",
      width: 1280,
      height: 720,
    },
  },
  {
    slug: "enhanced-video-post",
    locale: "en",
    title: "Enhanced Video Post",
    description: "A blog post about enhanced video generation",
    body: {
      raw: "# Enhanced Video\n\nAdvanced video generation features.",
      code: "<h1>Enhanced Video</h1><p>Advanced video generation features.</p>",
    },
    seo: {
      title: "Enhanced Video Generation",
      description: "Advanced AI video generation with image-to-video",
      keywords: ["enhanced", "video", "ai"],
      ogImage: "/enhanced-video.jpg",
    },
    modelName: "enhanced_veo_3",
    modelConfig: {
      maxDuration: 10,
      aspectRatio: "16:9",
      width: 1920,
      height: 1080,
    },
  },
  {
    slug: "no-model-post",
    locale: "en",
    title: "Post Without Model",
    description: "A blog post without model configuration",
    body: {
      raw: "# No Model\n\nThis post has no model.",
      code: "<h1>No Model</h1><p>This post has no model.</p>",
    },
    seo: {
      title: "No Model Post",
      description: "A post without model configuration",
      keywords: ["blog", "post"],
      ogImage: null,
    },
  },
];
// Мокаем компоненты страницы
const mockBlogPostPage = vi.fn();
const mockGenerateMetadata = vi.fn();

// Мокаем зависимости
vi.mock(".contentlayer/generated", () => ({
  allBlogs: [
    {
      slug: "test-blog-post",
      locale: "en",
      title: "Test Blog Post",
      description: "A test blog post for testing",
      body: {
        raw: "# Test Heading\n\nThis is test content.",
        code: "<h1>Test Heading</h1><p>This is test content.</p>",
      },
      seo: {
        title: "SEO Test Title",
        description: "SEO test description",
        keywords: ["test", "blog", "ai"],
        ogImage: "/test-image.jpg",
      },
      modelName: "dall_e_3",
      modelConfig: {
        width: 1024,
        height: 1024,
        aspectRatio: "1:1",
        style: "photorealistic",
      },
    },
    {
      slug: "video-blog-post",
      locale: "en",
      title: "Video Blog Post",
      description: "A blog post about video generation",
      body: {
        raw: "# Video Generation\n\nLearn about video generation.",
        code: "<h1>Video Generation</h1><p>Learn about video generation.</p>",
      },
      seo: {
        title: "Video Generation Blog",
        description: "Learn about AI video generation",
        keywords: ["video", "ai", "generation"],
        ogImage: "/video-image.jpg",
      },
      modelName: "veo_3",
      modelConfig: {
        maxDuration: 8,
        aspectRatio: "16:9",
        width: 1280,
        height: 720,
      },
    },
    {
      slug: "enhanced-video-post",
      locale: "en",
      title: "Enhanced Video Post",
      description: "A blog post about enhanced video generation",
      body: {
        raw: "# Enhanced Video\n\nAdvanced video generation features.",
        code: "<h1>Enhanced Video</h1><p>Advanced video generation features.</p>",
      },
      seo: {
        title: "Enhanced Video Generation",
        description: "Advanced AI video generation with image-to-video",
        keywords: ["enhanced", "video", "ai"],
        ogImage: "/enhanced-video.jpg",
      },
      modelName: "enhanced_veo_3",
      modelConfig: {
        maxDuration: 10,
        aspectRatio: "16:9",
        width: 1920,
        height: 1080,
      },
    },
    {
      slug: "no-model-post",
      locale: "en",
      title: "Post Without Model",
      description: "A blog post without model configuration",
      body: {
        raw: "# No Model\n\nThis post has no model.",
        code: "<h1>No Model</h1><p>This post has no model.</p>",
      },
      seo: {
        title: "No Model Post",
        description: "A post without model configuration",
        keywords: ["blog", "post"],
        ogImage: null,
      },
    },
  ],
}));

vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "navbar.home": "Home",
        "navbar.blog": "Blog",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("@/components/content/mdx-components", () => ({
  MDXContent: ({ code }: { code: string }) => (
    <div
      data-testid="mdx-content"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  ),
}));

vi.mock("@/components/content/page-wrapper", () => ({
  PageWrapper: ({
    children,
    title,
    breadcrumbItems,
    hasH1Heading,
  }: {
    children: React.ReactNode;
    title: string;
    breadcrumbItems?: Array<{ label: string; href: string }>;
    hasH1Heading: boolean;
  }) => (
    <div data-testid="page-wrapper">
      <h1 data-testid="page-title">{title}</h1>
      <nav data-testid="breadcrumbs">
        {breadcrumbItems?.map(
          (item: { label: string; href: string }, index: number) => (
            <a
              key={index}
              href={item.href}
              data-testid={`breadcrumb-${index}`}
            >
              {item.label}
            </a>
          )
        )}
      </nav>
      <div data-testid="h1-heading-status">
        {hasH1Heading ? "Has H1" : "No H1"}
      </div>
      {children}
    </div>
  ),
}));

vi.mock("@/components/content/blog-model-generator", () => ({
  BlogModelGenerator: ({
    modelName,
    modelConfig,
    locale,
  }: {
    modelName: string;
    modelConfig: Record<string, unknown>;
    locale: string;
  }) => (
    <div data-testid="blog-model-generator">
      <div data-testid="model-name">{modelName}</div>
      <div data-testid="model-config">{JSON.stringify(modelConfig)}</div>
      <div data-testid="model-locale">{locale}</div>
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

// Мокаем страницу блога
vi.mock("@/app/[locale]/blog/[slug]/page", () => ({
  default: mockBlogPostPage,
  generateMetadata: mockGenerateMetadata,
}));

describe("Blog Pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateMetadata", () => {
    it("should generate metadata for blog post with model", async () => {
      const params = Promise.resolve({ slug: "test-blog-post", locale: "en" });
      const metadata = await mockGenerateMetadata({ params });

      expect(metadata).toEqual({
        title: "SEO Test Title",
        description: "SEO test description",
        keywords: ["test", "blog", "ai"],
        openGraph: {
          images: ["/test-image.jpg"],
        },
        other: {
          "page-type": "blog",
          category: "Blog",
          gradient: expect.any(String),
        },
      });
    });

    it("should generate metadata for blog post without SEO data", async () => {
      const params = Promise.resolve({ slug: "no-model-post", locale: "en" });
      const metadata = await mockGenerateMetadata({ params });

      expect(metadata).toEqual({
        title: "Post Without Model",
        description: "A blog post without model configuration",
        keywords: ["blog", "post"],
        openGraph: {
          images: [],
        },
        other: {
          "page-type": "blog",
          category: "Blog",
          gradient: expect.any(String),
        },
      });
    });

    it("should handle missing blog post gracefully", async () => {
      const params = Promise.resolve({
        slug: "non-existent-post",
        locale: "en",
      });
      const metadata = await mockGenerateMetadata({ params });

      expect(metadata).toEqual({});
    });
  });

  describe("BlogPostPage", () => {
    it("should render blog post with image model generator", async () => {
      const params = Promise.resolve({ slug: "test-blog-post", locale: "en" });
      render(await mockBlogPostPage({ params }));

      expect(screen.getByTestId("page-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("page-title")).toHaveTextContent(
        "Test Blog Post"
      );
      expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
      expect(screen.getByTestId("blog-model-generator")).toBeInTheDocument();
      expect(screen.getByTestId("model-name")).toHaveTextContent("dall_e_3");
      expect(screen.getByTestId("h1-heading-status")).toHaveTextContent(
        "Has H1"
      );
    });

    it("should render blog post with video model generator", async () => {
      const params = Promise.resolve({ slug: "video-blog-post", locale: "en" });
      render(await mockBlogPostPage({ params }));

      expect(screen.getByTestId("blog-model-generator")).toBeInTheDocument();
      expect(screen.getByTestId("model-name")).toHaveTextContent("veo_3");
      expect(screen.getByTestId("model-config")).toContain('"maxDuration":8');
    });

    it("should render blog post with enhanced video model generator", async () => {
      const params = Promise.resolve({
        slug: "enhanced-video-post",
        locale: "en",
      });
      render(await mockBlogPostPage({ params }));

      expect(screen.getByTestId("blog-model-generator")).toBeInTheDocument();
      expect(screen.getByTestId("model-name")).toHaveTextContent(
        "enhanced_veo_3"
      );
      expect(screen.getByTestId("model-config")).toContain('"maxDuration":10');
    });

    it("should render blog post without model generator", async () => {
      const params = Promise.resolve({ slug: "no-model-post", locale: "en" });
      render(await mockBlogPostPage({ params }));

      expect(screen.getByTestId("page-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("page-title")).toHaveTextContent(
        "Post Without Model"
      );
      expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
      expect(
        screen.queryByTestId("blog-model-generator")
      ).not.toBeInTheDocument();
    });

    it("should render breadcrumbs correctly", async () => {
      const params = Promise.resolve({ slug: "test-blog-post", locale: "en" });
      render(await mockBlogPostPage({ params }));

      expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
      expect(screen.getByTestId("breadcrumb-0")).toHaveTextContent("Home");
      expect(screen.getByTestId("breadcrumb-1")).toHaveTextContent("Blog");
      expect(screen.getByTestId("breadcrumb-2")).toHaveTextContent(
        "Test Blog Post"
      );
    });

    it("should handle different locales correctly", async () => {
      const params = Promise.resolve({ slug: "test-blog-post", locale: "tr" });
      render(await mockBlogPostPage({ params }));

      expect(screen.getByTestId("blog-model-generator")).toBeInTheDocument();
      expect(screen.getByTestId("model-locale")).toHaveTextContent("tr");
    });

    it("should detect H1 headings in MDX content correctly", async () => {
      const params = Promise.resolve({ slug: "test-blog-post", locale: "en" });
      render(await mockBlogPostPage({ params }));

      expect(screen.getByTestId("h1-heading-status")).toHaveTextContent(
        "Has H1"
      );
    });

    it("should detect missing H1 headings in MDX content", async () => {
      // Создаем пост без H1 заголовка
      const postWithoutH1 = {
        slug: "no-h1-post",
        locale: "en",
        title: "Post Without H1",
        description: "A post without H1 heading",
        body: {
          raw: "This content has no H1 heading.",
          code: "<p>This content has no H1 heading.</p>",
        },
        seo: {
          title: "No H1 Post",
          description: "A post without H1 heading",
          keywords: ["blog", "post"],
          ogImage: null,
        },
      };

      // Мокаем allBlogs для этого теста
      vi.mocked(allBlogs).push(postWithoutH1);

      const params = Promise.resolve({ slug: "no-h1-post", locale: "en" });
      render(await mockBlogPostPage({ params }));

      expect(screen.getByTestId("h1-heading-status")).toHaveTextContent(
        "No H1"
      );
    });

    it("should pass correct model configuration to generator", async () => {
      const params = Promise.resolve({ slug: "test-blog-post", locale: "en" });
      render(await mockBlogPostPage({ params }));

      const modelConfig = screen.getByTestId("model-config");
      const configData = JSON.parse(modelConfig.textContent || "{}");

      expect(configData).toEqual({
        width: 1024,
        height: 1024,
        aspectRatio: "1:1",
        style: "photorealistic",
        description: "SEO test description",
      });
    });

    it("should handle fallback locale when post not found in current locale", async () => {
      // Создаем пост только на турецком языке
      const turkishPost = {
        slug: "turkish-only-post",
        locale: "tr",
        title: "Turkish Post",
        description: "A post only in Turkish",
        body: {
          raw: "# Turkish Post\n\nThis is a Turkish post.",
          code: "<h1>Turkish Post</h1><p>This is a Turkish post.</p>",
        },
        seo: {
          title: "Turkish Post",
          description: "A post only in Turkish",
          keywords: ["turkish", "post"],
          ogImage: null,
        },
      };

      // Мокаем allBlogs для этого теста
      vi.mocked(allBlogs).push(turkishPost);

      // Пытаемся получить пост на английском языке
      const params = Promise.resolve({
        slug: "turkish-only-post",
        locale: "en",
      });
      render(await mockBlogPostPage({ params }));

      // Должен отобразиться пост на турецком языке как fallback
      expect(screen.getByTestId("page-title")).toHaveTextContent(
        "Turkish Post"
      );
    });
  });

  describe("H1 Detection Function", () => {
    // Функция для проверки наличия H1 в MDX контенте
    function checkForH1InMDX(code: string): boolean {
      // Проверяем наличие строки, начинающейся с # в начале строки
      return /^#\s+/m.test(code);
    }

    it("should detect H1 headings at start of line", () => {
      expect(checkForH1InMDX("# Test Heading")).toBe(true);
      expect(checkForH1InMDX("# Another Heading\n\nContent")).toBe(true);
      expect(checkForH1InMDX("Content\n# Heading")).toBe(true);
    });

    it("should not detect H1 headings in middle of content", () => {
      expect(checkForH1InMDX("Text # Not H1")).toBe(false);
      expect(checkForH1InMDX("Content\nText # Not H1\nMore")).toBe(false);
    });

    it("should handle empty content", () => {
      expect(checkForH1InMDX("")).toBe(false);
      expect(checkForH1InMDX("\n\n")).toBe(false);
    });
  });
});
