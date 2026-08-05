import test from "node:test";
import assert from "node:assert/strict";

import {
  buildHeartNewsFeedCore,
  formatHeartNewsTimeCore,
  getHeartDisplayNameCore,
  getHeartFirstNameCore,
  nextHourDelayMsCore,
  pickHeartMotivationCore,
  toMillisCore
} from "../apps/mnyra-heart/heart-start-core.js";

const HOUR = 3600000;
const DAY = 86400000;
const NOW = Date.parse("2026-08-05T17:30:00.000Z");

test("der Spruch bleibt innerhalb einer Stunde derselbe", () => {
  const first = pickHeartMotivationCore({ name: "Albert", now: NOW });
  const later = pickHeartMotivationCore({ name: "Albert", now: NOW + 29 * 60000 });
  assert.equal(first.text, later.text);
  assert.equal(first.hourIndex, later.hourIndex);
});

test("zur naechsten Stunde kommt ein anderer Spruch", () => {
  const jetzt = pickHeartMotivationCore({ name: "Albert", now: NOW });
  const spaeter = pickHeartMotivationCore({ name: "Albert", now: NOW + HOUR });
  assert.notEqual(jetzt.hourIndex, spaeter.hourIndex);
  assert.notEqual(jetzt.text, spaeter.text);
});

test("der Name steht im Spruch, und ohne Namen bleibt ein ganzer Satz stehen", () => {
  // Ueber einen vollen Umlauf pruefen: Jede Vorlage muss beide Faelle koennen.
  for (let step = 0; step < 24; step += 1) {
    const now = NOW + step * HOUR;
    const mitName = pickHeartMotivationCore({ name: "Albert", now }).text;
    assert.ok(mitName.includes("Albert"), `Stunde ${step} nennt den Namen nicht: ${mitName}`);
    assert.ok(!mitName.includes("{name}"), `Stunde ${step} zeigt die Vorlage: ${mitName}`);

    const ohneName = pickHeartMotivationCore({ name: "", now }).text;
    assert.ok(!ohneName.includes("{name}"), `Stunde ${step} zeigt die Vorlage ohne Namen: ${ohneName}`);
    assert.ok(!ohneName.startsWith(","), `Stunde ${step} beginnt mit einem Komma: ${ohneName}`);
    assert.equal(ohneName[0], ohneName[0].toUpperCase(), `Stunde ${step} beginnt klein: ${ohneName}`);
  }
});

test("der naechste Wechsel liegt genau auf der vollen Stunde", () => {
  assert.equal(nextHourDelayMsCore(Date.parse("2026-08-05T17:30:00.000Z")), 30 * 60000);
  // Genau auf der Stunde wird nicht sofort wieder gefeuert.
  assert.equal(nextHourDelayMsCore(Date.parse("2026-08-05T17:00:00.000Z")), HOUR);
});

test("der Name kommt aus dem Profil, sonst aus der Mailadresse", () => {
  assert.equal(getHeartDisplayNameCore({ name: "Albert Hoti" }, null), "Albert Hoti");
  assert.equal(getHeartFirstNameCore({ name: "Albert Hoti" }, null), "Albert");
  assert.equal(getHeartFirstNameCore({ firstName: "Albert", lastName: "Hoti" }, null), "Albert");
  assert.equal(getHeartDisplayNameCore(null, { email: "albert.hoti@menyra.com" }), "Albert hoti");
  assert.equal(getHeartDisplayNameCore(null, null), "");
  assert.equal(getHeartFirstNameCore(null, null), "");
});

test("Zeitstempel kommen in jeder Form an, die Firestore liefert", () => {
  assert.equal(toMillisCore("2026-08-05T17:00:00.000Z"), Date.parse("2026-08-05T17:00:00.000Z"));
  assert.equal(toMillisCore(new Date(NOW)), NOW);
  assert.equal(toMillisCore({ seconds: 1700000000 }), 1700000000000);
  assert.equal(toMillisCore({ _seconds: 1700000000 }), 1700000000000);
  assert.equal(toMillisCore({ toDate: () => new Date(NOW) }), NOW);
  assert.equal(toMillisCore("kein Datum"), 0);
  assert.equal(toMillisCore(null), 0);
});

function session(restaurantId, name, isoTime, extra = {}) {
  return {
    restaurantId,
    name,
    city: "Tirana",
    updatedAt: isoTime,
    startedAt: isoTime,
    steps: {},
    answers: { q1: "", q2: "", q3: "" },
    ...extra
  };
}

test("Landing-Sitzungen werden je Lokal und Tag zusammengefasst", () => {
  const feed = buildHeartNewsFeedCore({
    landingSessions: [
      session("r1", "Cafe Eins", "2026-08-05T10:00:00.000Z"),
      session("r1", "Cafe Eins", "2026-08-05T12:00:00.000Z", { answers: { q1: "po" }, outcome: "yes" }),
      session("r2", "Bar Zwei", "2026-08-04T09:00:00.000Z")
    ],
    now: NOW
  });

  assert.equal(feed.length, 2);
  const [neuestes, aelter] = feed;
  assert.equal(neuestes.title, "Cafe Eins");
  assert.equal(neuestes.detail, "2 Aufrufe · 1 Antwort · 1 mal Ja");
  assert.equal(neuestes.highlight, true);
  assert.equal(neuestes.viewKey, "landing");
  assert.equal(neuestes.landingId, "r1");
  assert.equal(aelter.title, "Bar Zwei");
  assert.equal(aelter.detail, "1 Aufruf");
  assert.equal(aelter.highlight, false);
});

test("abgelegte Lokale tauchen unter Neues nicht mehr auf", () => {
  const feed = buildHeartNewsFeedCore({
    landingSessions: [session("r1", "Cafe Eins", "2026-08-05T10:00:00.000Z")],
    archivedLandingIds: ["r1"],
    now: NOW
  });
  assert.deepEqual(feed, []);
});

test("Leads und Kunden stehen mit den Landings in einer Liste, das Neueste oben", () => {
  const feed = buildHeartNewsFeedCore({
    landingSessions: [session("r1", "Cafe Eins", "2026-08-03T10:00:00.000Z")],
    leads: [{ id: "l1", businessName: "Bistro Drei", city: "Prizren", createdAt: "2026-08-05T16:00:00.000Z" }],
    customers: [{ id: "c1", businessName: "Hotel Vier", createdAt: "2026-08-04T16:00:00.000Z" }],
    now: NOW
  });

  assert.deepEqual(feed.map((entry) => entry.title), ["Bistro Drei", "Hotel Vier", "Cafe Eins"]);
  assert.deepEqual(feed.map((entry) => entry.kind), ["lead", "customer", "landing"]);
  assert.equal(feed[0].viewKey, "crmLeads");
  assert.equal(feed[0].detail, "Neuer Lead");
  assert.equal(feed[0].note, "Prizren");
  assert.equal(feed[1].viewKey, "crmCustomers");
});

test("was zu alt ist oder keinen Zeitstempel hat, faellt heraus", () => {
  const feed = buildHeartNewsFeedCore({
    landingSessions: [
      session("r1", "Cafe Eins", "2026-08-05T10:00:00.000Z"),
      session("r2", "Bar Alt", new Date(NOW - 90 * DAY).toISOString())
    ],
    leads: [
      { id: "l1", businessName: "Ohne Datum" },
      { id: "l2", createdAt: "2026-08-05T10:00:00.000Z" }
    ],
    now: NOW
  });
  assert.deepEqual(feed.map((entry) => entry.title), ["Cafe Eins"]);
});

test("die Liste bleibt kurz genug, um sie zu lesen", () => {
  const sessions = Array.from({ length: 40 }, (_, index) => (
    session(`r${index}`, `Lokal ${index}`, new Date(NOW - index * HOUR).toISOString())
  ));
  assert.equal(buildHeartNewsFeedCore({ landingSessions: sessions, now: NOW }).length, 12);
  assert.equal(buildHeartNewsFeedCore({ landingSessions: sessions, now: NOW, limit: 5 }).length, 5);
});

test("die Zeitangabe sagt den Tag, wo die Stundenzahl nur verwirrt", () => {
  assert.equal(formatHeartNewsTimeCore(NOW - 30000, NOW), "gerade");
  assert.equal(formatHeartNewsTimeCore(NOW - 5 * 60000, NOW), "vor 5 Min");
  assert.equal(formatHeartNewsTimeCore(NOW - 3 * HOUR, NOW), "vor 3 Std");
  assert.equal(formatHeartNewsTimeCore(Date.parse("2026-08-04T20:00:00.000Z"), NOW), "gestern");
  assert.equal(formatHeartNewsTimeCore(Date.parse("2026-08-02T20:00:00.000Z"), NOW), "vor 3 Tagen");
  assert.equal(formatHeartNewsTimeCore(0, NOW), "");
});
