// Der Lifeskin-Bereich in Heart.
//
// Aufbau wie gewuenscht und wie im uebrigen Heart: Kacheln oben, Bloecke
// darunter. Die Reihenfolge der Bloecke ist keine Geschmacksfrage - sie
// folgt der Reihenfolge, in der jemand handelt:
//
// 1. Trichter - wo bleibt Geld liegen?
// 2. Bestellungen - was ist zu tun?
// 3. Abbrecher und Kontakte - wen kann ich noch anrufen?
// 4. Herkunft - welche Anzeige verkauft wirklich?
// 5. Analysen - was ist im Einzelnen passiert?
// 6. Produkte und Abdeckung - was fehlt im Sortiment?
//
// Gerendert wird als Zeichenkette, wie ueberall in Heart.

import { escapeHtml } from "./heart-ui-utils.js";
import { renderHeartIcon } from "./heart-icons.js";
// Der Setpreis kommt aus derselben Quelle wie im Trichter. Zwei Zahlen an
// zwei Stellen sind genau der Fehler, der hier schon einmal zehn Euro je
// Set gekostet hat.
import { SET_PREIS } from "./heart-lifeskin-berechnung.js";
// Die vorbereiteten Mittel. Dieselbe Liste, mit der gebaut und getestet
// wird - was hier fehlt, kann Dr. Gashi mit einem Druck anlegen.
import { STANDARD_PRODUKTE } from "../lifeskin/lifeskin-catalog.js";

// Die Platzhalter im persoenlichen Satz.
//
// Einmal je Produkt geschrieben, bei jeder Patientin gefuellt. Der
// Unterschied ist der Kern der Sache: Ein Satz je Patientin von Hand
// waeren Minuten, und Minuten sind die Obergrenze dieses Geschaefts.
export const PLATZHALTER = Object.freeze(["emri", "gjetja", "mosha"]);

const BEISPIEL = Object.freeze({ emri: "Arta", gjetja: "skuqjen", mosha: "25-34" });

export function fuellePlatzhalter(vorlage, werte = {}) {
  let text = String(vorlage || "");
  for (const name of PLATZHALTER) {
    // Kein replaceAll - aeltere Webansichten kennen es nicht.
    text = text.split(`{${name}}`).join(String(werte[name] ?? ""));
  }
  return text.trim();
}

// Wie der Kopf stand. Bewusst "Kopf nach rechts" und nicht "rechte Wange":
// Welche Wange dabei zu sehen ist, haengt daran, ob das Bild gespiegelt ist -
// und diese Frage ist im Messweg noch nicht abschliessend geklaert. Lieber
// beschreiben, was sicher stimmt, als etwas Anatomisches behaupten.
const BLICK_NAMEN = Object.freeze({
  gerade: "Gerade",
  rechts: "Kopf nach rechts",
  links: "Kopf nach links"
});

function prozent(anteil) {
  return `${Math.round((Number(anteil) || 0) * 100)} %`;
}

function euro(betrag) {
  return `${Math.round(Number(betrag) || 0)} €`;
}

function uhrzeit(iso) {
  const zeit = Date.parse(iso);
  if (!Number.isFinite(zeit)) return "";
  return new Date(zeit).toLocaleTimeString("de-DE", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Belgrade"
  });
}

function datumKurz(iso) {
  const zeit = Date.parse(iso);
  if (!Number.isFinite(zeit)) return "";
  return new Date(zeit).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", timeZone: "Europe/Belgrade"
  });
}

// Eine Kachel. Der Vergleichswert steht darunter, nicht daneben - auf dem
// Handy waere sonst die Zahl selbst kleiner als ihr Zusatz.
function renderKachel({ marke, wert, zusatz, richtung }) {
  const klasse = richtung === "auf" ? " heart-lifeskin-kachel__zusatz--auf"
    : richtung === "ab" ? " heart-lifeskin-kachel__zusatz--ab" : "";
  return `
    <div class="heart-lifeskin-kachel">
      <span class="heart-lifeskin-kachel__marke">${escapeHtml(marke)}</span>
      <b class="heart-lifeskin-kachel__wert">${escapeHtml(wert)}</b>
      ${zusatz ? `<span class="heart-lifeskin-kachel__zusatz${klasse}">${escapeHtml(zusatz)}</span>` : ""}
    </div>`;
}

function renderKacheln(kennzahlen) {
  const differenz = kennzahlen.analysenHeute - kennzahlen.analysenGestern;
  // Wenn Sitzungen ohne Datum dabei sind, muss das oben stehen. Sonst
  // widersprechen sich Trichter und Kacheln, und man sucht den Fehler in
  // der falschen Zahl.
  const ohneDatum = Number(kennzahlen.ohneDatum) || 0;
  return `
    ${ohneDatum ? `<p class="heart-lifeskin-warnung">
      ${ohneDatum} ${ohneDatum === 1 ? "Analyse hat" : "Analysen haben"} kein Datum und
      ${ohneDatum === 1 ? "zaehlt" : "zaehlen"} in den Tageszahlen nicht mit.
    </p>` : ""}
    <div class="heart-lifeskin-kacheln">
      ${renderKachel({
        marke: "Analysen heute",
        wert: String(kennzahlen.analysenHeute),
        zusatz: `${differenz >= 0 ? "+" : ""}${differenz} ggue. gestern`,
        richtung: differenz > 0 ? "auf" : differenz < 0 ? "ab" : ""
      })}
      ${renderKachel({ marke: "Analysen 7 Tage", wert: String(kennzahlen.analysenWoche) })}
      ${renderKachel({
        marke: "Abschlussquote",
        wert: prozent(kennzahlen.abschlussQuote),
        // Die Basis steht dabei, weil eine Quote aus drei Besuchen keine
        // Quote ist - und ohne diese Zahl sieht man das nicht.
        zusatz: `bis Befund · aus ${kennzahlen.quotenBasis ?? 0}`
      })}
      ${renderKachel({
        marke: "Kaufquote",
        wert: prozent(kennzahlen.kaufQuote),
        zusatz: `je Befund · 7 Tage`,
        richtung: kennzahlen.kaufQuote >= 0.05 ? "auf" : "ab"
      })}
      ${renderKachel({
        marke: "Umsatz heute",
        wert: euro(kennzahlen.umsatzHeute),
        zusatz: `${kennzahlen.bestellungenHeute} Sets`
      })}
      ${renderKachel({
        marke: "WhatsApp-Kontakte",
        wert: String(kennzahlen.kontakte.length),
        zusatz: "ohne Kauf"
      })}
      ${renderKachel({
        marke: "Abbrueche m. Anschrift",
        wert: String(kennzahlen.abbrecher.length),
        zusatz: `${euro(kennzahlen.offenerBetrag)} offen`,
        richtung: kennzahlen.abbrecher.length ? "ab" : ""
      })}
    </div>`;
}

// Der wichtigste Block. Er sagt, wo Geld liegen bleibt - und deshalb steht
// der Verlust je Schritt daneben, nicht nur der Bestand.
// Wie weit im Bericht gelesen wurde.
//
// Der Trichter endet praktisch bei "Befundseite geoeffnet" - danach lagen
// zwei Bildschirmlaengen Bericht, ueber die nichts bekannt war, und genau
// dort steigt aus, wer aussteigt. Diese Liste sagt, WO jemand aufhoert,
// nicht nur DASS er aufhoert. Der Satz darunter benennt, was der groesste
// Verlust bedeutet - eine Zahl ohne Deutung wird nicht benutzt.
const LESE_DEUTUNG = Object.freeze({
  sahSchnitt: "Der Befund wird nicht zu Ende gelesen — das ist ein Textproblem, kein Preisproblem.",
  sahTherapie: "Der Uebergang vom Befund zur Therapie traegt nicht.",
  sahPreis: "Die Therapie wird gesehen, der Preis nicht — sie scrollen vorher weg.",
  kasseGeoeffnet: "Der Preis wird gesehen und nicht angenommen. Hier liegt es am Preis.",
  hatBestellt: "Der Bestellschirm wird geoeffnet und nicht zu Ende gebracht."
});

function renderLesetiefe(lesetiefe) {
  if (!lesetiefe?.length) return "";
  const start = lesetiefe[0]?.anzahl || 0;
  const schlimmster = lesetiefe.reduce((a, b) => (b.verlust > (a?.verlust ?? -1) ? b : a), null);

  const zeilen = lesetiefe.map((marke) => {
    const breite = start ? Math.max(0.6, (marke.anzahl / start) * 100) : 0;
    const hervor = marke === schlimmster && marke.verlust > 0.2
      ? " heart-lifeskin-stufe--schlimmst" : "";
    return `
      <div class="heart-lifeskin-stufe${hervor}">
        <span class="heart-lifeskin-stufe__name">${escapeHtml(marke.label)}</span>
        <span class="heart-lifeskin-stufe__spur">
          <span class="heart-lifeskin-stufe__balken" style="width:${breite.toFixed(1)}%"></span>
        </span>
        <b class="heart-lifeskin-stufe__zahl">${marke.anzahl}</b>
        <span class="heart-lifeskin-stufe__anteil">${prozent(marke.anteil)}</span>
        <span class="heart-lifeskin-stufe__verlust">${marke.verlust > 0 ? `−${prozent(marke.verlust)}` : ""}</span>
      </div>`;
  }).join("");

  const deutung = schlimmster && schlimmster.verlust > 0.2
    ? LESE_DEUTUNG[schlimmster.id] : "";

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Wie weit im Bericht gelesen wird</h3>
      <div class="heart-lifeskin-trichter">${zeilen}</div>
      ${deutung ? `<p class="heart-lifeskin-block__fuss">${escapeHtml(deutung)}</p>` : ""}
    </section>`;
}

function renderTrichter(trichter) {
  const start = trichter[0]?.anzahl || 0;
  const schlimmster = trichter.reduce((a, b) => (b.verlust > (a?.verlust ?? -1) ? b : a), null);

  const zeilen = trichter.map((stufe) => {
    const breite = start ? Math.max(0.6, (stufe.anzahl / start) * 100) : 0;
    const hervor = stufe === schlimmster && stufe.verlust > 0.2 ? " heart-lifeskin-stufe--schlimmst" : "";
    return `
      <div class="heart-lifeskin-stufe${hervor}">
        <span class="heart-lifeskin-stufe__name">${escapeHtml(stufe.label)}</span>
        <span class="heart-lifeskin-stufe__spur">
          <span class="heart-lifeskin-stufe__balken" style="width:${breite.toFixed(1)}%"></span>
        </span>
        <b class="heart-lifeskin-stufe__zahl">${stufe.anzahl}</b>
        <span class="heart-lifeskin-stufe__anteil">${prozent(stufe.anteil)}</span>
        <span class="heart-lifeskin-stufe__verlust">${stufe.verlust > 0 ? `−${prozent(stufe.verlust)}` : ""}</span>
      </div>`;
  }).join("");

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Trichter</h3>
      <div class="heart-lifeskin-trichter">${zeilen}</div>
      ${schlimmster && schlimmster.verlust > 0.2
        ? `<p class="heart-lifeskin-block__fuss">Groesster Verlust bei „${escapeHtml(schlimmster.label)}" — dort steht der Preis.</p>`
        : ""}
    </section>`;
}

function renderBestellungen(sitzungen) {
  const bestellungen = sitzungen.filter((s) => s.hatBestellt).slice(0, 40);
  if (!bestellungen.length) {
    return leererBlock("Bestellungen", "Noch keine Bestellung.");
  }
  const zeilen = bestellungen.map((s) => `
    <button type="button" class="heart-lifeskin-zeile" data-action="lifeskin-sitzung" data-id="${escapeHtml(s.id)}">
      <span class="heart-lifeskin-zeile__zeit">${escapeHtml(datumKurz(s.createdAt))} ${escapeHtml(uhrzeit(s.createdAt))}</span>
      <span class="heart-lifeskin-zeile__leib">
        <b>${escapeHtml(s.address?.name || s.name || "—")}</b>
        <small>${escapeHtml([s.address?.strasse, s.address?.ort].filter(Boolean).join(", "))}</small>
      </span>
      <span class="heart-lifeskin-zeile__wert">${escapeHtml(euro(s.order?.total))}</span>
      <span class="heart-lifeskin-marke heart-lifeskin-marke--neu">${escapeHtml(s.order?.status || "neu")}</span>
    </button>`).join("");

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Bestellungen</h3>
      <div class="heart-lifeskin-zeilen">${zeilen}</div>
    </section>`;
}

// Die Liste zum Anrufen. Sie steht bewusst weit oben: Hier liegt Geld, das
// schon fast im Haus war.
function renderNachfassen(kennzahlen) {
  const eintraege = [
    ...kennzahlen.abbrecher.map((s) => ({ sitzung: s, art: "Anschrift" })),
    ...kennzahlen.kontakte.map((s) => ({ sitzung: s, art: "WhatsApp" }))
  ].sort((a, b) => String(b.sitzung.updatedAt).localeCompare(String(a.sitzung.updatedAt))).slice(0, 60);

  if (!eintraege.length) {
    return leererBlock("Nachfassen", "Niemand offen — alle haben bestellt oder keine Nummer hinterlassen.");
  }

  const zeilen = eintraege.map(({ sitzung, art }) => {
    const nummer = sitzung.phone || sitzung.address?.telefon || "";
    return `
    <button type="button" class="heart-lifeskin-zeile" data-action="lifeskin-sitzung" data-id="${escapeHtml(sitzung.id)}">
      <span class="heart-lifeskin-zeile__zeit">${escapeHtml(datumKurz(sitzung.updatedAt))} ${escapeHtml(uhrzeit(sitzung.updatedAt))}</span>
      <span class="heart-lifeskin-zeile__leib">
        <b>${escapeHtml(sitzung.name || sitzung.address?.name || "—")}</b>
        <small>${escapeHtml(nummer || "ohne Nummer")} · ${escapeHtml(sitzung.code || "")}</small>
      </span>
      <span class="heart-lifeskin-marke heart-lifeskin-marke--offen">${escapeHtml(art)}</span>
    </button>`;
  }).join("");

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Nachfassen</h3>
      <p class="heart-lifeskin-block__fuss">Scan fertig, nicht gekauft — mit Fallnummer und Kontakt.</p>
      <div class="heart-lifeskin-zeilen">${zeilen}</div>
    </section>`;
}

function renderHerkunft(herkunft) {
  if (!herkunft.length) return leererBlock("Herkunft je Anzeige", "Noch keine gekennzeichneten Aufrufe.");
  const zeilen = herkunft.slice(0, 20).map((h) => `
    <div class="heart-lifeskin-zeile heart-lifeskin-zeile--still">
      <span class="heart-lifeskin-zeile__leib">
        <b>${escapeHtml(h.kampagne)}</b>
        <small>${h.sitzungen} Aufrufe · ${h.abgeschlossen} Scans · ${h.bestellt} Bestellungen</small>
      </span>
      <span class="heart-lifeskin-zeile__wert">${escapeHtml(prozent(h.kaufQuote))}</span>
      <span class="heart-lifeskin-zeile__wert">${escapeHtml(euro(h.umsatz))}</span>
    </div>`).join("");

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Herkunft je Anzeige</h3>
      <p class="heart-lifeskin-block__fuss">Welche Anzeige verkauft — nicht welche Klicks bringt.</p>
      <div class="heart-lifeskin-zeilen">${zeilen}</div>
    </section>`;
}

// Die Ansicht, nach der ausdruecklich gefragt wurde: Welcher Befund hat noch
// kein Produkt? Ohne sie bekaeme ein Kunde eine Diagnose und darunter nichts.
function renderProdukte(produkte) {
  // Welche der vorbereiteten Mittel noch nicht angelegt sind.
  const da = new Set((produkte || []).map((p) => String(p.id)));
  const fehlend = STANDARD_PRODUKTE.filter((p) => !da.has(String(p.id)));

  const zeilen = (produkte || []).map((p) => `
    <button type="button" class="heart-lifeskin-zeile" data-action="lifeskin-produkt" data-id="${escapeHtml(p.id)}">
      <span class="heart-lifeskin-zeile__leib">
        <b>${escapeHtml(p.name || p.id)}</b>
        <small>${escapeHtml(p.inhalt || "")}</small>
      </span>
      <span class="heart-lifeskin-zeile__wert">${escapeHtml(euro(p.einzelpreis))}</span>
      <span class="heart-lifeskin-marke ${p.availability === "visible" ? "heart-lifeskin-marke--neu" : "heart-lifeskin-marke--offen"}">${escapeHtml(p.availability || "?")}</span>
    </button>`).join("");

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Produkte</h3>
      <div class="heart-lifeskin-zeilen">${zeilen || `<p class="heart-lifeskin-leer">Noch kein Produkt angelegt.</p>`}</div>
      ${fehlend.length ? `
      <!-- Die vorbereiteten Mittel in einem Zug.
           Fuenf Formulare mit Wirkstoffen, Anwendung und Regeln von Hand
           auszufuellen dauert einen Abend - und ohne sie bleibt der
           Therapieabschnitt beim Patienten leer, weil es nichts zu
           verbinden gibt. Angelegt wird nur, was fehlt; ein vorhandenes
           Mittel wird nie ueberschrieben. -->
      <div class="heart-lifeskin-anlegen">
        <p>${fehlend.length} der fünf vorbereiteten Mittel fehlen noch:
           <b>${fehlend.map((p) => escapeHtml(p.name)).join(", ")}</b>.
           Sie kommen mit Wirkstoffen, Anwendung und den Regeln für die Therapiebegründung —
           Fotos und Preise lassen sich danach ändern.</p>
        <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-produkte-anlegen">
          ${fehlend.length} Mittel anlegen
        </button>
      </div>` : ""}
      <button type="button" class="heart-lifeskin-neu" data-action="lifeskin-produkt-neu">
        ${renderHeartIcon("plus")}<span>Produkt anlegen</span>
      </button>
    </section>`;
}

// Die Liste, die Dr. Gashi abarbeitet.
//
// SIE WAR LEER, und zwar still. Gefiltert wurde auf einen Hauttyp - und den
// schreibt der Trichter nicht mehr, seit die Software keinen Befund mehr
// stellt. Jede abgeschlossene Analyse fiel damit aus der Liste, und dort
// stand "Noch keine abgeschlossene Analyse", waehrend die Scans liefen.
//
// Jetzt zaehlt, was zaehlt: ein fertiger Scan. Oben die neuesten, denn die
// warten.
function renderAnalysen(sitzungen) {
  const fertige = sitzungen
    .filter((s) => s.step === "result" || s.hatBestellt || s.berichtGeoeffnet)
    .slice(0, 60);
  if (!fertige.length) {
    return leererBlock("Analysen", "Noch keine abgeschlossene Analyse.");
  }

  const zeilen = fertige.map((s) => {
    // Wie weit er auf seiner Seite gekommen ist. Das ist die Zeile, an der
    // sie sieht, wer auf eine Antwort wartet und wer nie angekommen ist.
    const stand = s.waSent ? "hat geschrieben"
      : s.waClick ? "WhatsApp angetippt"
      : s.linkKopiert ? "Link kopiert"
      : s.berichtGeoeffnet ? "Seite geoeffnet"
      : "Seite noch nicht geoeffnet";
    return `
    <button type="button" class="heart-lifeskin-zeile" data-action="lifeskin-sitzung" data-id="${escapeHtml(s.id)}">
      <span class="heart-lifeskin-zeile__zeit">${escapeHtml(datumKurz(s.createdAt))} ${escapeHtml(uhrzeit(s.createdAt))}</span>
      <span class="heart-lifeskin-zeile__leib">
        <b>${escapeHtml(s.name || "—")}${s.ageBand ? `, ${escapeHtml(s.ageBand)}` : ""}</b>
        <small>${s.code ? `<span class="heart-lifeskin-code">${escapeHtml(s.code)}</span> · ` : ""}${escapeHtml(String((s.photos || []).length))} Fotos · ${escapeHtml(stand)}</small>
      </span>
      ${s.hatBestellt ? `<span class="heart-lifeskin-marke heart-lifeskin-marke--neu">bestellt</span>`
        : s.waSent ? `<span class="heart-lifeskin-marke heart-lifeskin-marke--offen">wartet</span>` : ""}
    </button>`;
  }).join("");

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Analysen</h3>
      <p class="heart-lifeskin-block__fuss">Fertige Scans, die neuesten oben. Antippen zeigt Fotos und alles Weitere.</p>
      <div class="heart-lifeskin-zeilen">${zeilen}</div>
    </section>`;
}

function renderVerteilung(verteilung) {
  const liste = (titel, eintraege, namen) => {
    if (!eintraege.length) return "";
    const summe = eintraege.reduce((s, e) => s + e.anzahl, 0) || 1;
    return `
      <div class="heart-lifeskin-verteilung">
        <h4 class="heart-lifeskin-verteilung__titel">${escapeHtml(titel)}</h4>
        ${eintraege.slice(0, 8).map((e) => `
          <div class="heart-lifeskin-vzeile">
            <span>${escapeHtml(namen?.[e.id] || e.id)}</span>
            <span class="heart-lifeskin-vzeile__spur"><span style="width:${((e.anzahl / summe) * 100).toFixed(1)}%"></span></span>
            <b>${e.anzahl}</b>
          </div>`).join("")}
      </div>`;
  };

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Verteilung</h3>
      <!-- Befunde und Hauttypen standen hier einmal. Der Scan rechnet keine
           mehr, also stand dort dauerhaft nichts. Wer wirklich kommt, sagt
           die Altersgruppe - und danach richtet sich die Anzeige. -->
      <p class="heart-lifeskin-block__fuss">Wer wirklich kommt — danach richtet sich die Anzeige.</p>
      ${liste("Altersgruppen", verteilung.altersgruppen)}
    </section>`;
}

function leererBlock(titel, text) {
  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">${escapeHtml(titel)}</h3>
      <p class="heart-lifeskin-leer">${escapeHtml(text)}</p>
    </section>`;
}

// Die Einzelansicht einer Analyse: alles, was gemessen wurde.
//
// Sie stand fertig da und wurde nie aufgerufen - der Knopf in der Liste war
// nicht verdrahtet. Dazugekommen sind der Weg zurueck, die drei Aufnahmen
// (die jetzt wirklich gespeichert werden) und wie die Aufnahme zustande kam.
export function renderSitzungDetail(sitzung, fotos = null, fotosStatus = "", produkte = [], bericht = null) {
  const zurueck = `<button type="button" class="heart-lifeskin-zurueck" data-action="lifeskin-sitzung-zu">← Alle Analysen</button>`;
  if (!sitzung) {
    return `<div class="heart-lifeskin-detail">${zurueck}
      <p class="heart-lifeskin-leer">Diese Analyse gibt es nicht mehr.</p></div>`;
  }

  const messzeilen = Object.entries(sitzung.metrics || {}).map(([zone, werte]) => {
    if (!werte) return "";
    const spalten = Object.entries(werte)
      .map(([name, wert]) => `<span><small>${escapeHtml(name)}</small>${Number(wert).toFixed(2)}</span>`)
      .join("");
    return `<div class="heart-lifeskin-messzeile"><b>${escapeHtml(zone)}</b><div>${spalten}</div></div>`;
  }).join("");

  // Die drei Aufnahmen. Beschriftet, weil "irgendein Bild vom Kopf" der
  // Aerztin nicht sagt, welche Wange sie da sieht.
  const reihenfolge = ["gerade", "rechts", "links"];
  const vorhanden = reihenfolge.filter((blick) => (fotos || {})[blick]?.jpeg);
  const bilder = vorhanden.map((blick) => `
    <figure class="heart-lifeskin-fotokasten">
      <img class="heart-lifeskin-foto" src="${escapeHtml(fotos[blick].jpeg)}"
           alt="${escapeHtml(BLICK_NAMEN[blick] || blick)}" loading="lazy" />
      <figcaption>${escapeHtml(BLICK_NAMEN[blick] || blick)}</figcaption>
    </figure>`).join("");

  const ohneBild = fotosStatus === "loading" ? "Fotos werden geladen …"
    : fotosStatus === "error" ? "Die Fotos liessen sich nicht laden."
    : "Zu dieser Analyse liegen keine Fotos vor.";

  return `
    <div class="heart-lifeskin-detail">
      ${zurueck}
      ${sitzung.code ? `<div class="heart-lifeskin-fallnummer">
        <span>Fallnummer</span><strong>${escapeHtml(sitzung.code)}</strong>
      </div>` : ""}

      ${renderBefundEditor(sitzung, produkte, bericht)}
      <div class="heart-lifeskin-detail__kopf">
        <b>${escapeHtml(sitzung.name || "—")}${sitzung.ageBand ? `, ${escapeHtml(sitzung.ageBand)}` : ""}</b>
        <small>${escapeHtml(datumKurz(sitzung.createdAt))} ${escapeHtml(uhrzeit(sitzung.createdAt))} ·
          ${escapeHtml(sitzung.device?.os || "")} ${escapeHtml(sitzung.device?.screen || "")}</small>
      </div>

      ${bilder ? `<div class="heart-lifeskin-fotos">${bilder}</div>`
        : `<p class="heart-lifeskin-leer">${escapeHtml(ohneBild)}</p>`}

      <!-- Hier standen einmal Hauttyp, Befunde und Empfehlung.
           Sie sind ersatzlos weg: WIR MACHEN DEN SCAN, DIE ANALYSE MACHT
           DR. GASHI. Eine gerechnete Diagnose in der Akte waere ihre
           Aussage geworden, ohne dass sie sie je getroffen haette. -->

      <div class="heart-lifeskin-detail__block">
        <h4>Seine Seite</h4>
        <p><a class="heart-lifeskin-link" href="/analiza/${escapeHtml(sitzung.id)}"
              target="_blank" rel="noopener">mnyra.com/analiza/${escapeHtml(sitzung.id)}</a></p>
        <p class="heart-lifeskin-leer">Das ist die Seite, die der Patient nach dem Scan
           bekommen hat. Dort wartet er auf Ihren Befund.</p>
      </div>

      <div class="heart-lifeskin-detail__block">
        <h4>Was er dort getan hat</h4>
        ${[["Seite geoeffnet", sitzung.berichtGeoeffnet],
           ["WhatsApp angetippt", sitzung.waClick],
           ["Senden bestaetigt", sitzung.waSent],
           ["Link kopiert", sitzung.linkKopiert]]
          .map(([was, ja]) => `<div class="heart-lifeskin-vzeile">
              <span>${escapeHtml(was)}</span><b>${ja ? "ja" : "nein"}</b></div>`).join("")}
      </div>

      ${sitzung.address ? `
      <div class="heart-lifeskin-detail__block">
        <h4>Anschrift</h4>
        <p>${escapeHtml([sitzung.address.name, sitzung.address.strasse,
             [sitzung.address.plz, sitzung.address.ort].filter(Boolean).join(" "),
             sitzung.address.telefon].filter(Boolean).join(" · "))}</p>
      </div>` : ""}

      ${sitzung.order ? `
      <div class="heart-lifeskin-detail__block">
        <h4>Bestellung</h4>
        <p>${escapeHtml(sitzung.order.orderId || "")} · ${escapeHtml(euro(sitzung.order.total))} ·
           ${escapeHtml(sitzung.order.payment || "")} · ${escapeHtml(sitzung.order.status || "")}</p>
      </div>` : ""}

      <div class="heart-lifeskin-detail__block">
        <h4>Herkunft</h4>
        <p>${escapeHtml([sitzung.source?.utmSource, sitzung.source?.utmCampaign, sitzung.source?.utmContent]
              .filter(Boolean).join(" · ") || "ohne Kennzeichnung")}</p>
      </div>

      <div class="heart-lifeskin-detail__block">
        <h4>Aufnahme</h4>
        <p>Ring ${escapeHtml(prozent(sitzung.ringAnteil))} zu ·
           ${escapeHtml(String(sitzung.views ?? "—"))} Aufnahmen ·
           ${sitzung.mesh ? "mit Gesichtsnetz" : "ohne Gesichtsnetz"} ·
           ${Number.isFinite(Number(sitzung.mmJeBildpunkt))
             ? `${Number(sitzung.mmJeBildpunkt).toFixed(3)} mm je Bildpunkt`
             : "Massstab unbekannt"}</p>
      </div>

      <div class="heart-lifeskin-detail__block">
        <h4>Messwerte</h4>
        ${messzeilen || `<p class="heart-lifeskin-leer">Keine.</p>`}
      </div>
    </div>`;
}

// Der Befund schreiben und freigeben.
//
// Das ist der Arbeitsplatz von Dr. Gashi und der einzige Bildschirm, an dem
// ihre Minuten wirklich haengen. Deshalb steht er ganz oben in der Akte und
// besteht aus so wenig wie moeglich: ein Textfeld, zwei Haken, ein Knopf.
//
// Die Produkte kommen aus einer Auswahlliste. Getippt wird nur der
// persoenliche Satz - und der auch nur, wenn sie will: Ohne Eingabe nimmt
// die Seite den Kurztext des Produkts.
// Der Bogen fuer die Patientenseite.
//
// Genau die Felder, die auf der Seite des Patienten stehen - in genau
// deren Reihenfolge. Er ist die eine Wahrheit fuer beide Wege: Eingefuegtes
// JSON fuellt ihn, und von Hand getippt wird in dieselben Felder. Was
// darin steht, wird freigegeben; nicht das, was zufaellig in der
// Zwischenablage lag.
//
// "lang" ist ein mehrzeiliges Feld, "zahl" eine Zahl, "stufe" die
// Auswahl 0-4 mit den festen Namen der Seite.
export const RAPORT_BOGEN = [
  { id: "fotot", marke: "Fotot e vlerësuara", art: "zahl", hinweis: "z. B. 3" },
  { id: "zonat", marke: "Zonat e vlerësuara", art: "zahl", hinweis: "z. B. 5" },
  { id: "ekzaminimi", marke: "Kërkesa & ekzaminimi i kryer", art: "lang",
    hinweis: "Was beurteilt wurde — leer = Standardsatz mit Zahl der Zonen und Fotos" },
  { id: "gjetjet", marke: "Çfarë vërehet — përmbledhja", art: "lang",
    hinweis: "Der Befundtext, den der Patient zuerst liest" },
  { id: "diagnozaId", marke: "Diagnose-ID", art: "text", hinweis: "Kennung aus dem JSON-Schema" },
  { id: "gjetjaKryesore", marke: "Ndryshimi kryesor", art: "text", hinweis: "Kurzer Hauptbefund" },
  { id: "gjetjaDyta", marke: "Ndryshimi tjetër", art: "text", hinweis: "Leer, wenn keiner belegt ist" },
  { id: "synimi28", marke: "Synimi — vetëm nëse është i përcaktuar", art: "lang", hinweis: "Ohne belegten Plan leer lassen" },
  { id: "diagnoza", marke: "Diagnoza", art: "text", hinweis: "z. B. Acne comedonica" },
  { id: "diagnozaLat", marke: "Emërtimi mjekësor", art: "text",
    hinweis: "z. B. Acne vulgaris, forma comedonica" },
  { id: "niveli", marke: "Niveli — çfarë kërkon", art: "stufe", hinweis: "" },
  { id: "shpjegimi1", marke: "Shpjegimi — fjalia 1", art: "lang",
    hinweis: "Dieselbe Sache ohne ein einziges Fachwort" },
  { id: "shpjegimi2", marke: "Shpjegimi — fjalia 2", art: "lang", hinweis: "" },
  { id: "zbehet", marke: "Pa kujdes — çfarë zbehet vetë", art: "lang", hinweis: "" },
  { id: "nukZbehet", marke: "Pa kujdes — çfarë NUK zbehet", art: "lang",
    hinweis: "Der staerkste Satz der Seite" },
  { id: "pas6Muajsh", marke: "Pa kujdes — pas 6 muajsh", art: "lang", hinweis: "" },
  { id: "keshilla", marke: "Këshillë", art: "text", hinweis: "Ein Satz, der nichts verkauft" }
];

// Fuenf Zonen und fuenf Messwerte - so viele zeigt die Seite, mehr nimmt
// sie gar nicht an. Ein Formular mit zehn Zeilen fuer fuenf Plaetze waere
// eine Einladung, Arbeit umsonst zu tippen.
export const RAPORT_ZONEN = 5;
// Zehn Messwerte, nicht fuenf.
//
// Die Patientenseite behauptet an drei Stellen, dass zehn beurteilt wurden.
// Nahm der Bogen nur fuenf entgegen, war entweder die Behauptung falsch
// oder die Liste unvollstaendig - und aufgefallen ist es dort, wo es am
// teuersten ist: unter "Einzelheiten", die jemand aufklappt und nachzaehlt.
//
// Offen stehen die ersten drei, wie auf der Seite. Die uebrigen sieben
// liegen zugeklappt darunter: Sie kommen aus dem JSON und werden von Hand
// so gut wie nie getippt - zehn mal vier Felder offen waeren ein Formular,
// das niemand ausfuellt.
export const RAPORT_MESSWERTE = 10;
export const RAPORT_MESSWERTE_OFFEN = 3;

export const NIVELI_NAMEN = [
  "0 — E qetë dhe e ekuilibruar (kërkon ruajtje)",
  "1 — Kërkon kujdes parandalues",
  "2 — Kërkon kujdes aktiv",
  "3 — Kërkon kujdes të strukturuar",
  "4 — Kërkon vlerësim dhe ndjekje mjekësore"
];

function bogenFeld(f, wert) {
  const w = wert === 0 ? "0" : String(wert ?? "");
  const gemeinsam = `class="heart-lifeskin-eingabe" data-raport="${escapeHtml(f.id)}"`;
  if (f.art === "lang") {
    return `<textarea ${gemeinsam} rows="4"
      placeholder="${escapeHtml(f.hinweis)}">${escapeHtml(w)}</textarea>`;
  }
  if (f.art === "stufe") {
    const auswahl = ['<option value="">— keine Angabe —</option>']
      .concat(NIVELI_NAMEN.map((name, i) =>
        `<option value="${i}"${w === String(i) ? " selected" : ""}>${escapeHtml(name)}</option>`))
      .join("");
    return `<select ${gemeinsam}>${auswahl}</select>`;
  }
  const art = f.art === "zahl" ? "number" : "text";
  return `<input ${gemeinsam} type="${art}"${f.art === "zahl" ? ' min="0" step="1"' : ""}
    placeholder="${escapeHtml(f.hinweis)}" value="${escapeHtml(w)}" />`;
}

// Die Zonen: Ort und Satz, untereinander.
//
// Nebeneinander quetschte der Satz den Ort auf ein paar Zeichen zusammen -
// ein Feld, in das drei Buchstaben passen, ist kein Feld. Untereinander
// hat beides seine Breite, und eine Linie trennt eine Zone von der
// naechsten: Ohne sie stehen fuenf Zonen als ein Block da.
function zonenBogen(zonen) {
  const zeilen = [];
  for (let i = 0; i < RAPORT_ZONEN; i += 1) {
    const z = zonen[i] || {};
    zeilen.push(`
      <div class="heart-lifeskin-bogen__gruppe">
        <input class="heart-lifeskin-eingabe" type="text"
               data-zona-ort="${i}" placeholder="Zona ${i + 1} — p.sh. Balli"
               value="${escapeHtml(String(z.zona || ""))}" />
        <textarea class="heart-lifeskin-eingabe heart-lifeskin-bogen__zwei" rows="2"
               data-zona-text="${i}"
               placeholder="Çfarë u gjet në këtë zonë">${escapeHtml(String(z.teksti || ""))}</textarea>
      </div>`);
  }
  return zeilen.join("");
}

// Die Messwerte: Name, dann Wert, Grad und Stufe in einer Zeile, dann der
// Satz fuer Laien. Die Stufe traegt auf der Seite den Balken - sie ist das
// Einzige, was sich nicht wegdiskutieren laesst. Auch hier eine Linie je
// Messwert: fuenf mal vier Felder ohne Trennung sind zwanzig lose Felder.
function messBogen(werte) {
  const zeilen = [];
  // Zugeklappt nur, solange in den hinteren sieben nichts steht. Ein Wert,
  // den man nicht sieht, kann man auch nicht nachsehen.
  const hintenGefuellt = werte.slice(RAPORT_MESSWERTE_OFFEN)
    .some((w) => w && String(w.emri || "").trim());

  for (let i = 0; i < RAPORT_MESSWERTE; i += 1) {
    if (i === RAPORT_MESSWERTE_OFFEN) {
      zeilen.push(`
      <details class="heart-lifeskin-bogen__mehr"${hintenGefuellt ? " open" : ""}>
        <summary>Parametrat ${RAPORT_MESSWERTE_OFFEN + 1}-${RAPORT_MESSWERTE} — zakonisht vijnë nga JSON-i</summary>`);
    }
    const w = werte[i] || {};
    const stufe = w.shkalla === 0 || w.shkalla ? String(w.shkalla) : "";
    zeilen.push(`
      <div class="heart-lifeskin-bogen__gruppe">
        <input class="heart-lifeskin-eingabe" type="text" data-par-emri="${i}"
               placeholder="Parametri ${i + 1} — p.sh. Poret e bllokuara"
               value="${escapeHtml(String(w.emri || ""))}" />
        <div class="heart-lifeskin-bogen__reihe">
          <input class="heart-lifeskin-eingabe heart-lifeskin-bogen__eng" type="text"
                 data-par-vlera="${i}" placeholder="Vlera — më shumë në ballë"
                 value="${escapeHtml(String(w.vlera || ""))}" />
          <input class="heart-lifeskin-eingabe heart-lifeskin-bogen__eng" type="text"
                 data-par-grada="${i}" placeholder="Grada — e lehtë"
                 value="${escapeHtml(String(w.grada || ""))}" />
          <select class="heart-lifeskin-eingabe heart-lifeskin-bogen__stufe" data-par-shkalla="${i}">
            ${['<option value="">–</option>'].concat([0, 1, 2, 3, 4].map((n) =>
              `<option value="${n}"${stufe === String(n) ? " selected" : ""}>${n}</option>`)).join("")}
          </select>
        </div>
        <input class="heart-lifeskin-eingabe" type="text" data-par-thjeshte="${i}"
               placeholder="Për pacientin — pa fjalë mjekësore"
               value="${escapeHtml(String(w.thjeshte || ""))}" />
      </div>`);
  }
  zeilen.push("</details>");
  return zeilen.join("");
}

function renderBefundEditor(sitzung, produkte, bericht) {
  const stand = bericht?.status || "wartet";
  const fertig = stand !== "wartet";
  const gewaehlt = new Map(
    (bericht?.produkte || []).map((p) => [String(p.id), String(p.satz || "")])
  );

  const marke = {
    wartet: ["heart-lifeskin-marke--offen", "wartet auf Befund"],
    fertig: ["heart-lifeskin-marke--neu", "freigegeben"],
    bestellt: ["heart-lifeskin-marke--neu", "bestellt"],
    versandt: ["heart-lifeskin-marke--neu", "versendet"],
    zugestellt: ["heart-lifeskin-marke--neu", "zugestellt"]
  }[stand] || ["heart-lifeskin-marke--offen", stand];

  // Die vier Wochen aus der Analyse, flach gemacht fuer das Formular.
  const a = bericht?.analyse || {};
  const zusatz = {
    java_1: (a.javet || [])[0] || "",
    java_2: (a.javet || [])[1] || "",
    java_3: (a.javet || [])[2] || "",
    java_4: (a.javet || [])[3] || ""
  };

  // Der Bogen wird aus dem gespeicherten Bericht vorbelegt. Wer einen
  // freigegebenen Fall noch einmal oeffnet, sieht darin genau das, was der
  // Patient sieht - und kann es aendern, statt es neu zu tippen.
  const raport = bericht?.raport || {};
  const bogenWerte = {
    ...raport,
    fotot: raport.fotot,
    zonat: raport.zonat,
    ekzaminimi: raport.ekzaminimi,
    gjetjet: raport.gjetjet || bericht?.befund || "",
    diagnoza: raport.diagnoza,
    diagnozaLat: raport.diagnozaLat,
    niveli: raport.niveli,
    shpjegimi1: (raport.shpjegimi || [])[0],
    shpjegimi2: (raport.shpjegimi || [])[1],
    zbehet: raport.paKujdes?.zbehet,
    nukZbehet: raport.paKujdes?.nukZbehet,
    pas6Muajsh: raport.paKujdes?.pas6Muajsh,
    keshilla: raport.keshilla
  };
  // Zugeklappt nur, solange nichts darin steht. Ein Wert, den man nicht
  // sieht, kann man auch nicht nachsehen.
  const bogenOffen = Object.values(bogenWerte).some((w) => w === 0 || Boolean(w))
    || (raport.parametrat || []).length > 0
    || Object.values(zusatz).some(Boolean);

  // Die Produktauswahl - und daran haengt der Abschnitt, der auf der Seite
  // bisher gefehlt hat.
  //
  // Beim Anhaken schreibt Heart die Begruendung und die drei Wirkungszeilen
  // fertig in die Felder: aus den Regeln des Produkts, gefuellt mit den
  // Werten AUS DIESER Analyse. Bei fuenfzig Faellen am Tag ist das der
  // Unterschied zwischen machbar und nicht.
  //
  // Geaendert werden kann trotzdem alles. Was von Hand getippt wurde,
  // ruehrt die Automatik nie wieder an - dieselbe Zusage wie beim Bogen,
  // und aus demselben Grund: Ein Feld, das ungefragt zurueckspringt, wird
  // beim zweiten Mal nicht mehr benutzt.
  const gewaehltVeprimi = new Map(
    (bericht?.produkte || []).map((p) => [String(p.id), Array.isArray(p.veprimi) ? p.veprimi : null])
  );

  const zeilen = (produkte || [])
    .filter((p) => p.availability !== "hidden")
    .map((p) => {
      const id = String(p.id);
      const an = gewaehlt.has(id);
      const eigeneZeilen = gewaehltVeprimi.get(id);
      const veprimi = (eigeneZeilen && eigeneZeilen.length ? eigeneZeilen : (p.veprimi?.sq || []))
        .map((x) => String(x || "").trim()).filter(Boolean);
      return `
      <div class="heart-lifeskin-pwahl${an ? " heart-lifeskin-pwahl--an" : ""}">
        <label class="heart-lifeskin-pwahl__kopf">
          <input type="checkbox" data-produkt-wahl value="${escapeHtml(id)}" ${an ? "checked" : ""} />
          <span class="heart-lifeskin-pwahl__leib">
            <b>${escapeHtml(p.name || id)}</b>
            <small>${escapeHtml(p.inhalt || "")}${p.einzelpreis ? ` · ${escapeHtml(euro(p.einzelpreis))}` : ""}${
              p.roli === "baze" ? " · bazë" : p.roli === "mbeshtetje" ? " · mbështetje" : p.roli === "pastrim" ? " · pastrim" : ""}</small>
          </span>
        </label>
        <div class="heart-lifeskin-pwahl__text${an ? "" : " heart-lifeskin-pwahl__text--zu"}"
             data-produkt-block="${escapeHtml(id)}">
          <label class="heart-lifeskin-feld">
            <span>Pse pikërisht ky produkt</span>
            <textarea class="heart-lifeskin-eingabe heart-lifeskin-pwahl__satz" rows="3"
                      data-produkt-satz="${escapeHtml(id)}"
                      placeholder="Wird beim Anhaken aus der Analyse gefuellt">${escapeHtml(gewaehlt.get(id) || "")}</textarea>
          </label>
          <label class="heart-lifeskin-feld">
            <span>Çfarë bën — një rresht për çdo veprim</span>
            <textarea class="heart-lifeskin-eingabe heart-lifeskin-pwahl__veprimi" rows="3"
                      data-produkt-veprimi="${escapeHtml(id)}"
                      placeholder="Höchstens drei Zeilen, je höchstens 70 Zeichen">${escapeHtml(veprimi.join("\n"))}</textarea>
          </label>
          <div class="heart-lifeskin-pwahl__fuss">
            <small data-produkt-stand="${escapeHtml(id)}"></small>
            <button type="button" class="heart-lifeskin-pwahl__neu"
                    data-action="lifeskin-produkt-satz-neu" data-id="${escapeHtml(id)}">zurücksetzen</button>
          </div>
        </div>
      </div>`;
    }).join("");

  return `
    <div class="heart-lifeskin-editor">
      <div class="heart-lifeskin-editor__kopf">
        <h4>Befund</h4>
        <span class="heart-lifeskin-marke ${marke[0]}">${escapeHtml(marke[1])}</span>
      </div>

      <!-- Oben nur das Einfuegen.
           Die Analyse entsteht in einem anderen Fenster und liegt in der
           Zwischenablage, nicht als Datei. Ein Umweg ueber "Speichern
           unter" waere je Patient ein Schritt mehr - bei fuenfzig am Tag
           sind das fuenfzig. Was eingefuegt wird, fuellt den Bogen
           darunter; geaendert werden kann dort trotzdem alles. -->
      <div class="heart-lifeskin-vorlage">
        <textarea class="heart-lifeskin-eingabe" id="lifeskin-json" rows="3"
                  placeholder="JSON der Analyse hier einfuegen — Anfuehrungszeichen und Vorrede sind egal"></textarea>
        <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-prompt-kopieren">Prompt v3 für diesen Fall kopieren</button>
        <textarea class="heart-lifeskin-eingabe" id="lifeskin-prompt-ausgabe" hidden readonly rows="5" aria-label="Vollständiger Prompt für diesen Fall"></textarea>
        <div class="heart-lifeskin-vorlage__reihe">
          <button type="button" class="heart-lifeskin-knopf"
                  data-action="lifeskin-json-uebernehmen">Uebernehmen</button>
          <p class="heart-lifeskin-vorlage__stand" id="lifeskin-vorlage-stand"></p>
        </div>
      </div>

      <!-- Der Bogen. Aufgeklappt, sobald etwas darin steht.
           Er ist derselbe Bogen fuer beide Wege: Eingefuegtes JSON fuellt
           ihn, und wer kein JSON hat, tippt hinein. Freigegeben wird, was
           HIER steht - nicht das, was in der Zwischenablage lag. -->
      <details class="heart-lifeskin-bogen" id="lifeskin-bogen"${bogenOffen ? " open" : ""}>
        <summary>Details der Analyse${bogenOffen ? "" : " — leer"}</summary>
        <label class="heart-lifeskin-feld"><input type="checkbox" data-raport-reviewed${raport.aerztlichGeprueft ? " checked" : ""} /> Dr. Violeta Gashi hat diesen Befund tatsächlich ärztlich geprüft. Nur nach erfolgter Prüfung bestätigen.</label>
        <textarea hidden data-raport-meta>${escapeHtml(JSON.stringify(raport || {}))}</textarea>
        <label class="heart-lifeskin-feld">Begriffe und Erklärungen (JSON, vor Freigabe prüfen)
          <textarea class="heart-lifeskin-eingabe" rows="5" data-raport-terms>${escapeHtml(JSON.stringify(raport.termat || [], null, 2))}</textarea>
        </label>

        <div class="heart-lifeskin-bogen__leib">
          ${RAPORT_BOGEN.map((f) => `
            <label class="heart-lifeskin-feld">
              <span>${escapeHtml(f.marke)}</span>
              ${bogenFeld(f, bogenWerte[f.id])}
            </label>`).join("")}

          <div class="heart-lifeskin-feld">
            <span>Ndryshimet sipas zonave</span>
            ${zonenBogen(raport.zonaLista || [])}
          </div>

          <div class="heart-lifeskin-feld">
            <span>Matjet nga fotot — dhjetë parametrat</span>
            ${messBogen(raport.parametrat || [])}
          </div>

          <!-- Die vier Wochen. Leer heisst: der Standardplan der Seite.
               Ein halber eigener Plan waere schlechter als der ganze
               Standardplan - deshalb zaehlt er nur vollstaendig. -->
          <div class="heart-lifeskin-feld">
            <span>Plani 4-javor — leer = Standardplan</span>
            ${[1, 2, 3, 4].map((n) => `
              <input class="heart-lifeskin-eingabe" type="text" data-zusatz="java_${n}"
                     placeholder="Java ${n}" value="${escapeHtml(zusatz[`java_${n}`] || "")}" />`).join("")}
          </div>
        </div>
      </details>

      <!-- Der Schweregrad. Ein Klick, und aus einem Absatz Text wird eine
           Einordnung. Ohne Angabe bleibt sie weg - lieber nichts als eine
           erfundene. -->
      <label class="heart-lifeskin-feld heart-lifeskin-feld--kurz">
        <span>Schweregrad</span>
        <select class="heart-lifeskin-eingabe" id="lifeskin-schwere">
          ${[["", "— keine Angabe —"], ["leicht", "Leicht"], ["mittel", "Mittel"], ["schwer", "Schwer"]]
            .map(([w, t]) => `<option value="${w}"${(bericht?.schwere || "") === w ? " selected" : ""}>${t}</option>`)
            .join("")}
      </select>
      </label>

      <div class="heart-lifeskin-feld">
        <span>Therapie — Produkte auswaehlen</span>
        ${zeilen || `<p class="heart-lifeskin-leer">Noch kein Produkt angelegt. Erst unten anlegen, dann hier waehlen.</p>`}
      </div>

      <label class="heart-lifeskin-feld heart-lifeskin-feld--kurz">
        <span>Setpreis in Euro</span>
        <input class="heart-lifeskin-eingabe" id="lifeskin-preis" type="number" inputmode="decimal"
               value="${escapeHtml(String(bericht?.preis || SET_PREIS))}" />
      </label>

      <div class="heart-lifeskin-editor__fuss">
        <button type="button" class="heart-lifeskin-knopf heart-lifeskin-knopf--stark"
                data-action="lifeskin-bericht-freigeben" data-id="${escapeHtml(sitzung.id)}">
          ${fertig ? "Aenderungen freigeben" : "Befund freigeben"}
        </button>
        ${fertig ? `<a class="heart-lifeskin-link" href="/analiza/${escapeHtml(sitzung.id)}" target="_blank" rel="noopener">Seite ansehen</a>` : ""}
      </div>

      ${["bestellt", "versandt", "zugestellt"].includes(stand) ? `
      <div class="heart-lifeskin-editor__versand">
        <span>Versand</span>
        <div class="heart-lifeskin-versandknoepfe">
          <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-versand"
                  data-id="${escapeHtml(sitzung.id)}" data-stand="versandt">Als versendet melden</button>
          <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-versand"
                  data-id="${escapeHtml(sitzung.id)}" data-stand="zugestellt">Als zugestellt melden</button>
        </div>
      </div>` : ""}
    </div>`;
}

// Ein Produkt anlegen oder aendern.
//
// Der Knopf dafuer stand von Anfang an da und tat nichts. Das ist keine
// Kleinigkeit: Ohne Produkte zeigt die Abdeckung ueberall "kein Produkt",
// die Empfehlung greift auf Platzhalter zurueck, und verkauft werden kann
// gar nichts.
//
// Gelesen wird beim Speichern aus dem Formular, nicht bei jedem Tastendruck.
// Ein Neuzeichnen je Buchstabe wuerde den Schreibfluss zerreissen - und die
// Werte stehen ohnehin im Feld, bis jemand auf Speichern drueckt.
function feld(name, marke, wert, { art = "text", hinweis = "" } = {}) {
  return `
    <label class="heart-lifeskin-feld">
      <span>${escapeHtml(marke)}</span>
      <input type="${art}" data-produktfeld="${escapeHtml(name)}"
             value="${escapeHtml(String(wert ?? ""))}" ${art === "number" ? 'step="0.01" min="0"' : ""} />
      ${hinweis ? `<small>${escapeHtml(hinweis)}</small>` : ""}
    </label>`;
}

function renderProduktEditor(produkt, status) {
  const p = produkt || {};
  const neu = !p.id;

  return `
    <section class="heart-lifeskin-block heart-lifeskin-editor">
      <button type="button" class="heart-lifeskin-zurueck" data-action="lifeskin-produkt-zu">← Alle Produkte</button>
      <h3 class="heart-lifeskin-block__titel">${neu ? "Neues Produkt" : escapeHtml(p.name || p.id)}</h3>

      ${feld("id", "Kennung", p.id, { hinweis: neu ? "Kleinbuchstaben und Bindestriche, z. B. lf-acne. Laesst sich spaeter nicht aendern." : "" })}
      ${feld("name", "Name", p.name)}
      ${feld("nenName_sq", "Untertitel (albanisch)", p.nenName?.sq, { hinweis: "z. B. Terapi kundër aknes" })}
      ${feld("nenName_de", "Untertitel (deutsch)", p.nenName?.de)}
      ${feld("inhalt", "Inhalt", p.inhalt, { hinweis: "z. B. 30 ml" })}
      ${feld("einzelpreis", "Einzelpreis in Euro", p.einzelpreis, { art: "number", hinweis: "Der Ankerpreis. Einzeln 33, zwei zusammen 53 - die Summe steht durchgestrichen ueber dem Setpreis." })}
      ${feld("order", "Reihenfolge", p.order ?? 1, { art: "number" })}

      <!-- Art und Rolle.
           Die Art traegt das Zeichen, wenn kein Foto da ist. Die Rolle
           entscheidet ueber den Satz: Genau ein Mittel im Set ist die
           "Basis" - auf sie beziehen sich die uebrigen ("... damit LF ACNE
           taeglich arbeiten kann"). Ohne Basis faellt dieser Bezug weg, und
           der Satz spricht nicht von einem Produkt, das gar nicht verkauft
           wird. -->
      <label class="heart-lifeskin-feld heart-lifeskin-feld--reihe">
        <span>Art</span>
        <select data-produktfeld="lloji">
          ${[["gel", "Gel / Creme-Gel"], ["krem", "Creme"], ["serum", "Serum"],
             ["pastrues", "Reiniger"], ["tonik", "Tonikum / sonstiges"]]
            .map(([w, t]) => `<option value="${w}"${(p.lloji || "tonik") === w ? " selected" : ""}>${t}</option>`).join("")}
        </select>
      </label>
      <label class="heart-lifeskin-feld heart-lifeskin-feld--reihe">
        <span>Rolle im Set</span>
        <select data-produktfeld="roli">
          ${[["baze", "Basis — das wirkende Mittel"], ["mbeshtetje", "Stütze — hält die Basis verträglich"],
             ["pastrim", "Reinigung — Schritt 1"]]
            .map(([w, t]) => `<option value="${w}"${(p.roli || "baze") === w ? " selected" : ""}>${t}</option>`).join("")}
        </select>
      </label>

      <h4 class="heart-lifeskin-verteilung__titel">Kurztext</h4>
      ${feld("kurztext_sq", "Albanisch", p.kurztext?.sq)}
      ${feld("kurztext_de", "Deutsch", p.kurztext?.de)}

      <h4 class="heart-lifeskin-verteilung__titel">Beschreibung</h4>
      <label class="heart-lifeskin-feld">
        <span>Albanisch</span>
        <textarea data-produktfeld="beschreibung_sq" rows="3">${escapeHtml(p.beschreibung?.sq || "")}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Deutsch</span>
        <textarea data-produktfeld="beschreibung_de" rows="3">${escapeHtml(p.beschreibung?.de || "")}</textarea>
      </label>

      <!-- Was das Mittel TUT.
           Auf der Patientenseite steht darueber sein eigener Befund
           ("Te ju, dy gjetjet me te forta jane ..."), und darunter diese
           Zeilen. Das ist die Bruecke: Ohne sie beweist die Seite ein
           Problem und zeigt dann eine Flasche, ohne zu sagen warum.
           Einmal je Produkt schreiben, nie je Patient. -->
      <h4 class="heart-lifeskin-verteilung__titel">Was es tut — eine Zeile je Wirkung</h4>
      <p class="heart-lifeskin-leer">
        Hoechstens <b>drei</b> Zeilen, je hoechstens 70 Zeichen. Sie stehen auf der Befundseite mit Haken davor, direkt
        vor der Therapie. <b>Ohne sie faellt der ganze Abschnitt weg</b> — die Seite
        erfindet kein Versprechen, das niemand geschrieben hat.
      </p>
      <label class="heart-lifeskin-feld">
        <span>Albanisch</span>
        <textarea data-produktfeld="veprimi_sq" rows="4"
                  placeholder="Hap folikulin e bllokuar dhe largon qelizat e vdekura&#10;Ul bakterin qe ushqen inflamacionin&#10;Qeteson skuqjen pa e thare barrieren">${escapeHtml((p.veprimi?.sq || []).join("\n"))}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Deutsch</span>
        <textarea data-produktfeld="veprimi_de" rows="4"
                  placeholder="Oeffnet den verstopften Follikel und loest abgestorbene Zellen&#10;Senkt das Bakterium, das die Entzuendung naehrt&#10;Beruhigt die Roetung, ohne die Barriere auszutrocknen">${escapeHtml((p.veprimi?.de || []).join("\n"))}</textarea>
      </label>

      <h4 class="heart-lifeskin-verteilung__titel">Der persoenliche Satz</h4>
      <p class="heart-lifeskin-leer">
        Steht auf der Befundseite unter dem Foto. <b>Einmal je Produkt schreiben, nicht je Patient</b> —
        die Platzhalter fuellt die Seite selbst aus:
        <code>{emri}</code> der Name, <code>{gjetja}</code> der Hauptbefund,
        <code>{mosha}</code> die Altersgruppe.
      </p>
      <label class="heart-lifeskin-feld">
        <span>Albanisch</span>
        <textarea data-produktfeld="persoenlich_sq" rows="2"
                  placeholder="{emri}, ky serum eshte zgjedhur per {gjetja} qe verejta te ju.">${escapeHtml(p.persoenlich?.sq || "")}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Deutsch</span>
        <textarea data-produktfeld="persoenlich_de" rows="2"
                  placeholder="{emri}, dieses Serum ist fuer {gjetja} gewaehlt, die ich bei Ihnen sehe.">${escapeHtml(p.persoenlich?.de || "")}</textarea>
      </label>
      <div class="heart-lifeskin-vorschau" id="heartLifeskinVorschau">
        <span>So liest es eine Patientin</span>
        <b>${escapeHtml(fuellePlatzhalter(p.persoenlich?.sq || "", BEISPIEL) || "—")}</b>
      </div>


      <!-- Die Wirkstoffe.
           Ein Name allein ist eine Zutatenliste. Erst mit seiner Aufgabe
           daneben wird daraus ein Grund - und genau der fehlt dem Kunden,
           der schon fuenf Sachen probiert hat. -->
      <h4 class="heart-lifeskin-verteilung__titel">Wirkstoffe</h4>
      <p class="heart-lifeskin-leer">
        Eine Zeile je Wirkstoff, mit senkrechten Strichen getrennt:
        <code>Name | Menge | Aufgabe albanisch | Aufgabe deutsch</code>.
        Menge und die deutsche Aufgabe dürfen leer bleiben.
      </p>
      <label class="heart-lifeskin-feld">
        <span>Wirkstoffe</span>
        <textarea data-produktfeld="perberesit" rows="5"
                  placeholder="Benzoyl Peroxide | 4% | Ul bakterin C. acnes | Senkt das Bakterium&#10;Niacinamide | 4% | Qetëson skuqjen | Beruhigt die Roetung">${escapeHtml((p.perberesit || []).map((w) =>
                    [w.emri, w.sasia || "", w.roli?.sq || "", w.roli?.de || ""].join(" | ")).join("\n"))}</textarea>
      </label>

      <!-- Die Anwendung.
           "Und wie benutze ich das?" wird VOR dem Kauf gestellt. Wer die
           Antwort nicht findet, kauft nicht - er schiebt es auf, und
           aufgeschoben heisst nie. -->
      <h4 class="heart-lifeskin-verteilung__titel">Anwendung</h4>
      ${feld("perdorimi_hapi", "Schritt in der Routine", p.perdorimi?.hapi ?? 2, { art: "number", hinweis: "1 = Reinigung, 2 = Wirkstoff, 3 = Pflege. Danach sortiert die Seite." })}
      ${feld("perdorimi_koha_sq", "Wann (albanisch)", p.perdorimi?.koha?.sq, { hinweis: "z. B. vetëm në mbrëmje" })}
      ${feld("perdorimi_koha_de", "Wann (deutsch)", p.perdorimi?.koha?.de)}
      ${feld("perdorimi_sasia_sq", "Wieviel (albanisch)", p.perdorimi?.sasia?.sq, { hinweis: "z. B. sa një bizele" })}
      ${feld("perdorimi_sasia_de", "Wieviel (deutsch)", p.perdorimi?.sasia?.de)}
      <label class="heart-lifeskin-feld">
        <span>Wie (albanisch)</span>
        <textarea data-produktfeld="perdorimi_si_sq" rows="2">${escapeHtml(p.perdorimi?.si?.sq || "")}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Wie (deutsch)</span>
        <textarea data-produktfeld="perdorimi_si_de" rows="2">${escapeHtml(p.perdorimi?.si?.de || "")}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Worauf achten (albanisch)</span>
        <textarea data-produktfeld="perdorimi_kujdes_sq" rows="2">${escapeHtml(p.perdorimi?.kujdes?.sq || "")}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Worauf achten (deutsch)</span>
        <textarea data-produktfeld="perdorimi_kujdes_de" rows="2">${escapeHtml(p.perdorimi?.kujdes?.de || "")}</textarea>
      </label>

      <!-- Das Ziel bis Tag 28.
           Es nennt auch eine Grenze - und genau deshalb wird es geglaubt.
           Eine Prognose, die nur verspricht, wird es nicht. -->
      <h4 class="heart-lifeskin-verteilung__titel">Ziel bis Tag 28</h4>
      <label class="heart-lifeskin-feld">
        <span>Albanisch</span>
        <textarea data-produktfeld="synimi_sq" rows="2"
                  placeholder="Deri në ditën 28: … Gjurmët e vjetra kërkojnë më shumë kohë.">${escapeHtml(p.synimi?.sq || "")}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Deutsch</span>
        <textarea data-produktfeld="synimi_de" rows="2">${escapeHtml(p.synimi?.de || "")}</textarea>
      </label>

      <!-- Die Regeln.
           Sie entscheiden, welcher Satz bei welchem Befund erscheint. Die
           erste passende gewinnt, und die letzte hat eine leere Bedingung -
           deshalb bleibt der Abschnitt beim Patienten nie leer.
           Zugeklappt, weil sie einmal geschrieben und dann jahrelang nicht
           mehr angefasst werden. -->
      <details class="heart-lifeskin-bogen">
        <summary>Regeln für die Therapiebegründung${(p.lidhja || []).length ? ` — ${(p.lidhja || []).length}` : " — keine"}</summary>
        <div class="heart-lifeskin-bogen__leib">
          <p class="heart-lifeskin-leer">
            Die <b>erste</b> Regel, deren Bedingung auf die Analyse passt, liefert den Satz.
            Die <b>letzte</b> muss <code>"kur": {}</code> haben — sie trifft immer, und dadurch bleibt
            der Abschnitt beim Patienten nie leer.<br />
            Bedingungen: <code>diagnoza</code> (Liste von Kennungen), <code>parametri</code> + <code>nga</code> (Stufe),
            <code>niveli</code>, <code>partner</code> (true = ein Basis-Mittel ist mitgewählt).<br />
            Platzhalter: <code>{emri}</code> <code>{gjetja}</code> <code>{diagnoza}</code>
            <code>{grada}</code> <code>{vlera}</code> <code>{partner}</code>.
            <b>{grada}</b> kommt in weiblicher Einzahl — er passt nur hinter
            „shkalla e … është", nicht hinter „poret … janë".
          </p>
          <label class="heart-lifeskin-feld">
            <span>Regeln als JSON</span>
            <textarea data-produktfeld="lidhja" rows="12"
                      placeholder='[{"kur": {"parametri": "poret", "nga": 2}, "teksti": {"sq": "…", "de": "…"}}, {"kur": {}, "teksti": {"sq": "…", "de": "…"}}]'>${escapeHtml(JSON.stringify(p.lidhja || [], null, 2))}</textarea>
          </label>
        </div>
      </details>

      <h4 class="heart-lifeskin-verteilung__titel">Sichtbarkeit</h4>
      <label class="heart-lifeskin-feld heart-lifeskin-feld--reihe">
        <span>Im Trichter</span>
        <select data-produktfeld="availability">
          <option value="visible" ${p.availability !== "hidden" ? "selected" : ""}>sichtbar</option>
          <option value="hidden" ${p.availability === "hidden" ? "selected" : ""}>ausgeblendet</option>
        </select>
      </label>
      <h4 class="heart-lifeskin-verteilung__titel">Foto</h4>
      <div class="heart-lifeskin-fotowahl">
        ${p.photoRef ? `<img src="${escapeHtml(p.photoRef)}" alt="" />` : `<div class="heart-lifeskin-fotoleer">kein Foto</div>`}
        <div>
          <label class="heart-lifeskin-fotoknopf">
            <input type="file" accept="image/*" data-produktfoto hidden />
            <span>${p.photoRef ? "Foto tauschen" : "Foto vom Handy waehlen"}</span>
          </label>
          ${p.photoRef ? `<button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-produkt-foto-weg">Foto entfernen</button>` : ""}
          <small>Wird auf 900 Bildpunkte verkleinert und im Produkt gespeichert. Kein Hochladen woandershin noetig.</small>
        </div>
      </div>
      <input type="hidden" data-produktfeld="photoRef" value="${escapeHtml(String(p.photoRef || ""))}" />

      <div class="heart-lifeskin-editor__fuss">
        <button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--speichern"
                data-action="lifeskin-produkt-speichern" ${status === "laeuft" ? "disabled" : ""}>
          ${status === "laeuft" ? "Wird gespeichert …" : "Speichern"}
        </button>
        ${neu ? "" : `<button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--scharf"
                data-action="lifeskin-produkt-loeschen">Loeschen</button>`}
      </div>
    </section>`;
}

// Der Knopf, der alles auf null stellt.
//
// Zwei Stufen, weil es kein Zurueck gibt: Firestore kennt keinen Papierkorb.
// Der erste Druck fragt, der zweite loescht - und er sagt dabei, wie viel.
function renderReset(anzahl, gefragt, status) {
  if (status === "laeuft") {
    return `<p class="heart-lifeskin-reset heart-lifeskin-reset--laeuft">Wird geloescht …</p>`;
  }
  if (!gefragt) {
    if (!anzahl) return "";
    return `
      <div class="heart-lifeskin-reset">
        <button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-reset">
          Alle ${anzahl} Analysen loeschen
        </button>
      </div>`;
  }
  return `
    <div class="heart-lifeskin-reset heart-lifeskin-reset--gefragt">
      <p><b>${anzahl} Analysen samt Fotos endgueltig loeschen?</b> Das laesst sich nicht rueckgaengig machen.</p>
      <div class="heart-lifeskin-resetreihe">
        <button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--scharf" data-action="lifeskin-reset">Ja, loeschen</button>
        <button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-reset-abbrechen">Abbrechen</button>
      </div>
    </div>`;
}

// Wer hinter Lifeskin steht.
//
// Der Block steht GANZ UNTEN und nicht oben: Er ist eine Stammangabe, die
// einmal eingetragen und dann jahrelang nicht angefasst wird - anders als
// alles darueber, das jeden Tag neu gelesen wird. Oben nimmt er den
// Zahlen den Platz, unten steht er da, wo man ihn sucht.
//
// LEER BEDEUTET AUS, wie auf der Befundseite: Solange hier nichts steht,
// zeichnet die Seite den Anbieterblock gar nicht. Deshalb sagt der Kasten
// auch, was fehlt - ein leeres Formular ohne Hinweis sieht aus wie eines,
// das jemand schon ausgefuellt hat.
function renderAnbieter(anbieter, status) {
  const a = anbieter || {};
  const gefuellt = [a.name, a.anschrift, a.email].filter((w) => String(w || "").trim()).length;

  const zeile = (name, marke, wert, hinweis, art = "text") => `
    <label class="heart-lifeskin-feld">
      <span>${escapeHtml(marke)}</span>
      <input type="${art}" data-anbieterfeld="${name}"
             value="${escapeHtml(String(wert ?? ""))}" />
      <small>${escapeHtml(hinweis)}</small>
    </label>`;

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Anbieter</h3>
      <p class="heart-lifeskin-hinweis">
        ${gefuellt === 0
          ? "Steht noch nirgends. Die Befundseite nimmt Namen, Telefonnummer und Anschrift entgegen und schliesst einen Kauf ab – und nennt bisher niemanden, der dafuer geradesteht. Solange diese Felder leer sind, erscheint der Block auf der Seite gar nicht."
          : `Steht unten auf jeder Befundseite. ${gefuellt} von 3 Feldern gefuellt – leere erscheinen nicht.`}
      </p>
      ${zeile("name", "Name", a.name, "Wie das Unternehmen oder die Praxis wirklich heisst.")}
      ${zeile("anschrift", "Anschrift", a.anschrift, "Eine Zeile, so wie sie auf Post stehen wuerde.")}
      ${zeile("email", "E-Mail", a.email, "Eine Adresse, die auch gelesen wird.", "email")}
      <button type="button" class="heart-lifeskin-knopf"
              data-action="lifeskin-anbieter-speichern" ${status === "laeuft" ? "disabled" : ""}>
        ${status === "laeuft" ? "Wird gespeichert …" : "Anbieter speichern"}
      </button>
    </section>`;
}

export function renderLifeskin(zustand) {
  if (zustand?.status === "error") {
    return `<p class="heart-lifeskin-leer">Die Zahlen liessen sich nicht laden. ${escapeHtml(zustand.fehler || "")}</p>`;
  }

  // Alles, was noch nicht gerechnet ist, gilt als "wird geladen".
  //
  // Der Reiter wird gezeichnet, bevor der Lader ueberhaupt anlaeuft - beim
  // ersten Klick steht hier ein leeres Objekt ohne status. Frueher lief das
  // in die Zerlegung unten und griff auf kennzahlen.analysenHeute zu, das es
  // nicht gab. Der Reiter blieb schwarz und Heart reagierte nicht mehr.
  //
  // Geprueft wird deshalb nicht der status, sondern ob die Zahlen wirklich
  // da sind: Das ist die Bedingung, die der Rest dieser Datei braucht.
  if (!zustand || !zustand.kennzahlen || !Array.isArray(zustand.trichter)) {
    return `<p class="heart-lifeskin-leer">Wird geladen …</p>`;
  }

  const { kennzahlen, trichter, sitzungen, herkunft, verteilung, produkte } = zustand;

  // Noch kein einziger Besucher. Ein Block aus lauter Nullen sieht aus wie
  // ein Fehler; ein Satz sagt, dass es keiner ist. Die Kacheln bleiben
  // trotzdem stehen, damit der Aufbau von Anfang an vertraut ist.
  const nochNichts = !(sitzungen || []).length;

  // Ist eine Analyse aufgeklappt, steht sie allein da. Auf dem Handy waere
  // sie unter Kacheln, Trichter und drei Bloecken sonst nicht zu finden.
  if (zustand.produktOffen) {
    const produkt = zustand.produktOffen === "__neu"
      ? null
      : (produkte || []).find((p) => p.id === zustand.produktOffen);
    return `<div class="heart-lifeskin">${renderProduktEditor(produkt, zustand.produktStatus)}</div>`;
  }

  if (zustand.offen) {
    const sitzung = (sitzungen || []).find((s) => s.id === zustand.offen);
    return `<div class="heart-lifeskin">${renderSitzungDetail(
      sitzung, (zustand.fotos || {})[zustand.offen] || null, zustand.fotosStatus,
      zustand.produkte || [], (zustand.berichte || {})[zustand.offen] || null
    )}</div>`;
  }

  return `
    <div class="heart-lifeskin">
      ${renderReset((sitzungen || []).length, zustand.resetGefragt, zustand.resetStatus)}
      ${nochNichts ? `
        <p class="heart-lifeskin-leer">
          Noch keine Analyse. Die Zahlen fuellen sich mit dem ersten Besucher
          auf <b>mnyra.com/lifeskin</b>.
        </p>` : ""}
      ${renderKacheln(kennzahlen)}
      ${renderTrichter(trichter)}
      ${renderLesetiefe(zustand.lesetiefe)}
      ${renderBestellungen(sitzungen)}
      ${renderNachfassen(kennzahlen)}
      ${renderHerkunft(herkunft)}
      ${renderProdukte(produkte)}
      ${renderAnalysen(sitzungen)}
      ${renderVerteilung(verteilung)}
      ${renderAnbieter(zustand.konfig?.anbieter, zustand.anbieterStatus)}
    </div>`;
}
