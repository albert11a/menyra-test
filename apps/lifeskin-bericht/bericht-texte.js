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

  // Was tatsaechlich getan wurde. Drei Angaben, eine Zeile.
  //
  // Sie sind der Unterschied zwischen "ein Text ueber meine Haut" und
  // "jemand hat sich das angesehen". Es steht nichts darin, was nicht
  // stimmt: die Zahl der Aufnahmen kommt aus der Sitzung, die Zonen sind
  // die, die die Aufnahme abdeckt, das Datum ist die Freigabe.
  beweisFotos: { sq: "{anzahl} foto", de: "{anzahl} Fotos" },
  beweisZonen: { sq: "5 zona të fytyrës", de: "5 Gesichtszonen" },
  beweisDatum: { sq: "Parë më {datum}", de: "Angesehen am {datum}" },

  befundMarke: { sq: "Çfarë sheh Dr. Gashi", de: "Was Dr. Gashi sieht" },

  // Der Schweregrad. Ohne Einordnung ist ein Befund ein Absatz Text; mit
  // ihr ist er eine Diagnose - und eine Diagnose ist etwas, das behandelt
  // werden muss, kein Vorschlag.
  gradLeicht: { sq: "Shkallë e lehtë", de: "Leichter Grad" },
  gradMittel: { sq: "Shkallë e mesme", de: "Mittlerer Grad" },
  gradSchwer: { sq: "Shkallë e rëndë", de: "Schwerer Grad" },

  // ---------- Die Messung ----------
  //
  // Der Teil, der die Seite von einer Werbeseite unterscheidet. Ein
  // Adjektiv laesst sich wegdiskutieren, ein Wert auf einer Skala nicht.
  messMarke: { sq: "Matjet nga fotot tuaja", de: "Die Messungen aus Ihren Fotos" },
  igaMarke: { sq: "Shkalla IGA", de: "IGA-Skala" },
  igaJetzt: { sq: "Ju sot: {stufe}", de: "Sie heute: {stufe}" },
  igaZiel: { sq: "Synimi pas 4 javësh: {stufe}", de: "Ziel nach 4 Wochen: {stufe}" },
  igaStufe0: { sq: "lëkurë e pastër", de: "reine Haut" },
  igaStufe1: { sq: "pothuajse e pastër", de: "fast rein" },
  igaStufe2: { sq: "e lehtë", de: "leicht" },
  igaStufe3: { sq: "e moderuar", de: "mittelschwer" },
  igaStufe4: { sq: "e rëndë", de: "schwer" },

  // Das Fragezeichen an jeder Zeile. Ein Fachwort, das man antippen und in
  // einem Satz verstehen kann, wirkt kompetent - eines, das man
  // nachschlagen muesste, wirkt nach Abzocke.
  frageEtikett: { sq: "Çfarë do të thotë kjo?", de: "Was bedeutet das?" },

  // Und die Grenzen der eigenen Messung. Freiwillig genannt, weil genau
  // das den Rest glaubwuerdig macht.
  grenzenMarke: { sq: "Çfarë nuk mund të thotë një foto", de: "Was ein Foto nicht sagen kann" },
  grenzenText: {
    sq: "Nga një fotografi nuk vlerësohen dot thellësia e lezioneve, dhimbja, sekretimi i yndyrës, faktorët hormonalë apo vlerat laboratorike. Edhe drita dhe përpunimi i telefonit e ndryshojnë pamjen e skuqjes dhe të njollave. Prandaj kjo analizë është orientuese dhe nuk zëvendëson një ekzaminim te mjeku.",
    de: "Aus einem Foto lassen sich Tiefe der Entzündung, Schmerz, Talgproduktion, Hormonlage und Laborwerte nicht beurteilen. Auch Licht und die Bildverarbeitung des Telefons verändern, wie Rötung und Flecken aussehen. Diese Analyse ist deshalb orientierend und ersetzt keine Untersuchung beim Arzt."
  },

  // Ohne und mit Behandlung. Der Befund sagt, was ist - diese beiden
  // Kaesten sagen, was daraus wird. Der linke skaliert mit dem Grad, weil
  // der Verlauf einer unbehandelten Entzuendung das auch tut.
  ohneMarke: { sq: "Pa trajtim", de: "Ohne Behandlung" },
  mitMarke: { sq: "Me terapinë", de: "Mit der Therapie" },
  ohneLeicht: {
    sq: "Poret mbeten të zgjeruara dhe skuqja kthehet sa herë që lëkura stresohet.",
    de: "Die Poren bleiben erweitert, und die Rötung kehrt bei jeder Belastung zurück."
  },
  ohneMittel: {
    sq: "Inflamacioni aktiv lë njolla të errëta që zbehen me muaj — disa nuk zbehen fare.",
    de: "Die aktive Entzündung hinterlässt dunkle Flecken, die über Monate verblassen — manche gar nicht."
  },
  ohneSchwer: {
    sq: "Inflamacioni i thellë lë gropëza në lëkurë. Sa më gjatë të pritet, aq më e vështirë bëhet.",
    de: "Die tiefe Entzündung hinterlässt Narben. Je länger gewartet wird, desto schwerer wird es."
  },
  mitText: {
    sq: "Lëkura qetësohet javë pas jave. Java 4 është ajo që shihet në pasqyrë.",
    de: "Die Haut beruhigt sich Woche für Woche. Woche 4 ist die, die man im Spiegel sieht."
  },

  // Die vier Wochen. Er kauft keine zwei Flaschen, er kauft eine Therapie.
  // Und wer weiss, dass in Woche zwei noch nichts zu sehen ist, hoert in
  // Woche zwei nicht auf.
  planMarke: { sq: "28 ditë, javë pas jave", de: "28 Tage, Woche für Woche" },
  planJava1: {
    sq: "Java 1 — Lëkura pastrohet. Skuqja fillon të ulet.",
    de: "Woche 1 — Die Haut wird geklärt. Die Rötung geht zurück."
  },
  planJava2: {
    sq: "Java 2 — Puqrrat e reja bëhen më të rralla. Ende pak për t'u parë.",
    de: "Woche 2 — Neue Pickel werden seltener. Noch wenig zu sehen."
  },
  planJava3: {
    sq: "Java 3 — Njollat fillojnë të zbehen. Lëkura bëhet e njëtrajtshme.",
    de: "Woche 3 — Die Flecken verblassen. Die Haut wird gleichmäßiger."
  },
  planJava4: {
    sq: "Java 4 — Foto e re. Dr. Gashi krahason me ditën e parë.",
    de: "Woche 4 — Neues Foto. Dr. Gashi vergleicht mit Tag eins."
  },

  // Die Betreuung. Das Einzige, was kein Regal mitliefert.
  betreuungTitel: {
    sq: "Dr. Gashi ju ndjek 28 ditë.",
    de: "Dr. Gashi begleitet Sie 28 Tage."
  },
  betreuungText: {
    sq: "Kjo faqe mbetet e hapur. Dr. Gashi e sheh çdo ditë dhe e përshtat terapinë nëse duhet — pa pagesë shtesë.",
    de: "Diese Seite bleibt offen. Dr. Gashi sieht sie täglich und passt die Therapie an, wenn nötig — ohne Aufpreis."
  },

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

  // ---------- Der Bestellschirm ----------
  //
  // Oben der Korb, damit beim Tippen der Adresse sichtbar bleibt, was
  // gekauft wird - und was es kostet.
  korbSumme: { sq: "Gjithsej", de: "Gesamt" },
  korbZahlung: {
    sq: "Paguhet te dera, kur ta merrni pakon.",
    de: "Bezahlt an der Tür, bei Erhalt des Pakets."
  },

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
