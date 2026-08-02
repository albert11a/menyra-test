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
  if (previous === state) return false;
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
    return true;
  }

  stage.setAttribute("data-focus", focusKey);
  spots.forEach((spot) => {
    // Ein Schritt darf mehrere Teile hervorheben: data-spot="avatar name".
    const keys = String(spot.dataset.spot || "").split(/\s+/).filter(Boolean);
    if (keys.includes(focusKey)) spot.setAttribute("data-spot-active", "");
    else spot.removeAttribute("data-spot-active");
  });
  return true;
}

function updateStage(stage, viewportHeight) {
  const steps = readSteps(stage);
  const rect = stage.getBoundingClientRect();
  const travel = Math.max(1, rect.height - viewportHeight);
  const progress = clamp(-rect.top / travel, 0, 1);
  // Zustaende: 0 = Gesamtansicht, 1..steps = einzelne Erklaerungen.
  const state = clamp(Math.floor(progress * (steps + 1)), 0, steps);
  const changed = applyStageState(stage, state);

  const bar = stage.querySelector(".ll-stage__bar span");
  if (bar) bar.style.width = `${Math.round(progress * 100)}%`;

  // Nur bei echtem Schrittwechsel neu ausrichten. Jeder Frame wuerde sonst
  // ein Layout erzwingen (getBoundingClientRect direkt vor einem Style-
  // Schreibzugriff) und das Scrollen ins Stocken bringen.
  if (changed) panSceneToFocus(stage);
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

// Die Speisenkarten der echten App laufen ueber die volle Breite und sind
// dadurch hoch. Verkleinert werden duerfen sie nicht (sie sollen 1:1 wie im
// echten Menue aussehen), abgeschnitten werden duerfen sie auch nicht.
// Deshalb wird gemessen, wie viele unter den Tabs vollstaendig Platz haben -
// der Rest wird gar nicht erst gezeigt. Auf einem grossen Bildschirm sind
// das zwei Karten, auf einem kleinen eine.
function fitMenuLists(stage) {
  const viewport = stage.querySelector(".ll-stage__viewport");
  const scene = stage.querySelector(".ll-stage__scene");
  const lists = Array.from(stage.querySelectorAll(".ll-food-list"));
  if (!viewport || !scene || !lists.length) return;

  const tabsEl = scene.querySelector(".ll-surface__tabs");
  if (!tabsEl) return;
  // panSceneToFocus setzt die Tabs bei Menue-Schritten auf 10px unter die
  // Oberkante. Von dort bis zur Unterkante bleibt der Platz fuer die Karten.
  const tabsTop = tabsEl.getBoundingClientRect().top;

  lists.forEach((list) => {
    const cards = Array.from(list.children);
    cards.forEach((card) => card.removeAttribute("hidden"));
    if (cards.length < 2) return;

    const offset = list.getBoundingClientRect().top - tabsTop + 10;
    const available = viewport.clientHeight - offset;
    cards.forEach((card, index) => {
      if (index === 0) return;
      const bottom = card.getBoundingClientRect().bottom - list.getBoundingClientRect().top;
      if (bottom > available) card.setAttribute("hidden", "");
    });
  });
}

// Die Szene wird nie verkleinert - sie soll in echter Groesse zu sehen sein.
// Ist sie hoeher als der sichtbare Bereich, faehrt sie stattdessen zu der
// Stelle, die gerade erklaert wird. Beim Zurueckrasten faehrt sie zurueck.
// Vollbild-Kapitel (das Speisen-Modal) fahren nicht die ganze Szene, sondern
// nur den Bereich, der in der App der scrollende Koerper ist. Kopf und
// Fusszeile bleiben dadurch stehen - genau wie im echten Modal.
function panPane(stage, pane) {
  const frame = pane.parentElement;
  if (!frame) return;

  // clientHeight enthaelt die Innenabstaende des Rahmens. Sichtbar ist aber
  // nur die Flaeche dazwischen - sonst bleibt der letzte Abschnitt genau um
  // diese Abstaende unter der Kante haengen.
  const frameStyle = window.getComputedStyle(frame);
  const padTop = parseFloat(frameStyle.paddingTop) || 0;
  const padBottom = parseFloat(frameStyle.paddingBottom) || 0;
  const visible = Math.max(1, frame.clientHeight - padTop - padBottom);

  const maxOffset = Math.max(0, pane.offsetHeight - visible);
  const active = Array.from(stage.querySelectorAll("[data-spot][data-spot-active]"))
    .filter((node) => pane.contains(node));

  if (!active.length || maxOffset <= 0) {
    pane.style.transform = "translateY(0px)";
    return;
  }

  // Der Bereich ist bereits verschoben; die Differenz zu seiner Oberkante
  // ergibt deshalb die unverschobene Position innerhalb des Bereichs.
  const paneTop = pane.getBoundingClientRect().top;
  let top = Infinity;
  let bottom = -Infinity;
  active.forEach((node) => {
    const rect = node.getBoundingClientRect();
    top = Math.min(top, rect.top - paneTop);
    bottom = Math.max(bottom, rect.bottom - paneTop);
  });

  const centered = top + ((bottom - top) / 2) - (visible / 2);
  const offset = clamp(Math.round(centered), 0, maxOffset);
  pane.style.transform = `translateY(${-offset}px)`;
}

function panSceneToFocus(stage) {
  const viewport = stage.querySelector(".ll-stage__viewport");
  const scene = stage.querySelector(".ll-stage__scene");
  if (!viewport || !scene) return;

  const pane = stage.querySelector("[data-pan]");
  if (pane) {
    scene.style.transform = "translateY(0px)";
    panPane(stage, pane);
    return;
  }

  const view = String(stage.getAttribute("data-view") || "").trim();
  const tabsEl = scene.querySelector(".ll-surface__tabs");
  const sceneTop = scene.getBoundingClientRect().top;
  const tabsAnchored = view === "tabs" || view === "posts" || view.startsWith("menu");

  // Ab dem Tab-Schritt ist die Kartela ausgeblendet. Statt sie aus dem
  // Layout zu nehmen (das ruckelt, weil jeder Frame neu umbricht), faehrt
  // die Szene so weit, dass die Tabs oben stehen - die unsichtbare Kartela
  // liegt dann darueber ausserhalb des Bildes. Der Anker bleibt ueber alle
  // Tab-Schritte derselbe, dadurch steht das Bild ruhig.
  if (tabsEl && tabsAnchored) {
    const tabsTop = Math.round(tabsEl.getBoundingClientRect().top - sceneTop);
    scene.style.transform = `translateY(${-Math.max(0, tabsTop - 10)}px)`;
    return;
  }

  // Solange Profil oder Info erklaert werden, ist der Inhalt unter den Tabs
  // noch unsichtbar. Die Szene endet fuer die Fahrt daher an der Unterkante
  // der Tabs - sonst wuerde darunter eine Leerflaeche ins Bild rutschen.
  const effectiveHeight = tabsEl
    ? Math.round(tabsEl.getBoundingClientRect().bottom - sceneTop) + 10
    : scene.offsetHeight;

  const maxOffset = Math.max(0, effectiveHeight - viewport.clientHeight);
  if (maxOffset <= 0) {
    // Passt alles ins Bild, sitzt es mittig statt oben zu kleben.
    const slack = Math.round((viewport.clientHeight - effectiveHeight) / 2);
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
  let top = Infinity;
  let bottom = -Infinity;
  active.forEach((node) => {
    const rect = node.getBoundingClientRect();
    top = Math.min(top, rect.top - sceneTop);
    bottom = Math.max(bottom, rect.bottom - sceneTop);
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
      fitMenuLists(stage);
      panSceneToFocus(stage);
    });
  };

  const onResize = () => {
    fitAll();
    onScroll();
  };

  root.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  fitAll();
  run();
  // Nach dem Laden der Bilder koennen sich Hoehen noch aendern.
  window.addEventListener("load", onResize, { once: true });

  return () => {
    root.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
  };
}
