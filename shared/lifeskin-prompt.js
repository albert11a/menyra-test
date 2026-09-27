// DER PROMPT FUER DIE ANALYSE - reines Rechnen, fuer Heart UND den Server.
//
// Hier stand es in apps/mnyra-heart/heart-lifeskin-prompt.js. Seit dem
// Auto-Modus (docs/lifeskin-auto.md) baut auch eine Firebase Function den
// Prompt - und Functions duerfen keinen Browser-Code laden. Deshalb steht
// das Einsetzen hier, und die Fragen (FRAGEN aus lifeskin-content.js) kommen
// als Parameter herein: Heart gibt sie direkt, der Server bekommt beim
// Deploy eine Abschrift (functions/scripts/sync-lifeskin-auto.cjs).
//
// Heart ruft weiter heart-lifeskin-prompt.js auf; dort stehen die alten
// Namen mit FRAGEN als Voreinstellung. Was herauskommt, ist Zeichen fuer
// Zeichen dasselbe (tests/lifeskin-auto.test.mjs).

function t(baum, sprache = "sq") {
  if (baum === null || baum === undefined) return "";
  if (typeof baum === "string") return baum;
  return baum[sprache] ?? baum.sq ?? baum.de ?? "";
}

// Nur, was der Prompt von den Fragen braucht: Kennung, Titel, Antworten.
export function fragenFuerPrompt(fragen = []) {
  return (Array.isArray(fragen) ? fragen : [])
    .filter((frage) => Array.isArray(frage?.antworten))
    .map((frage) => ({
      id: frage.id,
      titel: { sq: t(frage.titel, "sq"), de: t(frage.titel, "de") },
      antworten: frage.antworten.map((a) => ({ id: a.id, text: { sq: t(a.text, "sq"), de: t(a.text, "de") } }))
    }));
}

export function anamneseFuerPrompt(anamnese, fragen = []) {
  const antworten = anamnese || {};
  const zeilen = [];
  for (const frage of fragen) {
    // Getipptes ist keine Anamnese: Der Name steht in pacienti, die Nummer
    // in ihrem eigenen Feld der Sitzung. Beide sagen nichts ueber die Haut,
    // und die Nummer hat in einem Text, der an die Analyse geht, ohnehin
    // nichts verloren.
    //
    // GEPRUEFT WIRD DIE ANTWORTLISTE, NICHT DER TYP. Hier stand
    // `frage.typ === "text"`, und das war genau so lange richtig, bis die
    // Nummer als `typ: "tel"` dazukam: Sie lief in frage.antworten.find()
    // hinein, wo es keine Liste gibt, und riss das ganze Kopieren mit -
    // "undefined is not an object". Ein Fall ohne Nummer ging weiter durch,
    // ein Fall mit Nummer gar nicht mehr, und der Arzt sah nur eine
    // Meldung. Wer die naechste getippte Frage dazunimmt, faellt nicht
    // noch einmal darauf herein: Was keine Antworten zur Wahl hat, hat auch
    // nichts zu uebersetzen.
    if (!Array.isArray(frage.antworten)) continue;
    const gegeben = antworten[frage.id];
    const ids = (Array.isArray(gegeben) ? gegeben : [gegeben]).filter(Boolean);
    if (!ids.length) continue;
    const treffer = ids
      .map((id) => frage.antworten.find((antwort) => antwort.id === id))
      .filter(Boolean);
    // Eine unbeantwortete Frage bleibt weg: Eine leere Antwort liest sich
    // wie eine verneinte.
    if (!treffer.length) continue;
    zeilen.push({
      pyetja: t(frage.titel, "sq"),
      pyetja_de: t(frage.titel, "de"),
      pergjigja: treffer.map((antwort) => t(antwort.text, "sq")).join("; "),
      pergjigja_de: treffer.map((antwort) => t(antwort.text, "de")).join("; ")
    });
  }
  return zeilen;
}

const sq = (wert) => {
  if (typeof wert === "string") return wert.trim();
  if (wert && typeof wert === "object") return String(wert.sq || "").trim();
  return "";
};

function produktFuerPrompt(p) {
  const roh = p?.veprimi;
  const liste = Array.isArray(roh) ? roh : (Array.isArray(roh?.sq) ? roh.sq : []);
  return {
    id: String(p?.id || ""),
    emri: String(p?.name || p?.id || ""),
    lloji: sq(p?.nenName) || String(p?.lloji || ""),
    detyra: sq(p?.beschreibung) || sq(p?.kurztext),
    veprimi: liste.map(sq).filter(Boolean),
    koha: sq(p?.perdorimi?.koha),
    kujdes: sq(p?.perdorimi?.kujdes)
  };
}

// gewaehlt: die in Heart angehakten Produkte. Stehen welche da, ist die
// Therapie entschieden, und der Prompt sagt das der Analyse - sonst
// schreibt sie Texte fuer eine Auswahl, die die Seite nicht zeigt.
export function promptV8Fuellen(vorlage, sitzung, produkte = [], gewaehlt = [], fragen = []) {
  const fall = sitzung || {};
  const anamnese = { pyetjet: anamneseFuerPrompt(fall.anamnese, fragen) };
  const geschrieben = String(fall.pyetja || fall.problemi || "").trim();
  if (geschrieben) {
    anamnese.teksti_i_pacientit = geschrieben;
    anamnese.lloji = fall.pyetja ? "pytje" : "trup";
  }
  const katalog = (Array.isArray(produkte) ? produkte : [])
    .filter((p) => p && p.id && p.aktiv !== false)
    .map(produktFuerPrompt);
  const werte = {
    PATIENT_NAME: String(fall.name || ""),
    GENDER: String(fall.gender || ""),
    AGE: String(fall.ageBand || ""),
    ANAMNESIS: JSON.stringify(anamnese, null, 2),
    VERIFIED_PRODUCTS: JSON.stringify(katalog, null, 2),
    FIXED_PRODUCTS: (Array.isArray(gewaehlt) ? gewaehlt : []).length
      ? gewaehlt.map((p, i) => `${i + 1}. ${String(p?.id || "")} (${String(p?.name || p?.id || "")})${
        String(p?.zweck || "").trim() ? ` → für: ${String(p.zweck).trim()}` : ""}`).join("\n")
      : "keine"
  };
  return String(vorlage || "").replace(/\{\{(PATIENT_NAME|GENDER|AGE|ANAMNESIS|VERIFIED_PRODUCTS|FIXED_PRODUCTS)\}\}/g,
    (_, name) => werte[name]);
}
