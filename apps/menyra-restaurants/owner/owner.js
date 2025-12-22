import { db, auth } from "@shared/firebase-config.js";
import { collection, getDocs, doc, getDoc, updateDoc, query, where, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const $ = (id) => document.getElementById(id);

const body = document.body;
const sidebarNav = $("sidebarNav");
const views = Array.from(document.querySelectorAll(".m-view[data-view]"));
const burgerToggle = $("burgerToggle");
const mobileMenu = $("mobileMenu");
const logoutButton = $("logoutButton");
const themeToggle = $("themeToggle");
const profileName = $("profileName");

const authModalOverlay = $("authModalOverlay");
const authModalClose = $("authModalClose");
const authForm = $("authForm");
const authEmail = $("authEmail");
const authPass = $("authPass");
const authStatus = $("authStatus");

const customersTableBody = $("customersTableBody"); // reused as menu placeholder
const customersFooter = $("customersFooter");
const customersTotalBadge = $("customersTotalBadge");

const state = { user:null, view:"dashboard", restaurantId:null };

const THEME_KEY="menyra_admin_theme";
function setTheme(theme){
  body.classList.remove("theme-dark","theme-light");
  body.classList.add(theme==="dark"?"theme-dark":"theme-light");
  try{ localStorage.setItem(THEME_KEY, theme);}catch(_){}
  if (themeToggle) themeToggle.textContent = theme==="dark" ? "☀️" : "🌙";
}
function initTheme(){
  let saved="light";
  try{ saved = localStorage.getItem(THEME_KEY) || "light";}catch(_){}
  setTheme(saved);
}

function openAuth(){ if(authModalOverlay){ authModalOverlay.style.display="flex"; authStatus && (authStatus.textContent=""); } }
function closeAuth(){ if(authModalOverlay){ authModalOverlay.style.display="none"; } }

async function doLogin(email, pass){
  authStatus && (authStatus.textContent="Login…");
  try{ await signInWithEmailAndPassword(auth, email, pass); authStatus && (authStatus.textContent="✅"); closeAuth(); }
  catch(e){ authStatus && (authStatus.textContent = e?.message || String(e)); }
}
async function doLogout(){ try{ await signOut(auth);}catch(_){} }

function showView(viewName){
  state.view=viewName;
  views.forEach(v => v.style.display = v.dataset.view===viewName ? "block" : "none");
  try{ history.replaceState(null,"","#"+viewName);}catch(_){}
  if (sidebarNav){
    const links = Array.from(sidebarNav.querySelectorAll("a[data-section]"));
    links.forEach(a => a.classList.toggle("is-active", a.dataset.section===viewName));
  }
}

function openMobile(){ if(mobileMenu){ mobileMenu.style.display="block"; mobileMenu.classList.add("is-open"); } }
function closeMobile(){ if(mobileMenu){ mobileMenu.classList.remove("is-open"); mobileMenu.style.display="none"; } }

function initRouting(){
  const hash=(window.location.hash||"").replace("#","");
  showView(hash || "dashboard");
}

function readRestaurantId(){
  const url = new URL(window.location.href);
  return url.searchParams.get("r") || "";
}

async function renderOwnerHome(){
  if (!customersTableBody) return;
  const rid = state.restaurantId;
  if (!rid){
    customersTableBody.innerHTML = `<div class="m-muted">Fehlt: <b>?r=restaurantId</b></div>`;
    return;
  }
  customersTableBody.innerHTML = `<div class="m-muted">Owner Admin ist bereit. Menü-Edit kommt als nächster Step (Edit-Only wie besprochen).</div>
  <div class="m-muted">RestaurantId: <span class="m-mono">${rid}</span></div>`;
  customersTotalBadge && (customersTotalBadge.textContent="—");
  customersFooter && (customersFooter.textContent="—");
}

function wireEvents(){
  initTheme();
  themeToggle?.addEventListener("click", ()=>{
    const isDark = body.classList.contains("theme-dark");
    setTheme(isDark ? "light" : "dark");
  });

  burgerToggle?.addEventListener("click", ()=>{
    if (!mobileMenu) return;
    mobileMenu.classList.contains("is-open") ? closeMobile() : openMobile();
  });
  document.addEventListener("click",(e)=>{
    if (!mobileMenu || !mobileMenu.classList.contains("is-open")) return;
    if (mobileMenu.contains(e.target) || burgerToggle?.contains(e.target)) return;
    closeMobile();
  }, {passive:true});

  sidebarNav?.addEventListener("click",(e)=>{
    const a=e.target.closest("a[data-section]");
    if (!a) return;
    e.preventDefault();
    showView(a.dataset.section || "dashboard");
    closeMobile();
  });

  logoutButton?.addEventListener("click", doLogout);

  authModalClose?.addEventListener("click", ()=>{ if(state.user) closeAuth(); });
  authForm?.addEventListener("submit",(e)=>{
    e.preventDefault();
    doLogin((authEmail?.value||"").trim(), (authPass?.value||""));
  });
}

function initAuth(){
  onAuthStateChanged(auth, async (user)=>{
    state.user = user || null;
    profileName && (profileName.textContent = user ? (user.email||"User") : "—");

    if (!user){
      openAuth();
      await renderOwnerHome();
      return;
    }
    closeAuth();
    await renderOwnerHome();
  });
}

(function init(){
  state.restaurantId = readRestaurantId();
  wireEvents();
  initRouting();
  initAuth();
})();
