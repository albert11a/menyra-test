import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { Sitzung, geraetAuslesen } from "../apps/lifeskin/lifeskin-session.js";
import { TRICHTER_STUFEN, baueTrichter, normalisiere }
  from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");

// WER LANDET IN DER STUFE "Fillo skanimin"?
//
// Sie wird geschrieben, sobald die Seite geladen ist - nicht, wenn jemand
// hinsieht. Gemessen mit tests/lifeskin-trichter-pruefstand: Eine Seite, die
// NIE sichtbar war, schreibt eine vollstaendige Sitzung. Die Facebook-App
// laedt Anzeigenziele auf Android im Voraus, bevor jemand tippt.
//
// Damit war der Sprung von der ersten zur zweiten Stufe nicht auszuwerten:
// Im Zaehler stehen Menschen, im Nenner Seitenaufrufe. Diese Datei haelt
// fest, dass beides jetzt getrennt ist.

function papierSpeicher() {
  const inhalt = new Map();
  return {
    getItem: (k) => (inhalt.has(k) ? inhalt.get(k) : null),
    setItem: (k, v) => inhalt.set(k, String(v))
  };
}

// Ein Dokument, so viel wie die Sitzung davon braucht.
function papierDokument(stand = "visible") {
  const horcher = new Map();
  return {
    visibilityState: stand,
    addEventListener(art, fn) {
      if (!horcher.has(art)) horcher.set(art, new Set());
      horcher.get(art).add(fn);
    },
    removeEventListener(art, fn) { horcher.get(art)?.delete(fn); },
    // Der Besucher tippt die Anzeige an: Die vorgeladene Seite wird sichtbar.
    wirdSichtbar() {
      this.visibilityState = "visible";
      for (const fn of [...(horcher.get("visibilitychange") || [])]) fn();
    },
    horcherZahl: () => (horcher.get("visibilitychange") || new Set()).size
  };
}

function papierNetz() {
  const rufe = [];
  const fetchFn = async (url, optionen) => {
    rufe.push({ url, koerper: JSON.parse(optionen.body) });
    return { ok: true, status: 200, json: async () => ({}) };
  };
  return { rufe, fetchFn };
}

// ---------- Was beim Anlegen festgehalten wird ----------

test("geraetAuslesen haelt fest, ob die Seite sichtbar ist", () => {
  const sichtbar = geraetAuslesen({ userAgent: "x" }, null, { visibilityState: "visible" });
  assert.equal(sichtbar.gesehen, true);

  const versteckt = geraetAuslesen({ userAgent: "x" }, null, { visibilityState: "hidden" });
  assert.equal(versteckt.gesehen, false, "Eine vorgeladene Seite gilt faelschlich als gesehen");

  // "prerender" ist kein Besuch. Nur "visible" ist einer.
  const vorgerendert = geraetAuslesen({ userAgent: "x" }, null, { visibilityState: "prerender" });
  assert.equal(vorgerendert.gesehen, false);

  // Kein Dokument (Test, Node): dann ist niemand da, der hinsieht.
  assert.equal(geraetAuslesen({ userAgent: "x" }, null, undefined).gesehen, false);
});

test("eine sichtbare Seite wird sofort als gesehen geschrieben", async () => {
  const { rufe, fetchFn } = papierNetz();
  const sitzung = new Sitzung({ fetchFn, speicher: papierSpeicher() });
  await sitzung.starte({ dokument: papierDokument("visible") });

  const felder = rufe[0].koerper.fields;
  assert.equal(felder.step.stringValue, "opened");
  assert.equal(felder.device.mapValue.fields.gesehen.booleanValue, true);
});

test("eine vorgeladene Seite wird als nicht gesehen geschrieben", async () => {
  const { rufe, fetchFn } = papierNetz();
  const dokument = papierDokument("hidden");
  const sitzung = new Sitzung({ fetchFn, speicher: papierSpeicher() });
  await sitzung.starte({ dokument });

  assert.equal(rufe[0].koerper.fields.device.mapValue.fields.gesehen.booleanValue, false);
  // Und es wird weiter hingesehen, ob sie doch noch jemand oeffnet.
  assert.equal(dokument.horcherZahl(), 1, "Niemand wartet auf das Sichtbarwerden");
});

// AUS "WAR BEIM LADEN NICHT SICHTBAR" DARF NICHT "WAR NIE SICHTBAR" WERDEN.
//
// Tippt der Besucher nach dem Vorabladen wirklich auf die Anzeige, ist das
// ein Besuch wie jeder andere. Ohne die Nachmeldung waere die neue Zahl
// genauso falsch wie die alte, nur andersherum.
test("wird die vorgeladene Seite doch geoeffnet, wird es nachgemeldet", async () => {
  const { rufe, fetchFn } = papierNetz();
  const dokument = papierDokument("hidden");
  const sitzung = new Sitzung({ fetchFn, speicher: papierSpeicher() });
  await sitzung.starte({ dokument });

  dokument.wirdSichtbar();
  await sitzung.kette;

  const nach = rufe[rufe.length - 1];
  assert.equal(nach.koerper.fields.device.mapValue.fields.gesehen.booleanValue, true);
  // Nur device und updatedAt: Der Anlegezeitpunkt bleibt stehen, sonst
  // weist die Regel den ganzen Schreibvorgang ab.
  assert.deepEqual(Object.keys(nach.koerper.fields).sort(), ["device", "updatedAt"]);
  assert.ok(!/createdAt/.test(nach.url), "createdAt steht in der Maske");
  assert.match(nach.url, /updateMask\.fieldPaths=device/);
});

test("das Sichtbarwerden wird genau einmal gemeldet", async () => {
  const { rufe, fetchFn } = papierNetz();
  const dokument = papierDokument("hidden");
  const sitzung = new Sitzung({ fetchFn, speicher: papierSpeicher() });
  await sitzung.starte({ dokument });

  dokument.wirdSichtbar();
  await sitzung.kette;
  const nachEinmal = rufe.length;

  // Wer auf WhatsApp geht und zurueckkommt, hat die Seite nicht ein
  // zweites Mal zum ersten Mal gesehen.
  dokument.wirdSichtbar();
  dokument.wirdSichtbar();
  await sitzung.kette;
  assert.equal(rufe.length, nachEinmal, "Jede Rueckkehr schreibt erneut");
  assert.equal(dokument.horcherZahl(), 0, "Der Horcher haengt sich nicht aus");
});

test("eine sichtbare Seite haengt gar keinen Horcher ein", async () => {
  const { fetchFn } = papierNetz();
  const dokument = papierDokument("visible");
  const sitzung = new Sitzung({ fetchFn, speicher: papierSpeicher() });
  await sitzung.starte({ dokument });
  assert.equal(dokument.horcherZahl(), 0);
});

// ---------- Die Regel laesst es durch ----------
//
// DIE WICHTIGSTE PRUEFUNG DIESER DATEI. hasOnly() weist das GANZE Dokument
// ab, wenn ein Feld nicht in der Liste steht - dann zaehlt der Trichter
// still gar nichts mehr. Das Merkmal liegt deshalb IN device, und device
// wird nur auf "is map" geprueft.
test("das Merkmal liegt in device und braucht keine neue Regel", () => {
  const form = regeln.slice(regeln.indexOf("function lifeskinSessionShapeOk()"));
  assert.match(form, /data\.device is map/,
    "Die Regel prueft device nicht mehr als Karte");
  // Kein eigenes Feld oben: Das waere ein Verstoss gegen hasOnly, und bis
  // eine neue Regel eingespielt ist, kaeme nichts mehr an.
  const liste = form.slice(form.indexOf("hasOnly(["), form.indexOf("])"));
  assert.ok(!liste.includes('"gesehen"'),
    "Das Merkmal steht als eigenes Feld in hasOnly - dann braucht es eine Regelaenderung");
});

// ---------- Was Heart daraus macht ----------

test("Heart faengt den Trichter bei der gesehenen Seite an", () => {
  // DIE LADUNG IST KEINE STUFE MEHR. "opened" wird geschrieben, sobald die
  // Seite geladen ist - nicht, wenn jemand hinsieht; die Facebook-App
  // laedt Anzeigenziele auf Android im Voraus. Als erste Stufe stand damit
  // im Nenner eine Zahl aus Seitenaufrufen und im Zaehler eine aus
  // Menschen. Gerechnet wird weiter gegen die GESEHENEN Seiten - jetzt
  // steht das auch so da.
  const ids = TRICHTER_STUFEN.map((s) => s.id);
  assert.deepEqual(ids.slice(0, 2), ["gesehen", "named"],
    "Der Trichter faengt nicht bei den gesehenen Seiten an");
  assert.ok(!ids.includes("opened"),
    "Die Ladung steht wieder als Stufe da - Seitenaufrufe gegen Menschen");
  const stufe = TRICHTER_STUFEN.find((s) => s.id === "gesehen");
  assert.equal(stufe.feld, "gesehen");
  assert.ok(stufe.label.trim().length > 0);
});

// FEHLT DAS MERKMAL, GILT "gesehen".
//
// Jede Sitzung von vor dieser Aenderung hat es nicht. Als "nicht gesehen"
// gelesen, faellt der ganze Trichter der Vergangenheit hier auf null - und
// das waere eine erfundene Zahl.
test("alte Sitzungen ohne das Merkmal zaehlen als gesehen", () => {
  const alt = normalisiere("a1", { step: "named", device: { os: "ios" } });
  assert.equal(alt.gesehen, true);

  const neuGesehen = normalisiere("a2", { step: "opened", device: { gesehen: true } });
  assert.equal(neuGesehen.gesehen, true);

  const nieGesehen = normalisiere("a3", { step: "opened", device: { gesehen: false } });
  assert.equal(nieGesehen.gesehen, false);
});

test("der Trichter rechnet den Verlust gegen die gesehenen Seiten", () => {
  const sitzungen = [
    // Zwei Vorabladungen: geladen, nie angesehen, nie getippt.
    normalisiere("v1", { step: "opened", device: { gesehen: false } }),
    normalisiere("v2", { step: "opened", device: { gesehen: false } }),
    // Zwei echte Besucher, die nicht getippt haben.
    normalisiere("b1", { step: "opened", device: { gesehen: true } }),
    normalisiere("b2", { step: "opened", device: { gesehen: true } }),
    // Einer, der getippt hat.
    normalisiere("b3", { step: "named", device: { gesehen: true } })
  ];
  const trichter = baueTrichter(sitzungen);
  const nach = (id) => trichter.find((s) => s.id === id);

  assert.equal(nach("opened"), undefined, "Die Ladung steht wieder im Trichter");
  assert.equal(nach("gesehen").anzahl, 3, "Gesehen haben es drei");
  assert.equal(nach("named").anzahl, 1);

  // Und genau darum geht es: Der Verlust steht jetzt bei 2 von 3 statt bei
  // 4 von 5 - dieselbe Wirklichkeit, eine ehrlichere Zahl.
  assert.equal(Math.round(nach("named").verlust * 100), 67);
});

// Wer getippt hat, hat hingesehen - auch wenn die Ladung als versteckt
// begann und die Nachmeldung nicht mehr durchkam.
test("wer weiterkommt, zaehlt als gesehen, egal was im Merkmal steht", () => {
  const trichter = baueTrichter([
    normalisiere("x", { step: "camera", device: { gesehen: false } })
  ]);
  assert.equal(trichter.find((s) => s.id === "gesehen").anzahl, 1);
});
