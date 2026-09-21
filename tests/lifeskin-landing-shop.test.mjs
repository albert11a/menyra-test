// Der Laden auf der Landingpage.
//
// Was hier geprueft wird, ist das, was sich beim naechsten Mal still
// verschieben kann: die Zahl am Produkt, die Stelle, an der die Bilder
// liegen, und die Felder, die eine Bestellung schreibt. Das Aussehen
// prueft dieser Test nicht - dafuer gibt es Augen.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  FOTO_PRAEFIX, FOTOS_MAX, mittelBauen, summeVon, stueckVon, korbLesen
} from "../apps/lifeskin-landing/shop.js";
import { STANDARD_PRODUKTE } from "../apps/lifeskin/lifeskin-catalog.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (pfad) => readFileSync(join(wurzel, pfad), "utf8");

const aufbau = lies("apps/lifeskin-landing/index.html");
const blatt = lies("apps/lifeskin-landing/landing.css");
const laden = lies("apps/lifeskin-landing/shop.js");
const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
const regeln = lies("firestore.rules");

// ══ DIE BILDER LIEGEN DA, WO HEART SIE HINLEGT ═══════════════════════
//
// Zwei Dateien nennen dieselbe Stelle: Heart schreibt die Bilder, die
// Landingpage liest sie. Gehen die zwei Namen auseinander, bleibt der
// Abschnitt leer - und zwar STILL: Kein Fehler, keine Meldung, nur vier
// Mittel, die nicht da sind. Genau so ein Fehler faellt erst auf, wenn
// jemand fragt, warum nichts verkauft wird.
test("Heart und die Landingpage meinen dieselben Bilddokumente", () => {
  const ausHeart = /LANDING_FOTOT_PRAEFIX = "([^"]+)"/.exec(adapter);
  assert.ok(ausHeart, "Heart nennt keinen Praefix mehr");
  assert.equal(FOTO_PRAEFIX, ausHeart[1],
    "Heart legt die Bilder woanders hin, als die Landingpage sie sucht");

  const hoechstens = /LANDING_FOTOT_MAX = (\d+)/.exec(adapter);
  assert.ok(hoechstens, "Heart nennt keine Obergrenze mehr");
  assert.equal(FOTOS_MAX, Number(hoechstens[1]),
    "Heart laesst mehr Bilder zu, als die Landingpage zeigt");
});

// Sie liegen in "config", und das ist kein Zufall: firestore.rules
// erlaubt dort genau das, was gebraucht wird. Eine eigene Sammlung
// haette eine neue Regel gebraucht - und eine Regel, die nicht
// ausgespielt ist, ist eine Seite, die nicht funktioniert.
test("die Bilder liegen in einer Sammlung, die jeder lesen darf", () => {
  assert.match(laden, /\/config\?|"config"/,
    "Die Landingpage liest die Bilder nicht mehr aus der Konfiguration");
  const block = regeln.slice(regeln.indexOf("match /config/{documentId}"));
  const ende = block.indexOf("}", block.indexOf("allow write"));
  const regel = block.slice(0, ende);
  assert.match(regel, /allow read: if true/,
    "Die Konfiguration ist nicht mehr oeffentlich lesbar - der Laden bliebe leer");
  assert.match(regel, /allow write: if isCeoActor\(\)/,
    "Die Konfiguration ist nicht mehr nur vom CEO-Konto schreibbar");
});

// ══ DIE ZAHL AM PRODUKT ══════════════════════════════════════════════
//
// 33 EUR stehen im Katalog UND als Satz unter dem Raster. Wer den
// Katalog aendert und den Satz vergisst, hat eine Seite, die sich
// selbst widerspricht - und der Widerspruch steht ausgerechnet am Preis.
test("der Satz unter den Mitteln nennt denselben Preis wie der Katalog", () => {
  const preise = new Set(STANDARD_PRODUKTE.map((p) => p.einzelpreis));
  assert.equal(preise.size, 1, "Die Mittel kosten nicht mehr alle dasselbe");
  const einzeln = [...preise][0];
  const satz = /Çmimi për produkt është (\d+) €/.exec(aufbau);
  assert.ok(satz, "Der Satz mit dem Preis steht nicht mehr im Aufbau");
  assert.equal(Number(satz[1]), einzeln,
    `Der Aufbau sagt ${satz[1]} €, der Katalog ${einzeln} €`);
});

// ══ WAS INS RASTER KOMMT UND WAS NICHT ═══════════════════════════════
test("ein Mittel ohne Bild erscheint nicht", () => {
  const fotos = new Map([["lf-acne", ["data:image/jpeg;base64,x"]]]);
  const mittel = mittelBauen([], fotos);
  assert.deepEqual(mittel.map((m) => m.id), ["lf-acne"],
    "Es erscheinen Mittel ohne Bild - das waeren graue Kacheln");
});

test("ein ausgeblendetes Mittel erscheint nicht, auch mit Bild", () => {
  const fotos = new Map([["lf-acne", ["data:image/jpeg;base64,x"]]]);
  const mittel = mittelBauen([{ id: "lf-acne", availability: "hidden" }], fotos);
  assert.deepEqual(mittel, [],
    "Ein in Heart ausgeblendetes Mittel steht trotzdem im Laden");
});

test("Firestore schlaegt den Katalog, der Katalog faengt den Ausfall auf", () => {
  const fotos = new Map([["lf-acne", ["data:image/jpeg;base64,x"]]]);
  const ausNetz = mittelBauen([{ id: "lf-acne", name: "LF NEU", einzelpreis: 41 }], fotos);
  assert.equal(ausNetz[0].name, "LF NEU", "Der Name aus Heart kommt nicht an");
  assert.equal(ausNetz[0].cmimi, 41, "Der Preis aus Heart kommt nicht an");

  const ohneNetz = mittelBauen([], fotos);
  assert.equal(ohneNetz[0].name, "LF ACNE", "Ohne Firestore fehlt der Name");
  assert.equal(ohneNetz[0].cmimi, 33, "Ohne Firestore fehlt der Preis");
});

test("mehr Bilder als erlaubt werden abgeschnitten", () => {
  const viele = Array.from({ length: FOTOS_MAX + 4 }, (_, i) => `data:image/jpeg;base64,${i}`);
  const mittel = mittelBauen([], new Map([["lf-acne", viele]]));
  assert.equal(mittel[0].fotot.length, FOTOS_MAX,
    "Eine Bahn ohne Ende - und ein paar hundert Kilobyte zu viel");
});

// ══ DIE SUMME ════════════════════════════════════════════════════════
//
// Sie steht an drei Stellen auf der Seite (Kopf, feste Leiste, Blatt)
// und wird einmal gerechnet. Was hier stimmt, stimmt dort dreimal.
test("die Summe rechnet Anzahl mal Preis", () => {
  const mittel = [{ id: "a", cmimi: 33 }, { id: "b", cmimi: 33 }];
  assert.equal(summeVon([{ id: "a", sasia: 2 }, { id: "b", sasia: 1 }], mittel), 99);
  assert.equal(stueckVon([{ id: "a", sasia: 2 }, { id: "b", sasia: 1 }]), 3);
  // Ein Mittel, das es nicht mehr gibt, zaehlt null und wirft nicht.
  assert.equal(summeVon([{ id: "weg", sasia: 3 }], mittel), 0);
});

test("ein kaputter Korb ist ein leerer Korb und kein Fehler", () => {
  const speicher = (wert) => ({ getItem: () => wert });
  assert.deepEqual(korbLesen(speicher("kein json")), []);
  assert.deepEqual(korbLesen(speicher('{"nicht":"liste"}')), []);
  assert.deepEqual(korbLesen(speicher('[{"id":"a","sasia":0}]')), []);
  assert.deepEqual(korbLesen(speicher('[{"id":"a","sasia":99}]')), [{ id: "a", sasia: 9 }],
    "Neunundneunzig Flaschen aus einem gefaelschten Speicher");
  assert.deepEqual(korbLesen(undefined), []);
});

// ══ DIE BESTELLUNG DARF DURCH DIE REGELN ═════════════════════════════
//
// firestore.rules laesst in einer Sitzung nur eine feste Liste von
// Feldern zu (hasOnly) - ein unbekanntes Feld weist das GANZE Dokument
// ab. Die Bestellung waere dann still verloren: kein Fehler auf der
// Seite, keine Zeile in Heart, und die Bestaetigung stuende trotzdem da.
test("jedes Feld der Bestellung steht in firestore.rules", () => {
  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  const hasOnly = regeln.indexOf("hasOnly([", anfang);
  const erlaubt = new Set(
    regeln.slice(hasOnly, regeln.indexOf("])", hasOnly))
      .match(/"[a-zA-Z]+"/g).map((w) => w.slice(1, -1))
  );
  // Was shop.js in schritt() mitgibt, plus was schritt() selbst schreibt.
  for (const feld of ["name", "phone", "address", "order", "step", "timings", "updatedAt"]) {
    assert.ok(erlaubt.has(feld),
      `"${feld}" steht nicht in der Feldliste - die ganze Bestellung faellt durch`);
  }

  // Und der Schritt selbst muss die Regel passieren.
  const stufen = regeln.slice(regeln.indexOf('data.step in [', anfang));
  assert.match(stufen.slice(0, stufen.indexOf("]")), /"ordered"/,
    'Der Schritt "ordered" ist nicht mehr erlaubt');

  // Die Marke der Direktbestellung liegt IN order, nicht daneben:
  // "order" ist als freie Karte erlaubt, ein eigenes Feld waere es nicht.
  assert.match(laden, /kind: "shop"/,
    "Heart erkennt die Direktbestellung nicht mehr an order.kind");
  assert.ok(!/typ: "shop"/.test(laden),
    'typ: "shop" - die Regel laesst dort nur die vier Wege des Trichters zu');
});

// ══ DER KORB GEHOERT DER LANDINGPAGE ═════════════════════════════════
//
// Er liegt in #ls-einstieg. Damit nimmt lifeskin-app.js ihn beim
// Eintritt in den Trichter von selbst weg - kein Schritt des Trichters
// muss etwas davon wissen. Wandert er hinaus, liegt eines Tages ein
// Warenkorb ueber einer Frage der Aerztin.
test("Warenkorb und Raster liegen im Einstiegsbildschirm", () => {
  const anfang = aufbau.indexOf('<section class="ls-schirm" id="ls-einstieg"');
  assert.ok(anfang > 0, "Den Einstiegsbildschirm gibt es nicht mehr");
  const ende = aufbau.indexOf('<section class="ls-schirm"', anfang + 10);
  const einstieg = aufbau.slice(anfang, ende > 0 ? ende : undefined);

  for (const stueck of ['id="shporta"', 'id="produktet"', 'id="korbknopf"']) {
    assert.ok(einstieg.includes(stueck),
      `${stueck} liegt ausserhalb des Einstiegs - es bliebe im Trichter stehen`);
  }
});

test("der Abschnitt der Mittel ist versteckt, bis wirklich etwas darin steht", () => {
  assert.match(aufbau, /<section class="abschnitt" id="produktet" hidden>/,
    "Eine Ueberschrift ueber einem leeren Raster ist schlechter als kein Abschnitt");
  assert.match(laden, /abschnitt\.hidden = false/,
    "Der Abschnitt wird nie aufgedeckt");
});

// Die feste Leiste traegt zwei Knoepfe, und das Stilblatt entscheidet,
// welcher. Ueber hidden waere es ein Augenblick mit beiden oder keinem.
test("die feste Leiste zeigt immer genau einen Knopf", () => {
  assert.match(blatt, /\.dock__korb[^{]*\{ display: none/,
    "Der Warenkorbknopf steht auch bei leerem Korb da");
  assert.match(blatt, /\.dock\[data-korb="ja"\] \.dock__analize[\s\S]{0,60}\{ display: none/,
    "Bei vollem Korb stehen beide Knoepfe da");
  // Und die Zeile darunter wechselt mit: "Analiza falas · pa detyrim
  // për blerje" unter einem Knopf zur Kasse waere eine Zusage ueber
  // etwas anderes.
  assert.match(aufbau, /dock__klein--korb/, "Die Zeile unter dem Knopf wechselt nicht mit");
});

// ══ DIE VERWALTUNG IN HEART ══════════════════════════════════════════
//
// Der Bereich ist die einzige Stelle, an der jemand ohne Code etwas an
// diesem Laden aendert. Was hier kaputtgeht, merkt niemand am Bildschirm -
// es fehlt nur ein Knopf, und ein fehlender Knopf sieht aus wie "geht
// nicht".
test("das Produkt in Heart traegt ganz unten die Bilder der Landingpage", async () => {
  const { renderLifeskin } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const grund = {
    status: "ready", loadedFrom: "network", sitzungen: [], abdeckung: [],
    kennzahlen: {}, trichter: [], herkunft: {}, verteilung: {},
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    produkte: [{ id: "lf-acne", name: "LF ACNE", einzelpreis: 33 }],
    produktOffen: "lf-acne", produktStatus: "", berichte: {}
  };

  // Solange die Bilder noch geholt werden, steht das da - und kein
  // leerer Bereich, der nach "es gibt keine" aussieht.
  const laedt = renderLifeskin({ ...grund, produktEntwurf: null });
  assert.match(laedt, /Bilder fuer die Landingpage/);
  assert.match(laedt, /Bilder werden geladen/);

  // Mit Bildern: je eine Kachel mit ihrer Nummer und einem Kreuz.
  const mit = renderLifeskin({
    ...grund,
    produktEntwurf: { landingFotot: ["data:image/jpeg;base64,a", "data:image/jpeg;base64,b"] }
  });
  assert.equal((mit.match(/heart-lifeskin-landingbild"/g) || []).length, 2,
    "Nicht jedes Bild bekommt eine Kachel");
  assert.match(mit, /data-action="lifeskin-landingbild-weg" data-index="1"/,
    "Ein Bild laesst sich nicht mehr entfernen");
  assert.match(mit, /data-landingfoto/, "Es lassen sich keine Bilder mehr dazulegen");
  assert.match(mit, /multiple/, "Mehrere Bilder in einem Griff gehen nicht mehr");

  // Voll ist voll: kein Knopf mehr, dafuer der Satz warum.
  const voll = renderLifeskin({
    ...grund,
    produktEntwurf: { landingFotot: Array.from({ length: FOTOS_MAX }, (_, i) => `data:image/jpeg;base64,${i}`) }
  });
  assert.ok(!/data-landingfoto/.test(voll), "Ein siebtes Bild laesst sich waehlen");
  assert.match(voll, /Nehmen Sie eines weg/, "Es steht nicht da, warum kein Knopf mehr da ist");

  // Ein Produkt, das es noch nicht gibt, hat noch keine Kennung - und
  // ohne Kennung gibt es keine Stelle, an der die Bilder liegen koennten.
  const neu = renderLifeskin({ ...grund, produktOffen: "__neu", produktEntwurf: null });
  assert.match(neu, /Erst speichern, dann lassen sich hier Bilder anlegen/);
});

test("Heart meldet die Bilder an dieselben Griffe, die es zeichnet", () => {
  const ereignisse = lies("apps/mnyra-heart/heart-events.js");
  const heart = lies("apps/mnyra-heart/heart.js");
  for (const griff of ["lifeskinLandingbilder", "lifeskinLandingbildWeg"]) {
    assert.ok(ereignisse.includes(griff), `heart-events.js ruft ${griff} nicht`);
    assert.match(heart, new RegExp(`${griff}\\(`), `heart.js kennt ${griff} nicht`);
  }
  assert.match(ereignisse, /data-landingfoto/,
    "Die Dateiwahl der Landingbilder wird nicht mehr abgehorcht");
});

// GEMESSEN, NICHT VERMUTET: Eine leere Leinwand ist durchsichtig
// (0,0,0,0). JPEG kennt keine Durchsichtigkeit - was durchsichtig war,
// kommt als (0,0,0) heraus, also schwarz. Freigestellte
// Produktaufnahmen sind fast immer PNG mit durchsichtigem Grund; ohne
// den weissen Grund davor stuende die Flasche auf einem schwarzen
// Kasten, im Befund der Patientin wie im Raster der Landingpage.
test("Heart legt Weiss unter ein Bild, bevor es JPEG daraus macht", () => {
  const heart = lies("apps/mnyra-heart/heart.js");
  const anfang = heart.indexOf("async function produktfotoLesen");
  const ende = heart.indexOf("\n}", heart.indexOf("toDataURL", anfang));
  const block = heart.slice(anfang, ende);
  assert.match(block, /fillStyle = "#FFFFFF"/, "Kein weisser Grund mehr");
  assert.ok(block.indexOf("fillRect") < block.indexOf("drawImage(bild"),
    "Der weisse Grund kommt NACH dem Bild - dann uebermalt er es");
  assert.match(block, /toDataURL\("image\/jpeg"/, "Es wird kein JPEG mehr daraus");
});

// ══ DIE KARTE ZEIGT VIER DINGE UND NICHT SECHS ═══════════════════════
//
// Aufnahme, Name, Zahl, Knopf. Hier standen ausserdem der Untertitel
// ("Terapi kundër aknes") und die Fuellmenge neben dem Preis ("30 ml") -
// an einer Kachel von 160 Punkten zwei Zeilen zwischen der Aufnahme und
// dem Knopf. Was ein Mittel tut, sagt die Analyse an dem Befund, zu dem
// es gehoert.
test("die Produktkarte traegt keinen Untertitel und keine Fuellmenge", () => {
  assert.ok(!/mjeti__nen/.test(laden.replace(/\/\*[\s\S]*?\*\//g, "")),
    "Der Untertitel steht wieder an der Kachel");
  assert.ok(!/mjeti__cmim">\$\{m\.cmimi\} €\$\{m\.inhalt/.test(laden),
    "Die Fuellmenge steht wieder neben dem Preis");
  assert.match(laden, /mjeti__cmim">\$\{m\.cmimi\} €<\/p>/,
    "Der Preis steht nicht mehr allein in seiner Zeile");
});

// ══ DIE AUFNAHME FUELLT DIE KARTE ════════════════════════════════════
//
// GEMESSEN: Mit contain in einem quadratischen Rahmen blieb links und
// rechts heller Rand stehen, an jeder Karte ein anderer - eine Reihe aus
// Bildern, die nicht zusammengehoeren wollen. Die wirklichen Aufnahmen
// sind Produktbilder mit Umgebung, hochkant und quer durcheinander.
test("die Aufnahme fuellt die Karte randlos", () => {
  const regel = blatt.slice(blatt.indexOf(".mjeti__pamje img {"),
    blatt.indexOf("}", blatt.indexOf(".mjeti__pamje img {")));
  assert.match(regel, /object-fit: cover/,
    "Die Aufnahme wird wieder eingepasst - dann steht Rand daneben");
  assert.ok(!/background/.test(regel),
    "Hinter der Aufnahme liegt wieder eine Farbe, die als Rand sichtbar wird");
});

// ══ DIE PUNKTE LAUFEN MIT DEM FINGER ═════════════════════════════════
//
// Hier stand ein Zeitschloss von 60 ms NACH dem letzten Scroll-Ereignis.
// Beim Wischen feuert scroll ununterbrochen - die Punkte sprangen also
// erst um, wenn die Bahn stillstand, und mit Schwung dauert das eine
// halbe Sekunde. Gemessen nach dem Umbau: 40 ms.
test("die Punkte unter den Aufnahmen warten auf nichts", () => {
  const ohneNotizen = laden.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(!/setTimeout\(setzen/.test(ohneNotizen),
    "Die Punkte haengen wieder an einem Zeitschloss und laufen dem Bild hinterher");
  assert.match(ohneNotizen, /requestAnimationFrame\(\(\) => \{ wartet = false; setzen\(\); \}\)/,
    "Die Punkte werden nicht mehr im Bild der Bewegung gerechnet");
});

// ══ DIE KASSE SIEHT AUS WIE DIE KASSE DER BEFUNDSEITE ════════════════
//
// Ein ganzer Bildschirm in drei Teilen - Kopf, scrollende Mitte,
// klebende Leiste -, nicht ein Blatt ueber einer halb sichtbaren Seite.
// Wer hier bestellt, soll denselben Vorgang sehen wie jemand, der aus
// der Analyse kommt; der Unterschied faellt genau dem auf, der zum
// zweiten Mal kauft.
test("die Kasse ist nach der Kasse der Befundseite gebaut", () => {
  const regel = blatt.slice(blatt.indexOf("\n.shporta {"),
    blatt.indexOf("}", blatt.indexOf("\n.shporta {")));
  assert.match(regel, /position: fixed/, "Die Kasse ist kein eigener Bildschirm mehr");
  assert.match(regel, /flex-direction: column/, "Der Aufbau in drei Teilen ist weg");
  assert.match(blatt, /@supports \(height: 100svh\) \{ \.shporta \{ height: 100svh; \} \}/,
    "Ohne svh stuende die Leiste mit dem Knopf unter dem unteren Rand");

  for (const teil of ["shporta__koke", "shporta__mes", "shporta__leiste"]) {
    assert.ok(aufbau.includes(teil), `${teil} fehlt - der Aufbau der Befundseite ist nicht nachgebaut`);
  }
  // Der Knopf steht AUSSERHALB des Formulars und traegt form=... - nur
  // so kann er unten kleben und das Formular trotzdem abschicken.
  assert.match(aufbau, /<button type="submit" form="shportaforme"/,
    "Der Knopf kann das Formular nicht mehr abschicken");
  // Und das Blatt von unten ist wirklich weg.
  assert.ok(!/shporta__flete|shporta__mbulese/.test(aufbau + blatt),
    "Reste des Blattes von unten stehen noch da");
});

// ══ DIE FESTE LEISTE HAT IHREN AEUSSEREN KASTEN ══════════════════════
//
// GEMESSEN, UND ZWAR ZWEIMAL. Die Leiste besteht aus zwei Kaesten: Der
// aeussere liegt fest im Bild und schneidet ab, der innere wird nach
// unten geschoben, solange nichts zu sehen sein soll. Faellt der
// aeussere weg, reicht der innere unter den Dokumentrand und
// verlaengert das Dokument - beim ersten Mal um 123 Punkte, beim
// zweiten Mal (der aeussere fiel einem Ersetzen zum Opfer) um 94.
//
// Am Ende der Seite steht dann ein leerer Streifen, in dem nichts
// liegt, und im Browser von Instagram faellt er als dunkle Flaeche auf.
test("die feste Leiste steht in ihrem abschneidenden Kasten", () => {
  const anfang = aufbau.indexOf('<div class="dock" id="dock"');
  assert.ok(anfang > 0, "Den aeusseren Kasten der Leiste gibt es nicht mehr");
  const leib = aufbau.indexOf('<div class="dock__leib">');
  assert.ok(leib > anfang,
    "Der innere Kasten liegt nicht im aeusseren - er verlaengert damit das Dokument");

  const regel = blatt.slice(blatt.indexOf("\n.dock {"), blatt.indexOf("}", blatt.indexOf("\n.dock {")));
  assert.match(regel, /position: fixed/, "Der aeussere Kasten liegt nicht mehr fest");
  assert.match(regel, /overflow: hidden/, "Der aeussere Kasten schneidet nicht mehr ab");
});
