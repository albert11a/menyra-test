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
//
// scene ist der Normalfall (Szene im Standard-Viewport). Wer den Aufbau unter
// der Erklaerung selbst bestimmen muss - wie das Vollbild-Modal, das eine
// feste Fussleiste unter dem scrollenden Bereich hat - liefert stattdessen
// body und setzt Viewport und Szene darin selbst.
function stage({ eyebrow, title, scene = "", body = "", variant = "", steps = [] }) {
  const focusSteps = Math.max(1, steps.length - 1);
  // Schritt 0 traegt Kapitelmarke und Titel. So gibt es nur einen Textblock
  // und er steht immer an derselben Stelle - die Szene bekommt den Rest.
  const allSteps = steps.map((step, index) => (index === 0
    ? { ...step, label: eyebrow, title }
    : step));
  const firstView = esc(allSteps[0]?.view || "");
  const stageBody = body || `
        <div class="ll-stage__viewport">
          <div class="ll-stage__scene">${scene}</div>
        </div>
  `;
  return `
    <section class="ll-stage${variant ? ` ${variant}` : ""}" data-steps="${focusSteps}" style="--ll-steps:${focusSteps};" ${firstView ? `data-view="${firstView}"` : ""}>
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

        ${stageBody}

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

/* ------------------------------------------------ Menue-Karten (geteilt) */

// Welche Karte gezeichnet wird, entscheidet der Artikel selbst (cardStyle),
// nicht die Rubrik. Wer seine Speisen als Getraenkekachel gepflegt hat, sieht
// hier dieselbe Kachel wie im echten Menue.
function usesFoodCard(item = {}) {
  return item.cardStyle === "testfirst_food";
}

// Getraenke: 1:1 aus renderTestfirstDrinkGridCard - zwei Spalten,
// quadratisches Bild, Herz oben rechts, unten Preis und Plus.
function drinkCard(item = {}, currency = "EUR", isOpened = false) {
  return `
        <article class="ll-menu-card"${isOpened ? " data-dish-card" : ""}>
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
}

// Speisen: 1:1 aus renderTestfirstFoodCard - keine Kacheln, sondern eine
// Karte ueber die volle Breite mit 16:9-Bild und Shto-Knopf.
function foodCard(item = {}, currency = "EUR", isOpened = false) {
  return `
        <article class="ll-food-card"${isOpened ? " data-dish-card" : ""}>
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
}

// Getraenke und Speisen werden nacheinander gezeigt. Die Einteilung in
// Pije/Ushqim kommt aus resolveMenuDisplaySection - genau wie in der App.
// Artikel, die als Fokus gepflegt sind, tauchen im Menue selbst nicht auf.
// Dasselbe Ergebnis nutzt das Speisen-Kapitel: die Speise, die dort geoeffnet
// wird, ist genau die erste Karte, die der Kunde im Menue gesehen hat.
function resolveMenuBuckets(menuItems = []) {
  const contentItems = menuItems.filter((item) => item.cardStyle !== "testfirst_focus");
  const shownItems = contentItems.length ? contentItems : menuItems;
  return {
    shownItems,
    drinkItems: shownItems.filter((item) => item.section === "drink").slice(0, 2),
    foodItems: shownItems.filter((item) => item.section !== "drink").slice(0, 2)
  };
}

/* ------------------------------------------------- Speisen-Modal (Vollbild)

   Vollbild-Nachbau von renderMenuDetailModalCore (Zweig Speise/Getraenk, kein
   Shop) aus core/menu/menu-modal-render-utils.js - mit den Modal-Regeln aus
   apps/menyra-social/index.html: Sheet ueber den ganzen Bildschirm ohne
   Radien, Koerper px-7 py-6 auf bg-white/98, feste Fussleiste px-7 pt-4 pb-6.
   Die Beschriftungen sind die echten Labels aus shared/i18n/sq.js.

   Das Modal gehoert zur Menue-Szene, nicht zu einem eigenen Kapitel: Es faehrt
   ueber genau die Karte, die der Kunde gerade gesehen hat.

   Zwei bewusste Abweichungen:
   - Wo im Original Name, Kategorie und X-Knopf stehen, stehen hier der
     Fortschrittsbalken und die Erklaerung - wir sind im Vollbild.
   - Die Fussleiste zeigt nacheinander beide Zustaende, die das Original kennt.
     Welchen die App zeigt, entscheidet dort hasQrMenuAccess (Menu-Tab +
     menuAccessSource === "qr"): ohne QR Wolt bzw. "Te preferuarat", mit QR
     "Shto ne shporte" und das Plus an den Vorschlaegen. */

// Geoeffnet wird immer die erste Karte unter "Pjatat tuaja" - im Menue stehen
// die Kacheln vor den breiten Speisenkarten.
function pickOpenedDish(foodItems = [], shownItems = []) {
  const ordered = [
    ...foodItems.filter((item) => !usesFoodCard(item)),
    ...foodItems.filter(usesFoodCard)
  ];
  return ordered[0] || shownItems[0] || null;
}

function buildDishModal(profile = {}, dish = null, menuItems = [], currency = "EUR") {
  if (!dish) return null;

  // Fallback-Text 1:1 aus menu.noInfo.
  const noInfo = "Nuk ka informacion, ju lutem kontaktoni lokalin ose kamarierin.";
  const gallery = (Array.isArray(dish.images) && dish.images.length ? dish.images : [dish.imageUrl])
    .filter(Boolean);
  const slides = gallery.length ? gallery : [""];
  const infoText = text(dish.description) || noInfo;
  const priceLabel = dish.price !== null ? formatPrice(dish.price, currency) : "";
  const woltUrl = text(dish.woltUrl) || text(profile.woltUrl);

  // Cross-Selling wie im Original: die am Artikel gepflegten Artikel-IDs.
  const byId = new Map();
  menuItems.forEach((item) => {
    if (item.id) byId.set(String(item.id), item);
  });
  const configuredCross = (Array.isArray(dish.crossSellItemIds) ? dish.crossSellItemIds : [])
    .map((entryId) => byId.get(String(entryId)))
    .filter((item) => item && item.id !== dish.id);
  const crossSell = (configuredCross.length
    ? configuredCross
    : menuItems.filter((item) => item.id !== dish.id && item.imageUrl)
  ).slice(0, 3);
  const crossCountLabel = crossSell.length === 1 ? "1 sugjerim" : `${crossSell.length} sugjerime`;

  const homePrimary = woltUrl
    ? `<span class="ll-dm__primary ll-dm__primary--wolt"><span>Wolt</span>${icon("external-link", { size: 16 })}</span>`
    : `<span class="ll-dm__primary"><span>Te preferuarat</span>${icon("bookmark", { size: 16 })}</span>`;

  const html = `
          <div class="ll-dishmodal" aria-label="Dritarja e pjatës">
            <div class="ll-stage__viewport ll-dishmodal__body">
              <div class="ll-stage__scene">

                <div class="ll-dm__hero" data-spot="dhero">
                  ${slides.map((src, index) => `
                    <span class="ll-dm__slide${index === 0 ? " is-active" : ""}">${img(src, dish.name)}</span>
                  `).join("")}
                  ${slides.length > 1 ? `
                    <span class="ll-dm__nav ll-dm__nav--prev">${icon("chevron-left", { size: 16 })}</span>
                    <span class="ll-dm__nav ll-dm__nav--next">${icon("chevron-right", { size: 16 })}</span>
                  ` : ""}
                </div>

                <div class="ll-dm__stack">
                  <div class="ll-dm__price" data-spot="dprice">
                    <span class="ll-dm__price-label">Cmimi</span>
                    <span class="ll-dm__price-value">${esc(priceLabel)}</span>
                  </div>
                  <div class="ll-dm__rule"></div>

                  <div class="ll-dm__info" data-spot="dinfo">
                    <div class="ll-dm__tabrow">
                      <span class="ll-dm__tab is-active">Info</span>
                      <span class="ll-dm__tab">Perberesit</span>
                      <span class="ll-dm__tab">Alergenet</span>
                    </div>
                    <div class="ll-dm__panel">${esc(infoText)}</div>
                  </div>
                  <div class="ll-dm__rule"></div>

                  ${crossSell.length ? `
                    <div class="ll-dm__cross" data-spot="dcross">
                      <div class="ll-dm__crosshead">
                        <h4 class="ll-dm__crosstitle">Shkon shume mire me kete</h4>
                        <span class="ll-dm__crosscount">${esc(crossCountLabel)}</span>
                      </div>
                      <div class="ll-dm__crossrow">
                        ${crossSell.map((item) => `
                          <article class="ll-dm__cs">
                            <div class="ll-dm__cs-media">${img(item.imageUrl, item.name)}</div>
                            <div class="ll-dm__cs-body">
                              <p class="ll-dm__cs-eyebrow">${esc(text(item.category) || "Shkon me kete")}</p>
                              <p class="ll-dm__cs-name">${esc(item.name)}</p>
                              <div class="ll-dm__cs-foot">
                                <span class="ll-dm__cs-price">${item.price !== null ? esc(formatPrice(item.price, currency)) : ""}</span>
                                <span class="ll-dm__cs-add">${icon("plus", { size: 16 })}</span>
                              </div>
                            </div>
                          </article>
                        `).join("")}
                      </div>
                    </div>
                    <div class="ll-dm__rule"></div>
                  ` : ""}

                  <div class="ll-dm__social" data-spot="dsocial">
                    <span class="ll-dm__like">${icon("heart", { size: 14 })}<span>Like</span></span>
                    <span class="ll-dm__counts">
                      <span>0 Likes</span>
                      <span>0 Komente</span>
                    </span>
                  </div>
                </div>

                <div class="ll-dm__comments" data-spot="dsocial">Ende nuk ka komente</div>

              </div>
            </div>

            <div class="ll-dishmodal__foot" data-spot="dorder">
              <div class="ll-dm__footrow ll-dm__footrow--home">
                <span class="ll-dm__commentbtn">${icon("message-square", { size: 20 })}</span>
                ${homePrimary}
              </div>
              <div class="ll-dm__footrow ll-dm__footrow--qr">
                <span class="ll-dm__commentbtn">${icon("message-square", { size: 20 })}</span>
                <span class="ll-dm__primary"><span>Shto ne shporte</span>${icon("shopping-bag", { size: 16 })}</span>
              </div>
            </div>
          </div>
  `;

  const steps = [
    {
      // Ein Wisch, zwei Bewegungen: die Karte wird gedrueckt und umrandet,
      // dann faehrt das Modal darueber.
      view: "menu-dish",
      focus: "",
      label: "Prekja",
      title: "Klienti prek pjatën",
      body: "Pjata hapet në ekran të plotë. Lart rri emri, kategoria dhe X-i - këtu tani rri shpjegimi."
    },
    {
      view: "menu-dish",
      focus: "dhero",
      label: "Fotoja",
      title: slides.length > 1 ? "Foto e madhe, disa foto" : "Foto e madhe",
      body: slides.length > 1
        ? `${slides.length} foto - klienti i rrëshqet me gisht.`
        : "Pjata e juaj e madhe. Më shumë foto? Klienti i rrëshqet."
    },
    {
      view: "menu-dish",
      focus: "dprice",
      label: "Qartësi",
      title: "Çmimi",
      body: "Një rresht, gjithmonë i saktë. E ndryshoni një herë - ndryshon kudo."
    },
    {
      view: "menu-dish",
      focus: "dinfo",
      label: "Detajet",
      title: "Info, Perberesit, Alergenet",
      body: "Tri tabe. Fusha bosh do të thotë: „Nuk ka informacion...“ - prandaj mbushen një herë."
    },
    ...(crossSell.length ? [{
      view: "menu-dish",
      focus: "dcross",
      label: "Më shumë për porosi",
      title: "Shkon shume mire me kete",
      body: "Ju zgjidhni çfarë propozohet te çdo pjatë. Porosia rritet vetë."
    }] : []),
    {
      view: "menu-dish",
      focus: "dsocial",
      label: "Reagimet",
      title: "Like dhe komente",
      body: "Klienti pëlqen dhe komenton pjatën. Ju shihni çfarë ecën."
    },
    {
      view: "menu-dish-home",
      focus: "dorder",
      label: "Nga shtëpia",
      title: woltUrl ? "Porosia përmes Wolt-it" : "Ruaje për më vonë",
      body: woltUrl
        ? "Pa tavolinë nuk ka shportë. Nga shtëpia porosia shkon përmes Wolt-it."
        : "Pa tavolinë nuk ka shportë. Butoni e ruan pjatën; me Wolt-in e lidhur del Wolt."
    },
    {
      view: "menu-dish-qr",
      focus: "dorder",
      label: "Me QR në tavolinë",
      title: "Shto ne shporte",
      body: "Pas skanimit të QR kodit e njëjta dritare jep shportën dhe + te sugjerimet."
    },
    {
      view: "menu-dish-qr",
      focus: "dorder",
      label: "Te kamarieri",
      title: "Porosia shkon te Waiter-i",
      body: "Klienti dërgon nga tavolina, kamarieri e sheh menjëherë me numrin e tavolinës."
    }
  ];

  return { html, steps };
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

  const { shownItems, drinkItems, foodItems } = resolveMenuBuckets(menuItems);
  const openedDish = pickOpenedDish(foodItems, shownItems);
  const dishModal = buildDishModal(profile, openedDish, menuItems, currency);
  const emptyNote = `<div class="ll-card ll-card--pad" style="text-align:center;">
      <p class="ll-callout__body">Menuja vendoset një herë - dhe është e gjallë në çdo tavolinë.</p>
    </div>`;

  // openedId markiert die Karte, die im naechsten Schritt gedrueckt wird und
  // das Modal oeffnet - dieselbe Karte, die der Kunde gerade vor sich hat.
  const listOf = (list, openedId = "") => {
    if (!list.length) return emptyNote;
    const gridItems = list.filter((item) => !usesFoodCard(item));
    const stackedItems = list.filter(usesFoodCard);
    const isOpened = (item) => !!openedId && String(item.id) === String(openedId);
    return [
      gridItems.length ? `<div class="ll-menu-grid">${gridItems.map((item) => drinkCard(item, currency, isOpened(item))).join("")}</div>` : "",
      stackedItems.length ? `<div class="ll-food-list">${stackedItems.map((item) => foodCard(item, currency, isOpened(item))).join("")}</div>` : ""
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
            <div class="ll-menu-part ll-menu-part--food"><div data-spot="mfood">${listOf(foodItems, openedDish?.id)}</div></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Menue-Szene und Speisen-Modal liegen im selben Kapitel uebereinander: Aus
  // "Pjatat tuaja" wird beim naechsten Wisch die gedrueckte Karte und darueber
  // faehrt das Modal herein - ohne Bruch, ohne neues Kapitel.
  const body = `
        <div class="ll-stage__stack">
          <div class="ll-stage__viewport">
            <div class="ll-stage__scene">${scene}</div>
          </div>
          ${dishModal ? dishModal.html : ""}
        </div>
  `;

  return stage({
    eyebrow: "Hapi 1",
    title: "Kështu ju sheh klienti.",
    body,
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
      },
      ...(dishModal ? dishModal.steps : [])
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
