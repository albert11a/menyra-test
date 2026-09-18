// Liest, was im Lifeskin-Trichter passiert ist.
//
// Geschrieben werden die Sitzungen vom Trichter selbst, ohne Anmeldung und
// eng begrenzt durch die Firestore-Regeln. Hier wird nur gelesen - mit den
// Rechten des angemeldeten Kontos, also ueber dieselben Regeln wie alles
// andere in Heart.
//
// Gerechnet wird im Browser, nicht in der Abfrage: Eine einzige Abfrage ohne
// Sortierung und ohne Filter braucht keinen zusammengesetzten Index, den erst
// jemand anlegen muesste. Bei der Menge, um die es geht - einige hundert
// Sitzungen am Tag - ist das nicht der Rede wert, und es gibt nichts, was im
// Betrieb fehlen kann.
//
// Zum Tempo wie beim Landing-Bereich: erst aus dem Geraetespeicher lesen und
// sofort anzeigen, danach den echten Stand holen. Wer den Bereich schon
// einmal offen hatte, sieht ihn beim naechsten Mal ohne Warten.

import { db } from "/shared/firebase-config.js";
import {
  TRICHTER_STUFEN,
  baueTrichter,
  baueLesetiefe,
  entdopple,
  baueKennzahlen,
  baueHerkunft,
  baueVerteilung,
  baueTagesverlauf,
  normalisiere,
  teileTests
} from "./heart-lifeskin-berechnung.js";
import {
  collection,
  doc,
  getDocs,
  getDocsFromCache,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  deleteDoc,
  where,
  writeBatch
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import { LIVE_FENSTER_MS } from "./heart-lifeskin-live.js";

const TENANT = "lifeskin";
const SITZUNG_GRENZE = 3000;

async function ladeSammlung(pfad, ausSpeicher) {
  const abfrage = query(collection(db, ...pfad), limit(SITZUNG_GRENZE));
  const schnappschuss = ausSpeicher ? await getDocsFromCache(abfrage) : await getDocs(abfrage);
  return schnappschuss.docs;
}

export { TRICHTER_STUFEN };

// WER GERADE DABEI IST - und zwar wirklich live.
//
// onSnapshot statt getDocs: Firestore schickt jede Aenderung von selbst,
// ohne dass jemand nachfragt. Ein Besucher, der auf die Kamera tippt,
// laesst den Punkt hier im selben Augenblick aufleuchten - ohne Neuladen
// und ohne dass die Seite im Sekundentakt nachfragt.
//
// ABGEFRAGT WIRD NUR EIN AUSSCHNITT, nicht die ganze Sammlung. Ein
// Zuhoerer auf dreitausend Sitzungen laedt beim Anmelden dreitausend
// Dokumente und rechnet bei jeder Aenderung alles neu. Hier zaehlen nur
// die letzten Minuten, also fragt die Abfrage auch nur danach.
//
// Das Fenster ist grosszuegiger als das der Rechnung (das Doppelte): Die
// Abfrage steht fest, waehrend die Zeit weiterlaeuft, und muesste sonst
// alle paar Minuten neu aufgesetzt werden - jedes Mal mit einem neuen
// Anmelden und einem neuen Ladevorgang. So laeuft sie lange, und welche
// Sitzung "gerade" ist, entscheidet die Rechnung bei jedem Takt neu.
export function horcheLive(beiAenderung, { fensterMs = LIVE_FENSTER_MS * 2 } = {}) {
  const seit = new Date(Date.now() - fensterMs).toISOString();
  const abfrage = query(
    collection(db, "lifeskin", TENANT, "sessions"),
    where("updatedAt", ">=", seit),
    orderBy("updatedAt", "desc"),
    // Mehr als das sind in drei Minuten nie gleichzeitig unterwegs, und
    // waeren sie es, ist die Reihe ohnehin voll.
    limit(300)
  );
  return onSnapshot(abfrage, (schnappschuss) => {
    beiAenderung(schnappschuss.docs.map((d) => normalisiere(d.id, d.data())));
  }, (fehler) => {
    // Ein Fehler hier haelt Heart nicht an: Die Zahlen darunter kommen aus
    // einer eigenen Abfrage. Die Live-Reihe bleibt dann einfach leer.
    globalThis.console?.warn?.("[heart] Live-Ansicht nicht verfuegbar:", fehler?.message);
    beiAenderung(null);
  });
}

export async function ladeLifeskin({ ausSpeicher = false } = {}) {
  const [sitzungsDocs, produktDocs, konfigDocs, berichtDocs] = await Promise.all([
    ladeSammlung(["lifeskin", TENANT, "sessions"], ausSpeicher),
    ladeSammlung(["lifeskin", TENANT, "products"], ausSpeicher),
    // Die Konfiguration, wegen des Setpreises. Der offene Betrag in den
    // Kacheln haengt daran, und eine feste Zahl im Code war schon einmal
    // um zehn Euro daneben, ohne dass es jemand gemerkt hat.
    ladeSammlung(["lifeskin", TENANT, "config"], ausSpeicher).catch(() => []),
    // Die Berichte. Klein genug, um sie mit der Liste zu holen: In ihnen
    // stehen Befundtext, Produktkennungen und Zustand - keine Bilder.
    ladeSammlung(["lifeskin", TENANT, "reports"], ausSpeicher).catch(() => [])
  ]);

  const konfig = konfigDocs.reduce((zusammen, d) => ({ ...zusammen, ...(d.data() || {}) }), {});
  const setPreis = Number.isFinite(Number(konfig.setPreis)) && Number(konfig.setPreis) > 0
    ? Number(konfig.setPreis)
    : undefined;

  const roh = sitzungsDocs.map((d) => normalisiere(d.id, d.data()));
  const alle = entdopple(roh)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  const produkte = produktDocs.map((d) => ({ id: d.id, ...(d.data() || {}) }));

  // Nach Sitzungskennung abgelegt: Die Einzelansicht schlaegt darin nach,
  // ohne noch einmal zu laden.
  const berichte = {};
  for (const d of berichtDocs) berichte[d.id] = { id: d.id, ...(d.data() || {}) };

  // EIGENE TESTS STEHEN NICHT IN DEN ZAHLEN. Sie verschwinden aber auch
  // nicht - sie stehen in einem eigenen Block unten im Bericht.
  const { echte: sitzungen, tests } = teileTests(alle, berichte);

  return {
    sitzungen,
    tests,
    rohAnzahl: roh.length,
    produkte,
    berichte,
    konfig,
    kennzahlen: baueKennzahlen(sitzungen, { setPreis }),
    trichter: baueTrichter(sitzungen),
    // Wie weit im Bericht gelesen wird. Eigene Rechnung, nicht im
    // Trichter: Der zaehlt kumulativ und wuerde jeden WhatsApp-Tipper als
    // jemanden zaehlen, der den Preis gesehen hat.
    lesetiefe: baueLesetiefe(sitzungen),
    herkunft: baueHerkunft(sitzungen),
    verteilung: baueVerteilung(sitzungen),
    verlauf: baueTagesverlauf(sitzungen)
  };
}

// Die drei Aufnahmen einer Sitzung.
//
// Erst hier, nicht mit der Liste. Die Bilder liegen in einer Untersammlung,
// damit der Reiter beim Oeffnen nicht alle Fotos aller Sitzungen zieht -
// bei ein paar hundert Analysen am Tag waeren das Hunderte Megabyte.
export async function ladeFotos(sitzungId) {
  if (!sitzungId) return {};
  const docs = await getDocs(collection(db, "lifeskin", TENANT, "sessions", sitzungId, "photos"));
  const bilder = {};
  for (const d of docs.docs) {
    const daten = d.data() || {};
    if (typeof daten.jpeg === "string" && daten.jpeg.startsWith("data:image/")) {
      bilder[d.id] = { jpeg: daten.jpeg, breite: daten.breite || 0, hoehe: daten.hoehe || 0 };
    }
  }
  return bilder;
}

// Das erste Bild einer Sitzung - und nur dieses eine.
//
// Es steht in der Liste, links neben dem Namen. Ein Gesicht erkennt man
// schneller als eine Fallnummer, und Dr. Gashi weiss beim Durchscrollen
// sofort, wen sie vor sich hat.
//
// EINE Abfrage mit limit(1) und ohne Sortierung: Firestore gibt dann das
// Dokument mit dem alphabetisch ersten Namen zurueck, und das ist "gerade" -
// die Aufnahme von vorn. Genau die, die man sehen will. Ohne limit waeren es
// bis zu zehn Bilder je Zeile, und eine Liste mit vierzig Zeilen zoege ein
// paar Dutzend Megabyte ueber ein Mobilfunknetz.
export async function ladeErstesFoto(sitzungId) {
  if (!sitzungId) return "";
  const docs = await getDocs(query(
    collection(db, "lifeskin", TENANT, "sessions", sitzungId, "photos"),
    limit(1)
  ));
  for (const d of docs.docs) {
    const jpeg = (d.data() || {}).jpeg;
    if (typeof jpeg === "string" && jpeg.startsWith("data:image/")) return jpeg;
  }
  return "";
}

// EINE EINZELNE Analyse loeschen - mit allem, was an ihr haengt.
//
// Drei Dinge, und alle drei muessen weg: die Sitzung, ihre Fotos (Firestore
// loescht eine Untersammlung nicht mit) und der Bericht des Patienten. Der
// Bericht zuletzt: Bleibt er stehen, waehrend die Sitzung weg ist, zeigt
// sein Link weiter eine Seite an, zu der es keinen Fall mehr gibt.
export async function loescheSitzung(sitzungId) {
  if (!sitzungId) throw new Error("Sitzung ohne Kennung");
  const fotos = await getDocs(collection(db, "lifeskin", TENANT, "sessions", sitzungId, "photos"));
  for (const foto of fotos.docs) await deleteDoc(foto.ref);
  await deleteDoc(doc(db, "lifeskin", TENANT, "sessions", sitzungId));
  // Den Bericht gibt es nur, wenn der Scan fertig wurde. Fehlt er, ist das
  // kein Fehler.
  try { await deleteDoc(doc(db, "lifeskin", TENANT, "reports", sitzungId)); } catch { /* gab es nicht */ }
}

// Eine Marke am Bericht setzen: abgehakt, oder als eigener Test.
//
// Am Bericht und nicht an der Sitzung: Die Sitzung schreibt der Trichter
// ohne Anmeldung, und ihre Regel laesst nur die Felder zu, die er kennt.
// Der Bericht gehoert Dr. Gashi - was sie daran vermerkt, geht ohne neue
// Regel durch.
export async function setzeBerichtMarke(kennung, marken = {}) {
  if (!kennung) throw new Error("Bericht ohne Kennung");
  await setDoc(doc(db, "lifeskin", TENANT, "reports", kennung), marken, { merge: true });
}

// Alle Sitzungen samt Fotos loeschen.
//
// Fuer die Testphase, und nur dafuer. Firestore loescht keine Untersammlung
// mit, wenn das Dokument darueber verschwindet - die Fotos muessen einzeln
// weg, sonst bleiben Gesichtsbilder ohne zugehoerige Sitzung liegen. Das
// waere das Schlimmste von beidem: unsichtbar und trotzdem gespeichert.
//
// In Stapeln, weil ein Schreibvorgang je Dokument bei ein paar hundert
// Sitzungen sonst minutenlang liefe.
export async function loescheAlleSitzungen({ beiFortschritt } = {}) {
  const sitzungen = (await getDocs(query(collection(db, "lifeskin", TENANT, "sessions"), limit(SITZUNG_GRENZE)))).docs;
  let erledigt = 0;

  for (const sitzung of sitzungen) {
    const fotos = await getDocs(collection(db, "lifeskin", TENANT, "sessions", sitzung.id, "photos"));
    let stapel = writeBatch(db);
    let offen = 0;
    for (const foto of fotos.docs) {
      stapel.delete(foto.ref);
      offen += 1;
      if (offen >= 400) { await stapel.commit(); stapel = writeBatch(db); offen = 0; }
    }
    // Die Sitzung zuletzt: Bricht es vorher ab, ist sie noch da und der
    // naechste Versuch findet ihre Fotos wieder. Andersherum waeren sie
    // verwaist.
    stapel.delete(sitzung.ref);
    await stapel.commit();
    erledigt += 1;
    beiFortschritt?.(erledigt, sitzungen.length);
  }
  return erledigt;
}

// Ein Produkt anlegen oder aendern. Der einzige Schreibweg dieses Moduls.
// Wer hinter Lifeskin steht.
//
// Die Befundseite nimmt Namen, Telefonnummer und Anschrift entgegen und
// schliesst damit einen Kauf ab. Ein Gesicht hat sie (Dr. Gashi) und
// einen echten Kontaktweg auch; was fehlte, war die Stelle, an die sich
// jemand wendet, wenn etwas schiefgeht.
//
// EIGENES DOKUMENT unter config, und die drei Werte liegen darin als
// verschachteltes Feld statt flach: Die Konfiguration wird beim Laden aus
// allen Dokumenten der Sammlung zusammengeschoben, und ein flaches "name"
// wuerde dort mit dem naechsten Konfigurationsfeld gleichen Namens
// zusammenstossen - ohne dass es jemand merkt.
//
// Die Regeln stehen schon: config ist oeffentlich lesbar, weil der
// Trichter sie braucht, und nur vom CEO-Konto schreibbar. Genau das ist
// hier gewollt - der Patient muss den Anbieter sehen, aendern darf ihn
// niemand ausser Heart.
export async function speichereAnbieter(anbieter = {}) {
  const sauber = {
    name: String(anbieter.name || "").trim().slice(0, 200),
    anschrift: String(anbieter.anschrift || "").trim().slice(0, 300),
    email: String(anbieter.email || "").trim().slice(0, 200)
  };
  await setDoc(doc(db, "lifeskin", TENANT, "config", "anbieter"),
    { anbieter: sauber }, { merge: true });
  return sauber;
}

export async function speichereProdukt(produkt) {
  const { id, ...felder } = produkt;
  if (!id) throw new Error("Produkt ohne Kennung");
  await setDoc(doc(db, "lifeskin", TENANT, "products", id), felder, { merge: true });
}

// Den Befund freigeben.
//
// Erst hier wechselt die Seite des Patienten von "wartet" auf "fertig" -
// und erst hier gibt es fuer ihn etwas zu kaufen. Geschrieben wird in das
// Berichtdokument, nicht in die Sitzung: Der Bericht ist die Seite, die er
// sieht, und er enthaelt bewusst nichts, was seine Anschrift verraet.
//
// Die Produktfotos gehen NICHT mit. Sie sind Datenzeilen von mehreren
// hunderttausend Zeichen; zwei davon sprengen ein Firestore-Dokument. Im
// Bericht steht die Kennung und der persoenliche Satz, das Bild holt sich
// die Seite aus der Produktsammlung.
// NUR FUER UNS heisst: Zustand "vorschau" statt "fertig".
//
// Der Patient sieht dann weiter seine Warteseite - fuer ihn aendert sich
// nichts. Wir sehen denselben Befund unter derselben Adresse, mit
// "?vorschau=1" dahinter. So wird geprueft, was er wirklich zu sehen
// bekommt, und nicht eine Nachbildung davon; und keine Zahl bewegt sich,
// weil die Seite in der Vorschau nichts zaehlt.
export async function gibBerichtFrei(sitzungId, { befund, produkte, preis, schwere, analyse, raport, texte, nurStaff = false }) {
  if (!sitzungId) throw new Error("Bericht ohne Kennung");
  await setDoc(doc(db, "lifeskin", TENANT, "reports", sitzungId), {
    status: nurStaff ? "vorschau" : "fertig",
    befund: String(befund || "").slice(0, 4000),
    produkte: (produkte || []).map((p) => ({
      id: String(p.id),
      satz: String(p.satz || "").slice(0, 400),
      // Was das Mittel tut - eingefroren in dem Wortlaut, in dem es
      // freigegeben wurde.
      //
      // Es steht auch am Produkt, und von dort holt die Seite es, wenn hier
      // nichts liegt. Aber ein Befund, der beim Patienten liegt, darf sich
      // nicht aendern, weil jemand spaeter eine Zeile im Katalog umschreibt.
      // Das ist keine Feinheit - es ist die Nachvollziehbarkeit des Befunds.
      veprimi: (Array.isArray(p.veprimi) ? p.veprimi : [])
        .slice(0, 3).map((x) => String(x || "").slice(0, 90)).filter(Boolean)
    })),
    preis: Number(preis) || 0,
    // Ohne Angabe bleibt das Feld leer, und die Patientenseite laesst
    // Marke und Verlaufskasten weg. Lieber nichts als eine Einordnung,
    // die niemand vorgenommen hat.
    schwere: ["leicht", "mittel", "schwer"].includes(schwere) ? schwere : "",
    // Der Bericht, wie ihn die Patientenseite zeigt. Er entsteht aus
    // demselben JSON wie der Befundbogen und wird hier unveraendert
    // abgelegt - die Seite rechnet nichts nach, sie zeigt nur.
    //
    // GEMESSEN, NICHT GESCHAETZT: Er stand versehentlich IN "analyse".
    // Die Seite liest ihn oben, fand dort nichts und liess Zonen,
    // Messwerte, Diagnose, Erklaerung und Prognose weg - der Patient sah
    // Befundtext und Preis. Er gehoert an diese Stelle, eine Ebene hoeher.
    raport: raport || null,
    // Die eigenen Texte dieser Seite.
    //
    // Nur die geaenderten: Was hier nicht steht, nimmt die Seite aus
    // astra-texte.js. Das ganze Textwerk je Fall zu speichern waere
    // hundertsiebzig Zeichenketten im Dokument - und beim naechsten
    // Feinschliff am Wortlaut stuende in jedem alten Befund die alte
    // Fassung, ohne dass jemand davon wuesste.
    texte: texte && Object.keys(texte).length ? texte : {},
    // Die Messwerte. Sie tragen auf der Patientenseite die Balken - und
    // ein Balken ist das Einzige auf der Seite, das sich nicht wegdiskutieren
    // laesst. Was ohne erkennbare Stufe hereinkommt, behaelt seinen Text und
    // bekommt keinen Balken; erfunden wird hier nichts.
    analyse: {
      iga: Number.isFinite(Number(analyse?.iga)) && analyse?.iga !== null
        ? Math.max(0, Math.min(4, Math.round(Number(analyse.iga))))
        : null,
      // Was aus der Tabelle kam. Leere Felder bleiben leer und fallen auf
      // der Patientenseite ersatzlos weg - eine kuerzere Seite ist immer
      // besser als eine mit erfundenen Zeilen darauf.
      diagnoza: String(analyse?.diagnoza || "").slice(0, 200),
      tipiLekures: String(analyse?.tipiLekures || "").slice(0, 120),
      zonat: String(analyse?.zonat || "").slice(0, 200),
      paTrajtim: String(analyse?.paTrajtim || "").slice(0, 400),
      kurMjek: String(analyse?.kurMjek || "").slice(0, 600),
      keshilla: String(analyse?.keshilla || "").slice(0, 400),
      // Die vier Wochen nur, wenn ALLE vier dastehen. Ein halber Plan waere
      // schlechter als der ganze Standardplan.
      javet: (analyse?.javet || []).length === 4 && (analyse.javet || []).every(Boolean)
        ? analyse.javet.map((x) => String(x).slice(0, 200))
        : [],
      parameter: (analyse?.parameter || []).slice(0, 12).map((p) => ({
        id: String(p.id).slice(0, 40),
        wert: String(p.wert || "").slice(0, 120),
        stufe: Number.isFinite(Number(p.stufe)) && p.stufe !== null
          ? Math.max(0, Math.min(4, Math.round(Number(p.stufe))))
          : null
      }))
    },
    freigabeAt: new Date().toISOString()
  }, { merge: true });
}

// Den Versandstand setzen. Der Patient sieht die Aenderung auf seiner Seite,
// ohne sie neu zu laden.
export async function setzeVersand(sitzungId, { status, lieferVon, lieferBis }) {
  if (!sitzungId) throw new Error("Versand ohne Kennung");
  const daten = { status };
  if (lieferVon) daten.lieferVon = String(lieferVon);
  if (lieferBis) daten.lieferBis = String(lieferBis);
  if (status === "versandt") daten.versandtAt = new Date().toISOString();
  await setDoc(doc(db, "lifeskin", TENANT, "reports", sitzungId), daten, { merge: true });
}

export async function loescheProdukt(id) {
  await deleteDoc(doc(db, "lifeskin", TENANT, "products", id));
}
