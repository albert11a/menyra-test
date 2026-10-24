// Only small CDN references belong in reports, never inline image bytes.
export function vergleichUrl(wert) {
  const url = typeof wert === "string" ? wert.trim() : "";
  if (!url || url.length > 2048) return "";
  try { return new URL(url).protocol === "https:" ? url : ""; } catch { return ""; }
}
export function vergleichLesen(wert) {
  return { vorher: vergleichUrl(wert?.vorher), nachher: vergleichUrl(wert?.nachher) };
}
export function vergleichVollstaendig(wert) {
  const paar = vergleichLesen(wert);
  return Boolean(paar.vorher && paar.nachher);
}
