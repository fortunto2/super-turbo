import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);

    // Устанавливаем начальное значение
    setMatches(media.matches);

    // Создаем функцию-обработчик
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Добавляем слушатель
    media.addEventListener("change", listener);

    // Очищаем слушатель при размонтировании
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Предопределенные медиа-запросы
export const useIsMobile = () => useMediaQuery("(max-width: 768px)");
export const useIsTablet = () =>
  useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1025px)");
export const useIsDarkMode = () =>
  useMediaQuery("(prefers-color-scheme: dark)");
export const useIsReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");
