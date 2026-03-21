import {
  renderHeartIcon
} from "./heart-icons.js";
import {
  escapeHtml,
  formatDateTime,
  renderEmptyState,
  renderStatusBadge
} from "./heart-ui-utils.js";

function renderSetupToolCard({
  icon = "settings",
  eyebrow = "",
  title = "",
  body = "",
  status = "not_configured"
} = {}) {
  return `
    <article class="heart-setup-tool-card">
      <div class="heart-setup-tool-card__top">
        <span class="heart-setup-tool-card__icon">${renderHeartIcon(icon)}</span>
        ${renderStatusBadge(status)}
      </div>
      <div class="heart-setup-tool-card__body">
        <p class="heart-eyebrow">${escapeHtml(eyebrow)}</p>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(body)}</p>
      </div>
    </article>
  `;
}

export function renderSettingsView(items = []) {
  return `
    <div class="heart-view-stack">
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Einrichtung</p>
            <h2>Was Heart noch braucht</h2>
          </div>
        </div>
        <div class="heart-setup-tool-grid">
          ${renderSetupToolCard({
            icon: "users",
            eyebrow: "Testkonten",
            title: "CEO, Business, Service und Nutzer",
            body: "Heart erstellt diese Konten heute noch nicht selbst. Fuer volle Runs muessen stabile Testkonten als Secrets bereitliegen.",
            status: "not_configured"
          })}
          ${renderSetupToolCard({
            icon: "scan",
            eyebrow: "Gast / QR",
            title: "Echter Menue- oder QR-Link",
            body: "Fuer Gast-, Warenkorb- und Bestelltests braucht Heart einen echten QR- oder Menue-Link mit funktionierender Speisekarte.",
            status: "not_configured"
          })}
          ${renderSetupToolCard({
            icon: "shield",
            eyebrow: "Schreibmodus",
            title: "Sicherer Live-Mutationsmodus",
            body: "Bestellungen, Erstellen und Loeschen laufen nur sauber, wenn der isolierte Schreibmodus bewusst freigegeben ist.",
            status: "warning"
          })}
          ${renderSetupToolCard({
            icon: "bot",
            eyebrow: "Runner",
            title: "GitHub Runner und Webhooks",
            body: "Heart braucht den sicheren Runner, damit Starts, Status, Berichte und Screenshots ueber das Backend zusammenlaufen.",
            status: items.some((item) => String(item.kind || "").toLowerCase() === "github" && String(item.mode || "").toLowerCase() === "real") ? "success" : "not_configured"
          })}
          ${renderSetupToolCard({
            icon: "broom",
            eyebrow: "Clear / Delete",
            title: "Sichere Clear-API",
            body: "Heart kann Nachweise und erzeugte Testdaten erst dann serverseitig loeschen, wenn pro Datentyp sichere Delete-Regeln existieren.",
            status: "not_configured"
          })}
          ${renderSetupToolCard({
            icon: "chart",
            eyebrow: "Live Zahlen",
            title: "Analytics fuer Nutzer, QR und Besucher",
            body: "Aktive Nutzer, QR-Scans und Live-Besucher koennen erst erscheinen, wenn Heart eine echte Datenquelle dafuer lesen darf.",
            status: "not_configured"
          })}
        </div>
      </section>
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Systemstatus</p>
            <h2>Technische Anbindungen</h2>
          </div>
        </div>
        ${items.length ? `
          <div class="heart-connection-grid">
            ${items.map((item) => `
              <article class="heart-connection-panel heart-connection-panel--${escapeHtml(item.status || "idle")}">
                <div class="heart-connection-panel__head">
                  <div>
                    <strong>${escapeHtml(item.name || "Verbindung")}</strong>
                    <p>${escapeHtml(item.kind || "intern")}</p>
                  </div>
                  ${renderStatusBadge(item.status || "idle")}
                </div>
                <p class="heart-connection-panel__note">${escapeHtml(item.note || "Keine Notiz vorhanden.")}</p>
                <div class="heart-detail-grid">
                  <div><span>Modus</span><strong>${escapeHtml(item.mode || "-")}</strong></div>
                  <div><span>Geprueft</span><strong>${escapeHtml(item.lastCheckedAt ? formatDateTime(item.lastCheckedAt) : "-")}</strong></div>
                </div>
                <p class="heart-connection-panel__detail">${escapeHtml(item.detail || "Keine Details vorhanden.")}</p>
              </article>
            `).join("")}
          </div>
        ` : renderEmptyState({
          title: "Noch kein Setup-Status vorhanden.",
          message: "Sobald Heart die erste Systemabfrage geladen hat, siehst du hier Runner, Speicher und weitere Anbindungen."
        })}
      </section>
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Klartext</p>
            <h2>Woran Heart heute noch scheitern darf</h2>
          </div>
        </div>
        <div class="heart-note-grid">
          <article class="heart-note-card">
            <strong>Heart legt Konten noch nicht selbst an</strong>
            <p>Ohne sichere Admin-Flows oder Backend-Endpoints waere automatisches Erstellen von CEO-, Business-, Service- oder Nutzerkonten nur geraten und nicht belastbar.</p>
          </article>
          <article class="heart-note-card">
            <strong>Heart speichert QR-Links heute noch nicht selbst</strong>
            <p>Ein echter Gast- oder QR-Link muss momentan ausserhalb von Heart hinterlegt werden, sonst kann der Gastlauf nicht wirklich bis Bestellung pruefen.</p>
          </article>
          <article class="heart-note-card">
            <strong>Heart loescht noch nicht serverseitig auf Kommando</strong>
            <p>Beweise und Testdaten koennen erst dann sicher per Papierkorb oder Clear geloescht werden, wenn eine echte Delete-API dafuer gebaut ist.</p>
          </article>
        </div>
      </section>
    </div>
  `;
}
