// LIFESKIN-FAELLE FUER HEART - NUR IM LOKALEN EMULATOR.
//
// Heart liest die Lifeskin-Sammlungen komplett (Sitzungen, Berichte,
// Produkte, Medien) und rechnet im Browser. Ob es damit langsam wird und
// wo es beim Oeffnen und Freigeben springt, sieht man nur mit einer
// Menge, wie sie im Betrieb liegt - nicht mit drei Beispielfaellen.
//
// Dieses Skript legt sie an: einige tausend Sitzungen ueber dreissig Tage,
// mit Klickpfad, Geraet und Herkunft, dazu Berichte in allen Zustaenden und
// Fotos an den neuesten Faellen. Alles erfunden, alles lokal.
//
//   node node_modules/firebase-tools/lib/bin/firebase.js emulators:start --only firestore,auth --project mnyra-local
//   npm run emulators:seed
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node tests/lifeskin-trichter-pruefstand/heart-emulator-seed.mjs [anzahl]
//
// Es weigert sich, gegen etwas anderes als den lokalen Emulator zu laufen.

import { readFileSync } from "node:fs";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PROJEKT = "mnyra-local";
const HOST = process.env.FIRESTORE_EMULATOR_HOST || "";
if (!/^(127\.0\.0\.1|localhost):\d+$/.test(HOST)) {
  throw new Error("Nur gegen den lokalen Emulator: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 setzen.");
}
if (!getApps().length) initializeApp({ projectId: PROJEKT });
const db = getFirestore();

const ANZAHL = Math.max(10, Number(process.argv[2]) || 4000);
const TAGE = 30;
const WURZEL = db.collection("lifeskin").doc("lifeskin");

// Ein fester Zufall, damit zwei Laeufe dieselben Faelle ergeben.
let saat = 20260925;
const zufall = () => { saat = (saat * 1664525 + 1013904223) % 4294967296; return saat / 4294967296; };
const wahl = (liste) => liste[Math.floor(zufall() * liste.length)];

const FOTOS = ["rasti-1-dita1.jpg", "rasti-2-dita1.jpg", "rasti-3-dita1.jpg", "rasti-4-dita1.jpg"]
  .map((d) => `data:image/jpeg;base64,${readFileSync(new URL(`../../apps/lifeskin-landing/fotot/${d}`, import.meta.url)).toString("base64")}`);

const NAMEN = ["Arta", "Blerina", "Dua", "Elira", "Fjolla", "Gresa", "Hana", "Ilirjana", "Jeta", "Kaltrina", "Lule", "Mimoza", "Njomza", "Rina", "Vlora"];
const GERAETE = [
  { os: "android", app: "instagram", browser: "chrome", screen: "412x915" },
  { os: "android", app: "facebook", browser: "chrome", screen: "360x780" },
  { os: "ios", app: "instagram", browser: "safari", screen: "390x844" },
  { os: "ios", app: "", browser: "safari", screen: "430x932" },
  { os: "ios", app: "facebook", browser: "safari", screen: "390x844" },
  { os: "android", app: "", browser: "chrome", screen: "412x915" }
];
const WEGE = [
  { typ: "scan", schritte: ["opened", "wahl", "named", "camera", "captured", "emri", "numri", "aufbereitung", "result"] },
  { typ: "foto", schritte: ["opened", "wahl", "fotopara", "fotokamera", "fotogati", "emri", "numri", "aufbereitung", "result"] },
  { typ: "trup", schritte: ["opened", "wahl", "emri", "problemi", "numri", "result"] }
];

function klickpfad(ab, schritte) {
  const pfad = {};
  let t = ab;
  let n = 0;
  for (const schirm of schritte) {
    const eintraege = 1 + Math.floor(zufall() * 3);
    for (let i = 0; i < eintraege; i += 1) {
      t += 800 + Math.floor(zufall() * 9000);
      n += 1;
      pfad[`p${n.toString(36)}${Math.floor(zufall() * 1e6).toString(36)}`] = {
        t: new Date(t).toISOString(), s: schirm, e: i ? "tipp" : "schirm",
        d: i ? wahl(["Vazhdo", "Hap kamerën", "Me foto", "Merrni analizën në WhatsApp", "Emri"]) : schirm
      };
    }
  }
  return pfad;
}

async function main() {
  const schreiber = db.bulkWriter();
  const jetzt = Date.now();
  await WURZEL.collection("config").doc("preise").set({ setPreis: 69 });
  const produkte = [
    { id: "pore-control", name: "Pore Control", einzelpreis: 29, lloji: "serum", kurztext: { sq: "Pastron poret." } },
    { id: "calm-cream", name: "Calm Cream", einzelpreis: 25, lloji: "krem", kurztext: { sq: "Qetëson lëkurën." } },
    { id: "gentle-wash", name: "Gentle Wash", einzelpreis: 19, lloji: "pastrues", kurztext: { sq: "Pastron butë." } },
    { id: "spf-50", name: "SPF 50", einzelpreis: 22, lloji: "spf", kurztext: { sq: "Mbron nga dielli." } }
  ];
  for (const p of produkte) schreiber.set(WURZEL.collection("products").doc(p.id), p);

  let berichte = 0;
  let mitFotos = 0;
  for (let i = 0; i < ANZAHL; i += 1) {
    // Die neuesten zuerst: i = 0 ist gerade eben.
    const alter = Math.floor((i / ANZAHL) * TAGE * 86400000 + zufall() * 3600000);
    const ab = jetzt - alter;
    const weg = wahl(WEGE);
    // Wie weit er kam: die meisten gehen frueh.
    const r = zufall();
    const bis = r < 0.55 ? 1 : r < 0.7 ? 2 : r < 0.8 ? Math.min(4, weg.schritte.length - 1) : weg.schritte.length;
    const schritte = weg.schritte.slice(0, bis);
    const fertig = schritte.at(-1) === "result";
    const id = `${ab.toString(16)}${Math.floor(zufall() * 1e12).toString(16)}`.padEnd(32, "0").slice(0, 32);
    const name = bis >= 5 ? wahl(NAMEN) : "";
    const pfad = klickpfad(ab, schritte);
    const ende = Object.values(pfad).at(-1)?.t || new Date(ab).toISOString();
    const fotos = weg.typ === "scan" ? ["gerade", "rechts", "links"] : weg.typ === "foto" ? ["zona"] : [];
    const sitzung = {
      createdAt: new Date(ab).toISOString(), updatedAt: ende, step: schritte.at(-1), code: `LS-${id.slice(0, 5).toUpperCase()}`,
      typ: weg.typ, paSkanim: weg.typ !== "scan", name, ageBand: name ? wahl(["18-24", "25-34", "35-44"]) : "",
      sprache: "sq", device: { ...wahl(GERAETE), gesehen: true },
      source: { utmSource: wahl(["ig", "fb", "ig", "ig"]), utmCampaign: wahl(["akne-sep", "poret-sep", "lifeskin-v2"]), utmContent: wahl(["video-1", "video-2", "foto-3"]) },
      timings: { pfad },
      ...(fertig ? { phone: "+38344123456", phoneConsent: true, photos: fotos.slice(0, weg.typ === "scan" ? 3 : 1) } : {}),
      ...(fertig && zufall() < 0.7 ? { warteseiteGeoeffnet: true } : {})
    };
    if (fertig && zufall() < 0.12) {
      sitzung.order = { createdAt: new Date(ab + 86400000).toISOString(), total: 69, produkte: ["pore-control", "calm-cream"] };
    }
    schreiber.set(WURZEL.collection("sessions").doc(id), sitzung);
    if (fertig) {
      berichte += 1;
      const status = i < 60 ? "wartet" : wahl(["fertig", "fertig", "vorschau", "bestellt", "wartet"]);
      schreiber.set(WURZEL.collection("reports").doc(id), {
        createdAt: sitzung.createdAt, code: sitzung.code, name, sprache: "sq", typ: weg.typ, status,
        photos: (sitzung.photos || []).length, numri: true,
        ...(status !== "wartet" ? { befund: { sq: "Lëkurë e yndyrshme me pore të zgjeruara." }, produkte: [{ id: "pore-control", satz: "Për poret." }], preis: 69, freigabeAt: new Date(ab + 7200000).toISOString() } : {}),
        ...(status === "bestellt" ? { bestelltAt: new Date(ab + 86400000).toISOString() } : {})
      });
      // Fotos an den neuesten Faellen - so, wie Heart sie oeffnet.
      if (mitFotos < 40 && (sitzung.photos || []).length) {
        mitFotos += 1;
        for (const [j, blick] of sitzung.photos.entries()) {
          schreiber.set(WURZEL.collection("sessions").doc(id).collection("photos").doc(blick),
            { jpeg: FOTOS[(i + j) % FOTOS.length], breite: 720, hoehe: 960 });
        }
      }
    }
  }
  await schreiber.close();
  console.log(`${ANZAHL} Sitzungen, ${berichte} Berichte, ${mitFotos} Faelle mit Fotos im Emulator angelegt.`);
}

await main();
