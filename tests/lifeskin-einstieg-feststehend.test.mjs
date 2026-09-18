import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  EINSTIEG_KARTEN, EINSTIEG_HINWEIS, OBERFLAECHE, ARZT_BILD, ARZT_NAME, t
} from "../apps/lifeskin/lifeskin-content.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
const css = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-styles.css"), "utf8");

// DER TEXT DES EINSTIEGS STEHT AN ZWEI ORTEN - UND MUSS DERSELBE SEIN.
//
// Warum er ueberhaupt zweimal steht: Bis alle elf Module geladen sind, stand
// auf dem Bildschirm nur das Wort LIFESKIN und ein Knopf OHNE Beschriftung.
// Auf der echten Seite sind das 0,7 Sekunden; auf 3G waren es gemessen 4,7,
// auf schlechtem 3G 8,9. Wer aus einer Anzeige kommt, sieht in dieser Zeit
// eine Seite, die aussieht, als sei sie kaputt.
//
// Feststehender Text kommt mit der ersten Antwort des Servers. Der Preis
// dafuer ist eine zweite Wahrheit - und die laeuft ohne diesen Test still
// auseinander: Jemand aendert den Satz in lifeskin-content.js, und der
// Besucher liest eine halbe Sekunde lang den alten, bis JavaScript ihn
// ueberschreibt. Genau das faellt niemandem auf.
//
// Also wird hier Zeichen fuer Zeichen verglichen.

const einstieg = html.slice(html.indexOf('id="ls-einstieg"'), html.indexOf('id="ls-vorbereitung"'));

// Aus dem Aufbau wird das, was der Besucher liest: Zeilenwechsel als
// Leerzeichen, Auszeichnung weg, Entitaeten aufgeloest.
function alsText(roh) {
  return roh
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"')
    .split("\n").map((z) => z.trim()).filter(Boolean).join("\n");
}

test("der Knopf traegt seine Beschriftung schon im Aufbau", () => {
  const knopf = einstieg.match(/<button[^>]*id="ls-start"[^>]*>([\s\S]*?)<\/button>/);
  assert.ok(knopf, "Der Startknopf steht nicht mehr im Aufbau");
  assert.equal(alsText(knopf[1]), t(OBERFLAECHE.einstiegKnopf, "sq"),
    "Der feststehende Knopftext weicht von OBERFLAECHE.einstiegKnopf ab");
  // Die Marke bleibt: Sie schreibt den Knopf fuer eine andere Sprache um.
  assert.match(knopf[0], /data-text="einstiegKnopf"/,
    "Ohne data-text bleibt der Knopf in der zweiten Sprache albanisch");
});

test("die Zeile unter dem Knopf steht schon im Aufbau", () => {
  const zeile = einstieg.match(/<p[^>]*id="ls-einstieghinweis"[^>]*>([\s\S]*?)<\/p>/);
  assert.ok(zeile, "Die Hinweiszeile steht nicht mehr im Aufbau");
  assert.equal(alsText(zeile[1]), t(EINSTIEG_HINWEIS, "sq"),
    "Der feststehende Hinweis weicht von EINSTIEG_HINWEIS ab");
});

test("beide Karten stehen im Aufbau, Wort fuer Wort wie in EINSTIEG_KARTEN", () => {
  const karten = [...einstieg.matchAll(/<div class="ls-karte"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="ls-karte"|<\/div>)/g)];
  assert.equal(karten.length, EINSTIEG_KARTEN.length,
    `Im Aufbau stehen ${karten.length} Karten, in EINSTIEG_KARTEN ${EINSTIEG_KARTEN.length}`);

  for (const [i, karte] of EINSTIEG_KARTEN.entries()) {
    const roh = karten[i][1];

    const titel = roh.match(/<(h1|p) class="ls-karte__titel"[^>]*>([\s\S]*?)<\/\1>/);
    assert.ok(titel, `Karte ${i}: die Ueberschrift fehlt im Aufbau`);
    assert.equal(alsText(titel[2]), t(karte.titel, "sq"),
      `Karte ${i}: der feststehende Titel weicht von EINSTIEG_KARTEN ab`);

    // EIN h1 auf der Seite, nicht zwei - wie in #kartenBauen(). Zwei
    // Ueberschriften uebereinander waeren fuer ein Vorleseprogramm zwei
    // Kapitel, wo eines steht.
    assert.equal(titel[1], i === 0 ? "h1" : "p",
      `Karte ${i}: falsche Auszeichnung (${titel[1]})`);

    if (karte.unter) {
      const unter = roh.match(/<p class="ls-karte__unter"[^>]*>([\s\S]*?)<\/p>/);
      assert.ok(unter, `Karte ${i}: der Untertitel fehlt im Aufbau`);
      assert.equal(alsText(unter[1]), t(karte.unter, "sq"),
        `Karte ${i}: der feststehende Untertitel weicht ab`);
    }

    // Der Umbruch gehoert zum Satz und nicht zum Geraet: Wo er steht,
    // entscheidet der Text. Im Aufbau ist das ein <br>.
    if (t(karte.titel, "sq").includes("\n")) {
      assert.match(titel[2], /<br\s*\/?>/i, `Karte ${i}: der Umbruch fehlt im Aufbau`);
    }

    // Foto und Zeichen stehen auf demselben Platz - beides im Aufbau.
    if (karte.bild) {
      assert.match(roh, new RegExp(`src="${ARZT_BILD}"`), `Karte ${i}: das Portraet fehlt`);
      assert.match(roh, new RegExp(`alt="${ARZT_NAME}"`), `Karte ${i}: dem Portraet fehlt der Name`);
    }
    for (const name of [karte.zeichen, karte.unterZeichen].filter(Boolean)) {
      assert.match(roh, new RegExp(`data-zeichen="${name}"`),
        `Karte ${i}: die Huelle fuer das Zeichen "${name}" fehlt`);
    }
  }
});

test("die Punkte stehen im Aufbau, einer je Karte", () => {
  const punkte = einstieg.match(/id="ls-punkte"[^>]*>([\s\S]*?)<\/div>/);
  assert.ok(punkte, "Der Punkteblock fehlt");
  const zahl = [...punkte[1].matchAll(/class="ls-punkt"/g)].length;
  assert.equal(zahl, EINSTIEG_KARTEN.length,
    `${zahl} Punkte fuer ${EINSTIEG_KARTEN.length} Karten`);
  assert.equal([...punkte[1].matchAll(/data-aktiv="ja"/g)].length, 1,
    "Genau ein Punkt ist der aktive");
});

// DER PFAD DES ZEICHENS STEHT NUR AN EINER STELLE.
//
// Das Siegel und der Suchrahmen liegen als Pfaddaten in Trichter.ZEICHEN.
// Stuende im Aufbau ein fertiges SVG, gaebe es denselben Pfad zweimal - und
// zwei Pfade werden frueher oder spaeter zwei verschiedene Pfade.
test("die Karten tragen Huellen und keine zweiten SVG-Pfade", () => {
  const karten = einstieg.slice(einstieg.indexOf('id="ls-karten"'), einstieg.indexOf('id="ls-punkte"'));
  assert.ok(!/<path/i.test(karten),
    "Im Kartenblock steht ein Pfad - der gehoert in Trichter.ZEICHEN");
});

// Angehaengt stuende das Siegel HINTER dem Satz statt davor, und das
// Stilblatt (.ls-karte__unter > svg) traefe es gar nicht erst.
test("das Zeichen wird vorangestellt und nicht angehaengt", () => {
  assert.match(app, /knoten\.prepend\(svg\)/,
    "Das Zeichen wird angehaengt - dann steht es hinter dem Satz");
  assert.match(app, /if \(knoten\.querySelector\("svg"\)\) continue;/,
    "Geprueft wird auf irgendein Kindelement statt auf ein vorhandenes Zeichen");
  assert.match(css, /\.ls-karte__unter\s*>\s*svg/,
    "Das Stilblatt greift nicht mehr auf ein unmittelbares Kind");
});

// DIE ZWEITE SPRACHE BLEIBT EINZIEHBAR.
//
// Das war der Grund fuer die alte Regel "im Aufbau keine Zeichenkette".
// Sie gilt weiter - nur wird sie jetzt von der Sprachmarke getragen statt
// von einem leeren Kasten.
test("eine andere Sprache baut die Karten neu", () => {
  assert.match(einstieg, /id="ls-karten"[^>]*data-sprache="sq"/,
    "Ohne data-sprache weiss niemand, in welcher Sprache der Aufbau steht");
  assert.match(app, /if \(kasten\.dataset\.sprache === this\.sprache\) return;/,
    "Die Karten werden nicht neu gebaut, wenn die Sprache nicht stimmt");
  assert.match(app, /kasten\.dataset\.sprache = this\.sprache;/,
    "Nach dem Bauen wird die Sprache nicht vermerkt");
});

// ---------- Der Tipp, der vor dem JavaScript kommt ----------
//
// Der Preis des feststehenden Textes: Der Knopf sieht fertig aus, sobald
// die erste Antwort des Servers da ist - der Horcher haengt aber erst dran,
// wenn elf Module geladen sind. Auf 3G lagen dazwischen im Prueflauf ueber
// drei Sekunden.
//
// GEMESSEN, NICHT GESCHAETZT: In genau diesem Fenster hat der Prueflauf
// getippt und war danach immer noch auf Bildschirm 1 - der Knopf war
// beschriftet und taub. Das ist schlimmer als ein Knopf ohne Beschriftung.

test("der Aufsatz fuer den fruehen Tipp steht vor dem Stilblatt", () => {
  const kopf = html.slice(0, html.indexOf("</head>"));
  const aufsatz = kopf.indexOf("__lifeskinFrueherTipp");
  const stilblatt = kopf.indexOf('rel="stylesheet"');
  assert.ok(aufsatz > -1, "Der Aufsatz fehlt im Kopf der Seite");
  assert.ok(stilblatt > -1, "Das Stilblatt steht nicht mehr im Kopf");
  // Ein Skript wartet auf jedes Stilblatt, das davor steht. Dahinter gaebe
  // es wieder ein Fenster, in dem der Knopf da und der Horcher weg ist.
  assert.ok(aufsatz < stilblatt,
    "Der Aufsatz steht hinter dem Stilblatt und wartet damit auf dessen Ankunft");
});

test("der Aufsatz haengt am Dokument, nicht am Knopf", () => {
  // So braucht es den Knopf zu diesem Zeitpunkt noch gar nicht zu geben.
  assert.match(html, /document\.addEventListener\("click",[\s\S]{0,400}?\}, true\);/,
    "Der Horcher haengt nicht am Dokument oder nicht in der Erfassungsphase");
  assert.match(html, /closest\("#ls-start"\)/, "Der Aufsatz sucht den Startknopf nicht");
  assert.match(html, /knopf\.dataset\.wartet = "ja"/,
    "Der Tipp wird nicht sichtbar gemacht - eine Sekunde ohne Antwort ist ein Abbruchgrund");
});

test("die App holt den fruehen Tipp nach - nach der Sitzung, nicht davor", () => {
  assert.match(app, /#frueherTippNachholen\(\)\s*\{[\s\S]*?globalThis\.__lifeskinBereit = true;/,
    "Die App meldet sich nicht als bereit");
  assert.match(app, /globalThis\.__lifeskinFrueherTipp = false;/,
    "Der Tipp wird nicht entwertet und koennte zweimal zaehlen");
  // Andersherum zaehlte #startTippen() einen Schritt auf einer Sitzung,
  // die es noch nicht gibt.
  const starte = app.slice(app.indexOf("this.sitzung.starte({ sprache"));
  assert.ok(starte.indexOf("#frueherTippNachholen()") > -1
    && starte.indexOf("#frueherTippNachholen()") < 400,
    "Der Tipp wird nicht unmittelbar nach dem Anlegen der Sitzung nachgeholt");
});

test("der wartende Knopf ist gedaempft, aber nicht gesperrt", () => {
  const regel = css.match(/\.ls-knopf\[data-wartet="ja"\]\s*\{[^}]*\}/);
  assert.ok(regel, "Der wartende Zustand ist nicht gestaltet");
  assert.ok(!/disabled/.test(regel[0]),
    "Ein gesperrter Knopf sagt 'geht nicht' - es dauert aber nur");
  // Wer Bewegung abbestellt hat, bekommt die Aussage trotzdem.
  const ruhig = css.slice(css.indexOf("prefers-reduced-motion"));
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.ls-knopf\[data-wartet="ja"\][^}]*opacity/,
    "Ohne Bewegung bleibt vom wartenden Knopf nichts uebrig");
  assert.ok(ruhig.length > 0);
});
