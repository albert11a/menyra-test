"use strict";

// Mnyra GO - Kennungen und Geheimnisse.
//
// Drei Regeln, und alle drei stehen in der Spezifikation:
//
//  - Nach aussen gibt es keine fortlaufende Nummer (Punkt 146). Wer eine
//    Buchung oeffnen will, braucht einen langen Zufall, keinen Zaehler.
//  - Das Geheimnis wird nie im Klartext gespeichert. In der Datenbank steht
//    nur sein Hash; im Klartext bekommt es einmal der Gast.
//  - Verglichen wird in konstanter Zeit. Ein Vergleich, der beim ersten
//    falschen Zeichen abbricht, verraet ueber viele Versuche das Geheimnis.

const crypto = require("crypto");

const TOKEN_BYTES = 32;
const GUEST_ID_BYTES = 12;

function toBase64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomBytes(size) {
  return crypto.randomBytes(Math.max(1, Math.trunc(Number(size) || 1)));
}

function createSecret() {
  return toBase64Url(randomBytes(TOKEN_BYTES));
}

function createGuestId() {
  return toBase64Url(randomBytes(GUEST_ID_BYTES));
}

function createBookingId() {
  return toBase64Url(randomBytes(GUEST_ID_BYTES));
}

function hashSecret(secret) {
  const value = String(secret || "");
  if (!value) return "";
  return crypto.createHash("sha256").update(value).digest("hex");
}

// Gleich lange Zeichenketten, konstante Laufzeit. Unterschiedliche Laengen
// sind ohnehin verschieden - dafuer braucht es keinen Vergleich.
function secretMatchesHash(secret, storedHash) {
  const candidate = hashSecret(secret);
  const stored = String(storedHash || "");
  if (!candidate || !stored || candidate.length !== stored.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(stored));
  } catch {
    return false;
  }
}

module.exports = {
  createSecret,
  createGuestId,
  createBookingId,
  hashSecret,
  secretMatchesHash,
  randomBytes
};
