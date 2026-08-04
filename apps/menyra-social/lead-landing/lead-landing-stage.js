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

  // Randlose Schritte: Die Szene laeuft bis an den Bildschirmrand, ohne
  // Rahmen und Rundung - fuer Nachbauten, die in der App den ganzen
  // Bildschirm einnehmen.
  if (captions[state]?.dataset?.full === "1") stage.setAttribute("data-full", "");
  else stage.removeAttribute("data-full");

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
    cards.forEach((card, index) => {
      if (index === 0) return;
      const bottom = offsetTopWithin(card, scene) - listTop + card.offsetHeight;
      if (bottom > available) card.setAttribute("hidden", "");
    });
  });
}

// Der Beitrag im Feed: Das Bild ist 4:5 hoch. Ueber die volle Breite
// gerechnet braucht es mehr Hoehe, als unter der Kopfzeile uebrig bleibt -
// dann waere es unten abgeschnitten. Deshalb wird hier die Breite gesucht,
// bei der der ganze Beitrag in den Platz passt.
//
// Gerechnet statt dem Stylesheet ueberlassen: Wie eine Engine aus einer
// vorgegebenen Hoehe die Breite ableitet, ist verschieden - in Safari kam
// dabei ein schmaler Streifen heraus. Pixel sehen ueberall gleich aus.
const FPOST_IMAGE_RATIO = 5 / 4;

function boxExtra(style, sides) {
  return sides.reduce((sum, side) => sum
    + (parseFloat(style[`padding${side}`]) || 0)
    + (parseFloat(style[`border${side}Width`]) || 0), 0);
}

// Nachbauten mit festen Massen (Highlights, Karte des Lokals) lassen sich
// nicht ueber die Breite regeln. Passen sie nicht in die Hoehe, werden sie
// als Ganzes verkleinert: Die Verhaeltnisse bleiben, abgeschnitten wird
// nichts. Passen sie, bleiben sie in echter Groesse.
function fitFeedBlock(stage, selector, available) {
  const block = stage.querySelector(selector);
  if (!block) return;
  block.style.transform = "";
  const natural = block.offsetHeight;
  if (!(natural > 0) || !(available > 0) || natural <= available) return;
  // Von links oben verkleinern: Sonst ruecken die Bloecke beim Verkleinern
  // von der linken Kante weg und stehen nicht mehr buendig mit dem Rest.
  block.style.transformOrigin = "top left";
  block.style.transform = `scale(${(available / natural).toFixed(4)})`;
}

function fitFeedScene(stage) {
  const viewport = stage.querySelector(".ll-stage__viewport");
  const feed = stage.querySelector(".ll-web--feed .ll-feed");
  const post = stage.querySelector(".ll-fpost");
  const frame = stage.querySelector(".ll-fpost__frame");
  if (!viewport || !feed || !post || !frame) return;

  // Erst zuruecksetzen, sonst misst die naechste Rechnung den eigenen Stand.
  const media = stage.querySelector(".ll-fpost__media");
  frame.style.width = "";
  if (media) media.style.height = "";

  // Der Platz wird aus den Bauteilen darueber gerechnet, nicht aus der Hoehe
  // der Feed-Flaeche: Die haengt davon ab, wie eine Engine den Rest verteilt.
  // Der Rahmen des Kapitels ist dagegen ueberall gleich hoch.
  const tabs = stage.querySelector(".ll-web--feed .ll-htabs");
  const feedStyle = window.getComputedStyle(feed);
  const head = stage.querySelector(".ll-fpost__head");
  const frameStyle = window.getComputedStyle(frame);

  // Ueber dem Feed steht nur die Tab-Zeile - ihr Abstand nach oben gehoert zu
  // ihrer Hoehe und ist damit schon mitgezaehlt.
  const tabsSpace = tabs ? tabs.offsetHeight : 0;

  // Der Schatten des Rahmens reicht ueber ihn hinaus. Die Karte des Feeds
  // endet am Bildschirmrand und schneidet ihn dort ab - das gab unten einen
  // grauen Streifen mit harter Kante. Deshalb bleibt unter dem Rahmen so viel
  // frei, dass der Schatten vollstaendig auslaufen kann. Wie weit er reicht,
  // steht im Stylesheet neben dem Schatten selbst.
  const reach = parseFloat(frameStyle.getPropertyValue("--ll-fpost-shadow-reach")) || 0;
  const feedBottom = (parseFloat(feedStyle.paddingBottom) || 0)
    + (parseFloat(feedStyle.borderBottomWidth) || 0);

  // Der Platz, den die Feed-Flaeche fuer ihren Inhalt hergibt.
  const content = viewport.clientHeight
    - tabsSpace
    - boxExtra(feedStyle, ["Top", "Bottom"]);

  const used = tabsSpace
    + boxExtra(feedStyle, ["Top"])
    // Der Abstand unten und der Auslauf des Schattens ueberlagern sich - es
    // zaehlt der groessere von beiden, nicht die Summe.
    + Math.max(feedBottom, reach)
    + (head ? head.offsetHeight + (parseFloat(window.getComputedStyle(head).marginBottom) || 0) : 0)
    + boxExtra(frameStyle, ["Top", "Bottom"]);

  // Der Beitrag behaelt seine echte Breite - die volle Breite der Flaeche, so
  // wie in der App. Reicht die Hoehe nicht, wird nur das Bild flacher; das
  // Foto darin bleibt formfuellend und wird oben und unten beschnitten,
  // genauso wie es die App bei langen Fotos macht.
  const frameWidth = boxExtra(frameStyle, ["Left", "Right"]);
  const full = post.clientWidth - frameWidth;
  const room = viewport.clientHeight - used;
  if (media && full > 0 && room > 0) {
    media.style.height = `${Math.floor(Math.min(full * FPOST_IMAGE_RATIO, room))}px`;
  }

  // Wie weit die Feed-Spalte faehrt, damit die Story-Reihe unter den Skeda
  // verschwindet und der Beitrag genau an ihre Stelle rueckt.
  const rail = stage.querySelector(".ll-feed__rail");
  const scroll = stage.querySelector(".ll-feed__scroll");
  if (rail && scroll) scroll.style.setProperty("--ll-rail-h", `${rail.offsetHeight}px`);

  fitFeedBlock(stage, ".ll-hl", content);
  fitFeedBlock(stage, ".ll-rcard:not(.ll-ocard)", content);
  fitFeedBlock(stage, ".ll-ocard", content);

  // Dieselbe Fahrt bei Restorante. Gefahren wird genau bis zur Oberkante der
  // Karte - nicht um die Hoehe der Highlights: Sind die verkleinert, sagt
  // ihre sichtbare Hoehe nichts mehr darueber, wo die Karte im Layout steht.
  // offsetTop ist von der Verkleinerung unberuehrt und trifft deshalb.
  const highlights = stage.querySelector(".ll-hl");
  const listCard = stage.querySelector(".ll-rcard:not(.ll-ocard)");
  const places = stage.querySelector(".ll-feed__scroll--places");
  if (highlights && listCard && places) {
    const travel = Math.max(0, listCard.offsetTop - highlights.offsetTop);
    places.style.setProperty("--ll-hl-h", `${travel}px`);
  }
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

  // Like-Zeile und Kommentarbereich zaehlen nicht mit: An ihre Stelle tritt
  // genau jetzt die Fusszeile (beide werden dafuer ausgeblendet, siehe
  // Stylesheet).
  const paneTop = pane.getBoundingClientRect().top;
  let contentEnd = 0;
  pane.querySelectorAll("[data-spot]").forEach((node) => {
    if (node.classList.contains("ll-md__comments")) return;
    if (node.classList.contains("ll-md__social")) return;
    contentEnd = Math.max(contentEnd, node.getBoundingClientRect().bottom - paneTop);
  });

  // Unterkante des Inhalts im Ausschnitt - weder ueber dessen Oberkante
  // hinaus noch unter dessen Rand.
  const visibleEnd = clamp(contentEnd - paneOffset, 0, clip.clientHeight);
  const lift = Math.round(clip.clientHeight - visibleEnd - FOOTER_LIFT_GAP);
  foot.style.transform = lift > 0 ? `translateY(${-lift}px)` : "";
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

function panSceneToFocus(stage) {
  const viewport = stage.querySelector(".ll-stage__viewport");
  const scene = stage.querySelector(".ll-stage__scene");
  if (!viewport || !scene) return;

  // Solange die Deckflaeche oben liegt, gibt es dahinter nichts zu fahren -
  // die Szene steht genau da, wo der Schritt davor sie gelassen hat.
  if (stage.hasAttribute("data-aside")) return;

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
      fitMenuLists(stage);
      // Nach fitStageCaption: erst dann steht fest, wie hoch die Kopfzeile
      // ist und wie viel Platz darunter fuer den Feed bleibt.
      fitFeedScene(stage);
      // fitPaneTravel laeuft in panSceneToFocus - dort steht die Hoehe fest.
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
