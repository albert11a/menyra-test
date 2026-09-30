// Internal sample only. The live waiting page never gets a skip button.
// Native controllers render fictional, local data through an injected transport.
import { Analiza } from "../lifeskin-astra/astra.js";
import { Terapia } from "../lifeskin-verkauf/terapia.js";
import { felder } from "../lifeskin/lifeskin-session.js";

const analysis = new URLSearchParams(location.search).get("page") === "analysis";
const source = analysis ? "/apps/lifeskin-verkauf/terapia.html" : "/apps/lifeskin-astra/index.html";
const html = await (await fetch(source)).text();
const template = new DOMParser().parseFromString(html, "text/html");
for (const link of template.querySelectorAll('link[rel="stylesheet"]')) document.head.append(link.cloneNode());
const style = document.createElement("link");
style.rel = "stylesheet";
style.href = "/apps/lifeskinlifeskin/flow.css";
document.head.append(style);
for (const script of template.body.querySelectorAll("script")) script.remove();
document.body.replaceChildren(...Array.from(template.body.childNodes).map(node => document.importNode(node, true)));

const bar = document.createElement("nav");
bar.className = "preview-bar";
bar.setAttribute("aria-label", "Provë e brendshme");
bar.innerHTML = '<strong>VETËM PËR PROVË · SHEMBULL</strong><span><a href="/lifeskinlifeskin">Landing</a> · <a href="/lifeskin?still=1&schirm=wahl&ls_design=mobile">Mënyrat</a> · <a href="?page=wait">Pritja</a> · <a href="?page=analysis">Analiza</a></span>';
document.body.prepend(bar);
const message = document.createElement("p");
message.className = "preview-message";
message.textContent = "Ky është një rast i sajuar për të parë faqen. Nuk është analizë mjekësore. Porositë dhe mesazhet janë të çaktivizuara.";
bar.after(message);
if (!analysis) {
  const next = document.createElement("a");
  next.className = "preview-next";
  next.href = "?page=analysis";
  next.textContent = "Shiko analizën e përfunduar →";
  message.after(next);
}

const photo = async path => {
  const blob = await (await fetch(path)).blob();
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};
const products = {
  "demo-acne": { name: "LF ACNE", inhalt: "30 ml", kurztext: "Kujdes për lëkurën me puçrra.", photoRef: await photo("/apps/lifeskin-shop/assets/lf-acne-3.jpg") },
  "demo-moistur": { name: "LF MOISTUR", inhalt: "50 ml", kurztext: "Hidratim për lëkurën.", photoRef: await photo("/apps/lifeskin-shop/assets/lf-moistur.jpg") }
};
const report = {
  status: "vorschau", name: "Shembull", code: "DEMO", sprache: "sq", preis: 39, weg: "foto", typ: "foto", photos: 0, ohneBild: true,
  produkte: [
    { id: "demo-acne", satz: "Kujdes për zonat me puçrra." },
    { id: "demo-moistur", satz: "Hidratim për zonat e thata." }
  ],
  raport: {
    schemaVersion: 3, aerztlichGeprueft: false,
    gjetjaKryesore: "Puçrra në fytyrë", gjetjaDyta: "Lëkurë e thatë",
    gjetjet: "Shembull i sajuar: puçrra dhe lëkurë e thatë. Nuk bazohet në foto ose në një kontroll mjekësor.",
    shitja: {
      hyrja: "Në këtë shembull, kujdesi ndahet në dy hapa: **kujdes për puçrrat** dhe **hidratim**.",
      shqetesimi: "Shembull i sajuar. Një analizë e vërtetë tregon vetëm gjetjet dhe produktet e zgjedhura për rastin tënd.",
      problemet: [
        { gjetja: "Puçrra", ku: "në fytyrë", produkt_id: "demo-acne", zgjidhja: "LF ACNE — kujdes për zonat me puçrra." },
        { gjetja: "Thatësi", ku: "në lëkurë", produkt_id: "demo-moistur", zgjidhja: "LF MOISTUR — hidratim për zonat e thata." }
      ],
      produktet: [
        { produkt_id: "demo-acne", per_ju: ["Kujdes për zonat me puçrra."] },
        { produkt_id: "demo-moistur", per_ju: ["Hidratim për zonat e thata."] }
      ],
      dita_28: "Rezultatet ndryshojnë nga personi në person.", pse_tani: "Ndiq udhëzimin e produktit dhe planin e dhënë pas kontrollit."
    }
  }
};
const mockFetch = async (url, options = {}) => {
  // No request to a patient database, notification endpoint or order API.
  if (options.method && options.method !== "GET") return new Response('{}', { status: 403 });
  const path = new URL(url, location.origin).pathname;
  if (/\/reports\/abcdef0123456789$/.test(path)) return Response.json({ fields: felder(report) });
  const product = products[decodeURIComponent(path.split("/").pop())];
  if (/\/products\//.test(path) && product) return Response.json({ fields: felder(product) });
  return Response.json({ documents: [] });
};
const pixel = { starte: () => false, melde: () => {}, angebot: () => {}, kauf: () => {} };
globalThis.fetch = mockFetch;
const ort = { pathname: `/${analysis ? "terapia" : "analiza"}/abcdef0123456789`, search: analysis ? "?vorschau=1&ls_design=mobile" : "?ls_design=mobile", replace: () => {} };
// Block external help and form submission only inside this internal demo.
document.addEventListener("click", event => {
  const action = event.target.closest("[data-hilfe], [data-whatsapp], a[href*='wa.me'], a[href*='whatsapp'], #t-dergo, #an-pritgateknopf");
  if (!action) return;
  event.preventDefault(); event.stopImmediatePropagation();
  message.textContent = "Vetëm për provë: nuk dërgohet asnjë porosi ose mesazh.";
  message.scrollIntoView({ behavior: "smooth", block: "center" });
}, true);
document.addEventListener("submit", event => { event.preventDefault(); event.stopImmediatePropagation(); }, true);
await new (analysis ? Terapia : Analiza)({ fetchFn: mockFetch, ort, pixel }).starte();
if (analysis) {
  const subtitle = document.querySelector("#t-setinen");
  if (subtitle) subtitle.textContent = "Shembull i paketës — pa kontroll mjekësor";
}
await import("./flow.js");
