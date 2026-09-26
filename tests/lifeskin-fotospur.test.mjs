// DIE FOTOS HABEN IHRE EIGENE SPUR - und keiner bleibt mehr an ihnen haengen.
//
// Vorher stand alles, was nach dem Scan kam (Schritt, Name, Nummer,
// Klickpfad, "aufbereitung"), in derselben Kette HINTER den Fotos. Auf
// einer schwachen Leitung wartete die Nummer eine Minute auf die Bilder;
// wer in dieser Zeit ging, war in Heart ohne Nummer und ohne Spur. Und ein
// einziges Foto, das nicht durchkam, liess den ganzen Bericht scheitern.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";

const JPEG = "data:image/jpeg;base64,AA==";

// Ein Netz, in dem Fotos von Hand freigegeben oder abgelehnt werden,
// alles andere sofort antwortet.
function netz({ fotoAntwort = () => ({ ok: true, status: 200 }) } = {}) {
  const anfragen = [];
  const wartend = [];
  const fetchFn = async (url, init = {}) => {
    const maske = [...String(url).matchAll(/updateMask\.fieldPaths=([^&]+)/g)].map((m) => decodeURIComponent(m[1]));
    const body = init.body ? JSON.parse(init.body) : null;
    anfragen.push({ url, maske, body });
    if (String(url).includes("/photos/")) {
      await new Promise((weiter) => wartend.push(weiter));
      return fotoAntwort(url);
    }
    return { ok: true, status: 200 };
  };
  const fotosLos = async () => {
    for (let runde = 0; runde < 20; runde += 1) {
      while (wartend.length) wartend.shift()();
      await new Promise((r) => setImmediate(r));
    }
  };
  return { anfragen, wartend, fetchFn, fotosLos };
}

const ruhe = async () => { for (let i = 0; i < 10; i += 1) await new Promise((r) => setImmediate(r)); };

test("die Nummer kommt an, waehrend die Fotos noch hochladen", async () => {
  const n = netz();
  const s = new Sitzung({ speicher: null, fetchFn: n.fetchFn });
  s.starte({ dokument: null });
  s.fotosSpeichern({ gerade: { jpeg: JPEG, breite: 1, hoehe: 1 }, rechts: { jpeg: JPEG, breite: 1, hoehe: 1 } });
  await ruhe();
  assert.ok(s.fotosLaufen > 0, "Die Fotos laufen nicht");
  s.schritt("captured");
  s.ergaenze({ phone: "+38344111222", phoneConsent: true });
  s.schritt("aufbereitung");
  await ruhe();
  // Kein Foto hat geantwortet - und trotzdem ist alles Kleine oben.
  const kleine = n.anfragen.filter((a) => !a.url.includes("/photos/"));
  const felder = kleine.flatMap((a) => a.maske);
  assert.ok(felder.includes("phone"), "Die Nummer wartet wieder hinter den Fotos");
  assert.ok(kleine.some((a) => a.body?.fields?.step?.stringValue === "aufbereitung"),
    "Heart sieht die Ladeseite erst, wenn die Fotos oben sind");
  await n.fotosLos();
  assert.equal(s.fotosLaufen, 0);
});

test("der Bericht wartet auf die Fotos", async () => {
  const n = netz();
  const s = new Sitzung({ speicher: null, fetchFn: n.fetchFn });
  s.starte({ dokument: null });
  s.fotosSpeichern({ gerade: { jpeg: JPEG, breite: 1, hoehe: 1 } });
  const bericht = s.berichtAnlegen({ photos: 1 });
  await ruhe();
  assert.ok(!n.anfragen.some((a) => a.url.includes("/reports")), "Der Bericht entsteht vor seinem Foto");
  await n.fotosLos();
  assert.equal(await bericht, true);
  const reihe = n.anfragen.map((a) => a.url.includes("/photos/") ? "foto" : a.url.includes("/reports") ? "bericht" : "klein");
  assert.ok(reihe.lastIndexOf("foto") < reihe.indexOf("bericht"));
});

test("ein einzelnes Foto, das nie durchkommt, haelt den Fall nicht auf", async () => {
  const n = netz({ fotoAntwort: (url) => url.includes("/photos/links")
    ? { ok: false, status: 503 } : { ok: true, status: 200 } });
  const s = new Sitzung({ speicher: null, fetchFn: n.fetchFn });
  s.starte({ dokument: null });
  s.fotosSpeichern({
    gerade: { jpeg: JPEG, breite: 1, hoehe: 1 },
    rechts: { jpeg: JPEG, breite: 1, hoehe: 1 },
    links: { jpeg: JPEG, breite: 1, hoehe: 1 }
  });
  const bericht = s.berichtAnlegen({ photos: 3 });
  await n.fotosLos();
  assert.equal(await bericht, true, "Ein fehlendes Foto laesst den ganzen Fall scheitern");
  const angelegt = n.anfragen.find((a) => a.url.includes("/reports"));
  assert.equal(angelegt.body.fields.photos.integerValue, "2",
    "Der Bericht behauptet ein Foto, das nie ankam");
  assert.equal(n.anfragen.filter((a) => a.url.includes("/photos/links")).length, 2,
    "Das fehlende Foto bekommt keinen zweiten Versuch");
});

test("ohne ein einziges Foto entsteht kein leerer Bericht", async () => {
  const n = netz({ fotoAntwort: () => ({ ok: false, status: 503 }) });
  const s = new Sitzung({ speicher: null, fetchFn: n.fetchFn });
  s.starte({ dokument: null });
  s.fotosSpeichern({ zona: { jpeg: JPEG, breite: 1, hoehe: 1 } });
  const bericht = s.berichtAnlegen({ photos: 1 });
  await n.fotosLos();
  assert.equal(await bericht, false);
  assert.ok(!n.anfragen.some((a) => a.url.includes("/reports")));
});

test("die Ladeseite zeigt keinen Fehler, solange ein Foto unterwegs ist", () => {
  const app = fs.readFileSync(path.join(process.cwd(), "apps/lifeskin/lifeskin-app.js"), "utf8");
  const ab = app.indexOf("  async #uebergeben() {");
  const uebergeben = app.slice(ab, app.indexOf("  #uebergabeFortschritt() {", ab));
  assert.match(uebergeben, /const unterwegs = Number\(this\.sitzung\.fotosLaufen\) > 0;/);
  assert.match(uebergeben, /const zuletzt = unterwegs \? Date\.now\(\)/,
    "Nach 20 Sekunden ohne Antwort steht wieder 'nicht bestaetigt' da, waehrend die Bilder hochgehen");
});
