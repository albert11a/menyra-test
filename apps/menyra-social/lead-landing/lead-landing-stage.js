// Scroll-gesteuerte Kapitel ("Stage") der Lead-Landing.
//
// Eine Stage ist so hoch wie (Schritte + 1) Bildschirme. Ihre Szene bleibt
// per position: sticky im Bild stehen, waehrend diese Strecke durchlaeuft.
// Aus der Scrollposition wird der aktive Schritt berechnet - deshalb geht
// es beim Hochscrollen automatisch rueckwaerts, ohne eigene Logik.
//
// Es wird nichts am Scrollen selbst manipuliert: kein preventDefault, kein
// erzwungenes Springen. Der Browser scrollt normal, wir lesen nur ab.

const STATE_ATTR = "data-step";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readSteps(stage) {
  const parsed = Math.round(Number(stage.dataset.steps || 0));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function applyStageState(stage, state) {
  const previous = Number(stage.getAttribute(STATE_ATTR) || -1);
  if (previous === state) return;
  stage.setAttribute(STATE_ATTR, String(state));

  const captions = Array.from(stage.querySelectorAll(".ll-stage__step"));
  captions.forEach((node, index) => {
    node.classList.toggle("is-active", index === state);
  });

  // Ein Schritt kann die Szene umschalten (Profil -> Info -> Postimet ->
  // Menu). Das Umschalten selbst animiert CSS.
  const view = String(captions[state]?.dataset?.view || "").trim();
  if (view) stage.setAttribute("data-view", view);
  else stage.removeAttribute("data-view");

  const focusKey = String(captions[state]?.dataset?.focus || "").trim();
  const spots = Array.from(stage.querySelectorAll("[data-spot]"));

  if (!focusKey) {
    stage.removeAttribute("data-focus");
    spots.forEach((spot) => spot.removeAttribute("data-spot-active"));
    return;
  }

  stage.setAttribute("data-focus", focusKey);
  spots.forEach((spot) => {
    // Ein Schritt darf mehrere Teile hervorheben: data-spot="avatar name".
    const keys = String(spot.dataset.spot || "").split(/\s+/).filter(Boolean);
    if (keys.includes(focusKey)) spot.setAttribute("data-spot-active", "");
    else spot.removeAttribute("data-spot-active");
  });
}

function updateStage(stage, viewportHeight) {
  const steps = readSteps(stage);
  const rect = stage.getBoundingClientRect();
  const travel = Math.max(1, rect.height - viewportHeight);
  const progress = clamp(-rect.top / travel, 0, 1);
  // Zustaende: 0 = Gesamtansicht, 1..steps = einzelne Erklaerungen.
  const state = clamp(Math.floor(progress * (steps + 1)), 0, steps);
  applyStageState(stage, state);

  const bar = stage.querySelector(".ll-stage__bar span");
  if (bar) bar.style.width = `${Math.round(progress * 100)}%`;

  panSceneToFocus(stage);
}

// Die Schritt-Texte liegen absolut uebereinander, tragen also nichts zur
// Hoehe bei. Ohne reservierten Platz wuerde der laengste Text in die Szene
// ragen. Deshalb wird der hoechste Schritt gemessen und die Textflaeche
// darauf festgesetzt - so bleibt die Szene beim Umschalten auch ruhig
// stehen, statt zwischen den Schritten zu springen.
function fitStageCaption(stage) {
  const caption = stage.querySelector(".ll-stage__caption");
  if (!caption) return;

  caption.style.height = "";
  let tallest = 0;
  stage.querySelectorAll(".ll-stage__step").forEach((step) => {
    step.style.position = "static";
    tallest = Math.max(tallest, step.offsetHeight);
    step.style.position = "";
  });
  if (tallest > 0) caption.style.height = `${Math.ceil(tallest)}px`;
}

// Die Szene wird nie verkleinert - sie soll in echter Groesse zu sehen sein.
// Ist sie hoeher als der sichtbare Bereich, faehrt sie stattdessen zu der
// Stelle, die gerade erklaert wird. Beim Zurueckrasten faehrt sie zurueck.
function panSceneToFocus(stage) {
  const viewport = stage.querySelector(".ll-stage__viewport");
  const scene = stage.querySelector(".ll-stage__scene");
  if (!viewport || !scene) return;

  const maxOffset = Math.max(0, scene.offsetHeight - viewport.clientHeight);
  if (maxOffset <= 0) {
    // Passt die Szene ganz ins Bild, sitzt sie mittig statt oben zu kleben.
    const slack = Math.round((viewport.clientHeight - scene.offsetHeight) / 2);
    scene.style.transform = `translateY(${Math.max(0, slack)}px)`;
    return;
  }

  const active = Array.from(stage.querySelectorAll("[data-spot][data-spot-active]"));
  if (!active.length) {
    // Ohne Fokus: Anfang der Szene zeigen.
    scene.style.transform = "translateY(0px)";
    return;
  }

  // Szene und Ziele sind gleich verschoben, die Differenz ergibt also die
  // unverschobene Position innerhalb der Szene. Ein Schritt kann mehrere
  // Teile hervorheben (z. B. Logo und Name) - dann zaehlt die Klammer um
  // alle, nicht nur das erste.
  const sceneRect = scene.getBoundingClientRect();
  let top = Infinity;
  let bottom = -Infinity;
  active.forEach((node) => {
    const rect = node.getBoundingClientRect();
    top = Math.min(top, rect.top - sceneRect.top);
    bottom = Math.max(bottom, rect.bottom - sceneRect.top);
  });

  const centered = top + ((bottom - top) / 2) - (viewport.clientHeight / 2);
  const offset = clamp(Math.round(centered), 0, maxOffset);

  scene.style.transform = `translateY(${-offset}px)`;
}

export function startLeadLandingStages({ scroller = null } = {}) {
  const root = scroller || document.querySelector(".ll-shell");
  const stages = Array.from(document.querySelectorAll(".ll-stage"));
  if (!root || !stages.length) return () => {};

  let ticking = false;

  const run = () => {
    ticking = false;
    const viewportHeight = root.clientHeight || window.innerHeight || 1;
    stages.forEach((stage) => {
      const rect = stage.getBoundingClientRect();
      // Nur Kapitel in Sichtweite rechnen.
      if (rect.bottom < -viewportHeight || rect.top > viewportHeight * 2) return;
      updateStage(stage, viewportHeight);
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(run);
  };

  const fitAll = () => {
    stages.forEach((stage) => {
      fitStageCaption(stage);
      panSceneToFocus(stage);
    });
  };

  const onResize = () => {
    fitAll();
    onScroll();
  };

  // Beim Ansichtswechsel klappt die Kartela zusammen und die Szene wird
  // niedriger. Waehrend dieser Bewegung waere eine berechnete Fahrt veraltet,
  // deshalb wird nach dem Ende des Uebergangs neu ausgerichtet.
  const onTransitionEnd = (event) => {
    if (event.propertyName !== "grid-template-rows") return;
    const stage = event.target.closest?.(".ll-stage");
    if (stage) panSceneToFocus(stage);
  };

  root.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });
  stages.forEach((stage) => stage.addEventListener("transitionend", onTransitionEnd));

  fitAll();
  run();
  // Nach dem Laden der Bilder koennen sich Hoehen noch aendern.
  window.addEventListener("load", onResize, { once: true });

  return () => {
    root.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    stages.forEach((stage) => stage.removeEventListener("transitionend", onTransitionEnd));
  };
}
