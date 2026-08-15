import assert from "node:assert/strict";
import test from "node:test";

import { createAnalyticsViewController } from "../apps/menyra-social/core/analytics/analytics-view-controller.js";

// ===========================================================================
// Die Analitika hatte kein Gedaechtnis: jedes Oeffnen wartete auf zwei
// Abfragen, auch wenn dieselbe Frage schon einmal beantwortet war. Genau das
// war das lange Laden. Jetzt steht der letzte Stand sofort da und frischt sich
// still auf - dasselbe Vorgehen, das das Panel schon nutzt.
// ===========================================================================

function createStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value))
  };
}

// Jeder Aufruf liefert einen Tag mit einer Zahl - genug fuer ein Modell.
function createHarness({ storage = createStorage(), fail = false } = {}) {
  let queries = 0;
  let renders = 0;
  const state = {
    userProfile: { restaurantId: "r1" },
    user: { uid: "u1" },
    activeTab: "analytics"
  };
  const controller = createAnalyticsViewController({
    state,
    documentObj: null,
    storageObj: storage,
    renderFn: () => { renders += 1; },
    firestoreApi: {
      db: {},
      collectionFn: () => ({}),
      queryFn: () => ({}),
      whereFn: () => ({}),
      documentIdFn: () => ({}),
      getDocsFn: async () => {
        queries += 1;
        if (fail) throw new Error("offline");
        return { docs: [] };
      }
    }
  });
  return { controller, state, storage, queries: () => queries, renders: () => renders };
}

test("the first open asks the network and remembers the answer", async () => {
  const h = createHarness();
  await h.controller.loadAnalytics({ force: false });
  assert.equal(h.state.analyticsView.status, "ready");
  // Zwei Abfragen: der Zeitraum und der davor, fuer den Vergleich.
  assert.equal(h.queries(), 2);
  const stored = JSON.parse(h.storage.getItem("menyra_social_analytics_cache_v1::r1"));
  assert.equal(stored.entries.length, 1);
  assert.ok(stored.entries[0].signature.startsWith("r1::"));
  assert.ok(stored.entries[0].model);
});

test("a fresh session shows the remembered stand at once, then refreshes", async () => {
  const first = createHarness();
  await first.controller.loadAnalytics({ force: false });

  // Neue Sitzung, derselbe Speicher: der Zustand faengt bei null an.
  const second = createHarness({ storage: first.storage });
  const laden = second.controller.loadAnalytics({ force: false });
  // Noch bevor die Antwort da ist, steht der Stand schon und ist gezeichnet -
  // genau das ist der Gewinn. Kein Umriss, kein Warten.
  assert.equal(second.state.analyticsView.status, "ready");
  assert.ok(second.state.analyticsView.model);
  assert.equal(second.renders(), 1, "der gespeicherte Stand wird sofort gezeichnet");
  await laden;
  // Danach ist trotzdem gefragt worden: der Stand frischt sich still auf.
  assert.equal(second.queries(), 2);
  assert.equal(second.state.analyticsView.status, "ready");
  assert.equal(second.renders(), 2, "und einmal mehr, als die frischen Zahlen da sind");
});

test("a failed refresh keeps the remembered stand instead of an error", async () => {
  const ok = createHarness();
  await ok.controller.loadAnalytics({ force: false });

  const broken = createHarness({ storage: ok.storage, fail: true });
  await broken.controller.loadAnalytics({ force: false });
  assert.equal(broken.state.analyticsView.status, "ready", "gueltige Zahlen schlagen eine Fehlermeldung");
  assert.ok(broken.state.analyticsView.model);
});

test("without anything remembered a failure is an error", async () => {
  const h = createHarness({ fail: true });
  await h.controller.loadAnalytics({ force: false });
  assert.equal(h.state.analyticsView.status, "error");
});

test("the store keeps a few periods but never grows without end", async () => {
  const storage = createStorage();
  const h = createHarness({ storage });
  const gefragt = [];
  // Vier verschiedene Zeitraeume nacheinander - der Deckel liegt bei drei.
  for (const rangeKey of ["today", "7d", "30d", "90d"]) {
    h.controller.setRange(rangeKey);
    await h.controller.loadAnalytics({ force: true });
    gefragt.push(h.state.analyticsView.loadedRangeSignature);
  }
  assert.equal(new Set(gefragt).size, 4, "vier verschiedene Fragen");
  const stored = JSON.parse(storage.getItem("menyra_social_analytics_cache_v1::r1"));
  assert.equal(stored.entries.length, 3, "hoechstens drei bleiben liegen");
  // Der neueste steht vorne, der aelteste ist herausgefallen.
  assert.equal(stored.entries[0].signature, gefragt[3]);
  assert.equal(stored.entries.some((entry) => entry.signature === gefragt[0]), false);
});

test("the silent warm-up does not repaint the app", async () => {
  const h = createHarness();
  await h.controller.loadAnalytics({ force: false, silent: true });
  assert.equal(h.state.analyticsView.status, "ready");
  // Genau ein Zeichnen: der Abschluss. Kein Umriss dazwischen - sonst haette
  // das Vorwaermen die Seite unter dem Nutzer neu aufgebaut.
  assert.equal(h.renders(), 1);
});

test("a broken or foreign store never breaks the view", async () => {
  const kaputt = createStorage({ "menyra_social_analytics_cache_v1::r1": "{kein json" });
  const h = createHarness({ storage: kaputt });
  await h.controller.loadAnalytics({ force: false });
  assert.equal(h.state.analyticsView.status, "ready");

  const fremd = createStorage({ "menyra_social_analytics_cache_v1::r1": JSON.stringify({ entries: [{ signature: "r1::1900-01-01::1900-01-07", model: {} }] }) });
  const h2 = createHarness({ storage: fremd });
  await h2.controller.loadAnalytics({ force: false });
  // Die fremde Signatur passt nicht - es wird geladen, nicht falsch angezeigt.
  assert.equal(h2.queries(), 2);
});
