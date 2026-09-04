// Die Rechnung hinter dem Lifeskin-Bericht.
//
// Reine Funktionen, kein Firebase, kein DOM. Sie liegen getrennt vom Adapter,
// weil der sich nicht laden laesst, ohne dass eine Firebase-Verbindung
// aufgebaut wird - und was den Bericht traegt, muss pruefbar sein. Dieselbe
// Trennung wie bei der Landing-Auswertung.
//
// Hier faellt die Zahl, um die es geht: die Kaufquote je abgeschlossener
// Analyse.

// Die Stufen des Trichters in der Reihenfolge, in der sie durchlaufen werden.
// Sie muessen genau die sein, die der Trichter schreibt (lifeskin-session.js).
// Kommt dort ein Schritt dazu und hier nicht, faellt er aus der Auswertung
// heraus, ohne dass etwas kaputtgeht - aber der Trichter zeigt dann eine
// Stufe zu wenig.
export const TRICHTER_STUFEN = Object.freeze([
  { id: "opened", label: "Seite geoeffnet" },
  { id: "named", label: "Name eingegeben" },
  { id: "camera", label: "Kamera gestartet" },
  { id: "captured", label: "Foto aufgenommen" },
  { id: "result", label: "Befund gesehen" },
  { id: "offer", label: "Empfehlung gesehen" },
  { id: "address", label: "Anschrift begonnen" },
  { id: "ordered", label: "Bestellt" }
]);

function alsZahl(wert) {
  const zahl = Number(wert);
  return Number.isFinite(zahl) ? zahl : 0;
}

// Der Geschaeftstag, nicht der UTC-Tag.
//
// Kosovo und Albanien liegen ein bis zwei Stunden vor UTC. Wer die ersten
// zehn Zeichen der ISO-Zeit nimmt, schiebt jede Bestellung zwischen
// Mitternacht und zwei Uhr auf den Vortag - "Umsatz heute" stuende dann auf
// null, waehrend das Geld schon da ist. Aufgefallen ist es erst, weil ein
// Test nachts lief.
//
// sv-SE liefert von Haus aus JJJJ-MM-TT, und genau diese Form wird hier
// verglichen und sortiert.
export const GESCHAEFTSZONE = "Europe/Belgrade";

const TAGESFORM = new Intl.DateTimeFormat("sv-SE", {
  timeZone: GESCHAEFTSZONE,
  year: "numeric", month: "2-digit", day: "2-digit"
});

export function tagesschluessel(iso) {
  const zeit = Date.parse(iso);
  if (!Number.isFinite(zeit)) return "";
  return TAGESFORM.format(new Date(zeit));
}

export function heuteSchluessel(versatzTage = 0) {
  return TAGESFORM.format(new Date(Date.now() - versatzTage * 86400000));
}

// Eine Sitzung, wie der Bericht sie braucht.
//
// Nimmt Kennung und Rohdaten, nicht das Firestore-Dokument: So laesst sich
// die Aufbereitung im Test mit einem einfachen Objekt pruefen.
export function normalisiere(id, rohdaten) {
  const daten = rohdaten || {};
  const bestellung = daten.order || null;
  return {
    id,
    createdAt: daten.createdAt || "",
    updatedAt: daten.updatedAt || "",
    tag: tagesschluessel(daten.createdAt),
    step: daten.step || "opened",
    name: daten.name || "",
    ageBand: daten.ageBand || "",
    sprache: daten.sprache || "",
    device: daten.device || {},
    source: daten.source || {},
    metrics: daten.metrics || null,
    ratios: daten.ratios || null,
    skinType: daten.skinType || "",
    findings: Array.isArray(daten.findings) ? daten.findings : [],
    recommended: Array.isArray(daten.recommended) ? daten.recommended : [],
    photoRefs: Array.isArray(daten.photoRefs) ? daten.photoRefs : [],
    phone: daten.phone || "",
    phoneConsent: daten.phoneConsent === true,
    address: daten.address || null,
    order: bestellung,
    timings: daten.timings || {},
    // Die drei Zustaende, um die es im Bericht geht.
    hatBestellt: Boolean(bestellung?.orderId),
    hatAnschrift: Boolean(daten.address && (daten.address.strasse || daten.address.ort)),
    hatTelefon: Boolean(daten.phone)
  };
}

// Wie weit ist eine Sitzung gekommen?
function stufenIndex(step) {
  const i = TRICHTER_STUFEN.findIndex((s) => s.id === step);
  return i < 0 ? 0 : i;
}

export function baueTrichter(sitzungen) {
  const erreicht = TRICHTER_STUFEN.map(() => 0);
  for (const sitzung of sitzungen) {
    const bis = stufenIndex(sitzung.step);
    // Wer Schritt vier erreicht hat, hat auch eins bis drei gesehen. Ohne
    // diese Zeile zaehlte der Trichter nur den letzten Schritt und saehe aus
    // wie eine Treppe statt wie ein Trichter.
    for (let i = 0; i <= bis; i += 1) erreicht[i] += 1;
  }
  const start = erreicht[0] || 0;
  return TRICHTER_STUFEN.map((stufe, i) => ({
    ...stufe,
    anzahl: erreicht[i],
    anteil: start ? erreicht[i] / start : 0,
    // Der Verlust in genau diesem Schritt - die Zahl, die sagt, wo Geld
    // liegen bleibt.
    verlust: i === 0 ? 0 : (erreicht[i - 1] ? (erreicht[i - 1] - erreicht[i]) / erreicht[i - 1] : 0)
  }));
}

// Ein Gerät zaehlt je halbe Stunde als eine Sitzung.
//
// Ohne diese Zusammenfassung blaehen Testaufrufe und Neuladen die Zahlen auf,
// und die Kaufquote saehe schlechter aus, als sie ist.
export function entdopple(sitzungen, fensterMs = 30 * 60 * 1000) {
  const nachSchluessel = new Map();
  for (const sitzung of sitzungen) {
    const kennung = [
      sitzung.device?.os || "",
      sitzung.device?.screen || "",
      sitzung.source?.utmCampaign || "",
      sitzung.name || ""
    ].join("|");
    const zeit = Date.parse(sitzung.createdAt) || 0;

    const vorhandene = nachSchluessel.get(kennung) || [];
    // Eine Sitzung, die im selben Fenster liegt: die weiter fortgeschrittene
    // gewinnt, denn sie ist der echte Versuch.
    const treffer = vorhandene.find((v) => Math.abs((Date.parse(v.createdAt) || 0) - zeit) < fensterMs);
    if (!treffer) {
      vorhandene.push(sitzung);
      nachSchluessel.set(kennung, vorhandene);
      continue;
    }
    if (stufenIndex(sitzung.step) > stufenIndex(treffer.step)) {
      vorhandene[vorhandene.indexOf(treffer)] = sitzung;
    }
  }
  return Array.from(nachSchluessel.values()).flat();
}

export function baueKennzahlen(sitzungen) {
  const heute = heuteSchluessel();
  const gestern = heuteSchluessel(1);
  const vor7 = heuteSchluessel(7);

  const imZeitraum = (ab) => sitzungen.filter((s) => s.tag >= ab);
  const analysen = (liste) => liste.filter((s) => stufenIndex(s.step) >= stufenIndex("captured"));
  const abgeschlossen = (liste) => liste.filter((s) => stufenIndex(s.step) >= stufenIndex("result"));
  const bestellungen = (liste) => liste.filter((s) => s.hatBestellt);

  const heutige = sitzungen.filter((s) => s.tag === heute);
  const gestrige = sitzungen.filter((s) => s.tag === gestern);
  const woche = imZeitraum(vor7);

  const abgeschlossenGesamt = abgeschlossen(sitzungen);
  const bestelltGesamt = bestellungen(sitzungen);

  // Anschrift begonnen, aber nicht bestellt, und aelter als eine halbe
  // Stunde - vorher koennte jemand noch tippen.
  const jetzt = Date.now();
  const abbrecher = sitzungen.filter((s) =>
    s.hatAnschrift && !s.hatBestellt
    && (jetzt - (Date.parse(s.updatedAt) || 0)) > 30 * 60 * 1000
  );

  const kontakte = sitzungen.filter((s) => s.hatTelefon && !s.hatBestellt);

  const umsatz = (liste) => liste.reduce((summe, s) => summe + alsZahl(s.order?.total), 0);

  return {
    analysenHeute: analysen(heutige).length,
    analysenGestern: analysen(gestrige).length,
    analysenWoche: analysen(woche).length,
    abschlussQuote: sitzungen.length ? abgeschlossenGesamt.length / sitzungen.length : 0,
    // Die Leitzahl: Bestellungen je abgeschlossener Analyse.
    kaufQuote: abgeschlossenGesamt.length ? bestelltGesamt.length / abgeschlossenGesamt.length : 0,
    umsatzHeute: umsatz(bestellungen(heutige)),
    umsatzWoche: umsatz(bestellungen(woche)),
    bestellungenHeute: bestellungen(heutige).length,
    abbrecher,
    kontakte,
    offenerBetrag: abbrecher.length * 43
  };
}

// Kaufquote je Anzeige. Die Antwort auf die Frage, welche Werbung wirklich
// verkauft - und nicht nur Klicks bringt.
export function baueHerkunft(sitzungen) {
  const nachKampagne = new Map();
  for (const sitzung of sitzungen) {
    const schluessel = sitzung.source?.utmCampaign || sitzung.source?.utmSource || "(ohne Kennzeichnung)";
    const eintrag = nachKampagne.get(schluessel) || { kampagne: schluessel, sitzungen: 0, abgeschlossen: 0, bestellt: 0, umsatz: 0 };
    eintrag.sitzungen += 1;
    if (stufenIndex(sitzung.step) >= stufenIndex("result")) eintrag.abgeschlossen += 1;
    if (sitzung.hatBestellt) { eintrag.bestellt += 1; eintrag.umsatz += alsZahl(sitzung.order?.total); }
    nachKampagne.set(schluessel, eintrag);
  }
  return Array.from(nachKampagne.values())
    .map((e) => ({ ...e, kaufQuote: e.abgeschlossen ? e.bestellt / e.abgeschlossen : 0 }))
    .sort((a, b) => b.umsatz - a.umsatz || b.sitzungen - a.sitzungen);
}

export function baueVerteilung(sitzungen) {
  const hauttypen = new Map();
  const altersgruppen = new Map();
  const befunde = new Map();

  for (const sitzung of sitzungen) {
    if (sitzung.skinType) hauttypen.set(sitzung.skinType, (hauttypen.get(sitzung.skinType) || 0) + 1);
    if (sitzung.ageBand) altersgruppen.set(sitzung.ageBand, (altersgruppen.get(sitzung.ageBand) || 0) + 1);
    for (const befund of sitzung.findings) {
      if (!befund || alsZahl(befund.stufe) < 1) continue;
      befunde.set(befund.id, (befunde.get(befund.id) || 0) + 1);
    }
  }
  const sortiert = (karte) => Array.from(karte.entries())
    .map(([id, anzahl]) => ({ id, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl);

  return { hauttypen: sortiert(hauttypen), altersgruppen: sortiert(altersgruppen), befunde: sortiert(befunde) };
}

export function baueTagesverlauf(sitzungen, tage = 30) {
  const nachTag = new Map();
  for (let i = tage - 1; i >= 0; i -= 1) {
    nachTag.set(heuteSchluessel(i), { tag: heuteSchluessel(i), analysen: 0, bestellungen: 0, umsatz: 0 });
  }
  for (const sitzung of sitzungen) {
    const eintrag = nachTag.get(sitzung.tag);
    if (!eintrag) continue;
    if (stufenIndex(sitzung.step) >= stufenIndex("captured")) eintrag.analysen += 1;
    if (sitzung.hatBestellt) { eintrag.bestellungen += 1; eintrag.umsatz += alsZahl(sitzung.order?.total); }
  }
  return Array.from(nachTag.values());
}
