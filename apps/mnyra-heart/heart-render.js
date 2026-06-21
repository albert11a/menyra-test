import {
  HEART_NAV_ITEMS
} from "./heart-state.js";
import {
  renderHeartIcon
} from "./heart-icons.js";
import {
  escapeHtml,
  formatRelative,
  renderStatusBadge
} from "./heart-ui-utils.js";
import {
  renderDashboardView
} from "./heart-dashboard-render.js";
import {
  getRunsHeaderState,
  renderRunsModal,
  renderRunsView
} from "./heart-runs-render.js";
import {
  renderIncidentsView
} from "./heart-incidents-render.js";
import {
  renderAdsView
} from "./heart-ads-render.js";
import {
  renderModulesView
} from "./heart-modules-render.js";
import {
  renderHeartCrmAdminModal,
  renderHeartCrmAdminReadView
} from "./heart-crm-admin-read-view.js";
import {
  renderSettingsView
} from "./heart-settings-render.js";

const NAV_HINTS = Object.freeze({
  dashboard: "Status, Schnellstarts und Uebersicht",
  runs: "Verlauf, Beweise und Berichte",
  incidents: "Warnungen und Stoerungen",
  ads: "Restaurant Ads freigeben",
  modules: "Bereiche und Gesundheitsstatus",
  crmLeads: "CRM Leads",
  crmCustomers: "CRM Kunden",
  crmStaff: "CRM Staff",
  connections: "Einrichtung, Konten und Links"
});

const CRM_VIEW_DOMAIN_BY_ACTIVE_VIEW = Object.freeze({
  crmLeads: "leads",
  crmCustomers: "customers",
  crmStaff: "staff"
});

const HEADER_QUICK_ACTIONS = Object.freeze([
  { kind: "nav", key: "runs", label: "Laeufe", icon: "list" },
  { kind: "nav", key: "connections", label: "Einrichtung", icon: "settings" },
  { kind: "action", action: "start-pack", packKey: "smoke", label: "Test", icon: "play", primary: true }
]);

function getNavIcon(key = "") {
  const icons = {
    dashboard: "home",
    runs: "list",
    incidents: "bell",
    ads: "image",
    modules: "grid",
    crmLeads: "list",
    crmCustomers: "user",
    crmStaff: "users",
    connections: "settings"
  };
  return icons[String(key || "").trim()] || "home";
}

function renderLoginMark() {
  return `
    <div class="heart-login-mark">
      <span class="heart-login-mark__word">Mnyra</span>
      <span class="heart-login-mark__sub">heart login</span>
    </div>
  `;
}

function renderHeaderBrand(extraClass = "", eyebrow = "heart") {
  return `
    <div class="heart-brand-lockup ${escapeHtml(extraClass)}">
      <span class="heart-brand-lockup__eyebrow">${escapeHtml(eyebrow || "heart")}</span>
      <span class="heart-brand-lockup__wordmark">mnyra</span>
    </div>
  `;
}

function getProfilePhotoUrl(state) {
  const candidates = [
    state?.auth?.user?.photoURL,
    state?.auth?.profile?.photoURL,
    state?.auth?.profile?.avatar,
    state?.auth?.profile?.avatarUrl,
    state?.auth?.profile?.image,
    state?.auth?.profile?.imageUrl,
    state?.auth?.profile?.profileImage,
    state?.auth?.profile?.profileImageUrl
  ];
  return candidates.find((value) => String(value || "").trim()) || "";
}

function getProfileInitials(name = "", email = "") {
  const source = String(name || "").trim() || String(email || "").trim();
  if (!source) return "M";
  const parts = source
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "M";
}

function renderDrawerProfile(state, userName) {
  const email = String(state.auth.user?.email || "").trim();
  const photoUrl = getProfilePhotoUrl(state);
  const initials = getProfileInitials(userName, email);
  return `
    <div class="heart-sidebar__footer">
      <div class="heart-sidebar__profile">
        <div class="heart-sidebar__avatar" aria-hidden="true">
          ${photoUrl
            ? `<img src="${escapeHtml(photoUrl)}" alt="" loading="lazy" />`
            : `<span>${escapeHtml(initials)}</span>`}
        </div>
        <div class="heart-sidebar__identity">
          <strong>${escapeHtml(userName)}</strong>
          <p>${escapeHtml(email)}</p>
        </div>
      </div>
      <button class="heart-drawer-action heart-drawer-action--logout" data-action="logout">
        <span class="heart-drawer-action__icon">${renderHeartIcon("logout")}</span>
        <span>Abmelden</span>
      </button>
    </div>
  `;
}

function renderLoadingGate(message = "Session wird geladen") {
  return `
    <div class="heart-loader-view">
      <div class="heart-loader-view__inner">
        <div class="heart-loader-spinner" aria-hidden="true"></div>
        <p class="heart-loader-label">${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}

function renderGuestScreen(auth = {}) {
  return `
    <div class="heart-auth-shell">
      <section class="heart-auth-card heart-auth-card--login">
        <div class="heart-login-heading">
          <h1 class="heart-login-heading__word">Mnyra</h1>
          <p class="heart-login-heading__sub">Heart Login</p>
        </div>
        <form class="heart-login-form" data-heart-login>
          <label class="heart-input-field">
            <span>Email</span>
            <input type="email" name="email" autocomplete="username" placeholder="ceo@menyra.com" required />
          </label>
          <label class="heart-input-field">
            <span>Passwort</span>
            <input type="password" name="password" autocomplete="current-password" placeholder="Passwort" required />
          </label>
          ${auth.error ? `<div class="heart-login-error">${escapeHtml(auth.error)}</div>` : ""}
          <button class="heart-button heart-button--primary heart-button--wide" type="submit" ${auth.status === "signing-in" ? "disabled" : ""}>${auth.status === "signing-in" ? "Einloggen..." : "Einloggen"}</button>
        </form>
      </section>
    </div>
  `;
}

function renderDeniedScreen(auth = {}) {
  return `
    <div class="heart-auth-shell">
      <section class="heart-auth-card heart-auth-card--denied">
        ${renderLoginMark()}
        <p class="heart-auth-help">${escapeHtml(auth.access?.reason || "Hier ist ein CEO-Zugang noetig.")}</p>
        <div class="heart-detail-grid heart-detail-grid--auth">
          <div><span>Email</span><strong>${escapeHtml(auth.user?.email || auth.profile?.email || "-")}</strong></div>
          <div><span>UID</span><strong>${escapeHtml(auth.user?.uid || "-")}</strong></div>
        </div>
        <button class="heart-button heart-button--secondary heart-button--wide" data-action="logout">Abmelden</button>
      </section>
    </div>
  `;
}

function renderViewBody(state, runtime = {}) {
  if (state.shell.activeView === "runs") return renderRunsView(state.runs, state.connections.items || [], state.dashboard.data?.quickActions || []);
  if (state.shell.activeView === "incidents") {
    if (state.incidents.status === "loading") return `<section class="heart-section"><div class="heart-loading-block">Meldungen werden geladen...</div></section>`;
    if (state.incidents.status === "error") return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(state.incidents.error || "Meldungen konnten nicht geladen werden.")}</div></section>`;
    return renderIncidentsView(state.incidents.items, state.incidents.filters);
  }
  if (state.shell.activeView === "ads") {
    return renderAdsView(state.ads || {});
  }
  if (state.shell.activeView === "modules") {
    if (state.dashboard.status === "loading") return `<section class="heart-section"><div class="heart-loading-block">Bereiche werden geladen...</div></section>`;
    if (state.dashboard.status === "error") return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(state.dashboard.error || "Bereiche konnten nicht geladen werden.")}</div></section>`;
    return renderModulesView(state.dashboard.data?.moduleHealth || []);
  }
  const crmReadDomain = CRM_VIEW_DOMAIN_BY_ACTIVE_VIEW[state.shell.activeView];
  if (crmReadDomain) {
    return renderHeartCrmAdminReadView({
      consumerDeps: runtime.crmAdminConsumerDeps || {},
      crmAdmin: {
        ...(state.crmAdmin || {}),
        currentUid: state.auth.user?.uid || "",
        userProfile: state.auth.profile || null
      },
      activeDomain: crmReadDomain,
      modal: state.shell.modal || {}
    });
  }
  if (state.shell.activeView === "connections") {
    if (state.connections.status === "loading" && state.setup.status === "loading" && !state.setup.data) {
      return `<section class="heart-section"><div class="heart-loading-block">Einrichtung wird geladen...</div></section>`;
    }
    return renderSettingsView({
      connections: state.connections.items || [],
      setup: {
        ...(state.setup || {}),
        connectionsError: state.connections.error || ""
      }
    });
  }
  if (state.dashboard.status === "loading") return `<section class="heart-section"><div class="heart-loading-block">Startansicht wird geladen...</div></section>`;
  if (state.dashboard.status === "error") return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(state.dashboard.error || "Startansicht konnte nicht geladen werden.")}</div></section>`;
  return renderDashboardView(state.dashboard.data);
}

function getPageHeaderState(state) {
  if (state.shell.activeView === "crmLeads") {
    return {
      eyebrow: "",
      title: "Leads",
      status: "",
      timestamp: ""
    };
  }
  if (state.shell.activeView === "runs") {
    const runsHeader = getRunsHeaderState(state.runs);
    return {
      eyebrow: "",
      title: runsHeader.title,
      status: runsHeader.status,
      timestamp: state.runs.lastRefreshAt
    };
  }
  return {
    eyebrow: "Aktiver Bereich",
    title: HEART_NAV_ITEMS.find((item) => item.key === state.shell.activeView)?.label || "Start",
    status: state.dashboard.data?.overallStatus || "idle",
    timestamp: state.boot.lastUpdatedAt
  };
}

function renderDrawerNav(state) {
  return HEART_NAV_ITEMS.map((item) => {
    const isActive = state.shell.activeView === item.key;
    return `
      <button class="heart-nav-link ${isActive ? "heart-nav-link--active" : ""}" data-nav-key="${escapeHtml(item.key)}">
        <span class="heart-nav-link__icon">${renderHeartIcon(getNavIcon(item.key))}</span>
        <span class="heart-nav-link__body">
          <span class="heart-nav-link__label">${escapeHtml(item.label)}</span>
          <span class="heart-nav-link__hint">${escapeHtml(NAV_HINTS[item.key] || "")}</span>
        </span>
      </button>
    `;
  }).join("");
}

function renderHeaderQuickActions(state) {
  const isOpen = !!state.shell.quickActionsOpen;
  return `
    <div class="heart-header-quick ${isOpen ? "heart-header-quick--open" : ""}" aria-label="Schnellaktionen">
      ${HEADER_QUICK_ACTIONS.map((item) => {
        const isNav = item.kind === "nav";
        const isActive = isNav && state.shell.activeView === item.key;
        const extraClass = item.primary ? "heart-header-quick__item--primary" : "";
        const attrs = isNav
          ? `data-nav-key="${escapeHtml(item.key)}"`
          : `data-action="${escapeHtml(item.action)}"${item.packKey ? ` data-pack-key="${escapeHtml(item.packKey)}"` : ""}`;
        const label = escapeHtml(item.label);
        return `
          <button class="heart-header-quick__item ${isActive ? "heart-header-quick__item--active" : ""} ${extraClass}" ${attrs} aria-label="${label}" title="${label}" ${isOpen ? "" : 'tabindex="-1"'}>
            <span class="heart-header-quick__icon">${renderHeartIcon(item.icon)}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderDrawer(state, userName) {
  return `
    <aside class="heart-sidebar">
      <div class="heart-sidebar__header">
        ${renderHeaderBrand("heart-brand-lockup--drawer")}
        <button class="heart-icon-button" data-action="toggle-nav" aria-label="Menue schliessen">${renderHeartIcon("x")}</button>
      </div>
      <div class="heart-sidebar__content">
        <section class="heart-sidebar__panel">
          <p class="heart-sidebar__label">Navigation</p>
          <nav class="heart-nav">${renderDrawerNav(state)}</nav>
        </section>
        <section class="heart-sidebar__panel">
          <p class="heart-sidebar__label">Schnellaktionen</p>
          <div class="heart-sidebar__actions">
            <button class="heart-drawer-action" data-action="refresh-heart">
              <span class="heart-drawer-action__icon">${renderHeartIcon("refresh")}</span>
              <span>Jetzt aktualisieren</span>
            </button>
            <button class="heart-drawer-action heart-drawer-action--primary" data-action="start-pack" data-pack-key="smoke">
              <span class="heart-drawer-action__icon">${renderHeartIcon("play")}</span>
              <span>CEO-Kontrolllauf starten</span>
            </button>
            </div>
          </section>
          ${renderDrawerProfile(state, userName)}
        </div>
      </aside>
    `;
}

function renderShell(state, runtime = {}) {
  const userName = state.auth.profile?.name || state.auth.user?.email || "CEO";
  const pageHeader = getPageHeaderState(state);
  const isLeadsView = state.shell.activeView === "crmLeads";
  const timestamp = pageHeader.timestamp
    ? `Aktualisiert ${formatRelative(pageHeader.timestamp)}`
    : "Warte auf erste Synchronisation";
  const shellClasses = [
    "heart-shell",
    state.shell.navOpen ? "heart-shell--nav-open" : "",
    state.shell.quickActionsOpen ? "heart-shell--quick-open" : "",
    state.shell.standalone ? "heart-shell--standalone" : ""
  ].filter(Boolean).join(" ");
  const quickActionsOpen = !!state.shell.quickActionsOpen;

  return `
    <div class="${shellClasses}">
      ${renderDrawer(state, userName)}
      <div class="heart-shell__overlay" data-action="toggle-nav"></div>
      <div class="heart-main-shell">
        <header class="heart-topbar ${quickActionsOpen ? "heart-topbar--quick-open" : ""}">
          <div class="heart-topbar__left">
            <div class="heart-topbar__menu-slot">
              <button class="heart-icon-button heart-icon-button--menu" data-action="toggle-nav" aria-label="Menue oeffnen">${renderHeartIcon("menu")}</button>
            </div>
            ${renderHeaderBrand("", isLeadsView ? "leads" : "heart")}
          </div>
          <div class="heart-topbar__right">
            ${isLeadsView ? `
              <button id="leadSettingsBtn" class="heart-icon-button" data-action="open-crm-editor" data-crm-domain="leads" data-crm-mode="settings" aria-label="Lead Settings">${renderHeartIcon("settings")}</button>
              <button id="newLeadBtn" class="heart-icon-button heart-icon-button--lead-create" data-action="open-crm-editor" data-crm-domain="leads" data-crm-mode="create" aria-label="Lead erstellen">${renderHeartIcon("plus")}</button>
            ` : `
              ${renderHeaderQuickActions(state)}
              <button class="heart-icon-button" data-action="refresh-heart" aria-label="Aktualisieren">${renderHeartIcon("refresh")}</button>
              <button class="heart-icon-button heart-icon-button--quick-toggle ${quickActionsOpen ? "heart-icon-button--quick-toggle-open" : ""}" data-action="toggle-quick-actions" aria-label="${quickActionsOpen ? "Schnellaktionen schliessen" : "Schnellaktionen oeffnen"}" aria-expanded="${quickActionsOpen ? "true" : "false"}">${renderHeartIcon("plus")}</button>
            `}
          </div>
        </header>
        <main class="heart-main-content">
          ${isLeadsView ? "" : `<section class="heart-page-header">
            <div>
              ${pageHeader.eyebrow ? `<p class="heart-page-header__eyebrow">${escapeHtml(pageHeader.eyebrow)}</p>` : ""}
              <h1 class="heart-page-header__title">${escapeHtml(pageHeader.title)}</h1>
            </div>
            <div class="heart-page-header__meta heart-page-header__meta--stacked">
              ${renderStatusBadge(pageHeader.status)}
              <span class="heart-topbar__timestamp">${escapeHtml(timestamp)}</span>
            </div>
          </section>`}
          ${renderViewBody(state, runtime)}
        </main>
      </div>
      ${state.shell.activeView === "runs" ? renderRunsModal(state.runs, state.shell.modal) : ""}
      ${renderHeartCrmAdminModal({
        crmAdmin: {
          ...(state.crmAdmin || {}),
          currentUid: state.auth.user?.uid || "",
          userProfile: state.auth.profile || null
        },
        modal: state.shell.modal || {}
      })}
      ${state.shell.toast ? `
        <div class="heart-toast heart-toast--${escapeHtml(state.shell.toast.tone || "neutral")}">
          <strong>${escapeHtml(state.shell.toast.title || "Hinweis")}</strong>
          <p>${escapeHtml(state.shell.toast.message || "")}</p>
        </div>
      ` : ""}
    </div>
  `;
}

export function renderHeartApp(rootNode, state, runtime = {}) {
  if (!rootNode) return;
  let markup = "";
  if (state.auth.status === "checking" || (state.auth.status === "signing-in" && !state.auth.user)) {
    markup = renderLoadingGate(state.auth.status === "signing-in" ? "Login..." : "Session wird geladen");
  } else if (state.auth.status === "guest" || state.auth.status === "error" || state.auth.status === "signing-in") {
    markup = renderGuestScreen(state.auth);
  } else if (state.auth.status === "denied") {
    markup = renderDeniedScreen(state.auth);
  } else if (state.auth.status === "authenticated" && state.auth.access?.allowed) {
    markup = renderShell(state, runtime);
  } else {
    markup = renderLoadingGate();
  }
  rootNode.innerHTML = markup;
}
