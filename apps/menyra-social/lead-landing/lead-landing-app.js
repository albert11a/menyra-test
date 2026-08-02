// Bootstrap der Lead-Landing.
//
// Eigenstaendige Seite: laedt die echten Profildaten read-only, rendert die
// Verkaufs-Sections und haengt drei kleine Verhalten an (Begruessungs-
// Wechsel, Reveal beim Scrollen, Karte). Kein Zugriff auf die Social-App.

import { loadLeadLandingData } from "./lead-landing-data.js";
import { mountLeadLandingMap } from "./lead-landing-map.js";
import {
  LEAD_LANDING_GREETINGS_COUNT,
  renderAnalytics,
  renderContact,
  renderCta,
  renderDish,
  renderHero,
  renderIntro,
  renderMap,
  renderMenu,
  renderPosts,
  renderPricing,
  renderProfile,
  renderQr,
  renderWaiter
} from "./lead-landing-sections.js";

const GREETING_INTERVAL_MS = 2600;

function readRouteKey() {
  const path = String(window.location.pathname || "");
  const match = path.match(/\/(?:oferta|lp|pitch)\/([^/?#]+)/i);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
  const params = new URLSearchParams(window.location.search);
  return String(
    params.get("r")
    || params.get("rid")
    || params.get("restaurantId")
    || params.get("slug")
    || ""
  ).trim();
}

function setBoot(message, isError = false) {
  const root = document.getElementById("llRoot");
  if (!root) return;
  root.innerHTML = `
    <div class="ll-boot">
      <p class="ll-boot__text${isError ? " ll-boot__text--error" : ""}">${message}</p>
    </div>
  `;
}

function startGreetingCycle() {
  const items = Array.from(document.querySelectorAll("[data-greet]"));
  if (items.length < 2) return;
  let index = 0;
  window.setInterval(() => {
    const previous = index;
    index = (index + 1) % LEAD_LANDING_GREETINGS_COUNT;
    items.forEach((node, position) => {
      node.classList.toggle("is-active", position === index);
      node.classList.toggle("is-prev", position === previous);
    });
  }, GREETING_INTERVAL_MS);
}

function startRevealObserver() {
  const targets = Array.from(document.querySelectorAll(".ll-reveal"));
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((node) => node.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

  targets.forEach((node) => observer.observe(node));
}

function startMap() {
  const container = document.getElementById("llMap");
  if (!(container instanceof HTMLElement)) return;
  if (!container.dataset.lat || !container.dataset.lng) return;

  if (!("IntersectionObserver" in window)) {
    mountLeadLandingMap(container);
    return;
  }

  // Karte erst laden, wenn sie in die Naehe des Viewports kommt.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      mountLeadLandingMap(container);
    });
  }, { rootMargin: "300px 0px" });

  observer.observe(container);
}

function renderPage(data) {
  const { profile, posts, menuItems, focusItems, sales } = data;
  return `
    <div class="ll-shell">
      ${renderHero(profile)}
      ${renderIntro(profile)}
      ${renderProfile(profile)}
      ${renderContact(profile)}
      ${renderPosts(posts)}
      ${renderMenu(profile, menuItems, focusItems)}
      ${renderDish(profile, menuItems)}
      ${renderMap(profile)}
      ${renderQr(sales)}
      ${renderWaiter()}
      ${renderAnalytics()}
      ${renderPricing(sales)}
      ${renderCta(profile, sales)}
    </div>
  `;
}

async function boot() {
  const routeKey = readRouteKey();
  if (!routeKey) {
    setBoot("Linku është i paplotë.", true);
    return;
  }

  setBoot("Po ngarkohet...");

  let data = null;
  try {
    data = await loadLeadLandingData(routeKey);
  } catch (err) {
    console.error(err);
    setBoot("Faqja nuk mund të ngarkohej.", true);
    return;
  }

  if (!data?.ok) {
    setBoot("Ky profil nuk u gjet.", true);
    return;
  }

  const root = document.getElementById("llRoot");
  if (!root) return;
  root.innerHTML = renderPage(data);

  document.title = `${data.profile.name} - Mnyra`;

  startGreetingCycle();
  startRevealObserver();
  startMap();
}

boot();
