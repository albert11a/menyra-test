// Alle Beschriftungen der Hauptanalyse.
//
// Getrennt vom Ablauf, wie ueberall in diesem Trichter: Steht eine
// Zeichenkette erst einmal im Aufbau, ist die zweite Sprache
// nachtraeglich nicht mehr einzuziehen.
//
// ASTRA HAT SEINE EIGENE STIMME. Die Vorlage unter /analysetemplateastra
// traegt die fruehere - laenger, staerker auf den Kauf hin geschrieben.
// Diese hier ordnet zuerst ein und verkauft danach; deshalb sind es zwei
// Dateien und nicht eine mit Schaltern darin.

export const TEXTE = Object.freeze({
  // ---------- Zustaende ----------
  laedt: { sq: "Po hapet analiza juaj…", de: "Ihre Analyse wird geöffnet…" },

  // Quer gehalten passt diese Seite nicht.
  //
  // GEMESSEN (tests/lifeskin-trichter-pruefstand): Auf einem quer
  // gehaltenen iPhone - 844 breit, 390 hoch - liegen "Kopjo linkun" und
  // "Si funksionon?" bei y=390, also genau auf der Kante, und die Seite
  // laesst sich nicht schieben. Damit sind beide Wege, auf denen wir
  // diesen Patienten spaeter erreichen, nicht erreichbar.
  //
  // Dieselbe Bitte wie im Trichter, Wort fuer Wort: Wer den Scan gerade
  // hinter sich hat, soll nicht zwei verschiedene Saetze fuer dieselbe
  // Sache lesen.
  querTitel: { sq: "Ktheni telefonin vertikalisht", de: "Bitte das Telefon aufrecht halten" },
  querText: {
    sq: "Kjo faqe hapet vetëm me telefonin drejt.",
    de: "Diese Seite geht nur mit aufrecht gehaltenem Telefon."
  },
  wegTitel: { sq: "Kjo analizë nuk u gjet.", de: "Diese Analyse wurde nicht gefunden." },
  wegText: {
    sq: "Linku mund të jetë i paplotë ose i vjetruar. Hapeni përsëri linkun që morët pas skanimit, ose na shkruani që t'jua dërgojmë sërish.",
    de: "Der Link ist womöglich unvollständig oder veraltet. Öffnen Sie den Link aus Ihrem Scan noch einmal, oder schreiben Sie uns, damit wir ihn erneut schicken."
  },

  // ---------- Warten ----------
  //
  // DIESER BILDSCHIRM IST DER DER VORLAGE, Wort fuer Wort und Teil fuer
  // Teil. Er ist der einzige, den fast JEDER sieht - wer nach dem Scan
  // hierherkommt, sieht ihn Stunden vor dem Befund -, und er ist in der
  // frueheren Fassung auf einen Bildschirm gebaut worden: oben die
  // Wartezeit, in der Mitte die Aussage, darunter die Akte, unten die
  // eine Handlung. Deshalb steht hier dieselbe Fassung und keine zweite.
  //
  // Ehrlich, nicht erfunden: keine Warteschlange, keine Position. Wer
  // nachts kommt und "noch 3 vor Ihnen" liest, weiss, dass es gelogen
  // ist - und glaubt danach auch dem Befund nicht.
  pritTitel: { sq: "Dr. Gashi po e shikon analizën tuaj, {name}.", de: "Dr. Gashi sieht sich Ihre Analyse an, {name}." },
  pritTitelOhne: { sq: "Dr. Gashi po e shikon analizën tuaj.", de: "Dr. Gashi sieht sich Ihre Analyse an." },

  // Der wichtigste Satz dieses Bildschirms: Er verwandelt die Wartezeit
  // vom Mangel in den Beweis. Eine Maschine haette sofort geantwortet -
  // und genau deshalb waere ihre Antwort nichts wert.
  pritWarum: {
    sq: "Nuk është një makinë që ju përgjigjet. Çdo analizë e shikon vetë ajo.",
    de: "Hier antwortet Ihnen keine Maschine. Jede Analyse sieht sie sich selbst an."
  },
  pritDauerSot: { sq: "Përgjigja sot", de: "Antwort heute" },
  pritDauerNeser: { sq: "Përgjigja nesër në mëngjes", de: "Antwort morgen früh" },

  // Die Akte. Nummer gross, alles andere klein.
  pritNumri: { sq: "Numri i analizës", de: "Nummer der Analyse" },
  pritFotoMarke: { sq: "{anzahl} foto", de: "{anzahl} Aufnahmen" },

  // ---------- DIE AUFNAHMEN, ZUM WISCHEN ----------
  //
  // "6 foto" ist eine Zahl. Sein eigenes Gesicht ist eine Akte.
  //
  // Auf diesem Bildschirm entscheidet sich, ob dieser Mensch erreichbar
  // wird - und wer nichts vor sich sieht, das ihm gehoert, hat auch nichts
  // zu verlieren. Die Kacheln zeigen, was da liegt und auf Dr. Gashi
  // wartet: seine Aufnahmen, in der Reihenfolge, in der er sie gemacht hat.
  //
  // Die Beschriftung der Reihe steht nur fuer Vorleseprogramme da. Sichtbar
  // wuerde sie eine Ueberschrift ueber vier Bildern verlangen, die sich
  // selbst erklaeren.
  pritFotoLista: { sq: "Fotot e skanimit tuaj", de: "Die Aufnahmen Ihres Scans" },
  // Welche Richtung eine Kachel zeigt. Sie steht klein darunter - wer sechs
  // fast gleiche Bilder von sich sieht, soll nicht raten muessen, warum es
  // sechs sind.
  pritBlickGerade: { sq: "Ballë", de: "Frontal" },
  pritBlickRechts: { sq: "Djathtas", de: "Rechts" },
  pritBlickLinks: { sq: "Majtas", de: "Links" },
  pritBlickOben: { sq: "Lart", de: "Oben" },

  // ---------- DIE SPERRE ----------
  //
  // DER WICHTIGSTE SATZ DIESES BILDSCHIRMS, und er stand bisher ganz unten
  // in Grau - unter den Knoepfen, also gelesen, NACHDEM die Entscheidung
  // gefallen war.
  //
  // Jetzt steht er in der Akte, direkt an dem, was zurueckgehalten wird,
  // und in der Warnfarbe. Er behauptet nichts: Ohne Nummer und ohne
  // WhatsApp gibt es wirklich keinen Weg, diesem Menschen sein Ergebnis zu
  // schicken. Von 32 fertigen Analysen haben 13 ihren Befund gesehen -
  // genau die 13, die erreichbar waren.
  pritSperre: {
    sq: "Rezultati nuk mund t'ju dërgohet pa një mënyrë kontakti.",
    de: "Ohne einen Weg zu Ihnen kann das Ergebnis nicht zugestellt werden."
  },
  // Und derselbe Platz, sobald er erreichbar ist. Ein Zustand, kein
  // Dankeschoen: Wer zurueckkommt, soll sehen, dass es steht.
  pritFrei: {
    sq: "Rezultati niset te ju sapo Dr. Gashi ta mbyllë analizën.",
    de: "Das Ergebnis geht an Sie, sobald Dr. Gashi die Analyse schließt."
  },
  // OHNE SCAN STEHT HIER KEINE ZAHL.
  //
  // Seit der Trichter zwei Wege hat, kommt auch an, wer die Kamera nicht
  // freigeben wollte. "0 foto" waere eine Zahl, die wie ein Fehler
  // aussieht, und "3 foto" (der alte Ersatzwert) waere schlicht falsch -
  // der Patient saehe eine Angabe ueber Aufnahmen, die es nicht gibt,
  // und Dr. Gashi bekaeme eine Frage danach.
  pritOhneFoto: { sq: "Pa foto", de: "Ohne Aufnahmen" },

  // Die vier Punkte. Beschriftet wird nur der laufende - das ist der
  // einzige, der eine Frage beantwortet ("was passiert gerade?").
  pritHapi1: { sq: "Skanimi u krye", de: "Scan abgeschlossen" },
  // Dasselbe ohne Scan: Was abgeschlossen ist, ist die Anfrage, nicht ein
  // Scan, den niemand gemacht hat.
  pritHapi1Ohne: { sq: "Kërkesa u dërgua", de: "Anfrage abgeschickt" },
  pritHapi2: { sq: "Fotot janë te Dr. Gashi", de: "Aufnahmen bei Dr. Gashi" },
  pritHapi2Ohne: { sq: "Kërkesa është te Dr. Gashi", de: "Anfrage bei Dr. Gashi" },
  pritHapi3: { sq: "Tani: analiza nga Dr. Gashi", de: "Jetzt: die Analyse von Dr. Gashi" },
  pritHapi4: { sq: "Rezultati juaj", de: "Ihr Ergebnis" },
  // DER VIERTE PUNKT SAGT, WARUM ER STEHT.
  //
  // Er war grau wie jeder Schritt, der noch kommt - und damit sah der
  // letzte Schritt aus wie eine Frage der Zeit. Er ist aber keine: Ohne
  // Kontakt kommt er nie. Solange nichts hinterlegt ist, ist er gesperrt
  // und nicht offen, und wer ihn nicht sehen kann, hoert genau das.
  pritHapi4Sperre: {
    sq: "Rezultati juaj — nuk niset dot pa kontakt",
    de: "Ihr Ergebnis — ohne Kontakt nicht zustellbar"
  },

  // ---------- DAS TOR: WHATSAPP ODER NUMMER ----------
  //
  // Von 32 fertigen Analysen haben 13 ihren Befund gesehen - genau die 13,
  // die erreichbar waren. Die anderen 19 hat nie jemand erreicht. Nicht,
  // weil sie nicht wollten: weil niemand sie fragte, solange es ein
  // Angebot war.
  //
  // ZWEI WEGE ZUM SELBEN ZIEL, und beide stehen gleichberechtigt da.
  // WhatsApp verlangt drei Handlungen - App wechseln, senden,
  // zurueckkommen -, und wer bei einer davon abbricht, faellt heraus. Eine
  // Nummer ist eine Handlung, und sie bleibt auch dann hier, wenn er die
  // Seite gleich danach schliesst. Wer WhatsApp nicht hat, haette mit nur
  // einem Weg gar keinen.
  //
  // DIE UEBERSCHRIFT IST EINE FRAGE NACH DEM WIE, NICHT NACH DEM OB.
  // "Moechten Sie benachrichtigt werden?" laesst "nein" zu - auf die eine
  // Sache, von der abhaengt, ob dieser Mensch seinen Befund je zu sehen
  // bekommt. "Wohin?" laesst das nicht zu.
  pritGateTitel: {
    sq: "Ku t'ju njoftojmë?",
    de: "Wohin sollen wir Bescheid geben?"
  },
  // DIE ZEILE UNTER DEM FELD BEANTWORTET JETZT EINE ANDERE FRAGE.
  //
  // Hier stand der Grund: "Ohne das haben wir keinen Weg, Ihnen die
  // Analyse zu schicken." Den sagt seit der Neufassung die Sperre oben in
  // der Akte - laut, in der Warnfarbe und direkt an den Aufnahmen, um die
  // es geht. Zweimal derselbe Satz auf einem Bildschirm ist einmal zu
  // viel: Er kostet drei Zeilen Hoehe, und auf einem kurzen Telefon
  // schiebt er genau das Feld unter die Falz, um das hier alles geht.
  //
  // An seiner Stelle steht die Frage, die einen Menschen wirklich zoegern
  // laesst, bevor er seine Nummer eintippt: wer sie bekommt. Die Antwort
  // ist keine Beschwichtigung, sondern der Aufbau dieser Anwendung - die
  // Nummer liegt in der Sitzung, und die liest niemand ausser dem Konto
  // der Aerztin. Kein Wort ueber Werbung: Was wir nicht garantieren
  // koennen, versprechen wir hier nicht.
  pritGateWarum: {
    sq: "Numrin tuaj e sheh vetëm Dr. Gashi.",
    de: "Ihre Nummer sieht nur Dr. Gashi."
  },
  // DIE TRENNZEILE SAGT, WAS DANACH KOMMT.
  //
  // Hier stand nur "ose". Zwischen einem gruenen Knopf und einem leeren
  // Feld heisst das nichts: Man sieht ein Feld und weiss nicht, was
  // hineingehoert, bis man den Platzhalter liest - und den liest man
  // erst, wenn man schon hinsieht.
  pritOse: { sq: "ose shkruani numrin tuaj", de: "oder Ihre Nummer eintragen" },
  pritWaKnopf: { sq: "Shkruani në WhatsApp", de: "Auf WhatsApp schreiben" },
  // Der Platzhalter ist ein BEISPIEL, und das steht jetzt auch davor.
  // Eine blasse Nummer allein im Feld sieht aus wie eine, die schon
  // dasteht - und wer glaubt, es sei seine, tippt nichts ein.
  pritNrVendos: { sq: "Shembull: 044 123 456", de: "Beispiel: 044 123 456" },
  pritNrKnopf: { sq: "Ruaj", de: "Speichern" },
  // Jeder Grund sagt, was zu tun ist - "ungueltig" sagt das nicht. Auch
  // "leer" bekommt einen Satz: Der Knopf darf nicht stumm bleiben.
  pritNrPflicht: {
    sq: "Shkruani numrin tuaj që Dr. Gashi t'ju gjejë.",
    de: "Bitte die Nummer eintragen, damit Dr. Gashi Sie erreicht."
  },
  pritNrGabimShkurt: { sq: "Numri është shumë i shkurtër.", de: "Die Nummer ist zu kurz." },
  pritNrGabimGjate: { sq: "Numri është shumë i gjatë.", de: "Die Nummer ist zu lang." },
  pritNrGabimShenja: { sq: "Shkruani vetëm numra, p.sh. 044 123 456.", de: "Bitte nur Ziffern, z. B. 044 123 456." },
  // Der Schreibvorgang kann scheitern - und dann darf hier NICHT "danke"
  // stehen. Eine Nummer, die niemand hat, und ein Patient, der glaubt, er
  // werde angerufen: Das ist schlimmer als gar nicht gefragt zu haben.
  pritNrGabimRuajtje: {
    sq: "Nuk u ruajt. Provoni edhe një herë ose na shkruani në WhatsApp.",
    de: "Nicht gespeichert. Bitte noch einmal versuchen oder auf WhatsApp schreiben."
  },

  // ER WAR IN WHATSAPP UND IST ZURUECK. Einmal gefragt, ruhig, kein
  // zweites Mal: Wer nichts geschickt hat, soll nicht bei jedem Wechsel
  // daran erinnert werden. Erst sein "Ja" macht aus dem Griff eine
  // gesendete Nachricht - alles andere waere geraten.
  pritWaRueck: { sq: "E dërguat mesazhin?", de: "Nachricht abgeschickt?" },
  pritWaRueckJa: { sq: "Po, e dërgova", de: "Ja, abgeschickt" },

  // ERLEDIGT - ein Zustand, kein Dankeschoen, das wieder verschwindet.
  // Wer zurueckkommt, soll sehen, dass es steht.
  pritGatiTitel: { sq: "Gati.", de: "Erledigt." },
  pritGatiNumri: {
    sq: "Dr. Gashi ju njofton te {numri}.",
    de: "Dr. Gashi meldet sich unter {numri}."
  },
  pritGatiWa: {
    sq: "Dr. Gashi ju njofton në WhatsApp.",
    de: "Dr. Gashi meldet sich auf WhatsApp."
  },

  // Was beim Tippen auf den Knopf wirklich passiert. Auf dem iPhone
  // erscheint danach ein Systemhinweis "Diese Seite in WhatsApp
  // oeffnen?" - wer ihn nicht erwartet, tippt auf Abbrechen und ist weg.
  pritSi: { sq: "Si funksionon?", de: "Wie läuft das?" },
  pritSiText: {
    sq: "WhatsApp hapet me mesazhin tuaj gati. Ju e dërgoni — dhe Dr. Gashi ju njofton sapo analiza të jetë gati. Pa pagesë. Ju mund të bllokoni bisedën në çdo moment.",
    de: "WhatsApp öffnet sich mit Ihrer fertigen Nachricht. Sie senden sie — und Dr. Gashi gibt Ihnen Bescheid, sobald die Analyse fertig ist. Kostenlos. Sie können das Gespräch jederzeit beenden."
  },
  pritKopjo: { sq: "Kopjo linkun", de: "Link kopieren" },
  pritKopjuar: { sq: "✓ U kopjua", de: "✓ Kopiert" },
  // Der zweite Weg - fuer alle ohne WhatsApp. Er gibt niemandem eine
  // Nummer: Die Seite gehoert ihm, sie bleibt, und die Antwort erscheint
  // darauf.
  pritKopjoUnder: {
    sq: "Nuk keni WhatsApp? Ruani këtë link. Përgjigja e Dr. Gashit shfaqet pikërisht këtu.",
    de: "Kein WhatsApp? Speichern Sie diesen Link. Die Antwort von Dr. Gashi erscheint genau hier."
  },
  pritBlattMbyll: { sq: "E kuptova", de: "Verstanden" },

  // ---------- Kopf ----------
  faqjaTitull: { sq: "Analiza juaj e lëkurës · LifeSkin", de: "Ihre Hautanalyse · LifeSkin" },
  pyetje: { sq: "Keni një pyetje?", de: "Haben Sie eine Frage?" },
  analizaJuaj: { sq: "ANALIZA JUAJ", de: "IHRE ANALYSE" },
  heroTitel: { sq: "{name}, le ta bëjmë kujdesin më të qartë.", de: "{name}, machen wir die Pflege klarer." },
  heroTitelOhne: { sq: "Le ta bëjmë kujdesin më të qartë.", de: "Machen wir die Pflege klarer." },
  heroIntro: {
    sq: "Fillojmë me atë që vërehet në lëkurën tuaj. Pastaj, me hapat që kanë kuptim për ju.",
    de: "Wir beginnen mit dem, was an Ihrer Haut zu sehen ist. Dann mit den Schritten, die für Sie Sinn ergeben."
  },
  arztName: { sq: "Dr. Violeta Gashi", de: "Dr. Violeta Gashi" },
  arztRolle: { sq: "Dermatologe", de: "Dermatologin" },
  arztRolleDatum: { sq: "{rolle} · më {datum}", de: "{rolle} · vom {datum}" },
  vleresuarNga: { sq: "Vlerësuar nga", de: "Beurteilt von" },

  // OHNE BESTAETIGTE AERZTLICHE PRUEFUNG STEHT HIER GAR NICHTS.
  //
  // Frueher trat an die Stelle des Arztnamens eine zweite Zeile
  // ("Vlerësim me ndihmën e AI / Nuk është diagnozë e konfirmuar nga
  // mjeku"). Sie ist weg. Diese Zeile beantwortet eine einzige Frage -
  // WER hat beurteilt -, und wenn darauf noch keine Antwort feststeht,
  // ist die richtige Anzeige keine, nicht eine zweite Aussage an
  // derselben Stelle. Behauptet wird dadurch nichts: Die Zeile
  // erscheint erst mit der Freigabe in Heart, und was die Methode nicht
  // hergibt, steht unveraendert in metodaNote und in kufijteText.

  // ---------- Ergebnis ----------
  rezultatiMarke: { sq: "ÇFARË KA RËNDËSI NË KËTË ANALIZË", de: "WORAUF ES IN DIESER ANALYSE ANKOMMT" },
  vleresimiOrientues: { sq: "Vlerësimi orientues", de: "Orientierende Einordnung" },
  // DER NAECHSTE SCHRITT HAT EINEN NAMEN, und der steht hier.
  //
  // "Kujdes i synuar sipas planit tuaj" war keine Antwort auf die Frage
  // "was passiert jetzt?" - es war eine Umschreibung davon. Was jetzt
  // ansteht, ist die vierwoechige Therapie mit der Begleitung, die
  // Abschnitt 04 beschreibt; also steht sie da.
  hapiRadhes: { sq: "Hapi i radhës", de: "Der nächste Schritt" },
  hapiRadhesPlan: {
    sq: "Terapia 4-javore me planin tuaj personal, e ndjekur javë pas jave nga Dr. Gashi.",
    de: "Die 4-Wochen-Therapie mit Ihrem persönlichen Plan, Woche für Woche begleitet von Dr. Gashi."
  },
  hapiRadhesKontroll: {
    sq: "Një kontroll i afërt te mjeku, përpara çdo kujdesi aktiv.",
    de: "Eine ärztliche Abklärung, bevor eine aktive Pflege beginnt."
  },
  metodaNote: {
    sq: "Vlerësim i pamjes së lëkurës nga foto. Historia, ndjeshmëria dhe produktet që përdorni plotësojnë planin.",
    de: "Beurteilung des Hautbilds anhand von Aufnahmen. Vorgeschichte, Empfindlichkeiten und Ihre Produkte ergänzen den Plan."
  },
  metodaLink: { sq: "Si vlerësohet?", de: "Wie wird beurteilt?" },
  // Wenn die Analyse selbst sagt, dass sie nicht reicht. Sie sperrt
  // nichts mehr - aber sie schweigt auch nicht.
  abklaerungNote: {
    sq: "Kjo analizë nuk mjafton për një vlerësim përfundimtar: kërkohet një kontroll i afërt te mjeku.",
    de: "Diese Analyse reicht für eine abschliessende Beurteilung nicht aus: Es braucht eine ärztliche Abklärung."
  },
  drejtPlanit: { sq: "Shiko planin e kujdesit", de: "Zum Pflegeplan" },

  // ---------- Beobachtungen ----------
  gjetjetMarke: { sq: "MË NGA AFËR", de: "GENAUER BETRACHTET" },
  gjetjetTitel: { sq: "Ku përqendrohemi.", de: "Worauf wir uns konzentrieren." },
  gjetjetNote: {
    sq: "Skuqja interpretohet me kujdes: drita dhe kamera mund ta ndryshojnë pamjen e saj.",
    de: "Rötung wird zurückhaltend gelesen: Licht und Kamera verändern, wie sie aussieht."
  },
  fokusiKryesor: { sq: "Fokusi kryesor", de: "Hauptfokus" },

  // ---------- Plan ----------
  planiMarke: { sq: "02 / PLANI JUAJ", de: "02 / IHR PLAN" },
  planiTitel: { sq: "Çdo hap ka një arsye.", de: "Jeder Schritt hat einen Grund." },
  planiIntro: {
    sq: "Kujdes i synuar për gjetjen kryesore, me hapat mbështetës që e plotësojnë rutinën.",
    de: "Gezielte Pflege für den Hauptbefund, mit den Schritten, die die Routine vervollständigen."
  },
  objektiviMarke: { sq: "OBJEKTIVI I KUJDESIT", de: "DAS PFLEGEZIEL" },
  objektiviStandard: {
    sq: "Të ndiqet si e toleron lëkura rutinën dhe si ndryshon pamja gjatë 28 ditëve.",
    de: "Beobachtet wird, wie die Haut die Routine verträgt und wie sich das Bild in 28 Tagen verändert."
  },
  pseNePlan: { sq: "Pse në këtë plan", de: "Warum in diesem Plan" },
  roliPerdorimi: { sq: "Roli & përdorimi", de: "Rolle & Anwendung" },
  veprimiMarke: { sq: "Çfarë bën", de: "Was es tut" },
  perberesitMarke: { sq: "Përbërësit aktivë", de: "Die Wirkstoffe" },
  perdorimiMarke: { sq: "Si përdoret", de: "Wie es angewendet wird" },
  perdorimiHapi: { sq: "hapi {hapi}", de: "Schritt {hapi}" },
  perdorimiSasia: { sq: "Sasia", de: "Menge" },
  perdorimiKujdes: { sq: "Kujdes", de: "Zu beachten" },
  synimiMarke: { sq: "Deri në ditën 28", de: "Bis Tag 28" },

  rutinaMarke: { sq: "PËRDORIMI", de: "DIE ANWENDUNG" },
  rutinaTitel: { sq: "Një rend i lehtë për t'u ndjekur.", de: "Eine Reihenfolge, die sich einhalten lässt." },
  rutinaMengjes: { sq: "Në mëngjes", de: "Morgens" },
  rutinaMbremje: { sq: "Në mbrëmje", de: "Abends" },
  rutinaBosh: { sq: "Sipas udhëzimit tuaj personal.", de: "Nach Ihrer persönlichen Anleitung." },

  // ---------- Angebot ----------
  paketaMarke: { sq: "03 / PAKETA JUAJ", de: "03 / IHR PAKET" },
  paketaTitel: { sq: "Produkte. Plan. Mbështetje.", de: "Produkte. Plan. Begleitung." },
  paketaIntro: { sq: "Shihni çfarë përfshihet, përpara se të vendosni.", de: "Sehen Sie, was enthalten ist, bevor Sie entscheiden." },
  setiMarke: { sq: "LIFESKIN / KUJDES PËR 28 DITË", de: "LIFESKIN / PFLEGE FÜR 28 TAGE" },
  setiTitel: { sq: "Seti juaj", de: "Ihr Set" },
  setiNumri: { sq: "{anzahl} produkte", de: "{anzahl} Produkte" },
  perfshiPlan: { sq: "Plani personal i përdorimit", de: "Der persönliche Anwendungsplan" },
  // WORTGLEICH MIT ABSCHNITT 04. Was das Paket verspricht und was die
  // Begleitung beschreibt, muss dieselbe Sache sein - sonst liest es
  // sich wie zwei verschiedene Angebote auf einer Seite.
  perfshiMbeshtetje: { sq: "Konsultë online me skanim, javë pas jave", de: "Online-Beratung mit Scan, Woche für Woche" },
  perfshiRishikim: { sq: "Vlerësimi final me Dr. Gashin në ditën 28", de: "Die Abschlussbeurteilung mit Dr. Gashi an Tag 28" },
  cmimiMarke: { sq: "Gjithsej, me dërgesë", de: "Gesamt, mit Lieferung" },
  // DIE ZAHL UNTER DER ZAHL. 53 Euro ist der Betrag, der an der Tuer
  // bezahlt wird; 1,89 am Tag ist derselbe Betrag in der Einheit, in der
  // ein Mensch ueber Ausgaben nachdenkt. Beide stehen da, keine ersetzt
  // die andere - eine Seite, die nur den Tagespreis zeigt, versteckt den
  // Preis, und das faellt spaetestens an der Tuer auf.
  //
  // {tagespreis} wird GERECHNET (setPreis / reichweiteTage) und nie hier
  // hingeschrieben: Sonst steht beim naechsten Preiswechsel auf derselben
  // Seite zweimal etwas anderes.
  cmimiDita: { sq: "vetëm {tagespreis} € në ditë", de: "nur {tagespreis} € am Tag" },
  pagesaNjehere: { sq: "Pagesë një herë.", de: "Einmalige Zahlung." },
  pagesaKurMerrni: { sq: "Kur merrni pakon.", de: "Wenn das Paket ankommt." },
  // Der EINE Kaufknopf, wortgleich mit der frueheren Fassung. Er traegt
  // den Preis: Ein Knopf, der ihn verschweigt, laesst den Daumen raten.
  knopfStart: { sq: "Fillo terapinë 4-javore — {preis} €", de: "4-Wochen-Therapie beginnen — {preis} €" },
  // Und die leise Zeile darunter - sie nimmt die Frage weg, die beim
  // Daumen ueber dem Knopf aufkommt.
  dorezimSatz: {
    sq: "Sot nuk jepni asnjë kartë. Paguani te dera.",
    de: "Heute geben Sie keine Karte heraus. Bezahlt wird an der Tür."
  },
  faktDergesa: { sq: "Dërgesa", de: "Lieferung" },
  faktDite: { sq: "{von}–{bis} ditë", de: "{von}–{bis} Tage" },
  faktTransporti: { sq: "Transporti", de: "Versand" },
  faktFalas: { sq: "falas", de: "kostenlos" },
  faktPaParapagim: { sq: "Pa parapagim", de: "Keine Vorauszahlung" },
  garanciaTitel: { sq: "{tage} ditë garanci kthimi parash", de: "{tage} Tage Geld-zurück-Garantie" },
  garanciaText: {
    sq: "Kërkesa bëhet brenda {tage} ditëve nga marrja e pakos, duke kontaktuar LifeSkin. Garancia mbulon shumën e paguar; ajo nuk është garanci për rezultat mjekësor.",
    de: "Die Anfrage erfolgt innerhalb von {tage} Tagen nach Erhalt des Pakets über LifeSkin. Die Garantie deckt den gezahlten Betrag; sie ist keine Zusage für ein medizinisches Ergebnis."
  },
  pyetjeParaVendimit: { sq: "Kam një pyetje para se të vendos", de: "Ich habe noch eine Frage" },
  pyetjetMarke: { sq: "PARA SE TË VENDOSNI", de: "BEVOR SIE ENTSCHEIDEN" },
  pyetjetTitel: { sq: "Pyetje me përgjigje të qarta.", de: "Fragen mit klaren Antworten." },

  // ---------- Begleitung ----------
  // "Edhe pas hapit të parë" nannte einen Schritt, den es auf dieser
  // Seite nirgends gibt - der Leser musste raten, welcher gemeint war.
  // Die Ueberschrift sagt jetzt, was der Abschnitt wirklich anbietet:
  // eine Aerztin, die waehrend der vier Wochen dabeibleibt.
  ndjekjaMarke: { sq: "04 / NDJEKJA", de: "04 / DIE BEGLEITUNG" },
  ndjekjaTitel: { sq: "Dr. Gashi ju ndjek javë pas jave.", de: "Dr. Gashi begleitet Sie Woche für Woche." },
  ndjekjaIntro: {
    sq: "Terapia zgjat 28 ditë dhe nuk mbeteni vetëm në to. Çdo javë bëni një skanim të ri dhe e shikoni bashkë me Dr. Gashin se si po përgjigjet lëkura.",
    de: "Die Therapie dauert 28 Tage, und Sie bleiben darin nicht allein. Jede Woche machen Sie einen neuen Scan und sehen mit Dr. Gashi, wie die Haut darauf antwortet."
  },

  // ---------- Vollstaendige Analyse ----------
  ploteMarke: { sq: "05 / ANALIZA E PLOTË", de: "05 / DIE VOLLSTÄNDIGE ANALYSE" },
  ploteTitel: { sq: "Detajet, kur dëshironi t'i lexoni.", de: "Die Einzelheiten, wenn Sie sie lesen wollen." },
  ploteIntro: {
    sq: "Përmbledhja më sipër mbetet pika e nisjes. Këtu gjeni shpjegimet e plota.",
    de: "Die Zusammenfassung oben bleibt der Anfang. Hier stehen die ausführlichen Erklärungen."
  },
  zonatAuf: { sq: "Gjetjet sipas zonave", de: "Der Befund nach Zonen" },
  ekzaminimiAuf: { sq: "Kërkesa & ekzaminimi i kryer", de: "Auftrag & durchgeführte Untersuchung" },
  parametratAuf: { sq: "Të gjithë parametrat e vlerësuar", de: "Alle beurteilten Parameter" },
  parametratNote: {
    sq: "U vlerësuan {anzahl} parametra. Ata pa gjetje qëndrojnë këtu bashkë me të tjerët.",
    de: "Beurteilt wurden {anzahl} Parameter. Die ohne Befund stehen hier neben den übrigen."
  },
  kuptimiAuf: { sq: "Çfarë do të thotë vlerësimi", de: "Was die Einordnung bedeutet" },
  termatAuf: { sq: "Fjalët që përdoren në këtë analizë", de: "Die Begriffe in dieser Analyse" },
  termatTeJu: { sq: "Te ju", de: "Bei Ihnen" },
  paKujdesAuf: { sq: "Çfarë ndodh pa kujdes?", de: "Was ohne Pflege geschieht" },
  paKujdesZbehet: { sq: "Zbehet vetë", de: "Geht von selbst zurück" },
  paKujdesNuk: { sq: "Çfarë mund të vazhdojë", de: "Was bestehen bleiben kann" },
  paKujdesPas6: { sq: "Si mund të ndryshojë", de: "Möglicher Verlauf" },

  // ---------- Die Grenze der Methode ----------
  //
  // IMMER DIESER TEXT, NIE EINER AUS DER MODELLANTWORT.
  //
  // Dieser Absatz ist der Grund, warum der Rest der Seite geglaubt wird -
  // und er wirkt nur, weil er ETWAS KOSTET: Er nennt freiwillig, was die
  // Methode nicht hergibt. Ein Zugestaendnis, das bei jedem Bericht
  // anders formuliert ist, ist kein Zugestaendnis, sondern eine
  // Formulierung. Was jedes Mal wortgleich dasteht, ist eine Zusage.
  //
  // Und es ist der eine Absatz, den ein Modell nicht schreiben darf: Es
  // wuerde ihn frueher oder spaeter abschwaechen, und niemandem faellt es
  // auf, weil kein Mensch zwei Berichte nebeneinanderlegt.
  //
  // tests/lifeskin-astra-live.test.mjs haelt ihn mit der Vorlage gleich.
  kufijteAuf: { sq: "Si vlerësohet & kufijtë e fotografisë", de: "Wie beurteilt wird & die Grenzen der Aufnahme" },
  kufijteText: {
    sq: "Nga një fotografi nuk vlerësohen dot thellësia e lezioneve, dhimbja, sekretimi i yndyrës, faktorët hormonalë apo vlerat laboratorike. Edhe drita dhe përpunimi i telefonit e ndryshojnë pamjen e skuqjes dhe të njollave.",
    de: "Aus einem Foto lassen sich Tiefe der Entzündung, Schmerz, Talgproduktion, Hormonlage und Laborwerte nicht beurteilen. Auch Licht und die Bildverarbeitung des Telefons verändern, wie Rötung und Flecken aussehen."
  },

  // ---------- Bestellung ----------
  porosiaMarke: { sq: "POROSIA JUAJ", de: "IHRE BESTELLUNG" },
  porosiaTitel: { sq: "Ku ta dërgojmë setin?", de: "Wohin sollen wir das Set liefern?" },
  porosiaIntro: { sq: "Paguani vetëm kur ta merrni në dorë.", de: "Sie zahlen erst, wenn Sie es in der Hand halten." },
  porosiaEmri: { sq: "Emri dhe mbiemri", de: "Vor- und Nachname" },
  porosiaTelefon: { sq: "Numri i telefonit", de: "Telefonnummer" },
  porosiaAdresa: { sq: "Rruga dhe numri", de: "Straße und Hausnummer" },
  porosiaQyteti: { sq: "Qyteti", de: "Stadt" },
  porosiaKonfirmo: { sq: "Konfirmo porosinë", de: "Bestellung bestätigen" },
  porosiaDergohet: { sq: "Po dërgohet…", de: "Wird gesendet…" },
  porosiaPflicht: { sq: "Plotësoni të gjitha fushat.", de: "Bitte alle Felder ausfüllen." },
  porosiaFehler: { sq: "Nuk u dërgua. Provoni përsëri.", de: "Nicht gesendet. Bitte noch einmal versuchen." },
  porosiaGjithsej: { sq: "Gjithsej", de: "Gesamt" },
  porosiaZahlung: { sq: "Transport falas · Pagesë në dorëzim", de: "Versand kostenlos · Zahlung bei Lieferung" },

  // Die drei Zusagen am Knopf des Bestellschirms.
  //
  // Sie stehen dort und nicht weiter oben im Angebot: Der Zweifel kommt
  // beim Tippen der Anschrift zurueck - "gebe ich hier gerade Geld aus,
  // bevor ich etwas in der Hand habe?" -, nicht davor.
  siguriaPagesa: { sq: "Paguani kur ta merrni në dorë", de: "Sie zahlen bei Lieferung" },
  siguriaGaranci: { sq: "{tage} ditë garanci — paratë mbrapsht", de: "{tage} Tage Garantie — Geld zurück" },
  siguriaDergesa: { sq: "Dërgesa {von}–{bis} ditë, falas", de: "Lieferung {von}–{bis} Tage, kostenlos" },

  dankeTitel: { sq: "Porosia juaj është regjistruar.", de: "Ihre Bestellung ist eingegangen." },
  dankeText: {
    sq: "Ju kontaktojmë për konfirmimin e adresës. Pagesa bëhet kur ta merrni pakon.",
    de: "Wir melden uns zur Bestätigung der Anschrift. Gezahlt wird bei Erhalt des Pakets."
  },
  dankeKthehu: { sq: "Kthehu te analiza", de: "Zurück zur Analyse" },

  statusMarke: { sq: "Porosia juaj", de: "Ihre Bestellung" },
  statusPranuar: { sq: "Porosia u pranua", de: "Bestellung angenommen" },
  statusNisur: { sq: "Nisur", de: "Unterwegs" },
  statusDorezuar: { sq: "Dorëzuar", de: "Zugestellt" },
  statusPritet: { sq: "Pritet {von}–{bis}", de: "Erwartet {von}–{bis}" },
  statusTeDera: { sq: "{preis} € te dera", de: "{preis} € an der Tür" },

  // ---------- Hilfe & Fuss ----------
  ndihmaTitel: { sq: "Një pyetje para se të filloni?", de: "Eine Frage, bevor Sie beginnen?" },
  ndihmaText: {
    sq: "Shkruani te LifeSkin për pyetje rreth planit, porosisë ose kujdesit. Tregoni numrin e analizës që përgjigjja të lidhet me rastin tuaj.",
    de: "Schreiben Sie LifeSkin bei Fragen zum Plan, zur Bestellung oder zur Pflege. Nennen Sie die Nummer der Analyse, damit die Antwort zu Ihrem Fall passt."
  },
  ndihmaWhatsapp: { sq: "Shkruaj në WhatsApp", de: "Auf WhatsApp schreiben" },
  ndihmaMbyll: { sq: "U kuptua", de: "Verstanden" },
  fusnotaSlogan: { sq: "Kujdes që fillon me kuptim.", de: "Pflege, die mit Verstehen beginnt." },
  // DER HAFTUNGSABSATZ IST WEG - auf Ansage, und an allen drei Stellen
  // zugleich: hier, im Fuss der Analyse und auf dem Blatt der
  // Warteseite. Was auf dieser Seite noch benannt wird, ist die Grenze
  // der Methode (kufijteText) und, wo der Befund es verlangt, die
  // aerztliche Abklaerung (abklaerungNote). Wer den Absatz
  // zurueckhaben will, braucht drei Dinge: diesen Eintrag, seinen
  // Platz in der Textkarte und die beiden <p> in index.html.
  anbieterMarke: { sq: "Ofruesi", de: "Anbieter" },
  kontakt: { sq: "Kontakt & informacion", de: "Kontakt & Information" }
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

// Die drei Zeitpunkte der Begleitung.
//
// Ein Ablauf, keine Heilungsetappen: Tag 1, jede Woche, Tag 28. Was hier
// steht, muss der Betrieb auch wirklich leisten - sonst ist es keine
// Begleitung, sondern ein Versprechen. Die woechentliche Online-Beratung
// mit neuem Scan steht deshalb hier UND in perfshiMbeshtetje: Sie ist
// Teil dessen, was gekauft wird, nicht eine nette Geste obendrauf.
//
// DREI ZUSAGEN STEHEN HIER, DIE GELD KOSTEN. Wer einen dieser Saetze
// aendert, aendert, was verkauft wurde:
//   Schritt 2 - laeuft etwas nicht, wird der Plan angepasst ODER ein
//               Mittel getauscht, und zwar kostenlos.
//   Schritt 3 - braucht die Haut an Tag 28 weiter Therapie, kommt das
//               naechste Set kostenlos. Dieselbe Zusage steht in
//               PYETJET (Frage 3) aus der anderen Richtung: dort fuer
//               den, der mit dem Ergebnis nicht zufrieden ist.
//
// WAS IN SCHRITT 1 BEWUSST NICHT STEHT: dass vorhandene Mittel pausiert
// werden und worauf bei Empfindlichkeiten zu achten ist. Beides stand
// hier und beides las sich an dieser Stelle als Bedingung - der erste
// Satz nach dem Kauf soll nicht sagen, was jemand aufgeben muss. Die
// Frage nach der eigenen Pflege ist damit nicht weg: PYETJET (Frage 2)
// beantwortet sie, und zwar vor der Entscheidung, wo sie hingehoert.
//
// DIE ZEICHEN SIND 01/02/03 UND NICHT MEHR 01/02/28. Zwei Ordnungszahlen
// und dahinter eine Tageszahl lasen sich wie ein Fehler - ein Ring mit
// "28" neben einem Ring mit "02" beantwortet nicht, ob er der dritte
// Schritt oder der achtundzwanzigste ist. Der Zeitpunkt steht jetzt in
// der Ueberschrift, wo er hingehoert, und der Ring zaehlt nur noch.
//
// Mehr als zwei Zeichen passen nicht hinein: .timeline li>span ist ein
// Kreis von 42 Punkten (astra.css). "DITA 1" spraengte ihn.
export const NDJEKJA = Object.freeze([
  {
    marke: { sq: "01", de: "01" },
    titel: { sq: "Dita 1 — fillon terapia", de: "Tag 1 — die Therapie beginnt" },
    text: {
      sq: "Pakoja vjen me planin tuaj personal: cili produkt në mëngjes, cili në mbrëmje dhe me çfarë radhe. Filloni po atë ditë që e merrni — nuk keni nevojë të prisni asgjë tjetër.",
      de: "Das Paket kommt mit Ihrem persönlichen Plan: welches Mittel morgens, welches abends und in welcher Reihenfolge. Sie beginnen an dem Tag, an dem es ankommt — auf nichts müssen Sie warten."
    }
  },
  {
    marke: { sq: "02", de: "02" },
    titel: { sq: "Çdo javë — konsultë online me skanim", de: "Jede Woche — Online-Beratung mit Scan" },
    text: {
      sq: "Javë pas jave bëni një skanim të ri dhe flisni online me Dr. Gashin. Ajo sheh zonë për zonë si po përgjigjet lëkura dhe, nëse diçka nuk ecën si duhet, jua përshtat planin ose jua ndërron produktin — falas.",
      de: "Woche für Woche machen Sie einen neuen Scan und sprechen online mit Dr. Gashi. Sie sieht Zone für Zone, wie die Haut antwortet, und passt den Plan an oder tauscht ein Mittel — kostenlos, wenn etwas nicht so läuft, wie es soll."
    }
  },
  {
    marke: { sq: "03", de: "03" },
    titel: { sq: "Dita 28 — vlerësimi final", de: "Tag 28 — die Abschlussbeurteilung" },
    text: {
      sq: "Skanimi i fundit në të njëjtat kushte. Dr. Gashi e krahason me skanimin e parë dhe ju tregon zonë për zonë çfarë ka ndryshuar. Nëse lëkura ka nevojë ende për terapi, seti i radhës ju vjen falas.",
      de: "Der letzte Scan unter denselben Bedingungen. Dr. Gashi vergleicht ihn mit dem ersten und zeigt Ihnen Zone für Zone, was sich verändert hat. Braucht die Haut noch Therapie, kommt das nächste Set kostenlos."
    }
  }
]);

export const NDJEKJA_KONTAKT = Object.freeze({
  titel: { sq: "Pyetjet tuaja kanë vend këtu.", de: "Ihre Fragen haben hier ihren Platz." },
  text: {
    sq: "Para fillimit ose gjatë përdorimit, kërkoni sqarim për planin tuaj.",
    de: "Vor dem Start oder während der Anwendung: Lassen Sie sich Ihren Plan erklären."
  },
  knopf: { sq: "Pyet për kujdesin tënd", de: "Zur eigenen Pflege fragen" }
});

// Die Fragen vor der Entscheidung.
//
// Reihenfolge nach dem, was WIRKLICH zuerst im Kopf ist: Passung,
// Empfindlichkeit, Zeitraum, Reaktion, Bezahlung, Daten. Keine wird in
// ein Kaufargument umgedreht, und die Risiken werden nicht kleiner
// geschrieben, als sie sind - eine FAQ, die nur verkauft, wird als
// Verkauf gelesen und beantwortet danach gar nichts mehr.
export const PYETJET = Object.freeze([
  {
    pyetja: { sq: "A është ky set i përshtatshëm për mua?", de: "Ist dieses Set für mich passend?" },
    pergjigja: {
      sq: "Po. Ky set është kombinuar posaçërisht për lëkurën tuaj. Produktet janë zgjedhur sipas gjetjeve të kësaj analize dhe i përgjigjen pikërisht shenjave që u vunë re te ju.",
      de: "Ja. Dieses Set ist eigens für Ihre Haut zusammengestellt. Die Mittel sind nach den Befunden dieser Analyse gewählt und antworten genau auf die Zeichen, die bei Ihnen zu sehen waren."
    }
  },
  {
    pyetja: {
      sq: "Po nëse kam lëkurë të ndjeshme ose përdor trajtim tjetër?",
      de: "Und wenn ich empfindliche Haut habe oder schon etwas anwende?"
    },
    pergjigja: {
      sq: "Këto produkte janë zgjedhur pikërisht për lëkurën tuaj dhe i përshtaten asaj. Në shumicën e rasteve ato përdoren pa problem edhe së bashku me kujdesin ose trajtimin që keni tashmë.",
      de: "Diese Mittel sind genau für Ihre Haut gewählt und passen sich ihr an. In den meisten Fällen lassen sie sich ohne Weiteres zusammen mit Ihrer bisherigen Pflege oder Behandlung anwenden."
    }
  },
  {
    pyetja: { sq: "A do të shoh rezultat brenda 28 ditëve?", de: "Sehe ich in 28 Tagen ein Ergebnis?" },
    pergjigja: {
      sq: "Po. Brenda 28 ditëve rezultatet duken qartë. Nëse deri atëherë nuk jeni të kënaqur me rezultatin tuaj, ju dërgojmë një set tjetër falas.",
      de: "Ja. Innerhalb von 28 Tagen sind die Ergebnisse deutlich zu sehen. Sind Sie bis dahin mit Ihrem Ergebnis nicht zufrieden, schicken wir Ihnen ein weiteres Set kostenlos."
    }
  },
  {
    pyetja: { sq: "Si paguaj dhe sa kushton dërgesa?", de: "Wie zahle ich, und was kostet die Lieferung?" },
    pergjigja: {
      sq: "Gjithsej {preis} €, transport falas dhe pagesë kur merrni pakon. Nuk ka pagesë të përsëritur dhe nuk ka abonim. Kohëzgjatja e dërgesës është {von}–{bis} ditë.",
      de: "Insgesamt {preis} €, Versand kostenlos, Zahlung bei Erhalt. Keine wiederkehrende Zahlung, kein Abo. Die Lieferdauer beträgt {von}–{bis} Tage."
    }
  },
  {
    pyetja: { sq: "Ku ruhen fotot dhe të dhënat e mia?", de: "Wo liegen meine Aufnahmen und Daten?" },
    pergjigja: {
      sq: "Kjo faqe tregon vetëm analizën tuaj. Adresa dhe numri i telefonit nuk shfaqen këtu dhe nuk udhëtojnë me linkun: ato ruhen veçmas dhe lexohen vetëm brenda LifeSkin. Prandaj linku mund të ndahet pa dërguar adresën tuaj.",
      de: "Diese Seite zeigt nur Ihre Analyse. Anschrift und Telefonnummer stehen nicht darin und reisen nicht mit dem Link: Sie liegen getrennt und werden nur innerhalb von LifeSkin gelesen. Deshalb lässt sich der Link weitergeben, ohne Ihre Anschrift mitzuschicken."
    }
  }
]);
