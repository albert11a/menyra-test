import {
  renderHeartIcon
} from "./heart-icons.js";
import {
  escapeHtml,
  formatDateTime,
  renderEmptyState,
  renderStatusBadge
} from "./heart-ui-utils.js";

const PERSONA_LABELS = Object.freeze({
  ceo: "CEO",
  business: "Business",
  user: "Nutzer"
});

function getPersonaStatus(persona = {}) {
  if (persona.ready) return "success";
  if (persona.email || persona.uid) return "warning";
  return "not_configured";
}

function renderSetupHero(setupData = {}) {
  const requiredCount = Object.keys(PERSONA_LABELS).length;
  const readyCount = Object.keys(PERSONA_LABELS).filter((key) => setupData.personas?.[key]?.ready).length;
  return `
    <section class="heart-section heart-setup-hero">
      <div class="heart-setup-hero__head">
        <div>
          <p class="heart-eyebrow">Heart Einrichtung</p>
          <h2>${escapeHtml(setupData.restaurantName || "Noch kein Restaurant gewaehlt")}</h2>
        </div>
        ${renderStatusBadge(setupData.restaurantId && readyCount >= requiredCount ? "success" : setupData.restaurantId ? "warning" : "not_configured")}
      </div>
      <p class="heart-setup-hero__note">
        ${escapeHtml(
          setupData.restaurantId
            ? `Heart ist mit ${setupData.restaurantName || setupData.restaurantId} verbunden. ${readyCount} von ${requiredCount} dauerhaften Zielkonten sind bereit.`
            : "Waehle zuerst ein Restaurant aus. Danach kann Heart QR-Link, Zielkonten und Runner-Konfiguration darauf aufbauen."
        )}
      </p>
      <div class="heart-detail-grid">
        <div><span>Restaurant</span><strong>${escapeHtml(setupData.restaurantId || "-")}</strong></div>
        <div><span>Gast / QR</span><strong>${escapeHtml(setupData.guestRouteUrl ? "Bereit" : "Fehlt")}</strong></div>
        <div><span>Schreibmodus</span><strong>${escapeHtml(setupData.allowLiveMutations ? "Aktiv" : "Aus")}</strong></div>
        <div><span>Zielkonten</span><strong>${escapeHtml(`${readyCount} / ${requiredCount}`)}</strong></div>
      </div>
    </section>
  `;
}

function renderRestaurantSearch(setupState = {}) {
  const setupData = setupState.data || {};
  const query = String(setupState.searchQuery || setupData.restaurantQuery || "").trim();
  const results = Array.isArray(setupState.searchResults) ? setupState.searchResults : [];
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Restaurant</p>
          <h2>QR und Zielsystem</h2>
        </div>
      </div>
      <form class="heart-setup-search-form" data-heart-setup-search>
        <label class="heart-input-field">
          <span>Restaurant suchen</span>
          <input type="text" name="query" value="${escapeHtml(query)}" placeholder="z. B. Casarita oder Restaurant-ID" />
        </label>
        <button class="heart-button heart-button--secondary" type="submit" ${setupState.searchStatus === "loading" ? "disabled" : ""}>
          ${setupState.searchStatus === "loading" ? "Suche..." : "Suchen"}
        </button>
      </form>
      ${setupState.searchError ? `<div class="heart-login-error">${escapeHtml(setupState.searchError)}</div>` : ""}
      ${results.length ? `
        <div class="heart-list-stack heart-list-stack--compact">
          ${results.map((item) => `
            <button class="heart-list-card heart-list-card--action heart-list-card--button" data-action="select-setup-restaurant" data-restaurant-id="${escapeHtml(item.id)}" data-restaurant-name="${escapeHtml(item.name)}" data-restaurant-handle="${escapeHtml(item.handle)}" data-guest-route-url="${escapeHtml(item.guestRouteUrl || "")}">
              <div class="heart-list-card__head">
                <div>
                  <strong>${escapeHtml(item.name || item.id)}</strong>
                  <p>${escapeHtml(item.city || item.ownerEmail || item.id)}</p>
                </div>
                <span class="heart-chip">${escapeHtml(item.id)}</span>
              </div>
            </button>
          `).join("")}
        </div>
      ` : ""}
      <form class="heart-setup-config-form" data-heart-setup-save>
        <div class="heart-setup-config-grid">
          <label class="heart-input-field">
            <span>Restaurant-ID</span>
            <input type="text" name="restaurantId" value="${escapeHtml(setupData.restaurantId || "")}" placeholder="Restaurant-ID" />
          </label>
          <label class="heart-input-field">
            <span>Name</span>
            <input type="text" name="restaurantName" value="${escapeHtml(setupData.restaurantName || "")}" placeholder="Restaurantname" />
          </label>
          <label class="heart-input-field heart-input-field--wide">
            <span>Gast- / QR-Link</span>
            <input type="url" name="guestRouteUrl" value="${escapeHtml(setupData.guestRouteUrl || "")}" placeholder="https://mnyra.com/menu?r=RESTAURANT_ID&src=qr" />
          </label>
        </div>
        <label class="heart-toggle-row">
          <input type="checkbox" name="allowLiveMutations" ${setupData.allowLiveMutations ? "checked" : ""} />
          <span>Schreibmodus fuer echte Tests aktivieren</span>
        </label>
        <p class="heart-setup-inline-note">Heart nutzt dieses Restaurant als dauerhaftes Business-Ziel fuer Karte, Suche, Menue, QR und Bestellungen.</p>
        <div class="heart-setup-form-actions">
          <button class="heart-button heart-button--primary" type="submit" ${setupState.pendingAction === "save-setup" ? "disabled" : ""}>
            ${setupState.pendingAction === "save-setup" ? "Speichert..." : "Einrichtung speichern"}
          </button>
          ${setupData.restaurantId || setupData.restaurantName || setupData.guestRouteUrl ? `
            <button class="heart-button heart-button--secondary" type="button" data-action="clear-setup-restaurant" ${setupState.pendingAction === "save-setup" ? "disabled" : ""}>
              Verbindung loesen
            </button>
          ` : ""}
        </div>
      </form>
    </section>
  `;
}

function renderPersonaCards(setupState = {}) {
  const setupData = setupState.data || {};
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Testkonten</p>
          <h2>Dauerhafte Zielkonten</h2>
        </div>
        <button class="heart-button heart-button--secondary" data-action="provision-setup-personas" data-personas="all" ${setupData.restaurantId ? "" : "disabled"}>
          Alle erstellen / aktualisieren
        </button>
      </div>
      <div class="heart-setup-tool-grid">
        ${Object.entries(PERSONA_LABELS).map(([key, label]) => {
          const persona = setupData.personas?.[key] || {};
          const status = getPersonaStatus(persona);
          const isBusy = setupState.pendingAction === `provision:${key}` || setupState.pendingAction === "provision:all";
          const purpose = key === "ceo"
            ? "Kontrollkonto fuer den CEO-Lauf."
            : key === "business"
              ? "Restaurant-Zielkonto fuer Menue, Karte, QR und Business-Pruefung."
              : "Social-Zielkonto fuer Follow, Likes, Kommentare, Chat und User-Runs.";
          return `
            <article class="heart-setup-tool-card">
              <div class="heart-setup-tool-card__top">
                <span class="heart-setup-tool-card__icon">${renderHeartIcon(key === "ceo" ? "shield" : key === "business" ? "chart" : key === "staff" ? "bell" : "user")}</span>
                ${renderStatusBadge(status)}
              </div>
              <div class="heart-setup-tool-card__body">
                <p class="heart-eyebrow">${escapeHtml(label)}</p>
                <strong>${escapeHtml(persona.displayName || `Heart ${label}`)}</strong>
                <p>${escapeHtml(persona.email || "Noch nicht angelegt.")}</p>
                <p class="heart-setup-inline-note">${escapeHtml(purpose)}</p>
                ${persona.handle ? `<p class="heart-setup-inline-note">Handle: ${escapeHtml(persona.handle)}</p>` : ""}
                ${persona.password ? `<p class="heart-setup-inline-note">Passwort: ${escapeHtml(persona.password)}</p>` : ""}
                ${persona.updatedAt ? `<p class="heart-setup-inline-note">Aktualisiert: ${escapeHtml(formatDateTime(persona.updatedAt))}</p>` : ""}
              </div>
              <div class="heart-setup-tool-card__actions">
                <button class="heart-button heart-button--secondary" data-action="provision-setup-personas" data-personas="${escapeHtml(key)}" ${setupData.restaurantId ? "" : "disabled"} ${isBusy ? "disabled" : ""}>
                  ${isBusy ? "Aktualisiert..." : "Erstellen / aktualisieren"}
                </button>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderSetupNotes(setupData = {}) {
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Runner</p>
          <h2>Was Heart jetzt selbst liefern kann</h2>
        </div>
      </div>
      <div class="heart-note-grid">
        <article class="heart-note-card">
          <strong>GitHub-Runs koennen Heart-Setup direkt lesen</strong>
          <p>Heart speichert jetzt Konten, QR-Link und Pack-Konfiguration so, dass der Runner sie ueber das Heart-Backend abrufen kann.</p>
        </article>
        <article class="heart-note-card">
          <strong>Zielkonten bleiben bestehen</strong>
          <p>CEO, Business und Nutzer werden als feste Heart-Zielkonten wiederverwendet. Heart aktualisiert sie bei Bedarf, statt sie jedes Mal neu zu loeschen.</p>
        </article>
        <article class="heart-note-card">
          <strong>Live-Zahlen brauchen weiterhin echte Quellen</strong>
          <p>Aktive Nutzer, QR-Scans und Live-Besucher erscheinen erst dann, wenn Heart dafuer eine vorhandene Analytics- oder Presence-Quelle lesen darf.</p>
        </article>
        <article class="heart-note-card">
          <strong>Nachweise bleiben sichtbar</strong>
          <p>Beweisbilder und Run-Berichte bleiben erhalten und koennen direkt aus dem Run geloescht werden. Fuer ein komplettes Clear von echten App-Inhalten braucht Heart weiterhin gezielte Delete-Flows pro Bereich.</p>
        </article>
        ${setupData.syntheticIsolationKeyReady ? `
          <article class="heart-note-card">
            <strong>Schreibmodus ist vorbereitet</strong>
            <p>Heart hat einen Isolationsschluessel hinterlegt. Wenn du den Schreibmodus aktivierst, koennen Business-, User- und Gast-Runs echte Erstellen-, Bestell- und Interaktionsschritte fahren.</p>
          </article>
        ` : ""}
      </div>
    </section>
  `;
}

function renderConnections(items = []) {
  return `
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
  `;
}

export function renderSettingsView({ connections = [], setup = {} } = {}) {
  const setupData = setup.data || {};
  return `
    <div class="heart-view-stack">
      ${setup.error ? `<div class="heart-error-block">${escapeHtml(setup.error)}</div>` : ""}
      ${setup.status === "loading" && !setup.data ? `<div class="heart-loading-block">Heart-Einrichtung wird geladen...</div>` : ""}
      ${renderSetupHero(setupData)}
      ${renderRestaurantSearch(setup)}
      ${renderPersonaCards(setup)}
      ${renderSetupNotes(setupData)}
      ${setup.connectionsError ? `<div class="heart-error-block">${escapeHtml(setup.connectionsError)}</div>` : ""}
      ${renderConnections(connections)}
    </div>
  `;
}
