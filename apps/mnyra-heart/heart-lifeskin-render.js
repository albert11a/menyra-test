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

const BEFUND_NAMEN = Object.freeze({
  roetung: "Roetung",
  trockenheit: "Trockenheit",
  glanz: "Glanz",
  poren: "Poren",
  pigment: "Pigmentflecken",
  linien: "Feine Linien"
});

const HAUTTYP_NAMEN = Object.freeze({
  mischhaut: "Mischhaut",
  fettig: "Fettige Haut",
  trocken: "Trockene Haut",
  empfindlich: "Empfindliche Haut",
  normal: "Normale Haut"
});

const STUFEN_NAMEN = ["unauffaellig", "leicht", "deutlich", "stark"];

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
  return `
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
        <small>${escapeHtml(nummer || "ohne Nummer")} · ${escapeHtml(HAUTTYP_NAMEN[sitzung.skinType] || sitzung.skinType || "")}</small>
      </span>
      <span class="heart-lifeskin-marke heart-lifeskin-marke--offen">${escapeHtml(art)}</span>
    </button>`;
  }).join("");

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Nachfassen</h3>
      <p class="heart-lifeskin-block__fuss">Befund gesehen, nicht gekauft — mit Hauttyp und Nummer.</p>
      <div class="heart-lifeskin-zeilen">${zeilen}</div>
    </section>`;
}

function renderHerkunft(herkunft) {
  if (!herkunft.length) return leererBlock("Herkunft je Anzeige", "Noch keine gekennzeichneten Aufrufe.");
  const zeilen = herkunft.slice(0, 20).map((h) => `
    <div class="heart-lifeskin-zeile heart-lifeskin-zeile--still">
      <span class="heart-lifeskin-zeile__leib">
        <b>${escapeHtml(h.kampagne)}</b>
        <small>${h.sitzungen} Aufrufe · ${h.abgeschlossen} Befunde · ${h.bestellt} Bestellungen</small>
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
function renderAbdeckung(abdeckung) {
  const zeilen = abdeckung.map((eintrag) => {
    const gut = eintrag.vollstaendig;
    return `
    <div class="heart-lifeskin-abdeckung${gut ? "" : " heart-lifeskin-abdeckung--luecke"}">
      <span class="heart-lifeskin-abdeckung__kopf">
        <b>${escapeHtml(BEFUND_NAMEN[eintrag.befund] || eintrag.befund)}</b>
        <small>${escapeHtml(eintrag.beschwerde?.de || "")}</small>
      </span>
      <span class="heart-lifeskin-abdeckung__stand">
        ${gut
          ? escapeHtml(eintrag.produkte.map((p) => p.name).join(", "))
          : `<b>${escapeHtml(eintrag.luecke)}</b>`}
      </span>
    </div>`;
  }).join("");

  const luecken = abdeckung.filter((a) => !a.vollstaendig).length;
  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Abdeckung</h3>
      <p class="heart-lifeskin-block__fuss">
        ${luecken
          ? `${luecken} von ${abdeckung.length} Beschwerden haben kein passendes Produkt. Wer diesen Befund bekommt, sieht darunter nichts zum Bestellen.`
          : "Jede Beschwerde hat ein Produkt."}
      </p>
      <div class="heart-lifeskin-abdeckungen">${zeilen}</div>
    </section>`;
}

function renderProdukte(produkte) {
  const zeilen = (produkte || []).map((p) => `
    <button type="button" class="heart-lifeskin-zeile" data-action="lifeskin-produkt" data-id="${escapeHtml(p.id)}">
      <span class="heart-lifeskin-zeile__leib">
        <b>${escapeHtml(p.name || p.id)}</b>
        <small>${escapeHtml(p.inhalt || "")} · ${(p.triggers || []).map((t) => BEFUND_NAMEN[t.befund] || t.befund).join(", ") || "ohne Ausloeser"}</small>
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

function renderAnalysen(sitzungen) {
  const mitBefund = sitzungen.filter((s) => s.skinType).slice(0, 60);
  if (!mitBefund.length) return leererBlock("Analysen", "Noch keine abgeschlossene Analyse.");

  const zeilen = mitBefund.map((s) => {
    const auffaellig = s.findings.filter((f) => Number(f.stufe) > 0).length;
    return `
    <button type="button" class="heart-lifeskin-zeile" data-action="lifeskin-sitzung" data-id="${escapeHtml(s.id)}">
      <span class="heart-lifeskin-zeile__zeit">${escapeHtml(datumKurz(s.createdAt))} ${escapeHtml(uhrzeit(s.createdAt))}</span>
      <span class="heart-lifeskin-zeile__leib">
        <b>${escapeHtml(s.name || "—")}${s.ageBand ? `, ${escapeHtml(s.ageBand)}` : ""}</b>
        <small>${escapeHtml(HAUTTYP_NAMEN[s.skinType] || s.skinType)} · ${auffaellig} Befund${auffaellig === 1 ? "" : "e"}</small>
      </span>
      ${s.hatBestellt ? `<span class="heart-lifeskin-marke heart-lifeskin-marke--neu">bestellt</span>` : ""}
    </button>`;
  }).join("");

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Analysen</h3>
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
      <p class="heart-lifeskin-block__fuss">Woran es am haeufigsten fehlt — danach richtet sich der Einkauf.</p>
      ${liste("Befunde", verteilung.befunde, BEFUND_NAMEN)}
      ${liste("Hauttypen", verteilung.hauttypen, HAUTTYP_NAMEN)}
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
export function renderSitzungDetail(sitzung, fotos = null, fotosStatus = "") {
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

  const befundzeilen = (sitzung.findings || []).map((f) => `
    <div class="heart-lifeskin-vzeile">
      <span>${escapeHtml(BEFUND_NAMEN[f.id] || f.id)}</span>
      <span class="heart-lifeskin-vzeile__spur"><span style="width:${(Number(f.stufe) / 3) * 100}%"></span></span>
      <b>${escapeHtml(STUFEN_NAMEN[Number(f.stufe)] || "")}</b>
    </div>`).join("");

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
      <div class="heart-lifeskin-detail__kopf">
        <b>${escapeHtml(sitzung.name || "—")}${sitzung.ageBand ? `, ${escapeHtml(sitzung.ageBand)}` : ""}</b>
        <small>${escapeHtml(datumKurz(sitzung.createdAt))} ${escapeHtml(uhrzeit(sitzung.createdAt))} ·
          ${escapeHtml(sitzung.device?.os || "")} ${escapeHtml(sitzung.device?.screen || "")}</small>
      </div>

      ${bilder ? `<div class="heart-lifeskin-fotos">${bilder}</div>`
        : `<p class="heart-lifeskin-leer">${escapeHtml(ohneBild)}</p>`}

      <div class="heart-lifeskin-detail__block">
        <h4>Hauttyp</h4>
        <p>${escapeHtml(HAUTTYP_NAMEN[sitzung.skinType] || sitzung.skinType || "—")}</p>
      </div>

      <div class="heart-lifeskin-detail__block">
        <h4>Befunde</h4>
        ${befundzeilen || `<p class="heart-lifeskin-leer">Keine.</p>`}
      </div>

      <div class="heart-lifeskin-detail__block">
        <h4>Empfohlen</h4>
        <p>${escapeHtml((sitzung.recommended || []).join(", ") || "—")}</p>
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

  const { kennzahlen, trichter, sitzungen, herkunft, verteilung, abdeckung, produkte } = zustand;

  // Noch kein einziger Besucher. Ein Block aus lauter Nullen sieht aus wie
  // ein Fehler; ein Satz sagt, dass es keiner ist. Die Kacheln bleiben
  // trotzdem stehen, damit der Aufbau von Anfang an vertraut ist.
  const nochNichts = !(sitzungen || []).length;

  // Ist eine Analyse aufgeklappt, steht sie allein da. Auf dem Handy waere
  // sie unter Kacheln, Trichter und drei Bloecken sonst nicht zu finden.
  if (zustand.offen) {
    const sitzung = (sitzungen || []).find((s) => s.id === zustand.offen);
    return `<div class="heart-lifeskin">${renderSitzungDetail(
      sitzung, (zustand.fotos || {})[zustand.offen] || null, zustand.fotosStatus
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
      ${renderAbdeckung(abdeckung || [])}
      ${renderProdukte(produkte)}
      ${renderAnalysen(sitzungen)}
      ${renderVerteilung(verteilung)}
    </div>`;
}
