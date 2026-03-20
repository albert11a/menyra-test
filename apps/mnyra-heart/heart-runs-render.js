import {
  escapeHtml,
  formatDateTime,
  formatDuration,
  formatRelative,
  formatStatusCount,
  getArtifactKindLabel,
  getGithubRunnerNote,
  getModuleLabel,
  getPackLabel,
  getPersonaLabel,
  isGithubRunnerConfigured,
  renderEmptyState,
  renderSeverityBadge,
  renderStatusBadge
} from "./heart-ui-utils.js";

const FALLBACK_PACK_ACTIONS = Object.freeze([
  { id: "smoke", packKey: "smoke", action: "start-pack", label: "Schnelltest starten" },
  { id: "full-platform-pack", packKey: "full-platform-pack", action: "start-pack", label: "Kompletttest starten" },
  { id: "guest-pack", packKey: "guest-pack", action: "start-pack", label: "Gast- / QR-Test starten" },
  { id: "mutation-pack", packKey: "mutation-pack", action: "start-pack", label: "Schreibtest starten" },
  { id: "ceo-pack", packKey: "ceo-pack", action: "start-pack", label: "CEO-Test starten" },
  { id: "business-pack", packKey: "business-pack", action: "start-pack", label: "Business-Test starten" },
  { id: "staff-pack", packKey: "staff-pack", action: "start-pack", label: "Service-Test starten" },
  { id: "user-pack", packKey: "user-pack", action: "start-pack", label: "Nutzer-Test starten" },
  { id: "journey-pack", packKey: "journey-pack", action: "start-pack", label: "Journey-Test starten" }
]);

function getPackActions(quickActions = []) {
  const startActions = quickActions.filter((item) => item.action === "start-pack");
  return startActions.length ? startActions : FALLBACK_PACK_ACTIONS;
}

function renderRunSummaryList(items = [], selectedRunId = "") {
  if (!items.length) {
    return renderEmptyState({
      title: "Noch keine Laeufe vorhanden.",
      message: "Sobald du einen Test startest, erscheint hier der Verlauf mit Status, Beweisen und Aufraeuminfos."
    });
  }
  return `
    <div class="heart-run-list">
      ${items.map((item) => {
        const selected = String(item.id || "") === String(selectedRunId || "");
        return `
          <button class="heart-run-row ${selected ? "heart-run-row--active" : ""}" data-action="open-run" data-run-id="${escapeHtml(item.id)}">
            <div>
              <strong>${escapeHtml(getPackLabel(item.packKey, item.packLabel, item.mode))}</strong>
              <p>${escapeHtml(item.summary || "Keine Zusammenfassung vorhanden.")}</p>
            </div>
            <div class="heart-run-row__meta">
              ${renderStatusBadge(item.status || "idle")}
              <span>${escapeHtml(item.startedAt ? formatRelative(item.startedAt) : "-")}</span>
            </div>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderTimeline(detail = {}) {
  if (!detail.timeline?.length) {
    return renderEmptyState({
      title: "Noch kein Ablauf vorhanden.",
      message: "Sobald Heart Statusmeldungen aus dem Runner oder aus GitHub bekommt, siehst du hier jeden Schritt."
    });
  }
  return `
    <div class="heart-timeline">
      ${detail.timeline.map((step) => `
        <article class="heart-timeline__item heart-timeline__item--${escapeHtml(step.status || "idle")}">
          <div class="heart-timeline__dot"></div>
          <div class="heart-timeline__body">
            <div class="heart-timeline__head">
              <strong>${escapeHtml(step.title || "Schritt")}</strong>
              ${renderStatusBadge(step.status || "idle")}
            </div>
            <p>${escapeHtml(step.note || "Keine Details vorhanden.")}</p>
            <span>${escapeHtml(step.startedAt ? formatDateTime(step.startedAt) : "-")}${step.endedAt ? ` bis ${escapeHtml(formatDateTime(step.endedAt))}` : ""}</span>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderStatusBreakdown(detail = {}) {
  const breakdown = detail.statusBreakdown || {};
  const rows = [
    ["Erfolgreich", breakdown.success || 0, "success"],
    ["Probleme", (breakdown.failed || 0) + (breakdown.critical || 0), breakdown.critical ? "critical" : "failed"],
    ["Hinweise", breakdown.warning || 0, "warning"],
    ["Uebersprungen", breakdown.skipped || 0, "skipped"],
    ["Einrichtung fehlt", breakdown.not_configured || 0, "not_configured"],
    ["Geschuetzt", breakdown.guarded || 0, "guarded"]
  ];
  return `
    <div class="heart-detail-grid">
      ${rows.map(([label, value, status]) => `
        <div>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
          ${renderStatusBadge(status)}
        </div>
      `).join("")}
    </div>
  `;
}

function renderRunSetupSummary(detail = {}) {
  const personaEntries = Object.entries(detail.runFlags?.personas || {});
  const configuredCount = personaEntries.filter(([, value]) => value?.configured).length;
  const guestEntry = personaEntries.find(([key]) => key === "guest");
  return `
    <div class="heart-detail-grid">
      <div>
        <span>Schreibmodus</span>
        <strong>${escapeHtml(detail.runFlags?.allowLiveMutations ? "Aktiv" : "Nur lesend")}</strong>
      </div>
      <div>
        <span>Isolierte Testdaten</span>
        <strong>${escapeHtml(detail.runFlags?.syntheticIsolationConfigured ? "Bereit" : "Fehlt")}</strong>
      </div>
      <div>
        <span>Konten bereit</span>
        <strong>${escapeHtml(personaEntries.length ? `${configuredCount} / ${personaEntries.length}` : "Unbekannt")}</strong>
      </div>
      <div>
        <span>Gast / QR</span>
        <strong>${escapeHtml(guestEntry?.[1]?.guestRouteUrl ? "Link vorhanden" : "Link fehlt")}</strong>
      </div>
    </div>
  `;
}

function renderAreaResults(detail = {}) {
  if (!detail.modules?.length) {
    return renderEmptyState({
      title: "Noch keine Bereichsergebnisse.",
      message: "Hier siehst du spaeter pro Bereich, was funktioniert hat und was noch fehlt."
    });
  }
  return `
    <div class="heart-list-stack">
      ${detail.modules.map((module) => `
        <article class="heart-list-card">
          <div class="heart-list-card__head">
            <div>
              <strong>${escapeHtml(getModuleLabel(module.module, module.label || module.module || "Bereich"))}</strong>
              <p>${escapeHtml(module.note || "Keine Notiz vorhanden.")}</p>
            </div>
            ${renderStatusBadge(module.status || "idle")}
          </div>
          <div class="heart-list-card__meta">
            <span>${escapeHtml(module.personas?.map((persona) => getPersonaLabel(persona)).join(", ") || "-")}</span>
            <span>${escapeHtml(module.lastCheckAt ? formatRelative(module.lastCheckAt) : "Noch keine Pruefung")}</span>
          </div>
          ${module.counts && Object.keys(module.counts).length ? `
            <div class="heart-list-card__meta">
              ${Object.entries(module.counts)
                .filter(([, value]) => Number(value) > 0)
                .map(([status, value]) => escapeHtml(formatStatusCount(status, value)))
                .join(" | ")}
            </div>
          ` : ""}
          ${module.checks?.length ? `<div class="heart-list-stack">${module.checks.slice(-4).map((check) => `
            <article class="heart-list-card">
              <div class="heart-list-card__head">
                <div>
                  <strong>${escapeHtml(check.action || "Pruefung")}</strong>
                  <p>${escapeHtml(check.note || "Keine Details vorhanden.")}</p>
                </div>
                ${renderStatusBadge(check.status || "idle")}
              </div>
              <div class="heart-list-card__meta">
                <span>${escapeHtml(getModuleLabel(check.area || module.module, check.area || module.module || "-"))}</span>
                <span>${escapeHtml(getPersonaLabel(check.persona, check.persona || "-"))}</span>
              </div>
            </article>
          `).join("")}</div>` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function renderCreatedEntities(detail = {}) {
  if (!detail.createdEntities?.length) {
    return renderEmptyState({
      title: "Keine Testdaten protokolliert.",
      message: "Dieser Lauf hat nichts erstellt oder der Lauf war rein lesend."
    });
  }
  return `
    <div class="heart-list-stack">
      ${detail.createdEntities.map((entity) => `
        <article class="heart-list-card">
          <div class="heart-list-card__head">
            <div>
              <strong>${escapeHtml(entity.label || entity.id || "Element")}</strong>
              <p>${escapeHtml(entity.summary || entity.type || "Testdaten")}</p>
            </div>
            ${renderStatusBadge(entity.status || "success")}
          </div>
          <div class="heart-list-card__meta">
            <span>${escapeHtml(entity.type || "-")}</span>
            <span>Aufraeumen: ${escapeHtml(entity.cleanupStatus || "idle")}</span>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderArtifacts(detail = {}) {
  if (!detail.artifacts?.length) {
    return renderEmptyState({
      title: "Noch keine Nachweise.",
      message: "Beweisbilder, Ablaufspuren und Berichte erscheinen hier, sobald der Runner sie hochlaedt oder verlinkt."
    });
  }
  const artifacts = detail.artifacts.slice().sort((left, right) => {
    const leftPriority = left.kind === "screenshot" ? 0 : 1;
    const rightPriority = right.kind === "screenshot" ? 0 : 1;
    return leftPriority - rightPriority;
  });
  return `
    <div class="heart-artifact-list">
      ${artifacts.map((artifact) => `
        <a class="heart-artifact-link" href="${escapeHtml(artifact.url || "#")}" target="_blank" rel="noreferrer">
          <span>
            <strong>${escapeHtml(artifact.label || "Datei")}</strong>
            <small>${escapeHtml(getArtifactKindLabel(artifact.kind, artifact.kind || "Datei"))}</small>
          </span>
          ${artifact.sizeLabel ? `<span>${escapeHtml(artifact.sizeLabel)}</span>` : ""}
        </a>
      `).join("")}
    </div>
  `;
}

function renderDetailPanel(detail = null, detailStatus = "idle", detailError = "") {
  if (detailStatus === "loading") {
    return `<section class="heart-section"><div class="heart-loading-block">Laufdetails werden geladen...</div></section>`;
  }
  if (detailStatus === "error") {
    return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(detailError || "Laufdetails konnten nicht geladen werden.")}</div></section>`;
  }
  if (!detail) {
    return renderEmptyState({
      title: "Waehle einen Lauf aus.",
      message: "Dann siehst du hier Ablauf, Beweisbilder, Testdaten und Aufraeumstatus."
    });
  }
  return `
    <div class="heart-view-stack">
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Laufdetails</p>
            <h2>${escapeHtml(getPackLabel(detail.packKey, detail.packLabel, detail.mode))}</h2>
          </div>
          <div class="heart-header-actions">
            ${renderStatusBadge(detail.status || "idle")}
            ${detail.github?.htmlUrl ? `<a class="heart-button heart-button--secondary" href="${escapeHtml(detail.github.htmlUrl)}" target="_blank" rel="noreferrer">GitHub-Lauf</a>` : ""}
            ${["queued", "running"].includes(detail.status || "") ? `<button class="heart-button heart-button--secondary" data-action="cancel-run" data-run-id="${escapeHtml(detail.id)}">Abbrechen</button>` : ""}
          </div>
        </div>
        <div class="heart-detail-grid">
          <div><span>Test</span><strong>${escapeHtml(getPackLabel(detail.packKey, detail.packLabel, detail.mode))}</strong></div>
          <div><span>Stufe</span><strong>${escapeHtml(detail.packLevel || "-")}</strong></div>
          <div><span>Status</span><strong>${escapeHtml(detail.status || "idle")}</strong></div>
          <div><span>Gestartet</span><strong>${escapeHtml(detail.startedAt ? formatDateTime(detail.startedAt) : "-")}</strong></div>
          <div><span>Beendet</span><strong>${escapeHtml(detail.endedAt ? formatDateTime(detail.endedAt) : "-")}</strong></div>
          <div><span>Dauer</span><strong>${escapeHtml(formatDuration(detail.durationMs || 0))}</strong></div>
          <div><span>Pruefungen</span><strong>${escapeHtml(`${detail.passedChecks || 0} ok / ${detail.failedChecks || 0} problematisch`)}</strong></div>
          <div><span>Build</span><strong>${escapeHtml(detail.build || detail.branch || "-")}</strong></div>
          <div><span>Gerade</span><strong>${escapeHtml(detail.currentStep || "-")}</strong></div>
        </div>
        ${renderStatusBreakdown(detail)}
        <p class="heart-detail-summary">${escapeHtml(detail.summary || "Keine Zusammenfassung vorhanden.")}</p>
        ${detail.personas?.length ? `<p class="heart-section__note">Rollen in diesem Lauf: ${escapeHtml(detail.personas.map((persona) => getPersonaLabel(persona)).join(", "))}</p>` : ""}
        ${renderRunSetupSummary(detail)}
        <p class="heart-section__note">Einrichtung fehlt bedeutet: Daten, Links oder Selektoren fehlen. Geschuetzt bedeutet: Heart koennte den Schritt spaeter ausfuehren, darf aber in diesem Lauf absichtlich noch nicht live schreiben.</p>
      </section>
      <section class="heart-section">
        <div class="heart-section__head"><div><p class="heart-eyebrow">Bereiche</p><h2>Was geklappt hat und was fehlt</h2></div></div>
        ${renderAreaResults(detail)}
      </section>
      <section class="heart-section">
        <div class="heart-section__head"><div><p class="heart-eyebrow">Ablauf</p><h2>Schritt fuer Schritt</h2></div></div>
        ${renderTimeline(detail)}
      </section>
      <div class="heart-two-column-grid">
        <section class="heart-section">
          <div class="heart-section__head"><div><p class="heart-eyebrow">Erstellte Daten</p><h2>Was Heart angelegt hat</h2></div></div>
          ${renderCreatedEntities(detail)}
        </section>
        <section class="heart-section">
          <div class="heart-section__head"><div><p class="heart-eyebrow">Aufraeumen</p><h2>Was Heart wieder entfernt hat</h2></div></div>
          <div class="heart-cleanup-box">
            <div class="heart-cleanup-box__head">
              ${renderStatusBadge(detail.cleanup?.status || "idle")}
              <strong>${escapeHtml(detail.cleanup?.summary || "Keine Aufraeuminformation vorhanden.")}</strong>
            </div>
            <p class="heart-section__note">Wenn du spaeter ein echtes "Clear" willst, braucht Heart fuer jeden erzeugten Datentyp sichere Loeschregeln oder Admin-Pfade.</p>
            ${detail.cleanup?.items?.length ? `<div class="heart-list-stack">${detail.cleanup.items.map((item) => `
              <article class="heart-list-card">
                <div class="heart-list-card__head">
                  <div>
                    <strong>${escapeHtml(item.label || item.id || "Aufraeum-Schritt")}</strong>
                    <p>${escapeHtml(item.note || "Keine Details vorhanden.")}</p>
                  </div>
                  ${renderStatusBadge(item.status || "idle")}
                </div>
              </article>
            `).join("")}</div>` : ""}
          </div>
        </section>
      </div>
      <div class="heart-two-column-grid">
        <section class="heart-section">
          <div class="heart-section__head"><div><p class="heart-eyebrow">Nachweise</p><h2>Beweisbilder und Dateien</h2></div></div>
          ${renderArtifacts(detail)}
        </section>
        <section class="heart-section">
          <div class="heart-section__head"><div><p class="heart-eyebrow">Probleme</p><h2>Wichtige Fehlhinweise</h2></div></div>
          ${detail.failureDetails?.length ? `
            <div class="heart-list-stack">
              ${detail.failureDetails.map((item) => `
                <article class="heart-list-card">
                  <div class="heart-list-card__head">
                    <div>
                      <strong>${escapeHtml(item.title || "Problem")}</strong>
                      <p>${escapeHtml(item.message || item.module || "Keine Details vorhanden.")}</p>
                    </div>
                    ${renderSeverityBadge(item.severity || "warning")}
                  </div>
                  <div class="heart-list-card__meta">
                    <span>${escapeHtml(getModuleLabel(item.area || item.module, item.area || item.module || "-"))}</span>
                    <span>${escapeHtml(item.action || "-")}</span>
                    <span>${escapeHtml(getPersonaLabel(item.persona, item.persona || "-"))}</span>
                  </div>
                </article>
              `).join("")}
            </div>
          ` : renderEmptyState({ title: "Keine Problem-Details.", message: "Wenn ein Lauf sauber durchgeht, bleibt dieser Bereich leer." })}
        </section>
      </div>
    </div>
  `;
}

export function renderRunsView(runsState = {}, connections = [], quickActions = []) {
  const items = Array.isArray(runsState.items) ? runsState.items : [];
  const runnerConfigured = isGithubRunnerConfigured(connections);
  const disabledAttr = runsState.pendingAction || !runnerConfigured ? "disabled" : "";
  const runnerNote = runnerConfigured
    ? "Der GitHub-Runner ist bereit. Du kannst Heart-Tests direkt starten."
    : `Runner noch nicht bereit. ${getGithubRunnerNote(connections)}`;
  const packActions = getPackActions(quickActions);
  return `
    <div class="heart-view-stack">
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Tests starten</p>
            <h2>Alle Heart-Laeufe</h2>
          </div>
          <div class="heart-header-actions">
            <button class="heart-button heart-button--secondary" data-action="refresh-heart">Status neu laden</button>
          </div>
        </div>
        <div class="heart-control-grid">
          ${packActions.map((item, index) => `<button class="heart-button ${index === 0 ? "heart-button--primary" : item.packKey === "full-platform-pack" || item.packKey === "mutation-pack" ? "heart-button--dark" : "heart-button--secondary"}" data-action="start-pack" data-pack-key="${escapeHtml(item.packKey || item.id)}" ${disabledAttr}>${escapeHtml(item.label || `Starte ${getPackLabel(item.packKey || item.id)}`)}</button>`).join("")}
        </div>
        <div class="heart-run-status-strip">
          <span>${escapeHtml(runsState.pendingAction ? `Aktion laeuft: ${runsState.pendingAction}` : "Keine Aktion offen.")}</span>
          <span>${escapeHtml(runsState.lastRefreshAt ? `Zuletzt aktualisiert ${formatRelative(runsState.lastRefreshAt)}` : "Noch nicht aktualisiert.")}</span>
        </div>
        <p class="heart-section__note">${escapeHtml(runnerNote)}</p>
      </section>
      <div class="heart-runs-layout">
        <section class="heart-section">
          <div class="heart-section__head"><div><p class="heart-eyebrow">Verlauf</p><h2>Letzte Laeufe</h2></div></div>
          ${runsState.status === "loading"
            ? `<div class="heart-loading-block">Verlauf wird geladen...</div>`
            : runsState.status === "error"
              ? `<div class="heart-error-block">${escapeHtml(runsState.error || "Verlauf konnte nicht geladen werden.")}</div>`
              : renderRunSummaryList(items, runsState.selectedRunId)}
        </section>
        ${renderDetailPanel(runsState.detail, runsState.detailStatus, runsState.detailError)}
      </div>
    </div>
  `;
}
