/* eslint-env node */
import { withContentlayer } from 'next-contentlayer2';
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // Отключаем встроенную проверку ESLint при сборке,
    // так как мы будем запускать линтер отдельно
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true
  },
  env: {
    // Устанавливаем значения по умолчанию для переменных, которые могут отсутствовать
    SUPERDUPERAI_URL: process.env.SUPERDUPERAI_URL || 'https://dev-editor.superduperai.co',
    SUPERDUPERAI_TOKEN: process.env.SUPERDUPERAI_TOKEN || 'placeholder-token',
    AZURE_OPENAI_RESOURCE_NAME: process.env.AZURE_OPENAI_RESOURCE_NAME || 'placeholder-resource',
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY || 'placeholder-key',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder',
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED || 'postgresql://placeholder',
    PGHOST: process.env.PGHOST || 'localhost',
    PGHOST_UNPOOLED: process.env.PGHOST_UNPOOLED || 'localhost',
    PGUSER: process.env.PGUSER || 'placeholder',
    PGDATABASE: process.env.PGDATABASE || 'placeholder',
    PGPASSWORD: process.env.PGPASSWORD || 'placeholder',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  // Use standalone output for optimized builds unless NEXT_STANDALONE is "false"
  output: process.env.NEXT_STANDALONE === 'false' ? undefined : 'standalone',
  // Настройки экспериментальных функций
  experimental: {
    // Оптимизация импортов пакетов
    optimizePackageImports: [
      'react', 
      'react-dom',
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-slot',
      'clsx',
      'tailwind-merge'
    ]
  },
  // Внешние пакеты для серверных компонентов
  serverExternalPackages: ['mdx-bundler'],
  // Конфигурация для Turbopack в Next.js 15.3
  turbopack: {
    // Определяем алиасы для путей
    resolveAlias: {
      '@': path.resolve('./src'),
    },
    // Расширения файлов для автоматического разрешения
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  // Увеличиваем таймаут для статической генерации
  staticPageGenerationTimeout: 120,
  // Настройки производительности
  poweredByHeader: false, // Удаляем заголовок X-Powered-By
  // Отключаем source maps в production
  productionBrowserSourceMaps: false,
  // Настройки для Cloudflare
  webpack: (config, { isServer, webpack }) => {
    // Помогает с совместимостью MDX в Cloudflare
    if (isServer) {
      config.externals = [...config.externals, 'esbuild'];
    }
    
    // Исправляем process для mdx-bundler в браузере
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: false,
        fs: false,
        os: false,
        path: false,
        crypto: false,
        stream: false,
        assert: false,
        http: false,
        https: false,
        url: false,
        zlib: false,
      };
      
              // Добавляем полифилл process для браузера
        config.plugins.push(
          new webpack.ProvidePlugin({
            process: 'process/browser',
          })
        );
    }
    
    // Игнорируем предупреждения ContentLayer
    config.infrastructureLogging = {
      level: 'error',
      ...config.infrastructureLogging,
    };
    
    return config;
  },
};

export default withContentlayer(nextConfig);