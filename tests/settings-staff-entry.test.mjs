import assert from "node:assert/strict";
import test from "node:test";

import { renderSettingsViewCore } from "../apps/menyra-social/core/ui/settings-render-utils.js";

// ===========================================================================
// "Stafi" steht in Opsionet, nicht mehr im Drawer.
//
// Die Eintraege dort sehen gleich aus, tun aber zweierlei: die meisten
// blaettern eine Seite weiter INNERHALB der Einstellungen (data-settings),
// "Stafi" fuehrt aus ihnen heraus auf einen eigenen Tab (data-nav). Traegt er
// die falsche Marke, passiert entweder nichts oder das Falsche.
// ===========================================================================

function renderMain({ isOwner = false } = {}) {
  return renderSettingsViewCore({
    state: { settingsView: "main", settings: {}, userProfile: { restaurantId: "r1" } },
    icon: (name) => `<i data-lucide="${name}"></i>`,
    escapeHtml: (value = "") => String(value || ""),
    isBusinessOwnerProfile: () => isOwner
  });
}

test("an owner finds stafi in the options, on its way to the staff tab", () => {
  const html = renderMain({ isOwner: true });
  assert.ok(html.includes("Stafi"));
  const at = html.indexOf("Stafi");
  const button = html.slice(html.lastIndexOf("<button", at), html.indexOf("</button>", at));
  // data-nav, nicht data-settings: der Weg fuehrt aus den Einstellungen heraus.
  assert.ok(button.includes('data-nav="businessAccounts"'), button);
  assert.equal(button.includes("data-settings="), false, button);
  // Und er steht als letzter, unter den vier Einstellungs-Seiten.
  assert.ok(at > html.indexOf("Ruajtur"));
});

test("everyone else sees the options without it", () => {
  const html = renderMain({ isOwner: false });
  assert.equal(html.includes("Stafi"), false);
  assert.equal(html.includes('data-nav="businessAccounts"'), false);
  // Die vier Einstellungs-Seiten bleiben fuer alle.
  ["Account", "Privatesia", "Njoftimet", "Ruajtur"].forEach((label) => {
    assert.ok(html.includes(label), label);
  });
});

// Ohne die Angabe gilt "kein Inhaber" - im Zweifel steht der Weg nicht da,
// statt jemandem einen Knopf zu zeigen, den er nicht benutzen darf.
test("without the owner check the entry stays away", () => {
  const html = renderSettingsViewCore({
    state: { settingsView: "main", settings: {}, userProfile: {} },
    icon: () => "",
    escapeHtml: (value = "") => String(value || "")
  });
  assert.equal(html.includes("Stafi"), false);
});
