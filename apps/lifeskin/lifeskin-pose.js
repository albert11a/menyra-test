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

// Acht Sektoren, nicht zwoelf.
//
// Solange zwei Drittel reichten, war die Zahl egal. Seit ALLE Striche zugehen
// muessen, entscheidet sie darueber, ob der Ring machbar ist: Zwoelf Sektoren
// sind je 30 Grad breit, das Zielfenster also nur +/-15 Grad. Wer den Kopf
// fluessig im Kreis bewegt, rutscht daran vorbei. Acht Sektoren sind 45 Grad
// breit - dieselbe Bewegung, aber sie trifft.
//
// Optisch aendert sich nichts: Die Striche am Ring bleiben, es gehen nur
// mehrere auf einmal zu.
export const SEKTOREN = 8;

export const POSE_GRENZEN = Object.freeze({
  // Ab wie vielen Grad eine Richtung als angesteuert gilt - getrennt fuer
  // seitlich und senkrecht.
  //
  // ZWEI ZAHLEN UND NICHT EINE, weil ein Kopf sich nicht in alle Richtungen
  // gleich bewegt. Seitlich sind rund 35 Grad bequem, senkrecht nur rund 20:
  // Nicken geht gegen den Hals, Drehen laeuft frei. Eine gemeinsame Schwelle
  // von 18 Grad hiess darum "seitlich leicht, nach oben kaum" - und der Ring
  // blieb oben und unten offen, waehrend er links und rechts zuging.
  //
  // Gerechnet wird als Ellipse: Der Ausschlag zaehlt, wenn
  // hypot(seitlich/16, senkrecht/11) mindestens eins ergibt.
  //
  // 13 und 9 statt 16 und 11. Nachgemessen an zwoelf Arten von Mensch und
  // Geraet (tests/lifeskin-ringlauf-probe.test.mjs): Bei 16/11 kam eine
  // zurueckhaltende Drehung von 13 Grad nie herum - in keinem von sechzig
  // Laeufen. Wer den Kopf nicht weit dreht, weil er es nicht kann oder
  // sich im Bild nicht verlieren will, blieb einfach stehen.
  //
  // Die Gegenprobe steht daneben: Ein geschwenktes Handy schliesst auch
  // bei 13/9 keinen einzigen Strich. Was den Ring schuetzt, ist nicht die
  // Hoehe der Schwelle, sondern die Achsprobe und die Bildwanderung.
  schwelleSeitlichGrad: 13,
  schwelleSenkrechtGrad: 9,
  // Ab wann der Kopf wieder als geradeaus gilt. Der Abstand zur Schwelle ist
  // Absicht: Ohne ihn flackert der Ring an deren Rand.
  mitteGrad: 6,

  // Der Nullpunkt wird gemessen, nicht angenommen: Jeder haelt das Handy
  // anders, und ein Kopf, der bequem sitzt, steht selten auf null Grad.
  kalibrierBilder: 5,
  kalibrierStreuungGrad: 4,
  kalibrierNotstartMs: 4000,

  // Ein Strich geht erst zu, wenn der Kopf dort BLEIBT.
  //
  // Zwei Bilder waren es, und das sind bei dreissig Bildern je Sekunde
  // sechsundsechzig Millisekunden - kuerzer als ein Wimpernschlag. Jedes
  // Zucken der Erkennung reichte damit aus.
  //
  // ZWEI BILDER UND MINDESTENS 160 MILLISEKUNDEN.
  //
  // Die Millisekunden sind die eigentliche Sicherung, denn sie heissen auf
  // jedem Geraet dasselbe. Die Bildzahl steht nur noch daneben, damit ein
  // einzelnes zuckendes Bild nichts ausloesen kann.
  //
  // Vier waren es, und vier sind auf einem alten Telefon mit acht Bildern
  // je Sekunde eine halbe Sekunde Stillhalten JE STRICH - achtmal
  // hintereinander. Genau diese Geraete standen in der Messung bei 27
  // Prozent, wenn der Besucher dazu noch zurueckhaltend drehte. Auf einem
  // neuen Telefon aendert sich durch die Senkung nichts: Dort sind zwei
  // Bilder 66 Millisekunden, und es gilt weiter die Grenze von 160 - es
  // braucht also nach wie vor fuenf Bilder.
  haltebilder: 2,
  mindestHaltenMs: 160,
  // Wie schnell zwei Striche nacheinander zugehen duerfen. 220 waren bei
  // acht Strichen fast zwei Sekunden Mindestdauer fuer die Runde - wer
  // zuegig dreht, lief dagegen.
  mindestAbstandMs: 120,

  // WANN DAS BILD WANDERT STATT DER KOPF SICH DREHT.
  //
  // Das ist der Unterschied, um den es hier geht: Der Ring soll zugehen,
  // weil jemand den Kopf dreht - nicht, weil er das Handy bewegt.
  //
  // Vollstaendig auseinanderhalten laesst sich beides aus einem Bild nicht:
  // Wer das Handy um den Kopf herumfuehrt, erzeugt dieselbe Ansicht wie
  // jemand, der den Kopf dreht. Was sich aber sehr wohl unterscheiden
  // laesst, ist die BEWEGUNG dorthin - und genau in ihr steckt die Klage.
  //
  // Beim Drehen des Kopfes bleibt das Gesicht ungefaehr an seinem Platz im
  // Bild und behaelt seine Groesse. Beim Bewegen des Handys wandert es
  // durchs Bild oder wird groesser und kleiner.
  //
  // GERECHNET, NICHT GEGRIFFEN: Eine Kopfdrehung laeuft mit rund zwei Grad
  // je Bild; die Augenmitte beschreibt dabei einen Bogen um den Hals und
  // legt etwa ein Achtzigstel Augenabstand zurueck. Ein Handyruck von einem
  // Zentimeter sind dagegen rund dreissig Hundertstel - der Abstand
  // zwischen beiden ist mehr als das Zwanzigfache. Acht Hundertstel liegen
  // dazwischen und lassen auch einem langsamen Geraet Luft, das nur zehn
  // Bilder je Sekunde schafft.
  //
  // Gemessen wird je Bild und in Augenabstaenden, nicht in Bildpunkten:
  // Sonst haette derselbe Ruck bei einem Gesicht nah an der Kamera eine
  // andere Bedeutung als bei einem weiter weg.
  // WIE WEIT DIE BEIDEN SCHAETZUNGEN AUSEINANDERLIEGEN DUERFEN.
  //
  // Verglichen wird der Winkel, den jede von beiden fuer die Bewegung
  // angibt - die Nasenspitze im Bild und die Drehmatrix ueber alle
  // Landmarken. Beim Drehen des Kopfes sagen sie ungefaehr dasselbe; beim
  // Verschieben des Handys wandert die Nase, waehrend die Matrix etwas
  // anderes meldet.
  //
  // 40 Grad: weit genug, dass die uebliche Ungenauigkeit beider Quellen
  // darin Platz hat, eng genug, dass ein geschwenktes Handy in der Probe
  // keinen einzigen Strich schliesst (tests/lifeskin-ringlauf-probe).
  achsToleranzRad: (40 * Math.PI) / 180,

  wanderungJeBild: 0.08,
  skalenSprungJeBild: 0.06,

  // Der Ring darf niemanden einsperren. Wer steif sitzt, wer das Handy
  // aufgestellt hat, wer den Kopf nicht drehen kann: Fuer den sinkt die
  // Schwelle, und irgendwann geht es auch ohne.
  // Frueher als vorher (9 Sekunden). Wer nach sechs Sekunden noch nicht
  // herum ist, dreht nicht zu wenig, weil er nicht will - er kann nicht
  // weiter. Ab da hilft nur noch Nachlassen.
  lockerungAbMs: 6000,
  // Sanfter als vorher (0,72 und 0,52).
  //
  // Die zweite Stufe halbierte die Schwelle fast - nach fuenfzehn Sekunden
  // ging ein Strich schon bei acht Grad zu, und acht Grad hat jeder, der
  // sein Handy anders haelt als eine Viertelminute zuvor. Die Lockerung
  // soll dem helfen, der steif sitzt, und nicht den Ring von selbst
  // zulaufen lassen.
  lockerungFaktor: 0.8,
  zweiteLockerungAbMs: 11000,
  zweiteLockerungFaktor: 0.62,
  // Ab hier weist der Hinweis auf den Ausloeser, statt die Anweisung zum
  // vierten Mal zu wiederholen. Beendet wird dadurch nichts - der Ring ist
  // erst fertig, wenn er zu ist.
  ausloeserHinweisAbMs: 12000
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
    // Die beiden Achsen der Kopfdrehung EINZELN, in Grad, aus der Matrix.
    //
    // Frueher stand hier nur ihr Betrag - hypot(yaw, pitch) - und der wurde
    // ohne Nullpunkt verwendet. Das war der Fehler, an dem sich der Ring von
    // selbst fuellte: Wer das Handy tief oder schraeg haelt, sitzt in Ruhe
    // schon bei fuenfzehn Grad Neigung, und fuenfzehn Grad waren die halbe
    // Schwelle. Es musste sich nur irgendetwas bewegen.
    //
    // Einzeln und nicht als Betrag, weil der Ringlauf sie zweimal braucht:
    // fuer den Ausschlag gegen die Ruhelage und fuer die Probe, ob die Achse
    // zu der Richtung passt, die das Bild zeigt.
    //
    // Roll faellt weiter heraus: Ein geneigter Kopf schaut nicht zur Seite.
    yaw: netz.pose?.yaw || 0,
    pitch: netz.pose?.pitch || 0,
    // WO das Gesicht im Bild steht und WIE GROSS es ist. Daran erkennt der
    // Ringlauf, ob sich das Bild bewegt hat statt des Kopfes.
    ankerX: mitteX,
    ankerY: mitteY,
    augenabstand,
    pose: netz.pose || null
  };
}

// Aus der Richtung wird ein Strich am Ring.
//
// Null steht oben, gezaehlt wird im Uhrzeigersinn - so, wie ein Mensch einen
// Kreis abfaehrt. In Bildkoordinaten waechst y nach unten, daher das Minus.
export function sektorAus(x, y, sektoren = SEKTOREN) {
  const winkel = (Math.atan2(x, -y) + Math.PI * 2) % (Math.PI * 2);
  const breite = (Math.PI * 2) / sektoren;
  // DIE SEKTOREN LIEGEN UM IHRE MITTE, NICHT AB IHRER KANTE.
  //
  // Hier stand floor(winkel / breite): Sektor 0 lief damit von 0 bis 45
  // Grad, Sektor 1 von 45 bis 90 und so fort. Die Grenzen lagen also
  // genau auf 0, 45, 90, 135 Grad - und das sind exakt die Richtungen, in
  // die ein Mensch den Kopf von sich aus dreht: gerade nach rechts, gerade
  // nach oben, gerade nach links.
  //
  // Wer geradeaus zur Seite schaut, traf damit die Kante zwischen zwei
  // Sektoren. Das Ergebnis kippte mit jedem Bild zwischen beiden hin und
  // her, und weil ein Wechsel den Fortschritt des anderen loescht, kamen
  // die vier Haltebilder nie zusammen. Man blieb ausgerechnet dort
  // haengen, wo man am natuerlichsten hinschaut.
  //
  // Eine halbe Sektorbreite gedreht, und die natuerlichen Richtungen
  // liegen in der MITTE eines Sektors. Die Kanten liegen jetzt bei 22,5,
  // 67,5, 112,5 Grad - dort, wo niemand absichtlich hinschaut.
  const sektor = Math.floor(((winkel + breite / 2) % (Math.PI * 2)) / breite) % sektoren;
  return { winkel, sektor };
}

export class Ringlauf {
  constructor({ sektoren = SEKTOREN, grenzen = POSE_GRENZEN, jetzt = Date.now() } = {}) {
    this.sektoren = sektoren;
    this.grenzen = grenzen;
    this.begonnen = jetzt;
    this.abgedeckt = new Array(sektoren).fill(false);
    this.halten = new Array(sektoren).fill(0);
    // Seit wann der Kopf in diesem Abschnitt steht. Die Bildzahl allein
    // heisst auf einem schnellen und einem langsamen Geraet nicht dasselbe.
    this.halteBeginn = new Array(sektoren).fill(0);
    // Wo das Gesicht im vorigen Bild stand - daran haengt die Frage, ob
    // sich der Kopf gedreht oder das Handy bewegt hat.
    this.letzterAnker = null;
    this.muster = [];
    this.nullpunkt = null;
    this.kalibriert = false;
    this.frontalGenommen = false;
    this.letzteAufnahme = 0;
    this.letzterSektor = null;
    this.hoechsterAusschlag = 0;
  }

  get anteil() {
    return this.abgedeckt.filter(Boolean).length / this.sektoren;
  }

  // Der Faktor, mit dem die Ellipse enger oder weiter wird. Eins ist die
  // volle Schwelle; kleiner heisst, es reicht weniger.
  schwelleBei(jetzt) {
    const dauer = jetzt - this.begonnen;
    const g = this.grenzen;
    if (dauer >= g.zweiteLockerungAbMs) return g.zweiteLockerungFaktor;
    if (dauer >= g.lockerungAbMs) return g.lockerungFaktor;
    return 1;
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
    if (!notstart && streuung(this.muster.map((r) => Math.hypot(r.yaw, r.pitch))) >= g.kalibrierStreuungGrad) return false;

    // DER NULLPUNKT TRAEGT JETZT AUCH DIE DREHUNG.
    //
    // Er hielt nur fest, wo die Nasenspitze in Ruhe steht - der Ausschlag
    // in Grad wurde dagegen absolut genommen. Wer das Handy tief haelt,
    // sitzt in Ruhe schon bei fuenfzehn Grad Neigung, und damit war die
    // halbe Schwelle erreicht, bevor er sich bewegt hat. Der Ring fuellte
    // sich dann von selbst, sobald irgendetwas wackelte.
    //
    // Gemessen wird ab jetzt von dort, wo dieser Mensch mit diesem Handy
    // wirklich angefangen hat.
    this.nullpunkt = {
      x: median(this.muster.map((r) => r.x)),
      y: median(this.muster.map((r) => r.y)),
      yaw: median(this.muster.map((r) => r.yaw)),
      pitch: median(this.muster.map((r) => r.pitch))
    };
    this.kalibriert = true;
    return true;
  }

  // Hat sich das Bild bewegt statt des Kopfes?
  //
  // Vergleicht Lage und Groesse des Gesichts mit dem vorigen Bild. Beides
  // in Augenabstaenden, damit derselbe Ruck nah und fern dasselbe bedeutet.
  // Nebenwirkung mit Absicht: Der Anker wird bei JEDEM Aufruf fortgeschrieben,
  // auch wenn das Ergebnis nicht gebraucht wird - sonst verglichen spaetere
  // Bilder gegen einen veralteten Stand.
  #bildWandert(richtung) {
    const vorher = this.letzterAnker;
    const abstand = richtung.augenabstand;
    this.letzterAnker = { x: richtung.ankerX, y: richtung.ankerY, abstand };
    // Das erste Bild hat nichts zum Vergleichen - und ist damit ruhig.
    if (!vorher || !(abstand > 1e-4)) return false;
    const weg = Math.hypot(richtung.ankerX - vorher.x, richtung.ankerY - vorher.y) / abstand;
    const sprung = Math.abs(abstand - vorher.abstand) / abstand;
    return weg > this.grenzen.wanderungJeBild || sprung > this.grenzen.skalenSprungJeBild;
  }

  zielSektor(von = 0) {
    for (let i = 0; i < this.sektoren; i += 1) {
      const s = (von + i) % this.sektoren;
      if (!this.abgedeckt[s]) return s;
    }
    return null;
  }

  // Fertig ist der Ring erst, wenn er ganz zu ist.
  //
  // Frueher reichten zwei Drittel, und nach einer Weile ging es auch ohne.
  // Das war als Freundlichkeit gedacht und war in Wahrheit Beliebigkeit: Der
  // Kunde sah einen halb offenen Ring und wurde trotzdem weitergeschickt -
  // also hiess der Ring nichts. Ein Fortschritt, der auch ohne Fortschritt
  // endet, ist keiner.
  //
  // Wer nicht herumkommt, hat weiter einen Ausweg, und zwar einen sichtbaren:
  // den Ausloeser unter dem Bild. Dass die Schwelle mit der Zeit sinkt, bleibt
  // ebenfalls - sie ist jetzt sogar wichtiger, weil alle zwoelf Striche
  // zugehen muessen.
  fertigBei() {
    return this.frontalGenommen && this.anteil >= 1;
  }

  // Ein Bild, ein Schritt. `netz` ist das Ergebnis von messeNetz() oder null.
  schritt(netz, jetzt = Date.now()) {
    const richtung = richtungAusNetz(netz);
    if (!richtung) return this.#stand(jetzt, { verloren: true });

    // GANZ OBEN, vor jedem fruehen Ausstieg.
    //
    // Der Anker wird bei JEDEM Bild fortgeschrieben, auch waehrend der
    // Einmessung. Stand er erst danach, hatte das erste Bild nach dem
    // Einmessen nichts zum Vergleichen und galt als ruhig - ausgerechnet
    // das erste, in dem sich etwas bewegt.
    const unruhig = this.#bildWandert(richtung);

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

    // Der Ausschlag in Grad, GEGEN DIE RUHELAGE gerechnet.
    const dYaw = richtung.yaw - this.nullpunkt.yaw;
    const dPitch = richtung.pitch - this.nullpunkt.pitch;
    const grad = Math.hypot(dYaw, dPitch);

    if (!(laenge > 1e-5)) {
      return this.#stand(jetzt, { betrag: grad, unruhig, mitte: grad <= this.grenzen.mitteGrad });
    }

    const { winkel, sektor } = sektorAus(vx / laenge, vy / laenge, this.sektoren);
    const schwelle = this.schwelleBei(jetzt);

    // Der Gesamtausschlag auf seine beiden Achsen verteilen - nach der
    // Richtung, die aus dem Bild kommt. Beides ohne Vorzeichen, denn ein
    // Betrag hat keins, und die Richtung steht schon fest.
    const ex = Math.abs(vx) / laenge;
    const ey = Math.abs(vy) / laenge;
    const g = this.grenzen;
    const ausschlag = Math.hypot(
      (grad * ex) / (g.schwelleSeitlichGrad * schwelle),
      (grad * ey) / (g.schwelleSenkrechtGrad * schwelle)
    );
    // Fuer den Bericht: Wie weit haben die Leute wirklich gedreht? Steht das
    // durchweg unter eins, ist die Schwelle zu hoch - und ohne diese Zahl
    // faellt das nie auf, weil ein Ring, der nicht zugeht, wie ein Fehler
    // aussieht und keiner ist.
    if (ausschlag > this.hoechsterAusschlag) this.hoechsterAusschlag = ausschlag;

    // DIE ACHSPROBE.
    //
    // Zwei voneinander unabhaengige Schaetzungen muessen sich einig sein,
    // WELCHE Achse sich bewegt hat: die Nasenspitze im Bild und die
    // Drehmatrix ueber alle Landmarken.
    //
    // Beim Drehen des Kopfes sagen beide dasselbe - seitlich ist seitlich.
    // Beim Verschieben des Handys wandert die Nasenspitze im Bild, waehrend
    // die Matrix kaum etwas oder etwas anderes meldet, und dann geht kein
    // Strich zu.
    //
    // Verglichen werden nur die BETRAEGE der beiden Achsen, nie ihre
    // Vorzeichen. Deren Konvention ist bei der Matrix nicht dokumentiert,
    // und was nicht dokumentiert ist, darf hier nichts entscheiden.
    // GEMESSEN WIRD DER WINKEL, NICHT DIE KATEGORIE.
    //
    // Hier stand: "zeigt das Bild eher waagerecht?" gegen "zeigt die
    // Drehung eher waagerecht?" - zwei Ja/Nein-Fragen, die gleich
    // ausfallen mussten. Das trug, solange eine Achse klar fuehrt. Auf
    // einer Diagonalen ist es ein Muenzwurf: Dort sind beide Betraege
    // gleich gross, und die letzte Stelle hinter dem Komma entscheidet -
    // in jeder der beiden Schaetzungen fuer sich, denn sie kommen aus
    // verschiedenen Quellen.
    //
    // Vier der acht Sektoren liegen auf einer Diagonalen. Dort war die
    // Probe reines Glueck, und wer dorthin schaute, blieb haengen, ohne
    // dass etwas an seiner Drehung falsch war.
    //
    // Beide Schaetzungen geben in Wahrheit eine RICHTUNG her. Im Raum der
    // Betraege ist das ein Winkel zwischen null (rein seitlich) und einem
    // rechten Winkel (rein senkrecht). Den zu vergleichen ist stetig: Auf
    // der Diagonalen liegen beide bei 45 Grad und sind sich einig, statt
    // zu wuerfeln.
    const bildAchse = Math.atan2(Math.abs(vy), Math.abs(vx));
    const drehAchse = Math.atan2(Math.abs(dPitch), Math.abs(dYaw));
    const achseStimmt = Math.abs(bildAchse - drehAchse) <= this.grenzen.achsToleranzRad;

    const zaehlt = ausschlag >= 1 && achseStimmt && !unruhig;

    let neuerSektor = null;
    if (zaehlt) {
      this.letzterSektor = sektor;
      // EIN NACHBAR LOESCHT DEN FORTSCHRITT NICHT.
      //
      // Vorher wurde bei jedem gezaehlten Bild der Fortschritt ALLER
      // anderen Sektoren genullt. An der Kante zwischen zwei Sektoren
      // genuegte damit ein einziges kippendes Bild, um von vorne
      // anzufangen - und an einer Kante steht man bei jeder Drehung, die
      // nicht genau in die Mitte trifft.
      //
      // Zurueckgesetzt wird jetzt nur noch, was wirklich woanders liegt:
      // ein Sprung ueber mehr als einen Sektor. Das ist eine andere
      // Richtung, und dort soll nichts stehenbleiben.
      for (let i = 0; i < this.sektoren; i += 1) {
        if (i === sektor) continue;
        const abstand = Math.min((i - sektor + this.sektoren) % this.sektoren,
          (sektor - i + this.sektoren) % this.sektoren);
        if (abstand > 1) { this.halten[i] = 0; this.halteBeginn[i] = 0; }
      }
      if (!this.halten[sektor]) this.halteBeginn[sektor] = jetzt;
      this.halten[sektor] += 1;
      if (!this.abgedeckt[sektor]
        && this.halten[sektor] >= this.grenzen.haltebilder
        && jetzt - this.halteBeginn[sektor] >= this.grenzen.mindestHaltenMs
        && jetzt - this.letzteAufnahme >= this.grenzen.mindestAbstandMs) {
        this.abgedeckt[sektor] = true;
        this.letzteAufnahme = jetzt;
        neuerSektor = sektor;
      }
    } else if (grad <= this.grenzen.mitteGrad) {
      // Zurueck in der Mitte: Das Halten faengt ueberall von vorne an.
      //
      // Ein unruhiges Bild allein setzt NICHTS zurueck. Ein einzelnes
      // zuckendes Bild mitten in einer sauberen Drehung soll die Arbeit
      // nicht wegwerfen - es zaehlt nur eben nicht mit. Wer dagegen das
      // Handy bewegt, hat kaum ein ruhiges Bild dabei, und dann kommen die
      // vier nie zusammen.
      this.halten.fill(0);
      this.halteBeginn.fill(0);
    }

    return this.#stand(jetzt, {
      betrag: grad, ausschlag, winkel, sektor: zaehlt ? sektor : null, neuerSektor, unruhig,
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
      fertig: this.fertigBei(),
      // Ob das gerade Bild steht. Es gehoert in den Stand und nicht nur in
      // fertigBei(): Wird es nachgefordert, ist der Ring zu (anteil 1) und
      // trotzdem nicht fertig - und der Hinweis unter dem Bild muss dann
      // sagen, worauf gewartet wird, statt weiter "Gati." zu zeigen.
      frontalGenommen: this.frontalGenommen,
      betrag: 0, ausschlag: 0, winkel: null, sektor: null, neuerSektor: null,
      frontalFaellig: false, mitte: false, verloren: false, pose: null,
      // Ob das Bild gerade wandert. Der Hinweis unter dem Kreis sagt dann,
      // was zu tun ist: Handy halten, Kopf drehen.
      unruhig: false,
      ...teil
    };
  }

  // Einen Abschnitt WIEDER AUFMACHEN, weil der Kopf zwar dort war, aber
  // kein Bild daraus wurde.
  //
  // Der Ring zaehlt Kopfhaltungen, nicht Bilder - und das sind zwei
  // verschiedene Dinge. Acht Sektoren zu 45 Grad, aber nur drei
  // Blickrichtungen (rechts, links, oben) mit je 45 Grad Toleranz: Sektor 3
  // und 4 - der Kopf nach unten - gehoeren zu keiner. Dort liefert
  // #blickAus() in lifeskin-app.js nichts, der Sektor gilt trotzdem als
  // abgedeckt, und dasselbe gilt fuer frontalGenommen: Es wird gesetzt, ob
  // das Bild abgelegt wurde oder nicht.
  //
  // GEMESSEN, NICHT GESCHAETZT: Zwei Faelle aus dem Betrieb kamen mit
  // ringAnteil 1 - Ring vollstaendig zu - und EINEM Foto an, ohne frontales.
  // Wer den Kopf in einem zuegigen Schwung herumzieht, schliesst alle acht
  // Sektoren in zwei Sekunden, und nur einer davon faellt in eine
  // Blickrichtung.
  //
  // Der Ring geht dann dort wieder auf, wo ein Bild fehlt. Damit fuehrt
  // dieselbe Anzeige weiter, die ohnehin fuehrt - es braucht keinen zweiten
  // Weg, der dem Kunden etwas anderes sagt als der Ring vor ihm.
  wiederOeffnen(sektoren = [], { frontal = false } = {}) {
    for (const s of Array.isArray(sektoren) ? sektoren : []) {
      if (!Number.isInteger(s) || s < 0 || s >= this.sektoren) continue;
      this.abgedeckt[s] = false;
      this.halten[s] = 0;
    }
    if (frontal) this.frontalGenommen = false;
  }

  // DIE ZEIT, IN DER NIEMAND HINGESEHEN HAT, ZAEHLT NICHT MIT.
  //
  // Wer mitten im Scan eine Nachricht bekommt, ist zwanzig Sekunden weg -
  // und kommt in einen Ringlauf zurueck, der glaubt, er habe zwanzig
  // Sekunden lang vergeblich gewartet. Die Schwelle waere dann schon
  // zweimal gelockert, und der Ring liefe von allein zu.
  //
  // Die Pause wird auf alle Uhren aufgeschlagen, statt den Ring
  // wegzuwerfen: Was er vorher zugemacht hat, hat der Besucher wirklich
  // gedreht, und das noch einmal zu verlangen waere die schlechtere
  // Freundlichkeit.
  pauseEinrechnen(ms = 0) {
    if (!(ms > 0)) return;
    this.begonnen += ms;
    if (this.letzteAufnahme) this.letzteAufnahme += ms;
    // Ein angefangenes Halten ist nach der Pause keines mehr - der Kopf
    // stand inzwischen ganz woanders.
    this.halten.fill(0);
    this.halteBeginn.fill(0);
    // Und das Bild danach ist ein neues: Der Anker von vorher wuerde eine
    // Wanderung melden, die niemand gemacht hat.
    this.letzterAnker = null;
  }

  aufnahmeVermerkt(jetzt = Date.now(), { frontal = false } = {}) {
    this.letzteAufnahme = jetzt;
    if (frontal) this.frontalGenommen = true;
  }
}
