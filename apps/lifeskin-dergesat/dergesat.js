// /dergesat - DER VERSAND UEBER POSTA BEKI (Auftrag Inhaber 05.10.).
//
// Wer hier arbeitet:
//   Riba     - Benutzer "kadrija". Sieht die Bestellungen, tippt "Te Beki",
//              dann "Pranuar" oder "Anuluar".
//   Inhaber  - mit seinem Heart-Zugang (E-Mail). Dazu: Barazuar, Riba
//              ausbezahlt, einen Schritt zuruecknehmen, Ribas Zugang anlegen.
//
// Was eine Bestellung hierher bringt: Posta Beki in Heart (Akte, Karte
// "Bestellung"). Was hier getippt wird, sieht Heart live; Heart zieht
// Therapieseite, Begleitung und Storno nach (heart-lifeskin-dergesat.js).
// Regeln: firestore.rules ("dergesat"), Rechnung: shared/lifeskin-dergesat.js.
// Kein Pixel, keine Messung - das ist eine Arbeitsliste.

import { app, auth, db, connectLocalFirebaseEmulators } from "/shared/firebase-config.js";
import { getApps, initializeApp } from "/shared/vendor/firebase/11.0.0/firebase-app.js";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from "/shared/vendor/firebase/11.0.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import { DERGESA, STATUS_CHIPS, dergesaLesen, euroSq, hyrja, llogarit, ndryshimi, KTHIMI } from "/shared/lifeskin-dergesat.js";
import { renderChips, renderKartat, renderListe } from "./dergesat-pamja.js";

const TENANT = "lifeskin";
const dergesaRef = (kennung) => doc(db, "lifeskin", TENANT, "dergesat", kennung);
const zugangRef = () => doc(db, "lifeskin", TENANT, "dergesatZugang", "riba");
const CHIP_KYC = "dergesat.chip";

const $ = (id) => document.getElementById(id);

const gjendja = {
  perdoruesi: null,
  roli: "",
  liste: [],
  chip: (() => { try { return globalThis.localStorage?.getItem(CHIP_KYC) || "porosi"; } catch { return "porosi"; } })(),
  laeuft: "",
  lidhja: "pritje",
  ribaGati: null
};
if (!STATUS_CHIPS.some((c) => c.id === gjendja.chip)) gjendja.chip = "porosi";

let ndalLive = null;

function shfaq(id, po) {
  const el = $(id);
  if (el) el.hidden = !po;
}

function mesazh(tekst, lloji = "") {
  const el = $("dg-mesazh");
  if (!el) return;
  el.textContent = tekst || "";
  el.dataset.lloji = lloji;
  el.hidden = !tekst;
  clearTimeout(mesazh.koha);
  if (tekst) mesazh.koha = setTimeout(() => { el.hidden = true; }, lloji === "gabim" ? 6000 : 3000);
}

function vizato() {
  const brenda = Boolean(gjendja.perdoruesi && gjendja.roli);
  shfaq("dg-hyrja", !gjendja.perdoruesi);
  shfaq("dg-pa-qasje", Boolean(gjendja.perdoruesi) && gjendja.roli === "asnje");
  shfaq("dg-faqja", brenda);
  shfaq("dg-dil", Boolean(gjendja.perdoruesi));
  shfaq("dg-ngarkim", Boolean(gjendja.perdoruesi) && !gjendja.roli);
  if (!brenda) {
    $("dg-kush").textContent = "";
    return;
  }

  $("dg-kush").textContent = gjendja.roli === "riba" ? "Riba" : "Pronari";
  $("dg-chips").innerHTML = renderChips(gjendja.liste, gjendja.chip);
  const lista = $("dg-lista");
  if (gjendja.lidhja === "gabim") {
    lista.innerHTML = `<p class="dg-bosh">Nuk ka lidhje. Kontrolloni internetin dhe rifreskoni faqen.</p>`;
  } else if (gjendja.lidhja === "pritje") {
    lista.innerHTML = `<p class="dg-bosh">Po ngarkohen porositë…</p>`;
  } else {
    lista.innerHTML = renderListe(gjendja.liste, gjendja.chip, gjendja.roli, gjendja.laeuft);
  }
  $("dg-kartat").innerHTML = gjendja.lidhja === "ok" ? renderKartat(gjendja.liste, gjendja.roli, gjendja.laeuft) : "";

  // Ribas Zugang - nur fuer den Inhaber, ausserhalb des Neuzeichnens (das
  // getippte Passwort bleibt stehen).
  shfaq("dg-riba", gjendja.roli === "heart");
  const statusi = $("dg-riba-statusi");
  if (statusi) {
    statusi.textContent = gjendja.ribaGati === null ? "Po kontrollohet…"
      : gjendja.ribaGati ? `Gati – Riba hyn me përdoruesin „${DERGESA.ribaPerdoruesi}“.`
        : `Ende pa hyrje. Shkruani fjalëkalimin për „${DERGESA.ribaPerdoruesi}“ dhe ruajeni.`;
  }
}

// ── Wer bin ich? ────────────────────────────────────────────────────────
// Ribas Eintrag (dergesatZugang/riba) darf nur Riba selbst und der Inhaber
// lesen (firestore.rules). Steht darin die eigene uid: Riba. Laesst er sich
// lesen, ohne dass es die eigene ist (oder es gibt ihn noch nicht): Inhaber.
// Abgewiesen: kein Zugang.
async function roliPer(perdoruesi) {
  try {
    const snap = await getDoc(zugangRef());
    if (snap.exists() && snap.data()?.uid === perdoruesi.uid) return { roli: "riba", ribaGati: true };
    return { roli: "heart", ribaGati: snap.exists() && Boolean(snap.data()?.uid) };
  } catch {
    return { roli: "asnje", ribaGati: null };
  }
}

function nisLive() {
  ndalLive?.();
  gjendja.lidhja = "pritje";
  ndalLive = onSnapshot(collection(db, "lifeskin", TENANT, "dergesat"), (snap) => {
    gjendja.liste = snap.docs.map((d) => dergesaLesen(d.data() || {}, d.id));
    gjendja.lidhja = "ok";
    vizato();
  }, () => {
    gjendja.lidhja = "gabim";
    vizato();
  });
}

function ndalo() {
  ndalLive?.();
  ndalLive = null;
  gjendja.liste = [];
}

// DIESELBE ABLAGE WIE HEART (heart-auth.js): Heart legt die Anmeldung
// bei jedem Start in browserLocalPersistence. Lag sie hier im Standard
// (IndexedDB), zog Heart sie beim naechsten Laden um - und /dergesat im
// selben Browser war ploetzlich abgemeldet.
await setPersistence(auth, browserLocalPersistence).catch(() => {});

onAuthStateChanged(auth, async (perdoruesi) => {
  gjendja.perdoruesi = perdoruesi || null;
  gjendja.roli = "";
  ndalo();
  vizato();
  if (!perdoruesi) return;
  const { roli, ribaGati } = await roliPer(perdoruesi);
  if (gjendja.perdoruesi !== perdoruesi) return;
  gjendja.roli = roli;
  gjendja.ribaGati = ribaGati;
  if (roli === "riba" || roli === "heart") nisLive();
  vizato();
});

// ── Anmelden / Abmelden ─────────────────────────────────────────────────
$("dg-forma")?.addEventListener("submit", async (ngjarja) => {
  ngjarja.preventDefault();
  const forma = ngjarja.currentTarget;
  const h = hyrja(forma.elements.perdoruesi.value, forma.elements.fjalekalimi.value);
  const gabim = $("dg-gabim");
  gabim.hidden = true;
  if (!h || !forma.elements.fjalekalimi.value) {
    gabim.textContent = "Shkruani përdoruesin dhe fjalëkalimin.";
    gabim.hidden = false;
    return;
  }
  const butoni = forma.querySelector("button[type=submit]");
  butoni.disabled = true;
  butoni.textContent = "Po hyn…";
  try {
    await signInWithEmailAndPassword(auth, h.email, h.password);
    forma.reset();
  } catch (e) {
    gabim.textContent = e?.code === "auth/network-request-failed"
      ? "Nuk ka lidhje. Provoni përsëri."
      : e?.code === "auth/too-many-requests"
        ? "Shumë përpjekje. Prisni pak dhe provoni përsëri."
        : "Përdoruesi ose fjalëkalimi nuk është i saktë.";
    gabim.hidden = false;
  } finally {
    butoni.disabled = false;
    butoni.textContent = "Hyr";
  }
});

$("dg-dil")?.addEventListener("click", () => signOut(auth).catch(() => {}));
$("dg-pa-qasje-dil")?.addEventListener("click", () => signOut(auth).catch(() => {}));

// ── Ein Schritt ─────────────────────────────────────────────────────────
// Im Vorgang gelesen: Hat jemand anderes inzwischen etwas getippt, gilt
// dessen Stand, und der Schritt wird mit dem frischen Stand geprueft.
async function hapi(kennung, ne) {
  const roli = gjendja.roli === "heart" ? "heart" : "riba";
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(dergesaRef(kennung));
    if (!snap.exists()) throw new Error("Kjo porosi nuk ekziston më.");
    const felder = ndryshimi(dergesaLesen(snap.data() || {}, kennung), ne, { roli });
    if (!felder) throw new Error("Ky hap nuk lejohet më – faqja u përditësua.");
    tx.update(dergesaRef(kennung), felder);
  });
}

// Barazuar / Riba ausbezahlt: alle gewaehlten auf einmal, mit DEMSELBEN
// Zeitpunkt - daran erkennt die Karte darunter eine Abrechnung.
async function shenoTeGjitha(kennungen, fusha, kontrollo) {
  const jetzt = new Date().toISOString();
  for (let i = 0; i < kennungen.length; i += 400) {
    const pjesa = kennungen.slice(i, i + 400);
    await runTransaction(db, async (tx) => {
      const snaps = await Promise.all(pjesa.map((k) => tx.get(dergesaRef(k))));
      snaps.forEach((snap, j) => {
        if (!snap.exists()) return;
        const d = dergesaLesen(snap.data() || {}, pjesa[j]);
        if (!kontrollo(d)) return;
        tx.update(dergesaRef(pjesa[j]), { [fusha]: jetzt, updatedAt: jetzt, nga: "heart" });
      });
    });
  }
}

async function bej(celes, puna, mesazhOk) {
  if (gjendja.laeuft) return;
  gjendja.laeuft = celes;
  vizato();
  try {
    await puna();
    if (mesazhOk) mesazh(mesazhOk, "mire");
  } catch (e) {
    mesazh(e?.message && !/permission|Missing or insufficient/i.test(e.message) ? e.message : "Nuk u ruajt. Provoni përsëri.", "gabim");
  } finally {
    gjendja.laeuft = "";
    vizato();
  }
}

document.addEventListener("click", (ngjarja) => {
  const el = ngjarja.target?.closest?.("[data-veprim]");
  if (!el || el.disabled) return;
  const veprimi = el.dataset.veprim;
  const kennung = el.dataset.kennung || "";
  const d = gjendja.liste.find((x) => x.kennung === kennung) || null;
  const celes = `${veprimi}:${kennung}`;

  if (veprimi === "chip") {
    gjendja.chip = el.dataset.chip || "porosi";
    try { globalThis.localStorage?.setItem(CHIP_KYC, gjendja.chip); } catch { /* egal */ }
    vizato();
    return;
  }
  if (veprimi === "derguar") {
    bej(celes, () => hapi(kennung, "derguar"), `Te Beki: ${d?.postaBeki || ""} – tani te „Dërguar“.`);
    return;
  }
  if (veprimi === "pranuar") {
    bej(celes, () => hapi(kennung, "pranuar"), "Pranuar ✓");
    return;
  }
  if (veprimi === "anuluar") {
    if (!globalThis.confirm?.(`Ta anuloj porosinë ${d?.postaBeki ? `(Posta Beki ${d.postaBeki})` : ""}?`)) return;
    bej(celes, () => hapi(kennung, "anuluar"), "Anuluar.");
    return;
  }
  if (gjendja.roli !== "heart") return;

  if (veprimi === "kthe") {
    const prapa = KTHIMI[d?.statusi];
    if (!prapa || !globalThis.confirm?.(`Ta kthej mbrapa te „${(STATUS_CHIPS.find((c) => c.id === prapa) || {}).label}“?`)) return;
    bej(celes, () => hapi(kennung, prapa), "U kthye.");
    return;
  }
  if (veprimi === "barazo") {
    if (!d || !globalThis.confirm?.(`Barazuar: ${d.postaBeki} · ${euroSq(Math.max(0, d.cmimi - DERGESA.postaTarifa))}?`)) return;
    bej(celes, () => shenoTeGjitha([kennung], "barazuarAt", (x) => x.statusi === "pranuar" && !x.barazuarAt), "Barazuar ✓");
    return;
  }
  if (veprimi === "barazo-te-gjitha") {
    const gati = llogarit(gjendja.liste).pritjeBarazim.gati;
    if (!gati.numri || !globalThis.confirm?.(`Barazuar: ${gati.numri} porosi · ${euroSq(gati.shuma)}?`)) return;
    bej(celes, () => shenoTeGjitha(gati.kennungen, "barazuarAt", (x) => x.statusi === "pranuar" && !x.barazuarAt), "Barazuar ✓");
    return;
  }
  if (veprimi === "paguaj-riben") {
    const per = llogarit(gjendja.liste).perRiba;
    if (!per.numri || !globalThis.confirm?.(`Riba paguar: ${per.numri} porosi · ${euroSq(per.shuma)}?`)) return;
    bej(celes, () => shenoTeGjitha(per.kennungen, "ribaPaguarAt", (x) => x.statusi === "pranuar" && !x.ribaPaguarAt), "Riba paguar ✓");
  }
});

// ── Ribas Zugang anlegen (nur Inhaber) ─────────────────────────────────
// Ueber eine ZWEITE Firebase-App, damit der Inhaber dabei angemeldet
// bleibt. Gibt es das Konto schon, muss das Passwort dazu passen - dann
// wird nur die uid eingetragen.
function authDyte() {
  const emri = "dergesat-riba";
  const dyta = getApps().find((a) => a.name === emri) || initializeApp(app.options, emri);
  const a = getAuth(dyta);
  connectLocalFirebaseEmulators({ authInstance: a });
  return a;
}

$("dg-riba-forma")?.addEventListener("submit", async (ngjarja) => {
  ngjarja.preventDefault();
  if (gjendja.roli !== "heart") return;
  const forma = ngjarja.currentTarget;
  const fjalekalimi = String(forma.elements.fjalekalimi.value || "");
  if (fjalekalimi.length < 4) { mesazh("Fjalëkalimi: të paktën 4 shenja.", "gabim"); return; }
  const h = hyrja(DERGESA.ribaPerdoruesi, fjalekalimi);
  const butoni = forma.querySelector("button[type=submit]");
  butoni.disabled = true;
  try {
    const a = authDyte();
    let uid = "";
    try {
      uid = (await createUserWithEmailAndPassword(a, h.email, h.password)).user.uid;
    } catch (e) {
      if (e?.code !== "auth/email-already-in-use") throw e;
      try {
        uid = (await signInWithEmailAndPassword(a, h.email, h.password)).user.uid;
      } catch {
        throw new Error("Llogaria e Ribës ekziston me fjalëkalim tjetër. Shkruani fjalëkalimin e saj të vjetër.");
      }
    }
    await signOut(a).catch(() => {});
    await setDoc(zugangRef(), { uid, perdoruesi: DERGESA.ribaPerdoruesi, updatedAt: new Date().toISOString() });
    gjendja.ribaGati = true;
    forma.reset();
    mesazh(`Gati – Riba hyn me „${DERGESA.ribaPerdoruesi}“ dhe këtë fjalëkalim.`, "mire");
  } catch (e) {
    mesazh(e?.message || "Nuk u ruajt.", "gabim");
  } finally {
    butoni.disabled = false;
    vizato();
  }
});

vizato();
