// Alle Beschriftungen der Befundseite.
//
// Getrennt vom Ablauf, wie im Trichter: Steht eine Zeichenkette erst einmal
// im Aufbau, ist die zweite Sprache nachtraeglich nicht mehr einzuziehen.

export const TEXTE = Object.freeze({
  laedt: { sq: "Po hapet analiza juaj…", de: "Ihre Analyse wird geöffnet…" },

  wegTitel: { sq: "Kjo analizë nuk u gjet.", de: "Diese Analyse wurde nicht gefunden." },
  wegText: {
    sq: "Kontrolloni linkun. Nëse e keni marrë nga Dr. Gashi, shkruajini asaj.",
    de: "Prüfen Sie den Link. Wenn Sie ihn von Dr. Gashi haben, schreiben Sie ihr."
  },

  // Der Titel.
  //
  // "po e shikon" - sie sieht es sich gerade an. Praesens, nicht Futur: Es
  // laeuft, es steht nicht aus. Der Name steht darin, weil dieser eine Fall
  // seiner ist und keine Nummer in einer Schlange.
  titel: { sq: "Dr. Gashi po e shikon analizën tuaj, {name}.", de: "Dr. Gashi sieht sich Ihre Analyse an, {name}." },
  titelOhneName: { sq: "Dr. Gashi po e shikon analizën tuaj.", de: "Dr. Gashi sieht sich Ihre Analyse an." },
  akteMarke: { sq: "Numri i analizës", de: "Fallnummer" },
  akteFotos: { sq: "{anzahl} foto", de: "{anzahl} Aufnahmen" },

  // Die Wartezeit ist ehrlich, nicht erfunden.
  //
  // Keine Warteschlange, keine "Position 47". Wer nachts bestellt und eine
  // erfundene Zahl liest, weiss, dass sie gelogen ist - und dann ist auch
  // der Befund gelogen. Was echt ist, reicht: heute oder morgen frueh.
  dauerHeute: { sq: "Përgjigja sot", de: "Antwort heute" },
  dauerMorgen: { sq: "Përgjigja nesër në mëngjes", de: "Antwort morgen früh" },

  // Warum es ueberhaupt dauert - und warum das gut ist.
  //
  // DAS IST DER WICHTIGSTE SATZ DER SEITE. Er verwandelt die Wartezeit vom
  // Mangel in den Beweis: Eine Maschine haette sofort geantwortet, und
  // genau deshalb waere ihre Antwort nichts wert. Kurz gehalten - er wirkt
  // nur, wenn er ganz gelesen wird.
  warum: {
    sq: "Nuk është një makinë që ju përgjigjet. Çdo analizë e shikon vetë ajo.",
    de: "Hier antwortet Ihnen keine Maschine. Jede Analyse sieht sie sich selbst an."
  },

  // Die vier Punkte. Ihre Beschriftung steht nicht mehr daneben, sondern
  // nur die des laufenden - vier Zeilen Text las ohnehin niemand zu Ende.
  schrittScan: { sq: "Skanimi u krye", de: "Scan abgeschlossen" },
  schrittFotos: { sq: "Fotot janë te Dr. Gashi", de: "Aufnahmen bei Dr. Gashi" },
  schrittAnalyse: { sq: "Tani: analiza nga Dr. Gashi", de: "Jetzt: die Analyse von Dr. Gashi" },
  schrittFertig: { sq: "Rezultati juaj", de: "Ihr Ergebnis" },

  // Die Frage, die den WhatsApp-Knopf traegt.
  //
  // Nicht "schreiben Sie der Aerztin" - das ist eine Verpflichtung. Sondern
  // "wohin sollen wir Bescheid geben" - das ist ein Dienst, und den lehnt
  // fast niemand ab.
  benachrichtigen: { sq: "Dëshironi të njoftoheni kur të përfundojë?", de: "Sollen wir Bescheid geben, wenn sie fertig ist?" },
  waKnopf: { sq: "Njoftomë në WhatsApp", de: "Auf WhatsApp benachrichtigen" },
  waUnter: {
    sq: "Mesazhi është shkruar tashmë. Ju vetëm e dërgoni.",
    de: "Die Nachricht ist schon geschrieben. Sie tippen nur auf Senden."
  },
  waRueckFrage: { sq: "E dërguat mesazhin?", de: "Nachricht abgeschickt?" },
  waRueckJa: { sq: "Po, e dërgova", de: "Ja, abgeschickt" },
  waDanke: { sq: "Faleminderit. Do t'ju njoftojmë.", de: "Danke. Wir geben Bescheid." },

  // Was beim Tippen auf den Knopf wirklich passiert.
  //
  // Auf dem iPhone erscheint danach ein Systemhinweis "Diese Seite in
  // WhatsApp oeffnen?" mit Abbrechen und Oeffnen. Das ist der gefaehrlichste
  // Punkt der ganzen Seite: Wer ihn nicht erwartet, tippt auf Abbrechen und
  // ist weg. Deshalb steht hier vorher, was kommt - zugeklappt, damit es die
  // Eiligen nicht aufhaelt, und lesbar fuer die, die nicht ohne Antwort
  // tippen.
  waWasPassiert: { sq: "Si funksionon?", de: "Wie läuft das?" },
  waWasPassiertText: {
    sq: "WhatsApp hapet me mesazhin tuaj gati. Ju e dërgoni — dhe Dr. Gashi ju njofton sapo analiza të jetë gati. Pa pagesë. Ju mund të bllokoni bisedën në çdo moment.",
    de: "WhatsApp öffnet sich mit Ihrer fertigen Nachricht. Sie senden sie — und Dr. Gashi gibt Ihnen Bescheid, sobald die Analyse fertig ist. Kostenlos. Sie können das Gespräch jederzeit beenden."
  },

  kopieren: { sq: "Kopjo linkun", de: "Link kopieren" },
  blattZu: { sq: "E kuptova", de: "Verstanden" },
  kopiert: { sq: "✓ U kopjua", de: "✓ Kopiert" },
  // Der zweite Weg - fuer alle ohne WhatsApp und fuer alle, die noch keine
  // Nachricht schicken wollen.
  //
  // Er ist hier besser als im Trichter: Dort blieb nur ein Nummernfeld, und
  // eine Nummer gibt man ungern her. Hier gibt es die Seite selbst. Sie
  // gehoert ihm, sie bleibt, und die Antwort erscheint darauf - er muss
  // niemandem etwas geben.
  kopierenUnter: {
    sq: "Nuk keni WhatsApp? Ruani këtë link. Përgjigja e Dr. Gashit shfaqet pikërisht këtu.",
    de: "Kein WhatsApp? Speichern Sie diesen Link. Die Antwort von Dr. Gashi erscheint genau hier."
  },

  haftung: {
    sq: "Vlerësimi është kozmetik dhe nuk zëvendëson një vizitë te mjeku.",
    de: "Die Beurteilung ist kosmetisch und ersetzt keine ärztliche Untersuchung."
  }
});

export function t(eintrag, sprache = "sq") {
  if (!eintrag) return "";
  return eintrag[sprache] || eintrag.sq || "";
}

export function fuelle(vorlage, werte = {}) {
  let text = String(vorlage || "");
  for (const [name, wert] of Object.entries(werte)) {
    text = text.split(`{${name}}`).join(String(wert ?? ""));
  }
  return text;
}
