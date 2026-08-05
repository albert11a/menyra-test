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

// Gemessen wird dicht unter der Oberkante, nicht in der Bildschirmmitte: Der
// Streifen liegt direkt ueber dieser Kante, also muss er die Farbe dessen
// tragen, was dort anfaengt. Nach der Mitte gerichtet blieb er die halbe
// Strecke lang in der alten Farbe, waehrend oben schon der naechste
// Abschnitt stand - genau der Farbunterschied beim Wischen zu den Paketen.
const CANVAS_PROBE = 1;

function updateCanvasColor(painted, defaultThemeColor) {
  let color = "";
  painted.forEach((stage) => {
    const declared = String(stage.getAttribute("data-canvas") || "").trim();
    if (!declared) return;
    const rect = stage.getBoundingClientRect();
    if (rect.top <= CANVAS_PROBE && rect.bottom > CANVAS_PROBE) color = declared;
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

// Aus der Lage eines Kapitels wird der Schritt, der gerade gilt.
//
// Zwei Dinge stehen hier bewusst so:
//
// 1. Der Bildschirm kommt aus dem Kapitel selbst (Hoehe / (Schritte + 1)) und
//    nicht aus einer zweiten Messung am Fenster. Beide Zahlen meinen dasselbe,
//    kommen aber aus verschiedenen Quellen und koennen darum auseinanderlaufen
//    - und solange sie das tun, zeigt das Kapitel den falschen Schritt. Aus
//    der eigenen Hoehe gerechnet kann das nicht passieren.
//
// 2. Der Schritt ist der naechstgelegene Rastpunkt, nicht ein Anteil der
//    Strecke. Ein Kapitel ist (Schritte + 1) Bildschirme hoch, seine
//    Rastpunkte liegen bei 0, 1, 2 ... Bildschirmen - die Strecke aber ist
//    einen Bildschirm kuerzer als das Kapitel. Ueber den Anteil gerechnet
//    sprang der Text deshalb schon bei 80 % des Weges zwischen zwei
//    Rastpunkten um. Wer dazwischen stehen bleibt, las die Erklaerung eines
//    Schritts, auf dem er gar nicht steht. Ueber den Rastpunkt gerechnet ist
//    der gezeigte Schritt immer der, bei dem man landet, und der Wechsel liegt
//    auf halbem Weg - dort, wo man ihn erwartet.
//
// Der Anteil bleibt daneben bestehen, aber nur noch fuer den Fortschrittsbalken.
export function stageStateFromRect(top, height, steps) {
  const anzahl = Math.max(1, Math.round(Number(steps) || 0));
  const screen = height / (anzahl + 1);
  if (!(screen > 0)) return { state: 0, progress: 0 };
  return {
    state: clamp(Math.round(-top / screen), 0, anzahl),
    progress: clamp(-top / (screen * anzahl), 0, 1)
  };
}

function updateStage(stage) {
  const rect = stage.getBoundingClientRect();
  const { state, progress } = stageStateFromRect(rect.top, rect.height, readSteps(stage));
  const changed = applyStageState(stage, state);

  // Nur schreiben, wenn sich der Wert wirklich aendert. Sonst wird bei jedem
  // Frame der Stil des Balkens fuer nichts neu berechnet. Gesucht wird der
  // Balken einmal beim Start und nicht bei jedem Frame - er wechselt nicht.
  const bar = stageBar(stage);
  const width = `${Math.round(progress * 100)}%`;
  if (bar && bar.style.width !== width) bar.style.width = width;

  // Nur bei echtem Schrittwechsel neu ausrichten. Jeder Frame wuerde sonst
  // ein Layout erzwingen (getBoundingClientRect direkt vor einem Style-
  // Schreibzugriff) und das Scrollen ins Stocken bringen.
  if (changed) panSceneToFocus(stage);
}

// Die Teile eines Kapitels, die bei jedem Frame gebraucht werden - einmal
// gesucht statt sechzigmal pro Sekunde.
const bars = new WeakMap();

function stageBar(stage) {
  if (bars.has(stage)) return bars.get(stage);
  const bar = stage.querySelector(".ll-stage__bar span");
  bars.set(stage, bar);
  return bar;
}

// Die Schritt-Texte liegen absolut uebereinander, tragen also nichts zur
// Hoehe bei. Ohne reservierten Platz wuerde der laengste Text in die Szene
// ragen. Deshalb wird der hoechste Schritt gemessen und die Textflaeche
// darauf festgesetzt - so bleibt die Szene beim Umschalten auch ruhig
// stehen, statt zwischen den Schritten zu springen.
function fitStageCaption(stage) {
  const caption = stage.querySelector(".ll-stage__caption");
  if (!caption) return;

  const vorher = caption.style.minHeight;
  caption.style.minHeight = "";
  let tallest = 0;
  stage.querySelectorAll(".ll-stage__step").forEach((step) => {
    step.style.position = "static";
    tallest = Math.max(tallest, step.offsetHeight);
    step.style.position = "";
  });
  // Ohne Layout misst sich alles zu null. Dann bleibt die zuletzt gueltige
  // Hoehe stehen, statt geloescht zu werden.
  if (tallest <= 0) {
    caption.style.minHeight = vorher;
    return;
  }

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

  lists.forEach((list) => {
    const cards = Array.from(list.children);
    cards.forEach((card) => card.removeAttribute("hidden"));
    if (cards.length < 2) return;

    const listTop = offsetTopWithin(list, scene);
    const available = viewport.clientHeight - (listTop - tabsTop) - TABS_TOP_MIN;
    // Kein Platz heisst hier: noch nicht messbar. Sonst wuerde jede Karte
    // ausser der ersten ausgeblendet und bliebe es.
    if (!(available > 0)) return;
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

function sceneSlack(scene, viewport, effectiveHeight) {
  // Der eigene Innenabstand der Szene zaehlt zum Abstand nach oben dazu.
  const padTop = parseFloat(window.getComputedStyle(scene).paddingTop) || 0;
  const room = Math.round((viewport.clientHeight - effectiveHeight) / 2);
  return clamp(room, 0, Math.max(0, SCENE_TOP_GAP - padTop));
}

// Die Szene wird nie verkleinert - sie soll in echter Groesse zu sehen sein.
// Ist sie hoeher als der sichtbare Bereich, faehrt sie stattdessen zu der
// Stelle, die gerade erklaert wird. Beim Zurueckrasten faehrt sie zurueck.
function panSceneToFocus(stage) {
  const viewport = stage.querySelector(".ll-stage__viewport");
  const scene = stage.querySelector(".ll-stage__scene");
  if (!viewport || !scene) return;

  // Solange die Deckflaeche oben liegt, gibt es dahinter nichts zu fahren -
  // die Szene steht genau da, wo der Schritt davor sie gelassen hat.
  if (stage.hasAttribute("data-aside")) return;

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
      const profileHeight = Math.round(tabsEl.getBoundingClientRect().bottom - sceneTop) + 10;
      rest = cardEl.offsetTop + sceneSlack(scene, viewport, profileHeight);
    }
    scene.style.transform = `translateY(${-Math.max(0, offsetTopWithin(tabsEl, scene) - rest)}px)`;
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
    // Passt alles ins Bild, steht es oben - mit demselben Abstand wie in der
    // App zwischen Kopfleiste und Inhalt.
    scene.style.transform = `translateY(${sceneSlack(scene, viewport, effectiveHeight)}px)`;
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

export function startLeadLandingStages({ scroller = null, viewport = null } = {}) {
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

  // Wechselt man die App und kommt zurueck, meldet der Browser eine
  // Groessenaenderung, waehrend die Seite noch kein Layout hat: Jedes Mass ist
  // in dem Moment null. Ein Kapitel ohne Hoehe sieht dann aus, als stuende man
  // an seinem Anfang - jedes landete bei Schritt 0, und man kam zurueck und
  // stand wieder beim Profil, obwohl der Scroll laengst weiter war.
  //
  // Deshalb wird nur gerechnet, solange die Seite wirklich eine Groesse hat.
  // Alles andere wartet, bis sie eine hat.
  const hatLayout = () => root.clientHeight > 0 && root.clientWidth > 0;

  const run = () => {
    ticking = false;
    if (!hatLayout()) return;
    const viewportHeight = root.clientHeight;
    stages.forEach((stage) => {
      const rect = stage.getBoundingClientRect();
      // Nur Kapitel in Sichtweite rechnen.
      if (rect.bottom < -viewportHeight || rect.top > viewportHeight * 2) return;
      updateStage(stage);
    });
    updateCanvasColor(painted, defaultThemeColor);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(run);
  };

  const fitAll = () => {
    if (!hatLayout()) return;
    stages.forEach((stage) => {
      fitStageCaption(stage);
      fitMenuLists(stage);
      panSceneToFocus(stage);
    });
  };

  // Bilder in der Szene kommen nachtraeglich (loading="lazy"). Bis dahin misst
  // sich die Szene niedriger, als sie am Ende ist - und die Fahrt zu der
  // Stelle, die gerade erklaert wird, ist um genau diesen Unterschied daneben.
  // Nachgerechnet wird erst, wenn eine Reihe von Bildern durch ist: Bei sieben
  // Bildern kurz hintereinander waeren es sonst sieben Neuvermessungen.
  let bilderTimer = 0;
  const onBild = () => {
    window.clearTimeout(bilderTimer);
    bilderTimer = window.setTimeout(() => {
      bilderTimer = 0;
      fitAll();
      onScroll();
    }, 80);
  };
  stages.forEach((stage) => {
    stage.querySelectorAll("img").forEach((bild) => {
      if (bild.complete) return;
      bild.addEventListener("load", onBild);
      bild.addEventListener("error", onBild);
    });
  });

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
      // Erst die Bildschirmhoehe nachziehen, dann vermessen. Andersherum
      // wuerde alles gegen den alten Wert gerechnet und beim naechsten Mal
      // wieder verworfen. Die Sperre gibt die neue Hoehe nur heraus, wenn es
      // wirklich eine ist - eine ein- und ausfahrende Leiste kommt hier gar
      // nicht erst an.
      if (viewport) viewport.pruefen();
      fitAll();
      onScroll();
    }, RESIZE_SETTLE_MS);
  };

  // Und wenn die Seite ihre Groesse wiederbekommt, wird nachgeholt, was
  // waehrenddessen ausgefallen ist. Ein ResizeObserver auf dem Scrollbereich
  // faengt das zuverlaessiger ab als jedes einzelne Ereignis: Er meldet sich
  // genau dann, wenn der Kasten wirklich wieder eine Groesse hat - egal, ob
  // das vom App-Wechsel kommt, von der Adressleiste oder vom Drehen.
  let watcher = null;
  if ("ResizeObserver" in window) {
    watcher = new ResizeObserver(onResize);
    watcher.observe(root);
  }

  // Zwei Guertel dazu, falls ein Browser den Kasten unveraendert zurueckgibt:
  // die Rueckkehr in den Vordergrund und die Wiederherstellung aus dem
  // Vor-/Zurueck-Speicher.
  const onWakeup = () => {
    if (document.hidden) return;
    onResize();
  };
  document.addEventListener("visibilitychange", onWakeup);
  window.addEventListener("pageshow", onWakeup);

  root.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  fitAll();
  run();
  // Nach dem Laden der Bilder koennen sich Hoehen noch aendern.
  window.addEventListener("load", onResize, { once: true });

  return () => {
    window.clearTimeout(resizeTimer);
    window.clearTimeout(bilderTimer);
    if (watcher) watcher.disconnect();
    document.removeEventListener("visibilitychange", onWakeup);
    window.removeEventListener("pageshow", onWakeup);
    root.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
  };
}
