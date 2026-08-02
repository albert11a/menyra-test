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
// steps: [{ focus, view, label, title, body }]
//   focus "" laesst alles scharf, view schaltet die Szene um.
// fullbleed: Die Szene laeuft von Bildschirmrand zu Bildschirmrand, ohne
// Rahmen und ohne seitlichen Abstand - fuer Nachbauten, die in der App
// selbst den ganzen Bildschirm einnehmen (das Speisen-Modal).
function stage({ eyebrow, title, scene, steps = [], fullbleed = false }) {
  const focusSteps = Math.max(1, steps.length - 1);
  // Schritt 0 traegt Kapitelmarke und Titel. So gibt es nur einen Textblock
  // und er steht immer an derselben Stelle - die Szene bekommt den Rest.
  const allSteps = steps.map((step, index) => (index === 0
    ? { ...step, label: eyebrow, title }
    : step));
  const firstView = esc(allSteps[0]?.view || "");
  return `
    <section class="ll-stage${fullbleed ? " ll-stage--full" : ""}" data-steps="${focusSteps}" style="--ll-steps:${focusSteps};" ${firstView ? `data-view="${firstView}"` : ""}>
      <div class="ll-stage__pin">
        <div class="ll-stage__bar"><span></span></div>

        <div class="ll-stage__caption">
          ${allSteps.map((step, index) => `
            <div class="ll-stage__step${index === 0 ? " is-active" : ""}" data-focus="${esc(step.focus || "")}" data-view="${esc(step.view || "")}">
              ${step.label ? `<p class="ll-stage__step-label">${esc(step.label)}</p>` : ""}
              ${step.title ? `<p class="ll-stage__step-title">${esc(step.title)}</p>` : ""}
              <p class="ll-stage__step-body">${esc(step.body || "")}</p>
            </div>
          `).join("")}
        </div>

        <div class="ll-stage__viewport">
          <div class="ll-stage__scene">${scene}</div>
        </div>

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

/* ---------- Das Profil-Kapitel: Profil -> Info -> Postimet -> Menu ----------
   Eine einzige Szene, die sich beim Scrollen verwandelt. Der Kunde verliert
   nie den Zusammenhang: erst die Kartela mit den Tabs darunter, dann wird
   Info gedrueckt und die Karte dreht auf die Kontaktdaten, danach weicht die
   Karte nach oben, die Tabs ruecken hoch und darunter erscheinen erst die
   Postimet und dann die Menu. */

export function renderSurface(profile = {}, posts = [], menuItems = [], focusItems = []) {
  const igUrl = socialUrl("instagram", profile.instagramUrl || profile.instagram);
  const ttUrl = socialUrl("tiktok", profile.tiktokUrl || profile.tiktok);
  const fbUrl = socialUrl("facebook", profile.facebookUrl || profile.facebook);
  const primaryLocation = Array.isArray(profile.locations) ? profile.locations[0] : null;
  const geoUrl = mapsUrl({ lat: primaryLocation?.lat, lng: primaryLocation?.lng, address: profile.address });
  const typeLabel = text(profile.type).toUpperCase() || "BUSINESS";
  const cityLabel = text(profile.city).toUpperCase();
  const currency = profile.currency || "EUR";

  const socialButtons = [
    geoUrl ? `<span class="ll-socialbtn">${icon("map", { size: 16 })}</span>` : "",
    ttUrl ? `<span class="ll-socialbtn">${icon("music", { size: 16 })}</span>` : "",
    igUrl ? `<span class="ll-socialbtn">${icon("instagram", { size: 16 })}</span>` : "",
    fbUrl ? `<span class="ll-socialbtn">${icon("facebook", { size: 16 })}</span>` : ""
  ].filter(Boolean).join("");

  const address = text(primaryLocation?.address) || text(profile.address);
  const infoRows = [
    text(profile.phone) ? { iconName: "message", label: "Telefon", value: profile.phone } : null,
    address ? { iconName: "map-pin", label: "Adresa", value: address } : null,
    text(profile.openingHours) ? { iconName: "clock", label: "Orari", value: profile.openingHours } : null,
    text(profile.instagram) ? { iconName: "instagram", label: "Instagram", value: profile.instagram } : null,
    text(profile.tiktok) ? { iconName: "music", label: "TikTok", value: profile.tiktok } : null
  ].filter(Boolean).slice(0, 4);

  const postGrid = posts.slice(0, 4).length
    ? `<div class="ll-grid">${posts.slice(0, 4).map((post) => `
        <div class="ll-post">
          ${img(post.imageUrl, text(post.caption) || "Postim")}
          <span class="ll-post__stats">
            <span>${filledIcon("heart", { size: 13, color: "#f43f5e" })} ${esc(formatCount(post.likeCount))}</span>
            <span>${icon("message", { size: 13 })} ${esc(formatCount(post.commentCount))}</span>
          </span>
        </div>
      `).join("")}</div>`
    : `<div class="ll-card ll-card--pad" style="text-align:center;">
        <p class="ll-callout__body">Sapo të ngarkoni postimin e parë, ai shfaqet këtu dhe në feed te të gjithë ndjekësit tuaj.</p>
      </div>`;

  // Aufbau 1:1 aus renderTestfirstFocusSection: Bild 16:9, TIPP-Plakette
  // oben links, darunter Titel und zweizeiliger Beschreibungstext.
  const focusRow = focusItems.length
    ? `<div class="ll-focus-row">${focusItems.slice(0, 4).map((item) => `
        <article class="ll-focus">
          <div class="ll-focus__media">
            ${img(item.imageUrl, item.title)}
            <span class="ll-focus__badge">${icon("sparkles", { size: 12 })}<span>Tipp</span></span>
          </div>
          <div class="ll-focus__text">
            <h3 class="ll-focus__title">${esc(item.title)}</h3>
            ${item.body ? `<p class="ll-focus__body">${esc(item.body)}</p>` : ""}
          </div>
        </article>
      `).join("")}</div>`
    : "";

  // Getraenke: 1:1 aus renderTestfirstDrinkGridCard - zwei Spalten,
  // quadratisches Bild, Herz oben rechts, unten Preis und Plus.
  const drinkCard = (item) => `
        <article class="ll-menu-card">
          <div class="ll-menu-card__media">
            ${img(item.imageUrl, item.name)}
            <span class="ll-menu-card__like">${filledIcon("heart", { size: 14, color: "currentColor" })}</span>
          </div>
          <div class="ll-menu-card__body">
            <h4 class="ll-menu-card__name">${esc(item.name)}</h4>
            <p class="ll-menu-card__desc">${esc(item.description)}</p>
            <div class="ll-menu-card__foot">
              <span class="ll-menu-card__price">${item.price !== null ? esc(formatPrice(item.price, currency)) : ""}</span>
              <span class="ll-menu-card__add">${icon("plus", { size: 16 })}</span>
            </div>
          </div>
        </article>
  `;

  // Speisen: 1:1 aus renderTestfirstFoodCard - keine Kacheln, sondern eine
  // Karte ueber die volle Breite mit 16:9-Bild und Shto-Knopf.
  const foodCard = (item) => `
        <article class="ll-food-card">
          <div class="ll-food-card__media">
            ${img(item.imageUrl, item.name)}
            <span class="ll-food-card__like">${filledIcon("heart", { size: 16, color: "currentColor" })}</span>
          </div>
          <div class="ll-food-card__body">
            <div class="ll-food-card__head">
              <h4 class="ll-food-card__name">${esc(item.name)}</h4>
              <span class="ll-food-card__price">${item.price !== null ? esc(formatPrice(item.price, currency)) : ""}</span>
            </div>
            <p class="ll-food-card__desc">${esc(item.description)}</p>
            <div class="ll-food-card__foot">
              <span class="ll-food-card__add">
                <span>Shto</span>
                <span class="ll-food-card__addicon">${icon("plus", { size: 16 })}</span>
              </span>
            </div>
          </div>
        </article>
  `;

  // Getraenke und Speisen werden nacheinander gezeigt. Die Einteilung in
  // Pije/Ushqim kommt aus resolveMenuDisplaySection - genau wie in der App.
  // Artikel, die als Fokus gepflegt sind, tauchen im Menue selbst nicht auf.
  const contentItems = menuItems.filter((item) => item.cardStyle !== "testfirst_focus");
  const shownItems = contentItems.length ? contentItems : menuItems;
  const drinkItems = shownItems.filter((item) => item.section === "drink").slice(0, 2);
  const foodItems = shownItems.filter((item) => item.section !== "drink").slice(0, 2);
  const emptyNote = `<div class="ll-card ll-card--pad" style="text-align:center;">
      <p class="ll-callout__body">Menuja vendoset një herë - dhe është e gjallë në çdo tavolinë.</p>
    </div>`;

  // Welche Karte gezeichnet wird, entscheidet der Artikel selbst (cardStyle),
  // nicht die Rubrik. Wer seine Speisen als Getraenkekachel gepflegt hat,
  // sieht hier dieselbe Kachel wie im echten Menue.
  const usesFoodCard = (item) => item.cardStyle === "testfirst_food";
  const listOf = (list) => {
    if (!list.length) return emptyNote;
    const gridItems = list.filter((item) => !usesFoodCard(item));
    const stackedItems = list.filter(usesFoodCard);
    return [
      gridItems.length ? `<div class="ll-menu-grid">${gridItems.map(drinkCard).join("")}</div>` : "",
      stackedItems.length ? `<div class="ll-food-list">${stackedItems.map(foodCard).join("")}</div>` : ""
    ].filter(Boolean).join("");
  };

  const categories = Array.from(new Set(menuItems.map((item) => text(item.category)).filter(Boolean))).slice(0, 5);

  const scene = `
    <div class="ll-surface">
      <div class="ll-surface__cardwrap">
        <div class="ll-surface__cardinner">
          <div class="ll-card ll-profile ll-surface__card" aria-label="Profili juaj">
            <div class="ll-profile__cover" data-spot="identity">
              <span class="ll-profile__coverimg">${img(profile.coverUrl, "Ballina")}</span>
              <span class="ll-profile__scrim"></span>
              <span class="ll-profile__fade"></span>
            </div>
            ${socialButtons ? `<div class="ll-profile__socials" data-spot="social">${socialButtons}</div>` : ""}

            <div class="ll-profile__body">
              <div class="ll-profile__toprow">
                <span class="ll-profile__avatar" data-spot="identity">${img(profile.logoUrl, `${profile.name} logo`, LOGO_FALLBACK)}</span>
                <div class="ll-profile__meta">
                  <span class="ll-metric" data-spot="fans">
                    <span class="ll-metric__value">${esc(formatCount(profile.followers))}</span>
                    <span class="ll-metric__label">Fans</span>
                  </span>
                  <span class="ll-metric__divider"></span>
                  <span class="ll-metric ll-metric--info" data-spot="info">
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

          <div class="ll-card ll-contact ll-surface__info" aria-label="Kontakti dhe Info">
            <div>
              <h3 class="ll-contact__title">Kontakti &amp; Info</h3>
              <p class="ll-contact__place">${esc(cityLabel)}</p>
            </div>
            <div class="ll-contact__rows">
              ${infoRows.map((row) => `
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
        </div>
      </div>

      <div class="ll-tabs ll-surface__tabs" data-spot="tabs grid mfocus mdrinks mfood">
        <span class="ll-tab ll-tab--posts">Postimet</span>
        <span class="ll-tab ll-tab--menu">Menu</span>
      </div>

      <div class="ll-surface__contentwrap">
        <div class="ll-surface__contentinner">
          <div class="ll-surface__posts"><div data-spot="grid">${postGrid}</div></div>
          <div class="ll-surface__menu">
            <div class="ll-menu-part ll-menu-part--focus"><div data-spot="mfocus">${focusRow || emptyNote}</div></div>
            <div class="ll-menu-part ll-menu-part--drinks"><div data-spot="mdrinks">${listOf(drinkItems)}</div></div>
            <div class="ll-menu-part ll-menu-part--food"><div data-spot="mfood">${listOf(foodItems)}</div></div>
          </div>
        </div>
      </div>
    </div>
  `;

  return stage({
    eyebrow: "Hapi 1",
    title: "Kështu ju sheh klienti.",
    scene,
    steps: [
      { view: "profile", focus: "", body: "Kartela juaj publike dhe dy tabet - pikërisht ashtu siç e sheh klienti. Rrëshqitni: shpjegimi shkon te secila pjesë." },
      { view: "profile", focus: "identity", label: "Identiteti", title: "Logoja dhe emri juaj", body: "Ballina, logoja, emri dhe qyteti. Klienti e di menjëherë kush jeni dhe ku jeni." },
      { view: "profile", focus: "social", label: "Lidhjet", title: "Harta, TikTok, Instagram", body: "Një prekje - dhe klienti ka drejtimin në hartë ose rrjetet tuaja. Vendosen një herë, punojnë përgjithmonë." },
      { view: "profile", focus: "fans", label: "Numrat", title: "Fans", body: "Sa njerëz ju ndjekin. Numri rritet me çdo postim që u pëlqen." },
      { view: "profile", focus: "follow", label: "Rritja", title: "NDIQ", body: "Klienti bëhet ndjekës me një prekje. Çdo postim i ri i shfaqet në feed - marketing që nuk paguhet dy herë." },
      { view: "profile", focus: "chat", label: "Kontakti", title: "Biseda direkt", body: "E çon klientin direkt te ju në WhatsApp. Rezervimet vijnë aty ku i lexoni gjithsesi." },
      { view: "profile", focus: "info", label: "Detajet", title: "Butoni Info", body: "Këtu klienti prek Info - dhe kartela hapet nga ana tjetër." },
      { view: "info", focus: "", label: "Kontakti & Info", title: "Gjithçka që duhet të dijë", body: "Telefoni, adresa, orari dhe rrjetet - në një ekran. Ju e ndryshoni një herë, ndryshon kudo." },
      { view: "tabs", focus: "tabs", label: "Dy tabe", title: "Postimet & Menu", body: "Kartela tërhiqet, tabet ngjiten lart. Këtu ndahet profili: Postimet tregojnë si ndihet lokali, Menu shet." },
      { view: "posts", focus: "grid", label: "Përmbajtja", title: "Postimet tuaja", body: "Foto e video si në Instagram - por brenda Mnyra. Çdo postim shkon edhe në feed te ndjekësit tuaj." },
      { view: "menu-focus", focus: "mfocus", label: "Rekomandimet", title: "Sot në fokus", body: "Klienti prek Menu. Kartat me shenjën TIPP janë rekomandimet e ditës - ju vendosni çfarë shitet më shumë." },
      { view: "menu-drinks", focus: "mdrinks", label: "Pijet", title: "Pijet tuaja", body: "Poshtë rekomandimeve vijnë kategoritë. Çdo pije me foto, çmim dhe një prekje për në shportë." },
      {
        view: "menu-food",
        focus: "mfood",
        label: "Ushqimi",
        title: "Pjatat tuaja",
        body: categories.length
          ? `Menuja juaj është e ndarë në: ${categories.join(", ")}. Çdo kategori me foto dhe çmim.`
          : "Ushqimi, pijet, koktejlet, kafeja - çdo kategori e ndarë, me foto dhe çmim."
      }
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

  const crossSell = menuItems.filter((item) => item.id !== dish.id && item.imageUrl).slice(0, 4);
  const woltUrl = text(dish.woltUrl) || text(profile.woltUrl);
  // Genau die Fallbacks des echten Modals (menu.noInfo aus shared/i18n/sq.js).
  const noInfo = "Nuk ka informacion, ju lutem kontaktoni lokalin ose kamarierin.";
  const infoText = text(dish.description) || noInfo;
  const ingredientsText = text(dish.ingredients) || noInfo;
  const allergensText = text(dish.allergens) || noInfo;
  const countLabel = crossSell.length === 1 ? "1 sugjerim" : `${crossSell.length} sugjerime`;
  const hasGallery = crossSell.length > 0;

  const crossCard = (item) => `
        <div class="ll-md-cross">
          <div class="ll-md-cross__media">${img(item.imageUrl, item.name)}</div>
          <div class="ll-md-cross__body">
            <div class="ll-md-cross__eyebrow">${esc(text(item.category) || "Shkon me kete")}</div>
            <div class="ll-md-cross__name">${esc(item.name)}</div>
            <div class="ll-md-cross__footer">
              <span class="ll-md-cross__price">${item.price !== null ? esc(formatPrice(item.price, currency)) : ""}</span>
              <span class="ll-md-cross__add">${icon("plus", { size: 16 })}</span>
            </div>
          </div>
        </div>
  `;

  // Aufbau 1:1 aus renderMenuDetailModalCore (Zweig !isShop):
  // Kopf, scrollender Koerper mit Hero/Preis/Info-Tabs/Cross-Sell/Social,
  // darunter die feste Fusszeile. Vollbild, ohne Rahmen und Rundungen -
  // .modal-sheet setzt in der App border-radius: 0 und height: 100%.
  const scene = `
    <div class="ll-md" aria-label="Dritarja e pjatës">
      <div class="ll-md__head" data-spot="head">
        <div class="ll-md__headtext">
          <h3 class="ll-md__title">${esc(dish.name)}</h3>
          ${dish.category ? `<div class="ll-md__cat">${esc(dish.category)}</div>` : ""}
        </div>
        <span class="ll-md__close">${icon("x", { size: 16 })}</span>
      </div>

      <div class="ll-md__body">
       <div class="ll-md__scroll" data-pan>
        <div class="ll-md__hero" data-spot="hero">
          ${img(dish.imageUrl, dish.name)}
          ${hasGallery ? `
            <span class="ll-md__nav ll-md__nav--prev">${icon("chevron-left", { size: 16 })}</span>
            <span class="ll-md__nav ll-md__nav--next">${icon("chevron-right", { size: 16 })}</span>
          ` : ""}
        </div>

        <div class="ll-md__stack">
          <div class="ll-md__price" data-spot="price">
            <span class="ll-md__price-label">Cmimi</span>
            <span class="ll-md__price-value">${dish.price !== null ? esc(formatPrice(dish.price, currency)) : ""}</span>
          </div>

          <div class="ll-md__rule"></div>

          <div class="ll-md__info" data-spot="info">
            <div class="ll-md__tabs">
              <span class="ll-md__tab is-active" data-info-tab="info">Info</span>
              <span class="ll-md__tab" data-info-tab="ingredients">Perberesit</span>
              <span class="ll-md__tab" data-info-tab="allergens">Alergenet</span>
            </div>
            <div class="ll-md__panels">
              <p class="ll-md__panel is-active" data-info-panel="info">${esc(infoText)}</p>
              <p class="ll-md__panel" data-info-panel="ingredients">${esc(ingredientsText)}</p>
              <p class="ll-md__panel" data-info-panel="allergens">${esc(allergensText)}</p>
            </div>
          </div>

          <div class="ll-md__rule"></div>

          ${crossSell.length ? `
            <div data-spot="cross">
              <div class="ll-md__crosshead">
                <h4 class="ll-md__crosstitle">Shkon shume mire me kete</h4>
                <div class="ll-md__crosscount">${esc(countLabel)}</div>
              </div>
              <div class="ll-md__crossrow">${crossSell.map(crossCard).join("")}</div>
            </div>
            <div class="ll-md__rule"></div>
          ` : ""}

          <div class="ll-md__social" data-spot="social">
            <span class="ll-md__like">${icon("heart", { size: 14 })} Like</span>
            <span class="ll-md__counts">
              <span>0 Likes</span>
              <span>0 Komente</span>
            </span>
          </div>
        </div>
       </div>
      </div>

      <div class="ll-md__foot" data-spot="order">
        <span class="ll-md__ghost">${icon("message-square", { size: 20 })}</span>
        ${woltUrl
          ? `<span class="ll-md__cta ll-md__cta--wolt">Wolt ${icon("external-link", { size: 16 })}</span>`
          : `<span class="ll-md__cta ll-md__cta--fav">Te preferuarat ${icon("bookmark", { size: 16 })}</span>`}
        <span class="ll-md__cta ll-md__cta--cart">Shto ne shporte ${icon("shopping-bag", { size: 16 })}</span>
      </div>
    </div>
  `;

  const homeTitle = woltUrl ? "Nga shtëpia: Wolt" : "Nga shtëpia: te të preferuarat";
  const homeBody = woltUrl
    ? "Kur klienti hyn nga shtëpia - nga feed-i, nga harta ose nga linku juaj - këtu nuk ka shportë. Ai sheh pjatën, çmimin dhe përbërësit, dhe poroson te Wolt-i ose ju shkruan. Menuja punon si vitrina juaj 24 orë."
    : "Kur klienti hyn nga shtëpia - nga feed-i, nga harta ose nga linku juaj - këtu nuk ka shportë. Ai sheh pjatën, çmimin dhe përbërësit dhe e ruan te të preferuarat. Menuja punon si vitrina juaj 24 orë.";

  return stage({
    eyebrow: "Hapi 4",
    title: "Një prekje - dhe porosia rritet.",
    scene,
    fullbleed: true,
    steps: [
      { view: "home", focus: "", body: "Kur klienti prek një pjatë, hapet kjo dritare - në tërë ekranin, pikërisht kështu. Rrëshqitni: shpjegimi shkon te secila pjesë." },
      { view: "home", focus: "head", label: "Kreu", title: "Emri dhe kategoria", body: "Lart emri i pjatës dhe kategoria. Me një prekje mbyllet dhe klienti është prapë në menu - pa u humbur." },
      { view: "home", focus: "hero", label: "Fotoja", title: "Fotoja e madhe", body: "Fotoja shitet e para. Nëse keni disa foto, klienti i shfleton me shigjetat - pjata shihet nga çdo anë." },
      { view: "home", focus: "price", label: "Qartësi", title: "Cmimi", body: "Çmimi qartë dhe gjithmonë i saktë - pa keqkuptime në tavolinë dhe pa menu të vjetruara letre." },
      { view: "home", focus: "info", label: "Detajet", title: "Info, Perberesit, Alergenet", body: "Tri skeda: përshkrimi, përbërësit dhe alergjenët. Klienti gjen vetë përgjigjen - pyet më pak, kamarieri fiton kohë." },
      ...(crossSell.length
        ? [{ view: "home", focus: "cross", label: "Më shumë për porosi", title: "Shkon shume mire me kete", body: "Te çdo pjatë sugjeroni pije ose ëmbëlsira. Kjo është mënyra më e thjeshtë për të rritur vlerën mesatare të porosisë - pa e pyetur askush." }]
        : []),
      { view: "home", focus: "social", label: "Reagimet", title: "Like dhe komente", body: "Klientët pëlqejnë dhe komentojnë pjatën vetë. Ju shihni saktë çfarë funksionon - dhe pjatat e vlerësuara mirë shiten vetë." },
      { view: "home", focus: "order", label: "Nga shtëpia", title: homeTitle, body: homeBody },
      { view: "qr", focus: "order", label: "Në tavolinë", title: "Me kodin QR: porosi nga tavolina", body: "Kur klienti skanon kodin QR në tavolinë, e njëjta dritare shfaq „Shto ne shporte“. Ai poroson vetë nga tavolina, porosia shkon direkt te Waiter-i me numrin e tavolinës - pa pritur kamarierin dhe pa gabime." }
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
