// Validation utilities

import { z } from 'zod';

export const emailSchema = z.string().email();
export const urlSchema = z.string().url();

export function isValidEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function isValidUrl(url: string): boolean {
  try {
    urlSchema.parse(url);
    return true;
  } catch {
    return false;
  }
}

export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

export function validateFileType(type: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(type);
}


