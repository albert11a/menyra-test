import test from "node:test";
import assert from "node:assert/strict";

import { renderHeartApp } from "../apps/mnyra-heart/heart-render.js";
import { HEART_NAV_ITEMS } from "../apps/mnyra-heart/heart-state.js";

// Was passiert, wenn eine einzelne Ansicht beim Zeichnen stolpert?
//
// Frueher: Der Fehler flog bis in renderHeartApp hinauf, das Markup wurde nie
// geschrieben, und weil die aktive Ansicht im Zustand trotzdem umgestellt war,
// scheiterte jedes weitere Zeichnen genauso. Fuer den Benutzer sah es so aus:
// Ein Klick auf den Reiter, danach reagiert Heart auf gar nichts mehr - ohne
// Meldung, ohne Hinweis, ohne Weg zurueck.
//
// Genau das ist mit dem Lifeskin-Reiter passiert, und es haette mit jedem
// anderen Reiter genauso passieren koennen. Deshalb steht die Absicherung
// nicht in der Lifeskin-Ansicht, sondern eine Ebene darueber.

function knotenAttrappe() {
  return { innerHTML: "", querySelector: () => null, contains: () => false };
}

function angemeldet(ansicht, zusatz = {}) {
  return {
    auth: {
      status: "authenticated",
      user: { uid: "u1", email: "dr@lifeskin.test" },
      profile: {},
      access: { allowed: true }
    },
    shell: { activeView: ansicht, modal: {} },
    crmAdmin: {}, analytics: {}, landing: {}, destinations: {},
    mnyraGo: {}, connections: {}, setup: {},
    ...zusatz
  };
}

test("eine stolpernde Ansicht nimmt Heart nicht mit", () => {
  const knoten = knotenAttrappe();
  const zustand = angemeldet("lifeskin");
  // Der Zugriff auf den Bereich selbst wirft - so hart wie es nur geht.
  Object.defineProperty(zustand, "lifeskin", {
    get() { throw new Error("absichtlich kaputt"); },
    enumerable: true
  });

  // Der Fehler wird protokolliert; hier soll er nur nicht die Ausgabe fluten.
  const alt = globalThis.console.error;
  globalThis.console.error = () => {};
  try {
    assert.doesNotThrow(() => renderHeartApp(knoten, zustand, {}));
  } finally {
    globalThis.console.error = alt;
  }

  assert.ok(knoten.innerHTML.length > 0, "Es wurde ueberhaupt nichts geschrieben");
  assert.match(knoten.innerHTML, /konnte nicht gezeichnet werden/);
  assert.match(knoten.innerHTML, /absichtlich kaputt/);
  // Und das Wichtigste: Der Weg hinaus ist noch da.
  assert.match(knoten.innerHTML, /heart-nav/);
});

// Jeder Reiter muss sich oeffnen lassen, ohne dass vorher irgendein Bereich
// geladen wurde. Genau in diesem Moment - Ansicht schon umgestellt, Daten noch
// nicht da - ist der Lifeskin-Reiter abgestuerzt.
for (const eintrag of HEART_NAV_ITEMS) {
  test(`"${eintrag.label}" laesst sich mit leerem Zustand oeffnen`, () => {
    const knoten = knotenAttrappe();
    assert.doesNotThrow(() => renderHeartApp(knoten, angemeldet(eintrag.key), {}));
    assert.ok(knoten.innerHTML.length > 0);
    assert.doesNotMatch(
      knoten.innerHTML,
      /konnte nicht gezeichnet werden/,
      `${eintrag.key} stolpert beim ersten Zeichnen`
    );
  });
}
