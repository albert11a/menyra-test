// DIE ZBRITJE IM LADEN (/lifeskinshop) - aus Heart steuerbar (09.10., Inhaber).
//
// Ein Dokument lifeskin/lifeskin/config/shopAktion:
//   aktiv  an/aus
//   cmimi  Preis des Acne Duo waehrend der Aktion (EUR)
//   bis    Ende (ISO); danach gilt von selbst wieder der Set-Preis aus Heart
//   sete   Sets auf Lager (leer = keine Lagerzeile)
//   ab     seit wann Bestellungen vom Lager abgezogen werden (beim Speichern)
//
// Fehlt das Dokument, gilt AKTION_STANDARD (Auftrag Inhaber 09.10.: heute
// bis 19:00 fuer 25 EUR, 6 Sets). Sobald Heart speichert, gilt das Dokument.
// Der Normalpreis ist echt: 2 Produkte x Einzelpreis (shared/lifeskin-preise.js).

import { preisFuer } from "./lifeskin-preise.js";

export const AKTION_DOK = "shopAktion";
export const AKTION_ZONE = "Europe/Belgrade";
export const AKTION_STANDARD = Object.freeze({
  aktiv: true,
  cmimi: 25,
  bis: "2026-10-09T17:00:00.000Z",
  sete: 6,
  ab: "2026-10-08T22:30:00.000Z"
});

const iso = (wert) => {
  const ms = Date.parse(wert || "");
  return Number.isFinite(ms) ? new Date(ms).toISOString() : "";
};

export function aktionNormalisieren(roh) {
  if (!roh || typeof roh !== "object") return { aktiv: false, cmimi: 0, bis: "", sete: null, ab: "" };
  const cmimi = Math.round(Number(roh.cmimi));
  const sete = roh.sete === "" || roh.sete == null ? NaN : Math.floor(Number(roh.sete));
  return {
    aktiv: roh.aktiv === true,
    cmimi: cmimi >= 1 && cmimi <= 999 ? cmimi : 0,
    bis: iso(roh.bis),
    sete: Number.isFinite(sete) && sete >= 0 && sete <= 9999 ? sete : null,
    ab: iso(roh.ab)
  };
}

export function aktionLaeuft(a, jetzt = Date.now()) {
  return Boolean(a?.aktiv && a.cmimi > 0 && a.bis && jetzt < Date.parse(a.bis));
}

// Echter Normalpreis des Duo: zwei Einzelpreise (2 x 29 = 58 EUR).
export function aktionNormalpreis() {
  return 2 * preisFuer(1);
}

// Datum und Uhrzeit in Kosovo, ohne die Zeitzone des Geraets.
export function kosovoTeile(ms) {
  const teile = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: AKTION_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date(ms)).map((t) => [t.type, t.value]));
  return { jahr: teile.year, monat: teile.month, tag: teile.day, stunde: teile.hour, minute: teile.minute };
}

// "2026-10-09T19:00" (Kosovo) fuer <input type="datetime-local">.
export function kosovoFeld(isoWert) {
  const ms = Date.parse(isoWert || "");
  if (!Number.isFinite(ms)) return "";
  const t = kosovoTeile(ms);
  return `${t.jahr}-${t.monat}-${t.tag}T${t.stunde}:${t.minute}`;
}

// Umkehrung: "2026-10-09T19:00" als Kosovo-Zeit -> ISO.
export function kosovoZuIso(feld) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(feld || "").trim());
  if (!m) return "";
  const alsUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  const t = kosovoTeile(alsUtc);
  const versatz = Date.UTC(+t.jahr, +t.monat - 1, +t.tag, +t.stunde, +t.minute) - alsUtc;
  return new Date(alsUtc - versatz).toISOString();
}

// Die Texte im Block ueber dem Kaufknopf.
export function aktionTexte(a, jetzt = Date.now()) {
  const ende = Date.parse(a.bis);
  const e = kosovoTeile(ende), h = kosovoTeile(jetzt), m = kosovoTeile(jetzt + 86400000);
  const ora = e.stunde === "23" && e.minute === "59" ? "24:00" : `${e.stunde}:${e.minute}`;
  const tag = `${e.jahr}${e.monat}${e.tag}`;
  const sot = tag === `${h.jahr}${h.monat}${h.tag}`;
  const neser = tag === `${m.jahr}${m.monat}${m.tag}`;
  const vecmas = aktionNormalpreis();
  return {
    plakete: sot ? "VETËM SOT" : "OFERTË",
    ende: sot ? `Mbaron sot në ora ${ora}` : neser ? `Mbaron nesër në ora ${ora}` : `Mbaron më ${e.tag}.${e.monat}. në ora ${ora}`,
    cmimi: a.cmimi,
    vecmas,
    kursen: vecmas > a.cmimi ? vecmas - a.cmimi : 0,
    normal: `Çmimi normal: 2 produkte × ${preisFuer(1)} € = ${vecmas} €`
  };
}
