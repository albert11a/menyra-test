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

  const zeilen = (produkte || [])
    .filter((p) => p.availability !== "hidden")
    .map((p) => {
      const an = gewaehlt.has(String(p.id));
      return `
      <label class="heart-lifeskin-pwahl">
        <input type="checkbox" data-produkt-wahl value="${escapeHtml(p.id)}" ${an ? "checked" : ""} />
        <span class="heart-lifeskin-pwahl__leib">
          <b>${escapeHtml(p.name || p.id)}</b>
          <small>${escapeHtml(p.inhalt || "")}${p.einzelpreis ? ` · ${escapeHtml(euro(p.einzelpreis))}` : ""}</small>
          <input class="heart-lifeskin-eingabe heart-lifeskin-pwahl__satz" type="text"
                 data-produkt-satz="${escapeHtml(p.id)}"
                 placeholder="${escapeHtml(p.kurztext?.sq || "Persoenlicher Satz (leer = Kurztext)")}"
                 value="${escapeHtml(gewaehlt.get(String(p.id)) || "")}" />
        </span>
      </label>`;
    }).join("");

  return `
    <div class="heart-lifeskin-editor">
      <div class="heart-lifeskin-editor__kopf">
        <h4>Befund</h4>
        <span class="heart-lifeskin-marke ${marke[0]}">${escapeHtml(marke[1])}</span>
      </div>

      <label class="heart-lifeskin-feld">
        <span>Was Dr. Gashi sieht</span>
        <textarea class="heart-lifeskin-eingabe" id="lifeskin-befundtext" rows="7"
          placeholder="Der Text, den der Patient auf seiner Seite liest. Absaetze bleiben erhalten.">${escapeHtml(bericht?.befund || "")}</textarea>
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

      ${feld("id", "Kennung", p.id, { hinweis: neu ? "Kleinbuchstaben und Bindestriche, z. B. serum-01. Laesst sich spaeter nicht aendern." : "" })}
      ${feld("name", "Name", p.name)}
      ${feld("inhalt", "Inhalt", p.inhalt, { hinweis: "z. B. 30 ml" })}
      ${feld("einzelpreis", "Einzelpreis in Euro", p.einzelpreis, { art: "number", hinweis: "Der Ankerpreis. Beide zusammen sollen deutlich ueber dem Setpreis liegen." })}
      ${feld("order", "Reihenfolge", p.order ?? 1, { art: "number" })}

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
      ${renderBestellungen(sitzungen)}
      ${renderNachfassen(kennzahlen)}
      ${renderHerkunft(herkunft)}
      ${renderProdukte(produkte)}
      ${renderAnalysen(sitzungen)}
      ${renderVerteilung(verteilung)}
    </div>`;
}
