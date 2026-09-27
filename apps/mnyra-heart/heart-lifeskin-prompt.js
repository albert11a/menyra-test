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

import { FRAGEN } from "../lifeskin/lifeskin-content.js";
import { anamneseFuerPrompt as anamneseGemeinsam, promptV8Fuellen as promptGemeinsam } from "../../shared/lifeskin-prompt.js";

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
  return anamneseGemeinsam(anamnese, FRAGEN);
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
// Der Text steht in docs/lifeskin-prompt-v9.txt (davor v8, gleiche
// Platzhalter) und wird so eingesetzt,
// wie er dort steht. Hier werden nur die Platzhalter gefuellt:
// {{PATIENT_NAME}}, {{GENDER}}, {{AGE}}, {{ANAMNESIS}} und
// {{VERIFIED_PRODUCTS}}.
//
// DIE PRODUKTE SIND DER GANZE KATALOG, nicht die angehakten. In v8 waehlt
// die Analyse die Therapie selbst (Teil A, Schritt 13) - wer nur die
// schon angehakten mitschickt, hat die Entscheidung vorweggenommen.
// PROMPT v8/v9 - das Einsetzen steht in shared/lifeskin-prompt.js, damit
// der Server (Auto-Modus) denselben Prompt baut. Hier mit den Fragen des
// Trichters als Voreinstellung, unter dem alten Namen.
export function promptV8Fuellen(vorlage, sitzung, produkte = [], gewaehlt = []) {
  return promptGemeinsam(vorlage, sitzung, produkte, gewaehlt, FRAGEN);
}
