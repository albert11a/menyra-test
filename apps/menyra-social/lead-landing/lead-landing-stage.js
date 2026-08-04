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

function updateCanvasColor(painted, viewportHeight, defaultThemeColor) {
  const middle = viewportHeight / 2;
  let color = "";
  painted.forEach((stage) => {
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
  // Dieselbe Farbe als Variable: Flaechen, die die Seite abdecken - etwa die
  // der Frage -, greifen sie darueber ab und stossen nicht in einem anderen
  // Ton an den Rand.
  root.style.setProperty("--ll-canvas", color || defaultThemeColor);
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

  // Der Frage-Bildschirm ist keine neue Ansicht: Er legt sich ueber das
  // Kapitel, und dahinter bleibt alles genau so stehen, wie der Schritt davor
  // es verlassen hat. Wuerde hier umgeschaltet, spraenge der gedrueckte Tab
  // von Menu auf Postimet und die Szene blendete unter der Deckflaeche um -
  // sichtbar beim Ein- und beim Ausblenden, und umsonst gerechnet.
  // Die Seitenfarbe gilt auch fuer die Frage: Sie schaltet nichts um, traegt
  // aber ihre eigene Farbe - sonst laege zwischen ihr und dem, was danach
  // kommt, eine sichtbare Kante.
  const canvas = String(captions[state]?.dataset?.canvas || "").trim();
  if (canvas) stage.setAttribute("data-canvas", canvas);
  else stage.removeAttribute("data-canvas");

  if (view === "ask") {
    stage.setAttribute("data-aside", "ask");
    return true;
  }
  stage.removeAttribute("data-aside");

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

  // Nur schreiben, wenn sich der Wert wirklich aendert. Sonst wird bei jedem
  // Frame der Stil des Balkens fuer nichts neu berechnet.
  const bar = stage.querySelector(".ll-stage__bar span");
  const width = `${Math.round(progress * 100)}%`;
  if (bar && bar.style.width !== width) bar.style.width = width;

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
  if (tallest <= 0) return;

  // Die Kopfzeile ist immer so hoch, dass zwei Textzeilen hineinpassen -
  // auch wenn der aktuelle Schritt nur eine braucht. Sonst waere sie mal
  // hoeher, mal niedriger, und die Szene darunter wuerde von Kapitel zu
  // Kapitel springen.
  tallest = Math.max(tallest, twoLineCaptionHeight(stage));

  // Innenabstand und Trennlinie kommen oben drauf. Sie zaehlen bei
  // border-box zur Hoehe, und die Schritte liegen absolut ueber der ganzen
  // Polsterflaeche - ohne diesen Zuschlag stiesse der laengste Text
  // unmittelbar an die Linie.
  const style = window.getComputedStyle(caption);
  const reserve = (parseFloat(style.paddingTop) || 0)
    + (parseFloat(style.paddingBottom) || 0)
    + (parseFloat(style.borderTopWidth) || 0)
    + (parseFloat(style.borderBottomWidth) || 0);

  caption.style.minHeight = `${Math.ceil(tallest + reserve)}px`;
}

// Hoehe einer Kopfzeile mit Ueberschrift und zwei Textzeilen - gerechnet aus
// den Schriftmassen, nicht aus dem gerade sichtbaren Text.
function twoLineCaptionHeight(stage) {
  const title = stage.querySelector(".ll-stage__step-title");
  const body = stage.querySelector(".ll-stage__step-body");
  if (!title || !body) return 0;

  const titleStyle = window.getComputedStyle(title);
  const bodyStyle = window.getComputedStyle(body);
  const bodyLine = parseFloat(bodyStyle.lineHeight) || 0;
  if (!bodyLine) return 0;

  return title.offsetHeight
    + (parseFloat(titleStyle.marginBottom) || 0)
    + (bodyLine * 2);
}

// Seitenverhaeltnis eines Handys (9:19.5) - der Rahmen soll eines sein, kein
// breites Feld.
const FRAME_RATIO = 9 / 19.5;

// Und er soll so gross sein wie das Handy auf den Aufnahmen weiter unten:
// gut die Haelfte der Kapitelhoehe, mit Luft darueber und darunter. Waere er
// so hoch wie der Platz hergibt, fuellte er den Bildschirm - genau das war zu
// gross.
const FRAME_SHARE = 0.58;

// Die Szene wird immer in dieser Breite gebaut und danach verkleinert. Fest,
// nicht vom Geraet abhaengig: So sieht das Handy im Rahmen ueberall gleich
// aus, nur eben mal groesser und mal kleiner.
const SCENE_WIDTH = 360;

// Gerechnet wird in Pixeln, nicht ueber aspect-ratio: In einem Flex-Kind
// loesen Safari und Chromium das unterschiedlich auf - genau daran ist der
// Beitrag im Feed frueher zu einem Streifen zusammengefallen.
function fitStageFrame(stage) {
  const pin = stage.querySelector(".ll-stage__pin");
  const frame = stage.querySelector(".ll-stage__frame");
  const scene = stage.querySelector(".ll-stage__scene");
  if (!pin || !frame || !scene) return;

  const pinStyle = window.getComputedStyle(pin);
  const platzHoch = pin.clientHeight
    - (parseFloat(pinStyle.paddingTop) || 0)
    - (parseFloat(pinStyle.paddingBottom) || 0);
  const platzBreit = pin.clientWidth
    - (parseFloat(pinStyle.paddingLeft) || 0)
    - (parseFloat(pinStyle.paddingRight) || 0);
  if (!(platzHoch > 0) || !(platzBreit > 0)) return;

  // Was der Text unter dem Rahmen braucht, ist keine Verhandlungssache - er
  // darf nie abgeschnitten werden.
  const caption = stage.querySelector(".ll-stage__caption");
  const bar = stage.querySelector(".ll-stage__bar");
  const darunter = [caption, bar].reduce((summe, node) => {
    if (!node) return summe;
    const style = window.getComputedStyle(node);
    return summe + node.offsetHeight
      + (parseFloat(style.marginTop) || 0)
      + (parseFloat(style.marginBottom) || 0);
  }, 0);

  const hoch = Math.round(Math.min(
    Math.max(0, platzHoch - darunter),
    platzHoch * FRAME_SHARE,
    platzBreit / FRAME_RATIO
  ));
  const breit = Math.round(hoch * FRAME_RATIO);
  if (!(hoch > 0) || !(breit > 0)) return;

  frame.style.setProperty("--ll-frame-w", `${breit}px`);
  frame.style.setProperty("--ll-frame-h", `${hoch}px`);
  frame.style.setProperty("--ll-frame-r", `${Math.round(breit * 0.12)}px`);
  scene.style.setProperty("--ll-scene-w", `${SCENE_WIDTH}px`);
  stage.dataset.sceneScale = String(breit / SCENE_WIDTH);
}

// Wie stark die Szene verkleinert ist. Alles, was in Szenen-Pixeln gerechnet
// wird, muss damit multipliziert werden, bevor es auf den Bildschirm kommt.
function sceneScale(stage) {
  const value = Number(stage.dataset.sceneScale);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

// Die Szene traegt zwei Bewegungen zugleich: die Verkleinerung und die Fahrt
// zu der Stelle, die gerade erklaert wird. Die Reihenfolge ist wichtig -
// translateY steht vorn und wirkt damit in Bildschirm-Pixeln, nicht in den
// verkleinerten der Szene.
function setScenePan(scene, stage, offsetInScene) {
  const skala = sceneScale(stage);
  scene.style.transform = `translateY(${Math.round(offsetInScene * skala)}px) scale(${skala})`;
}

// Abstand eines Bauteils von der Oberkante der Szene - ohne die laufenden
// Bewegungen. getBoundingClientRect gibt waehrend einer Ueberblendung die
// Zwischenposition zurueck (die Teile fahren dabei um ein paar Pixel), und
// die Szene selbst traegt eine Verschiebung. offsetTop kennt beides nicht:
// es misst im Layout, nicht auf dem Bildschirm.
function offsetTopWithin(node, ancestor) {
  let top = 0;
  let el = node;
  while (el && el !== ancestor) {
    top += el.offsetTop;
    el = el.offsetParent;
  }
  return top;
}

// Unterkante der Tab-Zeile in den Massen der Szene, plus etwas Luft. Das ist
// die Hoehe, die das Profil im Bild einnimmt, solange darunter noch nichts
// zu sehen ist.
function tabsBottom(tabsEl, scene) {
  return offsetTopWithin(tabsEl, scene) + tabsEl.offsetHeight + 10;
}

// Naeher als das an die Oberkante rueckt die Tab-Zeile nie - weder wenn der
// Block darunter mittig steht (siehe centeredTabsTop) noch wenn er dafuer zu
// hoch ist und oben anfaengt.
const TABS_TOP_MIN = 10;

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
  // Enger als TABS_TOP_MIN unter der Oberkante faengt die Tab-Zeile nie an.
  // Von dort bis zur Unterkante bleibt der Platz fuer die Karten - mehr gibt
  // auch der mittig gestellte Block nicht her, er verteilt den Rest nur auf
  // beide Seiten.
  const tabsTop = offsetTopWithin(tabsEl, scene);

  // Gerechnet wird in den Massen der Szene, nicht in denen des Bildschirms:
  // Die Szene ist verkleinert, der Rahmen ist es nicht.
  const sichtbar = viewport.clientHeight / sceneScale(stage);

  lists.forEach((list) => {
    const cards = Array.from(list.children);
    cards.forEach((card) => card.removeAttribute("hidden"));
    if (cards.length < 2) return;

    const listTop = offsetTopWithin(list, scene);
    const available = sichtbar - (listTop - tabsTop) - TABS_TOP_MIN;
    cards.forEach((card, index) => {
      if (index === 0) return;
      const bottom = offsetTopWithin(card, scene) - listTop + card.offsetHeight;
      if (bottom > available) card.setAttribute("hidden", "");
    });
  });
}

// Passt eine Szene ganz ins Bild, rueckt sie ein Stueck nach unten. Wie weit,
// richtet sich nach der App: dort liegen zwischen Kopfleiste und Inhalt
// 1.2rem (--smart-header-content-gap). Vorher sass die Szene mittig, dadurch
// klaffte oben eine deutlich groessere Luecke als in der echten Seite.
const SCENE_TOP_GAP = 19;

function sceneSlack(scene, sichtbar, effectiveHeight) {
  // Der eigene Innenabstand der Szene zaehlt zum Abstand nach oben dazu.
  const padTop = parseFloat(window.getComputedStyle(scene).paddingTop) || 0;
  const room = Math.round((sichtbar - effectiveHeight) / 2);
  return clamp(room, 0, Math.max(0, SCENE_TOP_GAP - padTop));
}

// Ist die Szene hoeher als der Rahmen, faehrt sie zu der Stelle, die gerade
// erklaert wird. Beim Zurueckrasten faehrt sie zurueck.
//
// Gerechnet wird durchgehend in den Massen der Szene - also vor der
// Verkleinerung, und mit offsetTop statt getBoundingClientRect. Rects gaeben
// waehrend einer Ueberblendung die Zwischenposition zurueck und truegen die
// Verkleinerung schon in sich; beides zusammen ergaebe krumme Werte. Auf den
// Bildschirm gerechnet wird erst ganz am Ende, in setScenePan.
function panSceneToFocus(stage) {
  const viewport = stage.querySelector(".ll-stage__viewport");
  const scene = stage.querySelector(".ll-stage__scene");
  if (!viewport || !scene) return;

  // Solange die Deckflaeche oben liegt, gibt es dahinter nichts zu fahren -
  // die Szene steht genau da, wo der Schritt davor sie gelassen hat.
  if (stage.hasAttribute("data-aside")) return;

  const view = String(stage.getAttribute("data-view") || "").trim();

  const tabsEl = scene.querySelector(".ll-surface__tabs");
  const sichtbar = viewport.clientHeight / sceneScale(stage);
  const tabsAnchored = view === "tabs" || view === "posts" || view.startsWith("menu");

  // Ab dem Tab-Schritt ist die Kartela ausgeblendet. Statt sie aus dem
  // Layout zu nehmen (das ruckelt, weil jeder Frame neu umbricht), faehrt
  // die Szene so weit, dass die Tabs oben stehen - die unsichtbare Kartela
  // liegt dann darueber ausserhalb des Bildes. Der Anker bleibt ueber alle
  // Tab-Schritte derselbe, dadurch steht das Bild ruhig.
  if (tabsEl && tabsAnchored) {
    // Die Tabs halten genau dort an, wo die Kartela begonnen hat - nicht am
    // oberen Rand. Dadurch sieht es aus, als waere die Kartela nach oben
    // weggefahren und der Inhalt an ihre Stelle gerueckt.
    const cardEl = scene.querySelector(".ll-surface__cardinner");
    const sameFrame = cardEl && cardEl.offsetParent && cardEl.offsetParent === tabsEl.offsetParent;
    let rest = TABS_TOP_MIN;
    if (sameFrame) {
      // Im Profil-Schritt sitzt die Szene mittig im Rahmen. Dieser Ausgleich
      // gehoert zur Ruheposition dazu - ohne ihn spraenge der Inhalt beim
      // Wechsel um genau diesen Betrag nach oben.
      const profileHeight = tabsBottom(tabsEl, scene);
      rest = cardEl.offsetTop + sceneSlack(scene, sichtbar, profileHeight);
    }
    setScenePan(scene, stage, -Math.max(0, offsetTopWithin(tabsEl, scene) - rest));
    return;
  }

  // Solange Profil oder Info erklaert werden, ist der Inhalt unter den Tabs
  // noch unsichtbar. Die Szene endet fuer die Fahrt daher an der Unterkante
  // der Tabs - sonst wuerde darunter eine Leerflaeche ins Bild rutschen.
  const effectiveHeight = tabsEl ? tabsBottom(tabsEl, scene) : scene.offsetHeight;

  const maxOffset = Math.max(0, effectiveHeight - sichtbar);
  if (maxOffset <= 0) {
    // Passt alles ins Bild, steht es oben - mit demselben Abstand wie in der
    // App zwischen Kopfleiste und Inhalt.
    setScenePan(scene, stage, sceneSlack(scene, sichtbar, effectiveHeight));
    return;
  }

  const active = Array.from(stage.querySelectorAll("[data-spot][data-spot-active]"));
  if (!active.length) {
    // Ohne Fokus: Anfang der Szene zeigen.
    setScenePan(scene, stage, 0);
    return;
  }

  // Ein Schritt kann mehrere Teile hervorheben (z. B. Logo und Name) - dann
  // zaehlt die Klammer um alle, nicht nur das erste.
  let top = Infinity;
  let bottom = -Infinity;
  active.forEach((node) => {
    const oben = offsetTopWithin(node, scene);
    top = Math.min(top, oben);
    bottom = Math.max(bottom, oben + node.offsetHeight);
  });

  const centered = top + ((bottom - top) / 2) - (sichtbar / 2);
  setScenePan(scene, stage, -clamp(Math.round(centered), 0, maxOffset));
}

export function startLeadLandingStages({ scroller = null } = {}) {
  const root = scroller || document.querySelector(".ll-shell");
  const stages = Array.from(document.querySelectorAll(".ll-stage"));
  // Die Seitenfarbe darf auch von einem Abschnitt kommen, nicht nur von einem
  // Kapitel - etwa vom weissen Block mit den Aufnahmen der App. Die Kapitel
  // muessen dabei immer in der Liste stehen: Ihr data-canvas setzt erst der
  // Schrittwechsel, zu diesem Zeitpunkt traegt noch keines eines.
  const painted = stages.concat(
    Array.from(document.querySelectorAll("[data-canvas]")).filter((node) => !node.classList.contains("ll-stage"))
  );
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
    updateCanvasColor(painted, viewportHeight, defaultThemeColor);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(run);
  };

  const fitAll = () => {
    stages.forEach((stage) => {
      fitStageCaption(stage);
      // Erst nach dem Text: Wie hoch der Rahmen wird, haengt daran, wie viel
      // der Text unter ihm braucht.
      fitStageFrame(stage);
      fitMenuLists(stage);
      panSceneToFocus(stage);
    });
  };

  // Beim Ein- und Ausblenden der Adressleiste meldet ein Handy-Browser eine
  // ganze Folge von Groessenaenderungen - mitten im Wischen. Jede einzelne
  // wuerde alle Kapitel neu vermessen und das Scrollen ins Stocken bringen.
  // Deshalb wird erst gerechnet, wenn die Folge vorbei ist.
  const RESIZE_SETTLE_MS = 160;
  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resizeTimer = 0;
      fitAll();
      onScroll();
    }, RESIZE_SETTLE_MS);
  };

  root.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  fitAll();
  run();
  // Nach dem Laden der Bilder koennen sich Hoehen noch aendern.
  window.addEventListener("load", onResize, { once: true });

  return () => {
    window.clearTimeout(resizeTimer);
    root.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
  };
}
