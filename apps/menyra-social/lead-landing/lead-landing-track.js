// Was der Wirt auf seiner Landing tut - aufgezeichnet, ohne ihm im Weg zu
// stehen.
//
// Gemessen wird pro Wisch: ob er ihn gesehen hat und wie lange er darauf war.
// Dazu die Antworten auf die drei Fragen. Mehr nicht - kein Fingerabdruck,
// keine fremden Dienste, keine Kennung, die den Aufruf ueberdauert.
//
// Drei Entscheidungen, die alles andere tragen:
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
// 3. Geschrieben wird direkt nach Firestore, nicht ueber einen eigenen Dienst.
//    Der Aufrufer ist nicht angemeldet; was er schreiben darf, steht in den
//    Firestore-Regeln und nur dort. Das kostet die Moeglichkeit, dem Absender
//    zu glauben - dafuer braucht die Seite kein Geheimnis, das irgendwo
//    hinterlegt sein muesste, und faellt nicht aus, wenn es fehlt.

import { LEAD_LANDING_API_KEY, LEAD_LANDING_FIRESTORE_BASE } from "./lead-landing-config.js";

const FLUSH_EVERY_MS = 15000;
const SETTLE_MS = 160;
// Laenger als das war niemand auf einem Bildschirm - danach lag das Handy auf
// dem Tisch. Ohne diese Grenze machte eine vergessene Seite aus zehn Sekunden
// Aufmerksamkeit eine halbe Stunde.
const MAX_STEP_MS = 120000;
// Dieselben Grenzen wie in den Regeln. Was hier durchrutscht, wuerde dort
// abgewiesen - dann ginge die ganze Sitzung verloren statt eines Wertes.
const MAX_TOTAL_MS = 6 * 60 * 60 * 1000;
const MAX_STEPS = 40;
const STEP_NAME = /^[a-z0-9-]+$/;

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

export function startLeadLandingTracking({ scroller = null, slug = "", restaurantId = "" } = {}) {
  const root = scroller || document.querySelector(".ll-shell");
  const marks = Array.from(document.querySelectorAll("[data-track]"));
  if (!root || !marks.length || !slug || !restaurantId) return null;

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
    if (name === current) return;
    closeCurrent();
    current = name;
    since = name ? now() : 0;
    if (name && !(name in steps)) {
      steps[name] = 0;
      dirty = true;
    }
  };

  // Wer belegt die Oberkante? Dasselbe wie bei der Seitenfarbe, damit beides
  // nie auf verschiedene Abschnitte zeigt.
  const stepAtTop = () => {
    let found = "";
    marks.forEach((mark) => {
      const rect = mark.getBoundingClientRect();
      if (rect.top <= 1 && rect.bottom > 1) found = mark.dataset.track || found;
    });
    return found;
  };

  const send = () => {
    if (closed) return;
    closeCurrent();
    if (current) since = now();
    if (!dirty) return;
    dirty = false;

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

    const body = JSON.stringify({
      fields: {
        slug: text(slug.slice(0, 120)),
        steps: { mapValue: { fields: stepFields } },
        answers: { mapValue: { fields: answerFields } },
        outcome: text(outcome),
        totalMs: int(Math.min(total, MAX_TOTAL_MS)),
        stepCount: int(Object.keys(stepFields).length),
        startedAt: text(startedAt),
        updatedAt: text(new Date().toISOString())
      }
    });

    // Beim Schliessen der Seite ist ein gewoehnliches fetch nicht mehr
    // verlaesslich; keepalive gibt der Browser dem Betriebssystem mit.
    // sendBeacon kaeme hier nicht in Frage - es kann nur POST, und ein
    // bestimmtes Dokument beschreibt man mit PATCH. Verloren geht dabei
    // hoechstens die zuletzt verstrichene Zeit: Geschickt wird immer der ganze
    // Stand, und die vorige Sendung liegt nie mehr als ein paar Sekunden
    // zurueck.
    try {
      fetch(target, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      }).catch(() => {});
    } catch {}
  };

  let settleTimer = 0;
  const onScroll = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      if (root.clientHeight > 0) openStep(stepAtTop());
    }, SETTLE_MS);
  };

  const flushTimer = window.setInterval(() => send(), FLUSH_EVERY_MS);

  // Wechselt der Wirt die App, laeuft die Uhr nicht weiter - er sieht die
  // Seite ja nicht. Beim Zurueckkommen faengt sie wieder an.
  const onVisibility = () => {
    if (document.hidden) {
      closeCurrent();
      send();
    } else {
      since = current ? now() : 0;
      onScroll();
    }
  };

  const onLeave = () => send();

  root.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onLeave);

  openStep(stepAtTop());

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
      root.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onLeave);
    }
  };
}
