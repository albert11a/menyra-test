import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  BUSINESS_PLAN_FREE,
  BUSINESS_PLAN_STANDARD,
  BUSINESS_PLAN_FEATURES,
  normalizeBusinessPlanCore,
  resolveBusinessPlanCore,
  planAllowsCore,
  businessCanUseCore
} from "../apps/menyra-social/core/business-accounts/business-plan-core.js";
import { resolveDashboardSubscriptionCore } from "../apps/menyra-social/core/dashboard/dashboard-view-controller.js";

test("there are exactly two plans and free is the safe default", () => {
  assert.equal(BUSINESS_PLAN_FREE, "free");
  assert.equal(BUSINESS_PLAN_STANDARD, "standart");
  // Was nicht ausdruecklich "standart" sagt, ist "free".
  ["", null, undefined, "free", "Free", " FREE ", "irgendwas", 0, false].forEach((value) => {
    assert.equal(normalizeBusinessPlanCore(value), BUSINESS_PLAN_FREE, String(value));
  });
  // Schreibweisen, die "standart" meinen - inklusive der Werte, die vor dem
  // Plan-Feld schon in einzelnen Datensaetzen standen.
  ["standart", "Standart", " STANDARD ", "std", "pro", "premium", "plus", "business", "paid", "active", true]
    .forEach((value) => {
      assert.equal(normalizeBusinessPlanCore(value), BUSINESS_PLAN_STANDARD, String(value));
    });
});

test("free posts and makes offers, standart also opens menu and qr", () => {
  // Genau die Aufteilung, die vereinbart ist.
  assert.deepEqual(BUSINESS_PLAN_FEATURES.posts, ["free", "standart"]);
  assert.deepEqual(BUSINESS_PLAN_FEATURES.offers, ["free", "standart"]);
  assert.deepEqual(BUSINESS_PLAN_FEATURES.menu, ["standart"]);
  assert.deepEqual(BUSINESS_PLAN_FEATURES.qr, ["standart"]);

  ["posts", "offers"].forEach((feature) => {
    assert.equal(planAllowsCore("free", feature), true, feature);
    assert.equal(planAllowsCore("standart", feature), true, feature);
  });
  ["menu", "qr"].forEach((feature) => {
    assert.equal(planAllowsCore("free", feature), false, feature);
    assert.equal(planAllowsCore("standart", feature), true, feature);
  });
  // Was kein Plan-Thema ist, sperrt auch niemand.
  assert.equal(planAllowsCore("free", "profil"), true);
  assert.equal(planAllowsCore("free", ""), true);
});

test("the restaurant record decides, the profile is only the fallback", () => {
  // Was im CRM gesetzt wurde, steht im Restaurant-Dokument und gewinnt.
  assert.equal(
    resolveBusinessPlanCore({ restaurant: { plan: "free" }, profile: { plan: "standart" } }),
    BUSINESS_PLAN_FREE
  );
  assert.equal(
    resolveBusinessPlanCore({ restaurant: { plan: "standart" }, profile: { plan: "free" } }),
    BUSINESS_PLAN_STANDARD
  );
  // Ohne Eintrag im Restaurant zaehlt das Profil.
  assert.equal(resolveBusinessPlanCore({ restaurant: {}, profile: { plan: "standart" } }), BUSINESS_PLAN_STANDARD);
  // Ein leeres Feld ist kein Eintrag - es faellt durch, statt "free" zu erzwingen.
  assert.equal(resolveBusinessPlanCore({ restaurant: { plan: "" }, profile: { plan: "standart" } }), BUSINESS_PLAN_STANDARD);
  // Und ganz ohne alles: free.
  assert.equal(resolveBusinessPlanCore({}), BUSINESS_PLAN_FREE);
  assert.equal(resolveBusinessPlanCore(), BUSINESS_PLAN_FREE);
});

test("the panel cards follow the same plan as the menu", () => {
  // Die verschlossenen Karten im Panel fragen dieselbe Stelle wie der Zugang
  // zur Menyja - eine Umstellung im CRM wirkt auf beides zugleich.
  assert.equal(resolveDashboardSubscriptionCore({ restaurant: { plan: "standart" } }), true);
  assert.equal(resolveDashboardSubscriptionCore({ restaurant: { plan: "free" } }), false);
  assert.equal(resolveDashboardSubscriptionCore({}), false);
  assert.equal(
    resolveDashboardSubscriptionCore({ restaurant: { plan: "standart" } }),
    businessCanUseCore({ restaurant: { plan: "standart" }, feature: "menu" })
  );
});

// Der Plan muss den ganzen Weg gehen: im Formular gesetzt, in den Lead
// geschrieben, ins Restaurant-Dokument geschrieben - erst dort liest ihn das
// eingeloggte Business. Faellt eine dieser Stationen weg, steht die Auswahl im
// CRM zwar da, wirkt aber nirgends.
test("the plan travels from the crm form into the lead and the restaurant", async () => {
  // Es gibt DREI Lead-Formulare: zwei in der Social-App (anlegen und aendern)
  // und eines in der Heart-App - das ist das, mit dem tatsaechlich gearbeitet
  // wird. Der Plan muss in allen dreien stehen; beim ersten Anlauf stand er
  // nur in einem, und damit an der Stelle, die niemand oeffnet.
  const formen = [
    ["Anlege-Formular (Social)", "../apps/menyra-social/_shared/crm-lazy-renderers.js", 'id="leadPlan"'],
    ["Lead-Modal (Social)", "../apps/menyra-social/core/leads/lead-modal-render-utils.js", 'id="leadPlan"'],
    ["Lead-Formular (Heart)", "../apps/mnyra-heart/heart-crm-admin-read-view.js", 'id: "leadPlan"']
  ];
  for (const [label, pfad, marke] of formen) {
    const markup = await readFile(new URL(pfad, import.meta.url), "utf8");
    assert.ok(markup.includes(marke), `${label}: kein Plan-Feld`);
    assert.ok(markup.includes('"free"'), `${label}: keine Free-Auswahl`);
    assert.ok(markup.includes('"standart"'), `${label}: keine Standart-Auswahl`);
    // Und der gespeicherte Wert steht vorausgewaehlt da, statt immer "free".
    assert.ok(
      markup.includes('=== "standart" ? "selected" : ""') || markup.includes("normalizeBusinessPlanCore(lead.plan)"),
      `${label}: der gespeicherte Wert steht nicht vorausgewaehlt`
    );
  }

  const save = await readFile(new URL("../apps/menyra-social/core/leads/lead-save-utils.js", import.meta.url), "utf8");
  assert.ok(save.includes('docObj.getElementById("leadPlan")'), "der Speicherweg liest das Feld nicht");
  // Zweimal: einmal in den Lead, einmal in das Restaurant-Dokument.
  assert.equal(
    (save.match(/^ {6}plan,$/gm) || []).length,
    2,
    "der Plan steht nicht in beiden Datensaetzen"
  );

  const crm = await readFile(new URL("../apps/menyra-social/core/crm/crm-runtime-controller.js", import.meta.url), "utf8");
  assert.ok(crm.includes('lead.plan = normalizeBusinessPlanCore(readValue("leadPlan")'), "der Entwurf haelt den Plan nicht");
  // Beide Wege, auf denen ein Lead entsteht, tragen ihn mit.
  assert.equal(
    (crm.match(/plan: normalizeBusinessPlanCore\(data\.plan/g) || []).length,
    2,
    "ein Lead-Weg verliert den Plan"
  );
});

// Die Menyja ist mit "free" zu. Der Hinweis tritt an die Stelle des Editors,
// und zwar BEVOR irgendetwas nachgeladen wird.
test("the menu tab is closed on the free plan", async () => {
  const menu = await readFile(
    new URL("../apps/menyra-social/core/profile/profile-menu-focus-render-controller.js", import.meta.url),
    "utf8"
  );
  assert.ok(menu.includes('businessCanUseCore({ profile, restaurant, feature: "menu" })'));
  assert.ok(menu.includes("renderBusinessPlanGateView"));
  // Gefragt wird erst, wenn die Restaurant-Daten da sind - sonst saehe ein
  // zahlendes Konto fuer einen Moment die Sperre.
  assert.ok(menu.includes("if (restaurantId && restaurant && !businessCanUseCore("));
  // Die Sperre steht vor dem Nachladen der Menue-Daten.
  const gate = menu.indexOf("renderBusinessPlanGateView({ title: catalogLabel })");
  const load = menu.indexOf("ensureEditorMenuDataForProfile(profile)");
  assert.ok(gate > -1 && load > -1 && gate < load, "die Sperre steht hinter dem Nachladen");
});
