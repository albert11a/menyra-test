import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeVoucherItem,
  resolveVoucherWindow,
  isVoucherVisibleForCustomers,
  formatVoucherRemaining,
  resolveVoucherUrgency,
  formatActivationCountdown,
  formatActivationDuration,
  clampActivationMinutes,
  buildActivationRecord,
  resolveActivationState,
  buildVoucherActivationKey,
  buildVoucherActivationDocId,
  buildVoucherAnalyticsModel,
  toVoucherStoragePayload,
  validateVoucherDraft,
  toVoucherInputValue,
  fromVoucherInputValue,
  normalizeVoucherStats,
  VOUCHER_DEFAULT_ACTIVATION_MINUTES
} from "../apps/menyra-social/core/vouchers/voucher-core.js";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const NOW = Date.parse("2026-08-03T12:00:00.000Z");

test("normalizeVoucherItem fills defaults and keeps an id", () => {
  const item = normalizeVoucherItem({ title: "  20% zbritje  " }, "fallback-id");
  assert.equal(item.id, "fallback-id");
  assert.equal(item.title, "20% zbritje");
  assert.equal(item.active, true);
  assert.equal(item.activationMinutes, VOUCHER_DEFAULT_ACTIVATION_MINUTES);
  assert.equal(item.cropX, 50);
  assert.equal(item.cropY, 50);

  const generated = normalizeVoucherItem({});
  assert.ok(generated.id.startsWith("ofr_"));
});

test("normalizeVoucherItem accepts legacy field names", () => {
  const item = normalizeVoucherItem({
    id: "v1",
    name: "Legacy",
    description: "Text",
    validUntil: "2026-08-10T10:00:00.000Z",
    validMinutes: 30,
    discountLabel: "-20%"
  });
  assert.equal(item.title, "Legacy");
  assert.equal(item.text, "Text");
  assert.equal(item.badgeLabel, "-20%");
  assert.equal(item.activationMinutes, 30);
  assert.equal(item.endAt, "2026-08-10T10:00:00.000Z");
});

test("clampActivationMinutes stays inside the allowed window", () => {
  assert.equal(clampActivationMinutes(1), 5);
  assert.equal(clampActivationMinutes(60), 60);
  assert.equal(clampActivationMinutes(99999), 1440);
  assert.equal(clampActivationMinutes("abc"), VOUCHER_DEFAULT_ACTIVATION_MINUTES);
  assert.equal(clampActivationMinutes(0), VOUCHER_DEFAULT_ACTIVATION_MINUTES);
});

test("resolveVoucherWindow reports scheduled, live, expired and inactive", () => {
  const base = { endAt: new Date(NOW + (3 * DAY)).toISOString() };

  const live = resolveVoucherWindow(base, NOW);
  assert.equal(live.status, "live");
  assert.equal(live.remainingMs, 3 * DAY);

  const scheduled = resolveVoucherWindow({
    ...base,
    startAt: new Date(NOW + HOUR).toISOString()
  }, NOW);
  assert.equal(scheduled.status, "scheduled");

  const expired = resolveVoucherWindow({ endAt: new Date(NOW - MINUTE).toISOString() }, NOW);
  assert.equal(expired.status, "expired");
  assert.equal(expired.remainingMs, 0);

  const inactive = resolveVoucherWindow({ ...base, active: false }, NOW);
  assert.equal(inactive.status, "inactive");

  // Ohne Enddatum laeuft die Oferta unbefristet weiter.
  const openEnded = resolveVoucherWindow({}, NOW);
  assert.equal(openEnded.status, "live");
  assert.equal(openEnded.remainingMs, 0);
});

test("only live vouchers reach the customer tab", () => {
  assert.equal(isVoucherVisibleForCustomers({ endAt: new Date(NOW + DAY).toISOString() }, NOW), true);
  assert.equal(isVoucherVisibleForCustomers({ endAt: new Date(NOW - DAY).toISOString() }, NOW), false);
  assert.equal(isVoucherVisibleForCustomers({ active: false }, NOW), false);
});

test("badge counts down days, then hours, then minutes", () => {
  assert.equal(formatVoucherRemaining(3 * DAY), "Edhe 3 dite");
  assert.equal(formatVoucherRemaining(DAY), "Edhe 1 dite");
  assert.equal(formatVoucherRemaining((23 * HOUR) + (59 * MINUTE)), "Edhe 23 ore");
  assert.equal(formatVoucherRemaining(HOUR), "Edhe 1 ore");
  assert.equal(formatVoucherRemaining(42 * MINUTE), "Edhe 42 minuta");
  assert.equal(formatVoucherRemaining(30 * 1000), "Edhe 1 minute");
  assert.equal(formatVoucherRemaining(0), "Pa afat");
});

test("urgency drives the badge colour", () => {
  assert.equal(resolveVoucherUrgency(2 * DAY), "calm");
  assert.equal(resolveVoucherUrgency(5 * HOUR), "soon");
  assert.equal(resolveVoucherUrgency(20 * MINUTE), "critical");
  assert.equal(resolveVoucherUrgency(0), "none");
});

test("activation countdown formats mm:ss and h:mm:ss", () => {
  assert.equal(formatActivationCountdown((59 * MINUTE) + (12 * 1000)), "59:12");
  assert.equal(formatActivationCountdown(HOUR + (2 * MINUTE) + (33 * 1000)), "1:02:33");
  assert.equal(formatActivationCountdown(0), "00:00");
  assert.equal(formatActivationCountdown(-5000), "00:00");
});

test("activation duration is spoken in the confirm dialog", () => {
  assert.equal(formatActivationDuration(60), "1 ore");
  assert.equal(formatActivationDuration(30), "30 minuta");
  assert.equal(formatActivationDuration(90), "1 ore e 30 minuta");
  assert.equal(formatActivationDuration(120), "2 ore");
});

test("activation record expires exactly after the configured window", () => {
  const record = buildActivationRecord({
    restaurantId: "rest-1",
    voucherId: "ofr-1",
    uid: "user-1",
    activationMinutes: 60,
    nowMs: NOW
  });
  assert.equal(record.activatedAt, new Date(NOW).toISOString());
  assert.equal(record.expiresAt, new Date(NOW + HOUR).toISOString());
  assert.equal(record.code.length, 6);
  assert.match(record.code, /^[A-HJ-NP-Z2-9]{6}$/);
});

test("activation state flips from active to expired at the deadline", () => {
  const record = buildActivationRecord({
    restaurantId: "rest-1",
    voucherId: "ofr-1",
    uid: "user-1",
    activationMinutes: 60,
    nowMs: NOW
  });

  const active = resolveActivationState(record, NOW + (10 * MINUTE));
  assert.equal(active.state, "active");
  assert.equal(active.remainingMs, 50 * MINUTE);
  assert.equal(active.code, record.code);

  const expired = resolveActivationState(record, NOW + HOUR);
  assert.equal(expired.state, "expired");
  assert.equal(expired.remainingMs, 0);

  assert.equal(resolveActivationState(null, NOW).state, "none");
});

test("activation keys and doc ids are stable", () => {
  assert.equal(buildVoucherActivationKey("rest-1", "ofr-1"), "rest-1::ofr-1");
  assert.equal(buildVoucherActivationDocId("ofr-1", "user-1"), "ofr-1__user-1");
});

test("analytics model sums reach, activations and conversion", () => {
  const model = buildVoucherAnalyticsModel({
    items: [
      { id: "a", title: "Oferta A", endAt: new Date(NOW + DAY).toISOString() },
      { id: "b", title: "Oferta B", endAt: new Date(NOW - DAY).toISOString() },
      { id: "c", title: "Oferta C", endAt: new Date(NOW + DAY).toISOString() }
    ],
    statsById: {
      a: { reachCount: 200, activationCount: 50 },
      b: { reachCount: 100, activationCount: 10 }
    },
    nowMs: NOW
  });

  assert.equal(model.rows.length, 3);
  assert.equal(model.rows[0].reachCount, 200);
  assert.equal(model.rows[0].activationCount, 50);
  assert.equal(model.rows[0].conversionPercent, 25);
  assert.equal(model.rows[1].status, "expired");
  assert.equal(model.rows[2].reachCount, 0);
  assert.equal(model.rows[2].conversionPercent, 0);

  assert.equal(model.totals.reachCount, 300);
  assert.equal(model.totals.activationCount, 60);
  assert.equal(model.totals.voucherCount, 3);
  assert.equal(model.totals.liveCount, 2);
  assert.equal(model.totals.conversionPercent, 20);
});

test("stats normalize to non negative integers", () => {
  assert.deepEqual(normalizeVoucherStats({ reachCount: -5, activationCount: "12" }), {
    reachCount: 0,
    activationCount: 12
  });
  assert.deepEqual(normalizeVoucherStats(null), { reachCount: 0, activationCount: 0 });
});

test("storage payload keeps createdAt and refreshes updatedAt", () => {
  const created = new Date(NOW - DAY).toISOString();
  const payload = toVoucherStoragePayload({
    id: "ofr-1",
    title: "Oferta",
    endAt: new Date(NOW + DAY).toISOString(),
    createdAt: created
  }, { nowMs: NOW });
  assert.equal(payload.createdAt, created);
  assert.equal(payload.updatedAt, new Date(NOW).toISOString());
  assert.equal(payload.activationMinutes, VOUCHER_DEFAULT_ACTIVATION_MINUTES);

  const fresh = toVoucherStoragePayload({ title: "Neu", endAt: new Date(NOW + DAY).toISOString() }, { nowMs: NOW });
  assert.equal(fresh.createdAt, new Date(NOW).toISOString());
});

test("draft validation blocks missing title and bad date ranges", () => {
  assert.match(validateVoucherDraft({}), /titullin/);
  assert.match(validateVoucherDraft({ title: "Oferta" }), /deri kur/);
  assert.match(
    validateVoucherDraft({
      title: "Oferta",
      startAt: new Date(NOW + DAY).toISOString(),
      endAt: new Date(NOW).toISOString()
    }),
    /pas fillimit/
  );
  assert.equal(
    validateVoucherDraft({ title: "Oferta", endAt: new Date(NOW + DAY).toISOString() }),
    ""
  );
});

test("datetime-local values round trip through local time", () => {
  const iso = new Date(NOW).toISOString();
  const inputValue = toVoucherInputValue(iso);
  assert.match(inputValue, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  // Minutengenauigkeit reicht: das Eingabefeld kennt keine Sekunden.
  assert.equal(fromVoucherInputValue(inputValue), NOW);
  assert.equal(toVoucherInputValue(""), "");
  assert.equal(fromVoucherInputValue("keine-datum"), 0);
});

test("business list labels stay honest for non-live vouchers", async () => {
  const { formatVoucherWindowLabel } = await import(
    "../apps/menyra-social/core/vouchers/voucher-core.js"
  );

  const live = resolveVoucherWindow({ endAt: new Date(NOW + (2 * DAY)).toISOString() }, NOW);
  assert.equal(formatVoucherWindowLabel(live, NOW), "Edhe 2 dite");

  // Abgelaufen heisst nicht "unbefristet", auch wenn die Restzeit 0 ist.
  const expired = resolveVoucherWindow({ endAt: new Date(NOW - DAY).toISOString() }, NOW);
  assert.equal(formatVoucherWindowLabel(expired, NOW), "Ka skaduar");

  const scheduled = resolveVoucherWindow({
    startAt: new Date(NOW + (2 * HOUR)).toISOString(),
    endAt: new Date(NOW + DAY).toISOString()
  }, NOW);
  assert.equal(formatVoucherWindowLabel(scheduled, NOW), "Fillon per 2 ore");

  const inactive = resolveVoucherWindow({ active: false, endAt: new Date(NOW + DAY).toISOString() }, NOW);
  assert.equal(formatVoucherWindowLabel(inactive, NOW), "E ndalur");

  // Ohne Enddatum bleibt "Pa afat" korrekt.
  const openEnded = resolveVoucherWindow({}, NOW);
  assert.equal(formatVoucherWindowLabel(openEnded, NOW), "Pa afat");
});
