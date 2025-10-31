/**
 * Утилиты для lazy loading компонентов
 * Уменьшают initial bundle size за счет загрузки компонентов по требованию
 */

'use client';

import { lazy, type ComponentType, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Компонент загрузки
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="ml-2 text-sm text-muted-foreground">Загрузка...</span>
    </div>
  );
}

// HOC для lazy loading с fallback
export function withLazyLoading<T extends ComponentType<any>>(
  importFunc: () => Promise<any>,
  fallback?: ComponentType,
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: any) {
    const FallbackComponent = fallback || LoadingSpinner;

    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Предустановленные lazy компоненты для часто используемых модулей
export const LazyImageGenerator = withLazyLoading(
  () => import('@/app/tools/image-generator/components/image-generator-form'),
);

export const LazyVideoGenerator = withLazyLoading(
  () => import('@/app/tools/video-generator/components/video-generator-form'),
);

export const LazyPromptEnhancer = withLazyLoading(
  () => import('@/app/tools/prompt-enhancer/components/prompt-enhancer-form'),
);

export const LazyAdminPanel = withLazyLoading(() => import('@/app/admin/page'));

export const LazyGallery = withLazyLoading(() => import('@/app/gallery/page'));

// Утилита для предзагрузки компонентов
export function preloadComponent(importFunc: () => Promise<any>) {
  return () => {
    importFunc();
  };
}

// Предзагрузка критических компонентов
export const preloadCriticalComponents = () => {
  // Предзагружаем только критические компоненты
  if (typeof window !== 'undefined') {
    // Предзагружаем при первом взаимодействии пользователя
    const preloadOnInteraction = () => {
      preloadComponent(
        () =>
          import('@/app/tools/image-generator/components/image-generator-form'),
      )();
      preloadComponent(
        () =>
          import('@/app/tools/video-generator/components/video-generator-form'),
      )();
    };

    // Предзагружаем при hover или focus
    document.addEventListener('mouseover', preloadOnInteraction, {
      once: true,
    });
    document.addEventListener('focus', preloadOnInteraction, { once: true });
  }
};
