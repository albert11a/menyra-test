// Das Scrollverhalten von Landing 2.
//
// Drei Dinge, mehr nicht:
//
//  1. Die Bildschirmhoehe festnageln. 100dvh ist auf dem Handy kein fester
//     Wert, sondern die gerade sichtbare Hoehe. Blendet der Browser mitten im
//     Wischen seine Leisten ein oder aus, aendert jeder Abschnitt in derselben
//     Bewegung seine Hoehe - und die Sequenz springt unter dem Finger weg.
//     Deshalb wird einmal gemessen und der Wert als Zahl in Pixeln gesetzt.
//
//  2. Die Sequenzen weiterschalten. Der Scrollstand innerhalb eines
//     Abschnitts sagt, welcher Schritt gilt. Geschrieben wird ein Attribut -
//     umgeblendet wird per CSS. Nichts wird ausgetauscht, nichts neu gebaut.
//
//  3. Abschnitte einblenden, wenn sie ins Bild kommen.
//
// Kein Scroll-Snap, kein Reels-Gefuehl: Wer schnell durchwischen will, soll
// das koennen. Die Seite haelt niemanden fest.
//
// Gerechnet wird gegen eine Tabelle von Zahlen, die im Stillstand einmal
// ausgemessen wird - nicht gegen das Layout. Sonst waere die Messung selbst
// der Grund, warum das Wischen hakt: Jedes getBoundingClientRect() mitten in
// der Bewegung zwingt den Browser, das Layout neu zu rechnen.

const RESIZE_SETTLE_MS = 160;
// Kleine Aenderungen der Hoehe sind die Adressleiste, nicht eine Drehung des
// Geraets. Wer darauf neu misst, misst bei jedem Wisch neu.
const HEIGHT_NOISE_PX = 90;

export function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

// Welcher Schritt gilt bei diesem Fortschritt?
//
// Eigene Funktion, ohne DOM: An ihr haengt, was der Wirt sieht, und sie laesst
// sich so pruefen (tests/landing2-sequence.test.mjs).
//
// progress 0 -> erster Schritt, progress 1 -> letzter. Der letzte Schritt
// bekommt denselben Anteil wie die anderen; ohne das Abschneiden waere er nur
// den einen Augenblick lang zu sehen, in dem progress genau 1 ist.
export function stepFromProgress(progress = 0, stepCount = 1) {
  const steps = Math.max(1, Math.round(stepCount));
  // NaN kommt vor, wenn die Strecke noch nicht gemessen ist (Division durch
  // null). Dann gilt der erste Schritt. Unendlich dagegen ist eine echte
  // Richtung und wird ganz normal begrenzt.
  if (Number.isNaN(progress)) return 0;
  const clamped = Math.min(1, Math.max(0, Number(progress) || 0));
  return Math.min(steps - 1, Math.floor(clamped * steps));
}

// Die Hoehe des Bildschirms festnageln.
function lockViewport() {
  const root = document.documentElement;
  let locked = 0;

  const apply = () => {
    const height = Math.round(window.innerHeight || 0);
    if (!(height > 0)) return;
    if (locked && Math.abs(height - locked) < HEIGHT_NOISE_PX) return;
    locked = height;
    root.style.setProperty("--l2-vh", `${height}px`);
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

// Abschnitte fahren herein, sobald sie ins Bild kommen - einmal. Ein
// Abschnitt, der beim Zurueckscrollen wieder verschwindet, wirkt nervoes.
function revealSections() {
  const nodes = Array.from(document.querySelectorAll(".l2-section, .l2-seq, .l2-hero"));
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

// Die Sequenzen.
function startSequences() {
  const sections = Array.from(document.querySelectorAll(".l2-seq"));
  if (!sections.length) return () => {};

  const seqs = sections.map((section) => {
    const captions = Array.from(section.querySelectorAll("[data-caption]"));
    const views = new Map();
    section.querySelectorAll("[data-viewkey]").forEach((node) => {
      views.set(node.dataset.viewkey, node);
    });
    const dots = Array.from(section.querySelectorAll(".l2-seq__dot"));
    const order = captions.map((node) => {
      const index = Number(node.dataset.caption);
      return Number.isFinite(index) ? index : 0;
    });
    return {
      section,
      captions,
      views,
      dots,
      count: Math.max(1, order.length),
      top: 0,
      span: 1,
      step: -1,
      active: false
    };
  });

  // Wo faengt jeder Abschnitt an und wie lang ist seine Strecke? Einmal im
  // Stillstand ausmessen, waehrend des Wischens nur noch rechnen.
  const measure = () => {
    const scrolled = window.scrollY || window.pageYOffset || 0;
    const viewport = window.innerHeight || 1;
    seqs.forEach((seq) => {
      const rect = seq.section.getBoundingClientRect();
      seq.top = Math.round(rect.top + scrolled);
      seq.span = Math.max(1, Math.round(rect.height - viewport));
    });
  };

  const applyStep = (seq, step) => {
    if (step === seq.step) return;
    seq.step = step;
    seq.section.dataset.step = String(step);

    seq.captions.forEach((node, index) => {
      node.classList.toggle("is-active", index === step);
    });
    seq.dots.forEach((node, index) => {
      node.classList.toggle("is-active", index === step);
    });

    const caption = seq.captions[step];
    const viewKey = caption ? String(caption.dataset.view || "") : "";
    const key = viewKey || String(seq.section.dataset.viewOrder || "");
    if (key && seq.views.has(key)) {
      seq.section.dataset.view = key;
      seq.views.forEach((node, name) => node.classList.toggle("is-active", name === key));
    }
  };

  const sample = () => {
    const scrolled = window.scrollY || window.pageYOffset || 0;
    seqs.forEach((seq) => {
      if (!seq.active) return;
      const progress = (scrolled - seq.top) / seq.span;
      applyStep(seq, stepFromProgress(progress, seq.count));
    });
  };

  // Gerechnet wird nur fuer Abschnitte, die gerade im Bild sind. Ohne das
  // rechnete jeder Wisch fuer alle Sequenzen der Seite mit, auch fuer die,
  // die zehn Bildschirme entfernt liegen.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const seq = seqs.find((item) => item.section === entry.target);
        if (!seq) return;
        seq.active = entry.isIntersecting;
      });
      sample();
    }, { rootMargin: "20% 0px 20% 0px" });
    seqs.forEach((seq) => observer.observe(seq.section));
  } else {
    seqs.forEach((seq) => { seq.active = true; });
  }

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
  // nicht mehr gibt.
  window.addEventListener("load", onResize, { once: true });

  return () => {
    measure();
    sample();
  };
}

// Welche Ansicht zu welchem Schritt gehoert, steht im Markup an der Caption.
// Hier wird sie einmal an den Knoten geschrieben, damit die Sequenz beim
// Wischen nichts mehr suchen muss.
function bindViewOrder() {
  document.querySelectorAll(".l2-seq").forEach((section) => {
    const views = Array.from(section.querySelectorAll("[data-viewkey]"))
      .map((node) => String(node.dataset.viewkey || ""));
    section.querySelectorAll("[data-caption]").forEach((node, index) => {
      if (!node.dataset.view && views[index]) node.dataset.view = views[index];
    });
  });
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
    document.querySelectorAll(".l2-seq").forEach((section) => {
      section.querySelectorAll("[data-caption]").forEach((node) => node.classList.add("is-active"));
      section.querySelectorAll("[data-viewkey]").forEach((node) => node.classList.add("is-active"));
    });
    return { remeasure: () => {} };
  }

  bindViewOrder();
  const remeasure = startSequences();
  return {
    remeasure: () => {
      viewport.measure();
      remeasure();
    }
  };
}
