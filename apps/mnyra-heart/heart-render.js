import {
  HEART_NAV_ITEMS
} from "./heart-state.js";
import {
  renderHeartIcon
} from "./heart-icons.js";
import {
  escapeHtml
} from "./heart-ui-utils.js";
import {
  renderHeartStartView
} from "./heart-start-render.js";
import {
  getHeartDisplayNameCore
} from "./heart-start-core.js";
import {
  renderHeartCrmAdminModal,
  renderHeartCrmAdminReadView
} from "./heart-crm-admin-read-view.js";
import {
  renderSettingsView
} from "./heart-settings-render.js";
import {
  renderHeartAnalyticsView
} from "./heart-analytics-render.js";
import { renderHeartLandingView } from "./heart-landing-render.js";
import { renderLifeskin } from "./heart-lifeskin-render.js";
import {
  renderHeartDestinationsView
} from "./heart-destinations-render.js";
import { HEART_GO_CSS, renderHeartGoView } from "./heart-go-render.js";

// Das Stylesheet der GO-Seite kommt mit ihrem Modul, nicht aus heart.css:
// So bleibt die Seite ein Stueck und niemand muss zwei Dateien im Gleichschritt
// pflegen. Eingesetzt wird es einmal, beim ersten Aufbau.
const HEART_GO_STYLE_ID = "mnyraHeartGoStyles";

function ensureHeartGoStyles() {
  if (typeof document === "undefined" || document.getElementById(HEART_GO_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = HEART_GO_STYLE_ID;
  style.textContent = HEART_GO_CSS;
  document.head?.appendChild(style);
}

const NAV_HINTS = Object.freeze({
  dashboard: "Spruch, Schnellwege und Neues",
  landing: "Lead-Landings: Wische, Abbrueche, Antworten",
  crmLeads: "CRM Leads",
  crmCustomers: "CRM Kunden",
  crmAds: "CRM Ads",
  crmStaff: "CRM Staff",
  destinations: "Orte & Destination-Templates",
  mnyraGo: "Mnyra GO: Provision, Trichter und Lokale",
  lifeskin: "Hautanalyse: Trichter, Bestellungen, Abdeckung",
  analytics: "Business-Analytics und Reichweite",
  connections: "Einrichtung, Konten und Links"
});

const NAV_ICONS = Object.freeze({
  dashboard: "home",
  landing: "image",
  crmLeads: "list",
  crmCustomers: "user",
  crmAds: "image",
  crmStaff: "users",
  destinations: "mapPin",
  mnyraGo: "zap",
  lifeskin: "zap",
  analytics: "activity",
  connections: "settings"
});

const CRM_VIEW_DOMAIN_BY_ACTIVE_VIEW = Object.freeze({
  crmLeads: "leads",
  crmCustomers: "customers",
  crmAds: "ads",
  crmStaff: "staff"
});

// Ansichten, ueber die die Shell KEINE Ueberschrift schreibt. Zwei Gruende
// kommen vor: Die Ansicht setzt ihren Titel selbst (dashboard, crmLeads,
// destinations, landing) - oder sie braucht gar keinen.
//
// "lifeskin" ist der zweite Fall. Die Ueberschrift stand dort als grosses
// Wort ueber dem ersten Bildschirm und sagte, was links im Menue schon
// angehakt ist. Auf dem Telefon kostete sie die halbe Hoehe, bevor die
// erste Zahl kam - und wer die Analysen aufmacht, weiss, dass er in den
// Analysen ist.
const VIEWS_WITHOUT_PAGE_TITLE = new Set([
  "dashboard", "crmLeads", "destinations", "landing", "lifeskin"
]);

// DER KOPF SAGT, WO MAN IST.
//
// Er trug "heart" ueber "mnyra" - auf jeder Ansicht dasselbe, also eine
// Auskunft, die keine ist. Im Lifeskin-Bereich steht jetzt LIFESKIN
// ueber CASH: dieselbe Schrift, dieselbe Farbe, derselbe Aufbau, nur
// die zwei Woerter wechseln mit der Ansicht.
const MARKEN = Object.freeze({
  heart: { eyebrow: "heart", wordmark: "mnyra" },
  leads: { eyebrow: "leads", wordmark: "mnyra" },
  lifeskin: { eyebrow: "lifeskin", wordmark: "cash" }
});

function renderHeaderBrand(extraClass = "", marke = "heart") {
  const { eyebrow, wordmark } = MARKEN[marke] || MARKEN.heart;
  return `
    <div class="heart-brand-lockup ${escapeHtml(extraClass)}">
      <span class="heart-brand-lockup__eyebrow">${escapeHtml(eyebrow)}</span>
      <span class="heart-brand-lockup__wordmark">${escapeHtml(wordmark)}</span>
    </div>
  `;
}

function getProfilePhotoUrl(state) {
  const candidates = [
    state?.auth?.user?.photoURL,
    state?.auth?.profile?.photoURL,
    state?.auth?.profile?.avatar,
    state?.auth?.profile?.avatarUrl,
    state?.auth?.profile?.image,
    state?.auth?.profile?.imageUrl,
    state?.auth?.profile?.profileImage,
    state?.auth?.profile?.profileImageUrl
  ];
  return candidates.map((value) => String(value || "").trim()).find(Boolean) || "";
}

function getProfileInitials(name = "", email = "") {
  const source = String(name || "").trim() || String(email || "").trim();
  if (!source) return "M";
  const parts = source
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "M";
}

function renderDrawerProfile(state, userName) {
  const email = String(state.auth.user?.email || "").trim();
  const photoUrl = getProfilePhotoUrl(state);
  const initials = getProfileInitials(userName, email);
  return `
    <div class="heart-sidebar__footer">
      <div class="heart-sidebar__profile">
        <div class="heart-sidebar__avatar" aria-hidden="true">
          ${photoUrl
    ? `<img src="${escapeHtml(photoUrl)}" alt="" loading="lazy" decoding="async" />`
    : `<span>${escapeHtml(initials)}</span>`}
        </div>
        <div class="heart-sidebar__identity">
          <strong>${escapeHtml(userName)}</strong>
          <p>${escapeHtml(email)}</p>
        </div>
      </div>
      <button class="heart-drawer-action heart-drawer-action--logout" data-action="logout">
        <span class="heart-drawer-action__icon">${renderHeartIcon("logout")}</span>
        <span>Abmelden</span>
      </button>
    </div>
  `;
}

function renderLoadingGate(message = "Session wird geladen") {
  return `
    <div class="heart-loader-view">
      <div class="heart-loader-view__inner">
        <div class="heart-loader-spinner" aria-hidden="true"></div>
        <p class="heart-loader-label">${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}

function renderGuestScreen(auth = {}) {
  return `
    <div class="heart-auth-shell">
      <section class="heart-auth-card heart-auth-card--login">
        <div class="heart-login-heading">
          <h1 class="heart-login-heading__word">Mnyra</h1>
          <p class="heart-login-heading__sub">Heart Login</p>
        </div>
        <form class="heart-login-form" data-heart-login>
          <label class="heart-input-field">
            <span>Email</span>
            <input type="email" name="email" autocomplete="username" placeholder="ceo@menyra.com" required />
          </label>
          <label class="heart-input-field">
            <span>Passwort</span>
            <input type="password" name="password" autocomplete="current-password" placeholder="Passwort" required />
          </label>
          ${auth.error ? `<div class="heart-login-error">${escapeHtml(auth.error)}</div>` : ""}
          <button class="heart-button heart-button--primary heart-button--wide" type="submit" ${auth.status === "signing-in" ? "disabled" : ""}>${auth.status === "signing-in" ? "Einloggen..." : "Einloggen"}</button>
        </form>
      </section>
    </div>
  `;
}

function renderDeniedScreen(auth = {}) {
  return `
    <div class="heart-auth-shell">
      <section class="heart-auth-card heart-auth-card--denied">
        <div class="heart-login-mark">
          <span class="heart-login-mark__word">Mnyra</span>
          <span class="heart-login-mark__sub">heart login</span>
        </div>
        <p class="heart-auth-help">${escapeHtml(auth.access?.reason || "Hier ist ein CEO-Zugang noetig.")}</p>
        <div class="heart-detail-grid heart-detail-grid--auth">
          <div><span>Email</span><strong>${escapeHtml(auth.user?.email || auth.profile?.email || "-")}</strong></div>
          <div><span>UID</span><strong>${escapeHtml(auth.user?.uid || "-")}</strong></div>
        </div>
        <button class="heart-button heart-button--secondary heart-button--wide" data-action="logout">Abmelden</button>
      </section>
    </div>
  `;
}

// Eine Ansicht darf Heart nicht mitnehmen.
//
// Vorher lag hier der direkte Aufruf. Wenn eine einzige Ansicht beim Zeichnen
// stolperte, flog der Fehler bis in renderHeartApp hinauf, das Markup wurde
// nie geschrieben - und weil die Ansicht im Zustand trotzdem umgestellt war,
// scheiterte auch jedes weitere Zeichnen. Das Ergebnis fuer den Benutzer:
// Ein Klick auf den Reiter, und danach reagiert nichts mehr, ohne dass
// irgendwo etwas zu sehen waere.
//
// Jetzt bleibt der Schaden in seiner Ansicht. Der Rest von Heart - Menue,
// Kopf, alle anderen Reiter - laesst sich weiter bedienen, und der Fehler
// steht sichtbar da statt nur in der Konsole.
function renderViewBody(state, runtime = {}) {
  try {
    return renderViewBodyInner(state, runtime);
  } catch (fehler) {
    globalThis.console?.error?.("[heart] Ansicht konnte nicht gezeichnet werden:", fehler);
    return `
      <section class="heart-section heart-view-error">
        <h2>Diese Ansicht konnte nicht gezeichnet werden.</h2>
        <p>Alle anderen Bereiche funktionieren weiter. Technischer Hinweis:</p>
        <pre>${escapeHtml(String(fehler?.message || fehler || "Unbekannter Fehler"))}</pre>
      </section>`;
  }
}

function renderViewBodyInner(state, runtime = {}) {
  const activeView = state.shell.activeView;

  if (activeView === "analytics") {
    return renderHeartAnalyticsView(state.analytics || {});
  }
  if (activeView === "mnyraGo") {
    ensureHeartGoStyles();
    return renderHeartGoView(state.mnyraGo || {});
  }
  if (activeView === "landing") {
    // Das Suchfeld im Reiter "Next" sucht in den Leads, die das CRM ohnehin
    // schon geladen hat - keine zweite Liste und keine zweite Abfrage.
    const leadsSection = state.crmAdmin?.sections?.leads || {};
    return renderHeartLandingView(state.landing || {}, {
      leads: leadsSection.items || [],
      leadsStatus: leadsSection.status || ""
    });
  }
  if (activeView === "destinations") {
    return renderHeartDestinationsView(state.destinations || {});
  }
  if (activeView === "lifeskin") {
    return renderLifeskin(state.lifeskin || {});
  }

  const crmReadDomain = CRM_VIEW_DOMAIN_BY_ACTIVE_VIEW[activeView];
  if (crmReadDomain) {
    return renderHeartCrmAdminReadView({
      consumerDeps: runtime.crmAdminConsumerDeps || {},
      crmAdmin: {
        ...(state.crmAdmin || {}),
        currentUid: state.auth.user?.uid || "",
        userProfile: state.auth.profile || null
      },
      activeDomain: crmReadDomain,
      modal: state.shell.modal || {},
      destinationsPublished: state.destinations?.published || {}
    });
  }

  if (activeView === "connections") {
    if (state.connections.status === "loading" && state.setup.status === "loading" && !state.setup.data) {
      return `<section class="heart-section"><div class="heart-loading-block">Einrichtung wird geladen...</div></section>`;
    }
    return renderSettingsView({
      connections: state.connections.items || [],
      setup: {
        ...(state.setup || {}),
        connectionsError: state.connections.error || ""
      }
    });
  }

  return renderHeartStartView({
    auth: state.auth || {},
    landing: state.landing || {},
    crmAdmin: state.crmAdmin || {},
    now: runtime.now || Date.now()
  });
}

function renderDrawerNav(state) {
  return HEART_NAV_ITEMS.map((item) => {
    const isActive = state.shell.activeView === item.key;
    return `
      <button class="heart-nav-link ${isActive ? "heart-nav-link--active" : ""}" data-nav-key="${escapeHtml(item.key)}">
        <span class="heart-nav-link__icon">${renderHeartIcon(NAV_ICONS[item.key] || "home")}</span>
        <span class="heart-nav-link__body">
          <span class="heart-nav-link__label">${escapeHtml(item.label)}</span>
          <span class="heart-nav-link__hint">${escapeHtml(NAV_HINTS[item.key] || "")}</span>
        </span>
      </button>
    `;
  }).join("");
}

function renderDrawer(state, userName) {
  return `
    <aside class="heart-sidebar">
      <div class="heart-sidebar__header">
        ${renderHeaderBrand("heart-brand-lockup--drawer")}
        <button class="heart-icon-button" data-action="toggle-nav" aria-label="Menue schliessen">${renderHeartIcon("x")}</button>
      </div>
      <div class="heart-sidebar__content">
        <section class="heart-sidebar__panel">
          <p class="heart-sidebar__label">Navigation</p>
          <nav class="heart-nav">${renderDrawerNav(state)}</nav>
        </section>
      </div>
      ${renderDrawerProfile(state, userName)}
    </aside>
  `;
}

function renderShell(state, runtime = {}) {
  const activeView = state.shell.activeView;
  const userName = getHeartDisplayNameCore(state.auth.profile, state.auth.user) || "CEO";
  const isLeadsView = activeView === "crmLeads";
  // In der Auswertung einer einzelnen Landing fuehrt der Weg zurueck oben im
  // Kopf, nicht mitten im Text: Dort sucht man ihn, und dort steht er immer -
  // auch wenn man weit nach unten gescrollt ist.
  const isLandingDetail = activeView === "landing"
    && String(state.landing?.selectedId || "").trim() !== "";
  // Dasselbe in der Akte einer Analyse: Der Weg zurueck steht oben im Kopf,
  // nicht mitten im Text. Um den Titel geht es hier nicht mehr - die ganze
  // Ansicht steht in VIEWS_WITHOUT_PAGE_TITLE.
  //
  // In try/catch, und das ist kein Zierrat: Der Kopf wird VOR der
  // Fehlergrenze von renderViewBody gezeichnet. Stolpert der Zustand einer
  // Ansicht schon beim Lesen, faellt hier sonst das ganze Heart aus -
  // genau der Fall, gegen den tests/heart-view-error-boundary.test.mjs
  // steht.
  let isLifeskinDetail = false;
  try {
    isLifeskinDetail = activeView === "lifeskin"
      && String(state.lifeskin?.offen || "").trim() !== "";
  } catch {
    isLifeskinDetail = false;
  }
  const navItem = HEART_NAV_ITEMS.find((item) => item.key === activeView);
  const shellClasses = [
    "heart-shell",
    state.shell.navOpen ? "heart-shell--nav-open" : "",
    state.shell.standalone ? "heart-shell--standalone" : ""
  ].filter(Boolean).join(" ");

  return `
    <div class="${shellClasses}">
      ${renderDrawer(state, userName)}
      <div class="heart-shell__overlay" data-action="toggle-nav"></div>
      <div class="heart-main-shell">
        <header class="heart-topbar">
          <div class="heart-topbar__left">
            <div class="heart-topbar__menu-slot">
              <button class="heart-icon-button heart-icon-button--menu" data-action="toggle-nav" aria-label="Menue oeffnen">${renderHeartIcon("menu")}</button>
            </div>
            ${renderHeaderBrand("", isLeadsView ? "leads"
              : activeView === "lifeskin" ? "lifeskin" : "heart")}
          </div>
          <div class="heart-topbar__right">
            ${isLeadsView ? `
              <button id="leadSettingsBtn" class="heart-icon-button" data-action="open-crm-editor" data-crm-domain="leads" data-crm-mode="settings" aria-label="Lead Settings">${renderHeartIcon("settings")}</button>
              <button id="newLeadBtn" class="heart-icon-button heart-icon-button--lead-create" data-action="open-crm-editor" data-crm-domain="leads" data-crm-mode="create" aria-label="Lead erstellen">${renderHeartIcon("plus")}</button>
            ` : `
              ${isLandingDetail ? `
                <button class="heart-topbar-back" data-action="close-landing" aria-label="Zurueck zu allen Landings">
                  ${renderHeartIcon("arrowLeft")}
                  <span>Landings</span>
                </button>
              ` : ""}
              ${isLifeskinDetail ? `
                <button class="heart-topbar-back" data-action="lifeskin-sitzung-zu" aria-label="Zurueck zu allen Analysen">
                  ${renderHeartIcon("arrowLeft")}
                  <span>Analysen</span>
                </button>
              ` : ""}
              <button class="heart-icon-button" data-action="refresh-heart" aria-label="Aktualisieren">${renderHeartIcon("refresh")}</button>
            `}
          </div>
        </header>
        <main class="heart-main-content">
          ${VIEWS_WITHOUT_PAGE_TITLE.has(activeView) ? "" : `<section class="heart-page-header">
            <h1 class="heart-page-header__title">${escapeHtml(navItem?.label || "Heart")}</h1>
          </section>`}
          ${renderViewBody(state, runtime)}
        </main>
      </div>
      ${renderHeartCrmAdminModal({
    crmAdmin: {
      ...(state.crmAdmin || {}),
      currentUid: state.auth.user?.uid || "",
      userProfile: state.auth.profile || null
    },
    modal: state.shell.modal || {}
  })}
      ${state.shell.toast ? `
        <div class="heart-toast heart-toast--${escapeHtml(state.shell.toast.tone || "neutral")}" role="status">
          <strong>${escapeHtml(state.shell.toast.title || "Hinweis")}</strong>
          <p>${escapeHtml(state.shell.toast.message || "")}</p>
        </div>
      ` : ""}
    </div>
  `;
}

// Fokus + Cursor eines gerade bearbeiteten Feldes erfassen, bevor die Shell per
// innerHTML neu geschrieben wird. So stiehlt ein Hintergrund-Refresh oder ein
// Zustands-Update keinem tippenden Nutzer den Fokus / die Cursorposition.
function captureHeartActiveField(rootNode) {
  if (typeof document === "undefined") return null;
  const active = document.activeElement;
  if (!active || active === document.body || !rootNode.contains(active)) return null;
  const tag = String(active.tagName || "").toLowerCase();
  const isField = tag === "input" || tag === "textarea" || tag === "select"
    || active.isContentEditable === true;
  if (!isField) return null;
  const id = String(active.id || "").trim();
  if (!id) return null; // nur eindeutig wiederfindbare Felder
  let selectionStart = null;
  let selectionEnd = null;
  try {
    if (Number.isFinite(Number(active.selectionStart))) selectionStart = Number(active.selectionStart);
    if (Number.isFinite(Number(active.selectionEnd))) selectionEnd = Number(active.selectionEnd);
  } catch {}
  return { id, selectionStart, selectionEnd };
}

function restoreHeartActiveField(rootNode, snapshot) {
  if (!snapshot?.id || typeof document === "undefined") return;
  const next = rootNode.querySelector(`#${(window.CSS && CSS.escape) ? CSS.escape(snapshot.id) : snapshot.id}`);
  if (!next || next === document.activeElement) return;
  try {
    next.focus({ preventScroll: true });
    if (
      Number.isInteger(snapshot.selectionStart)
      && Number.isInteger(snapshot.selectionEnd)
      && typeof next.setSelectionRange === "function"
    ) {
      const len = String(next.value || "").length;
      next.setSelectionRange(Math.min(snapshot.selectionStart, len), Math.min(snapshot.selectionEnd, len));
    }
  } catch {}
}

export function renderHeartApp(rootNode, state, runtime = {}) {
  if (!rootNode) return;

  // Die aeusserste Absicherung. renderViewBody faengt, was eine einzelne
  // Ansicht anrichtet - hier geht es um den Zustand selbst.
  //
  // Genau hier ist Heart gestorben: Ein Bereich wurde mit store.setState
  // geschrieben, das den Zustand ersetzt statt ihn zu ergaenzen. Danach gab
  // es kein state.auth mehr, dieser Zugriff warf, und weil jeder weitere
  // Versuch am selben Zustand scheiterte, wurde nie wieder etwas gezeichnet.
  // Die Ursache ist behoben; diese Zeilen sorgen dafuer, dass ein solcher
  // Fehler kuenftig sichtbar wird, statt Heart stumm anzuhalten.
  if (!state?.auth || !state?.shell) {
    globalThis.console?.error?.("[heart] Zustand unvollstaendig, nichts zu zeichnen:", state);
    rootNode.innerHTML = `
      <div class="heart-view-error">
        <h2>Heart hat den Faden verloren.</h2>
        <p>Der Zustand ist unvollstaendig. Bitte die Seite neu laden.</p>
      </div>`;
    rootNode.__heartLastMarkup = null;
    return;
  }

  let markup = "";
  if (state.auth.status === "checking" || (state.auth.status === "signing-in" && !state.auth.user)) {
    markup = renderLoadingGate(state.auth.status === "signing-in" ? "Login..." : "Session wird geladen");
  } else if (state.auth.status === "guest" || state.auth.status === "error" || state.auth.status === "signing-in") {
    markup = renderGuestScreen(state.auth);
  } else if (state.auth.status === "denied") {
    markup = renderDeniedScreen(state.auth);
  } else if (state.auth.status === "authenticated" && state.auth.access?.allowed) {
    markup = renderShell(state, runtime);
  } else {
    markup = renderLoadingGate();
  }
  // Identisches Markup nicht neu schreiben -> kein unnoetiges DOM-Neuaufbauen
  // (verhindert Flackern/Bild-Neuladen bei Hintergrund-Refreshes ohne Aenderung).
  if (rootNode.__heartLastMarkup === markup) return;
  const focusSnapshot = captureHeartActiveField(rootNode);
  const wischStand = captureChipScroll(rootNode);
  const bewahrt = captureBewahrt(rootNode);
  rootNode.innerHTML = markup;
  rootNode.__heartLastMarkup = markup;
  restoreBewahrt(rootNode, bewahrt);
  restoreHeartActiveField(rootNode, focusSnapshot);
  restoreChipScroll(rootNode, wischStand);
}

// FORMULARE, DIE EIN NEUZEICHNEN UEBERLEBEN.
//
// Heart zeichnet per innerHTML - bei jeder Aenderung irgendwo im Zustand
// (eine Live-Zahl, ein Eintrag im Klickpfad des Patienten, eine Meldung).
// Ein Formular, das nur im DOM lebt, war danach leer: Wer im Befund
// schrieb, verlor alles. Ein Knoten mit data-bewahren wird deshalb nicht
// neu gebaut, sondern als DERSELBE Knoten in das neue Markup
// zurueckgesetzt - mit allem, was darin getippt, eingefuegt oder
// angehakt ist. Nur wenn sich sein Schluessel aendert (der gespeicherte
// Stand dahinter ist ein anderer), steht er neu da.
function captureBewahrt(rootNode) {
  const stand = new Map();
  for (const knoten of rootNode.querySelectorAll?.("[data-bewahren]") || []) {
    stand.set(knoten.getAttribute("data-bewahren"), knoten);
  }
  return stand;
}

function restoreBewahrt(rootNode, stand) {
  if (!stand.size) return;
  for (const neu of [...(rootNode.querySelectorAll?.("[data-bewahren]") || [])]) {
    const alt = stand.get(neu.getAttribute("data-bewahren"));
    if (alt && alt !== neu) neu.replaceWith(alt);
  }
}

// CHIPREIHEN ZUM WISCHEN behalten ihre Stelle, wenn Heart neu zeichnet -
// sonst sprang die Reihe bei jeder Live-Zahl zurueck an den Anfang. Eine
// Reihe erkennt man an der Aktion ihrer Chips. Neu erschienene Reihen
// ruecken den gewaehlten Chip ins Bild.
function chipReihen(rootNode) {
  return [...(rootNode.querySelectorAll?.(".heart-lifeskin-chips") || [])]
    .map((reihe) => [reihe.querySelector("[data-action]")?.getAttribute("data-action") || "", reihe])
    .filter(([name]) => name);
}

function captureChipScroll(rootNode) {
  const stand = new Map();
  for (const [name, reihe] of chipReihen(rootNode)) stand.set(name, reihe.scrollLeft);
  return stand;
}

function restoreChipScroll(rootNode, stand) {
  for (const [name, reihe] of chipReihen(rootNode)) {
    if (stand.has(name)) { reihe.scrollLeft = stand.get(name); continue; }
    const an = reihe.querySelector('[aria-pressed="true"]');
    if (an && an.offsetLeft + an.offsetWidth > reihe.clientWidth) reihe.scrollLeft = an.offsetLeft - 16;
  }
}
