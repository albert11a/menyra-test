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

// Der Fahrplan einer Sequenz.
//
// Gerechnet wird in Schritten: u = 0 ist der erste Schritt, u = 1 der zweite,
// u = n der letzte. Ein Schritt ist genau eine Bildschirmhoehe Weg.
//
// Innerhalb eines Schrittes i passiert der Reihe nach:
//
//   i + 0.00 .. i + 0.34   der Schritt steht still
//   i + 0.20 .. i + 0.88   der Inhalt der Vorschau wandert nach oben
//   i + 0.34 .. i + 0.48   der alte Satz geht nach oben weg
//   i + 0.49 .. i + 0.63   der neue Satz kommt von unten
//   i + 0.70 .. i + 0.85   die neue Flaeche legt sich als leere Scheibe darueber
//   i + 0.85 .. i + 1.00   ihr Inhalt kommt darauf
//   i + 1.00               der naechste Schritt steht
//
// Die Beschriftung geht der Flaeche voraus: Man liest "Menuja jote", und dann
// kommt die Menue. Wechselten beide gleichzeitig, laese es sich wie "es ist
// ploetzlich etwas anderes da" - und die Frage "warum?" kostet mehr
// Aufmerksamkeit, als die Bewegung wert ist.
//
// Die beiden Saetze ueberschneiden sich NICHT. Das war der erste Versuch:
// beide in derselben Strecke, gegenlaeufig - und in der Mitte standen zwei
// halbdurchsichtige Ueberschriften uebereinander. Wer dort langsam scrollt,
// sieht kein Umschlagen, sondern zwei Saetze zugleich, und das liest sich wie
// ein Fehler. Anders als bei den Flaechen hilft hier kein Uebereinanderlegen:
// Ein Satz hat keinen eigenen Grund, mit dem er den darunter verdecken
// koennte.
//
// Also geht der alte erst ganz, dann kommt der neue. Dazwischen liegen 0.02
// Schritte ohne Satz - bei einer Bildschirmhoehe je Schritt sind das rund
// fuenfzehn Punkte Weg, ein Wimpernschlag. Man liest es als "der Satz wird
// ausgetauscht", und genau das passiert.
const CAPTION_OUT_FROM = 0.34;
const CAPTION_OUT_TO = 0.48;
const CAPTION_IN_FROM = 0.49;
const CAPTION_IN_TO = 0.63;
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
// alte, dann ein ruhiger Grund, dann die neue. Es liest sich wie ein
// Bildschirmwechsel in der App - und genau das soll es sein.
const VIEW_PLATE_FROM = 0.7;
const VIEW_PLATE_TO = 0.85;
const VIEW_BODY_FROM = 0.85;
const VIEW_BODY_TO = 1;
const PAN_FROM = 0.2;
const PAN_TO = 0.88;

// Der Vorlauf fuer die Punkte unter der Flaeche - dieselbe Stelle, an der der
// neue Satz zur Haelfte dasteht (Mitte von CAPTION_IN).
export const CAPTION_LEAD = 0.44;

// Die neue Flaeche kommt aus 10 Punkten Tiefe. Mehr sieht nach Rutsche aus,
// weniger sieht man nicht. Der Satz reist weiter: Er ist allein zu sehen, und
// eine Bewegung, die man nicht bemerkt, kann er sich nicht leisten.
const VIEW_RISE_PX = 10;
const CAPTION_RISE_PX = 18;
// Wie weit der Inhalt einer Vorschau hoechstens wandert, als Anteil der
// Fensterhoehe.
//
// Die Zahl ist nicht frei gewaehlt, sondern folgt aus einer Bedingung: Der
// Inhalt darf sich nie schneller bewegen als der Finger. Ein Fenster, in dem
// der Inhalt schneller laeuft als die Seite, liest sich, als scrollte die
// Vorschau von selbst - und genau dann sucht ein Daumen den zweiten
// Scrollbereich, den es hier nicht gibt.
//
// Die Strecke betraegt PAN_TO - PAN_FROM = 0.7 Schritte, also 0.7
// Bildschirmhoehen Weg. Bei 0.35 Fensterhoehen Versatz und dem steilsten
// Punkt der weichen Kurve (Faktor 1,5) macht das
// 0.35 / 0.7 * 1.5 = 0.75 - drei Viertel der Fingergeschwindigkeit. Wer die
// Zahl erhoeht, muss die Strecke mit erhoehen.
const MAX_PAN_RATIO = 0.35;

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

function writeAlpha(entry, alpha) {
  if (Math.abs(alpha - entry.alpha) < EPS_ALPHA) return;
  entry.alpha = alpha;
  entry.node.style.opacity = String(Math.round(alpha * 1000) / 1000);
}

function writeShift(entry, px) {
  if (Math.abs(px - entry.shift) < EPS_PX) return;
  entry.shift = px;
  entry.node.style.transform = `translate3d(0, ${Math.round(px * 10) / 10}px, 0)`;
}

function startSequences() {
  const sections = Array.from(document.querySelectorAll(".l2-seq"));
  if (!sections.length) return () => {};

  const seqs = sections.map((section) => {
    const captions = Array.from(section.querySelectorAll("[data-caption]")).map((node) => ({
      node,
      alpha: -1,
      shift: Number.NaN
    }));
    // Drei Knoten je Schritt, und jeder traegt genau eine Bewegung:
    //
    //   plate  die leere Scheibe - deckt beim Wechsel die vorige Flaeche zu
    //   body   der Inhalt darauf - kommt erst, wenn die Scheibe ganz liegt
    //   pan    der Ausschnitt darin - wandert waehrend des Schrittes nach oben
    //
    // Faende sich der Inhalt nicht, traegt die Scheibe ihn selbst. Dann sieht
    // man wieder ein gewoehnliches Ueberblenden - nicht schoen, aber auch
    // nicht kaputt.
    const views = Array.from(section.querySelectorAll("[data-viewkey]")).map((node) => {
      const inner = node.querySelector(".l2-screen__inner") || node;
      const panNode = node.querySelector("[data-l2-pan]");
      return {
        plate: { node, alpha: -1 },
        body: { node: inner, alpha: -1, shift: Number.NaN },
        pan: panNode ? { node: panNode, shift: Number.NaN } : null,
        panBy: 0
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
      step: -1,
      dotStep: -1
    };
  });

  // Wo faengt jeder Abschnitt an, wie lang ist seine Strecke, wie hoch ist
  // seine hoechste Beschriftung und wie weit laesst sich jede Vorschau
  // schieben? Einmal im Stillstand ausmessen, waehrend des Wischens nur noch
  // rechnen.
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
        if (!view.pan) return;
        const frame = view.pan.node.parentElement;
        const frameHeight = frame ? frame.clientHeight : 0;
        const contentHeight = view.pan.node.scrollHeight || 0;
        const over = Math.max(0, contentHeight - frameHeight);
        view.panBy = Math.round(Math.min(over, frameHeight * MAX_PAN_RATIO));
      });
    });
  };

  // Was der Vorleser hoert und welcher Punkt leuchtet. Beides ist eine Stufe
  // und keine Kurve - und beides wird nur beim Wechsel geschrieben.
  const applyStep = (seq, step) => {
    if (step === seq.step) return;
    seq.step = step;
    seq.section.dataset.step = String(step);
    seq.views.forEach((view, index) => {
      if (index === step) view.plate.node.removeAttribute("aria-hidden");
      else view.plate.node.setAttribute("aria-hidden", "true");
    });
    seq.captions.forEach((caption, index) => {
      if (index === step) caption.node.removeAttribute("aria-hidden");
      else caption.node.setAttribute("aria-hidden", "true");
    });
  };

  const applyDots = (seq, step) => {
    if (step === seq.dotStep) return;
    seq.dotStep = step;
    seq.dots.forEach((node, index) => node.classList.toggle("is-active", index === step));
  };

  // Gerechnet wird bei jedem Bild fuer jede Sequenz - auch fuer die, die
  // gerade zehn Bildschirme entfernt liegt.
  //
  // Frueher schaltete ein IntersectionObserver Sequenzen ausserhalb des
  // Bildes ab. Das sparte nichts Messbares (zwei Sequenzen, sieben Flaechen,
  // ein paar Multiplikationen) und schuf einen Zustand, den es hier nicht
  // geben darf: Eine abgeschaltete Sequenz behaelt den Stand, bei dem sie
  // abgeschaltet wurde. Wischt jemand schnell an ihr vorbei und kommt zurueck,
  // haengt sie an dieser Stelle, bis der Beobachter sich meldet - und der
  // meldet sich nicht in dem Bild, in dem sie wieder sichtbar wird.
  //
  // Teuer waeren Schreibvorgaenge, nicht Rechnen. Geschrieben wird nur, was
  // sich geaendert hat (writeAlpha, writeShift), und bei einer Sequenz
  // ausserhalb des Bildes aendert sich nichts: Ihr Fortschritt steht an der
  // Grenze und bleibt dort.
  const sample = () => {
    const scrolled = window.scrollY || window.pageYOffset || 0;
    seqs.forEach((seq) => {
      const progress = Math.min(1, Math.max(0, (scrolled - seq.top) / seq.span));
      const u = progress * seq.count;

      seq.views.forEach((view, index) => {
        writeAlpha(view.plate, viewPlate(u, index));
        const body = viewBody(u, index);
        writeAlpha(view.body, body);
        writeShift(view.body, (1 - body) * VIEW_RISE_PX);
        if (view.pan && view.panBy > 0) {
          writeShift(view.pan, -view.panBy * ease(ramp(u, index + PAN_FROM, index + PAN_TO)));
        }
      });

      seq.captions.forEach((caption, index) => {
        // Der ankommende Satz kommt von unten, der gehende zieht nach oben.
        // Die beiden Fenster liegen einen Schritt auseinander, also kann immer
        // nur eines der beiden Masse von 1 verschieden sein.
        const arriving = captionArrival(u, index);
        const leaving = captionDeparture(u, index, seq.count);
        writeAlpha(caption, Math.min(arriving, leaving));
        writeShift(caption, (1 - arriving) * CAPTION_RISE_PX - (1 - leaving) * CAPTION_RISE_PX);
      });

      applyStep(seq, stepFromProgress(progress, seq.count));
      applyDots(seq, stepFromProgress(progress, seq.count, CAPTION_LEAD));
    });
  };

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      sample();
    });
  };

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measure();
      sample();
    }, RESIZE_SETTLE_MS);
  };

  measure();
  sample();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  // Bilder aendern die Hoehe, sobald sie da sind. Ohne dieses Nachmessen
  // rechnet die Sequenz den Rest der Sitzung gegen eine Strecke, die es so
  // nicht mehr gibt - und der Inhalt wandert weiter, als das Fenster lang ist.
  window.addEventListener("load", onResize, { once: true });

  return () => {
    measure();
    sample();
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
    document.querySelectorAll(".l2-seq [data-caption], .l2-seq [data-viewkey]")
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
