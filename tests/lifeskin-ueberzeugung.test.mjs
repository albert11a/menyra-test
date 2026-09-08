import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { TEXTE } from "../apps/lifeskin-bericht/bericht-texte.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const bericht = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");
const markup = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");

// Die Befundseite muss dreiundfuenfzig Euro tragen.
//
// Sie ist aufgebaut wie ein Arztbrief und nicht wie eine Werbeseite: erst
// was geprueft wurde, dann was gefunden wurde, dann die Messwerte - und
// erst als SCHLUSS daraus die Diagnose. Diese Reihenfolge ist der ganze
// Trick, und deshalb steht sie hier fest.

test("jeder Text, den die Seite abruft, steht im Verzeichnis - in beiden Sprachen", () => {
  const abgerufen = new Set(
    [...bericht.matchAll(/this\.text\("([a-zA-Z0-9]+)"/g)].map((m) => m[1])
  );
  // Die Stufennamen werden zusammengesetzt, nicht buchstabiert.
  for (const stufe of [0, 1, 2, 3, 4]) abgerufen.add(`niveli${stufe}`);
  abgerufen.delete("niveli${Math");

  assert.ok(abgerufen.size > 25, `Zu wenige Textschluessel gefunden (${abgerufen.size})`);
  const fehlend = [...abgerufen].filter((k) => !TEXTE[k]);
  assert.deepEqual(fehlend, [], "Diese Schluessel ruft die Seite ab, es gibt sie aber nicht");

  const halb = [...abgerufen].filter((k) => !TEXTE[k]?.sq || !TEXTE[k]?.de);
  assert.deepEqual(halb, [], "Diese Texte fehlen in einer der beiden Sprachen");
});

test("erst SEIN Befund, dann der Beweis - und der Verkauf erst nach dem Schnitt", () => {
  // Die Reihenfolge hat sich einmal geaendert, und zwar aus einem Grund:
  //
  // Vorher stand der technische Untersuchungsabsatz ganz oben. Wer seine
  // Analyse oeffnet, will aber als Erstes wissen, was mit SEINER Haut ist -
  // nicht, mit welchem Verfahren geprueft wurde. Die Belohnung fuer den
  // Scan muss zuerst kommen; das Verfahren steht jetzt aufgeklappt weiter
  // unten, fuer den, der es sucht.
  //
  // Die Messwerte stehen weiter VOR nichts Verkaeuflichem: Sie tragen die
  // Diagnose, die direkt darueber steht, und die Erklaerung dazwischen.
  //
  // Und zwischen Bericht und Therapie liegt ein sichtbarer Schnitt. Ohne
  // ihn liest sich die Seite, als sei die Diagnose nur geschrieben worden,
  // damit darunter etwas verkauft werden kann.
  const reihe = [
    "lb-pillen",       // was geprueft wurde - der Beweis der Arbeit
    "lb-gjettext",     // SEIN Hauptbefund, sofort
    "lb-diagnose",     // die Einordnung
    "lb-erklaerteil",  // was das fuer ihn heisst
    "lb-messteil",     // die Zahlen, die beides tragen
    "lb-detajet",      // Verfahren und Zonen - aufklappbar
    "lb-ohneteil",     // was ohne Pflege geschieht
    "lb-szene",        // HIER hoert der Bericht auf
    "lb-provuartext",  // "ich habe schon alles probiert"
    // EIN Abschnitt, nicht zwei: Die Begruendung stand als eigener Teil
    // ueber der Therapie, und darunter kamen dieselben Mittel noch einmal
    // mit Foto und Wirkstoffen. Zweimal dasselbe liest sich als
    // Verkaufsschleife - und die zweite Ueberschrift nimmt der ersten die
    // Kraft, weil der Leser merkt, dass er nichts Neues bekommt.
    "lb-psesatz",      // SEINE Befunde als Ueberleitung
    "lb-produkte",     // die Therapie selbst, eine Karte je Mittel
    "lb-perfshi",      // was in dem Preis steckt
    "lb-preis"         // und ERST DANN die Zahl
  ];
  const stellen = reihe.map((id) => markup.indexOf(id));
  for (const [i, stelle] of stellen.entries()) {
    assert.ok(stelle > 0, `"${reihe[i]}" fehlt auf der Seite`);
  }
  assert.deepEqual(stellen, [...stellen].sort((a, b) => a - b),
    `Die Reihenfolge stimmt nicht: ${reihe.join(" -> ")}`);

  // Der technische Absatz steht NICHT mehr vor dem Befund.
  assert.ok(markup.indexOf("lb-ekztext") > markup.indexOf("lb-gjettext"),
    "Das Verfahren steht wieder vor dem Befund - dann kommt die Belohnung zu spaet");
  // Und die Liste steht unmittelbar vor der Zahl.
  assert.ok(markup.indexOf("lb-preis") - markup.indexOf("lb-perfshi") < 900,
    "Zwischen der Liste und dem Preis steht zu viel - dann faellt der Vergleich zurueck auf zwei Flaschen");
});

test("die Seite belegt die Arbeit, bevor sie etwas behauptet", () => {
  // Drei Pillen: Aufnahmen, Zonen, Zeitpunkt. Sie stehen VOR jeder Aussage -
  // wer sieht, wie viel geprueft wurde, liest das Folgende anders.
  assert.ok(markup.includes('id="lb-pillen"'), "Die Pillen fehlen");
  assert.match(bericht, /#pillenZeichnen/, "Die Pillen werden nicht gezeichnet");
  assert.ok(markup.indexOf("lb-pillen") < markup.indexOf("lb-ekztext"),
    "Die Pillen stehen hinter dem ersten Text statt davor");

  // Und die Zahlen kommen aus der Analyse, nicht aus der Seite.
  const koerper = bericht.slice(bericht.indexOf("#pillenZeichnen()"), bericht.indexOf("#pille(zeichen"));
  assert.match(koerper, /raport\.fotot/, "Die Zahl der Aufnahmen ist erfunden");
  assert.match(koerper, /raport\.zonat/, "Die Zahl der Zonen ist erfunden");
});

test("der Fachbefund darf leicht sagen - die Zeile darunter nennt die Handlung", () => {
  // Achtmal "e lehtë" liest sich als "mir fehlt nichts". Deshalb traegt die
  // Stufe eine HANDLUNG und kein Adjektiv. Zwanzig verstopfte Poren sind
  // fachlich leicht und brauchen trotzdem etwas.
  for (const stufe of [0, 1, 2, 3, 4]) {
    const text = TEXTE[`niveli${stufe}`];
    assert.ok(text?.sq && text?.de, `Stufe ${stufe} fehlt`);
  }
  for (const stufe of [1, 2, 3, 4]) {
    assert.match(TEXTE[`niveli${stufe}`].sq, /^Kërkon/,
      `Stufe ${stufe} beschreibt einen Zustand statt eine Handlung`);
  }
  assert.match(TEXTE.niveli0.sq, /ruajtje/,
    "Auch die ruhige Haut braucht eine Handlung - sonst hat die Haelfte der Gescannten keinen Grund");
});

test("Messwerte ohne Befund fallen nicht weg, sie bekommen einen Haken", () => {
  // Eine Seite, auf der alles schlecht ist, ist ein Verkaufszettel - und
  // dann wird auch der schlechte Teil nicht geglaubt. Der gute Wert ist der
  // Kontrast, der die schlechten scharf macht.
  const koerper = bericht.slice(bericht.indexOf("#messZeichnen() {"), bericht.indexOf("#diagnoseZeichnen() {"));
  assert.match(koerper, /stufe === 0/, "Ein Wert ohne Befund wird nicht besonders behandelt");
  assert.match(koerper, /lb-haken/, "Der gute Wert bekommt keinen Haken");

  // Oben stehen DREI - fuenf Balken untereinander sind nicht
  // glaubwuerdiger, nur laenger. Aber der gute Wert muss unter den dreien
  // sein: Absteigend sortiert steht er ganz hinten und fiele bei einem
  // blossen slice(0,3) heraus - und damit faellt der ganze Kontrast weg.
  assert.match(koerper, /const gut = werte\.find\(\(w\) => Number\(w\.shkalla\) === 0\)/,
    "Der gute Wert wird nicht gesucht - dann steht er nicht oben");
  assert.match(koerper, /MESSWERTE_OBEN - 1/,
    "Der gute Wert verdraengt keinen schlechten - dann sind es vier");
  assert.match(bericht, /const MESSWERTE_OBEN = 3;/, "Es stehen nicht drei oben");
  // Und der Rest verschwindet nicht, er zieht um.
  assert.match(koerper, /lb-messtjere/, "Die uebrigen Messwerte fallen weg statt umzuziehen");
  assert.match(koerper, /messRest/, "Es steht nicht dabei, wie viele geprueft wurden");
});

test("was ohne Pflege geschieht, steht unmittelbar vor der Therapie", () => {
  // Der rote Kasten sagt, was nicht von selbst zurueckgeht; im naechsten
  // Atemzug steht, was das loest. Das ist der Uebergang, an dem entschieden
  // wird - dazwischen darf nichts stehen.
  const ohne = markup.indexOf('id="lb-ohneteil"');
  const produkte = markup.indexOf('id="lb-produkte"');
  assert.ok(ohne > 0 && produkte > ohne, "Der Verlauf steht nicht vor der Therapie");
  for (const marke of ["ohneZbehet", "ohneNukZbehet", "ohnePas6"]) {
    assert.ok(TEXTE[marke]?.sq, `${marke} fehlt`);
  }
});

test("die Seite erfindet nichts und laesst Leeres weg", () => {
  // Was Dr. Gashi nicht eingetragen hat, faellt ersatzlos weg. Eine
  // kuerzere Seite ist immer besser als eine mit leeren Zeilen darauf.
  for (const [name, methode] of [
    ["Messwerte", "#messZeichnen() {"],
    ["Diagnose", "#diagnoseZeichnen() {"],
    ["Erklaerung", "#erklaerungZeichnen() {"],
    ["Verlauf", "#ohneZeichnen() {"]
  ]) {
    const start = bericht.indexOf(methode);
    assert.ok(start > 0, `${name}: Methode fehlt`);
    const koerper = bericht.slice(start, start + 900);
    assert.match(koerper, /ls-verstecken/, `${name}: bleibt ohne Inhalt trotzdem stehen`);
  }
  assert.ok(!/Math\.random|beispiel|dummy/i.test(bericht), "Hier werden Werte erfunden");
});

test("die Aufnahmen des Patienten wandern nicht mit dem Link", () => {
  // Der Link zu dieser Seite wird weitergegeben - wir bitten sogar darum.
  // Ein Gesicht, das mitwandert, waere der teuerste Fehler dieses Systems.
  // Das Blatt zeigt deshalb, WAS aufgenommen wurde, nicht die Bilder.
  assert.ok(!bericht.includes("/photos/"), "Die Befundseite fragt die Aufnahmen an");
  const koerper = bericht.slice(bericht.indexOf("#fotoblatt(auf) {"), bericht.indexOf("#produkteZeichnen() {"));
  assert.ok(!/createElement\("img"\)|<img/.test(koerper), "Das Fotoblatt zeigt Bilder");
  assert.match(TEXTE.fotoUnter.sq, /nuk udhëtojnë me linkun/,
    "Der Seite fehlt der Satz, dass die Aufnahmen nicht mitwandern");
});

// ---------- Die Bruecke faellt nicht mehr weg ----------

// Den Rumpf einer Methode herausschneiden.
//
// Bis zur naechsten Methode, nicht bis zur naechsten schliessenden Klammer:
// Ein Rumpf mit einer Schleife darin endet sonst mitten drin, und der Test
// prueft dann eine halbe Methode und meldet Erfolg.
function methode(quelle, name) {
  // Am Methodenkopf verankert, nicht am ersten Vorkommen: Der Name steht
  // zuerst als AUFRUF in der Zeichenroutine, und dort ist von dem, was
  // geprueft werden soll, kein Wort zu finden. Ein Test, der eine
  // Aufrufzeile prueft und Erfolg meldet, ist schlimmer als keiner.
  const kopf = `\n  ${name}`;
  const anfang = quelle.indexOf(kopf);
  assert.ok(anfang > 0, `Die Methode ${name} gibt es nicht mehr`);
  const rest = quelle.slice(anfang + kopf.length);
  const naechste = rest.search(/\n {2}(?:#|get |set |static |[a-zA-Z]+\()/);
  return naechste > 0 ? rest.slice(0, naechste) : rest;
}

test("die Begruendung steht IN der Karte, nicht in einem zweiten Abschnitt", () => {
  // GEMESSEN, NICHT GESCHAETZT: Die Seite sagte dasselbe zweimal. Erst
  // "Pse pikerisht kjo terapi" mit Begruendung und Haken, direkt darunter
  // "Terapia juaj" mit Foto, Wirkstoffen und Anwendung derselben Mittel.
  // Zweimal dasselbe liest sich als Verkaufsschleife, und die zweite
  // Ueberschrift nimmt der ersten die Kraft.
  const koerper = methode(bericht, "#produkteZeichnen()");

  assert.ok(!/#brueckeZeichnen/.test(bericht),
    "Die Bruecke ist wieder ein eigener Abschnitt");
  assert.ok(!/id="lb-pseteil"/.test(markup),
    "Der zweite Abschnitt steht wieder im Markup");

  // Ein Durchgang je Mittel, und in ihm SEIN Satz und die Haken.
  assert.match(koerper, /for \(const p of this\.produkte \|\| \[\]\)/,
    "Es wird nicht je Mittel gezeichnet");
  assert.match(koerper, /lb-produkt__satz/, "Der Satz zum Mittel fehlt in der Karte");
  assert.match(koerper, /lb-tut/, "Die Haken fehlen in der Karte");
  assert.match(koerper, /slice\(0, 3\)/, "Es kaemen mehr als drei Gruende je Mittel durch");

  // Auch eine ruhige Haut ohne einen einzigen Befund ueber null bekommt
  // die Ueberleitung - vorher fiel bei ihr der ganze Abschnitt weg.
  assert.match(koerper, /this\.text\("pseOhne"\)/,
    "Ohne starken Befund bleibt die Ueberleitung leer");
  assert.ok(TEXTE.pseOhne?.sq && TEXTE.pseOhne?.de, "Der Satz fuer die ruhige Haut fehlt");
});

test("die freigegebenen Wirkungszeilen schlagen die des Katalogs", () => {
  // Ein Befund, der beim Patienten liegt, darf sich nicht aendern, weil
  // jemand spaeter eine Zeile im Katalog umschreibt.
  const koerper = methode(bericht, "async #produkteHolen()");
  assert.match(koerper, /Array\.isArray\(eintrag\?\.veprimi\) && eintrag\.veprimi\.length/,
    "Die Seite nimmt immer die Zeilen aus dem Katalog");
});

test("die Therapiekarte zeigt, was ein Mittel zu einer Therapie macht", () => {
  // 64 Bildpunkte neben zwei Zeilen Text sehen fuer 53 Euro nach einem
  // Zufallsprodukt aus - und dann vergleicht der Kunde mit dem Regal.
  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");
  assert.ok(!/\.lb-produkt__bild\s*\{[^}]*width:\s*64px/.test(css),
    "Das Produktbild ist wieder eine Briefmarke");
  assert.match(css, /\.lb-produkt__bild\s*\{[^}]*width:\s*100%/,
    "Das Produktbild nutzt nicht die volle Breite");

  const koerper = methode(bericht, "#produkteZeichnen()");
  assert.match(koerper, /ikoneFuer\(p\.lloji\)/, "Auf der Karte fehlt das Zeichen der Produktart");

  // Wirkstoffe, Anwendung und Ziel liegen im Blatt, nicht unter der Karte.
  //
  // Ausgeklappt unter jedem Mittel waeren sie eine Tapete, durch die auch
  // der scrollt, der nur wissen will, was er bekommt. Im Blatt liest sie,
  // wer sie sucht - und das ist der Skeptiker, den wir gewinnen muessen.
  // Es ist dieselbe Geste wie "3 foto +" ganz oben: einmal gelernt, hier
  // wiedererkannt.
  assert.match(koerper, /lb-produkt__mehr/, "Es gibt keine Pille zu den Einzelheiten");
  assert.match(koerper, /this\.#therapiBlatt\(p\.id\)/, "Die Pille oeffnet nichts");
  assert.match(koerper, /const tiefe = /, "Die Pille erscheint auch ohne Inhalt dahinter");

  const blatt = methode(bericht, "#therapiBlatt(id)");
  for (const [was, muster] of [
    ["die Wirkstoffe", /lb-perberes/],
    ["die Anwendung", /perdorimMarke/],
    ["der Hinweis", /lb-blatt__kujdes/],
    ["das Ziel bis Tag 28", /synimiMarke/]
  ]) assert.match(blatt, muster, `Im Blatt fehlt ${was}`);
});
