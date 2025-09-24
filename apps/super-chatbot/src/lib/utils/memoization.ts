/**
 * Утилиты для мемоизации компонентов и функций
 * Улучшают производительность за счет предотвращения ненужных перерендеров
 */

"use client";

import { memo, useMemo, useCallback, type ComponentType } from "react";
import equal from "fast-deep-equal";

// HOC для мемоизации компонентов с глубоким сравнением
export function withDeepMemo<T extends ComponentType<any>>(Component: T) {
  return memo(Component, equal);
}

// HOC для мемоизации компонентов с кастомным сравнением
export function withCustomMemo<T extends ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: any, nextProps: any) => boolean
) {
  return memo(Component, areEqual);
}

// Утилита для создания мемоизированных селекторов
export function createMemoizedSelector<T, R>(
  selector: (state: T) => R,
  equalityFn: (a: R, b: R) => boolean = equal
) {
  let lastResult: R;
  let lastState: T;

  return (state: T): R => {
    if (state !== lastState) {
      const newResult = selector(state);
      if (lastResult === undefined || !equalityFn(lastResult, newResult)) {
        lastResult = newResult;
      }
      lastState = state;
    }
    return lastResult;
  };
}

// Утилита для мемоизации дорогих вычислений
export function useExpensiveMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, [factory, ...deps]);
}

// Утилита для мемоизации колбэков
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, [callback, ...deps]);
}
