// Event days are stored inside the existing timings map; no new rule fields.
export const STATISTIK_ZONE = "Europe/Belgrade";
const datum = new Intl.DateTimeFormat("sv-SE", {
  timeZone: STATISTIK_ZONE, year: "numeric", month: "2-digit", day: "2-digit"
});
export function statistikTag(iso) {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? datum.format(new Date(ms)) : "";
}

export const BERICHT_MARKEN = Object.freeze([
  "warteseiteGeoeffnet", "berichtGeoeffnet", "sahSchnitt", "sahTherapie",
  "sahPreis", "kasseGeoeffnet", "waClick", "waSent", "linkKopiert"
]);

// Leaf masks preserve existing scan durations and events from other tabs/days.
export function statistikPatch(daten, jetzt = new Date().toISOString()) {
  const mit = { ...daten, updatedAt: jetzt };
  const masken = Object.keys(mit).filter((key) => key !== "timings");
  const ereignisse = BERICHT_MARKEN.filter((key) => daten[key] === true);
  if (daten.address?.strasse || daten.address?.ort || daten.timings?.live === "address") ereignisse.push("hatAnschrift");
  if (daten.order?.orderId) ereignisse.push("hatBestellt");
  const tag = statistikTag(jetzt);
  const timings = { ...(daten.timings || {}) };
  if (ereignisse.length) {
    timings.ereignisse = { [tag]: Object.fromEntries(ereignisse.map((key) => [key, jetzt])) };
    masken.push(...ereignisse.map((key) => `timings.ereignisse.\`${tag}\`.${key}`));
  }
  for (const key of Object.keys(daten.timings || {})) masken.push(`timings.${key}`);
  if (Object.keys(timings).length) mit.timings = timings;
  return { daten: mit, masken };
}
