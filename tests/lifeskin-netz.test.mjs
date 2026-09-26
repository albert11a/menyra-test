import test from "node:test";
import assert from "node:assert/strict";

import { poseAusMatrix, MARKE, NETZ_QUELLEN, LIDSPALTE_LINKS, LIDSPALTE_RECHTS,
  netzStand, netzHolen, netzVorladen, netzLohntSich, netzArt, netzFehlerFolge, messeNetz,
  __test__ } from "../apps/lifeskin/lifeskin-netz.js";

// Eine Drehmatrix um die Bildachse, spaltenweise wie MediaPipe sie liefert.
function rollMatrix(grad) {
  const w = grad * Math.PI / 180;
  const c = Math.cos(w), s = Math.sin(w);
  return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

test("die Einheitsmatrix ist ein gerader Kopf", () => {
  const p = poseAusMatrix(new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
  assert.ok(Math.abs(p.yaw) < 0.001 && Math.abs(p.pitch) < 0.001 && Math.abs(p.roll) < 0.001);
});

test("eine bekannte Drehung kommt in Grad zurueck - im gemessenen Vorzeichen", () => {
  // Der Betrag stimmt aufs Hundertstel; das Vorzeichen ist das, was an
  // echten Bildern herauskam und nicht das, was eine Konvention verspricht:
  // ein um +15 Grad gedrehtes Foto ergab roll -15,1, ein um -15 Grad
  // gedrehtes +14,8. Die Zerlegung liefert also das Negative des
  // Z-Drehwinkels, und genau das haelt dieser Test fest.
  //
  // Dass hier ein Vorzeichen zu erklaeren ist, ist auch der Grund, warum der
  // Ring seine Richtung NICHT aus der Matrix nimmt, sondern aus der Lage der
  // Nasenspitze im Bild (siehe lifeskin-pose.js). Roll wird berichtet,
  // gesteuert wird damit nichts.
  for (const grad of [-30, -15, 0, 15, 30]) {
    assert.ok(Math.abs(poseAusMatrix(rollMatrix(grad)).roll + grad) < 0.01,
      `roll bei ${grad} Grad daneben: ${poseAusMatrix(rollMatrix(grad)).roll}`);
  }
});

test("eine unbrauchbare Matrix ergibt keine Pose statt einer falschen", () => {
  assert.equal(poseAusMatrix(null), null);
  assert.equal(poseAusMatrix(new Float32Array(9)), null);
});

test("die Fassungen sind festgenagelt, nicht 'latest'", () => {
  // Ein stillschweigender Modellwechsel wuerde die Befunde aller Kunden
  // verschieben, ohne dass jemand etwas geaendert haette. Ein Kunde, der
  // seinen Befund ein zweites Mal holt und etwas anderes liest, glaubt beim
  // ersten Mal nichts mehr.
  assert.match(NETZ_QUELLEN.fassung, /^\d+\.\d+\.\d+$/);
  for (const url of [NETZ_QUELLEN.wasm, NETZ_QUELLEN.buendel, NETZ_QUELLEN.modell]) {
    assert.ok(!/latest/.test(url), `${url} zeigt auf "latest"`);
    assert.ok(url.startsWith("https://"), `${url} laeuft nicht ueber https`);
  }
  assert.ok(NETZ_QUELLEN.wasm.includes(NETZ_QUELLEN.fassung));
  assert.ok(NETZ_QUELLEN.buendel.includes(NETZ_QUELLEN.fassung));
});

test("die Landmarken sind eindeutig und liegen im Netz", () => {
  const werte = Object.values(MARKE);
  assert.equal(new Set(werte).size, werte.length, "Zwei Namen zeigen auf denselben Punkt");
  for (const [name, i] of Object.entries(MARKE)) {
    assert.ok(Number.isInteger(i) && i >= 0 && i < 478, `${name} liegt ausserhalb des Netzes`);
  }
  // Die Iris kommt nur aus dem verfeinerten Modell und liegt hinter dem
  // Grundnetz von 468 Punkten. Steht hier eine kleinere Zahl, ist das falsche
  // Modell geladen und der Weissabgleich misst Haut statt Augenweiss.
  assert.ok(MARKE.irisLinks >= 468 && MARKE.irisRechts >= 468);
});

test("die Lidspalten sind geschlossene Umrisse ohne Wiederholung", () => {
  for (const [name, spalte] of [["links", LIDSPALTE_LINKS], ["rechts", LIDSPALTE_RECHTS]]) {
    assert.ok(spalte.length >= 12, `Lidspalte ${name} ist zu grob fuer eine Weissreferenz`);
    assert.equal(new Set(spalte).size, spalte.length, `Lidspalte ${name} nennt einen Punkt doppelt`);
  }
  const doppelt = LIDSPALTE_LINKS.filter((i) => LIDSPALTE_RECHTS.includes(i));
  assert.deepEqual(doppelt, [], "Ein Punkt gehoert zu beiden Augen");
});

test("scheitert das Laden, haelt es den Trichter nicht an", () => {
  // Das ist die wichtigste Zusage dieses Moduls. Ohne sie haengt ein Kunde
  // im Mobilfunk am Ladebalken, und ein Kunde, der wartet, ist ein Kunde,
  // der geht.
  __test__.zuruecksetzen();
  return __test__.ladeWirklich({
    importiere: () => Promise.reject(new Error("Netz weg"))
  }).then(
    () => assert.fail("Haette scheitern muessen"),
    async () => {
      const ergebnis = await netzHolen({ zeitgrenzeMs: 50 }).catch(() => null);
      assert.equal(ergebnis, null, "Ein Fehlschlag muss null liefern, nicht werfen");
      assert.ok(["gescheitert", "laedt"].includes(netzStand()));
      __test__.zuruecksetzen();
    }
  );
});

test("nach einem Aussetzer wird das Netz EIN weiteres Mal geholt - nicht endlos", async () => {
  // Gesehen am 25.09. im Pruefstand: ein Fehlschlag an der Leitung, und fuer
  // den ganzen Besuch gab es keinen Ring mehr.
  __test__.zuruecksetzen();
  let aufrufe = 0;
  const kaputt = { importiere: () => { aufrufe += 1; return Promise.reject(new Error("Funkloch")); } };
  assert.equal(await netzVorladen(kaputt), null);
  assert.equal(netzStand(), "gescheitert");
  const doppel = { detectForVideo() { return { faceLandmarks: [] }; }, close() {} };
  const heil = {
    importiere: () => {
      aufrufe += 1;
      return Promise.resolve({
        FilesetResolver: { forVisionTasks: async () => ({}) },
        FaceLandmarker: { createFromOptions: async () => doppel }
      });
    }
  };
  assert.equal(await netzVorladen(heil), doppel, "Der zweite Versuch kam nicht");
  assert.equal(netzStand(), "da");
  assert.equal(aufrufe, 2);
  // Ein drittes Mal wird nicht geladen - auch nicht nach einem weiteren Fehlschlag.
  __test__.zuruecksetzen();
  aufrufe = 0;
  await netzVorladen(kaputt);
  await netzVorladen(kaputt);
  await netzVorladen(kaputt);
  assert.equal(aufrufe, 2, "Nach zwei Fehlschlaegen wird nicht weiter geladen");
  __test__.zuruecksetzen();
});

// ---------------------------------------------------------------------------
// Sieben Megabyte ueber eine Leitung, die sie nicht traegt
// ---------------------------------------------------------------------------
//
// GERECHNET, NICHT GESCHAETZT: netzHolen() gibt nach neun Sekunden auf.
// 6,7 MB in neun Sekunden sind rund 745 KB/s. Was der Browser "3g" nennt,
// liefert davon einen Bruchteil - der Trichter faellt dort IMMER auf den
// Weg ohne Netz zurueck. Geladen wurde trotzdem: neun Sekunden Scan
// verschenkt, der Uplink fuer die Aufnahmen belegt, das Datenpaket des
// Kunden dazu.

test("auf einer schmalen Leitung wird das Netz gar nicht erst geholt", () => {
  for (const art of ["slow-2g", "2g"]) {
    assert.equal(netzLohntSich({ effectiveType: art }), false, `${art} laedt weiter 6,7 MB`);
  }
  assert.equal(netzLohntSich({ effectiveType: "4g" }), true, "Auf 4g soll geladen werden");
  // UND AUF 3G WIRD GELADEN, seit gemessen ist, was dort wirklich steht:
  // effectiveType meldet die GEMESSENE Geschwindigkeit, und ein
  // durchschnittliches Mobilfunknetz in Kosovo meldet damit regelmaessig
  // "3g" - auch dort, wo LTE anliegt. Fuer diese Besucher gab es gar
  // keinen Ring, nur "stillhalten" und drei gerade Bilder. Das war die
  // schlechtere Analyse fuer die Mehrheit.
  assert.equal(netzLohntSich({ effectiveType: "3g" }), true,
    "Auf 3g bleibt der Ring aus - das trifft die Mehrheit der Besucher");
  assert.equal(netzLohntSich({ effectiveType: "4g", saveData: true }), false,
    "Der Datensparmodus wird uebergangen");
  // Meldet das Geraet nichts - iOS kennt navigator.connection nicht -,
  // wird geladen wie bisher. Lieber einmal umsonst als eine Erkennung,
  // die grundlos ausbleibt.
  assert.equal(netzLohntSich(undefined), true, "Ohne Angabe wird nicht mehr geladen");
});

test("uebersprungen heisst sofort fertig, nicht neun Sekunden warten", async () => {
  // Der eigentliche Gewinn: #rueckfallschleife() nimmt erst auf, wenn
  // feststeht, ob das Netz kommt. Steht das "nein" sofort fest, faengt der
  // Scan sofort an statt nach der Frist.
  __test__.zuruecksetzen();
  const seit = Date.now();
  const ergebnis = await netzVorladen({ verbindung: { effectiveType: "2g" } });
  assert.equal(ergebnis, null, "Es kommt kein Netz, also null");
  assert.ok(Date.now() - seit < 200, "Es wird trotzdem gewartet");
  assert.equal(netzStand(), "uebersprungen", "Der Stand sagt nicht, dass bewusst nicht geladen wurde");
  __test__.zuruecksetzen();
});

// ---------------------------------------------------------------------------
// Ohne Grafikkarte weiter - und eine Erkennung, die ausfaellt, faellt auf
// ---------------------------------------------------------------------------

function mediapipeAttrappe({ gpuGeht }) {
  const versuche = [];
  return {
    versuche,
    importiere: async () => ({
      FilesetResolver: { forVisionTasks: async () => ({ wasm: true }) },
      FaceLandmarker: {
        createFromOptions: async (_werkzeug, optionen) => {
          const art = optionen.baseOptions.delegate;
          versuche.push(art);
          if (art === "GPU" && !gpuGeht) throw new Error("WebGL2 nicht verfuegbar");
          return { art, detectForVideo: () => ({ faceLandmarks: [] }) };
        }
      }
    })
  };
}

test("scheitert die Grafikkarte, rechnet das Netz auf dem Prozessor", async () => {
  // Frueher warf createFromOptions() - und der Scan fiel ganz auf den
  // Weg ohne Netz, obwohl WASM und Modell laengst geladen waren.
  __test__.zuruecksetzen();
  const ohneGpu = mediapipeAttrappe({ gpuGeht: false });
  const netz = await __test__.ladeWirklich({ importiere: ohneGpu.importiere });
  assert.deepEqual(ohneGpu.versuche, ["GPU", "CPU"]);
  assert.equal(netz.art, "CPU");
  assert.equal(netzArt(), "CPU");

  __test__.zuruecksetzen();
  const mitGpu = mediapipeAttrappe({ gpuGeht: true });
  assert.equal((await __test__.ladeWirklich({ importiere: mitGpu.importiere })).art, "GPU");
  assert.deepEqual(mitGpu.versuche, ["GPU"], "Mit Grafikkarte wird nichts doppelt angelegt");
  assert.equal(netzArt(), "GPU");
  __test__.zuruecksetzen();
});

test("Fehler in Folge werden gezaehlt - ein Bild ohne Gesicht ist keiner", () => {
  __test__.zuruecksetzen();
  let wirft = true;
  __test__.einsetzen({ detectForVideo() { if (wirft) throw new Error("context lost"); return { faceLandmarks: [] }; } });
  for (let i = 0; i < 3; i += 1) assert.equal(messeNetz({}, i + 1), null);
  assert.equal(netzFehlerFolge(), 3);
  wirft = false;
  assert.equal(messeNetz({}, 10), null, "Kein Gesicht im Bild");
  assert.equal(netzFehlerFolge(), 0, "Ein Bild ohne Gesicht setzte die Folge nicht zurueck");
  __test__.zuruecksetzen();
});
