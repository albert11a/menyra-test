// Die Uebergabe stand hinter ~33 einzelnen Schreibvorgaengen (3G: 12,7 s,
// langsames 3G: 25 s > 20-s-Frist). Wartende Schreibvorgaenge in die
// Sitzung gehen jetzt als EIN PATCH - ohne dass etwas verloren geht oder
// eine andere Aufgabe (Fotos, Bericht) ueberholt wird.
import test from "node:test";
import assert from "node:assert/strict";
import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";

function netz({ ablehnen = () => false } = {}) {
  const anfragen = [];
  let freigeben;
  let tor = new Promise((r) => { freigeben = r; });
  const fetchFn = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : null;
    const maske = [...String(url).matchAll(/updateMask\.fieldPaths=([^&]+)/g)].map((m) => decodeURIComponent(m[1]));
    anfragen.push({ url, methode: init.method, maske, body });
    await tor;
    const nein = ablehnen({ url, maske });
    return { ok: !nein, status: nein ? 403 : 200 };
  };
  return { anfragen, fetchFn, auf: () => freigeben(), zu: () => { tor = new Promise((r) => { freigeben = r; }); } };
}

test("wartende Schreibvorgaenge gehen als ein PATCH, nichts fehlt", async () => {
  const n = netz();
  const s = new Sitzung({ speicher: null, fetchFn: n.fetchFn });
  s.starte({ dokument: null });
  // Das Anlegen ist schon in der Leitung.
  await new Promise((r) => setImmediate(r));
  for (let i = 0; i < 30; i += 1) s.klickpfadSchreiben([{ id: `e${i}`, t: `t${i}`, s: "ls-tel", e: "klick", d: "" }]);
  s.schritt("camera");
  s.ergaenze({ name: "Ana" });
  n.auf();
  await s.kette;
  const patches = n.anfragen.filter((a) => a.methode === "PATCH");
  assert.equal(patches.length, 2, "Anlegen in der Leitung, alles andere gesammelt");
  const gesammelt = patches[1];
  for (let i = 0; i < 30; i += 1) assert.ok(gesammelt.maske.includes(`timings.pfad.e${i}`));
  assert.ok(gesammelt.maske.includes("step"));
  assert.ok(gesammelt.maske.includes("name"));
  assert.ok(gesammelt.maske.includes("timings.live"));
  const pfad = gesammelt.body.fields.timings.mapValue.fields.pfad.mapValue.fields;
  assert.equal(Object.keys(pfad).length, 30);
  assert.equal(gesammelt.body.fields.name.stringValue, "Ana");
});

test("kleine Schreibvorgaenge warten nicht auf die Fotos, der Bericht schon", async () => {
  // Die Fotos haben ihre eigene Spur: Klickpfad, Schritte und Nummer gehen
  // hinaus, waehrend die Bilder noch hochladen. Nur der Bericht wartet auf
  // die Bilder - er ist der Fall, und ohne Bilder ist er leer.
  const n = netz();
  const s = new Sitzung({ speicher: null, fetchFn: n.fetchFn });
  s.starte({ dokument: null });
  s.klickpfadSchreiben([{ id: "a", t: "1", s: "x", e: "vor", d: "" }]);
  s.fotosSpeichern({ gerade: { jpeg: "data:image/jpeg;base64,AA==", breite: 1, hoehe: 1 } });
  s.klickpfadSchreiben([{ id: "b", t: "2", s: "x", e: "nach", d: "" }]);
  for (let i = 0; i < 20; i += 1) s.klickpfadSchreiben([{ id: `c${i}`, t: "3", s: "x", e: "nach", d: "" }]);
  const bericht = s.berichtAnlegen({ photos: 1 });
  s.klickpfadSchreiben([{ id: "z", t: "9", s: "x", e: "spaet", d: "" }]);
  n.auf();
  assert.equal(await bericht, true);
  await s.kette;
  const reihe = n.anfragen.map((a) => a.url.includes("/photos/") ? "foto" : a.url.includes("/reports") ? "bericht"
    : `${a.maske.includes("createdAt") ? "start+" : ""}${a.maske.filter((m) => m.startsWith("timings.pfad.")).map((m) => m.slice(13)).join(",")}`);
  // Das Anlegen wartete noch - alles Kleine reist mit ihm, auch was NACH
  // den Fotos und nach dem Bericht kam. Die Fotos folgen, der Bericht zuletzt.
  assert.deepEqual(reihe, [["start+a", "b", ...Array.from({ length: 20 }, (_, i) => `c${i}`), "z"].join(","), "foto", "bericht"]);
});

test("weist Firestore das Gesammelte ab, geht jedes Teil einzeln", async () => {
  const n = netz({ ablehnen: ({ maske }) => maske.includes("neuesFeld") });
  n.auf();
  const s = new Sitzung({ speicher: null, fetchFn: n.fetchFn });
  n.zu();
  s.starte({ dokument: null });
  s.ergaenze({ phone: "+38344111222" });
  s.ergaenze({ neuesFeld: true });
  n.auf();
  await s.kette;
  const telefon = n.anfragen.filter((a) => a.maske.includes("phone"));
  assert.equal(telefon.length, 2, "gesammelt abgewiesen, dann einzeln");
  assert.deepEqual(telefon[1].maske, ["updatedAt", "phone"]);
});

test("ueberlappende Felder landen nie im selben PATCH", async () => {
  const n = netz();
  const s = new Sitzung({ speicher: null, fetchFn: n.fetchFn });
  s.starte({ dokument: null });
  s.schritt("camera");
  s.ergaenze({ timings: { x: 1 } });
  n.auf();
  await s.kette;
  for (const a of n.anfragen) {
    for (const m of a.maske) assert.ok(!a.maske.some((o) => o !== m && o.startsWith(`${m}.`)), a.maske.join(" "));
  }
});
