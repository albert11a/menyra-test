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
const trichter = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
const bericht = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");

const kopf = (html) => html.slice(0, html.indexOf("</head>"));

function marke(html, eigenschaft) {
  const treffer = kopf(html).match(
    new RegExp(`<meta (?:property|name)="${eigenschaft}" content="([^"]*)"`)
  );
  return treffer ? treffer[1] : "";
}

test("beide Seiten tragen eine Vorschau, und die Bilder gibt es wirklich", () => {
  for (const [name, html] of [["Trichter", trichter], ["Befundseite", bericht]]) {
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

test("die Vorschau der Befundseite verraet nichts ueber den Patienten", () => {
  // DAS IST DER EIGENTLICHE TEST DIESER DATEI.
  //
  // Auf der Seite dahinter stehen Vorname, Fallnummer und Diagnose. In
  // der Vorschau darf davon nichts stehen: Sie landet in Gruppenchats und
  // in den Zwischenspeichern fremder Dienste, und von dort bekommt sie
  // niemand zurueck.
  const kopfteil = kopf(bericht);

  // Nichts, was aus dem Fall kommt, darf hier eingesetzt werden - weder
  // als Platzhalter noch aus einer Funktion.
  assert.ok(!/\{[a-zA-Z]+\}/.test(kopfteil),
    "Im Kopf steht ein Platzhalter - dann setzt ihn irgendwann jemand mit echten Daten");
  for (const wort of ["name", "code", "diagnoz", "befund", "raport", "kennung"]) {
    const treffer = kopfteil.match(new RegExp(`content="[^"]*${wort}[^"]*"`, "i"));
    assert.equal(treffer, null,
      `In der Vorschau steht "${wort}": ${treffer && treffer[0]}`);
  }

  // Und die Vorschau ist fuer jeden Fall dieselbe - sie steht fest im
  // Aufbau und wird nicht beim Ausliefern gesetzt.
  assert.ok(!existsSync(join(wurzel, "api/lifeskin.js")),
    "Es gibt wieder eine Funktion, die die Vorschau einsetzt - dann kann sie auch das Falsche einsetzen");

  // KEIN og:url: Jede Analyse hat ihre eigene Adresse. Eine feste wuerde
  // jede geteilte Analyse auf dieselbe Seite zeigen lassen.
  assert.equal(marke(bericht, "og:url"), "",
    "Eine feste Adresse schickt jeden geteilten Fall auf dieselbe Seite");
  assert.ok(!/rel="canonical"/.test(kopfteil), "Ein canonical tut dasselbe");

  // Die Sperre fuer Suchmaschinen bleibt: Die Marke sperrt den Index, die
  // Vorschau ist fuer den Boten. Beides, nicht eins davon.
  assert.match(kopfteil, /name="robots" content="noindex, nofollow"/,
    "Die Sperre fuer Suchmaschinen ist weg");
});

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
