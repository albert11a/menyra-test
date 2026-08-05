// Was der Wirt auf seiner Landing tut - aufgezeichnet, ohne ihm im Weg zu
// stehen.
//
// Gemessen wird pro Wisch: ob er ihn gesehen hat und wie lange er darauf war.
// Dazu die Antworten auf die drei Fragen. Mehr nicht - kein Fingerabdruck,
// keine fremden Dienste, keine Kennung, die den Aufruf ueberdauert.
//
// Zwei Entscheidungen, die alles andere tragen:
//
// 1. Geschickt wird immer der ganze Stand, nie die Aenderung seit dem letzten
//    Mal. Geht eine Sendung verloren - und beim Schliessen der Seite geht schon
//    mal eine verloren -, traegt die naechste alles nach. Der Server legt sie
//    unter derselben Sitzung ab; sie darf beliebig oft ankommen.
//
// 2. Der aktuelle Wisch ist der, der die Oberkante belegt - dieselbe Regel wie
//    fuer die Seitenfarbe. Nach der Bildschirmmitte gerechnet zaehlte die Zeit
//    dem falschen Wisch zu, solange man zwischen zweien steht.

const FLUSH_EVERY_MS = 15000;
const SETTLE_MS = 160;
// Laenger als das war niemand auf einem Bildschirm - danach lag das Handy auf
// dem Tisch. Ohne diese Grenze machte eine vergessene Seite aus zehn Sekunden
// Aufmerksamkeit eine halbe Stunde.
const MAX_STEP_MS = 120000;
const ENDPOINT = "/api/landing-track";

function newSessionId() {
  try {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
  } catch {}
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function startLeadLandingTracking({ scroller = null, slug = "" } = {}) {
  const root = scroller || document.querySelector(".ll-shell");
  const marks = Array.from(document.querySelectorAll("[data-track]"));
  if (!root || !marks.length || !slug) return null;

  const sessionId = newSessionId();
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

  const send = (useBeacon) => {
    if (closed) return;
    closeCurrent();
    if (current) since = now();
    if (!dirty) return;
    dirty = false;

    const total = Object.keys(steps).reduce((sum, key) => sum + steps[key], 0);
    const payload = JSON.stringify({
      sessionId,
      slug,
      steps,
      answers,
      outcome,
      totalMs: total
    });

    // Beim Schliessen der Seite ist fetch nicht mehr verlaesslich - sendBeacon
    // gibt der Browser dem Betriebssystem mit. Wo es das nicht gibt, bleibt
    // keepalive.
    try {
      if (useBeacon && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "text/plain;charset=UTF-8" });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
    } catch {}

    try {
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
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

  const flushTimer = window.setInterval(() => send(false), FLUSH_EVERY_MS);

  // Wechselt der Wirt die App, laeuft die Uhr nicht weiter - er sieht die
  // Seite ja nicht. Beim Zurueckkommen faengt sie wieder an.
  const onVisibility = () => {
    if (document.hidden) {
      closeCurrent();
      send(true);
    } else {
      since = current ? now() : 0;
      onScroll();
    }
  };

  const onLeave = () => send(true);

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
      send(false);
    },
    finish(result) {
      outcome = result === "yes" || result === "no" ? result : "";
      dirty = true;
      send(false);
    },
    stop() {
      send(true);
      closed = true;
      window.clearInterval(flushTimer);
      window.clearTimeout(settleTimer);
      root.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onLeave);
    }
  };
}
