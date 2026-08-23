// Der Verkaufsteil der Lead-Landing: alles nach dem persoenlichen Teil.
//
// Reine String-Funktionen wie in lead-landing-sections.js - rein Daten, raus
// HTML. Kein DOM-Zugriff, kein Zustand, kein Schreibpfad.
//
// Warum diese Bildschirme in einer eigenen Datei stehen: Der persoenliche
// Teil (Profil, Postimet, Fokus, Menue) bildet die echte App nach und aendert
// sich nur, wenn sich die App aendert. Der Verkaufsteil dagegen aendert sich,
// wenn sich das Angebot aendert. Zwei Gruende, aus zwei Richtungen - in einer
// Datei haetten sie sich dauernd gegenseitig im Weg gestanden.
//
// Die Reihenfolge ist die Geschichte, und sie hat genau eine Pointe:
//
//   Was ist Mnyra?  ->  Das kann es, alles davon kostenlos  ->  0 €
//   ->  Wenn Sie keine Arbeit damit wollen: 150 € einmalig
//   ->  Optionale Zusatzfunktionen  ->  Entscheidung
//
// Der wichtigste Punkt der ganzen Seite ist die Trennung dazwischen: Mnyra
// ist gratis, der Dienst daneben ist ein Dienst. Verschwimmt das auch nur an
// einer Stelle, liest der Wirt rueckwaerts - "also war das Kostenlose doch
// ein Koeder" - und die Seite hat sich selbst widerlegt. Deshalb steht vor
// dem ersten Preis ein eigener Bildschirm, der nichts anderes tut, als die
// beiden auseinanderzuhalten (renderServiceIntro), und deshalb steht auf dem
// Preisbildschirm noch einmal, dass Mnyra kostenlos bleibt.

import {
  esc,
  formatPrice,
  splitBrandName,
  text,
  whatsappUrl
} from "./lead-landing-format.js";
import { icon } from "./lead-landing-icons.js";
import { IMG_FALLBACK, LOGO_FALLBACK, img, sectionHead } from "./lead-landing-sections.js";
import {
  LEAD_LANDING_ADS_PRICE_FALLBACK,
  LEAD_LANDING_EXTRA_PHOTOS,
  LEAD_LANDING_FREE_FEATURES,
  LEAD_LANDING_PHOTOS_PER_PRODUCT,
  LEAD_LANDING_QR_EXTRA_EUR,
  LEAD_LANDING_QR_INCLUDED,
  LEAD_LANDING_SERVICE_EUR,
  formatEuro,
  goStartingPrice,
  goTopPrice,
  orderPrice
} from "./lead-landing-prices.js";

// Die Aufnahmen der echten App liegen im Ordner der Landing, die Bilder der
// uebrigen Funktionen dort, wo die App sie ohnehin hat. Beide Ordner werden
// mit "immutable" ausgeliefert (vercel.json) - ein ausgetauschtes Bild
// braucht deshalb einen neuen Dateinamen.
const MEDIA = "/apps/menyra-social/lead-landing/media";
const APP_ASSETS = "/apps/menyra-social/assets";

/* ------------------------------------------------------------ Bausteine */

// Der Preis des Dienstes steht an vier Stellen auf der Seite. Er kommt aus
// einer Quelle, damit er nicht an dreien stimmt und an einer nicht.
function servicePrice(sales = {}) {
  return text(sales.servicePrice) || formatEuro(LEAD_LANDING_SERVICE_EUR);
}

function qrExtraPrice(sales = {}) {
  return text(sales.qrExtraPrice) || formatEuro(LEAD_LANDING_QR_EXTRA_EUR);
}

// Der Weg zu uns. Steht im Lead keine eigene Nummer, gilt die des Lokals -
// dieselbe Regel wie vorher beim Fragebogen.
function contactUrl(profile = {}, sales = {}, message = "") {
  return whatsappUrl(text(sales.contactPhone) || text(profile.phone), message);
}

// Ein Knopf, der auch dann noch ein Knopf ist, wenn keine Nummer hinterlegt
// ist: Dann fuehrt er nirgendwohin, wird aber trotzdem gedrueckt - und die
// Messung erfaehrt, wofuer der Wirt sich entschieden hat. Ein Knopf, der bei
// fehlender Nummer ganz verschwindet, nimmt der Auswertung genau die eine
// Zahl, um die es geht.
function cta(url, { className = "", answer = "", label = "" }) {
  const cls = `ll-cta${className ? ` ${className}` : ""}`;
  const mark = answer ? ` data-answer="${esc(answer)}"` : "";
  if (!url) {
    return `<button type="button" class="${cls}"${mark}>${esc(label)}</button>`;
  }
  return `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer"${mark}>${esc(label)}</a>`;
}

// Ein Kapitelwechsel: ein Satz, ein Pfeil, sonst nichts. Er darf leer sein -
// das ist seine Aufgabe. Wer hier nichts liest, merkt, dass etwas Neues
// anfaengt, und genau das soll er merken.
function chapter({ track, lead, brand, sub = "", canvas = "" }) {
  return `
    <section class="ll-section ll-chapter" data-track="${esc(track)}"${canvas ? ` data-canvas="${esc(canvas)}"` : ""}>
      <p class="ll-chapter__text">${esc(lead)} <span class="ll-chapter__brand">${esc(brand)}</span></p>
      ${sub ? `<p class="ll-chapter__sub">${esc(sub)}</p>` : ""}
      <span class="ll-chapter__arrow">${icon("chevron-down", { size: 22 })}</span>
    </section>
  `;
}

// Wischbare Karten. Eine Karte je Wisch, die naechste schaut hervor - so
// sieht man, dass es weitergeht, ohne dass es jemand dazuschreiben muss.
// Die Punkte darunter sagen, wie weit; gesetzt werden sie von
// lead-landing-swipe.js, hier steht nur ihre Zahl.
function deck(cards) {
  return `
    <div class="ll-deck" data-deck>
      <div class="ll-deck__track" data-deck-track>
        ${cards.map((card) => `<article class="ll-deck__card">${card}</article>`).join("")}
      </div>
      <div class="ll-deck__dots" data-deck-dots aria-hidden="true">
        ${cards.map((_, index) => `<span class="ll-deck__dot${index === 0 ? " is-active" : ""}"></span>`).join("")}
      </div>
    </div>
  `;
}

function deckCard({ visual, title, body, foot = "" }) {
  return `
    <div class="ll-deck__visual">${visual}</div>
    <div class="ll-deck__text">
      <h3 class="ll-deck__title">${esc(title)}</h3>
      <p class="ll-deck__body">${esc(body)}</p>
      ${foot}
    </div>
  `;
}

// Eine Aufnahme der echten App im quadratischen Rahmen der Karte. Die Masse
// stehen im Markup, damit die Karte beim Laden nicht die Hoehe wechselt.
function shot(file, alt) {
  return `<img class="ll-deck__shot" src="${MEDIA}/${esc(file)}" alt="${esc(alt)}" width="880" height="880" loading="lazy" decoding="async" />`;
}

// Eine Kette aus Schritten: QR -> Menu -> Produkt. Sie erklaert einen Weg in
// der Breite einer Karte, wofuer ein Satz drei Zeilen braeuchte.
function flow(steps = []) {
  return `
    <div class="ll-flow">
      ${steps.map((step, index) => `
        ${index ? `<span class="ll-flow__arrow" aria-hidden="true">${icon("arrow-right", { size: 13 })}</span>` : ""}
        <span class="ll-flow__step">${esc(step)}</span>
      `).join("")}
    </div>
  `;
}

// Preis- oder Zustandszeile am Fuss einer Karte.
function deckFoot(label, { soon = false } = {}) {
  return `<p class="ll-deck__foot${soon ? " ll-deck__foot--soon" : ""}">${esc(label)}</p>`;
}

/* ---------------------------------------------- Die Fotos dieses Lokals */

// Woher die Fotos auf "1 produkt -> 6 foto profesionale" kommen, in dieser
// Reihenfolge:
//
// 1. Was im Lead gepflegt ist (landingSales.productPhotos). Das sticht alles
//    andere - wer die Aufnahmen fuer dieses Gespraech vorbereitet hat, will
//    genau die sehen.
// 2. Sonst die echten Aufnahmen des ersten Produkts, das ueberhaupt welche
//    hat. Ein Wirt erkennt sein eigenes Essen: Sechs leere Kacheln erklaeren
//    ihm, was er bekommt; sechs Aufnahmen seines eigenen Gerichts zeigen es
//    ihm an der Sache, um die es geht.
// 3. Und erst wenn es auch die nicht gibt, eine ruhige Kachel.
//
// Die zehn Zugaben haben keinen eigenen Bildschirm mehr: Sie stehen als Zeile
// im Paket, dort wo der Wirt den Preis sieht. Ein zweites Kachelraster
// erklaerte dasselbe noch einmal und schob den Preis einen Wisch weiter weg.

function photoEntries(urls = []) {
  return urls.filter(Boolean).map((url) => ({ url, caption: "" }));
}

// Das erste Produkt mit Aufnahmen - nicht einfach menuItems[0]: Wer sein
// erstes Produkt ohne Foto gepflegt hat, bekaeme sonst einen leeren
// Bildschirm, obwohl das zweite drei Aufnahmen traegt.
function firstProductPhotos(menuItems = []) {
  const item = menuItems.find((entry) => (Array.isArray(entry?.imageUrls) ? entry.imageUrls : []).length)
    || menuItems.find((entry) => text(entry?.imageUrl));
  if (!item) return [];
  const list = Array.isArray(item.imageUrls) && item.imageUrls.length
    ? item.imageUrls
    : [item.imageUrl];
  return photoEntries(list);
}

// Was der Bildschirm "1 produkt -> 6 foto" zeigt.
function servicePhotos(sales = {}, menuItems = []) {
  const gepflegt = Array.isArray(sales.productPhotos) ? sales.productPhotos : [];
  const list = gepflegt.length ? gepflegt : firstProductPhotos(menuItems);
  return list.slice(0, LEAD_LANDING_PHOTOS_PER_PRODUCT);
}

// Bildkacheln. Was weder gepflegt noch im Lokal vorhanden ist, bleibt eine
// ruhige Flaeche mit einem Kamerasymbol - nicht ein fremdes Foto, das so
// aussaehe, als waere es schon das eigene.
function tiles(list = [], count = 0, { size = 18 } = {}) {
  const out = [];
  for (let index = 0; index < count; index += 1) {
    const entry = list[index];
    out.push(entry && entry.url
      ? `<span class="ll-tile">${img(entry.url, entry.caption || "Foto profesionale", IMG_FALLBACK)}</span>`
      : `<span class="ll-tile ll-tile--empty" aria-hidden="true">${icon("camera", { size })}</span>`);
  }
  return out.join("");
}

/* ------------------------------------------------ 6 - Der Kapitelwechsel */

// Hier endet der persoenliche Teil. Der Bildschirm ist mit Absicht fast leer:
// Er trennt "das ist Ihr Lokal" von "das ist Mnyra", und eine Trennung, auf
// der noch etwas erklaert wird, trennt nichts.
export function renderChapterWhat() {
  return chapter({
    track: "cka-eshte",
    lead: "Çka është",
    brand: "Mnyra?",
    canvas: "#ffffff"
  });
}

/* --------------------------------------- 7 - Was Mnyra kostenlos kann */

// Fuenf Karten, eine je Wisch. Wenig Text, ein Bild aus der echten App -
// der Wirt soll sehen, nicht lesen.
//
// Die Tischbestellung fehlt hier bewusst: Sie ist eine kostenpflichtige
// Zusatzfunktion und steht weiter unten (renderPaidFeatures). Stuende sie
// zwischen den kostenlosen, waere die Trennung schon auf diesem Bildschirm
// kaputt - und sie ist der Punkt der ganzen Seite.
function deliveryCard(profile = {}, menuItems = []) {
  const item = menuItems.find((entry) => text(entry.imageUrl)) || menuItems[0] || null;
  const hasWolt = Boolean(text(profile.woltUrl) || text(item?.woltUrl));
  const label = hasWolt ? "Porosit në Wolt" : "Porosit për delivery";
  const name = text(item?.name) || "Produkti juaj";
  const price = item && item.price !== null && item.price !== undefined
    ? formatPrice(item.price, profile.currency || "EUR")
    : "";

  const visual = `
    <div class="ll-mock">
      <span class="ll-mock__media">${img(item?.imageUrl, name, IMG_FALLBACK)}</span>
      <div class="ll-mock__row">
        <span class="ll-mock__name">${esc(name)}</span>
        ${price ? `<span class="ll-mock__price">${esc(price)}</span>` : ""}
      </div>
      <span class="ll-mock__cta">
        ${icon("truck", { size: 15 })}
        <span>${esc(label)}</span>
        ${icon("external-link", { size: 13 })}
      </span>
    </div>
  `;

  return deckCard({
    visual,
    title: "Porosi për delivery",
    body: "Nga produkti, klienti vazhdon direkt në Wolt ose te shërbimi i delivery që përdorni."
  });
}

export function renderFreeFeatures(profile = {}, menuItems = []) {
  const cards = [
    deckCard({
      visual: shot("mnyra-feed.webp", "Feed dhe story në Mnyra"),
      title: "Feed & Story",
      body: "Postime, story dhe oferta nga lokalet — edhe lokali juaj shfaqet aty."
    }),
    deckCard({
      visual: shot("mnyra-lista.webp", "Kërkimi dhe lista e lokaleve"),
      title: "Kërko & Lokalet",
      body: "Klientët kërkojnë lokale dhe ushqim në qytetin e tyre dhe ju gjejnë më lehtë."
    }),
    deckCard({
      visual: shot("mnyra-harta.webp", "Harta e lokaleve"),
      title: "Harta",
      body: "Klientët shohin lokalet pranë tyre dhe ju gjejnë direkt në hartë."
    }),
    deckCard({
      visual: shot("mnyra-menyja.webp", "Profili dhe menuja"),
      title: "Profili & Menuja",
      body: "Fotot, postimet, orari, lokacioni, menuja dhe çmimet — të gjitha në një vend."
    }),
    deliveryCard(profile, menuItems)
  ];

  return `
    <section class="ll-section ll-decksection" data-track="falas-funksionet" data-canvas="#ffffff">
      ${sectionHead("Çka është Mnyra?", "Gjithçka që i duhet një lokali për t'u prezantuar online.")}
      ${deck(cards)}
    </section>
  `;
}

/* ---------------------------------------------------- 8 - Der Nullpreis */

// Der wichtigste Bildschirm des ersten Teils. Er beantwortet die einzige
// Frage, die ein Wirt beim Lesen wirklich mitfuehrt - "und was kostet das?" -
// und er beantwortet sie, bevor sie jemand stellt.
export function renderZeroPrice() {
  return `
    <section class="ll-section ll-zero" data-track="zero-euro" data-canvas="#ffffff">
      <p class="ll-zero__kicker">Dhe më e mira?</p>
      <p class="ll-zero__price">0 €</p>
      <p class="ll-zero__claim">
        Mnyra është falas.<br />
        Dhe mbetet falas.
      </p>
      <p class="ll-zero__list">${LEAD_LANDING_FREE_FEATURES.map((entry) => esc(entry)).join(" · ")}</p>
      <p class="ll-zero__note">Pa abonim. Pa kontratë.</p>
    </section>
  `;
}

/* ------------------------------------------- 9 - Die Trennung zum Dienst */

// Zwischen "kostenlos" und dem ersten Preis steht dieser Bildschirm, und er
// steht dort allein. Oben, was gilt: Mnyra bleibt kostenlos, und der Wirt
// kann alles selbst machen. Darunter, mit sichtbarem Abstand, das Angebot -
// als Angebot erkennbar, nicht als Bedingung.
export function renderServiceIntro() {
  return `
    <section class="ll-section ll-split" data-track="sherbimi-hyrje">
      <div class="ll-split__free">
        <p class="ll-split__freetitle">Mnyra mbetet falas.</p>
        <p class="ll-split__freebody">Profilin dhe menunë mund t'i përgatisni vetë — falas.</p>
      </div>

      <span class="ll-split__rule" aria-hidden="true"></span>

      <div class="ll-split__offer">
        <p class="ll-split__q">S'keni kohë?</p>
        <p class="ll-split__a">Ne e bëjmë komplet për ju.</p>
        <p class="ll-split__note">Shërbim profesional dhe plotësisht opsional.</p>
      </div>
    </section>
  `;
}

/* -------------------------------------------- 10 - Was der Dienst leistet */

// Der Gegenwert kommt vor dem Preis. Sechs Aufnahmen desselben Gerichts sind
// etwas, das ein Wirt sofort einschaetzen kann - eine Zahl daneben braucht
// er dafuer nicht.
export function renderServicePhotos(sales = {}, menuItems = []) {
  const photos = servicePhotos(sales, menuItems);
  return `
    <section class="ll-section ll-photos" data-track="foto-profesionale">
      ${sectionHead("Menuja juaj. Profesionalisht.", "Ne e përgatisim komplet për ju.")}

      <p class="ll-photos__claim">
        <span>1 produkt</span>
        <span class="ll-photos__arrow" aria-hidden="true">${icon("arrow-right", { size: 16 })}</span>
        <span class="ll-photos__count">${LEAD_LANDING_PHOTOS_PER_PRODUCT} foto profesionale</span>
      </p>

      <div class="ll-photos__grid">
        ${tiles(photos, LEAD_LANDING_PHOTOS_PER_PRODUCT)}
      </div>
    </section>
  `;
}

/* ------------------------------------------ 11 - Was wir konkret uebernehmen */

const PER_PRODUCT = [
  `${LEAD_LANDING_PHOTOS_PER_PRODUCT} foto profesionale`,
  "Emri i produktit",
  "Përshkrimi i plotë",
  "Përbërësit",
  "Alergjenët, nëse ka",
  "Çmimi",
  "Linku i Wolt/delivery, nëse ka"
];

const PER_MENU = [
  "Produktet i shtojmë ne",
  "Fotot i vendosim ne",
  "Përshkrimet i përgatisim ne",
  "Çmimet i bartim ne",
  "Linqet e delivery i vendosim ne",
  "Menuja gati në Mnyra"
];

function scopeList(label, entries) {
  return `
    <div class="ll-scope__block">
      <p class="ll-scope__label">${esc(label)}</p>
      <ul class="ll-scope__list">
        ${entries.map((entry) => `<li>${icon("check", { size: 13 })}<span>${esc(entry)}</span></li>`).join("")}
      </ul>
    </div>
  `;
}

export function renderServiceScope() {
  return `
    <section class="ll-section ll-scope" data-track="cka-bejme">
      <h2 class="ll-scope__head">
        Ju na dërgoni menunë.<br />
        <span>Ne e bëjmë pjesën tjetër.</span>
      </h2>
      ${scopeList("Për çdo produkt", PER_PRODUCT)}
      ${scopeList("Për komplet menunë", PER_MENU)}
    </section>
  `;
}

/* ------------------------------------------------ 13 - Die QR-Aufsteller */

// Was diese QR-Codes tun, steht hier so genau, weil sie sonst mit der
// Tischbestellung verwechselt werden: Sie oeffnen die Menue. Bestellen kann
// der Gast damit noch nicht - das ist die Zusatzfunktion weiter unten, und
// sie kostet.
export function renderQrStands(sales = {}) {
  const photo = Array.isArray(sales.qrPhotos) ? sales.qrPhotos[0] : null;
  const src = text(photo?.url) || `${APP_ASSETS}/panel/qr-stand.jpg`;

  return `
    <section class="ll-section ll-qr" data-track="qr-tavolina">
      <span class="ll-qr__media">${img(src, "QR kodi në tavolinë", IMG_FALLBACK)}</span>

      <h2 class="ll-h2">+ ${LEAD_LANDING_QR_INCLUDED} QR kode për tavolina</h2>
      <p class="ll-lead">Klienti skanon dhe hap direkt menunë tuaj digjitale.</p>

      ${flow(["QR", "MENU"])}

      <div class="ll-qr__facts">
        <span class="ll-qr__fact"><b>${LEAD_LANDING_QR_INCLUDED}</b> të përfshira</span>
        <span class="ll-qr__fact">Çdo QR shtesë: <b>${esc(qrExtraPrice(sales))}</b></span>
      </div>
    </section>
  `;
}

/* ------------------------------------------------- 14 - Der Preis dafuer */

export function renderServicePrice(profile = {}, sales = {}) {
  const price = servicePrice(sales);
  const url = contactUrl(profile, sales, `Përshëndetje! Dua menunë profesionale (${price}) për ${text(profile.name)}.`);

  // Was im Paket steckt. Die zehn Zugaben stehen hier und nicht mehr auf einem
  // eigenen Bildschirm: Ein Wirt liest an dieser Stelle, wofuer er zahlt -
  // dort gehoert jede Position hin, auch die, die niemand vorfuehren muss.
  const includes = [
    `${LEAD_LANDING_PHOTOS_PER_PRODUCT} foto për çdo produkt`,
    "Komplet menuja",
    `+${LEAD_LANDING_EXTRA_PHOTOS} foto ekstra, sipas zgjedhjes suaj`,
    `+${LEAD_LANDING_QR_INCLUDED} QR për tavolina`
  ];

  return `
    <section class="ll-section ll-price" data-track="cmimi-sherbimit">
      <p class="ll-price__kicker">Komplet shërbimi</p>
      <p class="ll-price__value">${esc(price)}</p>
      <p class="ll-price__once">Vetëm një herë.</p>

      <ul class="ll-price__list">
        ${includes.map((entry) => `<li>${icon("check", { size: 13 })}<span>${esc(entry)}</span></li>`).join("")}
      </ul>

      <p class="ll-price__own">Fotot janë tuajat — mund t'i përdorni edhe jashtë Mnyra.</p>

      <div class="ll-price__free">
        <p class="ll-price__freetitle">Mnyra vazhdon të jetë falas.</p>
        <p class="ll-price__freebody">${esc(price)} paguhet vetëm nëse dëshironi që ne ta përgatisim gjithçka për ju.</p>
      </div>

      ${cta(url, { className: "ll-cta--main", label: `Dua menunë profesionale — ${price}` })}
    </section>
  `;
}

/* ------------------------------------------- 15 - Uebergang zu den Extras */

export function renderChapterMore() {
  return chapter({
    track: "me-shume",
    lead: "Dëshironi",
    brand: "më shumë?",
    sub: "Funksione shtesë — vetëm nëse ju duhen."
  });
}

/* --------------------------------------- 16 - Die kostenpflichtigen Extras */

// Was hier steht, gehoert nicht zu den kostenlosen Grundfunktionen. Deshalb
// traegt jede Karte ihren Preis, und deshalb steht die Tischbestellung hier
// und nicht oben: Die zehn QR-Codes aus dem Dienst oeffnen die Menue - erst
// diese Funktion macht daraus eine Bestellung.
//
// Was es noch nicht gibt, wird auch nicht so gezeigt, als gaebe es das
// schon (Mnyra SAVE steht auf "Së shpejti"). Eine erfundene Funktion faellt
// spaetestens beim ersten Nachfragen auf, und dann faellt die ganze Seite
// mit ihr.
export function renderPaidFeatures(sales = {}) {
  const adsPrice = text(sales.adsPrice) || LEAD_LANDING_ADS_PRICE_FALLBACK;

  const cards = [
    deckCard({
      visual: `
        ${shot("mnyra-tavolina.webp", "Porosia nga tavolina")}
        ${flow(["QR", "Menu", "Produkt", "Shporta", "Porosia"])}
      `,
      title: "Porosi nga tavolina",
      body: "Klienti skanon QR kodin, zgjedh produktet dhe dërgon porosinë direkt nga tavolina.",
      foot: deckFoot(`${orderPrice()} për çdo produkt të porositur`)
    }),
    deckCard({
      visual: `<img class="ll-deck__shot ll-deck__shot--wide" src="${APP_ASSETS}/go/story-3-oferta.webp" alt="Mnyra GO" width="1600" height="900" loading="lazy" decoding="async" />`,
      title: "Mnyra GO",
      body: "Klienti thotë ku është dhe sa veta janë. Ju i dërgoni një ofertë — dhe ai vjen te ju.",
      foot: deckFoot(`${goStartingPrice()} – ${goTopPrice()} për ofertë të pranuar`)
    }),
    deckCard({
      visual: `<span class="ll-deck__soon">${icon("clock", { size: 26 })}</span>`,
      title: "Mnyra SAVE",
      body: "Ushqimi që ju mbetet në fund të ditës, i ofruar me çmim më të ulët në vend që të hidhet.",
      foot: deckFoot("Së shpejti", { soon: true })
    }),
    deckCard({
      visual: shot("mnyra-ofertat.webp", "Reklama në Mnyra"),
      title: "Reklama në Mnyra",
      body: "Promovoni lokalin, ofertën ose produktet tuaja para më shumë klientëve.",
      foot: deckFoot(adsPrice)
    })
  ];

  return `
    <section class="ll-section ll-decksection" data-track="funksione-shtesa">
      ${sectionHead("Funksione shtesë", "Nuk janë pjesë e Mnyra falas. I merrni vetëm nëse ju duhen.")}
      ${deck(cards)}
    </section>
  `;
}

/* ------------------------------------------------------ 17 - Die Entscheidung */

// Zwei Wege, beide sichtbar. Der kostenlose steht bewusst nicht kleiner
// gedruckt darunter versteckt - er ist die Tuer, durch die die meisten
// hereinkommen, und wer ihn suchen muss, geht wieder.
//
// Gedrueckt wird hier auch die Messung: Welchen der beiden Wege der Wirt
// waehlt, ist die eine Zahl, um die es auf dieser Seite geht
// (lead-landing-app.js haengt sich an data-answer).
export function renderDecision(profile = {}, sales = {}) {
  const parts = splitBrandName(profile.name);
  const c1 = text(profile.businessNameColorPart1) || "#111827";
  const c2 = text(profile.businessNameColorPart2) || "#4f46e5";
  const price = servicePrice(sales);
  const name = text(profile.name);

  const paidUrl = contactUrl(profile, sales, `Përshëndetje! Dua paketën profesionale (${price}) për ${name}.`);
  const freeUrl = contactUrl(profile, sales, `Përshëndetje! Dua ta aktivizoj profilin falas të ${name} në Mnyra.`);

  const slug = text(profile.publicSlug);
  const profileUrl = slug ? `https://www.mnyra.com/${encodeURIComponent(slug)}` : "";

  return `
    <section class="ll-section ll-decide" data-track="vendimi" data-decide>
      <div class="ll-decide__id">
        <span class="ll-decide__logo">${img(profile.logoUrl, `${name} logo`, LOGO_FALLBACK)}</span>
        <p class="ll-decide__name">
          <span style="color:${esc(c1)}">${esc(parts.part1)}</span>${parts.part2 ? `<span style="color:${esc(c2)}">${esc(parts.part2)}</span>` : ""}
        </p>
      </div>

      <h2 class="ll-decide__title">Profili juaj është gati.</h2>
      <p class="ll-lead">Zgjidhni si dëshironi të vazhdoni.</p>

      <div class="ll-decide__choices">
        ${cta(paidUrl, { className: "ll-cta--main", answer: "paketa", label: `Dua paketën profesionale — ${price}` })}
        ${cta(freeUrl, { className: "ll-cta--ghost", answer: "falas", label: "Aktivizo profilin falas" })}
      </div>

      <p class="ll-decide__note">0 € · Pa kontratë</p>

      ${profileUrl
    ? `<a class="ll-decide__profile" href="${esc(profileUrl)}" target="_blank" rel="noopener noreferrer">
            ${icon("external-link", { size: 16 })}
            <span>Vizito profilin tuaj</span>
          </a>`
    : ""}
    </section>
  `;
}
