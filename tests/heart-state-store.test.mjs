import test from "node:test";
import assert from "node:assert/strict";

import {
  HEART_NAV_ITEMS,
  createHeartInitialState,
  createHeartStore
} from "../apps/mnyra-heart/heart-state.js";

// Der Zustand wird nicht mehr bei jeder Aenderung tief kopiert, sondern nur
// dort neu gebaut, wo etwas passiert ist. Das ist der Grund, warum Heart im
// Suchfeld nicht mehr haengt - und genau deshalb muss hier stehen, dass der
// vorige Zustand die Aenderung nicht mitbekommt: heart.js vergleicht vorher
// und nachher, um zu erkennen, wann eine Sitzung neu ist.

test("eine Aenderung laesst den vorigen Zustand unberuehrt", () => {
  const store = createHeartStore(createHeartInitialState());
  const before = store.getState();

  store.actions.setActiveView("landing");
  const after = store.getState();

  assert.equal(before.shell.activeView, "dashboard");
  assert.equal(after.shell.activeView, "landing");
  assert.notEqual(before.shell, after.shell);
  assert.notEqual(before, after);
});

test("grosse Datenmengen werden bei einer Aenderung nicht nachgebaut", () => {
  const store = createHeartStore(createHeartInitialState());
  store.actions.setLandingData({
    sessions: [{ restaurantId: "r1", updatedAt: "2026-08-05T10:00:00.000Z" }],
    archived: ["r2"]
  });
  const before = store.getState();

  store.actions.setActiveView("analytics");
  const after = store.getState();

  // Die Landing-Sitzungen koennen tausende Eintraege haben. Beim Wechseln der
  // Ansicht werden sie nicht angefasst, also muss es dieselbe Liste bleiben -
  // vorher wurde bei jeder Aenderung der ganze Zustand tief kopiert.
  assert.equal(before.landing.sessions, after.landing.sessions);
  assert.equal(before.landing.archived, after.landing.archived);
  assert.equal(before.crmAdmin.sections.leads, after.crmAdmin.sections.leads);
});

test("ein CRM-Abschnitt aendert nur sich selbst", () => {
  const store = createHeartStore(createHeartInitialState());
  store.actions.setCrmAdminData("leads", {
    rows: [{ id: "l1", businessName: "Cafe Eins" }],
    knownCount: 1,
    scope: "own"
  });
  const before = store.getState();

  store.actions.setCrmAdminSectionUi("leads", { query: "cafe" });
  const after = store.getState();

  assert.equal(before.crmAdmin.sections.leads.query, "");
  assert.equal(after.crmAdmin.sections.leads.query, "cafe");
  assert.notEqual(before.crmAdmin.sections.leads, after.crmAdmin.sections.leads);
  assert.equal(before.crmAdmin.sections.customers, after.crmAdmin.sections.customers);
  // Die Zeilen selbst werden beim Tippen nicht neu gebaut.
  assert.equal(before.crmAdmin.sections.leads.items, after.crmAdmin.sections.leads.items);
});

test("Firestore-Zeitstempel werden an der Grenze in Text verwandelt", () => {
  const store = createHeartStore(createHeartInitialState());
  const iso = "2026-08-05T17:00:00.000Z";
  store.actions.setCrmAdminData("leads", {
    rows: [{ id: "l1", createdAt: { toDate: () => new Date(iso) } }]
  });
  assert.equal(store.getState().crmAdmin.sections.leads.items[0].createdAt, iso);
});

test("der Editor-Entwurf ersetzt das Modal, statt es von innen zu aendern", () => {
  const store = createHeartStore(createHeartInitialState());
  store.actions.setModal({ kind: "crm-editor", crmDomain: "leads", itemId: "l1" });
  const before = store.getState();

  store.actions.setCrmEditorDraft({ businessName: "Cafe Eins" });
  const after = store.getState();

  assert.deepEqual(before.shell.modal.draft, {});
  assert.equal(after.shell.modal.draft.businessName, "Cafe Eins");
  assert.notEqual(before.shell.modal, after.shell.modal);
});

test("eine Aenderung ohne Wirkung meldet sich nicht", () => {
  const store = createHeartStore(createHeartInitialState());
  let calls = 0;
  store.subscribe(() => { calls += 1; });

  store.actions.setNavOpen(false);
  assert.equal(calls, 0, "der Zustand war schon so - dafuer muss nichts neu gezeichnet werden");

  store.actions.setNavOpen(true);
  assert.equal(calls, 1);
});

test("Laeufe, Meldungen und Bereiche sind aus der Navigation verschwunden", () => {
  const keys = HEART_NAV_ITEMS.map((item) => item.key);
  assert.deepEqual(keys, [
    "dashboard",
    "landing",
    "crmLeads",
    "crmCustomers",
    "crmAds",
    "crmStaff",
    "destinations",
    "mnyraGo",
    "lifeskin",
    "analytics",
    "connections"
  ]);

  const state = createHeartInitialState();
  assert.equal(state.runs, undefined);
  assert.equal(state.incidents, undefined);
  assert.equal(state.dashboard, undefined);

  // Mnyra GO bringt seine eigene Scheibe mit: Zeitraum und Zahlen liegen im
  // Zustand, damit ein Neuzeichnen sie nicht verliert.
  assert.equal(state.mnyraGo.status, "idle");
  assert.equal(state.mnyraGo.days, 30);
  assert.equal(state.mnyraGo.data, null);
});

test("der Speicherstand wird als solcher vermerkt, der Serverstand auch", () => {
  const store = createHeartStore(createHeartInitialState());
  store.actions.setLandingData({ sessions: [{ restaurantId: "r1" }], archived: [], fromCache: true });
  assert.equal(store.getState().landing.loadedFrom, "cache");
  assert.equal(store.getState().landing.status, "ready");

  store.actions.setLandingData({ sessions: [{ restaurantId: "r1" }], archived: [] });
  assert.equal(store.getState().landing.loadedFrom, "network");
});

// Eine leere Seite mit Fehlermeldung ist schlechter als gestrige Zahlen mit
// einem Hinweis daneben.
test("ein gescheiterter Abgleich raeumt vorhandene Landings nicht weg", () => {
  const store = createHeartStore(createHeartInitialState());
  store.actions.setLandingData({ sessions: [{ restaurantId: "r1" }], archived: [], fromCache: true });

  store.actions.setLandingError("Die Verbindung antwortet nicht.");
  const state = store.getState();
  assert.equal(state.landing.status, "ready", "die vorhandenen Zahlen wurden weggeraeumt");
  assert.equal(state.landing.sessions.length, 1);
  assert.equal(state.landing.error, "Die Verbindung antwortet nicht.");
});

test("ohne vorhandene Landings ist ein Fehler ein Fehler", () => {
  const store = createHeartStore(createHeartInitialState());
  store.actions.setLandingError("Kein Zugriff");
  assert.equal(store.getState().landing.status, "error");
  assert.equal(store.getState().landing.error, "Kein Zugriff");
});
