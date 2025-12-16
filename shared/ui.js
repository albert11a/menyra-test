/* =========================================================
   MENYRA – ui.js (dummy navigation + theme)
   - NO Firebase here
   - Only: view switching, theme toggle, language chips mounting
   ========================================================= */

function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function setTheme(mode){
  const html = document.documentElement;
  const isDark = mode === "dark";
  html.classList.toggle("is-dark", isDark);
  localStorage.setItem("menyra_theme", isDark ? "dark" : "light");
  const tBtn = qs("[data-theme-toggle]");
  if(tBtn) tBtn.textContent = isDark ? "☾" : "☀";
}
function initTheme(){
  const saved = localStorage.getItem("menyra_theme") || "light";
  setTheme(saved);
  const btn = qs("[data-theme-toggle]");
  if(btn){
    btn.addEventListener("click", ()=>{
      const curr = localStorage.getItem("menyra_theme") || "light";
      setTheme(curr === "dark" ? "light" : "dark");
    });
  }
}

function showView(id){
  qsa("[data-view]").forEach(v=>{
    v.style.display = (v.getAttribute("data-view") === id) ? "" : "none";
  });
  qsa("[data-nav]").forEach(a=>{
    a.classList.toggle("is-active", a.getAttribute("data-nav") === id);
  });
  localStorage.setItem(location.pathname + ":view", id);
}
function initViews(defaultId){
  const saved = localStorage.getItem(location.pathname + ":view");
  const id = saved || defaultId;
  qsa("[data-nav]").forEach(a=>{
    a.addEventListener("click", (e)=>{
      e.preventDefault();
      showView(a.getAttribute("data-nav"));
    });
  });
  showView(id);
}

function fakeLogout(){
  // dummy: go to login page
  const back = qs("[data-login-path]")?.getAttribute("data-login-path");
  if(back) location.href = back;
}

function initMobileMenu(){
  const openBtn = qs("[data-mobile-menu-open]");
  const closeBtn = qs("[data-mobile-menu-close]");
  const overlay = qs("[data-mobile-menu-overlay]");
  const menu = qs("[data-mobile-menu]");

  if(!openBtn || !overlay || !menu) return;

  function open(){
    overlay.style.display = "block";
    requestAnimationFrame(()=>{ menu.style.transform = "translateX(0)"; });
  }
  function close(){
    menu.style.transform = "translateX(-105%)";
    setTimeout(()=>{ overlay.style.display = "none"; }, 180);
  }

  openBtn.addEventListener("click", open);
  overlay.addEventListener("click", close);
  if(closeBtn) closeBtn.addEventListener("click", close);

  // Close menu when changing views on mobile
  qsa("[data-nav]").forEach(el=>{
    el.addEventListener("click", ()=>{
      if(window.innerWidth < 980) close();
    });
  });
}

window.MENYRA_UI = { initTheme, initViews, showView, fakeLogout, initMobileMenu };
