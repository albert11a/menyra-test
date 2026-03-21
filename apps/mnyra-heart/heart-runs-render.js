import {
  getHeartPack
} from "/shared/heart-pack-catalog.js";
import {
  renderHeartIcon
} from "./heart-icons.js";
import {
  escapeHtml,
  formatDateTime,
  formatDuration,
  formatRelative,
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
  { id: "guard-pack", packKey: "guard-pack", action: "start-pack", label: "Aenderungs-Guard starten" },
  { id: "release-pack", packKey: "release-pack", action: "start-pack", label: "Release-Gate starten" },
  { id: "health-pack", packKey: "health-pack", action: "start-pack", label: "Tageslauf starten" }
]);

const ACTIVE_STATUSES = new Set(["queued", "running"]);
const TERMINAL_STATUSES = new Set(["success", "warning", "failed", "critical", "cancelled", "skipped", "not_configured", "guarded"]);
const START_CARD_ICON_BY_PACK = Object.freeze({
  "guard-pack": "shield",
  "release-pack": "play",
  "health-pack": "clock",
  smoke: "shield",
  "business-pack": "chart",
  "user-pack": "user",
  "guest-pack": "scan"
});

const VISIBLE_PACK_ORDER = Object.freeze({
  "guard-pack": 1,
  "release-pack": 2,
  "health-pack": 3
});

const GUIDE_CONTENT = Object.freeze({
  "guard-pack": {
    eyebrow: "Vor Commit",
    title: "Aenderungs-Guard",
    summary: "Der schnelle Heart-Lauf fuer Code-Aenderungen. Er prueft CEO, Business, User und Gast auf Kernpfade, Discovery und mobile UI, ohne sich in tiefe Nebenpfade zu verlieren.",
    sections: [
      {
        icon: "shield",
        title: "Schnell und guenstig",
        body: "Der Guard ist fuer den Entwickler-Innerloop gedacht. Er soll dir schnell zeigen, ob Navigation, Kernseiten, QR-Weg, Karte, Suche und mobile Layouts noch leben."
      },
      {
        icon: "users",
        title: "Alle vier Sichten sind drin",
        body: "CEO, Business, User und Gast werden in getrennten Sitzungen geprueft, damit ein kaputter Shell- oder Routing-Fehler sofort auffaellt."
      },
      {
        icon: "scan",
        title: "Discovery und QR sind Pflicht",
        body: "Suche, Karte und der oeffentliche Gast- / QR-Weg werden mitgeprueft, weil genau dort regressionsanfällige Oeffnungsfehler schnell sichtbar werden."
      },
      {
        icon: "image",
        title: "Perfekt fuer vor dem Commit",
        body: "Der Guard ist der erste Lauf, den du nach einer Aenderung starten solltest. Wenn der schon rot wird, brauchst du keinen teuren Volltest mehr."
      }
    ]
  },
  "release-pack": {
    eyebrow: "Vor Push",
    title: "Release-Gate",
    summary: "Der breite Freigabelauf vor Push oder Deploy. Heart prueft CEO, Business, User und Gast mit den wichtigsten echten Kern- und Schreibpfaden.",
    sections: [
      {
        icon: "play",
        title: "Der eigentliche Freigabelauf",
        body: "Dieser Lauf ist dafuer da, vor einem Push oder Deploy zu bestaetigen, dass Social, Menue, Discovery, Bestellung, Chat und die mobilen Hauptpfade noch intakt sind."
      },
      {
        icon: "chart",
        title: "Business und User mit echten Aktionen",
        body: "Business prueft Menue und Produktpfade, User prueft Social und Bestellung. Gast prueft den QR-Weg, CEO die Kontroll- und Navigationssicht."
      },
      {
        icon: "scan",
        title: "Bestellung und Discovery in einem Lauf",
        body: "Map, Suche, Business-Oeffnen, Menue, Warenkorb und Bestellung sind Teil des Release-Gates, damit du keine separaten Einzelpruefungen zusammensuchen musst."
      },
      {
        icon: "image",
        title: "Nachweise fuer echte Entscheidungen",
        body: "Der Lauf liefert dir Screenshots, Ablaufspuren und Problemstellen, so dass du vor dem Push nicht raten musst."
      }
    ]
  },
  "health-pack": {
    eyebrow: "3x taeglich",
    title: "Tageslauf",
    summary: "Der wiederkehrende Heart-Gesundheitscheck fuer Business, User, Gast und CEO. Genau dieser Lauf ist fuer regelmaessige automatische Pruefungen gedacht.",
    sections: [
      {
        icon: "clock",
        title: "Der feste Routine-Lauf",
        body: "Diesen Lauf kannst du mehrmals taeglich ausfuehren lassen, damit Heart regelmaessig bestaetigt, dass die Plattform fuer alle wichtigen Rollen noch sauber funktioniert."
      },
      {
        icon: "users",
        title: "Gesamtsicht statt Einzelsplitter",
        body: "Business, User, Gast und CEO werden nacheinander geprueft, damit du eine ehrliche Gesamtgesundheit der Plattform siehst und nicht nur einen Teilbereich."
      },
      {
        icon: "scan",
        title: "Kritische Kundenwege bleiben drin",
        body: "Discovery, Menue, Warenkorb, Bestellung, Social-Interaktion, Chat und die mobile Huelle bleiben Teil des Tageslaufs."
      },
      {
        icon: "triangle",
        title: "Nicht fuer den Innerloop",
        body: "Der Tageslauf ist bewusst groesser als der Aenderungs-Guard. Er ist fuer wiederkehrende Kontrolle gedacht, nicht fuer jeden kleinen lokalen Zwischenschritt."
      }
    ]
  },
  smoke: {
    eyebrow: "CEO Kontrolle",
    title: "CEO-Kontrolllauf",
    summary: "Heart prueft die wichtigsten CEO-Steuerflaechen, Navigation, Karte, Suche, Chat und das mobile Layout, ohne unnoetige Nebenpfade zu erzwingen.",
    sections: [
      {
        icon: "shield",
        title: "Nur CEO-Kernfunktionen",
        body: "Heart prueft Anmeldung, Feed, Profil, Business-Ansichten, Menue, Karte, Suche, Chat, wichtige Modals und die PWA-Huelle aus CEO-Sicht."
      },
      {
        icon: "scan",
        title: "Karte und Suche sind inbegriffen",
        body: "Heart oeffnet das konfigurierte Business ueber die Suche und ueber die Karte, damit Discovery und Oeffnen per Map mitgeprueft werden."
      },
      {
        icon: "image",
        title: "Klarer Kontrollnachweis",
        body: "Wenn etwas schiefgeht, siehst du im Lauf Screenshots, Ablaufspuren und eine klare Zusammenfassung statt technischem Rauschen."
      },
      {
        icon: "triangle",
        title: "Bewusst kein chaotischer Sammellauf",
        body: "Der CEO-Kontrolllauf ist bewusst schlank gehalten, damit er nur echte CEO-Probleme zeigt und nicht an fachfremden Nebenbereichen haengen bleibt."
      }
    ]
  },
  "business-pack": {
    eyebrow: "Business Rolle",
    title: "Business-Volltest",
    summary: "Heart prueft das Restaurant aus Betreiber-Sicht: Oberflaechen, Menue, Produkte, Social-Interaktionen, Chat, Karte, Suche und Layout.",
    sections: [
      {
        icon: "chart",
        title: "Restaurant und Menue im Fokus",
        body: "Heart oeffnet Menue und Focus, prueft Produktpfade und kontrolliert, ob das Restaurantprofil stabil und mobil sauber bleibt."
      },
      {
        icon: "user",
        title: "Business testet auch Social",
        body: "Follow, Likes, Kommentare und Chat werden gegen das feste Nutzer-Zielkonto geprueft, damit Business nicht nur seine eigenen Ansichten sieht."
      },
      {
        icon: "scan",
        title: "Karte und Suche sind Pflicht",
        body: "Heart oeffnet das Business auch ueber Suche und Karte, damit der Discovery-Weg und das Oeffnen eines Lokals per Map nicht vergessen werden."
      },
      {
        icon: "image",
        title: "Nachweise pro Hauptbereich",
        body: "Die Laufdetails zeigen spaeter klar, welche Business-, Social- und Discovery-Bereiche funktioniert haben und wo Heart etwas Auffaelliges gefunden hat."
      }
    ]
  },
  "user-pack": {
    eyebrow: "User Rolle",
    title: "User-Volltest",
    summary: "Heart prueft Feed, Profil, Foto-Posts, Likes, Kommentare, Follow, Chat, Karte, Suche und Bestellung aus echter Nutzer-Sicht.",
    sections: [
      {
        icon: "image",
        title: "Fotos und Social-Interaktionen",
        body: "Heart prueft Foto-Post, Like, Kommentar, Follow und Chat so, wie ein echter Nutzer die Social-Funktionen verwenden wuerde."
      },
      {
        icon: "scan",
        title: "Bestellung ist mit drin",
        body: "Der User-Lauf prueft nicht nur Social, sondern auch den Weg ins Menue, den Warenkorb und die Bestellung auf dem Zielrestaurant."
      },
      {
        icon: "scan",
        title: "Business ueber Karte oeffnen",
        body: "Auch im User-Lauf wird das Zielrestaurant ueber Suche und Karte geoeffnet, damit Discovery und Oeffnen per Map mitgeprueft werden."
      },
      {
        icon: "image",
        title: "UI bleibt mobil pruefbar",
        body: "Heart kontrolliert auf den Hauptansichten, dass nichts rechts aus dem Viewport ragt und die mobile Darstellung stabil bleibt."
      }
    ]
  },
  "guest-pack": {
    eyebrow: "Gast und QR",
    title: "Gast- / QR-Volltest",
    summary: "Heart prueft den oeffentlichen Restaurantweg ueber Karte, Suche, QR-Menue, Warenkorb, Checkout und Bestellung ohne eingeloggtes Konto.",
    sections: [
      {
        icon: "scan",
        title: "Gast findet das Lokal auch ueber Discovery",
        body: "Heart oeffnet das Zielrestaurant zuerst ueber Suche und Karte und prueft danach den oeffentlichen QR- und Menueweg."
      },
      {
        icon: "grid",
        title: "Mehr als nur Menue sichtbar",
        body: "Heart prueft Produktoeffnen, Hinzufuegen zum Warenkorb, Checkout und Bestellsignal, statt nur eine statische Menueansicht zu bestaetigen."
      },
      {
        icon: "shield",
        title: "Keine gesperrten Business-Elemente",
        body: "Der Gast-Lauf prueft auch, dass geschuetzte Business-Bedienelemente im oeffentlichen Restaurantweg nicht sichtbar sind."
      },
      {
        icon: "image",
        title: "Oeffentliche UI bleibt mobil sauber",
        body: "Heart kontrolliert auf Menue und Profil, dass der oeffentliche Gastweg ohne horizontales Ausbrechen und ohne kaputte Karten laeuft."
      }
    ]
  }
});

function getPackActions(quickActions = []) {
  const startActions = quickActions.filter((item) => item.action === "start-pack");
  return startActions.length ? startActions : FALLBACK_PACK_ACTIONS;
}

function getPackCards(quickActions = []) {
  return getPackActions(quickActions)
    .sort((left, right) => {
      const leftOrder = VISIBLE_PACK_ORDER[left.packKey || left.id] || 99;
      const rightOrder = VISIBLE_PACK_ORDER[right.packKey || right.id] || 99;
      return leftOrder - rightOrder;
    })
    .map((action) => {
    const pack = getHeartPack(action.packKey || action.id);
    return {
      key: pack.key,
      title: pack.title,
      label: action.label || pack.label,
      summary: action.note || pack.summary,
      level: pack.level,
      areas: Array.isArray(pack.areas) ? pack.areas : [],
      personas: Array.isArray(pack.personas) ? pack.personas : [],
      icon: START_CARD_ICON_BY_PACK[pack.key] || "activity"
    };
    });
}

function getSortedRuns(items = []) {
  return [...items].sort((left, right) => {
    const leftValue = String(left.startedAt || left.endedAt || "");
    const rightValue = String(right.startedAt || right.endedAt || "");
    return rightValue.localeCompare(leftValue);
  });
}

function getLatestActiveRun(items = []) {
  return getSortedRuns(items).find((item) => ACTIVE_STATUSES.has(String(item.status || "").toLowerCase())) || null;
}

function getLatestCompletedRun(items = []) {
  return getSortedRuns(items).find((item) => TERMINAL_STATUSES.has(String(item.status || "").toLowerCase())) || null;
}

function getRecentCompletedRuns(items = [], excludeRunId = "") {
  return getSortedRuns(items)
    .filter((item) => TERMINAL_STATUSES.has(String(item.status || "").toLowerCase()) && String(item.id || "") !== String(excludeRunId || ""))
    .slice(0, 5);
}

function getCurrentHistoryRuns(items = [], excludeRunId = "") {
  return getSortedRuns(items).filter((item) => (
    TERMINAL_STATUSES.has(String(item.status || "").toLowerCase())
    && item.archived !== true
    && String(item.id || "") !== String(excludeRunId || "")
  ));
}

function getArchivedRuns(items = []) {
  return getSortedRuns(items).filter((item) => TERMINAL_STATUSES.has(String(item.status || "").toLowerCase()) && item.archived === true);
}

function formatBuildValue(value = "") {
  const text = String(value || "").trim();
  return text ? text.slice(0, 7) : "-";
}

function isPreviewableArtifact(artifact = {}) {
  const url = String(artifact.url || artifact.previewUrl || "").trim();
  if (!/^https?:\/\//i.test(url)) return false;
  const kind = String(artifact.kind || "").trim().toLowerCase();
  const contentType = String(artifact.contentType || "").trim().toLowerCase();
  return kind === "screenshot"
    || contentType.startsWith("image/")
    || /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(url);
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
  const allPersonaEntries = Object.entries(detail.runFlags?.personas || {});
  const personaEntries = allPersonaEntries.filter(([key]) => key !== "guest");
  const configuredCount = personaEntries.filter(([, value]) => value?.configured).length;
  const guestEntry = allPersonaEntries.find(([key]) => key === "guest");
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
  return `
    <div class="heart-artifact-list">
      ${detail.artifacts.map((artifact) => `
        <article class="heart-artifact-card">
          ${isPreviewableArtifact(artifact) ? `
            <a class="heart-artifact-card__preview" href="${escapeHtml(artifact.url || artifact.previewUrl || "#")}" target="_blank" rel="noreferrer">
              <img src="${escapeHtml(artifact.previewUrl || artifact.url || "")}" alt="${escapeHtml(artifact.label || "Nachweis")}" loading="lazy" />
            </a>
          ` : `
            <div class="heart-artifact-card__preview heart-artifact-card__preview--icon">
              <span>${renderHeartIcon(artifact.kind === "trace" ? "clock" : artifact.kind === "json" ? "grid" : "image")}</span>
            </div>
          `}
          <div class="heart-artifact-card__body">
            <div class="heart-artifact-card__head">
              <span>
                <strong>${escapeHtml(artifact.label || "Datei")}</strong>
                <small>${escapeHtml(getArtifactKindLabel(artifact.kind, artifact.kind || "Datei"))}</small>
              </span>
              ${artifact.sizeLabel ? `<span class="heart-artifact-card__size">${escapeHtml(artifact.sizeLabel)}</span>` : ""}
            </div>
            <div class="heart-artifact-card__actions">
              <a class="heart-button heart-button--secondary" href="${escapeHtml(artifact.url || "#")}" target="_blank" rel="noreferrer">
                Oeffnen
              </a>
              ${artifact.deletable ? `
                <button class="heart-icon-square-button" data-action="delete-run-artifact" data-run-id="${escapeHtml(detail.id || "")}" data-artifact-id="${escapeHtml(artifact.id || "")}" aria-label="Nachweis loeschen">
                  ${renderHeartIcon("trash")}
                </button>
              ` : ""}
            </div>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function getRunInfoText(detail = {}) {
  const label = getPackLabel(detail.packKey, detail.packLabel, detail.mode);
  const passed = Math.max(0, Number(detail.passedChecks) || 0);
  const failed = Math.max(0, Number(detail.failedChecks) || 0);
  const artifacts = Array.isArray(detail.artifacts) ? detail.artifacts.length : 0;
  const cleanupSummary = String(detail.cleanup?.summary || "").trim();

  if (ACTIVE_STATUSES.has(String(detail.status || "").toLowerCase())) {
    return `Run laeuft gerade. Heart prueft ${label}, sammelt Nachweise und aktualisiert diesen Stand automatisch, sobald neue Schritte eintreffen.`;
  }
  if (String(detail.status || "").toLowerCase() === "success") {
    return `Run ist fertig. Heart hat ${label} abgeschlossen, ${passed} Punkte erfolgreich geprueft, ${failed} Probleme markiert und ${artifacts} Nachweise gesammelt.${cleanupSummary ? ` ${cleanupSummary}` : ""}`;
  }
  if (String(detail.status || "").toLowerCase() === "warning") {
    return `Run ist fertig. ${label} wurde abgeschlossen, aber Heart hat Hinweise gefunden. Schau in Ablauf, Nachweise und Fehlhinweise fuer den genauen Kontext.`;
  }
  return `Run ist fertig. ${label} wurde beendet und Heart zeigt dir hier klar, was geprueft, was gefunden und was eventuell noch eingerichtet werden muss.`;
}

function renderModalSection(icon, eyebrow, title, body) {
  return `
    <section class="heart-modal-section">
      <div class="heart-modal-section__head">
        <span class="heart-modal-section__icon">${renderHeartIcon(icon)}</span>
        <div>
          <p class="heart-eyebrow">${escapeHtml(eyebrow)}</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
      </div>
      ${body}
    </section>
  `;
}

function renderLaunchCard(runsState = {}, connections = [], quickActions = []) {
  const runnerConfigured = isGithubRunnerConfigured(connections);
  const disabledAttr = runsState.pendingAction || !runnerConfigured ? "disabled" : "";
  const cards = getPackCards(quickActions);
  const note = runnerConfigured
    ? "Heart kann sichere Laeufe starten. Waehle den passenden Run und lies dir bei Bedarf vorher genau durch, was geprueft wird."
    : `Runner noch nicht bereit. ${getGithubRunnerNote(connections)}`;

  return `
    <section class="heart-section heart-run-start-card">
      <div class="heart-run-start-card__bar">
        <div class="heart-run-start-card__title">
          <button class="heart-icon-square-button" data-action="toggle-run-launcher" aria-label="${runsState.launcherExpanded ? "Run-Auswahl schliessen" : "Run-Auswahl oeffnen"}">
            ${renderHeartIcon(runsState.launcherExpanded ? "x" : "plus")}
          </button>
          <div>
            <strong>Run Starten</strong>
            <p>${escapeHtml(runsState.pendingAction ? "Heart bereitet gerade einen Lauf vor." : "Waehle einen sicheren Heart-Lauf.")}</p>
          </div>
        </div>
        <button class="heart-icon-square-button" data-action="refresh-heart" aria-label="Status neu laden">
          ${renderHeartIcon("refresh")}
        </button>
      </div>
      ${runsState.launcherExpanded ? `
        <div class="heart-run-start-grid">
          ${cards.map((card) => `
            <article class="heart-run-option-card ${card.key === "guest-pack" ? "heart-run-option-card--accent" : ""}">
              <div class="heart-run-option-card__top">
                <span class="heart-run-option-card__icon">${renderHeartIcon(card.icon)}</span>
                <button class="heart-icon-button heart-icon-button--inline" data-action="open-run-guide" data-pack-key="${escapeHtml(card.key)}" aria-label="${escapeHtml(card.title)} erklaeren">
                  ${renderHeartIcon("info")}
                </button>
              </div>
              <div class="heart-run-option-card__body">
                <strong>${escapeHtml(card.title)}</strong>
                <p>${escapeHtml(card.summary)}</p>
              </div>
              <div class="heart-run-option-card__meta">
                <span>${escapeHtml(card.level.replace("level_", "Level "))}</span>
                <span>${escapeHtml(card.personas.map((persona) => getPersonaLabel(persona)).join(", "))}</span>
              </div>
              <button class="heart-button heart-button--secondary heart-button--wide" data-action="open-run-guide" data-pack-key="${escapeHtml(card.key)}" ${disabledAttr}>
                Info und Start
              </button>
            </article>
          `).join("")}
        </div>
      ` : ""}
      <p class="heart-section__note">${escapeHtml(note)}</p>
    </section>
  `;
}

function renderPreparingRunCard(runsState = {}) {
  if (!runsState.pendingAction) return "";
  return `
    <section class="heart-section heart-active-run-card heart-active-run-card--preparing">
      <div class="heart-active-run-card__head">
        <div>
          <p class="heart-eyebrow">Aktiver Run</p>
          <h2>Run wird vorbereitet</h2>
        </div>
        <span class="heart-active-run-card__time">Jetzt</span>
      </div>
      <div class="heart-active-run-card__center">
        <div class="heart-run-pulse" aria-hidden="true"></div>
        <strong>${escapeHtml(getPackLabel(runsState.pendingAction))}</strong>
        <p>Heart uebergibt den Lauf an den sicheren Runner und laedt den ersten Status automatisch nach.</p>
      </div>
    </section>
  `;
}

function renderActiveRunCard(activeRun = null) {
  if (!activeRun) return "";
  return `
    <section class="heart-section heart-active-run-card">
      <div class="heart-active-run-card__head">
        <div>
          <p class="heart-eyebrow">Aktiver Run</p>
          <h2>${escapeHtml(getPackLabel(activeRun.packKey, activeRun.packLabel, activeRun.mode))}</h2>
        </div>
        <span class="heart-active-run-card__time">${escapeHtml(activeRun.startedAt ? formatRelative(activeRun.startedAt) : "Jetzt")}</span>
      </div>
      <div class="heart-active-run-card__center">
        <div class="heart-run-pulse" aria-hidden="true"></div>
        ${renderStatusBadge(activeRun.status || "running")}
        <strong>${escapeHtml(activeRun.currentStep || "Heart arbeitet gerade am Lauf.")}</strong>
        <p>${escapeHtml(activeRun.summary || "Heart sammelt Status, Nachweise und Bereichsergebnisse.")}</p>
      </div>
    </section>
  `;
}

function renderLatestResultCard(resultRun = null) {
  if (!resultRun) {
    return renderEmptyState({
      title: "Noch kein fertiger Run.",
      message: "Sobald ein Lauf beendet ist, erscheint hier die kompakte Auswertung mit direktem Detailzugriff."
    });
  }
  return `
    <section class="heart-section heart-run-result-card">
      <div class="heart-run-result-card__head">
        <div>
          <p class="heart-eyebrow">Run Details</p>
          <h2>${escapeHtml(getPackLabel(resultRun.packKey, resultRun.packLabel, resultRun.mode))}</h2>
        </div>
        ${renderStatusBadge(resultRun.status || "idle")}
      </div>
      <p class="heart-run-result-card__summary">${escapeHtml(resultRun.summary || "Keine Zusammenfassung vorhanden.")}</p>
      <div class="heart-run-result-card__meta">
        <span>${escapeHtml(resultRun.endedAt ? formatDateTime(resultRun.endedAt) : resultRun.startedAt ? formatDateTime(resultRun.startedAt) : "-")}</span>
        <span>${escapeHtml(formatDuration(resultRun.durationMs || 0))}</span>
      </div>
      <button class="heart-button heart-button--secondary" data-action="open-run-detail" data-run-id="${escapeHtml(resultRun.id)}">
        Details
      </button>
    </section>
  `;
}

function renderHistoryCards(runsState = {}, items = [], archivedItems = []) {
  const tab = String(runsState.historyTab || "current");
  const editMode = runsState.historyEditMode === true;
  const selectedIds = new Set(Array.isArray(runsState.historySelectedRunIds) ? runsState.historySelectedRunIds : []);
  const visibleItems = tab === "archived" ? archivedItems : items;
  const hasSelection = selectedIds.size > 0;
  const archiveTarget = tab === "archived" ? "current" : "archived";
  const archiveLabel = tab === "archived" ? "Nach Aktuell verschieben" : "Archivieren";

  if (!items.length && !archivedItems.length) return "";
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Weitere Laeufe</p>
          <h2>Verlauf</h2>
        </div>
        <div class="heart-run-history__head-actions">
          <div class="heart-run-history__tabs">
            <button class="heart-segmented-button ${tab === "current" ? "heart-segmented-button--active" : ""}" data-action="set-runs-history-tab" data-history-tab="current">
              Aktuell
            </button>
            <button class="heart-segmented-button ${tab === "archived" ? "heart-segmented-button--active" : ""}" data-action="set-runs-history-tab" data-history-tab="archived">
              Archiviert
            </button>
          </div>
          <button class="heart-icon-square-button" data-action="toggle-runs-history-edit" aria-label="${editMode ? "Bearbeiten beenden" : "Verlauf bearbeiten"}">
            ${renderHeartIcon(editMode ? "x" : "edit")}
          </button>
        </div>
      </div>
      ${editMode ? `
        <div class="heart-run-history__bulkbar">
          <span>${hasSelection ? `${selectedIds.size} Lauf/Laeufe ausgewaehlt` : "Waehle Laeufe aus."}</span>
          <button class="heart-button heart-button--secondary" data-action="update-run-archive" data-archive-state="${archiveTarget}" ${hasSelection ? "" : "disabled"}>
            ${escapeHtml(archiveLabel)}
          </button>
        </div>
      ` : ""}
      <div class="heart-list-stack">
        ${visibleItems.length ? visibleItems.map((item) => `
          <article class="heart-list-card heart-list-card--action ${editMode && selectedIds.has(item.id) ? "heart-list-card--selected" : ""}">
            <div class="heart-list-card__head">
              <div>
                <strong>${escapeHtml(getPackLabel(item.packKey, item.packLabel, item.mode))}</strong>
                <p>${escapeHtml(item.summary || "Keine Zusammenfassung vorhanden.")}</p>
              </div>
              ${renderStatusBadge(item.status || "idle")}
            </div>
            <div class="heart-list-card__meta">
              <span>${escapeHtml(item.startedAt ? formatRelative(item.startedAt) : "-")}</span>
              <span>${escapeHtml(formatDuration(item.durationMs || 0))}</span>
            </div>
            <div class="heart-run-history__card-actions">
              ${editMode ? `
                <button class="heart-button heart-button--secondary" data-action="toggle-runs-history-selection" data-run-id="${escapeHtml(item.id)}">
                  ${selectedIds.has(item.id) ? "Abwaehlen" : "Auswaehlen"}
                </button>
              ` : ""}
              <button class="heart-button heart-button--secondary" data-action="open-run-detail" data-run-id="${escapeHtml(item.id)}">
                Details
              </button>
            </div>
          </article>
        `).join("") : renderEmptyState({
          title: tab === "archived" ? "Noch nichts archiviert." : "Noch keine aktuellen Laeufe.",
          message: tab === "archived"
            ? "Archivierte Laeufe erscheinen hier, sobald du sie aus dem Verlauf verschiebst."
            : "Sobald ein weiterer Run fertig ist, erscheint er hier."
        })}
      </div>
    </section>
  `;
}

function renderRunGuideModal(packKey = "", runsState = {}) {
  const pack = getHeartPack(packKey);
  const guide = GUIDE_CONTENT[pack.key] || {
    eyebrow: "Run Info",
    title: pack.title,
    summary: pack.summary,
    sections: [
      {
        icon: "users",
        title: "Rollen in diesem Run",
        body: pack.personas.length
          ? `${pack.personas.map((persona) => getPersonaLabel(persona)).join(", ")} werden in diesem Lauf geprueft.`
          : "Heart prueft in diesem Lauf die fuer das Paket hinterlegten Rollen."
      },
      {
        icon: "grid",
        title: "Bereiche in diesem Run",
        body: pack.areas.length
          ? `${pack.areas.map((area) => getModuleLabel(area, area)).join(", ")} werden Schritt fuer Schritt geprueft.`
          : "Heart prueft die fuer dieses Paket hinterlegten Oberflaechen und Kernwege."
      },
      {
        icon: "image",
        title: "Was du danach siehst",
        body: "Nach dem Lauf bekommst du Status, Dauer, gepruefte Punkte, Nachweise und klare Hinweise fuer noch fehlende Einrichtung."
      },
      {
        icon: "triangle",
        title: "Worauf Heart ehrlich hinweist",
        body: "Fehlende Konten, Links oder Selektoren werden nicht verborgen, sondern offen als Einrichtung fehlt, Geschuetzt oder Uebersprungen angezeigt."
      }
    ]
  };
  const loading = String(runsState.pendingAction || "") === pack.key;
  return `
    <div class="heart-modal">
      <button class="heart-modal__backdrop" data-action="close-modal" aria-label="Modal schliessen"></button>
      <div class="heart-modal__sheet heart-modal__sheet--guide" role="dialog" aria-modal="true" aria-labelledby="heartRunGuideTitle">
        <div class="heart-modal__header">
          <div>
            <p class="heart-eyebrow">${escapeHtml(guide.eyebrow)}</p>
            <h2 id="heartRunGuideTitle">${escapeHtml(guide.title)}</h2>
          </div>
          <button class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
        </div>
        <p class="heart-modal__lead">${escapeHtml(guide.summary || pack.summary)}</p>
        <div class="heart-run-guide-grid">
          ${guide.sections.map((section) => `
            <article class="heart-run-guide-card">
              <span class="heart-run-guide-card__icon">${renderHeartIcon(section.icon)}</span>
              <strong>${escapeHtml(section.title)}</strong>
              <p>${escapeHtml(section.body)}</p>
            </article>
          `).join("")}
        </div>
        ${renderModalSection("users", "Rollen", "Diese Rollen sind inbegriffen", `
          <div class="heart-chip-row">
            ${pack.personas.map((persona) => `<span class="heart-chip">${escapeHtml(getPersonaLabel(persona))}</span>`).join("")}
          </div>
        `)}
        ${renderModalSection("grid", "Bereiche", "Was Heart in diesem Run anfasst", `
          <div class="heart-chip-row">
            ${pack.areas.map((area) => `<span class="heart-chip">${escapeHtml(getModuleLabel(area, area))}</span>`).join("")}
          </div>
        `)}
        ${renderModalSection("triangle", "Wichtig", "Bevor du startest", `
          <div class="heart-note-grid heart-note-grid--compact">
            <article class="heart-note-card">
              <strong>Einrichtung muss ehrlich sein</strong>
              <p>Fehlende Konten, QR-Links oder Selektoren werden nicht gruen gefaerbt, sondern klar als fehlend oder geschuetzt markiert.</p>
            </article>
            <article class="heart-note-card">
              <strong>Nachweise bleiben sichtbar</strong>
              <p>Screenshots, Ablaufspuren und Berichte bleiben im Laufdetail sichtbar. Loeschbare Nachweise kannst du spaeter direkt aus Heart entfernen.</p>
            </article>
          </div>
        `)}
        <div class="heart-modal__footer">
          <button class="heart-button heart-button--primary heart-button--wide" data-action="start-pack-from-guide" data-pack-key="${escapeHtml(pack.key)}" ${loading ? "disabled" : ""}>
            ${loading ? "Startet..." : "Run starten"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderRunDetailModal(runsState = {}) {
  if (runsState.detailStatus === "loading") {
    return `
      <div class="heart-modal">
        <button class="heart-modal__backdrop" data-action="close-modal" aria-label="Modal schliessen"></button>
        <div class="heart-modal__sheet" role="dialog" aria-modal="true">
          <div class="heart-modal__header">
            <div><p class="heart-eyebrow">Run Details</p><h2>Laufdetails werden geladen</h2></div>
            <button class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
          </div>
          <div class="heart-loading-block">Heart laedt die kompletten Laufdetails...</div>
        </div>
      </div>
    `;
  }

  if (runsState.detailStatus === "error") {
    return `
      <div class="heart-modal">
        <button class="heart-modal__backdrop" data-action="close-modal" aria-label="Modal schliessen"></button>
        <div class="heart-modal__sheet" role="dialog" aria-modal="true">
          <div class="heart-modal__header">
            <div><p class="heart-eyebrow">Run Details</p><h2>Details konnten nicht geladen werden</h2></div>
            <button class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
          </div>
          <div class="heart-error-block">${escapeHtml(runsState.detailError || "Laufdetails konnten nicht geladen werden.")}</div>
        </div>
      </div>
    `;
  }

  const detail = runsState.detail;
  if (!detail) return "";

  return `
    <div class="heart-modal">
      <button class="heart-modal__backdrop" data-action="close-modal" aria-label="Modal schliessen"></button>
      <div class="heart-modal__sheet heart-modal__sheet--detail" role="dialog" aria-modal="true" aria-labelledby="heartRunDetailTitle">
        <div class="heart-modal__header">
          <div>
            <p class="heart-eyebrow">Run Details</p>
            <h2 id="heartRunDetailTitle">${escapeHtml(getPackLabel(detail.packKey, detail.packLabel, detail.mode))}</h2>
          </div>
          <div class="heart-modal__header-actions">
            <button class="heart-icon-button heart-icon-button--ghost" data-action="delete-run-artifacts" data-run-id="${escapeHtml(detail.id || "")}" ${detail.artifacts?.some((artifact) => artifact.deletable) ? "" : "disabled"} title="Nachweise dieses Runs loeschen" aria-label="Nachweise dieses Runs loeschen">
              ${renderHeartIcon("trash")}
            </button>
            <button class="heart-icon-button" data-action="close-modal" aria-label="Modal schliessen">${renderHeartIcon("x")}</button>
          </div>
        </div>
        <p class="heart-modal__lead">${escapeHtml(getRunInfoText(detail))}</p>
        <div class="heart-run-detail-top">
          <div class="heart-run-detail-top__status">
            ${renderStatusBadge(detail.status || "idle")}
            <span>${escapeHtml(detail.endedAt ? formatDateTime(detail.endedAt) : detail.startedAt ? formatDateTime(detail.startedAt) : "-")}</span>
          </div>
          <div class="heart-run-score-grid">
            <div class="heart-run-score-card">
              <span>OK</span>
              <strong class="heart-run-score-card__value heart-run-score-card__value--success">${escapeHtml(String(detail.passedChecks || 0))}</strong>
            </div>
            <div class="heart-run-score-card">
              <span>Probleme</span>
              <strong class="heart-run-score-card__value heart-run-score-card__value--danger">${escapeHtml(String(detail.failedChecks || 0))}</strong>
            </div>
          </div>
        </div>
        <div class="heart-run-detail-facts">
          <div><span>Run</span><strong>${escapeHtml(getPackLabel(detail.packKey, detail.packLabel, detail.mode))}</strong></div>
          <div><span>Stufe</span><strong>${escapeHtml(detail.packLevel || "-")}</strong></div>
          <div><span>Status</span><strong>${escapeHtml(detail.status || "idle")}</strong></div>
          <div><span>Datum und Uhrzeit</span><strong>${escapeHtml(detail.startedAt ? formatDateTime(detail.startedAt) : "-")}</strong></div>
          <div><span>Dauer</span><strong>${escapeHtml(formatDuration(detail.durationMs || 0))}</strong></div>
          <div><span>Build</span><strong>${escapeHtml(formatBuildValue(detail.build || detail.branch || ""))}</strong></div>
        </div>
        <div class="heart-run-detail-overview">
          <article class="heart-run-overview-card">
            <span class="heart-run-overview-card__icon">${renderHeartIcon("grid")}</span>
            <strong>Bereiche</strong>
            <p>${escapeHtml(`${detail.modules?.length || 0} Bereiche mit Ergebnis`)}</p>
          </article>
          <article class="heart-run-overview-card">
            <span class="heart-run-overview-card__icon">${renderHeartIcon("users")}</span>
            <strong>Rollen</strong>
            <p>${escapeHtml(detail.personas?.map((persona) => getPersonaLabel(persona)).join(", ") || "Keine Rolle")}</p>
          </article>
          <article class="heart-run-overview-card">
            <span class="heart-run-overview-card__icon">${renderHeartIcon("image")}</span>
            <strong>Nachweise</strong>
            <p>${escapeHtml(`${detail.artifacts?.length || 0} Dateien`)}</p>
          </article>
          <article class="heart-run-overview-card">
            <span class="heart-run-overview-card__icon">${renderHeartIcon("broom")}</span>
            <strong>Aufraeumen</strong>
            <p>${escapeHtml(detail.cleanup?.summary || "Keine Aufraeuminfo")}</p>
          </article>
        </div>
        <button class="heart-button heart-button--secondary heart-button--wide" data-action="toggle-run-detail-more" aria-expanded="${runsState.detailExpanded ? "true" : "false"}">
          ${runsState.detailExpanded ? "Weniger zeigen" : "Mehr laden"}
        </button>
        ${runsState.detailExpanded ? `
          <div class="heart-view-stack heart-run-detail-expanded">
            ${renderModalSection("activity", "Bereiche", "Was geprueft wurde", renderAreaResults(detail))}
            ${renderModalSection("clock", "Ablauf", "Schritt fuer Schritt", renderTimeline(detail))}
            ${renderModalSection("bot", "Erstellte Daten", "Was Heart angelegt hat", renderCreatedEntities(detail))}
            ${renderModalSection("broom", "Aufgeraumt", "Was Heart wieder entfernt hat", `
              <div class="heart-cleanup-box">
                <div class="heart-cleanup-box__head">
                  ${renderStatusBadge(detail.cleanup?.status || "idle")}
                  <strong>${escapeHtml(detail.cleanup?.summary || "Keine Aufraeuminformation vorhanden.")}</strong>
                </div>
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
                `).join("")}</div>` : `<p class="heart-section__note">Noch keine einzelnen Aufraeumschritte protokolliert.</p>`}
              </div>
            `)}
            ${renderModalSection("image", "Nachweise", "Beweisbilder und Dateien", renderArtifacts(detail))}
            ${renderModalSection("triangle", "Wichtige Fehlhinweise", "Was auffaellig war", detail.failureDetails?.length ? `
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
            ` : renderEmptyState({ title: "Keine Problem-Details.", message: "Wenn ein Lauf sauber durchgeht, bleibt dieser Bereich leer." }))}
            ${renderModalSection("shield", "Setup", "Wie gut dieser Run vorbereitet war", `
              ${renderRunSetupSummary(detail)}
              <div class="heart-run-breakdown-box">${renderStatusBreakdown(detail)}</div>
            `)}
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

export function getRunsHeaderState(runsState = {}) {
  const items = Array.isArray(runsState.items) ? runsState.items : [];
  const reference = runsState.detail || getLatestActiveRun(items) || items[0] || null;
  return {
    title: "RUN",
    status: reference?.status || "idle"
  };
}

export function renderRunsView(runsState = {}, connections = [], quickActions = []) {
  const items = Array.isArray(runsState.items) ? runsState.items : [];
  const activeRun = getLatestActiveRun(items);
  const latestResult = getLatestCompletedRun(items);
  const history = getCurrentHistoryRuns(items, latestResult?.id);
  const archived = getArchivedRuns(items);

  if (runsState.status === "loading" && !items.length) {
    return `<div class="heart-loading-block">Laeufe werden geladen...</div>`;
  }
  if (runsState.status === "error" && !items.length) {
    return `<div class="heart-error-block">${escapeHtml(runsState.error || "Laeufe konnten nicht geladen werden.")}</div>`;
  }

  return `
    <div class="heart-view-stack heart-runs-view">
      ${renderLaunchCard(runsState, connections, quickActions)}
      ${activeRun ? renderActiveRunCard(activeRun) : renderPreparingRunCard(runsState)}
      ${renderLatestResultCard(latestResult)}
      ${renderHistoryCards(runsState, history, archived)}
    </div>
  `;
}

export function renderRunsModal(runsState = {}, modal = {}) {
  const kind = String(modal.kind || "").trim();
  if (kind === "run-guide") {
    return renderRunGuideModal(modal.packKey || "smoke", runsState);
  }
  if (kind === "run-detail") {
    return renderRunDetailModal(runsState);
  }
  return "";
}
