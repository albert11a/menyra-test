/* global scrollTo, innerHeight */
// DIE BEGLEITUNG VON A BIS Z - mit Testdaten, im Telefon-Browser, gegen den
// lokalen Emulator mit den ECHTEN Regeln (Auftrag vom 26.09.).
//
//   Therapieseite (?ndjekja=1) -> Angebot, Begleitung, Garantie -> Kasse
//   -> Bestellung -> Heart bestaetigt und legt die Begleitung an -> Link
//   -> Kundenbereich: Start, Eintrag, Fehler ohne Netz, Korrektur
//   -> Heart sieht die Rueckmeldung, antwortet, hakt den Termin ab
//   -> der Kunde sieht die Antwort; ein fremder Link sieht nichts.
//
// NICHTS GEHT AN DIE ECHTE DATENBANK: Die Seiten sprechen Firestore ueber
// REST an firestore.googleapis.com - jede solche Anfrage wird hier auf den
// Emulator umgeschrieben (Projekt mnyra-local). Alles andere bei Google,
// der Meta-Pixel und die Meldefunktion werden abgewiesen.
//
//   node node_modules/firebase-tools/lib/bin/firebase.js emulators:start --only firestore,auth --project mnyra-local
//   npm run emulators:seed
//   node scripts/local-dev-server.mjs
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node tests/lifeskin-trichter-pruefstand/lauf-ndjekja.mjs
//
// Bilder: test-results/lifeskin-trichter/ndjekja/*.png (Telefongroesse).

import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { STANDARD_PRODUKTE } from "../../apps/lifeskin/lifeskin-catalog.js";

const BASIS = process.env.BASIS || "http://127.0.0.1:5173";
const EMU = process.env.FIRESTORE_EMULATOR_HOST || "";
if (!/^(127\.0\.0\.1|localhost):\d+$/.test(EMU)) {
  throw new Error("Nur gegen den lokalen Emulator: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 setzen.");
}
const AUS = new URL(`../../test-results/lifeskin-trichter/ndjekja${process.env.GERAET ? `-${process.env.GERAET}` : ""}`, import.meta.url).pathname;
mkdirSync(AUS, { recursive: true });
if (!getApps().length) initializeApp({ projectId: "mnyra-local" });
const db = getFirestore();
const WURZEL = db.collection("lifeskin").doc("lifeskin");

const NUR = String(process.env.NUR || "").split(",").filter(Boolean);
// Telefone: Standard iPhone 12-15 (390x844, Instagram), "se" = kleines
// iPhone (375x667, Safari), "android" = kleines Android (360x740, Facebook).
const GERAET = {
  android: { viewport: { width: 360, height: 740 }, userAgent: "Mozilla/5.0 (Linux; Android 13; SM-A135F Build/TP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0.0;]" },
  se: { viewport: { width: 375, height: 667 }, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" }
}[process.env.GERAET] || { viewport: { width: 390, height: 844 }, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0" };

let bestanden = 0;
const fehlerListe = [];
function pruefe(bedingung, text) {
  if (bedingung) { bestanden += 1; console.log(`  ✓ ${text}`); } else { fehlerListe.push(text); console.log(`  ✗ ${text}`); }
}

// ---------------------------------------------------------------------------
// Testdaten
// ---------------------------------------------------------------------------

const hex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
export const KENNUNG = process.env.KENNUNG || hex(16);
const CODE = `LS-T${KENNUNG.slice(0, 4).toUpperCase()}`;

export async function testfallAnlegen(kennung = KENNUNG, { numri = true } = {}) {
  const jetzt = new Date();
  const gestern = new Date(jetzt.getTime() - 26 * 3600 * 1000).toISOString();
  for (const id of ["lf-acne", "lf-moistur"]) {
    const p = STANDARD_PRODUKTE.find((x) => x.id === id);
    await WURZEL.collection("products").doc(id).set(JSON.parse(JSON.stringify(p)));
  }
  await WURZEL.collection("sessions").doc(kennung).set({
    createdAt: gestern, updatedAt: gestern, step: "result", sprache: "sq", name: "Arta", code: CODE,
    typ: "foto", paSkanim: true, photos: ["zona"], phone: "+383 44 123 456", phoneConsent: true,
    device: { os: "ios", app: "instagram", gesehen: true }, source: { utmSource: "ig", utmCampaign: "pruefstand" },
    warteseiteGeoeffnet: true, timings: {}
  });
  await WURZEL.collection("reports").doc(kennung).set({
    createdAt: gestern, code: CODE, name: "Arta", sprache: "sq", status: "fertig", typ: "foto", photos: 1,
    ...(numri ? { numri: true } : {}),
    preis: 39,
    freigabeAt: new Date(jetzt.getTime() - 3600 * 1000).toISOString(),
    produkte: [
      { id: "lf-acne", satz: "Për puçrrat aktive në mollëza." },
      { id: "lf-moistur", satz: "Mban lëkurën të qetë gjatë terapisë." }
    ],
    raport: {
      schemaVersion: 3, aerztlichGeprueft: true,
      gjetjaKryesore: "Puçrra aktive në mollëza dhe në ballë",
      gjetjaDyta: "Skuqje e lehtë rreth puçrrave",
      gjetjet: "Në foto shihen puçrra aktive dhe skuqje e lehtë rreth tyre, më shumë në mollëza.",
      diagnoza: "Akne e përzier",
      synimi28: "Më pak puçrra të reja dhe skuqje më e qetë.",
      fotot: 1, zonat: 2,
      shitja: {
        hyrja: "Për **puçrrat aktive në mollëza** dhe **skuqjen rreth tyre** — dy produkte, një plan i qartë dhe Dr. Gashi pranë jush çdo javë.",
        problemet: [
          { gjetja: "Puçrra aktive", ku: "në mollëza dhe në ballë", produkt_id: "lf-acne", zgjidhja: "LF ACNE ul bakterin dhe hap poret e bllokuara." },
          { gjetja: "Skuqje e lehtë", ku: "rreth puçrrave", produkt_id: "lf-moistur", zgjidhja: "LF MOISTUR qetëson dhe mbron barrierën." }
        ],
        produktet: [
          { produkt_id: "lf-acne", per_ju: ["Vepron mbi puçrrat aktive", "Ul skuqjen rreth tyre"] },
          { produkt_id: "lf-moistur", per_ju: ["Mban lëkurën të hidratuar", "E bën terapinë më të lehtë për lëkurën"] }
        ],
        dita_28: "Më pak puçrra të reja dhe skuqje më e qetë.",
        whatsapp: "Analiza juaj është gati."
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Browser
// ---------------------------------------------------------------------------

const PROD = "https://firestore.googleapis.com/v1/projects/menyra-c0e68/";
const LOKAL = `http://${EMU}/v1/projects/mnyra-local/`;

export async function browserStarten() {
  const browser = await chromium.launch({ executablePath: process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium" });
  const kontext = await browser.newContext({
    ...GERAET, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: "block", locale: "sq-AL"
  });
  const zaehler = { firestore: 0, schreiben: [] };
  // Firestore (REST) -> Emulator. Alles andere bei Google und Meta: nein.
  await kontext.route((url) => url.hostname === "firestore.googleapis.com", async (route) => {
    const anfrage = route.request();
    const url = anfrage.url().replace(PROD, LOKAL);
    if (!url.startsWith(LOKAL)) return route.abort();
    // "Kein Netz": route.fetch laeuft ausserhalb des Browsers und wuerde
    // die Offline-Emulation umgehen - also hier abweisen.
    if (zaehler.netzWeg) return route.abort("internetdisconnected");
    zaehler.firestore += 1;
    const methode = anfrage.method();
    let koerper = anfrage.postData();
    if (koerper) koerper = koerper.replaceAll("projects/menyra-c0e68/", "projects/mnyra-local/");
    if (methode !== "GET" && methode !== "OPTIONS") zaehler.schreiben.push({ methode, url: url.slice(LOKAL.length), koerper });
    try {
      const antwort = await route.fetch({ url, method: methode, headers: anfrage.headers(), postData: koerper ?? undefined });
      await route.fulfill({ response: antwort, headers: { ...antwort.headers(), "access-control-allow-origin": "*" } });
    } catch {
      await route.abort();
    }
  });
  await kontext.route((url) => /(^|\.)googleapis\.com$/.test(url.hostname) && url.hostname !== "firestore.googleapis.com", (r) => r.abort());
  await kontext.route((url) => /facebook\.(net|com)$|cloudfunctions\.net$|run\.app$/.test(url.hostname), (r) => r.abort());
  return { browser, kontext, zaehler };
}

export function seiteBeobachten(seite, name) {
  const fehler = [];
  seite.on("pageerror", (e) => fehler.push(`${name}: ${String(e.message).slice(0, 240)}`));
  seite.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR/.test(m.text())) fehler.push(`${name} console: ${m.text().slice(0, 240)}`); });
  return fehler;
}

export const bild = async (seite, name, optionen = {}) => {
  await seite.screenshot({ path: `${AUS}/${name}.png`, ...optionen }).catch((e) => console.log(`  (Bild ${name}: ${e.message})`));
};

async function lies(pfad) {
  const s = await db.doc(pfad).get();
  return s.exists ? s.data() : null;
}

// ---------------------------------------------------------------------------
// A. Die Therapieseite in der neuen Fassung, bis zur Bestellung
// ---------------------------------------------------------------------------

export async function therapieUndKasse(kontext, zaehler) {
  console.log("\nA. Therapieseite (?ndjekja=1) → Kasse → Bestellung");
  const seite = await kontext.newPage();
  const fehler = seiteBeobachten(seite, "terapia");
  await seite.goto(`${BASIS}/terapia/${KENNUNG}?ndjekja=1`, { waitUntil: "domcontentloaded" });
  await seite.waitForSelector("#t-faqja:not([hidden])", { timeout: 30000 });
  await seite.waitForTimeout(800);
  await bild(seite, "01_angebot_oben");

  const oben = await seite.evaluate(() => ({
    pako: document.querySelector("#t-pako")?.textContent || "",
    pakoSichtbar: !document.querySelector("#t-pako")?.hidden,
    cipa: [...document.querySelectorAll("#t-seticipa li")].map((l) => l.textContent),
    link: document.querySelector("#t-ndjekjalink")?.textContent || "",
    preis: document.querySelector("#t-cmimi1 strong")?.textContent || "",
    gjithsej: document.querySelector("#t-cmimi1 [data-dita]")?.textContent || "",
    knopf: document.querySelector("#hero-knopf")?.textContent || "",
    garancia: [...document.querySelectorAll("#t-siguria div")].map((d) => d.textContent),
    ditetVersteckt: document.querySelector("#ditet")?.hidden === true,
    ndjekjaSichtbar: document.querySelector("#ndjekja")?.hidden === false,
    hyrja: document.querySelector("#t-hyrja")?.textContent || "",
    gashiJedeWoche: document.body.innerText.includes("Dr. Gashi çdo javë") || document.body.innerText.includes("Dr. Gashi pranë jush çdo javë"),
    rundUmDieUhr: document.body.innerText.includes("24/7")
  }));
  pruefe(oben.pakoSichtbar && /1 × LF ACNE/.test(oben.pako) && /1 × LF MOISTUR/.test(oben.pako), `Paket mit Namen und Menge: "${oben.pako}"`);
  pruefe(oben.cipa.includes("Ndjekje 4-javore") && !oben.cipa.some((c) => /Dr\. Gashi/.test(c)), `Chips: ${oben.cipa.join(" | ")}`);
  pruefe(/Si funksionon ndjekja/.test(oben.link), `Sprung zur Begleitung: "${oben.link}"`);
  pruefe(oben.preis === "39 €" && /gjithsej me dërgesë/.test(oben.gjithsej), `Endpreis mit Lieferung: ${oben.preis} · ${oben.gjithsej}`);
  pruefe(/Fillo terapinë — 39 €/.test(oben.knopf), `Kaufknopf bleibt: "${oben.knopf}"`);
  pruefe(oben.garancia.some((g) => /45 ditë nga marrja e pakos/.test(g)) && !oben.garancia.some((g) => /ose ju kthejmë paratë/.test(g)), "Garantie kurz = derselbe Ablauf wie die Bedingungen");
  pruefe(oben.ditetVersteckt && oben.ndjekjaSichtbar, "\"Nuk mbeteni vetëm\" ersetzt durch die Begleitung");
  pruefe(!oben.gashiJedeWoche, "Kein \"Dr. Gashi jede Woche\", solange niemand als Prüfer festgelegt ist");
  pruefe(!oben.rundUmDieUhr, "Kein \"24/7\" auf der Seite");

  // Zur Begleitung springen.
  await seite.click("#t-ndjekjalink");
  await seite.waitForTimeout(900);
  await bild(seite, "02_begleitung_sprung");
  const abschnitt = await seite.$("#ndjekja");
  await abschnitt?.screenshot({ path: `${AUS}/03_begleitung_ganz.png` });
  const text = await seite.evaluate(() => document.querySelector("#ndjekja")?.innerText || "");
  for (const soll of ["Katër javë, me ndjekje hap pas hapi.", "Shembull i ndjekjes suaj", "Java 1 nga 4", "Përdorimi sot",
    "E përdora", "Nuk e përdora", "Si është ndier lëkura juaj?", "Pa shqetësime", "Thatësi / tërheqje", "Skuqje",
    "Djegie / pickim", "Diçka tjetër", "Kontrolli i radhës: dita 7", "Keni pyetje për përdorimin?", "Vetëm shembull – asgjë nuk ruhet.",
    "Shënimi ditor nuk do të thotë kontroll mjekësor çdo ditë", "Dita 28"]) {
    pruefe(text.includes(soll), `Begleitung zeigt „${soll}“`);
  }
  pruefe(!/%|kryer|përfundoi|24\/7/.test(text), "Keine Heilungsquote, kein erledigter Termin, keine Rund-um-die-Uhr-Zusage im Beispiel");

  // Die Beispielkarte: Antippen bleibt lokal.
  const vorher = zaehler.schreiben.length;
  await seite.click("#ndjekja .ndj-karta--shembull [data-wert=po]");
  await seite.click("#ndjekja .ndj-karta--shembull [data-wert=skuqje]");
  await seite.click("#ndjekja .ndj-karta--shembull [data-wert=thatesi]");
  await seite.click("#ndjekja .ndj-karta--shembull .ndj-lidhje");
  await seite.waitForTimeout(4600);
  const gedrueckt = await seite.evaluate(() => [...document.querySelectorAll("#ndjekja [aria-pressed=true]")].map((k) => k.dataset.wert));
  pruefe(gedrueckt.includes("po") && gedrueckt.includes("skuqje") && gedrueckt.includes("thatesi"), `Beispiel reagiert auf Antippen: ${gedrueckt.join(", ")}`);
  const pfadSeitdem = zaehler.schreiben.slice(vorher).filter((w) => /skuqje|Skuqje|thatesi|E përdora/.test(w.koerper || ""));
  pruefe(pfadSeitdem.length === 0, "Antippen im Beispiel landet in keinem Schreibvorgang (kein Eintrag, kein Klickpfad)");
  await seite.click("#ndjekja .ndj-karta--shembull [data-wert=mire]");
  const nachMire = await seite.evaluate(() => [...document.querySelectorAll("#ndjekja .ndj-cipa [aria-pressed=true]")].map((k) => k.dataset.wert));
  pruefe(nachMire.length === 1 && nachMire[0] === "mire", "\"Pa shqetësime\" wählt die anderen ab");
  await abschnitt?.screenshot({ path: `${AUS}/04_begleitung_beispiel_angetippt.png` });

  // Garantie: kurz oben -> ganze Bedingungen.
  await seite.evaluate(() => scrollTo(0, 0));
  await seite.click('#t-siguria a[href="#garancia"]');
  await seite.waitForTimeout(700);
  const garancia = await seite.evaluate(() => ({ offen: document.querySelector("#garancia")?.open === true, text: document.querySelector("#garancia")?.innerText || "" }));
  pruefe(garancia.offen && /Së pari shohim si ka reaguar lëkura/.test(garancia.text) && /nga dita kur merrni pakon/.test(garancia.text), "\"Kushtet ↓\" öffnet die vollständigen Bedingungen");
  await bild(seite, "05_garantie_bedingungen");

  // Kasse oeffnen.
  await seite.evaluate(() => scrollTo(0, 0));
  await seite.click("#hero-knopf");
  await seite.waitForSelector("#porosia:not([hidden])");
  await seite.waitForTimeout(400);
  await bild(seite, "06_kasse");
  const kasse = await seite.evaluate(() => ({
    fatura: document.querySelector("#t-fatura")?.innerText || "",
    numri: !document.querySelector("#t-numrianalize")?.hidden,
    telefonVersteckt: document.querySelector("#t-telefonlabel")?.hidden === true,
    emri: document.querySelector("#t-emri")?.value || "",
    wa: document.querySelector("#t-porosiwa")?.getAttribute("href") || "",
    garancia: document.querySelector("#t-porosigarancia summary")?.textContent || "",
    autofill: ["#t-emri", "#t-telefon", "#t-adresa", "#t-qyteti"].map((s) => document.querySelector(s)?.getAttribute("autocomplete")),
    tel: [document.querySelector("#t-telefon")?.type, document.querySelector("#t-telefon")?.inputMode]
  }));
  pruefe(/Dërgesa\s*Falas/.test(kasse.fatura) && /Pagesa\s*Te dera/.test(kasse.fatura) && /Gjithsej\s*39 €/.test(kasse.fatura), `Vor dem Bestätigen: ${kasse.fatura.replace(/\s+/g, " ")}`);
  pruefe(kasse.numri && kasse.telefonVersteckt, "Nummer aus der Analyse wird übernommen, nicht neu verlangt");
  pruefe(kasse.emri === "Arta", "Name vorausgefüllt und änderbar");
  pruefe(/wa\.me\/.*Kodi/.test(decodeURIComponent(kasse.wa)), "WhatsApp bleibt als zweiter Weg, mit Fallnummer");
  pruefe(/45 ditë garanci nga marrja e pakos/.test(kasse.garancia), `Garantie in der Kasse: "${kasse.garancia}"`);
  pruefe(kasse.autofill.join() === "name,tel,street-address,address-level2" && kasse.tel.join() === "tel,tel", "Autofill und Telefon-Tastatur");

  // Leer absenden -> Fehler am Feld.
  await seite.click("#t-dergo");
  await seite.waitForTimeout(300);
  const leer = await seite.evaluate(() => ({
    adresa: document.querySelector("#t-adresa-gabim")?.textContent || "",
    qyteti: document.querySelector("#t-qyteti-gabim")?.textContent || "",
    invalid: [...document.querySelectorAll("#forma [aria-invalid=true]")].map((x) => x.id),
    fokus: document.activeElement?.id || ""
  }));
  pruefe(leer.adresa && leer.qyteti && leer.invalid.includes("t-adresa") && leer.fokus === "t-adresa", `Fehler am Feld: ${leer.invalid.join(", ")} · Fokus ${leer.fokus}`);
  await bild(seite, "07_kasse_fehler_am_feld");

  // Eingeben, zurueck (Geste), wieder oeffnen: alles noch da.
  await seite.fill("#t-adresa", "Rruga Nëna Terezë 12");
  await seite.fill("#t-qyteti", "Prishtinë");
  await seite.goBack();
  await seite.waitForTimeout(500);
  const zu = await seite.evaluate(() => ({ zu: document.querySelector("#porosia")?.hidden === true, pfad: location.pathname }));
  pruefe(zu.zu && zu.pfad.startsWith("/terapia/"), "\"Zurück\" schließt die Kasse und bleibt auf der Therapieseite");
  await seite.click("#hero-knopf");
  await seite.waitForSelector("#porosia:not([hidden])");
  const noch = await seite.evaluate(() => [document.querySelector("#t-adresa")?.value, document.querySelector("#t-qyteti")?.value]);
  pruefe(noch[0] === "Rruga Nëna Terezë 12" && noch[1] === "Prishtinë", "Eingaben bleiben beim Zurückgehen erhalten");

  // Tastatur offen (halbe Hoehe): Der Knopf ist erreichbar.
  const volle = seite.viewportSize();
  await seite.setViewportSize({ width: volle.width, height: Math.round(volle.height * 0.52) });
  await seite.focus("#t-qyteti");
  await seite.waitForTimeout(300);
  await bild(seite, "08_kasse_tastatur_offen");
  const erreichbar = await seite.evaluate(() => {
    const blatt = document.querySelector("#porosia");
    const knopf = document.querySelector("#t-dergo");
    knopf.scrollIntoView({ block: "end" });
    const r = knopf.getBoundingClientRect();
    return r.bottom <= innerHeight + 1 && r.top >= 0 && blatt.scrollHeight >= blatt.clientHeight;
  });
  pruefe(erreichbar, "Mit offener Tastatur: Bestätigen-Knopf erreichbar (scrollbar, nicht verdeckt)");
  await bild(seite, "09_kasse_tastatur_knopf");
  await seite.setViewportSize(volle);

  // Doppelt tippen -> EINE Bestellung.
  const vorBestellung = zaehler.schreiben.length;
  await seite.evaluate(() => { const k = document.querySelector("#t-dergo"); k.click(); k.click(); k.click(); });
  await seite.waitForSelector("#t-faleminderit:not([hidden])", { timeout: 20000 });
  await seite.waitForTimeout(600);
  await bild(seite, "10_bestellt");
  const bestellSchreiben = zaehler.schreiben.slice(vorBestellung).filter((w) => /updateMask\.fieldPaths=order/.test(w.url));
  pruefe(bestellSchreiben.length === 1, `Dreimal getippt, ${bestellSchreiben.length} Bestellung geschrieben`);
  const danke = await seite.evaluate(() => document.querySelector("#t-faleminderit")?.innerText || "");
  pruefe(/Porosia juaj u ruajt/.test(danke), "Bestätigung erst nach dem Speichern");

  const sitzung = await lies(`lifeskin/lifeskin/sessions/${KENNUNG}`);
  const bericht = await lies(`lifeskin/lifeskin/reports/${KENNUNG}`);
  pruefe(sitzung?.order?.orderId === CODE && sitzung?.order?.fassung === "ndjekja-1", "Bestellung in der Sitzung (mit Fassung)");
  pruefe(sitzung?.phone === "+383 44 123 456" && sitzung?.address?.telefonNgaAnaliza === true && !sitzung?.address?.telefon, "Nummer aus der Analyse bleibt, keine zweite Nummer");
  pruefe(bericht?.status === "bestellt" && !JSON.stringify(bericht).includes("123 456"), "Bericht: bestellt - und ohne Telefonnummer");
  const kauf = sitzung?.timings?.kauf || {};
  pruefe(["geoeffnet", "angebot", "betreuung", "knopf", "kasse", "eingabe", "fehler", "gespeichert"].every((m) => kauf[m]) && kauf.v === "ndjekja-1" && kauf.fehlerArt === "felder",
    `Kaufweg gemessen: ${Object.keys(kauf).sort().join(", ")}`);
  pruefe(!JSON.stringify(kauf).match(/Arta|Prishtin|Rruga|123/), "Messung enthält keine Namen, Anschrift oder Nummer");
  pruefe(fehler.length === 0, `Keine JS-Fehler (${fehler.join(" / ") || "keine"})`);
  await seite.close();
}

// Die klassische Fassung (ohne ?ndjekja=1) bleibt, wie sie war.
export async function klassischUnveraendert(kontext, zaehler) {
  console.log("\nA2. Ohne Vorschau-Schalter: klassische Seite unverändert");
  const kennung = hex(16);
  await testfallAnlegen(kennung);
  const seite = await kontext.newPage();
  const fehler = seiteBeobachten(seite, "klassisch");
  const vorher = zaehler.schreiben.length;
  await seite.goto(`${BASIS}/terapia/${kennung}`, { waitUntil: "domcontentloaded" });
  await seite.waitForSelector("#t-faqja:not([hidden])", { timeout: 30000 });
  await seite.waitForTimeout(5000);
  const k = await seite.evaluate(() => ({
    ditet: document.querySelector("#ditet")?.hidden === false,
    ndjekja: document.querySelector("#ndjekja")?.hidden === true,
    pako: document.querySelector("#t-pako")?.hidden === true,
    cipa: [...document.querySelectorAll("#t-seticipa li")].map((l) => l.textContent),
    garancia: [...document.querySelectorAll("#t-siguria div")].map((d) => d.textContent)
  }));
  pruefe(k.ditet && k.ndjekja && k.pako && k.cipa.includes("Dr. Gashi çdo javë") && k.garancia.some((g) => /ose ju kthejmë paratë/.test(g)), "Klassische Fassung Wort für Wort wie vorher");
  const kaufSchreiben = zaehler.schreiben.slice(vorher).filter((w) => /timings\.kauf/.test(w.url));
  pruefe(kaufSchreiben.length === 0, "Klassische Fassung schreibt keine neuen Messmarken");
  await seite.click("#hero-knopf");
  await seite.waitForSelector("#porosia:not([hidden])");
  const kasse = await seite.evaluate(() => ({ fatura: document.querySelector("#t-fatura")?.hidden === true, tel: document.querySelector("#t-telefonlabel")?.hidden === false }));
  pruefe(kasse.fatura && kasse.tel, "Klassische Kasse unverändert (Telefonfeld da, keine neue Zusammenfassung)");
  pruefe(fehler.length === 0, `Keine JS-Fehler (${fehler.join(" / ") || "keine"})`);
  await seite.close();

  // Stiller Modus: neue Fassung, aber keine einzige Messmarke.
  const still = await kontext.newPage();
  const vorStill = zaehler.schreiben.length;
  await still.goto(`${BASIS}/terapia/${kennung}?ndjekja=1&still=1`, { waitUntil: "domcontentloaded" });
  await still.waitForSelector("#t-faqja:not([hidden])", { timeout: 30000 });
  await still.click("#t-ndjekjalink");
  await still.waitForTimeout(5000);
  const stillSchreiben = zaehler.schreiben.slice(vorStill).filter((w) => /timings/.test(w.url));
  pruefe(stillSchreiben.length === 0, "Stiller Modus: keine Statistik, keine Messmarke");
  await still.goto(`${BASIS}/terapia/${kennung}?still=0`, { waitUntil: "domcontentloaded" });
  await still.close();
  return kennung;
}

// ---------------------------------------------------------------------------
// B. Der Kundenbereich
// ---------------------------------------------------------------------------

export async function kundenbereich(kontext, zaehler, { zugang }) {
  console.log("\nB. Kundenbereich /ndjekja#…");
  const seite = await kontext.newPage();
  const fehler = seiteBeobachten(seite, "ndjekja");
  await seite.goto(`${BASIS}/ndjekja#${zugang}`, { waitUntil: "domcontentloaded" });
  await seite.waitForSelector("#n-faqja:not([hidden])", { timeout: 30000 });
  await seite.waitForTimeout(500);
  await bild(seite, "20_kunde_vor_dem_start");
  const vor = await seite.evaluate(() => document.querySelector("#n-faqja")?.innerText || "");
  pruefe(/Porosia juaj/.test(vor) && /Fillova sot/.test(vor) && /Hapi i radhës/.test(vor), "Vor dem Start: Bestellung und nächster Schritt");
  pruefe(!/Java 1 nga 4/.test(vor), "Die vier Wochen laufen noch nicht (Start = tatsächliche Anwendung)");

  await seite.click("text=Fillova sot");
  await seite.waitForSelector("#n-sot:not([hidden])", { timeout: 15000 });
  await seite.waitForTimeout(400);
  await bild(seite, "21_kunde_heute");
  const fall = (await db.doc(`lifeskin/lifeskin/ndjekja/${zugang}`).get()).data();
  pruefe(Boolean(fall?.startAt) && fall?.startVon === "klienti", `Start gespeichert: ${fall?.startAt} (${fall?.startVon})`);

  // Ohne Auswahl speichern -> Hinweis, nichts geschrieben.
  await seite.click("#n-sot .knopf");
  const hinweis = await seite.evaluate(() => document.querySelector("#n-sot .ndj-ruajtja")?.textContent || "");
  pruefe(/Zgjidhni/.test(hinweis), `Ohne Auswahl: "${hinweis}"`);

  await seite.click("#n-sot [data-wert=pjeserisht]");
  await seite.click("#n-sot [data-wert=thatesi]");
  await seite.fill("#n-sot textarea", "A duhet ta përdor edhe në mëngjes?");
  await seite.click("#n-sot .knopf");
  await seite.waitForFunction(() => /U ruajt/.test(document.querySelector("#n-sot .ndj-ruajtja")?.textContent || ""), null, { timeout: 15000 });
  await bild(seite, "22_kunde_gespeichert");
  const eintrag = (await db.doc(`lifeskin/lifeskin/ndjekja/${zugang}/shenime/t01`).get()).data();
  const nachher = (await db.doc(`lifeskin/lifeskin/ndjekja/${zugang}`).get()).data();
  pruefe(eintrag?.perdorimi === "pjeserisht" && eintrag?.ndjesia?.[0] === "thatesi" && /mëngjes/.test(eintrag?.mesazh || ""), "Eintrag Tag 1 gespeichert");
  pruefe(Boolean(nachher?.fundit?.blickAt) && nachher?.fundit?.dita === 1, "Zusammenfassung am Fall im selben Schreibvorgang (Heart sieht die Frage)");

  // Ohne Netz: nicht gespeichert, Text bleibt, erneut senden geht.
  await seite.click("#n-sot [data-wert=po]");
  await seite.fill("#n-sot textarea", "Tani e përdora edhe në mbrëmje.");
  await kontext.setOffline(true);
  zaehler.netzWeg = true;
  await seite.click("#n-sot .knopf");
  await seite.waitForFunction(() => /Nuk/.test(document.querySelector("#n-sot .ndj-ruajtja")?.textContent || ""), null, { timeout: 20000 });
  const offline = await seite.evaluate(() => ({ text: document.querySelector("#n-sot textarea")?.value, stand: document.querySelector("#n-sot .ndj-ruajtja")?.textContent }));
  pruefe(offline.text === "Tani e përdora edhe në mbrëmje." && /mbetet këtu/.test(offline.stand), `Ohne Netz: "${offline.stand}" - Text bleibt`);
  await bild(seite, "23_kunde_ohne_netz");
  await kontext.setOffline(false);
  zaehler.netzWeg = false;
  await seite.click("#n-sot .knopf");
  await seite.waitForFunction(() => /U ruajt/.test(document.querySelector("#n-sot .ndj-ruajtja")?.textContent || ""), null, { timeout: 15000 });
  const korrigiert = (await db.doc(`lifeskin/lifeskin/ndjekja/${zugang}/shenime/t01`).get()).data();
  pruefe(korrigiert?.perdorimi === "po" && korrigiert?.createdAt === eintrag?.createdAt && korrigiert?.updatedAt > eintrag?.updatedAt, "Erneut gesendet = korrigiert, erster Zeitpunkt bleibt");

  // Der Verlauf: "Nuk është shënuar" fuer fehlende Tage gibt es erst ab Tag 2 - hier nur Tag 1.
  const verlauf = await seite.evaluate(() => document.querySelector("#n-historia")?.innerText || "");
  pruefe(/Dita 1/.test(verlauf) && /E përdora/.test(verlauf), "Verlauf zeigt den Tag");
  pruefe(fehler.length === 0, `Keine JS-Fehler (${fehler.join(" / ") || "keine"})`);
  return seite;
}

export async function fremderZugang(kontext) {
  console.log("\nB2. Fremder oder unvollständiger Link");
  const seite = await kontext.newPage();
  await seite.goto(`${BASIS}/ndjekja#${hex(16)}`, { waitUntil: "domcontentloaded" });
  await seite.waitForSelector("#n-weg:not([hidden])", { timeout: 20000 });
  pruefe(true, "Unbekannter Zugang: \"Ky link nuk është i plotë\"");
  await bild(seite, "29_kunde_fremder_link");
  // Ein anderer Link im selben Tab laedt die Seite neu (hashchange).
  await seite.goto("about:blank");
  await seite.goto(`${BASIS}/ndjekja#abc`, { waitUntil: "domcontentloaded" });
  await seite.waitForSelector("#n-weg:not([hidden])", { timeout: 20000 });
  pruefe(true, "Abgeschnittener Link: dieselbe Meldung");
  await seite.close();
}

// ---------------------------------------------------------------------------
// C. Heart: bestaetigen, Betreuung anlegen, antworten, intern notieren
// ---------------------------------------------------------------------------

export async function heartOeffnen(kontext) {
  const seite = await kontext.newPage();
  const fehler = seiteBeobachten(seite, "heart");
  await seite.goto(`${BASIS}/heart?firebase-emulator=1&ndjekja=1#lifeskin`, { waitUntil: "domcontentloaded" });
  await seite.waitForSelector("[data-heart-login] input[name=email]", { timeout: 60000 });
  await seite.fill("[data-heart-login] input[name=email]", "heart.local@example.test");
  await seite.fill("[data-heart-login] input[name=password]", "local-test-password");
  await seite.click("[data-heart-login] button[type=submit], [data-heart-login] button");
  await seite.waitForSelector('[data-action="lifeskin-sitzung"]', { timeout: 120000 });
  return { seite, fehler };
}

async function heartFallOeffnen(seite, kennung) {
  // Der Fall liegt in GENAU EINEM Fach (Offen, Ready, Seen, Kasse, ...).
  const zeile = `[data-action="lifeskin-sitzung"][data-id="${kennung}"]`;
  for (const fach of ["", "alle", "ready", "seen", "kasse", "bestellt"]) {
    if (fach) {
      await seite.click(`[data-action="lifeskin-fach"][data-wert="${fach}"]`).catch(() => {});
      await seite.waitForTimeout(300);
    }
    if (await seite.$(zeile)) break;
  }
  await seite.evaluate((z) => document.querySelector(z)?.scrollIntoView({ block: "center" }), zeile);
  await seite.click(zeile);
  await seite.waitForSelector(".heart-lifeskin-detail", { timeout: 30000 });
}

export async function heartBestaetigen(seite) {
  console.log("\nC. Heart: Bestellung bestätigen → Betreuung anlegen");
  await heartFallOeffnen(seite, KENNUNG);
  const knopf = '[data-action="ndjekja"][data-was="bestaetigen"]';
  await seite.waitForSelector(knopf, { timeout: 20000 });
  await seite.evaluate((k) => document.querySelector(k)?.scrollIntoView({ block: "center" }), knopf);
  await bild(seite, "30_heart_akte_bestellung");
  await seite.click(knopf);
  await seite.waitForSelector('[data-action="ndjekja"][data-was="oeffnen"]', { timeout: 20000 });
  const intern = await lies(`lifeskin/lifeskin/ndjekjaIntern/${KENNUNG}`);
  const zugang = intern?.zugang || "";
  const fall = zugang ? await lies(`lifeskin/lifeskin/ndjekja/${zugang}`) : null;
  const sitzung = await lies(`lifeskin/lifeskin/sessions/${KENNUNG}`);
  pruefe(/^[0-9a-f]{32}$/.test(zugang) && fall?.kennung === KENNUNG, "Betreuung angelegt, Zugang nur intern und im Fall");
  pruefe(sitzung?.order?.status === "bestaetigt" && Boolean(sitzung?.order?.bestaetigtAt), "Bestellung als bestätigt gezählt");
  const bericht = await lies(`lifeskin/lifeskin/reports/${KENNUNG}`);
  pruefe(!JSON.stringify(bericht).includes(zugang), "Der öffentliche Bericht kennt den Zugang nicht");
  // Zweimal tippen legt keinen zweiten Bereich an.
  const vorher = (await db.collection("lifeskin").doc("lifeskin").collection("ndjekja").get()).size;
  await seite.evaluate(() => document.querySelector('[data-action="ndjekja"][data-was="oeffnen"]')?.scrollIntoView({ block: "center" }));
  await bild(seite, "31_heart_akte_bestaetigt");
  const link = await seite.evaluate(() => [...document.querySelectorAll(".heart-ndj-kasten--bestellung a")].map((a) => a.href).find((h) => h.includes("wa.me")) || "");
  pruefe(decodeURIComponent(link).includes(`/ndjekja#${zugang}`), "„Link senden“ öffnet WhatsApp mit dem Link des Kunden");
  const nachher = (await db.collection("lifeskin").doc("lifeskin").collection("ndjekja").get()).size;
  pruefe(vorher === nachher, "Kein zweiter Bereich");
  await seite.click('[data-action="ndjekja"][data-was="oeffnen"]');
  await seite.waitForSelector(".heart-ndj-fall", { timeout: 20000 });
  await seite.waitForTimeout(800);
  await bild(seite, "32_heart_betreuung_wartet");
  return zugang;
}

export async function heartAntwortet(seite, zugang) {
  console.log("\nC2. Heart: Rückmeldung sehen, antworten, intern notieren, Termin");
  // Der Eintrag des Kunden kommt live an.
  await seite.waitForSelector(".heart-ndj-eintrag--neu", { timeout: 30000 });
  const text = await seite.evaluate(() => document.querySelector(".heart-ndj-fall")?.innerText || "");
  pruefe(/Neue Rückmeldung \/ Frage/i.test(text) && /A duhet ta përdor edhe në mëngjes|Tani e përdora/.test(text), "Heart zeigt die Frage im richtigen Fall - live");
  await bild(seite, "33_heart_rueckmeldung");
  // Antworten: Text, Absender.
  await seite.fill('.heart-ndj-kasten--kunde textarea[name=tekst]', "Faleminderit! Po, LF MOISTUR përdoreni edhe në mëngjes. LF ACNE vetëm në mbrëmje.");
  await seite.fill('.heart-ndj-kasten--kunde input[name=nga]', "Ekipi LifeSkin (test)");
  await seite.click('.heart-ndj-kasten--kunde [data-was="antwort"]');
  await seite.waitForSelector(".heart-ndj-antwort", { timeout: 20000 }).catch(async (e) => {
    const toast = await seite.evaluate(() => document.querySelector("[class*=toast]")?.innerText || "");
    console.log(`  (kein .heart-ndj-antwort - Meldung: "${toast}")`);
    await bild(seite, "99_fehler_antwort");
    throw e;
  });
  const antworten = await db.collection(`lifeskin/lifeskin/ndjekja/${zugang}/pergjigjet`).get();
  pruefe(antworten.size === 1 && antworten.docs[0].data().nga === "Ekipi LifeSkin (test)" && antworten.docs[0].data().createdAt, "Rückmeldung gespeichert, mit Absender und Datum");
  // Intern.
  await seite.fill('.heart-ndj-kasten--intern input[name=pergjegjes]', "Arta (Team)");
  await seite.fill('.heart-ndj-kasten--intern textarea[name=detyra]', "Tag 7 anrufen");
  await seite.click('.heart-ndj-kasten--intern [data-was="intern"]');
  await seite.waitForTimeout(800);
  await seite.fill('.heart-ndj-kasten--intern textarea[name=notiz]', "INTERN-GEHEIM: Kundin wirkt unsicher, beim nächsten Mal nachfragen.");
  await seite.click('.heart-ndj-kasten--intern [data-was="notiz"]');
  await seite.waitForSelector(".heart-ndj-notizen li", { timeout: 20000 });
  const intern = await lies(`lifeskin/lifeskin/ndjekjaIntern/${KENNUNG}`);
  pruefe(intern?.pergjegjes === "Arta (Team)" && intern?.shenimet?.[0]?.tekst?.startsWith("INTERN-GEHEIM"), "Interne Notiz und Verantwortliche nur in ndjekjaIntern");
  const fallDoc = await lies(`lifeskin/lifeskin/ndjekja/${zugang}`);
  pruefe(!JSON.stringify(fallDoc).includes("INTERN-GEHEIM") && !JSON.stringify(fallDoc).includes("Arta (Team)"), "Im Fall des Kunden steht nichts Internes");
  // Termin Tag 7 erledigt markieren (von Hand).
  await seite.click('[data-was="kontrolle"][data-dita="7"]');
  await seite.waitForFunction(() => /erledigt \S/.test(document.querySelector(".heart-ndj-termine")?.innerText || ""), null, { timeout: 20000 });
  // Heart zeigt einen Schreibvorgang sofort (Firestore, lokal zuerst) -
  // in der Datenbank steht er einen Augenblick spaeter.
  let nachTermin = null;
  for (let i = 0; i < 20 && !nachTermin?.kontrollet?.["7"]; i += 1) {
    nachTermin = await lies(`lifeskin/lifeskin/ndjekja/${zugang}`);
    if (!nachTermin?.kontrollet?.["7"]) await seite.waitForTimeout(250);
  }
  pruefe(nachTermin?.kontrollet?.["7"]?.statusi === "kryer" && nachTermin?.kontrollet?.["7"]?.nga === "Ekipi LifeSkin (test)" && nachTermin?.kontrollet?.["7"]?.at,
    `Termin Tag 7 erledigt - mit Name und Datum, nur durch das Team (${JSON.stringify(nachTermin?.kontrollet)})`);
  pruefe(!nachTermin?.kontrollet?.["14"], "Die übrigen Termine bleiben geplant");
  await seite.evaluate(() => scrollTo(0, 0));
  await bild(seite, "34_heart_fall_oben");
  await seite.evaluate(() => document.querySelector(".heart-ndj-kasten--kunde")?.scrollIntoView({ block: "start" }));
  await bild(seite, "35_heart_fall_kunde_und_intern");
  // Zurueck zur Liste: die Karte mit den Arbeitslisten.
  await seite.click('[data-action="ndjekja"][data-was="zu"]');
  // Zurueck in der Akte der Analyse (von dort kam die Betreuung) - und
  // von dort zur Liste.
  await seite.waitForSelector('[data-action="lifeskin-sitzung-zu"]', { timeout: 20000 });
  await seite.click('[data-action="lifeskin-sitzung-zu"]');
  await seite.waitForSelector(".heart-ndj", { timeout: 20000 });
  await seite.evaluate(() => document.querySelector(".heart-ndj")?.scrollIntoView({ block: "start" }));
  await seite.waitForTimeout(500);
  await bild(seite, "36_heart_arbeitslisten");
}

export async function kundeSiehtAntwort(kontext, zugang) {
  console.log("\nB3. Kunde sieht die Antwort - und nichts Internes");
  const seite = await kontext.newPage();
  const fehler = seiteBeobachten(seite, "ndjekja2");
  await seite.goto(`${BASIS}/ndjekja#${zugang}`, { waitUntil: "domcontentloaded" });
  await seite.waitForSelector("#n-faqja:not([hidden])", { timeout: 30000 });
  const text = await seite.evaluate(() => document.body.innerText);
  pruefe(/LF MOISTUR përdoreni edhe në mëngjes/.test(text) && /Ekipi LifeSkin \(test\)/.test(text), "Antwort mit Absender sichtbar");
  pruefe(!/INTERN-GEHEIM|Arta \(Team\)|Tag 7 anrufen/.test(text), "Keine interne Notiz, keine Verantwortliche, keine Aufgabe auf der Kundenseite");
  pruefe(/Kontrolli i fundit: dita 7/.test(text) && /Kontrolli i radhës: dita 14/.test(text), "Letzte erledigte und nächste geplante Kontrolle");
  await seite.evaluate(() => document.querySelector("#n-kontrolli")?.scrollIntoView({ block: "start" }));
  await bild(seite, "24_kunde_antwort");
  // Lesen ohne Zugang zu fremden Daten: direkt per REST, ohne Anmeldung.
  const basis = `http://${EMU}/v1/projects/mnyra-local/databases/(default)/documents/lifeskin/lifeskin`;
  const liste = await fetch(`${basis}/ndjekja`);
  const intern = await fetch(`${basis}/ndjekjaIntern/${KENNUNG}`);
  const schreiben = await fetch(`${basis}/ndjekja/${zugang}/pergjigjet?documentId=falsch`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { tekst: { stringValue: "Fake Arzt" }, nga: { stringValue: "Dr. Fake" }, createdAt: { stringValue: new Date().toISOString() } } })
  });
  const status = await fetch(`${basis}/ndjekja/${zugang}?updateMask.fieldPaths=statusi`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields: { statusi: { stringValue: "perfunduar" } } })
  });
  pruefe(liste.status === 403 && intern.status === 403 && schreiben.status === 403 && status.status === 403,
    `Ohne Heart: Fälle nicht auflistbar (${liste.status}), intern nicht lesbar (${intern.status}), keine erfundene Arztnachricht (${schreiben.status}), kein Status (${status.status})`);
  pruefe(fehler.length === 0, `Keine JS-Fehler (${fehler.join(" / ") || "keine"})`);
  await seite.close();
}

export async function heartWhatsappUndStorno(seite, kennungKlassisch) {
  console.log("\nC3. WhatsApp-Bestellung am richtigen Fall, einmal; Storno");
  await seite.click('[data-action="lifeskin-sitzung-zu"]').catch(() => {});
  await seite.waitForSelector('[data-action="lifeskin-sitzung"]', { timeout: 30000 });
  await heartFallOeffnen(seite, kennungKlassisch);
  const knopf = '[data-action="ndjekja"][data-was="wa-bestellung"]';
  await seite.waitForSelector(knopf, { timeout: 20000 });
  await seite.fill('[name="wa-strasse"]', "Rruga B 4");
  await seite.fill('[name="wa-ort"]', "Prizren");
  await seite.evaluate((k) => document.querySelector(k)?.scrollIntoView({ block: "center" }), knopf);
  await bild(seite, "37_heart_whatsapp_bestellung");
  await seite.click(knopf);
  await seite.waitForSelector('[data-action="ndjekja"][data-was="bestaetigen"]', { timeout: 20000 });
  const s1 = await lies(`lifeskin/lifeskin/sessions/${kennungKlassisch}`);
  const b1 = await lies(`lifeskin/lifeskin/reports/${kennungKlassisch}`);
  pruefe(s1?.order?.quelle === "whatsapp" && s1?.order?.orderId && b1?.status === "bestellt", "WhatsApp-Bestellung an diesem Fall: Sitzung und Bericht");
  // Stornieren.
  seite.once("dialog", (d) => d.accept());
  await seite.click('[data-action="ndjekja"][data-was="stornieren"]');
  await seite.waitForFunction(() => /storniert/.test(document.querySelector(".heart-ndj-kasten--bestellung")?.innerText || ""), null, { timeout: 20000 });
  let s2 = null;
  for (let i = 0; i < 20 && s2?.order?.status !== "storniert"; i += 1) {
    s2 = await lies(`lifeskin/lifeskin/sessions/${kennungKlassisch}`);
    if (s2?.order?.status !== "storniert") await seite.waitForTimeout(250);
  }
  pruefe(s2?.order?.status === "storniert" && Boolean(s2?.order?.storniertAt), "Storno in der Sitzung (zählt in der Auswertung als storniert)");
}

// ---------------------------------------------------------------------------

async function main() {
  const { browser, kontext, zaehler } = await browserStarten();
  try {
    await testfallAnlegen();
    if (!NUR.length || NUR.includes("A")) await therapieUndKasse(kontext, zaehler);
    let klassisch = "";
    if (!NUR.length || NUR.includes("A2")) klassisch = await klassischUnveraendert(kontext, zaehler);
    if (!NUR.length || NUR.includes("C")) {
      // Der ganze Ablauf: Heart bestaetigt die Bestellung aus A.
      const { seite: heart, fehler: heartFehler } = await heartOeffnen(kontext);
      const zugang = await heartBestaetigen(heart);
      const kunde = await kundenbereich(kontext, zaehler, { zugang });
      await kunde.close();
      await heartAntwortet(heart, zugang);
      await kundeSiehtAntwort(kontext, zugang);
      if (klassisch) await heartWhatsappUndStorno(heart, klassisch);
      pruefe(heartFehler.length === 0, `Heart ohne JS-Fehler (${heartFehler.join(" / ") || "keine"})`);
      await heart.close();
    }
    if (NUR.includes("B")) {
      // Ohne Heart: den Fall so anlegen, wie Heart ihn anlegt.
      const zugang = hex(16);
      const jetzt = new Date().toISOString();
      await WURZEL.collection("ndjekja").doc(zugang).set({
        kennung: KENNUNG, code: CODE, emri: "Arta", statusi: "aktiv", porosia: { statusi: "konfirmuar" },
        startAt: "", startVon: "", kontrollet: {}, kontrolliRadhes: "", fundit: { dita: 0, at: "", blickAt: "" },
        createdAt: jetzt, updatedAt: jetzt
      });
      const seite = await kundenbereich(kontext, zaehler, { zugang });
      await seite.close();
      await fremderZugang(kontext);
    }
  } finally {
    await browser.close();
  }
  writeFileSync(`${AUS}/ergebnis.json`, JSON.stringify({ bestanden, fehler: fehlerListe, kennung: KENNUNG }, null, 2));
  console.log(`\n${bestanden} bestanden, ${fehlerListe.length} nicht bestanden.`);
  if (fehlerListe.length) {
    for (const f of fehlerListe) console.log(`  ✗ ${f}`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
