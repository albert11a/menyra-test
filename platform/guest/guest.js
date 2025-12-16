/* =========================================================
   MENYRA Guest Dummy (Step 4)
   ========================================================= */

function qp(name){
  const p = new URLSearchParams(location.search);
  return p.get(name) || "";
}

function setText(id, txt){
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function setHref(id, base){
  const el = document.getElementById(id);
  if (!el) return;
  const qs = location.search || "";
  el.setAttribute("href", base + qs);
}

const rid = qp("r") || "demo";
const table = qp("t");
const room = qp("room");

setText("restName", rid.replaceAll("_"," ").toUpperCase());
setText("restMeta", table ? ("Tisch: " + table) : (room ? ("Room: " + room) : "Preview / Public Mode"));

setHref("linkDetajet", "./detajet.html");
setHref("linkPorosia", "./porosia.html");
setHref("linkKarte", "./karte.html");

const langSel = document.getElementById("guestLang");
if (langSel){
  const saved = localStorage.getItem("menyra_lang") || "de";
  langSel.value = saved;
  langSel.addEventListener("change", ()=>{
    localStorage.setItem("menyra_lang", langSel.value);
    location.reload();
  });
}
