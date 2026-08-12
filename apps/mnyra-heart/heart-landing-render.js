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

// Die Beschriftungen sind Kurzfassungen der Fragen auf der Landing
// (ASK_FLOW in apps/menyra-social/lead-landing/lead-landing-sections.js).
// Aendert sich dort eine Frage, gehoert sie hier mit geaendert - sonst steht
// ueber den Zahlen etwas anderes, als gefragt wurde.
const QUESTIONS = [
  { key: "q1", label: "Ju pelqen Mnyra?" },
  { key: "q2", label: "Menu digjitale + QR per 14 EUR?" },
  { key: "q3", label: "Vetem falas: profili e postimet?" }
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

function trimmed(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Was vor dem Zuruecksetzen liegt, wird weggelassen. Gemessen wird am Beginn
// der Sitzung: Eine Sitzung, die vor dem Knopfdruck angefangen hat, gehoert zum
// alten Stand - auch wenn ihre letzte Meldung eine Sekunde spaeter kam.
export function applyLandingResets(sessions = [], resets = []) {
  const grenzen = new Map();
  (Array.isArray(resets) ? resets : []).forEach((eintrag) => {
    const id = trimmed(eintrag?.restaurantId);
    const at = trimmed(eintrag?.at);
    if (!id || !at) return;
    const bisher = grenzen.get(id) || "";
    if (at > bisher) grenzen.set(id, at);
  });
  if (!grenzen.size) return Array.isArray(sessions) ? sessions : [];

  return (Array.isArray(sessions) ? sessions : []).filter((session) => {
    const grenze = grenzen.get(trimmed(session?.restaurantId));
    if (!grenze) return true;
    const wann = trimmed(session?.startedAt) || trimmed(session?.updatedAt);
    // Ohne Zeitstempel laesst sich nichts einordnen - so eine Sitzung gehoert
    // zum alten Stand, sonst bliebe sie nach jedem Zuruecksetzen stehen.
    if (!wann) return false;
    return wann > grenze;
  });
}

// Ein Lokal, das zurueckgesetzt wurde, hat keine Sitzung mehr - es soll aber
// in der Liste stehen bleiben, nur eben bei null. Sonst verschwaende es beim
// Zuruecksetzen aus der Ansicht, und man haette das Gefuehl, etwas kaputt
// gemacht zu haben. Name, Ort und Bild bringt der Eintrag selbst mit.
function leereGruppe(eintrag = {}) {
  return {
    restaurantId: String(eintrag.restaurantId || ""),
    name: String(eintrag.name || eintrag.restaurantId || ""),
    city: String(eintrag.city || ""),
    publicSlug: String(eintrag.publicSlug || ""),
    logoUrl: String(eintrag.logoUrl || ""),
    sessions: [],
    total: 0,
    finished: 0,
    yes: 0,
    answered: 0,
    last: String(eintrag.at || "")
  };
}

export function groupLandings(sessions = [], resets = []) {
  const byRestaurant = new Map();
  sessions.forEach((session) => {
    if (!session.restaurantId) return;
    const list = byRestaurant.get(session.restaurantId) || [];
    list.push(session);
    byRestaurant.set(session.restaurantId, list);
  });

  const leere = (Array.isArray(resets) ? resets : [])
    .filter((eintrag) => eintrag?.restaurantId && !byRestaurant.has(eintrag.restaurantId))
    .map(leereGruppe);

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
    .concat(leere)
    .sort((a, b) => String(b.last).localeCompare(String(a.last)));
}

// Der Suchtext und die Namen werden gleich behandelt, bevor sie verglichen
// werden: klein, ohne Akzente, ohne doppelte Leerzeichen. Sonst findet "prish"
// das "Prishtinë" nicht, und wer "Bro  Pizza" tippt, findet gar nichts.
export function normalizeLandingSearch(value = "") {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Die Verkaufsseite des Lokals. Absolut, damit der kopierte Link direkt in
// WhatsApp verschickt werden kann - genau wie bei den Leads im CRM.
export function landingPitchUrl(entry = {}) {
  const slug = String(entry.publicSlug || entry.restaurantId || "").trim();
  if (!slug) return "";
  const path = `/oferta/${encodeURIComponent(slug.replace(/^\/+/, ""))}`;
  const origin = typeof window !== "undefined" ? String(window.location?.origin || "").trim() : "";
  const istLokal = /localhost|127\.0\.0\.1|::1|^https?:\/\/(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin);
  if (origin && istLokal) return `${origin}${path}`;
  return `https://mnyra.com${path}`;
}

// Aus einem Lead wird ein Eintrag fuer Next. Welches Feld den Namen traegt,
// haengt davon ab, woher der Lead kommt - deshalb hier an einer Stelle.
export function leadToNextEntry(lead = {}) {
  const restaurantId = String(lead.restaurantId || lead.landingRestaurantId || lead.id || "").trim();
  if (!restaurantId) return null;
  return {
    restaurantId,
    name: String(lead.businessName || lead.name || lead.restaurantName || restaurantId).trim(),
    city: String(lead.city || "").trim(),
    publicSlug: String(lead.publicSlug || lead.landingSlug || "").trim(),
    logoUrl: String(lead.logoUrl || lead.logo || lead.imageUrl || "").trim()
  };
}

const NEXT_SUGGESTION_LIMIT = 8;
const NEXT_SEARCH_MIN = 2;

// Was das Suchfeld vorschlaegt: Leads, die zum Getippten passen und noch nicht
// vorgemerkt sind. Lokale, die unter Aktiv stehen, kommen gar nicht erst vor -
// dort ist die Landing schon geoeffnet worden, Vormerken waere sinnlos.
export function suggestLandingNext(leads = [], { query = "", vorhanden = [], aktiv = [] } = {}) {
  const gesucht = normalizeLandingSearch(query);
  if (gesucht.length < NEXT_SEARCH_MIN) return [];
  const raus = new Set([...vorhanden, ...aktiv].map((id) => String(id || "")).filter(Boolean));

  const treffer = [];
  for (const lead of Array.isArray(leads) ? leads : []) {
    const eintrag = leadToNextEntry(lead);
    if (!eintrag || raus.has(eintrag.restaurantId)) continue;
    const name = normalizeLandingSearch(eintrag.name);
    if (!name) continue;
    // Wer vorn im Namen trifft, steht oben - danach sucht man zuerst.
    const rang = name.startsWith(gesucht)
      ? 0
      : (name.includes(gesucht) ? 1 : (normalizeLandingSearch(eintrag.city).startsWith(gesucht) ? 2 : -1));
    if (rang < 0) continue;
    raus.add(eintrag.restaurantId);
    treffer.push({ ...eintrag, rang });
    // Frueh genug aufhoeren: Mehr als ein paar Vorschlaege liest niemand, und
    // bei tausend Leads soll das Tippen nicht ins Stocken geraten.
    if (treffer.length >= NEXT_SUGGESTION_LIMIT * 4) break;
  }

  return treffer
    .sort((a, b) => a.rang - b.rang || a.name.localeCompare(b.name))
    .slice(0, NEXT_SUGGESTION_LIMIT)
    .map(({ rang: _rang, ...eintrag }) => eintrag);
}

function renderTabs(tab, aktiv, vorgemerkt, wartend, abgelegt) {
  const reiter = [
    { key: "active", label: "Aktiv", count: aktiv },
    { key: "next", label: "Next", count: vorgemerkt },
    { key: "waiting", label: "Waiting", count: wartend },
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
    ? "Hier ist nichts abgelegt. Was Sie nicht mehr brauchen, legen Sie unten in der Auswertung mit &bdquo;Archivieren&ldquo; hierher."
    : "Noch keine Aufrufe. Sobald jemand eine Landing oeffnet, steht sie hier."}
      </div>
    `;
  }

  // Die ganze Karte ist ein einziger Knopf. Vorher steckte darin noch das
  // Ablegen, also ein Knopf im Knopf - das ist jetzt weg und wandert in die
  // Auswertung, wo man ohnehin nachsieht, bevor man etwas weglegt.
  //
  // Der W-Knopf unter Aktiv ist deshalb kein Knopf in der Karte, sondern einer
  // daneben: Er liegt in derselben Zeile und wird ueber die obere rechte Ecke
  // der Karte gelegt. Ein Knopf im Knopf waere ungueltiges Markup, und auf dem
  // Handy traefe man beim Zielen regelmaessig den falschen von beiden.
  const kannWarten = tab === "active";
  return `
    <div class="heart-landing-list">
      ${landings.map((entry) => `
        <div class="heart-landing-row">
          <button type="button" class="heart-landing-card${kannWarten ? " heart-landing-card--movable" : ""}"
            data-action="open-landing" data-landing-id="${escapeHtml(entry.restaurantId)}">
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
              <span class="heart-landing-card__stat heart-landing-card__stat--yes"><b>${entry.yes}</b><small>Kunde</small></span>
            </span>
          </button>
          ${kannWarten ? `
            <button type="button" class="heart-landing-move heart-landing-move--wait heart-landing-move--float"
              data-action="move-landing-waiting"
              data-landing-id="${escapeHtml(entry.restaurantId)}"
              data-landing-name="${escapeHtml(entry.name || "")}"
              data-landing-city="${escapeHtml(entry.city || "")}"
              data-landing-slug="${escapeHtml(entry.publicSlug || "")}"
              data-landing-logo="${escapeHtml(entry.logoUrl || "")}"
              aria-label="${escapeHtml(entry.name || "")} auf Waiting legen"
              title="Auf Waiting legen">
              ${renderHeartIcon("clock")}
              <span>W</span>
            </button>
          ` : ""}
        </div>
      `).join("")}
    </div>
  `;
}

// Eine Karte fuer die beiden Arbeitslisten. Next und Waiting sind dasselbe
// Lokal in zwei Zustaenden - erst vorgemerkt, dann ist der Link raus -, und
// deshalb dieselbe Karte. Was sie unterscheidet, ist der eine runde Knopf in
// der Mitte: unter Next schiebt er nach Waiting, unter Waiting zurueck.
//
// Jede Karte traegt Name, Ort, Slug und Bild in ihren Attributen mit sich:
// Beim Verschieben gibt es keine Sitzung, aus der sich das ableiten liesse, und
// eine zweite Runde zum Server nur fuer den Namen waere Unsinn.
function renderBoardCard(eintrag = {}, liste = "next", gruppe = null) {
  const link = landingPitchUrl(eintrag);
  const istWaiting = liste === "waiting";
  const daten = `
    data-landing-id="${escapeHtml(eintrag.restaurantId)}"
    data-landing-name="${escapeHtml(eintrag.name || "")}"
    data-landing-city="${escapeHtml(eintrag.city || "")}"
    data-landing-slug="${escapeHtml(eintrag.publicSlug || "")}"
    data-landing-logo="${escapeHtml(eintrag.logoUrl || "")}"
  `;
  const meta = escapeHtml(eintrag.city || eintrag.publicSlug || "");
  return `
    <div class="heart-landing-card heart-landing-card--next">
      <span class="heart-landing-card__head">
        ${renderAvatar(eintrag)}
        <span class="heart-landing-card__title">
          <span class="heart-landing-card__name">${escapeHtml(eintrag.name || "")}</span>
          <span class="heart-landing-card__meta">${meta}</span>
        </span>
        <button type="button" class="heart-landing-move${istWaiting ? "" : " heart-landing-move--wait"}"
          data-action="${istWaiting ? "move-landing-next" : "move-landing-waiting"}"
          ${daten}
          aria-label="${escapeHtml(eintrag.name || "")} ${istWaiting ? "zurueck nach Next" : "auf Waiting legen"}"
          title="${istWaiting ? "Zurueck nach Next" : "Auf Waiting legen"}">
          ${renderHeartIcon(istWaiting ? "refresh" : "clock")}
          <span>${istWaiting ? "N" : "W"}</span>
        </button>
        <button type="button" class="heart-landing-next-remove"
          data-action="${istWaiting ? "remove-landing-waiting" : "remove-landing-next"}"
          data-landing-id="${escapeHtml(eintrag.restaurantId)}"
          aria-label="${escapeHtml(eintrag.name || "")} aus ${istWaiting ? "Waiting" : "Next"} entfernen">
          ${renderHeartIcon("x")}
        </button>
      </span>
      ${gruppe && gruppe.total
    ? `
        <button type="button" class="heart-landing-card__stats heart-landing-card__stats--open"
          data-action="open-landing" data-landing-id="${escapeHtml(eintrag.restaurantId)}">
          <span class="heart-landing-card__stat"><b>${gruppe.total}</b><small>Besucht</small></span>
          <span class="heart-landing-card__stat"><b>${gruppe.answered}</b><small>Fragen</small></span>
          <span class="heart-landing-card__stat heart-landing-card__stat--yes"><b>${gruppe.yes}</b><small>Kunde</small></span>
        </button>
      `
    : ""}
      <button type="button" class="heart-landing-copy"
        data-action="copy-lead-pitch-link"
        data-pitch-url="${escapeHtml(link)}">
        ${renderHeartIcon("copy")}
        <span>Link kopieren</span>
      </button>
    </div>
  `;
}

// Der Reiter "Waiting": der Link ist raus, jetzt wird gewartet. Ein Lokal steht
// immer nur in einer Liste - was hier liegt, ist unter Aktiv nicht mehr zu
// sehen. Damit die Zahlen deswegen nicht verloren gehen, traegt die Karte sie
// mit, sobald es welche gibt: Sie sind zugleich der Knopf in die Auswertung.
function renderWaiting(waiting, gruppen) {
  if (!waiting.length) {
    return `<div class="heart-empty-block">Hier wartet noch nichts. Unter &bdquo;Aktiv&ldquo; oder &bdquo;Next&ldquo; schieben Sie ein Lokal mit dem W-Knopf hierher, sobald der Link raus ist.</div>`;
  }
  return `
    <div class="heart-landing-list">
      ${waiting.map((eintrag) => renderBoardCard(eintrag, "waiting", gruppen.get(eintrag.restaurantId))).join("")}
    </div>
  `;
}

// Der Reiter "Next": oben das Suchfeld mit seinen Vorschlaegen, darunter die
// vorgemerkten Lokale. Jede Karte bringt den Link zu ihrer Landing mit, damit
// er ohne Umweg in WhatsApp geht.
function renderNext(next, { leads = [], query = "", aktiveIds = [], leadsStatus = "" } = {}) {
  const vorschlaege = suggestLandingNext(leads, {
    query,
    vorhanden: next.map((eintrag) => eintrag.restaurantId),
    aktiv: aktiveIds
  });
  const gesucht = normalizeLandingSearch(query);
  const sucheLaeuft = gesucht.length >= NEXT_SEARCH_MIN;

  const suchfeld = `
    <div class="heart-landing-search">
      <span class="heart-landing-search__icon" aria-hidden="true">${renderHeartIcon("search")}</span>
      <input id="landingNextSearch" type="search" class="heart-landing-search__input"
        data-landing-next-search autocomplete="off" autocapitalize="off" spellcheck="false"
        placeholder="Lokal suchen" aria-label="Lokal suchen"
        value="${escapeHtml(query)}" />
    </div>
  `;

  // Was es zum Getippten zu sagen gibt: die Treffer, oder warum keine da sind.
  let vorschlagBlock = "";
  if (sucheLaeuft && vorschlaege.length) {
    vorschlagBlock = `
      <div class="heart-landing-suggestions" role="listbox">
        ${vorschlaege.map((eintrag) => `
          <button type="button" class="heart-landing-suggestion" role="option"
            data-action="add-landing-next"
            data-landing-id="${escapeHtml(eintrag.restaurantId)}"
            data-landing-name="${escapeHtml(eintrag.name)}"
            data-landing-city="${escapeHtml(eintrag.city)}"
            data-landing-slug="${escapeHtml(eintrag.publicSlug)}"
            data-landing-logo="${escapeHtml(eintrag.logoUrl)}">
            ${renderAvatar(eintrag)}
            <span class="heart-landing-suggestion__text">
              <span class="heart-landing-suggestion__name">${escapeHtml(eintrag.name)}</span>
              <span class="heart-landing-suggestion__meta">${escapeHtml(eintrag.city || eintrag.publicSlug || "")}</span>
            </span>
          </button>
        `).join("")}
      </div>
    `;
  } else if (sucheLaeuft && leadsStatus === "loading" && !leads.length) {
    vorschlagBlock = `<div class="heart-landing-suggestions-note">Leads werden geladen...</div>`;
  } else if (sucheLaeuft) {
    vorschlagBlock = `<div class="heart-landing-suggestions-note">Kein Lokal gefunden. Wer schon unter Aktiv steht, taucht hier nicht auf.</div>`;
  }

  const liste = next.length
    ? `
      <div class="heart-landing-list">
        ${next.map((eintrag) => renderBoardCard(eintrag, "next")).join("")}
      </div>
    `
    : `<div class="heart-empty-block">Hier ist noch nichts vorgemerkt. Suchen Sie oben ein Lokal und waehlen Sie es aus.</div>`;

  return `
    ${suchfeld}
    ${vorschlagBlock}
    ${liste}
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

      <!-- Ganz unten, nicht oben: Weggelegt oder zurueckgesetzt wird, nachdem
           man nachgesehen hat, nicht bevor man es getan hat.

           Zuruecksetzen steht links und traegt keine Farbe: Es ist der Griff,
           den man selten braucht, und er soll nicht neben dem gewohnten
           Archivieren nach dem naechsten Schritt aussehen. -->
      <div class="heart-landing-detail__foot">
        <button type="button" class="heart-landing-reset-button"
          data-action="reset-landing"
          data-landing-id="${escapeHtml(entry.restaurantId)}"
          data-landing-name="${escapeHtml(entry.name || "")}"
          data-landing-city="${escapeHtml(entry.city || "")}"
          data-landing-slug="${escapeHtml(entry.publicSlug || "")}"
          data-landing-logo="${escapeHtml(entry.logoUrl || "")}"
          data-landing-total="${entry.total}">
          ${renderHeartIcon("broom")}
          <span>Zuruecksetzen</span>
        </button>
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

export function renderHeartLandingView(landing = {}, options = {}) {
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

  // Zurueckgesetzte Lokale ohne Sitzung stehen mit null in der Liste, statt aus
  // ihr zu verschwinden - sonst sieht das Zuruecksetzen aus wie ein Verlust.
  const alle = groupLandings(landing.sessions || [], landing.resets || []);
  const abgelegt = new Set(landing.archived || []);
  const tab = ["active", "next", "waiting", "archived"].includes(landing.tab) ? landing.tab : "active";

  // Ein Lokal steht immer nur in einer Liste. Verschieben heisst deshalb
  // wirklich verschieben: Was auf Waiting liegt, ist unter Aktiv nicht mehr zu
  // sehen - und taucht dort von selbst wieder auf, sobald es Waiting verlaesst.
  // Seine Zahlen sind darum nicht weg: Die Waiting-Karte traegt sie mit und
  // fuehrt in dieselbe Auswertung.
  const wartend = landing.waiting || [];
  const wartendIds = new Set(wartend.map((eintrag) => eintrag.restaurantId));

  const nichtAbgelegt = alle.filter((entry) => !abgelegt.has(entry.restaurantId));
  // Alle nicht abgelegten - auch die wartenden. Daran haengt, was aus Next
  // herausfaellt und was das Suchfeld nicht mehr vorschlaegt: Beides gilt
  // weiterhin fuer ein Lokal, dessen Landing schon jemand geoeffnet hat.
  const aktiveIds = nichtAbgelegt.map((entry) => entry.restaurantId);
  const aktiveIdSet = new Set(aktiveIds);
  const unterAktiv = nichtAbgelegt.filter((entry) => !wartendIds.has(entry.restaurantId));
  const sichtbar = tab === "archived"
    ? alle.filter((entry) => abgelegt.has(entry.restaurantId))
    : unterAktiv;

  // Was auf Waiting liegt, ist von Next weitergezogen und gehoert dort nicht
  // mehr hin - auch dann nicht, wenn beide Eintraege kurz nebeneinander liegen.
  const vorgemerkt = (landing.next || [])
    .filter((eintrag) => !aktiveIdSet.has(eintrag.restaurantId) && !wartendIds.has(eintrag.restaurantId));

  // Die Zahlen zu einem wartenden Lokal, falls es schon welche gibt.
  const gruppen = new Map(alle.map((entry) => [entry.restaurantId, entry]));

  // Ist die Abfrage an ihre Grenze gestossen, fehlt ein beliebiger Teil der
  // Sitzungen - dann steht das ueber den Zahlen, statt dass man ihnen glaubt.
  const abgeschnitten = landing.abgeschnitten === true
    ? `<div class="heart-landing-warn">Es werden nur ${Number(landing.grenze) || 0} Sitzungen gelesen, und diese Grenze ist erreicht.
        Die Zahlen unten sind deshalb unvollstaendig.</div>`
    : "";

  // Die Auswertung wird nur gezeigt, wenn das Lokal auch im offenen Reiter
  // liegt - sonst stuende man in der Auswertung von etwas, das man gerade
  // weggelegt hat.
  //
  // Unter Waiting gilt dasselbe, nur ist die Liste dort eine andere: Wer die
  // Zahlen auf der Karte antippt, will die Auswertung sehen - sie ist von hier
  // aus der einzige Weg dorthin.
  const auswahl = tab === "waiting"
    ? (wartendIds.has(landing.selectedId) ? gruppen.get(landing.selectedId) : null)
    : sichtbar.find((entry) => entry.restaurantId === landing.selectedId);
  const selected = tab !== "next" && landing.selectedId ? auswahl : null;

  if (selected) return renderDetail(selected, tab, abgeschnitten);

  let inhalt = "";
  if (tab === "next") {
    inhalt = renderNext(vorgemerkt, {
      leads: options.leads || [],
      leadsStatus: options.leadsStatus || "",
      query: landing.nextQuery || "",
      aktiveIds: aktiveIds.concat(Array.from(wartendIds))
    });
  } else if (tab === "waiting") {
    inhalt = renderWaiting(wartend, gruppen);
  } else {
    inhalt = renderList(sichtbar, tab);
  }

  return `
    <section class="heart-section">
      <h2 class="heart-section__title">Landings</h2>
      <p class="heart-section__hint">Wer hat welche Landing gesehen, wie weit ist er gekommen, und was hat er geantwortet.</p>
      ${abgeschnitten}
      ${renderStaleNote(landing)}
      ${renderTabs(tab, unterAktiv.length, vorgemerkt.length, wartend.length, alle.length - aktiveIds.length)}
      ${inhalt}
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
