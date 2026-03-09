export function scoreSearchMatchCore(text, query) {
  if (!text || !query) return 0;
  const hay = String(text).toLowerCase();
  if (hay.startsWith(query)) return 3;
  if (hay.includes(query)) return 1;
  return 0;
}
