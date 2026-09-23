// Was Heart in die Promptvorlage einsetzt, bevor sie in die Zwischenablage geht.
//
// EIN EIGENES MODUL, und zwar aus einem Grund: heart.js ist zweitausend
// Zeilen Browser - es laesst sich nur im Browser laden und darum nur ueber
// den Quelltext pruefen. "Im Quelltext steht die richtige Zeile" ist aber
// nicht dasselbe wie "es kommt das Richtige heraus". Hier drin ist reines
// Rechnen: kein DOM, kein Firestore, kein Zustand. Der Test ruft es auf und
// sieht nach, was herauskommt.
//
// Es gibt nur zwei Dinge, die eingesetzt werden, und beide entscheiden
// ueber die Qualitaet des Befundes:
//
//   pacienti  Name und Altersgruppe. Der Name ist fuer die Zuordnung, die
//             Altersgruppe ordnet das Hautbild ein - was bei 24
//             gewoehnlich ist, ist es bei 54 nicht.
//   anamneza  Die Fragen nach der Aufnahme und die Antworten darauf,
//             wortgleich so, wie der Patient sie gelesen hat.

import { FRAGEN, t } from "../lifeskin/lifeskin-content.js";

// Die Fragen und Antworten, wie sie auf dem Bildschirm standen.
//
// AUS DERSELBEN QUELLE WIE DER TRICHTER. Eine eigene Uebersetzungstabelle
// in Heart waere eine Frage der Zeit: Wer im Trichter eine Antwort
// dazunimmt und hier nicht, schickt eine nackte Kennung an die Analyse
// ("yndyrshme"), und die raet dann.
//
// Beide Sprachen, weil beide gebraucht werden: Albanisch ist das, was der
// Patient gelesen hat; Deutsch ist die Sprache der Regeln im Prompt, und
// ohne sie muesste das Modell die Antwort erst uebersetzen, um sie
// anzuwenden.
export function anamneseFuerPrompt(anamnese) {
  const antworten = anamnese || {};
  const zeilen = [];
  for (const frage of FRAGEN) {
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

// Die Vorlage fuellen.
//
// Gibt eine KOPIE zurueck und aendert die Vorlage nicht: Sie wird bei jedem
// Fall neu geholt, aber wer sich darauf verlaesst, hat beim zweiten Fall
// die Angaben des ersten im Prompt stehen.
export function promptFuellen(vorlage, sitzung) {
  const fall = sitzung || {};
  const prompt = { ...vorlage, hyrja: { ...(vorlage?.hyrja || {}) } };
  prompt.hyrja.pacienti = {
    emri: fall.name || "",
    gjinia: fall.gender || "",
    // GEMESSEN, NICHT GESCHAETZT: Hier stand session.age, und dieses Feld
    // gibt es nicht - die Sitzung traegt ageBand. Die Altersgruppe kam
    // damit in KEINEM Prompt an.
    mosha: fall.ageBand || null
  };
  prompt.hyrja.anamneza = {
    ...(vorlage?.hyrja?.anamneza || {}),
    pyetjet: anamneseFuerPrompt(fall.anamnese)
  };
  // WAS ER SELBST GESCHRIEBEN HAT, GEHT MIT.
  //
  // Auf den Wegen Trup und Pytje gibt es kein Bild und keine
  // angetippten Antworten - dieser Text IST der Fall. Ohne ihn bekaeme
  // das Modell einen Namen, eine Altersgruppe und sonst nichts und
  // muesste sich den Rest ausdenken; genau das ist die teuerste Art,
  // einen Befund zu erzeugen.
  //
  // Nur, wenn wirklich etwas dasteht: Ein leeres Feld im Prompt liest
  // sich wie eine Frage ohne Inhalt, und das Modell beantwortet dann
  // eine, die niemand gestellt hat.
  const geschrieben = String(fall.pyetja || fall.problemi || "").trim();
  if (geschrieben) {
    prompt.hyrja.anamneza.teksti_i_pacientit = geschrieben;
    // Und wofuer der Text steht: eine Frage ist etwas anderes als die
    // Beschreibung einer Hautstelle, und die Antwort darauf auch.
    prompt.hyrja.anamneza.lloji = fall.pyetja ? "pytje" : "trup";
  }
  return prompt;
}

// PROMPT v8 - ein Text mit fuenf Platzhaltern statt einer JSON-Vorlage.
//
// Der Text steht in docs/lifeskin-prompt-v8.txt und wird so eingesetzt,
// wie er dort steht. Hier werden nur die Platzhalter gefuellt:
// {{PATIENT_NAME}}, {{GENDER}}, {{AGE}}, {{ANAMNESIS}} und
// {{VERIFIED_PRODUCTS}}.
//
// DIE PRODUKTE SIND DER GANZE KATALOG, nicht die angehakten. In v8 waehlt
// die Analyse die Therapie selbst (Teil A, Schritt 13) - wer nur die
// schon angehakten mitschickt, hat die Entscheidung vorweggenommen.
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
export function promptV8Fuellen(vorlage, sitzung, produkte = [], gewaehlt = []) {
  const fall = sitzung || {};
  const anamnese = { pyetjet: anamneseFuerPrompt(fall.anamnese) };
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
