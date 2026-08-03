// Bootstrap der Lead-Landing.
//
// Eigenstaendige Seite: laedt die echten Profildaten read-only, rendert die
// Verkaufs-Sections und haengt die Verhalten an: Begruessungs-Wechsel,
// Fortschrittspunkte, scrollgesteuerte Kapitel und Karte. Kein Zugriff auf
// die Social-App.

import { loadLeadLandingData } from "./lead-landing-data.js";
import { mountLeadLandingMap } from "./lead-landing-map.js";
import { startLeadLandingStages } from "./lead-landing-stage.js";
import {
  LEAD_LANDING_GREETINGS_COUNT,
  renderAnalytics,
  renderCta,
  renderHero,
  renderMap,
  renderPricing,
  renderQr,
  renderSurface,
  renderWeb,
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

// Fortschrittspunkte rechts: zeigen, an welchem Abschnitt man gerade ist.
// Rein passiv - das Einrasten macht CSS-Scroll-Snap, hier wird nichts
// gesteuert, damit das Scrollen nativ bleibt.
function startProgressDots() {
  const shell = document.querySelector(".ll-shell");
  const sections = Array.from(document.querySelectorAll(".ll-section, .ll-stage"));
  if (!shell || sections.length < 2) return;

  const rail = document.createElement("div");
  rail.className = "ll-progress";
  rail.setAttribute("aria-hidden", "true");
  rail.innerHTML = sections
    .map((_, index) => `<span class="ll-progress__dot${index === 0 ? " is-active" : ""}"></span>`)
    .join("");
  document.body.appendChild(rail);

  const dots = Array.from(rail.children);
  const setActive = (index) => {
    dots.forEach((dot, position) => dot.classList.toggle("is-active", position === index));
  };

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = sections.indexOf(entry.target);
      if (index >= 0) setActive(index);
    });
  }, { root: shell, threshold: 0.55 });

  sections.forEach((section) => observer.observe(section));
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
  }, { root: document.querySelector(".ll-shell"), rootMargin: "300px 0px" });

  observer.observe(container);
}

function renderPage(data) {
  const { profile, posts, neighbours, offer, menuItems, focusItems, sales } = data;
  return `
    <div class="ll-shell">
      ${renderHero(profile)}
      ${renderSurface(profile, posts, menuItems, focusItems)}
      ${renderWeb(profile, posts, neighbours, offer)}
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
  startProgressDots();
  startLeadLandingStages({ scroller: document.querySelector(".ll-shell") });
  startMap();
}

boot();
