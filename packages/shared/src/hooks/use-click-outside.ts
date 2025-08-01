"use client";

import { useEffect, RefObject } from "react";

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;

      // Не выполняем обработчик, если клик был внутри элемента
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }

      handler(event);
    };

    // Добавляем слушатели событий
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    // Очищаем слушатели при размонтировании
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
