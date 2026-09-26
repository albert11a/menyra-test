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
  getDoc,
  getDocs,
  getDocsFromCache,
  documentId,
  startAfter,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  deleteDoc,
  where,
  writeBatch
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import { LIVE_FENSTER_MS, ohnePfad } from "./heart-lifeskin-live.js";
import { mediumNormalisieren } from "../../shared/lifeskin-medien.js";

const TENANT = "lifeskin";
const SITZUNG_GRENZE = 3000;

async function ladeSammlung(pfad, ausSpeicher) {
  const docs = [];
  let zuletzt;
  do {
    const abfrage = query(collection(db, ...pfad), orderBy(documentId()),
      ...(zuletzt ? [startAfter(zuletzt)] : []), limit(SITZUNG_GRENZE));
    const snapshot = ausSpeicher ? await getDocsFromCache(abfrage) : await getDocs(abfrage);
    docs.push(...snapshot.docs);
    if (snapshot.docs.length < SITZUNG_GRENZE) break;
    zuletzt = snapshot.docs.at(-1);
  } while (zuletzt);
  return docs;
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
  let abmelden;
  let generation = 0;
  // Unveraenderte Sitzungen kommen als DASSELBE Objekt zurueck - auch nach
  // dem Neuaufsetzen der Abfrage alle drei Minuten. Daran erkennt Heart,
  // dass ihre Zeile nicht neu gezeichnet werden muss.
  const bekannt = new Map();
  const alsSitzung = (d, roh) => {
    const alt = bekannt.get(d.id);
    if (alt && alt.roh === roh) return alt.sitzung;
    const sitzung = normalisiere(d.id, d.data());
    bekannt.set(d.id, { roh, sitzung });
    return sitzung;
  };
  const starten = () => {
    const lauf = ++generation;
    abmelden?.();
    const seit = new Date(Date.now() - fensterMs).toISOString();
    const abfrage = query(
      collection(db, "lifeskin", TENANT, "sessions"),
      where("updatedAt", ">=", seit), orderBy("updatedAt", "desc")
    );
    // Nur weitergeben, wenn sich mehr als der Klickpfad geaendert hat.
    // Der Pfad wird alle paar Sekunden je Besucher geschrieben; jedes Mal
    // alles neu zu rechnen und zu zeichnen, legte Heart lahm.
    let zuletzt = "";
    abmelden = onSnapshot(abfrage, (snapshot) => {
      if (lauf !== generation) return;
      const roh = snapshot.docs.map((d) => JSON.stringify(ohnePfad(d.data())));
      const stand = snapshot.docs.map((d, i) => `${d.id}:${roh[i]}`).join("\n");
      if (stand === zuletzt) return;
      zuletzt = stand;
      const sitzungen = snapshot.docs.map((d, i) => alsSitzung(d, roh[i]));
      // Nur behalten, was noch im Fenster steht - sonst waechst die Mappe
      // ueber den Tag.
      const jetztDa = new Set(snapshot.docs.map((d) => d.id));
      for (const id of bekannt.keys()) if (!jetztDa.has(id)) bekannt.delete(id);
      beiAenderung(sitzungen);
    }, (fehler) => {
      globalThis.console?.warn?.("[heart] Live-Ansicht nicht verfuegbar:", fehler?.message);
      if (lauf === generation) beiAenderung(null);
    });
  };
  starten();
  // Keep the listener bounded by time, without silently dropping person 301.
  const timer = globalThis.setInterval(starten, LIVE_FENSTER_MS);
  return () => { generation += 1; abmelden?.(); globalThis.clearInterval(timer); };
}

// NUR DAS NACHHOLEN, WAS SICH SEIT DEM LETZTEN LADEN GEAENDERT HAT.
//
// Der Knopf "Aktualisieren" lud jedes Mal ALLE Sitzungen, Berichte,
// Produkte und Medien - bei ein paar tausend Sitzungen auf dem Telefon
// zwanzig Sekunden und mehr (gemessen am 25.09., lauf-heart.mjs). Jeder
// Schreibvorgang des Trichters und der Befundseite setzt updatedAt; was
// seit dem letzten Laden geschrieben wurde, steht damit in einer kleinen
// Abfrage. Berichte tragen kein updatedAt und sind klein: sie kommen ganz.
//
// Gibt es mehr Aenderungen, als eine Abfrage liefert, ist das kein
// Nachholen mehr - dann gibt es null, und der Aufrufer laedt alles.
export async function ladeLifeskinSeit(seit) {
  const [sitzungsDocs, berichtDocs] = await Promise.all([
    getDocs(query(collection(db, "lifeskin", TENANT, "sessions"),
      where("updatedAt", ">=", String(seit || "")), orderBy("updatedAt", "desc"), limit(SITZUNG_GRENZE))),
    ladeSammlung(["lifeskin", TENANT, "reports"], false)
  ]);
  if (sitzungsDocs.docs.length >= SITZUNG_GRENZE) return null;
  const berichte = {};
  for (const d of berichtDocs) berichte[d.id] = { id: d.id, ...(d.data() || {}) };
  return {
    sitzungen: sitzungsDocs.docs.map((d) => normalisiere(d.id, d.data())),
    berichte
  };
}

export async function ladeLifeskin({ ausSpeicher = false } = {}) {
  const [sitzungsDocs, produktDocs, konfigDocs, berichtDocs, medienDocs] = await Promise.all([
    ladeSammlung(["lifeskin", TENANT, "sessions"], ausSpeicher),
    ladeSammlung(["lifeskin", TENANT, "products"], ausSpeicher),
    // Die Konfiguration, wegen des Setpreises. Der offene Betrag in den
    // Kacheln haengt daran, und eine feste Zahl im Code war schon einmal
    // um zehn Euro daneben, ohne dass es jemand gemerkt hat.
    ladeSammlung(["lifeskin", TENANT, "config"], ausSpeicher).catch(() => []),
    // Die Berichte. Klein genug, um sie mit der Liste zu holen: In ihnen
    // stehen Befundtext, Produktkennungen und Zustand - keine Bilder.
    ladeSammlung(["lifeskin", TENANT, "reports"], ausSpeicher),
    // Die Kundenfotos und -videos: nur Verweise und Zaehler, winzig.
    ladeSammlung(["lifeskin", TENANT, "medien"], ausSpeicher).catch(() => [])
  ]);

  // DIE BILDER DER LANDINGPAGE BLEIBEN DRAUSSEN.
  //
  // Sie liegen als eigene Dokumente in derselben Sammlung (siehe
  // LANDING_FOTOT_PRAEFIX weiter unten) - und wuerden hier sonst in die
  // Konfiguration eingeruehrt: Der Setpreis stuende dann neben einer
  // Liste aus Datenzeilen von mehreren hunderttausend Zeichen.
  //
  // Geladen werden sie einzeln, wenn ein Produkt geoeffnet wird
  // (ladeLandingFotot). Alle auf einmal waeren mehrere Megabyte bei jedem
  // Oeffnen dieses Bereichs, fuer Bilder, die niemand gerade ansieht.
  // Dasselbe fuer die Vorher/Nachher-Faelle: Die Liste kommt als eigenes
  // Feld zurueck, ihre Bilder werden erst geladen, wenn jemand die Karte
  // aufklappt.
  const rasteDok = konfigDocs.find((d) => d.id === RASTE_DOK_ID)?.data() || null;
  const konfig = konfigDocs
    .filter((d) => !String(d.id).startsWith(LANDING_FOTOT_PRAEFIX) && !String(d.id).startsWith(ANALYSE_FOTOT_PRAEFIX))
    .filter((d) => d.id !== RASTE_DOK_ID && !String(d.id).startsWith(RASTI_BILD_ID))
    .reduce((zusammen, d) => ({ ...zusammen, ...(d.data() || {}) }), {});
  const setPreis = Number.isFinite(Number(konfig.setPreis)) && Number(konfig.setPreis) > 0
    ? Number(konfig.setPreis)
    : undefined;

  const roh = sitzungsDocs.map((d) => normalisiere(d.id, d.data()));
  // KEIN FALL GEHT VERLOREN, NUR WEIL SEINE SITZUNG FEHLT.
  //
  // Die Liste entsteht aus den Sitzungen. Der Bericht wird aber getrennt
  // angelegt (eigene Regel) - scheitert die Sitzung, steht der Bericht da,
  // und ohne diese Zeilen saehe ihn in Heart niemand: ein Mensch wartet
  // auf seine Analyse, und sie ist nirgends zu finden. Er steht deshalb
  // als Fall "nur Bericht" in der Liste.
  const mitSitzung = new Set(roh.map((s) => s.id));
  for (const d of berichtDocs) {
    if (mitSitzung.has(d.id)) continue;
    const b = d.data() || {};
    if (!b.createdAt && !b.code) continue;
    roh.push({ ...normalisiere(d.id, {
      createdAt: b.createdAt || "", updatedAt: b.createdAt || "", code: b.code || "", name: b.name || "",
      sprache: b.sprache || "sq", typ: b.typ || "", step: "result", warteseiteGeoeffnet: true,
      ...(b.bestelltAt ? { bestelltAt: b.bestelltAt } : {})
    }), nurBericht: true });
  }
  const berichtZeiten = new Map(berichtDocs.map((d) => [d.id, d.data()?.bestelltAt]));
  for (const sitzung of roh) sitzung.bestelltAt ||= berichtZeiten.get(sitzung.id) || "";
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
    // null: in Heart noch nie gespeichert - es gelten die Standardfaelle.
    raste: Array.isArray(rasteDok?.lista) ? rasteDok.lista : null,
    // Leer: noch nie gespeichert - es gelten die vier Standardfotos.
    medien: medienDocs.map((d) => mediumNormalisieren(d.data() || {}, d.id)),
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
// ZUERST VOM GERAET. Eine Aufnahme aendert sich nach dem Hochladen nie
// mehr, und seit 20.09. wiegt eine bis zu 900 KB - ein Scan mit sieben
// Blicken sind mehrere Megabyte. Firestore haelt sie nach dem ersten
// Oeffnen im Speicher des Geraets; von dort sind sie sofort da. Zum Server
// geht es nur, wenn dort weniger liegen, als der Fall Blicke hat.
function bilderAus(docs) {
  const bilder = {};
  for (const d of docs.docs) {
    const daten = d.data() || {};
    if (typeof daten.jpeg === "string" && daten.jpeg.startsWith("data:image/")) {
      bilder[d.id] = { jpeg: daten.jpeg, breite: daten.breite || 0, hoehe: daten.hoehe || 0 };
    }
  }
  return bilder;
}

export async function ladeFotos(sitzungId, erwartet = 0) {
  if (!sitzungId) return {};
  const sammlung = collection(db, "lifeskin", TENANT, "sessions", sitzungId, "photos");
  if (erwartet > 0) {
    try {
      const vomGeraet = bilderAus(await getDocsFromCache(sammlung));
      if (Object.keys(vomGeraet).length >= erwartet) return vomGeraet;
    } catch { /* kein Speicher auf dem Geraet - dann vom Server */ }
  }
  return bilderAus(await getDocs(sammlung));
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
  const abfrage = query(
    collection(db, "lifeskin", TENANT, "sessions", sitzungId, "photos"),
    limit(1)
  );
  // Zuerst vom Geraet (siehe ladeFotos), dann vom Server.
  let docs = null;
  try { docs = await getDocsFromCache(abfrage); } catch { docs = null; }
  if (!docs || !docs.docs.length) docs = await getDocs(abfrage);
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

// ══ DIE BILDER DER LANDINGPAGE ══════════════════════════════════════
//
// Je Produkt ein Dokument, und es liegt in "config" - nicht in einer
// eigenen Sammlung. Der Grund steht in firestore.rules: Dort erlaubt
// match /config/{documentId} genau das, was gebraucht wird (lesen darf
// jeder, schreiben nur das CEO-Konto). Eine neue Sammlung haette eine
// neue Regel gebraucht, und eine Regel, die nicht ausgespielt ist, ist
// eine Seite, die nicht funktioniert.
//
// JE PRODUKT EIN DOKUMENT und nicht eines fuer alle: Ein Firestore-
// Dokument darf 1 MiB. Sechs Bilder zu je 180 KB passen je Produkt
// bequem; alle Produkte zusammen in einem Dokument waeren es nicht.
//
// Der Praefix steht hier einmal. shop.js auf der Landingpage kennt
// denselben Wert (FOTO_PRAEFIX), und tests/lifeskin-landing-shop.test.mjs
// haelt beide zusammen.
export const LANDING_FOTOT_PRAEFIX = "landingFotot-";
export const LANDING_FOTOT_MAX = 6;

// DIE BILDER DER ANALYSESEITE (/terapia/<kennung>): dasselbe noch
// einmal, als eigenes Dokument je Produkt. Ohne eigene Bilder zeigt die
// Analyseseite die der Landingpage.
//
// DAS FELD HEISST "bilder" UND NICHT "fotot" - mit Absicht: Die
// Landingpage liest die ganze Sammlung "config" und fordert dabei nur
// das Feld "fotot" an (shop.js). So laedt sie die Bilder der
// Analyseseite nicht mit. apps/lifeskin-verkauf/terapia.js kennt beide
// Werte, tests/heart-lifeskin-analysefotot.test.mjs haelt sie zusammen.
export const ANALYSE_FOTOT_PRAEFIX = "analyseFotot-";
export const ANALYSE_FOTOT_FELD = "bilder";

const FOTOT_ABLAGE = {
  landing: { praefix: LANDING_FOTOT_PRAEFIX, feld: "fotot" },
  analyse: { praefix: ANALYSE_FOTOT_PRAEFIX, feld: ANALYSE_FOTOT_FELD }
};

export async function ladeLandingFotot(produktId, art = "landing") {
  if (!produktId) return [];
  const ablage = FOTOT_ABLAGE[art] || FOTOT_ABLAGE.landing;
  const schnapp = await getDoc(
    doc(db, "lifeskin", TENANT, "config", `${ablage.praefix}${produktId}`)
  );
  const liste = schnapp.exists() ? schnapp.data()?.[ablage.feld] : null;
  return Array.isArray(liste)
    ? liste.filter((f) => typeof f === "string" && f.startsWith("data:image/"))
    : [];
}

export async function speichereLandingFotot(produktId, fotot, art = "landing") {
  if (!produktId) throw new Error("Produkt ohne Kennung");
  const ablage = FOTOT_ABLAGE[art] || FOTOT_ABLAGE.landing;
  const sauber = (Array.isArray(fotot) ? fotot : [])
    .filter((f) => typeof f === "string" && f.startsWith("data:image/"))
    .slice(0, LANDING_FOTOT_MAX);
  await setDoc(
    doc(db, "lifeskin", TENANT, "config", `${ablage.praefix}${produktId}`),
    { [ablage.feld]: sauber, updatedAt: new Date().toISOString() }
  );
  return sauber;
}

// ══ DIE VORHER/NACHHER-FAELLE ═══════════════════════════════════════
//
// Aufbau und Gruende in shared/lifeskin-raste.js. Hier nur das Schreiben:
// die Liste als ein Dokument, die zwei Bilder je Fall als eigenes.
// Dieselben Kennungen stehen dort als RASTE_DOK und RASTI_BILD_PRAEFIX;
// tests/lifeskin-raste.test.mjs haelt beide zusammen.
export const RASTE_DOK_ID = "raste";
export const RASTI_BILD_ID = "rasti-";

export async function speichereRaste(lista) {
  await setDoc(doc(db, "lifeskin", TENANT, "config", RASTE_DOK_ID),
    { lista: Array.isArray(lista) ? lista : [], ndryshuarAt: new Date().toISOString() });
}

export async function ladeRastiBilder(id) {
  if (!id) return null;
  const schnapp = await getDoc(doc(db, "lifeskin", TENANT, "config", `${RASTI_BILD_ID}${id}`));
  if (!schnapp.exists()) return null;
  const d = schnapp.data() || {};
  const gut = (w) => (typeof w === "string" && w.startsWith("data:image/") ? w : "");
  return { para: gut(d.para), pas: gut(d.pas) };
}

export async function speichereRastiBilder(id, { para, pas }) {
  if (!id) throw new Error("Fall ohne Kennung");
  await setDoc(doc(db, "lifeskin", TENANT, "config", `${RASTI_BILD_ID}${id}`),
    { para: String(para || ""), pas: String(pas || ""), updatedAt: new Date().toISOString() });
}

export async function loescheRastiBilder(id) {
  if (!id) return;
  await deleteDoc(doc(db, "lifeskin", TENANT, "config", `${RASTI_BILD_ID}${id}`));
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
// Einen einzelnen Bericht nachlesen - nach dem Freigeben, Markieren oder
// Versenden. Vorher lud Heart danach ALLES neu (Sitzungen, Berichte,
// Produkte, Medien): bei ein paar tausend Sitzungen Sekunden, in denen die
// Seite stand und danach sprang.
export async function ladeBericht(sitzungId) {
  const kennung = String(sitzungId || "").trim();
  if (!kennung) return null;
  const schnappschuss = await getDoc(doc(db, "lifeskin", TENANT, "reports", kennung));
  return schnappschuss.exists() ? { id: schnappschuss.id, ...(schnappschuss.data() || {}) } : null;
}

export async function gibBerichtFrei(sitzungId, { befund, produkte, preis, schwere, analyse, raport, texte, ohneBild = false, raste = [], klientet = [], nurStaff = false, bereit = false }) {
  if (!sitzungId) throw new Error("Bericht ohne Kennung");
  await setDoc(doc(db, "lifeskin", TENANT, "reports", sitzungId), {
    status: nurStaff || bereit ? "vorschau" : "fertig",
    // BEREIT: gespeichert wie eine Vorschau (der Patient sieht weiter seine
    // Warteseite), aber als fertig vorbereitet markiert - die Fallliste
    // zeigt im Fach Offen den Chip "Bereit". Beim Freigeben faellt die
    // Marke weg, der Bericht ist dann "fertig".
    bereit: bereit === true,
    befund: String(befund || "").slice(0, 4000),
    produkte: (produkte || []).map((p) => ({
      id: String(p.id),
      satz: String(p.satz || "").slice(0, 400),
      zweck: String(p.zweck || "").slice(0, 120),
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
    // Ohne Bild analysiert (nach seiner Beschreibung) - die Therapieseite
    // spricht dann von dem, was er erzaehlt hat.
    ohneBild: ohneBild === true,
    // Welche Vorher/Nachher-Faelle die Seite zeigt, in dieser Reihenfolge.
    raste: (Array.isArray(raste) ? raste : []).map((x) => String(x || "").slice(0, 40)).filter(Boolean).slice(0, 12),
    // Die Kundenbilder ("Nga klientët tanë"), die Heart gewaehlt hat.
    // Leer: Die Seite zeigt den Abschnitt nicht.
    klientet: (Array.isArray(klientet) ? klientet : []).map((x) => String(x || "").slice(0, 40)).filter(Boolean).slice(0, 12),
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
  // Wann zugestellt wurde - fuer die Auswertung je Gruppe (Zeitraum).
  if (status === "zugestellt") daten.zugestelltAt = new Date().toISOString();
  await setDoc(doc(db, "lifeskin", TENANT, "reports", sitzungId), daten, { merge: true });
}

export async function loescheProdukt(id) {
  await deleteDoc(doc(db, "lifeskin", TENANT, "products", id));
}

// ── KUNDENFOTOS UND -VIDEOS ("Nga klientët tanë") ──────────────────────
//
// Die Dateien liegen im Media-CDN (Upload: heart-crm-admin-write-adapter.js),
// hier nur die Eintraege lifeskin/{tenant}/medien/{id} und ihre Kommentare.
// Aufbau: shared/lifeskin-medien.js.

const medienSammlung = () => collection(db, "lifeskin", TENANT, "medien");

export async function ladeMedien() {
  const snapshot = await getDocs(medienSammlung());
  return snapshot.docs.map((d) => mediumNormalisieren(d.data() || {}, d.id));
}

// Mehrere auf einmal (Anlegen der Standardfotos, neue Reihenfolge) - alles
// oder nichts.
export async function speichereMedien(liste = []) {
  const stapel = writeBatch(db);
  for (const roh of liste) {
    const m = mediumNormalisieren(roh);
    if (!m.id) continue;
    const { id, ...felder } = m;
    // Die Views zaehlt die Seite - Heart ueberschreibt sie nie.
    delete felder.views;
    stapel.set(doc(medienSammlung(), id), felder, { merge: true });
  }
  await stapel.commit();
}

export async function speichereMedium(roh) {
  await speichereMedien([roh]);
}

// Mit allen Kommentaren - Firestore loescht Untersammlungen nicht mit.
export async function loescheMedium(id) {
  const kennung = String(id || "").trim();
  if (!kennung) return;
  const kommentare = await getDocs(collection(db, "lifeskin", TENANT, "medien", kennung, "kommentare"));
  const stapel = writeBatch(db);
  for (const k of kommentare.docs) stapel.delete(k.ref);
  stapel.delete(doc(medienSammlung(), kennung));
  await stapel.commit();
}

// Alle Kommentare (auch verborgene) je Medium, neueste oben.
export async function ladeKommentare(ids = []) {
  const paare = await Promise.all(ids.map(async (id) => {
    try {
      const snapshot = await getDocs(collection(db, "lifeskin", TENANT, "medien", id, "kommentare"));
      const liste = snapshot.docs.map((d) => {
        const k = d.data() || {};
        return {
          id: d.id,
          medium: id,
          name: String(k.name || "").slice(0, 40),
          text: String(k.text || "").slice(0, 500),
          createdAt: String(k.createdAt || ""),
          verborgen: k.verborgen === true
        };
      }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return [id, liste];
    } catch {
      return [id, []];
    }
  }));
  return Object.fromEntries(paare);
}

export async function setzeKommentarVerborgen(medium, kommentar, verborgen) {
  await setDoc(doc(db, "lifeskin", TENANT, "medien", medium, "kommentare", kommentar),
    { verborgen: verborgen === true }, { merge: true });
}

export async function loescheKommentar(medium, kommentar) {
  await deleteDoc(doc(db, "lifeskin", TENANT, "medien", medium, "kommentare", kommentar));
}
