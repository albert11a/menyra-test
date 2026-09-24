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

import { pfadLesen } from "../../shared/lifeskin-klickpfad.js";
import { escapeHtml } from "./heart-ui-utils.js";
import { renderHeartIcon } from "./heart-icons.js";
// Der Setpreis kommt aus derselben Quelle wie im Trichter. Zwei Zahlen an
// zwei Stellen sind genau der Fehler, der hier schon einmal zehn Euro je
// Set gekostet hat.
import { ZEITRAEUME, TYPEN, typVon, istAnalyse, findeSitzung, heuteSchluessel, imZeitraum, zustandVon, baueKennzahlen, baueZweige, baueMaintrichter, baueKauftrichter, ohneScanGelaufen, baueLesetiefe, baueHerkunft, baueVerteilung, bestellungenImZeitraum } from "./heart-lifeskin-berechnung.js";
// (Die eigenen Texte der alten Analyseseite werden nicht mehr bearbeitet - sie reisen unsichtbar mit.)
// Die Antworten aus dem Trichter, uebersetzt - aus DERSELBEN Quelle, aus
// der auch der Prompt gefuellt wird. Eine eigene Tabelle hier waere eine
// Frage der Zeit: Wer im Trichter eine Antwort dazunimmt und hier nicht,
// zeigt der Aerztin eine nackte Kennung ("yndyrshme") und laesst sie raten.
import { anamneseFuerPrompt } from "./heart-lifeskin-prompt.js";
import { preisFuerFall } from "../../shared/lifeskin-preise.js";
// Die vorbereiteten Mittel. Dieselbe Liste, mit der gebaut und getestet
// wird - was hier fehlt, kann Dr. Gashi mit einem Druck anlegen.
import { STANDARD_PRODUKTE } from "../lifeskin/lifeskin-catalog.js";
// Die Vorher/Nachher-Faelle: Karte, Editor, Auswahl im Befund - und das
// Aufklappen, das ein Neuzeichnen ueberlebt.
import { renderRaste, renderRastiEditor, renderBefundRasteAuswahl, rasteListe } from "./heart-lifeskin-raste.js";
import { klappAttr, alsKlapp } from "./heart-lifeskin-klapp.js";
import { entwurfLesen } from "./heart-lifeskin-entwurf.js";
import { vorschauKasten } from "./heart-lifeskin-vorschau.js";
import { ohneSeite, ohneSeiteTief } from "../../shared/lifeskin-ohne-seite.js";

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
        zusatz: `ca. ${euro(kennzahlen.kaufAbbruchBetrag ?? 0)} Potenzial`,
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
  // Zugeklappt: wer gerade wo ist, in einer Zeile ("1 Landing · 2 Foto").
  // Beim Kauf blinkt zusaetzlich der Rand - dort liegt Geld.
  const zahl = (reihe?.punkte || []).filter((p) => p.anzahl > 0)
    .map((p) => `${p.anzahl} ${p.label}`).join(" · ") || "niemand";
  return alsKlapp(`
    <section class="heart-lifeskin-block heart-live" id="heart-live-${escapeHtml(art)}">
      <h3 class="heart-lifeskin-block__titel">${escapeHtml(titel)}</h3>
      ${renderLiveReihe(reihe, art)}
      <p class="heart-lifeskin-block__fuss">${still
        ? "Gerade ist niemand unterwegs."
        : `${reihe.gesamt} ${reihe.gesamt === 1 ? "Person ist" : "Personen sind"} gerade dabei.`}</p>
    </section>`, `live-${art}`, {
    zahl, ton: still ? "" : "offen", blink: art === "bestellungen" && !still
  });
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

  return alsKlapp(`
    ${renderChips(chips, offen.id, "lifeskin-trichter")}
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Trichter · ${escapeHtml(offen.titel || offen.label)}</h3>
      <div class="heart-lifeskin-trichter">${renderStufen(offen.stufen)}</div>
      ${offen.fuss ? `<p class="heart-lifeskin-block__fuss">${escapeHtml(offen.fuss)}</p>` : ""}
      ${schlimmster && schlimmster.verlust > 0.2
        ? `<p class="heart-lifeskin-block__fuss">Groesster Verlust bei „${escapeHtml(schlimmster.label)}" — ${escapeHtml(verloreneLeute(offen.stufen, schlimmster))}.</p>`
        : ""}
    </section>`, "trichter");
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

  const zeitraumWort = (BESTELL_ZEITRAEUME.find((z) => z.id === zeitraum) || BESTELL_ZEITRAEUME[0]).label;
  const zahl = `${gewaehlt.length} · ${zeitraumWort}`;
  if (!alle.length) {
    return alsKlapp(leererBlock("Bestellungen", "Noch keine Bestellung."), "bestellungen", { zahl: "keine" });
  }

  // Nicht still abschneiden: bis 300 Zeilen, und darueber ein Hinweis.
  const zeilen = gewaehlt.slice(0, 300).map((s) => `
    <button type="button" class="heart-lifeskin-zeile" data-action="lifeskin-sitzung" data-id="${escapeHtml(s.id)}">
      <span class="heart-lifeskin-zeile__zeit">${escapeHtml(datumKurz(s.bestelltAt || s.createdAt))} ${escapeHtml(uhrzeit(s.bestelltAt || s.createdAt))}</span>
      <span class="heart-lifeskin-zeile__leib">
        <b>${escapeHtml(s.address?.name || s.name || "—")}</b>
        <small>${escapeHtml([s.address?.strasse, s.address?.ort].filter(Boolean).join(", "))}</small>
      </span>
      <span class="heart-lifeskin-zeile__wert">${escapeHtml(euro(s.order?.total))}</span>
      <span class="heart-lifeskin-marke ${s.order?.still ? "heart-lifeskin-marke--offen" : "heart-lifeskin-marke--neu"}">${
        escapeHtml(s.order?.still ? "still · Test?" : (s.order?.status || "neu"))}</span>
    </button>`).join("") + (gewaehlt.length > 300
    ? `<p class="heart-lifeskin-leer">+ ${gewaehlt.length - 300} ältere – kleineren Zeitraum wählen.</p>` : "");

  return alsKlapp(`
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Bestellungen</h3>
      ${chips}
      ${zeilen ? `<div class="heart-lifeskin-zeilen">${zeilen}</div>`
        : `<p class="heart-lifeskin-leer">In diesem Zeitraum keine Bestellung.</p>`}
    </section>`, "bestellungen", { zahl, ton: gewaehlt.length ? "offen" : "" });
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
    .slice(0, 300);

  // Zugeklappt, bis jemand hineinsieht - mit der Zahl im Kopf, damit man
  // auch zugeklappt weiss, ob etwas wartet.
  const klapp = (zahl, inhalt) => `
    <details class="heart-lifeskin-block heart-klapp" ${klappAttr("nachfassen")}>
      <summary class="heart-klapp__kopf">
        <h3 class="heart-lifeskin-block__titel">Nachfassen</h3>
        <span class="heart-klapp__zahl${zahl ? " heart-klapp__zahl--offen" : ""}">${zahl ? `${zahl} offen` : "niemand offen"}</span>
      </summary>
      ${inhalt}
    </details>`;

  if (!eintraege.length) {
    return klapp(0, `<p class="heart-lifeskin-block__fuss">Niemand offen — kein angefangener Kauf, der liegen geblieben ist.</p>`);
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

  return klapp(eintraege.length, `
      <p class="heart-lifeskin-block__fuss">
        Kasse geoeffnet, nicht bestellt, laenger als eine halbe Stunde her —
        mit Fallnummer und Kontakt.
      </p>
      <div class="heart-lifeskin-zeilen">${zeilen}</div>`);
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
    <details class="heart-lifeskin-block heart-still heart-klapp" id="heart-still" ${klappAttr("still")}>
      <summary class="heart-klapp__kopf">
        <h3 class="heart-lifeskin-block__titel">Seiten ohne Stats</h3>
        <span class="heart-klapp__zahl">Links</span>
      </summary>
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
    </details>`;
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

  // Cremes werden nicht in Tropfen dosiert. Wo noch "pika" steht, ein
  // Druck, der die Menge auf die Erbse des Katalogs setzt - nur dieses
  // eine Feld, sonst nichts.
  const mitPika = (produkte || []).filter((p) => /\bpika\b/i.test(String(p?.perdorimi?.sasia?.sq ?? p?.perdorimi?.sasia ?? "")));

  return `
    <section class="heart-lifeskin-block">
      <h3 class="heart-lifeskin-block__titel">Produkte</h3>
      ${mitPika.length ? `
      <div class="heart-lifeskin-anlegen">
        <p>Menge noch in Tropfen („pika“): <b>${mitPika.map((p) => escapeHtml(p.name || p.id)).join(", ")}</b>.
           Alle sind Cremes – umstellen auf „sa një bizele …“ wie bei LF ACNE?</p>
        <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-produkte-bizele">
          Auf „sa një bizele“ umstellen
        </button>
      </div>` : ""}
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
export function renderPushSchalter() {
  return `
      <div class="heart-lifeskin-push" data-push-schalter hidden>
        <div>
          <b data-push-titel>Meldungen bei Analysen und Bestellungen</b>
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

// Wie die Art am einzelnen Fall steht: als erster Chip der unteren Zeile,
// in derselben Schrift wie die anderen ("Scan", "Foto", ...).
function artMarke(sitzung) {
  const typ = typVon(sitzung);
  const eintrag = TYPEN.find((t) => t.id === typ);
  if (!eintrag) return "";
  return `<span class="heart-lifeskin-art heart-lifeskin-art--${escapeHtml(typ)}">${
    escapeHtml(eintrag.label)}</span>`;
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

// Die Marken der unteren Zeile: der Weg, dann Geöffnet und Kasse. Sie stehen IMMER da, auch
// wenn sie nicht erreicht sind - nur blass. So ist auf einen Blick zu sehen,
// wo jemand haengengeblieben ist, ohne die Zeilen untereinander zu
// vergleichen.
function fallMarken(sitzung) {
  const marken = [
    { id: "auf", label: "Geöffnet", an: !!sitzung.berichtGeoeffnet },
    { id: "kasse", label: "Kasse", an: !!(sitzung.kasseGeoeffnet || sitzung.hatBestellt) }
  ];
  const reihe = artMarke(sitzung)
    + (sitzung.nurBericht ? `<span class="heart-lifeskin-pill heart-lifeskin-pill--paskanim heart-lifeskin-pill--an" title="Die Sitzung kam nicht an, der Bericht schon - Kontaktdaten fehlen">nur Bericht</span>` : "")
    + marken.map((m) => `<span class="heart-lifeskin-pill heart-lifeskin-pill--${m.id}${m.an ? " heart-lifeskin-pill--an" : ""}">${escapeHtml(m.label)}</span>`).join("");

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
  // Datum und Uhrzeit als eigene Chips, gleich hoch wie die Marken.
  const zeit = [datumKurz(sitzung.createdAt), uhrzeit(sitzung.createdAt)].filter(Boolean)
    .map((w) => `<span class="heart-lifeskin-fall__zeit">${escapeHtml(w)}</span>`).join("");
  const reihe = `<span class="heart-lifeskin-fall__fuss">${fallMarken(sitzung)}${zeit}</span>`;
  if ((typ === "trup" || typ === "pytje") && text) {
    const kurz = text.length > 110 ? `${text.slice(0, 110).trimEnd()}…` : text;
    return `${reihe}<span class="heart-lifeskin-fall__text">${escapeHtml(kurz)}</span>`;
  }
  return reihe;
}

// AUSWAHL: Das Zahnrad oben rechts schaltet sie ein. Dann waehlt ein Tipp
// den Fall statt ihn zu oeffnen, und oben stehen Alle, Archivieren,
// Später und Löschen (zweimal tippen - es gibt kein Zurueck).
function renderAuswahlLeiste(fach, ids, auswahl, loeschGefragt) {
  const gewaehlt = auswahl.filter((id) => ids.includes(id));
  const alle = ids.length > 0 && gewaehlt.length === ids.length;
  const aus = gewaehlt.length ? "" : " disabled";
  const archiv = fach === "archiviert"
    ? { wert: "archiv-weg", text: "Zurückholen", icon: "undo" }
    : { wert: "archiv", text: "Archivieren", icon: "archive" };
  const spaeter = fach === "spaeter"
    ? { wert: "spaeter-weg", text: "Zurück", icon: "undo" }
    : { wert: "spaeter", text: "Später", icon: "clock" };
  const taste = (t, extra = "") => `<button type="button" class="heart-faelle-wahl__taste${extra}" data-action="lifeskin-auswahl-tun"
      data-wert="${t.wert}"${aus}>${renderHeartIcon(t.icon, "heart-faelle-wahl__icon")}<span>${escapeHtml(t.text)}</span></button>`;
  return `
      <div class="heart-faelle-wahl">
        <div class="heart-faelle-wahl__kopf">
          <button type="button" class="heart-faelle-wahl__alle" data-action="lifeskin-auswahl-alle"
                  data-wert="${alle ? "" : escapeHtml(ids.join(","))}">${alle ? "Keine" : "Alle auswählen"}</button>
          <span class="heart-faelle-wahl__zahl">${gewaehlt.length} ausgewählt</span>
          <button type="button" class="heart-faelle-wahl__fertig" data-action="lifeskin-auswahl">Fertig</button>
        </div>
        <div class="heart-faelle-wahl__tasten">
          ${taste(archiv)}
          ${taste(spaeter)}
          ${taste({ wert: "loeschen", text: loeschGefragt && gewaehlt.length ? `Wirklich ${gewaehlt.length} löschen?` : "Löschen", icon: "trash" },
            ` heart-faelle-wahl__taste--scharf${loeschGefragt ? " heart-faelle-wahl__taste--frage" : ""}`)}
        </div>
      </div>`;
}

function renderAnalysen(sitzungen, berichte = {}, fach = "alle", titel = "Fälle", fuss = "",
  vorschau = {}, { auswahl = null, auswahlLoeschen = false } = {}) {
  // ALLE WEGE IN EINER LISTE. Ein Fall ist ein Fall, egal ueber welchen
  // Weg er hereinkam - "abgegeben" heisst auf jedem Weg dasselbe.
  // Dieselbe Definition wie die Kennzahl: auch spaetere Schritte und
  // die Warteseitenmarke; reine Shopbestellungen sind keine Analysen.
  const fertige = sitzungen.filter(istAnalyse);

  const zaehler = Object.fromEntries(FAECHER.map((f) => [f.id,
    fertige.filter((s) => imFach(s, berichte[s.id], f.id)).length]));
  // Ein Fach, das es nicht (mehr) gibt, zeigt "Offen" - nie eine leere
  // Liste ohne angewaehlten Chip.
  if (!FAECHER.some((f) => f.id === fach)) fach = "alle";
  // "Offen" ist Arbeit - dort wird NIE abgeschnitten. Die anderen Faecher
  // zeigen die neuesten 300 und sagen, wenn es mehr gibt.
  const imGewaehltenFach = fertige.filter((s) => imFach(s, berichte[s.id], fach));
  const gewaehlt = fach === "alle" ? imGewaehltenFach : imGewaehltenFach.slice(0, 300);
  const mehr = imGewaehltenFach.length - gewaehlt.length;

  const chips = renderChips(FAECHER.map((f) => ({ ...f, anzahl: zaehler[f.id] })), fach, "lifeskin-fach");
  const neu = zaehler.alle || 0;
  const zahl = `${neu} neu`;

  if (!fertige.length) {
    return alsKlapp(leererBlock(titel, "Noch kein abgeschlossener Fall."), "faelle", { zahl });
  }

  const waehlen = Array.isArray(auswahl);
  const gewaehltSet = new Set(waehlen ? auswahl : []);
  const zeilen = gewaehlt.map((s) => {
    const an = gewaehltSet.has(s.id);
    // Ohne Leerzeichen - so bleibt neben der Nummer Platz fuer den Namen.
    const tel = String(s.phone || s.address?.telefon || "").replace(/\s+/g, "");
    return `
    <button type="button" class="heart-lifeskin-fall${waehlen ? " heart-lifeskin-fall--waehlen" : ""}${an ? " heart-lifeskin-fall--an" : ""}"
            data-action="${waehlen ? "lifeskin-auswahl-fall" : "lifeskin-sitzung"}" data-id="${escapeHtml(s.id)}"${waehlen ? ` aria-pressed="${an}"` : ""}>
      ${vorschauFeld(s, vorschau[s.id])}
      <span class="heart-lifeskin-fall__leib">
        <span class="heart-lifeskin-fall__kopf">
          <b>${escapeHtml(s.name || "—")}</b>
          ${s.code ? `<span class="heart-lifeskin-code">${escapeHtml(s.code)}</span>` : ""}
          ${tel ? `<span class="heart-lifeskin-fall__tel">${escapeHtml(tel)}</span>` : ""}
        </span>
        ${fallZeile(s)}
      </span>
      ${waehlen ? `<span class="heart-lifeskin-fall__wahl" aria-hidden="true">${an ? renderHeartIcon("check", "heart-lifeskin-fall__haken") : ""}</span>` : ""}
    </button>`;
  }).join("");

  const leerFach = {
    alle: "Nichts offen — alles beantwortet, zurueckgelegt oder abgehakt.",
    ready: "Nichts freigegeben, das noch niemand geoeffnet hat.",
    seen: "Noch hat niemand seine Antwort geoeffnet.",
    bestellt: "Noch hat niemand bestellt.",
    spaeter: "Nichts zurueckgelegt.",
    archiviert: "Nichts abgehakt."
  }[fach] || "Nichts hier.";

  // DIE CHIPS STEHEN UEBER DER KARTE, wie beim Trichter. Oben rechts im
  // Kopf das Zahnrad fuer die Auswahl.
  const zahnrad = `<button type="button" class="heart-faelle-zahnrad${waehlen ? " heart-faelle-zahnrad--an" : ""}"
      data-action="lifeskin-auswahl" aria-label="Fälle auswählen" aria-pressed="${waehlen}">${renderHeartIcon("zahnrad", "heart-faelle-zahnrad__icon")}</button>`;
  return alsKlapp(`
    ${chips}
    <section class="heart-lifeskin-block heart-faelle">
      <h3 class="heart-lifeskin-block__titel">${escapeHtml(titel)}</h3>
      ${fuss ? `<p class="heart-lifeskin-block__fuss">${escapeHtml(fuss)}</p>` : ""}
      ${waehlen ? renderAuswahlLeiste(fach, gewaehlt.map((s) => s.id), auswahl, auswahlLoeschen) : ""}
      ${zeilen ? `<div class="heart-lifeskin-faelle">${zeilen}</div>`
        : `<p class="heart-lifeskin-leer">${escapeHtml(leerFach)}</p>`}
      ${mehr > 0 ? `<p class="heart-lifeskin-leer">+ ${mehr} ältere in diesem Fach.</p>` : ""}
    </section>`, "faelle", { zahl, ton: neu ? "offen" : "", kopfExtra: zahnrad });
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
// Die Nachricht, die Dr. Gashi schickt, wenn der Befund fertig ist -
// geschrieben von der Analyse (shitja.whatsapp), hier mit Anrede und Link.
// Der Link zeigt auf /analiza/: Solange die neue Seite nicht die
// Hauptseite ist, ist das die Seite, die der Patient bekommt.
// DER KLICKPFAD - was er angetippt und wie lange er wo gelesen hat.
// Geschrieben von shared/lifeskin-klickpfad.js auf jeder Seite.
const PFAD_WORTE = Object.freeze({
  geoeffnet: "Seite geöffnet", bildschirm: "Bildschirm", klick: "Tippt", aufgeklappt: "Klappt auf",
  zugeklappt: "Klappt zu", feld: "Feld angetippt", gesehen: "Liest", scroll: "Scrollt",
  verlassen: "Verlässt die Seite", zurueck: "Kommt zurück", kasse: "Kasse", bestellt: "BESTELLT",
  fehler: "Fehler"
});

// Die Zusammenfassung ueber dem Verlauf: wo er am laengsten war, was er
// aufgeklappt hat - die Antwort auf "wofuer interessiert er sich?".
export function klickpfadInteressen(pfad) {
  const zeit = new Map();
  const auf = [];
  let klicks = 0;
  for (const e of pfad) {
    if (e.e === "gesehen") {
      const m = /^(.*) · (\d+) s$/.exec(e.d);
      if (m) zeit.set(m[1], (zeit.get(m[1]) || 0) + Number(m[2]));
    } else if (e.e === "aufgeklappt") {
      const was = e.d.split(" · ")[0];
      if (!auf.includes(was)) auf.push(was);
    } else if (e.e === "klick") klicks += 1;
  }
  const oben = [...zeit.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  return { oben, auf, klicks };
}

function uhrzeitSekunden(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Dieselbe Zeitzone wie ueberall in Heart (Kosovo) - sonst stand im
  // Klickpfad 22:53, im Kopf darueber 00:53.
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Belgrade" });
}

// DIE TEXTE DER THERAPIESEITE - jedes Feld einzeln aenderbar.
//
// Sie kommen aus dem Block "shitja" der Analyse (Prompt v8). Hier stand
// ein JSON-Feld: aenderbar schon, aber nur fuer jemanden, der JSON liest.
// Jetzt hat jeder Satz der Seite sein eigenes Feld, in der Reihenfolge,
// in der er auf der Seite steht. Leere Felder heissen: Die Seite baut den
// Satz aus dem Befund.
export const SHITJA_PROBLEME = 3;
export const SHITJA_PUNKTE = 3;

// JE GEWAEHLTEM PRODUKT EIN BLOCK - nicht drei feste Plaetze.
//
// Hier standen drei Plaetze "Produkt 1/2/3" mit einer Auswahl darin. Bei
// zwei Produkten blieb der dritte mit einem alten Wert stehen, und beim
// Freigeben wurde er mitgespeichert: dreimal "Çfarë merrni", eines davon
// doppelt. Jetzt gehoert jeder Block fest zu seinem Produkt und steht nur
// da, wenn es angehakt ist (heart.js blendet ihn beim Anhaken ein). Die
// drei Punkte sind drei Felder, keine Zeilen in einem Feld.
function renderShitjaFelder(shitja, produkte = [], gewaehltIds = [], { patient = "", ohneFoto = false } = {}) {
  const s = shitja && typeof shitja === "object" ? shitja : {};
  const gewaehltSet = new Set((gewaehltIds || []).map(String));
  const nameVon = new Map((produkte || []).map((p) => [String(p.id), String(p.name || p.id)]));
  const mitPunkten = [...gewaehltSet].filter((id) => ((s.produktet || []).find((x) => String(x.produkt_id) === id)?.per_ju || []).length);
  const tv = (schluessel) => {
    if (schluessel === "hyrja") {
      return vorschauKasten("hyrja", "hyrja", { text: s.hyrja || "", anzahl: gewaehltSet.size, imText: mitPunkten,
        problemet: (s.problemet || []).map((p) => ({ gjetja: p.gjetja })) });
    }
    return vorschauKasten(schluessel, schluessel, { text: s[schluessel] || "", ohneFoto, patient },
      schluessel === "whatsapp" ? ` data-tv-patient="${escapeHtml(patient)}"` : "");
  };
  const optionen = (gewaehlt) => [`<option value="">— kein Produkt —</option>`,
    ...(produkte || []).map((p) => `<option value="${escapeHtml(p.id)}"${String(p.id) === String(gewaehlt || "") ? " selected" : ""}>${escapeHtml(p.name || p.id)}</option>`)
  ].join("");
  const text = (schluessel, marke, hinweis, zeilen = 2) => `
        <div class="heart-lifeskin-feld heart-tv-feld">
          <label class="heart-lifeskin-feld">
            <span>${escapeHtml(marke)}</span>
            <textarea class="heart-lifeskin-eingabe" rows="${zeilen}" data-shitja="${schluessel}">${escapeHtml(s[schluessel] || "")}</textarea>
            ${hinweis ? `<small>${escapeHtml(hinweis)}</small>` : ""}
          </label>
          ${tv(schluessel)}
        </div>`;
  const probleme = Array.from({ length: SHITJA_PROBLEME }, (_, i) => {
    const p = (s.problemet || [])[i] || {};
    return `
        <div class="heart-shitja__karte">
          <b>Karte ${i + 1}</b>
          <div class="heart-shitja__paar">
            <input class="heart-lifeskin-eingabe" data-shitja-problem="${i}" data-teil="gjetja" placeholder="Problem (z. B. Pore të bllokuara)" value="${escapeHtml(p.gjetja || "")}">
            <input class="heart-lifeskin-eingabe" data-shitja-problem="${i}" data-teil="ku" placeholder="Wo (z. B. në ballë)" value="${escapeHtml(p.ku || "")}">
          </div>
          <select class="heart-lifeskin-eingabe" data-shitja-problem="${i}" data-teil="produkt_id" aria-label="Produkt dieser Karte">${optionen(p.produkt_id)}</select>
          <textarea class="heart-lifeskin-eingabe" rows="2" data-shitja-problem="${i}" data-teil="zgjidhja" placeholder="Was das Produkt hier tut (Produktname vorn)">${escapeHtml(p.zgjidhja || "")}</textarea>
          ${vorschauKasten(`karte:${i}`, "karte", (!p.produkt_id || !gewaehltSet.size || gewaehltSet.has(String(p.produkt_id)))
            ? { gjetja: p.gjetja || "", ku: p.ku || "", name: p.produkt_id ? (nameVon.get(String(p.produkt_id)) || p.produkt_id) : "", zgjidhja: p.zgjidhja || "" }
            : { nichtImSet: true })}
        </div>`;
  }).join("");
  const gewaehlt = new Set((gewaehltIds || []).map(String));
  const produktBloecke = (produkte || []).filter((p) => p.availability !== "hidden").map((p) => {
    const id = String(p.id);
    const punkte = ((s.produktet || []).find((x) => String(x.produkt_id) === id)?.per_ju) || [];
    return `
        <div class="heart-shitja__karte" data-shitja-pblock="${escapeHtml(id)}"${gewaehlt.has(id) ? "" : " hidden"}>
          <b>${escapeHtml(p.name || id)} · „Çfarë merrni“</b>
          ${Array.from({ length: SHITJA_PUNKTE }, (_, n) => `
          <textarea class="heart-lifeskin-eingabe" rows="2" maxlength="140" data-shitja-punkt="${escapeHtml(id)}" data-nr="${n}"
                    placeholder="Punkt ${n + 1}">${escapeHtml(punkte[n] || "")}</textarea>`).join("")}
          ${vorschauKasten(`punkte:${id}`, "punkte", { name: p.name || id, punkte }, ` data-tv-name="${escapeHtml(p.name || id)}"`)}
        </div>`;
  }).join("");
  return `
        <div class="heart-shitja">
          ${text("hyrja", "Einstiegssatz oben", "**fett** wird auf der Seite fett.", 3)}
          ${text("shqetesimi", "Was ihn stört (grüner Kasten)", "Leer, wenn er nichts genannt hat.")}
          <p class="heart-befund__zwischen">Karten „Pse pikërisht kjo terapi“</p>
          ${probleme}
          <p class="heart-befund__zwischen">Je Produkt: drei Punkte</p>
          ${produktBloecke || `<p class="heart-lifeskin-leer">Oben erst ein Produkt anhaken.</p>`}
          ${text("dita_28", "Tag 28 (Zeitleiste)", "")}
          ${text("pse_tani", "Warum jetzt (über dem zweiten Knopf)", "")}
          ${text("whatsapp", "WhatsApp-Nachricht von Dr. Gashi", "Ohne Anrede und Link – beides setzt Heart beim Kopieren ein.", 3)}
        </div>`;
}

// Die Felder oben wieder als Block "shitja" - fuer heart.js beim Freigeben.
// Nur Produkte, die angehakt sind, und jedes nur einmal.
export function shitjaAusFeldern(wurzel = globalThis.document) {
  const wert = (el) => String(el?.value || "").trim();
  const raus = { problemet: [], produktet: [] };
  for (const el of wurzel.querySelectorAll("[data-shitja]")) raus[el.dataset.shitja] = wert(el);
  for (let i = 0; i < SHITJA_PROBLEME; i += 1) {
    const teil = (name) => wert(wurzel.querySelector(`[data-shitja-problem="${i}"][data-teil="${name}"]`));
    if (teil("gjetja")) raus.problemet.push({ gjetja: teil("gjetja"), ku: teil("ku"), produkt_id: teil("produkt_id"), zgjidhja: teil("zgjidhja") });
  }
  const kaesten = [...wurzel.querySelectorAll("[data-produkt-wahl]")];
  const angehakt = new Set(kaesten.filter((k) => k.checked).map((k) => String(k.value)));
  for (const block of wurzel.querySelectorAll("[data-shitja-pblock]")) {
    const id = block.getAttribute("data-shitja-pblock");
    if (kaesten.length && !angehakt.has(id)) continue;
    if (raus.produktet.some((p) => p.produkt_id === id)) continue;
    const punkte = [...block.querySelectorAll("[data-shitja-punkt]")]
      .map((f) => wert(f).replace(/\s+/g, " ")).filter(Boolean);
    if (punkte.length) raus.produktet.push({ produkt_id: id, per_ju: punkte });
  }
  return raus;
}

// Und umgekehrt: nach dem Einfuegen des JSON die Felder fuellen. Jedes
// Feld wird gesetzt - auch leer -, damit nichts vom vorigen Stand bleibt.
export function shitjaInFelder(shitja, wurzel = globalThis.document) {
  const s = shitja && typeof shitja === "object" ? shitja : {};
  for (const el of wurzel.querySelectorAll("[data-shitja]")) el.value = s[el.dataset.shitja] || "";
  for (let i = 0; i < SHITJA_PROBLEME; i += 1) {
    const p = (s.problemet || [])[i] || {};
    for (const el of wurzel.querySelectorAll(`[data-shitja-problem="${i}"]`)) el.value = p[el.dataset.teil] || "";
  }
  const jeProdukt = new Map();
  for (const p of s.produktet || []) {
    const id = String(p?.produkt_id || "");
    if (id && !jeProdukt.has(id)) jeProdukt.set(id, p.per_ju || []);
  }
  for (const feld of wurzel.querySelectorAll("[data-shitja-punkt]")) {
    const punkte = jeProdukt.get(feld.getAttribute("data-shitja-punkt")) || [];
    feld.value = punkte[Number(feld.dataset.nr)] || "";
  }
}

// Mit oder ohne Foto: was im Befund steht, sonst nach dem Weg. Trup und
// Pytje kommen ohne Foto, ausser er hat doch eines angehaengt.
export function analyseArt(sitzung, bericht) {
  if (typeof bericht?.ohneBild === "boolean" && bericht?.status && bericht.status !== "wartet") {
    return bericht.ohneBild ? "pa-foto" : "foto";
  }
  const ohne = ["trup", "pytje"].includes(String(sitzung?.typ || ""))
    && !(Array.isArray(sitzung?.photos) && sitzung.photos.length);
  return ohne ? "pa-foto" : "foto";
}

export function whatsappNachricht(sitzung, bericht) {
  const text = String(bericht?.raport?.shitja?.whatsapp || "").trim();
  if (!text) return "";
  const name = vorname(sitzung);
  const link = `https://www.mnyra.com/analiza/${sitzung?.id || ""}`;
  // Anrede, der Text der Analyse, der Link - und dass man direkt
  // bestellen kann, ohne zu draengen.
  return [
    `Përshëndetje${name ? ` ${name}` : ""}, analiza juaj është gati.`,
    text,
    `Këtu e shihni analizën e plotë dhe produktet që ju rekomandoj: ${link}`,
    "Porosinë mund ta bëni direkt në faqe, ose më shkruani këtu dhe e rregullojmë bashkë."
  ].join("\n\n");
}

// ══ DIE AKTE EINES FALLS ═══════════════════════════════════════════
//
// Oben die Akte (immer offen, alles mit einem Tipp kopierbar), dann die
// Fotos, gleich darunter der Befund - der Arbeitsplatz. Alles andere steht
// in Karten, die zugeklappt beginnen und sich merken, wie man sie
// verlassen hat (heart-lifeskin-klapp.js, gilt fuer jeden Fall).
//
// Keine Karte in der Karte: Innerhalb einer Karte trennen Linien, wie auf
// der Therapieseite.
const WEG_NAMEN = Object.freeze({ scan: "Skanim", foto: "Foto", trup: "Trup", pytje: "Pytje" });

function fallKarte(name, titel, inhalt, { meta = "", stand = "", extra = "", standard = false } = {}) {
  return `
    <details class="heart-fall-karte" ${klappAttr(`fall:${name}`, standard)}${extra}>
      <summary class="heart-fall-karte__kopf">
        <span class="heart-fall-karte__titel">${titel}</span>
        ${meta ? `<span class="heart-fall-karte__meta">${meta}</span>` : ""}
        ${stand ? `<span class="heart-stand" data-stand="${escapeHtml(stand)}" aria-hidden="true"></span>` : ""}
      </summary>
      <div class="heart-fall-karte__leib">${inhalt}</div>
    </details>`;
}

// Ein Wert, der sich mit einem Tipp kopieren laesst - der Wert selbst ist
// der Knopf. Ein kleines Symbol sagt, dass es geht.
function kopierWert(wert, was, anzeige = wert) {
  const w = String(wert ?? "").trim();
  if (!w) return `<span class="heart-akte__leer">—</span>`;
  return `<button type="button" class="heart-akte__wert" data-action="lifeskin-text-kopieren" data-wert="${escapeHtml(w)}"
      data-was="${escapeHtml(was)}" title="${escapeHtml(was)} kopieren">
      <span>${escapeHtml(anzeige)}</span>${renderHeartIcon("copy", "heart-akte__icon")}</button>`;
}

function renderAnliegenInhalt(sitzung) {
  const text = String(sitzung.pyetja || sitzung.problemi || "").trim();
  if (!text) return `<p class="heart-lifeskin-leer">Er hat nichts geschrieben — der Fall wurde vorher abgeschickt oder der Text ging verloren.</p>`;
  return `
    <p class="heart-lifeskin-anliegen__text">${escapeHtml(text)}</p>
    <button type="button" class="heart-fall-knopf" data-action="lifeskin-text-kopieren"
            data-wert="${escapeHtml(text)}" data-was="Text">Text kopieren</button>`;
}

function renderAnamneseInhalt(sitzung) {
  const zeilen = anamneseFuerPrompt(sitzung?.anamnese);
  if (!zeilen.length) return `<p class="heart-lifeskin-leer">Zu diesem Fall liegen keine Antworten vor.</p>`;
  return `
    <dl class="heart-antworten">
      ${zeilen.map((zeile) => `
        <div class="heart-antworten__zeile">
          <dt>${escapeHtml(zeile.pyetja_de)}</dt>
          <dd>${escapeHtml(zeile.pergjigja_de)}<small>${escapeHtml(zeile.pergjigja)}</small></dd>
        </div>`).join("")}
    </dl>`;
}

// Die Schritte seines Wegs - von 0 an, in der Reihenfolge, in der sie
// geschehen. Wo die Kette abreisst, steht "hier aufgehört".
export function fallSchritte(sitzung) {
  return [
    ["Analyse abgeschickt", istAnalyse(sitzung)],
    ["Nummer hinterlassen", sitzung.hatTelefon],
    ["Warteseite geöffnet", sitzung.warteseiteGeoeffnet],
    ["Befund geöffnet", sitzung.berichtGeoeffnet],
    ["Befund gelesen", sitzung.sahSchnitt],
    ["Therapie gesehen", sitzung.sahTherapie],
    ["Preis gesehen", sitzung.sahPreis],
    ["Kasse geöffnet", sitzung.kasseGeoeffnet],
    ["Anschrift eingegeben", sitzung.hatAnschrift],
    ["Bestellt", sitzung.hatBestellt]
  ].map(([was, ja]) => [was, Boolean(ja)]);
}

function renderSchritteInhalt(sitzung) {
  const schritte = fallSchritte(sitzung);
  const letzter = schritte.map(([, ja]) => ja).lastIndexOf(true);
  const neben = [["WhatsApp angetippt", sitzung.waClick], ["Senden bestätigt", sitzung.waSent], ["Link kopiert", sitzung.linkKopiert]]
    .filter(([, ja]) => ja);
  return `
    <ol class="heart-schritte">
      ${schritte.map(([was, ja], i) => {
        // HIER AUFGEHOERT: am letzten Schritt, den er gemacht hat - dort
        // war er zuletzt. Ist alles erledigt, steht nichts.
        const stopp = i === letzter && letzter < schritte.length - 1;
        return `
        <li class="heart-schritte__zeile${ja ? " heart-schritte__zeile--an" : ""}${stopp ? " heart-schritte__zeile--stopp" : ""}">
          <span class="heart-schritte__nr">${ja ? renderHeartIcon("check", "heart-schritte__haken") : i}</span>
          <span class="heart-schritte__text">${escapeHtml(was)}</span>
          ${stopp ? `<em>hier aufgehört</em>` : ""}
        </li>`;
      }).join("")}
    </ol>
    ${neben.length ? `<p class="heart-schritte__neben">Außerdem: ${neben.map(([was]) => escapeHtml(was)).join(" · ")}</p>` : ""}
    <p class="heart-lifeskin-block__fuss">Zuletzt aktiv: ${escapeHtml(datumKurz(sitzung.updatedAt))} ${escapeHtml(uhrzeit(sitzung.updatedAt))}</p>`;
}

// DER KLICKPFAD, lesbar: je Besuch ein Abschnitt, je Ereignis ein Satz.
const PFAD_ZEICHEN = Object.freeze({
  geoeffnet: "fileText", bildschirm: "fileText", klick: "pointer", aufgeklappt: "chevronDown", zugeklappt: "chevronRight",
  feld: "pencil", gesehen: "eye", scroll: "arrowUpDown", verlassen: "doorOut", zurueck: "undo", kasse: "cart",
  bestellt: "checkCircle", fehler: "alert"
});
const pfadIcon = (e) => renderHeartIcon(PFAD_ZEICHEN[e.e] || "info", "heart-pfad__icon");

function pfadSatz(e) {
  const d = String(e.d || "");
  if (e.e === "gesehen") {
    const m = /^(.*) · (\d+) s$/.exec(d);
    if (m) return `Liest „${m[1]}“ · ${m[2]} s`;
  }
  const wort = PFAD_WORTE[e.e] || e.e;
  return d ? `${wort} · ${d}` : wort;
}

function pfadBesuche(pfad) {
  const besuche = [];
  let jetzt = null;
  let vorher = 0;
  for (const e of pfad) {
    const t = Date.parse(e.t) || 0;
    if (!jetzt || e.s !== jetzt.seite || (t && vorher && t - vorher > 15 * 60000)) {
      jetzt = { seite: e.s, von: e.t, bis: e.t, eintraege: [] };
      besuche.push(jetzt);
    }
    jetzt.eintraege.push(e);
    jetzt.bis = e.t;
    vorher = t || vorher;
  }
  return besuche;
}

function dauerText(von, bis) {
  const s = Math.max(0, Math.round(((Date.parse(bis) || 0) - (Date.parse(von) || 0)) / 1000));
  return s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`;
}

function renderKlickpfadInhalt(sitzung) {
  const pfad = pfadLesen(sitzung);
  if (!pfad.length) return `<p class="heart-lifeskin-leer">Noch nichts aufgezeichnet.</p>`;
  const { oben, auf, klicks } = klickpfadInteressen(pfad);
  const besuche = pfadBesuche(pfad);
  const max = Math.max(1, ...oben.map(([, s]) => s));
  const wichtig = pfad.filter((e) => ["kasse", "bestellt", "fehler"].includes(e.e));
  return `
    <p class="heart-pfad__kurz">${besuche.length} ${besuche.length === 1 ? "Besuch" : "Besuche"} · ${pfad.length} Ereignisse · ${klicks} Klicks</p>
    ${wichtig.length ? `<div class="heart-pfad__wichtig">${wichtig.map((e) => `<span>${pfadIcon(e)} ${escapeHtml(pfadSatz(e))} · ${escapeHtml(uhrzeit(e.t))}</span>`).join("")}</div>` : ""}
    ${oben.length ? `
    <h6 class="heart-pfad__titel">Am längsten gelesen</h6>
    <div class="heart-pfad__balken">
      ${oben.map(([was, s]) => `<div><span>${escapeHtml(was)}</span><i style="width:${Math.round((s / max) * 100)}%"></i><b>${s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`}</b></div>`).join("")}
    </div>` : ""}
    ${auf.length ? `<h6 class="heart-pfad__titel">Aufgeklappt</h6><p class="heart-pfad__auf">${auf.map(escapeHtml).join(" · ")}</p>` : ""}
    <details class="heart-pfad__verlauf" ${klappAttr("fall:klickpfad:verlauf", false)}>
      <summary>Ganzer Verlauf, Schritt für Schritt</summary>
      ${besuche.map((b, i) => `
        <div class="heart-pfad__besuch">
          <div class="heart-pfad__seite">Besuch ${i + 1} · ${escapeHtml(b.seite)} · ${escapeHtml(datumKurz(b.von))} ${escapeHtml(uhrzeit(b.von))} · ${escapeHtml(dauerText(b.von, b.bis))}</div>
          ${b.eintraege.map((e) => `
          <div class="heart-pfad__zeile${["bestellt", "kasse"].includes(e.e) ? " heart-pfad__zeile--wichtig" : ""}">
            <span class="heart-pfad__zeit">${escapeHtml(uhrzeitSekunden(e.t))}</span>
            <span class="heart-pfad__zeichen">${pfadIcon(e)}</span>
            <span>${escapeHtml(pfadSatz(e))}</span>
          </div>`).join("")}
        </div>`).join("")}
    </details>`;
}

const QUELLEN = Object.freeze({ ig: "Instagram", fb: "Facebook", an: "Audience Network", msg: "Messenger", test: "Test" });

function herkunftVon(sitzung) {
  const q = sitzung.source || {};
  const quelle = QUELLEN[String(q.utmSource || "").toLowerCase()] || q.utmSource || "";
  const ref = String(q.referrer || "").replace(/^https?:\/\/(www\.|m\.|l\.)?([^/]+).*/, "$2");
  return { quelle: quelle || (ref ? `über ${ref}` : "direkt / unbekannt"), kampagne: q.utmCampaign || "", anzeige: q.utmContent || "", ref };
}

function renderHerkunftInhalt(sitzung) {
  const h = herkunftVon(sitzung);
  const nurNummer = (w) => /^\d{6,}$/.test(String(w || ""));
  return `
    <dl class="heart-antworten">
      <div class="heart-antworten__zeile"><dt>Quelle</dt><dd>${escapeHtml(h.quelle)}</dd></div>
      <div class="heart-antworten__zeile"><dt>Kampagne</dt><dd>${h.kampagne ? kopierWert(h.kampagne, "Kampagne") : "—"}</dd></div>
      <div class="heart-antworten__zeile"><dt>Anzeige</dt><dd>${h.anzeige ? kopierWert(h.anzeige, "Anzeige") : "—"}</dd></div>
      ${h.ref ? `<div class="heart-antworten__zeile"><dt>Kam von</dt><dd>${escapeHtml(h.ref)}</dd></div>` : ""}
    </dl>
    ${nurNummer(h.kampagne) || nurNummer(h.anzeige) ? `<p class="heart-lifeskin-block__fuss">Die Anzeige schickt nur ihre Nummer mit. Mit dem Namen: in Meta bei der Anzeige unter „URL-Parameter“
      <code>utm_source={{site_source_name}}&amp;utm_campaign={{campaign.name}}&amp;utm_content={{ad.name}}</code> eintragen – dann steht hier der Name.</p>` : ""}`;
}

function renderAktionenInhalt(sitzung, bericht, loeschGefragt) {
  return `
    <div class="heart-fall-aktionen">
      <button type="button" class="heart-fall-knopf" data-action="lifeskin-archivieren"
              data-id="${escapeHtml(sitzung.id)}" data-wert="${bericht?.archiviert ? "nein" : "ja"}">
        ${bericht?.archiviert ? "Aus dem Archiv holen" : "Abhaken (archivieren)"}</button>
      <button type="button" class="heart-fall-knopf" data-action="lifeskin-spaeter"
              data-id="${escapeHtml(sitzung.id)}" data-wert="${bericht?.spaeter ? "nein" : "ja"}">
        ${bericht?.spaeter ? "Zurück in die Liste" : "Für später zurücklegen"}</button>
      <button type="button" class="heart-fall-knopf" data-action="lifeskin-alstest"
              data-id="${escapeHtml(sitzung.id)}" data-wert="${bericht?.test ? "nein" : "ja"}">
        ${bericht?.test ? "Doch kein Test" : "Als eigenen Test markieren"}</button>
      <button type="button" class="heart-fall-knopf heart-fall-knopf--scharf"
              data-action="lifeskin-sitzung-loeschen" data-id="${escapeHtml(sitzung.id)}">
        ${loeschGefragt ? "Wirklich löschen — mit Fotos und Befund" : "Löschen"}</button>
    </div>
    <p class="heart-lifeskin-block__fuss">Als Test markiert zählt diese Analyse in keiner Zahl mehr mit. Gelöscht wird mit Fotos und Befund; der Link des Patienten zeigt danach nichts mehr.</p>`;
}

export function renderSitzungDetail(sitzung, fotos = null, fotosStatus = "", produkte = [], bericht = null, loeschGefragt = false, raste = rasteListe({}), zustand = {}) {
  if (!sitzung) {
    return `<div class="heart-lifeskin-detail">
      <p class="heart-lifeskin-leer">Diese Analyse gibt es nicht mehr.</p></div>`;
  }

  // Die Aufnahmen - unveraendert: erst gerade, dann die Seiten, zuletzt die
  // Aufsicht; was die Liste nicht kennt, haengt sich hinten an.
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
  const typ = typVon(sitzung);
  const freiwillig = ["trup", "pytje"].includes(typ);
  const ohneBild = fotosStatus === "loading" ? "Fotos werden geladen …"
    : fotosStatus === "error" ? "Die Fotos liessen sich nicht laden."
    : freiwillig ? "Kein Foto dabei — auf diesem Weg ist es freiwillig."
    : "Zu diesem Fall liegen keine Fotos vor.";

  const nummer = sitzung.phone || sitzung.address?.telefon || "";
  const antworten = anamneseFuerPrompt(sitzung?.anamnese).length;
  const schritte = fallSchritte(sitzung);
  const gegangen = schritte.filter(([, ja]) => ja).length;
  const bisHier = schritte.filter(([, ja]) => ja).at(-1)?.[0] || "";
  const pfad = pfadLesen(sitzung);
  const h = herkunftVon(sitzung);
  const link = `https://www.mnyra.com/analiza/${sitzung.id}`;

  return `
    <div class="heart-lifeskin-detail heart-fall">
      <!-- DIE AKTE: kompakt, zwei Spalten, jeder Wert mit einem Tipp kopierbar. -->
      <div class="heart-akte">
        <div class="heart-akte__feld heart-akte__feld--gross"><span>Fallnummer</span>${kopierWert(sitzung.code, "Fallnummer")}</div>
        <div class="heart-akte__feld heart-akte__feld--gross"><span>Telefon</span>${nummer
          ? kopierWert(nummer, "Nummer")
          : `<span class="heart-akte__leer">${escapeHtml(sitzung.waClick || sitzung.waSent ? "keine — hat auf WhatsApp geschrieben" : "keine — nicht erreichbar")}</span>`}</div>
        <!-- Der Rest zum Aufklappen - gemerkt wie jede Karte. -->
        <details class="heart-akte__mehr" ${klappAttr("fall:akte", false)}>
          <summary class="heart-akte__mehrkopf">Name, Alter, Datum, Weg</summary>
          <div class="heart-akte__mehrleib">
            <div class="heart-akte__feld"><span>Name</span>${kopierWert(sitzung.name, "Name")}</div>
            <div class="heart-akte__feld"><span>Alter</span><b>${escapeHtml(sitzung.ageBand || "—")}</b></div>
            <div class="heart-akte__feld"><span>Datum</span><b>${escapeHtml(datumKurz(sitzung.createdAt))} ${escapeHtml(uhrzeit(sitzung.createdAt))}</b></div>
            <div class="heart-akte__feld"><span>Weg</span><b>${escapeHtml(WEG_NAMEN[typ] || typ || "—")}</b></div>
          </div>
        </details>
      </div>

      ${freiwillig ? fallKarte("anliegen", typ === "pytje" ? "Seine Frage" : "Sein Hautproblem", renderAnliegenInhalt(sitzung),
        { standard: true, meta: String(sitzung.pyetja || sitzung.problemi || "").trim() ? "" : "leer" }) : ""}

      ${bilder ? `<div class="heart-lifeskin-fotos heart-lifeskin-fotos--reihe">${bilder}</div>`
        : `<p class="heart-lifeskin-leer">${escapeHtml(ohneBild)}</p>`}

      ${fallKarte("schritte", "Seine Schritte", renderSchritteInhalt(sitzung), { standard: true, meta: `${gegangen}/${schritte.length}${bisHier ? ` · ${escapeHtml(bisHier)}` : ""}` })}

      ${renderBefundEditor(sitzung, produkte, bericht, raste, zustand)}

      ${fallKarte("antworten", "Seine Antworten", renderAnamneseInhalt(sitzung), { meta: antworten ? `${antworten}` : "keine" })}

      ${fallKarte("seite", "Seine Seite", `
        <div class="heart-fall-knoepfe">
          <button type="button" class="heart-fall-knopf heart-fall-knopf--haupt" data-action="lifeskin-link-kopieren"
                  data-id="${escapeHtml(sitzung.id)}">Për pacient<small>Link kopieren</small></button>
          <button type="button" class="heart-fall-knopf" data-action="lifeskin-text-kopieren"
                  data-wert="${escapeHtml(`${link}?still=1`)}" data-was="Link ohne Statistik">Pa statistika<small>Link kopieren · zählt nichts</small></button>
        </div>`)}

      ${fallKarte("klickpfad", "Klickpfad", renderKlickpfadInhalt(sitzung), { meta: pfad.length ? `${pfad.length} Ereignisse` : "leer" })}

      ${sitzung.order || sitzung.address ? fallKarte("bestellung", sitzung.order ? "Bestellung" : "Anschrift", `
        ${sitzung.order ? `<p class="heart-fall-zeile"><b>${escapeHtml(euro(sitzung.order.total))}</b> · ${escapeHtml(sitzung.order.orderId || "")} · ${escapeHtml(sitzung.order.payment || "")} · ${escapeHtml(sitzung.order.status || "")}</p>` : ""}
        ${sitzung.address ? `<div class="heart-fall-anschrift">
          ${kopierWert([sitzung.address.name, sitzung.address.strasse, [sitzung.address.plz, sitzung.address.ort].filter(Boolean).join(" "), sitzung.address.telefon].filter(Boolean).join(", "), "Anschrift")}
        </div>` : ""}`, { meta: sitzung.order ? escapeHtml(euro(sitzung.order.total)) : "begonnen", stand: sitzung.order ? "voll" : "fehlt" }) : ""}

      ${fallKarte("herkunft", "Herkunft", renderHerkunftInhalt(sitzung), { meta: escapeHtml(h.quelle) })}

      ${fallKarte("aktionen", "Diese Analyse", renderAktionenInhalt(sitzung, bericht, loeschGefragt))}
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
        ${vorschauKasten(`zona:${i}`, "zona", { zona: String(z.zona || ""), teksti: String(z.teksti || "") })}
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
        ${vorschauKasten(`param:${i}`, "param", { emri: String(w.emri || ""), vlera: String(w.vlera || ""), grada: String(w.grada || ""), shkalla: stufe, thjeshte: String(w.thjeshte || "") })}
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
// ══ DER BEFUND ════════════════════════════════════════════════════
//
// Vier Abschnitte zum Auf- und Zuklappen (Linien dazwischen, keine Karten
// in der Karte), jeder mit einem Zeichen rechts: ✓ vollstaendig, ! fehlt
// noch etwas (heart.js befundStandAuffrischen - folgt jedem Tastendruck).
// Darunter, immer offen: Freigeben.
function befundGruppe(name, titel, inhalt, { id = "", hinweis = "" } = {}) {
  return `
      <details class="heart-befund__gruppe"${id ? ` id="${id}"` : ""} ${klappAttr(`fall:befund:${name}`, false)}>
        <summary class="heart-befund__gruppenkopf">
          <span class="heart-befund__gruppentitel">${titel}${hinweis ? `<small>${hinweis}</small>` : ""}</span>
          <span class="heart-stand" data-stand-fuer="${escapeHtml(name)}" data-stand="" aria-hidden="true"></span>
        </summary>
        <div class="heart-befund__gruppenleib">${inhalt}</div>
      </details>`;
}

// DIE NACHRICHT VORAB - bevor der Befund fertig ist.
//
// Viele antworten auf die Nachricht mit dem Link nicht: Sie kommt von einer
// unbekannten Nummer, WhatsApp zeigt "Blockieren / Melden", der Link ist
// nicht antippbar. Diese Nachricht kommt vorher und hat EINE leichte
// Frage - wer antwortet, hat den Chat geoeffnet, und der Link danach ist
// antippbar. Dazu Instagram (echte Vorher/Nachher) gegen "sind das
// Betrueger?". Kein Preis, keine Eile, kein Druck.
function vorname(sitzung) {
  const v = String(sitzung?.name || "").trim().split(/\s+/)[0] || "";
  return v ? v.charAt(0).toLocaleUpperCase("sq") + v.slice(1) : "";
}

// Wann die Analyse fertig ist - die vier Angaben, die am haeufigsten
// gebraucht werden. Je eine Taste, alle vier in einer Reihe.
export const VORAB_ZEITEN = Object.freeze([
  { id: "30min", taste: "30 min", satz: "pas rreth 30 minutash" },
  { id: "1h", taste: "1 orë", satz: "pas rreth një ore" },
  { id: "heute", taste: "Sot", satz: "sot gjatë ditës" },
  { id: "morgen", taste: "Nesër", satz: "nesër gjatë ditës" }
]);

// Kein Preis, keine Frage zur Haut - nur wozu die Analyse da ist. Am Ende
// eine Frage, die jeder mit "Po" beantwortet; die Antwort macht den Link
// spaeter antippbar (von einer unbekannten Nummer ist er es sonst nicht).
export function vorabNachricht(sitzung, zeit = "1h") {
  const name = vorname(sitzung);
  const wann = (VORAB_ZEITEN.find((z) => z.id === zeit) || VORAB_ZEITEN[1]).satz;
  return [
    `Përshëndetje${name ? ` ${name}` : ""}, jam Dr. Violeta Gashi nga LifeSkin.`,
    `Po e bëj analizën e lëkurës suaj personalisht, që t'ju gjejmë terapinë LifeSkin që i përshtatet lëkurës suaj dhe ju sjell rezultate të dukshme. Analiza do të jetë gati ${wann}.`,
    "Analiza është falas. A jua dërgoj rezultatin këtu?"
  ].join("\n\n");
}

// wa.me will die Nummer international und ohne Zeichen: 049 247 720 ->
// 38349247720 (Kosovo). Ohne brauchbare Nummer kein Link.
export function waNummer(nummer) {
  let n = String(nummer || "").replace(/[^\d+]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  else if (n.startsWith("00")) n = n.slice(2);
  else if (n.startsWith("0")) n = `383${n.slice(1)}`;
  n = n.replace(/\D/g, "");
  return n.length >= 9 ? n : "";
}

function renderPatientKnoepfe(sitzung, bericht, fertig) {
  const nummer = sitzung.phone || sitzung.address?.telefon || "";
  const endText = fertig ? whatsappNachricht(sitzung, bericht) : "";
  const wa = waNummer(nummer);
  const waLink = (text) => `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
  return `
      <section class="heart-befund__patient">
        <span class="heart-befund__zwischen heart-befund__zwischen--icon">${renderHeartIcon("message", "heart-befund__knopficon")}An den Patienten</span>
        <!-- 1. VORAB: sobald die Analyse da ist. Vier Tasten in einer Reihe,
             jede oeffnet WhatsApp mit dem fertigen Text. Ohne Nummer
             kopiert die Taste den Text. -->
        <div class="heart-befund__wareihe">
          ${VORAB_ZEITEN.map((z) => wa
            ? `<a class="heart-befund__wataste" href="${escapeHtml(waLink(vorabNachricht(sitzung, z.id)))}" target="_blank" rel="noopener">${renderHeartIcon("send", "heart-befund__wataicon")}${escapeHtml(z.taste)}</a>`
            : `<button type="button" class="heart-befund__wataste heart-befund__wataste--kopie" data-action="lifeskin-text-kopieren"
                 data-wert="${escapeHtml(vorabNachricht(sitzung, z.id))}" data-was="Vorab-Nachricht">${renderHeartIcon("copy", "heart-befund__wataicon")}${escapeHtml(z.taste)}</button>`).join("")}
        </div>
        <!-- 2. FINAL: nach der Freigabe, mit Anrede und Link. -->
        ${endText ? (wa ? `<a class="heart-befund__knopf heart-befund__knopf--wa" href="${escapeHtml(waLink(endText))}" target="_blank" rel="noopener">
          ${renderHeartIcon("send", "heart-befund__knopficon")}Befund in WhatsApp senden<small>mit Anrede und Link</small></a>`
          : `<button type="button" class="heart-befund__knopf" data-action="lifeskin-text-kopieren" data-wert="${escapeHtml(endText)}"
               data-was="WhatsApp-Nachricht">${renderHeartIcon("copy", "heart-befund__knopficon")}Befund-Nachricht kopieren</button>`)
          : `<p class="heart-befund__hilfe">Nach der Freigabe erscheint hier „Befund in WhatsApp senden“.</p>`}
      </section>`;
}

// Welcher Weg: vier Wege, zwei Arten von Analyse (mit oder ohne Foto).
// Die Art steht im versteckten Feld data-bogen-art - daran haengen Prompt,
// Vorschau und Freigabe wie bisher.
const WEG_ZU_ART = Object.freeze({ skanim: "foto", foto: "foto", trup: "pa-foto", pytje: "pa-foto" });
export function befundWeg(sitzung, art, gemerkt = "") {
  if (gemerkt && WEG_ZU_ART[gemerkt] === art) return gemerkt;
  const typ = typVon(sitzung);
  if (art === "pa-foto") return typ === "pytje" ? "pytje" : "trup";
  return typ === "scan" ? "skanim" : "foto";
}

function renderBefundEditor(sitzung, produkte, bericht, raste = rasteListe({}), zustand = {}) {
  const stand = bericht?.status || "wartet";
  const fertig = stand !== "wartet" && stand !== "vorschau";
  const gewaehlt = new Map(
    (bericht?.produkte || []).map((p) => [String(p.id), ohneSeite(String(p.satz || ""))])
  );
  const zweck = new Map((bericht?.produkte || []).map((p) => [String(p.id), String(p.zweck || "")]));
  // Noch nicht freigegeben: die auf dem Geraet gemerkte Auswahl (Produkte,
  // Wofuer, Art, Preis) - siehe heart-lifeskin-entwurf.js.
  const entwurf = stand === "wartet" ? entwurfLesen(sitzung.id) : null;
  if (entwurf?.produkte?.length) {
    for (const id of [...gewaehlt.keys()]) if (!entwurf.produkte.includes(id)) gewaehlt.delete(id);
    for (const id of entwurf.produkte) if (!gewaehlt.has(id)) gewaehlt.set(id, "");
  }
  for (const [id, text] of Object.entries(entwurf?.zweck || {})) zweck.set(id, String(text));
  const art = entwurf?.art || analyseArt(sitzung, bericht);
  const weg = befundWeg(sitzung, art, entwurf?.weg || "");
  const ohneFoto = art === "pa-foto";
  // Ohne Entwurf und ohne Befund: der Preis fuer die Zahl der gewaehlten
  // Produkte - fuer Faelle von vor dem Umstieg der alte (lifeskin-preise.js).
  const preis = entwurf?.preis || bericht?.preis || preisFuerFall(gewaehlt.size || 2, sitzung.createdAt);

  const marke = {
    wartet: ["heart-lifeskin-marke--offen", "wartet auf Befund"],
    vorschau: ["heart-lifeskin-marke--offen", "Vorschau"],
    fertig: ["heart-lifeskin-marke--neu", "freigegeben"],
    bestellt: ["heart-lifeskin-marke--neu", "bestellt"],
    versandt: ["heart-lifeskin-marke--neu", "versendet"],
    zugestellt: ["heart-lifeskin-marke--neu", "zugestellt"]
  }[stand] || ["heart-lifeskin-marke--offen", stand];

  // Nur fuer die alte Analyseseite (Schweregrad, 4-Wochen-Plan, eigene
  // Texte). Die Seite ist nicht mehr in Gebrauch; die Werte reisen
  // unsichtbar mit, damit ein erneutes Freigeben nichts loescht.
  const a = bericht?.analyse || {};
  const eigeneTexte = bericht?.texte || {};
  const altWerte = `
      <input type="hidden" id="lifeskin-schwere" value="${escapeHtml(String(bericht?.schwere || ""))}" />
      ${[1, 2, 3, 4].map((n) => `<input type="hidden" data-zusatz="java_${n}" value="${escapeHtml(String((a.javet || [])[n - 1] || ""))}" />`).join("")}
      ${Object.entries(eigeneTexte).filter(([, w]) => String(w || "").trim()).map(([k, w]) =>
        `<textarea hidden data-text="${escapeHtml(k)}">${escapeHtml(String(w))}</textarea>`).join("")}`;

  const raport = ohneSeiteTief(bericht?.raport || {});
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
            <small>${escapeHtml(p.inhalt || "")}${p.roli === "baze" ? " · bazë" : p.roli === "mbeshtetje" ? " · mbështetje" : p.roli === "pastrim" ? " · pastrim" : ""}</small>
          </span>
        </label>
        <div class="heart-lifeskin-pwahl__text${an ? "" : " heart-lifeskin-pwahl__text--zu"}"
             data-produkt-block="${escapeHtml(id)}">
          <label class="heart-lifeskin-feld">
            <span>Wofür bei diesem Patienten</span>
            <input class="heart-lifeskin-eingabe" data-produkt-zweck="${escapeHtml(id)}" maxlength="120"
                   placeholder="z. B. rrudhat rreth syve" value="${escapeHtml(zweck.get(id) || "")}">
          </label>
          <details class="heart-befund__rueckfall">
            <summary>Rückfalltext (ohne Antwort der KI)</summary>
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
          </details>
        </div>
      </div>`;
    }).join("");

  // DER BOGEN UEBERLEBT JEDES NEUZEICHNEN (data-bewahren). Der Schluessel
  // wechselt nur, wenn der gespeicherte Befund selbst sich aendert.
  const bewahren = ["befund", sitzung.id, stand, bericht?.freigabeAt || "", bericht?.versandtAt || "",
    bericht?.ohneBild ? "pa-foto" : ""].join(":");

  const schritt = (nr, titel, inhalt) => `
        <section class="heart-befund__schritt">
          <h5 class="heart-befund__titel"><span class="heart-befund__nr">${nr}</span>${titel}</h5>
          ${inhalt}
        </section>`;

  // Ein Feld der Analyse-Details mit Vorschau darunter.
  const detailFeld = (f) => {
    const nurFoto = f.id === "fotot" || f.id === "zonat";
    const tvArt = f.art === "zahl" ? "zahl" : f.art === "stufe" ? "stufe" : "absatz";
    const wertJetzt = bogenWerte[f.id];
    const tvWerte = tvArt === "stufe"
      ? { text: wertJetzt === 0 || wertJetzt ? String(wertJetzt) : "", name: NIVELI_NAMEN[Number(wertJetzt)] || "" }
      : { text: String(wertJetzt ?? ""), einheit: f.id === "fotot" ? "foto" : f.id === "zonat" ? "zona" : "" };
    return `
          <div class="heart-lifeskin-feld heart-tv-feld"${nurFoto ? ` data-nur-foto${ohneFoto ? " hidden" : ""}` : ""}>
            <label class="heart-lifeskin-feld">
              <span class="heart-lifeskin-feld__kopf">
                <span>${escapeHtml(f.marke)}</span>
                ${fuellungsMarke(f.art === "stufe" ? "stufe" : "raport", f.id, wertJetzt)}
              </span>
              ${bogenFeld(f, wertJetzt)}
            </label>
            ${vorschauKasten(`raport:${f.id}`, tvArt, tvWerte, ` data-tv-art="${tvArt}"${tvArt === "zahl" ? ` data-tv-einheit="${f.id === "fotot" ? "foto" : "zona"}"` : ""}`)}
          </div>`;
  };

  return `
    <details class="heart-lifeskin-editor heart-befund" data-bewahren="${escapeHtml(bewahren)}" ${klappAttr("fall:befund", false)}>
      <summary class="heart-lifeskin-editor__kopf heart-befund__kopf">
        <h4>Befund</h4>
        <span class="heart-lifeskin-marke ${marke[0]}">${escapeHtml(marke[1])}</span>
        <span class="heart-stand" data-stand-fuer="gesamt" data-stand="" aria-hidden="true"></span>
      </summary>

      <div data-bogen="befund">
      ${altWerte}

      ${befundGruppe("vorbereitung", "Therapie, Prompt &amp; Antwort", `
        ${schritt(1, "Therapie wählen", `
          <p class="heart-befund__hilfe">Heart merkt sich die Auswahl auf diesem Gerät.</p>
          <div class="heart-befund__produkte">
            ${zeilen || `<p class="heart-lifeskin-leer">Noch kein Produkt angelegt. Erst unter „Mehr anzeigen → Produkte“ anlegen.</p>`}
          </div>
          <div class="heart-befund__reihe">
            <label class="heart-lifeskin-feld heart-analyse-art">
              <span>Analyse-Weg</span>
              <select class="heart-lifeskin-eingabe" data-bogen-weg>
                <option value="skanim"${weg === "skanim" ? " selected" : ""}>Skanim (Gesichtsscan)</option>
                <option value="foto"${weg === "foto" ? " selected" : ""}>Foto</option>
                <option value="trup"${weg === "trup" ? " selected" : ""}>Trup (Beschreibung, ohne Foto)</option>
                <option value="pytje"${weg === "pytje" ? " selected" : ""}>Pytje (Frage, ohne Foto)</option>
              </select>
              <input type="hidden" data-bogen-art value="${escapeHtml(art)}" />
            </label>
            <label class="heart-lifeskin-feld heart-befund__preis">
              <span>Setpreis €</span>
              <input class="heart-lifeskin-eingabe" id="lifeskin-preis" type="number" inputmode="decimal"
                     data-angelegt="${escapeHtml(String(sitzung.createdAt || ""))}"
                     value="${escapeHtml(String(preis))}" />
            </label>
          </div>`)}
        ${schritt(2, "Prompt kopieren", `
          <button type="button" class="heart-befund__knopf heart-befund__knopf--haupt" data-action="lifeskin-prompt-kopieren">Prompt für diesen Fall kopieren</button>
          <textarea class="heart-lifeskin-eingabe" id="lifeskin-prompt-ausgabe" hidden readonly rows="5" aria-label="Vollständiger Prompt für diesen Fall"></textarea>`)}
        ${schritt(3, "Antwort einfügen", `
          <div class="heart-lifeskin-vorlage">
            <textarea class="heart-lifeskin-eingabe" id="lifeskin-json" rows="3"
                      placeholder="Antwort der KI hier einfügen"></textarea>
            <button type="button" class="heart-befund__knopf" data-action="lifeskin-json-uebernehmen">Übernehmen</button>
            <p class="heart-lifeskin-vorlage__stand" id="lifeskin-vorlage-stand"></p>
          </div>`)}`)}

      ${befundGruppe("seite", "Therapieseite prüfen", `
        <p class="heart-befund__hilfe">So steht es beim Patienten. Jedes Feld lässt sich ändern.</p>
        ${renderShitjaFelder(raport.shitja, produkte, [...gewaehlt.keys()], { patient: String(sitzung.name || "").trim(), ohneFoto })}`)}

      ${befundGruppe("raste", "Ergebnisse auf der Seite", renderBefundRasteAuswahl(raste, bericht, zustand), { hinweis: "Vorher / Nachher" })}

      ${befundGruppe("details", "Analyse-Details", `
        <textarea hidden data-raport-meta>${escapeHtml(JSON.stringify(raport || {}))}</textarea>
        <div class="heart-lifeskin-bogen__leib">
          ${RAPORT_BOGEN.map(detailFeld).join("")}
          <div class="heart-lifeskin-feld">
            <span>Ndryshimet sipas zonave</span>
            ${zonenBogen(raport.zonaLista || [])}
          </div>
          <div class="heart-lifeskin-feld" data-nur-foto${ohneFoto ? " hidden" : ""}>
            <span>Matjet nga fotot — dhjetë parametrat</span>
            ${messBogen(raport.parametrat || [])}
          </div>
          <label class="heart-lifeskin-feld">Begriffe und Erklärungen (JSON)
            <textarea class="heart-lifeskin-eingabe" rows="4" data-raport-terms>${escapeHtml(JSON.stringify(raport.termat || [], null, 2))}</textarea>
          </label>
        </div>`, { id: "lifeskin-bogen", hinweis: "Diagnose, Zonen, Messwerte" })}

      </div><!-- /Bogen -->

      <!-- FREIGEBEN: wie zuvor - der Hauptknopf gruen und breit, die
           Vorschau darunter. -->
      <section class="heart-befund__freigabe">
        <label class="heart-befund__geprueft"><input type="checkbox" data-raport-reviewed${raport.aerztlichGeprueft ? " checked" : ""} />
          <span>Dr. Violeta Gashi hat diesen Befund ärztlich geprüft.</span></label>
        <button type="button" class="heart-befund__knopf heart-befund__knopf--haupt"
                data-action="lifeskin-bericht-freigeben" data-id="${escapeHtml(sitzung.id)}">
          ${fertig ? "Änderungen freigeben"
            : (["trup", "pytje"].includes(typVon(sitzung)) ? "Antwort freigeben" : "Befund freigeben")}
        </button>
        <button type="button" class="heart-befund__knopf heart-befund__knopf--leise"
                data-action="lifeskin-bericht-vorschau" data-id="${escapeHtml(sitzung.id)}">Nur für uns (Vorschau)</button>
        ${stand !== "wartet" ? `<a class="heart-befund__textlink" href="/terapia/${escapeHtml(sitzung.id)}?${stand === "vorschau" ? "vorschau=1&amp;" : ""}still=1" target="_blank" rel="noopener">
          ${stand === "vorschau" ? "Vorschau ansehen" : "Therapieseite ansehen"} ${renderHeartIcon("externalLink", "heart-befund__linkicon")}<small>ohne Statistik</small></a>` : ""}
      </section>

      <!-- AN DEN PATIENTEN: was am meisten gebraucht wird, unten am Daumen. -->
      ${renderPatientKnoepfe(sitzung, bericht, fertig)}

      ${["bestellt", "versandt", "zugestellt"].includes(stand) ? `
      <section class="heart-befund__freigabe">
        <span class="heart-befund__zwischen">Versand</span>
        <div class="heart-befund__knopfreihe">
          <button type="button" class="heart-befund__knopf" data-action="lifeskin-versand"
                  data-id="${escapeHtml(sitzung.id)}" data-stand="versandt">Als versendet melden</button>
          <button type="button" class="heart-befund__knopf" data-action="lifeskin-versand"
                  data-id="${escapeHtml(sitzung.id)}" data-stand="zugestellt">Als zugestellt melden</button>
        </div>
      </section>` : ""}
    </details>`;
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
      ${feld("einzelpreis", "Einzelpreis in Euro", feldwert("einzelpreis", p.einzelpreis), { art: "number", hinweis: "Der Ankerpreis (33). Verkauft wird nach Staffel: 1 = 29, 2 = 39, 3 = 49, 4 = 59 - die Summe der Einzelpreise steht durchgestrichen ueber dem Setpreis." })}
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
export function renderReset(anzahl, gefragt, status) {
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
  if (zustand.rastOffen) {
    return `<div class="heart-lifeskin">${renderRastiEditor(zustand, produkte || [])}</div>`;
  }

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
      zustand.loeschGefragt === zustand.offen, rasteListe(zustand), zustand
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
        zustand.vorschau || {}, { auswahl: zustand.auswahl ?? null, auswahlLoeschen: !!zustand.auswahlLoeschen })}
      ${renderBestellungen(sitzungen, zustand.bestellZeitraum || "heute")}
      ${renderNachfassen(zahlen)}

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
      <details class="heart-lifeskin-mehr" ${klappAttr("mehr")}>
        <summary>Mehr anzeigen</summary>
        <!-- Jede Karte hier ist zugeklappt, bis jemand sie aufmacht. -->
        <div class="heart-lifeskin-mehr__karten">
          ${renderStillLinks(zustand)}
          ${alsKlapp(renderHerkunft(baueHerkunft(imBlick)), "herkunft", { standard: false })}
          ${alsKlapp(renderProdukte(produkte), "produkte", { standard: false })}
          ${renderRaste(zustand)}
          ${alsKlapp(renderVerteilung(baueVerteilung(imBlick)), "verteilung", { standard: false })}
          ${alsKlapp(renderTests(zustand.tests, zustand.berichte || {}), "tests", { standard: false })}
          ${alsKlapp(renderAnbieter(zustand.konfig?.anbieter, zustand.anbieterStatus), "anbieter", { standard: false })}
        </div>
      </details>
      ${"" /* Meldungs-Schalter und Reset-Knopf stehen seit dem 23.09. in
           den Einstellungen (heart-settings-render.js). */}
    </div>`;
}
