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

  // Der Kopf des Befunds.
  //
  // Er ist der eines Arztbriefs, nicht der einer Benachrichtigung: "Deine
  // Analyse ist fertig" ist eine Nachricht ueber uns; "Analiza
  // dermatologjike" ist ein Dokument, das ihm gehoert.
  //
  // Die Zeile ueber dem Namen sagt in einem Satz, was das hier ist und
  // wer es gemacht hat: "Diese Analyse wurde fuer Ajshe von Dr. Violeta
  // Gashi erstellt." Kein "Rishikuar personalisht nga" - eine lange
  // Formulierung an dieser Stelle klingt nach Beteuerung, und wer
  // beteuert, wird geprueft.
  // Die Anrede oben. Sie beantwortet "ist das ueber mich", bevor die
  // Seite beantwortet, wer sie gemacht hat. Ohne Namen bleibt derselbe
  // Satz stehen - eine Zeile, die verschwindet, reisst den Kopf auf.
  raportFuer: { sq: "{name}, kjo është lëkura juaj sot.", de: "{name}, das ist Ihre Haut heute." },
  raportFuerOhne: { sq: "Kjo është lëkura juaj sot.", de: "Das ist Ihre Haut heute." },
  // Drei Zeilen unter der Anrede: wer beurteilt hat, wie sie heisst, was
  // sie ist und wann. "Vleresuar nga" steht allein, damit der Name die
  // Zeile fuer sich hat - er ist die Angabe, die zaehlt.
  arztVor: { sq: "Vlerësuar nga", de: "Beurteilt von" },
  // "me" und nicht nur ein Trennpunkt: Die Seite sagt an anderer Stelle
  // schon "gjendjen e lekures me {data}" - dasselbe Wort fuer dieselbe
  // Sache.
  arztRolleDatum: { sq: "{rolle} · më {datum}", de: "{rolle} · vom {datum}" },
  // Der Dokumenttitel steht klein und in Grossbuchstaben ganz oben,
  // neben der Fallnummer. Die Grossbuchstaben macht der Stil, nicht der
  // Text - sonst steht er in jeder Vorleseansage geschrien da.
  raportTitel: { sq: "Analiza dermatologjike", de: "Dermatologische Analyse" },
  arztName: { sq: "Dr. Violeta Gashi", de: "Dr. Violeta Gashi" },
  arztRolle: { sq: "Dermatologe", de: "Dermatologin" },

  // Die drei Angaben unter der Aerztin.
  //
  // Zahl oben, Wort darunter - und das Wort allein, ohne die Zahl noch
  // einmal im Satz. "10 parametra" in einer Zeile war auf 320
  // Bildpunkten das laengste, was in eine von drei Kacheln passte;
  // getrennt passen beide bequem, und die Zahl wird zuerst gelesen.
  markeFoto: { sq: "foto", de: "Fotos" },
  markeParametra: { sq: "parametra", de: "Parameter" },
  markeZona: { sq: "zona", de: "Zonen" },
  // Nur fuer den Rueckfall, wenn zu wenige Zonen beurteilt wurden: Dann
  // steht dort das Datum statt einer Zonenzahl, die nichts aussagt.
  markeDatum: { sq: "analiza", de: "Analyse" },
  pilleZona: { sq: "{anzahl} zona", de: "{anzahl} Zonen" },
  // Was geprueft wurde.
  ekzMarke: { sq: "Kërkesa & ekzaminimi i kryer", de: "Auftrag & durchgeführte Untersuchung" },
  ekzStandard: {
    sq: "Vlerësim morfologjik i lëkurës së fytyrës në {zonat} zona anatomike nga {fotot} pamje. U vlerësuan 10 parametra dermatologjikë, me numërim të lezioneve sipas lokalizimit dhe anës anatomike.",
    de: "Morphologische Beurteilung der Gesichtshaut in {zonat} anatomischen Zonen aus {fotot} Ansichten. Beurteilt wurden 10 dermatologische Parameter, mit Zählung der Läsionen nach Lokalisation und anatomischer Seite."
  },

  gjetMarke: { sq: "Çfarë vërehet në lëkurën tuaj", de: "Befund" },
  zonatAuf:  { sq: "Ndryshimet sipas zonave", de: "Befund nach Zonen" },
  zonatZu:   { sq: "Mbyll gjetjet", de: "Befund schließen" },
  diagMarke: { sq: "Si vlerësohet gjendja", de: "Einordnung des Hautbilds" },
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
  ohneZbehet:      { sq: "Zbehet vetë", de: "Geht von selbst zurück" },
  ohneNukZbehet:   { sq: "Çfarë mund të vazhdojë", de: "Was bestehen bleiben kann" },
  ohnePas6:        { sq: "Si mund të ndryshojë", de: "Möglicher Verlauf" },

  // Das Blatt mit den Aufnahmen. Es zeigt, WAS aufgenommen wurde - die
  // Bilder selbst bleiben bei der Aerztin.
  fotoTitel:    { sq: "Pamjet e analizuara", de: "Die analysierten Ansichten" },
  fotoBallore:  { sq: "Ballore", de: "Frontal" },
  fotoDjathtas: { sq: "Djathtas", de: "Rechts" },
  fotoMajtas:   { sq: "Majtas", de: "Links" },
  // Was mit den Aufnahmen wirklich geschieht.
  //
  // GEMESSEN, NICHT GESCHAETZT: Hier stand, die Aufnahmen "wandern nicht
  // mit dem Link - nur sie sieht sie". Der zweite Teil war eine
  // Behauptung ueber Personen; belegt ist etwas anderes und Genaueres:
  // Die drei Aufnahmen werden zur Beurteilung uebertragen und liegen im
  // Fall; lesen darf sie nach den Firestore-Regeln nur das Praxiskonto
  // (firestore.rules, match /photos/{blick}: allow read: if isCeoActor()).
  // Auf DIESER Seite erscheinen sie nicht, und sie haengen nicht am Link.
  // Genau das steht jetzt da - nicht mehr.
  fotoUnter: {
    sq: "{anzahl} pamje u dërguan për vlerësim dhe janë te dosja juaj. Ato nuk shfaqen në këtë faqe dhe nuk udhëtojnë me linkun; i hap vetëm llogaria e praktikës.",
    de: "{anzahl} Ansichten wurden zur Beurteilung übertragen und liegen bei Ihrem Fall. Auf dieser Seite erscheinen sie nicht und sie wandern nicht mit dem Link; öffnen kann sie nur das Praxiskonto."
  },

  fertigTitel: { sq: "{name}, analiza juaj është gati.", de: "{name}, Ihre Analyse ist fertig." },
  fertigOhneName: { sq: "Analiza juaj është gati.", de: "Ihre Analyse ist fertig." },

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
  messMarke: { sq: "Lëkura juaj, më nga afër", de: "Die dermatologische Beurteilung" },
  // Sie steht IN der Zeile der Einzelheiten, nicht als graue Zeile
  // darunter. Als Kleingedrucktes unter den Balken war sie lang, blass
  // und sah aus wie ein Hinweis, den man ueberliest.
  messRest: {
    sq: "{anzahl} parametra të tjerë",
    de: "{anzahl} weitere Parameter"
  },
  igaMarke: { sq: "Shkalla IGA", de: "IGA-Skala" },
  // "Ju sot: {stufe}" stand hier und ist raus: Der Wert steht fuer sich,
  // die Skala darunter sagt das "sot" ohnehin. Und die Zielstufe
  // ("Synimi pas 4 javesh") ist ersatzlos gestrichen - eine Zielstufe
  // gibt es in den Daten NICHT. Die Seite haette sie aus niveli minus eins
  // rechnen muessen, also eine Prognose erfinden, und zwar ausgerechnet
  // an der Stelle, an der ein Ergebnis in Aussicht gestellt wird. Soll sie
  // kommen, braucht es ein Feld im Vertrag, das jemand verantwortet.
  igaInfo: {
    sq: "Shkalla IGA është një shkallë e përdorur gjerësisht në dermatologji për të përshkruar gjendjen e përgjithshme të lëkurës me pesë hapa: e pastër, pothuajse e pastër, e lehtë, e moderuar, e rëndë. Ajo përshkruan pamjen në momentin e vlerësimit — jo shkakun dhe jo ecurinë.",
    de: "Die IGA-Skala ist eine in der Dermatologie gebräuchliche Einteilung des Gesamtbildes der Haut in fünf Stufen: reine Haut, fast rein, leicht, mittelschwer, schwer. Sie beschreibt das Bild im Moment der Beurteilung — nicht die Ursache und nicht den Verlauf."
  },
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

  // Zwei Ueberschriften fuer zwei verschiedene Dinge, und sie muessen
  // verschieden heissen: Draussen, offen ueber den Grenzen, steht die
  // Tatsache - was nicht von selbst zurueckgeht. Im Aufklapper steht der
  // Verlauf: was zurueckgeht und wohin es nach einem halben Jahr laeuft.
  // Hiessen beide gleich, suchte der Leser, welcher der gemeinte ist.
  ohneVerlaufMarke: { sq: "Ecuria pa kujdes", de: "Der Verlauf ohne Pflege" },

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

  // Die Betreuung.
  //
  // GEMESSEN, NICHT GESCHAETZT: Hier stand "Dr. Gashi e sheh çdo ditë" -
  // eine taegliche aerztliche Kontrolle. Dafuer gibt es im Projekt keine
  // freigegebene Leistungsangabe; das Konzept fuehrt die Nachfassarbeit
  // sogar ausdruecklich als offenen Punkt ("wer bearbeitet die Liste, in
  // welcher Sprache, wie oft?", docs/lifeskin/LIFESKIN_KONZEPT.md). Ein
  // Werbetext ist kein Beleg fuer einen Kontrolltakt.
  //
  // Was belegt ist: Die Seite bleibt unter derselben Adresse offen (sie
  // fragt ihren Zustand selbst nach), und es gibt einen echten,
  // hinterlegten Weg zu Dr. Gashi (LIFESKIN_WHATSAPP). Mehr wird nicht
  // behauptet - kein Takt, keine Antwortzeit.
  betreuungTitel: {
    sq: "Ndjekja gjatë 28 ditëve",
    de: "Die Begleitung über die 28 Tage"
  },
  betreuungText: {
    sq: "Kjo faqe mbetet e hapur nën të njëjtin link dhe raporti juaj qëndron këtu. Nëse gjatë terapisë diçka ndryshon ose keni një pyetje, i shkruani Dr. Gashit dhe ajo e përshtat planin — pa pagesë shtesë.",
    de: "Diese Seite bleibt unter demselben Link offen, und Ihr Bericht bleibt hier. Wenn sich während der Therapie etwas ändert oder Sie eine Frage haben, schreiben Sie Dr. Gashi — sie passt den Plan an, ohne Aufpreis."
  },
  // Der Kontakt ist ein vorhandener, echter Weg (LIFESKIN_WHATSAPP) und
  // steht als ruhiger Nebenlink, nicht als zweiter Kaufknopf.
  kontaktLink: {
    sq: "Shkruani Dr. Gashit në WhatsApp",
    de: "Dr. Gashi auf WhatsApp schreiben"
  },

  // ---------- Die Ueberleitung ----------
  //
  // EIN Satz, keine Szene.
  //
  // Hier standen zwei Bausteine hintereinander: ein eigener
  // Abschlussgedanke ("Analiza mbaroi …" mit Strich und Marke) und
  // darunter ein hervorgehobener Kasten gegen den Einwand "das ist doch
  // nur noch eine Creme". Der erste erklaerte den Bruch, den er selbst
  // erzeugte; der zweite behauptete genau das, was die Produkttexte
  // darunter ohnehin belegen - und eine Behauptung neben ihrem eigenen
  // Beweis schwaecht den Beweis.
  //
  // Uebrig bleibt die Bewegung selbst: vom Befund zum Plan.
  // Die Ueberschrift der Schleuse. Sie nennt einen BEDARF und keinen
  // Vorschlagenden: "Was Ihre Haut jetzt braucht" gehoert ihr, "Was Dr.
  // Gashi vorschlaegt" gehoert uns - und ein Vorschlagender hat ein
  // Interesse.
  // Der Auftrag auf der Produktkarte. Er nennt, was die Haut braucht -
  // nicht, was das Mittel kann.
  produktKerkon: { sq: "Kërkon {kerkon}", de: "Erfordert {kerkon}" },
  nevojatMarke: { sq: "Çfarë i duhet lëkurës suaj tani", de: "Was Ihre Haut jetzt braucht" },
  kalimSatz: {
    sq: "Nga gjetjet e analizës te plani për lëkurën tuaj.",
    de: "Von den Befunden der Analyse zum Plan für Ihre Haut."
  },

  // ---------- Der Angebotsblock ----------
  //
  // Ueberschrift, Inhalt, Preis, Lieferung, Knopf - in dieser Reihenfolge
  // und in EINEM Block. Vorher lagen die Teile ueber eine Bildschirmlaenge
  // verteilt: erst die vier Wochen, dann die Begleitung, dann die Liste,
  // dann der Preis, dann drei Zusagen, dann die Garantie. Wer entscheiden
  // wollte, musste die Angaben selbst zusammensuchen.
  // ---------- Der dokumentierte Fall ----------
  //
  // Er steht NACH der Therapie und VOR dem Preis, und diese Stelle ist
  // die ganze Aussage: Die Therapie sagt, was getan wird. Der Fall sagt,
  // dass es schon einmal getan wurde. Erst danach kommt, was es kostet.
  // Stuende er oben, waere aus dem Arztbrief eine Anzeige geworden, und
  // genau dagegen kommt diese Seite an.
  fallMarke: { sq: "Një rast i dokumentuar", de: "Ein dokumentierter Fall" },
  fallTag: { sq: "Dita {tag}", de: "Tag {tag}" },

  // DIE EHRLICHE ZEILE, und sie ist nicht das Kleingedruckte.
  //
  // Ein Vorher-Nachher ohne sie ist ein Ergebnisversprechen - und ein
  // Ergebnisversprechen ist genau das, was diese Seite drei Abschnitte
  // vorher noch ausdruecklich NICHT gibt ("Was ein Foto nicht sagen
  // kann"). Zwei Bilder, die etwas anderes behaupten als der Text
  // darueber, machen den Text unglaubwuerdig, nicht die Bilder stark.
  //
  // "in demselben Licht" ist kein Beiwerk: Es ist der einzige Satz, der
  // den haeufigsten Einwand gegen jedes Vorher-Nachher vorwegnimmt -
  // dass die zweite Aufnahme nur besser ausgeleuchtet sei.
  fallHinweis: {
    sq: "Një rast i vetëm, i fotografuar në të njëjtën dritë dhe pa përpunim. "
      + "Lëkura e secilit reagon ndryshe — ky nuk është premtim rezultati.",
    de: "Ein einzelner Fall, in demselben Licht aufgenommen und unbearbeitet. "
      + "Jede Haut reagiert anders — das ist kein Ergebnisversprechen."
  },

  paketaMarke: { sq: "Paketa juaj për 28 ditë", de: "Ihr Paket für 28 Tage" },

  // Was im Preis steckt.
  //
  // Ohne diese Liste rechnet er "zwei Flaschen = 53 Euro" und vergleicht
  // mit dem Regal. Mit ihr vergleicht er ein begleitetes 28-Tage-Paket mit
  // dem Alleine-weiter-Probieren.
  //
  // Die Mittel und ihre Mengen kommen aus den Daten des Falls, nicht aus
  // dieser Datei: Bei drei Mitteln stehen drei Zeilen da, und die Menge
  // ist die, die auch auf der Karte steht.
  perfshiMarke: { sq: "Çfarë përfshihet", de: "Was enthalten ist" },
  // Die kostenlose Erstanalyse steht NICHT mehr darin.
  //
  // Sie hat er bereits bekommen, und zwar kostenlos - genau das war das
  // Versprechen der Anzeige. Sie danach als Bestandteil eines
  // kostenpflichtigen Pakets aufzuzaehlen, verkauft ihm etwas, das er
  // schon hat, und das faellt genau dem Skeptiker auf, den die Liste
  // ueberzeugen soll.
  perfshiPlan: {
    sq: "Plani personal i përdorimit për 28 ditë",
    de: "Der persönliche Anwendungsplan über 28 Tage"
  },
  perfshiNdjekje: {
    sq: "Ndjekja dhe përshtatja e planit gjatë 28 ditëve",
    de: "Begleitung und Anpassung des Plans über die 28 Tage"
  },
  perfshiKrahasim: {
    sq: "Krahasimi përfundimtar në ditën e 28-të",
    de: "Der abschliessende Vergleich am 28. Tag"
  },

  // Lieferung und Zahlung, wie sie in der Konfiguration stehen:
  // versandKosten 0, zahlarten ["nachnahme"], lieferzeitTage [2, 3].
  // Steht dort etwas anderes, faellt die Zeile weg - sie wird nicht
  // behauptet, sie wird abgeleitet.
  dorezimSatz: { sq: "Paguani në dorëzim · Dërgesa falas", de: "Zahlung bei Lieferung · Versand kostenlos" },

  // Der eine Aufklapper.
  //
  // "Detajet e analizës" klang nach Kleingedrucktem und wurde deshalb
  // nicht angetippt - dabei liegt darin die halbe Analyse: die
  // ausfuehrliche Erklaerung, die uebrigen Parameter, die Zonen und der
  // Verlauf ohne Pflege. "Lesen Sie die vollstaendige Analyse" sagt, dass
  // dort ein Text wartet und keine Fussnote.
  detajetAuf: { sq: "Lexoni analizën e plotë", de: "Die vollständige Analyse lesen" },
  // Die Zeile darunter sagt, WAS darin liegt - und zwar das, was wirklich
  // gezeichnet wurde. Vorher stand dort nur "{anzahl} parametra të tjerë",
  // obwohl im Aufklapper auch die ausfuehrliche Erklaerung, die Zonen und
  // der Verlauf liegen. Wer nicht weiss, was hinter einer Zeile steht,
  // tippt sie nicht an.
  detajetShpjegim: { sq: "shpjegimi i plotë", de: "die ausführliche Erklärung" },
  detajetEcuria: { sq: "ecuria pa kujdes", de: "der Verlauf ohne Pflege" },

  // Die Einzelheiten eines Mittels - auf Antippen, in demselben Blatt wie
  // die Aufnahmen oben.
  //
  // "Und wie benutze ich das?" und "was ist da drin?" werden VOR dem Kauf
  // gestellt, nicht danach. Wer die Antwort nicht findet, kauft nicht - er
  // schiebt es auf, und aufgeschoben heisst nie. Unter jeder Karte
  // ausgeklappt waeren sie dagegen eine Tapete, durch die auch der scrollt,
  // der nur wissen will, was er bekommt.
  //
  // Die Zahl steht auf der Pille: "3 përbërës" ist ein Beweis, "Detaje" ist
  // eine Einladung ins Ungewisse.
  mehrMitStoffen: {
    sq: "{anzahl} përbërës · si përdoret",
    de: "{anzahl} Wirkstoffe · Anwendung"
  },
  mehrOhneStoffe: { sq: "Si përdoret", de: "Anwendung" },
  perberesMarke: { sq: "Përbërësit aktivë", de: "Die Wirkstoffe" },
  perdorimMarke: { sq: "Si përdoret", de: "Wie es angewendet wird" },
  perdorimHapi: { sq: "hapi {hapi}", de: "Schritt {hapi}" },
  // Der Zeitpunkt als Chip auf der Karte. Kurz, weil daneben schon ein
  // Mond oder eine Sonne steht - der ganze Satz steht im Blatt.
  kohaMbremje: { sq: "mbrëmje", de: "abends" },
  kohaMengjes: { sq: "mëngjes", de: "morgens" },
  kohaDyfish: { sq: "2× në ditë", de: "2× täglich" },
  // Das Ziel bis Tag 28. Es nennt auch eine Grenze - und genau deshalb wird
  // es geglaubt. Eine Prognose, die nur verspricht, wird es nicht.
  synimiMarke: { sq: "Deri në ditën 28", de: "Bis Tag 28" },

  pseMarke: { sq: "Pse pikërisht kjo terapi", de: "Warum genau diese Therapie" },
  pseEins: {
    sq: "Te ju, gjetja më e fortë është {a}. Kjo terapi është zgjedhur për të:",
    de: "Bei Ihnen ist der stärkste Befund {a}. Genau dafür ist diese Therapie gewählt:"
  },
  pseZwei: {
    sq: "Te ju, dy gjetjet më të forta janë {a} dhe {b}. Kjo terapi është zgjedhur për to:",
    de: "Bei Ihnen sind die zwei stärksten Befunde {a} und {b}. Genau dafür ist diese Therapie gewählt:"
  },
  // Eine ruhige Haut hat keinen staerksten Befund - und bekommt trotzdem
  // einen Satz. Frueher fiel bei ihr der ganze Abschnitt weg, und damit
  // stand ueber der Therapie gar nichts mehr.
  pseOhne: {
    sq: "Kjo terapi është zgjedhur sipas vlerësimit të lëkurës suaj:",
    de: "Diese Therapie ist nach der Beurteilung Ihrer Haut gewählt:"
  },

  // ---------- Die Garantie ----------
  //
  // Sie stand als eine von drei Zeilen in elf Pixeln unter dem Knopf. Das
  // ist die staerkste Zusage der ganzen Seite: Sie nimmt dem Zoegernden das
  // einzige echte Risiko ab. Eine Zusage, die man ueberliest, wirkt nicht.
  garanciMarke: { sq: "Rreziku është yni, jo juaji", de: "Das Risiko liegt bei uns" },
  // Die Zahl kommt aus der Konfiguration (rueckgabeTage), nicht aus dem
  // Satz: Sonst stehen nach der ersten Aenderung zwei Fristen auf
  // derselben Seite, und die eine widerlegt die andere.
  garanciTitel: {
    sq: "{tage} ditë. Nëse nuk shihni ndryshim, paratë kthehen.",
    de: "{tage} Tage. Sehen Sie keine Veränderung, bekommen Sie Ihr Geld zurück."
  },
  // Der Weg zur Erstattung, konkret - aber ohne die Garantie zu erweitern.
  //
  // Die Bedingungen bleiben, wie sie sind: {tage} Tage aus der
  // Konfiguration (rueckgabeTage), Nachnahme, keine Karte. Neu ist nur,
  // dass danebensteht, WOHIN die eine Nachricht geht - eine Zusage, deren
  // Weg man nicht kennt, wird nicht geglaubt.
  garanciText: {
    sq: "Pa formularë dhe pa pyetje: mjafton një mesazh te Dr. Gashi brenda {tage} ditëve nga marrja e pakos. Dhe paguani vetëm kur ta merrni në dorë — nuk jepni asnjë kartë sot.",
    de: "Ohne Formular und ohne Rückfragen: Eine Nachricht an Dr. Gashi innerhalb von {tage} Tagen nach Erhalt des Pakets genügt. Und Sie zahlen erst bei Lieferung — heute geben Sie keine Karte heraus."
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
       "{von}–{bis} ditë pune në Kosovë dhe Shqipëri. Dërgesa është falas dhe paguani te dera, kur ta merrni në dorë."],
      ["Po nëse nuk funksionon te unë?",
       "{tage} ditë garanci. Nëse nuk shihni ndryshim, paratë kthehen — pa pyetje. Mjafton t'i shkruani Dr. Gashit."],
      ["Ku shkojnë fotot e mia?",
       "Pamjet dërgohen për vlerësim dhe ruhen te dosja juaj. Në këtë faqe nuk shfaqen dhe nuk udhëtojnë me linkun, edhe nëse ia dërgoni dikujt; i hap vetëm llogaria e praktikës."]
    ],
    de: [
      ["Ist es sicher?",
       "Die Wirkstoffe sind bekannt und werden in der Dermatologie breit eingesetzt. In den ersten Tagen kann es leicht trocknen oder röten — das ist zu erwarten und beruhigt sich. Bei starker Rötung absetzen und uns schreiben."],
      ["Was, wenn ich schwanger bin oder stille?",
       "Nicht ohne Rücksprache mit Ihrer Ärztin beginnen. Schreiben Sie uns vor der Bestellung, dann sagt Dr. Gashi Ihnen, was passt."],
      ["Kann ich es mit meinen Cremes benutzen?",
       "Ja, aber nicht gleichzeitig mit starken Säuren oder Retinol. Schreiben Sie uns, was Sie benutzen, dann ordnet Dr. Gashi den Tag."],
      ["Wann kommt die Lieferung und was kostet sie?",
       "{von}–{bis} Werktage in Kosovo und Albanien. Der Versand ist kostenlos, gezahlt wird bei Lieferung."],
      ["Was, wenn es bei mir nicht wirkt?",
       "{tage} Tage Garantie. Sehen Sie keine Veränderung, bekommen Sie Ihr Geld zurück — ohne Rückfragen. Eine Nachricht an Dr. Gashi genügt."],
      ["Wo landen meine Fotos?",
       "Die Ansichten werden zur Beurteilung übertragen und liegen bei Ihrem Fall. Auf dieser Seite erscheinen sie nicht und sie wandern nicht mit dem Link, auch wenn Sie ihn weitergeben; öffnen kann sie nur das Praxiskonto."]
    ]
  },

  // Das Datum des Befunds - sachlich, ohne Frist.
  //
  // Der zweite Satz ("Sa më gjatë të pritet, aq më shumë ndryshon ajo që u
  // mat sot") legte nahe, der Bericht verliere mit jedem Tag an Wert. Das
  // ist eine erzeugte Dringlichkeit und keine Angabe: Ein Befund traegt
  // ein Datum, weil er sich auf einen Tag bezieht - nicht, weil er
  // ablaeuft.
  raportVlen: {
    sq: "Ky raport vlen për gjendjen e lëkurës më {data}.",
    de: "Dieser Bericht gilt für den Hautzustand vom {data}."
  },

  therapieMarke: { sq: "Terapia juaj", de: "Ihre Therapie" },

  // Der Preisblock. Anker zuerst, dann der Setpreis, dann der Tagespreis.
  preisMarke: { sq: "Terapia 4-javore", de: "Die 4-Wochen-Therapie" },
  preisEinzeln: { sq: "Veç e veç", de: "Einzeln" },
  preisGespart: { sq: "Kurseni {betrag} €", de: "Sie sparen {betrag} €" },
  preisTag: { sq: "{tagespreis} € në ditë për 28 ditë", de: "{tagespreis} € am Tag für 28 Tage" },

  // Die drei Saetze, die die Unsicherheit vor dem Kauf wegnehmen. Sie
  // stehen DIREKT am Knopf, nicht im Fuss - dort, wo die Anspannung am
  // groessten ist.
  sicherNachnahme: { sq: "Paguani kur ta merrni në dorë", de: "Sie zahlen bei Lieferung" },
  sicherGarantie: { sq: "{tage} ditë garanci — paratë mbrapsht", de: "{tage} Tage Garantie — Geld zurück" },
  sicherLieferung: { sq: "Dërgesa {von}–{bis} ditë, falas", de: "Lieferung {von}–{bis} Tage, kostenlos" },

  // Der Knopf kommt erst, wenn die Empfehlung im Bild ist.
  //
  // Vorher ist er nicht nur ueberfluessig, er ist schaedlich: Ein Knopf am
  // unteren Rand ist eine Abkuerzung, und eine Abkuerzung nimmt man. Wer
  // gerade erfaehrt, was mit seiner Haut ist, soll das lesen.
  //
  // "Fillo" und nicht "Blej": Die Frage ist nicht "kaufe ich zwei Cremes",
  // sondern "wann fange ich an".
  // Dieselbe Beschriftung und derselbe Betrag im Angebotsblock und in der
  // Leiste. Zwei Knoepfe mit zwei Beschriftungen fuer dieselbe Handlung
  // lesen sich als zwei Angebote.
  knopfStart: { sq: "Fillo terapinë — {preis} €", de: "Therapie beginnen — {preis} €" },

  kaufKnopf: { sq: "Merr terapinë — {preis} €", de: "Therapie bestellen — {preis} €" },

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

  // Wer die Therapie liefert und wer bei Problemen geradesteht.
  // Die Angaben selbst stehen in lifeskin-config.js; ist dort nichts
  // hinterlegt, erscheint dieser Block gar nicht.
  anbieterMarke: { sq: "Ofruesi", de: "Anbieter" },

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
