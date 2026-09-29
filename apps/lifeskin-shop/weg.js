/* DIE TIPPS WAEHREND DER KONTROLLE (/lifeskinshop, docs/lifeskin-shop-perputhja.md).
 *
 * Unter jeder der drei Fragen nach der Aufnahme steht ein kleiner Tipp zu
 * Akne - einer je Frage, und zwar einer, der zu dem passt, was gerade
 * gefragt wird. Die Antworten gehen dabei nicht verloren und nichts wird
 * gezaehlt: Das hier ist Text neben dem Trichter, kein Teil davon.
 *
 * WELCHE FRAGE GERADE STEHT, liest diese Datei an den Antwortknoepfen ab,
 * die der Trichter zeichnet (data-antwort). Jede der drei Fragen hat eine
 * Antwort, die es nur bei ihr gibt - am Trichter aendert sich dafuer keine
 * Zeile. Kennt die Datei die Frage nicht, bleibt die Karte versteckt.
 *
 * WAS DIE TIPPS SAGEN: allgemeines Wissen, das Dermatologen ihren
 * Patienten mitgeben - keine Aussage ueber seine Haut, kein Versprechen
 * ueber ein Mittel. Die Zahl sagt spaeter Dr. Gashi. */

export const FRAGE_TIPPS = Object.freeze({
  anliegen: Object.freeze({
    marke: "A E DINIT?",
    fett: "Puçrra fillon para se të shihet.",
    text: "Shumica fillojnë me një por të bllokuar, disa javë para se të dalin."
  }),
  kohezgjatja: Object.freeze({
    marke: "KËSHILLË",
    fett: "Jepini kohë lëkurës.",
    text: "Ajo ripërtërihet ngadalë – prandaj një rutinë vlerësohet pas të paktën 4 javësh, jo pas 4 ditësh."
  }),
  perdorimi: Object.freeze({
    marke: "KËSHILLË",
    fett: "Më pak, por të duhurat.",
    text: "Shumë produkte njëherësh e irritojnë lëkurën. Dy hapa të qartë bëjnë më shumë se pesë herë pas here."
  })
  // Die vierte Frage (gatishmeria) gibt es im Laden seit dem 29.09. nicht
  // mehr (FRAGEN_NACH_AUFNAHME_WEGE) - und damit auch ihren Tipp nicht.
});

// Je Frage eine Antwort, die es nur in ihr gibt (FRAGEN in
// apps/lifeskin/lifeskin-content.js - tests/lifeskin-shop-weg.test.mjs
// haelt beide zusammen).
const ERKENNUNG = Object.freeze([
  ["anliegen", "pucrrat"],
  ["kohezgjatja", "vit"],
  ["perdorimi", "farmaci"]
]);

export function frageAus(kennungen) {
  const da = new Set(kennungen || []);
  return ERKENNUNG.find(([, antwort]) => da.has(antwort))?.[0] || "";
}

export function tippZeigen(dokument = globalThis.document) {
  const karte = dokument?.getElementById?.("ls-fragetipp");
  const wahl = dokument?.getElementById?.("ls-fragewahl");
  if (!karte || !wahl) return "";
  const kennungen = [...wahl.querySelectorAll("[data-antwort]")].map((k) => k.getAttribute("data-antwort"));
  const frage = wahl.hidden ? "" : frageAus(kennungen);
  const tipp = FRAGE_TIPPS[frage];
  if (!tipp) { karte.hidden = true; delete karte.dataset.frage; return ""; }
  if (karte.dataset.frage === frage && !karte.hidden) return frage;
  karte.dataset.frage = frage;
  const marke = dokument.getElementById("ls-fragetippmarke");
  const text = dokument.getElementById("ls-fragetipptext");
  if (marke) marke.textContent = tipp.marke;
  if (text) {
    const fett = dokument.createElement("b");
    fett.textContent = tipp.fett;
    text.replaceChildren(fett, ` ${tipp.text}`);
  }
  karte.hidden = false;
  // Die Bewegung (shop-weg.css) laeuft bei jeder neuen Frage noch einmal.
  karte.style.animation = "none";
  void karte.offsetWidth;
  karte.style.animation = "";
  return frage;
}

export function starteTipps(dokument = globalThis.document) {
  const wahl = dokument?.getElementById?.("ls-fragewahl");
  if (!wahl || typeof MutationObserver !== "function") return null;
  const beobachter = new MutationObserver(() => {
    try { tippZeigen(dokument); } catch { /* ein Tipp haelt die Kontrolle nie an */ }
  });
  beobachter.observe(wahl, { childList: true, attributes: true, attributeFilter: ["hidden"] });
  tippZeigen(dokument);
  return beobachter;
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__) {
  const start = () => { try { starteTipps(document); } catch { /* still */ } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
