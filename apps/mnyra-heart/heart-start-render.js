// Die Startseite. Oben ein Satz mit dem Namen, darunter das Profilbild, dann
// die drei Wege, die man von hier aus taeglich geht, und darunter, was seither
// passiert ist.
//
// Sie holt selbst nichts nach: Was hier steht, kommt aus Landing-Sitzungen,
// Leads und Kunden, die ohnehin geladen werden. Deshalb ist Start sofort da.

import { renderHeartIcon } from "./heart-icons.js";
import { escapeHtml } from "./heart-ui-utils.js";
import {
  buildHeartNewsFeedCore,
  formatHeartNewsTimeCore,
  getHeartDisplayNameCore,
  getHeartFirstNameCore,
  pickHeartMotivationCore
} from "./heart-start-core.js";

const QUICK_TILES = Object.freeze([
  { viewKey: "crmLeads", label: "Leads", icon: "list" },
  { viewKey: "landing", label: "Landing", icon: "image" },
  { viewKey: "crmCustomers", label: "Kunden", icon: "users" }
]);

const NEWS_ICONS = Object.freeze({
  landing: "image",
  lead: "list",
  customer: "users"
});

function getProfilePhotoUrl(auth = {}) {
  const candidates = [
    auth.user?.photoURL,
    auth.profile?.photoURL,
    auth.profile?.avatar,
    auth.profile?.avatarUrl,
    auth.profile?.image,
    auth.profile?.imageUrl,
    auth.profile?.profileImage,
    auth.profile?.profileImageUrl
  ];
  return candidates.map((value) => String(value || "").trim()).find(Boolean) || "";
}

export function getHeartProfileInitials(name = "") {
  const parts = String(name || "").trim().split(/[\s._-]+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "M";
}

function renderAvatar(auth = {}, fullName = "") {
  const photoUrl = getProfilePhotoUrl(auth);
  return `
    <span class="heart-start__avatar">
      ${photoUrl
    ? `<img src="${escapeHtml(photoUrl)}" alt="" decoding="async" fetchpriority="high" />`
    : `<span class="heart-start__avatar-initials">${escapeHtml(getHeartProfileInitials(fullName))}</span>`}
    </span>
  `;
}

// Die Zahl auf der Kachel ist das, was Heart schon weiss. Weiss es noch nichts,
// steht dort ein Strich und keine 0 - eine 0 waere eine Behauptung.
function renderQuickTiles(counts = {}) {
  return `
    <div class="heart-start__quick">
      ${QUICK_TILES.map((tile) => {
    const count = counts[tile.viewKey];
    const value = Number.isFinite(Number(count)) ? String(count) : "–";
    return `
          <button type="button" class="heart-start__tile" data-nav-key="${escapeHtml(tile.viewKey)}">
            <span class="heart-start__tile-icon">${renderHeartIcon(tile.icon)}</span>
            <span class="heart-start__tile-value">${escapeHtml(value)}</span>
            <span class="heart-start__tile-label">${escapeHtml(tile.label)}</span>
          </button>
        `;
  }).join("")}
    </div>
  `;
}

function renderNewsRow(entry, now) {
  const time = formatHeartNewsTimeCore(entry.at, now);
  return `
    <button type="button"
      class="heart-start__news-row${entry.highlight ? " heart-start__news-row--yes" : ""}"
      data-action="open-start-news"
      data-nav-key="${escapeHtml(entry.viewKey)}"
      ${entry.landingId ? `data-landing-id="${escapeHtml(entry.landingId)}"` : ""}>
      <span class="heart-start__news-icon">${renderHeartIcon(NEWS_ICONS[entry.kind] || "activity")}</span>
      <span class="heart-start__news-body">
        <span class="heart-start__news-title">${escapeHtml(entry.title)}</span>
        <span class="heart-start__news-detail">${escapeHtml([entry.detail, entry.note].filter(Boolean).join(" · "))}</span>
      </span>
      ${time ? `<span class="heart-start__news-time">${escapeHtml(time)}</span>` : ""}
    </button>
  `;
}

function renderNewsSkeleton() {
  return `
    <div class="heart-start__news-list" aria-hidden="true">
      ${[0, 1, 2].map(() => `
        <span class="heart-start__news-row heart-start__news-row--skeleton">
          <span class="heart-start__news-icon"></span>
          <span class="heart-start__news-body">
            <span class="heart-start__skeleton heart-start__skeleton--title"></span>
            <span class="heart-start__skeleton heart-start__skeleton--detail"></span>
          </span>
        </span>
      `).join("")}
    </div>
  `;
}

function renderNews({ entries, isLoading, error, now }) {
  if (error) {
    return `<div class="heart-start__news-empty">${escapeHtml(error)}</div>`;
  }
  if (!entries.length) {
    return isLoading
      ? renderNewsSkeleton()
      : `<div class="heart-start__news-empty">Noch nichts Neues. Sobald jemand eine Landing oeffnet oder ein Lead dazukommt, steht es hier.</div>`;
  }
  return `
    <div class="heart-start__news-list">
      ${entries.map((entry) => renderNewsRow(entry, now)).join("")}
    </div>
  `;
}

export function renderHeartStartView({
  auth = {},
  landing = {},
  crmAdmin = {},
  now = Date.now()
} = {}) {
  const fullName = getHeartDisplayNameCore(auth.profile, auth.user);
  const firstName = getHeartFirstNameCore(auth.profile, auth.user);
  const motivation = pickHeartMotivationCore({ name: firstName, now });
  const leadsSection = crmAdmin.sections?.leads || {};
  const customersSection = crmAdmin.sections?.customers || {};
  const sessions = Array.isArray(landing.sessions) ? landing.sessions : [];

  const entries = buildHeartNewsFeedCore({
    landingSessions: sessions,
    archivedLandingIds: landing.archived || [],
    leads: leadsSection.items || [],
    customers: customersSection.items || [],
    now
  });

  const isLoading = landing.status === "loading" || leadsSection.status === "loading";

  return `
    <div class="heart-start">
      <p class="heart-start__motivation">${escapeHtml(motivation.text)}</p>

      <div class="heart-start__profile">
        ${renderAvatar(auth, fullName)}
        <span class="heart-start__identity">
          <strong>${escapeHtml(fullName || "Heart")}</strong>
          ${auth.user?.email ? `<span>${escapeHtml(auth.user.email)}</span>` : ""}
        </span>
      </div>

      ${renderQuickTiles({
    crmLeads: Number.isFinite(Number(leadsSection.knownCount)) && leadsSection.status === "ready"
      ? Number(leadsSection.knownCount)
      : null,
    landing: landing.status === "ready" ? sessions.length : null,
    crmCustomers: Number.isFinite(Number(customersSection.knownCount)) && customersSection.status === "ready"
      ? Number(customersSection.knownCount)
      : null
  })}

      <section class="heart-start__news">
        <p class="heart-start__news-head">Was gibt es Neues</p>
        ${renderNews({ entries, isLoading, error: landing.error || "", now })}
      </section>
    </div>
  `;
}
