import {
  HEART_NAV_ITEMS
} from "./heart-state.js";
import {
  escapeHtml,
  formatRelative,
  renderStatusBadge
} from "./heart-ui-utils.js";
import {
  renderDashboardView
} from "./heart-dashboard-render.js";
import {
  renderRunsView
} from "./heart-runs-render.js";
import {
  renderIncidentsView
} from "./heart-incidents-render.js";
import {
  renderModulesView
} from "./heart-modules-render.js";
import {
  renderSettingsView
} from "./heart-settings-render.js";

function renderLoadingGate(message = "Loading CEO session...") {
  return `
    <div class="heart-auth-shell">
      <section class="heart-auth-card heart-auth-card--loading">
        <p class="heart-eyebrow">mnyra heart</p>
        <h1>Internal control center</h1>
        <p>${escapeHtml(message)}</p>
        <div class="heart-spinner"></div>
      </section>
    </div>
  `;
}

function renderGuestScreen(auth = {}) {
  return `
    <div class="heart-auth-shell">
      <section class="heart-auth-card">
        <p class="heart-eyebrow">mnyra heart</p>
        <h1>CEO command center</h1>
        <p>Secure MENYRA control app for smoke tests, synthetic bot runs, incidents, monitoring and system health.</p>
        <form class="heart-login-form" data-heart-login>
          <label class="heart-input-field">
            <span>Email</span>
            <input type="email" name="email" autocomplete="username" placeholder="ceo@menyra.com" required />
          </label>
          <label class="heart-input-field">
            <span>Password</span>
            <input type="password" name="password" autocomplete="current-password" placeholder="Enter password" required />
          </label>
          ${auth.error ? `<div class="heart-error-block">${escapeHtml(auth.error)}</div>` : ""}
          <button class="heart-button heart-button--primary heart-button--wide" type="submit" ${auth.status === "signing-in" ? "disabled" : ""}>${auth.status === "signing-in" ? "Signing in..." : "Sign in as CEO"}</button>
        </form>
      </section>
    </div>
  `;
}

function renderDeniedScreen(auth = {}) {
  return `
    <div class="heart-auth-shell">
      <section class="heart-auth-card heart-auth-card--denied">
        <p class="heart-eyebrow">mnyra heart</p>
        <h1>Access denied</h1>
        <p>${escapeHtml(auth.access?.reason || "CEO access required.")}</p>
        <div class="heart-detail-grid">
          <div><span>User</span><strong>${escapeHtml(auth.user?.email || auth.profile?.email || "-")}</strong></div>
          <div><span>UID</span><strong>${escapeHtml(auth.user?.uid || "-")}</strong></div>
        </div>
        <div class="heart-header-actions">
          <button class="heart-button heart-button--secondary" data-action="logout">Sign out</button>
        </div>
      </section>
    </div>
  `;
}

function renderViewBody(state) {
  if (state.shell.activeView === "runs") return renderRunsView(state.runs, state.connections.items || []);
  if (state.shell.activeView === "incidents") {
    if (state.incidents.status === "loading") return `<section class="heart-section"><div class="heart-loading-block">Loading incidents...</div></section>`;
    if (state.incidents.status === "error") return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(state.incidents.error || "Incident loading failed.")}</div></section>`;
    return renderIncidentsView(state.incidents.items, state.incidents.filters);
  }
  if (state.shell.activeView === "modules") {
    if (state.dashboard.status === "loading") return `<section class="heart-section"><div class="heart-loading-block">Loading module health...</div></section>`;
    if (state.dashboard.status === "error") return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(state.dashboard.error || "Module health loading failed.")}</div></section>`;
    return renderModulesView(state.dashboard.data?.moduleHealth || []);
  }
  if (state.shell.activeView === "connections") {
    if (state.connections.status === "loading") return `<section class="heart-section"><div class="heart-loading-block">Loading connections...</div></section>`;
    if (state.connections.status === "error") return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(state.connections.error || "Connection loading failed.")}</div></section>`;
    return renderSettingsView(state.connections.items || []);
  }
  if (state.dashboard.status === "loading") return `<section class="heart-section"><div class="heart-loading-block">Loading dashboard...</div></section>`;
  if (state.dashboard.status === "error") return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(state.dashboard.error || "Dashboard loading failed.")}</div></section>`;
  return renderDashboardView(state.dashboard.data);
}

function renderNav(state) {
  return HEART_NAV_ITEMS.map((item) => `
    <button class="heart-nav-link ${state.shell.activeView === item.key ? "heart-nav-link--active" : ""}" data-nav-key="${escapeHtml(item.key)}">
      <span>${escapeHtml(item.label)}</span>
    </button>
  `).join("");
}

function renderShell(state) {
  const userName = state.auth.profile?.name || state.auth.user?.email || "CEO";
  const overallStatus = state.dashboard.data?.overallStatus || "idle";
  return `
    <div class="heart-shell ${state.shell.navOpen ? "heart-shell--nav-open" : ""}">
      <aside class="heart-sidebar">
        <div class="heart-brand-block">
          <p class="heart-eyebrow">mnyra heart</p>
          <h1>System control</h1>
          <p>CEO-only monitoring, test orchestration and incident control.</p>
        </div>
        <nav class="heart-nav">${renderNav(state)}</nav>
        <div class="heart-sidebar__footer">
          <strong>${escapeHtml(userName)}</strong>
          <p>${escapeHtml(state.auth.user?.email || "")}</p>
        </div>
      </aside>
      <div class="heart-shell__overlay" data-action="toggle-nav"></div>
      <div class="heart-main-shell">
        <header class="heart-topbar">
          <div class="heart-topbar__left">
            <button class="heart-menu-toggle" data-action="toggle-nav" aria-label="Toggle navigation">Menu</button>
            <div>
              <p class="heart-eyebrow">Control center</p>
              <h2>${escapeHtml(HEART_NAV_ITEMS.find((item) => item.key === state.shell.activeView)?.label || "Overview")}</h2>
            </div>
          </div>
          <div class="heart-topbar__right">
            ${renderStatusBadge(overallStatus)}
            <span class="heart-topbar__timestamp">${escapeHtml(state.boot.lastUpdatedAt ? `Updated ${formatRelative(state.boot.lastUpdatedAt)}` : "Waiting for first sync")}</span>
            <button class="heart-button heart-button--secondary" data-action="refresh-heart">Refresh</button>
            <button class="heart-button heart-button--secondary" data-action="logout">Logout</button>
          </div>
        </header>
        <main class="heart-main-content">
          ${renderViewBody(state)}
        </main>
        <nav class="heart-mobile-nav">
          ${renderNav(state)}
        </nav>
      </div>
      ${state.shell.toast ? `
        <div class="heart-toast heart-toast--${escapeHtml(state.shell.toast.tone || "neutral")}">
          <strong>${escapeHtml(state.shell.toast.title || "Notice")}</strong>
          <p>${escapeHtml(state.shell.toast.message || "")}</p>
        </div>
      ` : ""}
    </div>
  `;
}

export function renderHeartApp(rootNode, state) {
  if (!rootNode) return;
  let markup = "";
  if (state.auth.status === "checking" || (state.auth.status === "signing-in" && !state.auth.user)) {
    markup = renderLoadingGate(state.auth.status === "signing-in" ? "Signing in..." : "Loading CEO session...");
  } else if (state.auth.status === "guest" || state.auth.status === "error" || state.auth.status === "signing-in") {
    markup = renderGuestScreen(state.auth);
  } else if (state.auth.status === "denied") {
    markup = renderDeniedScreen(state.auth);
  } else if (state.auth.status === "authenticated" && state.auth.access?.allowed) {
    markup = renderShell(state);
  } else {
    markup = renderLoadingGate();
  }
  rootNode.innerHTML = markup;
}
