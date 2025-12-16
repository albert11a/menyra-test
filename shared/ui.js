import { fillLangSelect, applyI18n, setLang } from "./i18n.js";

export function initLangDropdown(){
  const sel = document.getElementById("langSelect");
  if (!sel) return;
  fillLangSelect(sel);
  sel.addEventListener("change", ()=>{
    setLang(sel.value);
    applyI18n(document);
  });
}

export function initViews(){
  const btns = Array.from(document.querySelectorAll("[data-view-target]"));
  const views = Array.from(document.querySelectorAll("[data-view]"));
  if (!views.length) return;

  function show(name){
    views.forEach(v => v.style.display = (v.getAttribute("data-view") === name) ? "" : "none");
    btns.forEach(b => b.classList.toggle("is-active", b.getAttribute("data-view-target") === name));
    localStorage.setItem(location.pathname + ":view", name);
  }

  const last = localStorage.getItem(location.pathname + ":view") || views[0].getAttribute("data-view");
  show(last);
  btns.forEach(b => b.addEventListener("click", ()=> show(b.getAttribute("data-view-target"))));
}

export function initDrawer(){
  const openBtn = document.getElementById("drawerOpenBtn");
  const closeBtn = document.getElementById("drawerCloseBtn");
  const backdrop = document.getElementById("drawerBackdrop");
  const drawer = document.getElementById("drawer");
  if (!openBtn || !backdrop || !drawer) return;

  const open = ()=>{ drawer.classList.add("is-open"); backdrop.classList.add("is-open"); };
  const close = ()=>{ drawer.classList.remove("is-open"); backdrop.classList.remove("is-open"); };

  openBtn.addEventListener("click", open);
  (closeBtn || backdrop).addEventListener("click", close);
  backdrop.addEventListener("click", close);
  window.addEventListener("keydown", (e)=>{ if (e.key === "Escape") close(); });
  drawer.querySelectorAll("[data-view-target]").forEach(el => el.addEventListener("click", close));
}

export function initLogout(loginPath="./login.html"){
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", ()=> location.href = loginPath);
}

export function bootDashboard(loginPath){
  initLangDropdown();
  applyI18n(document);
  initViews();
  initDrawer();
  initLogout(loginPath);
}
