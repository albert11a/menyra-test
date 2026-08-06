// Mnyra Business-Dashboard Rendering (Tab "dashboard").
// Reines String-Rendering + eigenes scoped CSS, damit das Dashboard
// unabhaengig vom generierten Tailwind-Build stabil aussieht.
// Alle Kacheln haben feste Hoehen: Skeleton -> Inhalt erzeugt keinen
// Layout-Shift, Werte-Updates aendern die Geometrie nicht.

import { formatCompactNumber } from "../analytics/analytics-dashboard-core.js";

const STYLE_ELEMENT_ID = "mnyraDashboardStyles";

export const DASHBOARD_CSS = `
.mnyra-dash {
  /* Horizontale Flucht auf die SICHTBAREN Header-Icons (nicht die
     unsichtbaren Touch-Kreise): Menue-Striche beginnen bei 28px,
     Warenkorb-Symbol endet bei 30px vom rechten Rand - 28px beidseitig
     trifft beide optisch (rechts 2px Toleranz, im Browser vermessen). */
  padding: 16px 28px 112px;
  --dash-surface: #ffffff;
  --dash-plane: #f8fafc;
  --dash-ink: #0f172a;
  --dash-ink-2: #475569;
  --dash-muted: #94a3b8;
  --dash-border: rgba(15, 23, 42, 0.08);
  /* Genau die Linie, die auch die Profil-Karten tragen (border-slate-100). */
  --dash-hairline: #f1f5f9;
  --dash-accent: #4f46e5;
  --dash-accent-soft: #eef2ff;
  /* Eine Rundung fuer alle Karten des Panels - gemessen an der Vorlage
     (25px). Kein Schatten, und als Rand dieselbe Haarlinie wie im Profil. */
  --dash-card-radius: 25px;
  color: var(--dash-ink);
  font-family: inherit;
}
.mnyra-dash * { box-sizing: border-box; }
.mnyra-dash__greet {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  margin: 4px 0 16px;
}
/* Gleicher Rahmen wie das Profil-Avatar (Indigo->Lila-Ring, weisser
   Innenrand, abgerundete Quadratform), auf 44px verkleinert, damit das
   Bild zur Hoehe des zweizeiligen Textblocks passt. Ohne Schatten: mit
   Schatten stand das Bild vor der Seite statt darin. */
.mnyra-dash__greet-logo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  padding: 2px;
  background: linear-gradient(to bottom right, #6366f1, #a855f7);
  flex: 0 0 auto;
}
.mnyra-dash__greet-logo img,
.mnyra-dash__greet-logo-fallback {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 2px solid #ffffff;
  background: #ffffff;
  object-fit: cover;
  display: block;
}
.mnyra-dash__greet-logo-fallback {
  background: var(--dash-plane);
  color: var(--dash-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mnyra-dash__greet-text {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.mnyra-dash__greet-title {
  font-size: 18px;
  font-weight: 900;
  line-height: 1.1;
  margin: 0;
  color: var(--dash-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Dieselbe Farbe wie der Name des Lokals daneben. */
.mnyra-dash__greet-hello { color: var(--dash-ink); }
.mnyra-dash__greet-sub {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  color: var(--dash-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* "Posto n'Zbulo": eigene Karte, mit deutlichem Abstand zur Begruessung
   darueber. Ueberschrift, Untertitel, darunter zwei Knoepfe nebeneinander -
   der linke ausgefuellt, der rechte ruhig. */
.mnyra-dash__composer {
  margin-top: 34px;
  background: var(--dash-surface);
  /* Haarlinie wie im Profil - ausdruecklich gesetzt, weil die Kacheln
     <button> sind und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 18px;
}
/* Die ganze Karte ist der Knopf. Sie sieht aus wie vorher - nur nimmt jetzt
   jede Stelle den Tipp an, nicht nur ein Streifen darin. */
.mnyra-dash__composer--tap {
  display: block;
  width: 100%;
  text-align: left;
  font: inherit;
  color: var(--dash-ink);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}
.mnyra-dash__composer--tap:active { transform: scale(0.99); }
/* Schrift der Ueberschrift bleibt unveraendert. Als Kind eines <button> steht
   sie in einem <span> - der braucht die Blockform ausdruecklich. */
.mnyra-dash__composer-title {
  display: block;
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: var(--dash-ink);
}
.mnyra-dash__composer-accent { color: var(--dash-accent); }
/* Schrift des Untertitels bleibt unveraendert. */
.mnyra-dash__composer-sub {
  display: block;
  margin: 5px 0 0;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--dash-muted);
}
/* Die Aktionszeile der grossen Karte: eine Haarlinie trennt sie vom Text,
   darunter das Plus im Kreis, die Beschriftung und rechtsbuendig der Pfeil.
   Kein zweiter Knopf - die Karte selbst nimmt den Tipp an. */
.mnyra-dash__composer-cta {
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid var(--dash-hairline);
  display: flex;
  align-items: center;
  gap: 10px;
}
.mnyra-dash__composer-cta-icon {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--dash-border);
  background: var(--dash-surface);
  color: var(--dash-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Die Karte kommt ohne den Tailwind-Build aus: Symbolgroessen stehen hier. */
.mnyra-dash__composer-cta-icon svg,
.mnyra-dash__composer-cta-icon i {
  width: 15px;
  height: 15px;
  display: block;
}
.mnyra-dash__composer-cta-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.2;
  color: var(--dash-accent);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-dash__composer-cta-chevron {
  margin-left: auto;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  color: var(--dash-muted);
}
.mnyra-dash__composer-cta-chevron svg,
.mnyra-dash__composer-cta-chevron i {
  width: 16px;
  height: 16px;
  display: block;
}
.mnyra-dash__section { margin-top: 14px; }
.mnyra-dash__section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 10px;
}
.mnyra-dash__section-title {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dash-ink-2);
  margin: 0;
}
.mnyra-dash__section-link {
  border: none;
  background: none;
  padding: 0;
  font-size: 11px;
  font-weight: 800;
  color: var(--dash-accent);
  cursor: pointer;
}
.mnyra-dash__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
@media (min-width: 720px) { .mnyra-dash__actions { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.mnyra-dash__action {
  background: var(--dash-surface);
  /* Haarlinie wie im Profil - ausdruecklich gesetzt, weil die Kacheln
     <button> sind und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 12px;
  min-height: 92px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  text-align: left;
  min-width: 0;
}
.mnyra-dash__action:active { transform: scale(0.98); }
.mnyra-dash__action-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--dash-accent-soft);
  color: var(--dash-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.mnyra-dash__action-label {
  font-size: 12px;
  font-weight: 900;
  color: var(--dash-ink);
  margin: 0;
  line-height: 1.25;
}
.mnyra-dash__action-sub {
  font-size: 10px;
  font-weight: 700;
  color: var(--dash-muted);
  margin: 2px 0 0;
  line-height: 1.3;
}
.mnyra-dash__kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
@media (min-width: 720px) { .mnyra-dash__kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.mnyra-dash__kpi {
  background: var(--dash-surface);
  /* Haarlinie wie im Profil - ausdruecklich gesetzt, weil die Kacheln
     <button> sind und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 12px 14px;
  min-height: 86px;
  min-width: 0;
}
.mnyra-dash__kpi-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dash-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-dash__kpi-value {
  font-size: 22px;
  font-weight: 700;
  margin: 6px 0 2px;
  color: var(--dash-ink);
  font-variant-numeric: tabular-nums;
}
.mnyra-dash__kpi-today {
  font-size: 11px;
  font-weight: 700;
  color: var(--dash-ink-2);
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.mnyra-dash__posts {
  background: var(--dash-surface);
  /* Haarlinie wie im Profil - ausdruecklich gesetzt, weil die Kacheln
     <button> sind und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 6px;
}
.mnyra-dash__post {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  min-height: 64px;
  border-bottom: 1px solid var(--dash-plane);
}
.mnyra-dash__post:last-child { border-bottom: none; }
.mnyra-dash__post-thumb {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--dash-plane);
  overflow: hidden;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
}
.mnyra-dash__post-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mnyra-dash__post-main { min-width: 0; flex: 1; }
.mnyra-dash__post-caption {
  font-size: 12px;
  font-weight: 700;
  color: var(--dash-ink);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-dash__post-meta {
  font-size: 10px;
  font-weight: 700;
  color: var(--dash-muted);
  margin: 4px 0 0;
  font-variant-numeric: tabular-nums;
}
.mnyra-dash__state {
  background: var(--dash-surface);
  /* Haarlinie wie im Profil - ausdruecklich gesetzt, weil die Kacheln
     <button> sind und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 28px 18px;
  text-align: center;
}
.mnyra-dash__state-title { font-size: 14px; font-weight: 800; color: var(--dash-ink); margin: 0 0 6px; }
.mnyra-dash__state-body { font-size: 12px; color: var(--dash-ink-2); margin: 0; line-height: 1.6; }
.mnyra-dash__retry {
  margin-top: 14px;
  border: none;
  background: var(--dash-ink);
  color: var(--dash-surface);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
}
/* Der Platzhalter beim Laden steht dort, wo gleich eine Karte steht - gleiche
   Rundung, damit beim Erscheinen nichts springt. */
.mnyra-dash__skeleton {
  border-radius: var(--dash-card-radius);
  background: var(--dash-plane);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
  border: 1px solid transparent;
}
@keyframes mnyraDashPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
`;

export function ensureDashboardStylesInjected(documentObj = typeof document === "undefined" ? null : document) {
  if (!documentObj || documentObj.getElementById(STYLE_ELEMENT_ID)) return;
  try {
    const style = documentObj.createElement("style");
    style.id = STYLE_ELEMENT_ID;
    style.textContent = DASHBOARD_CSS;
    documentObj.head?.appendChild(style);
  } catch {}
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeIcon(iconFn, name, className = "") {
  if (typeof iconFn !== "function") return "";
  try {
    return iconFn(name, className) || "";
  } catch {
    return "";
  }
}

const BUSINESS_TYPE_LABELS = Object.freeze({
  restaurant: "Restaurant",
  cafe: "Café",
  fastfood: "Fast Food",
  hotel: "Hotel",
  motel: "Motel",
  hostel: "Hostel",
  resort: "Resort",
  ecommerce: "Online-Shop",
  tankstelle: "Tankstelle",
  lebensmittel: "Lebensmittel",
  apotheken: "Apotheke",
  services: "Service"
});

export function resolveBusinessTypeLabelCore(type = "") {
  const key = String(type || "").trim().toLowerCase();
  if (!key) return "Business";
  if (BUSINESS_TYPE_LABELS[key]) return BUSINESS_TYPE_LABELS[key];
  return key.charAt(0).toUpperCase() + key.slice(1);
}

const HOTEL_TYPE_KEYS = Object.freeze(["hotel", "motel", "hostel", "resort", "accommodation", "travel"]);

// Ordnet ein Business einer Dashboard-Art zu; steuert Kacheln + KPIs.
export function resolveDashboardKindCore({ businessType = "", isShopCatalog = false } = {}) {
  if (isShopCatalog) return "shop";
  const type = String(businessType || "").trim().toLowerCase();
  if (HOTEL_TYPE_KEYS.includes(type)) return "hotel";
  return "restaurant";
}

// Schnellaktionen pro Dashboard-Art. Navigation laeuft komplett ueber die
// bestehenden data-nav-Handler der Shell - hier entsteht keine neue Routing-Logik.
export function buildDashboardQuickActionsCore({ kind = "restaurant", isOwner = false, canAccessOrders = false } = {}) {
  const actions = [
    { nav: "upload", uploadIntent: "chooser", iconName: "plus", label: "Neuer Beitrag", sub: "Posto foto ose video" },
    { nav: "upload", uploadIntent: "story", iconName: "camera", label: "Story", sub: "E dukshme 24h" }
  ];
  if (kind === "hotel") {
    actions.push({ nav: "menu", iconName: "bed-double", label: "Hotel & Dhoma", sub: "Detaje, dhoma, oferta" });
  } else if (kind === "shop") {
    actions.push({ nav: "menu", iconName: "shopping-bag", label: "Ndrysho dyqanin", sub: "Produkte & Stok" });
  } else {
    actions.push({ nav: "menu", iconName: "utensils", label: "Ndrysho menune", sub: "Produkte & Kategorien" });
  }
  actions.push({ nav: "menu", iconName: "megaphone", label: "Oferta & Reklama", sub: "Im Editor verwalten" });
  if (kind !== "hotel" && canAccessOrders) {
    actions.push({ nav: "orders", iconName: "shopping-cart", label: "Porosite", sub: "Hyrje & Status" });
  }
  actions.push({ nav: "analytics", iconName: "bar-chart-3", label: "Analytics", sub: "Te gjitha statistikat" });
  if (isOwner) {
    actions.push({ nav: "businessAccounts", iconName: "users-round", label: "Team & Staff", sub: "Zugänge verwalten" });
  }
  actions.push({ nav: "settings", iconName: "settings", label: "Cilesimet", sub: "Profili & Kontakti" });
  return actions;
}

// KPI-Definitionen pro Dashboard-Art (Keys aus summarizeAnalyticsDays().summary).
export function buildDashboardKpiDefsCore(kind = "restaurant") {
  const common = [
    { key: "profileViews", label: "Profilaufrufe" },
    { key: "postImpressions", label: "Shtrirja e postimeve" },
    { key: "contactClicks", label: "Kontakt-Klicks" }
  ];
  if (kind === "shop") {
    return common.concat([
      { key: "ordersCompleted", label: "Porosite" },
      { key: "revenue", label: "Umsatz", unit: "€" },
      { key: "productViews", label: "Produkt-Aufrufe" }
    ]);
  }
  if (kind === "hotel") {
    return common.concat([
      { key: "uniqueVisitors", label: "Vizitore" },
      { key: "postLikes", label: "Likes" },
      { key: "feedImpressions", label: "Shtrirja ne feed" }
    ]);
  }
  return common.concat([
    { key: "ordersCompleted", label: "Porosite" },
    { key: "revenue", label: "Umsatz", unit: "€" },
    { key: "qrScans", label: "QR-Scans" }
  ]);
}

function formatKpiValue(value = 0, unit = "") {
  const label = formatCompactNumber(value);
  return unit ? `${label} ${unit}` : label;
}

// Tageszeit-Gruss auf Albanisch (Stundenbereiche lokal zum Geraet):
// 05-10 mengjes, 11-17 dite, 18-21 mbremje, sonst nate.
export function resolveDashboardGreetingCore(hour = new Date().getHours()) {
  const safeHour = Number.isFinite(Number(hour)) ? ((Math.trunc(Number(hour)) % 24) + 24) % 24 : 12;
  if (safeHour >= 5 && safeHour <= 10) {
    return { dayPart: "mengjes", text: "Ju urojmë një mëngjes të mbarë!" };
  }
  if (safeHour >= 11 && safeHour <= 17) {
    return { dayPart: "dite", text: "Ju urojmë një ditë të mbarë!" };
  }
  if (safeHour >= 18 && safeHour <= 21) {
    return { dayPart: "mbremje", text: "Ju urojmë një mbrëmje të mbarë!" };
  }
  return { dayPart: "nate", text: "Ju urojmë një natë të mbarë!" };
}

// Begruessung ohne Card: Logo links, Titelzeile buendig mit der Logo-Oberkante,
// Tageszeit-Gruss buendig mit der Logo-Unterkante.
export function renderDashboardGreeting({ name = "", logoUrl = "", hour = new Date().getHours(), iconFn } = {}) {
  const greeting = resolveDashboardGreetingCore(hour);
  return `
    <div class="mnyra-dash__greet">
      <div class="mnyra-dash__greet-logo">
        ${logoUrl
          ? `<img src="${escapeHtml(logoUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`
          : `<span class="mnyra-dash__greet-logo-fallback">${safeIcon(iconFn, "store", "w-6 h-6")}</span>`}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title"><span class="mnyra-dash__greet-hello">Përshëndetje,</span> ${escapeHtml(name || "Business")}</p>
        <p class="mnyra-dash__greet-sub">${escapeHtml(greeting.text)}</p>
      </div>
    </div>
  `;
}

// Posting-Karte unter der Begruessung. Ein Knopf reicht: zwischen Postim und
// Story schaltet man im Modal selbst um, an der Leiste unten.
// Die ganze Karte ist der Knopf: egal wo man sie antippt, das Modal geht auf.
// Deshalb steht hier ein <button> und darin nur noch Textbausteine - ein
// zweiter Knopf in einem Knopf waere weder gueltig noch bedienbar.
// Der Titel ist umgedreht: "Posto" traegt die Farbe, "n'Mnyra" steht ruhig
// daneben.
export function renderDashboardComposerCard({ iconFn } = {}) {
  return `
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${safeIcon(iconFn, "plus", "w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${safeIcon(iconFn, "chevron-right", "w-4 h-4")}</span>
      </span>
    </button>
  `;
}

// Die beiden halben Karten "Posto n'Profil" und "Posto n'Meny" standen frueher
// hier unter der Composer-Karte. Beide Wege gibt es weiter, nur ohne eigene
// Karte im Panel: das Profil ist die dritte Seite in der Leiste des Composers,
// die Menue-Pflege steht als "Ndrysho menune" im Schnellzugriff.

export function renderDashboardQuickActions({ actions = [], iconFn } = {}) {
  const tiles = (Array.isArray(actions) ? actions : []).map((action) => {
    const intentAttr = action.uploadIntent ? ` data-upload-intent="${escapeHtml(action.uploadIntent)}"` : "";
    return `
      <button type="button" class="mnyra-dash__action" data-nav="${escapeHtml(action.nav)}"${intentAttr}>
        <span class="mnyra-dash__action-icon">${safeIcon(iconFn, action.iconName, "w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${escapeHtml(action.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${escapeHtml(action.sub || "")}</span>
        </span>
      </button>
    `;
  }).join("");
  return `
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Schnellzugriff</p>
      </div>
      <div class="mnyra-dash__actions">${tiles}</div>
    </div>
  `;
}

export function renderDashboardKpis({ kpiDefs = [], week = {}, today = {} } = {}) {
  const tiles = (Array.isArray(kpiDefs) ? kpiDefs : []).map((def) => `
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${escapeHtml(def.label)}</p>
      <p class="mnyra-dash__kpi-value">${escapeHtml(formatKpiValue(week?.[def.key] || 0, def.unit || ""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${escapeHtml(formatKpiValue(today?.[def.key] || 0, def.unit || ""))}</p>
    </div>
  `).join("");
  return `
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${tiles}</div>
    </div>
  `;
}

export function renderDashboardRecentPosts({ posts = [], iconFn } = {}) {
  const list = Array.isArray(posts) ? posts : [];
  let body = "";
  if (!list.length) {
    body = `
      <div class="mnyra-dash__state" style="border:none;">
        <p class="mnyra-dash__state-title">Ende nuk ka postime</p>
        <p class="mnyra-dash__state-body">Posto foton ose videon tende te pare qe vizitoret te te zbulojne ne feed.</p>
        <button type="button" class="mnyra-dash__retry" data-nav="upload" data-upload-intent="chooser">Neuer Beitrag</button>
      </div>
    `;
  } else {
    body = list.map((post) => {
      const metaParts = [
        post.dateLabel,
        `${formatCompactNumber(post.likesCount || 0)} Likes`,
        `${formatCompactNumber(post.commentsCount || 0)} Kommentare`
      ];
      if (Number(post.impressions || 0) > 0) {
        metaParts.push(`${formatCompactNumber(post.impressions)} shtrirje (7 dite)`);
      }
      return `
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${post.thumbUrl
              ? `<img src="${escapeHtml(post.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`
              : safeIcon(iconFn, post.mediaType === "video" ? "play" : "image", "w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${escapeHtml(post.caption || "Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${escapeHtml(metaParts.filter(Boolean).join(" · "))}</p>
          </div>
        </div>
      `;
    }).join("");
    body = `<div class="mnyra-dash__posts">${body}</div>`;
  }
  return `
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="profile">Profil öffnen</button>
      </div>
      ${body}
    </div>
  `;
}

// Skeleton spiegelt exakt die Geometrie der Daten-Sektionen (KPIs + Posts),
// damit der Wechsel Skeleton -> Inhalt keinen Layout-Shift erzeugt.
export function renderDashboardDataSkeleton({ kpiCount = 6 } = {}) {
  const kpiTiles = Array.from({ length: Math.max(1, kpiCount) })
    .map(() => `<div class="mnyra-dash__skeleton" style="min-height:86px;"></div>`)
    .join("");
  return `
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
      </div>
      <div class="mnyra-dash__kpis">${kpiTiles}</div>
    </div>
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `;
}

export function renderDashboardGreetingSkeleton() {
  return `<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>`;
}

export function renderDashboardErrorState({ message = "" } = {}) {
  return `
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${escapeHtml(message || "Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `;
}

export function renderDashboardNoBusinessState() {
  return `
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `;
}
