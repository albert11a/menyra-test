import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import {
  captionAlpha,
  captionArrival,
  captionDeparture,
  colTravel,
  ease,
  panTravel,
  ramp,
  STEP_MS,
  stepFromProgress,
  stepTarget,
  viewBody,
  viewPlate
} from "../apps/menyra-social/lead-landing-2/landing2-scroll.js";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const CSS = fs.readFileSync(
  path.join(ROOT, "apps/menyra-social/lead-landing-2/landing2-styles.css"),
  "utf8"
);

// An dieser Rechnung haengt, was der Wirt sieht.
//
// Sie steht deshalb als eigene Funktion ohne DOM da: Ein Fehler hier ist
// keiner, den man beim Durchscrollen bemerkt - er sieht aus wie eine Seite,
// die "einfach so" einen Schritt ueberspringt.

test("der Fortschritt trifft die Schritte gleichmaessig", () => {
  assert.equal(stepFromProgress(0, 4), 0);
  assert.equal(stepFromProgress(0.2, 4), 0);
  assert.equal(stepFromProgress(0.25, 4), 1);
  assert.equal(stepFromProgress(0.5, 4), 2);
  assert.equal(stepFromProgress(0.75, 4), 3);
  assert.equal(stepFromProgress(1, 4), 3);
});

test("ausserhalb der Strecke bleibt es beim ersten und letzten Schritt", () => {
  // Ueber dem Abschnitt und unter ihm wird weiter gerechnet - dort darf nichts
  // Undefiniertes herauskommen, sonst blitzt beim schnellen Wischen eine leere
  // Flaeche auf.
  assert.equal(stepFromProgress(-3, 4), 0);
  assert.equal(stepFromProgress(9, 4), 3);
  assert.equal(stepFromProgress(Number.NaN, 4), 0);
  assert.equal(stepFromProgress(Number.POSITIVE_INFINITY, 4), 3);
});

test("eine Sequenz mit einem Schritt bleibt bei null", () => {
  assert.equal(stepFromProgress(0, 1), 0);
  assert.equal(stepFromProgress(0.99, 1), 0);
  assert.equal(stepFromProgress(1, 1), 0);
  // Auch eine kaputte Angabe darf keinen Schritt -1 ergeben.
  assert.equal(stepFromProgress(0.5, 0), 0);
});

/* ------------------------------------------- Der Wechsel als Bewegung */

// Der Scrollstand sagt, WELCHER Schritt gilt. Der Wechsel dorthin ist eine
// eigene Bewegung, die in einem Zug durchlaeuft - sie klebt nicht am Finger.
//
// Damit haengt an stepTarget, wann ueberhaupt gewechselt wird. Ein Wechsel zu
// viel oder zu wenig ist nichts, was man beim Durchscrollen als Fehler
// erkennt: Es sieht aus wie eine Seite, die "einfach so" einen Schritt
// ueberspringt.

test("der Zielschritt folgt dem Scrollstand", () => {
  assert.equal(stepTarget(0, 4, 0), 0);
  assert.equal(stepTarget(0.5, 4, 0), 0);
  assert.equal(stepTarget(1.5, 4, 0), 1);
  assert.equal(stepTarget(2.5, 4, 1), 2);
  assert.equal(stepTarget(3.5, 4, 2), 3);
  // Ueber das Ende hinaus bleibt es beim letzten Schritt.
  assert.equal(stepTarget(9, 4, 3), 3);
  assert.equal(stepTarget(-4, 4, 2), 0);
  assert.equal(stepTarget(Number.NaN, 4, 2), 0);
});

test("ein schneller Wisch ueberspringt keine Schritte im Ziel", () => {
  // Wer von ganz oben nach ganz unten wischt, landet beim letzten Schritt -
  // nicht beim zweiten, weil die Rechnung nur einen Schritt je Auswertung
  // weiterginge.
  assert.equal(stepTarget(3.9, 4, 0), 3);
  assert.equal(stepTarget(0.1, 4, 3), 0);
});

test("der Zielschritt flattert nicht an seiner Grenze", () => {
  // Ein Finger, der genau auf der Kante zur Ruhe kommt, wackelt um wenige
  // Pixel. Ohne Saum ergaebe das ein Hin und Her zwischen zwei Schritten -
  // und das sieht aus wie ein Wackelkontakt.
  assert.equal(stepTarget(1.01, 4, 0), 0, "der Wechsel kommt zu frueh");
  assert.equal(stepTarget(1.05, 4, 0), 1);
  assert.equal(stepTarget(0.99, 4, 1), 1, "der Rueckwechsel kommt zu frueh");
  assert.equal(stepTarget(0.95, 4, 1), 0);
  // Im Saum bleibt stehen, was steht - dieselbe Stelle, je nach
  // Anfahrtsrichtung ein anderer Stand. Das ist der Sinn des Saums, und
  // deshalb muss er schmal bleiben: Bei einer Bildschirmhoehe je Schritt sind
  // das rund zwanzig Punkte, zu wenig zum Bemerken.
  assert.equal(stepTarget(1.01, 4, 1), 1);
  assert.equal(stepTarget(1.01, 4, 0), 0);
});

test("ein Wechsel dauert lange genug, um gesehen zu werden", () => {
  // Kuerzer als ein Viertel einer Sekunde liest sich als Umspringen, laenger
  // als zwei Drittel als Warten.
  assert.ok(STEP_MS >= 250 && STEP_MS <= 700, `ein Wechsel dauert ${STEP_MS}ms`);
});

/* --------------------------------------------- Die stetige Rechnung */

// Was in einer Sequenz zu sehen ist, ist eine reine Funktion des
// Scrollstands. Kein Schalter, kein "once = true", keine eigene
// Rueckwaertslogik - und genau das machen die folgenden Tests nachpruefbar.
//
// Der teuerste Fehler an dieser Stelle sieht nicht nach Fehler aus: Ein
// Zustand, der beim Hochscrollen haengen bleibt, wirkt wie ein Ruckler im
// Geraet und nicht wie ein Programmfehler.

test("die Rampe bleibt zwischen 0 und 1 und steigt dazwischen", () => {
  assert.equal(ramp(-5, 0, 1), 0);
  assert.equal(ramp(0, 0, 1), 0);
  assert.equal(ramp(0.5, 0, 1), 0.5);
  assert.equal(ramp(1, 0, 1), 1);
  assert.equal(ramp(9, 0, 1), 1);
  // Eine Strecke ohne Laenge ist eine Schwelle, kein Fehler.
  assert.equal(ramp(0.4, 0.5, 0.5), 0);
  assert.equal(ramp(0.6, 0.5, 0.5), 1);
  assert.equal(ramp(Number.NaN, 0, 1), 0);
});

test("die Beschleunigung faengt bei 0 an und hoert bei 1 auf", () => {
  assert.equal(ease(0), 0);
  assert.equal(ease(1), 1);
  assert.equal(ease(0.5), 0.5);
  assert.ok(ease(0.25) < 0.25, "der Anlauf ist nicht weich");
  assert.ok(ease(0.75) > 0.75, "das Auslaufen ist nicht weich");
});

test("die erste Flaeche liegt immer offen, jede weitere legt sich darueber", () => {
  // Der Grund, warum beim Wechsel nie der Seitenhintergrund durchscheint.
  for (let u = 0; u <= 3; u += 0.05) {
    assert.equal(viewPlate(u, 0), 1);
    assert.equal(viewBody(u, 0), 1);
  }
  assert.equal(viewPlate(0, 1), 0);
  assert.equal(viewPlate(1, 1), 1);
  assert.equal(viewPlate(2, 1), 1, "eine einmal aufgelegte Flaeche verschwindet wieder");
  assert.equal(viewPlate(1, 2), 0, "der dritte Schritt ist schon beim zweiten zu sehen");
  assert.equal(viewPlate(2, 2), 1);
});

test("nie stehen zwei Mnyra-Oberflaechen halbdurchsichtig uebereinander", () => {
  // Der teuerste Uebergang der Seite, wenn man ihn falsch macht: Zwei
  // vollstaendige Oberflaechen ineinander - zwei Suchfelder, zwei Listen,
  // zwei Preise. Das liest niemand als Uebergang.
  //
  // Deshalb kommt erst die leere Scheibe und dann ihr Inhalt: Solange der
  // Inhalt eines Schrittes zu sehen ist, deckt seine Scheibe schon ganz.
  for (let u = 0; u <= 4.0001; u += 0.005) {
    for (let index = 1; index < 4; index += 1) {
      const body = viewBody(u, index);
      if (body <= 0.001) continue;
      assert.equal(
        viewPlate(u, index),
        1,
        `bei u=${u.toFixed(3)} steht der Inhalt von Schritt ${index} auf einer Scheibe, die erst zu ${viewPlate(u, index)} liegt`
      );
    }
  }
});

test("keine Flaeche springt - sie steigt Schritt fuer Schritt", () => {
  [viewPlate, viewBody].forEach((fn) => {
    for (let index = 0; index < 4; index += 1) {
      let previous = -1;
      let jump = 0;
      for (let u = -1; u <= 5; u += 0.01) {
        const alpha = fn(u, index);
        if (previous >= 0) {
          assert.ok(alpha >= previous - 1e-9, `${fn.name} ${index} wird bei u=${u} wieder durchsichtig`);
          jump = Math.max(jump, alpha - previous);
        }
        previous = alpha;
      }
      // Ein Hundertstel Schritt darf hoechstens ein paar Prozent Deckkraft
      // bringen. Alles darueber waere eine Schwelle mit anderem Namen.
      assert.ok(jump < 0.12, `${fn.name} ${index} springt um ${jump}`);
    }
  });
});

test("dieselbe Stelle ergibt dieselbe Ansicht - egal aus welcher Richtung", () => {
  // Es gibt keine Rueckwaertslogik, weil es nichts gibt, das sich merken
  // koennte, woher der Finger kam. Dieser Test haelt das fest: Wer 0 -> 1 -> 0
  // scrollt, sieht auf dem Rueckweg exakt dieselben Werte wie auf dem Hinweg.
  const stand = (index) => {
    const u = index * 0.02;
    return [viewPlate(u, 1), viewBody(u, 1), viewPlate(u, 2), viewBody(u, 2), captionAlpha(u, 1, 3), captionAlpha(u, 2, 3)];
  };
  const schritte = 150;
  const runter = [];
  const rauf = [];
  for (let index = 0; index <= schritte; index += 1) runter.push(stand(index));
  for (let index = schritte; index >= 0; index -= 1) rauf.push(stand(index));
  assert.deepEqual(rauf.reverse(), runter);
});

test("bei jedem Schritt steht genau ein Satz da", () => {
  for (let step = 0; step < 4; step += 1) {
    const values = [0, 1, 2, 3].map((index) => captionAlpha(step, index, 4));
    assert.equal(values[step], 1, `beim Schritt ${step} steht sein Satz nicht ganz da`);
    values.forEach((value, index) => {
      if (index === step) return;
      assert.equal(value, 0, `beim Schritt ${step} steht auch der Satz ${index} noch da`);
    });
  }
});

test("nie stehen zwei Saetze zugleich da", () => {
  // Das war der erste Versuch: der alte Satz geht, waehrend der neue kommt.
  // In der Mitte standen dann zwei halbdurchsichtige Ueberschriften
  // uebereinander - wer dort langsam scrollt, liest das als Fehler und nicht
  // als Wechsel. Anders als bei den Flaechen hilft kein Uebereinanderlegen:
  // Ein Satz hat keinen eigenen Grund.
  for (let u = 0; u <= 3.0001; u += 0.005) {
    const sichtbar = [0, 1, 2, 3].map((index) => captionAlpha(u, index, 4)).filter((v) => v > 0.02);
    assert.ok(sichtbar.length <= 1, `bei u=${u.toFixed(3)} stehen ${sichtbar.length} Saetze da: ${sichtbar}`);
  }
});

test("die Luecke zwischen zwei Saetzen ist ein Wimpernschlag", () => {
  // Zwischen dem alten und dem neuen Satz liegt eine Weile ohne Satz. Sie
  // wird jetzt in Millisekunden gemessen, nicht mehr in Scrollweg: Der Wechsel
  // ist eine Bewegung, die von selbst durchlaeuft. Achtzig Millisekunden sind
  // ein Wimpernschlag; laenger stuende die Buehne sichtbar ohne Beschriftung
  // da, und niemand wuesste, worauf er schaut.
  let luecke = 0;
  let laengste = 0;
  for (let a = 0; a <= 3.0001; a += 0.002) {
    const summe = [0, 1, 2, 3].reduce((sum, index) => sum + captionAlpha(a, index, 4), 0);
    luecke = summe < 0.1 ? luecke + 0.002 : 0;
    laengste = Math.max(laengste, luecke);
  }
  assert.ok(
    laengste * STEP_MS < 80,
    `die Buehne steht ${Math.round(laengste * STEP_MS)}ms ohne Satz da`
  );
});

test("die Beschriftung wechselt vor der Flaeche, nicht mit ihr", () => {
  // Man liest "Menuja jote", und dann kommt die Menue. Andersherum fragt sich
  // der Wirt "warum ist da jetzt etwas anderes?" - und wer sich das fragt,
  // liest nicht weiter.
  const halbeBeschriftung = suche((a) => captionArrival(a, 1) >= 0.5);
  const halbeFlaeche = suche((a) => viewPlate(a, 1) >= 0.5);
  const vorlauf = (halbeFlaeche - halbeBeschriftung) * STEP_MS;
  assert.ok(vorlauf > 100, `die Flaeche wechselt nur ${Math.round(vorlauf)}ms nach dem Satz`);
});

test("der letzte Satz geht nicht, und der erste kommt nicht von irgendwo", () => {
  // Sonst stuende die Sequenz an ihrem Anfang und an ihrem Ende ohne Satz da.
  assert.equal(captionArrival(0, 0), 1);
  assert.equal(captionDeparture(3, 3, 4), 1);
  assert.equal(captionAlpha(0, 0, 4), 1);
  assert.equal(captionAlpha(3, 3, 4), 1);
});

function suche(bedingung) {
  for (let u = 0; u <= 4; u += 0.001) {
    if (bedingung(u)) return u;
  }
  return Number.POSITIVE_INFINITY;
}

test("die Hoehe eines Abschnitts folgt der Zahl der Schritte", () => {
  // Ohne diese Rechnung bekaeme jede Sequenz dieselbe Strecke - eine mit vier
  // Schritten waere dann doppelt so schnell wie eine mit zwei.
  assert.match(CSS, /min-height:\s*calc\(\(var\(--l2-steps[^)]*\)\s*\+\s*1\)\s*\*\s*var\(--l2-vh\)\)/);
});

test("die Bildschirmhoehe wird festgenagelt, nicht bei jedem Wisch gemessen", () => {
  const code = fs.readFileSync(
    path.join(ROOT, "apps/menyra-social/lead-landing-2/landing2-scroll.js"),
    "utf8"
  );
  assert.ok(code.includes("--l2-vh"), "die Hoehe wird nirgends gesetzt");
  // Kleine Aenderungen sind die Adressleiste, keine Drehung. Wer darauf neu
  // misst, misst bei jedem Wisch neu.
  assert.ok(code.includes("HEIGHT_NOISE_PX"), "jede kleine Hoehenaenderung loest ein Neumessen aus");
  assert.ok(code.includes("requestAnimationFrame"), "beim Scrollen wird ungebremst gerechnet");
  assert.ok(code.includes("{ passive: true }"), "die Scroll-Listener blockieren das Wischen");
});

test("die Buehne wird vom Finger gefahren, nicht von einer Uebergangszeit", () => {
  // Eine transition an der Flaeche waere ein zweiter Antrieb neben dem
  // Scrollstand: Sie liefe der Bewegung hinterher, und wer mitten im Wischen
  // umkehrt, saehe sie noch ein Stueck in die alte Richtung weiterlaufen.
  const view = CSS.slice(CSS.indexOf(".l2-seq__view {"), CSS.indexOf(".l2-seq__view:first-child"));
  assert.ok(!/transition/.test(view), ".l2-seq__view hat eine eigene Uebergangszeit");
  const caption = CSS.slice(CSS.indexOf(".l2-seq__caption {"), CSS.indexOf(".l2-seq__caption:first-child"));
  assert.ok(!/transition/.test(caption), ".l2-seq__caption hat eine eigene Uebergangszeit");
  // Und bevor das Skript zum ersten Mal gerechnet hat, steht der erste
  // Schritt da - nicht eine leere Flaeche.
  assert.match(CSS, /\.l2-seq__view:first-child \{ opacity: 1; \}/);
  assert.match(CSS, /\.l2-seq__caption:first-child \{ opacity: 1; \}/);
});

test("der Kasten der Beschriftung behaelt seine Hoehe", () => {
  // Sonst richtet sich seine Hoehe nach dem Satz, der gerade dasteht - und
  // Buehne und Punkte ruecken bei jedem Wechsel um eine Zeile. Gemessen wird
  // der laengste Satz im Stillstand (landing2-scroll.js).
  const block = CSS.slice(CSS.indexOf(".l2-seq__captions {"), CSS.indexOf(".l2-seq__caption {"));
  assert.match(block, /height: var\(--l2-cap-h/);
  const code = fs.readFileSync(
    path.join(ROOT, "apps/menyra-social/lead-landing-2/landing2-scroll.js"),
    "utf8"
  );
  assert.ok(code.includes("--l2-cap-h"), "die Hoehe der Beschriftung wird nirgends gemessen");
});

test("in der Vorschau gibt es keine zweite Scrollebene", () => {
  // Der Inhalt darf laenger sein als sein Fenster - geschoben wird er aber vom
  // Scrollstand der Seite, nicht von einem eigenen Scrollbereich. Zwei
  // Scrollebenen gleichzeitig sind auf dem Handy die eine Sache, die man nicht
  // bedienen kann.
  const block = CSS.slice(CSS.indexOf(".l2-screen__pan {"), CSS.indexOf(".l2-steps {"));
  assert.ok(!/overflow:\s*(auto|scroll)/.test(block), "das Fenster der Vorschau scrollt selbst");
  assert.match(block, /\.l2-screen__pan--move \{[^}]*min-height: 100%/);
});

test("die Seite nimmt niemandem das Scrollen ab", () => {
  const code = fs.readFileSync(
    path.join(ROOT, "apps/menyra-social/lead-landing-2/landing2-scroll.js"),
    "utf8"
  );
  ["scrollTo(", "scrollIntoView", "preventDefault", "touchmove", "wheel"].forEach((token) => {
    assert.ok(!code.includes(token), `landing2-scroll.js enthaelt "${token}" - die Seite greift ins Scrollen ein`);
  });
  assert.ok(!/scroll-snap/.test(CSS), "die Seite rastet beim Scrollen ein");
});

test("die Buehne haengt nicht an der Adressleiste von Safari", () => {
  // dvh ist die gerade sichtbare Hoehe: Sie aendert sich, waehrend Safari im
  // Wischen seine Leisten ein- und ausblendet - und mit ihr jede Buehne der
  // Seite mitten in der Bewegung.
  assert.ok(!/100dvh/.test(CSS), "die Seite rechnet mit 100dvh");
  assert.match(CSS, /@supports \(height: 100svh\)[\s\S]{0,80}--l2-vh: 100svh/);
  // Und keine rohe vh-Hoehe an einer Flaeche: Alles, was so hoch ist wie der
  // Bildschirm, geht ueber dieselbe festgenagelte Marke.
  const roh = Array.from(CSS.matchAll(/height:[^;]*\b\d+(?:\.\d+)?vh\b/g)).map((t) => t[0]);
  assert.deepEqual(roh, [], `rohe vh-Hoehen: ${roh.join(", ")}`);
});

test("ohne Bewegung hoert ein Vorleser jeden Schritt", () => {
  // In der Bewegung ist immer nur ein Schritt zu sehen; die uebrigen sind fuer
  // den Vorleser verborgen. Ohne Bewegung stehen alle da - dann muessen sie
  // auch alle zu hoeren sein, sonst waere gerade diese Fassung die gekuerzte.
  const code = fs.readFileSync(
    path.join(ROOT, "apps/menyra-social/lead-landing-2/landing2-scroll.js"),
    "utf8"
  );
  const reduced = code.slice(code.indexOf("if (reduced) {"), code.indexOf("const remeasure = startSequences();"));
  assert.match(reduced, /removeAttribute\("aria-hidden"\)/);
});

test("ohne Bewegung steht dieselbe Seite untereinander da", () => {
  // Nicht eine gekuerzte Fassung: Wer Bewegung abgestellt hat, soll alles
  // sehen, nur ohne die Bewegung.
  assert.match(CSS, /\.l2-reduced \.l2-seq__view \{[^}]*opacity: 1/);
  assert.match(CSS, /\.l2-reduced \.l2-seq__caption \{[^}]*opacity: 1/);
  assert.match(CSS, /\.l2-reduced \.l2-seq__sticky \{[^}]*position: static/);
});

/* ------------------------------------------- Die beiden stetigen Wege */

// Der Kopf, der aus dem Bild wandert, und der Inhalt, der im Fenster laeuft.
//
// Sie sind das, was aus einer Reihe von Aufnahmen einen Bildschirm macht.
// Alles andere auf dieser Seite darf eine Bewegung sein, die von selbst
// durchlaeuft - diese beiden nicht: Sie sind ein Scroll, und ein Scroll haengt
// am Finger.

test("der Kopf wandert am Scrollstand und nicht an einer Bewegung", () => {
  // Am Anfang eines Schrittes steht er, am Ende ist er weg - und dazwischen
  // ist jede Stelle eindeutig.
  assert.equal(colTravel(0, 0), 0);
  assert.equal(colTravel(1, 0), 1);
  assert.equal(colTravel(2, 1), 1);
  assert.equal(colTravel(0.5, 1), 0, "der Kopf des zweiten Schrittes wandert schon im ersten");
  // Ein Augenblick Ruhe am Anfang: Der erste Zustand ist ein Bild und nicht
  // nur der eine Punkt, an dem der Scrollstand genau null ist.
  assert.equal(colTravel(0.05, 0), 0, "der Kopf laeuft sofort los");
  assert.ok(colTravel(0.2, 0) > 0, "der Kopf wartet zu lange");
});

test("Kopf und Inhalt laufen gerade - nicht weich", () => {
  // Eine weiche Kurve ist in der Mitte anderthalbmal so schnell wie im
  // Schnitt. Bei einer Bewegung, die von selbst durchlaeuft, ist das richtig;
  // hier waere es der Grund, warum sich eine Vorschau anfuehlt, als scrollte
  // sie von selbst. Ein Scroll IST gerade.
  [colTravel, panTravel].forEach((fn) => {
    // Anfang und Ende des Weges ausmessen statt sie zu wissen: Die beiden
    // Fenster sind verschieden lang, und dieser Test prueft die FORM des
    // Weges, nicht seine Lage.
    let von = 0;
    let bis = 1;
    for (let u = 0; u <= 1.001; u += 0.001) {
      if (fn(u, 0) <= 0) von = u;
      if (fn(u, 0) >= 1) { bis = u; break; }
    }
    for (let t = 0.05; t <= 0.95; t += 0.05) {
      const mitte = fn(von + t * (bis - von), 0);
      assert.ok(
        Math.abs(mitte - t) < 0.02,
        `${fn.name} laeuft bei ${t.toFixed(2)} nicht gerade, sondern bei ${mitte.toFixed(3)}`
      );
    }
  });
});

test("nichts im Fenster bewegt sich schneller als der Finger", () => {
  // Die eine Bedingung, an der die Zahlen haengen. Ein Schritt ist genau eine
  // Bildschirmhoehe Weg; laeuft der Inhalt darin weiter als diese Hoehe, ist
  // er schneller als die Seite - und dann sucht ein Daumen den zweiten
  // Scrollbereich, den es hier nicht gibt.
  const code = fs.readFileSync(
    path.join(ROOT, "apps/menyra-social/lead-landing-2/landing2-scroll.js"),
    "utf8"
  );
  const anteil = Number((/const MAX_PAN_VH = ([\d.]+);/.exec(code) || [])[1]);
  assert.ok(Number.isFinite(anteil), "die Obergrenze fuer den Versatz steht nicht mehr im Code");
  // Groesste Steigung des Weges, in Bildschirmhoehen je Bildschirmhoehe
  // Scroll. Weil er gerade laeuft, ist sie ueberall dieselbe.
  const schritt = 0.001;
  let steilste = 0;
  for (let u = 0; u < 1; u += schritt) {
    steilste = Math.max(steilste, (panTravel(u + schritt, 0) - panTravel(u, 0)) / schritt);
  }
  assert.ok(
    steilste * anteil < 1,
    `der Inhalt laeuft mit dem ${(steilste * anteil).toFixed(2)}-fachen der Fingergeschwindigkeit`
  );
});

test("der Kopf ist weg, bevor der naechste Zustand gilt", () => {
  // Sonst stuende die Reiterleiste beim Wechsel auf Menu noch unterwegs - und
  // der Wirt saehe zwei Dinge zugleich, die nacheinander gehoeren.
  assert.equal(colTravel(0.99, 0), 1, "der Kopf ist an der Grenze noch nicht ganz weg");
});

test("nichts laeuft seitlich aus dem Bild", () => {
  // Der haeufigste Fehler auf 320px - und der einzige, den man sofort sieht.
  assert.match(CSS, /body \{[^}]*overflow-x: hidden/);
});

test("das Stylesheet fasst nur eigene Namen an", () => {
  // Kein Name aus der App, keiner aus der Lead-Landing. Alles faengt mit l2-
  // an; die wenigen Element-Regeln (body, img, a:focus) bleiben in dieser
  // einen Seite.
  const selectors = Array.from(CSS.matchAll(/^\s*\.([a-zA-Z][\w-]*)/gm)).map((m) => m[1]);
  const fremd = selectors.filter((name) => !name.startsWith("l2-") && name !== "is-in" && name !== "is-active" && name !== "is-own" && name !== "is-muted");
  assert.deepEqual(fremd, [], `fremde Klassennamen im Stylesheet: ${fremd.join(", ")}`);
});
