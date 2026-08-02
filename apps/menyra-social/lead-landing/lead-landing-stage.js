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
}

// Sicherheitsnetz gegen Beschnitt: Der Pin hat overflow: hidden, damit die
// Szene bildschirmhoch bleibt. Passt sie auf einem sehr niedrigen Geraet
// trotzdem nicht, wird sie so weit verkleinert, bis sie passt - statt oben
// und unten abgeschnitten zu werden. Das negative margin nimmt den durch
// die Skalierung frei gewordenen Layoutplatz wieder heraus.
function fitStageScene(stage) {
  const pin = stage.querySelector(".ll-stage__pin");
  const scene = stage.querySelector(".ll-stage__scene");
  if (!pin || !scene) return;

  scene.style.transform = "";
  scene.style.marginBottom = "";

  const sceneHeight = scene.offsetHeight;
  if (sceneHeight <= 0) return;
  if (pin.scrollHeight - pin.clientHeight <= 1) return;

  scene.style.transformOrigin = "center top";

  // Eine Runde reicht nicht immer: durch das Verkleinern aendern sich
  // Umbrueche und damit die Resthoehe. Deshalb bis zu drei Mal nachziehen.
  let scale = 1;
  for (let pass = 0; pass < 3; pass += 1) {
    const overflow = pin.scrollHeight - pin.clientHeight;
    if (overflow <= 1) break;
    const next = Math.max(0.72, scale - (overflow + 2) / sceneHeight);
    if (next >= scale) break;
    scale = next;
    scene.style.transform = `scale(${scale})`;
    scene.style.marginBottom = `${-Math.ceil((1 - scale) * sceneHeight)}px`;
  }
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

  const onResize = () => {
    stages.forEach(fitStageScene);
    onScroll();
  };

  root.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  stages.forEach(fitStageScene);
  run();
  // Nach dem Laden der Bilder koennen sich Hoehen noch aendern.
  window.addEventListener("load", onResize, { once: true });

  return () => {
    root.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
  };
}
