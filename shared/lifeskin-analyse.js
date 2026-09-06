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
    sq: "Lezione inflamatore aktive",
    de: "Aktive entzündliche Stellen",
    hinweisSq: "Puqrrat e kuqe që janë aktive tani. Numri i tyre është matësi kryesor i përparimit.",
    hinweisDe: "Die roten Stellen, die gerade aktiv sind. Ihre Zahl ist der wichtigste Verlaufswert.",
    alias: ["Papula inflamatore aktive", "Lezione inflamatore", "Papula inflamatore"]
  },
  {
    id: "pustula",
    sq: "Pustula",
    de: "Eiterbläschen",
    hinweisSq: "Puqrra me majë të bardhë. Tregojnë inflamacion në sipërfaqe të lëkurës.",
    hinweisDe: "Pickel mit weißer Spitze. Sie zeigen eine Entzündung dicht unter der Oberfläche.",
    alias: ["Pustula të mundshme"]
  },
  {
    id: "komedone",
    sq: "Komedone (pore të bllokuara)",
    de: "Komedonen (verstopfte Poren)",
    hinweisSq: "Pika të zeza dhe të bardha. Janë fillimi i çdo puqrre — prandaj trajtohen të parat.",
    hinweisDe: "Mitesser, schwarz und weiß. Sie sind der Anfang jedes Pickels — deshalb kommen sie zuerst dran.",
    alias: ["Lezione komedonale", "Komedone", "Komedone / teksturë"]
  },
  {
    id: "pie",
    sq: "Skuqje pas-inflamatore (PIE)",
    de: "Rötung nach Entzündung (PIE)",
    hinweisSq: "Skuqja që mbetet pasi puqrra është zhdukur. Zbehet vetvetiu, por ngadalë.",
    hinweisDe: "Die Rötung, die bleibt, wenn der Pickel weg ist. Sie verblasst von selbst, aber langsam.",
    alias: ["Skuqje pas-inflamatore", "PIE / skuqje", "PIE"]
  },
  {
    id: "pih",
    sq: "Njolla të errëta (PIH)",
    de: "Dunkle Flecken (PIH)",
    hinweisSq: "Njollat kafe që lë inflamacioni. Sa më shumë diell pa mbrojtje, aq më gjatë qëndrojnë.",
    hinweisDe: "Die braunen Flecken, die eine Entzündung hinterlässt. Ohne Sonnenschutz bleiben sie länger.",
    alias: ["Pigmentim pas-inflamator", "Pigmentim pas-inflamator (PIH)", "PIH / njolla të errëta", "PIH"]
  },
  {
    id: "tekstura",
    sq: "Teksturë / shenja atrofike",
    de: "Textur / atrophe Zeichen",
    hinweisSq: "Sipërfaqja e lëkurës: gropëza shumë të cekëta që kapin hijen dhe duken të pabarabarta.",
    hinweisDe: "Die Oberfläche: sehr flache Dellen, die Schatten werfen und die Haut uneben wirken lassen.",
    alias: ["Teksturë", "Shenja atrofike", "Teksturë / shenja atrofike"]
  },
  {
    id: "noduse",
    sq: "Noduse / cista të thella",
    de: "Knoten / tiefe Zysten",
    hinweisSq: "Puqrra të thella dhe të dhimbshme nën lëkurë. Nëse ka të tilla, duhet mjek — jo vetëm krem.",
    hinweisDe: "Tiefe, schmerzhafte Knoten unter der Haut. Wenn es sie gibt, gehört das zur Ärztin — nicht nur zur Creme.",
    alias: ["Noduse", "Noduse / cista"]
  },
  {
    id: "tharje",
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
