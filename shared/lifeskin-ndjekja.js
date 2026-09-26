// DIE VIERWOECHIGE BEGLEITUNG ("ndjekja") - Regeln, Texte, Rechnung.
//
// Auftrag vom 26.09.: Besucher sollen auf ihrer Therapieseite verstehen,
// wie die vier Wochen nach dem Kauf ablaufen - und nach dem Kauf einen
// eigenen, geschuetzten Bereich bekommen, in dem sie kurz festhalten, wie
// die Anwendung laeuft, und sehen, was das Team zurueckmeldet. Heart
// bearbeitet dieselben Faelle.
//
// EINE STELLE FUER ALLE DREI: Therapieseite (Vorschau), Kundenbereich
// (/ndjekja#<zugang>) und Heart rechnen Woche, Tag und Termine hier - sonst
// staende auf der Seite "Kontrolli i radhës: dita 7", waehrend Heart den
// Fall am Tag 8 als faellig fuehrt.
//
// WAS HIER BEWUSST NICHT STEHT: eine Diagnose aus einer gewaehlten
// Hautreaktion, eine automatische Aenderung der Therapie, eine
// Heilungsquote oder ein Countdown ("noch 12 Tage bis zur reinen Haut").
// Eine Auswahl beschreibt, wie sich die Haut angefuehlt hat - mehr nicht.

export const NDJEKJA = Object.freeze({
  // STEHT DIE BEGLEITUNG SCHON IM VERKAUF?
  //
  // Nein, solange nicht Kundenbereich UND Arbeitsablauf in Heart gemeinsam
  // laufen und intern feststeht, wer prueft, an welchen Tagen und wie
  // schnell geantwortet wird (Auftrag, Punkte 4 und 8). Bis dahin sieht
  // sie nur, wer die Therapieseite mit ?ndjekja=1 oeffnet.
  imVerkauf: false,
  // Der Tag (JJJJ-MM-TT), an dem imVerkauf auf true ging. Heart teilt
  // damit die Empfaenger in Gruppen (shared/lifeskin-kaufweg.js) - auch
  // die, die ihre Therapieseite nie geoeffnet haben.
  imVerkaufSeit: "",
  tage: 28,
  // Die geplanten Rueckmeldungen, in Tagen ab dem ANWENDUNGSSTART - nicht
  // ab der Bestellung: Versandtage verbrauchen keine Betreuungstage.
  kontrollTage: Object.freeze([7, 14, 21, 28]),
  // Wer die Eintraege prueft. LEER, solange es nicht festgelegt ist - dann
  // spricht die Seite von "ne" (wir), ohne jemanden zu nennen. Erst
  // eintragen, wenn diese Person es wirklich tut.
  pruefer: "",
  // In welcher Zeit Fragen beantwortet werden. LEER = keine Frist auf der
  // Seite, solange sie organisatorisch nicht abgesichert ist.
  antwortZeit: "",
  // Heart: ab wann ein faelliger Termin als ueberfaellig gilt, und wie
  // lange ein Fall als "neu gestartet" gefuehrt wird.
  ueberfaelligNachTagen: 2,
  neuBisTag: 3
});

// Die Version der Therapieseite, fuer die Auswertung: Welche Fassung hat
// der Besucher gesehen, als er (nicht) bestellt hat?
export const KAUFWEG_VERSION = Object.freeze({ klassisch: "klassisch", ndjekja: "ndjekja-1" });

export const PERDORIMI = Object.freeze([
  Object.freeze({ id: "po", sq: "E përdora" }),
  Object.freeze({ id: "pjeserisht", sq: "Pjesërisht" }),
  Object.freeze({ id: "jo", sq: "Nuk e përdora" })
]);

// Wie sich die Haut angefuehlt hat. Die eigene Wahrnehmung - keine Diagnose.
export const NDJESITE = Object.freeze([
  Object.freeze({ id: "mire", sq: "Pa shqetësime" }),
  Object.freeze({ id: "thatesi", sq: "Thatësi / tërheqje" }),
  Object.freeze({ id: "skuqje", sq: "Skuqje" }),
  Object.freeze({ id: "djegie", sq: "Djegie / pickim" }),
  Object.freeze({ id: "tjeter", sq: "Diçka tjetër" })
]);

export const MESAZH_MAX = 500;
export const GESCHAEFTSZONE = "Europe/Belgrade";

// Die Texte des Verkaufsabschnitts und des Kundenbereichs. Albanisch, "ju".
export const NDJEKJA_TEXTE = Object.freeze({
  titulli: "Katër javë, me ndjekje hap pas hapi.",
  hyrja: "Shënoni përdorimin dhe si është ndier lëkura juaj. Në kontrollet e planifikuara, shqyrtojmë ecurinë dhe ju japim udhëzimet e radhës.",
  shembull: "Shembull i ndjekjes suaj",
  shembullShenim: "Vetëm shembull – asgjë nuk ruhet.",
  perdorimiSot: "Përdorimi sot",
  ndjesiaPyetja: "Si është ndier lëkura juaj?",
  pyetjeKontakt: "Keni pyetje për përdorimin?",
  pikat: Object.freeze([
    Object.freeze(["Shënim i shkurtër, vullnetar", "për përdorimin dhe si reagon lëkura juaj."]),
    Object.freeze(["Kontroll javor i planifikuar", "shqyrtojmë ecurinë dhe ju japim hapin e radhës."]),
    Object.freeze(["Kontakt i drejtpërdrejtë", "për çdo pyetje gjatë përdorimit."])
  ]),
  // Punkt 4 des Auftrags: Ein taeglicher Eintrag ist keine taegliche
  // aerztliche Durchsicht - das steht so auf der Seite.
  joDitore: "Shënimi ditor nuk do të thotë kontroll mjekësor çdo ditë. Shënimet tuaja i shqyrtojmë në kontrollet e planifikuara.",
  // Der Ablauf, kompakt. "Tag 28" verspricht keine reine Haut: Er haelt
  // fest, was erreicht ist, und was als Naechstes empfohlen wird.
  rruga: Object.freeze([
    Object.freeze(["Fillimi", "Ju shpjegojmë planin dhe si përdoren produktet."]),
    Object.freeze(["Dita 7", "Kontrolli i parë: si po reagon lëkura dhe udhëzimet e radhës."]),
    Object.freeze(["Dita 14", "Shqyrtojmë ecurinë e dy javëve të para."]),
    Object.freeze(["Dita 21", "Kontrolli i tretë, me udhëzimet për javën e fundit."]),
    Object.freeze(["Dita 28", "Vlerësimi përmbyllës dhe hapi i radhës."])
  ])
});

// Wer prueft, in Worten - fuer Saetze wie "... shqyrton ecurinë".
export function pruefendeStelle(konfig = NDJEKJA) {
  const name = String(konfig?.pruefer || "").trim();
  return name || "ekipi ynë";
}

// Ist der neue Abschnitt fuer diesen Besuch an? Im Verkauf fuer alle,
// sonst nur mit ?ndjekja=1 (Vorschau).
export function ndjekjaSichtbar(suche = "", konfig = NDJEKJA) {
  if (konfig?.imVerkauf === true) return true;
  try {
    return new URLSearchParams(String(suche || "")).get("ndjekja") === "1";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Tage und Termine - gerechnet mit Kalendertagen (JJJJ-MM-TT), nicht mit
// Zeitstempeln: "Tag 7" ist ein Datum, keine Zahl von Stunden.
// ---------------------------------------------------------------------------

const TAGFORM = new Intl.DateTimeFormat("sv-SE", { timeZone: GESCHAEFTSZONE });

export function heuteIso(jetzt = new Date()) {
  const zeit = jetzt instanceof Date ? jetzt : new Date(jetzt);
  return Number.isNaN(zeit.getTime()) ? "" : TAGFORM.format(zeit);
}

export function istDatum(wert) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(wert || "")) && !Number.isNaN(Date.parse(`${wert}T00:00:00Z`));
}

export function datumPlus(iso, tage) {
  if (!istDatum(iso)) return "";
  const zeit = Date.parse(`${iso}T00:00:00Z`) + Math.round(Number(tage) || 0) * 86400000;
  return new Date(zeit).toISOString().slice(0, 10);
}

export function tageZwischen(von, bis) {
  if (!istDatum(von) || !istDatum(bis)) return 0;
  return Math.round((Date.parse(`${bis}T00:00:00Z`) - Date.parse(`${von}T00:00:00Z`)) / 86400000);
}

// Der wievielte Anwendungstag ist heute? Tag 1 ist der Starttag. 0 heisst:
// noch nicht angefangen (oder der Start liegt in der Zukunft).
export function anwendungsTag(start, heute) {
  if (!istDatum(start) || !istDatum(heute)) return 0;
  const tag = tageZwischen(start, heute) + 1;
  return tag >= 1 ? tag : 0;
}

export function wocheVon(tag, konfig = NDJEKJA) {
  const n = Math.round(Number(tag) || 0);
  if (n < 1) return 0;
  const wochen = Math.max(1, Math.round((konfig?.tage || 28) / 7));
  return Math.min(wochen, Math.ceil(n / 7));
}

// DIE TERMINE - geplant, bis das Team einen wirklich bearbeitet hat.
//
// Ein geplanter Termin erscheint NIE von selbst als erledigt (Auftrag,
// Punkt 7). "kryer" setzt nur Heart, mit Datum und Absender.
export function kontrollPlan(ndjekja, konfig = NDJEKJA) {
  const start = ndjekja?.startAt;
  const erledigt = ndjekja?.kontrollet && typeof ndjekja.kontrollet === "object" ? ndjekja.kontrollet : {};
  return (konfig?.kontrollTage || []).map((dita) => {
    const eintrag = erledigt[String(dita)] || null;
    const kryer = eintrag?.statusi === "kryer";
    return {
      dita,
      datum: istDatum(start) ? datumPlus(start, dita - 1) : "",
      statusi: kryer ? "kryer" : "planifikuar",
      kryerAt: kryer ? String(eintrag.at || "") : "",
      nga: kryer ? String(eintrag.nga || "") : ""
    };
  });
}

// Der naechste offene Termin. Hat das Team ein eigenes Datum gesetzt
// (kontrolliRadhes), gilt dieses.
export function naechsteKontrolle(ndjekja, konfig = NDJEKJA) {
  const offen = kontrollPlan(ndjekja, konfig).find((k) => k.statusi !== "kryer") || null;
  if (!offen) return null;
  const eigen = istDatum(ndjekja?.kontrolliRadhes) ? ndjekja.kontrolliRadhes : "";
  return { ...offen, datum: eigen || offen.datum, eigen: Boolean(eigen) };
}

export function letzteKontrolle(ndjekja, konfig = NDJEKJA) {
  return kontrollPlan(ndjekja, konfig).filter((k) => k.statusi === "kryer").at(-1) || null;
}

// In welcher Phase ist die Begleitung?
//
//   pritet      bestaetigt, aber noch nicht angefangen (Paket unterwegs)
//   aktiv       angefangen - auch nach Tag 28, bis das Team abschliesst
//   perfunduar  vom Team abgeschlossen
//   anuluar     die Bestellung wurde storniert
//
// NICHT "nach 28 Tagen von selbst fertig": Dann laege ein Fall, dessen
// Abschlusskontrolle nie stattfand, still unter "Abgeschlossen" - statt
// unter "Überfällig", wo ihn jemand sieht.
export function phaseVon(ndjekja, heute) {
  if (ndjekja?.porosia?.statusi === "anuluar") return "anuluar";
  if (ndjekja?.statusi === "perfunduar") return "perfunduar";
  return anwendungsTag(ndjekja?.startAt, heute) ? "aktiv" : "pritet";
}

// Sind die vier Wochen um (und das Team hat noch nicht abgeschlossen)?
export function nachDenWochen(ndjekja, heute, konfig = NDJEKJA) {
  return anwendungsTag(ndjekja?.startAt, heute) > (konfig?.tage || 28);
}

// ---------------------------------------------------------------------------
// Eintraege des Kunden
// ---------------------------------------------------------------------------

export function eintragsId(tag) {
  const n = Math.max(1, Math.min(99, Math.round(Number(tag) || 0)));
  return `t${String(n).padStart(2, "0")}`;
}

// Was aus dem Formular in ein Dokument darf - geprueft wie in den Regeln.
export function eintragBereinigen({ dita, data, perdorimi, ndjesia = [], mesazh = "" } = {}, jetztIso = new Date().toISOString()) {
  const tag = Math.round(Number(dita) || 0);
  if (tag < 1 || tag > 60) return null;
  if (!PERDORIMI.some((p) => p.id === perdorimi)) return null;
  const erlaubt = new Set(NDJESITE.map((n) => n.id));
  const auswahl = [...new Set((Array.isArray(ndjesia) ? ndjesia : []).filter((n) => erlaubt.has(n)))];
  // "Pa shqetësime" schliesst die anderen aus.
  const gefuehl = auswahl.includes("mire") ? ["mire"] : auswahl.slice(0, 4);
  return {
    dita: tag,
    data: istDatum(data) ? data : "",
    perdorimi,
    ndjesia: gefuehl,
    mesazh: String(mesazh || "").trim().slice(0, MESAZH_MAX),
    updatedAt: jetztIso
  };
}

// Ein Tag ohne Eintrag heisst "nicht dokumentiert" - NIE "nicht angewendet".
export function tagesStand(eintrag) {
  if (!eintrag) return { id: "pa", sq: "Nuk është shënuar" };
  const p = PERDORIMI.find((x) => x.id === eintrag.perdorimi);
  return p ? { id: p.id, sq: p.sq } : { id: "pa", sq: "Nuk është shënuar" };
}

export function ndjesiaTekst(ids = []) {
  const namen = new Map(NDJESITE.map((n) => [n.id, n.sq]));
  return (Array.isArray(ids) ? ids : []).map((id) => namen.get(id)).filter(Boolean).join(" · ");
}

// Braucht dieser Eintrag die Aufmerksamkeit des Teams? Eine Nachricht,
// oder eine Reaktion ausser "Pa shqetësime". Das ist eine ARBEITSLISTE,
// keine Bewertung - beantwortet wird von einem Menschen.
export function eintragBrauchtBlick(eintrag) {
  if (!eintrag) return false;
  if (String(eintrag.mesazh || "").trim()) return true;
  return (eintrag.ndjesia || []).some((id) => id && id !== "mire");
}

// DIE ZUSAMMENFASSUNG AM FALL ("fundit") - damit Heart eine neue
// Rueckmeldung sieht, ohne die Eintraege jedes Falls zu laden. Sie wird
// im SELBEN Schreibvorgang wie der Eintrag gesetzt (ein Commit): Beides
// kommt an, oder keines.
//
// blickAt waechst nur: Ein spaeterer Eintrag ohne Nachricht nimmt einer
// frueheren Frage nicht die Markierung.
export function funditNach(eintrag, alt = {}, jetztIso = new Date().toISOString()) {
  const vorher = alt && typeof alt === "object" ? alt : {};
  const blick = eintragBrauchtBlick(eintrag);
  return {
    dita: Math.round(Number(eintrag?.dita) || 0),
    at: jetztIso,
    blickAt: blick ? jetztIso : String(vorher.blickAt || "")
  };
}

// Ein Falldokument, wie es aus Firestore kommt, in die Form, mit der alle
// drei Seiten rechnen. Was fehlt oder nicht passt, wird leer - nie geraten.
export function ndjekjaLesen(roh = {}) {
  const d = roh && typeof roh === "object" ? roh : {};
  const kontrollet = {};
  for (const [dita, k] of Object.entries(d.kontrollet && typeof d.kontrollet === "object" ? d.kontrollet : {})) {
    if (k && typeof k === "object" && k.statusi === "kryer") {
      kontrollet[String(dita)] = { statusi: "kryer", at: String(k.at || ""), nga: String(k.nga || "") };
    }
  }
  const fundit = d.fundit && typeof d.fundit === "object" ? d.fundit : {};
  return {
    kennung: String(d.kennung || ""),
    code: String(d.code || ""),
    emri: String(d.emri || ""),
    statusi: d.statusi === "perfunduar" ? "perfunduar" : "aktiv",
    porosia: { statusi: ["konfirmuar", "derguar", "dorezuar", "anuluar"].includes(d.porosia?.statusi) ? d.porosia.statusi : "konfirmuar" },
    startAt: istDatum(d.startAt) ? d.startAt : "",
    startVon: ["klienti", "ekipi"].includes(d.startVon) ? d.startVon : "",
    kontrollet,
    kontrolliRadhes: istDatum(d.kontrolliRadhes) ? d.kontrolliRadhes : "",
    fundit: { dita: Math.round(Number(fundit.dita) || 0), at: String(fundit.at || ""), blickAt: String(fundit.blickAt || "") },
    createdAt: String(d.createdAt || ""),
    updatedAt: String(d.updatedAt || "")
  };
}

// ---------------------------------------------------------------------------
// Heart: in welchen Arbeitslisten steht ein Fall?
// ---------------------------------------------------------------------------

export const ARBEITSLISTEN = Object.freeze([
  Object.freeze({ id: "rueckmeldung", label: "Neue Rückmeldung / Frage" }),
  Object.freeze({ id: "ueberfaellig", label: "Kontrolle überfällig" }),
  Object.freeze({ id: "faellig", label: "Kontrolle fällig" }),
  Object.freeze({ id: "neu", label: "Neu gestartet" }),
  Object.freeze({ id: "pritet", label: "Wartet auf Start" }),
  Object.freeze({ id: "fertig", label: "Betreuung abgeschlossen" })
]);

// Ein Fall kann in mehreren Listen stehen (faellig UND neue Rueckmeldung).
//
// "Neue Rueckmeldung" gilt in JEDER Phase ausser storniert: Eine Frage
// vor dem Start oder nach dem Ende bleibt eine Frage. Gelesen wird sie
// aus den Eintraegen, wenn Heart sie geladen hat, sonst aus der
// Zusammenfassung am Fall (fundit.blickAt).
export function arbeitslistenVon({ ndjekja, eintraege = null, lexuarDeri = "", heute, konfig = NDJEKJA } = {}) {
  const listen = new Set();
  const phase = phaseVon(ndjekja, heute);
  if (phase === "anuluar") return listen;
  const seit = String(lexuarDeri || "");
  const neueFrage = Array.isArray(eintraege)
    ? eintraege.some((e) => eintragBrauchtBlick(e) && String(e.updatedAt || "") > seit)
    : String(ndjekja?.fundit?.blickAt || "") > seit;
  if (neueFrage) listen.add("rueckmeldung");
  if (phase === "perfunduar") { listen.add("fertig"); return listen; }
  if (phase === "pritet") { listen.add("pritet"); return listen; }
  const tag = anwendungsTag(ndjekja?.startAt, heute);
  if (tag <= (konfig?.neuBisTag || 3)) listen.add("neu");
  const naechste = naechsteKontrolle(ndjekja, konfig);
  if (naechste?.datum && istDatum(heute)) {
    const ueber = tageZwischen(naechste.datum, heute);
    if (ueber > (konfig?.ueberfaelligNachTagen ?? 2)) listen.add("ueberfaellig");
    else if (ueber >= 0) listen.add("faellig");
  }
  return listen;
}

// Ein zufaelliger Zugang (128 Bit, hex). Wer ihn nicht hat, kommt an den
// Bereich nicht heran - er steht nur im Link, den der Kunde bekommt.
export function neuerZugang(zufall = globalThis.crypto) {
  const bytes = new Uint8Array(16);
  zufall.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function istZugang(wert) {
  return /^[0-9a-f]{32}$/.test(String(wert || ""));
}

// Der Link fuer den Kunden. Der Zugang steht im Fragment (#): Er geht
// nicht an den Server, nicht in dessen Logs und nicht als Referer an
// fremde Seiten - auch nicht an WhatsApp, das fuer die Vorschau nur die
// Adresse ohne Fragment abruft.
export function ndjekjaLink(zugang, basis = "https://www.mnyra.com") {
  return istZugang(zugang) ? `${basis}/ndjekja#${zugang}` : "";
}

// Die Nachricht mit dem Link fuer den Kunden (WhatsApp aus Heart). Der
// Zugang steht im Fragment - WhatsApp laedt fuer die Vorschau nur die
// Adresse davor.
export function linkNachricht(emri, zugang) {
  const name = String(emri || "").trim();
  return `${name ? `Përshëndetje ${name}!` : "Përshëndetje!"} Porosia juaj u konfirmua. Këtu është zona juaj personale për 4 javët e terapisë – ruajeni këtë link: ${ndjekjaLink(zugang)}`;
}
