import {
  escapeHtml,
  formatDateTime,
  renderEmptyState,
  renderStatusBadge
} from "./heart-ui-utils.js";

export function renderSettingsView(items = []) {
  return `
    <div class="heart-view-stack">
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Verbindungen</p>
            <h2>System und Setup</h2>
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
          message: "Sobald Heart die erste Systemabfrage geladen hat, siehst du hier Runner, Speicher und Monitoring."
        })}
      </section>
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Wichtige Antworten</p>
            <h2>Was Heart heute schon kann</h2>
          </div>
        </div>
        <div class="heart-note-grid">
          <article class="heart-note-card">
            <strong>Erstellt Heart Konten selbst?</strong>
            <p>Noch nicht automatisch. Heart nutzt vorbereitete Testkonten oder einen hinterlegten Gast- / QR-Link. Fuer vollautomatische Konto-Erstellung brauchen wir sichere Admin-Flows.</p>
          </article>
          <article class="heart-note-card">
            <strong>Kann Heart alles wieder loeschen?</strong>
            <p>Teilweise. Heart kann nur das automatisch aufraeumen, wofuer sichere Loeschregeln oder Admin-Pfade hinterlegt sind. Im Laufdetail siehst du genau, was erstellt und was schon wieder entfernt wurde.</p>
          </article>
          <article class="heart-note-card">
            <strong>Wie laufen Gasttests?</strong>
            <p>Immer ueber echte QR- oder Menue-Links. Deshalb muessen diese Links und die sichtbaren Menue- oder Warenkorbbereiche sauber hinterlegt sein, sonst meldet Heart "Einrichtung fehlt".</p>
          </article>
          <article class="heart-note-card">
            <strong>Wo sehe ich den Beweis?</strong>
            <p>In jedem Lauf unter Beweisbilder und Dateien. Dort liegen Screenshots, Ablaufspuren und Berichte, damit du nachvollziehen kannst, was Heart wirklich gemacht hat.</p>
          </article>
        </div>
      </section>
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Technik in klar</p>
            <h2>Wie Heart arbeitet</h2>
          </div>
        </div>
        <div class="heart-note-grid">
          <article class="heart-note-card">
            <strong>Sicherer Teststart</strong>
            <p>Browser -> Heart-Backend -> GitHub Actions. Dadurch liegt kein Runner-Token offen im Frontend.</p>
          </article>
          <article class="heart-note-card">
            <strong>Lesen vor Schreiben</strong>
            <p>Heart prueft standardmaessig zuerst sichere Lesepfade. Echte Schreibaktionen laufen nur im isolierten Modus, damit Live-Daten nicht aus Versehen veraendert werden.</p>
          </article>
          <article class="heart-note-card">
            <strong>Klare Wahrheiten</strong>
            <p>Heart zeigt bewusst "Einrichtung fehlt", "Geschuetzt" oder "Uebersprungen", statt einen falschen Erfolg vorzutaeuschen.</p>
          </article>
        </div>
      </section>
    </div>
  `;
}
