import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 🎨 Typography Archetypes
 */
export const fonts = {
  display: "font-serif tracking-tight",
  body: "font-sans leading-relaxed",
  caps: "text-[10px] font-bold tracking-[0.4em] uppercase",
};
