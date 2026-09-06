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
  entdopple,
  baueKennzahlen,
  baueHerkunft,
  baueVerteilung,
  baueTagesverlauf,
  normalisiere
} from "./heart-lifeskin-berechnung.js";
import {
  collection,
  doc,
  getDocs,
  getDocsFromCache,
  limit,
  query,
  setDoc,
  deleteDoc,
  writeBatch
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";

const TENANT = "lifeskin";
const SITZUNG_GRENZE = 3000;

async function ladeSammlung(pfad, ausSpeicher) {
  const abfrage = query(collection(db, ...pfad), limit(SITZUNG_GRENZE));
  const schnappschuss = ausSpeicher ? await getDocsFromCache(abfrage) : await getDocs(abfrage);
  return schnappschuss.docs;
}

export { TRICHTER_STUFEN };

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
  const sitzungen = entdopple(roh)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  const produkte = produktDocs.map((d) => ({ id: d.id, ...(d.data() || {}) }));

  // Nach Sitzungskennung abgelegt: Die Einzelansicht schlaegt darin nach,
  // ohne noch einmal zu laden.
  const berichte = {};
  for (const d of berichtDocs) berichte[d.id] = { id: d.id, ...(d.data() || {}) };

  return {
    sitzungen,
    rohAnzahl: roh.length,
    produkte,
    berichte,
    konfig,
    kennzahlen: baueKennzahlen(sitzungen, { setPreis }),
    trichter: baueTrichter(sitzungen),
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
export async function gibBerichtFrei(sitzungId, { befund, produkte, preis, schwere, analyse }) {
  if (!sitzungId) throw new Error("Bericht ohne Kennung");
  await setDoc(doc(db, "lifeskin", TENANT, "reports", sitzungId), {
    status: "fertig",
    befund: String(befund || "").slice(0, 4000),
    produkte: (produkte || []).map((p) => ({
      id: String(p.id),
      satz: String(p.satz || "").slice(0, 400)
    })),
    preis: Number(preis) || 0,
    // Ohne Angabe bleibt das Feld leer, und die Patientenseite laesst
    // Marke und Verlaufskasten weg. Lieber nichts als eine Einordnung,
    // die niemand vorgenommen hat.
    schwere: ["leicht", "mittel", "schwer"].includes(schwere) ? schwere : "",
    // Die Messwerte. Sie tragen auf der Patientenseite die Balken - und
    // ein Balken ist das Einzige auf der Seite, das sich nicht wegdiskutieren
    // laesst. Was ohne erkennbare Stufe hereinkommt, behaelt seinen Text und
    // bekommt keinen Balken; erfunden wird hier nichts.
    analyse: {
      iga: Number.isFinite(Number(analyse?.iga)) && analyse?.iga !== null
        ? Math.max(0, Math.min(4, Math.round(Number(analyse.iga))))
        : null,
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
