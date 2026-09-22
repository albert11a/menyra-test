// DIE AUFNAHME EINER STELLE - der Weg "Me foto".
//
// WARUM DAS NICHT DER SCAN IST, obwohl beides eine Kamera aufmacht: Der
// Scan misst ein Gesicht und loest von selbst aus. Hier wird EINE Stelle
// Haut fotografiert, und der Mensch entscheidet selbst, wann sie richtig
// im Bild liegt.
//
// Geprueft wird hier die einzige Rechnung dieses Wegs - welche Groesse,
// welche Qualitaet - und das Verhalten der Kamera an den Stellen, an
// denen schon einmal etwas schiefgegangen ist: zwei Stroeme
// gleichzeitig, eine Leuchte, die anbleibt, ein Bild, das seitenverkehrt
// zur Aerztin geht.

import test from "node:test";
import assert from "node:assert/strict";

import {
  FOTO_BREITE, FOTO_STUFEN, FOTO_HOECHSTZEICHEN, MINI_BREITE, MINI_HOECHSTZEICHEN,
  besteGuete, zielMasse, alsJpeg, miniaturAus, Flaechenkamera
} from "../apps/lifeskin/lifeskin-foto.js";
import { lies, ohneKommentare } from "./lifeskin-quelle.mjs";

// ---------------------------------------------------------------------------
// Die Rechnung
// ---------------------------------------------------------------------------

test("das Seitenverhaeltnis bleibt, und vergroessert wird nie", () => {
  // Ein Telefon, das 720 Punkte liefert, bekommt kein Bild mit 1440:
  // Darin stuende nichts, was nicht schon in den 720 steht, und es waere
  // viermal so gross.
  assert.deepEqual(zielMasse(720, 1280, FOTO_BREITE), { breite: 720, hoehe: 1280 });
  assert.deepEqual(zielMasse(2880, 3840, FOTO_BREITE), { breite: 1440, hoehe: 1920 });
  assert.deepEqual(zielMasse(1920, 1080, MINI_BREITE), { breite: 160, hoehe: 90 });
  // Ohne Masse kein Bild - und keine Leinwand mit Hoehe null.
  assert.deepEqual(zielMasse(0, 0), { breite: 0, hoehe: 0 });
  assert.deepEqual(zielMasse(NaN, 100), { breite: 0, hoehe: 0 });
});

test("die beste Qualitaet, die noch in ein Firestore-Dokument passt", () => {
  // Ein Dokument darf 1 MiB gross sein, und das Bild steht als Text
  // darin. Statt eine feste Qualitaet zu raten, die mal zu gross und mal
  // zu schlecht ist, wird die beste genommen, die noch passt.
  const kodierer = (laengeBei1) => (guete) => "x".repeat(Math.round(laengeBei1 * guete));
  assert.equal(besteGuete(kodierer(300000)).guete, FOTO_STUFEN[0]);
  assert.equal(besteGuete(kodierer(1000000)).guete, 0.88);
  // Und wenn keine Stufe passt, kommt nichts zurueck statt eines Bildes,
  // das Firestore lautlos abweist.
  assert.equal(besteGuete(kodierer(5000000)), null);
});

// Eine Leinwand, die nur mitschreibt, was von ihr verlangt wurde.
function leinwandBau({ laengeBei1 = 200000 } = {}) {
  const gezeichnet = [];
  const leinwaende = [];
  const dokument = {
    createElement() {
      const leinwand = {
        width: 0, height: 0,
        getContext: () => ({
          drawImage: (...args) => gezeichnet.push(args.slice(1))
        }),
        toDataURL: (typ, guete) => `data:image/jpeg;base64,${"A".repeat(Math.round(laengeBei1 * guete))}`
      };
      leinwaende.push(leinwand);
      return leinwand;
    }
  };
  return { dokument, gezeichnet, leinwaende };
}

test("ein Bild geht in voller Breite hinaus und die Leinwand wird freigegeben", () => {
  const { dokument, gezeichnet, leinwaende } = leinwandBau();
  const treffer = alsJpeg({}, { breite: 2880, hoehe: 3840, dokument });
  assert.equal(treffer.breite, FOTO_BREITE);
  assert.equal(treffer.hoehe, 1920);
  assert.deepEqual(gezeichnet[0], [0, 0, 1440, 1920]);
  assert.ok(treffer.jpeg.length <= FOTO_HOECHSTZEICHEN);

  // DIE LEINWAND WIRD AUSDRUECKLICH GELEERT. Ein Bild in voller
  // Aufloesung sind ein paar Megabyte, und auf einem Telefon mit wenig
  // Speicher entscheidet genau das, ob die Seite danach noch steht.
  assert.equal(leinwaende[0].width, 0);
  assert.equal(leinwaende[0].height, 0);
});

test("die Kachel der Warteseite ist klein genug fuer ihre eigene Regel", () => {
  const { dokument } = leinwandBau({ laengeBei1: 50000 });
  const mini = miniaturAus({}, { breite: 1440, hoehe: 1920, dokument });
  assert.equal(mini.breite, MINI_BREITE);
  assert.ok(mini.jpeg.length <= MINI_HOECHSTZEICHEN,
    "Die Kachel ist groesser, als ihre Firestore-Regel zulaesst - sie kaeme nie an");
});

// ---------------------------------------------------------------------------
// Die Kamera
// ---------------------------------------------------------------------------

function kameraBau({ gum } = {}) {
  const spuren = [];
  const strom = () => {
    const spur = { readyState: "live", stop() { this.readyState = "ended"; } };
    spuren.push(spur);
    return { getTracks: () => [spur], getVideoTracks: () => [spur] };
  };
  const video = {
    srcObject: null, videoWidth: 0, videoHeight: 0, readyState: 0, paused: true, attrs: {},
    setAttribute(name, wert) { this.attrs[name] = wert; },
    play() { this.videoWidth = 1280; this.videoHeight = 720; this.readyState = 2; this.paused = false; return Promise.resolve(); },
    pause() {}
  };
  const anfragen = [];
  // Hereingereicht statt global gesetzt: Seit Node 21 ist
  // globalThis.navigator ein Nur-Lese-Zugriff.
  const medien = {
    getUserMedia: (bedingungen) => {
      anfragen.push(bedingungen);
      return gum ? gum(bedingungen, strom) : Promise.resolve(strom());
    }
  };
  return { video, spuren, anfragen, medien };
}

test("die Kamera sieht zuerst nach vorne und laesst sich umschalten", () => {
  const { video, anfragen, medien } = kameraBau();
  const kamera = new Flaechenkamera({ video, medien });
  // Vorne, nicht hinten: Wer "Me foto" waehlt, fotografiert meistens
  // eine Stelle im Gesicht - Wange, Stirn, Kinn -, und das geht nur mit
  // der Kamera, in der man sich sieht.
  assert.equal(kamera.richtung, "user");
  return kamera.starte().then(async () => {
    assert.equal(anfragen[0].video.facingMode, "user");
    await kamera.wechsle();
    assert.equal(anfragen[1].video.facingMode, "environment");
    assert.equal(kamera.richtung, "environment");
    kamera.stoppe();
  });
});

test("zwei Starts hintereinander lassen keinen Strom offen", async () => {
  // Wer ungeduldig zweimal tippt, bekam zwei Stroeme: Der erste blieb
  // offen, die Leuchte blieb an. Auf einem langsamen Geraet dauert
  // getUserMedia Sekunden - dort ist das kein Randfall.
  let loesen;
  const { video, spuren, medien } = kameraBau({
    gum: (_, strom) => new Promise((ja) => { loesen = () => ja(strom()); })
  });
  const kamera = new Flaechenkamera({ video, medien });
  const erster = kamera.starte();
  loesen();
  const zweiter = kamera.starte();
  loesen();
  await Promise.all([erster, zweiter]);
  assert.equal(spuren.length, 2);
  assert.equal(spuren[0].readyState, "ended", "Der erste Strom blieb offen - die Leuchte bleibt an");
  kamera.stoppe();
  assert.ok(spuren.every((s) => s.readyState === "ended"));
});

test("eine verweigerte Freigabe sagt etwas anderes als eine fehlende Kamera", () => {
  // Zwei Faelle, zwei Antworten: Wer die Freigabe verweigert hat,
  // braucht einen anderen Satz als wer eine Kamera hat, die gerade
  // jemand anderes benutzt.
  const gruende = [];
  const bauen = (name) => {
    const { video, medien } = kameraBau({
      gum: () => Promise.reject(Object.assign(new Error("x"), { name }))
    });
    return new Flaechenkamera({ video, medien, beiFehler: (s) => gruende.push(s) }).starte();
  };
  return Promise.all([bauen("NotAllowedError"), bauen("NotReadableError")]).then(() => {
    assert.deepEqual(gruende, ["fehlerKameraErlaubnis", "fehlerKameraBelegt"]);
  });
});

test("ohne Kamera-API im Geraet faellt der Weg sauber aus", async () => {
  const gruende = [];
  const kamera = new Flaechenkamera({ video: {}, beiFehler: (s) => gruende.push(s) });
  assert.equal(await kamera.starte(), false);
  assert.deepEqual(gruende, ["fehlerKameraBrowser"]);
});

test("jeder Grund hat einen Satz, den es wirklich gibt", async () => {
  // GESEHEN, NICHT BEFUERCHTET: Beim ersten Anlauf hiessen die Gruende
  // hier anders als im Verzeichnis. Der Fehlerkasten ging auf und blieb
  // LEER - ein Kasten ohne Text sagt weniger als gar keiner, denn er
  // sieht aus wie eine kaputte Seite.
  const { OBERFLAECHE } = await import("../apps/lifeskin/lifeskin-content.js");
  const foto = lies("apps/lifeskin/lifeskin-foto.js");
  const app = lies("apps/lifeskin/lifeskin-app.js");
  const gruende = [...`${foto}${app}`.matchAll(/"(fehlerKamera[A-Za-z]*)"/g)].map((m) => m[1]);
  assert.ok(gruende.length >= 6, "Die Suche greift nicht mehr");
  for (const grund of new Set(gruende)) {
    assert.ok(OBERFLAECHE[grund]?.sq, `${grund} steht nicht im Verzeichnis - der Kasten bliebe leer`);
  }
});

test("ohne Bild im Video kommt keine Aufnahme zurueck", () => {
  const { video, medien } = kameraBau();
  const kamera = new Flaechenkamera({ video, medien });
  assert.equal(kamera.aufnehmen(), null,
    "Aus einem Video ohne Masse entsteht eine leere Aufnahme statt gar keiner");
});

test("das Bild, das hinausgeht, ist nicht gespiegelt", () => {
  // Gespiegelt wird die VORSCHAU, damit sich das Ausrichten richtig
  // anfuehlt - im Stilblatt und nur bei der vorderen Kamera. Was die
  // Aerztin ansieht, soll die Haut zeigen, wie sie liegt: eine
  // seitenverkehrte Aufnahme laesst sie am falschen Ort suchen.
  const foto = ohneKommentare(lies("apps/lifeskin/lifeskin-foto.js"));
  assert.ok(!/scale\(-1|scaleX\(-1|translate\(.*-1/.test(foto),
    "Die Aufnahme wird gespiegelt - dann liegt der Befund auf der falschen Seite");
  const css = lies("apps/lifeskin/lifeskin-styles.css");
  assert.match(css, /\.ls-flaeche\[data-richtung="user"\] \.ls-flaeche__rahmen video \{ transform: scaleX\(-1\); \}/,
    "Die Vorschau der vorderen Kamera ist kein Spiegel");
});

// ---------------------------------------------------------------------------
// Der Bildschirm
// ---------------------------------------------------------------------------

test("kein Oval, keine Linien, kein Ring - und ein sichtbarer Ausloeser", () => {
  const html = lies("apps/lifeskin-landing/index.html");
  const block = html.slice(html.indexOf('id="ls-foto"'), html.indexOf("</section>", html.indexOf('id="ls-foto"')));
  assert.ok(block.length > 400, "Der Bildschirm fehlt");
  // Ein Rahmen, der ein Gesicht erwartet, schickte genau den weg, fuer
  // den dieser Weg gebaut ist.
  assert.ok(!/ls-oval|ls-ring/.test(block), "Der Bildschirm traegt die Form des Scans");
  assert.match(block, /id="ls-fotoausloeser"/, "Es gibt nichts, womit man ausloest");
  assert.match(block, /id="ls-fotowechseln"/);
  assert.match(block, /id="ls-fotonehmen"/);
  assert.match(block, /id="ls-fotonochmal"/);

  const css = lies("apps/lifeskin/lifeskin-styles.css");
  // Rechteckig mit weichen Ecken, nicht rund: Was hier fotografiert
  // wird, ist eine Stelle Haut und kein Gesicht.
  assert.match(css, /\.ls-flaeche__rahmen \{[^}]*aspect-ratio: 3 \/ 4;/s);
  assert.match(css, /\.ls-flaeche__rahmen \{[^}]*border-radius: 20px;/s);
  // Und fuer Safari vor 15: ohne Vorgaenger haette der Rahmen Hoehe
  // null, also kein Bild und keinen Ausloeser, der etwas aufnimmt.
  assert.match(css, /@supports not \(aspect-ratio: 3 \/ 4\)/);
});

test("die zwei Knoepfe ohne Beschriftung haben trotzdem einen Namen", () => {
  // Ausloeser und Umschalter sind rund und leer - so sieht jede
  // Kamera-App aus. Wer nicht sieht, bekommt sonst "Schaltflaeche" und
  // sonst nichts.
  const html = lies("apps/lifeskin-landing/index.html");
  assert.match(html, /id="ls-fotoausloeser" data-marke="fotoAusloeser"/);
  assert.match(html, /id="ls-fotowechseln" data-marke="fotoWechseln"/);
  const app = ohneKommentare(lies("apps/lifeskin/lifeskin-app.js"));
  assert.match(app, /for \(const knoten of \$\$\("\[data-marke\]"\)\) \{/,
    "Die Namen werden nie gesetzt");
  assert.match(app, /knoten\.setAttribute\("aria-label", wert\);/);
});


test("Foto: offenes play()-Promise blockiert dekodierte Bilder nicht", async () => {
  const p = kameraBau();
  p.video.play = function () {
    Object.assign(this, { videoWidth: 720, videoHeight: 1280, readyState: 2, paused: false });
    return new Promise(() => {});
  };
  const kamera = new Flaechenkamera(p);
  try {
    assert.equal(await kamera.starte(), true);
    assert.equal(p.video.playsInline, true);
    assert.equal(p.video.defaultMuted, true);
  } finally { kamera.stoppe(); }
});

test("Foto: unpassende Constraints fallen auf einfachere Kamera zurueck", async () => {
  let anzahl = 0;
  const p = kameraBau({ gum: async (_, strom) => {
    if (++anzahl < 3) throw Object.assign(new Error(), { name: "OverconstrainedError" });
    return strom();
  } });
  const kamera = new Flaechenkamera(p);
  try {
    assert.equal(await kamera.starte(), true);
    assert.equal(p.anfragen[2].video, true);
  } finally { kamera.stoppe(); }
});

test("Foto: Abbruch waehrend offener Freigabe beendet Start sofort und schliesst spaeten Stream", async () => {
  let spaeter;
  const p = kameraBau({ gum: (_, strom) => new Promise(ja => { spaeter = () => ja(strom()); }) });
  const kamera = new Flaechenkamera(p);
  const start = kamera.starte();
  kamera.stoppe();
  assert.equal(await start, false);
  spaeter();
  await new Promise(resolve => setImmediate(resolve));
  assert.ok(p.spuren.every(s => s.readyState === "ended"));
  assert.equal(p.video.srcObject, null);
});

test("Foto: Metadaten allein erlauben weder Bereitschaft noch Aufnahme", async () => {
  const p = kameraBau();
  p.video.play = function () {
    Object.assign(this, { videoWidth: 720, videoHeight: 1280, readyState: 1, paused: false });
    return Promise.resolve();
  };
  const kamera = new Flaechenkamera(p);
  const start = kamera.starte();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(kamera.bereit, false);
  assert.equal(kamera.aufnehmen(), null);
  kamera.stoppe();
  assert.equal(await start, false);
});
