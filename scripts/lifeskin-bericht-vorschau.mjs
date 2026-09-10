// Die Befundseite als ueberpruefbare Vorschau - ohne Firestore und ohne
// eine einzige echte Bestellung.
//
// Warum es das gibt: Die Seite unter /analiza/<kennung> laedt ihren Fall
// aus Firestore. Wer eine Aenderung ansehen will, braucht sonst einen
// echten Fall, echte Produkte und ein Konto dafuer. Hier wird stattdessen
// dieselbe Klasse mit einem Beispielfall gestartet, der aus dem
// dokumentierten Schema kommt (docs/lifeskin-raport-schema.md) - also aus
// derselben Quelle wie der E2E-Test.
//
//   node scripts/lifeskin-bericht-vorschau.mjs            (Aufnahmen)
//   node scripts/lifeskin-bericht-vorschau.mjs --server   (Server, zum Ansehen)
//
// Aufnahmen landen in --out (Vorgabe: .vorschau/). Der Serverbetrieb
// stellt die Seite unter http://127.0.0.1:5199/ bereit; jede Breite laesst
// sich dort im Browser pruefen.

import { createServer } from "node:http";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

const argumente = process.argv.slice(2);
const nurServer = argumente.includes("--server");
const ausgabe = (() => {
  const stelle = argumente.indexOf("--out");
  return stelle >= 0 && argumente[stelle + 1] ? argumente[stelle + 1] : join(wurzel, ".vorschau");
})();
// Mit --lang de liest die Vorschau denselben Fall auf Deutsch. Die Seite
// traegt beide Sprachen; geprueft werden muessen beide.
const lang = (() => {
  const stelle = argumente.indexOf("--lang");
  return stelle >= 0 && argumente[stelle + 1] === "de" ? "de" : "sq";
})();

// Der Beispielfall kommt aus dem Schema, nicht aus dieser Datei: So kann
// die Vorschau nicht schoener sein als das, was Dr. Gashi wirklich
// freigibt.
const { raportLesen } = await import(join(wurzel, "shared/lifeskin-analyse.js"));
const raport = raportLesen((() => {
  const md = readFileSync(join(wurzel, "docs/lifeskin-raport-schema.md"), "utf8");
  const roh = md.slice(md.indexOf("```json") + 7);
  return roh.slice(0, roh.indexOf("```"));
})());

function fsWert(x) {
  if (x === null || x === undefined) return { nullValue: null };
  if (Array.isArray(x)) return { arrayValue: { values: x.map(fsWert) } };
  if (typeof x === "object") {
    return { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, v]) => [k, fsWert(v)])) } };
  }
  if (typeof x === "boolean") return { booleanValue: x };
  if (typeof x === "number") return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x };
  return { stringValue: String(x) };
}

// Zwei Mittel - das ist der Fall, der wirklich verkauft wird.
const PRODUKTE = {
  "lifeskin-akne": {
    fields: {
      name: { stringValue: "LF ACNE" },
      inhalt: { stringValue: "30 ml" },
      einzelpreis: { integerValue: "33" },
      lloji: { stringValue: "gel" },
      nenName: fsWert({ sq: "Gel për lëkurë me akne", de: "Gel für Aknehaut" }),
      veprimi: fsWert({
        sq: [
          "Hap folikulin e bllokuar dhe largon qelizat e vdekura nga sipërfaqja",
          "Ul bakterin që ushqen inflamacionin në poret e bllokuara",
          "Qetëson skuqjen pa e tharë barrierën mbrojtëse të lëkurës"
        ],
        de: []
      }),
      perberesit: fsWert([
        { emri: "Acid salicilik", sasia: "2%", roli: { sq: "Pastron brendinë e porit", de: "" } },
        { emri: "Niacinamid", sasia: "4%", roli: { sq: "Ul skuqjen dhe yndyrën", de: "" } },
        { emri: "Zink PCA", sasia: "1%", roli: { sq: "Qetëson sipërfaqen", de: "" } }
      ]),
      perdorimi: fsWert({
        hapi: 1,
        koha: { sq: "vetëm në mbrëmje", de: "" },
        sasia: { sq: "sa një bizele", de: "" },
        si: { sq: "Pas larjes, në lëkurë të thatë. Shpërndajeni në ballë, hundë dhe mjekër dhe lëreni të thahet para hapit tjetër.", de: "" },
        kujdes: { sq: "Mos e përdorni në të njëjtin moment me acide të tjera ose retinol.", de: "" }
      }),
      synimi: fsWert({ sq: "Sipërfaqja në ballë bëhet më e njëtrajtshme dhe puçrrat e vogla dalin më rrallë.", de: "" })
    }
  },
  "lifeskin-barriere": {
    fields: {
      name: { stringValue: "LF BARRIER REPAIR CREAM" },
      inhalt: { stringValue: "50 ml" },
      einzelpreis: { integerValue: "29" },
      lloji: { stringValue: "krem" },
      veprimi: fsWert({
        sq: [
          "Rikthen shtresën mbrojtëse që trajtimi kundër akneve e ngarkon çdo natë",
          "Mban ujin në lëkurë dhe zvogëlon tharjen e pritshme në javët e para"
        ],
        de: []
      }),
      perdorimi: fsWert({
        hapi: 2,
        koha: { sq: "mëngjes dhe mbrëmje", de: "" },
        sasia: { sq: "një shtresë e hollë", de: "" },
        si: { sq: "Pas gelit, kur ai është tharë plotësisht.", de: "" },
        kujdes: { sq: "", de: "" }
      })
    }
  }
};

// Mit --stress derselbe Aufbau, aber am oberen Ende dessen, was aus einer
// Analyse kommen kann: ein sehr langer Produktname, sehr lange Saetze und
// DREI Mittel statt zwei.
//
// Die Seite darf nicht fuer genau zwei Mittel und genau diese Satzlaengen
// gebaut sein - ein Entwurf, der nur mit dem Beispiel funktioniert, ist
// kein Entwurf.
const stress = argumente.includes("--stress");

if (stress) {
  PRODUKTE["lifeskin-akne"].fields.name = {
    stringValue: "LF ACNE INTENSIVE CLARIFYING NIGHT TREATMENT GEL"
  };
  PRODUKTE["lifeskin-serum"] = {
    fields: {
      name: { stringValue: "LF PIGMENT CORRECTOR SERUM" },
      inhalt: { stringValue: "15 ml" },
      einzelpreis: { integerValue: "27" },
      lloji: { stringValue: "serum" },
      veprimi: fsWert({
        sq: [
          "Ndihmon zbehjen e njollave të errëta që kanë mbetur pas inflamacioneve të mëparshme në faqe dhe në vijën e nofullës",
          "Ngadalëson formimin e pigmentit të ri gjatë ekspozimit të përditshëm ndaj dritës"
        ],
        de: []
      })
    }
  };
}

const LANGER_SATZ = "Te ju, poret e bllokuara në ballë janë gjetja më e fortë, "
  + "dhe pikërisht aty sipërfaqja është më e pabarabartë; ky gel punon në atë zonë "
  + "çdo mbrëmje, ndërsa gjatë ditës lëkura mbetet e qetë dhe pa shkëlqim të tepërt "
  + "edhe kur jeni jashtë për një kohë të gjatë.";

const BERICHT = {
  fields: {
    createdAt: { stringValue: "2026-09-05T18:14:00.000Z" },
    freigabeAt: { stringValue: "2026-09-06T08:20:00.000Z" },
    code: { stringValue: "LS-0509-K7M2P" },
    name: { stringValue: stress ? "Arlinda-Marie" : "Arlinda" },
    sprache: { stringValue: lang === "de" ? "de" : "sq" },
    status: { stringValue: "fertig" },
    photos: { integerValue: "3" },
    // Die Abtastfeinheit aus der Aufnahme. Der Trichter schreibt sie in
    // jeden echten Fall; ohne sie faellt der Messabsatz im Aufklapper weg
    // und die Vorschau zeigte eine Seite, die es so nicht gibt.
    mmJeBildpunkt: { doubleValue: 0.12 },
    preis: { integerValue: stress ? "71" : "53" },
    befund: { stringValue: String(raport.gjetjet) },
    raport: fsWert(raport),
    produkte: {
      arrayValue: {
        values: [
          { mapValue: { fields: { id: { stringValue: "lifeskin-akne" },
            satz: { stringValue: stress ? LANGER_SATZ
              : "Te ju, poret e bllokuara në ballë janë gjetja më e fortë. Ky gel punon pikërisht aty, çdo mbrëmje." } } } },
          { mapValue: { fields: { id: { stringValue: "lifeskin-barriere" },
            satz: { stringValue: "Sepse gjatë 28 ditëve lëkura juaj do të ngarkohet nga trajtimi, kjo kremë mban shtresën mbrojtëse në rregull." } } } },
          ...(stress ? [{ mapValue: { fields: { id: { stringValue: "lifeskin-serum" },
            satz: { stringValue: "Gjurmët e zbehta në faqe janë gjetja juaj e dytë; ky serum punon vetëm mbi to." } } } }] : [])
        ]
      }
    }
  }
};

const TYPEN = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8"
};

// Die Seite selbst liegt unveraendert im Baum. Der Server liefert sie aus
// und faengt nur die Firestore-Adressen ab.
const server = createServer((anfrage, antwort) => {
  const pfad = decodeURIComponent(new URL(anfrage.url, "http://x").pathname);
  if (pfad === "/" || pfad === "/analiza" || pfad.startsWith("/analiza/")) {
    // VOR dem Modul der Seite, und als gewoehnliches Skript: Ein Modul
    // liefe erst nach bericht.js, und bericht.js startet sofort - dann
    // waere der Fall schon von Firestore geholt worden, bevor die
    // Umleitung steht.
    const stelle = '<script type="module" src="/apps/lifeskin-bericht/bericht.js"></script>';
    const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8")
      .replace(stelle, `<script>
        (function () {
          var daten = ${JSON.stringify({ bericht: BERICHT, produkte: PRODUKTE })};
          var echt = window.fetch;
          window.fetch = function (adresse, wahl) {
            var text = String(adresse && adresse.url ? adresse.url : adresse);
            if (text.indexOf("firestore.googleapis.com") < 0) return echt(adresse, wahl);
            if (wahl && wahl.method === "PATCH") return Promise.resolve(new Response("{}", { status: 200 }));
            var treffer = text.match(/\\/products\\/([^?/]+)/);
            var antwort = treffer
              ? (daten.produkte[decodeURIComponent(treffer[1])] || { fields: {} })
              : daten.bericht;
            return Promise.resolve(new Response(JSON.stringify(antwort),
              { status: 200, headers: { "content-type": "application/json" } }));
          };
        }());
      </script>\n${stelle}`);
    antwort.writeHead(200, { "content-type": TYPEN[".html"] });
    antwort.end(html);
    return;
  }
  const datei = join(wurzel, pfad.replace(/^\/+/, ""));
  if (!datei.startsWith(wurzel) || !existsSync(datei)) {
    antwort.writeHead(404); antwort.end("nicht gefunden"); return;
  }
  antwort.writeHead(200, { "content-type": TYPEN[extname(datei)] || "application/octet-stream" });
  antwort.end(readFileSync(datei));
});

const HAFEN = 5199;
await new Promise((fertig) => server.listen(HAFEN, "127.0.0.1", fertig));
const adresse = `http://127.0.0.1:${HAFEN}/analiza/aabbccdd11223344`;

if (nurServer) {
  globalThis.console.log(`[vorschau] ${adresse}`);
} else {
  const { chromium } = await import("@playwright/test");
  mkdirSync(ausgabe, { recursive: true });
  // Wenn im Bild ein fertiger Chromium liegt (PLAYWRIGHT_CHROMIUM), wird
  // der genommen. Sonst der, den Playwright selbst mitbringt.
  const eigener = process.env.PLAYWRIGHT_CHROMIUM || "";
  const browser = await chromium.launch(eigener ? { executablePath: eigener } : {});
  // Die Breiten, auf denen der Verkehr wirklich ankommt - und der
  // Schreibtisch als Gegenprobe.
  const breiten = [[375, 812], [390, 844], [430, 932], [1280, 900]];
  for (const [breite, hoehe] of breiten) {
    const seite = await browser.newPage({ viewport: { width: breite, height: hoehe },
      deviceScaleFactor: 2 });
    await seite.goto(adresse);
    await seite.waitForSelector("#lb-fertig[data-aktiv='ja']", { timeout: 15000 });
    await seite.waitForTimeout(600);
    const name = `${breite}`;
    // Der ganze Bericht am Stueck: nicht das Fenster, sondern die Rolle.
    await seite.evaluate(() => {
      const rolle = document.querySelector("#lb-rolle");
      if (rolle) rolle.scrollTop = 0;
    });
    await seite.screenshot({ path: join(ausgabe, `${name}-01-oben.png`) });
    // Und drei weitere Blicke: Therapie, Angebot, Fuss.
    for (const [nummer, wahl] of [["02", "#lb-produkte"], ["03", "#lb-oferta, .lb-preis"], ["04", "#lb-pyetjeteil"]]) {
      const ziel = await seite.$(wahl.split(",")[0].trim()) || await seite.$(wahl.split(",").pop().trim());
      if (!ziel) continue;
      await ziel.scrollIntoViewIfNeeded();
      await seite.waitForTimeout(500);
      await seite.screenshot({ path: join(ausgabe, `${name}-${nummer}.png`) });
    }
    await seite.close();
    globalThis.console.log(`[vorschau] ${breite}px aufgenommen`);
  }
  await browser.close();
  server.close();
  globalThis.console.log(`[vorschau] Aufnahmen in ${ausgabe}`);
}
