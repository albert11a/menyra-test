// /dergesat - DER VERSAND UEBER POSTA BEKI (Auftrag Inhaber 05.10.).
//
// Wer hier arbeitet:
//   Riba     - Benutzer "kadrija". Sieht die Bestellungen, tippt "Gati",
//              "Te Beki", dann "Pranuar" oder "Anuluar" - und bei einer
//              Anuluar, die zurueckkommt, "E kthyem në depo" (06.10.).
//   Inhaber  - mit seinem Heart-Zugang (E-Mail). Dazu: Barazuar, Riba
//              ausbezahlt, einen Schritt zuruecknehmen, Ribas Zugang anlegen.
//              Sieht in der Karte "Ndepo" auch Shishet/Stikerat/Kremet aus
//              den Produktkosten (die darf nur das CEO-Konto lesen).
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
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import {
  CHIPS_DERGESAT, DERGESA, STATUS_CHIPS, austriDok, dergesaLesen, euroSq, fillimiPeriudhes, fundiDites, hyrja, kthimNeDepo, levizjeDok,
  levizjeLesen, llogaritFinancen, mbylljeDok, ndryshimi, netoPasRibes, periudhat, shumaLexo, KTHIMI,
  arsyejaPaGatshme, lidhGatshme, hiqGatshme, produkteNeDergesa
} from "/shared/lifeskin-dergesat.js";
import { eFleteValide, gatshmePer, kohaSq, renderChips, renderDetajet, renderKartat, renderListe } from "./dergesat-pamja.js";

const TENANT = "lifeskin";
const dergesaRef = (kennung) => doc(db, "lifeskin", TENANT, "dergesat", kennung);
const zugangRef = () => doc(db, "lifeskin", TENANT, "dergesatZugang", "riba");
// Shishet, Stikerat, Kremet - dieselbe Ablage wie Heart, Produktkosten
// (apps/mnyra-heart/heart-lifeskin-kosten.js, KOSTEN_DOK). Nur CEO.
const lendaRef = () => doc(db, "landingArchive", "lifeskin__produktkosten");
// Ueberweisungen nach Oesterreich und eigene Eintraege (08.10.).
const financaRef = () => collection(db, "lifeskin", TENANT, "dergesatFinanca");
const CHIP_KYC = "dergesat.chip";

const $ = (id) => document.getElementById(id);

const gjendja = {
  perdoruesi: null,
  roli: "",
  liste: [],
  chip: (() => { try { return globalThis.localStorage?.getItem(CHIP_KYC) || "porosi"; } catch { return "porosi"; } })(),
  laeuft: "",
  lidhja: "pritje",
  ribaGati: null,
  // Die offene Liste einer Karte oben ("" = keine).
  karta: "",
  lenda: null,
  levizjet: [],
  // Haekchen in den Listen Financa / Pare n'Kosovë.
  zgjedhur: new Set()
};
if (!CHIPS_DERGESAT.some((c) => c.id === gjendja.chip)) gjendja.chip = "porosi";

let ndalLive = null;
let ndalLenda = null;
let ndalFinanca = null;

// Die Punkte unter den Karten: welche gerade im Bild ist.
function punktet() {
  const kartat = $("dg-kartat");
  const ku = $("dg-punktet");
  if (!kartat || !ku) return;
  const sa = kartat.children.length;
  if (ku.childElementCount !== sa) ku.innerHTML = "<span></span>".repeat(sa);
  const hap = kartat.children[1] ? kartat.children[1].offsetLeft - kartat.children[0].offsetLeft : 1;
  const aktiv = Math.min(sa - 1, Math.max(0, Math.round(kartat.scrollLeft / Math.max(1, hap))));
  [...ku.children].forEach((p, i) => p.classList.toggle("aktiv", i === aktiv));
  ku.hidden = sa < 2;
}

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
  // Nur Riba und der Inhaber sehen die Liste - "asnje" (kein Zugang) nicht.
  const brenda = Boolean(gjendja.perdoruesi) && (gjendja.roli === "riba" || gjendja.roli === "heart");
  shfaq("dg-hyrja", !gjendja.perdoruesi);
  shfaq("dg-pa-qasje", Boolean(gjendja.perdoruesi) && gjendja.roli === "asnje");
  shfaq("dg-faqja", brenda);
  shfaq("dg-dil", Boolean(gjendja.perdoruesi));
  shfaq("dg-periudha", Boolean(gjendja.perdoruesi) && (gjendja.roli === "riba" || gjendja.roli === "heart") && gjendja.lidhja === "ok");
  shfaq("dg-ngarkim", Boolean(gjendja.perdoruesi) && !gjendja.roli);
  if (!brenda) {
    $("dg-kush").textContent = "";
    gjendja.karta = "";
    vizatoFleten();
    return;
  }

  $("dg-kush").textContent = gjendja.roli === "riba" ? "Riba" : "Pronari";
  // Der Kalender oben: seit wann die laufende Periode laeuft.
  const prej = fillimiPeriudhes(gjendja.levizjet);
  const periudha = $("dg-periudha-tekst");
  if (periudha) periudha.textContent = prej ? `Nga ${kohaSq(prej).split(" ")[0]}` : "Periudha";
  $("dg-chips").innerHTML = renderChips(gjendja.liste, gjendja.chip, prej);
  const lista = $("dg-lista");
  if (gjendja.lidhja === "gabim") {
    lista.innerHTML = `<p class="dg-bosh">Nuk ka lidhje. Kontrolloni internetin dhe rifreskoni faqen.</p>`;
  } else if (gjendja.lidhja === "pritje") {
    lista.innerHTML = `<p class="dg-bosh">Po ngarkohen porositë…</p>`;
  } else {
    lista.innerHTML = renderListe(gjendja.liste, gjendja.chip, gjendja.roli, gjendja.laeuft, prej);
  }
  // Die Karten wischt man seitlich - beim Neuzeichnen (jede Live-Aenderung)
  // bleibt die Stelle, an der man gerade ist.
  const kartat = $("dg-kartat");
  const stelle = kartat.scrollLeft;
  kartat.innerHTML = gjendja.lidhja === "ok" ? renderKartat(gjendja.liste, gjendja.roli, gjendja.laeuft, gjendja.lenda, { levizjet: gjendja.levizjet }) : "";
  kartat.scrollLeft = stelle;
  punktet();
  vizatoFleten();

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

// Die Liste einer Karte (06.10.). Beim Neuzeichnen (Live) bleibt die
// Stelle, an der man in der Liste gerade ist.
function vizatoFleten() {
  const fleta = $("dg-flete");
  if (!fleta) return;
  const hapur = Boolean(gjendja.karta) && gjendja.lidhja === "ok";
  if (!hapur) {
    if (!fleta.hidden) {
      fleta.hidden = true;
      fleta.innerHTML = "";
      document.documentElement.classList.remove("dg-pa-levizje");
    }
    return;
  }
  const trupi = fleta.querySelector(".dg-flete__trupi");
  const stelle = trupi ? trupi.scrollTop : 0;
  const ishte = !fleta.hidden;
  // Was in den Feldern getippt ist, bleibt beim Neuzeichnen stehen.
  const ruajtur = Object.fromEntries([...fleta.querySelectorAll("[data-ruaj]")].map((el) => [el.dataset.ruaj, el.value]));
  const fokus = document.activeElement?.dataset?.ruaj || "";
  fleta.innerHTML = renderDetajet(gjendja.karta, gjendja.liste, gjendja.roli, gjendja.laeuft, gjendja.lenda,
    { levizjet: gjendja.levizjet, zgjedhur: gjendja.zgjedhur });
  for (const el of fleta.querySelectorAll("[data-ruaj]")) if (ruajtur[el.dataset.ruaj]) el.value = ruajtur[el.dataset.ruaj];
  if (fokus) fleta.querySelector(`[data-ruaj="${fokus}"]`)?.focus({ preventScroll: true });
  fleta.hidden = false;
  document.documentElement.classList.add("dg-pa-levizje");
  const iRi = fleta.querySelector(".dg-flete__trupi");
  if (iRi) iRi.scrollTop = stelle;
  if (!ishte) fleta.querySelector(".dg-flete__mbyll")?.focus({ preventScroll: true });
}

function mbyllFleten() {
  if (!gjendja.karta) return;
  const nga = gjendja.karta;
  gjendja.karta = "";
  gjendja.zgjedhur = new Set();
  vizatoFleten();
  document.querySelector(`[data-karta="${nga}"]`)?.focus?.({ preventScroll: true });
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

// Financa: Riba liest mit (Wunsch Inhaber 08.10.), schreiben nur Heart.
function nisFinancen() {
  ndalFinanca?.();
  ndalFinanca = onSnapshot(financaRef(), (snap) => {
    gjendja.levizjet = snap.docs.map((d) => levizjeLesen(d.data() || {}, d.id)).filter(Boolean);
    vizato();
  }, () => {
    gjendja.levizjet = [];
    vizato();
  });
}

function ndalo() {
  ndalLive?.();
  ndalLive = null;
  ndalFinanca?.();
  ndalFinanca = null;
  gjendja.levizjet = [];
  gjendja.zgjedhur = new Set();
  ndalLenda?.();
  ndalLenda = null;
  gjendja.liste = [];
  gjendja.lenda = null;
}

// Nur fuer den Inhaber: die Zahlen aus den Produktkosten fuer "Ndepo".
function nisLenden() {
  ndalLenda?.();
  ndalLenda = onSnapshot(lendaRef(), (snap) => {
    gjendja.lenda = snap.exists() ? (snap.data() || {}) : null;
    vizato();
  }, () => {
    gjendja.lenda = null;
    vizato();
  });
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
  if (roli === "riba" || roli === "heart") { nisLive(); nisFinancen(); }
  if (roli === "heart") nisLenden();
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
async function kthePerDepo(kennung) {
  const roli = gjendja.roli === "heart" ? "heart" : "riba";
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(dergesaRef(kennung));
    if (!snap.exists()) throw new Error("Kjo porosi nuk ekziston më.");
    const felder = kthimNeDepo(dergesaLesen(snap.data() || {}, kennung), { roli });
    if (!felder) throw new Error("Kjo porosi është tashmë në depo.");
    tx.update(dergesaRef(kennung), felder);
  });
}

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

// FERTIGE PRODUKTE VERWENDEN (08.10., nur Inhaber): beide Dokumente in
// einem Vorgang - die Bestellung bekommt ngaGatshme, die Anuluar perdorurAt.
async function gatshmeLidh(kennung, gKennung) {
  return runTransaction(db, async (tx) => {
    const [s1, s2] = await Promise.all([tx.get(dergesaRef(kennung)), tx.get(dergesaRef(gKennung))]);
    if (!s1.exists() || !s2.exists()) throw new Error("Porosia nuk ekziston më.");
    const d = dergesaLesen(s1.data() || {}, kennung);
    const g = dergesaLesen(s2.data() || {}, gKennung);
    const arsye = arsyejaPaGatshme(d, g);
    if (arsye) throw new Error(arsye);
    const f = lidhGatshme(d, g);
    tx.update(dergesaRef(kennung), f.porosia);
    tx.update(dergesaRef(gKennung), f.gatshme);
  });
}

async function gatshmeHiq(kennung) {
  return runTransaction(db, async (tx) => {
    const s1 = await tx.get(dergesaRef(kennung));
    if (!s1.exists()) throw new Error("Porosia nuk ekziston më.");
    const d = dergesaLesen(s1.data() || {}, kennung);
    const f = hiqGatshme(d);
    if (!f) throw new Error("Kjo porosi nuk është me produkte të gatshme.");
    const s2 = await tx.get(dergesaRef(d.ngaGatshme));
    tx.update(dergesaRef(kennung), f.porosia);
    if (s2.exists()) tx.update(dergesaRef(d.ngaGatshme), f.gatshme);
  });
}

const pershkrimGatshme = (g) => `${produkteNeDergesa(g.produkte).map((p) => `${p.sasia}× ${p.emri}`).join(" + ")}${g.postaBeki ? ` · anuluar (Posta Beki ${g.postaBeki})` : ""}`;

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

  if (veprimi === "hap-karten") {
    gjendja.karta = eFleteValide(el.dataset.karta) ? el.dataset.karta : "";
    gjendja.zgjedhur = new Set();
    vizatoFleten();
    return;
  }
  if (veprimi === "mbyll-karten") {
    mbyllFleten();
    return;
  }
  if (veprimi === "chip") {
    gjendja.chip = el.dataset.chip || "porosi";
    try { globalThis.localStorage?.setItem(CHIP_KYC, gjendja.chip); } catch { /* egal */ }
    vizato();
    return;
  }
  if (veprimi === "gati") {
    bej(celes, () => hapi(kennung, "gati"), `Gati: ${d?.postaBeki || ""} – tani te „Gati“.`);
    return;
  }
  if (veprimi === "kthe-depo") {
    if (!globalThis.confirm?.(`E kthyem në depo ${d?.postaBeki ? `(Posta Beki ${d.postaBeki})` : ""}?`)) return;
    bej(celes, () => kthePerDepo(kennung), "Në depo ✓");
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
  if (veprimi === "nga-gatshme") {
    const kandidatet = d ? gatshmePer(d, gjendja.liste) : [];
    if (!kandidatet.length) { mesazh("Nuk ka produkte të gatshme që i përshtaten kësaj porosie.", "gabim"); return; }
    let g = kandidatet[0];
    if (kandidatet.length > 1) {
      const zgjedhja = globalThis.prompt?.(`Cilat produkte të gatshme u përdorën?\n${kandidatet.map((x, i) => `${i + 1}) ${pershkrimGatshme(x)}`).join("\n")}\n\nShkruani numrin:`, "1");
      const n = Number(zgjedhja);
      if (!Number.isInteger(n) || n < 1 || n > kandidatet.length) return;
      g = kandidatet[n - 1];
    } else if (!globalThis.confirm?.(`Posta Beki ${d.postaBeki || ""} u paketua me produkte të gatshme?\n${pershkrimGatshme(g)}\n\nKëto dalin nga „Produkte të gatshme“ dhe për to nuk del shishe, stiker apo krem i ri.`)) return;
    bej(celes, () => gatshmeLidh(kennung, g.kennung), "Me produkte të gatshme ✓");
    return;
  }
  if (veprimi === "hiq-gatshme") {
    if (!globalThis.confirm?.("Ta heq lidhjen me produktet e gatshme? Ato kthehen te „Produkte të gatshme“.")) return;
    bej(celes, () => gatshmeHiq(kennung), "U hoq.");
    return;
  }
  if (veprimi === "barazo") {
    if (!d || !globalThis.confirm?.(`Barazuar: ${d.postaBeki} · ${euroSq(Math.max(0, d.cmimi - DERGESA.postaTarifa))}?`)) return;
    bej(celes, () => shenoTeGjitha([kennung], "barazuarAt", (x) => x.statusi === "pranuar" && !x.barazuarAt), "Barazuar ✓");
    return;
  }
  if (veprimi === "zgjidh") {
    if (gjendja.zgjedhur.has(kennung)) gjendja.zgjedhur.delete(kennung); else gjendja.zgjedhur.add(kennung);
    vizatoFleten();
    return;
  }
  if (veprimi === "zgjidh-te-gjitha") {
    const fin = llogaritFinancen(gjendja.liste, gjendja.levizjet);
    const lista = el.dataset.grupi === "kosova" ? fin.kosova.paDerguar.lista : fin.financa.paBarazuar.lista;
    const tegjitha = lista.every((x) => gjendja.zgjedhur.has(x.kennung));
    for (const x of lista) { if (tegjitha) gjendja.zgjedhur.delete(x.kennung); else gjendja.zgjedhur.add(x.kennung); }
    vizatoFleten();
    return;
  }
  if (veprimi === "barazo-zgjedhur") {
    const lista = llogaritFinancen(gjendja.liste, gjendja.levizjet).financa.paBarazuar.lista.filter((x) => gjendja.zgjedhur.has(x.kennung));
    const shuma = lista.reduce((s, x) => s + Math.max(0, x.cmimi - DERGESA.postaTarifa), 0);
    if (!lista.length || !globalThis.confirm?.(`Barazo: ${lista.length} porosi · ${euroSq(shuma)}?`)) return;
    bej("barazo-zgjedhur:", async () => {
      await shenoTeGjitha(lista.map((x) => x.kennung), "barazuarAt", (x) => x.statusi === "pranuar" && !x.barazuarAt);
      gjendja.zgjedhur = new Set();
    }, "Barazuar ✓ – tani te Pare n'Kosovë");
    return;
  }
  if (veprimi === "fshi-levizje") {
    const id = el.dataset.id || "";
    const l = gjendja.levizjet.find((x) => x.id === id);
    if (!l || !globalThis.confirm?.(`Ta fshij „${l.arsyeja || "lëvizjen"}“?`)) return;
    bej(`fshi:${id}`, () => deleteDoc(doc(financaRef(), id)), "U fshi.");
    return;
  }
  if (veprimi === "hap-periudhen") {
    const m = periudhat(gjendja.levizjet).at(-1);
    if (!m || m.id !== el.dataset.id || !globalThis.confirm?.(`Ta hap përsëri periudhën ${m.prej ? kohaSq(m.prej) : "Fillimi"} – ${kohaSq(m.deri)}?`)) return;
    bej(`hap-periudhen:${m.id}`, () => deleteDoc(doc(financaRef(), m.id)), "Periudha u hap përsëri.");
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

// Die Liste wird waehrend des Speicherns neu gezeichnet - geleert werden
// darum die Felder, die jetzt dastehen, nicht die von vorher.
function pastroFushat(parashtese) {
  for (const el of document.querySelectorAll(`#dg-flete [data-ruaj^="${parashtese}"]`)) el.value = "";
}

// Die zwei Formulare in den Listen (nur Inhaber): eigener Eintrag und
// Ueberweisung nach Oesterreich.
document.addEventListener("submit", (ngjarja) => {
  const forma = ngjarja.target?.closest?.("[data-forma]");
  if (!forma) return;
  ngjarja.preventDefault();
  if (gjendja.roli !== "heart" || gjendja.laeuft) return;
  if (forma.dataset.forma === "levizje") {
    const shuma = shumaLexo(forma.elements.shuma.value, { negativ: true });
    const dok = levizjeDok({ shuma, arsyeja: forma.elements.arsyeja.value });
    if (!dok) { mesazh("Shkruani shumën (p.sh. −20 ose 50) dhe arsyen.", "gabim"); return; }
    bej("levizje:", async () => { await addDoc(financaRef(), dok); pastroFushat("levizje-"); }, `${dok.shuma < 0 ? "Hequr" : "Shtuar"}: ${euroSq(Math.abs(dok.shuma))}`);
    return;
  }
  if (forma.dataset.forma === "mbyllje") {
    const prej = fillimiPeriudhes(gjendja.levizjet);
    const dita = forma.elements.deri.value;
    const jetzt = new Date().toISOString();
    const deri = dita === new Date().toLocaleDateString("sv-SE") ? jetzt : fundiDites(dita);
    const dok = mbylljeDok({ prej, deri, jetzt });
    if (!dok) { mesazh("Zgjidhni një datë pas fillimit të periudhës dhe jo në të ardhmen.", "gabim"); return; }
    if (!globalThis.confirm?.(`Mbyll periudhën ${prej ? kohaSq(prej) : "nga fillimi"} – ${kohaSq(dok.deri)}? Kartat nisin pastaj nga 0.`)) return;
    bej("mbyllje:", () => addDoc(financaRef(), dok), "Periudha u mbyll ✓");
    return;
  }
  if (forma.dataset.forma === "austri") {
    const lista = llogaritFinancen(gjendja.liste, gjendja.levizjet).kosova.paDerguar.lista.filter((x) => gjendja.zgjedhur.has(x.kennung));
    const propozim = lista.reduce((s, x) => s + netoPasRibes(x), 0);
    const bruto = forma.elements.bruto.value.trim() ? shumaLexo(forma.elements.bruto.value) : propozim;
    const wu = forma.elements.wu.value.trim() ? shumaLexo(forma.elements.wu.value) : 0;
    const dok = austriDok({ kennungen: lista.map((x) => x.kennung), bruto, wu });
    if (!dok) { mesazh("Zgjidhni barazimet dhe shkruani shumën dhe tarifën e WU.", "gabim"); return; }
    if (!globalThis.confirm?.(`Dërgo në Austri: ${euroSq(dok.bruto)} − ${euroSq(dok.wu)} WU = ${euroSq(dok.bruto - dok.wu)}?`)) return;
    bej("austri:", async () => {
      await addDoc(financaRef(), dok);
      gjendja.zgjedhur = new Set();
      pastroFushat("austri-");
    }, "Dërguar në Austri ✓");
  }
});

$("dg-kartat")?.addEventListener("scroll", () => punktet(), { passive: true });

// Tastatur: Karte mit Enter/Leertaste oeffnen, Liste mit Escape schliessen.
document.addEventListener("keydown", (ngjarja) => {
  if (ngjarja.key === "Escape" && gjendja.karta) { mbyllFleten(); return; }
  const karta = ngjarja.target?.closest?.("[data-veprim=hap-karten]");
  if (karta && ngjarja.target === karta && (ngjarja.key === "Enter" || ngjarja.key === " ")) {
    ngjarja.preventDefault();
    karta.click();
  }
});

vizato();
