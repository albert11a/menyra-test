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

// Grundton der App-Oberflaeche - bg-slate-50, wie die Kopfleiste in der App.
const SURFACE = "#f8fafc";

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

// Nur Titel und Fliesstext. Die kleine blaue Marke darueber ist weggefallen -
// der Titel selbst ist jetzt blau, das spart eine Zeile.
function sectionHead(title, lead) {
  return `
    <h2 class="ll-h2">${esc(title)}</h2>
    ${lead ? `<p class="ll-lead">${esc(lead)}</p>` : ""}
  `;
}

// Ein Zeilenumbruch im Erklaertext ("\n") bleibt erhalten. Gebraucht wird er
// dort, wo zwei Halbsaetze untereinander gehoeren. Jede Zeile wird einzeln
// maskiert - aus dem Text selbst kann also weiterhin kein Markup werden.
function stepBody(body = "") {
  return String(body || "")
    .split("\n")
    .map((line) => esc(line))
    .join("<br />");
}

// Ein erklaerendes Kapitel: die Szene bleibt beim Scrollen stehen und wird
// Schritt fuer Schritt erlaeutert. steps[0] ist die Gesamtansicht (ohne
// Fokus), danach hebt jeder Schritt einen Teil hervor.
//
// steps: [{ focus, view, label, title, body }]
//   focus "" laesst alles scharf, view schaltet die Szene um.
// overlay: Eine zweite Szene, die sich ueber die erste legt - so wie sich in
// der App ein Modal ueber das Profil legt. Sie ist nur sichtbar, solange ein
// Schritt eine Ansicht dafuer verlangt.
//
// step.canvas: Farbe der Seite, solange dieser Schritt laeuft. Damit faerben
// sich auch die Streifen hinter Statusleiste und Werkzeugleiste mit - die
// nimmt der Browser von der Seite, nicht vom Kapitel.
//
// aside: Eine Flaeche, die sich ueber das ganze Kapitel legt - ueber Balken,
// Text und Szene. Damit laesst sich mitten in ein Kapitel ein Bildschirm
// einschieben, auf dem nichts erklaert wird (die Frage nach der kurzen
// Vorschau). Sichtbar wird sie beim Schritt mit view "ask".
function stage({ title, scene, steps = [], overlay = "", aside = "" }) {
  const focusSteps = Math.max(1, steps.length - 1);
  // Schritt 0 traegt den Kapiteltitel. So gibt es nur einen Textblock und er
  // steht immer an derselben Stelle - die Szene bekommt den Rest.
  const allSteps = steps.map((step, index) => (index === 0
    ? { ...step, title }
    : step));
  const firstView = esc(allSteps[0]?.view || "");
  return `
    <section class="ll-stage" data-steps="${focusSteps}" style="--ll-steps:${focusSteps};" ${firstView ? `data-view="${firstView}"` : ""}>
      <div class="ll-stage__pin">
        <div class="ll-stage__bar"><span></span></div>

        <div class="ll-stage__caption">
          ${allSteps.map((step, index) => `
            <div class="ll-stage__step${index === 0 ? " is-active" : ""}" data-focus="${esc(step.focus || "")}" data-view="${esc(step.view || "")}"${step.canvas ? ` data-canvas="${esc(step.canvas)}"` : ""}${step.full ? ` data-full="1"` : ""}>
              ${step.title ? `<p class="ll-stage__step-title">${esc(step.title)}</p>` : ""}
              <p class="ll-stage__step-body">${stepBody(step.body)}</p>
            </div>
          `).join("")}
        </div>

        <div class="ll-stage__viewport">
          <div class="ll-stage__scene">${scene}</div>
          ${overlay ? `<div class="ll-stage__overlay">${overlay}</div>` : ""}
        </div>

        ${aside ? `<div class="ll-stage__aside">${aside}</div>` : ""}
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
        Profili dhe menuja juaj digjitale janë tashmë gati në Mnyra. Zbuloni çfarë është Mnyra, si ju shohin e ju gjejnë klientët dhe si porosisin direkt nga tavolina.
      </p>

      <div class="ll-scroll-hint">
        <span>Rrëshqitni Lart</span>
        ${icon("chevron-down", { size: 22 })}
      </div>
    </header>
  `;
}

/* ------------------------------------------------------------ Die Frage */

// Ein Bildschirm Pause: erst die kurze Vorschau des Profils, dann die Frage,
// dann die ausfuehrliche Erklaerung. Geschrieben wie der Name im Kopf der
// Seite - der erste Teil dunkel, der Name in Mnyra-Blau -, darunter derselbe
// Pfeil wie beim Hinweis zum Wischen.
function askScreen() {
  return `
    <div class="ll-ask">
      <p class="ll-ask__text">Çka është <span class="ll-ask__brand">Mnyra?</span></p>
      <span class="ll-ask__arrow">${icon("chevron-down", { size: 22 })}</span>
    </div>
  `;
}

/* -------------------------------------------------------------- Profil */

/* ---------- Das Profil-Kapitel: Profil -> Info -> Postimet -> Menu ----------
   Eine einzige Szene, die sich beim Scrollen verwandelt. Der Kunde verliert
   nie den Zusammenhang: erst die Kartela mit den Tabs darunter, dann wird
   Info gedrueckt und die Karte dreht auf die Kontaktdaten, danach weicht die
   Karte nach oben, die Tabs ruecken hoch und darunter erscheinen erst die
   Postimet und dann die Menu.

   Erzaehlt wird es in zwei Zuegen: erst die kurze Vorschau, die mit der
   Frage endet - dazwischen liegt das Mnyra-Kapitel als Antwort -, dann
   dasselbe noch einmal in Ruhe, Teil fuer Teil. Beide bauen dieselbe Szene;
   sie stehen an zwei Stellen der Seite und koennen sie sich deshalb nicht
   teilen. */

function buildSurfaceScene(profile = {}, posts = [], menuItems = [], focusItems = []) {
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

  // Nur die zwei neuesten Postimet - eine Reihe reicht, um zu zeigen, wie
  // es aussieht. Die Liste kommt schon nach Datum sortiert an.
  const latestPosts = posts.slice(0, 2);
  const postGrid = latestPosts.length
    ? `<div class="ll-grid">${latestPosts.map((post) => `
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

  return { scene, categories };
}

// Die kurze Vorschau: Kartela, dann die beiden Seiten darunter. Sie endet mit
// der Frage - beantwortet wird sie vom Mnyra-Kapitel, das gleich danach
// kommt. Die Texte sind fuer jemanden geschrieben, der Mnyra zum ersten Mal
// sieht: ein Gedanke pro Satz, keine Fachwoerter, alles aus Sicht des Gastes.
export function renderSurface(profile = {}, posts = [], menuItems = [], focusItems = []) {
  const { scene } = buildSurfaceScene(profile, posts, menuItems, focusItems);

  return stage({
    title: "Profili juaj në Mnyra",
    scene,
    aside: askScreen(),
    steps: [
      // Hier ist noch kein Tab gedrueckt - das passiert im naechsten Schritt
      // von selbst, so wie es der Klient in der App tut.
      { view: "profile-idle", focus: "", body: "Informacion, postimet dhe menuja. Gjithçka, në një vend." },
      { view: "posts", focus: "", title: "Postimet", body: "Kartela ngjitet lart dhe mbeten dy butona. Postimet hapet vetë - me fotot tuaja." },
      { view: "menu-focus", focus: "", title: "Sot në fokus", body: "Pastaj hapet Menu. Lart dalin pjatat që doni të shisni sot." },
      { view: "menu-food", focus: "", title: "Menyja juaj", body: "Dhe poshtë tyre e gjithë menyja - çdo pjatë me foto dhe çmim." },

      // Ein Bildschirm Pause: die Vorschau ist vorbei, die Frage steht im
      // Raum - und alles, was danach kommt, ist die Antwort darauf.
      { view: "ask", focus: "", body: "" }
    ]
  });
}

// Und nach dem Mnyra-Kapitel dasselbe Profil noch einmal in Ruhe, Teil fuer
// Teil - bis hin zum Speisen-Modal.
export function renderSurfaceDetail(profile = {}, posts = [], menuItems = [], focusItems = []) {
  const { scene, categories } = buildSurfaceScene(profile, posts, menuItems, focusItems);

  // Nach der Menuekarte geht es ohne Bruch weiter: Der Gast tippt eine
  // Speise an, das Modal legt sich darueber. Deshalb haengt es als Overlay
  // an diesem Kapitel und nicht als eigenes.
  const dish = buildDishChapter(profile, menuItems);

  return stage({
    title: "Profili juaj nga afër",
    scene,
    overlay: dish.overlay,
    steps: [
      // Wieder die ruhige Gesamtansicht wie am Anfang - noch ist kein Tab
      // gedrueckt, es geht erst los.
      { view: "profile-idle", focus: "", body: "Kthehemi te profili juaj - tani pjesë për pjesë." },
      { view: "profile", focus: "identity", title: "Logoja dhe emri", body: "Fotoja e lokalit, logoja, emri dhe qyteti. Klienti e sheh menjëherë kush jeni." },
      { view: "profile", focus: "social", title: "Harta dhe rrjetet", body: "Këta butona hapin hartën, TikTok-un dhe Instagram-in tuaj. I vendosni një herë." },
      { view: "profile", focus: "fans", title: "Fans", body: "Sa njerëz ju ndjekin. Numri rritet vetë me çdo postim." },
      { view: "profile", focus: "follow", title: "NDIQ", body: "Klienti prek një herë dhe ju ndjek. Pastaj sheh çdo postim tuajin." },
      { view: "profile", focus: "chat", title: "Biseda", body: "Ky buton hap WhatsApp-in tuaj. Klienti ju shkruan direkt." },
      { view: "profile", focus: "info", title: "Butoni Info", body: "Klienti e prek - dhe kartela kthehet nga ana tjetër." },
      { view: "info", focus: "", title: "Kontakti dhe orari", body: "Telefoni, adresa dhe orari juaj. I ndryshoni një herë dhe ndryshojnë kudo." },
      { view: "tabs", focus: "tabs", title: "Postimet & Menu", body: "Kartela hiqet dhe mbeten dy butona. Postimet tregojnë lokalin, Menu shet." },
      { view: "posts", focus: "grid", title: "Postimet tuaja", body: "Fotot dhe videot tuaja - si në Instagram, por brenda Mnyra." },
      { view: "menu-focus", focus: "mfocus", title: "Sot në fokus", body: "Kartat me shenjën TIPP janë ato që doni të shisni sot. I zgjidhni ju." },
      { view: "menu-drinks", focus: "mdrinks", title: "Pijet tuaja", body: "Çdo pije me foto dhe çmim. Klienti sheh gjithçka pa pyetur." },
      {
        view: "menu-food",
        focus: "mfood",
        title: "Pjatat tuaja",
        body: categories.length
          ? `Menuja ndahet në kategori: ${categories.join(", ")}. Çdo pjatë me foto dhe çmim.`
          : "Ushqimi, pijet dhe kafeja - secila kategori veç, me foto dhe çmim."
      },
      ...dish.steps
    ]
  });
}
// Das Speisen-Modal ist kein eigenes Kapitel: In der App legt es sich ueber
// das Menue, sobald der Gast eine Speise antippt. Deshalb liefert diese
// Funktion nur Szene und Schritte - angehaengt werden sie an das
// Menue-Kapitel, damit es dort direkt weitergeht.
function buildDishChapter(profile = {}, menuItems = []) {
  const currency = profile.currency || "EUR";
  const dish = menuItems.find((item) => item.imageUrl && item.price !== null)
    || menuItems.find((item) => item.imageUrl)
    || menuItems[0];

  if (!dish) return { overlay: "", steps: [] };

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

  // Aufbau 1:1 aus renderMenuDetailModalCore (Zweig !isShop): scrollender
  // Koerper mit Hero/Preis/Info-Tabs/Cross-Sell/Social, darunter die feste
  // Fusszeile. Vollbild, ohne Rahmen und Rundungen - .modal-sheet setzt in
  // der App border-radius: 0 und height: 100%.
  //
  // Die Kopfzeile des Modals (Name, Kategorie, X) wird hier nicht gezeichnet:
  // an genau dieser Stelle steht der Erklaertext des Kapitels. Deshalb ist
  // das ganze Kapitel weiss - es ist von oben bis unten das Modal.
  const overlay = `
    <div class="ll-md" aria-label="Dritarja e pjatës">
      <div class="ll-md__body">
       <div class="ll-md__clip">
        <div class="ll-md__scroll" data-pan>
        <div class="ll-md__hero" data-spot="dhero">
          ${img(dish.imageUrl, dish.name)}
          ${hasGallery ? `
            <span class="ll-md__nav ll-md__nav--prev">${icon("chevron-left", { size: 16 })}</span>
            <span class="ll-md__nav ll-md__nav--next">${icon("chevron-right", { size: 16 })}</span>
          ` : ""}
        </div>

        <div class="ll-md__stack">
          <div class="ll-md__price" data-spot="dprice">
            <span class="ll-md__price-label">Cmimi</span>
            <span class="ll-md__price-value">${dish.price !== null ? esc(formatPrice(dish.price, currency)) : ""}</span>
          </div>

          <div class="ll-md__rule"></div>

          <div class="ll-md__info" data-spot="dinfo">
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
            <div data-spot="dcross">
              <div class="ll-md__crosshead">
                <h4 class="ll-md__crosstitle">Shkon shume mire me kete</h4>
                <div class="ll-md__crosscount">${esc(countLabel)}</div>
              </div>
              <div class="ll-md__crossrow">${crossSell.map(crossCard).join("")}</div>
            </div>
            <div class="ll-md__rule"></div>
          ` : ""}

          <div class="ll-md__social" data-spot="dsocial">
            <span class="ll-md__like">${icon("heart", { size: 14 })} Like</span>
            <span class="ll-md__counts">
              <span>0 Likes</span>
              <span>0 Komente</span>
            </span>
          </div>
        </div>

        <div class="ll-md__comments" data-spot="dsocial">Ende nuk ka komente</div>
        </div>
       </div>
      </div>

      <div class="ll-md__foot" data-spot="dorder">
        <span class="ll-md__ghost">${icon("message-square", { size: 20 })}</span>
        ${woltUrl
          ? `<span class="ll-md__cta ll-md__cta--wolt">Wolt ${icon("external-link", { size: 16 })}</span>`
          : `<span class="ll-md__cta ll-md__cta--fav">Te preferuarat ${icon("bookmark", { size: 16 })}</span>`}
        <span class="ll-md__cta ll-md__cta--cart">Shto ne shporte ${icon("shopping-bag", { size: 16 })}</span>
      </div>
    </div>
  `;

  // Kurz und buendig, in der Reihenfolge, in der die Teile untereinander
  // stehen: Galerie, Preis, Info, Vorschlaege, Reaktionen, Bestellung.
  // Jeder Schritt faerbt die Seite weiss, damit auch die Streifen oben und
  // unten zum Modal passen.
  const white = "#ffffff";
  const steps = [
    { view: "dish-home", focus: "", canvas: white, title: "Klienti prek pjatën", body: "Dhe hapet kjo dritare, në tërë ekranin." },
    { view: "dish-home", focus: "dhero", canvas: white, title: "Fotoja", body: "Fotoja e madhe e pjatës. Nëse keni disa, klienti i shfleton." },
    { view: "dish-home", focus: "dprice", canvas: white, title: "Cmimi", body: "Gjithmonë i saktë. Asnjë menu letre që vjetërohet." },
    { view: "dish-home", focus: "dinfo", canvas: white, title: "Info, Perberesit, Alergenet", body: "Tre butona me përgjigjet. Klienti lexon vetë dhe pyet më pak." },
    ...(crossSell.length
      ? [{ view: "dish-home", focus: "dcross", canvas: white, title: "Shkon shume mire me kete", body: "Këtu sugjeroni një pije ose ëmbëlsirë. Klienti porosit më shumë." }]
      : []),
    { view: "dish-home", focus: "dsocial", canvas: white, title: "Like dhe komente", body: "Klientët pëlqejnë pjatat. Ju shihni cila pëlqehet më shumë." },
    {
      view: "dish-home",
      focus: "dorder",
      canvas: white,
      title: woltUrl ? "Nga shtëpia: Wolt" : "Nga shtëpia",
      body: woltUrl
        ? "Kur klienti nuk është në lokal, këtu nuk ka shportë. Ai poroson te Wolt-i."
        : "Kur klienti nuk është në lokal, këtu nuk ka shportë. Ai vetëm e ruan pjatën."
    },
    { view: "dish-qr", focus: "dorder", canvas: white, title: "Me kodin QR në tavolinë", body: "Klienti skanon kodin, poroson vetë - dhe porosia vjen te ju." }
  ];

  return { overlay, steps };
}

/* --------------------------------------------- Was Mnyra dem Lokal bringt
   Nachbau der oeffentlichen Mnyra-Startseite: Kopfleiste und der tuerkise
   Bildschirm mit dem Suchfeld. Werte 1:1 aus renderLocationGate
   (core/feed/feed-view-orchestration-controller.js): Titel bis 22rem breit,
   Feld mit Radius 9999px und 1rem/4.2rem/1rem/3rem Innenabstand, der
   Ortungsknopf 2.5rem in #eafbfe auf #00cce5. */
// Die Kopfleiste ist auf allen Mnyra-Bildschirmen dieselbe.
function webHead(spot = "whead") {
  return `
      <div class="ll-web__head" data-spot="${esc(spot)}">
        <span class="ll-web__burger" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="ll-web__brand"><b>MNYRA</b><span>Social</span></span>
        <span class="ll-web__acts">
          ${icon("globe", { size: 22 })}
          ${icon("user", { size: 22 })}
          ${icon("shopping-bag", { size: 22 })}
        </span>
      </div>
  `;
}

// Eine Story-Karte der Reihe. Die des Kunden ist scharf, die der anderen
// Lokale liegen unscharf daneben - erkennbar ist dort nichts, es geht nur
// darum, dass die eigene Story nicht allein steht.
function storyCard({ name, imageUrl, logoUrl, blurred = false }) {
  return `
    <article class="ll-story${blurred ? " ll-story--blur" : ""}"${blurred ? ' aria-hidden="true"' : ""}>
      <div class="ll-story__media">
        ${img(imageUrl, blurred ? "" : `Story ${name}`)}
        <span class="ll-story__scrim"></span>
        <span class="ll-story__ring">${img(logoUrl, blurred ? "" : `${name} logo`, LOGO_FALLBACK)}</span>
        <span class="ll-story__name">${esc(name)}</span>
      </div>
    </article>
  `;
}

// Die Tab-Zeile unter der Kopfleiste - 1:1 aus renderMainHeaderTabs. In der
// App klappt sie unter dem Kopf auf, sobald der Klient dort ist. Der aktive
// Tab kommt vom Schritt, nicht vom Markup (siehe Stylesheet).
function feedTabs() {
  const tabs = [
    { key: "feed", icon: "home", label: "Feed" },
    { key: "restaurants", icon: "utensils", label: "Restorante" },
    { key: "ofertat", icon: "ticket", label: "Ofertat" }
  ];
  return `
      <div class="ll-htabs" data-spot="ftabs">
        <div class="ll-htabs__row">
          ${tabs.map((tab) => `
            <span class="ll-htab" data-tab="${esc(tab.key)}">
              ${icon(tab.icon, { size: 14, className: "ll-htab__icon" })}
              <span class="ll-htab__label">${esc(tab.label)}</span>
            </span>
          `).join("")}
        </div>
      </div>
  `;
}

// Highlights: die Reihe der bezahlten Partner ganz oben unter Restorante -
// Ueberschrift und Karte 1:1 aus renderRestaurantsContent und
// renderRestaurantAdCard.
function highlightsBlock(profile = {}, cover = "") {
  const category = (text(profile.type) || "Restaurant").toUpperCase();
  return `
    <div class="ll-hl" data-spot="fhl">
      <div class="ll-hl__head">
        <p class="ll-hl__title">Highlights</p>
        <p class="ll-hl__sub">Partner premium ne afersine tende</p>
      </div>
      <div class="ll-hl__track">
        <article class="ll-ad">
          <div class="ll-ad__media">
            ${img(cover, `${profile.name}`)}
            <div class="ll-ad__badges">
              <span class="ll-ad__badge ll-ad__badge--best">Best Choice</span>
              <span class="ll-ad__badge ll-ad__badge--delivery">For Delivery</span>
            </div>
            <span class="ll-ad__wolt">WOLT</span>
          </div>
          <div class="ll-ad__body">
            <div class="ll-ad__title-wrap">
              <span class="ll-ad__category">${esc(category)}</span>
              <p class="ll-ad__title">${esc(profile.name)}</p>
            </div>
            <div class="ll-ad__meta">
              <span class="ll-ad__chip">${filledIcon("star", { size: 12, color: "#f59e0b" })}<b>0.0</b></span>
              <span class="ll-ad__chip">${icon("utensils", { size: 12 })}<b>€€ - €€€</b></span>
            </div>
            <span class="ll-ad__cta">${icon("user", { size: 14 })}<span>Shiko profilin</span></span>
          </div>
        </article>
      </div>
    </div>
  `;
}

// Die Karte des Lokals in der Liste - 1:1 aus renderRestaurantListCard.
function restaurantCard(profile = {}, cover = "") {
  const category = (text(profile.type) || "Restaurant").toUpperCase();
  const hours = text(profile.openingHours) || "Orari se shpejti";
  return `
    <article class="ll-rcard" data-spot="fcard">
      <div class="ll-rcard__media">
        ${img(cover, `${profile.name}`)}
        <span class="ll-rcard__scrim"></span>
        <div class="ll-rcard__acts">
          <span class="ll-rcard__act">${icon("map", { size: 16 })}</span>
          <span class="ll-rcard__act">${icon("heart", { size: 16 })}</span>
          <span class="ll-rcard__act">${icon("share", { size: 16 })}</span>
        </div>
        <span class="ll-rcard__price">€€ - €€€</span>
      </div>

      <div class="ll-rcard__body">
        <span class="ll-rcard__logo">${img(profile.logoUrl, `${profile.name} logo`, LOGO_FALLBACK)}</span>

        <div>
          <div class="ll-rcard__rating">
            ${filledIcon("star", { size: 14, color: "#f59e0b" })}
            <b>0.0</b>
            <span>(0 vleresime)</span>
          </div>
          <p class="ll-rcard__name">${esc(profile.name)}</p>
          <p class="ll-rcard__category">${esc(category)}</p>
        </div>

        <hr class="ll-rcard__rule" />

        <div class="ll-rcard__info">
          <span class="ll-rcard__row">${icon("map-pin", { size: 16 })}<span>${esc(text(profile.city))}</span></span>
          <span class="ll-rcard__row">${icon("clock", { size: 16 })}<span>${esc(hours)}</span></span>
        </div>

        <hr class="ll-rcard__rule" />

        <div class="ll-rcard__acts-row">
          <span class="ll-rcard__btn">${icon("user", { size: 14 })}Profili</span>
          <span class="ll-rcard__btn ll-rcard__btn--dark">${icon("book-open", { size: 14 })}Menu</span>
        </div>
      </div>
    </article>
  `;
}

// Die Karte einer Oferta - 1:1 aus renderVoucherCard. Sie teilt den Aufbau
// mit der Lokal-Karte (Bild, Logo ueber der Kante, Trennlinien); eigen sind
// der Ortungsknopf links, die Restlaufzeit rechts und der eine Knopf unten.
function offerCard(profile = {}, offer = null, cover = "") {
  // Hat das Lokal noch keine Oferta, steht hier ein Beispiel - der Schritt
  // erklaert ja, was moeglich ist, nicht was schon eingerichtet wurde.
  const title = text(offer?.title) || "-20% për të gjitha pijet";
  const body = text(offer?.text) || "Oferta vlen ne lokal.";
  const badge = text(offer?.badgeLabel) || "-20%";
  const until = formatOfferUntil(offer?.endAt);
  return `
    <article class="ll-rcard ll-ocard" data-spot="foffer">
      <div class="ll-rcard__media">
        ${img(text(offer?.imageUrl) || cover, `${profile.name}`)}
        <span class="ll-rcard__scrim"></span>
        <span class="ll-ocard__map">${icon("map-pin", { size: 16 })}</span>
        <span class="ll-ocard__time">${icon("clock", { size: 12 })}<span>${esc(formatOfferRemaining(offer?.endAt))}</span></span>
        <span class="ll-ocard__badge">${esc(badge)}</span>
      </div>

      <div class="ll-rcard__body">
        <span class="ll-rcard__logo">${img(profile.logoUrl, `${profile.name} logo`, LOGO_FALLBACK)}</span>

        <div>
          <span class="ll-ocard__kicker">${icon("ticket", { size: 14 })}<b>Oferta</b></span>
          <p class="ll-rcard__name">${esc(profile.name)}</p>
          <p class="ll-ocard__title">${esc(title)}</p>
        </div>

        <hr class="ll-rcard__rule" />

        <div class="ll-rcard__info">
          <span class="ll-rcard__row">${icon("gift", { size: 16 })}<span>${esc(body)}</span></span>
          <span class="ll-rcard__row">${icon("calendar-clock", { size: 16 })}<span>${esc(until)}</span></span>
        </div>

        <hr class="ll-rcard__rule" />

        <span class="ll-ocard__cta">${icon("ticket", { size: 16 })}Aktivizo oferten</span>
      </div>
    </article>
  `;
}

// Restlaufzeit oben rechts - Wortlaut aus formatVoucherRemaining. Ohne
// Enddatum steht dort dasselbe wie in der App: "Pa afat".
function formatOfferRemaining(endAt = "") {
  const raw = text(endAt);
  const end = raw ? new Date(raw).getTime() : 0;
  const left = Number.isFinite(end) ? end - Date.now() : 0;
  if (!(left > 0)) return "Pa afat";
  const day = 86400000;
  const hour = 3600000;
  if (left >= day) {
    const days = Math.floor(left / day);
    return days === 1 ? "Edhe 1 dite" : `Edhe ${days} dite`;
  }
  if (left >= hour) {
    const hours = Math.floor(left / hour);
    return hours === 1 ? "Edhe 1 ore" : `Edhe ${hours} ore`;
  }
  const minutes = Math.max(1, Math.ceil(left / 60000));
  return minutes === 1 ? "Edhe 1 minute" : `Edhe ${minutes} minuta`;
}

// Datumszeile der Oferta - Wortlaut und Schreibweise aus formatValidUntil.
function formatOfferUntil(endAt = "") {
  const raw = text(endAt);
  const date = raw ? new Date(raw) : null;
  if (!date || Number.isNaN(date.getTime())) return "Vlen sa te jete e hapur";
  const pad = (num) => String(num).padStart(2, "0");
  return `Vlen deri me ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export function renderWeb(profile = {}, posts = [], neighbours = [], offer = null) {
  const city = text(profile.city) || "Prishtinë";
  const country = "Kosovë";

  const scene = `
    <div class="ll-web" aria-label="Mnyra në web">
      ${webHead("whead")}

      <div class="ll-web__hero">
        <div class="ll-web__title" data-spot="wtitle">
          <span class="ll-web__slider" aria-hidden="true">
            <span>ZBULO SPOTET.</span>
            <span>GJEJ OFERTA.</span>
            <span>HAP MENYTE.</span>
          </span>
          <span class="ll-web__cityline">NE QYTETIN TEND.</span>
        </div>

        <div class="ll-web__search" data-spot="wcity">
          <div class="ll-web__field">
            <span class="ll-web__pin">${icon("map-pin", { size: 20 })}</span>
            <span class="ll-web__input">
              <span class="ll-web__hint">Shkruaj qytetin...</span>
              <span class="ll-web__typed" style="--ll-type-w:${city.length}ch;">${esc(city)}</span>
            </span>
            <span class="ll-web__locate">${icon("crosshair", { size: 20 })}</span>
          </div>
          <div class="ll-web__suggest">
            <span class="ll-web__suggest-row">
              <span class="ll-web__suggest-label">${esc(city)}</span>
              <span class="ll-web__suggest-meta">${esc(country)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Feed: 1:1 aus renderStoriesRow und renderFeedItem. Story und Postim
  // liegen uebereinander - erst die Story, beim naechsten Wisch der Postim
  // an derselben Stelle, so wie der Klient nach unten scrollt.
  const post = posts[0] || null;
  const storyImage = text(post?.imageUrl);
  // Titelbild fuer Highlights und Lokal-Karte - dasselbe wie in der App. Ohne
  // Titelbild springt das erste Postim ein, damit die Karte nie leer wirkt.
  const cardCover = text(profile.coverUrl) || storyImage;
  const feedScene = `
    <div class="ll-web ll-web--feed" aria-label="Feed-i i Mnyra">
      ${webHead("fhead")}
      ${feedTabs()}
      <div class="ll-feed">
        <div class="ll-feed-part ll-feed-part--story">
          <div data-spot="fstory">
            <div class="ll-feed__rail">
              ${storyCard({ name: profile.name, imageUrl: storyImage, logoUrl: profile.logoUrl })}
              ${(Array.isArray(neighbours) ? neighbours : []).map((place) => storyCard({
    name: place.name,
    imageUrl: place.imageUrl,
    logoUrl: place.logoUrl,
    blurred: true
  })).join("")}
            </div>
          </div>
        </div>

        <div class="ll-feed-part ll-feed-part--post">
          <div data-spot="fpost">
            <article class="ll-fpost">
              <div class="ll-fpost__head">
                <span class="ll-fpost__ident">
                  <span class="ll-fpost__logo">${img(profile.logoUrl, `${profile.name} logo`, LOGO_FALLBACK)}</span>
                  <span>
                    <span class="ll-fpost__name">${esc(profile.name)} ${filledIcon("star", { size: 12, color: "#6366f1" })}</span>
                    <span class="ll-fpost__place">${esc(text(profile.city))}</span>
                  </span>
                </span>
                ${icon("more-horizontal", { size: 20 })}
              </div>
              <div class="ll-fpost__frame">
                <div class="ll-fpost__media">
                  ${img(storyImage, text(post?.caption) || "Postim")}
                  <div class="ll-fpost__caption">
                    <p class="ll-fpost__text">${esc(text(post?.caption) || profile.name)}</p>
                    <div class="ll-fpost__acts">
                      <span class="ll-fpost__group">
                        <span>${icon("heart", { size: 20 })} <b>${esc(formatCount(post?.likeCount || 0))}</b></span>
                        <span>${icon("message-circle", { size: 20 })} <b>${esc(formatCount(post?.commentCount || 0))}</b></span>
                      </span>
                      <span>${icon("share", { size: 16 })} <b>Share</b></span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div class="ll-feed-part ll-feed-part--highlights">
          ${highlightsBlock(profile, cardCover)}
        </div>

        <div class="ll-feed-part ll-feed-part--card">
          ${restaurantCard(profile, cardCover)}
        </div>

        <div class="ll-feed-part ll-feed-part--offer">
          ${offerCard(profile, offer, cardCover)}
        </div>
      </div>
    </div>
  `;

  return stage({
    title: "Çfarë ju sjell Mnyra",
    scene,
    overlay: feedScene,
    steps: [
      // Der Startbildschirm bleibt eine Karte. Randlos waere er unten
      // tuerkis, und der Streifen hinter der Werkzeugleiste traegt die
      // Seitenfarbe - dort schnitte eine Kante ab. Die Farbe der Streifen
      // kommt vom Browser, oben und unten dieselbe: hell passt zur
      // Kopfleiste, tuerkis wuerde oben abschneiden. Als Karte liegt der
      // Grundton rundum, und keine der beiden Kanten faellt auf.
      { view: "web", focus: "", canvas: SURFACE, body: `Të gjithë që hapin Mnyra kërkojnë një vend ku të hanë - në qytetin ku ndodhen.` },
      { view: "web-city", focus: "wcity", canvas: SURFACE, title: "Qyteti", body: `Klienti shkruan qytetin, për shembull ${city} - dhe Mnyra i tregon çfarë ka aty.` },
      { view: "feed-story", focus: "fstory", full: true, canvas: SURFACE, title: "Story-t", body: "Menjëherë pas kësaj hapet feed-i. Lart janë story-t e ditës - dhe e juaja është mes tyre." },
      { view: "feed-post", focus: "fpost", full: true, canvas: SURFACE, title: "Postimet", body: "Poshtë tyre vijnë postimet. Çdo foto që ngarkoni shfaqet këtu, te i gjithë qyteti." },
      // Von hier an fuehrt der Weg vom Feed zur Liste der Lokale: erst der
      // Kopf, dann die Tab-Zeile darunter, dann der Wechsel auf Restorante -
      // und dort zuerst die Highlights, danach die Karte des Lokals.
      { view: "feed-head", focus: "fhead", full: true, canvas: SURFACE, title: "Koka e faqes", body: "Lart qëndron koka e Mnyra. Prej saj klienti lëviz nëpër gjithë aplikacionin." },
      { view: "feed-tabs", focus: "ftabs", full: true, canvas: SURFACE, title: "Skedat", body: "Poshtë saj hapen tri skeda: Feed, Restorante dhe Ofertat." },
      { view: "feed-restaurants", focus: "ftabs", full: true, canvas: SURFACE, title: "Restorante", body: "Klienti prek Restorante - dhe sheh lokalet e qytetit të tij." },
      { view: "feed-highlights", focus: "fhl", full: true, canvas: SURFACE, title: "Highlights", body: "Lart dalin partnerët premium. Aty shfaqeni ju - para të gjithë të tjerëve." },
      { view: "feed-card", focus: "fcard", full: true, canvas: SURFACE, title: "Karta juaj", body: "Pastaj vjen karta juaj: fotoja, vlerësimi, qyteti dhe orari - me Profilin dhe Menynë një prekje larg." },
      // Und der dritte Tab: Ofertat. Erst der Wechsel, dann die Karte.
      { view: "feed-ofertat", focus: "ftabs", full: true, canvas: SURFACE, title: "Ofertat", body: "Skeda e tretë mbledh ofertat e qytetit - dhe e juaja qëndron mes tyre." },
      { view: "feed-offer", focus: "foffer", full: true, canvas: SURFACE, title: "Oferta juaj", body: "Ju vendosni çfarë ofroni dhe deri kur. Klienti e aktivizon me një prekje dhe vjen te ju." }
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
      ${sectionHead("Harta", "Në hartë klienti sheh se ku jeni - me logon tuaj. Kështu ju gjejnë edhe ata që nuk ju njohin.")}

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
      ${sectionHead("Kodi QR në tavolinë", "Klienti ulet, e skanon me kamerën dhe menuja hapet. Pa shkarkuar asgjë.")}

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
      ${sectionHead("Porositë vijnë te ju", "Kur klienti dërgon porosinë, ajo shfaqet menjëherë në telefonin e kamarierit.")}

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
      ${sectionHead("Numrat e lokalit", "Sa njerëz e panë menunë, cila pjatë shitet më shumë, në cilat orë vijnë klientët.")}

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
      ${sectionHead("Paketat", "Zgjidhni si doni të filloni. Pa kontratë të gjatë - paketën e ndryshoni kur të doni.")}

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
