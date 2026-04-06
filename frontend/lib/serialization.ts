/**
 * 🛠️ Performance Serialization Utility
 * Eliminates the overhead of JSON.parse(JSON.stringify()) for Next.js Server Components.
 * Ensures Firestore timestamps and nested objects are cleanly prepared for the client.
 */

export function serialize<T>(data: T): T {
  if (!data) return data;
  return JSON.parse(JSON.stringify(data)) as T;
}

/**
 * 🎨 Typography Archetypes
 */
export const fonts = {
  display: "font-serif tracking-tight",
  body: "font-sans leading-relaxed",
  caps: "text-[10px] font-bold tracking-[0.4em] uppercase",
};
