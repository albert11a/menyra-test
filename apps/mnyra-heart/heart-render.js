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

function renderLoadingGate(message = "CEO-Sitzung wird geladen...") {
  return `
    <div class="heart-auth-shell">
      <section class="heart-auth-card heart-auth-card--loading">
        <p class="heart-eyebrow">MENYRA Heart</p>
        <h1>Kontrollzentrum</h1>
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
        <p class="heart-eyebrow">MENYRA Heart</p>
        <h1>Tests klar starten</h1>
        <p>Heart ist dein deutsches Kontrollzentrum fuer MENYRA. Hier startest du Tests, siehst Nachweise und erkennst sofort, was noch eingerichtet werden muss.</p>
        <form class="heart-login-form" data-heart-login>
          <label class="heart-input-field">
            <span>Email</span>
            <input type="email" name="email" autocomplete="username" placeholder="ceo@menyra.com" required />
          </label>
          <label class="heart-input-field">
            <span>Passwort</span>
            <input type="password" name="password" autocomplete="current-password" placeholder="Passwort eingeben" required />
          </label>
          ${auth.error ? `<div class="heart-error-block">${escapeHtml(auth.error)}</div>` : ""}
          <button class="heart-button heart-button--primary heart-button--wide" type="submit" ${auth.status === "signing-in" ? "disabled" : ""}>${auth.status === "signing-in" ? "Anmeldung laeuft..." : "Als CEO anmelden"}</button>
        </form>
      </section>
    </div>
  `;
}

function renderDeniedScreen(auth = {}) {
  return `
    <div class="heart-auth-shell">
      <section class="heart-auth-card heart-auth-card--denied">
        <p class="heart-eyebrow">MENYRA Heart</p>
        <h1>Kein Zugriff</h1>
        <p>${escapeHtml(auth.access?.reason || "Hier ist ein CEO-Zugang noetig.")}</p>
        <div class="heart-detail-grid">
          <div><span>User</span><strong>${escapeHtml(auth.user?.email || auth.profile?.email || "-")}</strong></div>
          <div><span>UID</span><strong>${escapeHtml(auth.user?.uid || "-")}</strong></div>
        </div>
        <div class="heart-header-actions">
          <button class="heart-button heart-button--secondary" data-action="logout">Abmelden</button>
        </div>
      </section>
    </div>
  `;
}

function renderViewBody(state) {
  if (state.shell.activeView === "runs") return renderRunsView(state.runs, state.connections.items || [], state.dashboard.data?.quickActions || []);
  if (state.shell.activeView === "incidents") {
    if (state.incidents.status === "loading") return `<section class="heart-section"><div class="heart-loading-block">Meldungen werden geladen...</div></section>`;
    if (state.incidents.status === "error") return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(state.incidents.error || "Meldungen konnten nicht geladen werden.")}</div></section>`;
    return renderIncidentsView(state.incidents.items, state.incidents.filters);
  }
  if (state.shell.activeView === "modules") {
    if (state.dashboard.status === "loading") return `<section class="heart-section"><div class="heart-loading-block">Bereiche werden geladen...</div></section>`;
    if (state.dashboard.status === "error") return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(state.dashboard.error || "Bereiche konnten nicht geladen werden.")}</div></section>`;
    return renderModulesView(state.dashboard.data?.moduleHealth || []);
  }
  if (state.shell.activeView === "connections") {
    if (state.connections.status === "loading") return `<section class="heart-section"><div class="heart-loading-block">Setup wird geladen...</div></section>`;
    if (state.connections.status === "error") return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(state.connections.error || "Setup konnte nicht geladen werden.")}</div></section>`;
    return renderSettingsView(state.connections.items || []);
  }
  if (state.dashboard.status === "loading") return `<section class="heart-section"><div class="heart-loading-block">Startansicht wird geladen...</div></section>`;
  if (state.dashboard.status === "error") return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(state.dashboard.error || "Startansicht konnte nicht geladen werden.")}</div></section>`;
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
          <p class="heart-eyebrow">MENYRA Heart</p>
          <h1>System im Blick</h1>
          <p>Tests starten, Beweise sehen, Probleme verstehen.</p>
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
            <button class="heart-menu-toggle" data-action="toggle-nav" aria-label="Navigation umschalten">Menue</button>
            <div>
              <p class="heart-eyebrow">Kontrollzentrum</p>
              <h2>${escapeHtml(HEART_NAV_ITEMS.find((item) => item.key === state.shell.activeView)?.label || "Start")}</h2>
            </div>
          </div>
          <div class="heart-topbar__right">
            ${renderStatusBadge(overallStatus)}
            <span class="heart-topbar__timestamp">${escapeHtml(state.boot.lastUpdatedAt ? `Aktualisiert ${formatRelative(state.boot.lastUpdatedAt)}` : "Warte auf erste Synchronisation")}</span>
            <button class="heart-button heart-button--secondary" data-action="refresh-heart">Aktualisieren</button>
            <button class="heart-button heart-button--secondary" data-action="logout">Abmelden</button>
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
          <strong>${escapeHtml(state.shell.toast.title || "Hinweis")}</strong>
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
    markup = renderLoadingGate(state.auth.status === "signing-in" ? "Anmeldung laeuft..." : "CEO-Sitzung wird geladen...");
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
