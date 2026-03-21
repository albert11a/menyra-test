import {
  renderHeartIcon
} from "./heart-icons.js";
import {
  escapeHtml,
  formatDateTime,
  formatDuration,
  formatRelative,
  getPackLabel,
  renderEmptyState,
  renderSeverityBadge,
  renderStatusBadge
} from "./heart-ui-utils.js";
import {
  renderModuleHealthGrid
} from "./heart-modules-render.js";

function renderMetricCard({
  icon = "activity",
  eyebrow = "",
  title = "",
  note = "",
  badge = "",
  accentClass = ""
} = {}) {
  return `
    <article class="heart-dashboard-metric ${accentClass}">
      <div class="heart-dashboard-metric__top">
        <span class="heart-dashboard-metric__icon">${renderHeartIcon(icon)}</span>
        ${badge}
      </div>
      <div class="heart-dashboard-metric__body">
        <p class="heart-eyebrow">${escapeHtml(eyebrow)}</p>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(note)}</p>
      </div>
    </article>
  `;
}

function renderRunPreview(run = null) {
  if (!run) {
    return renderEmptyState({
      title: "Noch kein Lauf vorhanden.",
      message: "Sobald Heart einen Test beendet hat, erscheint hier der letzte sichere Stand."
    });
  }
  return `
    <article class="heart-dashboard-summary-card">
      <div class="heart-dashboard-summary-card__head">
        <div>
          <p class="heart-eyebrow">Letzter Run</p>
          <strong>${escapeHtml(getPackLabel(run.packKey, run.packLabel, run.mode))}</strong>
        </div>
        ${renderStatusBadge(run.status || "idle")}
      </div>
      <p>${escapeHtml(run.summary || "Keine Zusammenfassung vorhanden.")}</p>
      <div class="heart-list-card__meta">
        <span>${escapeHtml(run.startedAt ? formatDateTime(run.startedAt) : "-")}</span>
        <span>${escapeHtml(formatDuration(run.durationMs || 0))}</span>
      </div>
      <button class="heart-button heart-button--secondary" data-action="open-run" data-run-id="${escapeHtml(run.id)}">Run oeffnen</button>
    </article>
  `;
}

function renderIncidentPreview(items = []) {
  if (!items.length) {
    return renderEmptyState({
      title: "Keine offenen Meldungen.",
      message: "Heart hat aktuell keine neuen aktiven Signale aus Runtime, Runner oder Workflow."
    });
  }
  return `
    <div class="heart-list-stack">
      ${items.slice(0, 4).map((item) => `
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
            <span>${escapeHtml(item.createdAt ? formatRelative(item.createdAt) : "-")}</span>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderHeartSummary(data = {}) {
  const latestRun = data.recentRuns?.[0] || data.syntheticStatus || data.smokeStatus || null;
  const runner = (data.connectionsPreview || []).find((item) => String(item.kind || "").toLowerCase() === "github") || null;
  const openIncidents = Math.max(0, Number(data.liveMonitoringSummary?.activeIncidents) || 0);
  const criticalIncidents = Math.max(0, Number(data.liveMonitoringSummary?.criticalIncidents) || 0);

  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Dashboard</p>
          <h2>Heart im Ueberblick</h2>
        </div>
      </div>
      <div class="heart-dashboard-metrics">
        ${renderMetricCard({
          icon: "activity",
          eyebrow: "Gesamtstatus",
          title: String(data.overallStatus || "idle").toUpperCase(),
          note: data.overallNote || "Noch keine Statusnotiz vorhanden.",
          badge: renderStatusBadge(data.overallStatus || "idle"),
          accentClass: `heart-dashboard-metric--${escapeHtml(data.overallStatus || "idle")}`
        })}
        ${renderMetricCard({
          icon: "checkCircle",
          eyebrow: "Letzter Heart-Run",
          title: latestRun ? getPackLabel(latestRun.packKey, latestRun.packLabel, latestRun.mode) : "Noch kein Lauf",
          note: latestRun ? latestRun.summary || "Zusammenfassung folgt im Detail." : "Starte zuerst einen Lauf, damit Heart echte Resultate zeigen kann.",
          badge: renderStatusBadge(latestRun?.status || "idle")
        })}
        ${renderMetricCard({
          icon: "bot",
          eyebrow: "Runner",
          title: runner?.mode === "real" ? "Bereit" : "Fehlt",
          note: runner?.note || "Heart braucht einen sicheren GitHub-Runner, damit Runs wirklich starten.",
          badge: renderStatusBadge(runner?.status || "not_configured")
        })}
        ${renderMetricCard({
          icon: "triangle",
          eyebrow: "Offene Meldungen",
          title: `${openIncidents} offen`,
          note: criticalIncidents > 0 ? `${criticalIncidents} davon kritisch.` : "Aktuell keine kritische Stoerung.",
          badge: renderStatusBadge(criticalIncidents > 0 ? "critical" : openIncidents > 0 ? "warning" : "success")
        })}
        ${renderMetricCard({
          icon: "users",
          eyebrow: "Aktive Nutzer",
          title: "Noch offen",
          note: "Fuer echte Live-Nutzerzahlen braucht Heart noch eine freigegebene Analytics- oder Firestore-Datenquelle.",
          badge: renderStatusBadge("not_configured")
        })}
        ${renderMetricCard({
          icon: "scan",
          eyebrow: "QR-Scans",
          title: "Noch offen",
          note: "QR-Scans sind im aktuellen Heart-Backend noch nicht als Live-Metrik angebunden.",
          badge: renderStatusBadge("not_configured")
        })}
        ${renderMetricCard({
          icon: "chart",
          eyebrow: "Live Besucher",
          title: "Noch offen",
          note: "Besucherzahlen koennen erst erscheinen, wenn Heart eine Live-Analytics-Quelle lesen darf.",
          badge: renderStatusBadge("not_configured")
        })}
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
      ${renderHeartSummary(data)}
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Klartext</p>
            <h2>Was Heart heute sicher weiss</h2>
          </div>
        </div>
        <div class="heart-note-grid">
          <article class="heart-note-card">
            <strong>Heart startet und verfolgt echte Runs</strong>
            <p>Heart kann sichere Testlaeufe starten, Status nachladen, Nachweise anzeigen und Probleme klar einsortieren.</p>
          </article>
          <article class="heart-note-card">
            <strong>Heart zeigt nichts gruen, was nicht echt ist</strong>
            <p>Fehlende Konten, QR-Links oder Schreibpfade werden offen als Einrichtung fehlt, Geschuetzt oder Noch offen markiert.</p>
          </article>
          <article class="heart-note-card">
            <strong>Heart ist noch nicht die komplette Analytics-Zentrale</strong>
            <p>Aktive Nutzer, QR-Scans und Live-Besucher brauchen noch eigene Datenquellen, damit Heart echte Livezahlen lesen kann.</p>
          </article>
        </div>
      </section>
      <div class="heart-two-column-grid">
        <section class="heart-section">
          <div class="heart-section__head">
            <div>
              <p class="heart-eyebrow">Letzter Stand</p>
              <h2>Run Fokus</h2>
            </div>
          </div>
          ${renderRunPreview(data.recentRuns?.[0] || data.syntheticStatus || data.smokeStatus || null)}
        </section>
        <section class="heart-section">
          <div class="heart-section__head">
            <div>
              <p class="heart-eyebrow">Meldungen</p>
              <h2>Aktive Signale</h2>
            </div>
          </div>
          ${renderIncidentPreview(data.latestIncidents || [])}
        </section>
      </div>
      ${renderModuleHealthGrid(data.moduleHealth || [], { title: "Bereiche im Ueberblick", compact: true })}
    </div>
  `;
}
