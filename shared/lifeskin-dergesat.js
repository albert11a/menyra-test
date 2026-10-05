// DIE DERGESAT (Versand ueber Posta Beki) - Regeln und Rechnung an EINER
// Stelle (Auftrag Inhaber 05.10.).
//
// Ablauf:
//   1. Heart, Akte einer Analyse, Karte "Bestellung": Posta Beki eintragen.
//      Erst damit steht die Bestellung auf /dergesat (Chip "Porosiat").
//   2. /dergesat: "Te Beki" -> Dërguar. Dort "Pranuar" oder "Anuluar".
//   3. Heart zeigt denselben Stand als Chip unter der Bestellung und
//      ordnet sie in der Karte "Bestellungen" in denselben Chip ein.
//
// Geld (alles ohne Anuluar - eine stornierte Bestellung zaehlt nirgends):
//   Pritje barazim  = je Bestellung, die Dërguar oder Pranuar ist und noch
//                     nicht barazuar: Gesamtpreis - 2,50 € (Post).
//   Pritje për Riben = 2 € je Bestellung, die Dërguar ist.
//   € për Riben     = 2 € je Bestellung, die Pranuar ist und Riba noch
//                     nicht ausbezahlt wurde.
//   Barazuar / Paguar Ribës: was schon abgerechnet ist, je Abrechnung.
//
// Heart, /dergesat und die Pruefungen rechnen alle hiermit - sonst stuende
// auf der einen Seite ein anderer Betrag als auf der anderen.

export const DERGESA = Object.freeze({
  // Was die Post je Bestellung einbehaelt.
  postaTarifa: 2.5,
  // Was Riba je angenommener Bestellung bekommt.
  ribaPerPorosi: 2,
  // Der Benutzername fuer Riba auf /dergesat und die Adresse dahinter.
  // Firebase verlangt eine E-Mail und mindestens sechs Zeichen Passwort -
  // deshalb steht vor dem getippten Passwort ein fester Vorsatz. Das
  // Passwort selbst steht nirgends im Code.
  ribaPerdoruesi: "kadrija",
  ribaEmail: "kadrija@dergesat.mnyra.com",
  fjalekalimParashtese: "dergesat-",
  // Wie lang eine Posta-Beki-Nummer hoechstens sein darf (auch firestore.rules).
  postaBekiMax: 60
});

export const STATUSET = Object.freeze(["porosi", "derguar", "pranuar", "anuluar"]);

// Die Chips: auf /dergesat und in Heart in DIESER Reihenfolge und mit
// DIESEN Worten.
export const STATUS_CHIPS = Object.freeze([
  Object.freeze({ id: "porosi", label: "Porosiat", njejes: "Porosi" }),
  Object.freeze({ id: "derguar", label: "Dërguar", njejes: "Dërguar" }),
  Object.freeze({ id: "pranuar", label: "Pranuar", njejes: "Pranuar" }),
  Object.freeze({ id: "anuluar", label: "Anuluar", njejes: "Anuluar" })
]);

// Welche Schritte es gibt - und welche Riba selbst gehen darf. Dieselben
// Paare stehen in firestore.rules (dergesaRibaNdryshon).
export const KALIMET_RIBA = Object.freeze({
  porosi: Object.freeze(["derguar"]),
  derguar: Object.freeze(["pranuar", "anuluar"]),
  pranuar: Object.freeze([]),
  anuluar: Object.freeze([])
});

// Zurueck geht nur Heart, und nur, solange noch nichts abgerechnet ist.
// Anuluar bleibt Anuluar - wie "Als storniert markieren" in Heart.
export const KTHIMI = Object.freeze({ derguar: "porosi", pranuar: "derguar" });

const tekst = (wert, max = 200) => String(wert ?? "").trim().slice(0, max);
const zeit = (wert) => {
  const t = tekst(wert, 40);
  return t && Number.isFinite(Date.parse(t)) ? t : "";
};

export function cent(betrag) {
  return Math.round((Number(betrag) || 0) * 100) / 100;
}

export function euroSq(betrag) {
  const b = cent(betrag);
  return `${b.toLocaleString("de-DE", { minimumFractionDigits: Number.isInteger(b) ? 0 : 2, maximumFractionDigits: 2 })} €`;
}

export function postaBekiGueltig(wert) {
  return tekst(wert, DERGESA.postaBekiMax + 1).replace(/\s+/g, " ").slice(0, DERGESA.postaBekiMax);
}

// Ein Dokument aus lifeskin/{tenant}/dergesat/{kennung}, sauber.
export function dergesaLesen(roh = {}, kennung = "") {
  const statusi = STATUSET.includes(roh?.statusi) ? roh.statusi : "porosi";
  return {
    kennung: tekst(kennung || roh?.kennung, 80),
    kodi: tekst(roh?.kodi, 40),
    postaBeki: postaBekiGueltig(roh?.postaBeki),
    produkte: (Array.isArray(roh?.produkte) ? roh.produkte : []).map((p) => tekst(p, 80)).filter(Boolean).slice(0, 20),
    cmimi: cent(Math.max(0, Number(roh?.cmimi) || 0)),
    statusi,
    nga: tekst(roh?.nga, 20),
    createdAt: zeit(roh?.createdAt),
    updatedAt: zeit(roh?.updatedAt),
    derguarAt: zeit(roh?.derguarAt),
    pranuarAt: zeit(roh?.pranuarAt),
    anuluarAt: zeit(roh?.anuluarAt),
    barazuarAt: zeit(roh?.barazuarAt),
    ribaPaguarAt: zeit(roh?.ribaPaguarAt)
  };
}

// Die Zeit, nach der eine Zeile in ihrem Chip steht.
export function kohaStatusit(d) {
  return d?.[`${d.statusi}At`] || d?.createdAt || "";
}

// Porosiat: die aelteste zuerst (sie wartet am laengsten). Alle anderen:
// die juengste zuerst.
export function renditPerChip(liste, statusi) {
  const nachStatus = (liste || []).filter((d) => d.statusi === statusi);
  return nachStatus.sort((a, b) => {
    const x = String(kohaStatusit(a));
    const y = String(kohaStatusit(b));
    return statusi === "porosi" ? x.localeCompare(y) : y.localeCompare(x);
  });
}

export function numeroPerChip(liste) {
  const numri = Object.fromEntries(STATUSET.map((s) => [s, 0]));
  for (const d of liste || []) numri[d.statusi] = (numri[d.statusi] || 0) + 1;
  return numri;
}

export function mundTeKthehet(d) {
  return Boolean(KTHIMI[d?.statusi]) && !d.barazuarAt && !d.ribaPaguarAt;
}

// Was ein Schritt in das Dokument schreibt. Gibt null zurueck, wenn der
// Schritt nicht erlaubt ist - fuer Riba wie in firestore.rules, fuer Heart
// zusaetzlich das Zuruecknehmen.
export function ndryshimi(d, ne, { roli = "riba", jetzt = new Date().toISOString() } = {}) {
  if (!d || !STATUSET.includes(ne) || d.statusi === ne) return null;
  const perpara = (KALIMET_RIBA[d.statusi] || []).includes(ne);
  const kthim = roli === "heart" && KTHIMI[d.statusi] === ne && mundTeKthehet(d);
  // Heart darf ausserdem jede offene Bestellung stornieren (wie in Heart
  // "Als storniert markieren") - nicht aber eine schon abgerechnete.
  const storno = roli === "heart" && ne === "anuluar" && !d.barazuarAt && !d.ribaPaguarAt;
  // Heart meldet den Versand auch ueber die alten Knoepfe in der Akte -
  // dann geht es von Porosi direkt auf Pranuar.
  const kapercim = roli === "heart" && d.statusi === "porosi" && ne === "pranuar";
  if (!perpara && !kthim && !storno && !kapercim) return null;
  const felder = { statusi: ne, updatedAt: jetzt, nga: roli === "heart" ? "heart" : "riba" };
  if (kthim) {
    // Der Zeitpunkt des zurueckgenommenen Schritts faellt weg.
    felder[`${d.statusi}At`] = "";
    return felder;
  }
  felder[`${ne}At`] = jetzt;
  // Nur Heart: Riba darf in diesem Schritt nichts sonst schreiben
  // (firestore.rules), und von Dërguar aus steht derguarAt ohnehin da.
  if (roli === "heart" && ne === "pranuar" && !d.derguarAt) felder.derguarAt = jetzt;
  return felder;
}

function grupoSipasKohes(liste, fusha, vlera) {
  const grupet = new Map();
  for (const d of liste) {
    const at = d[fusha];
    const g = grupet.get(at) || { at, numri: 0, shuma: 0 };
    g.numri += 1;
    g.shuma = cent(g.shuma + vlera(d));
    grupet.set(at, g);
  }
  return [...grupet.values()].sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

export function netoPosta(d) {
  return cent(Math.max(0, (Number(d?.cmimi) || 0) - DERGESA.postaTarifa));
}

// Die fuenf Karten unter der Liste.
export function llogarit(liste) {
  const te = (liste || []).filter((d) => d && d.statusi !== "anuluar");
  const shuma = (l, vlera) => cent(l.reduce((s, d) => s + vlera(d), 0));

  const neRruge = te.filter((d) => d.statusi === "derguar" && !d.barazuarAt);
  const gatiBarazim = te.filter((d) => d.statusi === "pranuar" && !d.barazuarAt);
  const barazuar = te.filter((d) => d.statusi === "pranuar" && d.barazuarAt);
  const pritjeRiba = te.filter((d) => d.statusi === "derguar");
  const perRiba = te.filter((d) => d.statusi === "pranuar" && !d.ribaPaguarAt);
  const paguarRiba = te.filter((d) => d.statusi === "pranuar" && d.ribaPaguarAt);
  const riba = () => DERGESA.ribaPerPorosi;

  return {
    pritjeBarazim: {
      numri: neRruge.length + gatiBarazim.length,
      shuma: cent(shuma(neRruge, netoPosta) + shuma(gatiBarazim, netoPosta)),
      neRruge: { numri: neRruge.length, shuma: shuma(neRruge, netoPosta) },
      gati: { numri: gatiBarazim.length, shuma: shuma(gatiBarazim, netoPosta), kennungen: gatiBarazim.map((d) => d.kennung) }
    },
    barazuar: {
      numri: barazuar.length,
      shuma: shuma(barazuar, netoPosta),
      grupet: grupoSipasKohes(barazuar, "barazuarAt", netoPosta)
    },
    pritjeRiba: { numri: pritjeRiba.length, shuma: shuma(pritjeRiba, riba) },
    perRiba: { numri: perRiba.length, shuma: shuma(perRiba, riba), kennungen: perRiba.map((d) => d.kennung) },
    paguarRiba: {
      numri: paguarRiba.length,
      shuma: shuma(paguarRiba, riba),
      grupet: grupoSipasKohes(paguarRiba, "ribaPaguarAt", riba)
    }
  };
}

// DER STAND EINER BESTELLUNG IN HEART - fuer den Chip unter der Bestellung
// und fuer die Einordnung in die Chips der Karte "Bestellungen".
//
// Storniert in Heart heisst Anuluar, auch ohne Posta Beki. Ohne Eintrag
// auf /dergesat gilt, was in Heart als Versand gemeldet ist.
export function statusiNeHeart({ order = null, bericht = null, dergesa = null } = {}) {
  if (order?.status === "storniert" || dergesa?.statusi === "anuluar") return "anuluar";
  if (dergesa && STATUSET.includes(dergesa.statusi)) return dergesa.statusi;
  const b = String(bericht?.status || "");
  if (b === "zugestellt") return "pranuar";
  if (b === "versandt") return "derguar";
  return "porosi";
}

// Fuer den Login: "kadrija" -> Ribas Adresse; eine E-Mail bleibt, wie sie
// ist (so meldet sich der Inhaber mit seinem Heart-Zugang an).
export function hyrja(perdoruesi, fjalekalimi) {
  const p = tekst(perdoruesi, 200).toLowerCase();
  if (!p) return null;
  if (p === DERGESA.ribaPerdoruesi || p === DERGESA.ribaEmail) {
    return { email: DERGESA.ribaEmail, password: `${DERGESA.fjalekalimParashtese}${String(fjalekalimi ?? "")}`, roli: "riba" };
  }
  if (p.includes("@")) return { email: p, password: String(fjalekalimi ?? ""), roli: "heart" };
  return null;
}
