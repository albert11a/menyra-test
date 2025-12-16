/* =========================================================
   MENYRA – Platform Admin (CEO) Dummy
   Step: DUMMY-P1.4 — Leads CRM Screens (Dummy)
   ========================================================= */

function $(id){ return document.getElementById(id); }
function showOverlay(el){ if (el) el.classList.remove("is-hidden"); }
function hideOverlay(el){ if (el) el.classList.add("is-hidden"); }

const DUMMY_STAFF = [
  { id:"staff_001", name:"Arben (Demo)", region:"Prishtina", customers:7, leads:18, won:3, status:"active",
    customersList:["Café Demo (demo_cafe)","Pizza Demo (demo_rest)","Hotel Demo (demo_hotel)"],
    leadsList:["Lead #12 – Restaurant","Lead #18 – Shop","Lead #21 – Service"]
  },
  { id:"staff_002", name:"Drita (Demo)", region:"Prizren", customers:4, leads:9, won:1, status:"active",
    customersList:["Motel Demo (demo_motel)","Fastfood Demo (demo_fastfood)"],
    leadsList:["Lead #05 – Café","Lead #07 – Hotel"]
  },
  { id:"staff_003", name:"Besnik (Demo)", region:"Peja", customers:0, leads:6, won:0, status:"disabled",
    customersList:[],
    leadsList:["Lead #02 – Restaurant","Lead #03 – Shop"]
  }
];

const DUMMY_LEADS = [
  { id:"lead_001", name:"Café Aroma", type:"cafe", city:"Prishtina", phone:"+383 44 000 111", note:"Interessiert – will Demo sehen", status:"new", next:"Heute 17:00 Anruf", ownerType:"staff", ownerId:"staff_001", updatedAt: 10 },
  { id:"lead_002", name:"Restaurant Te Kodra", type:"restaurant", city:"Prizren", phone:"+383 49 222 333", note:"Hat bereits QR – will Social + Ads", status:"contacted", next:"Mi 11:00 Meeting", ownerType:"staff", ownerId:"staff_002", updatedAt: 9 },
  { id:"lead_003", name:"Hotel Panorama", type:"hotel", city:"Peja", phone:"+383 45 555 666", note:"Zimmer-QR + Requests wichtig", status:"demo", next:"Do 14:00 Nachfassen", ownerType:"ceo", ownerId:"ceo", updatedAt: 8 },
  { id:"lead_004", name:"Motel Secret", type:"motel", city:"Ferizaj", phone:"+383 44 777 888", note:"Privacy Mode / Diskretion", status:"meeting", next:"Fr 10:00 Termin", ownerType:"ceo", ownerId:"ceo", updatedAt: 7 },
  { id:"lead_005", name:"Fastfood HEB’s", type:"fastfood", city:"Gjilan", phone:"+383 43 111 222", note:"Pickup Flow + Nummern", status:"new", next:"Morgen 12:00 Anruf", ownerType:"staff", ownerId:"staff_001", updatedAt: 6 },
  { id:"lead_006", name:"Online Shop BeautyKS", type:"ecommerce", city:"Prishtina", phone:"+383 44 333 444", note:"Will Ads wie Facebook", status:"contacted", next:"Mo 09:30 Demo call", ownerType:"staff", ownerId:"staff_003", updatedAt: 5 },
  { id:"lead_007", name:"Service Elektrik 24", type:"service", city:"Mitrovica", phone:"+383 49 101 202", note:"Einfach Anfrage-Formular", status:"lost", next:"—", ownerType:"staff", ownerId:"staff_002", updatedAt: 4 },
  { id:"lead_008", name:"Café Livia", type:"cafe", city:"Prizren", phone:"+383 49 303 404", note:"Will Loyalty + Offers", status:"won", next:"—", ownerType:"ceo", ownerId:"ceo", updatedAt: 3 },
  { id:"lead_009", name:"Restaurant N’Klinë", type:"restaurant", city:"Peja", phone:"+383 44 909 808", note:"Küche Panel wichtig", status:"demo", next:"Sa 15:00 Follow-up", ownerType:"staff", ownerId:"staff_001", updatedAt: 2 },
  { id:"lead_010", name:"Hotel CityLine", type:"hotel", city:"Prishtina", phone:"+383 45 222 111", note:"Multi-Location später", status:"new", next:"Di 16:00 Nachricht", ownerType:"staff", ownerId:"staff_002", updatedAt: 1 },
];


const state = {
  staff: [...DUMMY_STAFF],
  selectedStaffId: null,
};

function getSelectedStaff(){
  return state.staff.find(s => s.id === state.selectedStaffId) || null;
}

/* =========================================================
   STAFF VIEW — Render + Events
   ========================================================= */

function staffMatchesFilter(s, q, status){
  const qq = (q || "").toLowerCase().trim();
  if (status && status !== "all" && s.status !== status) return false;
  if (!qq) return true;
  return (
    s.name.toLowerCase().includes(qq) ||
    s.region.toLowerCase().includes(qq) ||
    s.id.toLowerCase().includes(qq)
  );
}

function renderStaffTable(){
  const body = $("staffTableBody");
  if (!body) return;

  const q = $("staffSearch")?.value || "";
  const status = $("staffStatus")?.value || "all";

  const rows = state.staff.filter(s => staffMatchesFilter(s, q, status));

  body.innerHTML = rows.map(s => {
    const st = s.status === "active"
      ? '<span class="m-status m-status--ok">Aktiv</span>'
      : '<span class="m-status m-status--bad">Deaktiviert</span>';

    return `
      <tr>
        <td><b>${escapeHtml(s.name)}</b><div class="m-table-meta">${escapeHtml(s.id)}</div></td>
        <td>${escapeHtml(s.region)}</td>
        <td>${s.customers}</td>
        <td>${s.leads}</td>
        <td>${st}</td>
        <td style="white-space:nowrap;">
          <button class="m-mini-btn" type="button" data-staff-open="${escapeAttr(s.id)}">Öffnen</button>
          <button class="m-mini-btn" type="button" data-staff-assign="${escapeAttr(s.id)}">Zuordnen</button>
        </td>
      </tr>
    `;
  }).join("");

  body.querySelectorAll("[data-staff-open]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-staff-open");
      openStaffDetail(id);
    });
  });

  body.querySelectorAll("[data-staff-assign]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-staff-assign");
      state.selectedStaffId = id;
      openAssignModal();
    });
  });
}

function openStaffCreate(){
  showOverlay($("staffCreateOverlay"));
  // prefill dummy
  $("staffCreateName") && ($("staffCreateName").value = "");
  $("staffCreateRegion") && ($("staffCreateRegion").value = "");
  $("staffCreateUser") && ($("staffCreateUser").value = "");
  $("staffCreatePass") && ($("staffCreatePass").value = "");
  $("staffCreateStatus") && ($("staffCreateStatus").value = "active");
}

function closeStaffCreate(){
  hideOverlay($("staffCreateOverlay"));
}

function saveStaffCreateDummy(){
  const name = $("staffCreateName")?.value?.trim() || "Neuer Staff (Dummy)";
  const region = $("staffCreateRegion")?.value?.trim() || "—";
  const status = $("staffCreateStatus")?.value || "active";
  const newId = "staff_" + String(Math.floor(Math.random()*900)+100);

  state.staff.unshift({
    id: newId,
    name,
    region,
    customers: 0,
    leads: 0,
    won: 0,
    status,
    customersList: [],
    leadsList: []
  });

  renderStaffTable();
  closeStaffCreate();
}

function openStaffDetail(id){
  state.selectedStaffId = id;
  const s = getSelectedStaff();
  if (!s) return;

  $("staffDetailName") && ($("staffDetailName").textContent = s.name);
  $("staffDetailCustomers") && ($("staffDetailCustomers").textContent = String(s.customers));
  $("staffDetailLeads") && ($("staffDetailLeads").textContent = String(s.leads));
  $("staffDetailWon") && ($("staffDetailWon").textContent = String(s.won));

  const cList = $("staffDetailCustomersList");
  if (cList){
    cList.innerHTML = (s.customersList.length ? s.customersList : ["(noch keine)"]).map(x=>`<li>${escapeHtml(x)}</li>`).join("");
  }
  const lList = $("staffDetailLeadsList");
  if (lList){
    lList.innerHTML = (s.leadsList.length ? s.leadsList : ["(noch keine)"]).map(x=>`<li>${escapeHtml(x)}</li>`).join("");
  }

  showOverlay($("staffDetailOverlay"));
}

function closeStaffDetail(){
  hideOverlay($("staffDetailOverlay"));
}

function openAssignModal(){
  showOverlay($("staffAssignOverlay"));
}

function closeAssignModal(){
  hideOverlay($("staffAssignOverlay"));
}

function bindStaffView(){
  // Open/close create
  $("staffCreateBtn")?.addEventListener("click", openStaffCreate);
  $("staffCreateClose")?.addEventListener("click", closeStaffCreate);
  $("staffCreateCancel")?.addEventListener("click", closeStaffCreate);
  $("staffCreateSave")?.addEventListener("click", saveStaffCreateDummy);

  // Detail
  $("staffDetailClose")?.addEventListener("click", closeStaffDetail);
  $("staffAssignBtn")?.addEventListener("click", openAssignModal);

  // Assign modal
  $("staffAssignClose")?.addEventListener("click", closeAssignModal);
  $("staffAssignCancel")?.addEventListener("click", closeAssignModal);
  $("staffAssignSave")?.addEventListener("click", closeAssignModal);

  // Filters
  $("staffSearch")?.addEventListener("input", renderStaffTable);
  $("staffStatus")?.addEventListener("change", renderStaffTable);
  $("staffViewMode")?.addEventListener("change", renderStaffTable);

  // click outside to close
  ["staffCreateOverlay","staffDetailOverlay","staffAssignOverlay"].forEach(id=>{
    const ov = $(id);
    if (!ov) return;
    ov.addEventListener("click", (e)=>{
      if (e.target === ov) hideOverlay(ov);
    });
  });

  renderStaffTable();
}

/* =========================================================
   CUSTOMER SELECT (Dummy)
   ========================================================= */

function parseCustomerFromRow(btn){
  const tr = btn.closest("tr");
  if (!tr) return null;

  const tds = tr.querySelectorAll("td");
  const name = (tds[0]?.querySelector("b")?.textContent || tds[0]?.textContent || "—").trim();
  const type = (tds[1]?.textContent || "—").trim();

  const meta = tds[0]?.querySelector(".m-table-meta")?.textContent || "";
  // Format: "City • demo_id"
  let id = "—";
  const parts = meta.split("•");
  if (parts.length >= 2) id = parts[1].trim();
  else if (meta.trim()) id = meta.trim();

  return { id, name, type };
}

function saveSelectedCustomer(c){
  if (!c) return;
  localStorage.setItem("menyra_dummy_selected_customer", JSON.stringify(c));
}

function loadSelectedCustomer(){
  try{
    const raw = localStorage.getItem("menyra_dummy_selected_customer");
    return raw ? JSON.parse(raw) : null;
  }catch(_){
    return null;
  }
}

function applyCustomerDetailHeader(){
  const c = loadSelectedCustomer();
  if (!c) return;
  $("cdName") && ($("cdName").textContent = c.name || "—");
  $("cdId") && ($("cdId").textContent = c.id || "—");
  $("cdType") && ($("cdType").textContent = c.type || "—");
}

function bindCustomerOpenButtons(){
  // On Kunden-Tabelle: "Öffnen"
  document.querySelectorAll('[data-view-target="customer_detail"]').forEach(btn=>{
    // only bind once
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", ()=>{
      const c = parseCustomerFromRow(btn);
      saveSelectedCustomer(c);
      // small delay so the view is visible when we update
      setTimeout(applyCustomerDetailHeader, 50);
    });
  });

  // Also update whenever user navigates to customer_detail via other buttons
  document.querySelectorAll('[data-view-target="customer_detail"]').forEach(btn=>{
    btn.addEventListener("click", ()=> setTimeout(applyCustomerDetailHeader, 50));
  });

  // initial apply (if user refreshes)
  applyCustomerDetailHeader();
}

/* =========================================================
   UTILS
   ========================================================= */

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
function escapeAttr(s){ return escapeHtml(s); }


/* =========================================================
   LEADS VIEW — Dummy Render + Events
   ========================================================= */

const leadsState = {
  chip: "all",
  selectedId: null,
};

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
function ownerLabel(lead){
  if (lead.ownerType === "ceo") return "CEO";
  const st = state.staff.find(x=>x.id===lead.ownerId);
  return st ? `Staff: ${st.name}` : "Staff";
}

function getFilteredLeads(){
  const q = ($("leadsSearch")?.value || "").toLowerCase().trim();
  const status = $("leadsStatusFilter")?.value || "all";
  const owner = $("leadsOwnerFilter")?.value || "all";
  const staffId = $("leadsStaffFilter")?.value || "all";
  const sort = $("leadsSort")?.value || "updated_desc";
  const chip = leadsState.chip || "all";

  let arr = [...DUMMY_LEADS];

  if (owner !== "all") arr = arr.filter(l => l.ownerType === owner);
  if (staffId !== "all") arr = arr.filter(l => l.ownerId === staffId);
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

  // sort
  if (sort === "name_asc") arr.sort((a,b)=> (a.name||"").localeCompare(b.name||""));
  else if (sort === "next_asc") arr.sort((a,b)=> (a.next||"").localeCompare(b.next||""));
  else arr.sort((a,b)=> (b.updatedAt||0) - (a.updatedAt||0));

  return arr;
}

function renderLeadsKPIs(){
  const all = [...DUMMY_LEADS];
  const total = all.length;
  const neu = all.filter(l=>l.status==="new").length;
  const work = all.filter(l=>["contacted","demo","meeting"].includes(l.status)).length;
  const won = all.filter(l=>l.status==="won").length;
  if ($("leadsKpiTotal")) $("leadsKpiTotal").textContent = String(total);
  if ($("leadsKpiNew")) $("leadsKpiNew").textContent = String(neu);
  if ($("leadsKpiWork")) $("leadsKpiWork").textContent = String(work);
  if ($("leadsKpiWon")) $("leadsKpiWon").textContent = String(won);
}

function renderLeadsTable(){
  const tbody = $("leadsTbody");
  if (!tbody) return;

  const arr = getFilteredLeads();
  if (!arr.length){
    tbody.innerHTML = `<tr><td colspan="5"><div class="m-table-meta">Keine Leads gefunden (Dummy).</div></td></tr>`;
    return;
  }

  tbody.innerHTML = arr.map(l => {
    const meta = `${escapeHtml(leadTypeLabel(l.type))} • ${escapeHtml(l.city||"—")}`;
    return `<tr>
      <td>
        <b>${escapeHtml(l.name)}</b>
        <div class="m-table-meta">${meta}</div>
      </td>
      <td>${leadStatusBadge(l.status)}</td>
      <td><div class="m-table-meta">${escapeHtml(ownerLabel(l))}</div></td>
      <td><div class="m-table-meta">${escapeHtml(l.next||"—")}</div></td>
      <td>
        <button class="m-mini-btn" data-lead-open="${escapeAttr(l.id)}" type="button">Detail</button>
      </td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll("[data-lead-open]").forEach(btn=>{
    btn.addEventListener("click", ()=> openLeadDetail(btn.getAttribute("data-lead-open")));
  });
}

function fillStaffFilters(){
  const sel = $("leadsStaffFilter");
  const sel2 = $("leadDetailAssign");
  if (sel){
    const current = sel.value || "all";
    const opts = ['<option value="all">Mitarbeiter: Alle</option>']
      .concat(state.staff.map(s=>`<option value="${escapeAttr(s.id)}">${escapeHtml(s.name)} (${escapeHtml(s.region)})</option>`));
    sel.innerHTML = opts.join("");
    sel.value = current;
  }
  if (sel2){
    const current2 = sel2.value || "none";
    const opts2 = ['<option value="none">— (nur CEO)</option>']
      .concat(state.staff.map(s=>`<option value="${escapeAttr(s.id)}">${escapeHtml(s.name)} (${escapeHtml(s.region)})</option>`));
    sel2.innerHTML = opts2.join("");
    sel2.value = current2;
  }
}

function setLeadsChip(name){
  leadsState.chip = name;
  const wrap = $("leadsPipelineChips");
  if (wrap){
    wrap.querySelectorAll("[data-lead-chip]").forEach(b=>{
      b.classList.toggle("is-active", b.getAttribute("data-lead-chip") === name);
    });
  }
  renderLeadsTable();
}

function openLeadCreate(){
  showOverlay($("leadCreateOverlay"));
  // reset
  ["leadCreateName","leadCreateCity","leadCreatePhone","leadCreateNote"].forEach(id=>{ if ($(id)) $(id).value=""; });
  if ($("leadCreateType")) $("leadCreateType").value="restaurant";
}
function closeLeadCreate(){ hideOverlay($("leadCreateOverlay")); }

function saveLeadCreateDummy(){
  const name = $("leadCreateName")?.value?.trim() || "Neuer Lead (Dummy)";
  const type = $("leadCreateType")?.value || "restaurant";
  const city = $("leadCreateCity")?.value?.trim() || "—";
  const phone = $("leadCreatePhone")?.value?.trim() || "";
  const note = $("leadCreateNote")?.value?.trim() || "";
  const id = "lead_" + String(Math.floor(Math.random()*900)+100);
  DUMMY_LEADS.unshift({
    id, name, type, city, phone, note,
    status:"new",
    next:"—",
    ownerType:"ceo",
    ownerId:"ceo",
    updatedAt: (DUMMY_LEADS[0]?.updatedAt||10) + 1
  });
  closeLeadCreate();
  renderLeadsKPIs();
  renderLeadsTable();
}

function openLeadDetail(id){
  const lead = DUMMY_LEADS.find(l=>l.id===id);
  if (!lead) return;
  leadsState.selectedId = id;

  if ($("leadDetailTitle")) $("leadDetailTitle").textContent = lead.name;
  if ($("leadDetailMeta")) $("leadDetailMeta").textContent = `${leadTypeLabel(lead.type)} • ${lead.city||"—"} • Owner: ${ownerLabel(lead)}`;

  if ($("leadDetailStatus")) $("leadDetailStatus").value = lead.status || "new";
  if ($("leadDetailNext")) $("leadDetailNext").value = lead.next || "";
  if ($("leadDetailPhone")) $("leadDetailPhone").value = lead.phone || "";
  if ($("leadDetailNote")) $("leadDetailNote").value = lead.note || "";
  if ($("leadDetailAssign")) $("leadDetailAssign").value = (lead.ownerType==="staff" ? lead.ownerId : "none");

  showOverlay($("leadDetailOverlay"));
}
function closeLeadDetail(){ hideOverlay($("leadDetailOverlay")); leadsState.selectedId=null; }

function saveLeadDetailDummy(){
  const id = leadsState.selectedId;
  const lead = DUMMY_LEADS.find(l=>l.id===id);
  if (!lead) return;

  lead.status = $("leadDetailStatus")?.value || lead.status;
  lead.next = $("leadDetailNext")?.value || lead.next;
  lead.phone = $("leadDetailPhone")?.value || lead.phone;
  lead.note = $("leadDetailNote")?.value || lead.note;

  const assign = $("leadDetailAssign")?.value || "none";
  if (assign !== "none"){
    lead.ownerType = "staff";
    lead.ownerId = assign;
  }

  lead.updatedAt = (DUMMY_LEADS[0]?.updatedAt||10) + 1;

  renderLeadsKPIs();
  renderLeadsTable();
  closeLeadDetail();
}

function bindLeadsView(){
  // buttons
  $("leadsNewBtn")?.addEventListener("click", openLeadCreate);
  $("leadCreateClose")?.addEventListener("click", closeLeadCreate);
  $("leadCreateCancel")?.addEventListener("click", closeLeadCreate);
  $("leadCreateSave")?.addEventListener("click", saveLeadCreateDummy);

  $("leadDetailClose")?.addEventListener("click", closeLeadDetail);
  $("leadDetailSave")?.addEventListener("click", saveLeadDetailDummy);

  // dummy action buttons
  $("leadDetailDemo")?.addEventListener("click", ()=>{ /* placeholder */ closeLeadDetail(); });
  $("leadDetailConvert")?.addEventListener("click", ()=>{ /* placeholder */ closeLeadDetail(); });

  // filters
  ["leadsSearch","leadsStatusFilter","leadsOwnerFilter","leadsStaffFilter","leadsSort"].forEach(id=>{
    $(id)?.addEventListener("input", renderLeadsTable);
    $(id)?.addEventListener("change", renderLeadsTable);
  });

  // chips
  $("leadsPipelineChips")?.querySelectorAll("[data-lead-chip]").forEach(b=>{
    b.addEventListener("click", ()=> setLeadsChip(b.getAttribute("data-lead-chip")));
  });

  // click outside close
  ["leadCreateOverlay","leadDetailOverlay"].forEach(id=>{
    const ov = $(id);
    if (!ov) return;
    ov.addEventListener("click", (e)=>{ if (e.target === ov) hideOverlay(ov); });
  });

  fillStaffFilters();
  renderLeadsKPIs();
  renderLeadsTable();
}

/* =========================================================
   BOOT
   ========================================================= */

window.addEventListener("DOMContentLoaded", ()=>{
  bindStaffView();
  bindCustomerOpenButtons();
  bindLeadsView();
  // Safety: if current view is already customer_detail (reload), apply header
  applyCustomerDetailHeader();
});
