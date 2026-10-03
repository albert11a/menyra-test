// Preserve unsent selections across live refreshes and newly arriving photos.
export const skinreactEntwuerfe = new Map();
export const skinreactSendet = new Set();
export function skinreactWahlMerken(id, wert) {
  if (!id) return;
  if (wert) skinreactEntwuerfe.set(id, wert);
  else skinreactEntwuerfe.delete(id);
}
