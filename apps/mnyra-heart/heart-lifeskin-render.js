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
import { SET_PREIS, ZEITRAEUME, TYPEN, typVon, istAnalyse, findeSitzung, heuteSchluessel, imZeitraum, zustandVon, baueKennzahlen, baueZweige, baueMaintrichter, baueKauftrichter, ohneScanGelaufen, baueLesetiefe, baueHerkunft, baueVerteilung, bestellungenImZeitraum } from "./heart-lifeskin-berechnung.js";
import { TEXT_ABSCHNITTE, TEXT_SCHLUESSEL, standardText } from "../lifeskin-astra/astra-texte-plan.js";
// Die Antworten aus dem Trichter, uebersetzt - aus DERSELBEN Quelle, aus
// der auch der Prompt gefuellt wird. Eine eigene Tabelle hier waere eine
// Frage der Zeit: Wer im Trichter eine Antwort dazunimmt und hier nicht,
// zeigt der Aerztin eine nackte Kennung ("yndyrshme") und laesst sie raten.
import { anamneseFuerPrompt } from "./heart-lifeskin-prompt.js";
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
  links: "Kopf nach links",
  oben: "Kopf nach oben",
  // Die eine Aufnahme der Wege mit Foto: eine Stelle der Haut, kein
  // Gesicht aus vier Richtungen. "Gerade" darueber waere hier falsch -
  // es kann eine Schulter sein.
  zona: "Die Stelle"
});

// Je Richtung kommen mehrere Bilder an: das beste traegt den Namen der
// Richtung, die weiteren zaehlen dahinter ("rechts-2"). Beschriftet werden
// sie trotzdem alle - "irgendein Bild vom Kopf" sagt der Aerztin nicht,
// welche Wange sie da sieht.
const BLICK_REIHENFOLGE = Object.freeze([
  // Die Stelle zuerst: Wo es sie gibt, ist sie das einzige Bild des
  // Falls, und in der Reihe der Gesichtsaufnahmen stuende sie am Ende.
  "zona", "zona-2", "zona-3",
  "gerade", "gerade-2", "gerade-3",
  "rechts", "rechts-2", "rechts-3",
  "links", "links-2", "links-3",
  "oben", "oben-2", "oben-3"
]);

function blickName(blick) {
  const [grund, nummer] = String(blick).split("-");
  const name = BLICK_NAMEN[grund] || grund || blick;
  return nummer ? `${name} (${nummer})` : name;
}

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

// Eine Reihe Chips. Sie traegt zwei Dinge: den Zeitraum ueber den Zahlen
// und das Fach ueber der Liste. Ein Baustein, weil es dieselbe Geste ist.
function renderChips(eintraege, aktiv, aktion) {
  return `<div class="heart-lifeskin-chips" role="group">
    ${eintraege.map((e) => `
      <button type="button" class="heart-lifeskin-chip${e.id === aktiv ? " heart-lifeskin-chip--an" : ""}"
              data-action="${escapeHtml(aktion)}" data-wert="${escapeHtml(e.id)}"
              aria-pressed="${e.id === aktiv ? "true" : "false"}">
        ${escapeHtml(e.label)}${Number.isFinite(e.anzahl) ? ` <span>${e.anzahl}</span>` : ""}
      </button>`).join("")}
  </div>`;
}

// DIE ACHT KACHELN, IN VIER REIHEN ZU ZWEIT.
//
// Sie folgen dem Weg durch die Seite und nicht der Reihenfolge, in der
// sie einmal dazugekommen sind:
//
//   Landing   Analysen      wie viele kamen, wie viele gaben ab
//   Warenkoerbe  Umsatz     was im Korb lag, was hereinkam
//   Analysenquote Kaufquote die zwei Quoten dazu
//   Abbrueche Kauf / Analysen   wo es liegen bleibt
//
// Je zwei in einer Reihe, auf jedem Bildschirm: Zwei Zahlen
// nebeneinander liest man als Paar, drei als Liste.
function renderKacheln(kennzahlen, zeitraum = "") {
  const name = ZEITRAEUME.find((z) => z.id === zeitraum)?.label || "Heute";
  const klein = zeitraum === "max" ? "gesamt" : name.toLowerCase();
  const differenz = (kennzahlen.landing ?? 0) - (kennzahlen.landingDavor ?? 0);
  // "Max" hat keinen Zeitraum davor - ein Vergleich waere dort erfunden.
  const vergleich = zeitraum === "max" ? ""
    : `${differenz >= 0 ? "+" : ""}${differenz} ggue. davor`;
  const analysenDifferenz = (kennzahlen.analysen ?? 0) - (kennzahlen.analysenDavor ?? 0);
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
        marke: "Landing",
        wert: String(kennzahlen.landing ?? 0),
        zusatz: vergleich || `Besucher · ${klein}`,
        richtung: differenz > 0 ? "auf" : differenz < 0 ? "ab" : ""
      })}
      ${renderKachel({
        marke: "Analysen",
        wert: String(kennzahlen.analysen ?? 0),
        zusatz: zeitraum === "max" ? `abgegeben · ${klein}`
          : `${analysenDifferenz >= 0 ? "+" : ""}${analysenDifferenz} ggue. davor`,
        richtung: analysenDifferenz > 0 ? "auf" : analysenDifferenz < 0 ? "ab" : ""
      })}
      ${renderKachel({
        marke: "Warenkörbe",
        wert: String(kennzahlen.warenkoerbe ?? 0),
        // Der Wert steht klein darunter, wie die Bestellungen unter dem
        // Umsatz: Die Zahl der Koerbe ist die Handlung, ihr Wert die
        // Folge davon.
        zusatz: `${euro(kennzahlen.warenkorbWert)} im Korb`
      })}
      ${renderKachel({
        marke: "Umsatz",
        wert: euro(kennzahlen.umsatzHeute),
        zusatz: `${kennzahlen.bestellungenHeute} Bestellungen`
      })}
      ${renderKachel({
        marke: "Analysenquote",
        wert: prozent(kennzahlen.analysenQuote),
        // Die Basis steht dabei, weil eine Quote aus drei Besuchen keine
        // Quote ist - und ohne diese Zahl sieht man das nicht.
        zusatz: `je Landing · aus ${kennzahlen.landing ?? 0}`
      })}
      ${renderKachel({
        marke: "Kaufquote",
        wert: prozent(kennzahlen.kaufQuote),
        zusatz: `je Analyse · ${klein}`,
        richtung: kennzahlen.kaufQuote >= 0.05 ? "auf" : "ab"
      })}
      ${renderKachel({
        marke: "Abbrüche Kauf",
        wert: String((kennzahlen.kaufAbbrueche || []).length),
        zusatz: `ca. ${euro(kennzahlen.offenerBetrag)} Potenzial`,
        richtung: (kennzahlen.kaufAbbrueche || []).length ? "ab" : ""
      })}
      ${renderKachel({
        marke: "Abbrüche Analysen",
        wert: String((kennzahlen.analyseAbbrueche || []).length),
        zusatz: "angefangen, nicht abgegeben",
        richtung: (kennzahlen.analyseAbbrueche || []).length ? "ab" : ""
      })}
    </div>`;
}

// WIE WEIT IM BERICHT GELESEN WIRD - der sechste Trichter.
//
// Er stand als eigener Block darunter und steht jetzt als ein Chip
// neben den anderen fuenf: Es ist derselbe Blick auf denselben Weg, nur
// hinter der Freigabe. Gerechnet wird er weiter fuer sich
// (baueLesetiefe), denn hier zaehlt jede Marke einzeln und nicht
// kumulativ - wer den Preis sieht, ohne den Befund zu Ende gelesen zu
// haben, soll genau so dastehen.

// DIE LIVE-REIHE.
//
// Punkte auf einer Linie, verbunden durch Striche. Ein Punkt leuchtet und
// pulsiert, solange dort jemand steht - und nur dann. Ein Punkt, der immer
// pulsiert, sagt nichts.
//
// Die Zahl steht IM Punkt und nicht daneben: Wer zwei Meter weg sitzt,
// soll die Reihe auf einen Blick lesen koennen, ohne Zeilen zuzuordnen.
//
// Zwei Reihen, ein Platz: Die Chips darueber schalten um. Im Chip steht
// die Zahl aller gerade Aktiven - eine Eins dort heisst "da tut sich
// was", und genau danach sieht man.
//
// EIN STUECK JE HALT, UND DER STRICH GEHOERT DAZU.
//
// Hier lagen Striche als eigene Stuecke ZWISCHEN den Punkten, und die
// Haltestellen waren so breit wie ihre Beschriftung. "Landingpage" ist
// breiter als "Pritja", also war der erste Strich kuerzer als der letzte -
// die Reihe stand schief, ohne dass etwas daran falsch gewesen waere.
//
// Jetzt ist jeder Halt gleich breit (flex: 1 1 0, also die Reihe geteilt
// durch die Zahl der Halte - seit dem Wahlbildschirm sind es fuenf statt
// vier, und das Stilblatt musste dafuer nicht angefasst werden), und der
// Strich haengt als Linie AM Halt: von der Mitte des vorigen Punktes zur
// Mitte dieses. Damit ist er immer gleich lang, egal wie das Wort darunter
// heisst - und vor dem ersten Halt gibt es keinen.
function renderLiveReihe(reihe, art) {
  const punkte = reihe?.punkte || [];
  const stueck = punkte.map((p) => {
    // EINE ZUSTANDSKLASSE JE HALT, und Punkt, Strich und Wort lesen sie.
    // Der Ton kommt aus dem Punkt und nicht aus seinem Namen: "Pritja" ist
    // der einzige, bei dem jemand fertig ist und wartet - das ist eine
    // andere Sache als "unterwegs", und es sieht auch anders aus.
    const klassen = ["heart-live__halt"];
    if (p.aktiv) klassen.push("heart-live__halt--an");
    if (p.aktiv && p.ton) klassen.push(`heart-live__halt--${escapeHtml(p.ton)}`);
    return `
    <span class="${klassen.join(" ")}">
      <span class="heart-live__punkt">${p.anzahl || ""}</span>
      <span class="heart-live__name">${escapeHtml(p.label)}</span>
    </span>`;
  }).join("");

  return `
    <div class="heart-live__reihe" data-art="${escapeHtml(art)}"
         role="img" aria-label="${escapeHtml(punkte.map((p) => `${p.label}: ${p.anzahl}`).join(", "))}">
      ${stueck}
    </div>`;
}

// DIE CHIPS STEHEN UEBER DER KARTE, NICHT DARIN.
//
// Sie waren im Kasten, und dort sahen sie aus wie eine Ueberschrift: zwei
// Woerter mit Zahlen, die zum Inhalt darunter zu gehoeren schienen. Sie
// gehoeren aber nicht dazu - sie WAEHLEN ihn aus. Ausserhalb und darueber
// ist es dieselbe Stelle wie bei den Zeitraeumen weiter unten: Dort
// schaltet man um, was der Kasten danach zeigt.
//
// Zwei Stuecke statt einem - der Aufrufer setzt sie untereinander.
// ZWEI KARTEN, KEINE CHIPS.
//
// Die zwei Reihen lagen auf EINEM Platz, und zwei Chips darueber
// schalteten um. Das war ein Handgriff zu viel fuer die Frage, wegen
// der man abends noch einmal hinsieht: Tut sich gerade etwas? Wer
// umschalten muss, sieht immer nur die Haelfte - und die andere
// Haelfte ist genau die, in der Geld liegt.
//
// Jetzt stehen beide untereinander: oben der Weg zur Analyse, darunter
// der Weg zum Kauf. Zwei Fragen, zwei Antworten, kein Griff dazwischen.
function renderLiveKarte(reihe, art, titel) {
  const still = !(reihe?.gesamt > 0);
  return `
    <section class="heart-lifeskin-block heart-live" id="heart-live-${escapeHtml(art)}">
      <h3 class="heart-lifeskin-block__titel">${escapeHtml(titel)}</h3>
      ${renderLiveReihe(reihe, art)}
      <p class="heart-lifeskin-block__fuss">${still
        ? "Gerade ist niemand unterwegs."
        : `${reihe.gesamt} ${reihe.gesamt === 1 ? "Person ist" : "Personen sind"} gerade dabei.`}</p>
    </section>`;
}

function renderLive(live) {
  return `
    ${renderLiveKarte(live?.analysen, "analysen", "Live · Analyse")}
    ${renderLiveKarte(live?.bestellungen, "bestellungen", "Live · Kauf")}`;
}

// Wieviele Menschen hinter dem Prozentsatz stehen.
//
// HIER STAND EIN SATZ, DER NICHT MEHR STIMMTE: "dort steht der Preis". Er
// war fest verdrahtet und wurde an die Stufe mit dem hoechsten Prozentwert
// gehaengt - egal an welche. Zuletzt hing er an "Pyetja 1", wo die Frage
// "Çka ju shqetëson më së shumti?" steht und kein Preis vorkommt; der steht
// auf der ersten Karte des Einstiegs, also drei Bildschirme davor.
//
// Und die Auswahl nach Prozent fuehrt fuer sich genommen in die Irre: 79
// Prozent von 33 sind 26 Menschen, 78 Prozent von 184 sind 143. Der Hinweis
// zeigte damit auf den KLEINEREN Verlust. Die Auswahl bleibt, wie sie ist -
// ein Prozentsatz sagt, wo es klemmt -, aber die Zahl dahinter steht jetzt
// daneben, damit niemand sie sich dazudenken muss.
function verloreneLeute(trichter, stufe) {
  const i = trichter.indexOf(stufe);
  const davor = i > 0 ? trichter[i - 1] : null;
  if (!davor) return `${stufe.anzahl} uebrig`;
  return `${davor.anzahl - stufe.anzahl} von ${davor.anzahl} gehen hier weg`;
}

// DIE SECHS TRICHTER, EINER JE CHIP.
//
// Sie lagen als drei verschiedene Bloecke untereinander - ein
// gemeinsamer Trichter, vier Kaesten daneben, die Lesetiefe darunter -,
// und man musste wissen, welcher was zaehlt. Jetzt ist es EIN Block mit
// einer Chipreihe darueber: In jedem Chip steht die Zahl, um die es in
// diesem Trichter geht, und der Chip schaltet um, was darunter steht.
//
// DIE ZAHL IM CHIP IST DIE LETZTE STUFE, nicht die erste. "Main 12"
// heisst: zwoelf sind angekommen. Die erste Stufe steht in fast jedem
// Trichter auf derselben Zahl (den Besuchern) und sagt beim Vergleich
// nichts.
const TRICHTER_CHIPS = Object.freeze([
  { id: "main", label: "Main" },
  { id: "scan", label: "Skanim" },
  { id: "foto", label: "Foto" },
  { id: "trup", label: "Trup/Pytje" },
  { id: "kauf", label: "Kauf" },
  { id: "bericht", label: "Bericht" }
]);

// Eine Reihe Stufen als Balken. Ein Baustein fuer alle sechs Trichter -
// sechs Abschriften waeren sechs Gelegenheiten, dass einer davon anders
// rechnet als die anderen fuenf.
function renderStufen(stufen, { schlimmsterAb = 0.2 } = {}) {
  const start = stufen[0]?.anzahl || 0;
  const schlimmster = stufen.reduce((a, b) => (b.verlust > (a?.verlust ?? -1) ? b : a), null);
  return stufen.map((stufe, i) => {
    const grundlage = stufe.anteil !== undefined ? stufe.anteil
      : (start ? stufe.anzahl / start : 0);
    const breite = stufe.anzahl ? Math.max(0.6, grundlage * 100) : 0;
    const hervor = stufe === schlimmster && stufe.verlust > schlimmsterAb
      ? " heart-lifeskin-stufe--schlimmst" : "";
    return `
      <div class="heart-lifeskin-stufe${hervor}">
        <span class="heart-lifeskin-stufe__name">${escapeHtml(stufe.label)}</span>
        <span class="heart-lifeskin-stufe__spur">
          <span class="heart-lifeskin-stufe__balken" style="width:${breite.toFixed(1)}%"></span>
        </span>
        <b class="heart-lifeskin-stufe__zahl">${stufe.anzahl}${stufe.geschaetzt ? "*" : ""}</b>
        <span class="heart-lifeskin-stufe__anteil">${prozent(grundlage)}</span>
        <span class="heart-lifeskin-stufe__verlust">${
          i > 0 && stufe.verlust > 0 ? `−${prozent(stufe.verlust)}` : ""}</span>
      </div>`;
  }).join("");
}

// Alle sechs auf einmal gerechnet. EINE Stelle, damit der Chip dieselbe
// Zahl traegt wie der Trichter darunter - zwei Rechnungen waeren zwei
// Zahlen, die auseinander laufen.
function baueTrichterListe(sitzungen, imBlick, zeitraum) {
  const zweige = baueZweige(imBlick);
  const zweigVon = (id) => zweige.find((z) => z.id === id);
  return TRICHTER_CHIPS.map((chip) => {
    if (chip.id === "main") {
      return { ...chip, stufen: baueMaintrichter(imBlick),
        fuss: "Von allen Besuchern der Landingpage bis zum vollstaendig abgegebenen Fall." };
    }
    if (chip.id === "kauf") {
      return { ...chip, stufen: baueKauftrichter(imBlick),
        fuss: "Der Laden auf der Landingpage: wer die Mittel gesehen, etwas hineingelegt und bezahlt hat." };
    }
    if (chip.id === "bericht") {
      // IM CHIP STEHT HIER DIE ERSTE STUFE, nicht die letzte: Diese
      // Liste zaehlt nicht kumulativ, und die letzte Zeile ("Bestellt")
      // hat ihren eigenen Chip weiter unten. Die Frage, wegen der man
      // hier hinsieht, ist: Wie viele lesen ihren Bericht ueberhaupt?
      return { ...chip, chipStufe: 0, stufen: baueLesetiefe(sitzungen || [], zeitraum || "max"),
        // Die Lesetiefe zaehlt NICHT kumulativ: Jede Marke steht fuer
        // sich, und der Anteil ist der an den aktiven Berichten.
        fuss: "Wie weit der fertige Bericht gelesen wird. Jede Marke zaehlt fuer sich; * heisst geschaetzt." };
    }
    // Die drei Wege der Menyra. Der Chip traegt das kurze Wort, die
    // Ueberschrift darunter den ganzen Namen: "Për trupin ose vetëm
    // pyetje" in einem Chip brauchte zwei Zeilen und schoebe die
    // anderen fuenf aus dem Bild.
    const zweig = zweigVon(chip.id);
    return {
      ...chip,
      titel: zweig?.label || chip.label,
      stufen: zweig?.stufen || [],
      fuss: zweig?.anzahl
        ? `${zweig.fertig} von ${zweig.anzahl} kommen an — ${prozent(zweig.durchsatz)} · ${prozent(zweig.anteil)} e Mënyrës`
        : "Diesen Weg hat noch niemand genommen."
    };
  });
}

function renderTrichter(liste, gewaehlt = "main") {
  const chips = liste.map((t) => ({
    id: t.id, label: t.label,
    // Die letzte Stufe: wie viele ganz durchgekommen sind. Wo das nicht
    // die Frage ist, sagt der Trichter selbst, welche Stufe im Chip
    // steht (siehe "Bericht").
    anzahl: (t.chipStufe === undefined ? t.stufen.at(-1) : t.stufen[t.chipStufe])?.anzahl ?? 0
  }));
  const offen = liste.find((t) => t.id === gewaehlt) || liste[0];
  if (!offen) return "";
  const schlimmster = offen.stufen.reduce((a, b) => (b.verlust > (a?.verlust ?? -1) ? b : a), null);

  return `
    ${renderChips(chips, offen.id, "lifeskin-trichter")}
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Trichter · ${escapeHtml(offen.titel || offen.label)}</h3>
      <div class="heart-lifeskin-trichter">${renderStufen(offen.stufen)}</div>
      ${offen.fuss ? `<p class="heart-lifeskin-block__fuss">${escapeHtml(offen.fuss)}</p>` : ""}
      ${schlimmster && schlimmster.verlust > 0.2
        ? `<p class="heart-lifeskin-block__fuss">Groesster Verlust bei „${escapeHtml(schlimmster.label)}" — ${escapeHtml(verloreneLeute(offen.stufen, schlimmster))}.</p>`
        : ""}
    </section>`;
}

// Die Bestellungen haben einen eigenen Zeitraum.
//
// Er haengt NICHT an dem ueber den Kacheln: Wer die Zahlen von heute
// anschaut, will trotzdem die Bestellung von vorgestern sehen - die ist noch
// zu packen. Zwei Zeitraeume nebeneinander gehen hier, weil die eine Liste
// eine Arbeitsliste ist und die andere eine Auswertung.
const BESTELL_ZEITRAEUME = Object.freeze([
  { id: "heute", label: "Heute" },
  { id: "gestern", label: "Gestern" },
  { id: "woche", label: "1 Woche" },
  { id: "max", label: "Max" }
]);

function renderBestellungen(sitzungen, zeitraum = "heute") {
  const alle = (sitzungen || []).filter((s) => s.hatBestellt);
  const gewaehlt = bestellungenImZeitraum(alle, zeitraum);
  // OHNE Zahl an den Chips: Mit ihr brechen vier Chips auf einem Telefon in
  // zwei Reihen um, und wie viele es sind, steht ohnehin in der Liste
  // darunter.
  const chips = renderChips(BESTELL_ZEITRAEUME, zeitraum, "lifeskin-bestellzeitraum");

  if (!alle.length) {
    return leererBlock("Bestellungen", "Noch keine Bestellung.");
  }

  const zeilen = gewaehlt.slice(0, 40).map((s) => `
    <button type="button" class="heart-lifeskin-zeile" data-action="lifeskin-sitzung" data-id="${escapeHtml(s.id)}">
      <span class="heart-lifeskin-zeile__zeit">${escapeHtml(datumKurz(s.bestelltAt || s.createdAt))} ${escapeHtml(uhrzeit(s.bestelltAt || s.createdAt))}</span>
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
      ${chips}
      ${zeilen ? `<div class="heart-lifeskin-zeilen">${zeilen}</div>`
        : `<p class="heart-lifeskin-leer">In diesem Zeitraum keine Bestellung.</p>`}
    </section>`;
}

// DIE LISTE ZUM ANRUFEN - und nur die.
//
// HIER STANDEN FAST ALLE. Aufgenommen wurde, wer eine Anschrift begonnen
// ODER eine Nummer hinterlassen hat - und die Nummer hinterlaesst im
// Trichter inzwischen jeder. Damit stand in "Nachfassen" jeder, der
// nicht gekauft hat, und eine Liste zum Anrufen, in der alle stehen,
// wird nicht abgearbeitet, sondern weggeklickt.
//
// Jetzt steht hier nur, wer WIRKLICH abgebrochen hat: Antwort gesehen,
// Kasse geoeffnet, nicht bestellt, und lange genug her, dass er nicht
// mehr tippt (siehe istAbbrecher). Das sind die, bei denen ein Anruf
// etwas bedeutet - sie wollten kaufen.
function renderNachfassen(kennzahlen) {
  const eintraege = [...kennzahlen.abbrecher]
    .sort((a, b) => String(b.kasseGeoeffnetAt || b.updatedAt)
      .localeCompare(String(a.kasseGeoeffnetAt || a.updatedAt)))
    .slice(0, 60);

  if (!eintraege.length) {
    return leererBlock("Nachfassen",
      "Niemand offen — kein angefangener Kauf, der liegen geblieben ist.");
  }

  const zeilen = eintraege.map((sitzung) => {
    const nummer = sitzung.phone || sitzung.address?.telefon || "";
    // Woran er haengengeblieben ist: an der Anschrift oder schon am
    // Bestellschirm. Zwei verschiedene Gespraeche - beim einen fehlt
    // das Vertrauen, beim anderen die Adresse.
    const art = sitzung.hatAnschrift ? "Anschrift" : "Kasse";
    return `
    <button type="button" class="heart-lifeskin-zeile" data-action="lifeskin-sitzung" data-id="${escapeHtml(sitzung.id)}">
      <span class="heart-lifeskin-zeile__zeit">${escapeHtml(datumKurz(sitzung.kasseGeoeffnetAt || sitzung.updatedAt))} ${escapeHtml(uhrzeit(sitzung.kasseGeoeffnetAt || sitzung.updatedAt))}</span>
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
      <p class="heart-lifeskin-block__fuss">
        Kasse geoeffnet, nicht bestellt, laenger als eine halbe Stunde her —
        mit Fallnummer und Kontakt.
      </p>
      <div class="heart-lifeskin-zeilen">${zeilen}</div>
    </section>`;
}

// JEDE SEITE ANSEHEN, OHNE EINE ZAHL ZU BEWEGEN.
//
// Jeder Link traegt ?still=1 (shared/lifeskin-still.js): Die Seite
// schreibt dann nichts - keine Sitzung, keine Marke, kein Meta-Ereignis.
// Und das Geraet merkt es sich: Wer einmal ueber einen dieser Links kam,
// bleibt still, bis er unten links auf "Still" tippt. Das ist der
// Masterlink.
//
// Die Bildschirme mitten im Weg gehen ueber ?schirm= direkt auf, ohne den
// Weg davor. Warteseite und Analyse brauchen einen echten Fall - genommen
// wird zuerst ein eigener Testfall, sonst der juengste passende.
export const STILL_BASIS = "https://www.mnyra.com";

const STILL_WEGE = Object.freeze([
  { titel: "Start", seiten: [
    { label: "Landing", pfad: "/lifeskin" },
    { label: "Mënyra", schirm: "wahl" }
  ] },
  { titel: "Skanim", weg: "skanim", seiten: [
    { label: "Anleitung", schirm: "vorbereitung" },
    { label: "Kamera", schirm: "kamera" },
    { label: "Emri & Mosha", schirm: "name" },
    { label: "Nummri", schirm: "tel" },
    { label: "Loading", schirm: "analyse" }
  ] },
  { titel: "Foto", weg: "foto", seiten: [
    { label: "Anleitung", schirm: "fotopara" },
    { label: "Kamera", schirm: "foto" },
    { label: "Emri & Mosha", schirm: "name" },
    { label: "Nummri", schirm: "tel" },
    { label: "Loading", schirm: "analyse" }
  ] },
  { titel: "Trup/Pytje", weg: "trup", seiten: [
    { label: "Emri & Mosha", schirm: "name" },
    { label: "Sqaroni problemet", schirm: "anliegen" },
    { label: "Nummri", schirm: "tel" }
  ] }
]);

const FREIGEGEBEN_STATUS = Object.freeze(["fertig", "bestellt", "versandt", "zugestellt"]);

function stillLink(pfad, zusatz = {}) {
  const suche = new URLSearchParams({ still: "1", ...zusatz });
  return `${STILL_BASIS}${pfad}?${suche.toString()}`;
}

// Der juengste Fall, der passt - eigene Tests zuerst.
function stillFall(zustand, passt) {
  const berichte = zustand?.berichte || {};
  const neueste = (liste) => [...(liste || [])]
    .filter((s) => passt(berichte[s.id] || null))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
  return neueste(zustand?.tests) || neueste(zustand?.sitzungen);
}

export function baueStillLinks(zustand) {
  const gruppen = STILL_WEGE.map((gruppe) => ({
    titel: gruppe.titel,
    seiten: gruppe.seiten.map((seite) => ({
      label: seite.label,
      url: seite.pfad
        ? stillLink(seite.pfad)
        : stillLink("/lifeskin", { schirm: seite.schirm, ...(gruppe.weg ? { weg: gruppe.weg } : {}) })
    }))
  }));
  const wartend = stillFall(zustand, (b) => b?.status === "wartet");
  const fertig = stillFall(zustand, (b) => FREIGEGEBEN_STATUS.includes(String(b?.status || "")));
  const mitKorb = stillFall(zustand, (b) => FREIGEGEBEN_STATUS.includes(String(b?.status || ""))
    && Array.isArray(b?.produkte) && b.produkte.length > 0) || fertig;
  gruppen.push({
    titel: "Nach dem Weg",
    seiten: [
      { label: "Warteseite", url: wartend ? stillLink(`/analiza/${wartend.id}`) : "",
        fehlt: "kein wartender Fall" },
      { label: "Analyse", url: fertig ? stillLink(`/analiza/${fertig.id}`) : "",
        fehlt: "keine freigegebene Analyse" },
      { label: "Kauf (N'shport)", url: mitKorb ? stillLink(`/analiza/${mitKorb.id}`, { kasse: "1" }) : "",
        fehlt: "keine Analyse mit Mitteln" },
      { label: "Therapieseite (neu)", url: fertig ? stillLink(`/terapia/${fertig.id}`) : "",
        fehlt: "keine freigegebene Analyse" }
    ]
  });
  return { master: stillLink("/lifeskin"), aus: `${STILL_BASIS}/lifeskin?still=0`, gruppen };
}

function stillZeile(label, url, fehlt = "") {
  if (!url) {
    return `
      <div class="heart-lifeskin-zeile heart-lifeskin-zeile--still">
        <span class="heart-lifeskin-zeile__leib"><b>${escapeHtml(label)}</b>
          <small>${escapeHtml(fehlt)}</small></span>
      </div>`;
  }
  return `
      <div class="heart-lifeskin-zeile heart-lifeskin-zeile--still heart-still__zeile">
        <span class="heart-lifeskin-zeile__leib"><b>${escapeHtml(label)}</b></span>
        <a class="heart-lifeskin-kopier" href="${escapeHtml(url)}" target="_blank" rel="noopener">Öffnen</a>
        <button type="button" class="heart-lifeskin-kopier"
                data-action="lifeskin-text-kopieren" data-wert="${escapeHtml(url)}"
                data-was="${escapeHtml(label)}">Kopieren</button>
      </div>`;
}

export function renderStillLinks(zustand) {
  const { master, aus, gruppen } = baueStillLinks(zustand);
  const bloecke = gruppen.map((gruppe) => `
      <p class="heart-still__gruppe">${escapeHtml(gruppe.titel)}</p>
      <div class="heart-lifeskin-zeilen">
        ${gruppe.seiten.map((s) => stillZeile(s.label, s.url, s.fehlt)).join("")}
      </div>`).join("");
  return `
    <section class="heart-lifeskin-block heart-still" id="heart-still">
      <h3 class="heart-lifeskin-block__titel">Seiten ohne Stats</h3>
      <p class="heart-lifeskin-block__fuss">
        Jeder Link zählt nichts – nicht in Heart, nicht bei Meta. Einmal geöffnet,
        bleibt dieses Gerät still, egal welche Seite danach kommt, bis du unten links
        auf „Still · 0 Stats“ tippst.
      </p>
      <div class="heart-lifeskin-zeilen">
        ${stillZeile("Masterlink", master)}
        ${stillZeile("Still wieder aus", aus)}
      </div>
      ${bloecke}
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
// Der Knopf, der die Meldungen einschaltet.
//
// WARUM ER HIER STEHT UND NICHT IN DEN EINSTELLUNGEN: Er schaltet die
// Meldung ueber neue Analysen ein, und das ist genau diese Ansicht. Wer die
// Analysen ansieht, ist der, der sie kuenftig gemeldet bekommen will.
//
// WARUM ER OHNE ZUSTAND AUSKOMMT: Sein Text haengt an
// Notification.permission, und das steht im Browser und nicht im Speicher
// von Heart. pushSchalterAuffrischen() in heart.js setzt ihn nach jedem
// Zeichnen - derselbe Weg, den lifeskinMarkenAuffrischen() schon geht. Ein
// Wert im Zustand waere eine zweite Wahrheit, die von der ersten abweichen
// kann.
//
// WARUM EIN KNOPF UND KEIN AUTOMATISCHES FRAGEN: Ein Erlaubnisfenster, das
// beim Laden von selbst aufgeht, wird weggetippt - und danach steht "denied"
// und laesst sich nur noch in den Systemeinstellungen aendern. Eine einzige
// Gelegenheit, und die verschenkt man nicht an einen Seitenaufruf.
function renderPushSchalter() {
  return `
      <div class="heart-lifeskin-push" data-push-schalter hidden>
        <div>
          <b data-push-titel>Meldung bei neuer Analyse</b>
          <small data-push-text></small>
        </div>
        <button type="button" class="heart-button heart-button--secondary"
                data-action="heart-push-einschalten" data-push-knopf>Einschalten</button>
      </div>`;
}

// EINE EBENE, NICHT ZWEI.
//
// Hier standen zwei Chipreihen uebereinander: erst die ART des Falls
// (Scan, Foto, Trup, Pytje), darunter sein ZUSTAND. Zehn Chips fuer
// eine Liste, und die obere Reihe beantwortete eine Frage, die niemand
// stellt: Ein Fall ist ein Fall, egal ueber welchen Weg er hereinkam -
// die Arbeit daran ist dieselbe, und WELCHER Weg es war, steht an der
// Zeile selbst.
//
// Geblieben ist die Reihe, nach der wirklich gearbeitet wird:
//
//   Alle        Jeder Fall, der noch im Weg liegt - also alles ausser
//               dem, was von Hand zurueckgelegt oder abgehakt wurde.
//               Beides hat seinen eigenen Chip; stuende es hier mit
//               drin, waere "Alle" eine Liste, die nur waechst.
//   Ready       Beantwortet und freigegeben. Der Kunde KANN es sehen.
//   Seen        Der Kunde HAT es geoeffnet.
//   Bestellt    Und er hat danach bestellt.
//   Später      Von Hand zurueckgelegt.
//   Archiv      Von Hand abgehakt. Liegt nicht mehr im Weg, ist aber
//               nicht geloescht.
const FAECHER = Object.freeze([
  { id: "alle", label: "Offen" },
  { id: "ready", label: "Ready" },
  { id: "seen", label: "Seen" },
  { id: "bestellt", label: "Bestellt" },
  { id: "spaeter", label: "Später" },
  { id: "archiviert", label: "Archiv" }
]);

// IN WELCHEM FACH EIN FALL LIEGT - in GENAU EINEM.
//
// Hier standen Sichten statt Faecher: Ein Fall konnte in mehreren
// stehen, und wer seine Antwort geoeffnet hatte, stand in "Seen" UND in
// "Alle". Das ist der Fehler, der sofort auffiel - eine Liste, aus der
// nichts herauswandert, waechst nur und wird nicht abgearbeitet.
//
// Ein Fall wandert weiter, sobald sich etwas an ihm aendert:
//
//   Alle        Abgegeben und noch nicht beantwortet. Das Fach, das
//               Arbeit bedeutet - hier faengt jeder Fall an.
//   Ready       Beantwortet und freigegeben. Der Kunde KANN es sehen.
//   Seen        Der Kunde HAT es geoeffnet.
//   Bestellt    Und er hat danach bestellt.
//   Später      Von Hand zurueckgelegt.
//   Archiv      Von Hand abgehakt.
//
// DIE REIHENFOLGE DER ABFRAGEN IST DIE REIHENFOLGE DER GEWISSHEIT.
// Was von Hand gesetzt wurde, gilt zuerst: Wer einen Fall zurueckgelegt
// hat, will ihn nicht am naechsten Tag wieder in "Alle" finden, weil
// sich sonst nichts geaendert hat. Danach die Bestellung - sie ist das
// Weiteste, was einem Fall passieren kann, und sagt mehr als "gesehen".
function fachVon(sitzung, bericht) {
  const zustand = zustandVon(sitzung, bericht);
  if (zustand === "archiviert" || zustand === "spaeter") return zustand;
  if (sitzung?.hatBestellt === true) return "bestellt";
  // "neu" heisst hier "noch nicht beantwortet" - und das ist das Fach,
  // mit dem die Liste aufmacht.
  return zustand === "neu" ? "alle" : zustand;
}

function imFach(sitzung, bericht, fach) {
  return fachVon(sitzung, bericht) === fach;
}

// Wie die Art am einzelnen Fall steht: klein, gross geschrieben, neben
// der Fallnummer. "#LS-2009-K4M7P · FOTO" - damit ist am Telefon und in
// WhatsApp in einem Wort klar, worum es geht.
function artMarke(sitzung) {
  const typ = typVon(sitzung);
  const eintrag = TYPEN.find((t) => t.id === typ);
  if (!eintrag) return "";
  return `<span class="heart-lifeskin-art heart-lifeskin-art--${escapeHtml(typ)}">${
    escapeHtml(eintrag.label.toUpperCase())}</span>`;
}

// EIN GESICHT LIEST SICH SCHNELLER ALS EINE FALLNUMMER.
//
// Links das erste Bild des Patienten, rund geschnitten; daneben zwei Zeilen,
// senkrecht mittig: oben, wer es ist, unten, wie weit er gekommen ist. Das
// Bild kommt nicht mit der Liste - es wird geholt, wenn die Zeile ins Bild
// scrollt, und steht bis dahin als Anfangsbuchstabe da. Solange es fehlt,
// haelt der Platz dieselbe Groesse: Sonst springt die Liste beim Scrollen.
function vorschauFeld(sitzung, bild) {
  const name = String(sitzung.name || "").trim();
  const buchstabe = name ? name[0].toUpperCase() : "?";
  const anzahl = (sitzung.photos || []).length;
  // GEMESSEN, NICHT GESCHAETZT: Auf einem 390-Punkte-Telefon bleiben neben
  // dem Bild 264 Punkte. Die drei Marken brauchen 237, die Uhrzeit 45 -
  // zusammen 282, und die zweite Zeile brach um. Die Anzahl der Fotos sitzt
  // deshalb auf dem Bild, wo sie ohnehin hingehoert, und die Uhrzeit steht
  // am Ende der ersten Zeile. So sind es zwei Zeilen und nicht drei.
  const zahl = anzahl
    ? `<span class="heart-lifeskin-fall__anzahl" title="${anzahl} Fotos">${escapeHtml(String(anzahl))}</span>`
    : "";
  if (bild) {
    return `<span class="heart-lifeskin-fall__bild">
      <img src="${escapeHtml(bild)}" alt="" loading="lazy" decoding="async">${zahl}
    </span>`;
  }
  return `<span class="heart-lifeskin-fall__bild" data-vorschau="${escapeHtml(sitzung.id)}">
    <span class="heart-lifeskin-fall__buchstabe">${escapeHtml(buchstabe)}</span>${zahl}
  </span>`;
}

// Die Zeitangabe der Fallzeile - kurz, weil daneben drei Marken stehen.
//
// Von heute reicht die Uhrzeit: Das Datum ist dann dasselbe wie in jeder
// anderen Zeile und sagt nichts. Aelteres traegt sein Datum, und die
// Uhrzeit von vorletzter Woche interessiert niemanden mehr - sie steht
// beim Aufklappen. So passt die zweite Zeile auch auf ein Telefon.
function fallZeit(sitzung) {
  return sitzung.tag === heuteSchluessel(0)
    ? uhrzeit(sitzung.createdAt)
    : datumKurz(sitzung.createdAt);
}

// Die drei Marken der zweiten Zeile. Sie stehen IMMER alle drei da, auch
// wenn sie nicht erreicht sind - nur blass. So ist auf einen Blick zu sehen,
// wo jemand haengengeblieben ist, ohne die Zeilen untereinander zu
// vergleichen.
function fallMarken(sitzung) {
  const marken = [
    { id: "wa", label: "WhatsApp", an: !!(sitzung.waSent || sitzung.waClick) },
    { id: "auf", label: "geoeffnet", an: !!sitzung.berichtGeoeffnet },
    { id: "kauf", label: "bestellt", an: !!sitzung.hatBestellt }
  ];
  const reihe = marken.map((m) => `<span class="heart-lifeskin-pill heart-lifeskin-pill--${m.id}${m.an ? " heart-lifeskin-pill--an" : ""}">${escapeHtml(m.label)}</span>`).join("");

  // OHNE SCAN STEHT ES VORNE UND IMMER AN - ABER NUR NOCH AN EINEM FALL
  // OHNE TYP.
  //
  // Die Marke sagt: Hier gibt es keine Aufnahmen, such nicht danach. Das
  // war richtig, solange es zwei Wege gab. Seit es vier gibt, sagt die
  // ART des Falls dasselbe genauer - und an einem Fotofall waere die
  // Marke schlicht falsch: Er hat eine Aufnahme, nur keinen Scan. Wer
  // sie dort liest, macht den Fall nicht auf und sieht das Bild nie.
  //
  // Sie bleibt fuer die Faelle von vor der Menyra. Die tragen keinen Typ,
  // und ohne sie stuende an ihnen gar nichts.
  //
  // GEFRAGT WIRD ohneScanGelaufen() UND NICHT sitzung.paSkanim: Die Marke
  // haengt an einem Schreibvorgang, der still scheitern kann. Ein Fall
  // von damals, der auf der Warteseite ankommt, ohne eine einzige
  // Aufnahme mitzubringen, HAT nicht gescannt - und Dr. Gashi soll das
  // sehen, auch wenn die Marke unterwegs verloren ging.
  if (sitzung.typ || !ohneScanGelaufen(sitzung)) return reihe;
  return `<span class="heart-lifeskin-pill heart-lifeskin-pill--paskanim heart-lifeskin-pill--an">pa skanim</span>${reihe}`;
}

// WAS DIE KARTE ZEIGT, HAENGT AN DER ART DES FALLS.
//
// Vier Arten, EINE Karte: Der Aufbau bleibt gleich - Bild, Name, Alter,
// Nummer, Zeit -, nur die Zeile darunter wechselt. Bei Scan und Foto
// sagt sie, wie weit der Kunde gekommen ist (die Marken); bei Trup und
// Pytje steht dort der Anfang dessen, was er geschrieben hat.
//
// UND DAS IST DER GANZE UNTERSCHIED, der hier gebraucht wird: Bei einem
// Scan sieht man auf das Bild, bei einer Frage auf den Satz. Ein
// getrennter Bereich je Art waere viermal dieselbe Liste - und dreimal
// davon fast immer leer.
function fallZeile(sitzung) {
  const typ = typVon(sitzung);
  const text = String(sitzung.pyetja || sitzung.problemi || "").trim();
  if ((typ === "trup" || typ === "pytje") && text) {
    const kurz = text.length > 110 ? `${text.slice(0, 110).trimEnd()}…` : text;
    return `<span class="heart-lifeskin-fall__text">${escapeHtml(kurz)}</span>`;
  }
  return fallMarken(sitzung);
}

function renderAnalysen(sitzungen, berichte = {}, fach = "alle", titel = "Fälle", fuss = "",
  vorschau = {}) {
  // ALLE WEGE IN EINER LISTE. Ein Fall ist ein Fall, egal ueber welchen
  // Weg er hereinkam - "abgegeben" heisst auf jedem Weg dasselbe.
  // Dieselbe Definition wie die Kennzahl: auch spaetere Schritte und
  // die Warteseitenmarke; reine Shopbestellungen sind keine Analysen.
  const fertige = sitzungen.filter(istAnalyse);

  const zaehler = Object.fromEntries(FAECHER.map((f) => [f.id,
    fertige.filter((s) => imFach(s, berichte[s.id], f.id)).length]));
  const gewaehlt = fertige
    .filter((s) => imFach(s, berichte[s.id], fach))
    .slice(0, 60);

  const chips = renderChips(FAECHER.map((f) => ({ ...f, anzahl: zaehler[f.id] })), fach, "lifeskin-fach");

  if (!fertige.length) {
    return leererBlock(titel, "Noch kein abgeschlossener Fall.");
  }

  const zeilen = gewaehlt.map((s) => `
    <button type="button" class="heart-lifeskin-fall" data-action="lifeskin-sitzung" data-id="${escapeHtml(s.id)}">
      ${vorschauFeld(s, vorschau[s.id])}
      <span class="heart-lifeskin-fall__leib">
        <span class="heart-lifeskin-fall__kopf">
          <b>${escapeHtml(s.name || "—")}</b>
          ${s.ageBand ? `<span class="heart-lifeskin-fall__alter">${escapeHtml(s.ageBand)}</span>` : ""}
          ${s.code ? `<span class="heart-lifeskin-code">${escapeHtml(s.code)}</span>` : ""}
          ${artMarke(s)}
          <span class="heart-lifeskin-fall__zeit">${escapeHtml(fallZeit(s))}</span>
        </span>
        <span class="heart-lifeskin-fall__fuss">${fallZeile(s)}</span>
      </span>
    </button>`).join("");

  const leerFach = {
    alle: "Nichts offen — alles beantwortet, zurueckgelegt oder abgehakt.",
    ready: "Nichts freigegeben, das noch niemand geoeffnet hat.",
    seen: "Noch hat niemand seine Antwort geoeffnet.",
    bestellt: "Noch hat niemand bestellt.",
    spaeter: "Nichts zurueckgelegt.",
    archiviert: "Nichts abgehakt."
  }[fach] || "Nichts hier.";

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">${escapeHtml(titel)}</h3>
      <p class="heart-lifeskin-block__fuss">${escapeHtml(fuss || "Abgegebene Faelle aus allen Wegen, die neuesten oben. Antippen zeigt alles Weitere.")}</p>
      ${chips}
      ${zeilen ? `<div class="heart-lifeskin-faelle">${zeilen}</div>`
        : `<p class="heart-lifeskin-leer">${escapeHtml(leerFach)}</p>`}
    </section>`;
}

// Die eigenen Laeufe. Sie stehen ganz unten und in keiner Zahl darueber.
function renderTests(tests, berichte = {}) {
  if (!(tests || []).length) return "";
  const zeilen = tests.slice(0, 40).map((s) => `
    <button type="button" class="heart-lifeskin-zeile" data-action="lifeskin-sitzung" data-id="${escapeHtml(s.id)}">
      <span class="heart-lifeskin-zeile__zeit">${escapeHtml(datumKurz(s.createdAt))} ${escapeHtml(uhrzeit(s.createdAt))}</span>
      <span class="heart-lifeskin-zeile__leib">
        <b>${escapeHtml(s.name || "—")}</b>
        <small>${s.code ? `<span class="heart-lifeskin-code">${escapeHtml(s.code)}</span> · ` : ""}${escapeHtml(String((s.photos || []).length))} Fotos · ${escapeHtml(zustandVon(s, berichte[s.id]))}</small>
      </span>
    </button>`).join("");
  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Eigene Tests</h3>
      <p class="heart-lifeskin-block__fuss">
        ${tests.length} Laeufe, die in keiner Zahl oben mitzaehlen. Einen Lauf als Test
        starten: <b>mnyra.com/lifeskin?test=1</b> — oder eine fertige Analyse oeffnen und
        dort als Test markieren.
      </p>
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
// WAS DER PATIENT GEANTWORTET HAT.
//
// Er steht zwischen den Aufnahmen und dem Befund, also genau dort, wo
// Dr. Gashi hinsieht, bevor sie schreibt - und unmittelbar ueber dem
// Knopf, der den Prompt kopiert. Dieselben Zeilen, die in den Prompt
// gehen, stehen hier zum Lesen: Was das Modell bekommt, soll sie auch
// selbst gesehen haben koennen, bevor sie seinen Befund freigibt.
//
// AUF DEM WEG OHNE SCAN IST DIESER BLOCK DER GANZE FALL. Dort gibt es
// keine Aufnahmen; was ueber diesen Menschen bekannt ist, sind seine vier
// Antworten. Fehlt der Block, sieht eine solche Akte aus wie eine leere -
// und eine leere Akte wird weggeklickt.
//
// BEIDE SPRACHEN, und das ist keine Verzierung: Albanisch ist das, was
// der Patient wirklich angetippt hat, Deutsch die Sprache dieser
// Oberflaeche. Wer im Gespraech auf eine Antwort zurueckkommt, nennt sie
// mit dem Wort, das der Patient gelesen hat.
// WAS ER SELBST GESCHRIEBEN HAT - und zwar ganz oben.
//
// Bei Trup und Pytje IST dieser Text der Fall. Es gibt kein Gesicht
// anzusehen und meistens kein Bild; was hier steht, ist alles, worauf
// eine Antwort beruhen kann. Deshalb steht er VOR den Aufnahmen und vor
// dem Befundbogen: Wer die Akte oeffnet, soll die Frage lesen, bevor er
// irgendetwas anderes sieht.
//
// Bei Scan und Foto gibt es ihn nicht, und dann steht hier nichts - kein
// leerer Kasten mit der Ueberschrift "Seine Frage". Ein Block, der immer
// da ist und meistens leer, wird nach zwei Tagen ueberlesen.
//
// DER TEXT STEHT UNVERAENDERT DA, mit seinen Zeilenumbruechen: Wer
// aufzaehlt ("prej dy javësh, në shpinë, kruhet"), hat das in drei
// Zeilen geschrieben, und in einem Fliesstext sind es drei Angaben in
// einem Satz.
function renderAnliegen(sitzung) {
  const typ = typVon(sitzung);
  if (typ !== "trup" && typ !== "pytje") return "";
  const text = String(sitzung.pyetja || sitzung.problemi || "").trim();
  const titel = typ === "pytje" ? "Seine Frage" : "Sein Hautproblem";
  if (!text) {
    return `
      <div class="heart-lifeskin-detail__block heart-lifeskin-anliegen">
        <h4>${escapeHtml(titel)}</h4>
        <p class="heart-lifeskin-leer">Er hat nichts geschrieben — der Fall
           wurde vorher abgeschickt oder der Text ging verloren.</p>
      </div>`;
  }
  return `
    <div class="heart-lifeskin-detail__block heart-lifeskin-anliegen">
      <h4>${escapeHtml(titel)}
        <button type="button" class="heart-lifeskin-kopier"
                data-action="lifeskin-text-kopieren" data-wert="${escapeHtml(text)}"
                data-was="${escapeHtml(titel)}">Kopieren</button>
      </h4>
      <p class="heart-lifeskin-anliegen__text">${escapeHtml(text)}</p>
    </div>`;
}

function renderAnamnese(sitzung) {
  const zeilen = anamneseFuerPrompt(sitzung?.anamnese);
  if (!zeilen.length) {
    // Ein Fall ohne Antworten ist kein Fehler, sondern der Normalfall von
    // vor den Fragen - und auf dem Weg ohne Scan ein Abbruch mitten
    // darin. Beides gehoert dagestanden, nicht verschwiegen: Ein Block,
    // der einfach fehlt, laesst offen, ob es nichts gab oder ob Heart
    // nichts gefunden hat.
    return `
      <div class="heart-lifeskin-detail__block">
        <h4>Seine Antworten</h4>
        <p class="heart-lifeskin-leer">Zu diesem Fall liegen keine Antworten vor.</p>
      </div>`;
  }
  return `
    <div class="heart-lifeskin-detail__block heart-lifeskin-anamnese">
      <h4>Seine Antworten <span>${zeilen.length}</span></h4>
      <dl>
        ${zeilen.map((zeile) => `
          <div>
            <dt>${escapeHtml(zeile.pyetja_de)}</dt>
            <dd>${escapeHtml(zeile.pergjigja_de)}</dd>
            <dd class="heart-lifeskin-anamnese__sq">${escapeHtml(zeile.pergjigja)}</dd>
          </div>`).join("")}
      </dl>
    </div>`;
}

// Die Nachricht, die Dr. Gashi schickt, wenn der Befund fertig ist -
// geschrieben von der Analyse (shitja.whatsapp), hier mit Anrede und Link.
// Der Link zeigt auf /analiza/: Solange die neue Seite nicht die
// Hauptseite ist, ist das die Seite, die der Patient bekommt.
export function whatsappNachricht(sitzung, bericht) {
  const text = String(bericht?.raport?.shitja?.whatsapp || "").trim();
  if (!text) return "";
  const name = String(sitzung?.name || "").trim();
  const link = `https://www.mnyra.com/analiza/${sitzung?.id || ""}`;
  return `${name ? `Përshëndetje ${name}! ` : "Përshëndetje! "}${text}\n\n${link}`;
}

export function renderSitzungDetail(sitzung, fotos = null, fotosStatus = "", produkte = [], bericht = null, loeschGefragt = false) {
  // Kein "Alle Analysen" mehr im Text: Der Weg zurueck steht oben im Kopf,
  // neben dem Aktualisieren, und gilt fuer jede Akte - auch fuer diese hier.
  if (!sitzung) {
    return `<div class="heart-lifeskin-detail">
      <p class="heart-lifeskin-leer">Diese Analyse gibt es nicht mehr.</p></div>`;
  }

  // Die Aufnahmen, in der Reihenfolge, in der man sie ansieht: erst gerade,
  // dann die Seiten, zuletzt die Aufsicht. Was die Liste nicht kennt, faellt
  // nicht weg - es haengt sich hinten an. Ein Bild, das ankommt und nicht
  // gezeigt wird, waere der teuerste stille Fehler dieser Seite.
  const alleBlicke = Object.keys(fotos || {}).filter((blick) => fotos[blick]?.jpeg);
  const vorhanden = [
    ...BLICK_REIHENFOLGE.filter((blick) => alleBlicke.includes(blick)),
    ...alleBlicke.filter((blick) => !BLICK_REIHENFOLGE.includes(blick)).sort()
  ];
  const bilder = vorhanden.map((blick) => `
    <figure class="heart-lifeskin-fotokasten">
      <img class="heart-lifeskin-foto" src="${escapeHtml(fotos[blick].jpeg)}"
           alt="${escapeHtml(blickName(blick))}" loading="lazy" />
      <figcaption>${escapeHtml(blickName(blick))}</figcaption>
    </figure>`).join("");

  // WAS "KEIN FOTO" HEISST, HAENGT AM WEG.
  //
  // Bei einem Scan fehlt etwas: Dort sollten Aufnahmen liegen, und wenn
  // keine da sind, ist unterwegs etwas schiefgegangen. Bei Trup und
  // Pytje ist das Foto freiwillig - dort heisst "kein Foto", dass er
  // keines schicken wollte, und ein Satz, der nach einem Fehler klingt,
  // laesst suchen, wo es nichts zu suchen gibt.
  const freiwillig = ["trup", "pytje"].includes(typVon(sitzung));
  const ohneBild = fotosStatus === "loading" ? "Fotos werden geladen …"
    : fotosStatus === "error" ? "Die Fotos liessen sich nicht laden."
    : freiwillig
      ? "Kein Foto dabei — auf diesem Weg ist es freiwillig."
      : "Zu diesem Fall liegen keine Fotos vor.";

  // WAS ER AUF SEINER SEITE GETAN HAT - der ganze Weg, nicht vier Haken.
  //
  // Zwischen "Seite geoeffnet" und "bestellt" liegen zwei Bildschirmlaengen,
  // ueber die frueher nichts bekannt war - und genau dort steigt aus, wer
  // aussteigt. Die Marken stehen in der Reihenfolge der Seite: Wo die Kette
  // abreisst, steht die Frage, die dieser Fall stellt.
  const weg = [
    ["Warteseite geoeffnet", sitzung.warteseiteGeoeffnet],
    ["Nummer hinterlassen", sitzung.hatTelefon],
    ["Befund geoeffnet (freigegeben)", sitzung.berichtGeoeffnet],
    ["Befund gelesen", sitzung.sahSchnitt],
    ["Therapie gesehen", sitzung.sahTherapie],
    ["Preis gesehen", sitzung.sahPreis],
    ["Kasse geoeffnet", sitzung.kasseGeoeffnet],
    ["WhatsApp angetippt", sitzung.waClick],
    ["Senden bestaetigt", sitzung.waSent],
    ["Link kopiert", sitzung.linkKopiert],
    ["Anschrift eingegeben", sitzung.hatAnschrift],
    ["Bestellt", sitzung.hatBestellt]
  ];
  const gegangen = weg.filter(([, ja]) => ja).length;
  const zuletzt = weg.filter(([, ja]) => ja).at(-1);

  const seite = `mnyra.com/analiza/${sitzung.id}`;
  // Die Nummer aus dem Warteschirm, sonst die aus der Anschrift.
  const nummer = sitzung.phone || sitzung.address?.telefon || "";

  return `
    <div class="heart-lifeskin-detail">
      <!-- Die Akte in vier Zeilen. Die Fallnummer zuerst: Sie ist das, was
           der Patient in WhatsApp schickt, und danach wird hier gesucht. -->
      <div class="heart-lifeskin-akte">
        <div class="heart-lifeskin-akte__nummer">
          <span>Fallnummer</span>
          <strong>${escapeHtml(sitzung.code || "—")}</strong>
          ${sitzung.code ? `<button type="button" class="heart-lifeskin-kopier"
             data-action="lifeskin-text-kopieren" data-wert="${escapeHtml(sitzung.code)}"
             data-was="Fallnummer" title="Fallnummer kopieren">Kopieren</button>` : ""}
        </div>
        <!-- DIE TELEFONNUMMER GLEICH DARUNTER, nicht unten im Verlauf.
             Sie ist das, was nach dem Freigeben getan wird: anrufen oder
             schreiben. Wer sie erst suchen muss, tut es seltener - und von
             32 fertigen Analysen haben nur die 13 ihren Befund gesehen,
             bei denen jemand Bescheid gegeben hat. -->
        ${nummer ? `
        <div class="heart-lifeskin-akte__tel">
          <span>Telefon</span>
          <a href="tel:${escapeHtml(nummer.replace(/[^+\d]/g, ""))}"><strong>${escapeHtml(nummer)}</strong></a>
          <button type="button" class="heart-lifeskin-kopier"
                  data-action="lifeskin-text-kopieren" data-wert="${escapeHtml(nummer)}"
                  data-was="Nummer" title="Nummer kopieren">Kopieren</button>
        </div>` : `
        <div class="heart-lifeskin-akte__tel heart-lifeskin-akte__tel--ohne">
          <span>Telefon</span><strong>${escapeHtml(sitzung.waClick || sitzung.waSent
            ? "keine — hat auf WhatsApp geschrieben" : "keine — nicht erreichbar")}</strong>
        </div>`}
        <dl class="heart-lifeskin-akte__liste">
          <div><dt>Name</dt><dd>${escapeHtml(sitzung.name || "—")}</dd></div>
          <div><dt>Alter</dt><dd>${escapeHtml(sitzung.ageBand || "—")}</dd></div>
          <div><dt>Datum</dt><dd>${escapeHtml(datumKurz(sitzung.createdAt))} ${escapeHtml(uhrzeit(sitzung.createdAt))}</dd></div>
        </dl>
      </div>

      <!-- BEI TRUP UND PYTJE STEHT SEIN TEXT HIER, ueber allem anderen.
           Dort gibt es kein Gesicht anzusehen: Was er geschrieben hat,
           ist der Fall, und es ist das Erste, was gelesen werden muss.
           Bei Scan und Foto faellt der Block ersatzlos weg. -->
      ${renderAnliegen(sitzung)}

      <!-- Die Aufnahmen gleich hinter der Nummer: Sie sind das Erste, was
           Dr. Gashi ansieht. In EINER Reihe zum Wischen - untereinander
           waeren zehn Bilder drei Bildschirmlaengen, durch die man jedes
           Mal scrollt, bevor der Befund kommt. -->
      ${bilder ? `<div class="heart-lifeskin-fotos heart-lifeskin-fotos--reihe">${bilder}</div>`
        : `<p class="heart-lifeskin-leer">${escapeHtml(ohneBild)}</p>`}

      <!-- Seine Antworten VOR dem Befund und nicht unter der Akte: Sie
           sind das, was gelesen wird, bevor geschrieben wird - und auf dem
           Weg ohne Scan das Einzige, was ueber diesen Menschen dasteht. -->
      ${renderAnamnese(sitzung)}

      ${renderBefundEditor(sitzung, produkte, bericht)}

      <div class="heart-lifeskin-detail__block">
        <h4>Seine Seite</h4>
        <div class="heart-lifeskin-linkzeile">
          <a class="heart-lifeskin-link" href="/analiza/${escapeHtml(sitzung.id)}"
             target="_blank" rel="noopener">${escapeHtml(seite)}</a>
          <button type="button" class="heart-lifeskin-knopf heart-lifeskin-knopf--klein"
                  data-action="lifeskin-link-kopieren" data-id="${escapeHtml(sitzung.id)}">Link kopieren</button>
        </div>

        <div class="heart-lifeskin-weg">
          <div class="heart-lifeskin-weg__kopf">
            <b>${gegangen} von ${weg.length} Schritten</b>
            ${zuletzt ? `<small>Weitester erfasster Meilenstein: ${escapeHtml(zuletzt[0])}</small>`
              : `<small>Noch kein Meilenstein erfasst.</small>`}
          </div>
          ${weg.map(([was, ja]) => `
            <div class="heart-lifeskin-weg__zeile${ja ? " heart-lifeskin-weg__zeile--an" : ""}">
              <span class="heart-lifeskin-weg__punkt"></span>
              <span>${escapeHtml(was)}</span>
              <b>${ja ? "ja" : "nein"}</b>
            </div>`).join("")}
        </div>
        <p class="heart-lifeskin-block__fuss">
          Zuletzt gesehen: ${escapeHtml(datumKurz(sitzung.updatedAt))} ${escapeHtml(uhrzeit(sitzung.updatedAt))}
        </p>
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

      <!-- Hier standen "Aufnahme" und "Messwerte": Ringanteil, Zahl der
           Aufnahmen, Millimeter je Bildpunkt, fuenf Zonen mit Zahlen.
           Sie sind weg, weil sie niemandem eine Frage beantwortet haben,
           die in dieser Akte gestellt wird. Was gemessen wurde, steht im
           Befundbogen - dort, wo damit gearbeitet wird. -->

      <!-- Was mit dieser einen Analyse geschehen soll.
           Ganz unten, hinter allem, was man vorher gesehen haben muss -
           und das Loeschen als zweite Stufe: Firestore kennt keinen
           Papierkorb. -->
      <div class="heart-lifeskin-detail__block">
        <h4>Diese Analyse</h4>
        <div class="heart-lifeskin-tasten">
          <button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-archivieren"
                  data-id="${escapeHtml(sitzung.id)}" data-wert="${bericht?.archiviert ? "nein" : "ja"}">
            ${bericht?.archiviert ? "Aus dem Archiv holen" : "Abhaken (archivieren)"}
          </button>
          <!-- ZURUECKLEGEN IST NICHT ABHAKEN. Ein Fall, der heute nicht
               drankommt, gehoert nicht ins Archiv (dort sucht ihn
               niemand mehr) und nicht nach "Neu" (dort steht er morgen
               wieder oben). Von "Später" geht er mit demselben Knopf
               zurueck. -->
          <button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-spaeter"
                  data-id="${escapeHtml(sitzung.id)}" data-wert="${bericht?.spaeter ? "nein" : "ja"}">
            ${bericht?.spaeter ? "Zurueck in die Liste" : "Für später zurücklegen"}
          </button>
          <button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-alstest"
                  data-id="${escapeHtml(sitzung.id)}" data-wert="${bericht?.test ? "nein" : "ja"}">
            ${bericht?.test ? "Doch kein Test" : "Als eigenen Test markieren"}
          </button>
          <button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--scharf"
                  data-action="lifeskin-sitzung-loeschen" data-id="${escapeHtml(sitzung.id)}">
            ${loeschGefragt ? "Wirklich loeschen — mit Fotos und Befund" : "Loeschen"}
          </button>
        </div>
        <p class="heart-lifeskin-block__fuss">
          Als Test markiert zaehlt diese Analyse in keiner Zahl mehr mit. Geloescht wird
          mit Fotos und Befund; der Link des Patienten zeigt danach nichts mehr.
        </p>
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

// DIE MARKIERUNG: steht hier etwas, oder steht hier nichts?
//
// Sie beantwortet die eine Frage, die man beim Durchsehen eines Falls
// wirklich hat - was wurde uebernommen, und was ist leer geblieben. Ohne
// sie liest man hundertsiebzig Felder durch und sieht es trotzdem nicht.
//
// Gesetzt wird sie zweimal: hier beim Zeichnen aus dem gespeicherten
// Befund, und im Betrieb bei jedem Tastendruck und nach jedem
// Uebernehmen - der Bogen lebt im DOM, nicht im Zustand.
function fuellungsMarke(art, schluessel, wert) {
  const voll = art === "stufe" ? wert === 0 || Boolean(wert) : Boolean(String(wert ?? "").trim());
  const wort = art === "text"
    ? (voll ? "eigener Text" : "Standard")
    : (voll ? "gefuellt" : "leer");
  return `<span class="heart-lifeskin-fuellung" data-fuellung-fuer="${escapeHtml(art === "text" ? "text" : "raport")}:${escapeHtml(schluessel)}"
    data-fuellung-art="${escapeHtml(art === "text" ? "text" : "raport")}" data-voll="${voll ? "ja" : "nein"}">${wort}</span>`;
}

// ALLE TEXTE DER PATIENTENSEITE - in der Reihenfolge der Seite.
//
// Dreizehn Abschnitte von der Warteseite bis zum letzten Strich. Jedes
// Feld zeigt den Satz, der ohne Eintrag dasteht: Er ist Platzhalter,
// Erklaerung und Rueckfall in einem. LEER HEISST STANDARD - wer einen
// eigenen Text wieder loeschen will, leert das Feld.
//
// Zugeklappt, was unveraendert ist. Ein Abschnitt mit eigenen Texten steht
// offen: Was jemand geaendert hat, soll er beim naechsten Oeffnen sehen,
// ohne es zu suchen.
function renderTexteEditor(bericht) {
  const eigene = bericht?.texte || {};
  const gezaehlt = TEXT_SCHLUESSEL.filter((k) => String(eigene[k] || "").trim()).length;

  return `
    <p class="heart-lifeskin-block__fuss">
      Jeder Satz dieser Seite laesst sich fuer DIESEN Fall ersetzen — ${TEXT_SCHLUESSEL.length}
      Texte in ${TEXT_ABSCHNITTE.length} Abschnitten. Ein leeres Feld bedeutet: Es bleibt der
      Text der Seite. ${gezaehlt ? `Zurzeit ${gezaehlt} eigene.` : "Zurzeit keiner geaendert."}
    </p>
    ${TEXT_ABSCHNITTE.map((abschnitt) => {
      const eigen = abschnitt.schluessel.filter((k) => String(eigene[k] || "").trim()).length;
      return `
      <details class="heart-lifeskin-textblock"${eigen ? " open" : ""}>
        <summary>
          <span>${escapeHtml(abschnitt.titel)}</span>
          <span class="heart-lifeskin-textblock__zahl">${eigen
            ? `${eigen} eigen`
            : `${abschnitt.schluessel.length} Texte`}</span>
        </summary>
        <p class="heart-lifeskin-textblock__fuss">${escapeHtml(abschnitt.fuss)}</p>
        ${abschnitt.schluessel.map((schluessel) => {
          const standard = standardText(schluessel, "sq");
          const wert = String(eigene[schluessel] || "");
          return `
          <label class="heart-lifeskin-feld heart-lifeskin-textfeld">
            <span class="heart-lifeskin-feld__kopf">
              <code>${escapeHtml(schluessel)}</code>
              ${fuellungsMarke("text", schluessel, wert)}
            </span>
            <span class="heart-lifeskin-textfeld__standard">${escapeHtml(standard)}</span>
            <textarea class="heart-lifeskin-eingabe" rows="2" data-text="${escapeHtml(schluessel)}"
              placeholder="leer = der Text darueber">${escapeHtml(wert)}</textarea>
          </label>`;
        }).join("")}
      </details>`;
    }).join("")}`;
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
      // DREI FELDER, NICHT EIN BLOCK.
      //
      // Hier stand ein Textfeld mit drei Zeilen darin. Drei Zeilen in einem
      // Feld sind auf dem Telefon keine drei Zeilen: Der Kasten ist drei
      // Zeilen hoch, der Text laeuft um, und die dritte Wirkung stand halb
      // hinter der Unterkante. Wer die mittlere aendern wollte, musste den
      // Umbruch suchen - und ein Zeilenumbruch, der verlorengeht, macht aus
      // zwei Wirkungen eine.
      //
      // Jetzt ist jede Zeile ihr eigenes Feld. Die Grenze von siebzig
      // Zeichen steht nicht mehr nur im Platzhalter, sondern am Feld.
      // Ein EINZEILIGES Feld waere der Rueckschritt gewesen: Es schneidet
      // den Satz an der rechten Kante ab, und diese Zeilen sollen gelesen
      // werden und nicht nur bearbeitbar sein. Also je ein kleines
      // Textfeld, das umbricht - aber nur EINE Wirkung traegt. Ein
      // Zeilenumbruch darin wird beim Lesen zu einem Leerzeichen
      // (lifeskinVeprimiLesen), damit ein versehentliches Enter aus einer
      // Wirkung nicht zwei macht.
      const zeilenFelder = [0, 1, 2].map((i) => `
            <textarea class="heart-lifeskin-eingabe" rows="2" maxlength="70"
                      data-veprimi="${escapeHtml(id)}" data-veprimi-nr="${i + 1}"
                      placeholder="${i + 1}. Zeile${i ? " — darf leer bleiben" : " — höchstens 70 Zeichen"}"
                      >${escapeHtml(veprimi[i] || "")}</textarea>`).join("");
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
          <div class="heart-lifeskin-feld">
            <span>Çfarë bën — një rresht për çdo veprim</span>
            <div class="heart-lifeskin-pwahl__veprimi" data-produkt-veprimi="${escapeHtml(id)}">${zeilenFelder}
            </div>
          </div>
          <div class="heart-lifeskin-pwahl__fuss">
            <small data-produkt-stand="${escapeHtml(id)}"></small>
            <button type="button" class="heart-lifeskin-pwahl__neu"
                    data-action="lifeskin-produkt-satz-neu" data-id="${escapeHtml(id)}">zurücksetzen</button>
          </div>
        </div>
      </div>`;
    }).join("");

  const eigeneTexte = TEXT_SCHLUESSEL.filter((k) => String((bericht?.texte || {})[k] || "").trim()).length;

  return `
    <div class="heart-lifeskin-editor">
      <div class="heart-lifeskin-editor__kopf">
        <h4>Befund</h4>
        <span class="heart-lifeskin-marke ${marke[0]}">${escapeHtml(marke[1])}</span>
      </div>

      <!-- ZWEI BOEGEN, EIN FALL: der Befund und die Texte der Seite.
           Sie stehen nebeneinander und nicht untereinander - die Texte sind
           hundertsiebzig Felder, und wer den Befund schreibt, will sie nicht
           jedes Mal wegscrollen.

           Umgeschaltet wird OHNE Zustandsaenderung. Dieser ganze Bogen lebt
           im DOM: Was hier getippt und eingefuegt wird, steht in den Feldern
           und nirgends sonst, bis jemand freigibt. Ein Zustandswechsel
           zeichnet Heart neu - und haette alles Getippte weggewischt. -->
      <div class="heart-lifeskin-chips heart-lifeskin-chips--bogen" role="group">
        <button type="button" class="heart-lifeskin-chip heart-lifeskin-chip--an"
                data-action="lifeskin-bogen" data-wert="befund" aria-pressed="true">Befund</button>
        <button type="button" class="heart-lifeskin-chip"
                data-action="lifeskin-bogen" data-wert="texte" aria-pressed="false">Texte der Seite${
          eigeneTexte ? ` <span>${eigeneTexte}</span>` : ""}</button>
      </div>

      <div data-bogen="befund">

      <!-- Oben nur das Einfuegen.
           Die Analyse entsteht in einem anderen Fenster und liegt in der
           Zwischenablage, nicht als Datei. Ein Umweg ueber "Speichern
           unter" waere je Patient ein Schritt mehr - bei fuenfzig am Tag
           sind das fuenfzig. Was eingefuegt wird, fuellt den Bogen
           darunter; geaendert werden kann dort trotzdem alles. -->
      <div class="heart-lifeskin-vorlage">
        <textarea class="heart-lifeskin-eingabe" id="lifeskin-json" rows="3"
                  placeholder="JSON der Analyse hier einfuegen — Anfuehrungszeichen und Vorrede sind egal"></textarea>
        <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-prompt-kopieren">Prompt v8 für diesen Fall kopieren</button>
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
        <!-- PROMPT v8: die Texte der neuen Therapieseite (/terapia/...).
             Aenderbar wie die Begriffe darueber. Leer heisst: Die Seite
             baut ihre Saetze aus dem Befund. -->
        <label class="heart-lifeskin-feld">Texte der Therapieseite – shitja (JSON, vor Freigabe prüfen)
          <textarea class="heart-lifeskin-eingabe" rows="6" data-raport-shitja>${escapeHtml(raport.shitja ? JSON.stringify(raport.shitja, null, 2) : "")}</textarea>
        </label>

        <div class="heart-lifeskin-bogen__leib">
          ${RAPORT_BOGEN.map((f) => `
            <label class="heart-lifeskin-feld">
              <span class="heart-lifeskin-feld__kopf">
                <span>${escapeHtml(f.marke)}</span>
                ${fuellungsMarke(f.art === "stufe" ? "stufe" : "raport", f.id, bogenWerte[f.id])}
              </span>
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

      </div><!-- /Bogen Befund -->

      <div data-bogen="texte" hidden>
        ${renderTexteEditor(bericht)}
      </div>

      <!-- Der Fuss steht AUSSERHALB beider Boegen: Freigegeben wird immer
           beides zusammen, egal welcher gerade offen ist. -->
      <div class="heart-lifeskin-editor__fuss">
        <!-- DER KNOPF HEISST, WAS ER FREIGIBT.
             Bei einem Scan und bei einem Foto ist das ein Befund. Bei
             Trup und Pytje ist es eine Antwort - dort wurde nichts
             gemessen, und "Befund" waere ein Wort, das mehr behauptet
             als dahinter steht. Derselbe Knopf, derselbe Weg, ein
             anderes Wort. -->
        <button type="button" class="heart-lifeskin-knopf heart-lifeskin-knopf--stark"
                data-action="lifeskin-bericht-freigeben" data-id="${escapeHtml(sitzung.id)}">
          ${fertig ? "Aenderungen freigeben"
            : (["trup", "pytje"].includes(typVon(sitzung)) ? "Antwort freigeben" : "Befund freigeben")}
        </button>
        <!-- Erst ansehen, dann freigeben. Die Vorschau schreibt denselben
             Befund, nur im Zustand "vorschau": Der Patient sieht weiter
             seine Warteseite, wir sehen die fertige Seite. -->
        <button type="button" class="heart-lifeskin-knopf"
                data-action="lifeskin-bericht-vorschau" data-id="${escapeHtml(sitzung.id)}">
          Nur fuer uns (Vorschau)
        </button>
        ${bericht?.status === "vorschau" ? `<a class="heart-lifeskin-link" href="/analiza/${escapeHtml(sitzung.id)}?vorschau=1" target="_blank" rel="noopener">Vorschau ansehen</a>` : ""}
        ${fertig ? `<a class="heart-lifeskin-link" href="/analiza/${escapeHtml(sitzung.id)}" target="_blank" rel="noopener">Seite ansehen</a>` : ""}
        ${bericht?.status === "vorschau" ? `<a class="heart-lifeskin-link" href="/terapia/${escapeHtml(sitzung.id)}?vorschau=1&amp;still=1" target="_blank" rel="noopener">Neue Therapieseite (Vorschau)</a>` : ""}
        ${fertig && stand !== "vorschau" ? `<a class="heart-lifeskin-link" href="/terapia/${escapeHtml(sitzung.id)}?still=1" target="_blank" rel="noopener">Neue Therapieseite ansehen</a>` : ""}
        ${fertig && bericht?.raport?.shitja?.whatsapp ? `<button type="button" class="heart-lifeskin-kopier"
            data-action="lifeskin-text-kopieren" data-was="WhatsApp-Nachricht"
            data-wert="${escapeHtml(whatsappNachricht(sitzung, bericht))}">WhatsApp-Nachricht kopieren</button>` : ""}
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

function renderProduktEditor(produkt, status, entwurf) {
  const p = produkt || {};
  const neu = !p.id;

  // DER ENTWURF SCHLAEGT DAS GESPEICHERTE.
  //
  // Heart zeichnet bei JEDER Zustandsaenderung neu, und dabei wird der
  // Bereich als Ganzes neu geschrieben - auch wegen einer Meldung, die
  // nach drei Sekunden von selbst wieder verschwindet. Was nur im
  // Formular stand und nirgends sonst, war danach weg.
  //
  // Genau daran scheiterte das Tauschen des Produktfotos: Das gewaehlte
  // Bild landete im versteckten Feld, die Erfolgsmeldung zeichnete den
  // Bereich neu, und das Feld trug wieder das ALTE Bild. Gespeichert
  // wurde danach, was schon dastand - fuer den, der davorsitzt, "geht
  // nicht".
  //
  // Liegt ein Entwurf im Zustand, gewinnt er. Er ueberlebt jedes
  // Neuzeichnen, und "Speichern" schreibt, was zu sehen ist.
  const feldwert = (name, ersatz) => (
    entwurf && entwurf[name] !== undefined ? String(entwurf[name] ?? "") : ersatz
  );

  return `
    <section class="heart-lifeskin-block heart-lifeskin-editor">
      <button type="button" class="heart-lifeskin-zurueck" data-action="lifeskin-produkt-zu">← Alle Produkte</button>
      <h3 class="heart-lifeskin-block__titel">${neu ? "Neues Produkt" : escapeHtml(p.name || p.id)}</h3>

      ${feld("id", "Kennung", feldwert("id", p.id), { hinweis: neu ? "Kleinbuchstaben und Bindestriche, z. B. lf-acne. Laesst sich spaeter nicht aendern." : "" })}
      ${feld("name", "Name", feldwert("name", p.name))}
      ${feld("nenName_sq", "Untertitel (albanisch)", feldwert("nenName_sq", p.nenName?.sq), { hinweis: "z. B. Terapi kundër aknes" })}
      ${feld("nenName_de", "Untertitel (deutsch)", feldwert("nenName_de", p.nenName?.de))}
      ${feld("inhalt", "Inhalt", feldwert("inhalt", p.inhalt), { hinweis: "z. B. 30 ml" })}
      ${feld("einzelpreis", "Einzelpreis in Euro", feldwert("einzelpreis", p.einzelpreis), { art: "number", hinweis: "Der Ankerpreis. Einzeln 33, zwei zusammen 53 - die Summe steht durchgestrichen ueber dem Setpreis." })}
      ${feld("order", "Reihenfolge", feldwert("order", p.order ?? 1), { art: "number" })}

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
            .map(([w, t]) => `<option value="${w}"${feldwert("lloji", p.lloji || "tonik") === w ? " selected" : ""}>${t}</option>`).join("")}
        </select>
      </label>
      <label class="heart-lifeskin-feld heart-lifeskin-feld--reihe">
        <span>Rolle im Set</span>
        <select data-produktfeld="roli">
          ${[["baze", "Basis — das wirkende Mittel"], ["mbeshtetje", "Stütze — hält die Basis verträglich"],
             ["pastrim", "Reinigung — Schritt 1"]]
            .map(([w, t]) => `<option value="${w}"${feldwert("roli", p.roli || "baze") === w ? " selected" : ""}>${t}</option>`).join("")}
        </select>
      </label>

      <h4 class="heart-lifeskin-verteilung__titel">Kurztext</h4>
      ${feld("kurztext_sq", "Albanisch", feldwert("kurztext_sq", p.kurztext?.sq))}
      ${feld("kurztext_de", "Deutsch", feldwert("kurztext_de", p.kurztext?.de))}

      <h4 class="heart-lifeskin-verteilung__titel">Beschreibung</h4>
      <label class="heart-lifeskin-feld">
        <span>Albanisch</span>
        <textarea data-produktfeld="beschreibung_sq" rows="3">${escapeHtml(feldwert("beschreibung_sq", p.beschreibung?.sq || ""))}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Deutsch</span>
        <textarea data-produktfeld="beschreibung_de" rows="3">${escapeHtml(feldwert("beschreibung_de", p.beschreibung?.de || ""))}</textarea>
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
                  placeholder="Hap folikulin e bllokuar dhe largon qelizat e vdekura&#10;Ul bakterin qe ushqen inflamacionin&#10;Qeteson skuqjen pa e thare barrieren">${escapeHtml(feldwert("veprimi_sq", (p.veprimi?.sq || []).join("\n")))}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Deutsch</span>
        <textarea data-produktfeld="veprimi_de" rows="4"
                  placeholder="Oeffnet den verstopften Follikel und loest abgestorbene Zellen&#10;Senkt das Bakterium, das die Entzuendung naehrt&#10;Beruhigt die Roetung, ohne die Barriere auszutrocknen">${escapeHtml(feldwert("veprimi_de", (p.veprimi?.de || []).join("\n")))}</textarea>
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
                  placeholder="{emri}, ky serum eshte zgjedhur per {gjetja} qe verejta te ju.">${escapeHtml(feldwert("persoenlich_sq", p.persoenlich?.sq || ""))}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Deutsch</span>
        <textarea data-produktfeld="persoenlich_de" rows="2"
                  placeholder="{emri}, dieses Serum ist fuer {gjetja} gewaehlt, die ich bei Ihnen sehe.">${escapeHtml(feldwert("persoenlich_de", p.persoenlich?.de || ""))}</textarea>
      </label>
      <div class="heart-lifeskin-vorschau" id="heartLifeskinVorschau">
        <span>So liest es eine Patientin</span>
        <b>${escapeHtml(fuellePlatzhalter(feldwert("persoenlich_sq", p.persoenlich?.sq || ""), BEISPIEL) || "—")}</b>
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
                  placeholder="Benzoyl Peroxide | 4% | Ul bakterin C. acnes | Senkt das Bakterium&#10;Niacinamide | 4% | Qetëson skuqjen | Beruhigt die Roetung">${escapeHtml(feldwert("perberesit", (p.perberesit || []).map((w) =>
                    [w.emri, w.sasia || "", w.roli?.sq || "", w.roli?.de || ""].join(" | ")).join("\n")))}</textarea>
      </label>

      <!-- Die Anwendung.
           "Und wie benutze ich das?" wird VOR dem Kauf gestellt. Wer die
           Antwort nicht findet, kauft nicht - er schiebt es auf, und
           aufgeschoben heisst nie. -->
      <h4 class="heart-lifeskin-verteilung__titel">Anwendung</h4>
      ${feld("perdorimi_hapi", "Schritt in der Routine", feldwert("perdorimi_hapi", p.perdorimi?.hapi ?? 2), { art: "number", hinweis: "1 = Reinigung, 2 = Wirkstoff, 3 = Pflege. Danach sortiert die Seite." })}
      ${feld("perdorimi_koha_sq", "Wann (albanisch)", feldwert("perdorimi_koha_sq", p.perdorimi?.koha?.sq), { hinweis: "z. B. vetëm në mbrëmje" })}
      ${feld("perdorimi_koha_de", "Wann (deutsch)", feldwert("perdorimi_koha_de", p.perdorimi?.koha?.de))}
      ${feld("perdorimi_sasia_sq", "Wieviel (albanisch)", feldwert("perdorimi_sasia_sq", p.perdorimi?.sasia?.sq), { hinweis: "z. B. sa një bizele" })}
      ${feld("perdorimi_sasia_de", "Wieviel (deutsch)", feldwert("perdorimi_sasia_de", p.perdorimi?.sasia?.de))}
      <label class="heart-lifeskin-feld">
        <span>Wie (albanisch)</span>
        <textarea data-produktfeld="perdorimi_si_sq" rows="2">${escapeHtml(feldwert("perdorimi_si_sq", p.perdorimi?.si?.sq || ""))}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Wie (deutsch)</span>
        <textarea data-produktfeld="perdorimi_si_de" rows="2">${escapeHtml(feldwert("perdorimi_si_de", p.perdorimi?.si?.de || ""))}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Worauf achten (albanisch)</span>
        <textarea data-produktfeld="perdorimi_kujdes_sq" rows="2">${escapeHtml(feldwert("perdorimi_kujdes_sq", p.perdorimi?.kujdes?.sq || ""))}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Worauf achten (deutsch)</span>
        <textarea data-produktfeld="perdorimi_kujdes_de" rows="2">${escapeHtml(feldwert("perdorimi_kujdes_de", p.perdorimi?.kujdes?.de || ""))}</textarea>
      </label>

      <!-- Das Ziel bis Tag 28.
           Es nennt auch eine Grenze - und genau deshalb wird es geglaubt.
           Eine Prognose, die nur verspricht, wird es nicht. -->
      <h4 class="heart-lifeskin-verteilung__titel">Ziel bis Tag 28</h4>
      <label class="heart-lifeskin-feld">
        <span>Albanisch</span>
        <textarea data-produktfeld="synimi_sq" rows="2"
                  placeholder="Deri në ditën 28: … Gjurmët e vjetra kërkojnë më shumë kohë.">${escapeHtml(feldwert("synimi_sq", p.synimi?.sq || ""))}</textarea>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Deutsch</span>
        <textarea data-produktfeld="synimi_de" rows="2">${escapeHtml(feldwert("synimi_de", p.synimi?.de || ""))}</textarea>
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
                      placeholder='[{"kur": {"parametri": "poret", "nga": 2}, "teksti": {"sq": "…", "de": "…"}}, {"kur": {}, "teksti": {"sq": "…", "de": "…"}}]'>${escapeHtml(feldwert("lidhja", JSON.stringify(p.lidhja || [], null, 2)))}</textarea>
          </label>
        </div>
      </details>

      <h4 class="heart-lifeskin-verteilung__titel">Sichtbarkeit</h4>
      <label class="heart-lifeskin-feld heart-lifeskin-feld--reihe">
        <span>Im Trichter</span>
        <select data-produktfeld="availability">
          <option value="visible" ${feldwert("availability", p.availability) !== "hidden" ? "selected" : ""}>sichtbar</option>
          <option value="hidden" ${feldwert("availability", p.availability) === "hidden" ? "selected" : ""}>ausgeblendet</option>
        </select>
      </label>
      <h4 class="heart-lifeskin-verteilung__titel">Foto</h4>
      ${(() => {
        // Das gewaehlte Bild, solange es noch nicht gespeichert ist -
        // sonst das gespeicherte. Beide stehen an derselben Stelle:
        // Zwei Bilder nebeneinander liessen raten, welches gilt.
        const foto = feldwert("photoRef", String(p.photoRef || ""));
        const nochNichtGespeichert = foto !== String(p.photoRef || "");
        return `
      <div class="heart-lifeskin-fotowahl">
        ${foto ? `<img src="${escapeHtml(foto)}" alt="" />` : `<div class="heart-lifeskin-fotoleer">kein Foto</div>`}
        <div>
          <!-- HIER STAND DAS FELD SELBST, UND DAS WAR DER FEHLER.
               Ein <input type="file"> mitten im neu gezeichneten Kasten
               ueberlebt die offene Fotoauswahl nicht: Das Telefon legt
               die Seite in den Hintergrund, beim Zurueckkommen wird der
               Bereich neu geschrieben, und das Feld mit dem gewaehlten
               Bild haengt an keinem Dokument mehr. Daher "beim ersten
               Mal geht es nicht". Das Feld entsteht jetzt an <body>,
               wenn der Knopf gedrueckt wird - siehe oeffneDateiwahl()
               in heart.js. -->
          <button type="button" class="heart-lifeskin-fotoknopf"
                  data-action="trigger-crm-file" data-crm-file-input="heartLifeskinFotoInput">
            ${foto ? "Foto tauschen" : "Foto vom Handy waehlen"}
          </button>
          ${foto ? `<button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-produkt-foto-weg">Foto entfernen</button>` : ""}
          ${nochNichtGespeichert ? `<small class="heart-lifeskin-fotoneu">Noch nicht gespeichert.</small>` : ""}
          <small>Wird auf 900 Bildpunkte verkleinert und im Produkt gespeichert. Kein Hochladen woandershin noetig.</small>
        </div>
      </div>
      <input type="hidden" data-produktfeld="photoRef" value="${escapeHtml(foto)}" />`;
      })()}

      ${renderLandingFotot(p, entwurf)}

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

// ══ DIE BILDER DER LANDINGPAGE ═════════════════════════════════════
//
// GANZ UNTEN IM PRODUKT, und das ist kein Rest, sondern die Reihenfolge
// der Arbeit: Erst steht, WAS das Mittel ist und was es tut - das
// braucht der Befund. Die Bilder danach sind das Schaufenster.
//
// SIE SIND ETWAS ANDERES ALS DAS FOTO DARUEBER. Das eine Foto steht im
// Befund der Patientin neben ihrem Mittel; diese hier stehen auf der
// Landingpage in einer Bahn zum Wischen, und dort sind mehrere der
// Sinn der Sache: eine Aufnahme der Flasche, eine in der Hand, eine im
// Bad. Deshalb liegen sie auch woanders (siehe Adapter) - zwei bis
// sechs Datenzeilen wuerden das Produktdokument sprengen.
//
// SIE SPEICHERN SICH SOFORT, nicht mit dem Knopf unten. Das ist ein
// bewusster Unterschied zum Rest des Formulars: Ein Bild ist entweder
// da oder nicht, es gibt nichts daran zu entwerfen - und wer drei
// Bilder waehlt und dann vergisst zu speichern, hat drei Bilder
// verloren, die er einzeln herausgesucht hat.
//
// EIN MITTEL OHNE BILD ERSCHEINT AUF DER LANDINGPAGE NICHT. Das ist
// zugleich der Schalter: Wer ein Mittel dort zeigen will, legt ein Bild
// dazu; wer es wegnehmen will, nimmt die Bilder weg. Niemand muss dafuer
// Code anfassen, und es steht als Satz im Bereich.
function renderLandingFotot(p, entwurf) {
  if (!p.id) {
    return `
      <h4 class="heart-lifeskin-verteilung__titel">Bilder fuer die Landingpage</h4>
      <p class="heart-lifeskin-leer">
        Erst speichern, dann lassen sich hier Bilder anlegen — sie haengen an der Kennung des Produkts.
      </p>`;
  }

  const fotot = Array.isArray(entwurf?.landingFotot) ? entwurf.landingFotot : null;
  const laedt = entwurf?.landingFototStatus === "laeuft";

  if (fotot === null) {
    return `
      <h4 class="heart-lifeskin-verteilung__titel">Bilder fuer die Landingpage</h4>
      <p class="heart-lifeskin-leer">${laedt ? "Bilder werden geladen …" : "Bilder werden geladen …"}</p>`;
  }

  /* DIE REIHENFOLGE MIT ZWEI PFEILEN UND NICHT MIT ZIEHEN.
     Das hier wird am Telefon bedient, und dort ist Ziehen dasselbe wie
     Scrollen: Wer ein Bild anfasst und bewegt, rollt die Seite. Zwei
     Pfeile treffen immer, auch mit dem Daumen.
     Am Anfang und am Ende steht der Pfeil, der nirgends hinfuehrt,
     nicht als toter Knopf da - er ist ausgegraut und nicht antippbar. */
  const kacheln = fotot.map((foto, i) => {
    const erster = i === 0;
    const letzter = i === fotot.length - 1;
    const pfeil = (richtung, aus, zeichen, satz) => `
      <button type="button" class="heart-lifeskin-landingbild__schieb"
              data-action="lifeskin-landingbild-schieben"
              data-index="${i}" data-richtung="${richtung}"
              ${aus || laedt ? "disabled" : ""}
              aria-label="${satz}">${zeichen}</button>`;
    return `
    <figure class="heart-lifeskin-landingbild">
      <img src="${escapeHtml(foto)}" alt="" />
      <figcaption>
        ${pfeil("zurueck", erster, "‹", `Bild ${i + 1} nach vorne`)}
        <span>${i + 1}</span>
        ${pfeil("vor", letzter, "›", `Bild ${i + 1} nach hinten`)}
      </figcaption>
      <button type="button" class="heart-lifeskin-landingbild__weg"
              data-action="lifeskin-landingbild-weg" data-index="${i}"
              aria-label="Bild ${i + 1} entfernen">×</button>
    </figure>`;
  }).join("");

  const voll = fotot.length >= 6;

  return `
    <h4 class="heart-lifeskin-verteilung__titel">Bilder fuer die Landingpage</h4>
    <p class="heart-lifeskin-leer">
      Sie stehen unter <b>„Rezultate që shihen“</b> auf mnyra.com/lifeskin, zwei Mittel in einer Reihe,
      zum Wischen. Das erste Bild ist das, das jeder sieht. <b>Ohne Bild erscheint das Mittel dort nicht</b> —
      so nehmen Sie es auch wieder weg. Mit <b>‹</b> und <b>›</b> unter einem Bild aendern Sie die
      Reihenfolge. Hoechstens sechs, jedes wird auf 1000 Bildpunkte verkleinert.
      <b>Bilder speichern sich sofort</b>, der Knopf unten ist nur fuer den Text.
    </p>
    <div class="heart-lifeskin-landingbilder">
      ${kacheln}
      ${voll ? "" : `
      <!-- Kein Feld im Kasten: Es ueberlebt das Neuzeichnen nicht,
           waehrend die Fotoauswahl offensteht. Siehe
           oeffneDateiwahl() in heart.js. Mehrere Bilder in einem Griff
           kann es trotzdem - das Feld entsteht mit multiple. -->
      <button type="button" class="heart-lifeskin-landingbild__neu"
              data-action="trigger-crm-file" data-crm-file-input="heartLifeskinLandingInput"
              ${laedt ? "disabled" : ""}>
        ${laedt ? "…" : "+ Bild"}
      </button>`}
    </div>
    ${voll ? `<p class="heart-lifeskin-leer">Sechs Bilder sind das Hoechste. Nehmen Sie eines weg, um ein anderes zu legen.</p>` : ""}`;
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
  //
  // zustand.trichter WIRD HIER NICHT MEHR GEZEICHNET und steht trotzdem
  // in der Bedingung: Der Adapter rechnet ihn zusammen mit den Kacheln,
  // und damit ist er das Zeichen dafuer, dass der Lader durch ist. Die
  // sechs Trichter darunter werden beim Zeichnen gerechnet - reine
  // Funktionen ueber ein paar hundert Sitzungen.
  if (!zustand || !zustand.kennzahlen || !Array.isArray(zustand.trichter)) {
    return `<p class="heart-lifeskin-leer">Wird geladen …</p>`;
  }

  const { sitzungen, produkte } = zustand;

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
    return `<div class="heart-lifeskin">${renderProduktEditor(produkt, zustand.produktStatus, zustand.produktEntwurf)}</div>`;
  }

  if (zustand.offen) {
    const sitzung = findeSitzung(zustand, zustand.offen);
    return `<div class="heart-lifeskin">${renderSitzungDetail(
      sitzung, (zustand.fotos || {})[zustand.offen] || null, zustand.fotosStatus,
      zustand.produkte || [], (zustand.berichte || {})[zustand.offen] || null,
      zustand.loeschGefragt === zustand.offen
    )}</div>`;
  }

  // DER ZEITRAUM GILT FUER ALLES, WAS DARUNTER STEHT.
  //
  // Kacheln, Trichter und Lesetiefe zeigen denselben Ausschnitt - zwei
  // Bloecke mit verschiedenen Zeitraeumen nebeneinander liest niemand
  // richtig. Gerechnet wird beim Zeichnen: Es sind reine Funktionen ueber
  // ein paar hundert Sitzungen, und dafuer noch einmal zu Firestore zu
  // gehen waere eine Ladezeit fuer nichts.
  const zeitraum = zustand.zeitraum || "";
  const imBlick = zeitraum ? imZeitraum(sitzungen || [], zeitraum) : (sitzungen || []);
  const zahlen = zeitraum
    ? baueKennzahlen(sitzungen || [], { setPreis: zustand.konfig?.setPreis, zeitraum })
    : baueKennzahlen(sitzungen || [], { setPreis: zustand.konfig?.setPreis });
  const trichterListe = baueTrichterListe(sitzungen, imBlick, zeitraum);

  // DIE REIHENFOLGE IST DIE DES BLICKS UND NICHT DIE DER GESCHICHTE:
  //
  //   1. Der Zeitraum - er gilt fuer alles darunter.
  //   2. Acht Kacheln: was heute passiert ist.
  //   3. Zwei Live-Karten: was gerade passiert.
  //   4. Sechs Trichter: wo es haengt.
  //   5. Faelle: was zu tun ist.
  //   6. Bestellungen, Nachfassen: was danach kam.
  return `
    <div class="heart-lifeskin">
      ${nochNichts ? `
        <p class="heart-lifeskin-leer">
          Noch keine Analyse. Die Zahlen fuellen sich mit dem ersten Besucher
          auf <b>mnyra.com/lifeskin</b>.
        </p>` : ""}
      ${renderChips(ZEITRAEUME, zeitraum || "heute", "lifeskin-zeitraum")}
      ${renderKacheln(zahlen, zeitraum)}
      ${zustand.liveFehler
        ? leererBlock("Live", "Verbindung unterbrochen — Live-Zahlen nicht verfuegbar.")
        : renderLive(zustand.live)}
      ${renderTrichter(trichterListe, zustand.trichterOffen || "main")}
      ${renderAnalysen(sitzungen, zustand.berichte || {}, zustand.fach || "alle", "Fälle", "",
        zustand.vorschau || {})}
      ${renderBestellungen(sitzungen, zustand.bestellZeitraum || "heute")}
      ${renderNachfassen(zahlen)}
      ${renderStillLinks(zustand)}

      <!-- WAS NICHT JEDEN TAG GELESEN WIRD, STEHT NICHT JEDEN TAG IM WEG.
           Die Hauptflaeche beantwortet drei Fragen: Was ist neu? Was muss
           ich bearbeiten? Was hat der Kunde danach gemacht? Alles andere -
           Produkte, Herkunft, Verteilung, die eigenen Testlaeufe, der
           Anbieter - wird hoechstens einmal in der Woche angefasst und
           liegt deshalb zugeklappt darunter.

           Zugeklappt und nicht geloescht: Der Anbieter ist die einzige
           Stelle, an der Name, Anschrift und E-Mail unter jeder
           Befundseite geaendert werden koennen; ohne diesen Kasten
           stuenden sie fest und niemand kaeme mehr daran. -->
      <details class="heart-lifeskin-mehr">
        <summary>Mehr anzeigen</summary>
        ${renderHerkunft(baueHerkunft(imBlick))}
        ${renderProdukte(produkte)}
        ${renderVerteilung(baueVerteilung(imBlick))}
        ${renderTests(zustand.tests, zustand.berichte || {})}
        ${renderAnbieter(zustand.konfig?.anbieter, zustand.anbieterStatus)}
      </details>
      <!-- GANZ UNTEN, UND ZWAR BEIDE.
           Oben standen sie vor der ersten Zahl: ein Knopf, der alles
           loescht, und ein Schalter, der auf diesem Geraet laengst
           eingeschaltet ist. Beides wird hoechstens einmal angefasst,
           waehrend alles dazwischen jeden Tag gelesen wird - und der
           Loeschknopf will ohnehin nicht dort stehen, wo die Hand beim
           Scrollen zuerst hinkommt. -->
      ${renderPushSchalter()}
      ${renderReset((sitzungen || []).length, zustand.resetGefragt, zustand.resetStatus)}
    </div>`;
}
