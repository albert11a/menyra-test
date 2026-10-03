// Staff-selected ranges only. Never a success probability or a random value.
export const SKINREACT_BEREICHE = Object.freeze(Array.from({ length: 20 }, (_, i) => `${i * 5}-${(i + 1) * 5}`));
export function skinreactBereich(wert) {
  const id = String(wert ?? "").trim();
  if (!SKINREACT_BEREICHE.includes(id)) return null;
  const [min, max] = id.split("-").map(Number);
  return { id, min, max, text: `${min}–${max}%` };
}
export function istSkinreact(sitzung) {
  return sitzung?.source?.scanWorkflow === "skinreact"
    && Array.isArray(sitzung.photos) && sitzung.photos.length > 0;
}
export function skinreactFreigabe(wert, zeit = new Date().toISOString()) {
  const bereich = skinreactBereich(wert);
  if (!bereich) throw new Error("Bitte einen Bereich auswählen.");
  return { skinreact: { bereich: bereich.id, freigabeAt: zeit, art: "produkteignung" } };
}
export function skinreactErgebnis(bericht) {
  if (bericht?.skinreact?.art !== "produkteignung" || !bericht.skinreact.freigabeAt) return null;
  return skinreactBereich(bericht.skinreact.bereich);
}
