// KUNDENFOTOS UND -VIDEOS ("Nga klientët tanë") auf der Therapieseite.
//
// Eine schmale Reihe kleiner Hochformat-Kacheln gleich unter dem Preis;
// Antippen oeffnet Foto oder Video gross, mit Kommentaren. Welche ein Fall
// zeigt, waehlt Dr. Gashi im Befund (reports/{id}.klientet). Keines
// gewaehlt - kein Abschnitt. Gepflegt in Heart (Mehr anzeigen -> Fotos &
// Videos), Views und Kommentare unter Nachfassen -> Reaktionen.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { KLIENTET, klientetFuerBericht } from "../shared/lifeskin-klientet.js";
import {
  MEDIEN_STANDARD, medienAuswahl, medienLaden, kommentareLaden, kommentarSchreiben, kommentarPruefen, viewZaehlen,
  medienListe, mediumNormalisieren, neueMediumId
} from "../shared/lifeskin-medien.js";

const lies = (p) => fs.readFileSync(p, "utf8");
const HTML = lies("apps/lifeskin-verkauf/terapia.html");
const JS = lies("apps/lifeskin-verkauf/terapia.js");
const MEDIEN_JS = lies("apps/lifeskin-verkauf/terapia-medien.js");
const ADAPTER = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
const HEART = lies("apps/mnyra-heart/heart.js");
const REGELN = lies("firestore.rules");
const BASIS = "https://firestore.googleapis.com/v1/projects/p/databases/(default)/documents";

function antwort(body, ok = true) {
  return { ok, status: ok ? 200 : 403, json: async () => body };
}

test("der Abschnitt steht gleich unter dem Preis, klein und versteckt", () => {
  const abschnitt = /<section class="pjese medien" id="klientet"[^>]*>/.exec(HTML)?.[0] || "";
  assert.match(abschnitt, /\shidden>/, "Der Abschnitt ist ohne Wahl sichtbar");
  const hero = HTML.indexOf('id="terapia"');
  const hier = HTML.indexOf('id="klientet"');
  assert.ok(hero < hier && hier < HTML.indexOf('id="pse"'), "Er steht nicht direkt unter dem Preis");
  assert.ok(HTML.includes('id="t-medien"'), "Der Behaelter der Kacheln fehlt");
  assert.ok(HTML.includes("Nga klientët tanë") && HTML.includes("Klientë me produktet LifeSkin."));
  for (const k of KLIENTET) assert.ok(fs.statSync(`.${k.bild}`).size < 150 * 1024, `${k.bild} ist zu gross`);
});

test("die Seite zeigt nur die gewaehlten - und nur mit Therapie", () => {
  assert.match(JS, /import \{ KundenMedien \} from "\.\/terapia-medien\.js"/);
  assert.match(JS, /this\.kundenMedien\.zeige\(this\.daten\?\.klientet\)/);
  assert.match(JS, /if \(!mitProdukten\) \{ zeigen\(abschnitt, false\); return; \}/);
  // Keine Views aus der Vorschau in Heart oder dem stillen Modus.
  assert.match(JS, /zaehlen: !this\.nurVorschau && globalThis\.__mnyraStill !== true/);
});

test("die Reihe haelt die Seite nicht auf", () => {
  // Videos nur im Bild, nur die ersten Sekunden, nie bei "Daten sparen".
  assert.match(MEDIEN_JS, /IntersectionObserver/);
  assert.match(MEDIEN_JS, /saveData/);
  assert.match(MEDIEN_JS, /prefers-reduced-motion/);
  assert.match(MEDIEN_JS, /SCHLEIFE_SEKUNDEN = 4/);
  assert.match(MEDIEN_JS, /video\.muted = true/);
  // Erst nach dem Laden der Seite - die Schleife verdraengt nichts.
  assert.match(MEDIEN_JS, /addEventListener\("load", los, \{ once: true \}\)/);
  // Kein HTML aus der Datenbank.
  assert.doesNotMatch(MEDIEN_JS, /innerHTML/);
});

test("welche Medien ein Befund zeigt", () => {
  assert.deepEqual(medienAuswahl(undefined), []);
  assert.deepEqual(medienAuswahl([]), []);
  assert.deepEqual(medienAuswahl(["m-1", "klienti-1", "m-1", "", "a b", "<x>"]), ["m-1", "klienti-1"]);
  // Die erste Fassung war ein einziger Schalter: true heisst die vier Fotos.
  assert.deepEqual(medienAuswahl(true), KLIENTET.map((k) => k.id));
  assert.equal(medienAuswahl(Array.from({ length: 20 }, (_, i) => `m${i}`)).length, 12);
  // Die alte Funktion gilt weiter fuer die alten Befunde.
  assert.deepEqual(klientetFuerBericht(true), KLIENTET.map((k) => k.id));
});

test("ein batchGet fuer alle, Standardfotos springen ein, Ausgeschaltetes bleibt weg", async () => {
  const aufrufe = [];
  const fetchFn = async (url, init) => {
    aufrufe.push({ url, body: JSON.parse(init.body) });
    const p = "projects/p/databases/(default)/documents/lifeskin/lifeskin/medien/";
    return antwort([
      { found: { name: p + "m-vid", fields: { art: { stringValue: "video" }, bild: { stringValue: "https://cdn/p.jpg" }, video: { stringValue: "https://cdn/v.mp4" }, produkt: { stringValue: "Pore Control" }, aktiv: { booleanValue: true }, views: { integerValue: "7" } } } },
      { found: { name: p + "m-aus", fields: { art: { stringValue: "foto" }, bild: { stringValue: "https://cdn/a.jpg" }, aktiv: { booleanValue: false } } } },
      { missing: p + "klienti-2" }
    ]);
  };
  const liste = await medienLaden(["m-vid", "m-aus", "klienti-2"], { basis: BASIS, fetchFn });
  assert.equal(aufrufe.length, 1);
  assert.equal(aufrufe[0].url, `${BASIS}:batchGet`);
  assert.equal(aufrufe[0].body.documents[0], "projects/p/databases/(default)/documents/lifeskin/lifeskin/medien/m-vid");
  assert.deepEqual(liste.map((m) => m.id), ["m-vid", "klienti-2"]);
  assert.equal(liste[0].art, "video");
  assert.equal(liste[0].video, "https://cdn/v.mp4");
  assert.equal(liste[0].views, 7);
  assert.equal(liste[1].bild, KLIENTET[1].bild);
  // Ohne Netz: nur die Standardfotos, kein Fehler.
  const ohne = await medienLaden(["m-vid", "klienti-1"], { basis: BASIS, fetchFn: async () => { throw new Error("offline"); } });
  assert.deepEqual(ohne.map((m) => m.id), ["klienti-1"]);
});

test("gefaehrliche Adressen kommen nie auf die Seite", () => {
  for (const boese of ["javascript:alert(1)", "data:text/html,x", "//evil.example/x.jpg", "http://unsicher/x.jpg", "https://x/\"onerror=1"]) {
    assert.equal(mediumNormalisieren({ bild: boese }).bild, "", boese);
  }
  assert.equal(mediumNormalisieren({ bild: "/apps/lifeskin-landing/fotot/klienti-1.jpg" }).bild, "/apps/lifeskin-landing/fotot/klienti-1.jpg");
  assert.equal(mediumNormalisieren({ art: "foto", video: "https://cdn/v.mp4" }).video, "", "Ein Foto hat kein Video");
});

test("Kommentare: nur Unverborgenes, neueste oben, geschrieben genau in der Form der Regel", async () => {
  let frage;
  const liste = await kommentareLaden("m-vid", {
    basis: BASIS,
    fetchFn: async (url, init) => {
      frage = { url, body: JSON.parse(init.body) };
      return antwort([
        { document: { name: "x/kommentare/a", fields: { name: { stringValue: "Alt" }, text: { stringValue: "1" }, createdAt: { stringValue: "2026-09-01T10:00:00.000Z" } } } },
        { document: { name: "x/kommentare/b", fields: { name: { stringValue: "Neu" }, text: { stringValue: "2" }, createdAt: { stringValue: "2026-09-20T10:00:00.000Z" } } } },
        { readTime: "2026-09-24T00:00:00Z" }
      ]);
    }
  });
  assert.equal(frage.url, `${BASIS}/lifeskin/lifeskin/medien/m-vid:runQuery`);
  assert.deepEqual(frage.body.structuredQuery.where.fieldFilter,
    { field: { fieldPath: "verborgen" }, op: "EQUAL", value: { booleanValue: false } });
  assert.deepEqual(liste.map((k) => k.name), ["Neu", "Alt"]);

  assert.equal(kommentarPruefen({ name: " ", text: "x" }).ok, false);
  assert.equal(kommentarPruefen({ name: "A".repeat(90), text: "x" }).name.length, 40);
  let geschrieben;
  const neu = await kommentarSchreiben("m-vid", { name: " Arta ", text: " Shumë mirë! " }, {
    basis: BASIS, jetzt: "2026-09-24T12:00:00.000Z",
    fetchFn: async (url, init) => { geschrieben = { url, body: JSON.parse(init.body) }; return antwort({ name: "x/kommentare/neu1" }); }
  });
  assert.equal(geschrieben.url, `${BASIS}/lifeskin/lifeskin/medien/m-vid/kommentare`);
  assert.deepEqual(Object.keys(geschrieben.body.fields).sort(), ["createdAt", "name", "text", "verborgen"]);
  assert.deepEqual(geschrieben.body.fields.verborgen, { booleanValue: false });
  assert.deepEqual(neu, { id: "neu1", name: "Arta", text: "Shumë mirë!", createdAt: "2026-09-24T12:00:00.000Z" });
  await assert.rejects(kommentarSchreiben("m-vid", { name: "A", text: "B" }, { basis: BASIS, fetchFn: async () => antwort({}, false) }));
});

test("ein View ist genau +1 auf 'views' und nur auf einen bestehenden Eintrag", async () => {
  let gesendet;
  await viewZaehlen("m-vid", { basis: BASIS, fetchFn: async (url, init) => { gesendet = { url, init, body: JSON.parse(init.body) }; return antwort({}); } });
  assert.equal(gesendet.url, `${BASIS}:commit`);
  assert.equal(gesendet.init.keepalive, true);
  const w = gesendet.body.writes[0];
  assert.deepEqual(w.transform.fieldTransforms, [{ fieldPath: "views", increment: { integerValue: "1" } }]);
  assert.deepEqual(w.currentDocument, { exists: true });
  // Scheitern bleibt still.
  assert.equal(await viewZaehlen("x", { basis: BASIS, fetchFn: async () => { throw new Error("weg"); } }), null);
});

test("die Regeln: lesen alle, Views nur +1, Kommentare nur in dieser Form, alles andere nur Heart", () => {
  const block = REGELN.slice(REGELN.indexOf("match /medien/{medienId}"), REGELN.indexOf("function lifeskinSessionShapeOk"));
  assert.match(block, /allow read: if true;/);
  assert.match(block, /allow create, delete: if isCeoActor\(\);/);
  assert.match(block, /affectedKeys\(\)\.hasOnly\(\["views"\]\)/);
  assert.match(block, /request\.resource\.data\.views == resource\.data\.get\("views", 0\) \+ 1/);
  assert.match(block, /allow read: if isCeoActor\(\) \|\| resource\.data\.verborgen == false;/);
  assert.match(block, /keys\(\)\.hasOnly\(\["name", "text", "createdAt", "verborgen"\]\)/);
  assert.match(block, /request\.resource\.data\.verborgen == false/);
  assert.match(block, /allow update, delete: if isCeoActor\(\);/);
});

test("Heart: Liste, neue Kennung, Standardfotos bis zur ersten Aenderung", () => {
  const standard = medienListe(null);
  assert.equal(standard.length, MEDIEN_STANDARD.length);
  assert.ok(standard.every((m) => m.standard));
  const gespeichert = medienListe([{ id: "b", reihe: 2, bild: "/x.jpg" }, { id: "a", reihe: -1, bild: "/y.jpg" }]);
  assert.deepEqual(gespeichert.map((m) => m.id), ["a", "b"]);
  assert.ok(gespeichert.every((m) => !m.standard));
  assert.match(neueMediumId(1_700_000_000_000, () => 0.5), /^m-[a-z0-9]+$/);
  assert.deepEqual(medienAuswahl([neueMediumId()]).length, 1, "Eine neue Kennung besteht die Auswahl");
});

test("Heart schreibt die Wahl mit der Freigabe", () => {
  assert.match(HEART, /klientet: \[\.\.\.document\.querySelectorAll\("\[data-befund-klienti\]:checked"\)\]/);
  assert.match(ADAPTER, /klientet: \(Array\.isArray\(klientet\) \? klientet : \[\]\)/);
});

test("im Befund eine eigene Sparte mit Fotos und Videos zum Antippen", async () => {
  const { renderSitzungDetail } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const fall = { id: "k1", typ: "scan", photos: [], createdAt: new Date().toISOString() };
  const aus = renderSitzungDetail(fall, {}, "ready", [], { status: "wartet" });
  assert.match(aus, /data-klapp="fall:befund:klientet"/, "Keine eigene Sparte");
  assert.equal((aus.match(/data-befund-klienti value=/g) || []).length, KLIENTET.length);
  assert.doesNotMatch(aus, /data-befund-klienti value="[^"]+" checked/);

  const medien = [
    { id: "m-vid", art: "video", bild: "https://cdn/p.jpg", video: "https://cdn/v.mp4", produkt: "Pore Control", aktiv: true, reihe: 0 },
    { id: "m-aus", art: "foto", bild: "https://cdn/a.jpg", aktiv: false, reihe: 1 }
  ];
  const an = renderSitzungDetail(fall, {}, "ready", [], { status: "fertig", klientet: ["m-vid"] }, false, undefined, { medien });
  assert.match(an, /data-befund-klienti value="m-vid" checked/);
  assert.doesNotMatch(an, /value="m-aus"/, "Ausgeschaltetes steht zur Wahl");
  assert.match(an, /heart-medium__art/, "Ein Video ist nicht als Video zu erkennen");
});

test("Heart: Karte unter Mehr anzeigen und Reaktionen unter Nachfassen", async () => {
  const { renderMedien, renderMedienReaktionen, renderMediumEditor } = await import("../apps/mnyra-heart/heart-lifeskin-medien.js");
  const medien = [
    { id: "m-vid", art: "video", bild: "https://cdn/p.jpg", video: "https://cdn/v.mp4", produkt: "Pore Control", aktiv: true, reihe: 0, views: 12 },
    { id: "m-foto", art: "foto", bild: "https://cdn/f.jpg", produkt: "<b>x</b>", aktiv: false, reihe: 1, views: 3 }
  ];
  const karte = renderMedien({ medien });
  assert.match(karte, /data-klapp="medien"/);
  assert.match(karte, /1 Foto · 1 Video/);
  assert.match(karte, /data-action="lifeskin-medium-neu" data-art="foto"/);
  assert.match(karte, /data-action="lifeskin-medium-neu" data-art="video"/);
  assert.match(karte, /heart-medium--aus/);
  assert.doesNotMatch(karte, /<b>x<\/b>/, "Nicht maskiert");

  const kommentare = {
    "m-vid": [
      { id: "k1", medium: "m-vid", name: "Arta", text: "Super", createdAt: "2026-09-24T10:00:00.000Z", verborgen: false },
      { id: "k2", medium: "m-vid", name: "Spam", text: "…", createdAt: "2026-09-23T10:00:00.000Z", verborgen: true }
    ],
    "m-foto": []
  };
  const reaktionen = renderMedienReaktionen({ medien, medienKommentare: kommentare, kommentarLoeschen: "m-vid/k2" });
  assert.match(reaktionen, /data-klapp="reaktionen"/);
  assert.match(reaktionen, /15 Views · 2 Kommentare/);
  assert.match(reaktionen, /data-was="verbergen"\s+data-medium="m-vid" data-id="k1"/);
  assert.match(reaktionen, /data-was="zeigen"\s+data-medium="m-vid" data-id="k2"/);
  assert.match(reaktionen, /Wirklich löschen\?/);
  // Vor dem Laden: Views ja, Kommentare noch offen.
  assert.match(renderMedienReaktionen({ medien }), /15 Views<\/span>/);

  const editor = renderMediumEditor({ medien, medienOffen: "__neu", medienEntwurf: { art: "video" } }, [{ name: "Pore Control" }]);
  assert.match(editor, /Neues Video/);
  assert.match(editor, /data-action="lifeskin-medium-speichern" disabled/, "Speichern ohne Datei moeglich");
});

test("Heart-Upload: Foto komprimiert, Video ueber den Story-Weg mit Standbild", () => {
  const schreiben = lies("apps/mnyra-heart/heart-crm-admin-write-adapter.js");
  const block = schreiben.slice(schreiben.indexOf("async function uploadLifeskinMedium"), schreiben.indexOf("function setStaffAvatarFile"));
  assert.match(block, /uploadCompressedImage\(file, uid, \{ maxSize: 1080/);
  assert.match(block, /captureVideoPosterFile\(file\)/);
  assert.match(block, /uploadRawMediaFile\(file, besitzer, \{ maxBytes: LIFESKIN_VIDEO_MAX \}\)/);
  assert.match(schreiben, /LIFESKIN_VIDEO_MAX = 50 \* 1024 \* 1024/);
  assert.match(schreiben, /uploadLifeskinMedium\n  \}\);/);
});
