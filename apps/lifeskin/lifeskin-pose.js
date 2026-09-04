// Wohin der Kopf zeigt - und wie weit der Kreis schon herum ist.
//
// WARUM ES DIESES MODUL GIBT.
//
// Die erste Aufnahme war ein Tor: vier Pruefungen, alle vier gruen, drei
// Sekunden halten, ausloesen. Im Betrieb ist genau das gescheitert. Nicht,
// weil eine Pruefung falsch gerechnet haette, sondern weil ein Tor nur zwei
// Antworten kennt - durch oder nicht durch. Wer davorsteht und "nicht durch"
// liest, weiss nicht, was er tun soll, und geht. Der Bildschirmabzug aus dem
// Betrieb zeigt es: gutes Licht, Gesicht mittig, und darunter steht "Nuk po
// dallojmë fytyrë".
//
// Der Ausweg ist nicht ein besseres Tor, sondern kein Tor. Apple macht beim
// Einrichten von Face ID das Gegenteil: Der Kopf wird im Kreis gefuehrt, und
// der Ring fuellt sich Strich fuer Strich. Es gibt kein Scheitern - es gibt
// nur "noch nicht ganz herum". Dieselbe Bewegung verlangen die
// Lebendpruefungen der Ausweis-Anbieter, aus demselben Grund: Ein Mensch, der
// eine Bewegung ausfuehrt und dabei zusieht, wie sie ankommt, vertraut dem,
// was danach kommt.
//
// UND: Der Ring ist keine Verzierung. Jeder Strich, der zugeht, ist eine
// Aufnahme aus einer anderen Blickrichtung, die sofort vermessen wird. Was
// der Besucher waehrend der Bewegung an Werten wachsen sieht, ist gemessen
// und nicht erfunden. Ein Fortschrittsbalken, hinter dem nichts laeuft, ist
// eine Luege, die genau einmal auffliegt - und dann ist der Kunde weg.
//
// WIE DIE RICHTUNG GEMESSEN WIRD.
//
// Ohne Tiefensensor und ohne fremde Bibliothek. Es reicht, dass das Signal in
// die richtige Richtung zeigt - genau messen muss es nicht, denn niemand
// verlangt vom Besucher "drehen Sie 23 Grad nach links".
//
// Zwei Signale, beide aus dem, was lifeskin-face.js ohnehin findet:
//
//   1. Die Augenmitte im Gesichtsfeld. Dreht sich der Kopf nach rechts,
//      wandert die Augenmitte im sichtbaren Kopfumriss nach rechts; hebt sich
//      das Kinn, rutscht die Augenlinie im Umriss nach oben. Das ist das
//      genauere Signal - aber die Augen sind nicht immer da.
//   2. Der Schwerpunkt der Hautflaeche im Gesichtsfeld. Der ist immer da,
//      auch bei Vollbart und geschlossenen Augen, und verschiebt sich bei
//      jeder Drehung mit. Grober, aber er faellt nie aus.
//
// Beide laufen nebeneinander mit eigenem Nullpunkt. Faellt das eine aus,
// traegt das andere weiter, ohne dass der Ring springt.
//
// DER NULLPUNKT WIRD GEMESSEN, NICHT ANGENOMMEN.
//
// Jedes Gesicht sitzt anders, jede Kamera steht anders, jeder haelt das Handy
// anders. Feste Zahlen fuer "geradeaus" waeren fuer die Haelfte der Besucher
// falsch. Darum halten die ersten ruhigen Bilder als Nullpunkt her, und alles
// danach ist Abweichung davon. Wer schief sitzt, bekommt seinen eigenen
// geraden Blick.

export const SEKTOREN = 12;

export const POSE_GRENZEN = Object.freeze({
  // Wie weit die Signale bei einer bequemen Kopfdrehung ausschlagen. Aus
  // Aufnahmen abgeleitet, nicht aus einem Lehrbuch: Der Besucher soll den
  // Kopf drehen, nicht den Hals verrenken.
  augenAmplitudeX: 0.085,
  augenAmplitudeY: 0.075,
  massenAmplitudeX: 0.035,
  massenAmplitudeY: 0.035,

  // Ab wann eine Richtung als "dorthin geschaut" zaehlt, und ab wann der
  // Kopf wieder als geradeaus gilt. Der Abstand dazwischen ist Absicht:
  // Ohne ihn flackert der Ring am Rand der Schwelle.
  schwelle: 0.62,
  mitte: 0.34,

  // Der Nullpunkt braucht ruhige Bilder, sonst wird eine Drehung als
  // "geradeaus" eingemessen und der ganze Ring steht schief.
  kalibrierBilder: 5,
  kalibrierStreuung: 0.05,
  kalibrierNotstartMs: 4000,

  // Ein Strich geht erst nach zwei Bildern zu. Ein einzelnes Bild kann ein
  // Ausrutscher der Erkennung sein.
  haltebilder: 2,
  mindestAbstandMs: 220,

  // WICHTIG: Der Ring darf niemanden einsperren.
  //
  // Wer steif sitzt, wer im Rollstuhl den Kopf kaum dreht, wer das Handy
  // aufgestellt hat - fuer den schlaegt kein Signal weit genug aus. Ohne
  // diese Lockerung stuende er vor einem Ring, der sich nie fuellt, und das
  // waere schlimmer als das Tor, das ersetzt werden sollte. Also sinkt die
  // Schwelle, je laenger es dauert.
  lockerungAbMs: 9000,
  lockerungFaktor: 0.72,
  zweiteLockerungAbMs: 15000,
  zweiteLockerungFaktor: 0.52,

  // Und irgendwann ist Schluss, abgedeckt oder nicht. Gemessen wird mit dem,
  // was da ist.
  hoechstdauerMs: 24000,
  // Frueher Schluss, wenn ueberhaupt nichts ankommt.
  //
  // Wer nach fuenfzehn Sekunden und zwei Lockerungen noch keinen einzigen
  // Strich geschlossen hat, wird auch in den naechsten neun keinen
  // schliessen - das Handy steht auf dem Tisch, der Kopf bleibt steif, das
  // Signal reicht nicht. Weiter warten zu lassen ist keine Sorgfalt, das ist
  // eine Sackgasse mit Ansage. Die geraden Aufnahmen liegen laengst vor.
  ohneFortschrittMs: 15000,
  mindestdauerMs: 4000,
  // Zwei Drittel herum reichen. Die letzten Striche kosten mehr Geduld, als
  // sie an Messwert bringen.
  mindestAnteil: 0.7
});

function median(werte) {
  if (!werte.length) return 0;
  const sortiert = [...werte].sort((a, b) => a - b);
  const mitte = Math.floor(sortiert.length / 2);
  return sortiert.length % 2 ? sortiert[mitte] : (sortiert[mitte - 1] + sortiert[mitte]) / 2;
}

function streuung(werte) {
  if (werte.length < 2) return 0;
  return Math.max(...werte) - Math.min(...werte);
}

// Die beiden Rohsignale aus dem, was die Erkennung geliefert hat.
//
// Beide Werte sind Anteile am Gesichtsfeld und darum unabhaengig davon, wie
// gross das Gesicht im Bild steht. Ohne diese Normierung waere jeder Schritt
// nach vorn eine scheinbare Kopfdrehung.
export function poseRoh(lage) {
  if (!lage) return null;
  const roh = { augen: null, masse: null };
  // 0,42 statt 0,5: Die Augenlinie liegt bei geradem Blick nicht in der
  // Mitte des Kopfumrisses, sondern darueber. Dieselbe Zahl steht in
  // lifeskin-face.js, wo die Punkte aus dem Feld abgeleitet werden.
  if (lage.augen) roh.augen = { x: lage.augen.x - 0.5, y: lage.augen.y - 0.42 };
  if (lage.schwerpunkt) roh.masse = { x: lage.schwerpunkt.x - 0.5, y: lage.schwerpunkt.y - 0.5 };
  return (roh.augen || roh.masse) ? roh : null;
}

// Aus der Richtung wird ein Strich am Ring.
//
// Null steht oben, gezaehlt wird im Uhrzeigersinn - so, wie ein Mensch einen
// Kreis abfaehrt. In Bildkoordinaten waechst y nach unten, deshalb das
// Minus: Sonst liefe der Ring verkehrt herum, und der Besucher wuerde
// gegen die Anzeige arbeiten.
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
    this.muster = { augen: [], masse: [] };
    this.nullpunkt = null;
    this.kalibriert = false;
    this.frontalGenommen = false;
    this.letzteAufnahme = 0;
    this.letzterSektor = null;
    this.verloreneBilder = 0;
  }

  get anteil() {
    return this.abgedeckt.filter(Boolean).length / this.sektoren;
  }

  // Die Schwelle sinkt mit der Zeit. Siehe die Begruendung bei den Grenzen:
  // Ein Ring, der sich fuer manche nie fuellt, ist kein Fortschritt.
  schwelleBei(jetzt) {
    const dauer = jetzt - this.begonnen;
    const g = this.grenzen;
    if (dauer >= g.zweiteLockerungAbMs) return g.schwelle * g.zweiteLockerungFaktor;
    if (dauer >= g.lockerungAbMs) return g.schwelle * g.lockerungFaktor;
    return g.schwelle;
  }

  #kalibriere(roh, jetzt) {
    const g = this.grenzen;
    for (const quelle of ["augen", "masse"]) {
      if (!roh[quelle]) continue;
      const reihe = this.muster[quelle];
      reihe.push(roh[quelle]);
      if (reihe.length > g.kalibrierBilder) reihe.shift();
    }

    const notstart = jetzt - this.begonnen >= g.kalibrierNotstartMs;
    const fertig = (quelle) => {
      const reihe = this.muster[quelle];
      if (reihe.length < g.kalibrierBilder) return false;
      if (notstart) return true;
      // Ruhig muss es sein: Wer sich waehrend der Einmessung schon dreht,
      // bekaeme eine Drehung als Nullpunkt und danach einen Ring, der auf
      // einer Seite nie zugeht.
      return streuung(reihe.map((p) => p.x)) < g.kalibrierStreuung
        && streuung(reihe.map((p) => p.y)) < g.kalibrierStreuung;
    };

    // Die Hautmasse ist immer da - sie entscheidet, wann es losgeht. Sind
    // die Augen zu diesem Zeitpunkt auch beisammen, bekommen sie ihren
    // eigenen Nullpunkt; sonst spaeter, sobald sie auftauchen.
    if (!fertig("masse")) return false;

    this.nullpunkt = {
      masse: {
        x: median(this.muster.masse.map((p) => p.x)),
        y: median(this.muster.masse.map((p) => p.y))
      },
      augen: fertig("augen")
        ? {
          x: median(this.muster.augen.map((p) => p.x)),
          y: median(this.muster.augen.map((p) => p.y))
        }
        : null
    };
    this.kalibriert = true;
    return true;
  }

  // Der Nullpunkt der Augen darf nachgereicht werden: Bei Brille, Vollbart
  // oder schwachem Licht kommen sie oft erst nach ein paar Bildern - und
  // dann sind sie das bessere Signal.
  #augenNullpunktNachtragen(roh) {
    if (!roh.augen || this.nullpunkt.augen) return;
    const reihe = this.muster.augen;
    reihe.push(roh.augen);
    if (reihe.length > this.grenzen.kalibrierBilder) reihe.shift();
    if (reihe.length < this.grenzen.kalibrierBilder) return;
    if (streuung(reihe.map((p) => p.x)) >= this.grenzen.kalibrierStreuung) return;
    if (streuung(reihe.map((p) => p.y)) >= this.grenzen.kalibrierStreuung) return;
    this.nullpunkt.augen = {
      x: median(reihe.map((p) => p.x)),
      y: median(reihe.map((p) => p.y))
    };
  }

  #richtung(roh) {
    const g = this.grenzen;
    if (roh.augen && this.nullpunkt.augen) {
      return {
        x: (roh.augen.x - this.nullpunkt.augen.x) / g.augenAmplitudeX,
        y: (roh.augen.y - this.nullpunkt.augen.y) / g.augenAmplitudeY,
        quelle: "augen"
      };
    }
    if (roh.masse && this.nullpunkt.masse) {
      return {
        x: (roh.masse.x - this.nullpunkt.masse.x) / g.massenAmplitudeX,
        y: (roh.masse.y - this.nullpunkt.masse.y) / g.massenAmplitudeY,
        quelle: "masse"
      };
    }
    return null;
  }

  // Der naechste offene Strich im Uhrzeigersinn.
  //
  // Immer in eine Richtung weisen, nie zurueck: Wer einmal links herum
  // angefangen hat, soll nicht in der Mitte umkehren muessen. Das ist der
  // Unterschied zwischen "einen Kreis fahren" und "Loecher stopfen".
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

  // Ein Bild, ein Schritt.
  //
  // `lage` ist das, was pruefeAufnahme() liefert - oder null, wenn in diesem
  // Bild nichts gefunden wurde. Ein Ausfall wirft nichts um: Der Ring behaelt
  // seinen Stand, es geht nur nicht weiter.
  schritt(lage, jetzt = Date.now()) {
    const roh = poseRoh(lage);
    if (!roh) {
      this.verloreneBilder += 1;
      return this.#stand(jetzt, { betrag: 0, winkel: null, sektor: null, verloren: true });
    }
    this.verloreneBilder = 0;

    if (!this.kalibriert) {
      const geschafft = this.#kalibriere(roh, jetzt);
      return this.#stand(jetzt, {
        betrag: 0, winkel: null, sektor: null, verloren: false,
        // Die Aufnahme fuer geradeaus faellt genau in dem Bild an, in dem
        // der Nullpunkt steht: Das ist per Definition das gerade Gesicht,
        // und es ist die Aufnahme, auf der der Befund beruht.
        frontalFaellig: geschafft && !this.frontalGenommen
      });
    }

    this.#augenNullpunktNachtragen(roh);

    const richtung = this.#richtung(roh);
    if (!richtung) return this.#stand(jetzt, { betrag: 0, winkel: null, sektor: null, verloren: true });

    const betrag = Math.hypot(richtung.x, richtung.y);
    const { winkel, sektor } = sektorAus(richtung.x, richtung.y, this.sektoren);
    const schwelle = this.schwelleBei(jetzt);

    let neuerSektor = null;
    if (betrag >= schwelle) {
      this.letzterSektor = sektor;
      // Wechselt der Kopf den Sektor, faellt der Zaehler des alten zurueck.
      for (let i = 0; i < this.sektoren; i += 1) if (i !== sektor) this.halten[i] = 0;
      this.halten[sektor] += 1;
      if (!this.abgedeckt[sektor] && this.halten[sektor] >= this.grenzen.haltebilder
        && jetzt - this.letzteAufnahme >= this.grenzen.mindestAbstandMs) {
        this.abgedeckt[sektor] = true;
        this.letzteAufnahme = jetzt;
        neuerSektor = sektor;
      }
    } else if (betrag <= this.grenzen.mitte) {
      this.halten.fill(0);
    }

    return this.#stand(jetzt, {
      betrag, winkel, sektor: betrag >= schwelle ? sektor : null,
      quelle: richtung.quelle, neuerSektor, verloren: false,
      // Kommt der Kopf nach der Runde in die Mitte zurueck, ist das die
      // zweite Gelegenheit fuer ein gerades Bild. Mehr gerade Bilder heisst
      // ein stabilerer Median und damit ein Befund, der beim zweiten Anlauf
      // derselbe ist.
      mitte: betrag <= this.grenzen.mitte
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
      frontalFaellig: false,
      mitte: false,
      neuerSektor: null,
      quelle: null,
      ...teil
    };
  }

  // Die Aufnahme ist gemacht - der Ring merkt es sich, damit er nicht auf
  // dieselbe Gelegenheit zweimal ausloest.
  aufnahmeVermerkt(jetzt = Date.now(), { frontal = false } = {}) {
    this.letzteAufnahme = jetzt;
    if (frontal) this.frontalGenommen = true;
  }
}
