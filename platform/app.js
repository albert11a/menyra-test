/* =========================================================
   MENYRA – Platform Admin (CEO) Dummy
   Step: DUMMY-P1.3 — Staff UI + getrennte Staff-Login-Seite
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
   BOOT
   ========================================================= */

window.addEventListener("DOMContentLoaded", ()=>{
  bindStaffView();
  bindCustomerOpenButtons();
  // Safety: if current view is already customer_detail (reload), apply header
  applyCustomerDetailHeader();
});
