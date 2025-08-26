"use client";

import { useEffect } from "react";
import type { FC, ReactNode } from "react";

interface TimelineWrapperProps {
  children: ReactNode;
}

export const TimelineWrapper: FC<TimelineWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Загружаем CSS только когда компонент монтируется
    import("super-timeline/style.css");

    // Очищаем стили при размонтировании
    return () => {
      // Можно добавить логику очистки стилей если нужно
    };
  }, []);

  return (
    <div className="relative flex size-full flex-col min-h-screen">
      {children}
    </div>
  );
};
