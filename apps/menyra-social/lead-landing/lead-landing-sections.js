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

/* ---------------------------------------------------------------- Hero */

export function renderHero(profile = {}) {
  const parts = splitBrandName(profile.name);
  const c1 = text(profile.businessNameColorPart1) || "#111827";
  const c2 = text(profile.businessNameColorPart2) || "#4f46e5";

  return `
    <header class="ll-hero">
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
    <section class="ll-section ll-reveal">
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
    geoUrl ? `<span class="ll-socialbtn">${icon("map", { size: 19 })}</span>` : "",
    ttUrl ? `<span class="ll-socialbtn">${icon("music", { size: 19 })}</span>` : "",
    igUrl ? `<span class="ll-socialbtn">${icon("instagram", { size: 19 })}</span>` : "",
    fbUrl ? `<span class="ll-socialbtn">${icon("facebook", { size: 19 })}</span>` : ""
  ].filter(Boolean).join("");

  return `
    <section class="ll-section ll-reveal">
      ${sectionHead(
    "Hapi 1",
    "Kështu ju sheh klienti.",
    "Kjo është kartela juaj publike - me të dhënat tuaja reale, ashtu siç duket sot në Mnyra."
  )}

      <div class="ll-card" aria-label="Parapamje e profilit">
        <div class="ll-profile__cover">
          ${img(profile.coverUrl, "Ballina")}
          ${socialButtons ? `<div class="ll-profile__socials">${socialButtons}</div>` : ""}
        </div>

        <div class="ll-profile__body">
          <div class="ll-profile__toprow">
            <span class="ll-profile__avatar">${img(profile.logoUrl, `${profile.name} logo`, LOGO_FALLBACK)}</span>
            <div class="ll-profile__meta">
              <span class="ll-metric">
                <span class="ll-metric__value">${esc(formatCount(profile.followers))}</span>
                <span class="ll-metric__label">Fans</span>
              </span>
              <span class="ll-metric__divider"></span>
              <span class="ll-metric">
                ${icon("info", { size: 26 })}
                <span class="ll-metric__icon-label">Info</span>
              </span>
            </div>
          </div>

          <p class="ll-profile__name">${esc(profile.name)}</p>
          <p class="ll-profile__bio">${esc(text(profile.bio) || "Nuk ka bio.")}</p>
          <p class="ll-profile__tag">${esc([cityLabel, typeLabel].filter(Boolean).join(" / "))}</p>

          <div class="ll-profile__actions">
            <span class="ll-btn-primary">Ndiq</span>
            <span class="ll-btn-ghost">${icon("message", { size: 20 })}</span>
          </div>
        </div>
      </div>

      <div class="ll-stack" style="margin-top:18px;">
        ${callout(1, "Butonat lart", "Harta, TikTok, Instagram dhe Facebook - një klikim dhe klienti është te ju. Ju i vendosni një herë, punojnë përgjithmonë.")}
        ${callout(2, "Fans", "Numri i njerëzve që ju ndjekin. Sa më shumë ndjekës, aq më shumë njerëz e shohin çdo postim tuajin.")}
        ${callout(3, "Info", "Hap adresën, orarin dhe kontaktet tuaja - pa e lënë profilin.")}
        ${callout(4, "NDIQ", "Klienti bëhet ndjekës me një prekje. Çdo postim i ri i shfaqet në feed - marketing që nuk paguhet dy herë.")}
        ${callout(5, "Butoni i bisedës", "E çon klientin direkt te ju në WhatsApp. Rezervimet vijnë aty ku i lexoni gjithsesi.")}
      </div>
    </section>
  `;
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
    <section class="ll-section ll-section--tight ll-reveal">
      ${sectionHead("Kontakti & Info", "Gjithçka që klienti duhet të dijë.", "Kur klienti prek INFO, hapet kjo dritare - me të dhënat tuaja.")}

      <div class="ll-card ll-card--pad">
        <h3 style="margin:0 0 4px;font-size:28px;font-weight:900;letter-spacing:-0.04em;color:#1e1b4b;">Kontakti &amp; Info</h3>
        <p style="margin:0 0 10px;font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;">${esc(text(profile.city).toUpperCase())}</p>
        ${rows.map((row) => `
          <div class="ll-contact__row">
            <span class="ll-contact__icon">${icon(row.iconName, { size: 20 })}</span>
            <div style="min-width:0;">
              <p class="ll-contact__label">${esc(row.label)}</p>
              <p class="ll-contact__value">${esc(row.value)}</p>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="ll-stack" style="margin-top:18px;">
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

  return `
    <section class="ll-section ll-reveal">
      ${sectionHead("Hapi 2", "Postimet - atmosfera juaj.", "Dy tabe e ndajnë profilin: Postimet tregojnë si ndihet lokali, Menu shet.")}

      <div class="ll-tabs" style="margin-bottom:18px;">
        <span class="ll-tab is-active">Postimet</span>
        <span class="ll-tab">Menu</span>
      </div>

      ${grid}

      <div class="ll-stack" style="margin-top:18px;">
        ${callout(1, "Si Instagram - por brenda Mnyra", "Foto dhe video të lokalit, pjatave, mbrëmjeve. Klienti sheh atmosferën para se të vijë.")}
        ${callout(2, "Feed-i kryesor", "Çdo postim shkon automatikisht te të gjithë ndjekësit tuaj në feed-in e Mnyra. Nuk paguani për shikime.")}
        ${callout(3, "Pëlqime dhe komente", "Klientët reagojnë dhe komentojnë. Ju e shihni menjëherë çfarë funksionon.")}
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------- Menu */

export function renderMenu(profile = {}, menuItems = [], focusItems = []) {
  const currency = profile.currency || "EUR";
  const cards = menuItems.slice(0, 4);

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

  return `
    <section class="ll-section ll-reveal">
      ${sectionHead("Hapi 3", "Menu - këtu shitet.", "Menuja digjitale me foto, çmime dhe kategori. Gjithmonë e saktë, kurrë e vjetruar.")}

      <div class="ll-tabs" style="margin-bottom:18px;">
        <span class="ll-tab">Postimet</span>
        <span class="ll-tab is-active">Menu</span>
      </div>

      ${focusRow}
      ${focusRow ? '<div style="height:18px"></div>' : ""}
      ${menuGrid}

      <div class="ll-stack" style="margin-top:18px;">
        ${callout(1, "Sot në fokus", "Kartat me shenjën TIPP janë rekomandimet e ditës. Ju vendosni çfarë shitet më shumë - dhe e ndryshoni kur të doni.")}
        ${callout(2, "Kategoritë", categories.length
    ? `Menuja juaj është e ndarë në: ${categories.join(", ")}. Çdo kategori me foto dhe çmim.`
    : "Ushqimi, pijet, koktejlet, kafeja - çdo kategori e ndarë, me foto dhe çmim.")}
        ${callout(3, "Foto shesin", "Pjata me foto porositet dukshëm më shpesh se një rresht teksti në menu letre.")}
      </div>
    </section>
  `;
}

/* -------------------------------------------------- Speisen-Modal (Detail) */

export function renderDish(profile = {}, menuItems = []) {
  const currency = profile.currency || "EUR";
  const dish = menuItems.find((item) => item.imageUrl && item.price !== null)
    || menuItems.find((item) => item.imageUrl)
    || menuItems[0];

  if (!dish) {
    return `
      <section class="ll-section ll-reveal">
        ${sectionHead("Hapi 4", "Dritarja e pjatës.", "Sapo të keni pjata në menu, çdo prekje hap një dritare me çmimin, përbërësit, alergjenët dhe rekomandimet që rrisin porosinë.")}
      </section>
    `;
  }

  const crossSell = menuItems.filter((item) => item.id !== dish.id && item.imageUrl).slice(0, 3);
  const infoText = text(dish.description) || text(dish.ingredients) || "Përshkrimi i pjatës shfaqet këtu.";
  const woltUrl = text(dish.woltUrl) || text(profile.woltUrl);

  return `
    <section class="ll-section ll-reveal">
      ${sectionHead("Hapi 4", "Një prekje - dhe porosia rritet.", "Kur klienti prek një pjatë, hapet kjo dritare. Këtu vendoset sa shpenzon.")}

      <div class="ll-card" aria-label="Parapamje e dritares se pjates">
        <div class="ll-dish__head">
          <div>
            <h4 class="ll-dish__title">${esc(dish.name)}</h4>
            <span class="ll-dish__cat">${esc(text(dish.category).toUpperCase())}</span>
          </div>
          <span class="ll-dish__x">${icon("chevron-down", { size: 18 })}</span>
        </div>

        <div class="ll-dish__media">${img(dish.imageUrl, dish.name)}</div>

        ${dish.price !== null ? `
          <div class="ll-dish__price">
            <span class="ll-dish__price-label">Çmimi</span>
            <span class="ll-dish__price-value">${esc(formatPrice(dish.price, currency))}</span>
          </div>
        ` : ""}

        <div class="ll-pillrow">
          <span class="ll-pill is-active">Info</span>
          <span class="ll-pill">Përbërësit</span>
          <span class="ll-pill">Alergjenët</span>
        </div>

        <div class="ll-dish__info">${esc(infoText)}</div>

        ${crossSell.length ? `
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
        ` : ""}

        <div class="ll-dish__foot">
          <span class="ll-btn-ghost">${icon("message", { size: 20 })}</span>
          <span class="ll-dish__cart">Shto në shportë ${icon("shopping-bag", { size: 18 })}</span>
          ${woltUrl ? `<span class="ll-dish__wolt">Wolt</span>` : ""}
        </div>
      </div>

      <div class="ll-stack" style="margin-top:18px;">
        ${callout(1, "Çmimi dhe informacioni", "Çmimi qartë, pa keqkuptime. Info, Përbërësit dhe Alergjenët - klienti pyet më pak, kamarieri fiton kohë.")}
        ${callout(2, "Cross-selling", "„Shkon shkëlqyeshëm me“ sugjeron pije ose ëmbëlsira te çdo pjatë. Kjo është mënyra më e thjeshtë për të rritur vlerën mesatare të porosisë.")}
        ${callout(3, "Komentet", "Klientët lënë koment te pjata. Ju merrni reagime reale - dhe pjatat e vlerësuara mirë shiten vetë.")}
        ${callout(4, "Porosia nga çdo vend", woltUrl
    ? "Nëse klienti nuk është në lokal, porosit direkt përmes Wolt-it ose dërgesës suaj - nga shtëpia, nga puna, kudo."
    : "Nëse klienti nuk është në lokal, mund të lidhim Wolt-in ose dërgesën tuaj - kështu porosia vjen edhe nga shtëpia.")}
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------- Harta */

export function renderMap(profile = {}) {
  const primaryLocation = Array.isArray(profile.locations) ? profile.locations[0] : null;
  const lat = primaryLocation?.lat ?? null;
  const lng = primaryLocation?.lng ?? null;
  const hasCoords = lat !== null && lng !== null;
  const address = text(primaryLocation?.address) || text(profile.address);

  return `
    <section class="ll-section ll-reveal">
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
    <section class="ll-section ll-reveal">
      ${sectionHead("Hapi 6", "QR kodi në tavolinë.", "Klienti ulet, skanon, sheh menunë. Pa aplikacion, pa shkarkim, pa pritur kamarierin.")}

      ${gallery}
      ${gallery ? '<div style="height:18px"></div>' : ""}

      <div class="ll-card ll-card--pad">
        ${feature("qr", "Një kod për çdo tavolinë", "Ne i përgatisim QR kodet. Ju i vendosni në tavolina - dhe menuja juaj është aty 24/7.")}
        ${feature("utensils", "Menu gjithmonë e saktë", "Ndryshoni një çmim në telefon - ndryshon në çdo tavolinë njëkohësisht. Pa printim, pa kosto.")}
        ${feature("smartphone", "Pa instalim", "Kamera e telefonit mjafton. Funksionon në çdo iPhone dhe Android.")}
      </div>

      <div class="ll-stack" style="margin-top:18px;">
        ${callout(1, "Kursen kohë", "Klientët shohin menunë vetë. Kamarierët merren me shërbimin, jo me shpjegimin e menusë.")}
        ${callout(2, "Tavolina e njohur", "Kodi e di në cilën tavolinë është klienti - kështu porosia vjen me numrin e saktë të tavolinës.")}
      </div>
    </section>
  `;
}

/* --------------------------------------------------------------- Waiter */

export function renderWaiter() {
  return `
    <section class="ll-section ll-reveal">
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
    <section class="ll-section ll-reveal">
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
    <section class="ll-section ll-reveal">
      ${sectionHead("Paketat", "Zgjidhni si doni të filloni.", "Pa kontratë afatgjatë. Ndryshoni paketën kur të doni.")}

      <div class="ll-stack" style="gap:18px;">
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
    <section class="ll-section ll-reveal">
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
