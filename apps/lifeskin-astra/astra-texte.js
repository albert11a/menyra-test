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
  wegTitel: { sq: "Kjo analizë nuk u gjet.", de: "Diese Analyse wurde nicht gefunden." },
  wegText: {
    sq: "Linku mund të jetë i paplotë ose i vjetruar. Hapeni përsëri linkun që morët pas skanimit, ose na shkruani që t'jua dërgojmë sërish.",
    de: "Der Link ist womöglich unvollständig oder veraltet. Öffnen Sie den Link aus Ihrem Scan noch einmal, oder schreiben Sie uns, damit wir ihn erneut schicken."
  },

  // ---------- Warten ----------
  //
  // Ehrlich, nicht erfunden: keine Warteschlange, keine Position. Wer
  // nachts kommt und "noch 3 vor Ihnen" liest, weiss, dass es gelogen
  // ist - und glaubt danach auch dem Befund nicht.
  pritTitel: { sq: "{name}, analiza juaj është te Dr. Gashi.", de: "{name}, Ihre Analyse liegt bei Dr. Gashi." },
  pritTitelOhne: { sq: "Analiza juaj është te Dr. Gashi.", de: "Ihre Analyse liegt bei Dr. Gashi." },
  pritIntro: {
    sq: "Fotot tuaja janë pranuar. Vlerësimin e bën një person, jo një makinë — prandaj merr pak kohë.",
    de: "Ihre Aufnahmen sind angekommen. Die Beurteilung macht ein Mensch, keine Maschine — deshalb dauert sie etwas."
  },
  pritDauerSot: { sq: "Përgjigja sot", de: "Antwort heute" },
  pritDauerNeser: { sq: "Përgjigja nesër në mëngjes", de: "Antwort morgen früh" },
  pritNumri: { sq: "Numri i analizës", de: "Nummer der Analyse" },
  pritFotoMarke: { sq: "Fotot e dërguara", de: "Gesendete Aufnahmen" },
  pritHapi1: { sq: "Skanimi u krye", de: "Scan abgeschlossen" },
  pritHapi2: { sq: "Fotot janë te Dr. Gashi", de: "Aufnahmen bei Dr. Gashi" },
  pritHapi3: { sq: "Tani: vlerësimi", de: "Jetzt: die Beurteilung" },
  pritHapi4: { sq: "Rezultati juaj", de: "Ihr Ergebnis" },
  pritRuaj: {
    sq: "Ruajeni këtë faqe. Kur analiza të jetë gati, ajo shfaqet pikërisht këtu.",
    de: "Bewahren Sie diese Seite. Sobald die Analyse fertig ist, steht sie genau hier."
  },
  pritKopjo: { sq: "Kopjo linkun", de: "Link kopieren" },
  pritKopjuar: { sq: "✓ U kopjua", de: "✓ Kopiert" },

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
  arztRolle: { sq: "Dermatologe · LifeSkin", de: "Dermatologin · LifeSkin" },
  arztRolleDatum: { sq: "{rolle} · më {datum}", de: "{rolle} · vom {datum}" },
  vleresuarNga: { sq: "Vlerësuar nga", de: "Beurteilt von" },

  // Ohne bestaetigte aerztliche Pruefung wird keine behauptet. Die Zeile
  // faellt nicht weg - sie sagt stattdessen, was wirklich passiert ist.
  aiTitel: { sq: "Vlerësim me ndihmën e AI", de: "Beurteilung mit KI-Unterstützung" },
  aiUnter: { sq: "Nuk është diagnozë e konfirmuar nga mjeku", de: "Keine ärztlich bestätigte Diagnose" },

  // ---------- Ergebnis ----------
  rezultatiMarke: { sq: "ÇFARË KA RËNDËSI NË KËTË ANALIZË", de: "WORAUF ES IN DIESER ANALYSE ANKOMMT" },
  vleresimiOrientues: { sq: "Vlerësimi orientues", de: "Orientierende Einordnung" },
  hapiRadhes: { sq: "Hapi i radhës", de: "Der nächste Schritt" },
  hapiRadhesPlan: { sq: "Kujdes i synuar sipas planit tuaj.", de: "Gezielte Pflege nach Ihrem Plan." },
  hapiRadhesKontroll: {
    sq: "Një kontroll i afërt te mjeku, përpara çdo kujdesi aktiv.",
    de: "Eine ärztliche Abklärung, bevor eine aktive Pflege beginnt."
  },
  metodaNote: {
    sq: "Vlerësim i pamjes së lëkurës nga foto. Historia, ndjeshmëria dhe produktet që përdorni plotësojnë planin.",
    de: "Beurteilung des Hautbilds anhand von Aufnahmen. Vorgeschichte, Empfindlichkeiten und Ihre Produkte ergänzen den Plan."
  },
  metodaLink: { sq: "Si vlerësohet?", de: "Wie wird beurteilt?" },
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

  rutinaMarke: { sq: "NË JETËN E PËRDITSHME", de: "IM ALLTAG" },
  rutinaTitel: { sq: "Një rend i lehtë për t'u ndjekur.", de: "Eine Reihenfolge, die sich einhalten lässt." },
  rutinaMengjes: { sq: "Në mëngjes", de: "Morgens" },
  rutinaMbremje: { sq: "Në mbrëmje", de: "Abends" },
  rutinaBosh: { sq: "Sipas udhëzimit tuaj personal.", de: "Nach Ihrer persönlichen Anleitung." },
  rutinaNote: {
    sq: "Rendi është orientues. Mbrojtja nga dielli nuk përfshihet në këtë set. Udhëzimi personal përcakton përdorimin konkret.",
    de: "Die Reihenfolge ist orientierend. Sonnenschutz ist in diesem Set nicht enthalten. Die persönliche Anleitung bestimmt die konkrete Anwendung."
  },

  // ---------- Angebot ----------
  paketaMarke: { sq: "03 / PAKETA JUAJ", de: "03 / IHR PAKET" },
  paketaTitel: { sq: "Produkte. Plan. Mbështetje.", de: "Produkte. Plan. Begleitung." },
  paketaIntro: { sq: "Shihni çfarë përfshihet, përpara se të vendosni.", de: "Sehen Sie, was enthalten ist, bevor Sie entscheiden." },
  setiMarke: { sq: "LIFESKIN / KUJDES PËR 28 DITË", de: "LIFESKIN / PFLEGE FÜR 28 TAGE" },
  setiTitel: { sq: "Seti juaj", de: "Ihr Set" },
  setiNumri: { sq: "{anzahl} produkte", de: "{anzahl} Produkte" },
  perfshiPlan: { sq: "Plani personal i përdorimit", de: "Der persönliche Anwendungsplan" },
  perfshiMbeshtetje: { sq: "Mbështetja gjatë 28 ditëve", de: "Begleitung über 28 Tage" },
  perfshiRishikim: { sq: "Rishikimi me foto në ditën 28", de: "Die Nachschau mit Aufnahmen an Tag 28" },
  cmimiMarke: { sq: "Gjithsej, me dërgesë", de: "Gesamt, mit Lieferung" },
  pagesaNjehere: { sq: "Pagesë një herë.", de: "Einmalige Zahlung." },
  pagesaKurMerrni: { sq: "Kur merrni pakon.", de: "Wenn das Paket ankommt." },
  vazhdo: { sq: "Vazhdo me setin", de: "Weiter mit dem Set" },
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
  ndjekjaMarke: { sq: "04 / NDJEKJA", de: "04 / DIE BEGLEITUNG" },
  ndjekjaTitel: { sq: "Edhe pas hapit të parë.", de: "Auch nach dem ersten Schritt." },
  ndjekjaIntro: {
    sq: "28 ditët janë një periudhë ndjekjeje. Ndryshimet dhe hapi i mëtejshëm vlerësohen bashkë.",
    de: "Die 28 Tage sind ein Beobachtungszeitraum. Veränderung und nächster Schritt werden gemeinsam beurteilt."
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
    sq: "Nga një fotografi nuk vlerësohen dot thellësia e lezioneve, dhimbja, sekretimi i yndyrës, faktorët hormonalë apo vlerat laboratorike. Edhe drita dhe përpunimi i telefonit e ndryshojnë pamjen e skuqjes dhe të njollave. Prandaj kjo analizë është orientuese dhe nuk zëvendëson një ekzaminim te mjeku.",
    de: "Aus einem Foto lassen sich Tiefe der Entzündung, Schmerz, Talgproduktion, Hormonlage und Laborwerte nicht beurteilen. Auch Licht und die Bildverarbeitung des Telefons verändern, wie Rötung und Flecken aussehen. Diese Analyse ist deshalb orientierend und ersetzt keine Untersuchung beim Arzt."
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
  haftung: {
    sq: "LifeSkin nuk është shërbim urgjence. Për ënjtje të papritur, dhimbje të fortë ose vështirësi në frymëmarrje, kërkoni ndihmë mjekësore menjëherë.",
    de: "LifeSkin ist kein Notdienst. Bei plötzlicher Schwellung, starken Schmerzen oder Atemnot suchen Sie sofort ärztliche Hilfe."
  },
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
// Ein Ablauf, keine Heilungsetappen: Start, Verlauf, Tag 28. Was hier
// steht, muss der Betrieb auch wirklich leisten - sonst ist es keine
// Begleitung, sondern ein Versprechen.
export const NDJEKJA = Object.freeze([
  {
    marke: { sq: "01", de: "01" },
    titel: { sq: "Në fillim", de: "Am Anfang" },
    text: {
      sq: "Sqarohen përdorimi, produktet që keni tashmë dhe ndjeshmëritë që duhet të merren parasysh.",
      de: "Geklärt werden die Anwendung, Ihre vorhandenen Produkte und die Empfindlichkeiten, die zu berücksichtigen sind."
    }
  },
  {
    marke: { sq: "02", de: "02" },
    titel: { sq: "Gjatë kujdesit", de: "Während der Pflege" },
    text: {
      sq: "Ndiqni tolerancën dhe ndryshimet. Nëse diçka ju shqetëson, kërkoni rishikim të planit.",
      de: "Verträglichkeit und Veränderung im Blick behalten. Wenn etwas beunruhigt, lassen Sie den Plan überprüfen."
    }
  },
  {
    marke: { sq: "28", de: "28" },
    titel: { sq: "Në ditën 28", de: "An Tag 28" },
    text: {
      sq: "Foto në kushte të ngjashme. Krahasohen ndryshimet dhe përcaktohet çfarë vijon.",
      de: "Aufnahmen unter ähnlichen Bedingungen. Die Veränderung wird verglichen und der nächste Schritt bestimmt."
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
      sq: "Rekomandimi lidhet me gjetjet e kësaj analize. Historia juaj, formulat dhe produktet që përdorni plotësojnë vlerësimin. Nëse diçka nuk përputhet, kërkoni rishikim përpara se të filloni.",
      de: "Die Empfehlung stützt sich auf die Befunde dieser Analyse. Ihre Vorgeschichte, die Formeln und Ihre bisherigen Produkte ergänzen die Beurteilung. Passt etwas nicht, lassen Sie es vor dem Start prüfen."
    }
  },
  {
    pyetja: {
      sq: "Po nëse kam lëkurë të ndjeshme ose përdor trajtim tjetër?",
      de: "Und wenn ich empfindliche Haut habe oder schon etwas anwende?"
    },
    pergjigja: {
      sq: "Tregoni ndjeshmëritë, alergjitë dhe produktet që përdorni përpara fillimit. Shtatzënia dhe ushqyerja me gji kërkojnë kontroll të përshtatshmërisë. Mos kombinoni vetë trajtime aktive.",
      de: "Nennen Sie Empfindlichkeiten, Allergien und Ihre Produkte vor dem Start. Schwangerschaft und Stillzeit erfordern eine gesonderte Prüfung. Aktive Mittel bitte nicht eigenmächtig kombinieren."
    }
  },
  {
    pyetja: { sq: "A do të shoh rezultat brenda 28 ditëve?", de: "Sehe ich in 28 Tagen ein Ergebnis?" },
    pergjigja: {
      sq: "Dita 28 është pika e rishikimit, jo një premtim rezultati. Ndiqen toleranca, elementet e reja dhe pamja e lëkurës. Ritmi i ndryshimit nuk është i njëjtë për të gjithë.",
      de: "Tag 28 ist der Zeitpunkt der Nachschau, kein zugesagtes Ergebnis. Beobachtet werden Verträglichkeit, neue Stellen und das Hautbild. Das Tempo ist bei jedem anders."
    }
  },
  {
    pyetja: { sq: "Çfarë bëj nëse lëkura acarohet?", de: "Was tue ich, wenn die Haut gereizt reagiert?" },
    pergjigja: {
      sq: "Ndërpritni produktin që dyshoni dhe kërkoni këshillë. Mos e trajtoni acarimin e fortë si një hap që duhet duruar. Nëse keni ënjtje të papritur ose vështirësi në frymëmarrje, kërkoni ndihmë urgjente.",
      de: "Setzen Sie das verdächtige Produkt ab und holen Sie Rat ein. Eine starke Reizung ist nichts, was man durchsteht. Bei plötzlicher Schwellung oder Atemnot sofort ärztliche Hilfe suchen."
    }
  },
  {
    pyetja: { sq: "Si paguaj dhe sa kushton dërgesa?", de: "Wie zahle ich, und was kostet die Lieferung?" },
    pergjigja: {
      sq: "Gjithsej {preis} €, transport falas dhe pagesë kur merrni pakon. Nuk ka pagesë të përsëritur dhe nuk ka abonim. Afati i pritshëm është {von}–{bis} ditë.",
      de: "Insgesamt {preis} €, Versand kostenlos, Zahlung bei Erhalt. Keine wiederkehrende Zahlung, kein Abo. Erwartet in {von}–{bis} Tagen."
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
