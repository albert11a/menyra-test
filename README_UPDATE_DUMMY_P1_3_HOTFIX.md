# Update: DUMMY-P1.3 HOTFIX — Staff Admin Layout & Funktionalität

## Warum dieses Hotfix?
In Step P1.3 war die Seite `platform/staff.html` zwar vorhanden, aber:
- Layout/Struktur war nicht identisch zu den anderen Admin-Panels
- Drawer + View-Wechsel konnten „kaputt“ wirken, weil `shared/ui.js` nicht gebootet wurde

## Was wurde geändert?
### 1) `platform/staff.html`
- Layout auf **das gleiche Admin-Shell-Pattern** wie `platform/dashboard.html` umgestellt:
  - Mobile Drawer (Burger-Menü)
  - Topbar (MENYRA + Staff Admin)
  - Sidebar + Main Layout (`m-layout`, `m-sidebar`, `m-main`)
- `bootDashboard("./staff-login.html")` eingebaut, damit:
  - Views umschalten (Dashboard / Meine Kunden / Meine Leads / Settings)
  - Drawer öffnet/schließt
  - Logout führt zur Staff-Login-Seite

### 2) `platform/staff-app.js`
- Dummy-Gate eingebaut:
  - Wenn `localStorage.menyra_dummy_staff_logged_in !== "1"` → Redirect zu `staff-login.html`

## Was du tun musst (ganz kurz)
- Kopiere die Dateien aus diesem Hotfix (oder einfach alles überschreiben):
  - `platform/staff.html`
  - `platform/staff-app.js`

## Test (30 Sekunden)
1) Öffne `.../platform/staff-login.html`
2) Beliebige Daten eingeben → Login
3) In `staff.html`:
   - Burger-Menü öffnet
   - Sidebar Navigation wechselt Views
   - Logout bringt dich zurück
