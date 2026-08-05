import test from "node:test";
import assert from "node:assert/strict";

import { renderHeartStartView } from "../apps/mnyra-heart/heart-start-render.js";

// Die Startseite zieht ihre Zahlen aus Bereichen, die zu unterschiedlichen
// Zeiten fertig werden. Was noch nicht da ist, muss als "noch nicht da"
// aussehen - und nicht als Wert.

const NOW = Date.parse("2026-08-05T17:30:00.000Z");

const auth = {
  user: { uid: "u1", email: "albert@menyra.com" },
  profile: { name: "Albert Hoti" }
};

function view(over = {}) {
  return renderHeartStartView({
    auth,
    landing: { status: "idle", sessions: [], archived: [] },
    crmAdmin: { sections: { leads: { status: "idle", items: [] }, customers: { status: "idle", items: [] } } },
    now: NOW,
    ...over
  });
}

test("noch nicht geladene Zahlen zeigen einen Strich, nicht null und nicht 0", () => {
  const html = view();
  assert.ok(!html.includes(">null<"), "auf einer Kachel stand null");
  assert.ok(!html.includes("undefined"), "auf einer Kachel stand undefined");
  const striche = html.match(/heart-start__tile-value">–</g) || [];
  assert.equal(striche.length, 3, "alle drei Kacheln muessten einen Strich zeigen");
});

test("geladene Zahlen stehen auf den Kacheln, auch die echte 0", () => {
  const html = view({
    landing: { status: "ready", sessions: [], archived: [] },
    crmAdmin: {
      sections: {
        leads: { status: "ready", knownCount: 42, items: [] },
        customers: { status: "ready", knownCount: 0, items: [] }
      }
    }
  });
  assert.match(html, /heart-start__tile-value">42</, "die Lead-Zahl fehlt");
  // Landing zaehlt Sitzungen, Kunden meldet echte 0 - beides sind Zahlen und
  // keine Platzhalter.
  const nullen = html.match(/heart-start__tile-value">0</g) || [];
  assert.equal(nullen.length, 2, "eine geladene 0 muss als 0 dastehen");
  assert.ok(!html.includes("–"), "es blieb ein Platzhalter stehen, obwohl alles geladen ist");
});

test("eine halb geladene Seite mischt Zahl und Strich", () => {
  const html = view({
    landing: { status: "loading", sessions: [], archived: [] },
    crmAdmin: {
      sections: {
        leads: { status: "ready", knownCount: 7, items: [] },
        customers: { status: "loading", items: [] }
      }
    }
  });
  assert.match(html, /heart-start__tile-value">7</);
  const striche = html.match(/heart-start__tile-value">–</g) || [];
  assert.equal(striche.length, 2);
});

test("der Spruch nennt den Vornamen, darunter stehen Name und Mailadresse", () => {
  const html = view();
  assert.match(html, /heart-start__motivation">[^<]*Albert/);
  assert.match(html, /<strong>Albert Hoti<\/strong>/);
  assert.match(html, /albert@menyra\.com/);
});

test("ohne Profilbild stehen die Anfangsbuchstaben da", () => {
  assert.match(view(), /heart-start__avatar-initials">AH</);
});

test("ein Profilbild wird als Bild gezeigt", () => {
  const html = view({
    auth: { ...auth, user: { ...auth.user, photoURL: "https://example.test/a.jpg" } }
  });
  assert.match(html, /<img src="https:\/\/example\.test\/a\.jpg"/);
  assert.ok(!html.includes("heart-start__avatar-initials"), "trotz Bild standen die Buchstaben da");
});

test("die drei Schnellwege fuehren nach Leads, Landing und Kunden", () => {
  const html = view();
  assert.match(html, /data-nav-key="crmLeads"/);
  assert.match(html, /data-nav-key="landing"/);
  assert.match(html, /data-nav-key="crmCustomers"/);
});

test("solange noch geladen wird, stehen Platzhalter statt einer leeren Liste", () => {
  const html = view({ landing: { status: "loading", sessions: [], archived: [] } });
  assert.match(html, /heart-start__skeleton/);
  assert.ok(!html.includes("Noch nichts Neues"), "der Leer-Hinweis kam zu frueh");
});

test("ist alles geladen und trotzdem nichts da, steht ein Hinweis", () => {
  const html = view({
    landing: { status: "ready", sessions: [], archived: [] },
    crmAdmin: { sections: { leads: { status: "ready", items: [] }, customers: { status: "ready", items: [] } } }
  });
  assert.match(html, /Noch nichts Neues/);
});

test("ein Eintrag traegt seinen Weg und sein Lokal mit sich", () => {
  const html = view({
    landing: {
      status: "ready",
      archived: [],
      sessions: [{
        restaurantId: "r1", name: "Casarita", city: "Tirana",
        updatedAt: "2026-08-05T16:00:00.000Z", startedAt: "2026-08-05T16:00:00.000Z",
        steps: {}, answers: { q1: "po" }, outcome: "yes", totalMs: 1000
      }]
    }
  });
  assert.match(html, /data-action="open-start-news"/);
  assert.match(html, /data-landing-id="r1"/);
  assert.match(html, /Casarita/);
});

test("ein Lokalname mit Auszeichnung darin bricht die Seite nicht auf", () => {
  const html = view({
    landing: {
      status: "ready",
      archived: [],
      sessions: [{
        restaurantId: "r1", name: "<script>alert(1)</script>", city: "",
        updatedAt: "2026-08-05T16:00:00.000Z", startedAt: "2026-08-05T16:00:00.000Z",
        steps: {}, answers: {}, outcome: "", totalMs: 0
      }]
    }
  });
  assert.ok(!html.includes("<script>alert(1)"), "der Name kam unmaskiert durch");
});
