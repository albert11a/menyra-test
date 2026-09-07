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

  // Der Titel ist der eines Arztbriefs, nicht der einer Benachrichtigung.
  // "Deine Analyse ist fertig" ist eine Nachricht ueber uns; "Raporti
  // dermatologjik" ist ein Dokument, das ihm gehoert.
  raportFuer: { sq: "Për {name}", de: "Für {name}" },
  raportTitel: { sq: "Raporti dermatologjik", de: "Dermatologischer Bericht" },

  // Die drei Pillen. Kurz, damit sie auf 320 Bildpunkten in eine Zeile gehen.
  pilleFoto: { sq: "{anzahl} foto", de: "{anzahl} Fotos" },
  pilleZona: { sq: "{anzahl} zona", de: "{anzahl} Zonen" },
  pilleParametra: { sq: "{anzahl} parametra", de: "{anzahl} Parameter" },

  // Was geprueft wurde.
  ekzMarke: { sq: "Kërkesa & ekzaminimi i kryer", de: "Auftrag & durchgeführte Untersuchung" },
  ekzStandard: {
    sq: "Vlerësim morfologjik i lëkurës së fytyrës në {zonat} zona anatomike nga {fotot} pamje. U vlerësuan 10 parametra dermatologjikë, me numërim të lezioneve sipas lokalizimit dhe anës anatomike.",
    de: "Morphologische Beurteilung der Gesichtshaut in {zonat} anatomischen Zonen aus {fotot} Ansichten. Beurteilt wurden 10 dermatologische Parameter, mit Zählung der Läsionen nach Lokalisation und anatomischer Seite."
  },

  gjetMarke: { sq: "Gjetjet", de: "Befund" },
  zonatAuf:  { sq: "Gjetjet sipas zonave", de: "Befund nach Zonen" },
  zonatZu:   { sq: "Mbyll gjetjet", de: "Befund schließen" },
  diagMarke: { sq: "Diagnoza", de: "Diagnose" },
  erklaerMarke: { sq: "Çfarë do të thotë për ju", de: "Was das für Sie bedeutet" },

  // Die Stufe ist eine HANDLUNG, kein Adjektiv. Der Fachbefund darf
  // "e lehtë" sagen; diese Zeile sagt, was zu tun ist. Zwanzig verstopfte
  // Poren sind fachlich leicht und brauchen trotzdem etwas.
  niveli0: { sq: "E qetë dhe e ekuilibruar — kërkon ruajtje", de: "Ruhig und im Gleichgewicht — braucht Erhalt" },
  niveli1: { sq: "Kërkon kujdes parandalues", de: "Braucht vorbeugende Pflege" },
  niveli2: { sq: "Kërkon kujdes aktiv", de: "Braucht aktive Pflege" },
  niveli3: { sq: "Kërkon kujdes të strukturuar", de: "Braucht strukturierte Pflege" },
  niveli4: { sq: "Kërkon vlerësim dhe ndjekje mjekësore", de: "Braucht ärztliche Beurteilung und Begleitung" },

  // Was ohne Pflege geschieht. Prognose, keine Therapie.
  ohneKujdesMarke: { sq: "Pa kujdes", de: "Ohne Pflege" },
  ohneZbehet:      { sq: "Zbehet vetë", de: "Geht von selbst zurück" },
  ohneNukZbehet:   { sq: "Nuk zbehet vetë", de: "Geht nicht von selbst zurück" },
  ohnePas6:        { sq: "Pas 6 muajsh", de: "Nach 6 Monaten" },

  // Das Blatt mit den Aufnahmen. Es zeigt, WAS aufgenommen wurde - die
  // Bilder selbst bleiben bei der Aerztin.
  fotoTitel:    { sq: "Pamjet e analizuara", de: "Die analysierten Ansichten" },
  fotoBallore:  { sq: "Ballore", de: "Frontal" },
  fotoDjathtas: { sq: "Djathtas", de: "Rechts" },
  fotoMajtas:   { sq: "Majtas", de: "Links" },
  fotoUnter: {
    sq: "{anzahl} pamje u vlerësuan nga Dr. Gashi. Fotografitë tuaja nuk shfaqen këtu dhe nuk udhëtojnë me linkun — i sheh vetëm ajo.",
    de: "{anzahl} Ansichten wurden von Dr. Gashi beurteilt. Ihre Aufnahmen erscheinen hier nicht und wandern nicht mit dem Link — nur sie sieht sie."
  },

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
  messMarke: { sq: "Vlerësimi dermatologjik", de: "Die dermatologische Beurteilung" },
  // Sie steht IN der Zeile der Einzelheiten, nicht als graue Zeile
  // darunter. Als Kleingedrucktes unter den Balken war sie lang, blass
  // und sah aus wie ein Hinweis, den man ueberliest.
  messRest: {
    sq: "{anzahl} parametra të tjerë",
    de: "{anzahl} weitere Parameter"
  },
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

  // Wann es NICHT bei der Creme bleiben darf. Es steht freiwillig da und
  // kostet im Zweifel einen Verkauf - genau deshalb glaubt der Rest.
  notfallMarke: { sq: "Kur duhet mjek pa vonesë", de: "Wann sofort zum Arzt" },

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
  planMarke: { sq: "Çfarë ndjekim gjatë 28 ditëve", de: "Was in den 28 Tagen verfolgt wird" },
  // GEMESSEN AM MENSCHEN, NICHT AN DER SEITE: "Woche 1 - die Roetung geht
  // zurueck" liest sich bei jemandem, der schon fuenf Sachen probiert hat,
  // als "ja ja, wieder diese Versprechen". Was BEOBACHTET wird, glaubt er;
  // was versprochen wird, nicht. Und wer nicht behauptet, alles vorher
  // genau zu wissen, wirkt aerztlicher - nicht schwaecher.
  planJava1: {
    sq: "Java 1 — Fillimi. Si e pranon lëkura terapinë; tharje e lehtë është e pritshme.",
    de: "Woche 1 — Die Haut wird geklärt. Die Rötung geht zurück."
  },
  planJava2: {
    sq: "Java 2 — Ndjekim sa elemente të reja dalin. Ende pak për t'u parë — kjo është normale.",
    de: "Woche 2 — Wir verfolgen, wie viele neue Elemente entstehen. Noch wenig zu sehen — das ist normal."
  },
  planJava3: {
    sq: "Java 3 — Kontrollohet njëtrajtshmëria e sipërfaqes dhe gjendja e njollave.",
    de: "Woche 3 — Gleichmäßigkeit der Oberfläche und der Stand der Flecken werden geprüft."
  },
  planJava4: {
    sq: "Java 4 — Foto e re. Dr. Gashi e krahason me ditën e parë dhe thotë çfarë vijon.",
    de: "Woche 4 — Neues Foto. Dr. Gashi vergleicht mit Tag eins und sagt, was folgt."
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

  // ---------- Die Bruecke ----------
  //
  // Die Seite bewies bisher ein Problem in aller Ausfuehrlichkeit und
  // zeigte dann eine Flasche. Dazwischen fehlte der Satz, den jeder
  // Skeptiker als Erstes denkt: "Gut - und warum hilft ausgerechnet DAS?"
  // Ohne diese Bruecke kauft nur, wer ohnehin kaufen wollte.
  // Der Szenenwechsel. Ohne ihn liest sich die Seite, als sei die
  // Diagnose nur geschrieben worden, damit darunter etwas verkauft werden
  // kann. Mit ihm ist der Bericht fertig - und danach beginnt etwas
  // anderes.
  szeneMarke: { sq: "Hapi i ardhshëm", de: "Der nächste Schritt" },
  szeneSatz: {
    sq: "Analiza mbaroi. Këtu fillon plani që Dr. Gashi rekomandon për lëkurën tuaj.",
    de: "Die Analyse ist beendet. Hier beginnt der Plan, den Dr. Gashi für Ihre Haut empfiehlt."
  },

  // Der schwierigste Kunde von allen: der, der schon fuenf Sachen probiert
  // hat. Sein Einwand gehoert VOR die Begruendung, nicht ins Kleingedruckte
  // ganz unten - sonst liest er die Begruendung gar nicht erst.
  provuarMarke: { sq: "Keni provuar produkte më parë?", de: "Schon Produkte probiert?" },
  provuarText: {
    sq: "Kjo nuk është “edhe një krem tjetër”. Terapia është zgjedhur sipas gjetjeve tuaja, dhe Dr. Gashi përcakton çfarë përdorni dhe në çfarë rendi.",
    de: "Das ist nicht „noch eine Creme“. Die Therapie ist nach Ihren Befunden gewählt, und Dr. Gashi legt fest, was Sie benutzen und in welcher Reihenfolge."
  },

  // Was in den 53 Euro steckt.
  //
  // Ohne diese Liste rechnet er "zwei Flaschen zu 30 ml = 53 Euro" und
  // vergleicht mit dem Regal. Mit ihr vergleicht er einen begleiteten
  // 28-Tage-Plan mit dem Alleine-weiter-Probieren. Das ist eine andere
  // Kategorie, und in der ist der Preis niedrig.
  perfshiMarke: { sq: "Në {preis} € përfshihet", de: "In den {preis} € enthalten" },
  // FUENF, nicht acht.
  //
  // Versand und Garantie standen hier schon einmal - und danach noch
  // einmal unter dem Preis und ein drittes Mal im Garantiekasten. Dreimal
  // dasselbe liest sich als Verkaufstrichter, nicht als Leistung. Hier
  // steht nur, was den Wert ausmacht; das Risiko kommt NACH dem Preis.
  perfshiListe: {
    sq: [
      "Vlerësimi personal nga Dr. Gashi",
      "Terapia e zgjedhur për gjetjet tuaja",
      "Plani personal për 28 ditë",
      "Ndjekja dhe përshtatja gjatë 28 ditëve",
      "Krahasimi përfundimtar në ditën e 28-të"
    ],
    de: [
      "Die persönliche Beurteilung von Dr. Gashi",
      "Die für Ihre Befunde ausgewählte Therapie",
      "Der persönliche Plan über 28 Tage",
      "Begleitung und Anpassung über die 28 Tage",
      "Der abschliessende Vergleich am 28. Tag"
    ]
  },

  // Die aufklappbaren Einzelheiten. Wer sie will, findet sie; wer nur
  // wissen will, was mit seiner Haut ist, wird nicht damit aufgehalten.
  detajetAuf: { sq: "Detajet e analizës", de: "Einzelheiten der Analyse" },

  pseMarke: { sq: "Pse pikërisht kjo terapi", de: "Warum genau diese Therapie" },
  pseEins: {
    sq: "Te ju, gjetja më e fortë është {a}. Kjo terapi është zgjedhur për të:",
    de: "Bei Ihnen ist der stärkste Befund {a}. Genau dafür ist diese Therapie gewählt:"
  },
  pseZwei: {
    sq: "Te ju, dy gjetjet më të forta janë {a} dhe {b}. Kjo terapi është zgjedhur për to:",
    de: "Bei Ihnen sind die zwei stärksten Befunde {a} und {b}. Genau dafür ist diese Therapie gewählt:"
  },

  // ---------- Die Garantie ----------
  //
  // Sie stand als eine von drei Zeilen in elf Pixeln unter dem Knopf. Das
  // ist die staerkste Zusage der ganzen Seite: Sie nimmt dem Zoegernden das
  // einzige echte Risiko ab. Eine Zusage, die man ueberliest, wirkt nicht.
  garanciMarke: { sq: "Rreziku është yni, jo juaji", de: "Das Risiko liegt bei uns" },
  garanciTitel: {
    sq: "30 ditë. Nëse nuk shihni ndryshim, paratë kthehen.",
    de: "30 Tage. Sehen Sie keine Veränderung, bekommen Sie Ihr Geld zurück."
  },
  garanciText: {
    sq: "Pa formularë dhe pa pyetje — mjafton një mesazh. Dhe paguani vetëm kur ta merrni në dorë: nuk jepni asnjë kartë sot.",
    de: "Ohne Formular und ohne Rückfragen — eine Nachricht genügt. Und Sie zahlen erst bei Lieferung: heute geben Sie keine Karte heraus."
  },

  // ---------- Die Fragen, die sonst niemand beantwortet ----------
  //
  // Wer eine Frage hat und keine Antwort findet, kauft nicht - er schiebt
  // es auf, und aufgeschoben heisst nie. Jede dieser sechs Fragen ist eine,
  // die vor dem Kauf wirklich gestellt wird.
  pyetjeMarke: { sq: "Pyetje të shpeshta", de: "Häufige Fragen" },
  pyetjet: {
    sq: [
      ["A është e sigurt?",
       "Përbërësit janë të njohur dhe përdoren gjerësisht në dermatologji. Në ditët e para mund të ndodhë tharje e lehtë ose skuqje — kjo është e pritshme dhe qetësohet. Nëse shfaqet skuqje e fortë, ndërprisni dhe na shkruani."],
      ["Po nëse jam shtatzënë ose ushqej me gji?",
       "Mos e filloni pa folur më parë me mjekun tuaj. Na shkruani përpara se të porosisni dhe Dr. Gashi ju thotë çfarë është e përshtatshme."],
      ["A mund ta përdor me kremrat që kam?",
       "Po, por jo në të njëjtin moment me acide ose retinol të fortë. Na shkruani çfarë përdorni dhe Dr. Gashi ju rendit ditën."],
      ["Sa vjen porosia dhe sa kushton dërgesa?",
       "2–3 ditë pune në Kosovë dhe Shqipëri. Dërgesa është falas dhe paguani te dera, kur ta merrni në dorë."],
      ["Po nëse nuk funksionon te unë?",
       "30 ditë garanci. Nëse nuk shihni ndryshim, paratë kthehen — pa pyetje."],
      ["Ku shkojnë fotot e mia?",
       "I sheh vetëm Dr. Gashi. Ato nuk shfaqen në këtë faqe dhe nuk udhëtojnë me linkun, edhe nëse ia dërgoni dikujt."]
    ],
    de: [
      ["Ist es sicher?",
       "Die Wirkstoffe sind bekannt und werden in der Dermatologie breit eingesetzt. In den ersten Tagen kann es leicht trocknen oder röten — das ist zu erwarten und beruhigt sich. Bei starker Rötung absetzen und uns schreiben."],
      ["Was, wenn ich schwanger bin oder stille?",
       "Nicht ohne Rücksprache mit Ihrer Ärztin beginnen. Schreiben Sie uns vor der Bestellung, dann sagt Dr. Gashi Ihnen, was passt."],
      ["Kann ich es mit meinen Cremes benutzen?",
       "Ja, aber nicht gleichzeitig mit starken Säuren oder Retinol. Schreiben Sie uns, was Sie benutzen, dann ordnet Dr. Gashi den Tag."],
      ["Wann kommt die Lieferung und was kostet sie?",
       "2–3 Werktage in Kosovo und Albanien. Der Versand ist kostenlos, gezahlt wird bei Lieferung."],
      ["Was, wenn es bei mir nicht wirkt?",
       "30 Tage Garantie. Sehen Sie keine Veränderung, bekommen Sie Ihr Geld zurück — ohne Rückfragen."],
      ["Wo landen meine Fotos?",
       "Nur bei Dr. Gashi. Sie erscheinen nicht auf dieser Seite und reisen nicht mit dem Link mit, auch wenn Sie ihn weitergeben."]
    ]
  },

  // Der Bericht gilt fuer den Zustand von HEUTE. Das ist keine erfundene
  // Frist - es ist der Grund, warum ein Befund ein Datum traegt.
  raportVlen: {
    sq: "Ky raport vlen për gjendjen e lëkurës më {data}. Sa më gjatë të pritet, aq më shumë ndryshon ajo që u mat sot.",
    de: "Dieser Bericht gilt für den Hautzustand vom {data}. Je länger gewartet wird, desto mehr verändert sich, was heute gemessen wurde."
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

  // Der Knopf kommt erst, wenn die Empfehlung im Bild ist.
  //
  // Vorher ist er nicht nur ueberfluessig, er ist schaedlich: Ein Knopf am
  // unteren Rand ist eine Abkuerzung, und eine Abkuerzung nimmt man. Wer
  // gerade erfaehrt, was mit seiner Haut ist, soll das lesen.
  //
  // "Fillo" und nicht "Blej": Die Frage ist nicht "kaufe ich zwei Cremes",
  // sondern "wann fange ich an".
  knopfStart: { sq: "Fillo terapinë 28-ditore — {preis} €", de: "28-Tage-Therapie beginnen — {preis} €" },

  kaufKnopf: { sq: "Merr terapinë — {preis} €", de: "Therapie bestellen — {preis} €" },
  kaufUnter: { sq: "Pa kartë · Paguani te dera · 30 ditë garanci", de: "Ohne Karte · Zahlung an der Tür · 30 Tage Garantie" },

  // ---------- Der Bestellschirm ----------
  //
  // Oben der Korb, damit beim Tippen der Adresse sichtbar bleibt, was
  // gekauft wird - und was es kostet.
  korbSumme: { sq: "Gjithsej", de: "Gesamt" },
  korbZahlung: {
    sq: "Paguhet te dera, kur ta merrni pakon.",
    de: "Bezahlt an der Tür, bei Erhalt des Pakets."
  },

  // "Der letzte Schritt". Keine Behauptung - es IST der letzte. Wer
  // sieht, dass er fast fertig ist, bricht seltener ab als der, der nicht
  // weiss, wie viel noch kommt.
  bestellSchritt: { sq: "Hapi i fundit", de: "Der letzte Schritt" },
  bestellTitel: { sq: "Ku ta dërgojmë terapinë?", de: "Wohin sollen wir die Therapie liefern?" },
  bestellName: { sq: "Emri dhe mbiemri", de: "Vor- und Nachname" },
  bestellTelefon: { sq: "Numri i telefonit", de: "Telefonnummer" },
  bestellAdresse: { sq: "Adresa", de: "Adresse" },
  bestellOrt: { sq: "Qyteti", de: "Stadt" },
  // Der Preis steht auf dem letzten Knopf. Unmittelbar vor der
  // endgueltigen Handlung darf es keine Ueberraschung geben.
  bestellSenden: { sq: "Konfirmo porosinë — {preis} €", de: "Bestellung bestätigen — {preis} €" },
  bestellUnter: { sq: "Paguani vetëm kur ta merrni në dorë.", de: "Sie zahlen erst, wenn Sie es in der Hand halten." },
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
