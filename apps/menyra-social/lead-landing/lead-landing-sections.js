// Section-Renderer der Lead-Landing.
//
// Reine String-Funktionen: rein Daten, raus HTML. Kein DOM-Zugriff, kein
// State, keine Schreibpfade. Die Profil-, Menue- und Modal-Ansichten sind
// originalgetreue Nachbildungen der echten App-Oberflaeche mit den echten
// Daten des Kunden - aber als eigenes Markup, damit die Landing den echten
// Renderpfad nicht anfassen kann.

import {
  esc,
  formatCount,
  formatPrice,
  mapsUrl,
  socialUrl,
  splitBrandName,
  text,
  whatsappUrl
} from "./lead-landing-format.js";
import { filledIcon, icon } from "./lead-landing-icons.js";

const GREETINGS = [
  "Mirë se vini",
  "Welcome",
  "Willkommen",
  "Bienvenido",
  "Bienvenue",
  "Benvenuto",
  "Olá",
  "Welkom",
  "Välkommen",
  "Hoş geldiniz",
  "Yōkoso",
  "Huānyíng",
  "Namaste"
];

const LOGO_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23f1f5f9'/%3E%3Ccircle cx='48' cy='48' r='30' fill='%2394a3b8'/%3E%3C/svg%3E";
const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='180'%3E%3Crect width='240' height='180' fill='%23f1f5f9'/%3E%3C/svg%3E";

const DEFAULT_PACKAGES = [
  {
    key: "start",
    name: "Start",
    price: "29",
    period: "€ / muaj",
    note: "Për të filluar digjitalisht - pa kosto fillestare.",
    highlight: false,
    features: [
      "Profili juaj publik në Mnyra",
      "Menu digjitale me foto e çmime",
      "QR kodet për tavolinat",
      "Postimet dhe feed-i social",
      "Vendndodhja në hartën e zbulimit"
    ]
  },
  {
    key: "pro",
    name: "Pro",
    price: "59",
    period: "€ / muaj",
    note: "Më i zgjedhuri - kur doni edhe porositë online.",
    highlight: true,
    features: [
      "Gjithçka nga paketa Start",
      "Porositë direkt te Waiter-i",
      "Cross-selling: më shumë për porosi",
      "Analitika e plotë e lokalit",
      "Wolt dhe dërgesa juaj",
      "Sot në fokus - rekomandimet e ditës"
    ]
  },
  {
    key: "premium",
    name: "Premium",
    price: "99",
    period: "€ / muaj",
    note: "Për lokalet që duan të dominojnë qytetin.",
    highlight: false,
    features: [
      "Gjithçka nga paketa Pro",
      "Prioritet në hartë dhe kërkim",
      "Reklama brenda Mnyra",
      "Menaxhim i plotë i menusë nga ne",
      "Mbështetje me përparësi"
    ]
  }
];

function img(src, alt = "", fallback = IMG_FALLBACK) {
  const safeSrc = text(src) || fallback;
  return `<img src="${esc(safeSrc)}" alt="${esc(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'" />`;
}

function callout(index, title, body) {
  return `
    <div class="ll-callout">
      <span class="ll-callout__num">${index}</span>
      <div>
        <p class="ll-callout__title">${esc(title)}</p>
        <p class="ll-callout__body">${esc(body)}</p>
      </div>
    </div>
  `;
}

function feature(iconName, title, body) {
  return `
    <div class="ll-feature">
      <span class="ll-feature__icon">${icon(iconName, { size: 20 })}</span>
      <div>
        <p class="ll-feature__title">${esc(title)}</p>
        <p class="ll-feature__body">${esc(body)}</p>
      </div>
    </div>
  `;
}

function sectionHead(eyebrow, title, lead) {
  return `
    <p class="ll-eyebrow">${esc(eyebrow)}</p>
    <h2 class="ll-h2">${esc(title)}</h2>
    ${lead ? `<p class="ll-lead">${esc(lead)}</p>` : ""}
  `;
}

// Ein erklaerendes Kapitel: die Szene bleibt beim Scrollen stehen und wird
// Schritt fuer Schritt erlaeutert. steps[0] ist die Gesamtansicht (ohne
// Fokus), danach hebt jeder Schritt einen Teil hervor.
//
// steps: [{ focus, label, title, body }] - focus "" laesst alles hell.
function stage({ eyebrow, title, scene, steps = [] }) {
  const focusSteps = Math.max(1, steps.length - 1);
  // Schritt 0 traegt Kapitelmarke und Titel. So gibt es nur einen Textblock
  // und er steht immer an derselben Stelle - die Szene bekommt den Rest.
  const allSteps = steps.map((step, index) => (index === 0
    ? { ...step, label: eyebrow, title }
    : step));
  return `
    <section class="ll-stage" data-steps="${focusSteps}" style="--ll-steps:${focusSteps};">
      <div class="ll-stage__pin">
        <div class="ll-stage__scene">${scene}</div>

        <div class="ll-stage__caption">
          ${allSteps.map((step, index) => `
            <div class="ll-stage__step${index === 0 ? " is-active" : ""}" data-focus="${esc(step.focus || "")}">
              ${step.label ? `<p class="ll-stage__step-label">${esc(step.label)}</p>` : ""}
              ${step.title ? `<p class="ll-stage__step-title">${esc(step.title)}</p>` : ""}
              <p class="ll-stage__step-body">${esc(step.body || "")}</p>
            </div>
          `).join("")}
        </div>

        <div class="ll-stage__bar"><span></span></div>
      </div>

      ${allSteps.map((_, index) => `
        <div class="ll-stage__anchor" aria-hidden="true" style="top: calc(${index} * 100svh);"></div>
      `).join("")}
    </section>
  `;
}

/* ---------------------------------------------------------------- Hero */

export function renderHero(profile = {}) {
  const parts = splitBrandName(profile.name);
  const c1 = text(profile.businessNameColorPart1) || "#111827";
  const c2 = text(profile.businessNameColorPart2) || "#4f46e5";

  return `
    <header class="ll-section ll-hero">
      <div class="ll-hero__glow" aria-hidden="true"></div>

      <div class="ll-greet" aria-live="polite">
        ${GREETINGS.map((greeting, index) => `
          <h1 class="ll-greet__item${index === 0 ? " is-active" : ""}" data-greet="${index}">${esc(greeting)}</h1>
        `).join("")}
      </div>

      <div class="ll-brand">
        <span class="ll-brand__logo">${img(profile.logoUrl, `${profile.name} logo`, LOGO_FALLBACK)}</span>
        <h2 class="ll-brand__name">
          <span style="color:${esc(c1)}">${esc(parts.part1)}</span>${parts.part2 ? `<span style="color:${esc(c2)}">${esc(parts.part2)}</span>` : ""}
        </h2>
      </div>

      <p class="ll-lead" style="max-width:340px;margin-bottom:0;position:relative;z-index:2;">
        Lokali juaj është përgatitur tashmë në Mnyra.<br />
        Kjo faqe ju tregon saktësisht se çfarë keni marrë - dhe si funksionon.
      </p>

      <div class="ll-scroll-hint">
        <span>Rrëshqit poshtë</span>
        ${icon("chevron-down", { size: 22 })}
      </div>
    </header>
  `;
}

/* --------------------------------------------------------------- Intro */

export function renderIntro(profile = {}) {
  const city = text(profile.city) || "qytetin tuaj";
  return `
    <section class="ll-section">
      ${sectionHead(
    "Çfarë është Mnyra",
    "Lokali juaj, digjital - në një vend.",
    `Mnyra është rrjeti ku klientët në ${city} gjejnë ku të hanë, shohin menunë, porosisin dhe ju ndjekin. Ju nuk keni nevojë për ueb-faqe, aplikacion apo programues.`
  )}
      <div class="ll-card ll-card--pad">
        ${feature("smartphone", "Çfarë", "Një profil publik me menu, postime, porosi dhe hartë - i gatshëm sot.")}
        ${feature("qr", "Si", "Klienti skanon QR kodin në tavolinë ose hap linkun tuaj. Pa shkarkim, pa regjistrim.")}
        ${feature("map-pin", "Ku", `Në lokal, në hartën e zbulimit dhe kudo ku e ndani linkun - Instagram, TikTok, WhatsApp.`)}
      </div>
      <p class="ll-note">Çdo gjë që shihni më poshtë janë të dhënat tuaja reale. Kjo faqe vetëm i tregon - nuk ndryshon asgjë në profilin tuaj.</p>
    </section>
  `;
}

/* -------------------------------------------------------------- Profil */

export function renderProfile(profile = {}) {
  const igUrl = socialUrl("instagram", profile.instagramUrl || profile.instagram);
  const ttUrl = socialUrl("tiktok", profile.tiktokUrl || profile.tiktok);
  const fbUrl = socialUrl("facebook", profile.facebookUrl || profile.facebook);
  const primaryLocation = Array.isArray(profile.locations) ? profile.locations[0] : null;
  const geoUrl = mapsUrl({ lat: primaryLocation?.lat, lng: primaryLocation?.lng, address: profile.address });
  const typeLabel = text(profile.type).toUpperCase() || "BUSINESS";
  const cityLabel = text(profile.city).toUpperCase();

  const socialButtons = [
    geoUrl ? `<span class="ll-socialbtn">${icon("map", { size: 16 })}</span>` : "",
    ttUrl ? `<span class="ll-socialbtn">${icon("music", { size: 16 })}</span>` : "",
    igUrl ? `<span class="ll-socialbtn">${icon("instagram", { size: 16 })}</span>` : "",
    fbUrl ? `<span class="ll-socialbtn">${icon("facebook", { size: 16 })}</span>` : ""
  ].filter(Boolean).join("");

  // Die ganze Karte bleibt sichtbar - data-spot markiert die Teile, die
  // beim Scrollen nacheinander hervorgehoben werden.
  const scene = `
    <div class="ll-card ll-profile" aria-label="Profili juaj">
      <div class="ll-profile__cover">
        <span data-spot="identity" class="ll-profile__coverimg">${img(profile.coverUrl, "Ballina")}</span>
        <span class="ll-profile__scrim"></span>
        <span class="ll-profile__fade"></span>
        ${socialButtons ? `<div class="ll-profile__socials" data-spot="social">${socialButtons}</div>` : ""}
      </div>

      <div class="ll-profile__body">
        <div class="ll-profile__toprow">
          <span class="ll-profile__avatar" data-spot="identity">${img(profile.logoUrl, `${profile.name} logo`, LOGO_FALLBACK)}</span>
          <div class="ll-profile__meta" data-spot="fans">
            <span class="ll-metric">
              <span class="ll-metric__value">${esc(formatCount(profile.followers))}</span>
              <span class="ll-metric__label">Fans</span>
            </span>
            <span class="ll-metric__divider"></span>
            <span class="ll-metric">
              <span class="ll-metric__icon">${icon("info", { size: 20 })}</span>
              <span class="ll-metric__icon-label">Info</span>
            </span>
          </div>
        </div>

        <div class="ll-profile__nameblock" data-spot="identity">
          <h3 class="ll-profile__name">${esc(profile.name)}</h3>
          <p class="ll-profile__bio">${esc(text(profile.bio) || "Nuk ka bio.")}</p>
          <p class="ll-profile__tag">${esc([cityLabel, typeLabel].filter(Boolean).join(" / "))}</p>
        </div>

        <div class="ll-profile__actions">
          <span class="ll-btn-primary" data-spot="follow">Ndiq</span>
          <span class="ll-btn-ghost" data-spot="chat">${icon("message", { size: 20 })}</span>
        </div>
      </div>
    </div>
  `;

  return stage({
    eyebrow: "Hapi 1",
    title: "Kështu ju sheh klienti.",
    scene,
    steps: [
      { focus: "", body: "Kjo është kartela juaj publike në Mnyra - me të dhënat tuaja reale. Rrëshqitni për ta parë pjesë pas pjese." },
      { focus: "identity", label: "Identiteti", title: "Logoja dhe emri juaj", body: "Ballina, logoja, emri dhe qyteti. Klienti e di menjëherë kush jeni dhe ku jeni." },
      { focus: "social", label: "Lidhjet", title: "Harta, TikTok, Instagram", body: "Një prekje - dhe klienti ka drejtimin në hartë ose rrjetet tuaja. Vendosen një herë, punojnë përgjithmonë." },
      { focus: "fans", label: "Numrat", title: "Fans dhe Info", body: "Sa njerëz ju ndjekin. Info hap adresën, orarin dhe kontaktet - pa e lënë profilin." },
      { focus: "follow", label: "Rritja", title: "NDIQ", body: "Klienti bëhet ndjekës me një prekje. Çdo postim i ri i shfaqet në feed - marketing që nuk paguhet dy herë." },
      { focus: "chat", label: "Kontakti", title: "Biseda direkt", body: "E çon klientin direkt te ju në WhatsApp. Rezervimet vijnë aty ku i lexoni gjithsesi." }
    ]
  });
}

/* ------------------------------------------------------ Kontakti & Info */

export function renderContact(profile = {}) {
  const primaryLocation = Array.isArray(profile.locations) ? profile.locations[0] : null;
  const address = text(primaryLocation?.address) || text(profile.address);
  const rows = [
    address ? { iconName: "map-pin", label: "Adresa", value: address } : null,
    text(profile.openingHours) ? { iconName: "clock", label: "Orari", value: profile.openingHours } : null,
    text(profile.instagram) ? { iconName: "instagram", label: "Instagram", value: profile.instagram } : null,
    text(profile.tiktok) ? { iconName: "music", label: "TikTok", value: profile.tiktok } : null,
    text(profile.phone) ? { iconName: "message", label: "Telefon", value: profile.phone } : null
  ].filter(Boolean);

  if (!rows.length) return "";

  return `
    <section class="ll-section">
      ${sectionHead("Kontakti & Info", "Gjithçka që klienti duhet të dijë.", "Kur klienti prek INFO, hapet kjo dritare - me të dhënat tuaja.")}

      <div class="ll-card ll-contact">
        <div>
          <h3 class="ll-contact__title">Kontakti &amp; Info</h3>
          <p class="ll-contact__place">${esc(text(profile.city).toUpperCase())}</p>
        </div>

        <div class="ll-contact__rows">
          ${rows.map((row) => `
            <div class="ll-contact__row">
              <span class="ll-contact__icon">${icon(row.iconName, { size: 16 })}</span>
              <div style="min-width:0;flex:1;">
                <span class="ll-contact__label">${esc(row.label)}</span>
                <span class="ll-contact__value">${esc(row.value)}</span>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="ll-contact__foot">
          <span class="ll-contact__back">Kthehu te profili</span>
        </div>
      </div>

      <div class="ll-stack">
        ${callout(1, "Ju e mbani të përditësuar", "Ndryshoni orarin ose adresën një herë - ndryshon kudo: në profil, në hartë, në QR kodin e tavolinës.")}
      </div>
    </section>
  `;
}

/* ------------------------------------------------------------ Postimet */

export function renderPosts(posts = []) {
  const visible = posts.slice(0, 4);

  const grid = visible.length
    ? `<div class="ll-grid">${visible.map((post) => `
        <div class="ll-post">
          ${img(post.imageUrl, text(post.caption) || "Postim")}
          <span class="ll-post__stats">
            <span>${filledIcon("heart", { size: 13, color: "#f43f5e" })} ${esc(formatCount(post.likeCount))}</span>
            <span>${icon("message", { size: 13 })} ${esc(formatCount(post.commentCount))}</span>
          </span>
        </div>
      `).join("")}</div>`
    : `<div class="ll-card ll-card--pad" style="text-align:center;">
        <p class="ll-callout__body">Sapo të ngarkoni postimin e parë, ai shfaqet këtu - dhe njëkohësisht në feed-in kryesor te të gjithë ndjekësit tuaj.</p>
      </div>`;

  const scene = `
    <div class="ll-tabs" data-spot="tabs" style="margin-bottom:14px;">
      <span class="ll-tab is-active">Postimet</span>
      <span class="ll-tab">Menu</span>
    </div>
    <div data-spot="grid">${grid}</div>
  `;

  return stage({
    eyebrow: "Hapi 2",
    title: "Postimet - atmosfera juaj.",
    scene,
    steps: [
      { focus: "", body: "Profili ka dy tabe. Këtu jeni te Postimet." },
      { focus: "tabs", label: "Ndarja", title: "Postimet & Menu", body: "Dy tabe e ndajnë profilin: Postimet tregojnë si ndihet lokali, Menu shet." },
      { focus: "grid", label: "Përmbajtja", title: "Postimet tuaja", body: "Foto e video si në Instagram - por brenda Mnyra. Klienti sheh atmosferën para se të vijë." },
      { focus: "", label: "Shpërndarja", title: "Feed-i kryesor", body: "Çdo postim shkon automatikisht te të gjithë ndjekësit tuaj në feed. Nuk paguani për shikime." }
    ]
  });
}

export function renderMenu(profile = {}, menuItems = [], focusItems = []) {
  const currency = profile.currency || "EUR";
  const cards = menuItems.slice(0, 2);

  const focusRow = focusItems.length
    ? `<div class="ll-focus-row">${focusItems.slice(0, 3).map((item) => `
        <article class="ll-focus">
          <div class="ll-focus__media">
            ${img(item.imageUrl, item.title)}
            <span class="ll-focus__badge">${icon("sparkles", { size: 13 })} Tipp</span>
          </div>
          <h4 class="ll-focus__title">${esc(item.title)}</h4>
          ${item.body ? `<p class="ll-focus__body">${esc(item.body)}</p>` : ""}
        </article>
      `).join("")}</div>`
    : "";

  const menuGrid = cards.length
    ? `<div class="ll-menu-grid">${cards.map((item) => `
        <article class="ll-menu-card">
          <div class="ll-menu-card__media">${img(item.imageUrl, item.name)}</div>
          <p class="ll-menu-card__name">${esc(item.name)}</p>
          ${item.price !== null ? `<p class="ll-menu-card__price">${esc(formatPrice(item.price, currency))}</p>` : ""}
        </article>
      `).join("")}</div>`
    : `<div class="ll-card ll-card--pad" style="text-align:center;">
        <p class="ll-callout__body">Menuja juaj vendoset një herë - ushqimi, pijet, koktejlet dhe kafeja - dhe është menjëherë e gjallë në çdo tavolinë.</p>
      </div>`;

  const categories = Array.from(new Set(menuItems.map((item) => text(item.category)).filter(Boolean))).slice(0, 6);

  const scene = `
    <div class="ll-tabs" data-spot="tabs" style="margin-bottom:14px;">
      <span class="ll-tab">Postimet</span>
      <span class="ll-tab is-active">Menu</span>
    </div>
    ${focusRow ? `<div data-spot="focus" style="margin-bottom:14px;">${focusRow}</div>` : ""}
    <div data-spot="cards">${menuGrid}</div>
  `;

  return stage({
    eyebrow: "Hapi 3",
    title: "Menu - këtu shitet.",
    scene,
    steps: [
      { focus: "", body: "Menu me foto e çmime. Gjithmonë e saktë, kurrë e vjetruar." },
      { focus: "focus", label: "Rekomandimet", title: "Sot në fokus", body: "Kartat me shenjën TIPP janë rekomandimet e ditës. Ju vendosni çfarë shitet më shumë - dhe e ndryshoni kur të doni." },
      {
        focus: "cards",
        label: "Struktura",
        title: "Kategoritë",
        body: categories.length
          ? `Menuja juaj është e ndarë në: ${categories.join(", ")}. Çdo kategori me foto dhe çmim.`
          : "Ushqimi, pijet, koktejlet, kafeja - çdo kategori e ndarë, me foto dhe çmim."
      },
      { focus: "", label: "Efekti", title: "Foto shesin", body: "Një pjatë me foto porositet dukshëm më shpesh se një rresht teksti në menu letre." }
    ]
  });
}

export function renderDish(profile = {}, menuItems = []) {
  const currency = profile.currency || "EUR";
  const dish = menuItems.find((item) => item.imageUrl && item.price !== null)
    || menuItems.find((item) => item.imageUrl)
    || menuItems[0];

  if (!dish) {
    return `
      <section class="ll-section">
        ${sectionHead("Hapi 4", "Dritarja e pjatës.", "Sapo të keni pjata në menu, çdo prekje hap një dritare me çmimin, përbërësit, alergjenët dhe rekomandimet që rrisin porosinë.")}
      </section>
    `;
  }

  const crossSell = menuItems.filter((item) => item.id !== dish.id && item.imageUrl).slice(0, 3);
  const infoText = text(dish.description) || text(dish.ingredients) || "Përshkrimi i pjatës shfaqet këtu.";
  const woltUrl = text(dish.woltUrl) || text(profile.woltUrl);

  const scene = `
    <div class="ll-card" aria-label="Dritarja e pjatës">
      <div class="ll-dish__head" data-spot="dish">
        <div>
          <h4 class="ll-dish__title">${esc(dish.name)}</h4>
          <span class="ll-dish__cat">${esc(text(dish.category).toUpperCase())}</span>
        </div>
        <span class="ll-dish__x">${icon("chevron-down", { size: 18 })}</span>
      </div>

      <div class="ll-dish__media" data-spot="dish">${img(dish.imageUrl, dish.name)}</div>

      ${dish.price !== null ? `
        <div class="ll-dish__price" data-spot="price">
          <span class="ll-dish__price-label">Çmimi</span>
          <span class="ll-dish__price-value">${esc(formatPrice(dish.price, currency))}</span>
        </div>
      ` : ""}

      <div data-spot="info">
        <div class="ll-pillrow">
          <span class="ll-pill is-active">Info</span>
          <span class="ll-pill">Përbërësit</span>
          <span class="ll-pill">Alergjenët</span>
        </div>
        <div class="ll-dish__info">${esc(infoText)}</div>
      </div>

      ${crossSell.length ? `
        <div data-spot="cross">
          <div class="ll-dish__crosshead">
            <span class="ll-dish__crosstitle">Shkon shkëlqyeshëm me</span>
            <span class="ll-dish__crosscount">${crossSell.length} sugjerime</span>
          </div>
          <div class="ll-crossrow">
            ${crossSell.map((item) => `
              <article class="ll-cross">
                <div class="ll-cross__media">${img(item.imageUrl, item.name)}</div>
                <p class="ll-cross__name">${esc(item.name)}</p>
              </article>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <div class="ll-dish__foot" data-spot="order">
        <span class="ll-btn-ghost">${icon("message", { size: 20 })}</span>
        <span class="ll-dish__cart">Shto në shportë ${icon("shopping-bag", { size: 18 })}</span>
        ${woltUrl ? `<span class="ll-dish__wolt">Wolt</span>` : ""}
      </div>
    </div>
  `;

  return stage({
    eyebrow: "Hapi 4",
    title: "Një prekje - dhe porosia rritet.",
    scene,
    steps: [
      { focus: "", body: "Kur klienti prek një pjatë, hapet kjo dritare. Këtu vendoset sa shpenzon." },
      { focus: "price", label: "Qartësi", title: "Çmimi", body: "Çmimi qartë dhe gjithmonë i saktë - pa keqkuptime në tavolinë." },
      { focus: "info", label: "Detajet", title: "Info, Përbërësit, Alergjenët", body: "Klienti gjen vetë përgjigjen. Pyet më pak, kamarieri fiton kohë." },
      { focus: "cross", label: "Më shumë për porosi", title: "Cross-selling", body: "„Shkon shkëlqyeshëm me“ sugjeron pije ose ëmbëlsira te çdo pjatë - mënyra më e thjeshtë për të rritur vlerën mesatare të porosisë." },
      {
        focus: "order",
        label: "Porosia",
        title: woltUrl ? "Shportë, koment, Wolt" : "Shportë dhe koment",
        body: woltUrl
          ? "Në lokal porosia shkon te Waiter-i. Nga shtëpia klienti porosit përmes Wolt-it ose dërgesës suaj. Komentet ju sjellin reagime reale."
          : "Në lokal porosia shkon direkt te Waiter-i. Komentet ju sjellin reagime reale - dhe pjatat e vlerësuara mirë shiten vetë."
      }
    ]
  });
}

export function renderMap(profile = {}) {
  const primaryLocation = Array.isArray(profile.locations) ? profile.locations[0] : null;
  const lat = primaryLocation?.lat ?? null;
  const lng = primaryLocation?.lng ?? null;
  const hasCoords = lat !== null && lng !== null;
  const address = text(primaryLocation?.address) || text(profile.address);

  return `
    <section class="ll-section">
      ${sectionHead("Hapi 5", "Harta e zbulimit.", "Klientët në qytet kërkojnë ku të hanë. Në hartën e Mnyra ju jeni njëri prej tyre - me logon tuaj si shenjë.")}

      <div
        class="ll-map"
        id="llMap"
        data-lat="${hasCoords ? esc(String(lat)) : ""}"
        data-lng="${hasCoords ? esc(String(lng)) : ""}"
        data-name="${esc(profile.name)}"
        data-logo="${esc(text(profile.logoUrl))}"
      >
        ${hasCoords ? "" : `<div class="ll-map__fallback">Vendndodhja juaj shtohet në hartë sapo ta fiksojmë adresën.${address ? `<br /><strong>${esc(address)}</strong>` : ""}</div>`}
      </div>

      <div class="ll-stack" style="margin-top:18px;">
        ${callout(1, "Vetëm ju në hartë", "Këtu shihni pikërisht vendndodhjen tuaj. Në aplikacion klienti sheh të gjitha lokalet - dhe ju jeni mes tyre.")}
        ${callout(2, "Gjendeni pa ju njohur", "Turistët dhe njerëzit që kalojnë ju gjejnë sepse jeni në hartë - jo sepse ju kërkonin me emër.")}
        ${callout(3, "Nga harta te menuja", "Një prekje mbi shenjën tuaj dhe klienti është në profil, në menu, në porosi.")}
      </div>
    </section>
  `;
}

/* ------------------------------------------------------------ QR-Codes */

export function renderQr(sales = {}) {
  const photos = Array.isArray(sales.qrPhotos) ? sales.qrPhotos : [];

  const gallery = photos.length
    ? `<div class="ll-qr-row">${photos.slice(0, 4).map((photo) => `
        <figure class="ll-qr" style="margin:0;">
          ${img(photo.url, photo.caption || "QR kodi në tavolinë")}
          ${photo.caption ? `<figcaption class="ll-qr__caption">${esc(photo.caption)}</figcaption>` : ""}
        </figure>
      `).join("")}</div>`
    : "";

  return `
    <section class="ll-section">
      ${sectionHead("Hapi 6", "QR kodi në tavolinë.", "Klienti ulet, skanon, sheh menunë. Pa aplikacion, pa shkarkim, pa pritur kamarierin.")}

      ${gallery}
      ${gallery ? '<div style="height:18px"></div>' : ""}

      <div class="ll-card ll-card--pad">
        ${feature("qr", "Një kod për çdo tavolinë", "Ne i përgatisim QR kodet. Ju i vendosni në tavolina - dhe menuja juaj është aty 24/7.")}
        ${feature("utensils", "Menu gjithmonë e saktë", "Ndryshoni një çmim në telefon - ndryshon në çdo tavolinë njëkohësisht. Pa printim, pa kosto.")}
      </div>

      <div class="ll-stack" style="margin-top:18px;">
        ${callout(1, "Kursen kohë", "Klientët shohin menunë vetë. Kamarierët merren me shërbimin, jo me shpjegimin e menusë.")}
      </div>
    </section>
  `;
}

/* --------------------------------------------------------------- Waiter */

export function renderWaiter() {
  return `
    <section class="ll-section">
      ${sectionHead("Hapi 7", "Porositë vijnë te ju.", "Kur klienti prek „Shto në shportë“ dhe dërgon porosinë, ajo shfaqet menjëherë në aplikacionin Waiter.")}

      <div class="ll-card ll-card--pad">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <span style="font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;">Waiter</span>
          <span style="display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:10px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;">${icon("bell", { size: 12 })} Porosi e re</span>
        </div>
        ${feature("bell", "Njoftim i menjëhershëm", "Telefoni ose tableti bie sapo vjen porosia. Asnjë porosi nuk humbet.")}
        ${feature("map-pin", "Numri i tavolinës", "Porosia vjen me tavolinën, pjatat dhe shënimet e klientit - gati për kuzhinën.")}
        ${feature("clock", "Statusi i porosisë", "E pranuar, në përgatitje, e servirur. Ekipi juaj sheh gjithmonë ku qëndron çdo porosi.")}
        ${feature("truck", "Marrje dhe dërgesë", "Porositë nga jashtë lokalit vijnë në të njëjtin vend - përmes Wolt-it ose dërgesës suaj.")}
      </div>

      <div class="ll-stack" style="margin-top:18px;">
        ${callout(1, "Më pak gabime", "Porosia vjen e shkruar, jo e mbajtur mend. Kuzhina lexon saktësisht çfarë deshi klienti.")}
        ${callout(2, "Më shumë tavolina për orë", "Klienti porosit vetë. Kamarieri sjell dhe serviron - kaq.")}
      </div>
    </section>
  `;
}

/* ------------------------------------------------------------ Analytics */

export function renderAnalytics() {
  const bars = [42, 58, 36, 74, 62, 88, 70];
  return `
    <section class="ll-section">
      ${sectionHead("Hapi 8", "Ju shihni çfarë funksionon.", "Jo ndjesi - numra. Çfarë shikohet, çfarë porositet, kur vijnë klientët.")}

      <div class="ll-stats" style="margin-bottom:12px;">
        <div class="ll-stat">
          <p class="ll-stat__label">Shikime të profilit</p>
          <p class="ll-stat__value">1.248</p>
          <p class="ll-stat__trend">+18% këtë javë</p>
        </div>
        <div class="ll-stat">
          <p class="ll-stat__label">Menu e hapur</p>
          <p class="ll-stat__value">863</p>
          <p class="ll-stat__trend">+24% këtë javë</p>
        </div>
      </div>

      <div class="ll-stat" style="margin-bottom:18px;">
        <p class="ll-stat__label">Skanime QR sipas ditës</p>
        <div class="ll-bars">
          ${bars.map((height) => `<span style="height:${height}%"></span>`).join("")}
        </div>
      </div>

      <div class="ll-card ll-card--pad">
        ${feature("chart", "Pjatat më të shikuara", "Shihni cila pjatë hapet më shpesh - dhe cila jo. Menuja bëhet më e mirë me të dhëna, jo me hamendje.")}
        ${feature("clock", "Orët e pikut", "Kur vijnë klientët. Planifikoni stafin sipas numrave realë.")}
        ${feature("users", "Ndjekësit tuaj", "Sa njerëz ju ndjekin dhe si rritet numri muaj pas muaji.")}
      </div>

      <p class="ll-note">Numrat e mësipërm janë shembull. Sapo profili juaj të jetë aktiv, këtu janë të dhënat tuaja reale.</p>
    </section>
  `;
}

/* -------------------------------------------------------------- Preise */

export function renderPricing(sales = {}) {
  const packages = Array.isArray(sales.packages) && sales.packages.length
    ? sales.packages
    : DEFAULT_PACKAGES;

  return `
    <section class="ll-section">
      ${sectionHead("Paketat", "Zgjidhni si doni të filloni.", "Pa kontratë afatgjatë. Ndryshoni paketën kur të doni.")}

      <div class="ll-price-row">
        ${packages.map((pkg) => `
          <article class="ll-price${pkg.highlight ? " ll-price--hot" : ""}">
            ${pkg.highlight ? '<span class="ll-price__flag">Më i zgjedhuri</span>' : ""}
            <p class="ll-price__name">${esc(pkg.name)}</p>
            <div class="ll-price__amount">
              <span class="ll-price__value">${esc(pkg.price)}</span>
              <span class="ll-price__period">${esc(pkg.period || "€ / muaj")}</span>
            </div>
            ${pkg.note ? `<p class="ll-price__note">${esc(pkg.note)}</p>` : ""}
            <ul class="ll-price__list">
              ${(pkg.features || []).map((entry) => `
                <li>${icon("check", { size: 16 })}<span>${esc(entry)}</span></li>
              `).join("")}
            </ul>
          </article>
        `).join("")}
      </div>

      <p class="ll-note">Çmimet janë pa TVSH. Vendosja e profilit, menuja e parë dhe QR kodet janë të përfshira në çdo paketë.</p>
    </section>
  `;
}

/* ----------------------------------------------------------------- CTA */

export function renderCta(profile = {}, sales = {}) {
  const phone = text(sales.contactPhone) || text(profile.phone);
  const name = text(profile.name);
  const waUrl = whatsappUrl(phone, `Përshëndetje! Kam parë faqen e Mnyra për ${name} dhe dua të di më shumë.`);

  return `
    <section class="ll-section">
      <div class="ll-cta">
        <h2 class="ll-cta__title">Profili juaj është gati.</h2>
        <p class="ll-cta__body">
          Gjithçka që patë është ndërtuar tashmë për ${esc(name)}.
          Mbetet vetëm ta aktivizoni - dhe klientët tuaj e kanë në xhep që sot.
        </p>
        ${waUrl
    ? `<a class="ll-cta__btn" href="${esc(waUrl)}" target="_blank" rel="noopener noreferrer">${icon("whatsapp", { size: 20 })} Na shkruani në WhatsApp</a>`
    : `<span class="ll-cta__btn" style="background:#e2e8f0;color:#475569;">Na kontaktoni</span>`}
        <p class="ll-cta__sub">Përgjigje brenda ditës. Pa detyrim.</p>
      </div>
    </section>
  `;
}

export const LEAD_LANDING_GREETINGS_COUNT = GREETINGS.length;
export { DEFAULT_PACKAGES };
