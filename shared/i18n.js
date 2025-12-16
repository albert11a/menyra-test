/* =========================================================
   MENYRA – i18n.js (placeholder)
   - Default language: German (de)
   - Other languages fallback to German for now (dummy stage)
   ========================================================= */

const MENYRA_LANGS = [
  { code:"de", label:"Deutsch" },
  { code:"sq", label:"Shqip (Albanisch)" },
  { code:"en", label:"English" },
  { code:"sr", label:"Srpski" },
  { code:"bs", label:"Bosanski" },
  { code:"hr", label:"Hrvatski" },
  { code:"cs", label:"Čeština" },
  { code:"fr", label:"Français" },
  { code:"it", label:"Italiano" },
  { code:"es", label:"Español" },
  { code:"da", label:"Dansk" },
  { code:"tr", label:"Türkçe" },
];

const MENYRA_I18N = {
  de: {
    "app.title":"MENYRA",
    "common.login":"Anmelden",
    "common.logout":"Abmelden",
    "common.search":"Suchen…",
    "common.save":"Speichern",
    "common.cancel":"Abbrechen",
    "common.create":"Erstellen",
    "common.edit":"Bearbeiten",
    "common.delete":"Löschen",
    "common.preview":"Vorschau",
    "common.placeholder":"Platzhalter (Dummy)",
  }
};

function getLang(){
  return localStorage.getItem("menyra_lang") || "de";
}
function setLang(code){
  localStorage.setItem("menyra_lang", code);
  document.documentElement.setAttribute("lang", code);
  // optional: mark active in UI
  document.querySelectorAll("[data-lang-btn]").forEach(btn=>{
    btn.classList.toggle("is-active", btn.getAttribute("data-lang-btn") === code);
  });
  applyI18n();
}
function t(key){
  const lang = getLang();
  return (MENYRA_I18N[lang] && MENYRA_I18N[lang][key]) || (MENYRA_I18N.de && MENYRA_I18N.de[key]) || key;
}
function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el=>{
    const key = el.getAttribute("data-i18n-ph");
    el.setAttribute("placeholder", t(key));
  });
}

function mountLangSwitcher(containerSelector){
  const wrap = document.querySelector(containerSelector);
  if(!wrap) return;
  wrap.innerHTML = "";
  MENYRA_LANGS.forEach(l=>{
    const b = document.createElement("button");
    b.type = "button";
    b.className = "m-chip";
    b.textContent = l.code.toUpperCase();
    b.setAttribute("data-lang-btn", l.code);
    b.addEventListener("click", ()=>setLang(l.code));
    wrap.appendChild(b);
  });
  // mark active
  const lang = getLang();
  document.documentElement.setAttribute("lang", lang);
  setLang(lang);
}
function mountLangSelect(selectSelector){
  const sel = document.querySelector(selectSelector);
  if(!sel) return;
  sel.innerHTML = "";
  MENYRA_LANGS.forEach(l=>{
    const opt = document.createElement("option");
    opt.value = l.code;
    opt.textContent = l.label;
    sel.appendChild(opt);
  });
  sel.value = getLang();
  sel.addEventListener("change", ()=>{
    setLang(sel.value);
  });
}


window.MENYRA_I18N_API = { getLang, setLang, applyI18n, mountLangSwitcher, mountLangSelect, t };
