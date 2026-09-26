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
//   1. Geladen wird im Hintergrund, sobald die Landingpage selbst geladen
//      ist (#netzAufDerLanding in lifeskin-app.js). Erst beim Tipp auf den
//      Scan zu laden reichte auf einer schwachen Leitung nicht bis zur
//      Kamera - und ohne Netz fuellt sich der Ring nicht. So liegt die
//      ganze Lesezeit von Landingpage, Wahl und Anleitung davor.
//   2. Der Browser-Cache haelt es fest: WASM und Buendel von jsDelivr ein
//      Jahr (immutable), das Modell von Google eine Stunde (max-age=3600).
//      Einen Service Worker gibt es auf den LifeSkin-Seiten NICHT (sw.js
//      nimmt sie ausdruecklich aus) - hier stand frueher, er lege beides
//      ab; das stimmte nicht.
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
// Wie viele Bilder HINTEREINANDER mit einer Ausnahme endeten - siehe
// messeNetz(). Ein Bild ohne Gesicht zaehlt nicht: Das ist kein Fehler.
let fehlerFolge = 0;
// Auf welchem Weg das Netz rechnet: "GPU" oder "CPU" (siehe ladeWirklich).
let art = "";

export function netzStand() { return stand; }
export function netzArt() { return art; }
export function netzFehler() { return letzterFehler; }
export function netzFehlerFolge() { return fehlerFolge; }

// Verbindungen, ueber die 6,7 MB nicht rechtzeitig ankommen koennen.
// WELCHE LEITUNG ZU SCHMAL IST, UM ES ZU VERSUCHEN.
//
// "3g" stand hier und war der teuerste Eintrag im ganzen Trichter: Der
// Browser meldet effectiveType nach der GEMESSENEN Geschwindigkeit, und
// ein durchschnittliches Mobilfunknetz in Kosovo meldet damit regelmaessig
// "3g" - auch dort, wo in Wahrheit LTE anliegt. Fuer diese Besucher wurde
// das Gesichtsnetz gar nicht erst geholt: kein Ring, keine Striche, nur
// "stillhalten" und drei gerade Bilder. Das ist die schlechtere Analyse,
// und sie traf ausgerechnet die Mehrheit.
//
// Was bleibt: echtes 2G und ein ausdruecklich sparsamer Besucher
// (saveData). Dort ist die Entscheidung richtig - sechs Megabyte waeren
// dort Minuten. Fuer alle anderen entscheidet jetzt die Frist in
// netzHolen(): Kommt es nicht rechtzeitig, laeuft der Weg ohne Netz an,
// und kommt es spaeter doch, uebernimmt der Ring.
const ZU_LANGSAM = Object.freeze(["slow-2g", "2g"]);

// LOHNT SICH DAS UEBERHAUPT? Auf einer schmalen Leitung ist die Antwort
// nein - und zwar nicht knapp.
//
// netzHolen() gibt nach neun Sekunden auf. Damit 6,7 MB in dieses Fenster
// passen, muessten rund 745 KB/s ankommen. Meldet der Browser "3g" oder
// langsamer, ist das um eine Groessenordnung ausgeschlossen: Der Trichter
// faellt dort IMMER auf den Weg ohne Netz zurueck, ausnahmslos.
//
// Geladen wurde trotzdem, und das kostete dreifach:
//
//   1. NEUN SEKUNDEN SCAN. #rueckfallschleife() nimmt erst auf, wenn
//      feststeht, ob das Netz kommt (netzWartet). Auf einer schmalen
//      Leitung hiess das: neun Sekunden warten auf eine Antwort, die
//      sicher "nein" lautet. Uebersprungen steht das "nein" sofort fest.
//   2. DER UPLINK FUER DIE AUFNAHMEN. Am Ende des Scans gehen die Bilder
//      ueber dieselbe Leitung hoch, ueber die im Hintergrund noch immer
//      ein Modell heruntergeladen wird - genau der Schritt, nach dem der
//      Kunde auf sein Ergebnis wartet.
//   3. SIEBEN MEGABYTE SEINES DATENPAKETS, fuer nichts.
//
// Meldet das Geraet nichts (iOS kennt navigator.connection nicht), wird
// geladen wie bisher: lieber einmal umsonst geladen als eine Erkennung,
// die grundlos ausbleibt.
export function netzLohntSich(verbindung = globalThis.navigator?.connection) {
  if (!verbindung) return true;
  if (verbindung.saveData) return false;
  return !ZU_LANGSAM.includes(String(verbindung.effectiveType || ""));
}

// Anstossen, ohne zu warten.
//
// Wird vom ersten Bildschirm aufgerufen. Der Rueckgabewert darf ignoriert
// werden - wer ihn braucht, wartet mit netzHolen() darauf.
// EIN ZWEITER VERSUCH NACH EINEM FEHLSCHLAG.
//
// Gesehen am 25.09. im Pruefstand (lauf-wege.mjs, A1): Das Laden scheiterte
// einmal nach vier Sekunden an der Leitung - und blieb danach fuer den
// ganzen Besuch gescheitert, weil das Versprechen gemerkt war. Auf dem
// Telefon ist so ein Aussetzer Alltag (Funkloch, Wechsel ins WLAN). Der
// naechste Anlass - meist der Tipp auf "Hap kamerën" - versucht es noch
// einmal. Danach nicht mehr: Wer zweimal scheitert, bekommt den Weg ohne
// Netz, statt bei jedem Kameraoeffnen neun Sekunden zu warten.
const VERSUCHE_HOECHSTENS = 2;
let versuche = 0;

export function netzVorladen(optionen = {}) {
  if (laden && !(stand === "gescheitert" && versuche < VERSUCHE_HOECHSTENS)) return laden;
  if (!netzLohntSich(optionen.verbindung)) {
    // Sofort und endgueltig "nein": netzHolen() rennt damit nicht in seine
    // Frist, sondern ist gleich fertig, und der Scan faengt sofort an.
    stand = "uebersprungen";
    laden = Promise.resolve(null);
    return laden;
  }
  versuche += 1;
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

// ERST DIE GRAFIKKARTE, DANN DER PROZESSOR.
//
// Der GPU-Weg braucht WebGL2, und genau das fehlt oder zickt auf den
// Geraeten, die wir nicht in der Hand haben: aeltere iPhones, manche
// Android-Webansichten, ein Grafiktreiber, der den Kontext verweigert.
// Dann warf createFromOptions() - und der Scan fiel fuer diesen Besucher
// ganz auf den Weg ohne Netz zurueck, obwohl das Netz geladen war.
//
// Der CPU-Weg ist langsamer, aber er laeuft ueberall, wo WebAssembly
// laeuft. WASM und Modell liegen beim zweiten Versuch schon im Cache.
async function ladeWirklich({ importiere = (pfad) => import(/* @vite-ignore */ pfad) } = {}) {
  const { FilesetResolver, FaceLandmarker } = await importiere(BUENDEL);
  const werkzeug = await FilesetResolver.forVisionTasks(WASM_BASIS);
  try {
    const aufGpu = await FaceLandmarker.createFromOptions(werkzeug, netzOptionen("GPU"));
    art = "GPU";
    return aufGpu;
  } catch (gpuFehler) {
    letzterFehler = `GPU: ${String(gpuFehler?.message || gpuFehler).slice(0, 80)}`;
    const aufCpu = await FaceLandmarker.createFromOptions(werkzeug, netzOptionen("CPU"));
    art = "CPU";
    return aufCpu;
  }
}

function netzOptionen(delegate) {
  return {
    baseOptions: { modelAssetPath: MODELL, delegate },
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
  };
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
    fehlerFolge = 0;
  } catch {
    // Ein einzelnes Bild kann schiefgehen, wenn die Leinwand gerade die
    // Groesse wechselt. Das ist kein Grund, den Trichter anzuhalten.
    //
    // VIELE HINTEREINANDER dagegen schon: Dann ist die Erkennung selbst
    // weg - etwa ein verlorener WebGL-Kontext, wenn iOS einer Webansicht
    // Speicher nimmt. Der Ring stuende dann still und wartete auf ein
    // Gesicht, das er nie mehr findet. Die Zahl liest #ringschleife().
    fehlerFolge += 1;
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
  zuruecksetzen() { laden = null; netz = null; stand = "aus"; letzterFehler = null; fehlerFolge = 0; art = ""; versuche = 0; },
  einsetzen(doppel) { netz = doppel; stand = "da"; laden = Promise.resolve(doppel); },
  ladeWirklich
};
