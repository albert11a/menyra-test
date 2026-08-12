// Was der Wirt auf seiner Landing tut - aufgezeichnet, ohne ihm im Weg zu
// stehen.
//
// Gemessen wird pro Wisch: ob er ihn gesehen hat und wie lange er darauf war.
// Dazu die Antworten auf die drei Fragen. Mehr nicht - kein Fingerabdruck,
// keine fremden Dienste, keine Kennung, die den Aufruf ueberdauert.
//
// Fuenf Entscheidungen, die alles andere tragen:
//
// 1. Geschickt wird immer der ganze Stand, nie die Aenderung seit dem letzten
//    Mal. Geht eine Sendung verloren - und beim Schliessen der Seite geht schon
//    mal eine verloren -, traegt die naechste alles nach. Sie landet unter
//    derselben Sitzung und darf beliebig oft ankommen.
//
// 2. Der aktuelle Wisch ist der, der die Oberkante belegt - dieselbe Regel wie
//    fuer die Seitenfarbe. Nach der Bildschirmmitte gerechnet zaehlte die Zeit
//    dem falschen Wisch zu, solange man zwischen zweien steht.
//
// 3. Gesehen ist gesehen - auch bei einem einzigen langen Wisch. Frueher wurde
//    erst gemessen, wenn das Scrollen 160 ms lang stillstand: Wer zuegig
//    durchgewischt hat, tauchte nur dort auf, wo er laenger stehen blieb, und
//    in der Auswertung sah es aus, als waere er nie ueber den Anfang hinaus
//    gekommen. Jetzt wird waehrend des Wischens mitgezaehlt (einmal je Bild),
//    und wer auf Wisch 9 steht, hat 1 bis 8 nachweislich passiert - sie werden
//    deshalb mitgeschrieben, notfalls mit null Sekunden. Der Weg ist damit
//    lueckenlos; die Zeit sagt, wo er stehen geblieben ist.
//
// 4. Gemessen wird gegen eine Tabelle von Scrollstaenden, nicht gegen das
//    Layout: Die Lage der Marken wird im Stillstand einmal ausgemessen,
//    waehrend des Wischens wird nur noch gerechnet. So kostet das Mitzaehlen
//    kein einziges erzwungenes Neuberechnen des Layouts - sonst waere die
//    Messung selbst der Grund, warum das Wischen hakt.
//
// 5. Geschrieben wird direkt nach Firestore, nicht ueber einen eigenen Dienst.
//    Der Aufrufer ist nicht angemeldet; was er schreiben darf, steht in den
//    Firestore-Regeln und nur dort. Das kostet die Moeglichkeit, dem Absender
//    zu glauben - dafuer braucht die Seite kein Geheimnis, das irgendwo
//    hinterlegt sein muesste, und faellt nicht aus, wenn es fehlt.
//
// Und weil eine Sendung schiefgehen kann: Sie wird wiederholt. Erst nach einer
// bestaetigten Antwort gilt der Stand als angekommen; bis dahin bleibt er
// offen und geht mit der naechsten Sendung erneut hinaus. Was beim Schliessen
// der Seite unbestaetigt bleibt, liegt im Geraetespeicher und wird beim
// naechsten Aufruf nachgereicht.

import { LEAD_LANDING_API_KEY, LEAD_LANDING_FIRESTORE_BASE } from "./lead-landing-config.js";

// Der regelmaessige Stand, damit auch eine Sitzung ohne jede Bewegung
// vollstaendig ist.
const FLUSH_EVERY_MS = 15000;
// Nach einer Aenderung (ein neuer Wisch ist erreicht) wird fruehestens so
// schnell wieder geschickt. Ohne diese Bremse waere ein zuegiger Durchlauf
// sechzehn Sendungen; mit ihr sind es ein paar.
const CHANGE_FLUSH_MS = 4000;
// Wartezeiten der Wiederholungen. Danach traegt der regelmaessige Stand nach.
const RETRY_MS = [1200, 3500, 9000];
// Nach so langer Ruhe gilt das Scrollen als beendet - dann wird nachgemessen.
const SETTLE_MS = 140;
// Laenger als das war niemand auf einem Bildschirm - danach lag das Handy auf
// dem Tisch. Ohne diese Grenze machte eine vergessene Seite aus zehn Sekunden
// Aufmerksamkeit eine halbe Stunde.
const MAX_STEP_MS = 120000;
// Dieselben Grenzen wie in den Regeln. Was hier durchrutscht, wuerde dort
// abgewiesen - dann ginge die ganze Sitzung verloren statt eines Wertes.
const MAX_TOTAL_MS = 6 * 60 * 60 * 1000;
const MAX_STEPS = 40;
const STEP_NAME = /^[a-z0-9-]+$/;

// Was beim Schliessen der Seite unbestaetigt blieb. Ein Eintrag, nicht mehr:
// Die letzte Sendung traegt ohnehin den ganzen Stand.
const PENDING_KEY = "mnyra-ll-pending";
const PENDING_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function newSessionId() {
  try {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
  } catch {}
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

// Firestore-REST nimmt getypte Werte entgegen. Ganzzahlen muessen als Text
// stehen, sonst kommen sie als Kommazahl an und die Regel weist sie ab.
function int(value) {
  return { integerValue: String(Math.max(0, Math.round(Number(value) || 0))) };
}

function text(value) {
  return { stringValue: String(value || "") };
}

// Welcher Wisch belegt die Oberkante?
//
// tops[i] ist der Scrollstand, ab dem Marke i oben steht. Gesucht ist die
// letzte, die schon erreicht ist. Eigene Funktion und ohne DOM, damit sie
// geprueft werden kann - an ihr haengt die ganze Auswertung.
//
// Die zwei Pixel Zugabe sind der Rundungsfehler des Einrastens: Nach einem
// Wisch steht der Rastpunkt gern bei 0,5 Pixeln unter der Kante, und ohne die
// Zugabe zaehlte der Wisch dann noch dem vorigen zu.
export function stepIndexAt(tops = [], scrolled = 0) {
  let found = -1;
  for (let index = 0; index < tops.length; index += 1) {
    if (tops[index] <= scrolled + 2) found = index;
  }
  // Ueber der ersten Marke gibt es nichts Frueheres - dort gilt sie selbst.
  return found < 0 ? (tops.length ? 0 : -1) : found;
}

// Ein Stand, der noch nicht bestaetigt ist, wird im Geraetespeicher hinterlegt
// und beim naechsten Aufruf nachgereicht. Faellt der Speicher aus (privater
// Modus, volles Kontingent), aendert das nichts an der Messung selbst.
function rememberPending(record) {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(record));
  } catch {}
}

function forgetPending() {
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {}
}

function readPending() {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (!record || typeof record.target !== "string" || typeof record.body !== "string") return null;
    if (!record.target.startsWith(LEAD_LANDING_FIRESTORE_BASE)) return null;
    const age = Date.now() - (Number(record.at) || 0);
    if (!(age >= 0) || age > PENDING_MAX_AGE_MS) return null;
    return record;
  } catch {
    return null;
  }
}

// Beim Schliessen der Seite ist ein gewoehnliches fetch nicht mehr
// verlaesslich; keepalive gibt der Browser dem Betriebssystem mit. sendBeacon
// kaeme hier nicht in Frage - es kann nur POST, und ein bestimmtes Dokument
// beschreibt man mit PATCH.
function patch(target, body) {
  return fetch(target, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  });
}

// Was vom letzten Aufruf liegen geblieben ist, geht als Erstes hinaus - noch
// bevor die neue Sitzung ihre erste Sendung macht.
function flushPending() {
  const record = readPending();
  if (!record) return;
  forgetPending();
  try {
    patch(record.target, record.body).then((response) => {
      // Abgewiesen heisst: Der Stand kommt auch beim naechsten Mal nicht
      // durch. Nur ein Netzfehler ist es wert, ihn aufzuheben.
      if (!response || response.ok || response.status >= 400) return;
      rememberPending(record);
    }).catch(() => rememberPending(record));
  } catch {}
}

export function startLeadLandingTracking({ scroller = null, slug = "", restaurantId = "" } = {}) {
  const root = scroller || document.querySelector(".ll-shell");

  // Die Marken in der Reihenfolge der Seite. Namen, die die Firestore-Regeln
  // abweisen wuerden, kommen gar nicht erst mit: Ein einziger falscher Name
  // brechte die ganze Sitzung zu Fall, nicht nur diesen einen Wert.
  const marks = [];
  document.querySelectorAll("[data-track]").forEach((node) => {
    const name = String(node.dataset.track || "").trim();
    if (!name || !STEP_NAME.test(name)) return;
    if (marks.some((mark) => mark.name === name)) return;
    if (marks.length >= MAX_STEPS) return;
    marks.push({ name, node });
  });

  if (!root || !marks.length || !slug || !restaurantId) return null;

  flushPending();

  const sessionId = newSessionId();
  const startedAt = new Date().toISOString();
  const target = `${LEAD_LANDING_FIRESTORE_BASE}/restaurants/${encodeURIComponent(restaurantId)}`
    + `/landingSessions/${encodeURIComponent(sessionId)}?key=${encodeURIComponent(LEAD_LANDING_API_KEY)}`;

  const steps = Object.create(null);
  const answers = Object.create(null);
  let outcome = "";
  let current = "";
  let since = 0;
  let dirty = false;
  let closed = false;

  const now = () => Date.now();

  /* ------------------------------------------------------------ Messen */

  // Der Scrollstand, ab dem jede Marke oben steht. Einmal im Stillstand
  // ausgemessen, danach nur noch gerechnet.
  let tops = [];
  let messHoehe = 0;

  const measureLayout = () => {
    if (!(root.clientHeight > 0)) return;
    const base = root.getBoundingClientRect().top;
    const scrolled = root.scrollTop;
    tops = marks.map((mark) => Math.round(mark.node.getBoundingClientRect().top - base + scrolled));
    messHoehe = root.scrollHeight;
  };

  // Die Zeit des laufenden Wisches abrechnen und ihn schliessen.
  const closeCurrent = () => {
    if (!current || !since) return;
    const spent = Math.min(now() - since, MAX_STEP_MS);
    if (spent > 0) {
      steps[current] = (steps[current] || 0) + spent;
      dirty = true;
    }
    since = 0;
  };

  const openStep = (name) => {
    if (!name || name === current) return;
    closeCurrent();
    current = name;
    since = now();
    if (!(name in steps)) {
      steps[name] = 0;
      dirty = true;
    }
  };

  // Wer auf Wisch 9 steht, ist an 1 bis 8 vorbeigekommen. Sie stehen deshalb
  // in der Sitzung, auch wenn auf ihnen keine Zeit haengen geblieben ist -
  // sonst haette ein einziger langer Wisch eine Luecke hinterlassen, und die
  // Auswertung haette daraus einen Abbruch gemacht.
  let reached = -1;
  const markReached = (index) => {
    if (index <= reached) return;
    for (let position = reached + 1; position <= index; position += 1) {
      const name = marks[position].name;
      if (!(name in steps)) {
        steps[name] = 0;
        dirty = true;
      }
    }
    reached = index;
  };

  const sample = () => {
    if (closed || !(root.clientHeight > 0) || !tops.length) return;
    const index = stepIndexAt(tops, root.scrollTop);
    if (index < 0) return;
    markReached(index);
    openStep(marks[index].name);
  };

  /* ----------------------------------------------------------- Schicken */

  const buildBody = () => {
    const stepFields = {};
    let total = 0;
    Object.keys(steps).forEach((key) => {
      if (!STEP_NAME.test(key) || Object.keys(stepFields).length >= MAX_STEPS) return;
      const spent = Math.min(Math.max(0, steps[key]), MAX_TOTAL_MS);
      stepFields[key] = int(spent);
      total += spent;
    });

    const answerFields = {};
    ["q1", "q2", "q3"].forEach((key) => {
      if (answers[key] === "po" || answers[key] === "jo") answerFields[key] = text(answers[key]);
    });

    return JSON.stringify({
      fields: {
        slug: text(String(slug).slice(0, 120)),
        steps: { mapValue: { fields: stepFields } },
        answers: { mapValue: { fields: answerFields } },
        outcome: text(outcome),
        totalMs: int(Math.min(total, MAX_TOTAL_MS)),
        stepCount: int(Object.keys(stepFields).length),
        startedAt: text(startedAt),
        updatedAt: text(new Date().toISOString())
      }
    });
  };

  let inFlight = false;
  let nochmal = false;
  let retryIndex = 0;
  let retryTimer = 0;
  let changeTimer = 0;
  let lastSentAt = 0;

  const scheduleRetry = () => {
    if (closed || retryTimer) return;
    const wait = RETRY_MS[Math.min(retryIndex, RETRY_MS.length - 1)];
    retryIndex += 1;
    retryTimer = window.setTimeout(() => {
      retryTimer = 0;
      send();
    }, wait);
  };

  // Ein Sendevorgang zur Zeit. Kaeme eine zweite Sendung dazwischen - die
  // Antwort auf eine Frage waehrend der regelmaessige Stand noch unterwegs ist
  // -, koennte die aeltere spaeter ankommen und die neuere ueberschreiben.
  function send() {
    if (closed) return;
    closeCurrent();
    // Die Uhr laeuft weiter, solange die Seite zu sehen ist. Im Hintergrund
    // laeuft sie nicht: Dort sieht niemand die Seite an.
    if (current && !document.hidden) since = now();
    if (!dirty) return;
    if (inFlight) {
      nochmal = true;
      return;
    }

    inFlight = true;
    dirty = false;
    lastSentAt = now();
    const body = buildBody();
    // Erst hinterlegen, dann schicken: Stirbt die Seite mitten in der
    // Sendung, liegt der Stand im Geraetespeicher und geht beim naechsten
    // Aufruf nach. Kommt er an, wird der Eintrag wieder entfernt.
    const record = { target, body, at: now() };
    rememberPending(record);

    const gescheitert = () => {
      inFlight = false;
      dirty = true;
      scheduleRetry();
    };

    try {
      patch(target, body).then((response) => {
        inFlight = false;
        if (!response || !response.ok) {
          gescheitert();
          return;
        }
        retryIndex = 0;
        forgetPending();
        if (nochmal) {
          nochmal = false;
          send();
        }
      }).catch(gescheitert);
    } catch {
      gescheitert();
    }
  }

  // Nach einer Aenderung wird geschickt - aber nicht bei jedem Wisch einzeln.
  const queueSend = () => {
    if (closed || !dirty || changeTimer) return;
    const wait = Math.max(0, CHANGE_FLUSH_MS - (now() - lastSentAt));
    changeTimer = window.setTimeout(() => {
      changeTimer = 0;
      send();
    }, wait);
  };

  /* ------------------------------------------------------------ Anhaengen */

  let frame = 0;
  const onFrame = () => {
    frame = 0;
    sample();
  };

  let settleTimer = 0;
  const onScroll = () => {
    // Einmal je Bild reicht - und nur lesen, nur rechnen: Die Lage der Marken
    // steht schon fest, hier wird nichts am Layout angefasst.
    if (!frame) {
      frame = typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame(onFrame)
        : window.setTimeout(onFrame, 16);
    }
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(onSettle, SETTLE_MS);
  };

  // Im Stillstand wird nachgemessen: Bilder sind nachgeladen, die Leisten des
  // Browsers sind gewandert, die Bildschirmhoehe ist nachgezogen. Aendert sich
  // dabei die Gesamthoehe, stimmt die Tabelle nicht mehr - dann neu.
  function onSettle() {
    if (closed) return;
    if (root.scrollHeight !== messHoehe) measureLayout();
    sample();
    queueSend();
  }

  const onVisibility = () => {
    if (document.hidden) {
      closeCurrent();
      send();
      return;
    }
    since = current ? now() : 0;
    measureLayout();
    sample();
  };

  const onLeave = () => send();

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      measureLayout();
      sample();
    }, SETTLE_MS);
  };

  const flushTimer = window.setInterval(() => send(), FLUSH_EVERY_MS);

  root.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onLeave);
  window.addEventListener("pageshow", onResize);
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  measureLayout();
  sample();
  // Die Sitzung wird sofort angelegt, nicht erst nach fuenfzehn Sekunden: Wer
  // die Seite oeffnet und gleich wieder weglegt, ist ein Aufruf - und war in
  // der Auswertung bisher gar nicht da.
  send();

  return {
    // Eine Antwort ist der eine Wert, der ohne Zeit auskommt - sie wird sofort
    // mitgeschickt, damit sie auch dann ankommt, wenn die Seite gleich danach
    // geschlossen wird.
    answer(question, value) {
      if (!question || !value) return;
      answers[question] = value;
      dirty = true;
      send();
    },
    finish(result) {
      outcome = result === "yes" || result === "no" ? result : "";
      dirty = true;
      send();
    },
    stop() {
      send();
      closed = true;
      window.clearInterval(flushTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(changeTimer);
      window.clearTimeout(retryTimer);
      window.clearTimeout(resizeTimer);
      root.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("pageshow", onResize);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    }
  };
}
