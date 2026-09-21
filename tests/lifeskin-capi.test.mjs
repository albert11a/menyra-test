// Die Conversions API - was das Haus verlaesst.
//
// Der Browser-Pixel verliert 20 bis 40 Prozent der Bestellungen an iOS,
// Werbeblocker und Tracking-Schutz. Die Function meldet dieselbe
// Bestellung noch einmal vom Server, und Meta legt die zwei zusammen -
// wenn sie dieselbe eventID tragen.
//
// Zwei Dinge koennen hier schiefgehen, und beide still:
//
//   1. Die eventID stimmt nicht mit der aus dem Browser ueberein. Dann
//      zaehlt Meta DOPPELT, und der gemessene Umsatz waere das Doppelte
//      des wirklichen - eine Zahl, die nach Erfolg aussieht.
//   2. Es geht etwas mit, was nicht mitgehen darf. Fuer diese Seite
//      gilt, dass weder Aufnahmen noch Antworten noch Telefonnummern in
//      die Messtechnik gehen - auch nicht gehasht.
//
// Beides steht hier.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (pfad) => readFileSync(join(wurzel, pfad), "utf8");
const require = createRequire(import.meta.url);
const capi = require("../functions/lifeskin-capi-payload.js");

// Eine Sitzung, wie sie wirklich in Firestore steht - mit allem, was
// jemand beim Bestellen eingibt.
function sitzungMitAllem(zusatz = {}) {
  return {
    step: "ordered",
    name: "Arta Berisha",
    phone: "044111222",
    address: { name: "Arta Berisha", telefon: "044111222", strasse: "Rruga B 12", ort: "Prishtinë" },
    anamnese: { shqetesimi: "akne", mosha: "25-34" },
    problemi: "Kam probleme me aknet prej tre vjetesh",
    pyetja: "A mund ta perdor gjate shtatzanise?",
    findings: ["akne_inflamatore"],
    order: {
      kind: "shop",
      createdAt: new Date().toISOString(),
      total: 99,
      payment: "nachnahme",
      orderId: "LS-2109-ABCDE",
      items: [{ id: "lf-acne", name: "LF ACNE", cmimi: 33, sasia: 3 }],
      fbp: "fb.1.1700000000000.1234567890",
      ...zusatz
    }
  };
}

// ══ WAS NICHT MITGEHT ════════════════════════════════════════════════
//
// Der wichtigste Test dieser Datei. Er nimmt eine Sitzung, in der alles
// steht, was ein Mensch eingibt, und prueft die fertige Nutzlast Wort
// fuer Wort dagegen.
test("keine Nummer, kein Name, keine Anschrift, keine Antwort geht an Meta", () => {
  const nutzlast = capi.baueKauf(sitzungMitAllem());
  const alles = JSON.stringify(nutzlast);

  for (const heikel of [
    "Arta", "Berisha", "044111222", "Rruga", "Prishtin",
    "akne_inflamatore", "shtatzanise", "tre vjetesh", "25-34"
  ]) {
    assert.ok(!alles.includes(heikel),
      `"${heikel}" steht in der Meldung an Meta - das darf es nicht`);
  }

  // Und positiv: Was mitgeht, ist genau diese Liste und nichts sonst.
  assert.deepEqual(Object.keys(nutzlast).sort(), [
    "action_source", "custom_data", "event_id", "event_name",
    "event_source_url", "event_time", "user_data"
  ]);
  assert.deepEqual(Object.keys(nutzlast.user_data), ["fbp"]);
  assert.deepEqual(Object.keys(nutzlast.custom_data).sort(),
    ["content_type", "currency", "order_id", "value"]);
});

test("nur Metas eigene Kennungen stehen in user_data", () => {
  assert.deepEqual(capi.besucherDaten({ fbp: "fb.1.2.3", fbc: "fb.1.9.abc" }),
    { fbp: "fb.1.2.3", fbc: "fb.1.9.abc" });
  // Was sonst in der Bestellung steht, hat hier nichts zu suchen - auch
  // wenn es jemand spaeter dazuschreibt.
  assert.deepEqual(capi.besucherDaten({
    fbp: "fb.1.2.3", telefon: "044", email: "a@b.c", name: "Arta", ph: "hash"
  }), { fbp: "fb.1.2.3" });
  // Ein blockierter Pixel hat kein _fbp. Gemeldet wird trotzdem: Ein
  // Kauf ohne Zuordnung ist besser als kein Kauf.
  assert.deepEqual(capi.besucherDaten({}), {});
});

// ══ DIE KENNUNG GEGEN DIE DOPPELZAEHLUNG ═════════════════════════════
//
// event_id MUSS dieselbe sein wie die eventID, die der Browser an
// Purchase haengt - sonst sind es fuer Meta zwei Kaeufe.
test("die eventID ist dieselbe wie im Browser", () => {
  const nutzlast = capi.baueKauf(sitzungMitAllem());
  assert.equal(nutzlast.event_id, "LS-2109-ABCDE");
  assert.equal(nutzlast.custom_data.order_id, "LS-2109-ABCDE");

  // Im Browser haengt sie an derselben Stelle. Laufen die zwei
  // auseinander, zaehlt Meta doppelt - und der gemessene Umsatz waere
  // das Doppelte des wirklichen.
  const pixel = lies("apps/lifeskin/lifeskin-pixel.js");
  assert.match(pixel, /const nummer = zusatz\?\.order\?\.orderId;/,
    "Der Browser nimmt die eventID nicht mehr aus order.orderId");
  assert.match(pixel, /eventID: kennung/, "Der Browser haengt keine eventID mehr an");

  const ohne = capi.baueKauf({ step: "ordered", order: { total: 53 } });
  assert.equal(ohne.event_id, "",
    "Ohne Bestellnummer muss die Kennung leer sein - die Funktion meldet dann gar nicht");
});

// ══ WANN GEMELDET WIRD UND WANN NICHT ════════════════════════════════
test("gemeldet wird der Uebergang, nicht der Zustand", () => {
  const order = { total: 53, orderId: "LS-1" };
  assert.equal(capi.istKauf({ step: "address" }, { step: "ordered", order }), true);
  assert.equal(capi.istKauf({}, { step: "ordered", order }), true,
    "Eine Sitzung, die in einem Zug bis zur Bestellung geschrieben wird, faellt aus");
  // Der Trichter schreibt auch NACH der Bestellung weiter. Ohne diesen
  // Vergleich kaeme bei jedem dieser Schreibvorgaenge ein neuer Kauf.
  assert.equal(capi.istKauf({ step: "ordered", order }, { step: "ordered", order }), false);
  assert.equal(capi.istKauf({ step: "opened" }, { step: "offer" }), false);
  // Ein "ordered" ohne Bestellung waere ein Kauf ohne Inhalt.
  assert.equal(capi.istKauf({ step: "opened" }, { step: "ordered" }), false);
});

// ══ DER ZEITSTEMPEL ══════════════════════════════════════════════════
//
// Meta rechnet in Sekunden und verwirft alles, was aelter als sieben
// Tage ist. Ein unlesbares Datum wird zu "jetzt": Lieber ein Ereignis
// mit einem Zeitpunkt, der danebenliegt, als gar keines.
test("der Zeitstempel ist in Sekunden und nie zu alt", () => {
  const jetzt = Math.floor(Date.now() / 1000);
  const vorEinerStunde = new Date(Date.now() - 3600 * 1000).toISOString();
  assert.equal(capi.sekundenAus(vorEinerStunde), jetzt - 3600);

  // Sekunden, nicht Millisekunden - sonst liegt das Ereignis im Jahr
  // 58000 und Meta verwirft es.
  assert.ok(capi.sekundenAus(new Date().toISOString()) < 1e11);

  for (const kaputt of ["", null, undefined, "gestern", "2020-01-01T00:00:00Z"]) {
    const s = capi.sekundenAus(kaputt);
    assert.ok(Math.abs(s - jetzt) <= 2, `${kaputt} ergibt einen Zeitpunkt, den Meta verwirft`);
  }
});

// ══ DER BROWSER LEGT DIE KENNUNGEN AN DIE RICHTIGE STELLE ════════════
//
// firestore.rules laesst in einer Sitzung nur eine feste Feldliste zu
// (hasOnly) - ein unbekanntes Feld weist das GANZE Dokument ab, und die
// Bestellung waere still verloren. "order" ist als freie Karte erlaubt.
test("fbp und fbc liegen in der Karte order und nicht daneben", () => {
  const regeln = lies("firestore.rules");
  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  const hasOnly = regeln.indexOf("hasOnly([", anfang);
  const erlaubt = new Set(
    regeln.slice(hasOnly, regeln.indexOf("])", hasOnly))
      .match(/"[a-zA-Z]+"/g).map((w) => w.slice(1, -1))
  );
  assert.ok(!erlaubt.has("fbp") && !erlaubt.has("fbc"),
    "fbp/fbc stehen jetzt in der Feldliste - dann gehoeren sie auch dorthin geschrieben");

  for (const datei of ["apps/lifeskin-landing/shop.js", "apps/lifeskin-astra/astra.js"]) {
    const quelle = lies(datei);
    assert.match(quelle, /order: \{[\s\S]{0,900}\.\.\.pixelKennungen\(\)/,
      `${datei} legt die Kennungen nicht in order`);
  }
});

// Und die Cookies werden gelesen, wie Meta sie schreibt.
test("pixelKennungen liest _fbp und _fbc aus den Keksen", async () => {
  const { pixelKennungen } = await import("../apps/lifeskin/lifeskin-pixel.js");
  assert.deepEqual(pixelKennungen("_fbp=fb.1.7.8; _fbc=fb.1.9.abc"),
    { fbp: "fb.1.7.8", fbc: "fb.1.9.abc" });
  // Ein Name, der auf _fbp endet, ist nicht _fbp.
  assert.deepEqual(pixelKennungen("nicht_fbp=x"), {});
  assert.deepEqual(pixelKennungen("a=1; _fbp=fb.1.2.3; b=2"), { fbp: "fb.1.2.3" });
  assert.deepEqual(pixelKennungen(""), {});
  assert.deepEqual(pixelKennungen(undefined), {});
});

// ══ DIE MARKE GEGEN DAS ZWEITE SENDEN ════════════════════════════════
//
// Sie darf NICHT in der Sitzung liegen: firestore.rules prueft die
// Sitzung mit hasOnly gegen eine feste Feldliste. Ein Feld, das der
// Server dazuschreibt, stuende beim naechsten Schreibvorgang des
// Browsers mit im Dokument - und die Regel wiese ihn ab. Der Trichter
// waere ab da stumm, und niemand wuesste, warum.
test("die Marke liegt in einer eigenen Sammlung, nicht in der Sitzung", () => {
  const quelle = lies("functions/lifeskin-capi.js");
  assert.match(quelle, /collection\("capiEvents"\)/,
    "Die Marke liegt nicht mehr in einer eigenen Sammlung");
  assert.match(quelle, /\.create\(\{/,
    "Die Marke wird nicht mit create() geschrieben - dann sperrt sie nicht gegen zwei Ausloeser");
  // Und die Sitzung selbst wird von der Function nie geschrieben.
  assert.ok(!/collection\("sessions"\)[\s\S]{0,200}\.(set|update)\(/.test(quelle),
    "Die Function schreibt in die Sitzung - das bricht die Regel beim naechsten Browser-Schreibvorgang");

  // Und fuer Clients ist die Sammlung gesperrt: firestore.rules endet
  // mit einer Regel, die alles Uebrige verbietet.
  const regeln = lies("firestore.rules");
  assert.match(regeln, /match \/\{document=\*\*\} \{\s*allow read, write: if false;/,
    "Die Auffangregel erlaubt wieder etwas - capiEvents waere dann offen");
});

// ══ OHNE TOKEN PASSIERT NICHTS ═══════════════════════════════════════
//
// Dieselbe Regel wie beim Pixel im Browser: keine Kennung, keine
// Meldung. Solange das Secret nicht gesetzt ist, ist das der gewollte
// Zustand und kein Fehler.
test("ohne Secret meldet die Function nichts und wirft nicht", () => {
  const quelle = lies("functions/lifeskin-capi.js");
  assert.match(quelle, /secrets: \["META_CAPI_TOKEN"\]/,
    "Das Secret ist nicht mehr an die Function gebunden");
  assert.match(quelle, /if \(!token\) \{[\s\S]{0,400}reason: "no_token"[\s\S]{0,80}return;/,
    "Ohne Token laeuft die Function weiter, statt still aufzuhoeren");
  // Sie darf den Verkauf nie anhalten: Der Fehler wird notiert, nicht geworfen.
  const fang = quelle.slice(quelle.lastIndexOf("} catch (error) {"));
  assert.ok(!/throw/.test(fang),
    "Die Function wirft wieder - ein Fehler in der Messung kostet dann einen Eintrag im Protokoll und Aufmerksamkeit");
});

test("die Function haengt an denselben Sitzungen wie der Trichter", () => {
  const quelle = lies("functions/lifeskin-capi.js");
  assert.match(quelle, /\.document\("lifeskin\/\{tenantId\}\/sessions\/\{sessionId\}"\)/);
  assert.match(quelle, /\.onWrite\(/,
    "onCreate statt onWrite - die Sitzung entsteht mit step opened, nicht mit der Bestellung");
  // Und sie ist eine EIGENE Funktion, nicht in die Meldung an Dr. Gashi
  // hineingebaut: Eine ausgefallene Messung darf die Benachrichtigung
  // nicht mitreissen.
  assert.match(lies("functions/index.js"), /require\("\.\/lifeskin-capi"\)/,
    "Die Function ist nicht eingehaengt - sie wird nie ausgespielt");
  assert.ok(!/lifeskinCapi/.test(lies("functions/index.js").slice(0,
    lies("functions/index.js").indexOf('require("./lifeskin-capi")'))),
    "Die Messung steht in der Benachrichtigungsfunktion");
});

// Die Nummer des Datensatzes steht an zwei Stellen - im Browser und auf
// dem Server. Laufen sie auseinander, meldet der Server in ein fremdes
// Konto, und im eigenen fehlt die Haelfte der Kaeufe.
test("Browser und Server meinen denselben Datensatz", async () => {
  const { LIFESKIN_PIXEL_ID } = await import("../apps/lifeskin/lifeskin-config.js");
  assert.equal(capi.PIXEL_ID, LIFESKIN_PIXEL_ID,
    "Der Server meldet an einen anderen Datensatz als der Browser");
});
