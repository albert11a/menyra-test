// DIE BEGLEITUNG IN HEART - Lesen und Schreiben (Auftrag vom 26.09.).
//
// Drei Sammlungen unter lifeskin/<mandant>/ (Regeln: firestore.rules,
// "ndjekja"):
//
//   ndjekja/<zugang>                der Fall, wie der Kunde ihn sieht
//   ndjekja/<zugang>/shenime/tNN    seine Eintraege
//   ndjekja/<zugang>/pergjigjet/*   was das Team ihm schreibt
//   ndjekjaIntern/<kennung>         NUR Heart: Zugang, Verantwortliche,
//                                   Aufgaben, Notizen, "gelesen bis"
//
// DAS INTERNE STEHT NIE IM FALL DES KUNDEN. Eine Notiz, die hier landet,
// kann auf seiner Seite nicht erscheinen - die Seite kennt den Pfad nicht,
// und die Regeln liessen sie auch nicht lesen.
//
// Eine Rueckmeldung ist immer ein Mensch: Heart schreibt nur, was jemand
// im Feld getippt hat, mit Datum und dem Namen, der dabei steht. Aus einer
// gewaehlten Hautreaktion entsteht nie von selbst eine Antwort.

import { db } from "/shared/firebase-config.js";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import { ndjekjaLesen, neuerZugang, istZugang, istDatum } from "../../shared/lifeskin-ndjekja.js";

const TENANT = "lifeskin";
const fallRef = (zugang) => doc(db, "lifeskin", TENANT, "ndjekja", zugang);
const internRef = (kennung) => doc(db, "lifeskin", TENANT, "ndjekjaIntern", kennung);
const sitzungRef = (kennung) => doc(db, "lifeskin", TENANT, "sessions", kennung);
const berichtRef = (kennung) => doc(db, "lifeskin", TENANT, "reports", kennung);

export function internLesen(roh = {}, kennung = "") {
  const d = roh && typeof roh === "object" ? roh : {};
  return {
    kennung: String(kennung || d.kennung || ""),
    zugang: istZugang(d.zugang) ? d.zugang : "",
    pergjegjes: String(d.pergjegjes || ""),
    detyra: String(d.detyra || ""),
    shenimet: (Array.isArray(d.shenimet) ? d.shenimet : [])
      .map((s) => ({ tekst: String(s?.tekst || ""), nga: String(s?.nga || ""), at: String(s?.at || "") }))
      .filter((s) => s.tekst),
    lexuarDeri: String(d.lexuarDeri || ""),
    createdAt: String(d.createdAt || "")
  };
}

// Alle Faelle und alles Interne - klein (nur gekaufte Faelle), einmal.
export async function ladeNdjekja() {
  const [faelle, intern] = await Promise.all([
    getDocs(collection(db, "lifeskin", TENANT, "ndjekja")),
    getDocs(collection(db, "lifeskin", TENANT, "ndjekjaIntern"))
  ]);
  return {
    faelle: faelle.docs.filter((d) => istZugang(d.id)).map((d) => ({ zugang: d.id, ...ndjekjaLesen(d.data()) })),
    intern: Object.fromEntries(intern.docs.map((d) => [d.id, internLesen(d.data(), d.id)]))
  };
}

// Live: Ein neuer Eintrag des Kunden aendert "fundit" am Fall - Heart
// sieht ihn, ohne neu zu laden.
export function horcheNdjekja(beiAenderung) {
  return onSnapshot(collection(db, "lifeskin", TENANT, "ndjekja"), (snap) => {
    beiAenderung(snap.docs.filter((d) => istZugang(d.id)).map((d) => ({ zugang: d.id, ...ndjekjaLesen(d.data()) })));
  }, () => beiAenderung(null));
}

export async function ladeNdjekjaDetail(zugang) {
  if (!istZugang(zugang)) return { eintraege: [], pergjigjet: [] };
  const [eintraege, pergjigjet] = await Promise.all([
    getDocs(collection(fallRef(zugang), "shenime")),
    getDocs(collection(fallRef(zugang), "pergjigjet"))
  ]);
  return {
    eintraege: eintraege.docs.map((d) => {
      const e = d.data() || {};
      return {
        id: d.id, dita: Number(e.dita) || 0, data: String(e.data || ""), perdorimi: String(e.perdorimi || ""),
        ndjesia: Array.isArray(e.ndjesia) ? e.ndjesia.map(String) : [], mesazh: String(e.mesazh || ""),
        createdAt: String(e.createdAt || ""), updatedAt: String(e.updatedAt || "")
      };
    }).sort((a, b) => a.dita - b.dita),
    pergjigjet: pergjigjet.docs.map((d) => {
      const p = d.data() || {};
      return { id: d.id, tekst: String(p.tekst || ""), nga: String(p.nga || ""), lloji: String(p.lloji || ""), dita: Number(p.dita) || 0, createdAt: String(p.createdAt || "") };
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  };
}

// BESTELLUNG BESTAETIGEN UND BEGLEITUNG ANLEGEN - in einem Zug.
//
// Gibt es fuer diese Analyse schon einen Zugang (ndjekjaIntern/<kennung>),
// bleibt es dieser: Zweimal tippen legt keinen zweiten Bereich an. Die
// Bestellung in der Sitzung bekommt "bestaetigt" - daraus zaehlt die
// Auswertung (shared/lifeskin-kaufweg.js).
export async function bestaetigenUndAnlegen({ kennung, code = "", emri = "", jetzt = new Date().toISOString() }) {
  if (!kennung) throw new Error("Bestätigen ohne Kennung");
  return runTransaction(db, async (tx) => {
    const intern = await tx.get(internRef(kennung));
    const sitzung = await tx.get(sitzungRef(kennung));
    if (!sitzung.exists() || !sitzung.data()?.order?.orderId) throw new Error("Zu diesem Fall gibt es keine Bestellung.");
    if (sitzung.data()?.order?.status === "storniert") throw new Error("Die Bestellung ist storniert.");
    let zugang = intern.exists() && istZugang(intern.data()?.zugang) ? intern.data().zugang : "";
    const neu = !zugang;
    if (neu) {
      zugang = neuerZugang();
      tx.set(fallRef(zugang), {
        kennung, code: String(code).slice(0, 24), emri: String(emri).slice(0, 80),
        statusi: "aktiv", porosia: { statusi: "konfirmuar", at: jetzt },
        startAt: "", startVon: "", kontrollet: {}, kontrolliRadhes: "",
        fundit: { dita: 0, at: "", blickAt: "" }, createdAt: jetzt, updatedAt: jetzt
      });
      tx.set(internRef(kennung), { kennung, zugang, pergjegjes: "", detyra: "", shenimet: [], lexuarDeri: "", createdAt: jetzt, updatedAt: jetzt });
    }
    if (sitzung.data()?.order?.status !== "bestaetigt") {
      tx.update(sitzungRef(kennung), { "order.status": "bestaetigt", "order.bestaetigtAt": jetzt, updatedAt: jetzt });
    }
    return { zugang, neu };
  });
}

// Storniert: in der Sitzung (fuer die Auswertung) und am Fall (der Kunde
// sieht "E anuluar" statt einer laufenden Begleitung).
export async function bestellungStornieren({ kennung, zugang = "", jetzt = new Date().toISOString() }) {
  await updateDoc(sitzungRef(kennung), { "order.status": "storniert", "order.storniertAt": jetzt, updatedAt: jetzt });
  if (istZugang(zugang)) await updateDoc(fallRef(zugang), { porosia: { statusi: "anuluar", at: jetzt }, updatedAt: jetzt });
}

// Versand und Zustellung auch im Bereich des Kunden - nur, wenn es einen
// gibt. Die Zustellung bekommt ihren Tag (fuer die Auswertung).
export async function porosiaStatusSetzen(zugang, statusi, jetzt = new Date().toISOString()) {
  if (!istZugang(zugang) || !["konfirmuar", "derguar", "dorezuar"].includes(statusi)) return;
  await updateDoc(fallRef(zugang), { porosia: { statusi, at: jetzt }, updatedAt: jetzt });
}

// Den Start setzen oder korrigieren - vom Team.
export async function startSetzen(zugang, datum, jetzt = new Date().toISOString()) {
  if (!istZugang(zugang) || !istDatum(datum)) throw new Error("Kein gültiges Datum");
  await updateDoc(fallRef(zugang), { startAt: datum, startVon: "ekipi", updatedAt: jetzt });
}

// Eine Rueckmeldung an den Kunden: der Text, wie getippt, mit Absender.
export async function antwortSchreiben(zugang, { tekst, nga, lloji = "pergjigje", dita = 0 }, jetzt = new Date().toISOString()) {
  const text = String(tekst || "").trim();
  if (!istZugang(zugang) || !text) throw new Error("Leere Rückmeldung");
  if (!String(nga || "").trim()) throw new Error("Absender fehlt");
  const ref = doc(collection(fallRef(zugang), "pergjigjet"));
  const daten = { tekst: text.slice(0, 2000), nga: String(nga).trim().slice(0, 80), lloji: lloji === "kontroll" ? "kontroll" : "pergjigje", createdAt: jetzt };
  if (lloji === "kontroll" && dita) daten.dita = Math.round(Number(dita));
  await setDoc(ref, daten);
  return ref.id;
}

// Einen Termin als erledigt markieren - nur von Hand, mit Datum und Name.
// Das eigene Datum fuer "den naechsten" faellt dann weg: Es galt diesem.
export async function kontrolleErledigt(zugang, dita, nga, jetzt = new Date().toISOString()) {
  if (!istZugang(zugang) || !dita) throw new Error("Termin fehlt");
  if (!String(nga || "").trim()) throw new Error("Wer hat kontrolliert?");
  await updateDoc(fallRef(zugang), {
    [`kontrollet.${Math.round(Number(dita))}`]: { statusi: "kryer", at: jetzt, nga: String(nga).trim().slice(0, 80) },
    kontrolliRadhes: "",
    updatedAt: jetzt
  });
}

export async function naechsterTermin(zugang, datum, jetzt = new Date().toISOString()) {
  if (!istZugang(zugang) || (datum && !istDatum(datum))) throw new Error("Kein gültiges Datum");
  await updateDoc(fallRef(zugang), { kontrolliRadhes: datum || "", updatedAt: jetzt });
}

export async function betreuungAbschliessen(zugang, jetzt = new Date().toISOString()) {
  await updateDoc(fallRef(zugang), { statusi: "perfunduar", updatedAt: jetzt });
}

export async function betreuungWiederOeffnen(zugang, jetzt = new Date().toISOString()) {
  await updateDoc(fallRef(zugang), { statusi: "aktiv", updatedAt: jetzt });
}

// Intern: Verantwortliche und Aufgaben; Notizen werden angehaengt.
export async function internSpeichern(kennung, { pergjegjes, detyra }, jetzt = new Date().toISOString()) {
  await setDoc(internRef(kennung), {
    pergjegjes: String(pergjegjes || "").slice(0, 80), detyra: String(detyra || "").slice(0, 1000), updatedAt: jetzt
  }, { merge: true });
}

export async function internNotiz(kennung, tekst, nga, jetzt = new Date().toISOString()) {
  const text = String(tekst || "").trim();
  if (!text) throw new Error("Leere Notiz");
  await setDoc(internRef(kennung), {
    shenimet: arrayUnion({ tekst: text.slice(0, 1000), nga: String(nga || "").slice(0, 80), at: jetzt }), updatedAt: jetzt
  }, { merge: true });
}

export async function gelesenBis(kennung, iso = new Date().toISOString()) {
  await setDoc(internRef(kennung), { lexuarDeri: iso, updatedAt: iso }, { merge: true });
}

// EINE BESTELLUNG PER WHATSAPP EINTRAGEN - an DENSELBEN Fall, und nur,
// wenn dort noch keine steht. So zaehlt sie genau einmal: in der Sitzung
// (Heart, Auswertung) und im Bericht (der Kunde sieht "bestellt").
export async function whatsappBestellung({ kennung, preis, name = "", strasse = "", ort = "", jetzt = new Date().toISOString() }) {
  return runTransaction(db, async (tx) => {
    const sitzung = await tx.get(sitzungRef(kennung));
    const bericht = await tx.get(berichtRef(kennung));
    if (!sitzung.exists() || !bericht.exists()) throw new Error("Fall nicht gefunden.");
    if (sitzung.data()?.order?.orderId) throw new Error("Für diesen Fall ist schon eine Bestellung eingetragen.");
    const status = String(bericht.data()?.status || "");
    if (!["fertig"].includes(status)) throw new Error(`Der Befund steht auf „${status || "?"}“ - nur freigegebene Fälle.`);
    const code = String(sitzung.data()?.code || bericht.data()?.code || kennung);
    const address = { quelle: "whatsapp" };
    if (name) address.name = String(name).slice(0, 100);
    if (strasse) address.strasse = String(strasse).slice(0, 150);
    if (ort) address.ort = String(ort).slice(0, 100);
    tx.update(sitzungRef(kennung), {
      order: { createdAt: jetzt, total: Number(preis) || 0, payment: "nachnahme", status: "neu", orderId: code, quelle: "whatsapp" },
      address: { ...(sitzung.data()?.address || {}), ...address },
      updatedAt: jetzt
    });
    tx.update(berichtRef(kennung), { status: "bestellt", bestelltAt: jetzt });
    return { code };
  });
}

export async function ladeIntern(kennung) {
  const snap = await getDoc(internRef(kennung));
  return snap.exists() ? internLesen(snap.data(), kennung) : null;
}
