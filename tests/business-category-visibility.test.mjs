import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  PUBLIC_BUSINESS_CATEGORY_KEYS,
  isManuallyPublishedBusinessCore,
  isPublicBusinessCategoryCore,
  resolveBusinessCategoryKeyCore,
  resolveBusinessPublicCategoryGateCore
} from "../apps/menyra-social/core/profile/business-category-visibility-utils.js";
import { isPublicBusinessRecordCore } from "../apps/menyra-social/core/profile/business-visibility-utils.js";
import { normalizeLeadTypeKeyCore } from "../apps/menyra-social/core/leads/lead-type-utils.js";
import { normalizeRestaurantTypeCore } from "../apps/menyra-social/core/profile/restaurant-type-utils.js";
import { LEAD_TYPE_ORDER, LEAD_TYPE_LABELS } from "../apps/menyra-social/core/app-shell/social-app-domain-config.js";

const deps = { normalizeLeadTypeKeyFn: normalizeLeadTypeKeyCore };

test("only the four opened categories are public by default", () => {
  assert.deepEqual(
    [...PUBLIC_BUSINESS_CATEGORY_KEYS],
    ["restaurant", "cafe", "bar", "fastfood"]
  );
  ["restaurant", "cafe", "bar", "fastfood"].forEach((type) => {
    assert.equal(isPublicBusinessCategoryCore({ type }, deps), true, `${type} must be public`);
  });
  ["hotel", "motel", "ecommerce", "tankstelle", "lebensmittel", "apotheken", "services"].forEach((type) => {
    assert.equal(isPublicBusinessCategoryCore({ type }, deps), false, `${type} must be closed`);
  });
});

test("a business without any category is not public by default", () => {
  assert.equal(resolveBusinessCategoryKeyCore({}, deps), "");
  assert.equal(isPublicBusinessCategoryCore({}, deps), false);
});

test("the category is read from every field it can live in", () => {
  assert.equal(resolveBusinessCategoryKeyCore({ customerType: "Fast Food" }, deps), "fastfood");
  assert.equal(resolveBusinessCategoryKeyCore({ restaurantType: "coffee" }, deps), "cafe");
  assert.equal(resolveBusinessCategoryKeyCore({ businessType: "PUB" }, deps), "bar");
});

test("the manual switch outranks the category filter", () => {
  const hotel = { type: "hotel", publicOverrideEnabled: true };
  assert.equal(isPublicBusinessCategoryCore(hotel, deps), false, "the category stays closed");
  assert.equal(isManuallyPublishedBusinessCore(hotel), true);
  const gate = resolveBusinessPublicCategoryGateCore(hotel, deps);
  assert.equal(gate.allowedByCategory, false);
  assert.equal(gate.manuallyPublished, true);
  assert.equal(gate.isPubliclyListed, true, "a manually released hotel is public");
});

test("only a real true counts as a manual release", () => {
  [undefined, null, false, "true", 1, 0].forEach((value) => {
    assert.equal(
      isManuallyPublishedBusinessCore({ type: "hotel", publicOverrideEnabled: value }),
      false,
      `${String(value)} must not release the business`
    );
  });
});

// Der Haken hebt weder eine Loeschung noch eine erzwungene Sperre auf.
test("the manual switch does not undo a deletion or a forced block", () => {
  const record = { type: "hotel", publicOverrideEnabled: true };
  assert.equal(
    isPublicBusinessRecordCore(record, {
      isRestaurantMarkedDeletedFn: () => true,
      isPubliclyListedBusinessCategoryFn: () => true
    }),
    false,
    "a deleted business stays hidden"
  );
  assert.equal(
    isPublicBusinessRecordCore(record, {
      isForceHiddenBusinessEntityFn: () => true,
      isPubliclyListedBusinessCategoryFn: () => true
    }),
    false,
    "a force hidden business stays hidden"
  );
});

// Ohne die neue Pruefung bleibt es beim alten Verhalten.
test("the record check keeps its old behaviour when no category check is given", () => {
  assert.equal(isPublicBusinessRecordCore({ type: "hotel" }, {}), true);
  assert.equal(
    isPublicBusinessRecordCore({ type: "hotel" }, { isPubliclyListedBusinessCategoryFn: () => false }),
    false
  );
});

test("bar is a first class category now", () => {
  assert.ok(LEAD_TYPE_ORDER.includes("bar"), "bar must be selectable in the lead editor");
  assert.equal(LEAD_TYPE_LABELS.bar, "Bar");
  assert.equal(normalizeLeadTypeKeyCore("Bars"), "bar");
  assert.equal(normalizeLeadTypeKeyCore("lounge"), "bar");
  assert.equal(normalizeRestaurantTypeCore("cocktail bar", { normalizeLeadTypeKeyFn: normalizeLeadTypeKeyCore }), "bar");
});

// "barbecue" ist keine Bar.
test("a word that merely contains bar is not a bar", () => {
  assert.notEqual(
    normalizeRestaurantTypeCore("barbecue", { normalizeLeadTypeKeyFn: normalizeLeadTypeKeyCore }),
    "bar"
  );
});

// Der Adminbereich muss zeigen, was gesperrt ist, und es freischalten koennen.
test("the lead editors show the public state and carry the switch", () => {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const files = [
    path.join(repoRoot, "apps", "menyra-social", "_shared", "crm-lazy-renderers.js"),
    path.join(repoRoot, "apps", "menyra-social", "core", "leads", "lead-modal-render-utils.js")
  ];
  files.forEach((file) => {
    const text = fs.readFileSync(file, "utf8");
    assert.ok(
      text.includes('id="leadPublicOverrideEnabled"'),
      `${path.basename(file)} must carry the manual release switch`
    );
    assert.ok(
      text.includes("resolveBusinessPublicCategoryGateCore"),
      `${path.basename(file)} must show the resolved public state`
    );
  });

  const listText = fs.readFileSync(files[0], "utf8");
  assert.ok(listText.includes("I fshehur publikisht"), "the lead list must mark hidden businesses");

  const saveText = fs.readFileSync(
    path.join(repoRoot, "apps", "menyra-social", "core", "leads", "lead-save-utils.js"),
    "utf8"
  );
  assert.ok(
    saveText.includes('docObj.getElementById("leadPublicOverrideEnabled")'),
    "saving a lead must read the switch"
  );
  assert.ok(
    saveText.includes("publicOverrideEnabled,"),
    "the switch must be written to the stored record"
  );
});
