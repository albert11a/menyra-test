/* =========================================================
   MENYRA – Platform Staff Admin (Dummy)
   Step: DUMMY-P1.3 HOTFIX — Staff Layout + funktionierende UI

   Diese Datei ist absichtlich klein.

   Aufgaben:
   - Dummy-Gate: staff.html darf nur erreichbar sein, wenn Dummy-Login gesetzt ist
     (localStorage key: menyra_dummy_staff_logged_in)

   Später (Logik-Phase):
   - Firebase Auth Login
   - Firestore Check: platformStaff/{uid}
   - Staff sieht nur Leads/Kunden mit assignedStaffId === uid
   ========================================================= */

(function staffDummyGate(){
  const ok = localStorage.getItem("menyra_dummy_staff_logged_in") === "1";
  if (!ok){
    // zurück zur getrennten Staff-Login-Seite
    location.replace("./staff-login.html");
  }
})();


/* =========================================================
   STAFF LEADS VIEW — Dummy Render + Events
   ========================================================= */

function $(id){ return document.getElementById(id); }
function showOverlay(el){ if (el) el.classList.remove("is-hidden"); }
function hideOverlay(el){ if (el) el.classList.add("is-hidden"); }

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
function escapeAttr(s){ return escapeHtml(s); }

const STAFF_DUMMY_LEADS_BASE = [
  { id:"slead_001", name:"Café Aroma", type:"cafe", city:"Prishtina", phone:"+383 44 000 111", note:"Will Demo sehen", status:"new", next:"Heute 17:00 Anruf", ownerId:"staff_001", updatedAt: 10 },
  { id:"slead_002", name:"Restaurant Te Kodra", type:"restaurant", city:"Prizren", phone:"+383 49 222 333", note:"Interesse an Ads", status:"contacted", next:"Mi 11:00 Meeting", ownerId:"staff_002", updatedAt: 9 },
  { id:"slead_003", name:"Online Shop BeautyKS", type:"ecommerce", city:"Prishtina", phone:"+383 44 333 444", note:"Ads Preview wichtig", status:"demo", next:"Do 14:00 Follow-up", ownerId:"staff_003", updatedAt: 8 },
  { id:"slead_004", name:"Fastfood HEB’s", type:"fastfood", city:"Gjilan", phone:"+383 43 111 222", note:"Pickup Nummern", status:"new", next:"Morgen 12:00 Anruf", ownerId:"staff_001", updatedAt: 7 },
  { id:"slead_005", name:"Hotel CityLine", type:"hotel", city:"Prishtina", phone:"+383 45 222 111", note:"Zimmer QR", status:"meeting", next:"Fr 10:00 Termin", ownerId:"staff_002", updatedAt: 6 },
];

function getStaffId(){
  return localStorage.getItem("menyra_dummy_staff_id") || "staff_001";
}
function getStoreKey(){ return "menyra_dummy_staff_leads_" + getStaffId(); }

function loadMyLeads(){
  const staffId = getStaffId();
  const base = STAFF_DUMMY_LEADS_BASE.filter(l => l.ownerId === staffId);
  let extra = [];
  try{
    extra = JSON.parse(localStorage.getItem(getStoreKey()) || "[]");
  }catch(e){}
  return [...extra, ...base];
}

function saveMyLeads(list){
  localStorage.setItem(getStoreKey(), JSON.stringify(list));
}

const staffLeadsState = { chip:"all", selectedId:null };

function leadTypeLabel(t){
  const map = { restaurant:"Restaurant", cafe:"Café", fastfood:"Fastfood", hotel:"Hotel", motel:"Motel", ecommerce:"Online Shop", service:"Dienstleistung" };
  return map[t] || t || "—";
}
function leadStatusLabel(s){
  const map = { new:"Neu", contacted:"Kontaktiert", demo:"Demo", meeting:"Termin", won:"Won", lost:"Lost" };
  return map[s] || s || "—";
}
function leadStatusBadge(s){
  const cls = (s==="won")?"ok":(s==="lost")?"danger":(s==="new")?"info":"warn";
  return `<span class="m-badge ${cls}">${escapeHtml(leadStatusLabel(s))}</span>`;
}

function getFilteredMyLeads(list){
  const q = ($("staffLeadsSearch")?.value || "").toLowerCase().trim();
  const status = $("staffLeadsStatusFilter")?.value || "all";
  const sort = $("staffLeadsSort")?.value || "updated_desc";
  const chip = staffLeadsState.chip || "all";

  let arr = [...list];

  if (status !== "all") arr = arr.filter(l => l.status === status);
  if (chip !== "all") arr = arr.filter(l => l.status === chip);

  if (q){
    arr = arr.filter(l => (
      (l.name||"").toLowerCase().includes(q) ||
      (l.city||"").toLowerCase().includes(q) ||
      leadTypeLabel(l.type).toLowerCase().includes(q) ||
      (l.note||"").toLowerCase().includes(q)
    ));
  }

  if (sort === "name_asc") arr.sort((a,b)=> (a.name||"").localeCompare(b.name||""));
  else if (sort === "next_asc") arr.sort((a,b)=> (a.next||"").localeCompare(b.next||""));
  else arr.sort((a,b)=> (b.updatedAt||0) - (a.updatedAt||0));

  return arr;
}

function renderMyLeads(){
  const list = loadMyLeads();
  const filtered = getFilteredMyLeads(list);

  // KPIs
  const total = list.length;
  const neu = list.filter(l=>l.status==="new").length;
  const work = list.filter(l=>["contacted","demo","meeting"].includes(l.status)).length;
  const won = list.filter(l=>l.status==="won").length;

  if ($("staffLeadsKpiTotal")) $("staffLeadsKpiTotal").textContent = String(total);
  if ($("staffLeadsKpiNew")) $("staffLeadsKpiNew").textContent = String(neu);
  if ($("staffLeadsKpiWork")) $("staffLeadsKpiWork").textContent = String(work);
  if ($("staffLeadsKpiWon")) $("staffLeadsKpiWon").textContent = String(won);

  const tbody = $("staffLeadsTbody");
  if (!tbody) return;

  if (!filtered.length){
    tbody.innerHTML = `<tr><td colspan="4"><div class="m-table-meta">Keine Leads gefunden (Dummy).</div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(l=>{
    const meta = `${escapeHtml(leadTypeLabel(l.type))} • ${escapeHtml(l.city||"—")}`;
    return `<tr>
      <td><b>${escapeHtml(l.name)}</b><div class="m-table-meta">${meta}</div></td>
      <td>${leadStatusBadge(l.status)}</td>
      <td><div class="m-table-meta">${escapeHtml(l.next||"—")}</div></td>
      <td><button class="m-mini-btn" data-staff-lead-open="${escapeAttr(l.id)}" type="button">Detail</button></td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll("[data-staff-lead-open]").forEach(btn=>{
    btn.addEventListener("click", ()=> openStaffLeadDetail(btn.getAttribute("data-staff-lead-open")));
  });
}

function setStaffChip(name){
  staffLeadsState.chip = name;
  const wrap = $("staffLeadsChips");
  if (wrap){
    wrap.querySelectorAll("[data-staff-lead-chip]").forEach(b=>{
      b.classList.toggle("is-active", b.getAttribute("data-staff-lead-chip") === name);
    });
  }
  renderMyLeads();
}

function openStaffLeadCreate(){
  showOverlay($("staffLeadCreateOverlay"));
  ["staffLeadCreateName","staffLeadCreateCity","staffLeadCreatePhone","staffLeadCreateNote"].forEach(id=>{ if ($(id)) $(id).value=""; });
  if ($("staffLeadCreateType")) $("staffLeadCreateType").value="restaurant";
}
function closeStaffLeadCreate(){ hideOverlay($("staffLeadCreateOverlay")); }

function saveStaffLeadCreateDummy(){
  const list = loadMyLeads();
  const name = $("staffLeadCreateName")?.value?.trim() || "Neuer Lead (Dummy)";
  const type = $("staffLeadCreateType")?.value || "restaurant";
  const city = $("staffLeadCreateCity")?.value?.trim() || "—";
  const phone = $("staffLeadCreatePhone")?.value?.trim() || "";
  const note = $("staffLeadCreateNote")?.value?.trim() || "";

  const id = "slead_" + String(Math.floor(Math.random()*900)+100);
  const lead = {
    id, name, type, city, phone, note,
    status:"new",
    next:"—",
    ownerId: getStaffId(),
    updatedAt: (list[0]?.updatedAt||10) + 1
  };

  // store only extra leads (so base list stays base)
  const extrasKey = getStoreKey();
  let extras = [];
  try{ extras = JSON.parse(localStorage.getItem(extrasKey) || "[]"); }catch(e){}
  extras.unshift(lead);
  localStorage.setItem(extrasKey, JSON.stringify(extras));

  closeStaffLeadCreate();
  renderMyLeads();
}

function openStaffLeadDetail(id){
  const list = loadMyLeads();
  const lead = list.find(l=>l.id===id);
  if (!lead) return;
  staffLeadsState.selectedId = id;

  if ($("staffLeadDetailTitle")) $("staffLeadDetailTitle").textContent = lead.name;
  if ($("staffLeadDetailMeta")) $("staffLeadDetailMeta").textContent = `${leadTypeLabel(lead.type)} • ${lead.city||"—"}`;

  if ($("staffLeadDetailStatus")) $("staffLeadDetailStatus").value = lead.status || "new";
  if ($("staffLeadDetailNext")) $("staffLeadDetailNext").value = lead.next || "";
  if ($("staffLeadDetailPhone")) $("staffLeadDetailPhone").value = lead.phone || "";
  if ($("staffLeadDetailNote")) $("staffLeadDetailNote").value = lead.note || "";

  showOverlay($("staffLeadDetailOverlay"));
}
function closeStaffLeadDetail(){ hideOverlay($("staffLeadDetailOverlay")); staffLeadsState.selectedId=null; }

function saveStaffLeadDetailDummy(){
  const id = staffLeadsState.selectedId;
  if (!id) return;

  // update only extras
  const extrasKey = getStoreKey();
  let extras = [];
  try{ extras = JSON.parse(localStorage.getItem(extrasKey) || "[]"); }catch(e){ extras=[]; }

  const idx = extras.findIndex(l=>l.id===id);
  if (idx !== -1){
    extras[idx].status = $("staffLeadDetailStatus")?.value || extras[idx].status;
    extras[idx].next = $("staffLeadDetailNext")?.value || extras[idx].next;
    extras[idx].phone = $("staffLeadDetailPhone")?.value || extras[idx].phone;
    extras[idx].note = $("staffLeadDetailNote")?.value || extras[idx].note;
    extras[idx].updatedAt = (extras[0]?.updatedAt||10) + 1;
    localStorage.setItem(extrasKey, JSON.stringify(extras));
  }

  closeStaffLeadDetail();
  renderMyLeads();
}

function bindStaffLeadsView(){
  $("staffLeadsNewBtn")?.addEventListener("click", openStaffLeadCreate);
  $("staffLeadCreateClose")?.addEventListener("click", closeStaffLeadCreate);
  $("staffLeadCreateCancel")?.addEventListener("click", closeStaffLeadCreate);
  $("staffLeadCreateSave")?.addEventListener("click", saveStaffLeadCreateDummy);

  $("staffLeadDetailClose")?.addEventListener("click", closeStaffLeadDetail);
  $("staffLeadDetailSave")?.addEventListener("click", saveStaffLeadDetailDummy);
  $("staffLeadDetailDemo")?.addEventListener("click", ()=> closeStaffLeadDetail());

  ["staffLeadsSearch","staffLeadsStatusFilter","staffLeadsSort"].forEach(id=>{
    $(id)?.addEventListener("input", renderMyLeads);
    $(id)?.addEventListener("change", renderMyLeads);
  });

  $("staffLeadsChips")?.querySelectorAll("[data-staff-lead-chip]").forEach(b=>{
    b.addEventListener("click", ()=> setStaffChip(b.getAttribute("data-staff-lead-chip")));
  });

  ["staffLeadCreateOverlay","staffLeadDetailOverlay"].forEach(id=>{
    const ov = $(id);
    if (!ov) return;
    ov.addEventListener("click", (e)=>{ if (e.target === ov) hideOverlay(ov); });
  });

  renderMyLeads();
}

window.addEventListener("DOMContentLoaded", ()=>{
  bindStaffLeadsView();
});

