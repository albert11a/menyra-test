# STEP 002 — Admin-Design (MENYRA Dashboard UI) als Platzhalter

## Ziel
Die Admin-Bereiche sollen das **MENYRA Dashboard-Design** nutzen (Cards, Sidebar, Topbar, Mobile Drawer), aber weiterhin **ohne echte Logik**.

## Was wurde gemacht?

### 1) Gemeinsames Admin-CSS
- Neue Datei: `shared/menyra.css`
- Inhalt basiert auf deiner Referenz `menyra.css` (nur „Header-Zeile“ entfernt).

### 2) Platform (Superadmin)
- `apps/platform/dashboard.html` ersetzt durch dein Dashboard-Layout (Referenz `Dashboard.html`), aber:
  - mit korrektem HTML-Wrapper (`<!DOCTYPE html>`, `<html>`, `<body>`)
  - CSS-Link auf `../../shared/menyra.css` angepasst
- `apps/platform/menyra.js` als **Placeholder** hinzugefügt (Dashboard lädt es bereits).
- `apps/platform/login.html` aktualisiert: gleicher Look & einfache Login-Card (Platzhalter).

### 3) Owner (Kunde)
- `apps/owner/admin.html` & `apps/owner/login.html` auf **denselben Admin-Look** umgestellt.
- Buttons/Stats sind Platzhalter.

### 4) Staff Admin (dein Team)
- Neuer Bereich: `apps/staffadmin/`
  - `login.html` + `dashboard.html` im gleichen Admin-Design
  - **Platzhalter**: später sieht jeder Staff nur seine eigenen Kunden/Leads.

### 5) Icons (nur damit nichts „kaputt“ aussieht)
- `apps/platform/icons/*.png` einfache Platzhalter-Icons für die Sidebar.

### 6) Root Hub aktualisiert
- `index.html` hat jetzt zusätzlich einen Link-Kachel für **Staff Admin (dein Team)**.

## Hinweis
Kamarieri (Restaurant-Kellner) bleibt aktuell im Ordner `apps/staff/` wie zuvor (kein Admin-Design-Ziel in diesem Schritt).
