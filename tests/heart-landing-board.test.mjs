import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import {
  applyLandingResets,
  groupLandings,
  renderHeartLandingView
} from "../apps/mnyra-heart/heart-landing-render.js";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");

// Die Arbeitslisten neben der Auswertung: Next (noch zu verschicken), Waiting
// (Link ist raus, wir warten) und das Zuruecksetzen einer Auswertung.
//
// Zuruecksetzen loescht nichts - es merkt sich den Zeitpunkt, ab dem gezaehlt
// wird. Diese Tests halten fest, dass alles davor verschwindet, alles danach
// wieder zaehlt, und dass das Lokal dabei nicht aus der Liste faellt.

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

const RESET = {
  restaurantId: "lokal-1",
  name: "Bro Pizza",
  city: "Prishtine",
  publicSlug: "bro-pizza",
  at: "2026-08-02T00:00:00.000Z"
};

/* ------------------------------------------------------------ Zuruecksetzen */

test("was vor dem Zuruecksetzen liegt, zaehlt nicht mehr", () => {
  const uebrig = applyLandingResets([
    session({ id: "alt" }),
    session({ id: "neu", startedAt: "2026-08-03T09:00:00.000Z" })
  ], [RESET]);

  assert.deepEqual(uebrig.map((eintrag) => eintrag.id), ["neu"]);
});

test("das Zuruecksetzen gilt nur fuer sein eigenes Lokal", () => {
  const uebrig = applyLandingResets([
    session({ id: "a", restaurantId: "lokal-1" }),
    session({ id: "b", restaurantId: "lokal-2" })
  ], [RESET]);

  assert.deepEqual(uebrig.map((eintrag) => eintrag.id), ["b"]);
});

test("eine Sitzung, die vor dem Knopfdruck begann, gehoert zum alten Stand", () => {
  // Sie hat waehrenddessen noch gemeldet - der Beginn entscheidet, sonst
  // ueberlebte ein offener Aufruf jedes Zuruecksetzen.
  const uebrig = applyLandingResets([
    session({ id: "offen", startedAt: "2026-08-01T23:59:00.000Z", updatedAt: "2026-08-02T00:05:00.000Z" })
  ], [RESET]);

  assert.equal(uebrig.length, 0);
});

test("zweimal zurueckgesetzt: der spaetere Zeitpunkt gilt", () => {
  const uebrig = applyLandingResets([
    session({ id: "dazwischen", startedAt: "2026-08-03T10:00:00.000Z" }),
    session({ id: "danach", startedAt: "2026-08-05T10:00:00.000Z" })
  ], [RESET, { ...RESET, at: "2026-08-04T00:00:00.000Z" }]);

  assert.deepEqual(uebrig.map((eintrag) => eintrag.id), ["danach"]);
});

test("ohne Zuruecksetzen bleibt jede Sitzung stehen", () => {
  const alle = [session(), session({ id: "b" })];
  assert.equal(applyLandingResets(alle, []).length, 2);
  assert.equal(applyLandingResets(alle).length, 2);
});

test("ein zurueckgesetztes Lokal bleibt in der Liste - bei null", () => {
  const gruppen = groupLandings([], [RESET]);
  assert.equal(gruppen.length, 1);
  assert.equal(gruppen[0].restaurantId, "lokal-1");
  assert.equal(gruppen[0].name, "Bro Pizza");
  assert.equal(gruppen[0].total, 0);
  assert.equal(gruppen[0].answered, 0);
  assert.equal(gruppen[0].yes, 0);
});

test("kommt ein neuer Aufruf, steht das Lokal nur einmal da", () => {
  const gruppen = groupLandings([session({ startedAt: "2026-08-03T09:00:00.000Z" })], [RESET]);
  assert.equal(gruppen.length, 1);
  assert.equal(gruppen[0].total, 1);
});

/* -------------------------------------------------------------- Die Reiter */

function view(over = {}) {
  return renderHeartLandingView({
    status: "ready",
    sessions: [],
    archived: [],
    next: [],
    waiting: [],
    resets: [],
    tab: "active",
    ...over
  }, {});
}

test("es gibt vier Reiter, Waiting zwischen Next und Archiviert", () => {
  const html = view();
  const reiter = Array.from(html.matchAll(/data-landing-tab="([a-z]+)"/g)).map((treffer) => treffer[1]);
  assert.deepEqual(reiter, ["active", "next", "waiting", "archived"]);
});

test("unter Next fuehrt ein Knopf nach Waiting", () => {
  const html = view({
    tab: "next",
    next: [{ restaurantId: "lokal-1", name: "Bro Pizza", city: "Prishtine", publicSlug: "bro-pizza" }]
  });

  assert.match(html, /data-action="move-landing-waiting"/);
  // Der Knopf traegt das Lokal bei sich: Beim Verschieben gibt es keine
  // Sitzung, aus der sich Name und Bild ableiten liessen.
  assert.match(html, /data-landing-name="Bro Pizza"/);
  assert.match(html, /<span>W<\/span>/);
});

test("was auf Waiting liegt, steht nicht mehr unter Next", () => {
  const eintrag = { restaurantId: "lokal-1", name: "Bro Pizza" };
  const html = view({ tab: "next", next: [eintrag], waiting: [eintrag] });
  assert.ok(!html.includes("move-landing-waiting"), "das Lokal steht in beiden Listen");
});

test("unter Waiting stehen die Karten mit dem Weg zurueck", () => {
  const html = view({
    tab: "waiting",
    waiting: [{ restaurantId: "lokal-1", name: "Bro Pizza", publicSlug: "bro-pizza" }]
  });

  assert.match(html, /Bro Pizza/);
  assert.match(html, /data-action="move-landing-next"/);
  assert.match(html, /data-action="remove-landing-waiting"/);
  assert.match(html, /data-action="copy-lead-pitch-link"/);
});

test("ein geoeffnetes Lokal verschwindet nicht von der Waiting-Liste", () => {
  // Dass jemand die Landing geoeffnet hat, ist die gute Nachricht, auf die man
  // wartet - kein Grund, den Eintrag von selbst wegzuraeumen. Weg kommt er
  // durch den N-Knopf oder das Kreuz, nicht durch einen Aufruf.
  const html = view({
    tab: "waiting",
    sessions: [session()],
    waiting: [{ restaurantId: "lokal-1", name: "Bro Pizza" }]
  });
  assert.match(html, /Bro Pizza/);
});

test("die leere Waiting-Liste sagt, wie etwas hierher kommt", () => {
  assert.match(view({ tab: "waiting" }), /W-Knopf/);
});

/* ------------------------------------------------- Der Knopf in der Auswertung */

test("jede geoeffnete Auswertung hat den Knopf zum Zuruecksetzen", () => {
  for (const tab of ["active", "archived"]) {
    const html = renderHeartLandingView({
      status: "ready",
      sessions: [session()],
      archived: tab === "archived" ? ["lokal-1"] : [],
      tab,
      selectedId: "lokal-1"
    }, {});

    assert.match(html, /data-action="reset-landing"/, `im Reiter ${tab} fehlt der Knopf`);
    assert.match(html, /data-landing-total="1"/, `im Reiter ${tab} fehlt die Zahl fuer die Rueckfrage`);
    // Archivieren bleibt daneben stehen - der eine Knopf ersetzt den anderen nicht.
    assert.match(html, /data-action="toggle-landing-archive"/);
  }
});

test("der Knopf traegt das Lokal bei sich - danach gibt es keine Sitzung mehr", () => {
  const html = renderHeartLandingView({
    status: "ready",
    sessions: [session()],
    tab: "active",
    selectedId: "lokal-1"
  }, {});

  assert.match(html, /data-action="reset-landing"[\s\S]*?data-landing-name="Bro Pizza"/);
  assert.match(html, /data-action="reset-landing"[\s\S]*?data-landing-slug="bro-pizza"/);
});

/* ------------------------------------------------------------ Die Verdrahtung */

// Ein Knopf, den niemand annimmt, sieht aus wie ein Knopf und tut nichts. Genau
// das faellt beim Lesen nicht auf: Der Name steht in drei Dateien, und wenn
// eine davon ihn anders schreibt, passiert beim Tippen einfach nichts.
test("jeder Knopf der Landing-Ansicht wird auch angenommen", () => {
  const html = [
    view({ tab: "active", sessions: [session()] }),
    view({ tab: "next", next: [{ restaurantId: "lokal-3", name: "Dada" }] }),
    view({ tab: "waiting", waiting: [{ restaurantId: "lokal-4", name: "Senses" }] }),
    renderHeartLandingView({ status: "ready", sessions: [session()], tab: "active", selectedId: "lokal-1" }, {})
  ].join("");

  const aktionen = Array.from(new Set(
    Array.from(html.matchAll(/data-action="([a-z-]+)"/g)).map((treffer) => treffer[1])
  ));
  assert.ok(aktionen.length >= 6, `nur ${aktionen.length} Aktionen gefunden - der Test greift ins Leere`);

  const events = fs.readFileSync(path.join(ROOT, "apps/mnyra-heart/heart-events.js"), "utf8");
  aktionen.forEach((aktion) => {
    assert.ok(
      events.includes(`"${aktion}"`),
      `"${aktion}" steht in der Ansicht, wird in heart-events.js aber nicht angenommen`
    );
  });
});

test("jede Landing-Aktion ruft einen Griff, den es in heart.js gibt", () => {
  const events = fs.readFileSync(path.join(ROOT, "apps/mnyra-heart/heart-events.js"), "utf8");
  const heart = fs.readFileSync(path.join(ROOT, "apps/mnyra-heart/heart.js"), "utf8");

  const landingGriffe = Array.from(new Set(
    Array.from(events.matchAll(/operations\.([A-Za-z0-9_]*[Ll]anding[A-Za-z0-9_]*)\?\./g))
      .map((treffer) => treffer[1])
  ));
  assert.ok(landingGriffe.length >= 6, `nur ${landingGriffe.length} Griffe gefunden - der Test greift ins Leere`);

  landingGriffe.forEach((griff) => {
    assert.match(
      heart,
      new RegExp(`\\b(async\\s+)?${griff}\\s*\\(`),
      `heart-events.js ruft operations.${griff}, in heart.js gibt es das nicht`
    );
  });
});

/* --------------------------------------------------- Von Aktiv nach Waiting */

test("unter Aktiv fuehrt derselbe W-Knopf nach Waiting", () => {
  const html = view({ tab: "active", sessions: [session()] });

  assert.match(html, /data-action="move-landing-waiting"/);
  assert.match(html, /data-action="move-landing-waiting"[\s\S]*?data-landing-name="Bro Pizza"/);
  assert.match(html, /data-action="move-landing-waiting"[\s\S]*?data-landing-slug="bro-pizza"/);
});

test("der W-Knopf steht neben der Karte, nicht in ihr", () => {
  // Ein Knopf im Knopf ist ungueltiges Markup, und auf dem Handy trifft man
  // beim Zielen regelmaessig den falschen von beiden. Deshalb liegt er in
  // derselben Zeile und wird nur darueber gelegt.
  const html = view({ tab: "active", sessions: [session()] });
  const karte = html.slice(html.indexOf('data-action="open-landing"'));
  const endeDerKarte = karte.indexOf("</button>");
  assert.ok(
    karte.indexOf("move-landing-waiting") > endeDerKarte,
    "der W-Knopf steckt im Kartenknopf"
  );
});

test("was auf Waiting liegt, steht nicht mehr unter Aktiv", () => {
  // Verschieben heisst verschieben: Ein Lokal steht immer nur in einer Liste,
  // sonst arbeitet man dieselbe Sache zweimal ab.
  const html = view({
    tab: "active",
    sessions: [session()],
    waiting: [{ restaurantId: "lokal-1", name: "Bro Pizza" }]
  });
  assert.ok(!html.includes("Bro Pizza"), "das Lokal steht noch unter Aktiv");
  // Und der Reiter zaehlt es auch nicht mehr mit.
  assert.match(html, /data-landing-tab="active"[\s\S]*?<span class="heart-landing-tab__count">0<\/span>/);
});

test("nimmt man es von Waiting herunter, ist es wieder unter Aktiv", () => {
  const html = view({ tab: "active", sessions: [session()], waiting: [] });
  assert.match(html, /Bro Pizza/);
  assert.match(html, /Besucht/);
});

test("die Waiting-Karte traegt die Zahlen mit und fuehrt in die Auswertung", () => {
  // Sonst waeren die Zahlen eines wartenden Lokals von nirgendwo mehr zu
  // erreichen - es steht ja unter Aktiv nicht mehr.
  const html = view({
    tab: "waiting",
    sessions: [session({ answers: { q1: "po", q2: "", q3: "" }, outcome: "yes" })],
    waiting: [{ restaurantId: "lokal-1", name: "Bro Pizza" }]
  });

  assert.match(html, /Besucht/);
  assert.match(html, /data-action="open-landing"[\s\S]*?data-landing-id="lokal-1"/);
});

test("ohne einen einzigen Aufruf traegt die Waiting-Karte keine Zahlen", () => {
  const html = view({ tab: "waiting", waiting: [{ restaurantId: "lokal-1", name: "Bro Pizza" }] });
  assert.ok(!html.includes("Besucht"), "da stehen Zahlen, die es nicht gibt");
});

test("aus Waiting heraus laesst sich die Auswertung oeffnen", () => {
  const html = view({
    tab: "waiting",
    sessions: [session()],
    waiting: [{ restaurantId: "lokal-1", name: "Bro Pizza" }],
    selectedId: "lokal-1"
  });

  assert.match(html, /Sa larg kane ardhur/);
  assert.match(html, /data-action="reset-landing"/);
});

test("im Archiv gibt es den W-Knopf nicht", () => {
  // Was abgelegt ist, wartet nicht mehr - dort ist Zurueckholen der Griff,
  // der Sinn ergibt.
  const html = view({ tab: "archived", sessions: [session()], archived: ["lokal-1"] });
  assert.match(html, /Bro Pizza/);
  assert.ok(!html.includes("move-landing-waiting"), "im Archiv steht der W-Knopf");
});
