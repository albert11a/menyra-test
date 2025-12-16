# README_UPDATE_DUMMY_P1_6 — Assignments (Lead/Tenant → Staff)

Dieses Update erweitert den Dummy um **Zuweisungen** (ohne Firestore) und synchronisiert CEO ↔ Staff über **localStorage**.

## ✅ Was wurde umgesetzt

### 1) Customer → Staff Assignment (CEO)
- In `platform/dashboard.html` (Kundendetail) gibt es jetzt:
  - Anzeige: **Staff: ...**
  - Dropdown: **Zuweisen (Staff)**
- Speicherung in localStorage:
  - Key: `menyra_dummy_customer_assignments_v1` (Map: `{ customerId: staffId }`)

### 2) Staff: „Meine Kunden“ zeigt nur zugewiesene Kunden
- `platform/staff.html`:
  - Suche/Status Filter bekommen IDs
  - Tabelle nutzt `<tbody id="staffCustomersTbody">`
- `platform/staff-app.js`:
  - lädt Kundenliste aus `menyra_dummy_customers_v1`
  - filtert via Assignments Map (oben)

### 3) Leads: Shared Store (CEO ↔ Staff)
- `platform/app.js` seedet/liest/schreibt Leads über:
  - `menyra_dummy_leads_v1`
- `platform/staff-app.js` liest diese Leads und zeigt nur:
  - `ownerType === "staff"` und `ownerId === staffId`

## 🧪 Test (2 Minuten)
1. CEO: `platform/dashboard.html`
   - Kunden öffnen → Staff zuweisen → Reload → bleibt gespeichert
2. Staff: `platform/staff-login.html`
   - Einloggen → „Meine Kunden“ → zeigt nur zugewiesene Kunden
3. Staff: „Meine Leads“ → Lead erstellen → CEO sieht ihn ebenfalls (shared store)

