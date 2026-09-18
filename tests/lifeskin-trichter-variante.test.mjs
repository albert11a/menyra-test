// DIE KURZE FASSUNG DES TRICHTERS - was an ihr feststehen muss.
//
// Sie laeuft unter /lifeskintrichter, waehrend /lifeskin unveraendert
// weiterlaeuft, und beide teilen sich dieselben Module. Genau darin liegt
// die Gefahr: Eine Aenderung, die fuer die eine Fassung gedacht ist, trifft
// die andere mit. Dieser Test haelt fest, was die kurze Fassung ausmacht -
// und dass die alte davon nichts abbekommt.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { OBERFLAECHE } from "../apps/lifeskin/lifeskin-content.js";
import { varianteLesen } from "../apps/lifeskin/lifeskin-app.js";
import { ohneKommentare, methode } from "./lifeskin-quelle.mjs";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");

const HTML = lies("apps/lifeskin-trichter/index.html");
const CSS = lies("apps/lifeskin-trichter/trichter-styles.css");
const ALT_HTML = lies("apps/lifeskin/index.html");
const APP = ohneKommentare(lies("apps/lifeskin/lifeskin-app.js"));

// ---------------------------------------------------------------------------
// Der Schalter
// ---------------------------------------------------------------------------

test("die Fassung steht am Aufbau, nicht am Pfad", () => {
  assert.match(HTML, /<html lang="sq" data-ls-variante="kurz">/,
    "Der Aufbau sagt nicht, welche Fassung er ist");
  // Und die alte Seite sagt nichts - sie bleibt, was sie war.
  assert.ok(!/data-ls-variante/.test(ALT_HTML),
    "Die alte Seite traegt jetzt einen Schalter und laeuft nicht mehr wie bisher");
});

test("ohne Schalter bleibt es bei der alten Fassung", () => {
  assert.equal(varianteLesen(undefined), "klassik");
  assert.equal(varianteLesen({ dataset: {} }), "klassik");
  assert.equal(varianteLesen({ dataset: { lsVariante: "" } }), "klassik");
  assert.equal(varianteLesen({ dataset: { lsVariante: "irgendwas" } }), "klassik");
  assert.equal(varianteLesen({ dataset: { lsVariante: "kurz" } }), "kurz");
});

// ---------------------------------------------------------------------------
// Bildschirm 1: lang, scrollbar, Knopf immer sichtbar
// ---------------------------------------------------------------------------

test("der Einstieg ist scrollbar und der Knopf bleibt trotzdem stehen", () => {
  const einstieg = HTML.slice(HTML.indexOf('id="ls-einstieg"'),
    HTML.indexOf("</section>", HTML.indexOf('id="ls-einstieg"')));

  // Gescrollt wird der Inhaltskasten - nicht die Seite und nicht der
  // Bildschirm. Das Stilblatt gibt ihm dafuer overflow-y: auto.
  assert.match(einstieg, /class="ls-inhalt ls-lang"/,
    "Der lange Einstieg benutzt den scrollbaren Kasten nicht");
  assert.match(lies("apps/lifeskin/lifeskin-styles.css"), /\.ls-inhalt \{[\s\S]{0,600}overflow-y: auto;/,
    "Der Inhaltskasten scrollt nicht mehr - dann scrollt der lange Einstieg gar nicht");
  assert.match(CSS, /\.ls-lang \{[\s\S]{0,200}justify-content: flex-start;/,
    "Der lange Einstieg beginnt nicht oben");

  // Und der Knopf liegt AUSSERHALB dieses Kastens, also hinter seinem
  // schliessenden </div> - sonst scrollt er mit weg, und wer nicht bis
  // unten liest, findet ihn nie.
  const kasten = einstieg.indexOf('class="ls-inhalt ls-lang"');
  const fuss = einstieg.indexOf('class="ls-fuss ls-fuss--fest"');
  const knopf = einstieg.indexOf('id="ls-start"');
  assert.ok(kasten > 0 && fuss > kasten, "Der Fuss steht nicht hinter dem Inhalt");
  assert.ok(knopf > fuss, "Der Knopf liegt nicht im Fuss, sondern im gescrollten Text");
  assert.match(CSS, /\.ls-fuss--fest::before \{[\s\S]{0,320}linear-gradient/,
    "Ueber dem Knopf fehlt der Verlauf - der Text bricht dort hart ab und sieht zu Ende aus");
});

test("der Einstieg sagt, dass es weitergeht", () => {
  // Ein Bildschirm, der randvoll aussieht, wird nicht gescrollt - und
  // alles darunter ist dann umsonst geschrieben.
  assert.match(HTML, /class="ls-weiter"/, "Es fehlt der Hinweis nach unten");
  assert.ok(OBERFLAECHE.langMehr?.sq && OBERFLAECHE.langMehr?.de);
});

test("der lange Einstieg beantwortet die Fragen, an denen er verloren hat", () => {
  // Wer ist das, was bekomme ich, was kostet es, was passiert mit meinen
  // Fotos. Jede fehlende Antwort ist ein Grund wegzugehen.
  for (const [was, muster] of [
    ["die Aerztin mit Gesicht", /class="ls-arzt"[\s\S]{0,400}dr-gashi\.jpg/],
    ["kostenlos und ohne Anmeldung", /data-text="langPunktFalas"[\s\S]{0,300}data-text="langPunktOhneKonto"/],
    ["wie es laeuft", /data-text="langWieTitel"/],
    ["was dabei herauskommt", /data-text="langNutzenTitel"/],
    ["ein Fall mit Zeitraum", /fall-vorher\.jpg[\s\S]{0,600}fall-nachher\.jpg/],
    ["wer die Fotos sieht", /data-text="langSchutzTitel"/],
    ["die haeufigen Fragen", /data-text="langFragenTitel"/]
  ]) {
    assert.match(HTML, muster, `Auf dem Einstieg fehlt: ${was}`);
  }

  // Der Fall traegt seine ehrliche Zeile. Ohne sie ist ein Vorher-Nachher
  // ein Ergebnisversprechen - und das gibt diese Seite nicht.
  assert.match(HTML, /data-text="langFallHinweis"/, "Der Fall steht ohne die ehrliche Zeile da");
  assert.match(OBERFLAECHE.langFallHinweis.sq, /nuk është premtim rezultati/);
  assert.match(OBERFLAECHE.langFallHinweis.de, /kein Ergebnisversprechen/);
});

// ---------------------------------------------------------------------------
// Der Text steht fest UND an einer Stelle
// ---------------------------------------------------------------------------

test("jeder feststehende Satz sagt dasselbe wie sein Schluessel", () => {
  // Feststehend, damit er mit der ersten Antwort des Servers da ist statt
  // erst nach elf Modulen. Mit Schluessel, damit eine zweite Sprache ihn
  // umschreiben kann. Ohne diesen Test waeren das zwei Wahrheiten, die
  // still auseinanderlaufen - sichtbar erst im Browser.
  const gefunden = [...HTML.matchAll(/<[a-z0-9]+[^>]*\sdata-text="([a-zA-Z0-9]+)"[^>]*>([^<]*)</g)];
  assert.ok(gefunden.length > 20, `Nur ${gefunden.length} Schluessel gefunden - die Suche greift nicht`);

  for (const [, schluessel, text] of gefunden) {
    assert.ok(OBERFLAECHE[schluessel], `Der Schluessel ${schluessel} steht in keiner Tabelle`);
    const roh = text.trim();
    if (!roh) continue;
    assert.equal(roh, OBERFLAECHE[schluessel].sq,
      `Der feststehende Text und OBERFLAECHE.${schluessel} sagen etwas anderes`);
    assert.ok(OBERFLAECHE[schluessel].de, `${schluessel} fehlt auf Deutsch`);
  }
});

test("ein unbekannter Schluessel loescht keinen feststehenden Text", () => {
  // t() gibt fuer alles, was nicht in OBERFLAECHE steht, eine leere
  // Zeichenkette zurueck. Ungeprueft stuende die im Knoten - aus einem
  // Tippfehler im Schluessel wuerde eine leere Zeile auf genau dem
  // Bildschirm, der die Besucher halten soll.
  const setzen = methode(APP, "#texteSetzen");
  assert.match(setzen, /const wert = this\.text\(knoten\.dataset\.text\);[\s\S]{0,80}if \(!wert\) continue;/,
    "Ein leerer Wert wird wieder ungeprueft geschrieben");
});

// ---------------------------------------------------------------------------
// Bildschirm 2: weg
// ---------------------------------------------------------------------------

test("die Vorbereitungsseite kommt in der kurzen Fassung nicht mehr vor", () => {
  assert.ok(!/id="ls-vorbereitung"/.test(HTML),
    "Der Bildschirm zwischen Einstieg und Kamera steht wieder im Weg");
  // In der alten Fassung steht sie weiter - sie bleibt unveraendert.
  assert.match(ALT_HTML, /id="ls-vorbereitung"/,
    "Die alte Fassung hat ihre Vorbereitungsseite verloren");
});

test("der Tipp auf den Knopf fuehrt je Fassung woanders hin", () => {
  const tippen = methode(APP, "#startTippen");
  // Gezaehlt wird weiter an derselben Stelle: der Tipp auf den Knopf.
  assert.match(tippen, /this\.sitzung\.schritt\("named"\);/,
    "Der erste Tipp wird nicht mehr gezaehlt");
  assert.match(tippen,
    /if \(this\.variante === "kurz"\) \{[\s\S]{0,200}this\.#anleitung\(true\);[\s\S]{0,200}this\.#kameraStarten\(\{ zaehlen: false \}\);/,
    "Die kurze Fassung oeffnet nicht Blatt und Kamera zugleich");
  // Und die alte Fassung geht weiter auf ihre Vorbereitungsseite.
  assert.match(tippen, /this\.zeige\("vorbereitung"\);/,
    "Die alte Fassung springt jetzt woanders hin");
});

test("wer tippt, bevor die Module da sind, bekommt keinen Kamerafehler", () => {
  // Der Knopf traegt seine Beschriftung im Aufbau und sieht fertig aus,
  // bevor der Horcher dranhaengt; der kurze Aufsatz in index.html merkt
  // sich den Tipp. Nachgeholt ist er fuer den Browser aber keine
  // Berührung mehr - getUserMedia() wuerde auf iOS abgewiesen, und statt
  // der Anleitung kaeme ein Kamerafehler. Dann geht die Kamera erst beim
  // Tipp auf "Fillo" auf, und der ist eine echte Berührung.
  assert.match(methode(APP, "#frueherTippNachholen"), /this\.#startTippen\(\{ frueh: true \}\);/,
    "Der nachgeholte Tipp ist nicht mehr als solcher zu erkennen");
  assert.match(methode(APP, "#startTippen"), /if \(!frueh\) \{[\s\S]{0,160}this\.#kameraStarten\(\{ zaehlen: false \}\);/,
    "Ein nachgeholter Tipp fordert die Kamera ohne Berührung an");
  assert.match(methode(APP, "#anleitungFertig"),
    /const nachholen = !this\.anleitung\.kameraLaeuft;[\s\S]{0,300}if \(nachholen\) this\.#kameraStarten\(\{ zaehlen: false \}\);/,
    "Dann faengt die Kamera nie an");
});

test("ein Zurueck von der Kamera fuehrt dorthin, wo der Besucher herkam", () => {
  const vorher = methode(APP, "vorherigerSchirm");
  assert.match(vorher, /if \(this\.variante === "kurz"\) \{[\s\S]{0,160}kamera: "einstieg"/,
    "Zurueck fuehrt auf einen Bildschirm, den es in dieser Fassung nicht gibt");
  // Und die Kamera steht im Verlauf des Browsers, sonst fuehrt die
  // Wischgeste nach rechts aus dem Trichter heraus.
  assert.match(APP, /const IM_VERLAUF_KURZ = Object\.freeze\(\["einstieg", "kamera"\]\);/,
    "Die kurze Fassung hat nur eine Station im Verlauf");
});

// ---------------------------------------------------------------------------
// Bildschirm 3: erst die Anleitung, die Kamera laedt dahinter
// ---------------------------------------------------------------------------

test("die Anleitung liegt ueber der Kamera, nicht davor", () => {
  assert.match(HTML, /<div class="ls-blatt ls-anleitung ls-verstecken" id="ls-anleitung"/,
    "Das Anleitungsblatt fehlt");
  assert.match(HTML, /id="ls-anleitungstart"/, "Das Blatt hat keinen Knopf");
  // Dieselben drei Zeilen wie auf der frueheren Vorbereitungsseite.
  for (const schluessel of ["vorbereitungTitel", "vorbereitungMitte", "vorbereitungLicht", "vorbereitungHoehe"]) {
    assert.ok(HTML.includes(`data-text="${schluessel}"`),
      `Im Anleitungsblatt fehlt ${schluessel}`);
  }
  // Der Knopf heisst nicht mehr "Kamera oeffnen": Sie ist laengst offen.
  assert.ok(!/data-text="vorbereitungKnopf"/.test(HTML),
    "Der Knopf verspricht, die Kamera zu oeffnen - die laeuft an dieser Stelle schon");
  assert.ok(OBERFLAECHE.anleitungKnopf?.sq && OBERFLAECHE.anleitungKnopf?.de);
});

test("das Anleitungsblatt laesst sich nicht nebenbei wegtippen", () => {
  // Der Knopf darin gibt den Scan frei. Ein Blatt, das man wegwischt,
  // liesse den Besucher vor einer laufenden Kamera stehen, ohne dass er
  // gelesen hat, was sie von ihm will.
  const blatt = HTML.slice(HTML.indexOf('id="ls-anleitung"'));
  const leib = blatt.slice(0, blatt.indexOf('id="ls-blatt"'));
  assert.ok(!/data-blatt-zu/.test(leib),
    "Der Hintergrund des Anleitungsblatts schliesst es - dann faengt der Scan ungelesen an");
});

test("die Kamera laedt hinter dem Blatt, gemessen wird erst danach", () => {
  const start = methode(APP, "#kameraStarten");
  // methode() gibt den Rumpf ohne den Kopf zurueck - die Unterschrift wird
  // deshalb in der ganzen Datei gesucht.
  assert.match(APP, /async #kameraStarten\(\{ zaehlen = true \} = \{\}\)/,
    "Der Kamerastart kennt den Unterschied zwischen Laden und Zaehlen nicht");

  // Der Strom wird angefordert, BEVOR das Blatt zugeht - das ist der ganze
  // Gewinn: Systemfrage, Kamera und Gesichtsnetz laufen, waehrend gelesen
  // wird.
  const vorGate = start.slice(0, start.indexOf("#anleitungAbwarten"));
  assert.match(vorGate, /getUserMedia/,
    "Die Kamera wird erst nach dem Blatt angefordert - dann ist nichts gewonnen");
  assert.match(vorGate, /await this\.#videoBereit\(video\)/,
    "Auf das Bild wird erst nach dem Blatt gewartet");

  // Und gemessen wird erst danach: Sonst vermisst der Ring ein Gesicht,
  // das gerade einen Text liest, und ist halb voll, bevor jemand den Kopf
  // gedreht hat.
  const nachGate = start.slice(start.indexOf("#anleitungAbwarten"));
  assert.match(nachGate, /this\.#rueckfallschleife\(/,
    "Der Scan faengt an, bevor das Blatt zugeht");
  assert.match(nachGate, /netzHolen\(/, "Das Gesichtsnetz wird nach dem Blatt geholt");
  assert.match(start, /await this\.#anleitungAbwarten\(\);\s*if \(lauf !== this\.kamera\.lauf \|\| !this\.kamera\.laeuft\) return;/,
    "Nach dem Warten wird nicht geprueft, ob der Lauf noch der eigene ist");
});

test("die Kamera zaehlt erst, wenn der Scan wirklich anfaengt", () => {
  // Sonst stuenden "named" und "camera" in derselben Sekunde, und die
  // Stelle, an der die Anleitung Besucher kostet, waere in keiner Zahl zu
  // sehen.
  assert.match(methode(APP, "#kameraStarten"), /if \(zaehlen\) this\.sitzung\.schritt\("camera"\);/,
    "Der Kamerastart zaehlt immer, auch wenn er nur im Hintergrund laedt");
  assert.match(methode(APP, "#anleitungFertig"),
    /this\.sitzung\.schritt\("camera"\);[\s\S]{0,120}this\.#anleitung\(false\);/,
    "Das Zugehen des Blatts zaehlt die Kamera nicht");
});

test("wer wartet, wird freigegeben - auch wenn etwas schiefgeht", () => {
  const anleitung = methode(APP, "#anleitung");
  assert.match(anleitung, /if \(this\.anleitung\.offen === auf\) return;/,
    "Zweimal zumachen gibt zweimal frei");
  assert.match(anleitung, /for \(const fertig of wartende\) fertig\(\);/,
    "Beim Zumachen wartet der Scan weiter");
  // Der Fehlerkasten meldet fast immer die abgelehnte Kamera - und die
  // faellt an, waehrend das Blatt steht. Bliebe es liegen, staende der
  // Besucher vor einer Anleitung fuer etwas, das gar nicht angefangen hat.
  assert.match(methode(APP, "#fehlerZeigen"), /this\.#anleitung\(false\);/,
    "Der Fehler erscheint hinter dem Anleitungsblatt");
  assert.match(methode(APP, "zurueckZu"), /this\.#anleitung\(false\);/,
    "Beim Zurueckgehen bleibt das Blatt stehen");
});

// ---------------------------------------------------------------------------
// Der Aufbau drumherum
// ---------------------------------------------------------------------------

test("die festen Kaesten liegen ausserhalb der Bildschirme", () => {
  // Ein transform bindet position:fixed an sich: Lagen sie in einem
  // Bildschirm, verschoeben sie sich waehrend des Wechsels mit.
  for (const fest of ["ls-fortschritt", "ls-blatt", "ls-anleitung", "ls-fehler"]) {
    const mitId = HTML.indexOf(`id="${fest}"`);
    const stelle = mitId !== -1 ? mitId : HTML.indexOf(`class="${fest}"`);
    assert.notEqual(stelle, -1, `${fest} nicht gefunden`);
    const davor = HTML.slice(0, stelle);
    const offen = (davor.match(/<section class="ls-schirm/g) || []).length;
    const zu = (davor.match(/<\/section>/g) || []).length;
    assert.equal(offen, zu, `${fest} liegt in einem Bildschirm und wuerde mitbewegt`);
  }
});

test("die kurze Fassung laedt dieselben Module wie die alte", () => {
  // Keine Kopie: Ein zweiter Ort waere ein zweiter Ort, an dem jeder
  // spaetere Fehler noch einmal behoben werden muesste.
  assert.match(HTML, /<script type="module" src="\/apps\/lifeskin\/lifeskin-app\.js">/,
    "Die kurze Fassung laedt eine eigene Kopie des Trichters");
  assert.match(HTML, /<link rel="stylesheet" href="\/apps\/lifeskin\/lifeskin-styles\.css" \/>/,
    "Die kurze Fassung bringt ein eigenes Grundstilblatt mit");
  assert.ok(!/id="ls-karten"/.test(HTML),
    "Der lange Einstieg traegt noch die wechselnden Karten des kurzen");
});

test("die Probeadresse geht nicht in die Suche", () => {
  // Zwei Adressen mit demselben Inhalt teilen sich sonst ihre
  // Auffindbarkeit, und ein geteilter Link zeigte auf die Probe.
  assert.match(HTML, /<meta name="robots" content="noindex,nofollow" \/>/,
    "Die Probeadresse darf indexiert werden");
  assert.match(HTML, /<link rel="canonical" href="https:\/\/www\.mnyra\.com\/lifeskin" \/>/,
    "Die Probeadresse verweist nicht auf die echte Seite");
});

test("die Adresse ist verdrahtet - im Betrieb, lokal und im Service Worker", () => {
  const vercel = JSON.parse(lies("vercel.json"));
  const eigene = vercel.rewrites.findIndex((r) => r.source === "/lifeskintrichter");
  const auffang = vercel.rewrites.findIndex((r) => String(r.source).includes(":landingSlug"));
  assert.ok(eigene >= 0, "Die Route /lifeskintrichter fehlt in vercel.json");
  assert.ok(eigene < auffang, "Die Auffangregel faengt /lifeskintrichter ab");
  assert.equal(vercel.rewrites[eigene].destination, "/apps/lifeskin-trichter/index.html");

  // Der Service Worker haelt sie fuer eine eigene Seite - sonst liefert er
  // bei jedem Netzaussetzer die Social-Shell aus. Geprueft wird auf genaue
  // Gleichheit oder Pfad mit Schraegstrich; '/lifeskin' deckt
  // '/lifeskintrichter' also NICHT ab.
  const sw = lies("sw.js");
  const liste = sw.match(/const NON_SOCIAL_NAVIGATION_PREFIXES = \[([\s\S]*?)\];/)[1];
  for (const pfad of ["/lifeskintrichter", "/apps/lifeskin-trichter"]) {
    assert.ok(liste.includes(`'${pfad}'`), `${pfad} fehlt im Service Worker`);
  }

  // Lokal ebenso, sonst liefert der Entwicklungsserver die Social-App.
  const dev = lies("scripts/local-dev-server.mjs");
  assert.match(dev, /path === "\/lifeskintrichter"/, "Lokal gibt es die Adresse nicht");
  assert.match(dev, /path === "\/lifeskin"/, "Lokal gibt es die alte Adresse nicht");

  // Und die Kommentare gehen nicht mit hinaus.
  assert.match(lies("scripts/build-vercel-static-output.mjs"), /"apps\/lifeskin-trichter"/,
    "Die Begruendungen im Aufbau werden mit ausgeliefert");
});
