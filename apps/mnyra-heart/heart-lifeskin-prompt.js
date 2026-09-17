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
    // Der Name ist keine Anamnese - er steht in pacienti.
    if (frage.typ === "text") continue;
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
  return prompt;
}
