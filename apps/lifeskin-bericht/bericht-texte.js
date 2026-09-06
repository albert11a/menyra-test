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

  // ---------- Der fertige Befund ----------
  //
  // Gebaut fuer jemanden, der NICHT liest, sondern ueberfliegt. Untersuchungen
  // zum Leseverhalten sagen dasselbe seit zwanzig Jahren: Der Blick laeuft
  // die linke Kante hinunter und haengt an Ueberschriften, Symbolen und
  // ersten Zeilen. Also traegt jeder Abschnitt seine Aussage in der
  // Ueberschrift, und darunter steht hoechstens, was sie belegt.

  fertigTitel: { sq: "{name}, analiza juaj është gati.", de: "{name}, Ihre Analyse ist fertig." },
  fertigOhneName: { sq: "Analiza juaj është gati.", de: "Ihre Analyse ist fertig." },
  fertigVon: { sq: "Nga Dr. Violeta Gashi, dermatologe", de: "Von Dr. Violeta Gashi, Dermatologin" },

  befundMarke: { sq: "Çfarë sheh Dr. Gashi", de: "Was Dr. Gashi sieht" },
  therapieMarke: { sq: "Terapia juaj", de: "Ihre Therapie" },
  therapieUnter: {
    sq: "E përpiluar për lëkurën tuaj — jo një produkt nga rafti.",
    de: "Für Ihre Haut zusammengestellt — kein Produkt aus dem Regal."
  },

  // Der Preisblock. Anker zuerst, dann der Setpreis, dann der Tagespreis.
  preisMarke: { sq: "Terapia 4-javore", de: "Die 4-Wochen-Therapie" },
  preisEinzeln: { sq: "Veç e veç", de: "Einzeln" },
  preisGespart: { sq: "Kurseni {betrag} €", de: "Sie sparen {betrag} €" },
  preisTag: { sq: "{tagespreis} € në ditë për 28 ditë", de: "{tagespreis} € am Tag für 28 Tage" },

  // Die drei Saetze, die die Unsicherheit vor dem Kauf wegnehmen. Sie
  // stehen DIREKT am Knopf, nicht im Fuss - dort, wo die Anspannung am
  // groessten ist.
  sicherNachnahme: { sq: "Paguani kur ta merrni në dorë", de: "Sie zahlen bei Lieferung" },
  sicherGarantie: { sq: "30 ditë garanci — paratë mbrapsht", de: "30 Tage Garantie — Geld zurück" },
  sicherLieferung: { sq: "Dërgesa 2–3 ditë, falas", de: "Lieferung 2–3 Tage, kostenlos" },

  kaufKnopf: { sq: "Merr terapinë — {preis} €", de: "Therapie bestellen — {preis} €" },
  kaufUnter: { sq: "Pa kartë. Pa llogari. Paguani te dera.", de: "Ohne Karte. Ohne Konto. Bezahlt an der Tür." },

  // ---------- Das Bestellblatt ----------
  bestellTitel: { sq: "Ku ta dërgojmë?", de: "Wohin sollen wir liefern?" },
  bestellName: { sq: "Emri dhe mbiemri", de: "Vor- und Nachname" },
  bestellTelefon: { sq: "Numri i telefonit", de: "Telefonnummer" },
  bestellAdresse: { sq: "Adresa", de: "Adresse" },
  bestellOrt: { sq: "Qyteti", de: "Stadt" },
  bestellSenden: { sq: "Konfirmo porosinë", de: "Bestellung bestätigen" },
  bestellLaeuft: { sq: "Po dërgohet…", de: "Wird gesendet…" },
  bestellFehler: { sq: "Nuk u dërgua. Provoni përsëri.", de: "Nicht gesendet. Bitte noch einmal." },
  bestellPflicht: { sq: "Plotësoni të gjitha fushat.", de: "Bitte alle Felder ausfüllen." },

  // ---------- Nach der Bestellung ----------
  //
  // Der Moment nach dem Klick entscheidet, ob die Bestellung haelt. Bei
  // Nachnahme heisst Zweifel: Paket verweigert. Also steht hier ab der
  // ersten Sekunde, was als Naechstes passiert und wann.
  dankeTitel: { sq: "Porosia juaj është regjistruar.", de: "Ihre Bestellung ist eingegangen." },
  dankeText: {
    sq: "Dr. Gashi e ka parë. Do t'ju njoftojmë sapo pakoja të niset.",
    de: "Dr. Gashi hat sie gesehen. Wir melden uns, sobald das Paket unterwegs ist."
  },
  versandMarke: { sq: "Porosia juaj", de: "Ihre Bestellung" },
  versandBestellt: { sq: "Porosia u pranua", de: "Bestellung angenommen" },
  versandVorbereitet: { sq: "Po përgatitet", de: "Wird vorbereitet" },
  versandUnterwegs: { sq: "Nisur", de: "Unterwegs" },
  versandZugestellt: { sq: "Dorëzuar", de: "Zugestellt" },
  versandErwartet: { sq: "Pritet {von}–{bis}", de: "Erwartet {von}–{bis}" },
  versandZahlung: { sq: "{preis} € te dera", de: "{preis} € an der Tür" },

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
