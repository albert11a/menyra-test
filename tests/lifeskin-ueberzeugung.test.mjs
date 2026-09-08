import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

test("erst SEIN Befund, dann der Beweis - und der Verkauf erst nach der Ueberleitung", () => {
  // Die Reihenfolge hat sich zweimal geaendert, und beide Male aus einem
  // Grund:
  //
  // Vorher stand der technische Untersuchungsabsatz ganz oben. Wer seine
  // Analyse oeffnet, will aber als Erstes wissen, was mit SEINER Haut ist -
  // nicht, mit welchem Verfahren geprueft wurde. Die Belohnung fuer den
  // Scan muss zuerst kommen.
  //
  // Und danach wurde der Hauptbereich auf das eingekocht, was jemand
  // geoeffnet hat, um es zu lesen: Kopf, Zusammenfassung, Diagnose, die
  // drei Hauptparameter. Die ausfuehrliche Erklaerung, das Verfahren, die
  // Zonen, die uebrigen Parameter und der Verlauf ohne Pflege liegen
  // vollstaendig im EINEN Aufklapper darunter.
  const reihe = [
    "lb-pillen",       // was geprueft wurde - der Beweis der Arbeit
    "lb-gjettext",     // SEIN Hauptbefund, sofort
    "lb-diagnose",     // die Einordnung
    "lb-messteil",     // die drei Zahlen, die sie tragen
    "lb-detajet",      // ab hier der Aufklapper
    "lb-erklaerteil",  // was das fuer ihn heisst - darin
    "lb-ekztext",      // Verfahren - darin
    "lb-zonen",        // Zonen - darin
    "lb-messtjere",    // die uebrigen Parameter - darin
    "lb-ohneteil",     // was ohne Pflege geschieht - darin
    "lb-kalim",        // die Ueberleitung: vom Befund zum Plan
    "lb-psesatz",      // SEINE Befunde als Ueberleitung in die Therapie
    "lb-produkte",     // die Therapie selbst, eine Karte je Mittel
    "lb-oferta",       // der gemeinsame Angebotsblock
    "lb-perfshi",      // was im Preis steckt
    "lb-preis",        // und ERST DANN die Zahl
    "lb-ofertakauf",   // der Knopf im Angebotsblock
    "lb-plan"          // die vier Wochen stehen DANACH
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

test("es gibt EINEN Aufklapper, und die ganze uebrige Analyse liegt darin", () => {
  // Der Hauptbereich hielt frueher alles: Erklaerung, Verfahren, Zonen,
  // zehn Parameter und den Verlauf. Wer nur wissen wollte, was mit seiner
  // Haut ist, scrollte durch zwei Bildschirmlaengen Belegmaterial.
  //
  // Verschachtelte Aufklapper sind dabei die schlechteste Loesung von
  // allen: Wer zweimal tippen muss, um denselben Text zu finden, tippt
  // nicht.
  const auf = markup.indexOf('<details class="lb-detajet"');
  const zu = markup.indexOf("</details>", auf);
  assert.ok(auf > 0 && zu > auf, "Den Aufklapper gibt es nicht mehr");
  const drin = markup.slice(auf, zu);

  for (const teil of ["lb-erklaerteil", "lb-ekztext", "lb-zonen", "lb-messtjere", "lb-ohneteil"]) {
    assert.ok(drin.includes(teil), `${teil} liegt nicht im Aufklapper`);
  }
  // Und nichts davon steht ein zweites Mal ausserhalb.
  const draussen = markup.slice(0, auf) + markup.slice(zu);
  for (const teil of ["lb-erklaerteil", "lb-ekztext", "lb-messtjere", "lb-ohneteil"]) {
    assert.ok(!draussen.includes(`id="${teil}"`), `${teil} steht zweimal auf der Seite`);
  }
  assert.ok(!drin.slice(drin.indexOf(">")).includes("<details"),
    "Im Aufklapper steckt ein zweiter Aufklapper");

  // Der Warnhinweis auf die aerztliche Abklaerung bleibt unmittelbar
  // sichtbar - er darf nie hinter einem Tipp verschwinden.
  assert.ok(!drin.includes("lb-fhaftung"), "Der Haftungshinweis ist im Aufklapper verschwunden");
  assert.ok(markup.includes('id="lb-fhaftung"'), "Der Haftungshinweis fehlt ganz");
  assert.ok(!drin.includes("lb-diagstufe"), "Die Handlungsstufe der Diagnose ist zugeklappt");
});

test("der Abschlussgedanke und die Skeptikerbox sind weg - eine Zeile traegt den Uebergang", () => {
  // "Analiza mbaroi …" erklaerte einen Bruch, den es selbst erzeugte, und
  // der Kasten darunter behauptete, dies sei nicht "noch eine Creme" -
  // also genau das, was die Produkttexte daneben belegen. Eine Behauptung
  // neben ihrem eigenen Beweis schwaecht den Beweis.
  assert.ok(!markup.includes("lb-szene"), "Der Abschlussgedanke steht wieder da");
  assert.ok(!markup.includes("lb-provuar"), "Die Skeptikerbox steht wieder da");
  for (const weg of ["szeneMarke", "szeneSatz", "provuarMarke", "provuarText"]) {
    assert.ok(!TEXTE[weg], `${weg} ist wieder im Verzeichnis`);
  }
  assert.equal(TEXTE.kalimSatz.sq, "Nga gjetjet e analizës te plani për lëkurën tuaj.");
  assert.ok(TEXTE.kalimSatz.de, "Die Ueberleitung fehlt auf Deutsch");
});

test("das Angebot steht in EINEM Block, und die vier Wochen kommen danach", () => {
  // Ueberschrift, Inhalt, Preis, Lieferung, Knopf, Garantie - in dieser
  // Reihenfolge und beieinander. Vorher lagen diese sechs Teile ueber eine
  // Bildschirmlaenge verstreut, mit der Zeitleiste und der Begleitung
  // dazwischen; wer entscheiden wollte, musste sie selbst zusammensuchen.
  const auf = markup.indexOf('<section class="lb-oferta"');
  const zu = markup.indexOf("</section>", markup.indexOf('id="lb-ofertagaranci"'));
  assert.ok(auf > 0 && zu > auf, "Den Angebotsblock gibt es nicht");
  const drin = markup.slice(auf, zu);
  const reihe = ["lb-paketamarke", "lb-perfshiliste", "lb-preisjetzt",
    "lb-sicher", "lb-ofertakauf", "lb-ofertaunter", "lb-ofertagaranci"];
  const stellen = reihe.map((id) => drin.indexOf(id));
  for (const [i, stelle] of stellen.entries()) {
    assert.ok(stelle >= 0, `"${reihe[i]}" fehlt im Angebotsblock`);
  }
  assert.deepEqual(stellen, [...stellen].sort((a, b) => a - b),
    `Die Reihenfolge im Angebot stimmt nicht: ${reihe.join(" -> ")}`);

  // Die Zeitleiste steht danach, nicht dazwischen.
  assert.ok(markup.indexOf('id="lb-plan"') > zu,
    "Die Vier-Wochen-Zeitleiste steht wieder vor dem Angebot");

  // Der Betrag kommt aus dem Fall, nicht aus dem Text.
  assert.match(TEXTE.knopfStart.sq, /\{preis\}/, "Der Knopf traegt einen festen Betrag");
  assert.ok(!/53/.test(TEXTE.knopfStart.sq + TEXTE.knopfStart.de),
    "Im Knopf steht eine feste Zahl");
  assert.match(bericht, /schreibe\(\$\("#lb-ofertakauf"\), this\.text\("knopfStart", \{ preis: zahl\(this\.preis\) \}\)\)/,
    "Der Knopf im Angebot nimmt nicht den Preis des Falls");
});

test("die Kaufleiste haengt am Angebot, nicht an einer Lesedauer", () => {
  // Im ersten Befundbildschirm gibt es sie nicht. Sie kommt, sobald der
  // Angebotsblock ins Bild kommt, und bleibt danach da.
  const koerper = bericht.slice(bericht.indexOf("#knopfBeobachten(rolle) {"),
    bericht.indexOf("// ---------- Versandstand ----------"));
  assert.match(koerper, /\$\("#lb-oferta"\)/,
    "Die Leiste haengt nicht am Angebotsblock");
  assert.match(koerper, /oben < window\.innerHeight \? "kauf" : "aus"/,
    "Die Leiste erscheint nicht, sobald das Angebot in Sicht kommt");
  assert.ok(!/setTimeout|Date\.now\(\)/.test(koerper),
    "Die Leiste haengt an der Uhr - es gibt keine Pflichtlesedauer");

  // Dieselbe Beschriftung wie im Angebotsblock.
  assert.match(bericht, /schreibe\(knopf, this\.text\("knopfStart", \{ preis: zahl\(this\.preis\) \}\)\)/,
    "Die Leiste traegt eine andere Beschriftung als der Knopf im Angebot");
});

test("die Einblendung kann keine Aussage verschlucken", () => {
  // Die Abschnitte kommen beim Herunterscrollen - das ist gewollt und
  // liest sich besser als eine fertige Wand. Aber eine Animation, die
  // einen Befund oder einen Preis verschluckt, ist der schlimmste Fehler
  // dieser Seite. Vier Riegel halten sie harmlos, und die stehen hier
  // fest.
  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");
  const koerper = methode(bericht, "#einblenden(rolle)");

  // 1. Versteckt wird erst im Code. Ohne das Merkmal gilt keine Regel -
  //    faellt das Skript aus, steht der ganze Bericht da.
  assert.match(css, /\[data-zeig="warte"\]\s*\{[^}]*opacity:\s*0/,
    "Die Regeln der Einblendung fehlen");
  // Der Abschnitt selbst - nicht seine leiser gesetzten Teile, die eine
  // Deckkraft von 0,7 tragen duerfen und sollen.
  for (const name of [".lb-teil", ".lb-oferta", ".lb-diagnose", ".lb-kalim", ".lb-produkt"]) {
    const block = css.match(new RegExp(`\\n\\${name}\\s*\\{([^}]*)\\}`));
    if (!block) continue;
    assert.ok(!/opacity:\s*0\s*[;}]/.test(block[1]),
      `${name} ist schon im Stil versteckt - dann hilft kein Skript mehr`);
  }
  assert.match(koerper, /dataset\.zeig = "warte"/, "Es wird nie etwas versteckt");

  // 2. Gerechnet, nicht beobachtet: Ein Sprung ueber einen Abschnitt
  //    hinweg darf ihn nicht dauerhaft unsichtbar lassen.
  assert.ok(!/IntersectionObserver/.test(koerper),
    "Die Einblendung haengt an einem Beobachter - der verschlaeft jeden Sprung");
  assert.match(koerper, /getBoundingClientRect\(\)\.top < window\.innerHeight/,
    "Es wird nicht nachgerechnet, was im Bild steht");
  assert.match(koerper, /addEventListener\("scroll", pruefen/,
    "Beim Scrollen wird nicht nachgesehen");

  // 3. Was beim Oeffnen schon im Bild steht, wird gar nicht erst
  //    versteckt - sonst blendet sich der erste Bildschirm ein.
  assert.match(koerper, /&& !imBild\(el\)/,
    "Auch der erste Bildschirm wird versteckt - dann blendet sich der Befund ein");

  // 4. Und im Aufklapper wird nichts versteckt: Zugeklappt kommt es nie
  //    ins Bild und bliebe beim Aufklappen unsichtbar.
  assert.match(koerper, /imAufklapper/, "Der Inhalt des Aufklappers wird mitversteckt");
  assert.match(koerper, /prefers-reduced-motion: reduce/,
    "Wer Bewegung abgeschaltet hat, bekommt trotzdem welche");

  // Und der Preis wird nicht doppelt versteckt: Er liegt im
  // Angebotsblock, und zwei geschachtelte Verstecke koennen einander
  // ueberdauern - dann steht der Kasten da und die Zahl darin fehlt.
  const wahl = koerper.slice(koerper.indexOf("rolle.querySelectorAll"),
    koerper.indexOf("if (!bloecke.length)"));
  assert.ok(!/\.lb-preis/.test(wahl), "Der Preis wird zusaetzlich zum Angebotsblock versteckt");
});

test("der Kopf ist ein Briefkopf, kein Kasten", () => {
  // Der ganze Bereich - Kopfzeile, Aerztin, die drei Angaben, die Linie -
  // steht offen auf dem warmen Grund der Seite. Ein Rahmen darum machte
  // aus einem Briefkopf ein Werbebanner, und der erste Eindruck dieser
  // Seite muss ein Dokument sein.
  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");
  const block = (name) => {
    const t = css.match(new RegExp(`\\n\\${name}\\s*\\{([^}]*)\\}`));
    assert.ok(t, `${name} gibt es nicht`);
    return t[1];
  };
  for (const name of [".lb-briefkopf", ".lb-arzt", ".lb-arzt__leib"]) {
    const regeln = block(name);
    assert.ok(!/box-shadow/.test(regeln), `${name} hat einen Schatten`);
    assert.ok(!/background(?!-clip)/.test(regeln), `${name} traegt eine eigene Flaeche`);
    assert.ok(!/border(?!-radius)\s*:/.test(regeln), `${name} hat einen Rahmen`);
  }

  // Kopfzeile: Dokumenttitel links, Fallnummer rechts, gleich gesetzt und
  // beide einzeilig. Zwei Zeilen machen aus einem Briefkopf eine
  // Ueberschrift - und die Grundlinie daneben stimmt dann nicht mehr.
  const kopf = block(".lb-briefkopf");
  assert.match(kopf, /justify-content:\s*space-between/, "Titel und Nummer stehen nicht auseinander");
  assert.match(kopf, /align-items:\s*center/, "Sie stehen nicht auf einer Grundlinie");
  const gemeinsam = css.match(/\.lb-schirm--fertig h1, \.lb-briefkopf__nummer\s*\{([^}]*)\}/);
  assert.ok(gemeinsam, "Titel und Fallnummer werden nicht gemeinsam gesetzt");
  assert.match(gemeinsam[1], /white-space:\s*nowrap/, "Der Dokumenttitel darf umbrechen");
  assert.match(gemeinsam[1], /text-transform:\s*uppercase/, "Der Kopf steht nicht in Grossbuchstaben");

  // Der Titel traegt die Grossbuchstaben im STIL, nicht im Text: Sonst
  // steht er in jeder Vorleseansage geschrien da.
  assert.equal(TEXTE.raportTitel.sq, "Analiza dermatologjike");
  assert.ok(TEXTE.raportTitel.de, "Der Dokumenttitel fehlt auf Deutsch");

  // Die Linie am Ende des Kopfes.
  //
  // GEMESSEN, NICHT GESCHAETZT: Die Rolle ist eine Spalten-Flexbox mit
  // mehr Inhalt als Hoehe. Ohne "flex: none" druecken sich Elemente ohne
  // eigenen Inhalt auf null - die Linie war gesetzt, hatte Farbe und
  // Breite und war exakt null Punkte hoch.
  const linie = block(".lb-kopftrenner");
  assert.match(linie, /flex:\s*none/, "Die Linie wird in der Flexbox auf null gedrueckt");
  assert.match(linie, /height:\s*1px/, "Die Linie ist nicht ein Punkt hoch");
});

test("die Aerztin hat ein Gesicht, und es liegt wirklich im Projekt", () => {
  // Ein Gesicht ist der ganze Unterschied zwischen "eine App hat das
  // gerechnet" und "ein Mensch hat das angesehen". Ein Platzhalter mit
  // Initialen sagt das Gegenteil.
  const bild = markup.match(/<img src="([^"]+)"[^>]*>/);
  assert.ok(bild, "Im Kopf steht kein Bild der Aerztin");
  assert.ok(existsSync(join(wurzel, bild[1].replace(/^\//, ""))),
    `Das Bild ${bild[1]} gibt es nicht - der Patient sieht einen leeren Rahmen`);
  assert.match(bild[0], /alt=""/,
    "Das Bild traegt einen Alternativtext - der Name steht daneben und wuerde zweimal angesagt");
  assert.match(bild[0], /width="58" height="58"/,
    "Ohne feste Masse springt die Zeile, waehrend das Bild laedt");

  // Der Satz darueber nennt SEINEN Namen und die Aerztin in einem Zug -
  // und faellt ohne Namen nicht weg.
  assert.match(TEXTE.raportFuer.sq, /\{name\}/, "Die Zeile nennt den Namen nicht");
  assert.ok(TEXTE.raportFuerOhne?.sq && TEXTE.raportFuerOhne?.de,
    "Ohne Namen bleibt die Zeile ueber der Aerztin leer");
  assert.match(bericht, /this\.text\("raportFuerOhne"\)/,
    "Der Fall ohne Namen wird nicht behandelt");
  assert.ok(!/ls-verstecken", !name/.test(bericht),
    "Die Zeile ueber der Aerztin verschwindet wieder, wenn der Name fehlt");
});

test("die drei Angaben stehen als gleich breite Kacheln in EINER Reihe", () => {
  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");
  const pillen = css.match(/\n\.lb-pillen\s*\{([^}]*)\}/)[1];
  assert.match(pillen, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,
    "Die drei Angaben teilen sich die Breite nicht zu gleichen Teilen");

  const pille = css.match(/\n\.lb-pille\s*\{([^}]*)\}/)[1];
  assert.ok(!/999px/.test(pille), "Die Kacheln sind wieder Pillen - das sieht nach Etikett aus");
  assert.ok(!/box-shadow/.test(pille), "Die Kacheln haben einen Schatten");
  assert.match(pille, /min-height:\s*54px/, "Die Kacheln sind nicht 54 Punkte hoch");

  // Zahl und Wort getrennt: Der Blick faellt auf die Zahl und findet das
  // Wort ohne einen zweiten Sprung.
  const koerper = methode(bericht, "#kachel(knoten, zeichen, zahl, marke, lang = false)");
  assert.match(koerper, /lb-pille__zahl/, "Die Zahl steht nicht fuer sich");
  assert.match(koerper, /lb-pille__marke/, "Das Wort steht nicht fuer sich");
  for (const marke of ["markeFoto", "markeParametra", "markeZona"]) {
    assert.ok(TEXTE[marke]?.sq && TEXTE[marke]?.de, `${marke} fehlt`);
  }

  // Die Aufnahmen bleiben ein Knopf: Hinter ihnen liegt das Blatt mit den
  // beurteilten Ansichten.
  const zeichnen = methode(bericht, "#pillenZeichnen()");
  assert.match(zeichnen, /createElement\("button"\)/, "Die Aufnahmen sind kein Knopf mehr");
  assert.match(zeichnen, /this\.#fotoblatt\(true\)/, "Der Knopf oeffnet nichts");
  // Und die Zahlen kommen weiter aus der Analyse.
  assert.match(zeichnen, /raport\.fotot/, "Die Zahl der Aufnahmen ist erfunden");
  assert.match(zeichnen, /raport\.zonat/, "Die Zahl der Zonen ist erfunden");

  // Kein Zielkreis fuer die Zonen: Das ist die Bildsprache von Zielen und
  // Treffern und hat auf einem Befund nichts zu suchen.
  assert.match(bericht, /fytyra:/, "Das Zeichen der Zonen fehlt");
  assert.ok(!/#pille\("raster"/.test(bericht), "Die Zonen tragen wieder das Fadenkreuz");
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
  // Nicht mehr die volle Breite - aber auch keine Briefmarke.
  //
  // Ueber die volle Breite war die Karte 535 Bildpunkte hoch, zwei Mittel
  // also anderthalb Bildschirme allein fuer die Therapie. In der jetzigen
  // Form sind es rund 310, ohne dass ein Satz kuerzer wird.
  //
  // Was nicht zurueckkommen darf, ist das Thumbnail von 64: Fuer 53 Euro
  // sieht das nach einem Zufallsprodukt aus, und dann vergleicht der Kunde
  // mit dem Regal statt mit einer begleiteten Therapie. Die Grenze liegt
  // deshalb bei 90 - klein genug fuer eine Karte, die neben dem Bild noch
  // Namen, Nummer und drei Angaben traegt, und gross genug, dass ein
  // Produkt darin zu erkennen ist.
  const breite = css.match(/\.lb-produkt__bild\s*\{[^}]*width:\s*(\d+)px/);
  assert.ok(breite, "Das Produktbild hat keine feste Breite mehr");
  assert.ok(Number(breite[1]) >= 90,
    `Das Produktbild ist mit ${breite[1]}px wieder eine Briefmarke`);

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
