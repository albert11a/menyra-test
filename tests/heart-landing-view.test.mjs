import test from "node:test";
import assert from "node:assert/strict";

import { groupLandings, renderHeartLandingView } from "../apps/mnyra-heart/heart-landing-render.js";

// Die Auswertung soll drei Fragen beantworten: Wie viele haben geoeffnet, wo
// springen sie ab, und was haben sie geantwortet. Diese Tests halten fest,
// dass sie das aus den Rohdaten auch wirklich herausrechnet.

function session(over = {}) {
  return {
    id: "s1",
    restaurantId: "lokal-1",
    slug: "bro-pizza",
    name: "Bro Pizza",
    city: "Prishtine",
    publicSlug: "bro-pizza",
    steps: { hyrje: 1000 },
    answers: { q1: "", q2: "", q3: "" },
    outcome: "",
    totalMs: 1000,
    startedAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:10.000Z",
    ...over
  };
}

test("Sitzungen werden je Lokal zusammengefasst", () => {
  const gruppen = groupLandings([
    session({ id: "a", restaurantId: "lokal-1", outcome: "yes", answers: { q1: "po", q2: "po", q3: "" } }),
    session({ id: "b", restaurantId: "lokal-1", outcome: "no", answers: { q1: "jo", q2: "jo", q3: "jo" } }),
    session({ id: "c", restaurantId: "lokal-2", name: "Moa", updatedAt: "2026-08-02T10:00:00.000Z" })
  ]);

  assert.equal(gruppen.length, 2);
  // Das zuletzt angefasste Lokal steht oben - danach sucht man zuerst.
  assert.equal(gruppen[0].restaurantId, "lokal-2");

  const eins = gruppen.find((entry) => entry.restaurantId === "lokal-1");
  assert.equal(eins.total, 2);
  assert.equal(eins.answered, 2);
  assert.equal(eins.yes, 1);
  assert.equal(eins.finished, 2);
});

test("wer gar nicht geantwortet hat, zaehlt nicht als Antwort", () => {
  const [gruppe] = groupLandings([session(), session({ id: "b" })]);
  assert.equal(gruppe.total, 2);
  assert.equal(gruppe.answered, 0);
  assert.equal(gruppe.yes, 0);
});

test("die Auswertung zeigt, wo abgesprungen wird", () => {
  const html = renderHeartLandingView({
    status: "ready",
    selectedId: "lokal-1",
    sessions: [
      session({ id: "a", steps: { hyrje: 1000, "profil-0": 2000, cmimi: 500 } }),
      session({ id: "b", steps: { hyrje: 1000, "profil-0": 4000 } }),
      session({ id: "c", steps: { hyrje: 1000 } })
    ]
  });

  // Drei von drei haben den Anfang gesehen, zwei den zweiten Wisch, einer den
  // Preis - der Balken muss das abbilden.
  assert.match(html, /width:100%/, "der erste Wisch steht nicht bei 100%");
  assert.match(html, /width:67%/, "der zweite Wisch steht nicht bei 67%");
  assert.match(html, /width:33%/, "der Preis steht nicht bei 33%");
  // Und die Verweildauer wird gemittelt, nicht summiert: (2000+4000)/2 = 3s.
  assert.match(html, /2 &middot; 3s/, "die mittlere Dauer stimmt nicht");
});

test("die Antworten werden gezaehlt", () => {
  const html = renderHeartLandingView({
    status: "ready",
    selectedId: "lokal-1",
    sessions: [
      session({ id: "a", answers: { q1: "po", q2: "po", q3: "" } }),
      session({ id: "b", answers: { q1: "po", q2: "jo", q3: "po" } }),
      session({ id: "c", answers: { q1: "jo", q2: "jo", q3: "jo" } })
    ]
  });
  assert.match(html, /2 po[\s\S]*?1 jo/, "die erste Frage wurde falsch gezaehlt");
});

test("abgelegte Landings verschwinden aus Aktiv und stehen im Archiv", () => {
  const daten = {
    status: "ready",
    archived: ["lokal-2"],
    sessions: [
      session({ id: "a", restaurantId: "lokal-1", name: "Bro Pizza" }),
      session({ id: "b", restaurantId: "lokal-2", name: "Moa" })
    ]
  };

  const aktiv = renderHeartLandingView({ ...daten, tab: "active" });
  assert.match(aktiv, /Bro Pizza/);
  assert.ok(!aktiv.includes("Moa"), "das Abgelegte steht noch unter Aktiv");

  const archiv = renderHeartLandingView({ ...daten, tab: "archived" });
  assert.match(archiv, /Moa/);
  assert.ok(!archiv.includes("Bro Pizza"), "das Aktive steht im Archiv");
  assert.match(archiv, /Zurueckholen/, "aus dem Archiv fuehrt kein Weg zurueck");
});

test("die Reiter zeigen, wie viel in jedem liegt", () => {
  const html = renderHeartLandingView({
    status: "ready",
    tab: "active",
    archived: ["lokal-2"],
    sessions: [
      session({ id: "a", restaurantId: "lokal-1" }),
      session({ id: "b", restaurantId: "lokal-2" }),
      session({ id: "c", restaurantId: "lokal-3" })
    ]
  });
  assert.match(html, /Aktiv <span class="heart-landing-tab__count">2<\/span>/);
  assert.match(html, /Archiviert <span class="heart-landing-tab__count">1<\/span>/);
});

test("die Auswertung eines abgelegten Lokals oeffnet sich nicht im Aktiv-Reiter", () => {
  const html = renderHeartLandingView({
    status: "ready",
    tab: "active",
    archived: ["lokal-1"],
    selectedId: "lokal-1",
    sessions: [session({ id: "a", restaurantId: "lokal-1", name: "Bro Pizza" })]
  });
  // Statt der Auswertung kommt die Liste - und die ist hier leer.
  assert.ok(!html.includes("Sa larg kane ardhur"), "die Auswertung wurde trotzdem geoeffnet");
  assert.match(html, /Noch keine Aufrufe/);
});

test("im Archiv steht ein eigener Hinweis, wenn nichts abgelegt ist", () => {
  const html = renderHeartLandingView({ status: "ready", tab: "archived", sessions: [session()] });
  assert.match(html, /nichts abgelegt/);
});

test("ohne Aufrufe steht ein Hinweis statt einer leeren Seite", () => {
  const html = renderHeartLandingView({ status: "ready", sessions: [] });
  assert.match(html, /Noch keine Aufrufe/);
});

test("eine unvollstaendige Auswertung sagt, dass sie unvollstaendig ist", () => {
  // Die Abfrage liest hoechstens eine feste Zahl von Sitzungen und ist dabei
  // unsortiert. Ist die Grenze erreicht, fehlt ein beliebiger Teil - dann darf
  // hier keine Zahl stehen, die aussieht, als waere sie vollstaendig.
  const daten = {
    status: "ready",
    abgeschnitten: true,
    grenze: 1500,
    sessions: [session()]
  };

  const liste = renderHeartLandingView(daten);
  assert.match(liste, /1500/);
  assert.match(liste, /unvollst/i);

  // Auch in der Auswertung eines einzelnen Lokals - dort stehen die Zahlen,
  // auf die es ankommt.
  const detail = renderHeartLandingView({ ...daten, selectedId: "lokal-1" });
  assert.match(detail, /unvollst/i);
  assert.match(detail, /Sa larg kane ardhur/, "die Auswertung fehlt");
});

test("eine vollstaendige Auswertung warnt nicht ohne Grund", () => {
  const html = renderHeartLandingView({ status: "ready", sessions: [session()] });
  assert.ok(!html.includes("heart-landing-warn"), "gewarnt wird, obwohl nichts fehlt");
});

test("Ladefehler werden gezeigt, nicht verschluckt", () => {
  assert.match(renderHeartLandingView({ status: "loading" }), /werden geladen/);
  assert.match(renderHeartLandingView({ status: "error", error: "Kein Zugriff" }), /Kein Zugriff/);
});

test("ein Name mit Auszeichnung darin bricht die Ansicht nicht auf", () => {
  const html = renderHeartLandingView({
    status: "ready",
    sessions: [session({ name: '<script>alert(1)</script>' })]
  });
  assert.ok(!html.includes("<script>alert(1)"), "der Name kam unmaskiert durch");
});
