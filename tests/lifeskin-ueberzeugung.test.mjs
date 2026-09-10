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
  //
  // DIE DRITTE AENDERUNG, und sie stand als Absicht schon oben in dieser
  // Datei: Die Diagnose kommt NACH den Messwerten. Sie stand davor - und
  // dieser Test hat das festgeschrieben, obwohl sein eigener Kopf das
  // Gegenteil sagt. Ein Test, der den Ist-Zustand abnickt statt die
  // Absicht, macht aus einem Fehler eine Regel.
  //
  // Warum die Diagnose hinten hingehoert: Sie ist nicht die Antwort auf
  // "was ist mit meiner Haut" - das ist der Hauptbefund darueber. Sie ist
  // das Etikett dazu, Fachbegriff und Grad. Vor den Zahlen ist sie eine
  // Behauptung, nach den Zahlen ist sie seine eigene Rechnung. Es kostet
  // ihn also nichts an Geschwindigkeit und gewinnt die Beweisfuehrung.
  const reihe = [
    "lb-pillen",       // was geprueft wurde - der Beweis der Arbeit
    "lb-gjettext",     // SEIN Hauptbefund, sofort
    "lb-messteil",     // die drei Zahlen
    "lb-diagnose",     // und ERST DARAUS die Einordnung
    "lb-grenzenteil",  // und sofort, was aus einem Foto NICHT bestimmbar ist
    "lb-detajet",      // ab hier der Aufklapper
    "lb-erklaerteil",  // was das fuer ihn heisst - darin
    "lb-ekztext",      // Verfahren - darin
    "lb-zonen",        // Zonen - darin
    "lb-messtjere",    // die uebrigen Parameter - darin
    "lb-ohneteil",     // der Verlauf ohne Pflege - darin
    "lb-prognoseteil", // was NICHT von selbst zurueckgeht - offen, davor
    "lb-kalim",        // die Ueberleitung: vom Befund zum Plan
    "lb-psesatz",      // SEINE Befunde als Ueberleitung in die Therapie
    "lb-produkte",     // die Therapie selbst, eine Karte je Mittel
    "lb-oferta",       // der gemeinsame Angebotsblock
    "lb-perfshi",      // was im Preis steckt
    "lb-preis",        // und ERST DANN die Zahl
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
    "lb-sicher", "lb-ofertagaranci"];
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

  // UND IM BLOCK STEHT KEIN KNOPF. Er war derselbe wie der in der Leiste -
  // gleiche Farbe, Groesse, Beschriftung, Betrag. Der Block endet jetzt auf
  // den Zusagen: Das Letzte vor der Handlung ist die Absicherung, nicht die
  // Aufforderung.
  assert.ok(!/id="lb-ofertakauf"/.test(markup),
    "Im Angebotsblock steht wieder ein zweiter Kaufknopf");
  assert.ok(!/id="lb-ofertaunter"/.test(markup),
    "Die Zeile zu Zahlung und Versand steht wieder doppelt - im Block und in der Leiste");
});

test("es gibt genau EINEN Kaufknopf, und er sitzt in der Leiste", () => {
  // Der Knopf IM Angebot und der Knopf in der Leiste sind derselbe Knopf:
  // gleiche Farbe, gleiche Groesse, gleiche Beschriftung, gleicher Betrag.
  // Standen beide gleichzeitig da, verdoppelte das nicht den Druck,
  // sondern das wahrgenommene Verkaufsmotiv - und wahrgenommener Druck
  // erzeugt Gegendruck, auch gegen ein sachlich gutes Angebot.
  //
  // Die Leiste bleibt deshalb aus, solange der Knopf im Angebot sichtbar
  // ist oder noch bevorsteht, und uebernimmt ihn erst, wenn er oben aus
  // dem Bild gescrollt ist.
  const koerper = bericht.slice(bericht.indexOf("#knopfBeobachten(rolle) {"),
    bericht.indexOf("// ---------- Versandstand ----------"));
  assert.match(koerper, /\$\("#lb-oferta"\)/,
    "Die Leiste haengt nicht am Angebotsblock");
  assert.match(koerper, /top < window\.innerHeight \? "kauf" : "aus"/,
    "Die Leiste erscheint nicht, sobald das Angebot in Sicht kommt");
  // Und sie ist der EINZIGE Knopf: Der zweite im Block ist geloescht, nicht
  // versteckt. Deshalb braucht es hier keine Abwechslung mehr.
  assert.ok(!/lb-ofertakauf/.test(bericht),
    "Der Knopf im Angebotsblock wird wieder gezeichnet oder verdrahtet");
  assert.ok(!/setTimeout|Date\.now\(\)/.test(koerper),
    "Die Leiste haengt an der Uhr - es gibt keine Pflichtlesedauer");

  // Dieselbe Beschriftung wie im Angebotsblock.
  assert.match(bericht, /schreibe\(knopf, this\.text\("knopfStart", \{ preis: zahl\(this\.preis\) \}\)\)/,
    "Die Leiste traegt eine andere Beschriftung als der Knopf im Angebot");
});

test("die IGA-Skala steht in der Diagnosekarte - und erfindet keine Zielstufe", () => {
  // Sie war fertig geschrieben und wurde nie gezeichnet. Was sie bringt:
  // "e lehtë" allein ist ein Adjektiv, und davon hat die Seite genug. Erst
  // die Position auf einer fremden, nachschlagbaren Skala macht daraus eine
  // Einordnung - der Unterschied zwischen Menge und Diagnostizitaet.
  assert.match(bericht, /#igaZeichnen\(stufe\)/, "Die IGA-Skala wird nicht gezeichnet");
  const karte = markup.slice(markup.indexOf('id="lb-diagnose"'), markup.indexOf("</section>", markup.indexOf('id="lb-diagnose"')));
  for (const id of ["lb-iga", "lb-igamarke", "lb-igawert", "lb-igaskala"]) {
    assert.ok(karte.includes(id), `${id} steht nicht in der Diagnosekarte`);
  }

  // Das Kuerzel ist antippbar und erklaert sich. Ein Kuerzel, das niemand
  // kennt, ohne Erklaerung stehen zu lassen, ist schlimmer als keines.
  const koerper = bericht.slice(bericht.indexOf("#igaZeichnen(stufe) {"), bericht.indexOf("kasten.classList.remove(\"ls-verstecken\");\n  }", bericht.indexOf("#igaZeichnen(stufe) {")));
  assert.match(koerper, /this\.text\("igaInfo"\)/, "Das Zeichen an der IGA-Zeile oeffnet keine Erklaerung");
  assert.match(koerper, /setAttribute\("role", "button"\)/, "Das Etikett ist nicht antippbar");
  assert.match(TEXTE.igaInfo.sq, /pesë hapa/, "Die Erklaerung nennt die fuenf Stufen nicht");

  // KEINE ZIELSTUFE. Eine gibt es in den Daten nicht - die Seite muesste
  // sie aus niveli minus eins rechnen, also eine Prognose erfinden, und
  // zwar dort, wo ein Ergebnis in Aussicht gestellt wird.
  assert.equal(TEXTE.igaZiel, undefined,
    "Die erfundene Zielstufe ist wieder da - eine Zielstufe steht in keinem Feld des Vertrags");
  assert.ok(!/niveli\s*-\s*1|stufe\s*-\s*1/.test(koerper),
    "Die Seite rechnet sich eine Zielstufe aus");

  // Ohne beurteilbare Stufe keine Skala. Es wird nichts geraten.
  assert.match(koerper, /Number\.isFinite\(stufe\)/,
    "Ohne Stufe wird trotzdem eine Skala gezeichnet");
});

test("die Fallnummer ist antippbar, und am Arztfoto klebt kein Haken", () => {
  // DIE FALLNUMMER. Sie ist der glaubwuerdigste Einzelbeweis der Seite -
  // eine Kennung, die es nur einmal gibt. Antippen macht aus einer Angabe
  // einen Besitz, und wer bei einer Rueckfrage seine Nummer nennen kann,
  // hat einen Vorgang und keinen Werbekontakt.
  const kopf = markup.slice(markup.indexOf('class="lb-briefkopf"'), markup.indexOf("</div>", markup.indexOf('class="lb-briefkopf"')));
  assert.match(kopf, /id="lb-fnummer"[^>]*role="button"/,
    "Die Fallnummer ist nicht antippbar");
  assert.match(bericht, /navigator\.clipboard\.writeText\(code\)/,
    "Antippen kopiert die Fallnummer nicht");
  assert.match(bericht, /schreibe\(nummer, this\.text\("kopiert"\)\)/,
    "Es gibt keine Rueckmeldung - dann sieht niemand, dass etwas passiert ist");
  // Und der Horcher haengt nur einmal dran: Nach einer Bestellung wird der
  // fertige Befund neu gezeichnet.
  assert.match(bericht, /this\.nummerVerdrahtet/,
    "Der Horcher an der Fallnummer wird bei jedem Neuzeichnen erneut gehaengt");

  // DER VERIFIZIERUNGSHAKEN. Ein gruenes Haekchen am Profilbild ist die
  // Bildsprache der sozialen Netze - und es sagt "verifiziert", ohne dass
  // jemand verifiziert haette. Ein Signal ist nur glaubwuerdig, wenn es
  // den Absender etwas kostet; ein Haken kostet nichts.
  assert.ok(!/lb-arzt__haken/.test(markup),
    "Am Arztfoto klebt wieder ein Verifizierungshaken");
  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");
  assert.ok(!/lb-arzt__haken/.test(css),
    "Die Regeln fuer den Verifizierungshaken stehen wieder im Stilblatt");
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
  assert.match(koerper, /const bloecke = alle\.filter\(\(el\) => !imBild\(el\)\)/,
    "Auch der erste Bildschirm wird versteckt - dann blendet sich der Befund ein");
  // Seine ZEILEN weiter unten bekommen aber ihr eigenes Merkmal: Der
  // Messteil steht auf grossen Telefonen schon beim Oeffnen im Bild, und
  // ohne das passierte in seinen unteren Zeilen nie etwas.
  assert.match(koerper, /if \(!imBild\(kind\)\) zeilen\.push\(kind\)/,
    "Zeilen unter dem Rand eines schon sichtbaren Abschnitts bewegen sich nie");
  assert.match(koerper, /zeile\.dataset\.zeile = "warte"/,
    "Die einzelnen Zeilen werden nicht versteckt");

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
  // Der Bereich unter der Kopfzeile - Aerztin, die drei Angaben, die Linie -
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
    assert.ok(!/border(?!-radius)\s*:/.test(regeln), `${name} hat einen Rahmen`);
  }
  for (const name of [".lb-arzt", ".lb-arzt__leib"]) {
    assert.ok(!/background(?!-clip)/.test(block(name)), `${name} traegt eine eigene Flaeche`);
  }

  // Die Kopfzeile traegt KEINE eigene Flaeche mehr - sie steht auf dem
  // Papier und wird von einer Linie abgeschlossen. Das satte Gruen machte
  // aus ihr einen Balken, wie ihn eine App oben hat, und nicht die Zeile
  // oben auf einem Bogen.
  //
  // Was bleibt: Sie laeuft ueber die volle Breite hinaus und traegt den
  // Sicherheitsabstand selbst. Ein Kasten hat einen Rand, an dem er
  // aufhoert - ohne den negativen Aussenrand endete die Linie zwanzig
  // Punkte vor der Kante und waere dann doch einer.
  const band = block(".lb-briefkopf");
  assert.match(band, /background:\s*transparent/,
    "Der Kopf traegt wieder eine eigene Flaeche - dann ist er ein Balken");
  assert.match(band, /border-bottom:\s*1px solid var\(--linie\)/,
    "Dem Kopf fehlt die Linie, die ihn abschliesst");
  assert.match(band, /margin:\s*0 calc\(var\(--rand\) \* -1\)/,
    "Die Linie endet vor der Kante - dann ist der Kopf ein Kasten");
  assert.match(band, /padding:\s*calc\(env\(safe-area-inset-top\)/,
    "Der Kopf traegt den Sicherheitsabstand nicht selbst und reicht nicht unter die Statusleiste");
  // Und der Rollbereich hat ihn dafuer abgegeben. Steht er an beiden
  // Stellen, sitzt das Band doppelt tief und die Leiste bleibt grau.
  assert.match(block(".lb-rolle"), /padding:\s*0 var\(--rand\)/,
    "Der Rollbereich vergibt den oberen Sicherheitsabstand noch selbst");

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

  // Am Ende des Kopfes stand eine Trennlinie. Sie ist weg: Wo der Kopf
  // aufhoert, faengt jetzt die Verbindung an - und ein trennender Strich
  // unmittelbar ueber einer verbindenden Linie sagt das Gegenteil von dem,
  // was die Linie sagen soll.
  assert.ok(!/lb-kopftrenner/.test(css), "Die Trennlinie im Kopf ist zurueck");
  assert.ok(!/lb-kopftrenner/.test(markup), "Die Trennlinie steht noch im Aufbau");

  // GEMESSEN, NICHT GESCHAETZT: Die Rolle ist eine Spalten-Flexbox mit
  // mehr Inhalt als Hoehe. Ohne "flex: none" druecken sich Elemente ohne
  // eigenen Inhalt auf null - die alte Trennlinie war gesetzt, hatte Farbe
  // und Breite und war exakt null Punkte hoch. Die Verbindung besteht aus
  // genau solchen Elementen und braucht denselben Schutz.
  const fluss = block(".lb-fluss");
  assert.match(fluss, /flex:\s*none/, "Die Verbindung wird in der Flexbox auf null gedrueckt");
  assert.match(fluss, /display:\s*block/, "Die Verbindung ist nicht sichtbar");
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
  // Vierundvierzig, nicht mehr: Die Kachel ist eine Angabe und kein Knopf.
  // Und nicht weniger: Die erste von ihnen IST ein Knopf - dahinter liegt
  // das Blatt mit den Ansichten -, und 44 Punkte sind die Untergrenze,
  // unter der ein Daumen danebentrifft.
  assert.match(pille, /min-height:\s*44px/, "Die Kacheln sind nicht 44 Punkte hoch");

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

  // Relevant findings are visible; normal and unknown parameters remain in details.
  assert.match(koerper, /w.shkalla !== null && w.shkalla > 0/);
  assert.match(koerper, /relevant.slice\(0, MESSWERTE_OBEN\)/);
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
    ["der Hinweis", /lb-blatt__kujdes/]
  ]) assert.match(blatt, muster, `Im Blatt fehlt ${was}`);

  // Das Ziel bis Tag 28 lag hinter der Pille und steht jetzt OFFEN auf der
  // Karte: Es ist der einzige Satz, der Befund und Ergebnis verbindet, und
  // er beantwortet die Frage direkt nach "warum das" - "und was bringt mir
  // das". Wirkstoffe duerfen verborgen sein, das Ziel nicht.
  assert.match(koerper, /lb-produkt__synimi/, "Das Ziel bis Tag 28 steht nicht auf der Karte");
  assert.ok(!/synimiMarke/.test(blatt),
    "Das Ziel steht zweimal - auf der Karte und noch einmal im Blatt");
});

// ---------- Der dokumentierte Fall ----------
//
// Zwei Bilder sind das staerkste und zugleich das gefaehrlichste Mittel
// auf dieser Seite. Stark, weil sie zeigen, dass es schon einmal getan
// wurde. Gefaehrlich, weil sie ohne den Hinweissatz ein
// Ergebnisversprechen sind - und drei Abschnitte darueber steht
// ausdruecklich, was ein Foto NICHT sagen kann. Widersprechen sich Bild
// und Text, verliert der Text.

test("der Fall steht nach der Therapie und vor dem Preis", () => {
  const therapie = markup.indexOf('id="lb-produkte"');
  const fall = markup.indexOf('id="lb-fallteil"');
  const angebot = markup.indexOf('id="lb-oferta"');
  assert.ok(fall > 0, "Es gibt keinen dokumentierten Fall");
  assert.ok(therapie > 0 && angebot > 0);
  assert.ok(fall > therapie,
    "Der Fall steht vor der Therapie - dann ist er ein Versprechen, bevor irgendetwas gesagt ist");
  assert.ok(fall < angebot,
    "Der Fall steht hinter dem Preis - dann kommt der Beweis nach der Rechnung");
});

test("zwei Bilder gibt es nur zusammen und nur mit dem Hinweis", () => {
  // Auf die DEKLARATION ankern, nicht auf den Namen: Der Aufruf steht
  // weiter oben in der Datei, und ein indexOf darauf schneidet rueckwaerts
  // - der Ausschnitt war leer und der Test gruen aus dem falschen Grund.
  const ab = bericht.indexOf("\n  #fallZeichnen() {");
  const bis = bericht.indexOf("\n  #kontaktZeichnen() {");
  assert.ok(ab > 0, "#fallZeichnen fehlt");
  assert.ok(bis > ab, "#fallZeichnen steht nicht vor #kontaktZeichnen");
  const koerper = bericht.slice(ab, bis);

  // Fehlt eine der beiden Aufnahmen, erscheint gar nichts: Eine halbe
  // Gegenueberstellung wirft die Frage auf, wo die andere Haelfte ist.
  assert.match(koerper, /if \(!vorher \|\| !nachher\)[^\n]*ls-verstecken/,
    "Ein Vorher ohne Nachher wird trotzdem gezeigt");

  // Und der Hinweis haengt an denselben Bildern: Es gibt keinen Weg, auf
  // dem der Abschnitt ohne ihn sichtbar wird.
  const hinweisAb = koerper.indexOf('this.text("fallHinweis")');
  const sichtbarAb = koerper.indexOf('block.classList.remove("ls-verstecken")');
  assert.ok(hinweisAb > 0, "Der Hinweissatz wird nicht geschrieben");
  assert.ok(sichtbarAb > hinweisAb,
    "Der Abschnitt wird sichtbar, bevor der Hinweis darin steht");
});

test("der Hinweis nimmt den Einwand vorweg und verspricht nichts", () => {
  for (const sprache of ["sq", "de"]) {
    const satz = TEXTE.fallHinweis?.[sprache] || "";
    assert.ok(satz.length > 60, `fallHinweis fehlt auf ${sprache}`);
  }
  // "in demselben Licht" ist der einzige Satzteil, der den haeufigsten
  // Einwand gegen jedes Vorher-Nachher vorwegnimmt - dass die zweite
  // Aufnahme nur besser ausgeleuchtet sei.
  assert.match(TEXTE.fallHinweis.sq, /dritë/i, "Das Licht wird nicht erwaehnt");
  assert.match(TEXTE.fallHinweis.de, /Licht/, "Das Licht wird nicht erwaehnt");
  assert.match(TEXTE.fallHinweis.sq, /premtim/i, "Es fehlt, dass es kein Versprechen ist");
  assert.match(TEXTE.fallHinweis.de, /kein Ergebnisversprechen/,
    "Es fehlt, dass es kein Versprechen ist");
});

test("die beiden Aufnahmen liegen als Dateien vor und sind gleich gross", () => {
  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");
  const konfig = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-config.js"), "utf8");

  // Keine Daten-URI: Die zwei Aufnahmen sind fuer jeden Patienten
  // dieselben. Als Daten laegen sie bei JEDEM Berichtaufruf in der
  // Leitung - auf genau den Telefonen, fuer die diese Seite gebaut ist.
  const block = konfig.slice(konfig.indexOf("LIFESKIN_VORHER_NACHHER"),
    konfig.indexOf("LIFESKIN_PIXEL_ID"));
  assert.ok(!/data:image/.test(block), "Die Aufnahmen stecken als Daten in der Konfiguration");
  for (const feld of ["vorher", "nachher"]) {
    const treffer = block.match(new RegExp(`${feld}:\\s*"([^"]*)"`));
    assert.ok(treffer, `${feld} fehlt in der Konfiguration`);
    if (treffer[1]) {
      assert.ok(existsSync(join(wurzel, treffer[1].replace(/^\//, ""))),
        `Die Aufnahme ${treffer[1]} gibt es nicht - der Patient saehe einen leeren Rahmen`);
    }
  }

  // Nebeneinander, immer. Ein Vorher-Nachher, das man scrollen muss,
  // vergleicht nichts - der Blick braucht beide Bilder auf einmal.
  const paar = css.match(/\n\.lb-fall__paar\s*\{([^}]*)\}/);
  assert.ok(paar, ".lb-fall__paar fehlt");
  assert.match(paar[1], /grid-template-columns:\s*1fr 1fr/,
    "Die beiden Aufnahmen koennen untereinander rutschen");
  // Festes Seitenverhaeltnis: Sonst haengt der Vergleich am Zuschnitt der
  // Datei, und die Seite springt, waehrend die Bilder laden.
  const bild = css.match(/\n\.lb-fall__seite img\s*\{([^}]*)\}/);
  assert.ok(bild, ".lb-fall__seite img fehlt");
  assert.match(bild[1], /aspect-ratio/, "Die Aufnahmen haben kein festes Seitenverhaeltnis");
  assert.match(bild[1], /object-fit:\s*cover/, "Die Aufnahmen werden verzerrt statt beschnitten");
});

test("der Anbieter kommt aus Heart, und ein Netzfehler loescht ihn nicht", () => {
  const holen = bericht.slice(bericht.indexOf("\n  async #anbieterHolen() {"),
    bericht.indexOf("\n  #anbieterZeichnen() {"));
  assert.ok(holen.length > 100, "#anbieterHolen fehlt");

  // Aus derselben Sammlung wie der Setpreis: oeffentlich lesbar, weil der
  // Patient sie sehen muss, und nur vom CEO-Konto schreibbar.
  assert.match(holen, /\/config\/anbieter/, "Der Anbieter wird nicht aus der Konfiguration geholt");

  // NICHT ABGEWARTET: Der Block steht am unteren Ende einer langen Seite.
  // Ihn abzuwarten hiesse, den ganzen Befund auf eine Anfrage warten zu
  // lassen, die ihn nichts angeht.
  assert.ok(!/await this\.#anbieterHolen\(\)/.test(bericht),
    "Der Befund wartet auf den Anbieter");

  // Ein Netzfehler darf keinen Anbieter loeschen: Der Fang setzt nichts,
  // also bleibt stehen, was aus der Konfigurationsdatei kommt.
  assert.match(holen, /catch \{[^}]*\}/, "Ein Netzfehler reisst die Seite mit");
  assert.ok(!/catch[^}]*this\.anbieter\s*=/.test(holen),
    "Der Fang ueberschreibt den Anbieter");

  // Und Heart gewinnt nur, wenn dort auch etwas steht.
  const zeichnen = bericht.slice(bericht.indexOf("\n  #anbieterZeichnen() {"));
  assert.match(zeichnen, /this\.anbieter[\s\S]{0,200}some\(/,
    "Ein leerer Eintrag in Heart wuerde die Konstante verdraengen");
});

// ---------- Der Satz, der offen steht ----------
//
// "Was nicht von selbst zurueckgeht" war der einzige Satz der Seite, den
// man erst aufklappen musste - und der Kommentar an #ohneZeichnen() nannte
// ihn selbst den staerksten. Ein drohender Verlust bewegt etwa doppelt so
// stark wie ein gleich grosser Gewinn; die Seite hatte beide Haelften und
// versteckte die staerkere.

test("die Prognose steht offen, nicht im Aufklapper", () => {
  const auf = markup.indexOf('<details class="lb-detajet"');
  const zu = markup.indexOf("</details>", auf);
  const drin = markup.slice(auf, zu);
  assert.ok(!drin.includes("lb-prognoseteil"),
    "Der staerkste Satz der Seite ist wieder zugeklappt");
  assert.ok(markup.indexOf("lb-prognoseteil") > zu,
    "Die Prognose steht vor dem Aufklapper statt danach");

  // DIE GRENZE STECKT IM SATZ, NICHT IN DER NACHBARSCHAFT.
  //
  // Die Prognose stand einmal unmittelbar VOR den Grenzen, damit auf sie
  // sofort folgt, was ein Foto darueber nicht hergibt. Die Grenzen sind an
  // die Diagnose gewandert, dieser Nachbar ist weg - und damit haengt
  // alles daran, dass der Satz seine Einschraenkung selbst mitbringt. Eine
  // Aussage, die ihre eigene Grenze mitliefert, ist eine Prognose. Eine
  // ohne waere eine Drohung.
  const prompt = JSON.parse(readFileSync(join(wurzel, "docs/lifeskin-prompt.json"), "utf8"));
  assert.ok(prompt.kontrolli_para_pergjigjes.some((z) => /nuk_zbehet/.test(z) && /nicht bestimmbar/.test(z)),
    "Der Prompt verlangt fuer nuk_zbehet keine eigene Grenze mehr - dann steht die Prognose unbegrenzt da");
  assert.match(prompt.shembull_i_pergjigjes.pa_kujdes.nuk_zbehet, /nuk përcaktohet/,
    "Schon das Beispiel im Prompt liefert die Grenze nicht mit");
});

test("die Prognose wird verschoben, nicht verdoppelt", () => {
  const prognose = bericht.slice(bericht.indexOf("\n  #prognoseZeichnen() {"),
    bericht.indexOf("\n  #ohneZeichnen() {"));
  assert.ok(prognose.length > 100, "#prognoseZeichnen fehlt");
  assert.match(prognose, /paKujdes\?\.nukZbehet/, "Die Prognose kommt nicht aus dem Befund");

  // Und die Zeitleiste im Aufklapper zeichnet denselben Satz NICHT mehr
  // mit. Zweimal derselbe Satz liest sich als Verkaufsschleife - dieselbe
  // Regel, die den Abschlussgedanken und die Skeptikerbox gekostet hat.
  const zeitleiste = bericht.slice(bericht.indexOf("\n  #ohneZeichnen() {"));
  const koerper = zeitleiste.slice(0, zeitleiste.indexOf("\n  #"));
  assert.ok(!koerper.includes("nukZbehet"),
    "Der Satz steht zweimal auf der Seite - einmal offen und einmal im Aufklapper");

  // Leer heisst aus: Faellt das Feld im Befund leer aus, erscheint der
  // Abschnitt nicht. Es wird nichts erfunden.
  assert.match(prognose, /if \(!satz\)[^\n]*ls-verstecken/,
    "Ohne Satz bleibt eine leere Ueberschrift stehen");
});

test("die beiden Ueberschriften heissen verschieden", () => {
  // Draussen die Tatsache, im Aufklapper der Verlauf. Hiessen beide
  // gleich, suchte der Leser, welcher der gemeinte ist.
  assert.ok(TEXTE.ohneNukZbehet?.sq && TEXTE.ohneNukZbehet?.de, "Die Ueberschrift draussen fehlt");
  assert.ok(TEXTE.ohneVerlaufMarke?.sq && TEXTE.ohneVerlaufMarke?.de, "Die Ueberschrift im Aufklapper fehlt");
  assert.notEqual(TEXTE.ohneNukZbehet.sq, TEXTE.ohneVerlaufMarke.sq);

  // Und die alten, allgemeinen Saetze sind weg. Sie standen fertig im
  // Verzeichnis und wurden nie gezeichnet - genau der Zustand, aus dem
  // heraus jemand sie eines Tages neben den echten Satz verdrahtet.
  for (const tot of ["ohneLeicht", "ohneMittel", "ohneSchwer", "mitText", "ohneMarke", "mitMarke", "ohneKujdesMarke"]) {
    assert.ok(!TEXTE[tot], `${tot} ist wieder im Verzeichnis, wird aber nirgends gezeichnet`);
  }
});
