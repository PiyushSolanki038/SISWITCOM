import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn (Class Name) Helper
 * 
 * Combines Tailwind CSS classes safely.
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a phone number.
 * Allows +, digits, spaces, dashes, parentheses.
 * Requires at least 10 digits.
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  const phoneRegex = /^\+?[\d\s-()]+$/;
  const digits = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digits.length >= 10;
};
