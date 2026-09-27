// AUTO-MODUS: AUS DER ANTWORT DER ANALYSE WIRD DER BERICHT.
//
// Von Hand laeuft es so: Heart kopiert den Prompt, die Antwort (JSON) wird
// eingefuegt, der Bogen fuellt sich, "Freigeben" schreibt den Bericht
// (heart.js lifeskinJsonUebernehmen + gibLifeskinBerichtFrei, Adapter
// gibBerichtFrei). Im Auto-Modus macht das eine Firebase Function ohne
// Bogen - also steht hier dasselbe als reine Funktion: Antwort hinein,
// Berichtsdokument heraus. Dieselben Leser (raportLesen, jsonLesen),
// dieselbe Therapie-Automatik (baueTerapi, ausAnalyse), dieselbe
// Preisstaffel, dieselbe Abschrift der Antworten, derselbe Weg.
//
// LIEBER ZU EUCH ALS FALSCH ZUM PATIENTEN. Faellt eine der Pruefungen
// unten durch, gibt es keinen Bericht, sondern einen Grund - und der Fall
// bleibt wartend in Heart, genau wie ohne Auto-Modus. Gesperrt wird bei:
// keinem Befundtext, keinen Messwerten (mit Foto), einer Analyse, die
// selbst eine aerztliche Abklaerung verlangt, und keinem bekannten Produkt.
import { raportLesen, jsonLesen } from "./lifeskin-analyse.js";
import { brauchtAbklaerung } from "./lifeskin-raport-v3.js";
import { baueTerapi, ausAnalyse } from "./lifeskin-terapia.js";
import { ohneSeite } from "./lifeskin-ohne-seite.js";
import { preisFuerFall } from "./lifeskin-preise.js";
import { antwortenFuerBericht } from "./lifeskin-antworten.js";
import { wegGueltig } from "./lifeskin-weg.js";

const SCHWERE = ["leicht", "mittel", "schwer"];

// Mit oder ohne Foto - wie analyseArt() in Heart: Trup und Pytje kommen
// ohne Foto, ausser er hat doch eines angehaengt.
export function autoArt(sitzung) {
  const ohne = ["trup", "pytje"].includes(String(sitzung?.typ || ""))
    && !(Array.isArray(sitzung?.photos) && sitzung.photos.length)
    && !(Number(sitzung?.fotoAnzahl) > 0);
  return ohne ? "pa-foto" : "foto";
}

// Ein Satz, der sagt, was ein Produkt NICHT tut, faellt weg - dieselbe
// Regel wie in heart.js lifeskinTherapieFuellen.
function ohneVerneinung(satz) {
  return ohneSeite(String(satz || ""))
    .replace(/(^|(?<=[.!?])\s+)[^.!?]*\bnuk (lufton|trajton|vepron|heq|shëron|ndikon)\b[^.!?]*[.!?]\s*/giu, "$1").trim();
}

function katalogVeprimi(p) {
  const roh = p?.veprimi;
  const liste = Array.isArray(roh) ? roh : (Array.isArray(roh?.sq) ? roh.sq : []);
  return liste.map((z) => (typeof z === "string" ? z : String(z?.sq || ""))).map((z) => z.trim()).filter(Boolean);
}

// antwort: der Text der Analyse (JSON, wie ihn ChatGPT schreibt)
// sitzung: die normalisierte Sitzung (name, ageBand, typ, anamnese, source, createdAt)
// katalog: die Produkte aus lifeskin/<tenant>/products
// Rueckgabe: { ok: true, bericht } oder { ok: false, grund }
export function autoBefund({ antwort, sitzung = {}, katalog = [], jetzt = new Date() } = {}) {
  let raport;
  let gelesen = {};
  try { raport = raportLesen(antwort); }
  catch (fehler) { return { ok: false, grund: `Antwort nicht lesbar: ${fehler?.message || fehler}` }; }
  try { gelesen = jsonLesen(antwort); } catch { gelesen = {}; }

  const befund = String(raport?.gjetjet || "").trim();
  if (!befund) return { ok: false, grund: "Kein Befundtext (gjetjet)." };
  const art = autoArt(sitzung);
  if (art === "foto" && !(raport.parametrat || []).length) return { ok: false, grund: "Keine Messwerte." };
  if (brauchtAbklaerung(raport)) return { ok: false, grund: "Die Analyse verlangt eine aerztliche Abklaerung." };

  // Die Produkte: was die Analyse gewaehlt hat, nur bekannte und aktive.
  const bekannt = new Map((Array.isArray(katalog) ? katalog : [])
    .filter((p) => p && p.id && p.aktiv !== false).map((p) => [String(p.id), p]));
  const gewaehlt = [];
  const saetze = new Map();
  const vorschlag = (gelesen.produkte || []).length
    ? gelesen.produkte
    : (raport.nevojat || []).map((n) => ({ id: n?.produkt_id, satz: n?.teksti }));
  for (const p of vorschlag) {
    const id = String(p?.id || "").trim();
    if (!id || !bekannt.has(id) || saetze.has(id)) continue;
    gewaehlt.push(bekannt.get(id));
    saetze.set(id, String(p?.satz || "").trim());
  }
  if (!gewaehlt.length) return { ok: false, grund: "Kein bekanntes Produkt in der Antwort." };

  const terapi = baueTerapi({
    raport, produkte: gewaehlt,
    patient: { emri: sitzung.name || "", mosha: sitzung.ageBand || "" }, sprache: "sq"
  });
  const regel = new Map(terapi.map((x) => [x.id, x]));
  const produkte = gewaehlt.map((p) => {
    const id = String(p.id);
    const eigen = ausAnalyse(raport, id, katalogVeprimi(p));
    const satz = ohneVerneinung(saetze.get(id) || eigen?.satz || regel.get(id)?.arsyeja || "");
    return {
      id,
      satz: satz.slice(0, 400),
      zweck: ohneSeite(String(eigen?.zweck || "")).slice(0, 120),
      veprimi: (eigen?.veprimi || []).map(ohneSeite).map((z) => z.replace(/\s+/g, " ").trim().slice(0, 90)).filter(Boolean).slice(0, 3)
    };
  });

  const preis = preisFuerFall(produkte.length, sitzung.createdAt);
  if (!(preis > 0)) return { ok: false, grund: "Kein Preis." };
  const javet = (gelesen.javet || []).length === 4 && gelesen.javet.every(Boolean)
    ? gelesen.javet.map((x) => String(x).slice(0, 200)) : [];

  return {
    ok: true,
    bericht: {
      status: "fertig",
      bereit: false,
      befund: befund.slice(0, 4000),
      produkte,
      preis,
      schwere: SCHWERE.includes(gelesen.schwere) ? gelesen.schwere : "",
      raport,
      texte: {},
      ohneBild: art === "pa-foto",
      antworten: antwortenFuerBericht(sitzung.anamnese),
      weg: wegGueltig(sitzung?.source?.weg),
      raste: [],
      klientet: [],
      analyse: {
        iga: null, diagnoza: "", tipiLekures: "", zonat: "", paTrajtim: "", kurMjek: "", keshilla: "",
        javet, parameter: []
      },
      freigabeAt: jetzt.toISOString()
    }
  };
}
