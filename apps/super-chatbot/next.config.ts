import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Отключаем проверку переменных окружения во время сборки
  env: {
    // Устанавливаем значения по умолчанию для переменных, которые могут отсутствовать
    SUPERDUPERAI_URL:
      process.env.SUPERDUPERAI_URL || 'https://dev-editor.superduperai.co',
    SUPERDUPERAI_TOKEN: process.env.SUPERDUPERAI_TOKEN || 'placeholder-token',
    AZURE_OPENAI_RESOURCE_NAME:
      process.env.AZURE_OPENAI_RESOURCE_NAME || 'placeholder-resource',
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || 'placeholder-key',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
    STRIPE_WEBHOOK_SECRET:
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  // Настройки для правильной генерации манифестов
  // NOTE: 'standalone' output disabled due to Windows symlink permission issues
  // Enable for Docker/production deployments only
  // output: 'standalone',
  // Включаем экспериментальные функции для лучшей совместимости
  experimental: {
    // Включаем оптимизации производительности
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
  },
  // Включаем поддержку Turbopack (new stable API)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'superduper-acdagaa3e2h7chh0.z02.azurefd.net',
      },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  webpack: (config, { isServer, dev }) => {
    // Игнорируем тестовые файлы и зависимости
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // Игнорируем тестовые файлы
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader',
    });

    // Игнорируем папку tests
    config.module.rules.push({
      test: /[\\/]tests[\\/]/,
      loader: 'ignore-loader',
    });

    // Исключаем vitest и тестовые библиотеки из сборки (только на сервере)
    if (isServer && !dev) {
      // Добавляем тестовые пакеты в externals, чтобы они не включались в бандл
      if (!Array.isArray(config.externals)) {
        config.externals = config.externals ? [config.externals] : [];
      }
      config.externals.push(
        /^vitest/,
        /^@vitest\//,
        /^@testing-library\//,
        '@testing-library/jest-dom',
      );
    }

    // Игнорируем предупреждения о критических зависимостях для @opentelemetry
    config.ignoreWarnings = [
      {
        module: /node_modules\/@opentelemetry\/instrumentation/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
      // Игнорируем ошибки с 'self is not defined' - не критично для работы приложения
      {
        message: /self is not defined/,
      },
    ];

    // Fix for p-limit v5 subpath imports (#async_hooks)
    // Use a custom webpack plugin to handle subpath imports
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (class {
        apply(compiler: any) {
          compiler.hooks.normalModuleFactory.tap(
            'SubpathImportsPlugin',
            (nmf: any) => {
              nmf.hooks.beforeResolve.tap(
                'SubpathImportsPlugin',
                (resolveData: any) => {
                  if (resolveData.request === '#async_hooks') {
                    resolveData.request = 'async_hooks';
                  }
                },
              );
            },
          );
        }
      })(),
    );

    // Добавляем полифилл для 'self' на сервере
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Оптимизации для production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            // AI SDK и связанные библиотеки
            ai: {
              test: /[\\/]node_modules[\\/](ai|@ai-sdk|@ai-sdk-react)[\\/]/,
              name: 'ai-vendor',
              chunks: 'all',
              priority: 30,
            },
            // UI библиотеки
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|framer-motion|class-variance-authority|clsx|tailwind-merge)[\\/]/,
              name: 'ui-vendor',
              chunks: 'all',
              priority: 25,
            },
            // React и связанные
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-hook-form|@hookform)[\\/]/,
              name: 'react-vendor',
              chunks: 'all',
              priority: 20,
            },
            // Остальные vendor библиотеки
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Общие компоненты приложения
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
              priority: 5,
            },
          },
        },
        // Включаем tree shaking
        usedExports: true,
        sideEffects: false,
      };
    } else {
      // В dev режиме отключаем некоторые оптимизации для ускорения сборки
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

    return config;
  },
};

// Only wrap with Sentry config if DSN is configured and in production/CI
const shouldUseSentry =
  (process.env.NODE_ENV === 'production' || process.env.CI) &&
  process.env.NEXT_PUBLIC_SENTRY_DSN;

export default shouldUseSentry
  ? withSentryConfig(nextConfig, {
      org: 'superduperai',
      project: 'super-chatbot',
      silent: !process.env.CI,

      sourcemaps: {
        disable: false,
      },

      widenClientFileUpload: true,

      disableLogger: true,
    })
  : nextConfig;
