// Das Gesichtsnetz. 478 gefundene Punkte statt zehn geratener.
//
// WARUM DIE EIGENE ERKENNUNG WEG MUSSTE.
//
// lifeskin-face.js sucht Hautfarbe, spannt ein Rechteck darum und leitet
// zehn Punkte aus Durchschnittsverhaeltnissen ab - "die Augenlinie liegt bei
// 42 Prozent der Gesichtshoehe". Das sind geratene Punkte, keine gefundenen.
// Sie sitzen bei einem Durchschnittsgesicht ungefaehr richtig und bei jedem
// anderen daneben, und sie folgen dem Gesicht nicht, sie folgen dem Rechteck.
//
// Daran ist beides gescheitert, worueber der Betrieb geklagt hat:
//
//   - Es fuehlt sich nicht wie Tracking an, weil es keins ist. Was ein
//     Snapchat-Filter am Gesicht kleben laesst, ist ein neuronales Netz mit
//     hunderten echten Landmarken je Bild.
//   - Der Kreis liess sich kaum schliessen, weil die Blickrichtung aus der
//     Verschiebung eben dieses Rechtecks kam. Bei Vollbart ist das Rechteck
//     unruhig, also zappelte die Richtung, also ging kein Strich zu.
//
// Hier laeuft jetzt MediaPipe Face Landmarker: 478 dreidimensionale
// Landmarken, zehn davon auf den Iris-Raendern, dazu eine
// Transformationsmatrix, aus der die Kopfhaltung in Grad faellt.
//
// AN EINEM ECHTEN FALL GEPRUEFT, nicht am Testgesicht: An der Aufnahme aus
// dem Betrieb - Vollbart, Deckenlicht, Buero - sitzt das Netz sauber, und der
// Kinnpunkt liegt anatomisch richtig unter dem Bart statt an dessen Unterkante.
//
// WAS ES KOSTET, und warum es trotzdem richtig ist.
//
// Rund 6,7 MB beim ersten Besuch: 3,0 MB WASM (brotli) und 3,6 MB Modell.
// Fuer einen Trichter, dessen Besucher aus einer Anzeige im Mobilfunk kommen,
// ist das viel. Drei Dinge fangen es ab:
//
//   1. Geladen wird ab dem ersten Bildschirm im Hintergrund. Bis der Kunde
//      Namen und Alter eingegeben und die drei Hinweise gelesen hat,
//      vergehen zwanzig Sekunden - die Ladezeit liegt darin und nicht davor.
//   2. Der Service Worker legt beides in den Cache. Ab dem zweiten Besuch
//      kostet es nichts.
//   3. Kommt es nicht rechtzeitig oder gar nicht, laeuft der Trichter mit
//      der alten Erkennung weiter. Ein Trichter, der am Ladebalken haengt,
//      hat den Kunden verloren.
//
// UND WARUM VOM CDN statt aus dem eigenen Verzeichnis: Die Dateien wiegen
// zusammen 15 MB. Das Projekt selbst wiegt 15 MB. Sie mitzuliefern hiesse,
// das Verzeichnis zu verdoppeln - fuer jeden Abzug, jeden Durchlauf, jede
// Auslieferung, fuer immer. Die Fassungen sind darum fest verdrahtet und
// nicht "latest": Ein stillschweigender Modellwechsel wuerde die Befunde
// aller Kunden verschieben, ohne dass jemand etwas geaendert haette.

const FASSUNG = "1.0.1";
const WASM_BASIS = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${FASSUNG}/wasm`;
const BUENDEL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${FASSUNG}/vision_bundle.mjs`;
const MODELL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

export const NETZ_QUELLEN = Object.freeze({ fassung: FASSUNG, wasm: WASM_BASIS, buendel: BUENDEL, modell: MODELL });

// Die Landmarken, auf die es ankommt.
//
// JEDE EINZELNE IST AM ECHTEN GESICHT NACHGESEHEN und nicht aus dem
// Gedaechtnis notiert - beschriftet ins Bild gezeichnet und angeschaut. Ein
// vertauschter Index faellt sonst nirgends auf: Die Messung laeuft weiter und
// misst die falsche Stelle.
export const MARKE = Object.freeze({
  stirnMitte: 10,        // mitten auf der Stirn, deutlich unter dem Haaransatz
  glabella: 9,           // zwischen den Brauen
  brauenLinks: 105,
  brauenRechts: 334,
  nasenwurzel: 6,        // zwischen den Augen
  nasenspitze: 1,
  nasenBasis: 2,
  augeLinksAussen: 33,
  augeLinksInnen: 133,
  augeRechtsAussen: 263,
  augeRechtsInnen: 362,
  irisLinks: 468,        // Mittelpunkt, danach 469..472 der Rand
  irisRechts: 473,       // Mittelpunkt, danach 474..477 der Rand
  unterAugeLinks: 230,
  unterAugeRechts: 450,
  jochbeinLinks: 116,
  jochbeinRechts: 345,
  wangeLinks: 50,
  wangeRechts: 280,
  schlaefeLinks: 127,
  schlaefeRechts: 356,
  oberlippe: 0,
  unterlippe: 17,
  kinnMitte: 175,
  kinnSpitze: 152
});

// Die Lidspalte, in der das Augenweiss liegt.
//
// Sie traegt den Weissabgleich (siehe lifeskin-haut.js): Die Sklera ist die
// einzige Flaeche im Bild, von der bekannt ist, dass sie neutral grau sein
// muesste. Auf iOS laesst sich der Weissabgleich der Kamera nicht sperren -
// Safari kennt die Einstellung nicht - also muss die Referenz aus dem Bild
// selbst kommen.
export const LIDSPALTE_LINKS = Object.freeze([33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]);
export const LIDSPALTE_RECHTS = Object.freeze([263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]);

// Umrisse, die aus jeder Hautmessung herausfallen.
export const MUND_UMRISS = Object.freeze([61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]);
export const BRAUE_LINKS = Object.freeze([70, 63, 105, 66, 107, 55, 65, 52, 53, 46]);
export const BRAUE_RECHTS = Object.freeze([300, 293, 334, 296, 336, 285, 295, 282, 283, 276]);

// Kopfhaltung in Grad aus der Transformationsmatrix.
//
// Die Matrix kommt spaltenweise als 16 Zahlen. Welche Zeile welchen Winkel
// traegt, ist nicht dokumentiert und war zu pruefen, nicht zu raten. Geprueft
// wurde mit Bildern bekannter Verdrehung:
//
//   Bild um 15 Grad gedreht  ->  roll -15,1 Grad
//   Bild um -15 Grad gedreht ->  roll +14,8 Grad
//   Bild gespiegelt          ->  Vorzeichen von yaw und roll drehen sich
//
// Also stimmt die Zerlegung auf zwei Zehntelgrad. Wer sie anfasst, misst
// bitte genauso nach.
export function poseAusMatrix(daten) {
  if (!daten || daten.length < 16) return null;
  const m = daten;
  const grad = 180 / Math.PI;
  return {
    yaw: Math.atan2(-m[8], Math.hypot(m[9], m[10])) * grad,
    pitch: Math.atan2(m[9], m[10]) * grad,
    roll: Math.atan2(m[4], m[0]) * grad
  };
}

// ---------- Laden ----------

let laden = null;
let netz = null;
let stand = "aus";
let letzterFehler = null;

export function netzStand() { return stand; }
export function netzFehler() { return letzterFehler; }

// Anstossen, ohne zu warten.
//
// Wird vom ersten Bildschirm aufgerufen. Der Rueckgabewert darf ignoriert
// werden - wer ihn braucht, wartet mit netzHolen() darauf.
export function netzVorladen(optionen = {}) {
  if (laden) return laden;
  stand = "laedt";
  laden = ladeWirklich(optionen).then((ergebnis) => {
    netz = ergebnis;
    stand = ergebnis ? "da" : "gescheitert";
    return ergebnis;
  }).catch((fehler) => {
    letzterFehler = String(fehler?.message || fehler);
    stand = "gescheitert";
    return null;
  });
  return laden;
}

async function ladeWirklich({ importiere = (pfad) => import(/* @vite-ignore */ pfad) } = {}) {
  const { FilesetResolver, FaceLandmarker } = await importiere(BUENDEL);
  const werkzeug = await FilesetResolver.forVisionTasks(WASM_BASIS);
  return FaceLandmarker.createFromOptions(werkzeug, {
    baseOptions: { modelAssetPath: MODELL, delegate: "GPU" },
    runningMode: "VIDEO",
    numFaces: 1,
    // Die Matrix ist der Grund fuer den ganzen Umbau: Sie liefert die
    // Kopfhaltung in Grad, statt sie aus Rechteckversatz zu schaetzen.
    outputFacialTransformationMatrixes: true,
    // Die Mimikwerte kosten nichts extra und sagen, ob die Augen offen sind
    // und ob jemand spricht - beides verdirbt eine Hautmessung.
    outputFaceBlendshapes: true,
    minFaceDetectionConfidence: 0.4,
    minFacePresenceConfidence: 0.4,
    minTrackingConfidence: 0.4
  });
}

// Warten, aber nicht ewig.
//
// Laeuft die Frist ab, kommt null zurueck und der Aufrufer nimmt die alte
// Erkennung. Das Laden geht im Hintergrund weiter; kommt das Netz spaeter
// doch an, benutzt es der naechste Anlauf.
export async function netzHolen({ zeitgrenzeMs = 12000 } = {}) {
  if (netz) return netz;
  const versuch = netzVorladen();
  if (!zeitgrenzeMs) return versuch;
  let uhr = null;
  const frist = new Promise((fertig) => { uhr = setTimeout(() => fertig(null), zeitgrenzeMs); });
  const ergebnis = await Promise.race([versuch, frist]);
  clearTimeout(uhr);
  return ergebnis || null;
}

// Ein Bild messen.
//
// `quelle` ist die zugeschnittene Leinwand und nicht das Videobild: Dann
// stehen die Landmarken in genau den Bildpunkten, die auch vermessen werden.
// Ueber das Videobild zu gehen hiesse, jeden Punkt durch den Zuschnitt
// zurueckrechnen zu muessen - und genau so ein Umrechenfehler war der Grund,
// warum die Kamera im Betrieb schon einmal am Abstand gescheitert ist.
export function messeNetz(quelle, zeitstempelMs) {
  if (!netz || !quelle) return null;
  let ergebnis;
  try {
    ergebnis = netz.detectForVideo(quelle, zeitstempelMs);
  } catch {
    // Ein einzelnes Bild kann schiefgehen, wenn die Leinwand gerade die
    // Groesse wechselt. Das ist kein Grund, den Trichter anzuhalten.
    return null;
  }
  const punkte = ergebnis?.faceLandmarks?.[0];
  if (!punkte?.length) return null;

  return {
    punkte,
    pose: poseAusMatrix(ergebnis.facialTransformationMatrixes?.[0]?.data) || { yaw: 0, pitch: 0, roll: 0 },
    mimik: mimikAus(ergebnis.faceBlendshapes?.[0]?.categories)
  };
}

// Die Mimikwerte, auf die es bei einer Hautmessung ankommt.
//
// Geschlossene Augen machen den Weissabgleich unmoeglich - ohne sichtbare
// Sklera gibt es keine Weissreferenz. Ein offener Mund zieht die Wangenhaut
// straff und verschiebt die Zonen. Beides ist ein Grund, dieses eine Bild
// nicht in den Befund zu nehmen, und kein Grund, den Kunden wegzuschicken.
function mimikAus(kategorien) {
  if (!kategorien?.length) return null;
  const hole = (name) => kategorien.find((k) => k.categoryName === name)?.score ?? 0;
  return {
    augeZuLinks: hole("eyeBlinkLeft"),
    augeZuRechts: hole("eyeBlinkRight"),
    mundOffen: hole("jawOpen")
  };
}

// Nur fuer die Tests: den Ladeweg zuruecksetzen und einen Doppelgaenger
// einsetzen, ohne echtes Netz aus dem Netz zu holen.
export const __test__ = {
  zuruecksetzen() { laden = null; netz = null; stand = "aus"; letzterFehler = null; },
  einsetzen(doppel) { netz = doppel; stand = "da"; laden = Promise.resolve(doppel); },
  ladeWirklich
};
