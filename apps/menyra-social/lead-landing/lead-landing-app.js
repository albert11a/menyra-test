// Bootstrap der Lead-Landing.
//
// Eigenstaendige Seite: laedt die echten Profildaten read-only, rendert die
// Verkaufs-Sections und haengt die Verhalten an: Begruessungs-Wechsel,
// Fortschrittspunkte, scrollgesteuerte Kapitel und Karte. Kein Zugriff auf
// die Social-App.

import { loadLeadLandingData } from "./lead-landing-data.js";
import { startLeadLandingStages } from "./lead-landing-stage.js";
import {
  ASK_FLOW,
  LEAD_LANDING_GREETINGS_COUNT,
  renderAsk,
  renderClosing,
  renderHero,
  renderPricing,
  renderShots,
  renderSurface
} from "./lead-landing-sections.js";

const GREETING_INTERVAL_MS = 2600;

// Ab wieviel Deckung eine Aufnahme hereinfaehrt. Ein gutes Drittel: Frueher
// liefe die Bewegung ab, bevor man sie sieht, spaeter kaeme sie zu spaet.
const SHOT_REVEAL_RATIO = 0.35;

function readRouteKey() {
  const path = String(window.location.pathname || "");
  const match = path.match(/\/(?:oferta|lp|pitch)\/([^/?#]+)/i);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
  const params = new URLSearchParams(window.location.search);
  return String(
    params.get("r")
    || params.get("rid")
    || params.get("restaurantId")
    || params.get("slug")
    || ""
  ).trim();
}

function setBoot(message, isError = false) {
  const root = document.getElementById("llRoot");
  if (!root) return;
  root.innerHTML = `
    <div class="ll-boot">
      <p class="ll-boot__text${isError ? " ll-boot__text--error" : ""}">${message}</p>
    </div>
  `;
}

function startGreetingCycle() {
  const items = Array.from(document.querySelectorAll("[data-greet]"));
  if (items.length < 2) return;

  let index = 0;
  let timer = 0;
  const tick = () => {
    const previous = index;
    index = (index + 1) % LEAD_LANDING_GREETINGS_COUNT;
    items.forEach((node, position) => {
      node.classList.toggle("is-active", position === index);
      node.classList.toggle("is-prev", position === previous);
    });
  };

  const start = () => {
    if (!timer) timer = window.setInterval(tick, GREETING_INTERVAL_MS);
  };
  const stop = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = 0;
  };

  // Der Wechsel laeuft nur, solange die Begruessung zu sehen ist. Sonst
  // liefe er die ganze Sitzung weiter und wuerde alle 2,6 Sekunden mitten im
  // Wischen die Stile neu berechnen lassen - fuer etwas, das laengst
  // ausserhalb des Bildes liegt.
  const hero = document.querySelector(".ll-hero");
  if (!hero || !("IntersectionObserver" in window)) {
    start();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
  }, { root: document.querySelector(".ll-shell") });
  observer.observe(hero);
}

// Fortschrittspunkte rechts: zeigen, an welchem Abschnitt man gerade ist.
// Rein passiv - das Einrasten macht CSS-Scroll-Snap, hier wird nichts
// gesteuert, damit das Scrollen nativ bleibt.
function startProgressDots() {
  const shell = document.querySelector(".ll-shell");
  const sections = Array.from(document.querySelectorAll(".ll-section, .ll-stage"));
  if (!shell || sections.length < 2) return;

  const rail = document.createElement("div");
  rail.className = "ll-progress";
  rail.setAttribute("aria-hidden", "true");
  rail.innerHTML = sections
    .map((_, index) => `<span class="ll-progress__dot${index === 0 ? " is-active" : ""}"></span>`)
    .join("");
  document.body.appendChild(rail);

  const dots = Array.from(rail.children);
  const setActive = (index) => {
    dots.forEach((dot, position) => dot.classList.toggle("is-active", position === index));
  };

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = sections.indexOf(entry.target);
      if (index >= 0) setActive(index);
    });
  }, { root: shell, threshold: 0.55 });

  sections.forEach((section) => observer.observe(section));
}

// Die Aufnahmen fahren herein, sobald sie ins Bild kommen - jedes Mal, auch
// beim Zurueckwischen.
function startShotReveal() {
  const shots = Array.from(document.querySelectorAll("[data-shot]"));
  const shell = document.querySelector(".ll-shell");
  if (!shots.length || !shell) return;

  if (!("IntersectionObserver" in window)) {
    shots.forEach((shot) => shot.classList.add("is-in"));
    return;
  }

  // Beobachtet wird das Bild, nicht die ganze Aufnahme: Die nimmt einen
  // ganzen Bildschirm ein und ragt mit ihrem leeren Rand lange vor dem Bild
  // ins Sichtfeld - die Bewegung liefe dann ab, waehrend das Bild noch gar
  // nicht zu sehen ist.
  //
  // Beobachtet wird auch weiter, nachdem eine Aufnahme einmal da war: Ist sie
  // ganz aus dem Bild, faellt sie in ihre Startlage zurueck. Der naechste
  // Wisch faehrt sie deshalb wieder herein - egal, aus welcher Richtung er
  // kommt. Zurueckgesetzt wird erst bei Deckung null, also ausserhalb des
  // Bildes; zu sehen ist der Ruecksprung nie.
  //
  // Zwei Schwellen, nicht eine: Dazwischen bleibt es, wie es ist. Mit nur
  // einer Schwelle flackerte es genau an ihr.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const shot = entry.target.closest("[data-shot]") || entry.target;
      if (entry.intersectionRatio >= SHOT_REVEAL_RATIO) shot.classList.add("is-in");
      else if (!entry.isIntersecting) shot.classList.remove("is-in");
    });
  }, { root: shell, threshold: [0, SHOT_REVEAL_RATIO] });

  shots.forEach((shot) => observer.observe(shot.querySelector(".ll-shot__media") || shot));

  // Der Beobachter meldet sich zeitversetzt. Nach einem schnellen Wisch kann
  // seine letzte Meldung von einer Zwischenstellung stammen - dann bleibt eine
  // Aufnahme zurueckgesetzt, obwohl sie im Bild steht, und man sieht eine
  // leere Seite. Deshalb wird nach jedem Scrollende selbst nachgemessen und
  // nachgeholt, was nicht geliefert wurde.
  //
  // Gemessen wird nur im Ruhezustand, nicht bei jedem Bild der Bewegung: Das
  // ist einmal pro Wisch statt sechzigmal pro Sekunde.
  let settleTimer = 0;
  const settle = () => {
    const hoehe = shell.clientHeight;
    if (!(hoehe > 0)) return;
    shots.forEach((shot) => {
      const media = shot.querySelector(".ll-shot__media") || shot;
      const rect = media.getBoundingClientRect();
      if (!(rect.height > 0)) return;
      const sichtbar = Math.max(0, Math.min(rect.bottom, hoehe) - Math.max(rect.top, 0));
      const anteil = sichtbar / rect.height;
      if (anteil >= SHOT_REVEAL_RATIO) shot.classList.add("is-in");
      else if (anteil <= 0) shot.classList.remove("is-in");
    });
  };

  const onSettle = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settle, 140);
  };

  shell.addEventListener("scroll", onSettle, { passive: true });
  window.addEventListener("resize", onSettle, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) onSettle();
  });
}

// Der Fragebogen: Ein Bildschirm, der beim Antworten seinen Inhalt tauscht.
// Welche Frage auf welche folgt, steht in ASK_FLOW - hier wird nur
// umgeschaltet. Dadurch gibt es keinen Ablauf, der an zwei Stellen gepflegt
// werden muesste.
function startAskFlow() {
  const section = document.querySelector("[data-ask]");
  if (!section) return;

  const views = new Map();
  section.querySelectorAll(".ll-ask3__view").forEach((node) => {
    views.set(node.dataset.view, node);
  });
  if (!views.size) return;

  const show = (key) => {
    const node = views.get(key);
    if (!node) return;
    views.forEach((view, name) => {
      view.hidden = name !== key;
    });
    section.dataset.askView = key;
    // Nach dem Umschalten liegt die Antwort woanders. Wer mit der Tastatur
    // unterwegs ist, soll dort weitermachen, wo es weitergeht - nicht am
    // Anfang der Seite.
    const first = node.querySelector(".ll-ask3__answer, .ll-ask3__btn");
    if (first && document.activeElement && section.contains(document.activeElement)) {
      first.focus({ preventScroll: true });
    }
  };

  section.addEventListener("click", (event) => {
    const button = event.target.closest(".ll-ask3__answer");
    if (!button || !section.contains(button)) return;
    const from = section.dataset.askView || "q1";
    const next = String(button.dataset.next || "");
    if (!views.has(next)) return;
    recordAnswer(from, String(button.dataset.answer || ""));
    show(next);
  });

  show("q1");
}

// Bis die Aufzeichnung steht, bleiben die Antworten im Fenster liegen. So ist
// der Ablauf schon vollstaendig und das Messen kann danach angeschlossen
// werden, ohne ihn noch einmal anzufassen.
function recordAnswer(question, answer) {
  if (!ASK_FLOW[question]) return;
  const store = window.__llAnswers || (window.__llAnswers = []);
  store.push({ question, answer, at: Date.now() });
}

function renderPage(data) {
  const { profile, posts, menuItems, focusItems, sales } = data;
  return `
    <div class="ll-shell">
      ${renderHero(profile)}
      ${renderSurface(profile, posts, menuItems, focusItems)}
      ${renderShots()}
      ${renderPricing(sales)}
      ${renderClosing()}
      ${renderAsk(profile, sales)}
    </div>
  `;
}

async function boot() {
  const routeKey = readRouteKey();
  if (!routeKey) {
    setBoot("Linku është i paplotë.", true);
    return;
  }

  setBoot("Po ngarkohet...");

  let data = null;
  try {
    data = await loadLeadLandingData(routeKey);
  } catch (err) {
    console.error(err);
    setBoot("Faqja nuk mund të ngarkohej.", true);
    return;
  }

  if (!data?.ok) {
    setBoot("Ky profil nuk u gjet.", true);
    return;
  }

  const root = document.getElementById("llRoot");
  if (!root) return;
  root.innerHTML = renderPage(data);

  document.title = `${data.profile.name} - Mnyra`;

  startGreetingCycle();
  startProgressDots();
  startShotReveal();
  startAskFlow();
  startLeadLandingStages({ scroller: document.querySelector(".ll-shell") });
}

boot();
