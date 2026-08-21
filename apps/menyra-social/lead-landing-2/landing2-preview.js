// Die Oberflaechen, die Landing 2 zeigt.
//
// Reine String-Funktionen: rein Daten, raus HTML. Kein DOM-Zugriff, kein
// State, kein Schreibpfad, kein Listener. Jede Flaeche hier ist der echten
// Mnyra-Oberflaeche nachgebaut - gleiche Anordnung, gleiche Karten, gleiche
// Woerter - aber als eigenes Markup.
//
// Warum nachgebaut und nicht die echte App eingebettet: Eine eingebettete App
// haette einen eigenen Router, eigene Listener und einen Schreibpfad. Ein
// Klick auf "Shto" waere dann eine echte Bestellung, ein Klick auf "Ndiq" ein
// echter Vorgang am Konto des Wirts. Landing 2 zeigt sein Lokal - sie fasst
// es nicht an.
//
// Was hier "Vorschau" heisst, ist genau das: Es sieht aus wie die App und tut
// nichts.

import { esc, firstText, formatCount, formatPrice, initial, num, text } from "./landing2-format.js";
import { filledIcon, icon } from "./landing2-icons.js";

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='180'%3E%3Crect width='240' height='180' fill='%23f1f5f9'/%3E%3C/svg%3E";
const LOGO_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23f1f5f9'/%3E%3Ccircle cx='48' cy='48' r='30' fill='%2394a3b8'/%3E%3C/svg%3E";

// Bilder laden erst, wenn sie in die Naehe des Bildes kommen. Die erste
// Flaeche ist die Ausnahme (eager): Sie steht sofort da und darf nicht hinter
// dem Rest anstehen. decoding="async" haelt das Entpacken aus dem Wischen
// heraus.
export function img(src, alt = "", fallback = IMG_FALLBACK, { eager = false } = {}) {
  const safeSrc = text(src) || fallback;
  const priority = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `<img src="${esc(safeSrc)}" alt="${esc(alt)}" ${priority} decoding="async" onerror="this.onerror=null;this.src='${fallback}'" />`;
}

// Das Logo eines Lokals. Fehlt es, steht dort der Anfangsbuchstabe statt
// eines grauen Kreises - ein Lokal ohne Logo soll in der Reihe nicht wie ein
// Fehler aussehen.
export function logo(url, name = "", { eager = false } = {}) {
  const found = text(url);
  if (found) return img(found, `${name} logo`, LOGO_FALLBACK, { eager });
  return `<span class="l2-logo-letter" aria-hidden="true">${esc(initial(name))}</span>`;
}

// Der Rahmen jeder Vorschau: die Mnyra-Oberflaeche in voller Breite.
//
// Bewusst kein Telefon aus Kunststoff drumherum. Ein Wirt soll seine Karte
// gross sehen und nicht durch ein Fenster von der Groesse einer Streichholz-
// schachtel. Oben steht nur, welcher Bereich das ist.
export function screen(title = "", body = "", { tab = "", chrome = true, label = "" } = {}) {
  const tabs = [
    { key: "qyteti", name: "Qyteti", iconName: "layout-grid" },
    { key: "lokalet", name: "Lokalet", iconName: "store" },
    { key: "kerko", name: "Kërko", iconName: "search" },
    { key: "harta", name: "Harta", iconName: "map" }
  ];
  const bar = chrome
    ? `<div class="l2-screen__tabs" aria-hidden="true">${tabs.map((entry) => `
        <span class="l2-screen__tab${entry.key === tab ? " is-active" : ""}">
          ${icon(entry.iconName, { size: 18 })}
          <span>${esc(entry.name)}</span>
        </span>
      `).join("")}</div>`
    : "";
  return `
    <div class="l2-screen" role="img" aria-label="${esc(label || title || "Pamje nga Mnyra")}">
      ${title ? `<div class="l2-screen__head" aria-hidden="true">
        <span class="l2-screen__brand">MNYRA</span>
        <span class="l2-screen__title">${esc(title)}</span>
      </div>` : ""}
      <div class="l2-screen__body">${body}</div>
      ${bar}
    </div>
  `;
}

/* ------------------------------------------------------------- Profili */

export function previewProfile(profile = {}, { eager = false } = {}) {
  const cityLabel = text(profile.city).toUpperCase();
  const typeLabel = text(profile.type).toUpperCase() || "BUSINESS";
  const socials = [
    text(profile.address) || (profile.locations || []).length ? "map" : "",
    firstText(profile.tiktok, profile.tiktokUrl) ? "music" : "",
    firstText(profile.instagram, profile.instagramUrl) ? "instagram" : "",
    firstText(profile.facebook, profile.facebookUrl) ? "facebook" : ""
  ].filter(Boolean);

  return `
    <article class="l2-profile">
      <div class="l2-profile__cover">
        ${img(profile.coverUrl, `Ballina e ${profile.name}`, IMG_FALLBACK, { eager })}
        <span class="l2-profile__scrim"></span>
      </div>
      ${socials.length ? `<div class="l2-profile__socials" aria-hidden="true">${socials
        .map((name) => `<span class="l2-socialbtn">${icon(name, { size: 16 })}</span>`)
        .join("")}</div>` : ""}
      <div class="l2-profile__body">
        <div class="l2-profile__toprow">
          <span class="l2-profile__avatar">${logo(profile.logoUrl, profile.name, { eager })}</span>
          <div class="l2-profile__meta" aria-hidden="true">
            <span class="l2-metric">
              <span class="l2-metric__value">${esc(formatCount(profile.followers))}</span>
              <span class="l2-metric__label">Fans</span>
            </span>
            <span class="l2-metric__divider"></span>
            <span class="l2-metric">
              <span class="l2-metric__icon">${icon("info", { size: 20 })}</span>
              <span class="l2-metric__label">Info</span>
            </span>
          </div>
        </div>
        <div class="l2-profile__nameblock">
          <h3 class="l2-profile__name">${esc(profile.name)}</h3>
          <p class="l2-profile__bio">${esc(text(profile.bio) || "Profili juaj në Mnyra.")}</p>
          <p class="l2-profile__tag">${esc([cityLabel, typeLabel].filter(Boolean).join(" / "))}</p>
        </div>
        <div class="l2-profile__actions" aria-hidden="true">
          <span class="l2-btn-primary">Ndiq</span>
          <span class="l2-btn-ghost">${icon("message", { size: 20 })}</span>
        </div>
        <div class="l2-tabs" aria-hidden="true">
          <span class="l2-tab is-active">Postimet</span>
          <span class="l2-tab">Menu</span>
        </div>
      </div>
    </article>
  `;
}

/* ----------------------------------------------------------- Postimet */

export function previewPosts(posts = []) {
  const shown = posts.slice(0, 4);
  if (!shown.length) {
    return `<div class="l2-empty">Sapo të ngarkoni postimin e parë, ai shfaqet këtu - dhe në Qyteti te njerëzit rreth jush.</div>`;
  }
  return `
    <div class="l2-postgrid">
      ${shown.map((post) => `
        <figure class="l2-post">
          ${img(post.imageUrl, text(post.caption) || "Postim")}
          <figcaption class="l2-post__stats" aria-hidden="true">
            <span>${filledIcon("heart", { size: 12, color: "#f43f5e" })} ${esc(formatCount(post.likeCount))}</span>
            <span>${icon("message", { size: 12 })} ${esc(formatCount(post.commentCount))}</span>
          </figcaption>
        </figure>
      `).join("")}
    </div>
  `;
}

/* -------------------------------------------------------------- Menuja */

function drinkCard(item, currency) {
  return `
    <article class="l2-menu-card">
      <div class="l2-menu-card__media">
        ${img(item.imageUrl, item.name)}
        <span class="l2-menu-card__like" aria-hidden="true">${filledIcon("heart", { size: 13, color: "currentColor" })}</span>
      </div>
      <div class="l2-menu-card__body">
        <h4 class="l2-menu-card__name">${esc(item.name)}</h4>
        ${item.description ? `<p class="l2-menu-card__desc">${esc(item.description)}</p>` : ""}
        <div class="l2-menu-card__foot">
          <span class="l2-menu-card__price">${item.price !== null ? esc(formatPrice(item.price, currency)) : ""}</span>
          <span class="l2-menu-card__add" aria-hidden="true">${icon("plus", { size: 15 })}</span>
        </div>
      </div>
    </article>
  `;
}

function foodCard(item, currency) {
  return `
    <article class="l2-food-card">
      <div class="l2-food-card__media">
        ${img(item.imageUrl, item.name)}
        <span class="l2-food-card__like" aria-hidden="true">${filledIcon("heart", { size: 15, color: "currentColor" })}</span>
      </div>
      <div class="l2-food-card__body">
        <div class="l2-food-card__head">
          <h4 class="l2-food-card__name">${esc(item.name)}</h4>
          <span class="l2-food-card__price">${item.price !== null ? esc(formatPrice(item.price, currency)) : ""}</span>
        </div>
        ${item.description ? `<p class="l2-food-card__desc">${esc(item.description)}</p>` : ""}
        <div class="l2-food-card__foot" aria-hidden="true">
          <span class="l2-food-card__add"><span>Shto</span>${icon("plus", { size: 15 })}</span>
        </div>
      </div>
    </article>
  `;
}

// Welche Karte gezeichnet wird, entscheidet der Artikel selbst (cardStyle) -
// genau wie in der App. Wer seine Speisen als Getraenkekachel pflegt, sieht
// hier dieselbe Kachel wie im echten Menue.
export function previewMenu(profile = {}, menuItems = [], focusItems = []) {
  const currency = profile.currency || "EUR";
  const content = menuItems.filter((item) => item.cardStyle !== "testfirst_focus");
  const shown = content.length ? content : menuItems;
  const drinks = shown.filter((item) => item.section === "drink").slice(0, 2);
  const foods = shown.filter((item) => item.section !== "drink").slice(0, 2);

  if (!shown.length && !focusItems.length) {
    return `<div class="l2-empty">Menuja vendoset një herë - dhe është e gjallë në çdo tavolinë.</div>`;
  }

  const focusRow = focusItems.length
    ? `<div class="l2-menu-part">
        <p class="l2-menu-part__label">Sot në fokus</p>
        <div class="l2-focus-row">${focusItems.slice(0, 3).map((item) => `
          <article class="l2-focus">
            <div class="l2-focus__media">
              ${img(item.imageUrl, item.title)}
              <span class="l2-focus__badge" aria-hidden="true">${icon("sparkles", { size: 11 })}<span>Tipp</span></span>
            </div>
            <div class="l2-focus__text">
              <h4 class="l2-focus__title">${esc(item.title)}</h4>
              ${item.body ? `<p class="l2-focus__body">${esc(item.body)}</p>` : ""}
            </div>
          </article>
        `).join("")}</div>
      </div>`
    : "";

  const grid = (list) => {
    const tiles = list.filter((item) => item.cardStyle !== "testfirst_food");
    const stacked = list.filter((item) => item.cardStyle === "testfirst_food");
    return [
      tiles.length ? `<div class="l2-menu-grid">${tiles.map((item) => drinkCard(item, currency)).join("")}</div>` : "",
      stacked.length ? `<div class="l2-food-list">${stacked.map((item) => foodCard(item, currency)).join("")}</div>` : ""
    ].filter(Boolean).join("");
  };

  return `
    ${focusRow}
    ${drinks.length ? `<div class="l2-menu-part"><p class="l2-menu-part__label">Pije</p>${grid(drinks)}</div>` : ""}
    ${foods.length ? `<div class="l2-menu-part"><p class="l2-menu-part__label">Ushqim</p>${grid(foods)}</div>` : ""}
  `;
}

/* ------------------------------------------------------- Produkt-Detail */

// Was der Gast sieht, wenn er ein Produkt antippt. Genau die Zeilen, nach
// denen im Lokal sonst gefragt wird: was ist drin, was kostet es, was muss
// jemand mit einer Allergie wissen.
export function previewProduct(profile = {}, menuItems = []) {
  const currency = profile.currency || "EUR";
  const item = menuItems.find((entry) => entry.imageUrl && entry.description)
    || menuItems.find((entry) => entry.imageUrl)
    || menuItems[0];
  if (!item) {
    return `<div class="l2-empty">Çdo produkt merr foton, çmimin, përshkrimin dhe alergjenët e vet.</div>`;
  }
  const rows = [
    item.ingredients ? { label: "Përbërësit", value: item.ingredients } : null,
    item.allergens ? { label: "Alergjenët", value: item.allergens } : null,
    item.category ? { label: "Kategoria", value: item.category } : null
  ].filter(Boolean);

  return `
    <article class="l2-detail">
      <div class="l2-detail__media">${img(item.imageUrl, item.name)}</div>
      <div class="l2-detail__body">
        <div class="l2-detail__head">
          <h4 class="l2-detail__name">${esc(item.name)}</h4>
          <span class="l2-detail__price">${item.price !== null ? esc(formatPrice(item.price, currency)) : ""}</span>
        </div>
        ${item.description ? `<p class="l2-detail__desc">${esc(item.description)}</p>` : ""}
        ${rows.length ? `<dl class="l2-detail__rows">${rows.map((row) => `
          <div class="l2-detail__row">
            <dt>${esc(row.label)}</dt>
            <dd>${esc(row.value)}</dd>
          </div>
        `).join("")}</dl>` : `<p class="l2-detail__note">Përbërësit dhe alergjenët shtohen nga ju - dhe janë menjëherë te klienti.</p>`}
      </div>
    </article>
  `;
}

/* -------------------------------------------------------------- Qyteti */

// Der lokale Feed. Oben die Story-Reihe, darunter der eigene Beitrag
// zwischen denen der anderen - so sieht der Wirt, wo seine Inhalte landen.
export function previewQyteti(profile = {}, posts = [], focusItems = [], neighbours = []) {
  const post = posts[0] || null;
  const offer = focusItems[0] || null;
  const stories = [
    { name: profile.name, logoUrl: profile.logoUrl, own: true },
    ...neighbours.slice(0, 4).map((entry) => ({ name: entry.name, logoUrl: entry.logoUrl, own: false }))
  ];

  return `
    <div class="l2-feed">
      <div class="l2-stories" aria-hidden="true">
        ${stories.map((entry) => `
          <span class="l2-story${entry.own ? " is-own" : ""}">
            <span class="l2-story__ring">${logo(entry.logoUrl, entry.name)}</span>
            <span class="l2-story__name">${esc(text(entry.name).split(/\s+/)[0] || "")}</span>
          </span>
        `).join("")}
      </div>

      <article class="l2-feedcard is-own">
        <header class="l2-feedcard__head">
          <span class="l2-feedcard__avatar">${logo(profile.logoUrl, profile.name)}</span>
          <span class="l2-feedcard__who">
            <strong>${esc(profile.name)}</strong>
            <span>${esc(text(profile.city))}</span>
          </span>
          <span class="l2-badge l2-badge--accent">Ju</span>
        </header>
        ${post ? `<div class="l2-feedcard__media">${img(post.imageUrl, text(post.caption) || "Postim")}</div>` : ""}
        ${offer && !post ? `<div class="l2-feedcard__media">${img(offer.imageUrl, offer.title)}</div>` : ""}
        <div class="l2-feedcard__foot" aria-hidden="true">
          <span>${filledIcon("heart", { size: 16, color: "#f43f5e" })} ${esc(formatCount(post?.likeCount || 0))}</span>
          <span>${icon("message", { size: 16 })} ${esc(formatCount(post?.commentCount || 0))}</span>
        </div>
        ${post?.caption || offer?.title
          ? `<p class="l2-feedcard__caption">${esc(text(post?.caption) || text(offer?.title))}</p>`
          : ""}
      </article>

      ${neighbours[0] ? `
        <article class="l2-feedcard is-muted" aria-hidden="true">
          <header class="l2-feedcard__head">
            <span class="l2-feedcard__avatar">${logo(neighbours[0].logoUrl, neighbours[0].name)}</span>
            <span class="l2-feedcard__who">
              <strong>${esc(neighbours[0].name)}</strong>
              <span>${esc(text(neighbours[0].city))}</span>
            </span>
          </header>
          <div class="l2-feedcard__media">${img(neighbours[0].coverUrl, "")}</div>
        </article>
      ` : ""}
    </div>
  `;
}

/* --------------------------------------------------------------- Harta */

// Die Karte.
//
// Bewusst gezeichnet statt geladen: Eine echte Kartenkachel braucht Leaflet,
// einen fremden Kachelserver und die Standortfreigabe des Betrachters. Fuer
// den einen Satz, um den es hier geht - "Klienten sehen, was in ihrer Naehe
// ist" -, waere das viel Technik fuer wenig Aussage, und die Seite wuerde an
// dieser Stelle sekundenlang leer stehen.
//
// Die Stecknadel in der Mitte traegt das echte Logo. Sie ist das Einzige, was
// hier eine Aussage macht.
export function previewHarta(profile = {}, neighbours = []) {
  const pins = neighbours.slice(0, 4);
  const spots = [
    { x: 22, y: 26 },
    { x: 76, y: 22 },
    { x: 18, y: 72 },
    { x: 80, y: 70 }
  ];
  const address = firstText((profile.locations || [])[0]?.address, profile.address, profile.city);

  return `
    <div class="l2-map">
      <svg class="l2-map__grid" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 34 H100 M0 66 H100 M30 0 V100 M68 0 V100" />
        <path class="l2-map__road" d="M0 50 C 24 44, 40 62, 64 52 S 92 40, 100 46" />
      </svg>
      ${pins.map((entry, index) => `
        <span class="l2-map__pin" style="left:${spots[index].x}%;top:${spots[index].y}%;" aria-hidden="true">
          <span class="l2-map__dot">${logo(entry.logoUrl, entry.name)}</span>
        </span>
      `).join("")}
      <span class="l2-map__pin l2-map__pin--self" style="left:50%;top:48%;">
        <span class="l2-map__dot l2-map__dot--self">${logo(profile.logoUrl, profile.name)}</span>
        <span class="l2-map__label">${esc(profile.name)}</span>
      </span>
      ${address ? `<div class="l2-map__sheet">
        <span class="l2-map__sheetlogo">${logo(profile.logoUrl, profile.name)}</span>
        <span class="l2-map__sheettext">
          <strong>${esc(profile.name)}</strong>
          <span>${esc(address)}</span>
        </span>
        <span class="l2-map__sheetgo" aria-hidden="true">${icon("map-pin", { size: 16 })}</span>
      </div>` : ""}
    </div>
  `;
}

/* ------------------------------------------------------------- Lokalet */

function localCard(entry = {}, { own = false } = {}) {
  const meta = [text(entry.city), text(entry.type).toUpperCase()].filter(Boolean).join(" · ");
  return `
    <article class="l2-local${own ? " is-own" : ""}">
      <div class="l2-local__cover">${img(entry.coverUrl, own ? `Ballina e ${entry.name}` : "")}</div>
      <div class="l2-local__body">
        <span class="l2-local__logo">${logo(entry.logoUrl, entry.name)}</span>
        <span class="l2-local__text">
          <strong class="l2-local__name">${esc(entry.name)}</strong>
          ${meta ? `<span class="l2-local__meta">${esc(meta)}</span>` : ""}
        </span>
        ${own ? `<span class="l2-badge l2-badge--accent">Ju</span>` : `<span class="l2-local__star" aria-hidden="true">${icon("star", { size: 14 })}</span>`}
      </div>
    </article>
  `;
}

export function previewLokalet(profile = {}, neighbours = []) {
  const self = {
    name: profile.name,
    city: profile.city,
    type: profile.type,
    logoUrl: profile.logoUrl,
    coverUrl: profile.coverUrl
  };
  const before = neighbours.slice(0, 1);
  const after = neighbours.slice(1, 3);
  return `
    <div class="l2-locals">
      ${before.map((entry) => localCard(entry)).join("")}
      ${localCard(self, { own: true })}
      ${after.map((entry) => localCard(entry)).join("")}
    </div>
  `;
}

/* ---------------------------------------------------------------- Kërko */

// Die Suche. Der Suchbegriff wird aus dem Lokal selbst genommen - aus dem
// Namen oder aus dem, was auf der Karte steht. Ein fest eingetragenes
// "Burger" waere bei einem Cafe die eine Zeile, die nicht stimmt.
export function resolveSearchTerm(profile = {}, menuItems = []) {
  const words = text(profile.name).split(/\s+/).filter((word) => word.length >= 4);
  const generic = /^(bar|cafe|kafe|restaurant|restorant|pizzeria|lokal|the|and|dhe)$/i;
  const fromName = words.find((word) => !generic.test(word));
  if (fromName) return fromName;
  const fromMenu = menuItems.map((item) => text(item.category)).find((value) => value.length >= 4);
  if (fromMenu) return fromMenu;
  return text(profile.name) || "Mnyra";
}

export function previewKerko(profile = {}, menuItems = [], neighbours = []) {
  const term = resolveSearchTerm(profile, menuItems);
  const other = neighbours.slice(0, 2);
  return `
    <div class="l2-search">
      <div class="l2-search__field" aria-hidden="true">
        ${icon("search", { size: 18 })}
        <span class="l2-search__term">${esc(term)}</span>
        <span class="l2-search__caret"></span>
      </div>
      <p class="l2-search__count">${esc(String(other.length + 1))} rezultate</p>
      <div class="l2-search__list">
        <article class="l2-result is-own">
          <span class="l2-result__logo">${logo(profile.logoUrl, profile.name)}</span>
          <span class="l2-result__text">
            <strong>${esc(profile.name)}</strong>
            <span>${esc([text(profile.city), text(profile.type).toUpperCase()].filter(Boolean).join(" · "))}</span>
          </span>
          <span class="l2-badge l2-badge--accent">Ju</span>
        </article>
        ${other.map((entry) => `
          <article class="l2-result" aria-hidden="true">
            <span class="l2-result__logo">${logo(entry.logoUrl, entry.name)}</span>
            <span class="l2-result__text">
              <strong>${esc(entry.name)}</strong>
              <span>${esc(text(entry.city))}</span>
            </span>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------- QR/Tavolina */

// Der QR am Tisch. Das Muster ist gezeichnet und fuehrt bewusst nirgendwohin:
// Ein echter Code auf einer Verkaufsseite waere ein Code, den jemand
// abfotografiert - und der dann auf eine Vorschau statt auf das Lokal zeigt.
function qrPattern() {
  const cells = [];
  // Ein festes Muster, kein zufaelliges: Es soll bei jedem Aufruf gleich
  // aussehen, sonst flackert die Flaeche bei jedem Wechsel.
  const bits = [
    "111011010101", "100010111001", "101010001110", "101101010011",
    "100011101100", "111010010101", "000001101010", "110110011101",
    "011001010010", "101011101101", "010100010011", "110111011010"
  ];
  bits.forEach((row, y) => {
    row.split("").forEach((bit, x) => {
      if (bit === "1") cells.push(`<rect x="${x * 8 + 2}" y="${y * 8 + 2}" width="7" height="7" rx="1.4" />`);
    });
  });
  return `<svg class="l2-qr__code" viewBox="0 0 100 100" aria-hidden="true">${cells.join("")}</svg>`;
}

export function previewQr(profile = {}) {
  return `
    <div class="l2-qr">
      <div class="l2-qr__card">
        <span class="l2-qr__brand">MNYRA</span>
        ${qrPattern()}
        <span class="l2-qr__name">${esc(profile.name)}</span>
        <span class="l2-qr__table">Tavolina 4</span>
      </div>
      <p class="l2-qr__note">Skanon - dhe menuja jote hapet.</p>
    </div>
  `;
}

/* --------------------------------------------------------------- Porosia */

export function previewOrder(profile = {}, menuItems = []) {
  const currency = profile.currency || "EUR";
  const picks = menuItems.filter((item) => item.price !== null).slice(0, 2);
  const lines = picks.length ? picks : menuItems.slice(0, 2);
  const total = lines.reduce((sum, item) => sum + (num(item.price) || 0), 0);

  return `
    <div class="l2-order">
      <div class="l2-order__cart">
        <p class="l2-order__label">Porosia · Tavolina 4</p>
        ${lines.length ? lines.map((item) => `
          <div class="l2-order__line">
            <span class="l2-order__qty" aria-hidden="true">1</span>
            <span class="l2-order__name">${esc(item.name)}</span>
            <span class="l2-order__price">${item.price !== null ? esc(formatPrice(item.price, currency)) : ""}</span>
          </div>
        `).join("") : `<div class="l2-order__line"><span class="l2-order__name">Produktet e tua</span></div>`}
        <div class="l2-order__total">
          <span>Totali</span>
          <strong>${esc(formatPrice(total, currency))}</strong>
        </div>
        <span class="l2-order__send" aria-hidden="true">Dërgo porosinë</span>
      </div>
      <div class="l2-order__arrow" aria-hidden="true">${icon("arrow-down", { size: 20 })}</div>
      <div class="l2-order__ticket">
        <span class="l2-order__ticketlogo">${logo(profile.logoUrl, profile.name)}</span>
        <span class="l2-order__tickettext">
          <strong>Porosi e re · Tavolina 4</strong>
          <span>${esc(lines.map((item) => item.name).filter(Boolean).join(", ") || "Produktet e tua")}</span>
        </span>
        <span class="l2-order__tickettime" aria-hidden="true">tani</span>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------- Mnyra GO */

export function previewGo(profile = {}, focusItems = [], menuItems = []) {
  const offer = focusItems[0] || null;
  const item = menuItems.find((entry) => entry.price !== null) || null;
  const title = firstText(offer?.title, item?.name, "Oferta jote");
  return `
    <div class="l2-go">
      <div class="l2-go__guest">
        <p class="l2-go__label">${icon("zap", { size: 14 })}<span>Klienti kërkon tani</span></p>
        <span class="l2-go__query" aria-hidden="true">2 persona · Kafe · afër meje</span>
      </div>
      <div class="l2-order__arrow" aria-hidden="true">${icon("arrow-down", { size: 20 })}</div>
      <article class="l2-go__offer">
        <span class="l2-go__offerlogo">${logo(profile.logoUrl, profile.name)}</span>
        <span class="l2-go__offertext">
          <strong>${esc(profile.name)}</strong>
          <span>${esc(title)}</span>
        </span>
        <span class="l2-go__accept" aria-hidden="true">Merr</span>
      </article>
      <div class="l2-order__arrow" aria-hidden="true">${icon("arrow-down", { size: 20 })}</div>
      <div class="l2-go__done">
        <span class="l2-go__doneicon" aria-hidden="true">${icon("check", { size: 16 })}</span>
        <span>Klienti erdhi. Ju e konfirmoni.</span>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------- Mnyra SAVE */

export function previewSave(profile = {}, menuItems = []) {
  const item = menuItems.find((entry) => entry.imageUrl && entry.price !== null) || menuItems[0] || null;
  const currency = profile.currency || "EUR";
  const price = item && item.price !== null ? num(item.price) : null;
  return `
    <div class="l2-save">
      <span class="l2-badge l2-badge--soon">Po vjen</span>
      <article class="l2-save__card">
        <div class="l2-save__media">${img(item?.imageUrl, item ? item.name : "")}</div>
        <div class="l2-save__body">
          <strong class="l2-save__name">${esc(item?.name || "Ushqimi që ka mbetur")}</strong>
          <span class="l2-save__who">${esc(profile.name)}</span>
          <span class="l2-save__prices">
            ${price !== null ? `<s>${esc(formatPrice(price, currency))}</s>` : ""}
            ${price !== null ? `<b>${esc(formatPrice(Math.round(price * 50) / 100, currency))}</b>` : `<b>-50%</b>`}
          </span>
        </div>
      </article>
      <p class="l2-save__note">Njerëzit pranë teje e shohin - dhe e blejnë para se ta hedhësh.</p>
    </div>
  `;
}

/* -------------------------------------------------------------- Biznesi */

export function previewBiznesi(profile = {}, posts = [], menuItems = []) {
  const rows = [
    { iconName: "image", label: "Profili", value: "Ballina, logo, info" },
    { iconName: "layout-grid", label: "Postimet", value: `${formatCount(posts.length)} postime` },
    { iconName: "utensils", label: "Menuja", value: `${formatCount(menuItems.length)} produkte` },
    { iconName: "receipt", label: "Porositë", value: "Opsionale" },
    { iconName: "zap", label: "Mnyra GO", value: "Opsionale" },
    { iconName: "bar-chart", label: "Statistikat", value: "Shikime, klikime" }
  ];
  return `
    <div class="l2-biz">
      <div class="l2-biz__head">
        <span class="l2-biz__logo">${logo(profile.logoUrl, profile.name)}</span>
        <span class="l2-biz__who">
          <strong>${esc(profile.name)}</strong>
          <span>Biznesi</span>
        </span>
        <span class="l2-biz__gear" aria-hidden="true">${icon("sliders", { size: 16 })}</span>
      </div>
      <div class="l2-biz__rows">
        ${rows.map((row) => `
          <div class="l2-biz__row">
            <span class="l2-biz__rowicon" aria-hidden="true">${icon(row.iconName, { size: 16 })}</span>
            <span class="l2-biz__rowlabel">${esc(row.label)}</span>
            <span class="l2-biz__rowvalue">${esc(row.value)}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------- Vision */

// Viele Lokale, eine Oberflaeche. Die Kacheln tragen echte Lokale aus Mnyra -
// mit erfundenen Namen waere genau das die Stelle, an der die Seite luegt.
export function previewVision(profile = {}, neighbours = []) {
  const tiles = [
    { name: profile.name, logoUrl: profile.logoUrl, own: true },
    ...neighbours.slice(0, 5)
  ];
  return `
    <div class="l2-vision">
      ${tiles.map((entry) => `
        <span class="l2-vision__tile${entry.own ? " is-own" : ""}">
          <span class="l2-vision__logo">${logo(entry.logoUrl, entry.name)}</span>
          <span class="l2-vision__name">${esc(entry.name)}</span>
          <span class="l2-vision__qr" aria-hidden="true">${icon("qr-code", { size: 14 })}</span>
        </span>
      `).join("")}
    </div>
  `;
}
