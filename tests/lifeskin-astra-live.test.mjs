// Die Hauptanalyse unter /analiza/<kennung>.
//
// Seit dem 11.09.2026 traegt die Astra-Gestaltung die echten Befunde; die
// fruehere Gestaltung ist als Vorlage unter /analysetemplateastra
// aufbewahrt. Was hier geprueft wird, ist genau das, was bei diesem
// Tausch still kaputtgehen kann:
//
//   - Zeigt die Live-Seite noch Demo-Text oder Demo-Verhalten?
//   - Schreibt sie die Anschrift dorthin, wo sie niemand lesen darf?
//   - Fehlt ein Platz im Aufbau fuer etwas, das der Ablauf beschreibt?
//   - Zeigen die beiden Adressen noch auf die Anwendungen, die sie sollen?

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Die beiden Helfer des Projekts - sie gibt es, weil hier schon zweimal
// dieselben zwei Fehler passiert sind: ein Ausschnitt, der bis zum
// Dateiende laeuft, weil die Endmarke nicht gefunden wurde, und eine
// Suche, die auf einem Kommentar anschlaegt statt auf Code.
import { ohneKommentare, methode } from "./lifeskin-quelle.mjs";

import { AnalyseDaten, kennungAusPfad, sprachtext, dokument } from "../apps/lifeskin-astra/astra-daten.js";
import { TEXTE as ASTRA_TEXTE } from "../apps/lifeskin-astra/astra-texte.js";
import { TEXTE as VORLAGE_TEXTE } from "../apps/lifeskin-bericht/bericht-texte.js";

globalThis.__LIFESKIN_TEST__ = true;
const { tageszeiten, wartetext } = await import("../apps/lifeskin-astra/astra.js");
const { istTestpfad, istVorlagepfad, istMusterpfad } = await import("../apps/lifeskin-bericht/bericht.js");

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const ASTRA_JS = lies("apps/lifeskin-astra/astra.js");
const ASTRA_HTML = lies("apps/lifeskin-astra/index.html");
const ASTRA_CSS = lies("apps/lifeskin-astra/astra.css");
const VERCEL = JSON.parse(lies("vercel.json"));
const DEV_SERVER = lies("scripts/local-dev-server.mjs");

// Firestore verpackt jeden Wert in seinen Typ.
function fs_(x) {
  if (x === null || x === undefined) return { nullValue: null };
  if (Array.isArray(x)) return { arrayValue: { values: x.map(fs_) } };
  if (typeof x === "object") {
    return { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, v]) => [k, fs_(v)])) } };
  }
  if (typeof x === "boolean") return { booleanValue: x };
  if (typeof x === "number") return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x };
  return { stringValue: String(x) };
}
const alsDokument = (obj) => ({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fs_(v)])) });

function antwort(koerper, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(koerper) });
}

// Ein fetch, das mitschreibt statt hinauszugehen.
function mitschrift(antworten = {}) {
  const rufe = [];
  const fetchFn = (adresse, wahl = {}) => {
    const text = String(adresse);
    rufe.push({ adresse: text, methode: wahl.method || "GET", koerper: wahl.body });
    for (const [muster, wert] of Object.entries(antworten)) {
      if (text.includes(muster)) return antwort(wert);
    }
    return antwort({ fields: {} });
  };
  return { rufe, fetchFn };
}

// ---------------------------------------------------------------------------
// Die Kennung
// ---------------------------------------------------------------------------

test("die Kennung kommt nur aus Hexadezimalziffern", () => {
  // Ein weiteres Muster schickt Tippfehler und Versuche an Firestore.
  assert.equal(kennungAusPfad("/analiza/aabbccdd11223344"), "aabbccdd11223344");
  assert.equal(kennungAusPfad("/analiza/AABBCCDD"), "", "Grossbuchstaben sind keine Kennung");
  assert.equal(kennungAusPfad("/analiza/LS-TEST-0000"), "", "Buchstaben und Striche sind keine Kennung");
  assert.equal(kennungAusPfad("/analiza/"), "");
  assert.equal(kennungAusPfad("/analysetemplateastra"), "",
    "Auf der Vorlagenadresse darf keine Kennung entstehen");
});

// ---------------------------------------------------------------------------
// Der Befund
// ---------------------------------------------------------------------------

test("der Befund wird aus den Firestore-Typen ausgepackt", async () => {
  const { fetchFn } = mitschrift({
    "/reports/": alsDokument({
      code: "LS-2026-0007",
      name: "Arta",
      status: "fertig",
      preis: 53,
      photos: 3,
      raport: { niveli: 2, diagnoza: "Akne e lehtë", zonaLista: [{ zona: "Balli", teksti: "Pore" }] }
    })
  });
  const daten = await new AnalyseDaten({ fetchFn, kennung: "aabbccdd" }).bericht();
  assert.equal(daten.code, "LS-2026-0007");
  assert.equal(daten.preis, 53, "integerValue muss eine Zahl werden, kein Text");
  assert.equal(daten.raport.niveli, 2);
  assert.deepEqual(daten.raport.zonaLista, [{ zona: "Balli", teksti: "Pore" }]);
});

test("ein Befund, den es nicht gibt, ist null und keine halbe Seite", async () => {
  const stille = new AnalyseDaten({ fetchFn: () => antwort({}, false), kennung: "aabbccdd" });
  assert.equal(await stille.bericht(), null);

  const kaputt = new AnalyseDaten({ fetchFn: () => Promise.reject(new Error("Netz weg")), kennung: "aabbccdd" });
  assert.equal(await kaputt.bericht(), null, "Ein Netzfehler darf die Seite nicht werfen lassen");

  const ohne = new AnalyseDaten({ fetchFn: () => antwort(alsDokument({})), kennung: "" });
  assert.equal(await ohne.bericht(), null, "Ohne Kennung wird gar nicht erst gefragt");
});

// ---------------------------------------------------------------------------
// Die Mittel
// ---------------------------------------------------------------------------

test("was im Befund steht, schlaegt den Katalog", async () => {
  // Sonst schreibt eine spaetere Aenderung am Produkt einen Befund um, der
  // laengst beim Patienten liegt.
  const { fetchFn } = mitschrift({
    "/products/lf-acne": alsDokument({
      name: "LF ACNE",
      inhalt: "30 ml",
      einzelpreis: 33,
      lloji: "Gel",
      nenName: { sq: "Gel për lëkurë me akne", de: "Gel für Aknehaut" },
      kurztext: { sq: "Katalogsatz", de: "" },
      veprimi: { sq: ["Katalogzeile"], de: [] },
      perdorimi: { hapi: 1, koha: { sq: "vetëm në mbrëmje" }, si: { sq: "Pas larjes." }, sasia: { sq: "" }, kujdes: { sq: "" } },
      synimi: { sq: "Sipërfaqja bëhet më e njëtrajtshme.", de: "" }
    })
  });
  const quelle = new AnalyseDaten({ fetchFn, kennung: "aabbccdd" });
  const [p] = await quelle.produkte({
    produkte: [{ id: "lf-acne", satz: "Te ju, poret janë gjetja më e fortë.", veprimi: ["Befundzeile"] }]
  }, "sq");

  assert.equal(p.satz, "Te ju, poret janë gjetja më e fortë.", "Der persoenliche Satz gewinnt");
  assert.deepEqual(p.veprimi, ["Befundzeile"], "Die freigegebenen Wirkungszeilen gewinnen");
  assert.equal(p.nenName, "Gel për lëkurë me akne");
  assert.equal(p.einzelpreis, 33);
  assert.equal(p.perdorimi.koha, "vetëm në mbrëmje");
});

test("ohne eigene Angaben im Befund traegt der Katalog", async () => {
  const { fetchFn } = mitschrift({
    "/products/lf-clean": alsDokument({
      name: "LF CLEAN",
      kurztext: { sq: "Katalogsatz", de: "" },
      veprimi: { sq: ["Katalogzeile"], de: [] }
    })
  });
  const [p] = await new AnalyseDaten({ fetchFn, kennung: "aabbccdd" })
    .produkte({ produkte: [{ id: "lf-clean" }] }, "sq");
  assert.equal(p.satz, "Katalogsatz");
  assert.deepEqual(p.veprimi, ["Katalogzeile"]);
});

test("ein Mittel ohne Stammdaten faellt nicht aus, es bleibt beim Satz", async () => {
  const fetchFn = (adresse) => (String(adresse).includes("/products/")
    ? Promise.reject(new Error("Produkt weg"))
    : antwort(alsDokument({})));
  const [p] = await new AnalyseDaten({ fetchFn, kennung: "aabbccdd" })
    .produkte({ produkte: [{ id: "lf-acne", satz: "Persoenlicher Satz" }] }, "sq");
  assert.equal(p.name, "lf-acne", "Ohne Stammdaten bleibt die Kennung der Name");
  assert.equal(p.satz, "Persoenlicher Satz");
});

test("nur eingebettete Bilder gelten als Produktfoto", async () => {
  const mitFremd = mitschrift({ "/products/": alsDokument({ name: "X", photoRef: "https://fremd.example/bild.jpg" }) });
  const [fremd] = await new AnalyseDaten({ fetchFn: mitFremd.fetchFn, kennung: "aa" })
    .produkte({ produkte: ["x"] }, "sq");
  assert.equal(fremd.foto, "", "Eine fremde Adresse ist keine gepruefte Ladequelle");

  const mitEigen = mitschrift({ "/products/": alsDokument({ name: "X", photoRef: "data:image/png;base64,AAA" }) });
  const [eigen] = await new AnalyseDaten({ fetchFn: mitEigen.fetchFn, kennung: "aa" })
    .produkte({ produkte: ["x"] }, "sq");
  assert.equal(eigen.foto, "data:image/png;base64,AAA");
});

// ---------------------------------------------------------------------------
// Der Schreibweg - die Stelle, an der eine Anschrift verloren gehen kann
// ---------------------------------------------------------------------------

test("die Anschrift geht in die Sitzung und NIE in den Bericht", async () => {
  // Der Bericht ist oeffentlich lesbar, damit der Patient seinen Link
  // weitergeben kann. Eine Anschrift darin waere in dem Moment offen, in
  // dem er das tut.
  const { rufe, fetchFn } = mitschrift();
  const quelle = new AnalyseDaten({ fetchFn, kennung: "aabbccdd11223344" });
  await quelle.merken({ address: { strasse: "Rruga B 12" }, phone: "+38344111222", step: "ordered" });

  assert.equal(rufe.length, 1);
  const [ruf] = rufe;
  assert.equal(ruf.methode, "PATCH");
  assert.ok(ruf.adresse.includes("/sessions/aabbccdd11223344"), "Die Anschrift gehoert in die Sitzung");
  assert.ok(!ruf.adresse.includes("/reports/"), "Sie darf den Bericht nicht beruehren");
  assert.ok(ruf.koerper.includes("Rruga B 12"));
  assert.ok(ruf.adresse.includes("updateMask.fieldPaths=address"),
    "Ohne Maske ueberschreibt der PATCH die ganze Sitzung");
});

test("in den Bericht geht nur der Zustand, den der Patient selbst aendern darf", async () => {
  const { rufe, fetchFn } = mitschrift();
  const quelle = new AnalyseDaten({ fetchFn, kennung: "aabbccdd11223344" });
  const ok = await quelle.zustandSchreiben({ status: "bestellt", bestelltAt: "2026-09-11T10:00:00.000Z" });

  assert.equal(ok, true);
  const [ruf] = rufe;
  assert.ok(ruf.adresse.includes("/reports/aabbccdd11223344"));
  assert.ok(ruf.adresse.includes("updateMask.fieldPaths=status"));
  assert.ok(ruf.adresse.includes("updateMask.fieldPaths=bestelltAt"));
  assert.ok(!ruf.koerper.includes("address"), "Keine Anschrift im Bericht");
});

test("eine gescheiterte Zaehlung haelt die Seite nicht an", async () => {
  const quelle = new AnalyseDaten({ fetchFn: () => Promise.reject(new Error("Netz weg")), kennung: "aabbccdd" });
  assert.equal(await quelle.merken({ berichtGeoeffnet: true }), undefined);
  assert.equal(await quelle.zustandSchreiben({ status: "bestellt" }), false);
});

// ---------------------------------------------------------------------------
// Kleinteile
// ---------------------------------------------------------------------------

test("ein Sprachfeld kommt lesbar heraus, egal wie Heart es geschrieben hat", () => {
  assert.equal(sprachtext({ sq: "Shqip", de: "Deutsch" }, "de"), "Deutsch");
  assert.equal(sprachtext({ sq: "Shqip", de: "" }, "de"), "Shqip", "Leeres Deutsch faellt auf Albanisch zurueck");
  assert.equal(sprachtext("Nur ein Text", "sq"), "Nur ein Text");
  assert.equal(sprachtext(null, "sq"), "");
  assert.equal(sprachtext(undefined, "sq"), "", "Nie '[object Object]' im Befund");
});

test("leere Firestore-Antworten ergeben ein leeres Dokument, keinen Fehler", () => {
  assert.deepEqual(dokument(null), {});
  assert.deepEqual(dokument({}), {});
  assert.deepEqual(dokument({ fields: {} }), {});
});

test("die Tageszeit wird gelesen, nicht geraten", () => {
  assert.deepEqual(tageszeiten("vetëm në mbrëmje"), { morgens: false, abends: true });
  assert.deepEqual(tageszeiten("mëngjes dhe mbrëmje"), { morgens: true, abends: true });
  assert.deepEqual(tageszeiten("morgens und abends"), { morgens: true, abends: true });
  // Ohne erkennbare Angabe kommt das Mittel in KEINE Spalte: lieber eine
  // kurze Routine als eine erfundene.
  assert.deepEqual(tageszeiten("sipas udhëzimit"), { morgens: false, abends: false });
  assert.deepEqual(tageszeiten(""), { morgens: false, abends: false });
});

test("die Wartezeit ist ehrlich und kennt keine Warteschlange", () => {
  assert.equal(wartetext(9), ASTRA_TEXTE.pritDauerSot);
  assert.equal(wartetext(17), ASTRA_TEXTE.pritDauerSot);
  assert.equal(wartetext(18), ASTRA_TEXTE.pritDauerMorgen ?? ASTRA_TEXTE.pritDauerNeser);
  assert.equal(wartetext(23), ASTRA_TEXTE.pritDauerNeser);
});

// ---------------------------------------------------------------------------
// Die Grenze der Methode
// ---------------------------------------------------------------------------

test("die Grenze der Methode steht in beiden Fassungen wortgleich", () => {
  // Sie wirkt nur, weil sie ETWAS KOSTET: Sie nennt freiwillig, was die
  // Methode nicht hergibt. Ein Zugestaendnis, das an zwei Stellen anders
  // formuliert ist, ist kein Zugestaendnis, sondern eine Formulierung.
  assert.equal(ASTRA_TEXTE.kufijteText.sq, VORLAGE_TEXTE.grenzenText.sq);
  assert.equal(ASTRA_TEXTE.kufijteText.de, VORLAGE_TEXTE.grenzenText.de);
});

test("die Grenze der Methode wird immer gezeichnet, nie versteckt", () => {
  // Der Aufklapper #kufijte traegt kein hidden und wird nirgends
  // ausgeblendet - anders als die Bloecke, die ohne Inhalt wegfallen.
  const marke = ASTRA_HTML.match(/<details id="kufijte"[^>]*>/);
  assert.ok(marke, "Der Aufklapper #kufijte fehlt");
  // Nur das eigene hidden-Merkmal, nicht das aria-hidden der Zeichen darin.
  assert.ok(!/\shidden(?=[\s>])/.test(marke[0]),
    "Die Grenze der Methode darf nie ausgeblendet sein");
  assert.ok(!/zeigen\(\$\("#kufijte"\)/.test(ASTRA_JS), "Kein Code darf sie wegschalten");
});

// ---------------------------------------------------------------------------
// Aufbau und Ablauf muessen zusammenpassen
// ---------------------------------------------------------------------------

test("jeder Platz, den der Ablauf beschreibt, steht auch im Aufbau", () => {
  // Der teuerste stille Fehler dieser Seite: Der Ablauf schreibt in einen
  // Knoten, den es nicht gibt. schreibe() schluckt das wortlos, und die
  // Zeile fehlt einfach - bei jedem Patienten.
  const vorhanden = new Set([...ASTRA_HTML.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const benutzt = new Set([...ASTRA_JS.matchAll(/\$\("#([a-z0-9-]+)"\)/g)].map((m) => m[1]));
  assert.ok(benutzt.size > 60, `Zu wenige Knoten gefunden (${benutzt.size}) - stimmt das Muster noch?`);
  const fehlend = [...benutzt].filter((id) => !vorhanden.has(id));
  assert.deepEqual(fehlend, [], `Diese Knoten fehlen im Aufbau: ${fehlend.join(", ")}`);
});

test("jeder Zustand hat seinen Bildschirm", () => {
  for (const schirm of ["an-laedt", "an-weg", "an-prit", "an-fertig"]) {
    assert.ok(ASTRA_HTML.includes(`id="${schirm}"`), `Der Bildschirm ${schirm} fehlt`);
  }
});

test("der Kaufweg ist im Aufbau angelegt und im Ablauf verdrahtet", () => {
  assert.ok(ASTRA_HTML.includes("data-order"), "Es gibt keinen Kaufknopf");
  assert.ok(ASTRA_HTML.includes('<form id="an-form"'), "Es gibt kein Bestellformular");
  assert.ok(/#bestellen\(\)/.test(ASTRA_JS), "Das Formular fuehrt nirgendwohin");
  assert.ok(ASTRA_JS.includes("zustandSchreiben"), "Die Bestellung wird nicht in den Befund geschrieben");
  assert.ok(ASTRA_JS.includes('step: "ordered"'), "Die Bestellung wird nicht in der Sitzung vermerkt");
});

test("ohne Angebot im Befund gibt es keinen Kaufweg", () => {
  // Ein Befund, der eine aerztliche Abklaerung verlangt, darf nicht mit
  // einem Kaufknopf enden.
  assert.ok(ASTRA_JS.includes("reportAllowsOffer"), "Die Angebotssperre wird nicht gelesen");
  assert.ok(/get mitAngebot\(\)[\s\S]{0,200}reportAllowsOffer/.test(ASTRA_JS));
  assert.ok(/#bestellblatt\(auf\)[\s\S]{0,320}!this\.mitAngebot/.test(ASTRA_JS),
    "Das Bestellblatt oeffnet ohne Pruefung");
});

// ---------------------------------------------------------------------------
// Keine Demo mehr auf der Seite eines Patienten
// ---------------------------------------------------------------------------

test("auf der Live-Analyse steht kein Demo-Text mehr", () => {
  for (const wort of [
    "Model demonstrues", "Raport demonstrues", "POROSI DEMONSTRUESE",
    "Emër shembull", "nuk kryhet blerje", "Nuk është krijuar asnjë porosi",
    "Jo rast pacienti", "ASTRA–01"
  ]) {
    assert.ok(!ASTRA_HTML.includes(wort), `Demo-Text auf der Patientenseite: "${wort}"`);
  }
});

test("die Live-Analyse laedt keine deutschen Auditnotizen", () => {
  assert.ok(!ASTRA_JS.includes("audit-data.js"), "Entwurfsnotizen gehoeren nicht in eine Patientenansicht");
  assert.ok(!ASTRA_HTML.includes("audit-toggle"));
  assert.ok(!ASTRA_HTML.includes("review-bar"));
});

test("die Analyse eines Patienten bleibt aus der Suche", () => {
  assert.ok(/<meta name="robots" content="noindex, nofollow">/.test(ASTRA_HTML));
  const robots = lies("robots.txt");
  assert.ok(robots.includes("Disallow: /analiza/"));
  assert.ok(robots.includes("Disallow: /apps/lifeskin-astra/"));
  assert.ok(robots.includes("Disallow: /apps/lifeskin-bericht/"));
});

test("das Bestellformular verwirft nichts mehr still", () => {
  // Die Vorlage tat das mit Absicht. Auf der Live-Seite waere derselbe
  // Satz eine Bestellung, die niemand je bekommt.
  assert.ok(!/Deliberately never serialize/.test(ASTRA_JS));
  assert.ok(!/event\.currentTarget\.reset\(\)/.test(ASTRA_JS));
});

// ---------------------------------------------------------------------------
// Die getauschten Adressen
// ---------------------------------------------------------------------------

function rewrite(quelle) {
  return VERCEL.rewrites.find((r) => r.source === quelle);
}

test("die Hauptanalyse zeigt auf Astra, die Vorlage auf die fruehere Gestaltung", () => {
  assert.equal(rewrite("/analiza/:kennung")?.destination, "/apps/lifeskin-astra/index.html");
  assert.equal(rewrite("/analysetemplateastra")?.destination, "/apps/lifeskin-bericht/index.html");
  assert.equal(rewrite("/analysetemplateastra/")?.destination, "/apps/lifeskin-bericht/index.html");
  // Die Testadresse bleibt, wo sie war.
  assert.equal(rewrite("/lifeskinlifeskintesttest")?.destination, "/apps/lifeskin-bericht/index.html");
});

test("beide Adressen stehen vor den Auffangregeln", () => {
  // Sonst faengt /:landingSlug sie ab und die Social-App zeigt ein leeres
  // Lokalprofil statt der Analyse.
  const stelle = (quelle) => VERCEL.rewrites.findIndex((r) => r.source === quelle);
  const auffang = Math.min(
    ...["/:landingSlug", "/:landingSlug/:surface"].map(stelle).filter((i) => i >= 0)
  );
  assert.ok(auffang > 0, "Die Auffangregel fehlt");
  for (const quelle of ["/analiza/:kennung", "/analysetemplateastra", "/lifeskinlifeskintesttest"]) {
    assert.ok(stelle(quelle) >= 0 && stelle(quelle) < auffang,
      `${quelle} steht hinter der Auffangregel`);
  }
});

test("kein Redirect faengt die beiden Adressen vorher ab", () => {
  for (const redirect of VERCEL.redirects || []) {
    for (const quelle of ["/analiza/:kennung", "/analysetemplateastra"]) {
      assert.notEqual(redirect.source, quelle, `Ein Redirect faengt ${quelle} ab`);
    }
  }
});

test("der lokale Entwicklungsserver bildet denselben Tausch ab", () => {
  // Lokal macht das niemand sonst - und dann arbeitet jemand tagelang an
  // der falschen Seite.
  assert.ok(/\/\^\\\/analiza\\\/\[\^\/\]\+\$\/\.test\(path\)\) return ANALIZA_INDEX/.test(DEV_SERVER),
    "/analiza/... zeigt lokal nicht auf Astra");
  assert.ok(/path === "\/analysetemplateastra"\) return BERICHT_INDEX/.test(DEV_SERVER),
    "/analysetemplateastra zeigt lokal nicht auf die Vorlage");
  assert.ok(DEV_SERVER.includes('const ANALIZA_INDEX = "/apps/lifeskin-astra/index.html";'));
});

test("der Service Worker haelt beide Adressen fuer eigene Seiten", () => {
  // Sonst liefert er bei jedem Netz-Aussetzer die gecachte Social-Shell -
  // und der Patient sieht ein leeres Lokalprofil statt seines Befunds.
  const sw = lies("sw.js");
  const liste = sw.slice(sw.indexOf("NON_SOCIAL_NAVIGATION_PREFIXES"));
  for (const pfad of ["/analiza", "/apps/lifeskin-astra", "/analysetemplateastra", "/apps/lifeskin-bericht"]) {
    assert.ok(liste.includes(`'${pfad}'`), `${pfad} fehlt in NON_SOCIAL_NAVIGATION_PREFIXES`);
  }
});

// ---------------------------------------------------------------------------
// Die Vorlage
// ---------------------------------------------------------------------------

test("die Vorlagenadresse zeigt einen erfundenen Fall, nie einen echten", () => {
  assert.equal(istVorlagepfad("/analysetemplateastra"), true);
  assert.equal(istVorlagepfad("/analysetemplateastra/"), true, "Ein Schraegstrich am Ende zaehlt mit");
  assert.equal(istVorlagepfad("/ANALYSETEMPLATEASTRA"), true, "Gross und klein ist dieselbe Adresse");
  assert.equal(istVorlagepfad("/analysetemplateastra?audit=1"), false,
    "Der Vergleich gilt dem Pfad, nicht der Abfrage");
  assert.equal(istVorlagepfad("/analiza/aabbccdd11223344"), false);

  // Beide Musteradressen gehen denselben Weg: erfundener Fall, kein
  // Firestore, keine Zaehlung.
  assert.equal(istMusterpfad("/analysetemplateastra"), true);
  assert.equal(istMusterpfad("/lifeskinlifeskintesttest"), true);
  assert.equal(istMusterpfad("/analiza/aabbccdd11223344"), false);
  assert.equal(istTestpfad("/analysetemplateastra"), false,
    "Die Testadresse bleibt eine eigene Adresse");
});

test("die Vorlage laedt ihren erfundenen Fall erst nach der Pfadpruefung", () => {
  // Sonst laedt jeder echte Patient die erfundenen Daten mit herunter.
  const quelle = lies("apps/lifeskin-bericht/bericht.js");
  const pruefung = quelle.indexOf("if (!istMusterpfad(");
  const laden = quelle.indexOf('await import("./bericht-testfall.js")');
  assert.ok(pruefung > 0 && laden > pruefung, "Der Testfall wird vor der Pruefung geladen");
});

// ---------------------------------------------------------------------------
// Eine Farbe, bis in die Leiste des Browsers
// ---------------------------------------------------------------------------

test("die Kaufleiste traegt den Grund der Seite, nicht Weiss", () => {
  // Sonst steht unten eine Naht: weisse Leiste, darunter die Browserleiste
  // in der Farbe der Seite. Genau das war auf dem Telefon zu sehen.
  const regel = ASTRA_CSS.match(/\.sticky-purchase\{[^}]*\}/)?.[0] || "";
  assert.ok(regel.includes("background:var(--paper)"),
    `die Kaufleiste traegt eine eigene Farbe: ${regel}`);
  assert.ok(!/#fff{1,6}[0-9a-f]*/i.test(regel), "irgendwo steht noch ein fester Weisswert");
  assert.ok(!regel.includes("backdrop-filter"),
    "eine durchscheinende Leiste nimmt die Farbe von dem, was darunter liegt");
});

test("der Grund wird an das Wurzelelement und an die Marke geschrieben", () => {
  // Zwei Wege, weil verschiedene Fassungen verschiedene nehmen: die Marke
  // fuer iOS 15 bis 18 und Android, die Flaeche von html fuer alles ab
  // iOS 26, wo theme-color fallengelassen wurde.
  assert.match(ASTRA_JS, /document\.documentElement\.style\.background = grund/);
  assert.match(ASTRA_JS, /meta\[name="theme-color"\][\s\S]{0,80}setAttribute\("content", grund\)/);
  assert.match(ASTRA_JS, /grundSetzen\(farbeAusStil\("--paper"/,
    "der Grund wird nicht aus dem Stil gelesen, sondern zweimal geschrieben");
});

test("nur html traegt eine Flaeche, nicht auch body", () => {
  // Hat der Browser zwei Quellen, nimmt er die falsche.
  const body = ASTRA_CSS.match(/(?:^|\})body\{[^}]*\}/)?.[0] || "";
  assert.ok(!body.includes("background"), `body traegt eine zweite Flaeche: ${body}`);
});

// ---------------------------------------------------------------------------
// Die Bewegung
// ---------------------------------------------------------------------------

test("alles beginnt sichtbar - die Merkmale setzt erst der Ablauf", () => {
  // DAS IST DIE GANZE SICHERHEIT DIESER REGELN. Faellt das Skript aus,
  // bricht es ab oder kennt der Browser die Regeln nicht, steht die ganze
  // Analyse da - statt unsichtbar zu bleiben.
  assert.ok(!ASTRA_HTML.includes("data-zeig"), "im Aufbau steht schon ein Wartemerkmal");
  assert.ok(!ASTRA_HTML.includes("data-zeile"), "im Aufbau steht schon ein Wartemerkmal");
  assert.ok(!ASTRA_HTML.includes('data-stufe'), "die Kaufleiste startet schon in einer Stufe");
  // Und im Stil gilt ohne die Merkmale keine einzige Regel dazu.
  for (const regel of ASTRA_CSS.match(/\[data-zeig[^{]*\{[^}]*\}/g) || []) {
    assert.ok(regel.startsWith("[data-zeig"), `eine Regel greift ohne Merkmal: ${regel}`);
  }
});

test("wer Bewegung abgeschaltet hat, bekommt keine - zweimal verriegelt", () => {
  // Riegel eins im Ablauf: Es wird gar nichts erst versteckt.
  assert.match(methode(ohneKommentare(ASTRA_JS), "#einblenden"),
    /prefers-reduced-motion: reduce[\s\S]{0,40}return/);
  // Riegel zwei im Stil, fuer den Fall, dass die Einstellung erst nach dem
  // Zeichnen umgelegt wird.
  const block = ASTRA_CSS.slice(ASTRA_CSS.lastIndexOf("@media(prefers-reduced-motion:reduce)"));
  assert.ok(block.includes("[data-zeig=warte]"), "der Stil holt die Abschnitte nicht zurueck");
  assert.ok(block.includes("[data-zeile=warte]"), "der Stil holt die Zeilen nicht zurueck");
  assert.ok(block.includes(".sticky-purchase{transition:none}"), "die Kaufleiste faehrt weiter");
});

test("die Bewegung wird gerechnet, nicht beobachtet", () => {
  // Ein IntersectionObserver meldet nur Wechsel. Springt die Seite in
  // einem Satz ueber einen Abschnitt hinweg - was ein Telefon beim
  // schnellen Wischen tut -, gibt es keinen Wechsel, und der Abschnitt
  // bliebe versteckt.
  const einblenden = methode(ohneKommentare(ASTRA_JS), "#einblenden");
  assert.ok(!einblenden.includes("IntersectionObserver"),
    "die Einblendung haengt an einem Beobachter und verliert schnelles Wischen");
  assert.match(einblenden, /addEventListener\?\.\("scroll", pruefen/);
  assert.match(einblenden, /addEventListener\?\.\("resize", pruefen/);
  // Und der Aufklapper schiebt alles darunter nach unten.
  assert.match(einblenden, /"toggle", pruefen/);
});

test("was im Aufklapper liegt, wird nie versteckt", () => {
  // Zugeklappt kommt es nie ins Bild, also bliebe es beim Aufklappen
  // unsichtbar - und niemand scrollt, wenn er gerade aufgeklappt hat.
  const einblenden = methode(ohneKommentare(ASTRA_JS), "#einblenden");
  assert.match(einblenden, /imAufklapper = \(el\) => \{[\s\S]{0,160}closest\("details"\)/);
  assert.ok((einblenden.match(/imAufklapper\(/g) || []).length >= 3,
    "der Aufklapper wird nicht ueberall ausgenommen");
});

test("die Kaufleiste faehrt ein und aus, statt zu erscheinen", () => {
  const regel = ASTRA_CSS.match(/\.sticky-purchase\[data-stufe=aus\]\{[^}]*\}/)?.[0] || "";
  assert.ok(regel.includes("transform:translateY(105%)"), "sie blendet aus statt hinauszufahren");
  assert.ok(regel.includes("opacity:0"));
  assert.ok(regel.includes("pointer-events:none"), "ausgefahren faengt sie noch Klicks");
  assert.match(ASTRA_CSS, /\.sticky-purchase\{[^}]*\}[\s\S]*\.sticky-purchase\{transition:transform \.42s/);
  // Ohne Angebot ist sie GANZ weg - das ist ein anderer Zustand als
  // "noch nicht gekommen".
  assert.match(ASTRA_JS, /!this\.mitAngebot \|\| this\.bestellt\) \{\s*zeigen\(leiste, false\)/);
});

test("die Kaufleiste kommt erst hinter dem Angebot", () => {
  // Wer beim ersten Satz einen Kaufknopf am Rand sieht, liest ab da nicht
  // mehr "was ist mit meiner Haut", sondern sucht, wo die 53 € begruendet
  // werden. Und zwei Kaufknoepfe nebeneinander sind einer zu viel.
  const leiste = methode(ohneKommentare(ASTRA_JS), "#leiste");
  assert.match(leiste, /const vorbei = kasten\.bottom <= 0;/);
  assert.match(leiste, /vorbei && !this\.bestellt \? "an" : "aus"/);
  assert.ok(!leiste.includes("IntersectionObserver"), "sie haengt an einem Beobachter");
});
