// Was auf Landing 2 passiert - aufgezeichnet, ohne im Weg zu stehen.
//
// Diese Messung ist Akquise-Messung und nichts anderes. Sie sagt, wie weit
// ein Wirt gekommen ist und wo er stehen geblieben ist. Sie darf niemals in
// die Zahlen des Lokals laufen: Wie oft sein Profil aufgerufen wurde, wie
// viele Leute seine Menue gesehen haben - das sind seine Zahlen, und ein
// Verkaufsgespraech gehoert nicht hinein. Deshalb liegt sie in einer eigenen
// Sammlung (landing2Sessions), getrennt von den Sitzungen der Lead-Landing
// (landingSessions) und getrennt von allem, was die App misst.
//
// Aufgezeichnet wird pro Abschnitt: ob er gesehen wurde und wie lange. Dazu
// der eine Klick am Ende. Mehr nicht - kein Fingerabdruck, keine fremden
// Dienste, keine Kennung, die den Aufruf ueberdauert.
//
// Geschickt wird immer der ganze Stand, nie die Aenderung seit dem letzten
// Mal. Geht eine Sendung verloren - und beim Schliessen der Seite geht schon
// mal eine verloren -, traegt die naechste alles nach. Sie landet unter
// derselben Sitzung und darf beliebig oft ankommen.
//
// Faellt die Messung aus - fehlende Regeln, kein Netz, Sperre im Browser -,
// aendert das an der Seite nichts. Sie ist eine Beobachtung, keine Bedingung.

import { LANDING2_API_KEY, LANDING2_FIRESTORE_BASE } from "./landing2-config.js";

// Die Namen, die geschrieben werden duerfen. Eine feste Liste, kein Muster:
// Was hier nicht steht, geht nicht hinaus. So kann aus einem Tippfehler im
// Markup kein Feld in der Datenbank werden.
export const LANDING2_EVENTS = Object.freeze({
  hyrje: "landing2_open",
  profili: "landing2_profile_seen",
  falas: "landing2_free_seen",
  zbulimi: "landing2_discovery_seen",
  kudo: "landing2_discovery_seen",
  "nje-profil": "landing2_discovery_seen",
  "cka-eshte": "landing2_discovery_seen",
  tavolina: "landing2_qr_seen",
  "kudo-njejta": "landing2_qr_seen",
  zero: "landing2_free_seen",
  porosia: "landing2_order_seen",
  go: "landing2_go_seen",
  save: "landing2_save_seen",
  biznesi: "landing2_business_seen",
  vizioni: "landing2_vision_seen",
  fundi: "landing2_cta_seen"
});

export const LANDING2_CLAIM_EVENT = "landing2_claim_click";

const FLUSH_EVERY_MS = 15000;
const CHANGE_FLUSH_MS = 4000;
const RETRY_MS = [1200, 3500, 9000];
// Laenger als das war niemand auf einem Abschnitt - danach lag das Handy auf
// dem Tisch. Ohne diese Grenze machte eine vergessene Seite aus zehn Sekunden
// Aufmerksamkeit eine halbe Stunde.
const MAX_EVENT_MS = 120000;
const MAX_TOTAL_MS = 6 * 60 * 60 * 1000;
const MAX_EVENTS = 24;

const PENDING_KEY = "mnyra-l2-pending";
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

function str(value) {
  return { stringValue: String(value || "") };
}

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
    if (!record.target.startsWith(LANDING2_FIRESTORE_BASE)) return null;
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

export function startLanding2Tracking({ slug = "", restaurantId = "" } = {}) {
  const marks = [];
  document.querySelectorAll("[data-track]").forEach((node) => {
    const key = String(node.dataset.track || "").trim();
    const name = LANDING2_EVENTS[key];
    if (!name) return;
    marks.push({ name, node });
  });

  if (!marks.length || !slug || !restaurantId) return null;

  flushPending();

  const sessionId = newSessionId();
  const startedAt = new Date().toISOString();
  const target = `${LANDING2_FIRESTORE_BASE}/restaurants/${encodeURIComponent(restaurantId)}`
    + `/landing2Sessions/${encodeURIComponent(sessionId)}?key=${encodeURIComponent(LANDING2_API_KEY)}`;

  const events = Object.create(null);
  const open = new Map();
  let outcome = "";
  let dirty = false;
  let closed = false;

  const note = (name) => {
    if (!(name in events)) {
      events[name] = 0;
      dirty = true;
    }
  };

  const enter = (name) => {
    note(name);
    if (!open.has(name)) open.set(name, Date.now());
  };

  const leave = (name) => {
    const since = open.get(name);
    if (!since) return;
    open.delete(name);
    const spent = Math.min(Date.now() - since, MAX_EVENT_MS);
    if (spent > 0) {
      events[name] = Math.min((events[name] || 0) + spent, MAX_TOTAL_MS);
      dirty = true;
    }
  };

  const closeAll = () => {
    Array.from(open.keys()).forEach(leave);
  };

  /* ----------------------------------------------------------- Schicken */

  const buildBody = () => {
    const fields = {};
    let total = 0;
    Object.keys(events).forEach((key) => {
      if (Object.keys(fields).length >= MAX_EVENTS) return;
      const spent = Math.min(Math.max(0, events[key]), MAX_TOTAL_MS);
      fields[key] = int(spent);
      total += spent;
    });

    return JSON.stringify({
      fields: {
        slug: str(String(slug).slice(0, 120)),
        surface: str("landing2"),
        events: { mapValue: { fields } },
        outcome: str(outcome),
        totalMs: int(Math.min(total, MAX_TOTAL_MS)),
        eventCount: int(Object.keys(fields).length),
        startedAt: str(startedAt),
        updatedAt: str(new Date().toISOString())
      }
    });
  };

  let inFlight = false;
  let again = false;
  let retryIndex = 0;
  let retryTimer = 0;
  let changeTimer = 0;
  let lastSentAt = 0;

  const send = () => {
    if (closed || inFlight) {
      again = true;
      return;
    }
    inFlight = true;
    dirty = false;
    lastSentAt = Date.now();
    const body = buildBody();
    const record = { target, body, at: Date.now() };

    patch(target, body)
      .then((response) => {
        inFlight = false;
        if (response && response.ok) {
          retryIndex = 0;
          if (again || dirty) {
            again = false;
            send();
          }
          return;
        }
        // 400er heisst: Der Stand kommt auch beim naechsten Mal nicht durch.
        // Wiederholen lohnt nur bei einem Netz- oder Serverfehler.
        if (response && response.status >= 400 && response.status < 500) return;
        scheduleRetry(record);
      })
      .catch(() => {
        inFlight = false;
        scheduleRetry(record);
      });
  };

  function scheduleRetry(record) {
    if (closed || retryIndex >= RETRY_MS.length) {
      if (closed) rememberPending(record);
      return;
    }
    const wait = RETRY_MS[retryIndex];
    retryIndex += 1;
    window.clearTimeout(retryTimer);
    retryTimer = window.setTimeout(() => send(), wait);
  }

  const nudge = () => {
    if (!dirty || changeTimer) return;
    const wait = Math.max(0, CHANGE_FLUSH_MS - (Date.now() - lastSentAt));
    changeTimer = window.setTimeout(() => {
      changeTimer = 0;
      send();
    }, wait);
  };

  /* ------------------------------------------------------------- Sehen */

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const mark = marks.find((item) => item.node === entry.target);
        if (!mark) return;
        if (entry.isIntersecting) enter(mark.name);
        else leave(mark.name);
      });
      nudge();
    }, { threshold: 0.35 });
    marks.forEach((mark) => observer.observe(mark.node));
  } else {
    marks.forEach((mark) => note(mark.name));
  }

  // Der erste Aufruf zaehlt, auch wenn niemand scrollt.
  enter(LANDING2_EVENTS.hyrje);
  send();

  // Der regelmaessige Stand, damit auch eine Sitzung ohne jede Bewegung
  // vollstaendig ist: abrechnen, schicken, und was gerade zu sehen ist,
  // laeuft danach weiter.
  const reopenVisible = () => {
    const height = window.innerHeight || 0;
    marks.forEach((mark) => {
      const rect = mark.node.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < height) enter(mark.name);
    });
  };

  const timer = window.setInterval(() => {
    closeAll();
    send();
    reopenVisible();
  }, FLUSH_EVERY_MS);

  const finish = () => {
    if (closed) return;
    closed = true;
    window.clearInterval(timer);
    window.clearTimeout(changeTimer);
    window.clearTimeout(retryTimer);
    closeAll();
    const body = buildBody();
    rememberPending({ target, body, at: Date.now() });
    patch(target, body)
      .then((response) => {
        if (response && response.ok) forgetPending();
      })
      .catch(() => {});
  };

  window.addEventListener("pagehide", finish);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      closeAll();
      send();
    }
  });

  return {
    claim() {
      outcome = "claim";
      note(LANDING2_CLAIM_EVENT);
      events[LANDING2_CLAIM_EVENT] = Math.max(1, events[LANDING2_CLAIM_EVENT] || 0);
      dirty = true;
      send();
    }
  };
}
