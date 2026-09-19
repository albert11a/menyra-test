import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Die Vorschau beim Teilen.
//
// Beide Seiten kamen beim Teilen als nackte graue Adresse an. In einem
// Markt, in dem der Link durch WhatsApp weitergereicht wird, ist das der
// einzige kostenlose Kanal - und er sah aus wie Spam.
//
// Der heikle Teil ist nicht, DASS es eine Vorschau gibt, sondern WAS
// darin steht: Sie erscheint in Gruppen, in denen niemand sie angefordert
// hat, und die Dienste speichern sie. Wer den Link weitergibt,
// entscheidet ueber die Seite - ueber die Vorschau entscheidet er nicht
// mit.

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const bericht = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
const vercel = JSON.parse(readFileSync(join(wurzel, "vercel.json"), "utf8"));

// WELCHE DATEI BEKOMMT DER PATIENT WIRKLICH? NACHSEHEN, NICHT RATEN.
//
// Genau daran ist es gescheitert: Die Vorschau stand in
// apps/lifeskin-bericht/index.html, und dieser Test prueft sie dort seit
// jeher gruen. Ausgeliefert wird unter /analiza/ aber lifeskin-astra -
// dort fehlte sie. Beide waren miteinander einig und beide falsch darueber,
// welche Seite der Patient aufmacht: Der Link kam ohne Bild an.
//
// Darum haengt der Test jetzt an der ROUTE. Wer das Ziel in vercel.json
// umbiegt, nimmt die Pruefung mit - und eine Seite ohne Vorschau faellt
// hier auf, nicht erst in einem WhatsApp-Chat.
function zielDerRoute(quelle) {
  const regel = (vercel.rewrites || []).find((r) => r.source === quelle);
  assert.ok(regel, `Die Route ${quelle} gibt es nicht mehr`);
  return regel.destination.replace(/^\//, "");
}

const analizaPfad = zielDerRoute("/analiza/:kennung");
const analiza = readFileSync(join(wurzel, analizaPfad), "utf8");

// Und derselbe Griff fuer den Trichter: Seit der Umstellung liefert
// /lifeskin die kurze Fassung aus. Stuende hier ein fester Pfad, pruefte
// der Test die Vorschau einer Datei, die niemand mehr bekommt - genau der
// Fehler, den es bei /analiza/ schon einmal gab.
const trichterPfad = zielDerRoute("/lifeskin");
const trichter = readFileSync(join(wurzel, trichterPfad), "utf8");

const kopf = (html) => html.slice(0, html.indexOf("</head>"));

function marke(html, eigenschaft) {
  const treffer = kopf(html).match(
    new RegExp(`<meta (?:property|name)="${eigenschaft}" content="([^"]*)"`)
  );
  return treffer ? treffer[1] : "";
}

test("beide Seiten tragen eine Vorschau, und die Bilder gibt es wirklich", () => {
  for (const [name, html] of [[`Trichter (${trichterPfad})`, trichter], ["Befundseite", bericht],
    [`Analyseseite (${analizaPfad})`, analiza]]) {
    for (const pflicht of ["og:title", "og:description", "og:image", "twitter:card"]) {
      assert.ok(marke(html, pflicht), `${name}: ${pflicht} fehlt`);
    }
    // Grosses Bild, nicht die kleine Kachel: Ein 1200x630-Bild ist der
    // Unterschied zwischen einem Link, den man antippt, und einem, den
    // man ueberliest.
    assert.equal(marke(html, "twitter:card"), "summary_large_image",
      `${name}: die Vorschau ist die kleine Kachel`);

    const bild = marke(html, "og:image");
    // WhatsApp, Facebook und Instagram loesen keine relativen Pfade auf.
    assert.match(bild, /^https:\/\//, `${name}: die Bildadresse ist nicht absolut`);
    const pfad = bild.replace(/^https:\/\/[^/]+\//, "");
    assert.ok(existsSync(join(wurzel, pfad)),
      `${name}: das Vorschaubild ${pfad} gibt es nicht - dann kommt gar keins an`);
  }
});

test("die Vorschau der Fallseiten verraet nichts ueber den Patienten", () => {
  for (const [name, html] of [["Befundseite", bericht],
    [`Analyseseite (${analizaPfad})`, analiza]]) {
    datenschutzPruefen(name, html);
  }
});

function datenschutzPruefen(seite, quelle) {
  // DAS IST DER EIGENTLICHE TEST DIESER DATEI.
  //
  // Auf der Seite dahinter stehen Vorname, Fallnummer und Diagnose. In
  // der Vorschau darf davon nichts stehen: Sie landet in Gruppenchats und
  // in den Zwischenspeichern fremder Dienste, und von dort bekommt sie
  // niemand zurueck.
  const kopfteil = kopf(quelle);

  // Nichts, was aus dem Fall kommt, darf hier eingesetzt werden - weder
  // als Platzhalter noch aus einer Funktion.
  assert.ok(!/\{[a-zA-Z]+\}/.test(kopfteil),
    `${seite}: Im Kopf steht ein Platzhalter - dann setzt ihn irgendwann jemand mit echten Daten`);
  for (const wort of ["name", "code", "diagnoz", "befund", "raport", "kennung"]) {
    const treffer = kopfteil.match(new RegExp(`content="[^"]*${wort}[^"]*"`, "i"));
    assert.equal(treffer, null,
      `${seite}: In der Vorschau steht "${wort}": ${treffer && treffer[0]}`);
  }

  // Und die Vorschau ist fuer jeden Fall dieselbe - sie steht fest im
  // Aufbau und wird nicht beim Ausliefern gesetzt.
  assert.ok(!existsSync(join(wurzel, "api/lifeskin.js")),
    "Es gibt wieder eine Funktion, die die Vorschau einsetzt - dann kann sie auch das Falsche einsetzen");

  // KEIN og:url: Jede Analyse hat ihre eigene Adresse. Eine feste wuerde
  // jede geteilte Analyse auf dieselbe Seite zeigen lassen.
  assert.equal(marke(quelle, "og:url"), "",
    `${seite}: Eine feste Adresse schickt jeden geteilten Fall auf dieselbe Seite`);
  assert.ok(!/rel="canonical"/.test(kopfteil), `${seite}: Ein canonical tut dasselbe`);

  // Die Sperre fuer Suchmaschinen bleibt: Die Marke sperrt den Index, die
  // Vorschau ist fuer den Boten. Beides, nicht eins davon.
  assert.match(kopfteil, /name="robots" content="noindex, nofollow"/,
    `${seite}: Die Sperre fuer Suchmaschinen ist weg`);
}

test("der Trichter darf gefunden werden, die Befundseite nicht", () => {
  assert.ok(!/name="robots"/.test(kopf(trichter)),
    "Der Trichter sperrt sich selbst aus - er ist die Seite, die Anzeigen empfaengt");
  assert.match(kopf(trichter), /rel="canonical" href="https:\/\/www\.mnyra\.com\/lifeskin"/,
    "Dem Trichter fehlt die kanonische Adresse");
  assert.ok(marke(trichter, "description"), "Dem Trichter fehlt die Beschreibung fuer die Suche");
});

test("die Vorschau-Boten duerfen die Befundseite holen, Suchmaschinen nicht", () => {
  const robots = readFileSync(join(wurzel, "robots.txt"), "utf8");

  // Die Gruppen der Boten stehen fuer sich: Ein Bot mit eigener Gruppe
  // liest NUR diese. Deshalb muss jede die internen Bereiche wiederholen -
  // sonst reisst die Erlaubnis sie mit auf.
  const gruppen = robots.split(/^User-agent:\s*/m).slice(1)
    .map((teil) => {
      const [kopf, ...rest] = teil.split("\n");
      return { wer: kopf.trim(), regeln: rest.join("\n") };
    });

  const stern = gruppen.find((g) => g.wer === "*");
  assert.ok(stern, "Die allgemeine Gruppe fehlt");
  assert.match(stern.regeln, /Disallow: \/analiza\//,
    "Suchmaschinen duerfen die Befundseiten wieder holen");

  for (const bot of ["facebookexternalhit", "WhatsApp", "Twitterbot", "TelegramBot"]) {
    const g = gruppen.find((x) => x.wer === bot);
    assert.ok(g, `${bot} hat keine eigene Gruppe - dann gilt fuer ihn die Sperre oben`);
    assert.ok(!/Disallow: \/analiza\//.test(g.regeln),
      `${bot} darf die Befundseite nicht holen - dann kommt der Link ohne Vorschau an`);
    // Und die internen Bereiche bleiben auch fuer ihn zu.
    for (const zu of ["/hub/", "/heart/", "/api/"]) {
      assert.ok(g.regeln.includes(`Disallow: ${zu}`),
        `${bot} darf ${zu} holen - die Erlaubnis hat zu viel aufgerissen`);
    }
  }
});
