import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Объединяет классы с помощью clsx и tailwind-merge
 * для правильного объединения Tailwind CSS классов
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 