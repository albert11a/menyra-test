"use strict";

// DIE REGELN DER SKINREACT AUTO-FREIGABE AUF DEM SERVER - ohne Firebase,
// damit der Test sie ohne die Pakete der Functions pruefen kann
// (lifeskin-skinreact-auto.js). Dieselben Regeln wie in Heart
// (apps/mnyra-heart/heart-skinreact-auto.js).

const WARTEN_MS = 5000;
const BEREICH = "95-100";

const zeit = (wert) => {
  const zahl = Date.parse(String(wert || ""));
  return Number.isFinite(zahl) ? zahl : NaN;
};

// Soll dieser Fall automatisch freigegeben werden? Reine Rechnung, ohne
// Firestore - der Test gibt Werte hinein.
function autoFaellig({ einstellung, sitzung, bericht }) {
  if (einstellung?.modus !== "auto") return false;
  if (sitzung?.source?.scanWorkflow !== "skinreact") return false;
  const fotos = Array.isArray(sitzung?.photos) ? sitzung.photos.length : 0;
  if (!(fotos > 0 || Number(bericht?.photos) > 0)) return false;
  const seit = zeit(einstellung.gesetztAm);
  const angelegt = zeit(sitzung?.createdAt || bericht?.createdAt);
  if (!Number.isFinite(seit) || !Number.isFinite(angelegt) || angelegt < seit) return false;
  return frei(bericht);
}

// Noch nicht gestoppt und noch nicht freigegeben?
function frei(bericht) {
  if (bericht?.skinreactAuto?.gestoppt === true) return false;
  if (bericht?.skinreact?.art === "produkteignung" && bericht?.skinreact?.freigabeAt) return false;
  return true;
}

function freigabe(jetzt = new Date().toISOString()) {
  return {
    skinreact: { bereich: BEREICH, freigabeAt: jetzt, art: "produkteignung" },
    skinreactAuto: { art: "auto", quelle: "server", freigabeAt: jetzt }
  };
}

module.exports = { autoFaellig, frei, freigabe, WARTEN_MS, BEREICH };
