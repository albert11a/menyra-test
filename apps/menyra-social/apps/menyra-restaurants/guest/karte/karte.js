// apps/menyra-restaurants/guest/karte/karte.js
import { bootCommon, initKarte } from "../_shared/guest-core.js";

bootCommon();
initKarte();

// =========================================================
// ABSCHNITT 2: QUICKNAV (Menu + Panels) — minimal & schnell
// =========================================================
function initQuickNav() {
  const nav = document.querySelector(".quickNav");
  if (!nav) return;

  const row = document.getElementById("quickNavRow");
  if (!row) return;

  const allBtns = Array.from(row.querySelectorAll(".quickNavBtn"));

  const langToggleBtn = document.getElementById("langToggleBtn");
  const kamToggleBtn  = document.getElementById("kamToggleBtn");

  const langPanel   = document.getElementById("langPanel");
  const langBackBtn = document.getElementById("langBackBtn");
  const langNextBtn = document.getElementById("langNextBtn");
  const langLabel   = document.getElementById("langLabel");

  const kamPanel    = document.getElementById("kamPanel");
  const kamBackBtn  = document.getElementById("kamBackBtn");
  const kamNextBtn  = document.getElementById("kamNextBtn");

  const callWaiterOpt = document.getElementById("callWaiterOpt");
  const payOpt        = document.getElementById("payOpt");

  const LANG_KEY = "menyra_lang";
  let lastTabBtn = null; // Info/Story active

  function setActive(btnOrNull){
    allBtns.forEach(b => b.classList.remove("is-active"));
    if (btnOrNull) btnOrNull.classList.add("is-active");
  }

  function closeAllPanels({ restoreTab = true } = {}){
    nav.classList.remove("lang-open", "kam-open");

    if (langToggleBtn) langToggleBtn.setAttribute("aria-expanded", "false");
    if (kamToggleBtn)  kamToggleBtn.setAttribute("aria-expanded", "false");

    if (langPanel) langPanel.setAttribute("aria-hidden", "true");
    if (kamPanel)  kamPanel.setAttribute("aria-hidden", "true");

    if (restoreTab && lastTabBtn) setActive(lastTabBtn);
  }

  function openLang(){
    closeAllPanels({ restoreTab: false });
    nav.classList.add("lang-open");
    if (langToggleBtn) langToggleBtn.setAttribute("aria-expanded", "true");
    if (langPanel) langPanel.setAttribute("aria-hidden", "false");
    setActive(langToggleBtn);
  }

  function openKamarieri(){
    closeAllPanels({ restoreTab: false });
    nav.classList.add("kam-open");
    if (kamToggleBtn) kamToggleBtn.setAttribute("aria-expanded", "true");
    if (kamPanel) kamPanel.setAttribute("aria-hidden", "false");
    setActive(kamToggleBtn);
  }

  function setLang(code){
    try { localStorage.setItem(LANG_KEY, code); } catch (_) {}
    if (langLabel) langLabel.textContent = "Language"; // bleibt immer so (wie gewünscht)
  }

  // Init language
  const saved = (function(){
    try { return localStorage.getItem(LANG_KEY) || "de"; } catch (_) { return "de"; }
  })();
  setLang(saved);

  // Single listener (delegation)
  row.addEventListener("click", (e) => {
    const btn = e.target.closest(".quickNavBtn");
    if (!btn) return;

    // Toggle panels
    if (btn === langToggleBtn){
      e.preventDefault();
      e.stopPropagation();
      if (nav.classList.contains("lang-open")) closeAllPanels({ restoreTab: true });
      else openLang();
      return;
    }

    if (btn === kamToggleBtn){
      e.preventDefault();
      e.stopPropagation();
      if (nav.classList.contains("kam-open")) closeAllPanels({ restoreTab: true });
      else openKamarieri();
      return;
    }

    const tab = btn.dataset.tab || "";
    closeAllPanels({ restoreTab: false });

    if (tab){
      lastTabBtn = btn;
      setActive(btn);
    }

    if (tab === "story"){
      // Story page exists as ../story/index.html
      const url = new URL(window.location.href);
      const r = url.searchParams.get("r") || "";
      const t = url.searchParams.get("t") || "";
      const next = new URL("../story/index.html", url);
      if (r) next.searchParams.set("r", r);
      if (t) next.searchParams.set("t", t);
      window.location.href = next.toString();
      return;
    }

    if (tab === "info"){
      alert("Info (coming soon)");
      return;
    }
  }, { passive: false });

  // Close buttons
  [langBackBtn, langNextBtn].forEach((b) => {
    if (!b) return;
    b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllPanels({ restoreTab: true });
    }, { passive: false });
  });

  [kamBackBtn, kamNextBtn].forEach((b) => {
    if (!b) return;
    b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllPanels({ restoreTab: true });
    }, { passive: false });
  });

  // Language options
  if (langPanel){
    langPanel.addEventListener("click", (e) => {
      const opt = e.target.closest(".panelOpt[data-lang]");
      if (!opt) return;
      e.preventDefault();
      e.stopPropagation();
      const code = opt.dataset.lang;
      if (code) setLang(code);
      closeAllPanels({ restoreTab: true });
    }, { passive: false });
  }

  // Kamarieri actions (Demo now; Firestore logic later)
  if (callWaiterOpt){
    callWaiterOpt.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      alert("Kamarieri u njoftua ✅ (demo)");
      closeAllPanels({ restoreTab: true });
    }, { passive: false });
  }

  if (payOpt){
    payOpt.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Go to porosia with same params
      const url = new URL(window.location.href);
      const r = url.searchParams.get("r") || "";
      const t = url.searchParams.get("t") || "";
      const next = new URL("../porosia/index.html", url);
      if (r) next.searchParams.set("r", r);
      if (t) next.searchParams.set("t", t);
      window.location.href = next.toString();
      return;
    }, { passive: false });
  }

  // Outside click closes panels
  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("lang-open") && !nav.classList.contains("kam-open")) return;
    if (!nav.contains(e.target)) closeAllPanels({ restoreTab: true });
  }, { passive: true });

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllPanels({ restoreTab: true });
  }, { passive: true });
}

initQuickNav();
