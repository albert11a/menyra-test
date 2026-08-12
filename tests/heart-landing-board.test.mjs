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

test("wer geoeffnet hat, steht nicht mehr unter Waiting", () => {
  // Waiting heisst "verschickt, noch nicht geoeffnet". Der erste Aufruf
  // erledigt dieses Vorhaben - ab da geht es um Zahlen, und die stehen unter
  // Aktiv.
  const html = view({
    tab: "waiting",
    sessions: [session()],
    waiting: [{ restaurantId: "lokal-1", name: "Bro Pizza" }]
  });
  assert.ok(!html.includes("Bro Pizza"), "das geoeffnete Lokal wartet noch");
  assert.match(html, /data-landing-tab="waiting"[\s\S]*?<span class="heart-landing-tab__count">0<\/span>/);
});

test("wer geoeffnet hat, steht dafuer unter Aktiv - egal, wo er vorher stand", () => {
  for (const von of ["next", "waiting"]) {
    const eintrag = { restaurantId: "lokal-1", name: "Bro Pizza" };
    const html = view({
      tab: "active",
      sessions: [session()],
      next: von === "next" ? [eintrag] : [],
      waiting: von === "waiting" ? [eintrag] : []
    });
    assert.match(html, /Bro Pizza/, `aus ${von} kam es nicht nach Aktiv`);
    assert.match(html, /Besucht/);
  }
});

test("im Archiv aendert ein Aufruf nichts", () => {
  // Weggelegt wird immer nach dem Ansehen, also immer mit Aufrufen. Wuerde die
  // Regel auch hier gelten, waere das Archiv bei jedem Laden leer.
  const html = view({ tab: "archived", sessions: [session()], archived: ["lokal-1"] });
  assert.match(html, /Bro Pizza/);
  assert.match(html, /data-landing-tab="active"[\s\S]*?<span class="heart-landing-tab__count">0<\/span>/);
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

test("ein wartendes Lokal ohne Aufruf steht nicht unter Aktiv", () => {
  // Verschieben heisst verschieben: Ein Lokal steht immer nur in einer Liste,
  // sonst arbeitet man dieselbe Sache zweimal ab. Nach einem Zuruecksetzen ist
  // es wieder ein Vorhaben - null Aufrufe, also wartet es weiter.
  const html = view({
    tab: "active",
    resets: [RESET],
    waiting: [{ restaurantId: "lokal-1", name: "Bro Pizza" }]
  });
  assert.ok(!html.includes("Bro Pizza"), "das Lokal steht noch unter Aktiv");
  assert.match(html, /data-landing-tab="active"[\s\S]*?<span class="heart-landing-tab__count">0<\/span>/);
  assert.match(html, /data-landing-tab="waiting"[\s\S]*?<span class="heart-landing-tab__count">1<\/span>/);
});

test("nimmt man es von Waiting herunter, ist es wieder unter Aktiv", () => {
  const html = view({ tab: "active", resets: [RESET], waiting: [] });
  assert.match(html, /Bro Pizza/);
  assert.match(html, /Besucht/);
});

test("eine Waiting-Karte traegt nie Zahlen - dort steht nur, was noch wartet", () => {
  const html = view({ tab: "waiting", waiting: [{ restaurantId: "lokal-1", name: "Bro Pizza" }] });
  assert.match(html, /Bro Pizza/);
  assert.ok(!html.includes("Besucht"), "da stehen Zahlen, die es nicht gibt");
});

test("im Archiv gibt es den W-Knopf nicht", () => {
  // Was abgelegt ist, wartet nicht mehr - dort ist Zurueckholen der Griff,
  // der Sinn ergibt.
  const html = view({ tab: "archived", sessions: [session()], archived: ["lokal-1"] });
  assert.match(html, /Bro Pizza/);
  assert.ok(!html.includes("move-landing-waiting"), "im Archiv steht der W-Knopf");
});

/* --------------------------------------- Waiting wartet auf den naechsten Aufruf */

test("ein Aufruf nach dem Verschieben holt das Lokal zurueck nach Aktiv", () => {
  const eintrag = {
    restaurantId: "lokal-1",
    name: "Bro Pizza",
    addedAt: "2026-08-01T09:00:00.000Z"
  };
  // Die Sitzung liegt nach dem Verschieben - genau darauf hat man gewartet.
  const html = view({ tab: "waiting", sessions: [session()], waiting: [eintrag] });
  assert.ok(!html.includes("Bro Pizza"), "das Lokal wartet noch");

  const aktiv = view({ tab: "active", sessions: [session()], waiting: [eintrag] });
  assert.match(aktiv, /Bro Pizza/);
});

test("ein Lokal aus Aktiv bleibt auf Waiting, bis der naechste Aufruf kommt", () => {
  // Sonst waere der W-Knopf unter Aktiv ein Knopf ohne Wirkung: Das Lokal hat
  // ja schon geoeffnet, sonst stuende es dort nicht.
  const eintrag = {
    restaurantId: "lokal-1",
    name: "Bro Pizza",
    addedAt: "2026-08-02T12:00:00.000Z"
  };
  const alt = session();

  assert.match(view({ tab: "waiting", sessions: [alt], waiting: [eintrag] }), /Bro Pizza/);
  assert.ok(
    !view({ tab: "active", sessions: [alt], waiting: [eintrag] }).includes("Bro Pizza"),
    "es steht noch unter Aktiv"
  );

  // Und kommt dann doch jemand, ist es sofort wieder unter Aktiv.
  const neu = session({ id: "s2", updatedAt: "2026-08-03T08:00:00.000Z" });
  assert.match(view({ tab: "active", sessions: [alt, neu], waiting: [eintrag] }), /Bro Pizza/);
  assert.ok(
    !view({ tab: "waiting", sessions: [alt, neu], waiting: [eintrag] }).includes("Bro Pizza"),
    "es wartet noch, obwohl jemand da war"
  );
});

test("ein Eintrag ohne Zeitstempel faellt bei jedem Aufruf heraus", () => {
  // So sahen die Eintraege vor dieser Regel aus. Fuer sie gilt weiter, was
  // vorher galt - nicht, dass sie fuer immer stehen bleiben.
  const html = view({
    tab: "waiting",
    sessions: [session()],
    waiting: [{ restaurantId: "lokal-1", name: "Bro Pizza" }]
  });
  assert.ok(!html.includes("Bro Pizza"));
});

test("beim Verschieben wird der Zeitpunkt mitgeschrieben", () => {
  // An ihm haengt die ganze Regel: Ohne addedAt waere jedes Lokal, das schon
  // einmal geoeffnet hat, sofort wieder aus Waiting heraus.
  const heart = fs.readFileSync(path.join(ROOT, "apps/mnyra-heart/heart.js"), "utf8");
  const block = heart.slice(heart.indexOf("async moveLandingBoard"), heart.indexOf("async resetLanding"));
  assert.ok(block.length > 100, "moveLandingBoard nicht gefunden - der Test greift ins Leere");
  assert.match(block, /addedAt:\s*new Date\(\)\.toISOString\(\)/);
});
