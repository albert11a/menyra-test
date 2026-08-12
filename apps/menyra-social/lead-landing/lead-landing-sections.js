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

// Zwei Pakete, nicht drei und nicht eines.
//
// Der freie Monat ist weg. An seine Stelle tritt etwas, das dieselbe Frage
// besser beantwortet - "was kostet es mich, wenn es nichts bringt?": Die
// digitale Praesenz (Profil, Postimet, Ofertat, Karte) bleibt dauerhaft
// kostenlos. Ein Wirt muss also nichts testen und nichts kuendigen; er kann
// einfach dabei sein.
//
// Bezahlt wird nur das, was Arbeit abnimmt: die digitale Menue mit den
// QR-Codes am Tisch. Genau zwei Pakete, weil die Frage dann "mit Menue oder
// ohne?" lautet - eine Frage, die ein Wirt in einer Sekunde beantwortet.
const PLANS = [
  {
    key: "falas",
    name: "Falas",
    price: "0",
    currency: "€",
    period: "muaj",
    note: "Përgjithmonë falas.",
    features: [
      "Profili juaj publik në Mnyra",
      "Postimet dhe feed-i social",
      "Ofertat për klientët",
      "Vendndodhja në hartën e zbulimit"
    ]
  },
  {
    key: "menu",
    name: "Menu digjitale",
    price: "14",
    currency: "€",
    period: "muaj",
    highlight: true,
    badge: "Menu + QR",
    note: "Pa kontratë. E anuloni kur të doni.",
    features: [
      "Gjithçka nga paketa falas",
      "Menu digjitale me foto dhe çmime",
      "QR kodet për tavolinat",
      "Porositë direkt nga tavolina"
    ]
  }
];

const PAID_PLAN = PLANS[1];


// Bilder werden erst geladen, wenn sie in die Naehe des Bildes kommen. Die
// beiden ersten Bildschirme sind die Ausnahme: Sie sind sofort zu sehen und
// duerfen nicht hinter dem Rest anstehen (eager).
// decoding="async" haelt das Entpacken aus dem Wischen heraus.
function img(src, alt = "", fallback = IMG_FALLBACK, { eager = false } = {}) {
  const safeSrc = text(src) || fallback;
  const priority = eager ? `loading="eager" fetchpriority="high"` : `loading="lazy"`;
  return `<img src="${esc(safeSrc)}" alt="${esc(alt)}" ${priority} decoding="async" onerror="this.onerror=null;this.src='${fallback}'" />`;
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
//
// step.canvas: Farbe der Seite, solange dieser Schritt laeuft. Damit faerben
// sich auch die Streifen hinter Statusleiste und Werkzeugleiste mit - die
// nimmt der Browser von der Seite, nicht vom Kapitel.
//
// aside: Eine Flaeche, die sich ueber das ganze Kapitel legt - ueber Balken,
// Text und Szene. Damit laesst sich mitten in ein Kapitel ein Bildschirm
// einschieben, auf dem nichts erklaert wird (die Frage nach der kurzen
// Vorschau). Sichtbar wird sie beim Schritt mit view "ask".
function stage({ title, scene, steps = [], aside = "", track = "" }) {
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
            <div class="ll-stage__step${index === 0 ? " is-active" : ""}" data-focus="${esc(step.focus || "")}" data-view="${esc(step.view || "")}"${step.canvas ? ` data-canvas="${esc(step.canvas)}"` : ""}>
              ${step.title ? `<p class="ll-stage__step-title">${esc(step.title)}</p>` : ""}
              <p class="ll-stage__step-body">${stepBody(step.body)}</p>
            </div>
          `).join("")}
        </div>

        <div class="ll-stage__viewport">
          <div class="ll-stage__scene">${scene}</div>
        </div>

        ${aside ? `<div class="ll-stage__aside">${aside}</div>` : ""}
      </div>

      ${allSteps.map((_, index) => `
        <div class="ll-stage__anchor" aria-hidden="true"${track ? ` data-track="${esc(track)}-${index}"` : ""} style="top: calc(${index} * var(--ll-vh));"></div>
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
    <header class="ll-section ll-hero" data-track="hyrje">
      <div class="ll-hero__glow" aria-hidden="true"></div>

      <div class="ll-greet" aria-live="polite">
        ${GREETINGS.map((greeting, index) => `
          <h1 class="ll-greet__item${index === 0 ? " is-active" : ""}" data-greet="${index}">${esc(greeting)}</h1>
        `).join("")}
      </div>

      <div class="ll-brand">
        <span class="ll-brand__logo">${img(profile.logoUrl, `${profile.name} logo`, LOGO_FALLBACK, { eager: true })}</span>
        <h2 class="ll-brand__name">
          <span style="color:${esc(c1)}">${esc(parts.part1)}</span>${parts.part2 ? `<span style="color:${esc(c2)}">${esc(parts.part2)}</span>` : ""}
        </h2>
      </div>

      <p class="ll-lead" style="max-width:340px;margin-bottom:0;position:relative;z-index:2;">
        Profili dhe menuja juaj digjitale janë tashmë gati në Mnyra. Zbuloni çfarë është Mnyra, si ju shohin e ju gjejnë klientët dhe si porosisin direkt nga tavolina.
      </p>

      <div class="ll-scroll-hint" aria-hidden="true">
        ${icon("chevron-down", { size: 26 })}
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

function buildSurfaceScene(profile = {}, posts = [], menuItems = [], focusItems = [], { eager = false } = {}) {
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
              <span class="ll-profile__coverimg">${img(profile.coverUrl, "Ballina", IMG_FALLBACK, { eager })}</span>
              <span class="ll-profile__scrim"></span>
              <span class="ll-profile__fade"></span>
            </div>
            ${socialButtons ? `<div class="ll-profile__socials" data-spot="social">${socialButtons}</div>` : ""}

            <div class="ll-profile__body">
              <div class="ll-profile__toprow">
                <span class="ll-profile__avatar" data-spot="identity">${img(profile.logoUrl, `${profile.name} logo`, LOGO_FALLBACK, { eager })}</span>
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
  // Die Kartela ist der zweite Bildschirm - ihr Bild und ihre Logo laden
  // sofort. Die zweite Ausfertigung weiter unten holt dieselben Adressen aus
  // dem Zwischenspeicher.
  const { scene } = buildSurfaceScene(profile, posts, menuItems, focusItems, { eager: true });

  return stage({
    track: "profil",
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
      { view: "ask", focus: "", canvas: "#ffffff", body: "" }
    ]
  });
}

// Aufnahmen der echten App, eine je Wisch - Bild, Text, Bild, Text.
//
// Die Reihenfolge ist der Weg des Gastes: Er oeffnet Mnyra, sieht den Feed,
// findet die Lokale, sucht auf der Karte, oeffnet die Menue, holt sich einen
// Kupon - und sitzt am Ende im Lokal am Tisch. Die letzte Aufnahme ist
// deshalb die einzige ohne Bildschirm: Dort geht es um den QR-Code auf dem
// Tisch.
//
// Die Aufnahmen sind quadratisch und stehen auf Weiss, genau wie der
// Abschnitt selbst - dadurch ist kein Bildrand zu sehen. Die Masse stehen im
// Markup, damit der Text beim Laden nicht nachspringt.
// Was zwischen Sternchen steht, traegt die Aussage und wird hervorgehoben;
// der Rest des Satzes tritt zurueck.
const SHOTS = [
  {
    file: "mnyra-start.webp",
    // ruht: wo die Aufnahme stehen bleibt. kommt: wo sie herkommt.
    // Alle stehen fast mittig - ein paar Grad Schraeglage und ein paar Pixel
    // nach links oder rechts reichen, damit die Reihe nicht starr wirkt.
    ruht: { x: 0, dreh: 0 },
    kommt: { x: -22, dreh: 0 },
    title: "Fillimi",
    body: "Klienti hap Mnyra dhe zgjedh qytetin. *Pa aplikacion, pa regjistrim* - mjafton linku."
  },
  {
    file: "mnyra-feed.webp",
    ruht: { x: 8, dreh: -2 },
    kommt: { x: 40, dreh: -5 },
    title: "Feed-i",
    body: "Story-t dhe postimet e lokaleve, të freskëta çdo ditë. *Lokali juaj është mes tyre*, aty ku shikon i gjithë qyteti."
  },
  {
    file: "mnyra-lista.webp",
    ruht: { x: 5, dreh: 1.5 },
    kommt: { x: 32, dreh: 4 },
    title: "Lista",
    body: "Foto, vlerësim dhe orar për secilin lokal. *Profili dhe menyja hapen me një prekje* - pa kërkuar më tutje."
  },
  {
    file: "mnyra-harta.webp",
    ruht: { x: -6, dreh: 0 },
    kommt: { x: -34, dreh: 0 },
    title: "Harta",
    body: "Klienti sheh çfarë ka afër tij. *Ju shfaqeni atje ku ai ndodhet*, në momentin kur ka uri."
  },
  {
    file: "mnyra-menyja.webp",
    ruht: { x: 8, dreh: 2 },
    kommt: { x: 38, dreh: 5 },
    title: "Menyja",
    body: "Çdo produkt me foto, çmim, përbërës dhe alergjenë. *E përditësoni vetë, kur të doni* - klienti e sheh menjëherë."
  },
  {
    file: "mnyra-ofertat.webp",
    ruht: { x: -8, dreh: -1.5 },
    kommt: { x: -36, dreh: -4 },
    title: "Ofertat",
    body: "Oferta juaj shkon te klientët e qytetit dhe aktivizohet në lokal. *Më shumë klientë.*"
  },
  {
    file: "mnyra-tavolina.webp",
    ruht: { x: 0, dreh: 0 },
    kommt: { x: 24, dreh: 0 },
    title: "Në tavolinë",
    body: "QR kodi në tavolinat tuaja: klienti skanon, *porosit direkt nga menyja* dhe thërret kamarierin nga profili."
  }
];

// Escaped wird stueckweise, damit aus dem Text selbst nie Markup werden kann -
// hervorgehoben wird nur das, was zwischen Sternchen steht.
function shotBody(body = "") {
  return String(body)
    .split(/\*([^*]+)\*/g)
    .map((part, index) => (index % 2 ? `<b>${esc(part)}</b>` : esc(part)))
    .join("");
}

export function renderShots() {
  return `
    <section class="ll-shots" data-canvas="#ffffff">
      ${SHOTS.map((shot, index) => `
        <figure
          class="ll-shot"
          data-shot
          data-track="pamja-${index + 1}"
          style="--ll-shot-x:${shot.ruht.x}px;--ll-shot-r:${shot.ruht.dreh}deg;--ll-shot-x0:${shot.kommt.x}px;--ll-shot-r0:${shot.kommt.dreh}deg;"
        >
          <span class="ll-shot__media">
            <img
              class="ll-shot__img"
              src="/apps/menyra-social/lead-landing/media/${esc(shot.file)}"
              alt="${esc(shot.title)}"
              width="880"
              height="880"
              loading="lazy"
              decoding="async"
            />
          </span>
          <figcaption class="ll-shot__text">
            <p class="ll-shot__title">${esc(shot.title)}</p>
            <p class="ll-shot__body">${shotBody(shot.body)}</p>
          </figcaption>
        </figure>
      `).join("")}
    </section>
  `;
}


/* -------------------------------------------------------------- Preise */

// Beide Pakete stehen untereinander auf einem Bildschirm - kostenlos zuerst.
// Nebeneinander waeren die Listen auf einem Handy zwei Spalten von je acht
// Zeichen Breite; untereinander liest man sie in derselben Reihenfolge, in der
// man sie vergleicht.
function planCard(plan) {
  const features = Array.isArray(plan.features) ? plan.features : [];
  return `
      <article class="ll-plan2${plan.highlight ? " ll-plan2--main" : ""}">
        <div class="ll-plan2__head">
          <span class="ll-plan2__name">
            ${esc(plan.name)}
            ${plan.badge ? `<span class="ll-plan2__badge">${esc(plan.badge)}</span>` : ""}
          </span>
          <span class="ll-plan2__amount">
            <span class="ll-plan2__value">${esc(plan.price)}</span>
            <span class="ll-plan2__unit">
              <span class="ll-plan2__currency">${esc(plan.currency || "€")}</span>
              <span class="ll-plan2__period">/ ${esc(plan.period || "muaj")}</span>
            </span>
          </span>
        </div>
        ${plan.note ? `<p class="ll-plan2__note">${esc(plan.note)}</p>` : ""}
        <ul class="ll-plan2__list">
          ${features.map((entry) => `
            <li>${icon("check", { size: 14 })}<span>${esc(entry)}</span></li>
          `).join("")}
        </ul>
      </article>
  `;
}

export function renderPricing() {
  return `
    <section class="ll-section" data-track="cmimi">
      ${sectionHead("Çmimi", "Dy mundësi. Filloni falas - menunë digjitale e shtoni kur të doni.")}

      <div class="ll-plans">
        ${PLANS.map(planCard).join("")}
      </div>

      <p class="ll-note">Çmimet janë pa TVSH. Vendosja e profilit dhe menuja e parë janë të përfshira.</p>
    </section>
  `;
}

/* ------------------------------------------------------- Abschluss: Karten */

// Vier Karten statt eines Kontaktfeldes. Sie beantworten die Fragen, die nach
// dem Preis kommen - und keine, die vorher schon beantwortet wurde. Der Preis
// steht direkt darueber, er gehoert deshalb nicht noch einmal hierher.
const CLOSING_CARDS = [
  {
    icon: "sparkles",
    title: "Vendosja",
    body: "Profilin dhe menunë e parë i ndërtojmë ne. Ju vetëm konfirmoni."
  },
  {
    icon: "check",
    title: "Pa rrezik",
    body: "Profili, postimet dhe ofertat janë falas. Menuja digjitale pa kontratë - e anuloni kur të doni."
  },
  {
    icon: "message",
    title: "Mbështetje",
    body: "Jemi në WhatsApp për çdo pyetje, çdo ditë."
  },
  {
    icon: "clock",
    title: "Përditësime",
    body: "Menunë, ofertat dhe postimet i ndryshoni vetë, kurdo."
  }
];

export function renderClosing() {
  return `
    <section class="ll-section" data-track="si-funksionon">
      ${sectionHead("Si funksionon", "Katër gjëra që duhet t'i dini para se të fillojmë.")}

      <div class="ll-cards">
        ${CLOSING_CARDS.map((card) => `
          <article class="ll-card2">
            <span class="ll-card2__icon">${icon(card.icon, { size: 18 })}</span>
            <div>
              <p class="ll-card2__title">${esc(card.title)}</p>
              <p class="ll-card2__body">${esc(card.body)}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

/* ----------------------------------------------------------- Drei Fragen */

// Die Fragen liegen auf einem einzigen Bildschirm und tauschen ihren Inhalt,
// sobald geantwortet wird. Nicht drei Abschnitte untereinander: Die dritte
// Frage kommt nur, wenn die zweite mit Nein beantwortet wird - stuenden sie
// im Layout, muesste beim Antworten etwas eingeblendet und hingescrollt
// werden. So bewegt sich nichts, und es gibt nichts, wo man haengen bleibt.
//
// Der Ablauf steht als Daten da, nicht als Verzweigung im Code: Jede Antwort
// nennt den naechsten Schritt. Eine weitere Frage einzufuegen heisst, einen
// Eintrag zu ergaenzen.
//
// Der Weg zum eigenen Profil steht unter der Karte, nicht in ihr: Er gilt fuer
// jede Ansicht gleichermassen - vor der ersten Frage so wie nach der letzten -
// und wandert dadurch beim Antworten nicht mit. In den Abschluss-Ansichten
// stand er vorher doppelt; dort bleibt jetzt nur, was dort hingehoert
// (WhatsApp).
export const ASK_FLOW = {
  q1: {
    step: 1,
    question: "Ju pëlqen Mnyra si platformë?",
    answers: [
      { key: "po", label: "Po", next: "q2" },
      { key: "jo", label: "Jo", next: "q2" }
    ]
  },
  q2: {
    step: 2,
    question: `Dëshironi menunë digjitale me QR kode për ${PAID_PLAN.price} ${PAID_PLAN.currency} në muaj?`,
    note: "Fillimisht bisedojmë dhe ju tregojmë çdo detaj - kemi ende shumë funksione.",
    answers: [
      { key: "po", label: "Po", next: "yes" },
      { key: "jo", label: "Jo", next: "q3" }
    ]
  },
  // Wer die Menue nicht will, wird nicht verabschiedet: Das kostenlose Paket
  // ist die eigentliche Tuer. Deshalb fragt der dritte Schritt danach - und
  // nicht mehr nach einem Testmonat, den es nicht mehr gibt.
  q3: {
    step: 3,
    question: "Dëshironi ta përdorni falas vetëm profilin, postimet dhe ofertat?",
    answers: [
      { key: "po", label: "Po", next: "yes" },
      { key: "jo", label: "Jo", next: "no" }
    ]
  },
  yes: {
    done: true,
    title: "Ju faleminderit!",
    body: "Ju presim në WhatsApp për çdo pyetje dhe për të përfunduar gjithë menunë."
  },
  no: {
    done: true,
    title: "Faleminderit për kohën tuaj.",
    body: "Nëse ndryshoni mendje, profili juaj ju pret."
  }
};

export function renderAsk(profile = {}, sales = {}) {
  const phone = text(sales.contactPhone) || text(profile.phone);
  const name = text(profile.name);
  const waUrl = whatsappUrl(phone, `Përshëndetje! Kam parë faqen e Mnyra për ${name} dhe dua të filloj.`);
  const slug = text(profile.publicSlug);
  const profileUrl = slug ? `https://www.mnyra.com/${encodeURIComponent(slug)}` : "";

  return `
    <section class="ll-section ll-ask3" data-ask data-track="pyetjet">
      <p class="ll-ask3__lead">Ju lutem, vetëm 3 pyetje.</p>

      <div class="ll-ask3__card">
        ${Object.keys(ASK_FLOW).map((key) => {
    const node = ASK_FLOW[key];
    if (node.done) {
      return `
            <div class="ll-ask3__view" data-view="${esc(key)}" hidden>
              <p class="ll-ask3__done-title">${esc(node.title)}</p>
              <p class="ll-ask3__done-body">${esc(node.body)}</p>
              ${key === "yes" && waUrl
    ? `<div class="ll-ask3__links">
                  <a class="ll-ask3__btn ll-ask3__btn--wa" href="${esc(waUrl)}" target="_blank" rel="noopener noreferrer">${icon("whatsapp", { size: 18 })} WhatsApp</a>
                </div>`
    : ""}
            </div>
          `;
    }
    return `
          <div class="ll-ask3__view" data-view="${esc(key)}" hidden>
            <p class="ll-ask3__count">Pyetja ${node.step}</p>
            <p class="ll-ask3__q">${esc(node.question)}</p>
            ${node.note ? `<p class="ll-ask3__note">${esc(node.note)}</p>` : ""}
            <div class="ll-ask3__btns">
              ${node.answers.map((answer) => `
                <button type="button" class="ll-ask3__answer" data-answer="${esc(answer.key)}" data-next="${esc(answer.next)}">${esc(answer.label)}</button>
              `).join("")}
            </div>
          </div>
        `;
  }).join("")}
      </div>

      ${profileUrl
    ? `<a class="ll-ask3__profile" href="${esc(profileUrl)}" target="_blank" rel="noopener noreferrer">
            ${icon("external-link", { size: 17 })}
            <span>Vizito profilin tuaj</span>
          </a>`
    : ""}
    </section>
  `;
}

export const LEAD_LANDING_GREETINGS_COUNT = GREETINGS.length;
export { PLANS };
