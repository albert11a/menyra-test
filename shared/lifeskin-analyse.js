// Die Analyse: Schema, Einstufung, Vorlage.
//
// Ein Absatz Text ueber die Haut verkauft nichts. Was verkauft, sind
// Messwerte mit einer Skala daneben - weil ein Wert auf einer Skala nicht
// diskutiert werden kann und ein Adjektiv schon. Diese Datei ist die eine
// Stelle, an der festliegt, WAS gemessen wird, WIE die Worte der Aerztin zu
// einer Stufe werden und WIE eine hochgeladene Vorlage gelesen wird.
//
// Heart und die Patientenseite teilen sie sich. Zwei Kataloge waeren zwei
// Wahrheiten, und die zweite faellt beim ersten Zusatzparameter auseinander.

// ---------- Was gemessen wird ----------
//
// Acht Parameter, in dieser Reihenfolge. Sie stammen aus dem Befundbogen,
// den Dr. Gashi ohnehin ausfuellt - nichts davon ist erfunden, damit die
// Seite voller aussieht.
//
// "hinweis" ist der Satz, der beim Antippen des Fragezeichens erscheint.
// Er ist der Grund, warum die Seite technisch aussehen DARF: Ein Fachwort,
// das man antippen und verstehen kann, wirkt kompetent. Eines, das man
// nachschlagen muesste, wirkt nach Abzocke.
export const PARAMETER = Object.freeze([
  {
    id: "lezione",
    beispiel: "rreth 10-15 të dukshme",
    sq: "Lezione inflamatore aktive",
    de: "Aktive entzündliche Stellen",
    hinweisSq: "Puqrrat e kuqe që janë aktive tani. Numri i tyre është matësi kryesor i përparimit.",
    hinweisDe: "Die roten Stellen, die gerade aktiv sind. Ihre Zahl ist der wichtigste Verlaufswert.",
    alias: ["Papula inflamatore aktive", "Lezione inflamatore", "Papula inflamatore"]
  },
  {
    id: "pustula",
    beispiel: "të pakta / jo të sigurta",
    sq: "Pustula",
    de: "Eiterbläschen",
    hinweisSq: "Puqrra me majë të bardhë. Tregojnë inflamacion në sipërfaqe të lëkurës.",
    hinweisDe: "Pickel mit weißer Spitze. Sie zeigen eine Entzündung dicht unter der Oberfläche.",
    alias: ["Pustula të mundshme"]
  },
  {
    id: "komedone",
    beispiel: "të pranishme në disa zona",
    sq: "Komedone (pore të bllokuara)",
    de: "Komedonen (verstopfte Poren)",
    hinweisSq: "Pika të zeza dhe të bardha. Janë fillimi i çdo puqrre — prandaj trajtohen të parat.",
    hinweisDe: "Mitesser, schwarz und weiß. Sie sind der Anfang jedes Pickels — deshalb kommen sie zuerst dran.",
    alias: ["Lezione komedonale", "Komedone", "Komedone / teksturë"]
  },
  {
    id: "pie",
    beispiel: "e moderuar",
    sq: "Skuqje pas-inflamatore (PIE)",
    de: "Rötung nach Entzündung (PIE)",
    hinweisSq: "Skuqja që mbetet pasi puqrra është zhdukur. Zbehet vetvetiu, por ngadalë.",
    hinweisDe: "Die Rötung, die bleibt, wenn der Pickel weg ist. Sie verblasst von selbst, aber langsam.",
    alias: ["Skuqje pas-inflamatore", "PIE / skuqje", "PIE"]
  },
  {
    id: "pih",
    beispiel: "i lehtë deri i moderuar",
    sq: "Njolla të errëta (PIH)",
    de: "Dunkle Flecken (PIH)",
    hinweisSq: "Njollat kafe që lë inflamacioni. Sa më shumë diell pa mbrojtje, aq më gjatë qëndrojnë.",
    hinweisDe: "Die braunen Flecken, die eine Entzündung hinterlässt. Ohne Sonnenschutz bleiben sie länger.",
    alias: ["Pigmentim pas-inflamator", "Pigmentim pas-inflamator (PIH)", "PIH / njolla të errëta", "PIH"]
  },
  {
    id: "tekstura",
    beispiel: "të lehta",
    sq: "Teksturë / shenja atrofike",
    de: "Textur / atrophe Zeichen",
    hinweisSq: "Sipërfaqja e lëkurës: gropëza shumë të cekëta që kapin hijen dhe duken të pabarabarta.",
    hinweisDe: "Die Oberfläche: sehr flache Dellen, die Schatten werfen und die Haut uneben wirken lassen.",
    alias: ["Teksturë", "Shenja atrofike", "Teksturë / shenja atrofike"]
  },
  {
    id: "noduse",
    beispiel: "nuk dallohen qartë",
    sq: "Noduse / cista të thella",
    de: "Knoten / tiefe Zysten",
    hinweisSq: "Puqrra të thella dhe të dhimbshme nën lëkurë. Nëse ka të tilla, duhet mjek — jo vetëm krem.",
    hinweisDe: "Tiefe, schmerzhafte Knoten unter der Haut. Wenn es sie gibt, gehört das zur Ärztin — nicht nur zur Creme.",
    alias: ["Noduse", "Noduse / cista"]
  },
  {
    id: "tharje",
    beispiel: "minimal në foto",
    sq: "Tharje / skuamëzim",
    de: "Trockenheit / Schuppung",
    hinweisSq: "Sa e thatë është lëkura. Kjo vendos sa e fortë mund të jetë terapia që ju jepet.",
    hinweisDe: "Wie trocken die Haut ist. Das entscheidet, wie stark die Therapie sein darf.",
    alias: ["Tharje", "Skuamëzim"]
  }
]);

export const IGA_HINWEIS = Object.freeze({
  sq: "IGA është shkalla që dermatologët përdorin në botë për aknen: 0 = lëkurë e pastër, 4 = e rëndë. Vlerësimi juaj është bërë nga fotot tuaja.",
  de: "IGA ist die Skala, die Dermatologen weltweit für Akne verwenden: 0 = reine Haut, 4 = schwer. Ihre Einstufung stammt aus Ihren Fotos."
});

// ---------- Der vollstaendige Feldkatalog ----------
//
// Das hier IST die Analyse. Jede Zeile der Tabelle, die Dr. Gashi
// ausfuellt, steht hier einmal - und nur, was hier steht, kann auf der
// Patientenseite erscheinen. Eine zweite Liste woanders waere die zweite
// Wahrheit, und die erste Abweichung faellt niemandem auf.
//
// "pflicht" heisst nicht, dass die Datei sonst abgelehnt wird. Es heisst,
// dass Heart es meldet, wenn es fehlt: Ohne Befundtext und ohne Produkt
// gibt es nichts freizugeben.
//
// Alles andere darf leer bleiben. Ein leeres Feld faellt auf der
// Patientenseite ersatzlos weg - eine kuerzere Seite ist immer besser als
// eine mit erfundenen Zeilen darauf.
export const FELDER = Object.freeze([
  // --- Wer ---
  {
    id: "kodi", sq: "Kodi i rastit", de: "Fallnummer", art: "text",
    hilfe: "Kopjoni nga Heart (p.sh. LS-0509-K7M2P). Shërben si kontroll që analiza shkon te pacienti i duhur.",
    beispiel: "LS-0509-K7M2P"
  },

  // --- Was ---
  {
    id: "diagnoza", sq: "Diagnoza", de: "Diagnose", art: "text",
    hilfe: "Një rresht. Kjo është fjalia që i jep peshë gjithë faqes.",
    beispiel: "Akne vulgaris, formë inflamatore-komedonale"
  },
  {
    id: "shkalla", sq: "Shkalla", de: "Schweregrad", art: "schwere", pflicht: true,
    hilfe: "e lehtë / e moderuar / e rëndë",
    beispiel: "e moderuar"
  },
  {
    id: "iga", sq: "Vlerësimi IGA", de: "IGA-Stufe", art: "iga",
    hilfe: "0 deri 4. Nëse lihet bosh, merret nga shkalla.",
    beispiel: "3"
  },
  {
    id: "tipi_lekures", sq: "Tipi i lëkurës", de: "Hauttyp", art: "text",
    hilfe: "e yndyrshme / e thatë / e përzier / normale / e ndjeshme",
    beispiel: "e përzier, e yndyrshme në zonën T"
  },
  {
    id: "zonat", sq: "Zonat e analizuara", de: "Beurteilte Zonen", art: "text",
    hilfe: "Cilat pjesë të fytyrës u panë në foto.",
    beispiel: "balli, hunda, faqet, mjekra, nofulla"
  },
  {
    id: "perfundimi", sq: "Përfundimi për pacientin", de: "Befundtext", art: "text", pflicht: true,
    hilfe: "Teksti që lexon pacienti. Mund të jetë disa fjali.",
    beispiel: "Lëkura juaj është e yndyrshme në zonën T dhe me pore të zgjeruara. Në mjekër shoh inflamacion aktiv. Kjo trajtohet."
  },

  // --- Die acht Messwerte. Sie tragen die Balken auf der Seite. ---
  ...PARAMETER.map((p) => ({
    id: p.id, sq: p.sq, de: p.de, art: "mess",
    hilfe: "Fjalë ose numër: p.sh. e moderuar, të pakta, rreth 10-15, nuk dallohen.",
    beispiel: p.beispiel
  })),

  // --- Was daraus wird ---
  {
    id: "pa_trajtim", sq: "Pa trajtim", de: "Ohne Behandlung", art: "text",
    hilfe: "Çfarë ndodh nëse nuk trajtohet. Bosh = merret teksti standard sipas shkallës.",
    beispiel: "Inflamacioni aktiv lë njolla të errëta që zbehen me muaj — disa nuk zbehen fare."
  },
  {
    id: "kur_mjek", sq: "Kur duhet mjek shpejt", de: "Wann sofort zum Arzt", art: "text",
    hilfe: "Shenjat që kërkojnë vizitë pa vonesë. Shfaqet si shënim që hapet me prekje.",
    beispiel: "Nëse shfaqen noduse të thella e të dhimbshme, cikatrice të reja, ënjtje e madhe ose temperaturë."
  },

  // --- Die Therapie ---
  {
    id: "produktet", sq: "Produktet", de: "Produkte", art: "liste", pflicht: true,
    hilfe: "Kodet e produkteve, ndarë me pikëpresje.",
    beispiel: "lifeskin-akne; lifeskin-serum"
  },
  {
    id: "perdorimi_1", sq: "Përdorimi — produkti 1", de: "Anwendung Produkt 1", art: "text",
    hilfe: "Fjalia që qëndron nën produktin e parë.",
    beispiel: "Në mëngjes dhe në mbrëmje, para kremit."
  },
  {
    id: "perdorimi_2", sq: "Përdorimi — produkti 2", de: "Anwendung Produkt 2", art: "text",
    hilfe: "Fjalia që qëndron nën produktin e dytë.",
    beispiel: "Vetëm në mbrëmje, një shtresë e hollë."
  },
  {
    id: "cmimi", sq: "Çmimi i setit (€)", de: "Setpreis (€)", art: "zahl",
    hilfe: "Bosh = çmimi standard.",
    beispiel: "53"
  },

  // --- Die vier Wochen. Bosh = der Standardplan. ---
  { id: "java_1", sq: "Java 1", de: "Woche 1", art: "text", hilfe: "Bosh = teksti standard.", beispiel: "Lëkura pastrohet. Skuqja fillon të ulet." },
  { id: "java_2", sq: "Java 2", de: "Woche 2", art: "text", hilfe: "Bosh = teksti standard.", beispiel: "Puqrrat e reja bëhen më të rralla. Ende pak për t'u parë." },
  { id: "java_3", sq: "Java 3", de: "Woche 3", art: "text", hilfe: "Bosh = teksti standard.", beispiel: "Njollat fillojnë të zbehen. Lëkura bëhet e njëtrajtshme." },
  { id: "java_4", sq: "Java 4", de: "Woche 4", art: "text", hilfe: "Bosh = teksti standard.", beispiel: "Foto e re. Dr. Gashi krahason me ditën e parë." },
  {
    id: "keshilla", sq: "Këshillë shtesë", de: "Zusätzlicher Rat", art: "text",
    hilfe: "Një fjali, p.sh. për mbrojtjen nga dielli.",
    beispiel: "Përdorni krem me mbrojtje nga dielli çdo mëngjes — pa të, njollat qëndrojnë muaj më gjatë."
  }
]);

// ---------- Von Worten zu Stufen ----------
//
// Dr. Gashi schreibt "e moderuar", nicht "3". Der Balken braucht aber eine
// Zahl. Diese Zuordnung ist die Bruecke - und sie ist bewusst hier und
// nicht im Kopf: Wer sie aendert, aendert sie fuer Heart und Patientenseite
// zugleich, und der Test daneben sagt sofort, was dadurch anders wird.
//
// Reihenfolge zaehlt: "e lehtë deri i moderuar" muss VOR "e lehtë" geprueft
// werden, sonst wird aus zwei eine eins.
const WORTE = [
  [2, ["lehtë deri", "lehte deri", "i lehtë deri", "deri i moderuar", "deri e moderuar"]],
  [0, ["nuk dallohen", "nuk shihen", "nuk ka", "asnjë", "asnje", "pa shenja", "askund"]],
  [4, ["e rëndë", "e rende", "i rëndë", "i rende", "e theksuar", "i theksuar", "shumë të shumta", "e shumtë"]],
  [2, ["të pranishme në disa", "te pranishme ne disa", "në disa zona", "ne disa zona"]],
  [3, ["e moderuar", "i moderuar", "moderuar", "të shumta", "te shumta", "të pranishme", "te pranishme"]],
  [1, ["minimal", "të pakta", "te pakta", "e lehtë", "e lehte", "i lehtë", "i lehte", "të lehta", "te lehta", "të vogla", "te vogla", "pak"]]
];

// Zahlen schlagen Worte.
//
// "rreth 10-15 të dukshme" ist eine Messung, "të dukshme" nur ein Wort.
// Wo eine Zahl steht, entscheidet die Zahl - und zwar die groessere einer
// Spanne, weil der Patient die schlimmere Seite ohnehin im Spiegel sieht.
function ausZahl(text) {
  const zahlen = [...String(text).matchAll(/\d+/g)].map((m) => Number(m[0]));
  if (!zahlen.length) return null;
  const wert = Math.max(...zahlen);
  if (wert === 0) return 0;
  if (wert <= 5) return 1;
  if (wert <= 10) return 2;
  if (wert <= 20) return 3;
  return 4;
}

// Die Stufe zu einem Wert. Null, wenn sich nichts erkennen laesst - dann
// zeigt die Seite den Text ohne Balken, statt einen Balken zu erfinden.
export function stufeAus(wert) {
  const text = String(wert || "").toLowerCase().trim();
  if (!text) return null;
  const ausZiffer = ausZahl(text);
  if (ausZiffer !== null) return ausZiffer;
  for (const [stufe, worte] of WORTE) {
    if (worte.some((w) => text.includes(w))) return stufe;
  }
  return null;
}

// ---------- Die Vorlage lesen ----------
//
// Zwei Schreibweisen, weil zwei Quellen: Wer die Vorlage von Hand
// ausfuellt, schreibt "Label: Wert" in eine Zeile. Wer den Text aus einem
// PDF zieht, bekommt Label und Wert in ZWEI Zeilen - so setzt jedes
// Layoutprogramm eine Tabelle. Beides muss gehen, sonst ist die
// Hochladefunktion eine Funktion fuer genau einen Dateityp.
const MARKEN = [
  { feld: "schwere", worte: ["shkalla", "schweregrad", "shkallë"] },
  { feld: "iga", worte: ["vlerësimi iga", "vleresimi iga", "iga"] },
  { feld: "befund", worte: [
    "përmbledhje e gjetjeve vizuale", "permbledhje e gjetjeve vizuale",
    "përfundim orientues", "perfundim orientues", "përmbledhje", "permbledhje", "befund"
  ], block: true }
];

const SCHWERE_WORTE = [
  ["schwer", ["e rëndë", "e rende", "i rëndë", "i rende", "schwer", "severe"]],
  ["mittel", ["moderuar", "e mesme", "mesme", "mittel", "moderate"]],
  ["leicht", ["e lehtë", "e lehte", "i lehtë", "leicht", "mild"]]
];

function saeubern(zeile) {
  return String(zeile).replace(/\s+/g, " ").trim();
}

// Passt diese Zeile auf eine Marke? Der Vergleich laeuft ueber die
// zusammengezogene Kleinschreibung, damit "Skuqje pas-inflamatore (PIE)"
// und "skuqje pas inflamatore pie" dasselbe treffen.
function schluessel(text) {
  return String(text).toLowerCase().replace(/[^a-zçëäöüß0-9]+/gi, " ").replace(/\s+/g, " ").trim();
}

function trifft(zeile, worte) {
  const k = schluessel(zeile);
  return worte.some((w) => {
    const wk = schluessel(w);
    return k === wk || k.startsWith(wk + " ") || k.startsWith(wk + ":");
  });
}

// Liest eine Vorlage - egal ob aus einer Textdatei oder aus dem Text, der
// aus einem PDF gezogen wurde.
//
// Was nicht erkannt wird, bleibt leer. Es raet nichts: Ein erfundener
// Messwert auf einem Befund ist schlimmer als ein fehlender.
export function vorlageLesen(roh) {
  const zeilen = String(roh || "").split(/\r?\n/).map(saeubern);
  const raus = { schwere: "", iga: null, befund: "", parameter: [] };
  const gefunden = new Map();

  const alleMarken = [
    ...PARAMETER.map((p) => ({ feld: p.id, worte: [p.sq, p.de, ...(p.alias || [])] })),
    ...MARKEN
  ];

  const markeVon = (zeile) => alleMarken.find((m) => trifft(zeile, m.worte)) || null;

  for (let i = 0; i < zeilen.length; i++) {
    const zeile = zeilen[i];
    if (!zeile) continue;
    const marke = markeVon(zeile);
    if (!marke) continue;

    // "Label: Wert" in einer Zeile.
    const doppel = zeile.indexOf(":");
    let wert = doppel >= 0 ? zeile.slice(doppel + 1).trim() : "";

    if (marke.block) {
      // Ein Absatz, nicht ein Wert: alles bis zur naechsten Marke oder
      // Leerzeile.
      const stuecke = wert ? [wert] : [];
      for (let j = i + 1; j < zeilen.length; j++) {
        if (!zeilen[j] || markeVon(zeilen[j])) break;
        stuecke.push(zeilen[j]);
      }
      wert = stuecke.join(" ").trim();
    } else if (!wert) {
      // "Label" und darunter der Wert - so setzt jedes Layoutprogramm eine
      // Tabelle. Die naechste nicht leere Zeile, sofern sie nicht selbst
      // eine Marke ist.
      for (let j = i + 1; j < zeilen.length; j++) {
        if (!zeilen[j]) continue;
        if (markeVon(zeilen[j])) break;
        wert = zeilen[j];
        break;
      }
    }
    if (!wert) continue;
    if (!gefunden.has(marke.feld)) gefunden.set(marke.feld, wert);
  }

  for (const [feld, wert] of gefunden) {
    if (feld === "schwere") {
      const t = wert.toLowerCase();
      raus.schwere = (SCHWERE_WORTE.find(([, w]) => w.some((x) => t.includes(x))) || [""])[0];
    } else if (feld === "iga") {
      const z = wert.match(/[0-4]/);
      raus.iga = z ? Number(z[0]) : null;
    } else if (feld === "befund") {
      raus.befund = wert;
    }
  }

  for (const p of PARAMETER) {
    const wert = gefunden.get(p.id);
    if (!wert) continue;
    raus.parameter.push({ id: p.id, wert, stufe: stufeAus(wert) });
  }

  // Kein IGA angegeben, aber ein Schweregrad? Dann die uebliche
  // Entsprechung - 0-4 ist eine Fuenferskala, und leicht/mittel/schwer
  // sitzt darauf auf 1/3/4.
  if (raus.iga === null && raus.schwere) {
    raus.iga = { leicht: 1, mittel: 3, schwer: 4 }[raus.schwere] ?? null;
  }
  return raus;
}

// ---------- Die Tabelle lesen ----------
//
// Eine Datei je Patient, zwei Spalten: Feld und Wert. Nicht dreissig
// Spalten nebeneinander - wer eine Zeile in Excel ausfuellt, sieht bei
// dreissig Spalten die Beschriftung nicht mehr, und genau daraus entsteht
// der Fehler, den niemand bemerkt: der richtige Wert in der falschen
// Spalte.
//
// Die breite Form wird trotzdem gelesen, falls die Tabelle einmal aus
// einem anderen Programm kommt.

// Ein CSV richtig zerlegen heisst: Anfuehrungszeichen ernst nehmen. In
// einem Befundtext stehen Kommas, und ein Komma innerhalb von
// Anfuehrungszeichen ist ein Komma und keine neue Spalte. Wer das nicht
// beachtet, zerschneidet Saetze mitten im Wort.
export function csvZerlegen(roh) {
  const text = String(roh || "").replace(/^\uFEFF/, "");
  // Excel schreibt je nach Landeseinstellung Semikolon statt Komma. Beide
  // muessen gehen; welches es ist, verraet die erste Zeile ausserhalb von
  // Anfuehrungszeichen.
  let inAnf = false, kommas = 0, strichpunkte = 0, tabs = 0;
  for (let i = 0; i < text.length; i++) {
    const z = text[i];
    if (z === '"') { inAnf = !inAnf; continue; }
    if (inAnf) continue;
    if (z === "\n") break;
    if (z === ",") kommas++;
    else if (z === ";") strichpunkte++;
    else if (z === "\t") tabs++;
  }
  const trenner = tabs > kommas && tabs > strichpunkte ? "\t"
    : strichpunkte > kommas ? ";" : ",";

  const zeilen = [];
  let zeile = [], feld = "", anf = false;
  for (let i = 0; i < text.length; i++) {
    const z = text[i];
    if (anf) {
      if (z === '"') {
        if (text[i + 1] === '"') { feld += '"'; i++; }
        else anf = false;
      } else feld += z;
      continue;
    }
    if (z === '"') { anf = true; continue; }
    if (z === trenner) { zeile.push(feld); feld = ""; continue; }
    if (z === "\r") continue;
    if (z === "\n") { zeile.push(feld); zeilen.push(zeile); zeile = []; feld = ""; continue; }
    feld += z;
  }
  if (feld || zeile.length) { zeile.push(feld); zeilen.push(zeile); }
  return zeilen.filter((z) => z.some((f) => String(f).trim() !== ""));
}

// Ein Feldname aus der Tabelle auf ein Feld des Katalogs. Es geht sowohl
// die Kennung ("iga") als auch die albanische Beschriftung ("Vlerësimi
// IGA") - je nachdem, was in der Datei steht.
function feldVon(name) {
  const k = schluessel(name);
  if (!k) return null;
  return FELDER.find((f) =>
    schluessel(f.id) === k || schluessel(f.sq) === k || schluessel(f.de) === k
    || (f.art === "mess" && (PARAMETER.find((p) => p.id === f.id)?.alias || [])
        .some((a) => schluessel(a) === k))
  ) || null;
}

// Liest eine ausgefuellte Tabelle in dieselbe Form, die auch die
// Textvorlage und das PDF liefern - plus die Felder, die es nur hier gibt.
export function csvLesen(roh) {
  const zeilen = csvZerlegen(roh);
  const werte = new Map();

  // Welche Form liegt vor?
  //
  // Nicht "senkrecht, sonst quer": In der senkrechten Vorlage steht in der
  // ERSTEN Zeile ebenfalls ein Feldname, und dann las die senkrechte
  // Auswertung bei einer breiten Tabelle die zweite Ueberschrift als Wert.
  // Also gezaehlt: Wie viele Feldnamen stehen in der ersten SPALTE, wie
  // viele in der ersten ZEILE. Die groessere Zahl gewinnt.
  const inSpalte = zeilen.filter((z) => feldVon(z[0])).length;
  const inZeile = (zeilen[0] || []).filter((f) => feldVon(f)).length;

  // Senkrecht: je Zeile ein Feld und sein Wert. Das ist die Vorlage.
  if (inSpalte >= inZeile) {
    for (const zeile of zeilen) {
      const feld = feldVon(zeile[0]);
      if (!feld) continue;
      const wert = String(zeile[1] ?? "").trim();
      if (wert && !werte.has(feld.id)) werte.set(feld.id, wert);
    }
  }

  // Quer: Kopfzeile mit Feldnamen, darunter eine Zeile mit den Werten.
  if (!werte.size && zeilen.length >= 2) {
    const kopf = zeilen[0].map(feldVon);
    for (const zeile of zeilen.slice(1)) {
      for (let i = 0; i < kopf.length; i++) {
        if (!kopf[i]) continue;
        const wert = String(zeile[i] ?? "").trim();
        if (wert && !werte.has(kopf[i].id)) werte.set(kopf[i].id, wert);
      }
      if (werte.size) break; // eine Datei, ein Patient
    }
  }

  return werteDeuten(werte);
}

// Aus rohen Zellen die Form, mit der Heart und die Patientenseite
// arbeiten. Was sich nicht deuten laesst, faellt weg statt geraten zu
// werden - ein erfundener Messwert auf einem Befund ist schlimmer als ein
// fehlender.
function werteDeuten(werte, fertig = {}) {
  const nimm = (id) => String(werte.get(id) || "").trim();
  const raus = {
    kodi: nimm("kodi"),
    diagnoza: nimm("diagnoza"),
    schwere: "",
    iga: null,
    tipiLekures: nimm("tipi_lekures"),
    zonat: nimm("zonat"),
    befund: nimm("perfundimi"),
    parameter: [],
    paTrajtim: nimm("pa_trajtim"),
    kurMjek: nimm("kur_mjek"),
    produkte: [],
    preis: null,
    javet: [],
    keshilla: nimm("keshilla")
  };

  const shkalla = nimm("shkalla").toLowerCase();
  if (shkalla) {
    raus.schwere = (SCHWERE_WORTE.find(([, w]) => w.some((x) => shkalla.includes(x))) || [""])[0];
  }
  const iga = nimm("iga").match(/[0-4]/);
  raus.iga = iga ? Number(iga[0]) : null;
  if (raus.iga === null && raus.schwere) {
    raus.iga = { leicht: 1, mittel: 3, schwer: 4 }[raus.schwere] ?? null;
  }

  for (const p of PARAMETER) {
    const wert = nimm(p.id);
    if (!wert) continue;
    raus.parameter.push({ id: p.id, wert, stufe: stufeAus(wert) });
  }

  // Produktkennungen, getrennt durch Semikolon oder Komma. Der Satz je
  // Produkt steht in einem eigenen Feld und wird der Reihe nach zugeordnet.
  // Aus JSON koennen die Produkte samt Satz schon als Liste kommen - und
  // dann sind es beliebig viele. Die Tabelle kann nur zwei, weil sie fuer
  // jeden Satz eine eigene Spalte braucht.
  if (fertig.produkte?.length) {
    raus.produkte = fertig.produkte;
  } else {
    const kennungen = nimm("produktet").split(/[;,]/).map((x) => x.trim()).filter(Boolean);
    raus.produkte = kennungen.map((id, i) => ({ id, satz: nimm(`perdorimi_${i + 1}`) }));
  }

  const preis = Number(nimm("cmimi").replace(",", "."));
  raus.preis = Number.isFinite(preis) && preis > 0 ? preis : null;

  // Die vier Wochen nur dann, wenn ALLE vier dastehen. Ein halber Plan
  // waere schlechter als der ganze Standardplan.
  const javet = fertig.javet?.length === 4
    ? fertig.javet.map((x) => String(x || "").trim())
    : [1, 2, 3, 4].map((n) => nimm(`java_${n}`));
  if (javet.length === 4 && javet.every(Boolean)) raus.javet = javet;

  return raus;
}

// ---------- JSON ----------
//
// Der bequemste Weg von allen, und der einzige, der nicht an
// Excel-Eigenheiten haengt: keine Trennzeichen, keine
// Anfuehrungszeichen-Regeln, kein Semikolon je nach Landeseinstellung.
// Und beliebig viele Produkte statt zwei - die Tabelle braucht fuer jeden
// Anwendungssatz eine eigene Spalte, JSON nicht.
//
// Gelesen wird tolerant: Die Namen duerfen die Kennung sein ("iga"), die
// albanische Beschriftung ("Vlerësimi IGA") oder die deutsche. Und sie
// duerfen verschachtelt liegen - "matjet": { "pie": "e moderuar" } wird
// genauso gefunden wie ein flaches Feld. Wer eine Analyse von Hand oder
// von einem Programm erzeugen laesst, soll sich nicht nach uns richten
// muessen.
function jsonFlach(knoten, werte, fertig, tiefe = 0) {
  if (!knoten || typeof knoten !== "object" || tiefe > 8) return;
  if (Array.isArray(knoten)) {
    for (const teil of knoten) jsonFlach(teil, werte, fertig, tiefe + 1);
    return;
  }
  for (const [name, wert] of Object.entries(knoten)) {
    const feld = feldVon(name);

    // Die Produkte: entweder eine Liste von Kennungen oder eine Liste von
    // Objekten mit Kennung und Satz. Beides muss gehen.
    if (feld?.id === "produktet" && Array.isArray(wert)) {
      fertig.produkte = wert.map((eintrag) => {
        if (eintrag && typeof eintrag === "object") {
          const id = eintrag.id ?? eintrag.kodi ?? eintrag.produkt ?? "";
          const satz = eintrag.perdorimi ?? eintrag.satz ?? eintrag.udhezimi ?? eintrag.text ?? "";
          return { id: String(id).trim(), satz: String(satz).trim() };
        }
        return { id: String(eintrag).trim(), satz: "" };
      }).filter((p) => p.id);
      continue;
    }
    // Die vier Wochen als Liste.
    if (Array.isArray(wert) && /^(javet|javët|wochen|weeks|plani)$/i.test(name)) {
      fertig.javet = wert.map((x) => (x && typeof x === "object" ? (x.text ?? x.vlera ?? "") : x));
      continue;
    }

    if (feld) {
      if (wert === null || wert === undefined || wert === "") continue;
      if (Array.isArray(wert)) {
        if (!werte.has(feld.id)) werte.set(feld.id, wert.map((x) => String(x)).join("; "));
        continue;
      }
      if (typeof wert === "object") {
        // { "vlera": "e moderuar", "shkalla": 3 } - der Wert steckt darin.
        const drin = wert.vlera ?? wert.vlere ?? wert.wert ?? wert.value ?? wert.text;
        if (drin !== undefined && !werte.has(feld.id)) werte.set(feld.id, String(drin));
        else jsonFlach(wert, werte, fertig, tiefe + 1);
        continue;
      }
      if (!werte.has(feld.id)) werte.set(feld.id, String(wert));
      continue;
    }
    // Kein Feld unter diesem Namen - aber vielleicht darunter.
    if (wert && typeof wert === "object") jsonFlach(wert, werte, fertig, tiefe + 1);
  }
}

// Liest JSON in dieselbe Form wie Tabelle, Textvorlage und PDF.
//
// Wirft bei kaputtem JSON - mit der Stelle, an der es kippt. Ein fehlendes
// Komma ist der haeufigste Fehler beim Einfuegen von Hand, und "ungueltig"
// ohne Zeilenangabe hilft dabei niemandem.
export function jsonLesen(roh) {
  let daten = roh;
  if (typeof roh === "string") {
    const text = roh.replace(/^\uFEFF/, "").trim();
    if (!text) throw new Error("Es wurde nichts eingefuegt.");
    try {
      daten = JSON.parse(text);
    } catch (fehler) {
      const stelle = Number(String(fehler.message).match(/position (\d+)/i)?.[1]);
      if (Number.isFinite(stelle)) {
        const zeile = text.slice(0, stelle).split("\n").length;
        const umfeld = text.slice(Math.max(0, stelle - 30), stelle + 30).replace(/\s+/g, " ");
        throw new Error(`Das JSON ist an Zeile ${zeile} kaputt — meist ein fehlendes oder zu viel gesetztes Komma. Dort steht: …${umfeld}…`);
      }
      throw new Error("Das ist kein gueltiges JSON.");
    }
  }
  if (!daten || typeof daten !== "object") throw new Error("Das JSON enthaelt kein Objekt.");

  const werte = new Map();
  const fertig = {};
  jsonFlach(daten, werte, fertig);
  if (!werte.size && !fertig.produkte?.length) {
    throw new Error("Im JSON wurde kein einziges bekanntes Feld gefunden. Stimmen die Namen mit der Vorlage ueberein?");
  }
  return werteDeuten(werte, fertig);
}

// Die leere Vorlage als JSON. Aus demselben Katalog erzeugt wie die
// Tabelle - eine Vorlage, die dem Programm hinterherhinkt, kann es damit
// gar nicht erst geben.
export function jsonVorlage({ beispiele = true } = {}) {
  const raus = {};
  for (const f of FELDER) {
    if (f.art === "mess" || f.id === "produktet" || /^(perdorimi_|java_)/.test(f.id)) continue;
    raus[f.id] = beispiele ? (f.beispiel || "") : "";
  }
  raus.matjet = {};
  for (const p of PARAMETER) raus.matjet[p.id] = beispiele ? (p.beispiel || "") : "";
  raus.produktet = beispiele
    ? [
        { id: "lifeskin-akne", perdorimi: "Në mëngjes dhe në mbrëmje, para kremit." },
        { id: "lifeskin-serum", perdorimi: "Vetëm në mbrëmje, një shtresë e hollë." }
      ]
    : [{ id: "", perdorimi: "" }];
  raus.javet = beispiele
    ? [
        "Lëkura pastrohet. Skuqja fillon të ulet.",
        "Puqrrat e reja bëhen më të rralla. Ende pak për t'u parë.",
        "Njollat fillojnë të zbehen. Lëkura bëhet e njëtrajtshme.",
        "Foto e re. Dr. Gashi krahason me ditën e parë."
      ]
    : ["", "", "", ""];
  return JSON.stringify(raus, null, 2) + "\n";
}

// Die leere Tabelle zum Ausfuellen.
//
// Sie wird aus dem Katalog erzeugt und nicht daneben gepflegt: Ein neues
// Feld steht damit sofort in der Vorlage, und eine Vorlage, die dem
// Programm hinterherhinkt, kann es gar nicht erst geben.
export function csvVorlage({ beispiele = true } = {}) {
  const feld = (t) => {
    const s = String(t ?? "");
    return /["\n;,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const zeilen = [["fusha", "vlera", "shpjegim"].map(feld).join(",")];
  for (const f of FELDER) {
    zeilen.push([
      feld(f.sq),
      feld(beispiele ? (f.beispiel || "") : ""),
      feld((f.pflicht ? "E DOMOSDOSHME. " : "") + (f.hilfe || ""))
    ].join(","));
  }
  return zeilen.join("\n") + "\n";
}

// ---------- Text aus einem PDF ----------
//
// Ohne Bibliothek, und mit einer Einschraenkung, die Heart auch sagt.
//
// Ein PDF ist kein Text. Es ist ein Bild eines Dokuments: Die Buchstaben
// liegen als Glyphennummern eines mitgelieferten Schriftausschnitts darin,
// der Inhalt ist zweifach verpackt (ASCII85 ueber Flate), und welche
// Glyphennummer welcher Buchstabe ist, steht in einer eigenen Tabelle je
// Schrift. Genau das wird hier zurueckgerechnet.
//
// Es geht - fuer PDFs, die ein Berichtsprogramm erzeugt hat. Ein
// eingescanntes Blatt enthaelt keinen Text, sondern ein Foto davon; dort
// kommt nichts zurueck. Deshalb ist die Textvorlage der Hauptweg und das
// PDF die Bequemlichkeit.

// ASCII85: fuenf druckbare Zeichen tragen vier Bytes. So verpacken
// Berichtsprogramme Binaerdaten, damit ein PDF eine reine Textdatei bleibt.
function ascii85(text) {
  const roh = text.replace(/^<~/, "").replace(/~>[\s\S]*$/, "").replace(/\s+/g, "");
  const raus = [];
  let block = [];
  for (const zeichen of roh) {
    if (zeichen === "z" && block.length === 0) { raus.push(0, 0, 0, 0); continue; }
    const wert = zeichen.charCodeAt(0) - 33;
    if (wert < 0 || wert > 84) continue;
    block.push(wert);
    if (block.length === 5) {
      let zahl = 0;
      for (const b of block) zahl = zahl * 85 + b;
      raus.push((zahl >>> 24) & 255, (zahl >>> 16) & 255, (zahl >>> 8) & 255, zahl & 255);
      block = [];
    }
  }
  if (block.length) {
    const fehlt = 5 - block.length;
    for (let i = 0; i < fehlt; i++) block.push(84);
    let zahl = 0;
    for (const b of block) zahl = zahl * 85 + b;
    const vier = [(zahl >>> 24) & 255, (zahl >>> 16) & 255, (zahl >>> 8) & 255, zahl & 255];
    raus.push(...vier.slice(0, 4 - fehlt));
  }
  return new Uint8Array(raus);
}

async function flate(bytes) {
  // Der Auspacker des Browsers. In der Pruefumgebung von eslint gibt es ihn
  // nicht als bekannten Namen, im Browser und in Node seit Jahren schon.
  const Auspacker = globalThis.DecompressionStream;
  if (!Auspacker) return null;
  for (const art of ["deflate", "deflate-raw"]) {
    try {
      const strom = new Blob([bytes]).stream().pipeThrough(new Auspacker(art));
      return new Uint8Array(await new Response(strom).arrayBuffer());
    } catch { /* naechste Art */ }
  }
  return null;
}

// Die Tabelle Glyphennummer -> Buchstabe. Sie liegt als eigener Strom im
// PDF, einmal je Schrift, und ohne sie ist der Inhaltsstrom eine Folge
// bedeutungsloser Zahlen.
function cmapLesen(text) {
  const karte = new Map();
  const zeichen = (hex) => String.fromCodePoint(...(hex.match(/.{4}/g) || []).map((h) => parseInt(h, 16)));
  for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const paar of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      karte.set(parseInt(paar[1], 16), zeichen(paar[2]));
    }
  }
  for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const zeile of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      const von = parseInt(zeile[1], 16), bis = parseInt(zeile[2], 16);
      const ziel = parseInt(zeile[3], 16);
      for (let i = von; i <= bis && i - von < 512; i++) {
        karte.set(i, String.fromCodePoint(ziel + (i - von)));
      }
    }
  }
  return karte;
}

export async function pdfText(daten) {
  const bytes = daten instanceof Uint8Array ? daten : new Uint8Array(daten);
  const roh = new TextDecoder("latin1").decode(bytes);

  // Alle Objekte mit Strom: Kopf (bis "stream") und Inhalt.
  const stroeme = new Map();
  // Ein Objekt OHNE Strom darf nicht den Strom des naechsten an sich
  // ziehen. Ohne die Sperre auf "endobj" bekam das Ressourcenobjekt die
  // Zeichentabelle einer fremden Schrift zugeordnet - und ë und ç fielen
  // still aus jedem albanischen Wort. Still ist hier das Schlimme: Der
  // Text sah aus wie Text, nur ohne die Haelfte seiner Buchstaben.
  for (const treffer of roh.matchAll(/(\d+)\s+0\s+obj((?:(?!endobj)[\s\S])*?)stream\r?\n/g)) {
    const nummer = Number(treffer[1]);
    const kopf = treffer[2];
    const start = treffer.index + treffer[0].length;
    const ende = roh.indexOf("endstream", start);
    if (ende < 0) continue;
    stroeme.set(nummer, { kopf, von: start, bis: ende });
  }

  const ausgepackt = new Map();
  const auspacken = async (nummer) => {
    if (ausgepackt.has(nummer)) return ausgepackt.get(nummer);
    const eintrag = stroeme.get(nummer);
    if (!eintrag) return null;
    let stueck = bytes.slice(eintrag.von, eintrag.bis);
    if (eintrag.kopf.includes("ASCII85Decode")) {
      stueck = ascii85(new TextDecoder("latin1").decode(stueck));
    }
    if (eintrag.kopf.includes("FlateDecode")) {
      stueck = await flate(stueck);
      if (!stueck) { ausgepackt.set(nummer, null); return null; }
    }
    const text = new TextDecoder("latin1").decode(stueck);
    ausgepackt.set(nummer, text);
    return text;
  };

  // Welche Schrift traegt welche Tabelle. Der Weg ist:
  // Seitenressource /F2+0 -> Schriftobjekt -> /ToUnicode -> Tabellenstrom.
  const objekte = new Map();
  for (const treffer of roh.matchAll(/(\d+)\s+0\s+obj((?:(?!endobj)[\s\S]){0,4000}?)(?:stream|endobj)/g)) {
    objekte.set(Number(treffer[1]), treffer[2]);
  }
  const karten = new Map();
  // Der Kopf eines Schriftobjekts traegt eine Breitentabelle mit 128
  // Zahlen darin. Wer hier zu kurz sucht, findet /ToUnicode nicht mehr -
  // und dann fehlt genau die Tabelle, die ë und ç lesbar macht.
  for (const [, kopf] of objekte) {
    for (const paar of kopf.matchAll(/\/(F[\w+]*\d[\w+]*)\s+(\d+)\s+0\s+R/g)) {
      const schriftobjekt = objekte.get(Number(paar[2])) || "";
      const zu = schriftobjekt.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
      if (!zu) continue;
      const tabelle = await auspacken(Number(zu[1]));
      if (tabelle) karten.set(paar[1], cmapLesen(tabelle));
    }
  }

  // Und nun die Inhaltsstroeme, mit der jeweils gesetzten Schrift.
  const zeilen = [];
  for (const nummer of stroeme.keys()) {
    const inhalt = await auspacken(nummer);
    if (!inhalt || !/\bTJ\b|\bTj\b/.test(inhalt)) continue;
    let karte = null;
    const stueckWeise = /\/(F[\w+]*\d[\w+]*)\s+[\d.]+\s+Tf|\[((?:[^\][\\]|\\.)*)\]\s*TJ|\(((?:[^()\\]|\\.)*)\)\s*Tj/g;
    for (const treffer of inhalt.matchAll(stueckWeise)) {
      if (treffer[1]) { karte = karten.get(treffer[1]) || null; continue; }
      const inneres = treffer[2] ?? treffer[3] ?? "";
      const worte = treffer[2] !== undefined
        ? [...inneres.matchAll(/\(((?:[^()\\]|\\.)*)\)/g)].map((x) => x[1])
        : [inneres];
      const bytesText = worte.join("")
        .replace(/\\([()\\])/g, "$1")
        .replace(/\\(\d{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));
      const text = karte
        ? [...bytesText].map((z) => karte.get(z.charCodeAt(0)) ?? z).join("")
        : bytesText;
      if (text.trim()) zeilen.push(text);
    }
  }
  return zeilen.join("\n");
}
