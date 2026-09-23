// DER BLOCK "shitja" - die Texte der Therapieseite (Prompt v8).
//
// Die Analyse (Teil A) entscheidet medizinisch; dieser Block uebersetzt
// ihr Ergebnis in die Saetze, die der Patient oben auf seiner Seite liest.
// Er ist ZUSATZ: Ein Befund ohne ihn (jeder Fall vor v8) ist vollstaendig,
// und die Seite faellt dann auf Saetze zurueck, die sie aus den
// Analysefeldern selbst baut.
//
// Gelesen wird grosszuegig und gekuerzt, nie geworfen - dieselbe Regel wie
// in lifeskin-raport-v3.js: Die Automatik fuellt vor, sie entscheidet nicht.

const text = (wert, max = 400) => (typeof wert === "string" ? wert.replace(/\s+/g, " ").trim().slice(0, max) : "");

export function shitjaLesen(roh) {
  if (!roh || typeof roh !== "object" || Array.isArray(roh)) return null;
  const problemet = (Array.isArray(roh.problemet) ? roh.problemet : [])
    .filter((p) => p && typeof p === "object")
    .map((p) => ({
      gjetja: text(p.gjetja, 80),
      ku: text(p.ku, 80),
      produkt_id: text(p.produkt_id, 40),
      zgjidhja: text(p.zgjidhja, 240)
    }))
    .filter((p) => p.gjetja)
    .slice(0, 3);
  const produktet = (Array.isArray(roh.produktet) ? roh.produktet : [])
    .filter((p) => p && typeof p === "object" && text(p.produkt_id))
    .map((p) => ({
      produkt_id: text(p.produkt_id, 40),
      per_ju: (Array.isArray(p.per_ju) ? p.per_ju : []).map((x) => text(x, 140)).filter(Boolean).slice(0, 3)
    }))
    .slice(0, 3);
  const raus = {
    hyrja: text(roh.hyrja, 300),
    shqetesimi: text(roh.shqetesimi, 240),
    problemet,
    produktet,
    dita_28: text(roh.dita_28, 260),
    pse_tani: text(roh.pse_tani, 260),
    whatsapp: text(roh.whatsapp, 700)
  };
  const leer = !raus.hyrja && !raus.shqetesimi && !problemet.length && !produktet.length
    && !raus.dita_28 && !raus.pse_tani && !raus.whatsapp;
  return leer ? null : raus;
}

// Hinweise fuer Heart - leer heisst: nichts aufgefallen.
export function pruefeShitja(roh, nevojat = []) {
  const hinweise = [];
  if (roh === undefined) return hinweise;
  const shitja = shitjaLesen(roh);
  if (!shitja) { hinweise.push("shitja: leer oder kein Block."); return hinweise; }
  const mitProdukt = new Set((Array.isArray(nevojat) ? nevojat : [])
    .map((n) => String(n?.produkt_id || "").trim()).filter(Boolean));
  if (!shitja.hyrja) hinweise.push("shitja.hyrja fehlt.");
  for (const p of shitja.problemet) {
    if (p.produkt_id && !mitProdukt.has(p.produkt_id)) {
      hinweise.push(`shitja.problemet nennt ${p.produkt_id}, das nicht in nevojat steht.`);
    }
  }
  const beschrieben = new Set(shitja.produktet.map((p) => p.produkt_id));
  for (const id of mitProdukt) {
    if (!beschrieben.has(id)) hinweise.push(`shitja.produktet: ${id} fehlt.`);
  }
  if (mitProdukt.size && !shitja.whatsapp) hinweise.push("shitja.whatsapp fehlt.");
  return hinweise;
}
