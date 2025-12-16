# UPDATE — DUMMY-P1.4 (Leads CRM Screens)

## Ziel
Leads müssen im Dummy schon komplett bedienbar sein (UI), damit wir später nur noch Logik/Firestore ergänzen.

## Neu (CEO Admin)
- Leads View: KPIs + Filter (Owner/Staff/Status/Sort/Suche) + Pipeline Chips
- Leads Tabelle (Dummy Daten)
- Modal: „Neuen Lead anlegen“ (Dummy)
- Modal: „Lead Detail“ (Status/Next Action/Assign/Notiz) (Dummy)

## Neu (Staff Admin)
- „Meine Leads“ View: KPIs + Filter + Chips + Tabelle
- Modal: „Neuer Lead“ (Dummy) — speichert im localStorage pro Staff-ID
- Modal: „Lead Detail“ (Dummy)
- Staff-ID wird im Staff-Login aus der Email abgeleitet → dadurch wirkt „meine Leads“ realistisch

## Dateien geändert
- `platform/dashboard.html`
- `platform/app.js`
- `platform/staff.html`
- `platform/staff-app.js`
- `platform/staff-login.html`
- `shared/unified.css`
- `README_STATUS.md`
- `README_UPDATE_DUMMY_P1_4.md`

## Testlinks
- CEO: `/platform/dashboard.html` → View „Leads“
- Staff: `/platform/staff.html` → View „Meine Leads“
