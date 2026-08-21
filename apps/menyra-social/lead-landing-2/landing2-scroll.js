// Das Scrollverhalten von Landing 2.
//
// Eine Regel steht ueber allem: Der Wirt scrollt die Seite - sonst nichts.
// Kein Rasten, kein Festhalten, kein zweiter Scrollbereich, keine waagerechte
// Geste. Wer schnell durchwischen will, soll das koennen; wer mitten in einer
// Bewegung umkehrt, soll dieselbe Bewegung rueckwaerts sehen.
//
// Daraus folgt die Bauweise: Alles, was zu sehen ist, ist eine reine Funktion
// des Scrollstands. Kein Zustand, der einmal umspringt und dann liegen
// bleibt; kein "once = true"; keine eigene Rueckwaertslogik. Dreht der Finger
// um, laeuft dieselbe Rechnung rueckwaerts - nicht, weil das jemand
// programmiert hat, sondern weil es nichts anderes gibt, was sie tun koennte.
//
// Vier Dinge, mehr nicht:
//
//  1. Die Bildschirmhoehe festnageln. 100dvh ist auf dem Handy kein fester
//     Wert, sondern die gerade sichtbare Hoehe. Blendet Safari mitten im
//     Wischen seine Leisten ein oder aus, aendert jeder Abschnitt in derselben
//     Bewegung seine Hoehe - und die Sequenz springt unter dem Finger weg.
//     Deshalb wird einmal gemessen und der Wert als Zahl in Pixeln gesetzt.
//
//  2. Die Sequenzen fahren. Nicht in Stufen: Beschriftung, Ueberblendung und
//     der Versatz des Inhalts sind stetige Kurven ueber dem Scrollstand. Eine
//     Schwelle ("ab hier zeige das Menue") ist genau der Sprung, den man auf
//     dem Handy als Ruckeln sieht.
//
//  3. Den Inhalt einer Vorschau kontrolliert nach oben schieben. Ein Profil
//     ist laenger als das Fenster, in dem es steht. Statt eines zweiten
//     Scrollbereichs - auf dem iPhone die eine Sache, die man nicht bedienen
//     kann - schiebt der Scrollstand der Seite den Inhalt im Fenster.
//
//  4. Abschnitte einblenden, wenn sie ins Bild kommen.
//
// Gerechnet wird gegen eine Tabelle von Zahlen, die im Stillstand einmal
// ausgemessen wird - nicht gegen das Layout. Sonst waere die Messung selbst
// der Grund, warum das Wischen hakt: Jedes getBoundingClientRect() mitten in
// der Bewegung zwingt den Browser, das Layout neu zu rechnen.

const RESIZE_SETTLE_MS = 160;
// Kleine Aenderungen der Hoehe sind die Adressleiste, nicht eine Drehung des
// Geraets. Wer darauf neu misst, misst bei jedem Wisch neu.
const HEIGHT_NOISE_PX = 90;

// Wie eine Sequenz weiterschaltet - und warum nicht mehr am Finger.
//
// Frueher hing jede Deckkraft unmittelbar am Scrollstand: Wer einen Pixel
// wischte, rechnete einen Pixel Uebergang. Auf dem Telefon hakte das, und
// zwar aus einem Grund, den man dem Code nicht ansieht - waehrend des Ziehens
// muss der Browser bei jedem einzelnen Bild zwei vollstaendige
// Mnyra-Oberflaechen neu zusammensetzen.
//
// Jetzt sagt der Scrollstand nur noch, WELCHER Schritt gilt. Der Wechsel
// dorthin ist eine eigene, zeitgesteuerte Bewegung: Ein Wisch, und der
// Uebergang laeuft in einem Zug durch - wie das Weiterblaettern in einer App.
//
// Gesperrt wird dabei nichts. Die Seite scrollt weiter wie jede andere: Man
// kann durchwischen, umkehren, schnell oder langsam sein. Nur klebt der
// Uebergang nicht mehr am Finger.
//
// Zwei Groessen, beide reine Funktionen - keine gemerkten Zustaende:
//
//   u  der Scrollstand in Schritten (0 = erster, n = letzter). Er bestimmt
//      den Zielschritt und den Versatz des Inhalts im Fenster.
//   a  wo die Bewegung gerade steht, ebenfalls in Schritten. Sie laeuft auf
//      den Zielschritt zu und bleibt dort stehen.
//
// Aendert der Scrollstand das Ziel, faengt die Bewegung von ihrem jetzigen
// Stand aus neu an. Deshalb bleibt beim Umkehren mitten im Uebergang nichts
// haengen: Das Ziel wandert zurueck, und die Bewegung dreht um.
export const STEP_MS = 460;
// Wer sehr schnell durchwischt, springt ueber Schritte. Vorgefuehrt wird dann
// nur der letzte - alles andere waere eine Bewegung, die niemand mehr
// mitliest, und sie stuende der naechsten im Weg.
const CATCH_UP_STEPS = 1.15;
// Der Zielschritt darf an seiner Grenze nicht flattern.
//
// Ein Finger, der auf der Kante zur Ruhe kommt, wackelt um wenige Pixel. Ohne
// Saum kippte das Ziel dabei hin und her, und weil jede Aenderung die Bewegung
// von ihrem jetzigen Stand aus neu anwirft, bliebe der Wechsel auf halbem Weg
// stehen und zappelte.
//
// Der Saum ist deshalb so schmal wie moeglich: 0.03 Schritte sind auf einem
// gewoehnlichen Telefon rund zwanzig Punkte. Das faengt das Wackeln ab und ist
// zu wenig, um es zu bemerken. Breiter waere es ein Kleben - dieselbe Stelle
// zeigte je nach Anfahrtsrichtung sichtbar etwas anderes.
const STEP_HYSTERESIS = 0.03;

// Der Fahrplan eines Wechsels.
//
// Die Zahlen sind Anteile EINER Bewegung (STEP_MS), nicht mehr Anteile einer
// Bildschirmhoehe:
//
//   0.00 .. 0.20   der alte Satz geht nach oben weg
//   0.22 .. 0.54   der neue Satz kommt von unten
//   0.50 .. 0.82   die neue Flaeche legt sich als leere Scheibe darueber
//   0.82 .. 1.00   ihr Inhalt kommt darauf
//
// Bei 460ms je Wechsel heisst das: rund 60ms ohne Satz waehrend er getauscht
// wird, und rund 130ms Vorlauf, bevor sich die Flaeche darunter ruehrt.
//
// Die Beschriftung geht der Flaeche voraus: Man liest "Menuja jote", und dann
// kommt die Menue. Wechselten beide gleichzeitig, laese es sich wie "es ist
// ploetzlich etwas anderes da" - und die Frage "warum?" kostet mehr
// Aufmerksamkeit, als die Bewegung wert ist.
//
// Die beiden Saetze ueberschneiden sich NICHT. Das war der erste Versuch:
// beide in derselben Strecke, gegenlaeufig - und in der Mitte standen zwei
// halbdurchsichtige Ueberschriften uebereinander. Das liest sich wie ein
// Fehler. Anders als bei den Flaechen hilft hier kein Uebereinanderlegen: Ein
// Satz hat keinen eigenen Grund, mit dem er den darunter verdecken koennte.
// Also geht der alte erst ganz, dann kommt der neue; dazwischen liegen rund
// dreissig Millisekunden ohne Satz - ein Wimpernschlag.
const CAPTION_OUT_FROM = 0;
const CAPTION_OUT_TO = 0.2;
const CAPTION_IN_FROM = 0.22;
const CAPTION_IN_TO = 0.54;
// Der Wechsel der Flaeche in zwei Zuegen - und der Grund dafuer ist der
// wichtigste Absatz dieser Datei.
//
// Ein gewoehnliches Ueberblenden zweier Mnyra-Bildschirme sieht kaputt aus.
// In der Mitte stehen zwei vollstaendige Oberflaechen halbdurchsichtig
// uebereinander: zwei Suchfelder, zwei Kartenlisten, zwei Preise, alles
// ineinander. Das ist keine Frage des Geschmacks - man liest es als Fehler
// und nicht als Uebergang. (Bei den Saetzen ist es dasselbe Problem; dort
// gehen sie deshalb nacheinander.)
//
// Deshalb kommt die neue Flaeche in zwei Zuegen: Zuerst legt sich ihre leere
// Scheibe darueber - dieselbe Grundfarbe, die der Bildschirm in der App hat
// (--app-bg, bei der Karte das Grau unter der Kachel). Sie ist undurchsichtig
// und deckt die alte Flaeche vollstaendig zu. Erst danach kommt der Inhalt
// darauf.
//
// Zu keinem Zeitpunkt sind zwei Oberflaechen zugleich zu sehen: erst die
// alte, dann ein ruhiger Grund, dann die neue.
const VIEW_PLATE_FROM = 0.5;
const VIEW_PLATE_TO = 0.82;
const VIEW_BODY_FROM = 0.82;
const VIEW_BODY_TO = 1;

// Die beiden Wege, die am Scrollstand haengen - und ausdruecklich NICHT an
// der Bewegung.
//
// Sie sind die Gegenprobe zu allem anderen auf dieser Seite: Waehrend ein
// Wechsel der Flaeche als Ganzes durchlaeuft, sagen diese beiden Wege "du
// bewegst dich gerade". Sie kosten je einen transform pro Bild, und sie
// duerfen, weil sie stetig sind.
//
//   Kopf    was oben steht, wandert beim ersten Wisch nach oben weg: der
//           Profilkopf, die Story-Reihe von Qyteti, die Kennzahlen des
//           Panelis. Danach steht dort, was in der App darunter steht.
//   Versatz was in ein Fenster nicht hineinpasst, schiebt der Scrollstand
//           herein: die Menue, ein langer Beitrag, eine lange Liste.
//
// Beide laufen GERADE und nicht weich an.
//
// Das ist kein Versehen und der wichtigste Unterschied zu den Wechseln: Ein
// Scroll IST gerade. Wer den Finger gleichmaessig zieht, erwartet, dass sich
// der Inhalt gleichmaessig mitbewegt - eine weiche Kurve laeuft in der Mitte
// anderthalbmal so schnell wie der Finger und an den Enden gar nicht, und
// genau das liest sich als "die Vorschau scrollt von selbst". Bei einem
// Wechsel ist es umgekehrt: Der laeuft von selbst, und dort waere ein
// gerader Anlauf das Zucken.
const PAN_FROM = 0.14;
const PAN_TO = 0.96;
// Vorne bleibt der Kopf einen Augenblick stehen. Das ist der erste Zustand:
// das Profil als Ganzes, die Story-Reihe allein - und ohne diese Ruhe waere
// er nur der eine Punkt, an dem der Scrollstand genau null ist. Hinten laeuft
// er bis fast ans Ende des Schrittes, damit die Reiterleiste oben steht,
// bevor der naechste Zustand gilt.
const COL_FROM = 0.14;
const COL_TO = 0.98;

// Der Vorlauf fuer die Punkte unter der Flaeche.
export const CAPTION_LEAD = 0.44;

// Die neue Flaeche kommt aus 10 Punkten Tiefe. Mehr sieht nach Rutsche aus,
// weniger sieht man nicht. Der Satz reist weiter: Er ist allein zu sehen, und
// eine Bewegung, die man nicht bemerkt, kann er sich nicht leisten.
const VIEW_RISE_PX = 10;
const CAPTION_RISE_PX = 18;
// Wie weit der Inhalt eines Fensters hoechstens wandert, als Anteil der
// Bildschirmhoehe.
//
// Die Zahl ist nicht frei gewaehlt, sondern folgt aus einer Bedingung: Der
// Inhalt darf sich nie schneller bewegen als der Finger. Ein Fenster, in dem
// der Inhalt schneller laeuft als die Seite, liest sich, als scrollte die
// Vorschau von selbst - und genau dann sucht ein Daumen den zweiten
// Scrollbereich, den es hier nicht gibt.
//
// Ein Schritt ist genau eine Bildschirmhoehe Weg, und die Strecke betraegt
// PAN_TO - PAN_FROM = 0.82 Schritte. Weil der Weg gerade laeuft, ist die
// Geschwindigkeit ueberall dieselbe: 0.75 / 0.82 = 0.91 - etwas langsamer als
// der Finger, an jeder Stelle. (Mit einer weichen Kurve waere es in der Mitte
// das Anderthalbfache davon und damit schneller als der Finger; das ist der
// Grund, warum dieser Weg gerade laeuft.)
//
// Gemessen an der Bildschirmhoehe und nicht an der Hoehe des Fensters: Der
// Weg, der zur Verfuegung steht, ist ein Schritt der Seite - und der ist eine
// Bildschirmhoehe lang, egal wie hoch das Fenster darin gerade ist.
const MAX_PAN_VH = 0.75;

// Unter diesen Schwellen schreibt niemand etwas. Ein Stil, den man setzt,
// ohne dass sich etwas aendert, kostet trotzdem eine Runde im Browser.
const EPS_ALPHA = 0.004;
const EPS_PX = 0.25;

export function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

// Ein Wert zwischen 0 und 1, linear ueber einer Strecke.
//
// Eigene Funktion, ohne DOM: An dieser Rechnung haengt jede Bewegung der
// Seite, und so laesst sie sich pruefen (tests/landing2-sequence.test.mjs).
export function ramp(value = 0, from = 0, to = 1) {
  const v = Number(value);
  if (Number.isNaN(v)) return 0;
  if (!(to > from)) return v >= to ? 1 : 0;
  if (v <= from) return 0;
  if (v >= to) return 1;
  return (v - from) / (to - from);
}

// Weich anfahren, weich anhalten. Ohne das setzt jede Bewegung mit voller
// Geschwindigkeit ein und haelt genauso abrupt an - was man auf dem Handy als
// Zucken sieht, obwohl die Rechnung stetig ist.
export function ease(t = 0) {
  const v = Math.min(1, Math.max(0, Number(t) || 0));
  return v * v * (3 - 2 * v);
}

// Welcher Schritt gilt bei diesem Fortschritt?
//
// Nur noch fuer die Punkte unter der Flaeche und fuer den Vorleser: Was zu
// sehen ist, folgt der stetigen Rechnung oben, nicht dieser Stufe.
//
// progress 0 -> erster Schritt, progress 1 -> letzter. Der letzte Schritt
// bekommt denselben Anteil wie die anderen; ohne das Abschneiden waere er nur
// den einen Augenblick lang zu sehen, in dem progress genau 1 ist.
export function stepFromProgress(progress = 0, stepCount = 1, lead = 0) {
  const steps = Math.max(1, Math.round(stepCount));
  // NaN kommt vor, wenn die Strecke noch nicht gemessen ist (Division durch
  // null). Dann gilt der erste Schritt. Unendlich dagegen ist eine echte
  // Richtung und wird ganz normal begrenzt.
  if (Number.isNaN(progress)) return 0;
  const shifted = (Number(progress) || 0) + (Number(lead) || 0) / steps;
  const clamped = Math.min(1, Math.max(0, shifted));
  return Math.min(steps - 1, Math.floor(clamped * steps));
}

// Die leere Scheibe eines Schrittes: der Grund, auf dem sein Inhalt steht.
//
// Der erste Schritt liegt immer offen; jeder weitere legt sich darueber und
// bleibt dann liegen. Deshalb scheint beim Wechsel nie der Grund der Seite
// durch: Es wird nichts weggenommen, es wird nur etwas darueber gelegt.
// Rueckwaerts hebt man es wieder ab, und darunter steht unveraendert das
// Vorige.
// Welcher Schritt ist bei diesem Scrollstand das Ziel?
//
// Eigene Funktion ohne DOM, weil an ihr haengt, wann ein Wechsel ausgeloest
// wird - und ein Wechsel zu viel oder zu wenig ist nichts, was man beim
// Durchscrollen als Fehler erkennt.
//
// Der Saum verhindert das Flattern an der Grenze: Von Schritt 1 nach 2 geht es
// erst bei 2.12, zurueck erst bei 1.88. Ein Finger, der genau auf der Kante
// zur Ruhe kommt, wackelt um wenige Pixel - ohne Saum ergaebe das ein Hin und
// Her zwischen zwei Schritten, und das sieht aus wie ein Wackelkontakt.
export function stepTarget(u = 0, stepCount = 1, current = 0) {
  const steps = Math.max(1, Math.round(stepCount));
  const value = Number(u);
  if (Number.isNaN(value)) return 0;
  const now = Math.min(steps - 1, Math.max(0, Math.round(current) || 0));
  let next = now;
  // Nur um einen Schritt je Auswertung weiter - aber beliebig oft
  // hintereinander, damit ein schneller Wisch nicht steckenbleibt.
  while (next < steps - 1 && value >= next + 1 + STEP_HYSTERESIS) next += 1;
  while (next > 0 && value < next - STEP_HYSTERESIS) next -= 1;
  return next;
}

export function viewPlate(u = 0, index = 0) {
  if (index <= 0) return 1;
  return ease(ramp(u, index - 1 + VIEW_PLATE_FROM, index - 1 + VIEW_PLATE_TO));
}

// Und der Inhalt darauf - er kommt erst, wenn die Scheibe ganz liegt.
export function viewBody(u = 0, index = 0) {
  if (index <= 0) return 1;
  return ease(ramp(u, index - 1 + VIEW_BODY_FROM, index - 1 + VIEW_BODY_TO));
}

// Und wie durchsichtig ist die Beschriftung?
//
// Anders als die Flaechen haben die Saetze keinen eigenen Grund, mit dem sie
// einander verdecken koennten - hier muss der alte wirklich gehen, bevor der
// neue kommt.
export function captionArrival(u = 0, index = 0) {
  if (index <= 0) return 1;
  return ease(ramp(u, index - 1 + CAPTION_IN_FROM, index - 1 + CAPTION_IN_TO));
}

export function captionDeparture(u = 0, index = 0, count = 1) {
  const last = Math.max(1, Math.round(count)) - 1;
  if (index >= last) return 1;
  return 1 - ease(ramp(u, index + CAPTION_OUT_FROM, index + CAPTION_OUT_TO));
}

export function captionAlpha(u = 0, index = 0, count = 1) {
  return Math.min(captionArrival(u, index), captionDeparture(u, index, count));
}

/* --------------------------------------------- Die beiden stetigen Wege */

// Wie weit der Kopf eines Bildschirms schon aus dem Bild gewandert ist.
//
// Das ist der Weg, der aus zwei Aufnahmen einen Bildschirm macht: Solange
// diese Zahl zwischen 0 und 1 laeuft, scrollt der Betrachter in EINEM Profil
// nach unten - er bekommt keinen zweiten hingelegt.
//
// Sie haengt am Scrollstand und nicht an der Bewegung: Wer langsam wischt,
// sieht den Kopf langsam gehen; wer mitten darin umkehrt, sieht ihn
// zurueckkommen. Es gibt nichts, was sich etwas anderes merken koennte.
export function colTravel(u = 0, from = 0) {
  return ramp(u, from + COL_FROM, from + COL_TO);
}

// Und wie weit der Inhalt eines Feldes in seinem Fenster gewandert ist.
//
// Gerechnet wird gegen den LETZTEN Schritt, zu dem das Feld gehoert: Die
// Beitraege im Profil gehoeren zu Schritt 0 und 1 - im ersten liegen sie unter
// dem Kopf, im zweiten sind sie da. Wandern duerfen sie erst im zweiten.
export function panTravel(u = 0, to = 0) {
  return ramp(u, to + PAN_FROM, to + PAN_TO);
}

/* -------------------------------------------------------- Bildschirmhoehe */

// Die Hoehe des Bildschirms festnageln.
//
// Gemessen wird beim ersten Aufschlag - also mit sichtbarer Adressleiste, der
// kleineren der beiden Hoehen. Das ist Absicht: Eine Buehne, die auf die
// groessere Hoehe gebaut ist, steht unten aus dem Bild heraus, sobald Safari
// seine Leisten wieder einblendet.
function lockViewport() {
  const root = document.documentElement;
  let locked = 0;

  const apply = () => {
    const height = Math.round(window.innerHeight || 0);
    if (!(height > 0)) return;
    if (locked && Math.abs(height - locked) < HEIGHT_NOISE_PX) return false;
    locked = height;
    root.style.setProperty("--l2-vh", `${height}px`);
    return true;
  };

  apply();

  let timer = 0;
  const onResize = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(apply, RESIZE_SETTLE_MS);
  };

  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });
  return { measure: apply };
}

/* ------------------------------------------------------------- Einblenden */

// Abschnitte fahren herein, sobald sie ins Bild kommen - einmal. Ein
// Abschnitt, der beim Zurueckscrollen wieder verschwindet, wirkt nervoes.
//
// Das ist bewusst NICHT die Sequenz: Hier geht es um das erste Erscheinen
// eines Abschnitts, nicht um seinen Zustand. Der Zustand haengt an der
// Rechnung oben und laeuft in beide Richtungen.
function revealSections() {
  const nodes = Array.from(document.querySelectorAll(".l2-section, .l2-hero"));
  if (!nodes.length) return;

  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

  nodes.forEach((node) => observer.observe(node));
}

/* --------------------------------------------------------------- Sequenzen */

// Die beiden Endwerte werden IMMER geschrieben, auch wenn der Sprung dorthin
// winzig ist.
//
// Sonst bleibt eine Flaeche bei 0.9985 stehen, weil der Rest unter der
// Schwelle liegt - und daran haengt mehr als ein Rundungsfehler: An "ganz
// da" (1) und "ganz weg" (0) entscheidet sich, was ueberhaupt noch gezeichnet
// werden muss (applyPaint). Eine Flaeche, die nie ganz ankommt, laesst alle
// darunter fuer immer mitzeichnen.
function writeAlpha(entry, alpha) {
  if (alpha === entry.alpha) return;
  if (alpha > 0 && alpha < 1 && Math.abs(alpha - entry.alpha) < EPS_ALPHA) return;
  entry.alpha = alpha;
  entry.node.style.opacity = String(Math.round(alpha * 1000) / 1000);
}

function writeShift(entry, px) {
  if (px === entry.shift) return;
  if (px !== 0 && Math.abs(px - entry.shift) < EPS_PX) return;
  entry.shift = px;
  entry.node.style.transform = px === 0 ? "" : `translate3d(0, ${Math.round(px * 10) / 10}px, 0)`;
}

function startSequences() {
  const sections = Array.from(document.querySelectorAll(".l2-seq"));
  if (!sections.length) return () => {};

  const num = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const seqs = sections.map((section) => {
    const captions = Array.from(section.querySelectorAll("[data-caption]")).map((node) => ({
      node,
      alpha: -1,
      shift: Number.NaN
    }));

    // Eine Flaeche kann jetzt mehrere Schritte tragen.
    //
    // Das ist der ganze Unterschied zu vorher: Frueher war ein Schritt eine
    // Aufnahme, und der naechste Schritt legte die naechste Aufnahme darueber.
    // Jetzt sagt eine Flaeche, VON welchem bis zu WELCHEM Schritt sie gilt -
    // und was innerhalb dieser Schritte passiert, ist Scroll und kein Wechsel:
    // Der Kopf wandert nach oben (col), die Reiterleiste bleibt stehen
    // (stick), und darunter laeuft ein Feld (panel).
    //
    // Erst wenn eine ANDERE Flaeche an der Reihe ist, legt sie sich als leere
    // Scheibe darueber. Nie stehen zwei Mnyra-Oberflaechen halbdurchsichtig
    // uebereinander - das gilt unveraendert.
    const views = Array.from(section.querySelectorAll("[data-viewkey]")).map((node) => {
      const inner = node.querySelector(".l2-screen__inner") || node;
      const flow = node.querySelector(".l2-flow");
      const colNode = node.querySelector("[data-l2-col]");
      const headNode = node.querySelector("[data-l2-head]");
      const stickNode = node.querySelector("[data-l2-stick]");
      const panelsNode = node.querySelector("[data-l2-panels]");
      const from = num(node.dataset.from, 0);
      const tabs = String(node.dataset.tabs || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const panels = Array.from(node.querySelectorAll("[data-l2-panel]")).map((panelNode) => ({
        plate: { node: panelNode, alpha: -1 },
        pan: { node: panelNode.querySelector("[data-l2-pan]") || panelNode, shift: Number.NaN },
        from: num(panelNode.dataset.from, 0),
        to: num(panelNode.dataset.to, num(panelNode.dataset.from, 0)),
        panBy: 0,
        painted: null
      }));
      // Eine Flaeche ohne Flow - Harta, Lokalet, der Aufsteller: ein Fenster,
      // ein Inhalt. Ihr Versatz haengt am letzten Schritt der Flaeche.
      const loose = flow ? null : node.querySelector("[data-l2-pan]");
      return {
        node,
        flow,
        plate: { node, alpha: -1 },
        body: { node: inner, alpha: -1, shift: Number.NaN },
        col: colNode ? { node: colNode, shift: Number.NaN } : null,
        headNode,
        stickNode,
        panelsNode,
        panels,
        loose: loose ? { node: loose, shift: Number.NaN } : null,
        looseBy: 0,
        colBy: 0,
        from,
        to: num(node.dataset.to, from),
        tabs,
        tabNodes: tabs.length ? Array.from(node.querySelectorAll("[data-l2-tab]")) : [],
        painted: null
      };
    });

    return {
      section,
      captions,
      views,
      dots: Array.from(section.querySelectorAll(".l2-seq__dot")),
      count: Math.max(1, captions.length),
      top: 0,
      span: 1,
      // Wo der Scrollstand steht, wohin er zeigt und wo die Bewegung gerade
      // ist. Alle drei folgen dem Scrollstand; keiner wird sich gemerkt.
      u: 0,
      target: 0,
      shown: 0,
      from: 0,
      startedAt: 0,
      step: -1
    };
  });

  // Wo faengt jeder Abschnitt an, wie lang ist seine Strecke, wie hoch ist
  // seine hoechste Beschriftung, wie hoch muss ein Kopf mindestens sein und
  // wie weit laesst sich jedes Feld schieben? Einmal im Stillstand ausmessen,
  // waehrend des Wischens nur noch rechnen.
  const measure = () => {
    const scrolled = window.scrollY || window.pageYOffset || 0;
    const viewport = window.innerHeight || 1;
    seqs.forEach((seq) => {
      const rect = seq.section.getBoundingClientRect();
      seq.top = Math.round(rect.top + scrolled);
      seq.span = Math.max(1, Math.round(rect.height - viewport));

      // Die Beschriftungen liegen uebereinander. Damit die Flaeche darunter
      // bei jedem Schritt an derselben Stelle steht, bekommt der Kasten die
      // Hoehe der laengsten - und zwar gemessen, nicht geschaetzt: Auf 320
      // Punkten braucht derselbe Satz eine Zeile mehr als auf 430.
      let tallest = 0;
      seq.captions.forEach((caption) => {
        tallest = Math.max(tallest, caption.node.offsetHeight || 0);
      });
      if (tallest > 0) seq.section.style.setProperty("--l2-cap-h", `${Math.ceil(tallest)}px`);

      seq.views.forEach((view) => {
        if (view.flow) {
          const frameHeight = view.flow.clientHeight || 0;
          // Mit seinen Raendern, nicht ohne.
          //
          // Die Reiterleiste von Mnyra traegt oben und unten einen Abstand
          // (mt-4, mb-6) - er gehoert zu ihr und steht in der App genauso da.
          // Wer nur ihre Kastenhoehe abzieht, laesst den Kopf um diese vierzig
          // Punkte zu hoch werden, und dann steht die Leiste im ersten Zustand
          // halb unter dem unteren Rand. Das ist genau der Zustand, den es
          // nicht geben darf: ein Profil, dessen Reiter man nicht sieht.
          let stickHeight = 0;
          if (view.stickNode) {
            const box = window.getComputedStyle(view.stickNode);
            stickHeight = (view.stickNode.offsetHeight || 0)
              + (parseFloat(box.marginTop) || 0)
              + (parseFloat(box.marginBottom) || 0);
          }
          const bodyHeight = Math.max(0, frameHeight - stickHeight);

          // Der Kopf ist mindestens so hoch wie das, was ohne ihn zu sehen
          // waere.
          //
          // Das ist die Zeile, an der der erste Zustand haengt: Ohne sie
          // schaute unter dem Profilkopf schon die erste Beitragskachel
          // hervor, und der Wirt saehe "mein Profil UND noch etwas" statt
          // "mein Profil". Was der Kopf nicht ausfuellt, ist der Grund der
          // App - dieselbe ruhige Flaeche, die in der App unter einem kurzen
          // Profil steht. Verkleinert wird dafuer nichts.
          if (view.headNode && view.headNode.getAttribute("data-l2-head") === "fill") {
            view.headNode.style.minHeight = `${bodyHeight}px`;
          }
          if (view.panelsNode) view.panelsNode.style.height = `${bodyHeight}px`;
          // Ohne Kopf wandert nichts: Das Paneli tauscht beim Reiterwechsel
          // nur die Flaeche darunter, seine Kennzahlen bleiben stehen - und
          // eine Saeule, die dabei wanderte, waere eine Bewegung, die es in
          // der App an dieser Stelle nicht gibt.
          view.colBy = view.headNode ? Math.round(view.headNode.offsetHeight || 0) : 0;

          view.panels.forEach((panel) => {
            panel.plate.node.style.height = `${bodyHeight}px`;
            const over = Math.max(0, (panel.pan.node.scrollHeight || 0) - bodyHeight);
            panel.panBy = Math.round(Math.min(over, viewport * MAX_PAN_VH));
          });
          return;
        }
        if (!view.loose) return;
        const frame = view.loose.node.parentElement;
        const frameHeight = frame ? frame.clientHeight : 0;
        const over = Math.max(0, (view.loose.node.scrollHeight || 0) - frameHeight);
        view.looseBy = Math.round(Math.min(over, viewport * MAX_PAN_VH));
      });
    });
  };

  // Was der Vorleser hoert, welcher Reiter aktiv ist und welcher Punkt
  // leuchtet. Alles drei ist eine Stufe und keine Kurve - und alles drei wird
  // nur beim Wechsel geschrieben.
  const applyStep = (seq, step) => {
    if (step === seq.step) return;
    seq.step = step;
    seq.section.dataset.step = String(step);
    seq.views.forEach((view) => {
      const active = step >= view.from && step <= view.to;
      if (active) view.plate.node.removeAttribute("aria-hidden");
      else view.plate.node.setAttribute("aria-hidden", "true");

      view.panels.forEach((panel) => {
        const panelActive = active && step >= panel.from && step <= panel.to;
        if (panelActive) panel.plate.node.removeAttribute("aria-hidden");
        else panel.plate.node.setAttribute("aria-hidden", "true");
      });

      // Der Reiterwechsel - und der ist der Punkt, an dem sich entscheidet,
      // ob die Seite ehrlich ist.
      //
      // Der Scrollstand sagt WANN. Wie es aussieht, sagt Mnyra: Es ist
      // dieselbe Leiste, dieselben beiden Felder, und getauscht werden nur
      // die Klassen, die die App selbst an einen aktiven Reiter haengt. Die
      // Bewegung dazwischen ist die der App (transition-all duration-300) -
      // nicht eine, die hier erfunden wurde. Wer zusieht, sieht, was er sehen
      // wuerde, wenn er selbst getippt haette.
      if (!view.tabs.length || !view.tabNodes.length) return;
      const index = Math.min(view.tabs.length - 1, Math.max(0, step - view.from));
      const wanted = view.tabs[index];
      view.tabNodes.forEach((tabNode) => {
        const on = tabNode.getAttribute("data-l2-tab") === wanted;
        tabNode.setAttribute("aria-selected", on ? "true" : "false");
        const onList = String(tabNode.getAttribute("data-l2-tab-on") || "").split(/\s+/).filter(Boolean);
        const offList = String(tabNode.getAttribute("data-l2-tab-off") || "").split(/\s+/).filter(Boolean);
        if (!onList.length && !offList.length) return;
        (on ? offList : onList).forEach((name) => tabNode.classList.remove(name));
        (on ? onList : offList).forEach((name) => tabNode.classList.add(name));
      });
    });
    seq.captions.forEach((caption, index) => {
      if (index === step) caption.node.removeAttribute("aria-hidden");
      else caption.node.setAttribute("aria-hidden", "true");
    });
    seq.dots.forEach((node, index) => node.classList.toggle("is-active", index === step));
  };

  // Was gezeichnet werden muss - und vor allem: was nicht.
  //
  // Auf der Buehne liegen mehrere vollstaendige Mnyra-Oberflaechen
  // uebereinander. Sichtbar ist davon immer nur die oberste, und waehrend
  // eines Wechsels zwei. Alle anderen bekommen visibility:hidden.
  //
  // Das ist nicht Kosmetik, sondern der Grund, warum es nicht hakt: Ein
  // Browser zeichnet auch, was unter einer undurchsichtigen Flaeche liegt,
  // solange es nur durchsichtig gestellt ist. Auf einem Telefon mit
  // dreifacher Punktdichte ist jede Flaeche rund neun Megabyte.
  //
  // Fuer die Felder INNERHALB einer Flaeche gilt dasselbe: Die Menue liegt
  // ueber den Beitraegen, und solange sie ganz deckt, muessen die Beitraege
  // nicht mitgezeichnet werden.
  const applyPaint = (seq) => {
    let unten = 0;
    seq.views.forEach((view, index) => {
      if (view.plate.alpha >= 1) unten = index;
    });
    seq.views.forEach((view, index) => {
      const zeigen = index >= unten && view.plate.alpha > 0;
      if (zeigen !== view.painted) {
        view.painted = zeigen;
        view.plate.node.classList.toggle("is-off", !zeigen);
      }
      if (!zeigen) return;
      let untenPanel = 0;
      view.panels.forEach((panel, panelIndex) => {
        if (panel.plate.alpha >= 1) untenPanel = panelIndex;
      });
      view.panels.forEach((panel, panelIndex) => {
        const zeigePanel = panelIndex >= untenPanel && panel.plate.alpha > 0;
        if (zeigePanel === panel.painted) return;
        panel.painted = zeigePanel;
        panel.plate.node.classList.toggle("is-off", !zeigePanel);
      });
    });
  };

  // Die Bewegung selbst: von "a" auf den Zielschritt zu, in einem Zug - und
  // daneben die stetigen Wege, die weiter am Scrollstand haengen.
  const drawSeq = (seq, u, a) => {
    seq.views.forEach((view) => {
      writeAlpha(view.plate, viewPlate(a, view.from));
      const body = viewBody(a, view.from);
      writeAlpha(view.body, body);
      writeShift(view.body, (1 - body) * VIEW_RISE_PX);

      // Der Kopf wandert nach oben - stetig, am Scrollstand.
      if (view.col && view.colBy > 0) {
        writeShift(view.col, -view.colBy * colTravel(u, view.from));
      }

      view.panels.forEach((panel) => {
        // Das erste Feld einer Flaeche liegt immer offen; jedes weitere legt
        // sich darueber und bleibt dann liegen. Rueckwaerts hebt man es
        // wieder ab, und darunter steht unveraendert das Vorige.
        writeAlpha(panel.plate, panel.from <= view.from ? 1 : viewPlate(a, panel.from));
        if (panel.panBy > 0) writeShift(panel.pan, -panel.panBy * panTravel(u, panel.to));
      });

      if (view.loose && view.looseBy > 0) {
        writeShift(view.loose, -view.looseBy * panTravel(u, view.to));
      }
    });

    seq.captions.forEach((caption, index) => {
      const arriving = captionArrival(a, index);
      const leaving = captionDeparture(a, index, seq.count);
      writeAlpha(caption, Math.min(arriving, leaving));
      writeShift(caption, (1 - arriving) * CAPTION_RISE_PX - (1 - leaving) * CAPTION_RISE_PX);
    });

    applyPaint(seq);
  };

  // Der Scrollstand sagt, welcher Schritt gilt - und wie weit die stetigen
  // Wege darin schon gelaufen sind.
  //
  // Gerechnet wird fuer jede Sequenz, auch fuer die zehn Bildschirme weiter
  // unten. Das kostet ein paar Multiplikationen; geschrieben wird ohnehin nur,
  // was sich geaendert hat. Ein Beobachter, der Sequenzen ausserhalb des
  // Bildes abschaltet, spart nichts und schafft dafuer den einen Zustand, den
  // es hier nicht geben darf: einen, der haengenbleibt.
  const sample = () => {
    const scrolled = window.scrollY || window.pageYOffset || 0;
    let laeuft = false;
    seqs.forEach((seq) => {
      const progress = Math.min(1, Math.max(0, (scrolled - seq.top) / seq.span));
      seq.u = progress * seq.count;
      const ziel = stepTarget(seq.u, seq.count, seq.target);
      if (ziel !== seq.target) {
        seq.target = ziel;
        applyStep(seq, ziel);
        starte(seq);
      }
      if (seq.shown !== seq.target) laeuft = true;
    });
    return laeuft;
  };

  // Eine Bewegung anstossen. Sie faengt dort an, wo die vorige gerade steht -
  // deshalb bleibt beim Umkehren mitten im Wechsel nichts haengen.
  const starte = (seq) => {
    const weit = Math.abs(seq.target - seq.shown);
    if (weit > CATCH_UP_STEPS) {
      // Ueber mehrere Schritte hinweggewischt: Vorgefuehrt wird nur der
      // letzte. Die uebrigen liest ohnehin niemand mit.
      seq.shown = seq.target - Math.sign(seq.target - seq.shown);
    }
    seq.from = seq.shown;
    seq.startedAt = 0;
  };

  let frame = 0;
  const tick = (now) => {
    frame = 0;
    let laeuft = false;
    seqs.forEach((seq) => {
      if (seq.shown === seq.target) {
        drawSeq(seq, seq.u, seq.shown);
        return;
      }
      if (!seq.startedAt) seq.startedAt = now;
      const weit = Math.abs(seq.target - seq.from) || 1;
      const t = Math.min(1, (now - seq.startedAt) / (STEP_MS * weit));
      seq.shown = t >= 1 ? seq.target : seq.from + (seq.target - seq.from) * ease(t);
      drawSeq(seq, seq.u, seq.shown);
      if (seq.shown !== seq.target) laeuft = true;
    });
    seqs.forEach((seq) => {
      seq.section.classList.toggle("is-moving", seq.shown !== seq.target);
    });
    if (laeuft) frame = window.requestAnimationFrame(tick);
  };

  const wecken = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(tick);
  };

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      sample();
      // Immer ein Bild rechnen: Auch wenn kein Wechsel faellig ist, wandern
      // Kopf und Feld mit dem Scrollstand.
      wecken();
    });
  };

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      sample();
      wecken();
    }, RESIZE_SETTLE_MS);
  };

  measure();
  // Der erste Schritt muss einmal geschrieben werden, auch wenn das Ziel schon
  // stimmt: Reiter, Vorleser und Punkte stehen sonst auf dem, was im Markup
  // steht, und nicht auf dem, was der Scrollstand sagt.
  seqs.forEach((seq) => applyStep(seq, stepTarget(seq.u, seq.count, 0)));
  sample();
  wecken();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  // Bilder aendern die Hoehe, sobald sie da sind. Ohne dieses Nachmessen
  // rechnet die Sequenz den Rest der Sitzung gegen eine Strecke, die es so
  // nicht mehr gibt - und der Inhalt wandert weiter, als das Fenster lang ist.
  window.addEventListener("load", onResize, { once: true });

  return () => {
    measure();
    sample();
    wecken();
  };
}

export function startLanding2Scroll() {
  const reduced = prefersReducedMotion();
  document.documentElement.classList.toggle("l2-reduced", reduced);

  const viewport = lockViewport();
  revealSections();

  if (reduced) {
    // Ohne Bewegung gibt es keine Sequenz: Alle Ansichten stehen
    // untereinander, jede mit ihrem Satz darueber. Das ist dieselbe
    // Information, nur ohne die Bewegung - und nicht eine gekuerzte Fassung.
    //
    // Wo die Dinge stehen, sagt das Stylesheet (.l2-reduced). Ein Stil von
    // Hand waere genau die Zeile, die spaeter die einfache Darstellung wieder
    // zunichte macht.
    //
    // Eine Sache muss aber von Hand weg: In der Sequenz sind alle Schritte
    // ausser dem ersten fuer den Vorleser verborgen - dort sieht man ja auch
    // nur einen. Hier stehen sie alle da, und was man sieht, muss man auch
    // hoeren koennen. Sonst waere die Fassung ohne Bewegung fuer einen
    // Vorleser genau die gekuerzte, die sie nicht sein darf.
    document.querySelectorAll(".l2-seq [data-caption], .l2-seq [data-viewkey], .l2-seq [data-l2-panel]")
      .forEach((node) => node.removeAttribute("aria-hidden"));
    return { remeasure: () => {} };
  }

  const remeasure = startSequences();
  return {
    remeasure: () => {
      viewport.measure();
      remeasure();
    }
  };
}
