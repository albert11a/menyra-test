// Wohin der Kopf zeigt - und wie weit der Kreis schon herum ist.
//
// ZWEITE FASSUNG. Die erste rechnete die Blickrichtung aus der Verschiebung
// des Hautrechtecks, das lifeskin-face.js findet. Im Betrieb liess sich der
// Kreis damit kaum schliessen, und der Grund war nicht die Einstellung der
// Schwellen: Das Rechteck ist bei Vollbart unruhig, also zappelte die
// Richtung, also ging kein Strich zu. Ein zappelndes Signal wird durch keine
// Schwelle ruhig.
//
// Jetzt kommt die Richtung aus dem Gesichtsnetz (lifeskin-netz.js), und zwar
// aus zwei Quellen mit klarer Arbeitsteilung:
//
//   RICHTUNG aus der Lage der Nasenspitze zur Augenmitte, im Bild gemessen.
//   BETRAG   aus der Transformationsmatrix, in Grad.
//
// WARUM NICHT BEIDES AUS DER MATRIX, obwohl sie beides hergibt: Weil deren
// Vorzeichenkonvention nicht dokumentiert ist. Ich habe versucht, sie mit
// verzerrten Bildern nachzumessen, und die Verzerrung war in Wahrheit ein
// Schub - das Ergebnis war ein Artefakt und haette den Ring falsch herum
// laufen lassen. Ein falsches Vorzeichen ist hier kein kleiner Fehler: Der
// Besucher dreht den Kopf, der Ring geht auf der Gegenseite zu, und es fuehlt
// sich kaputt an.
//
// Die Lage der Nase zur Augenmitte kann dieses Vorzeichen nicht haben. Dreht
// der Kopf nach rechts, wandert die Nasenspitze im Bild nach rechts - das ist
// keine Konvention, das ist zu sehen. Und weil die Vorschau gespiegelt ist
// und dasselbe gespiegelte Bild vermessen wird, ist "rechts im Bild" genau
// das, was der Besucher im Spiegel als rechts sieht.
//
// Der Betrag darf aus der Matrix kommen, denn ein Betrag hat kein Vorzeichen.
// Damit steht die Schwelle in Grad und nicht in einer erfundenen Einheit:
// achtzehn Grad sind eine bequeme Kopfdrehung, und das kann jeder nachpruefen.

import { MARKE } from "./lifeskin-netz.js";

export const SEKTOREN = 12;

export const POSE_GRENZEN = Object.freeze({
  // Ab wie vielen Grad eine Richtung als angesteuert gilt, und ab wann der
  // Kopf wieder als geradeaus. Der Abstand dazwischen ist Absicht: Ohne ihn
  // flackert der Ring am Rand der Schwelle.
  schwelleGrad: 18,
  mitteGrad: 7,

  // Der Nullpunkt wird gemessen, nicht angenommen: Jeder haelt das Handy
  // anders, und ein Kopf, der bequem sitzt, steht selten auf null Grad.
  kalibrierBilder: 5,
  kalibrierStreuungGrad: 4,
  kalibrierNotstartMs: 4000,

  // Ein Strich geht erst nach zwei Bildern zu. Ein einzelnes Bild kann ein
  // Ausrutscher sein.
  haltebilder: 2,
  mindestAbstandMs: 220,

  // Der Ring darf niemanden einsperren. Wer steif sitzt, wer das Handy
  // aufgestellt hat, wer den Kopf nicht drehen kann: Fuer den sinkt die
  // Schwelle, und irgendwann geht es auch ohne.
  lockerungAbMs: 9000,
  lockerungFaktor: 0.72,
  zweiteLockerungAbMs: 15000,
  zweiteLockerungFaktor: 0.52,
  hoechstdauerMs: 24000,
  ohneFortschrittMs: 15000,
  mindestdauerMs: 4000,
  mindestAnteil: 0.7
});

function median(werte) {
  if (!werte.length) return 0;
  const s = [...werte].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function streuung(werte) {
  if (werte.length < 2) return 0;
  return Math.max(...werte) - Math.min(...werte);
}

// Richtung aus dem Bild, Betrag aus der Matrix.
//
// Die Nasenspitze wird gegen die Mitte der beiden aeusseren Augenwinkel
// gemessen und am Augenabstand normiert - dadurch haengt das Ergebnis weder
// an der Bildgroesse noch daran, wie nah jemand am Handy sitzt.
export function richtungAusNetz(netz) {
  if (!netz?.punkte) return null;
  const p = netz.punkte;
  const links = p[MARKE.augeLinksAussen];
  const rechts = p[MARKE.augeRechtsAussen];
  const nase = p[MARKE.nasenspitze];
  if (!links || !rechts || !nase) return null;

  const augenabstand = Math.hypot(rechts.x - links.x, rechts.y - links.y);
  if (!(augenabstand > 1e-4)) return null;

  const mitteX = (links.x + rechts.x) / 2;
  const mitteY = (links.y + rechts.y) / 2;
  return {
    // Roh, noch ohne Nullpunkt. Den zieht der Ringlauf ab.
    x: (nase.x - mitteX) / augenabstand,
    y: (nase.y - mitteY) / augenabstand,
    // Der Betrag der Kopfdrehung in Grad, aus der Matrix. Roll faellt heraus:
    // Ein geneigter Kopf schaut nicht zur Seite.
    grad: Math.hypot(netz.pose?.yaw || 0, netz.pose?.pitch || 0),
    pose: netz.pose || null
  };
}

// Aus der Richtung wird ein Strich am Ring.
//
// Null steht oben, gezaehlt wird im Uhrzeigersinn - so, wie ein Mensch einen
// Kreis abfaehrt. In Bildkoordinaten waechst y nach unten, daher das Minus.
export function sektorAus(x, y, sektoren = SEKTOREN) {
  const winkel = (Math.atan2(x, -y) + Math.PI * 2) % (Math.PI * 2);
  return { winkel, sektor: Math.floor(winkel / ((Math.PI * 2) / sektoren)) % sektoren };
}

export class Ringlauf {
  constructor({ sektoren = SEKTOREN, grenzen = POSE_GRENZEN, jetzt = Date.now() } = {}) {
    this.sektoren = sektoren;
    this.grenzen = grenzen;
    this.begonnen = jetzt;
    this.abgedeckt = new Array(sektoren).fill(false);
    this.halten = new Array(sektoren).fill(0);
    this.muster = [];
    this.nullpunkt = null;
    this.kalibriert = false;
    this.frontalGenommen = false;
    this.letzteAufnahme = 0;
    this.letzterSektor = null;
  }

  get anteil() {
    return this.abgedeckt.filter(Boolean).length / this.sektoren;
  }

  schwelleBei(jetzt) {
    const dauer = jetzt - this.begonnen;
    const g = this.grenzen;
    if (dauer >= g.zweiteLockerungAbMs) return g.schwelleGrad * g.zweiteLockerungFaktor;
    if (dauer >= g.lockerungAbMs) return g.schwelleGrad * g.lockerungFaktor;
    return g.schwelleGrad;
  }

  #kalibriere(richtung, jetzt) {
    const g = this.grenzen;
    this.muster.push(richtung);
    if (this.muster.length > g.kalibrierBilder) this.muster.shift();
    if (this.muster.length < g.kalibrierBilder) return false;

    const notstart = jetzt - this.begonnen >= g.kalibrierNotstartMs;
    // Ruhig muss es sein: Wer sich waehrend der Einmessung schon dreht,
    // bekaeme eine Drehung als Nullpunkt und danach einen Ring, der auf einer
    // Seite nie zugeht. Gemessen wird die Ruhe in Grad - dieselbe Einheit,
    // in der auch die Schwelle steht.
    if (!notstart && streuung(this.muster.map((r) => r.grad)) >= g.kalibrierStreuungGrad) return false;

    this.nullpunkt = {
      x: median(this.muster.map((r) => r.x)),
      y: median(this.muster.map((r) => r.y))
    };
    this.kalibriert = true;
    return true;
  }

  zielSektor(von = 0) {
    for (let i = 0; i < this.sektoren; i += 1) {
      const s = (von + i) % this.sektoren;
      if (!this.abgedeckt[s]) return s;
    }
    return null;
  }

  fertigBei(jetzt) {
    const g = this.grenzen;
    const dauer = jetzt - this.begonnen;
    if (dauer >= g.hoechstdauerMs) return true;
    if (!this.frontalGenommen) return false;
    if (this.anteil >= 1) return true;
    if (this.anteil === 0 && dauer >= g.ohneFortschrittMs) return true;
    return this.anteil >= g.mindestAnteil && dauer >= g.mindestdauerMs;
  }

  // Ein Bild, ein Schritt. `netz` ist das Ergebnis von messeNetz() oder null.
  schritt(netz, jetzt = Date.now()) {
    const richtung = richtungAusNetz(netz);
    if (!richtung) return this.#stand(jetzt, { verloren: true });

    if (!this.kalibriert) {
      const geschafft = this.#kalibriere(richtung, jetzt);
      return this.#stand(jetzt, { frontalFaellig: geschafft && !this.frontalGenommen });
    }

    // Richtung aus dem Bild, Laenge aus den Grad. Ein Einheitsvektor mal
    // Betrag: So steht der Ausschlag in Grad, ohne dass das Vorzeichen der
    // Matrix gebraucht wird.
    const vx = richtung.x - this.nullpunkt.x;
    const vy = richtung.y - this.nullpunkt.y;
    const laenge = Math.hypot(vx, vy);
    const grad = richtung.grad;
    if (!(laenge > 1e-5)) return this.#stand(jetzt, { betrag: grad, mitte: grad <= this.grenzen.mitteGrad });

    const { winkel, sektor } = sektorAus(vx / laenge, vy / laenge, this.sektoren);
    const schwelle = this.schwelleBei(jetzt);

    let neuerSektor = null;
    if (grad >= schwelle) {
      this.letzterSektor = sektor;
      for (let i = 0; i < this.sektoren; i += 1) if (i !== sektor) this.halten[i] = 0;
      this.halten[sektor] += 1;
      if (!this.abgedeckt[sektor] && this.halten[sektor] >= this.grenzen.haltebilder
        && jetzt - this.letzteAufnahme >= this.grenzen.mindestAbstandMs) {
        this.abgedeckt[sektor] = true;
        this.letzteAufnahme = jetzt;
        neuerSektor = sektor;
      }
    } else if (grad <= this.grenzen.mitteGrad) {
      this.halten.fill(0);
    }

    return this.#stand(jetzt, {
      betrag: grad, winkel, sektor: grad >= schwelle ? sektor : null, neuerSektor,
      // Kommt der Kopf nach der Runde in die Mitte zurueck, ist das die
      // zweite Gelegenheit fuer ein gerades Bild. Mehr gerade Bilder heissen
      // einen stabileren Median - und damit denselben Befund beim zweiten
      // Anlauf.
      mitte: grad <= this.grenzen.mitteGrad,
      pose: richtung.pose
    });
  }

  #stand(jetzt, teil) {
    return {
      kalibriert: this.kalibriert,
      abgedeckt: [...this.abgedeckt],
      anteil: this.anteil,
      sektoren: this.sektoren,
      zielSektor: this.zielSektor(this.letzterSektor === null ? 0 : this.letzterSektor),
      dauerMs: jetzt - this.begonnen,
      fertig: this.fertigBei(jetzt),
      betrag: 0, winkel: null, sektor: null, neuerSektor: null,
      frontalFaellig: false, mitte: false, verloren: false, pose: null,
      ...teil
    };
  }

  aufnahmeVermerkt(jetzt = Date.now(), { frontal = false } = {}) {
    this.letzteAufnahme = jetzt;
    if (frontal) this.frontalGenommen = true;
  }
}
