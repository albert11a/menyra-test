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

// Die Streifen hinter Statusleiste und Werkzeugleiste faerbt der Browser mit
// dem Hintergrund der Seite, nicht mit dem des Kapitels. Fuellt ein Kapitel
// mit eigener Farbe den Bildschirm, wird diese Farbe deshalb auf die Seite
// gelegt - sonst bleibt oben und unten ein grauer Streifen stehen, obwohl
// das Kapitel weiss ist.
function readDefaultThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  return meta ? String(meta.getAttribute("content") || "") : "";
}

function updateCanvasColor(stages, viewportHeight, defaultThemeColor) {
  const middle = viewportHeight / 2;
  let color = "";
  stages.forEach((stage) => {
    const declared = String(stage.getAttribute("data-canvas") || "").trim();
    if (!declared) return;
    const rect = stage.getBoundingClientRect();
    // Das Kapitel, das die Bildschirmmitte belegt, gibt die Farbe vor.
    if (rect.top <= middle && rect.bottom >= middle) color = declared;
  });

  const root = document.documentElement;
  if (root.dataset.canvasColor === color) return;
  root.dataset.canvasColor = color;
  // Leerer Wert heisst: zurueck auf den Wert aus dem Stylesheet.
  root.style.backgroundColor = color;
  if (document.body) document.body.style.backgroundColor = color;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", color || defaultThemeColor);
}

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

  // Ein Schritt darf die Seitenfarbe vorgeben (siehe updateCanvasColor).
  const canvas = String(captions[state]?.dataset?.canvas || "").trim();
  if (canvas) stage.setAttribute("data-canvas", canvas);
  else stage.removeAttribute("data-canvas");

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

  caption.style.minHeight = "";
  let tallest = 0;
  stage.querySelectorAll(".ll-stage__step").forEach((step) => {
    step.style.position = "static";
    tallest = Math.max(tallest, step.offsetHeight);
    step.style.position = "";
  });
  // min-height statt height: Die Schritte liegen absolut, die Flaeche traegt
  // also keine eigene Hoehe. So kommen Innenabstand und Trennlinie oben
  // drauf, statt den Text zu beschneiden.
  if (tallest > 0) caption.style.minHeight = `${Math.ceil(tallest)}px`;
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
// Die sichtbare Hoehe des Rahmens. clientHeight enthaelt die Innenabstaende,
// sichtbar ist aber nur die Flaeche dazwischen - sonst bleibt der letzte
// Abschnitt genau um diese Abstaende unter der Kante haengen.
function paneViewportHeight(frame) {
  const frameStyle = window.getComputedStyle(frame);
  const padTop = parseFloat(frameStyle.paddingTop) || 0;
  const padBottom = parseFloat(frameStyle.paddingBottom) || 0;
  return Math.max(1, frame.clientHeight - padTop - padBottom);
}

// Jeder erklaerte Abschnitt soll oben stehen - dort, wo beim ersten Schritt
// die Galerie steht. Der letzte Abschnitt kaeme dort aber nie hin, weil die
// Fahrt am Ende des Inhalts endet. Deshalb bekommt der Bereich unten so viel
// Luft, dass auch er nach oben fahren kann.
function fitPaneTravel(stage) {
  const pane = stage.querySelector("[data-pan]");
  const frame = pane ? pane.parentElement : null;
  if (!pane || !frame) return;

  pane.style.paddingBottom = "0px";
  const visible = paneViewportHeight(frame);
  const natural = pane.offsetHeight;
  const paneTop = pane.getBoundingClientRect().top;

  let lastTop = 0;
  pane.querySelectorAll("[data-spot]").forEach((node) => {
    lastTop = Math.max(lastTop, node.getBoundingClientRect().top - paneTop);
  });

  pane.style.paddingBottom = `${Math.max(0, Math.round(lastTop + visible - natural))}px`;
}

// Gibt zurueck, wie weit der Bereich gefahren ist.
function readPaneOffset(pane) {
  const match = /translateY\(\s*(-?[\d.]+)px\s*\)/.exec(pane.style.transform || "");
  return match ? Math.abs(Number(match[1])) : 0;
}

function panPane(stage, pane) {
  const frame = pane.parentElement;
  if (!frame) return 0;

  const visible = paneViewportHeight(frame);
  const maxOffset = Math.max(0, pane.offsetHeight - visible);
  const active = Array.from(stage.querySelectorAll("[data-spot][data-spot-active]"))
    .filter((node) => pane.contains(node));

  if (maxOffset <= 0) {
    pane.style.transform = "translateY(0px)";
    return 0;
  }

  if (!active.length) {
    // Der erklaerte Teil liegt ausserhalb des fahrenden Bereichs - das ist
    // die Fusszeile. Dann bleibt der Inhalt stehen, wo er gerade ist; nur
    // die Fusszeile tritt hervor. Nichts springt an den Anfang zurueck.
    // Nur ohne jeden Fokus - in der Gesamtansicht - faehrt er zurueck.
    if (stage.hasAttribute("data-focus")) return readPaneOffset(pane);
    pane.style.transform = "translateY(0px)";
    return 0;
  }

  // Der Bereich ist bereits verschoben; die Differenz zu seiner Oberkante
  // ergibt deshalb die unverschobene Position innerhalb des Bereichs.
  const paneTop = pane.getBoundingClientRect().top;
  let top = Infinity;
  active.forEach((node) => {
    top = Math.min(top, node.getBoundingClientRect().top - paneTop);
  });

  // Oben buendig statt mittig: So faengt der erklaerte Abschnitt immer an
  // derselben Kante an, und darueber wird nie ein anderer angeschnitten.
  const offset = clamp(Math.round(top), 0, maxOffset);
  pane.style.transform = `translateY(${-offset}px)`;
  return offset;
}

// Wird die Fusszeile erklaert, steht ueber ihr die leere Flaeche des
// Kommentarbereichs. Statt dort stehen zu bleiben, rueckt sie hoch und
// schliesst direkt an den Inhalt an - erklaert wird schliesslich sie.
const FOOTER_LIFT_GAP = 24;

// Gerechnet wird ohne die laufenden Bewegungen: getBoundingClientRect gibt
// waehrend einer Animation die Zwischenposition zurueck. Die Abstaende
// innerhalb des Bereichs sind davon unabhaengig, weil Bereich und Inhalt
// gleich verschoben sind - und wie weit der Bereich gefahren ist, sagt
// panPane.
function liftFooter(stage, pane, paneOffset) {
  const foot = stage.querySelector(".ll-md__foot");
  const clip = pane.parentElement;
  if (!foot || !clip) return;

  if (String(stage.getAttribute("data-focus") || "") !== "dorder") {
    foot.style.transform = "";
    return;
  }

  const paneTop = pane.getBoundingClientRect().top;
  let contentEnd = 0;
  pane.querySelectorAll("[data-spot]").forEach((node) => {
    contentEnd = Math.max(contentEnd, node.getBoundingClientRect().bottom - paneTop);
  });

  // Unterkante des Inhalts im Ausschnitt - tiefer als dessen Rand nicht.
  const visibleEnd = Math.min(contentEnd - paneOffset, clip.clientHeight);
  const lift = Math.round(clip.clientHeight - visibleEnd - FOOTER_LIFT_GAP);
  foot.style.transform = lift > 0 ? `translateY(${-lift}px)` : "";
}

function panSceneToFocus(stage) {
  const viewport = stage.querySelector(".ll-stage__viewport");
  const scene = stage.querySelector(".ll-stage__scene");
  if (!viewport || !scene) return;

  const view = String(stage.getAttribute("data-view") || "").trim();

  // Liegt das Modal ueber der Szene, faehrt nur sein Koerper - Kopfzeile und
  // Fusszeile stehen fest, so wie in der App. Die Szene darunter bleibt, wo
  // sie war, damit sie beim Schliessen unveraendert wieder auftaucht.
  const pane = view.startsWith("dish") ? stage.querySelector("[data-pan]") : null;
  if (pane) {
    // Erst hier steht die endgueltige Hoehe fest: Sobald das Modal offen ist,
    // faellt der untere Innenabstand des Kapitels weg, der Rahmen ist also
    // hoeher als waehrend der Menue-Schritte.
    fitPaneTravel(stage);
    liftFooter(stage, pane, panPane(stage, pane));
    return;
  }
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
  const defaultThemeColor = readDefaultThemeColor();

  const run = () => {
    ticking = false;
    const viewportHeight = root.clientHeight || window.innerHeight || 1;
    stages.forEach((stage) => {
      const rect = stage.getBoundingClientRect();
      // Nur Kapitel in Sichtweite rechnen.
      if (rect.bottom < -viewportHeight || rect.top > viewportHeight * 2) return;
      updateStage(stage, viewportHeight);
    });
    updateCanvasColor(stages, viewportHeight, defaultThemeColor);
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
      // fitPaneTravel laeuft in panSceneToFocus - dort steht die Hoehe fest.
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
