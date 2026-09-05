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
//
// ZWEI SORTEN STUFEN, und der Unterschied hat einen Grund:
//
// Die einen stehen im Schritt der Sitzung - das ist der Weg durch den
// Trichter bis zum fertigen Scan. Die anderen stehen in eigenen Feldern:
// Sie passieren auf der Befundseite, und die schreibt bewusst keinen
// Schritt. Sonst koennte ein spaeter Besuch derselben Seite den Fall in
// einen anderen Zustand schieben, und der Trichter zaehlte einen Fortschritt,
// den es nicht gab.
export const TRICHTER_STUFEN = Object.freeze([
  { id: "opened", label: "Seite geoeffnet" },
  { id: "named", label: "Name eingegeben" },
  { id: "camera", label: "Kamera gestartet" },
  { id: "captured", label: "Foto aufgenommen" },
  // Nicht mehr "Befund gesehen": Es gibt keinen Befund im Trichter. Der Scan
  // ist fertig, der Fall liegt bei Dr. Gashi.
  { id: "result", label: "Scan abgeschlossen" },
  // Ab hier die Befundseite.
  { id: "berichtGeoeffnet", label: "Befundseite geoeffnet", feld: "berichtGeoeffnet" },
  { id: "waClick", label: "WhatsApp angetippt", feld: "waClick" },
  { id: "waSent", label: "Nachricht bestaetigt", feld: "waSent" },
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

// Ein Tag zurueck heisst ein Kalendertag zurueck, nicht 86.400.000
// Millisekunden.
//
// Belgrad stellt zweimal im Jahr die Uhr um. An diesen beiden Tagen hat der
// Tag 23 oder 25 Stunden, und ein fester Millisekundenabzug landet dann im
// falschen Tag: "gestern" waere entweder noch heute oder schon vorgestern.
// Der Vergleich "heute gegen gestern" stuende an diesem Tag auf Unsinn, und
// niemand wuerde es merken.
//
// Gerechnet wird deshalb auf dem Kalender: heutiges Datum in Belgrad
// nehmen, davon Tage abziehen. Mittag als Uhrzeit, damit auch der Abzug
// selbst keine Zeitzone mehr beruehrt.
export function heuteSchluessel(versatzTage = 0) {
  const heute = TAGESFORM.format(new Date());
  if (!versatzTage) return heute;
  const [jahr, monat, tag] = heute.split("-").map(Number);
  const punkt = Date.UTC(jahr, monat - 1, tag, 12) - versatzTage * 86400000;
  const d = new Date(punkt);
  const zwei = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${zwei(d.getUTCMonth() + 1)}-${zwei(d.getUTCDate())}`;
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
    // Fehlt der Anlegezeitpunkt, wird der letzte Schreibzeitpunkt genommen.
    //
    // Ein Netz unter einem behobenen Fehler: Eine Sitzung ohne createdAt
    // bekam den Tag "" und fiel damit aus jeder Tageszahl heraus - der
    // Trichter zeigte sie, "Analysen heute" nicht. Still zu verschwinden
    // ist das Schlimmste, was eine Zahl tun kann. Lieber der etwas spaetere
    // Zeitpunkt als gar keiner.
    createdAt: daten.createdAt || daten.updatedAt || "",
    updatedAt: daten.updatedAt || "",
    tag: tagesschluessel(daten.createdAt || daten.updatedAt),
    step: daten.step || "opened",
    name: daten.name || "",
    // Die Fallnummer, die der Patient sieht und in WhatsApp schickt. Ohne
    // sie kann die Aerztin eine Nachricht keinem Fall zuordnen.
    code: daten.code || "",
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
    // Wie die Aufnahme zustande kam. Ohne diese vier steht in der
    // Einzelansicht nicht, worauf der Befund beruht - und ob man ihm
    // glauben darf.
    ringAnteil: Number.isFinite(Number(daten.ringAnteil)) ? Number(daten.ringAnteil) : null,
    views: Number.isFinite(Number(daten.views)) ? Number(daten.views) : null,
    mesh: daten.mesh === true,
    mmJeBildpunkt: Number.isFinite(Number(daten.mmJeBildpunkt)) ? Number(daten.mmJeBildpunkt) : null,
    // Welche Blickrichtungen als Foto vorliegen. Steht hier weniger als drei,
    // ist der Ring nicht herumgekommen.
    photos: Array.isArray(daten.photos) ? daten.photos : [],
    // Was auf der Befundseite passiert ist.
    //
    // Der Scan endet mit der Uebergabe an mnyra.com/analiza/<kennung>. Ohne
    // diese vier endete der Bericht genau dort - und die Frage, ob dieser
    // Weg traegt, waere nicht zu beantworten: Wer nie ankommt, ist auf dem
    // Weg dorthin verloren gegangen, und das liegt dann nicht am Befund.
    berichtGeoeffnet: daten.berichtGeoeffnet === true,
    waClick: daten.waClick === true,
    waSent: daten.waSent === true,
    linkKopiert: daten.linkKopiert === true,
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
    let bis = stufenIndex(sitzung.step);
    // Die Stufen der Befundseite stehen nicht im Schritt, sondern als
    // eigene Felder - siehe oben bei TRICHTER_STUFEN.
    for (const [i, stufe] of TRICHTER_STUFEN.entries()) {
      if (stufe.feld && sitzung[stufe.feld] === true && i > bis) bis = i;
    }
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

// Zwei Eintraege, die derselbe Besuch sind, zu einem machen.
//
// ZWEITE FASSUNG, und die erste war gefaehrlich. Sie fasste alles zusammen,
// was in einer halben Stunde dasselbe Betriebssystem, dieselbe
// Bildschirmgroesse, dieselbe Kampagne und denselben Namen hatte - und ein
// Besucher, der noch keinen Namen eingegeben hat, hat den Namen "".
//
// In einer Werbekampagne kommen fast alle mit demselben Handymodell aus
// derselben Anzeige. Nachgerechnet: 60 echte Besucher wurden zu 14. Die
// Zahl "Seite geoeffnet" stand damit auf einem Viertel des wahren Werts,
// und die Kaufquote sah viermal besser aus als sie war. Das ist die
// teuerste Sorte falscher Zahl - man dreht das Werbebudget auf, weil eine
// Anzeige zu funktionieren scheint.
//
// Jetzt wird nur noch zusammengelegt, was einen NAMEN hat. Zwei Menschen
// mit demselben Vornamen auf demselben Handymodell in derselben halben
// Stunde gibt es; sie sind selten genug, um dafuer die Neuladen-Faelle
// loszuwerden. Ohne Namen wird nie zusammengelegt.
//
// Der eigentliche Grund fuer Doppeleintraege ist ohnehin behoben: Die
// Sitzungskennung liegt jetzt im sessionStorage des Tabs, ein Neuladen
// schreibt also in dasselbe Dokument weiter (lifeskin-session.js).
export function entdopple(sitzungen, fensterMs = 30 * 60 * 1000) {
  const nachSchluessel = new Map();
  const einzeln = [];
  for (const sitzung of sitzungen) {
    const name = String(sitzung.name || "").trim().toLowerCase();
    // Kein Name, kein Zusammenlegen. Ein leeres Feld ist kein Merkmal.
    if (!name) { einzeln.push(sitzung); continue; }

    const kennung = [
      sitzung.device?.os || "",
      sitzung.device?.screen || "",
      sitzung.source?.utmCampaign || "",
      name
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
  return [...einzeln, ...Array.from(nachSchluessel.values()).flat()];
}

// Der Preis, an dem der offene Betrag haengt.
//
// Stand als 43 fest im Code, waehrend das Set 53 kostet - jede Zahl "offen"
// war um ein Fuenftel zu niedrig. Jetzt ein Wert mit Namen, den der Adapter
// aus der Konfiguration setzen kann, und ein Test haelt ihn mit dem Preis
// im Trichter zusammen.
export const SET_PREIS = 53;

export function baueKennzahlen(sitzungen, { setPreis = SET_PREIS } = {}) {
  const heute = heuteSchluessel();
  const gestern = heuteSchluessel(1);
  // Sieben Tage heisst heute und die sechs davor. Mit 7 waeren es acht -
  // die Kachel haette dauerhaft einen Tag zu viel gezeigt.
  const vor7 = heuteSchluessel(6);

  const imZeitraum = (ab) => sitzungen.filter((s) => s.tag >= ab);
  const analysen = (liste) => liste.filter((s) => stufenIndex(s.step) >= stufenIndex("captured"));
  const abgeschlossen = (liste) => liste.filter((s) => stufenIndex(s.step) >= stufenIndex("result"));
  const bestellungen = (liste) => liste.filter((s) => s.hatBestellt);

  const heutige = sitzungen.filter((s) => s.tag === heute);
  const gestrige = sitzungen.filter((s) => s.tag === gestern);
  const woche = imZeitraum(vor7);

  // Die Quoten gelten fuer denselben Zeitraum wie die Kacheln daneben.
  //
  // Vorher rechneten sie ueber die gesamte Zeit. Das klingt harmlos und ist
  // es nicht: Je laenger es laeuft, desto traeger wird die Zahl, bis eine
  // schlechte Woche gar nicht mehr auffaellt - und die eigenen Testaufrufe
  // stecken auf Dauer mit drin. Eine Quote, die sich nicht mehr bewegt,
  // beantwortet keine Frage.
  const abgeschlossenWoche = abgeschlossen(woche);
  const bestelltWoche = bestellungen(woche);

  // Anschrift begonnen, aber nicht bestellt, und aelter als eine halbe
  // Stunde - vorher koennte jemand noch tippen.
  const jetzt = Date.now();
  const abbrecher = sitzungen.filter((s) =>
    s.hatAnschrift && !s.hatBestellt
    && (jetzt - (Date.parse(s.updatedAt) || 0)) > 30 * 60 * 1000
  );

  const kontakte = sitzungen.filter((s) => s.hatTelefon && !s.hatBestellt);

  const umsatz = (liste) => liste.reduce((summe, s) => summe + alsZahl(s.order?.total), 0);

  // Sitzungen, denen jedes Datum fehlt. Sie zaehlen in keiner Tageszahl mit
  // und sollen deshalb wenigstens benannt sein - eine Zahl, die lautlos
  // kleiner wird, faellt niemandem auf.
  const ohneDatum = sitzungen.filter((s) => !s.tag).length;

  return {
    ohneDatum,
    analysenHeute: analysen(heutige).length,
    analysenGestern: analysen(gestrige).length,
    analysenWoche: analysen(woche).length,
    abschlussQuote: woche.length ? abgeschlossenWoche.length / woche.length : 0,
    // Die Leitzahl: Bestellungen je abgeschlossener Analyse, sieben Tage.
    kaufQuote: abgeschlossenWoche.length ? bestelltWoche.length / abgeschlossenWoche.length : 0,
    // Damit im Bericht steht, worauf die Quoten beruhen. Eine Quote aus drei
    // Analysen ist keine Quote, und das muss man sehen koennen.
    quotenBasis: woche.length,
    umsatzHeute: umsatz(bestellungen(heutige)),
    umsatzWoche: umsatz(bestellungen(woche)),
    bestellungenHeute: bestellungen(heutige).length,
    abbrecher,
    kontakte,
    offenerBetrag: abbrecher.length * setPreis
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
    // Der Gang durch normalisiere() setzt findings immer auf eine Liste.
    // Die Absicherung hier steht trotzdem: Wer die Rechnung spaeter einmal
    // auf rohe Daten loslaesst, soll keine leere Ansicht bekommen.
    for (const befund of sitzung.findings || []) {
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
