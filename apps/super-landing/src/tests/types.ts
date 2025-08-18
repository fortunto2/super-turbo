// Типы для тестирования генераторов картинок и видео

export interface TestModelConfig {
  width?: number;
  height?: number;
  aspectRatio?: string;
  style?: string;
  shotSize?: string;
  description?: string;
  maxDuration?: number;
  frameRate?: number;
}

export interface TestBlogPost {
  slug: string;
  locale: string;
  title: string;
  description: string;
  body: {
    raw: string;
    code: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string | null;
  };
  modelName?: string;
  modelConfig?: TestModelConfig;
}

export interface TestGeneratorProps {
  modelName: string;
  locale?: string;
  modelConfig?: TestModelConfig;
}

export interface TestMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  openGraph?: {
    images?: string[];
  };
  other?: Record<string, any>;
}

// Типы для моков
export interface MockTranslationHook {
  t: (key: string) => string;
}

export interface MockModelsConfig {
  getModelType: (modelName: string) => "image" | "video";
  supportsImageToVideo: (modelName: string) => boolean;
}

// Типы для тестовых данных
export interface TestCase {
  name: string;
  props: TestGeneratorProps;
  expected: {
    rendered: boolean;
    content?: string[];
    redirectUrl?: string;
  };
}

export interface TestScenario {
  description: string;
  setup: () => void;
  action: () => void;
  assertion: () => void;
  cleanup?: () => void;
}

// Типы для E2E тестов
export interface UserJourney {
  name: string;
  steps: TestStep[];
  expectedOutcome: string;
}

export interface TestStep {
  action: string;
  expectedResult: string;
  validation: () => boolean;
}

// Типы для API тестов
export interface ApiTestConfig {
  baseUrl: string;
  endpoints: {
    image: string;
    video: string;
    enhancedVideo: string;
  };
  headers: Record<string, string>;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  status: number;
}

// Типы для локализации тестов
export interface LocaleTestConfig {
  locales: string[];
  fallbackLocale: string;
  translations: Record<string, Record<string, string>>;
}

// Типы для accessibility тестов
export interface AccessibilityTest {
  component: string;
  requirements: string[];
  testCases: {
    description: string;
    selector: string;
    expected: string;
  }[];
}

// Типы для performance тестов
export interface PerformanceTest {
  component: string;
  metrics: {
    renderTime: number;
    memoryUsage: number;
    bundleSize: number;
  };
  thresholds: {
    maxRenderTime: number;
    maxMemoryUsage: number;
    maxBundleSize: number;
  };
}

// Утилиты для тестов
export type TestUtils = {
  renderComponent: (props: TestGeneratorProps) => any;
  simulateUserAction: (action: string, element: any) => void;
  validateOutput: (expected: any, actual: any) => boolean;
  cleanup: () => void;
};

// Типы для моков компонентов
export interface MockComponentProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export interface MockComponent {
  (props: MockComponentProps): JSX.Element;
  displayName?: string;
}

// Типы для тестовых окружений
export interface TestEnvironment {
  name: string;
  setup: () => Promise<void>;
  teardown: () => Promise<void>;
  mocks: Record<string, any>;
}

// Типы для coverage отчетов
export interface CoverageReport {
  total: number;
  covered: number;
  uncovered: number;
  percentage: number;
  files: Record<
    string,
    {
      lines: number;
      functions: number;
      branches: number;
      statements: number;
    }
  >;
}
