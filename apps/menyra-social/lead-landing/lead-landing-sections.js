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

const LOGO_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23f1f5f9'/%3E%3Ccircle cx='48' cy='48' r='30' fill='%2394a3b8'/%3E%3C/svg%3E";
const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='180'%3E%3Crect width='240' height='180' fill='%23f1f5f9'/%3E%3C/svg%3E";


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
// steps: [{ focus, view, title, body }]
//   focus "" laesst alles scharf, view schaltet die Szene um.
function stage({ title, scene, steps = [], track = "" }) {
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
            <div class="ll-stage__step${index === 0 ? " is-active" : ""}" data-focus="${esc(step.focus || "")}" data-view="${esc(step.view || "")}">
              ${step.title ? `<p class="ll-stage__step-title">${esc(step.title)}</p>` : ""}
              <p class="ll-stage__step-body">${stepBody(step.body)}</p>
            </div>
          `).join("")}
        </div>

        <div class="ll-stage__viewport">
          <div class="ll-stage__scene">${scene}</div>
        </div>
      </div>

      ${allSteps.map((_, index) => `
        <div class="ll-stage__anchor" aria-hidden="true"${track ? ` data-track="${esc(track)}-${index}"` : ""} style="top: calc(${index} * var(--ll-vh));"></div>
      `).join("")}
    </section>
  `;
}

/* ---------------------------------------------------------------- Hero */

// Der erste Bildschirm sagt drei Dinge und sonst nichts: wessen Seite das
// ist, was Mnyra ist, und dass es nichts kostet. Kein Preis, keine
// Funktionsliste, keine QR-Bestellung - alles davon kommt spaeter und in
// eigener Ruhe.
//
// Warum so leer: Der Wirt liest diesen Bildschirm im Stehen, zwischen zwei
// Gaesten. Was er hier nicht in zwei Sekunden erfasst, erfaesst er gar nicht.
// Vorher stand hier ein Absatz mit vier Versprechen auf einmal; drei davon
// waren an dieser Stelle noch gar nicht zu verstehen.
//
// Die drei Bloecke stehen ueber den Bildschirm verteilt (space-between), der
// Pfeil unten. Der Weissraum dazwischen ist der Inhalt, nicht der Rest.
export function renderHero(profile = {}) {
  const parts = splitBrandName(profile.name);
  const c1 = text(profile.businessNameColorPart1) || "#111827";
  const c2 = text(profile.businessNameColorPart2) || "#4f46e5";

  return `
    <header class="ll-section ll-hero" data-track="hyrje">
      <div class="ll-hero__glow" aria-hidden="true"></div>

      <div class="ll-hero__id">
        <span class="ll-hero__logo">${img(profile.logoUrl, `${profile.name} logo`, LOGO_FALLBACK, { eager: true })}</span>
        <p class="ll-hero__name">
          <span style="color:${esc(c1)}">${esc(parts.part1)}</span>${parts.part2 ? `<span style="color:${esc(c2)}">${esc(parts.part2)}</span>` : ""}
        </p>
      </div>

      <div class="ll-hero__welcome">
        <h1 class="ll-hero__title">Mirë se vini në <span class="ll-hero__brand">Mnyra</span></h1>
        <p class="ll-hero__sub">Rrjeti social për restorante, kafe dhe fast food.</p>
      </div>

      <div class="ll-hero__promise">
        <p class="ll-hero__promise-line">Lokali juaj online në qytetin tuaj.</p>
        <p class="ll-hero__promise-line ll-hero__promise-line--soft">Falas dhe gati për klientët.</p>
      </div>

      <div class="ll-scroll-hint" aria-hidden="true">
        ${icon("chevron-down", { size: 26 })}
      </div>
    </header>
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

// Der persoenliche Teil der Seite: vier Bildschirme, eine einzige Szene.
//
// Die Szene ist dieselbe, die der Gast in der App sieht - mit den echten
// Daten dieses Lokals. Der Wirt sieht darin nacheinander sein Profil, seine
// Postimet, seinen Fokus und seine Menue; die Ueberschrift darueber sagt bei
// jedem Schritt, was er gerade sieht.
//
// Es folgt kein Kapitelwechsel mehr aus dieser Szene heraus: Der Bildschirm
// mit der Frage ("Çka është Mnyra?") steht danach als eigener Abschnitt
// (renderChapterWhat in lead-landing-sales.js). Er markiert das Ende des
// persoenlichen Teils - und ein Kapitelwechsel, der noch im alten Kapitel
// steckt, markiert nichts.
export function renderSurface(profile = {}, posts = [], menuItems = [], focusItems = []) {
  // Die Kartela ist der zweite Bildschirm - ihr Bild und ihr Logo laden
  // sofort.
  const { scene } = buildSurfaceScene(profile, posts, menuItems, focusItems, { eager: true });

  return stage({
    track: "profil",
    title: "Profili juaj në Mnyra",
    scene,
    steps: [
      // Hier ist noch kein Tab gedrueckt - das passiert im naechsten Schritt
      // von selbst, so wie es der Klient in der App tut.
      { view: "profile-idle", focus: "", body: "Ja si e shohin klientët lokalin tuaj." },
      { view: "posts", focus: "", title: "Postimet", body: "Fotot dhe postimet tuaja, direkt në profil dhe në feed." },
      { view: "menu-focus", focus: "", title: "Sot në fokus", body: "Vendosni në fokus atë që dëshironi të shohin klientët sot." },
      { view: "menu-food", focus: "", title: "Menyja juaj", body: "Produktet, fotot, çmimet dhe përshkrimet — në një vend." }
    ]
  });
}

// Die Verkaufs-Bildschirme (lead-landing-sales.js) bauen ihre Karten mit
// denselben Bausteinen wie die Nachbildung hier - ein zweites Bild-Tag mit
// eigener Rueckfallgrafik waere schon beim ersten fehlenden Foto anders
// kaputt als dieses.
export { IMG_FALLBACK, LOGO_FALLBACK, img, sectionHead };
