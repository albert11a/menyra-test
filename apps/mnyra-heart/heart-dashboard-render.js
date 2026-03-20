import {
  escapeHtml,
  formatDateTime,
  formatDuration,
  formatRelative,
  getGithubRunnerNote,
  getPackLabel,
  isGithubRunnerConfigured,
  renderEmptyState,
  renderSeverityBadge,
  renderStatValue,
  renderStatusBadge
} from "./heart-ui-utils.js";
import {
  renderModuleHealthGrid
} from "./heart-modules-render.js";

const FALLBACK_PACK_ACTIONS = Object.freeze([
  { id: "smoke", packKey: "smoke", action: "start-pack", label: "Schnelltest starten" },
  { id: "full-platform-pack", packKey: "full-platform-pack", action: "start-pack", label: "Kompletttest starten" },
  { id: "guest-pack", packKey: "guest-pack", action: "start-pack", label: "Gast- / QR-Test starten" },
  { id: "mutation-pack", packKey: "mutation-pack", action: "start-pack", label: "Schreibtest starten" }
]);

const PRIMARY_PACKS = Object.freeze(["smoke", "full-platform-pack", "guest-pack", "mutation-pack"]);

function getPrimaryPackActions(quickActions = []) {
  const startActions = quickActions.filter((item) => item.action === "start-pack");
  const source = startActions.length ? startActions : FALLBACK_PACK_ACTIONS;
  const ordered = [];
  PRIMARY_PACKS.forEach((packKey) => {
    const match = source.find((item) => String(item.packKey || item.id) === packKey);
    if (match) ordered.push(match);
  });
  return ordered.length ? ordered : source.slice(0, 4);
}

function renderTopStatusCards(data = {}) {
  const smoke = data.smokeStatus;
  const synthetic = data.syntheticStatus;
  const persona = data.personaStatus;
  const monitoring = data.liveMonitoringSummary || {};
  return `
    <section class="heart-hero-grid">
      <article class="heart-kpi-card heart-kpi-card--${escapeHtml(data.overallStatus || "idle")}">
        <div class="heart-kpi-card__head">
          <div>
            <p class="heart-eyebrow">Gesamtstatus</p>
            <h2>${escapeHtml(String(data.overallStatus || "idle").toUpperCase())}</h2>
          </div>
          ${renderStatusBadge(data.overallStatus || "idle")}
        </div>
        <p class="heart-kpi-card__summary">${escapeHtml(data.overallNote || "Noch keine Statusnotiz vorhanden.")}</p>
        <div class="heart-kpi-card__foot">Stand ${escapeHtml(formatRelative(data.updatedAt))}</div>
      </article>
      <article class="heart-kpi-card">
        <div class="heart-kpi-card__head">
          <div>
            <p class="heart-eyebrow">Schnelltest</p>
            <h2>${escapeHtml(smoke?.status ? String(smoke.status).toUpperCase() : "BEREIT")}</h2>
          </div>
          ${renderStatusBadge(smoke?.status || "idle")}
        </div>
        ${renderStatValue(`${smoke?.passedChecks || 0}/${(smoke?.passedChecks || 0) + (smoke?.failedChecks || 0)} Pruefpunkte`, smoke ? formatDuration(smoke.durationMs) : "Noch kein Lauf")}
        <div class="heart-meta-row">
          <span>${escapeHtml(smoke?.summary || "Noch kein Schnelltest gelaufen.")}</span>
          <span>${escapeHtml(smoke?.startedAt ? formatDateTime(smoke.startedAt) : "-")}</span>
        </div>
      </article>
      <article class="heart-kpi-card">
        <div class="heart-kpi-card__head">
          <div>
            <p class="heart-eyebrow">Kompletttest</p>
            <h2>${escapeHtml(synthetic?.status ? String(synthetic.status).toUpperCase() : "BEREIT")}</h2>
          </div>
          ${renderStatusBadge(synthetic?.status || "idle")}
        </div>
        ${renderStatValue(`${synthetic?.createdEntities?.length || 0} Testdaten`, synthetic ? formatDuration(synthetic.durationMs) : "Noch kein Lauf")}
        <div class="heart-meta-row">
          <span>${escapeHtml(synthetic?.summary || "Noch kein Kompletttest gelaufen.")}</span>
          <span>${escapeHtml(synthetic?.startedAt ? formatDateTime(synthetic.startedAt) : "-")}</span>
        </div>
      </article>
      <article class="heart-kpi-card">
        <div class="heart-kpi-card__head">
          <div>
            <p class="heart-eyebrow">Letzte Rolle</p>
            <h2>${escapeHtml(getPackLabel(persona?.packKey, persona?.packLabel || "Noch kein Rollentest", persona?.mode))}</h2>
          </div>
          ${renderStatusBadge(persona?.status || "idle")}
        </div>
        ${renderStatValue(persona?.summary || "Noch kein Rollentest gelaufen.", persona?.startedAt ? formatDateTime(persona.startedAt) : "Noch kein Lauf")}
        <div class="heart-meta-row">
          <span>${escapeHtml(persona?.personas?.join(", ") || "Noch keine Rolle")}</span>
          <span>${escapeHtml(formatRelative(data.updatedAt))}</span>
        </div>
      </article>
      <article class="heart-kpi-card">
        <div class="heart-kpi-card__head">
          <div>
            <p class="heart-eyebrow">Live-Ueberwachung</p>
            <h2>${escapeHtml(String(monitoring.activeIncidents || 0))} offen</h2>
          </div>
          ${renderStatusBadge((monitoring.criticalIncidents || 0) > 0 ? "critical" : (monitoring.activeIncidents || 0) > 0 ? "warning" : "success")}
        </div>
        ${renderStatValue(`${monitoring.criticalIncidents || 0} kritisch`, monitoring.latestFailure || "Noch keine offene Stoerung gemeldet.")}
        <div class="heart-meta-row">
          <span>Letztes Monitoring</span>
          <span>${escapeHtml(formatRelative(data.updatedAt))}</span>
        </div>
      </article>
    </section>
  `;
}

function renderRunControls(connections = [], quickActions = []) {
  const runnerConfigured = isGithubRunnerConfigured(connections);
  const disabledAttr = runnerConfigured ? "" : "disabled";
  const note = runnerConfigured
    ? "Der GitHub-Runner ist bereit. Heart startet Laeufe sicher ueber das Backend."
    : `Runner noch nicht bereit. ${getGithubRunnerNote(connections)}`;
  const packActions = getPrimaryPackActions(quickActions);
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Schnell starten</p>
          <h2>Command Center</h2>
        </div>
      </div>
      <div class="heart-control-grid">
        ${packActions.map((item, index) => `
          <button class="heart-button ${index === 0 ? "heart-button--primary" : item.packKey === "full-platform-pack" ? "heart-button--dark" : "heart-button--secondary"}" data-action="start-pack" data-pack-key="${escapeHtml(item.packKey || item.id)}" ${disabledAttr}>${escapeHtml(item.label || `Starte ${getPackLabel(item.packKey || item.id)}`)}</button>
        `).join("")}
        <button class="heart-button heart-button--secondary" data-action="refresh-heart">Status neu laden</button>
      </div>
      <p class="heart-section__note">${escapeHtml(note)}</p>
    </section>
  `;
}

function renderHeartGuide() {
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Einfach erklaert</p>
          <h2>So arbeitet Heart</h2>
        </div>
      </div>
      <div class="heart-note-grid">
        <article class="heart-note-card">
          <strong>Tests statt Fachbegriffe</strong>
          <p>Schnelltest prueft die wichtigsten Lesepfade. Kompletttest geht alle Rollen durch. Schreibtest drueckt echte Buttons nur im geschuetzten Modus.</p>
        </article>
        <article class="heart-note-card">
          <strong>Konten</strong>
          <p>Heart nutzt vorbereitete Testkonten fuer CEO, Business, Service, Nutzer und Gast / QR. Neue Konten werden in diesem Stand noch nicht automatisch angelegt.</p>
        </article>
        <article class="heart-note-card">
          <strong>QR, Menue und Warenkorb</strong>
          <p>Gasttests brauchen einen echten QR- oder Menue-Link. Bestellungen werden nur live getestet, wenn der Bestellknopf sauber hinterlegt und der isolierte Schreibmodus aktiv ist.</p>
        </article>
        <article class="heart-note-card">
          <strong>Beweis und Aufraeumen</strong>
          <p>Im Laufdetail siehst du Beweisbilder, Ablaufspuren, Berichte, erstellte Testdaten und den Aufraeumstatus. Vollautomatisches Loeschen geht nur dort, wo sichere Loeschregeln existieren.</p>
        </article>
      </div>
    </section>
  `;
}

function renderIncidentPreview(items = []) {
  if (!items.length) {
    return renderEmptyState({
      title: "Noch keine Meldungen.",
      message: "Stoerungen aus Runtime, Runner oder Workflows erscheinen hier automatisch."
    });
  }
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Neueste Meldungen</p>
          <h2>Aktive Signale</h2>
        </div>
        <button class="heart-link-button" data-nav-key="incidents">Alle Meldungen</button>
      </div>
      <div class="heart-list-stack">
        ${items.slice(0, 5).map((item) => `
          <article class="heart-list-card">
            <div class="heart-list-card__head">
              <div>
                <strong>${escapeHtml(item.title || "Meldung")}</strong>
                <p>${escapeHtml(item.message || item.module || "Keine Details vorhanden.")}</p>
              </div>
              <div class="heart-list-card__badges">
                ${renderSeverityBadge(item.severity || "info")}
                ${renderStatusBadge(item.status || "open")}
              </div>
            </div>
            <div class="heart-list-card__meta">
              <span>${escapeHtml(item.source || "runtime")}</span>
              <span>${escapeHtml(item.module || "unbekannt")}</span>
              <span>${escapeHtml(item.createdAt ? formatDateTime(item.createdAt) : "-")}</span>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderRunHistoryPreview(items = []) {
  if (!items.length) {
    return renderEmptyState({
      title: "Noch keine Laeufe.",
      message: "Starte einen Schnelltest oder Kompletttest, damit Heart Verlauf, Beweise und Berichte anzeigen kann."
    });
  }
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Verlauf</p>
          <h2>Letzte Laeufe</h2>
        </div>
        <button class="heart-link-button" data-nav-key="runs">Laeufe oeffnen</button>
      </div>
      <div class="heart-list-stack">
        ${items.slice(0, 5).map((item) => `
          <button class="heart-run-preview" data-action="open-run" data-run-id="${escapeHtml(item.id)}">
            <div>
              <strong>${escapeHtml(getPackLabel(item.packKey, item.packLabel, item.mode))}</strong>
              <p>${escapeHtml(item.summary || "Keine Zusammenfassung vorhanden.")}</p>
            </div>
            <div class="heart-run-preview__meta">
              ${renderStatusBadge(item.status || "idle")}
              <span>${escapeHtml(item.startedAt ? formatRelative(item.startedAt) : "-")}</span>
            </div>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderConnectionsPreview(items = []) {
  if (!items.length) return "";
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Anbindungen</p>
          <h2>Systemstatus</h2>
        </div>
        <button class="heart-link-button" data-nav-key="connections">Setup oeffnen</button>
      </div>
      <div class="heart-connection-list">
        ${items.map((item) => `
          <article class="heart-connection-card heart-connection-card--${escapeHtml(item.status || "idle")}">
            <div>
              <strong>${escapeHtml(item.name || "Verbindung")}</strong>
              <p>${escapeHtml(item.note || "Keine Notiz vorhanden.")}</p>
            </div>
            <div class="heart-connection-card__meta">
              ${renderStatusBadge(item.status || "idle")}
              <span>${escapeHtml(item.mode || "-")}</span>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

export function renderDashboardView(data = null) {
  if (!data) {
    return renderEmptyState({
      title: "Heart ist bereit.",
      message: "Sobald du aktualisierst, laedt Heart den ersten Status, die letzten Laeufe und offene Meldungen.",
      actionLabel: "Jetzt laden",
      action: "refresh-heart"
    });
  }

  return `
    <div class="heart-view-stack">
      ${renderTopStatusCards(data)}
      ${renderRunControls(data.connectionsPreview || [], data.quickActions || [])}
      ${renderHeartGuide()}
      <div class="heart-two-column-grid">
        <div class="heart-view-stack">
          ${renderIncidentPreview(data.latestIncidents || [])}
        </div>
        <div class="heart-view-stack">
          ${renderRunHistoryPreview(data.recentRuns || [])}
          ${renderConnectionsPreview(data.connectionsPreview || [])}
        </div>
      </div>
      ${renderModuleHealthGrid(data.moduleHealth || [], { title: "Bereiche im Ueberblick", compact: true })}
    </div>
  `;
}
