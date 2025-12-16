function qp(name){
  const p = new URLSearchParams(location.search);
  return p.get(name) || "";
}
function setText(id, txt){ const el=document.getElementById(id); if(el) el.textContent=txt; }

const rid = qp("r") || "demo";
setText("pubName", rid.replaceAll("_"," ").toUpperCase());
setText("pubType", rid.includes("hotel") ? "Hotel" : rid.includes("shop") ? "Shop" : rid.includes("service") ? "Dienstleistung" : "Restaurant/Café");

// Link to QR menu (table id is needed for ordering)
const qr = document.getElementById("qrLink");
if (qr){
  qr.href = "../guest/karte.html?r=" + encodeURIComponent(rid) + "&t=T1";
}
