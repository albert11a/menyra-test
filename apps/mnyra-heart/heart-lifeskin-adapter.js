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
  deleteDoc
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
  const [sitzungsDocs, produktDocs] = await Promise.all([
    ladeSammlung(["lifeskin", TENANT, "sessions"], ausSpeicher),
    ladeSammlung(["lifeskin", TENANT, "products"], ausSpeicher)
  ]);

  const roh = sitzungsDocs.map((d) => normalisiere(d.id, d.data()));
  const sitzungen = entdopple(roh)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  const produkte = produktDocs.map((d) => ({ id: d.id, ...(d.data() || {}) }));

  return {
    sitzungen,
    rohAnzahl: roh.length,
    produkte,
    kennzahlen: baueKennzahlen(sitzungen),
    trichter: baueTrichter(sitzungen),
    herkunft: baueHerkunft(sitzungen),
    verteilung: baueVerteilung(sitzungen),
    verlauf: baueTagesverlauf(sitzungen)
  };
}

// Ein Produkt anlegen oder aendern. Der einzige Schreibweg dieses Moduls.
export async function speichereProdukt(produkt) {
  const { id, ...felder } = produkt;
  if (!id) throw new Error("Produkt ohne Kennung");
  await setDoc(doc(db, "lifeskin", TENANT, "products", id), felder, { merge: true });
}

export async function loescheProdukt(id) {
  await deleteDoc(doc(db, "lifeskin", TENANT, "products", id));
}
