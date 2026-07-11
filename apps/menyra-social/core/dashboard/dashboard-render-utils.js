// Mnyra Business-Dashboard Rendering (Tab "dashboard").
// Reines String-Rendering + eigenes scoped CSS, damit das Dashboard
// unabhaengig vom generierten Tailwind-Build stabil aussieht.
// Alle Kacheln haben feste Hoehen: Skeleton -> Inhalt erzeugt keinen
// Layout-Shift, Werte-Updates aendern die Geometrie nicht.

import { formatCompactNumber } from "../analytics/analytics-dashboard-core.js";

const STYLE_ELEMENT_ID = "mnyraDashboardStyles";

export const DASHBOARD_CSS = `
.mnyra-dash {
  /* Horizontale Flucht exakt wie der Smart-Header (px-5 bzw. px-4 tight):
     Menue-Button links und Warenkorb-/Action-Button rechts. */
  padding: 16px 20px 112px;
  --dash-surface: #ffffff;
  --dash-plane: #f8fafc;
  --dash-ink: #0f172a;
  --dash-ink-2: #475569;
  --dash-muted: #94a3b8;
  --dash-border: rgba(15, 23, 42, 0.08);
  --dash-accent: #4f46e5;
  --dash-accent-soft: #eef2ff;
  color: var(--dash-ink);
  font-family: inherit;
}
@media (max-width: 360px) {
  .mnyra-dash { padding-left: 16px; padding-right: 16px; }
}
.mnyra-dash * { box-sizing: border-box; }
.mnyra-dash__greet {
  display: flex;
  align-items: stretch;
  gap: 14px;
  min-height: 56px;
  margin: 4px 0 16px;
}
.mnyra-dash__greet-logo {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: var(--dash-plane);
  overflow: hidden;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
}
.mnyra-dash__greet-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mnyra-dash__greet-text {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px 0;
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
  border: 1px solid var(--dash-border);
  border-radius: 20px;
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
  border: 1px solid var(--dash-border);
  border-radius: 20px;
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
  border: 1px solid var(--dash-border);
  border-radius: 20px;
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
  border: 1px solid var(--dash-border);
  border-radius: 20px;
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
.mnyra-dash__skeleton {
  border-radius: 20px;
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
    { nav: "upload", uploadIntent: "chooser", iconName: "plus", label: "Neuer Beitrag", sub: "Foto oder Video posten" },
    { nav: "upload", uploadIntent: "story", iconName: "camera", label: "Story", sub: "24h sichtbar" }
  ];
  if (kind === "hotel") {
    actions.push({ nav: "menu", iconName: "bed-double", label: "Hotel & Zimmer", sub: "Details, Zimmer, Angebote" });
  } else if (kind === "shop") {
    actions.push({ nav: "menu", iconName: "shopping-bag", label: "Shop bearbeiten", sub: "Produkte & Lager" });
  } else {
    actions.push({ nav: "menu", iconName: "utensils", label: "Menü bearbeiten", sub: "Produkte & Kategorien" });
  }
  actions.push({ nav: "menu", iconName: "megaphone", label: "Angebote & Werbung", sub: "Im Editor verwalten" });
  if (kind !== "hotel" && canAccessOrders) {
    actions.push({ nav: "orders", iconName: "shopping-cart", label: "Bestellungen", sub: "Eingang & Status" });
  }
  actions.push({ nav: "analytics", iconName: "bar-chart-3", label: "Analytics", sub: "Alle Statistiken" });
  if (isOwner) {
    actions.push({ nav: "businessAccounts", iconName: "users-round", label: "Team & Staff", sub: "Zugänge verwalten" });
  }
  actions.push({ nav: "settings", iconName: "settings", label: "Einstellungen", sub: "Profil & Kontakt" });
  return actions;
}

// KPI-Definitionen pro Dashboard-Art (Keys aus summarizeAnalyticsDays().summary).
export function buildDashboardKpiDefsCore(kind = "restaurant") {
  const common = [
    { key: "profileViews", label: "Profilaufrufe" },
    { key: "postImpressions", label: "Beitrags-Reichweite" },
    { key: "contactClicks", label: "Kontakt-Klicks" }
  ];
  if (kind === "shop") {
    return common.concat([
      { key: "ordersCompleted", label: "Bestellungen" },
      { key: "revenue", label: "Umsatz", unit: "€" },
      { key: "productViews", label: "Produkt-Aufrufe" }
    ]);
  }
  if (kind === "hotel") {
    return common.concat([
      { key: "uniqueVisitors", label: "Besucher" },
      { key: "postLikes", label: "Likes" },
      { key: "feedImpressions", label: "Feed-Reichweite" }
    ]);
  }
  return common.concat([
    { key: "ordersCompleted", label: "Bestellungen" },
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
          : safeIcon(iconFn, "store", "w-6 h-6")}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title">Përshëndetje, ${escapeHtml(name || "Business")}</p>
        <p class="mnyra-dash__greet-sub">${escapeHtml(greeting.text)}</p>
      </div>
    </div>
  `;
}

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
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Alle Analytics</button>
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
        <p class="mnyra-dash__state-title">Noch keine Beiträge</p>
        <p class="mnyra-dash__state-body">Poste dein erstes Foto oder Video, damit Gäste dich im Feed entdecken.</p>
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
        metaParts.push(`${formatCompactNumber(post.impressions)} Reichweite (7 T.)`);
      }
      return `
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${post.thumbUrl
              ? `<img src="${escapeHtml(post.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`
              : safeIcon(iconFn, post.mediaType === "video" ? "play" : "image", "w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${escapeHtml(post.caption || "Ohne Text")}</p>
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
  return `<div class="mnyra-dash__skeleton" style="min-height:56px; border-radius:18px; margin: 4px 0 16px;"></div>`;
}

export function renderDashboardErrorState({ message = "" } = {}) {
  return `
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Daten konnten nicht geladen werden</p>
        <p class="mnyra-dash__state-body">${escapeHtml(message || "Bitte prüfe deine Verbindung und versuche es erneut.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Erneut versuchen</button>
      </div>
    </div>
  `;
}

export function renderDashboardNoBusinessState() {
  return `
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Kein Business-Profil verbunden</p>
      <p class="mnyra-dash__state-body">Das Dashboard ist nur für Business-Konten verfügbar. Sobald dein Konto mit einem Restaurant, Hotel oder Shop verbunden ist, findest du hier alle Funktionen an einer Stelle.</p>
    </div>
  `;
}
