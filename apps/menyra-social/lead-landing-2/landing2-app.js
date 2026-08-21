// Bootstrap von Landing 2.
//
// Eine eigenstaendige Seite: Sie laedt die echten Daten des Lokals read-only,
// baut daraus die Abschnitte und haengt Scrollverhalten und Messung an.
//
// Kein Zugriff auf die Social-App: kein Router, keine Listener, kein
// gemeinsamer Zustand, kein Firebase-SDK. Was hier passiert, kann in der
// echten App nichts ausloesen - deshalb ist ein Klick auf "Shto" hier auch
// keine Bestellung, sondern ein Bild.
//
// Und keine Zeile aus der Lead-Landing: Landing 1 bleibt, wie sie ist, und
// bleibt aenderbar. Die beiden Seiten teilen bewusst keine einzige Datei.

import { loadLanding2Data } from "./landing2-data.js";
import { formatCents } from "./landing2-format.js";
import { goPriceRows, LANDING2_ORDER_CENTS_PER_ITEM } from "./landing2-prices.js";
import { startLanding2Scroll } from "./landing2-scroll.js";
import { startLanding2Tracking } from "./landing2-track.js";
import {
  renderBiznesi,
  renderClosing,
  renderDiscoveryClose,
  renderDiscoveryIntro,
  renderDiscoverySequence,
  renderFree,
  renderGoSequence,
  renderHero,
  renderOrderSequence,
  renderProfileSequence,
  renderSave,
  renderStandard,
  renderTableFlow,
  renderVision,
  renderWhatIsMnyra,
  renderZeroCut
} from "./landing2-sections.js";

// Woher die Seite weiss, um welches Lokal es geht.
//
// Drei Wege, weil der Link aus drei Richtungen kommt: aus Heart (/prezantim/
// <slug>), aus einer Nachricht mit angehaengter Kennung (?r=) und beim
// Ausprobieren von Hand. Kein vierter - eine Adresse, die nicht sagt, wer
// gemeint ist, soll auch keine halbe Seite zeigen.
export function readRouteKey(location = {}) {
  const path = String(location.pathname || "");
  const match = path.match(/\/(?:prezantim|presentation)\/([^/?#]+)/i);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
  const params = new URLSearchParams(String(location.search || ""));
  return String(
    params.get("r")
    || params.get("rid")
    || params.get("restaurantId")
    || params.get("slug")
    || ""
  ).trim();
}

// Wohin der Knopf am Ende fuehrt: auf das echte oeffentliche Profil des
// Lokals. Das ist bewusst kein Formular und kein Konto-Anlegen - der Wirt
// soll sehen, dass es ihn schon gibt.
export function claimUrl(profile = {}, restaurantId = "") {
  const slug = String(profile.publicSlug || "").trim().replace(/^\/+/, "");
  if (slug) return `/${encodeURIComponent(slug)}`;
  const id = String(restaurantId || "").trim();
  return id ? `/lp/${encodeURIComponent(id)}` : "";
}

function setBoot(message, isError = false) {
  const root = document.getElementById("l2Root");
  if (!root) return;
  root.innerHTML = `
    <div class="l2-boot">
      <p class="l2-boot__text${isError ? " l2-boot__text--error" : ""}">${message}</p>
    </div>
  `;
}

function renderPage(data) {
  const { profile, posts, menuItems, focusItems, neighbours, restaurantId } = data;
  const goPrices = goPriceRows((cents) => formatCents(cents, "EUR"));
  const orderPrice = formatCents(LANDING2_ORDER_CENTS_PER_ITEM, "EUR");

  return `
    ${renderHero(profile)}
    ${renderProfileSequence(profile, posts, menuItems, focusItems)}
    ${renderFree()}
    ${renderDiscoveryIntro()}
    ${renderDiscoverySequence(profile, posts, focusItems, menuItems, neighbours)}
    ${renderDiscoveryClose()}
    ${renderWhatIsMnyra()}
    ${renderTableFlow(profile)}
    ${renderStandard(profile, neighbours)}
    ${renderZeroCut()}
    ${renderOrderSequence(profile, menuItems, orderPrice)}
    ${renderGoSequence(profile, focusItems, menuItems, goPrices)}
    ${renderSave(profile, menuItems)}
    ${renderBiznesi(profile, posts, menuItems)}
    ${renderVision(profile, neighbours)}
    ${renderClosing(profile, { claimUrl: claimUrl(profile, restaurantId) })}
  `;
}

async function boot() {
  const routeKey = readRouteKey(window.location);
  if (!routeKey) {
    setBoot("Linku është i paplotë.", true);
    return;
  }

  setBoot("Po ngarkohet...");

  // Hat der Server die Kennung des Lokals schon ermittelt, steht sie in der
  // Seite - dann muss sie nicht noch einmal erfragt werden.
  const hint = document.querySelector('meta[name="l2-restaurant"]')?.getAttribute("content") || "";

  let data = null;
  try {
    data = await loadLanding2Data(routeKey, { hint });
  } catch (err) {
    console.error(err);
    setBoot("Faqja nuk mund të ngarkohej.", true);
    return;
  }

  // Kein halbes Lokal. Eine Seite, die den Namen nicht kennt, aber trotzdem
  // "Profili yt" schreibt, ist schlimmer als eine, die nichts zeigt.
  if (!data?.ok) {
    setBoot("Ky profil nuk u gjet.", true);
    return;
  }

  const root = document.getElementById("l2Root");
  if (!root) return;
  root.innerHTML = renderPage(data);
  document.title = `${data.profile.name} · MNYRA`;

  startLanding2Scroll();

  const tracker = startLanding2Tracking({
    slug: routeKey,
    restaurantId: data.restaurantId
  });

  // Der Knopf am Ende fuehrt auf das echte Profil. Gemessen wird der Klick,
  // nicht abgefangen - wer tippt, soll dort ankommen.
  root.addEventListener("click", (event) => {
    if (!event.target.closest("[data-l2-claim]")) return;
    tracker?.claim();
  });
}

if (typeof document !== "undefined" && document.getElementById("l2Root")) {
  boot();
}
