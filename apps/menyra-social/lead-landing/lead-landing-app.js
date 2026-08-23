// Bootstrap der Lead-Landing.
//
// Eigenstaendige Seite: laedt die echten Profildaten read-only, rendert die
// Bildschirme und haengt die Verhalten an: Fortschrittspunkte, das
// scrollgesteuerte Profil-Kapitel, die wischbaren Kartenreihen und die
// Messung. Kein Zugriff auf die Social-App.

import { loadLeadLandingData } from "./lead-landing-data.js";
import { startLeadLandingStages } from "./lead-landing-stage.js";
import { startLeadLandingSwipes } from "./lead-landing-swipe.js";
import { startLeadLandingTracking } from "./lead-landing-track.js";
import { lockLeadLandingViewport } from "./lead-landing-viewport.js";
import { renderHero, renderSurface } from "./lead-landing-sections.js";
import {
  renderChapterMore,
  renderChapterWhat,
  renderDecision,
  renderExtraPhotos,
  renderFreeFeatures,
  renderPaidFeatures,
  renderQrStands,
  renderServiceIntro,
  renderServicePhotos,
  renderServicePrice,
  renderServiceScope,
  renderZeroPrice
} from "./lead-landing-sales.js";

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

// Die Entscheidung am Ende: Welchen der beiden Wege der Wirt waehlt, ist die
// eine Zahl, um die es auf dieser Seite geht.
//
// Aufgezeichnet wird sie im Schema, das die Firestore-Regeln kennen (q1 bis
// q3, jeweils "po" oder "jo") - deshalb setzt ein Druck alle drei auf einmal:
// q1 sagt, dass ueberhaupt gewaehlt wurde, q2 und q3 sagen, was gewaehlt
// wurde. Ein neues Feld haette eine Regelaenderung gebraucht, und eine
// Sitzung mit einem Feld, das die Regel nicht kennt, kommt gar nicht erst an.
//
// Der Knopf selbst wird nicht abgefangen: Er fuehrt nach WhatsApp und soll
// das auch tun. Die Messung schickt sofort (tracker.answer schickt selbst) -
// danach darf die Seite ruhig in den Hintergrund gehen.
function startDecision(tracker) {
  const section = document.querySelector("[data-decide]");
  if (!section || !tracker) return;

  section.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-answer]");
    if (!choice || !section.contains(choice)) return;
    const answer = String(choice.dataset.answer || "");
    if (answer !== "paketa" && answer !== "falas") return;

    const wantsPackage = answer === "paketa";
    tracker.answer("q1", "po");
    tracker.answer("q2", wantsPackage ? "po" : "jo");
    tracker.answer("q3", wantsPackage ? "jo" : "po");
    tracker.finish("yes");

    section.dataset.chosen = answer;
  });
}

function renderPage(data) {
  const { profile, posts, menuItems, focusItems, sales } = data;
  return `
    <div class="ll-shell">
      ${renderHero(profile)}
      ${renderSurface(profile, posts, menuItems, focusItems)}
      ${renderChapterWhat()}
      ${renderFreeFeatures(profile, menuItems)}
      ${renderZeroPrice()}
      ${renderServiceIntro()}
      ${renderServicePhotos(sales)}
      ${renderServiceScope()}
      ${renderExtraPhotos(sales)}
      ${renderQrStands(sales)}
      ${renderServicePrice(profile, sales)}
      ${renderChapterMore()}
      ${renderPaidFeatures(sales)}
      ${renderDecision(profile, sales)}
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

  // Hat der Server die Kennung des Lokals schon ermittelt, steht sie in der
  // Seite - dann muss sie nicht noch einmal erfragt werden.
  const hint = document.querySelector('meta[name="ll-restaurant"]')?.getAttribute("content") || "";

  let data = null;
  try {
    data = await loadLeadLandingData(routeKey, { hint });
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

  // Zuerst die Bildschirmhoehe festnageln, dann alles andere: Ab hier misst
  // sich jeder Abschnitt gegen eine Zahl, die sich nicht mehr bewegt. Wuerde
  // sie erst spaeter gesetzt, waeren die ersten Messungen gegen den alten Wert
  // gerechnet und muessten gleich wieder verworfen werden.
  const viewport = lockLeadLandingViewport({ scroller: document.querySelector(".ll-shell") });

  startProgressDots();
  startLeadLandingSwipes(root);

  // Die Messung braucht die fertige Seite: Sie sucht die Rastpunkte im Markup.
  const tracker = startLeadLandingTracking({
    scroller: document.querySelector(".ll-shell"),
    slug: routeKey,
    restaurantId: data.restaurantId
  });
  startDecision(tracker);
  startLeadLandingStages({ scroller: document.querySelector(".ll-shell"), viewport });
}

boot();
