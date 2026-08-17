import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGoBookingLink,
  readGoBookingLinkToken
} from "../apps/menyra-social/core/go/go-client-store.js";

// ===========================================================================
// Der Link zur eigenen Oferta.
//
// Er ist der einzige Weg zurueck, wenn der Browser nichts behalten hat - im
// privaten Fenster, auf einem anderen Telefon, oder bei einem Gast, dem die
// Oferta weitergereicht wurde. Deshalb muss er genau zwei Dinge koennen:
// den Token tragen, und ihn heil wieder hergeben.
// ===========================================================================

const TOKEN = "b1.abcdef123456.QQrs-_TUVwxyz0123456789ABCDEFGHIJKLMNO";

test("what goes into the link comes back out of it", () => {
  const link = buildGoBookingLink(TOKEN, { origin: "https://mnyra.com" });
  assert.equal(link, `https://mnyra.com/go#oferta=${encodeURIComponent(TOKEN)}`);
  assert.equal(readGoBookingLinkToken(link), TOKEN);
});

test("the token stands behind the hash, never in the query", () => {
  // Das Fragment geht nicht an den Server, steht in keinem Zugriffsprotokoll
  // und wird beim Weiterklicken nicht als Herkunft mitgeschickt. Fuer ein
  // Geheimnis in einer Adresse ist das der einzig vertretbare Platz.
  const link = buildGoBookingLink(TOKEN, { origin: "https://mnyra.com" });
  assert.ok(link.includes("#"));
  assert.equal(link.includes("?"), false);
  assert.equal(link.indexOf(TOKEN.split(".")[1]) > link.indexOf("#"), true);
});

test("a trailing slash on the origin does not double up", () => {
  assert.equal(
    buildGoBookingLink("abc", { origin: "https://mnyra.com/" }),
    "https://mnyra.com/go#oferta=abc"
  );
  assert.equal(
    buildGoBookingLink("abc", { origin: "https://mnyra.com///" }),
    "https://mnyra.com/go#oferta=abc"
  );
});

test("no token means no link, rather than a link into nothing", () => {
  assert.equal(buildGoBookingLink(""), "");
  assert.equal(buildGoBookingLink(null), "");
  assert.equal(buildGoBookingLink("   "), "");
});

test("the fragment is read with or without its hash, and out of a whole address", () => {
  assert.equal(readGoBookingLinkToken("#oferta=abc"), "abc");
  assert.equal(readGoBookingLinkToken("oferta=abc"), "abc");
  assert.equal(readGoBookingLinkToken("https://mnyra.com/go#oferta=abc"), "abc");
});

test("a fragment that carries other things too still gives up the token", () => {
  assert.equal(readGoBookingLinkToken("#tab=go&oferta=abc&x=1"), "abc");
  assert.equal(readGoBookingLinkToken("#oferta=abc&tab=go"), "abc");
});

test("a token with an equals sign in it survives the round trip", () => {
  // Base64 endet gern auf "=". Wer beim Zerlegen nur bis zum ersten
  // Gleichheitszeichen liest, schneidet solche Token ab.
  const padded = "b1.abc.ZZZ==";
  const link = buildGoBookingLink(padded, { origin: "https://mnyra.com" });
  assert.equal(readGoBookingLinkToken(link), padded);
});

test("a fragment without our key, or a broken one, is simply no token", () => {
  assert.equal(readGoBookingLinkToken(""), "");
  assert.equal(readGoBookingLinkToken("#tab=go"), "");
  assert.equal(readGoBookingLinkToken("#oferta"), "");
  // Kaputt kodiert: kein Grund, laut zu werden - der Gast landet auf der Suche.
  assert.equal(readGoBookingLinkToken("#oferta=%E0%A4%A"), "");
});
