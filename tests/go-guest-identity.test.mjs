import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import {
  GO_TRUST_LEVEL_NORMAL,
  GO_TRUST_LEVEL_VERIFY,
  GO_TRUST_LEVEL_WATCH,
  applyGoGuestActivity,
  buildGoBookingToken,
  buildGoGuestToken,
  goGuestActionAllowed,
  parseGoBookingToken,
  parseGoGuestToken,
  resolveGoGuestTrustLevel
} from "../shared/go/go-guest-identity-core.js";

// ===========================================================================
// Punkt 32 und 37: Die IP ist keine Identitaet.
//
// Hinter einem Mobilfunk-NAT sitzen tausende Menschen auf derselben
// oeffentlichen Adresse. Wer daraus "ein Nutzer" macht, sperrt eine ganze
// Stadt aus und haelt keinen einzigen Missbraucher auf.
// ===========================================================================

test("the guest core does not know what an ip address is", () => {
  // Ein Test gegen den Quelltext selbst - er faellt in dem Augenblick, in dem
  // jemand die IP doch wieder als Identitaet einfuehrt.
  const files = [
    "shared/go/go-guest-identity-core.js",
    "shared/go/go-matching-core.js",
    "shared/go/go-booking-core.js"
  ];
  files.forEach((path) => {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    // Erlaubt ist, ueber die IP zu schreiben - nicht, mit ihr zu rechnen.
    const code = source.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    assert.equal(/\bip(Address|Hash|Key)\b/i.test(code), false, path);
    assert.equal(/remoteAddr|x-forwarded-for/i.test(code), false, path);
  });
});

test("two guests in the same network are two guests", () => {
  // Genau das ist der Punkt: Die Kennung kommt vom Server als Zufall, nicht
  // aus etwas, das beide Telefone teilen.
  const first = buildGoGuestToken({ guestId: "aaaaaaaaaaaa", secret: "s".repeat(32) });
  const second = buildGoGuestToken({ guestId: "bbbbbbbbbbbb", secret: "t".repeat(32) });
  assert.notEqual(first, second);
  assert.equal(parseGoGuestToken(first).guestId, "aaaaaaaaaaaa");
  assert.equal(parseGoGuestToken(second).guestId, "bbbbbbbbbbbb");
});

test("a broken or foreign token is simply not a token", () => {
  assert.equal(parseGoGuestToken("").valid, false);
  assert.equal(parseGoGuestToken("g1.short.x").valid, false);
  assert.equal(parseGoGuestToken("g2.aaaaaaaaaaaa.ssssssssssss").valid, false);
  // Kein Pfadzeichen kommt durch - der Token landet in Firestore-Pfaden.
  assert.equal(parseGoGuestToken(`g1.../../etc.${"s".repeat(32)}`).valid, false);
});

test("a booking is opened by a long secret, not by a number", () => {
  const token = buildGoBookingToken({ bookingId: "bk123456", secret: "s".repeat(43) });
  const parsed = parseGoBookingToken(token);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.bookingId, "bk123456");
  assert.equal(parsed.secret.length, 43);
  assert.equal(parseGoBookingToken("b1.1234.5").valid, false);
});

// ===========================================================================
// Punkt 36: Missbrauchsschutz als Treppe, nicht als Tuer.
// ===========================================================================

test("a normal guest never meets a hurdle", () => {
  const level = resolveGoGuestTrustLevel({ bookingsLastHour: 2, searchesLastHour: 12 });
  assert.equal(level.level, GO_TRUST_LEVEL_NORMAL);
  assert.equal(goGuestActionAllowed(level.level).allowed, true);
});

test("a burst asks for a sign-in instead of a wall", () => {
  const level = resolveGoGuestTrustLevel({ bookingsLastHour: 14 });
  assert.equal(level.level, GO_TRUST_LEVEL_VERIFY);
  const guest = goGuestActionAllowed(level.level, { isSignedIn: false });
  assert.equal(guest.allowed, false);
  assert.equal(guest.requiresSignIn, true);
  // Angemeldet geht es sofort weiter - es ist keine Sperre, es ist ein Beleg.
  assert.equal(goGuestActionAllowed(level.level, { isSignedIn: true }).allowed, true);
});

test("booking and cancelling in circles is noticed", () => {
  assert.equal(resolveGoGuestTrustLevel({ cancelsLastDay: 5 }).level, GO_TRUST_LEVEL_WATCH);
  assert.equal(resolveGoGuestTrustLevel({ cancelsLastDay: 9 }).level, GO_TRUST_LEVEL_VERIFY);
});

test("the counters roll forward instead of needing a cleanup job", () => {
  const start = 1_000_000_000_000;
  let stats = applyGoGuestActivity({}, { kind: "reservation", nowMs: start });
  assert.equal(stats.bookingsLastHour, 1);
  assert.equal(stats.openReservations, 1);

  stats = applyGoGuestActivity(stats, { kind: "search", nowMs: start + 60_000 });
  assert.equal(stats.searchesLastHour, 1);
  assert.equal(stats.bookingsLastHour, 1);

  // Eine Stunde spaeter faengt das Fenster von selbst neu an.
  stats = applyGoGuestActivity(stats, { kind: "search", nowMs: start + 61 * 60_000 });
  assert.equal(stats.searchesLastHour, 1);
  assert.equal(stats.bookingsLastHour, 0);
  // Die offenen Reservierungen sind kein Zeitfenster - sie bleiben.
  assert.equal(stats.openReservations, 1);

  stats = applyGoGuestActivity(stats, { kind: "cancel", nowMs: start + 62 * 60_000 });
  assert.equal(stats.openReservations, 0);
  assert.equal(stats.cancelsLastDay, 1);
});
