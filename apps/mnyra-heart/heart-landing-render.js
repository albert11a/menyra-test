// Der Landing-Bereich in Heart: erst die Liste aller Landings, nach dem
// Antippen die Auswertung einer einzelnen.
//
// Die Auswertung beantwortet drei Fragen, in dieser Reihenfolge:
// 1. Wie viele haben es geoeffnet, und wie viele bis zum Ende?
// 2. Wo springen sie ab? - dafuer steht bei jedem Wisch, wie viele ihn noch
//    gesehen haben; ein Balken macht den Absturz sichtbar, wo Zahlen ihn nur
//    aufschreiben.
// 3. Was haben sie geantwortet?

import { escapeHtml } from "./heart-ui-utils.js";
import { renderHeartIcon } from "./heart-icons.js";

// Die Reihenfolge der Wische, wie sie auf der Seite vorkommen. Sie steht hier,
// weil die Auswertung sonst alphabetisch sortieren muesste - und "cmimi" kaeme
// vor "hyrje", obwohl es am Ende steht.
//
// Die Schluessel muessen genau die sein, die die Landing mitschickt (dort die
// data-track-Marken). Kommt auf der Landing ein Bildschirm dazu und hier
// nicht, faellt er aus der Auswertung heraus, ohne dass etwas kaputtgeht -
// die Zahlen waeren dann still falsch. Deshalb wird die Liste exportiert und
// von tests/heart-landing-step-contract.test.mjs gegen die echte Landing
// gehalten.
export const STEP_ORDER = [
  { key: "hyrje", label: "Fillimi" },
  { key: "profil-0", label: "Profili" },
  { key: "profil-1", label: "Postimet" },
  { key: "profil-2", label: "Sot ne fokus" },
  { key: "profil-3", label: "Menyja" },
  { key: "profil-4", label: "Pyetja" },
  { key: "pamja-1", label: "Fillimi" },
  { key: "pamja-2", label: "Feed-i" },
  { key: "pamja-3", label: "Lista" },
  { key: "pamja-4", label: "Harta" },
  { key: "pamja-5", label: "Menyja" },
  { key: "pamja-6", label: "Ofertat" },
  { key: "pamja-7", label: "Ne tavoline" },
  { key: "cmimi", label: "Cmimi" },
  { key: "si-funksionon", label: "Si funksionon" },
  { key: "pyetjet", label: "Pyetjet" }
];

const QUESTIONS = [
  { key: "q1", label: "Ju pelqen Mnyra?" },
  { key: "q2", label: "Pjese e Mnyres per 15.90 EUR?" },
  { key: "q3", label: "Test nje muaj falas?" }
];

function seconds(ms) {
  const value = Number(ms) || 0;
  if (value < 1000) return "0s";
  if (value < 60000) return `${Math.round(value / 1000)}s`;
  const min = Math.floor(value / 60000);
  return `${min}m ${Math.round((value % 60000) / 1000)}s`;
}

function relativeDay(iso) {
  const text = typeof iso === "string" ? iso.trim() : "";
  if (!text) return "";
  const then = new Date(text);
  if (!Number.isFinite(then.getTime())) return "";
  const days = Math.floor((Date.now() - then.getTime()) / 86400000);
  if (days <= 0) return "heute";
  if (days === 1) return "gestern";
  if (days < 30) return `vor ${days} Tagen`;
  return then.toLocaleDateString("de-DE");
}

// Die ersten Buchstaben des Namens, wenn es kein Bild gibt. Zwei reichen -
// mehr wird in dem kleinen Kreis ohnehin nur eng.
function initials(name = "") {
  const parts = String(name || "").trim().split(/[\s._-]+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0].toUpperCase()).join("") || "M";
}

// Das Profilbild des Lokals, links in der Karte. Ohne Bild stehen dort die
// Anfangsbuchstaben - eine leere Flaeche waere ein Loch in der Reihe.
function renderAvatar(entry = {}) {
  const url = String(entry.logoUrl || "").trim();
  return `
    <span class="heart-landing-card__avatar" aria-hidden="true">
      ${url
    ? `<img src="${escapeHtml(url)}" alt="" loading="lazy" decoding="async" />`
    : `<span>${escapeHtml(initials(entry.name))}</span>`}
    </span>
  `;
}

// Aus den Sitzungen eines Lokals wird eine Zeile fuer die Liste.
function summarize(sessions) {
  const total = sessions.length;
  const finished = sessions.filter((session) => session.outcome).length;
  const yes = sessions.filter((session) => session.outcome === "yes").length;
  const answered = sessions.filter((session) => session.answers.q1).length;
  const last = sessions.reduce((newest, session) => (
    session.updatedAt > newest ? session.updatedAt : newest
  ), "");
  return { total, finished, yes, answered, last };
}

export function groupLandings(sessions = []) {
  const byRestaurant = new Map();
  sessions.forEach((session) => {
    if (!session.restaurantId) return;
    const list = byRestaurant.get(session.restaurantId) || [];
    list.push(session);
    byRestaurant.set(session.restaurantId, list);
  });

  return Array.from(byRestaurant.entries())
    .map(([restaurantId, list]) => ({
      restaurantId,
      name: list[0].name || restaurantId,
      city: list[0].city || "",
      publicSlug: list[0].publicSlug || "",
      logoUrl: (list.find((session) => session.logoUrl) || {}).logoUrl || "",
      sessions: list.slice().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))),
      ...summarize(list)
    }))
    .sort((a, b) => String(b.last).localeCompare(String(a.last)));
}

function renderTabs(tab, aktiv, abgelegt) {
  const reiter = [
    { key: "active", label: "Aktiv", count: aktiv },
    { key: "archived", label: "Archiviert", count: abgelegt }
  ];
  return `
    <div class="heart-landing-tabs" role="tablist">
      ${reiter.map((eintrag) => `
        <button type="button" role="tab"
          class="heart-landing-tab${tab === eintrag.key ? " is-active" : ""}"
          aria-selected="${tab === eintrag.key ? "true" : "false"}"
          data-action="set-landing-tab" data-landing-tab="${eintrag.key}">
          ${escapeHtml(eintrag.label)} <span class="heart-landing-tab__count">${eintrag.count}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderList(landings, tab) {
  if (!landings.length) {
    return `
      <div class="heart-empty-block">
        ${tab === "archived"
    ? "Hier ist nichts abgelegt. Was Sie nicht mehr brauchen, legen Sie mit &bdquo;Ablegen&ldquo; hierher."
    : "Noch keine Aufrufe. Sobald jemand eine Landing oeffnet, steht sie hier."}
      </div>
    `;
  }

  // Die ganze Karte ist ein einziger Knopf. Vorher steckte darin noch das
  // Ablegen, also ein Knopf im Knopf - das ist jetzt weg und wandert in die
  // Auswertung, wo man ohnehin nachsieht, bevor man etwas weglegt.
  return `
    <div class="heart-landing-list">
      ${landings.map((entry) => `
        <button type="button" class="heart-landing-card" data-action="open-landing" data-landing-id="${escapeHtml(entry.restaurantId)}">
          <span class="heart-landing-card__head">
            ${renderAvatar(entry)}
            <span class="heart-landing-card__title">
              <span class="heart-landing-card__name">${escapeHtml(entry.name)}</span>
              <span class="heart-landing-card__meta">${escapeHtml(entry.city || entry.publicSlug || "")} &middot; ${escapeHtml(relativeDay(entry.last))}</span>
            </span>
          </span>
          <span class="heart-landing-card__stats">
            <span class="heart-landing-card__stat"><b>${entry.total}</b><small>Besucht</small></span>
            <span class="heart-landing-card__stat"><b>${entry.answered}</b><small>Fragen</small></span>
            <span class="heart-landing-card__stat heart-landing-card__stat--yes"><b>${entry.yes}</b><small>Kunde?</small></span>
          </span>
        </button>
      `).join("")}
    </div>
  `;
}

// Wie viele haben diesen Wisch noch gesehen, und wie lange im Schnitt.
function stepRows(sessions) {
  const total = sessions.length || 1;
  return STEP_ORDER.map((step) => {
    const seen = sessions.filter((session) => step.key in session.steps);
    const sum = seen.reduce((acc, session) => acc + (session.steps[step.key] || 0), 0);
    return {
      ...step,
      seen: seen.length,
      share: Math.round((seen.length / total) * 100),
      average: seen.length ? Math.round(sum / seen.length) : 0
    };
  });
}

function renderSteps(sessions) {
  const rows = stepRows(sessions);
  return `
    <div class="heart-landing-steps">
      ${rows.map((row) => `
        <div class="heart-landing-step">
          <span class="heart-landing-step__label">${escapeHtml(row.label)}</span>
          <span class="heart-landing-step__bar">
            <span class="heart-landing-step__fill" style="width:${row.share}%"></span>
          </span>
          <span class="heart-landing-step__value">${row.seen} &middot; ${escapeHtml(seconds(row.average))}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAnswers(sessions) {
  return `
    <div class="heart-landing-answers">
      ${QUESTIONS.map((question) => {
    const po = sessions.filter((session) => session.answers[question.key] === "po").length;
    const jo = sessions.filter((session) => session.answers[question.key] === "jo").length;
    return `
          <div class="heart-landing-answer">
            <span class="heart-landing-answer__label">${escapeHtml(question.label)}</span>
            <span class="heart-landing-answer__counts">
              <b class="heart-landing-answer__po">${po} po</b>
              <b class="heart-landing-answer__jo">${jo} jo</b>
            </span>
          </div>
        `;
  }).join("")}
    </div>
  `;
}

function renderSessions(sessions) {
  return `
    <div class="heart-landing-sessions">
      ${sessions.slice(0, 40).map((session) => {
    const answered = QUESTIONS
      .map((question) => session.answers[question.key])
      .filter(Boolean)
      .join(" / ");
    return `
          <div class="heart-landing-session">
            <span class="heart-landing-session__when">${escapeHtml(relativeDay(session.startedAt || session.updatedAt))}</span>
            <span class="heart-landing-session__steps">${Object.keys(session.steps).length} wische &middot; ${escapeHtml(seconds(session.totalMs))}</span>
            <span class="heart-landing-session__answers">${escapeHtml(answered || "-")}</span>
            <span class="heart-landing-session__outcome heart-landing-session__outcome--${escapeHtml(session.outcome || "none")}">${escapeHtml(session.outcome || "")}</span>
          </div>
        `;
  }).join("")}
    </div>
  `;
}

function renderDetail(entry, tab = "active", hinweis = "") {
  const sessions = entry.sessions;
  const istAbgelegt = tab === "archived";
  return `
    <section class="heart-section">
      ${hinweis}
      <div class="heart-landing-detail__head">
        ${renderAvatar(entry)}
        <div class="heart-landing-detail__title">
          <h2 class="heart-landing-detail__name">${escapeHtml(entry.name)}</h2>
          <p class="heart-landing-detail__meta">${escapeHtml(entry.city || "")}${entry.publicSlug ? ` &middot; /oferta/${escapeHtml(entry.publicSlug)}` : ""}</p>
        </div>
      </div>

      <div class="heart-landing-kpis">
        <div class="heart-landing-kpi"><b>${entry.total}</b><span>Besucher</span></div>
        <div class="heart-landing-kpi"><b>${entry.answered}</b><span>Antworten</span></div>
        <div class="heart-landing-kpi"><b>${entry.yes}</b><span>Ja</span></div>
        <div class="heart-landing-kpi"><b>${entry.finished - entry.yes}</b><span>Nein</span></div>
      </div>

      <h3 class="heart-landing-subtitle">Sa larg kane ardhur</h3>
      ${renderSteps(sessions)}

      <h3 class="heart-landing-subtitle">Pergjigjet</h3>
      ${renderAnswers(sessions)}

      <h3 class="heart-landing-subtitle">Vizitat</h3>
      ${renderSessions(sessions)}

      <!-- Ganz unten, nicht oben: Weggelegt wird, nachdem man nachgesehen
           hat, nicht bevor man es getan hat. -->
      <div class="heart-landing-detail__foot">
        <button type="button" class="heart-landing-archive-button"
          data-action="toggle-landing-archive"
          data-landing-id="${escapeHtml(entry.restaurantId)}"
          data-landing-archived="${istAbgelegt ? "1" : "0"}">
          ${renderHeartIcon(istAbgelegt ? "refresh" : "archive")}
          <span>${istAbgelegt ? "Zurueckholen" : "Archivieren"}</span>
        </button>
      </div>
    </section>
  `;
}

// Beim allerersten Laden gibt es noch nichts zu zeigen. Statt einer Zeile
// "wird geladen" stehen hier Platzhalter in der Form der spaeteren Liste - man
// sieht, dass etwas kommt, und die Seite springt nachher nicht.
function renderListSkeleton() {
  // Eigene Box und nicht die Klasse der echten Zeile: Die ist ein
  // Flex-Container, in dem die Platzhalterbalken auf null Breite
  // zusammenfielen.
  return `
    <div class="heart-landing-skeleton" aria-hidden="true">
      ${[0, 1, 2, 3].map(() => `
        <div class="heart-landing-skeleton__row">
          <span class="heart-start__skeleton heart-start__skeleton--title"></span>
          <span class="heart-start__skeleton heart-start__skeleton--detail"></span>
        </div>
      `).join("")}
    </div>
  `;
}

export function renderHeartLandingView(landing = {}) {
  if (landing.status === "loading") {
    return `
      <section class="heart-section">
        <h2 class="heart-section__title">Landings</h2>
        ${renderListSkeleton()}
      </section>
    `;
  }
  if (landing.status === "error") {
    return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(landing.error || "Landings konnten nicht geladen werden.")}</div></section>`;
  }

  const alle = groupLandings(landing.sessions || []);
  const abgelegt = new Set(landing.archived || []);
  const tab = landing.tab === "archived" ? "archived" : "active";
  const sichtbar = alle.filter((entry) => abgelegt.has(entry.restaurantId) === (tab === "archived"));

  // Ist die Abfrage an ihre Grenze gestossen, fehlt ein beliebiger Teil der
  // Sitzungen - dann steht das ueber den Zahlen, statt dass man ihnen glaubt.
  const abgeschnitten = landing.abgeschnitten === true
    ? `<div class="heart-landing-warn">Es werden nur ${Number(landing.grenze) || 0} Sitzungen gelesen, und diese Grenze ist erreicht.
        Die Zahlen unten sind deshalb unvollstaendig.</div>`
    : "";

  // Die Auswertung wird nur gezeigt, wenn das Lokal auch im offenen Reiter
  // liegt - sonst stuende man in der Auswertung von etwas, das man gerade
  // weggelegt hat.
  const selected = landing.selectedId
    ? sichtbar.find((entry) => entry.restaurantId === landing.selectedId)
    : null;

  if (selected) return renderDetail(selected, tab, abgeschnitten);

  const anzahlAktiv = alle.length - alle.filter((entry) => abgelegt.has(entry.restaurantId)).length;

  return `
    <section class="heart-section">
      <h2 class="heart-section__title">Landings</h2>
      <p class="heart-section__hint">Wer hat welche Landing gesehen, wie weit ist er gekommen, und was hat er geantwortet.</p>
      ${abgeschnitten}
      ${renderStaleNote(landing)}
      ${renderTabs(tab, anzahlAktiv, alle.length - anzahlAktiv)}
      ${renderList(sichtbar, tab)}
    </section>
  `;
}

// Was gerade zu sehen ist, kommt aus dem Geraetespeicher oder ist beim
// Abgleich stehen geblieben. Beides gehoert dazugesagt - aber leise, unter der
// Ueberschrift, ohne die Zahlen wegzunehmen.
function renderStaleNote(landing = {}) {
  if (landing.error) {
    return `<p class="heart-landing-note heart-landing-note--warn">${escapeHtml(landing.error)} Angezeigt wird der letzte bekannte Stand.</p>`;
  }
  if (landing.loadedFrom === "cache") {
    return `<p class="heart-landing-note">Letzter bekannter Stand &middot; wird gerade abgeglichen</p>`;
  }
  return "";
}
