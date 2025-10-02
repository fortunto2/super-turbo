"use client";

import type { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

interface SafeIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
  strokeWidth?: number;
  [key: string]: any;
}

/**
 * Обёртка для Lucide иконок, которая решает проблемы с гидратацией.
 * Автоматически добавляет suppressHydrationWarning для избежания
 * несоответствий между серверным и клиентским рендерингом.
 */
export const SafeIcon = forwardRef<SVGSVGElement, SafeIconProps>(
  ({ icon: Icon, className, ...props }, ref) => {
    return (
      <Icon
        ref={ref}
        className={className}
        suppressHydrationWarning
        {...props}
      />
    );
  }
);

SafeIcon.displayName = "SafeIcon";
