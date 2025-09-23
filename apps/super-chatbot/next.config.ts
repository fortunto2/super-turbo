import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Включаем экспериментальные функции для лучшей совместимости
  experimental: {
    // Включаем оптимизации производительности
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "framer-motion",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
    // Включаем поддержку турборепозитория
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      {
        hostname: "superduper-acdagaa3e2h7chh0.z02.azurefd.net",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  webpack: (config, { isServer, dev }) => {
    // Игнорируем предупреждения о критических зависимостях для @opentelemetry
    config.ignoreWarnings = [
      {
        module: /node_modules\/@opentelemetry\/instrumentation/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    // Исправляем проблему с 'self is not defined' в server-side рендеринге
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Добавляем глобальные переменные для совместимости
    const webpack = require("webpack");
    config.plugins.push(
      new webpack.DefinePlugin({
        global: "globalThis",
      })
    );

    // Оптимизации для production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            // AI SDK и связанные библиотеки
            ai: {
              test: /[\\/]node_modules[\\/](ai|@ai-sdk|@ai-sdk-react)[\\/]/,
              name: "ai-vendor",
              chunks: "all",
              priority: 30,
            },
            // UI библиотеки
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|framer-motion|class-variance-authority|clsx|tailwind-merge)[\\/]/,
              name: "ui-vendor",
              chunks: "all",
              priority: 25,
            },
            // React и связанные
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-hook-form|@hookform)[\\/]/,
              name: "react-vendor",
              chunks: "all",
              priority: 20,
            },
            // Остальные vendor библиотеки
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
            // Общие компоненты приложения
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "superduperai",
  project: "super-chat",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
