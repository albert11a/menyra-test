// DIE DERGESAT (Versand ueber Posta Beki) - Regeln und Rechnung an EINER
// Stelle (Auftrag Inhaber 05.10.).
//
// Ablauf:
//   1. Heart, Akte einer Analyse, Karte "Bestellung": Posta Beki eintragen.
//      Erst damit steht die Bestellung auf /dergesat (Chip "Porosiat").
//   2. /dergesat: "Gati" (gepackt) -> Gati. Dort "Te Beki" -> Dërguar.
//      Dort "Pranuar" oder "Anuluar". Kommt eine Anuluar zurueck:
//      "E kthyem në depo" (Auftrag Inhaber 06.10.).
//   3. Heart zeigt denselben Stand als Chip unter der Bestellung und
//      ordnet sie in der Karte "Bestellungen" in denselben Chip ein.
//
// Geld (alles ohne Anuluar - eine stornierte Bestellung zaehlt nirgends):
//   Pritje barazim  = je Bestellung, die Porosi/Gati (neu), Dërguar oder
//                     Pranuar ist und noch nicht barazuar: Gesamtpreis -
//                     2,50 € (Post). Porosi und Gati sind fuers Geld
//                     dasselbe (Gati heisst nur: abholbereit) und stehen in
//                     der Karte zusammen als "Porosi të reja" ueber Dërguar
//                     (Wunsch Inhaber 06.10.).
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

export const STATUSET = Object.freeze(["porosi", "gati", "derguar", "pranuar", "anuluar"]);

// Die Chips: auf /dergesat und in Heart in DIESER Reihenfolge und mit
// DIESEN Worten.
export const STATUS_CHIPS = Object.freeze([
  Object.freeze({ id: "porosi", label: "Porosiat", njejes: "Porosi" }),
  Object.freeze({ id: "gati", label: "Gati", njejes: "Gati" }),
  Object.freeze({ id: "derguar", label: "Dërguar", njejes: "Dërguar" }),
  Object.freeze({ id: "pranuar", label: "Pranuar", njejes: "Pranuar" }),
  Object.freeze({ id: "anuluar", label: "Anuluar", njejes: "Anuluar" })
]);

// Welche Schritte es gibt - und welche Riba selbst gehen darf. Dieselben
// Paare stehen in firestore.rules (dergesaRibaNdryshon).
export const KALIMET_RIBA = Object.freeze({
  porosi: Object.freeze(["gati"]),
  gati: Object.freeze(["derguar"]),
  derguar: Object.freeze(["pranuar", "anuluar"]),
  pranuar: Object.freeze([]),
  anuluar: Object.freeze([])
});

// Zurueck geht nur Heart, und nur, solange noch nichts abgerechnet ist.
// Anuluar bleibt Anuluar - wie "Als storniert markieren" in Heart.
export const KTHIMI = Object.freeze({ gati: "porosi", derguar: "gati", pranuar: "derguar" });

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

// DIE NAMEN AUF /dergesat (Wunsch Inhaber 05.10.): Riba packt nach den
// Namen auf der Flasche - LF ACNE heisst dort BPO, LF MOISTUR heisst DAILY.
// Erst beim Zeichnen umbenannt: Was gespeichert ist, bleibt der echte Name,
// und schon eingetragene Bestellungen zeigen sofort den kurzen.
const KURZNAMEN = Object.freeze([
  Object.freeze({ muster: /^lf[\s-]*acne$/i, emri: "BPO" }),
  Object.freeze({ muster: /^lf[\s-]*moist(ur|ure)?$/i, emri: "DAILY" })
]);
// Ein Set ohne Einzelzeilen (nur sein Titel gespeichert): das Acne-Set ist
// LF ACNE + LF MOISTUR.
const SET_INHALT = Object.freeze([
  Object.freeze({ muster: /^(acne duo|seti kundër akneve)$/i, produkte: Object.freeze(["BPO", "DAILY"]) })
]);

export function emriShkurt(emri) {
  const e = tekst(emri, 80).replace(/\s+/g, " ");
  return (KURZNAMEN.find((k) => k.muster.test(e)) || {}).emri || e;
}

// ["2× LF ACNE", "LF MOISTUR"] -> [{ sasia: 2, emri: "BPO" }, { sasia: 1, emri: "DAILY" }].
// Derselbe Name zweimal wird zusammengezaehlt.
export function produkteNeDergesa(produkte) {
  const rreshtat = new Map();
  for (const roh of produkte || []) {
    const t = tekst(roh, 80);
    if (!t) continue;
    const m = t.match(/^(\d+)\s*[×x]\s*(.+)$/i);
    const sasia = m ? Math.max(1, Number(m[1]) || 1) : 1;
    const emri = m ? m[2] : t;
    const set = SET_INHALT.find((x) => x.muster.test(emri.trim()));
    for (const e of set ? set.produkte : [emriShkurt(emri)]) {
      rreshtat.set(e, (rreshtat.get(e) || 0) + sasia);
    }
  }
  return [...rreshtat.entries()].map(([emri, sasia]) => ({ sasia, emri }));
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
    gatiAt: zeit(roh?.gatiAt),
    derguarAt: zeit(roh?.derguarAt),
    pranuarAt: zeit(roh?.pranuarAt),
    anuluarAt: zeit(roh?.anuluarAt),
    barazuarAt: zeit(roh?.barazuarAt),
    ribaPaguarAt: zeit(roh?.ribaPaguarAt),
    // Anuluar und wieder im Lager (Knopf "E kthyem në depo").
    kthyerAt: zeit(roh?.kthyerAt)
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
  // dann geht es von Porosi oder Gati direkt auf Dërguar oder Pranuar.
  const kapercim = roli === "heart" && ["porosi", "gati"].includes(d.statusi) && ["derguar", "pranuar"].includes(ne);
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

// Was zurueck muss: eine Anuluar, die schon unterwegs war (derguarAt) und
// noch nicht wieder im Lager ist. Ohne derguarAt hat sie das Haus nie
// verlassen.
export function prituriKthim(d) {
  return d?.statusi === "anuluar" && Boolean(d.derguarAt) && !d.kthyerAt;
}

// "E kthyem në depo" - Riba und Heart, nur bei prituriKthim. Dieselben
// Felder stehen in firestore.rules (dergesaRibaKthen).
export function kthimNeDepo(d, { roli = "riba", jetzt = new Date().toISOString() } = {}) {
  if (!prituriKthim(d)) return null;
  return { kthyerAt: jetzt, updatedAt: jetzt, nga: roli === "heart" ? "heart" : "riba" };
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

// Die Karten oben (ohne Ndepo - die rechnet llogaritDepon).
export function llogarit(liste) {
  const te = (liste || []).filter((d) => d && d.statusi !== "anuluar");
  const shuma = (l, vlera) => cent(l.reduce((s, d) => s + vlera(d), 0));

  const reja = te.filter((d) => d.statusi === "porosi" || d.statusi === "gati");
  const neRruge = te.filter((d) => d.statusi === "derguar" && !d.barazuarAt);
  const gatiBarazim = te.filter((d) => d.statusi === "pranuar" && !d.barazuarAt);
  const barazuar = te.filter((d) => d.statusi === "pranuar" && d.barazuarAt);
  const pritjeRiba = te.filter((d) => d.statusi === "derguar");
  const perRiba = te.filter((d) => d.statusi === "pranuar" && !d.ribaPaguarAt);
  const paguarRiba = te.filter((d) => d.statusi === "pranuar" && d.ribaPaguarAt);
  const riba = () => DERGESA.ribaPerPorosi;

  const sipasKohes = (l, fusha) => [...l].sort((a, b) => String(b[fusha] || "").localeCompare(String(a[fusha] || "")));

  return {
    pritjeBarazim: {
      lista: sipasKohes([...reja, ...neRruge, ...gatiBarazim], "updatedAt"),
      numri: reja.length + neRruge.length + gatiBarazim.length,
      shuma: cent(shuma(reja, netoPosta) + shuma(neRruge, netoPosta) + shuma(gatiBarazim, netoPosta)),
      reja: { numri: reja.length, shuma: shuma(reja, netoPosta) },
      neRruge: { numri: neRruge.length, shuma: shuma(neRruge, netoPosta) },
      gati: { numri: gatiBarazim.length, shuma: shuma(gatiBarazim, netoPosta), kennungen: gatiBarazim.map((d) => d.kennung) }
    },
    barazuar: {
      numri: barazuar.length,
      shuma: shuma(barazuar, netoPosta),
      grupet: grupoSipasKohes(barazuar, "barazuarAt", netoPosta),
      lista: sipasKohes(barazuar, "barazuarAt")
    },
    pritjeRiba: { numri: pritjeRiba.length, shuma: shuma(pritjeRiba, riba), lista: sipasKohes(pritjeRiba, "derguarAt") },
    perRiba: { numri: perRiba.length, shuma: shuma(perRiba, riba), kennungen: perRiba.map((d) => d.kennung), lista: sipasKohes(perRiba, "pranuarAt") },
    paguarRiba: {
      numri: paguarRiba.length,
      shuma: shuma(paguarRiba, riba),
      grupet: grupoSipasKohes(paguarRiba, "ribaPaguarAt", riba),
      lista: sipasKohes(paguarRiba, "ribaPaguarAt")
    }
  };
}

// NDEPO - DER LAGERBESTAND (Auftrag Inhaber 06.10., korrigiert 06.10.).
//
// Gezeigt wird das MATERIAL im Lager, keine Produktzahl ("92 BPO" war
// falsch verstanden): Shishet, Stikerat und je Krem die ml.
//
// Woher: Heart, Karte mit den Einkaufszahlen (die liest nur das
// CEO-Konto; /dergesat holt sie fuer den Inhaber und gibt sie als
// "lenda" hierher): Shishet und Stikerat (Stueck), Kremet (Menge, je
// Produkt). Ein Produkt = 1 Shishe + 1 Stiker + Mbushja ml Krem.
//
// Was ABGEHT: jedes Produkt, das gepackt wurde - Gati, Dërguar, Pranuar
// und jede Anuluar, die schon gepackt war (gatiAt oder derguarAt). Das
// Material steckt in der Flasche und kommt nie zurueck ins Lager, auch
// nicht bei einer Anuluar.
//
// ANULIME: Eine gepackte Anuluar wird ein fertiges Produkt im Lager
// ("Produkte të gatshme") - sofort, wenn sie das Haus nie verlassen hat,
// sonst sobald "E kthyem në depo" gedrueckt ist. Bis dahin: "Pritje për
// kthim". Nie gepackt (Storno aus Porosi): zaehlt nirgends.
//
// lenda = null (Riba darf die Einkaufszahlen nicht lesen): nur
// Produkte të gatshme und Pritje për kthim.
const DEPO_PRODUKTE = Object.freeze(["BPO", "DAILY"]);

export function emriProduktitDepo(id) {
  return emriShkurt(String(id || "").replace(/[-_]+/g, " ").toUpperCase());
}

function shtoProdukte(harta, d) {
  for (const p of produkteNeDergesa(d.produkte)) harta.set(p.emri, (harta.get(p.emri) || 0) + p.sasia);
}

const numer = (wert) => {
  const n = Number(String(wert ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

// Gepackt = das Material ist verbraucht.
export function ePaketuar(d) {
  if (!d) return false;
  if (["gati", "derguar", "pranuar"].includes(d.statusi)) return true;
  return d.statusi === "anuluar" && Boolean(d.gatiAt || d.derguarAt);
}

// Eine Anuluar, die als fertiges Produkt im Lager steht.
export function eGatshmeNeDepo(d) {
  return d?.statusi === "anuluar" && ePaketuar(d) && (Boolean(d.kthyerAt) || !d.derguarAt);
}

export function llogaritDepon(liste, lenda = null) {
  const te = (liste || []).filter(Boolean);
  const paketuar = te.filter(ePaketuar);
  const kthim = te.filter(prituriKthim);
  const gatshmeL = te.filter(eGatshmeNeDepo);

  const dalur = new Map();
  for (const d of paketuar) shtoProdukte(dalur, d);
  const pritje = new Map();
  for (const d of kthim) shtoProdukte(pritje, d);
  const gatshme = new Map();
  for (const d of gatshmeL) shtoProdukte(gatshme, d);
  const copeDalur = [...dalur.values()].reduce((s, n) => s + n, 0);
  const rendit = (a, b) => (DEPO_PRODUKTE.indexOf(a) + 1 || 99) - (DEPO_PRODUKTE.indexOf(b) + 1 || 99) || a.localeCompare(b);
  const rreshta = (harta) => [...harta.entries()].map(([emri, sasia]) => ({ emri, sasia })).sort((a, b) => rendit(a.emri, b.emri));
  const sipasKohes = (l, fusha) => [...l].sort((a, b) => String(b[fusha] || "").localeCompare(String(a[fusha] || "")));

  let lendaLlogari = null;
  if (lenda) {
    const mbushja = numer(lenda.mbushja) || 30;
    const rresht = (blere, del) => ({ blere, dalur: del, mbetur: blere - del });
    const ml = new Map();
    for (const k of Array.isArray(lenda.kreme) ? lenda.kreme : []) {
      if (!k?.produkt) continue;
      const emri = emriProduktitDepo(k.produkt);
      ml.set(emri, (ml.get(emri) || 0) + numer(k.menge) * (k.einheit === "l" ? 1000 : 1));
    }
    // Krem je Produkt: was eingekauft ist, minus Mbushja je gepacktes Produkt.
    const kremet = [...new Set([...ml.keys(), ...dalur.keys()])].sort(rendit)
      .map((emri) => ({ emri, ...rresht(Math.round(ml.get(emri) || 0), Math.round((dalur.get(emri) || 0) * mbushja)) }));
    lendaLlogari = {
      mbushja,
      shishe: rresht(Math.floor(numer(lenda.shisheStueck)), copeDalur),
      stiker: rresht(Math.floor(numer(lenda.stikerStueck)), copeDalur),
      kremet,
      updatedAt: String(lenda.updatedAt || "")
    };
  }

  return {
    lenda: lendaLlogari,
    pritjeKthim: { numri: kthim.length, produkte: rreshta(pritje), lista: sipasKohes(kthim, "anuluarAt") },
    gatshme: { numri: gatshmeL.length, produkte: rreshta(gatshme), lista: sipasKohes(gatshmeL, "anuluarAt") },
    dalur: { numri: paketuar.length, cope: copeDalur }
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
