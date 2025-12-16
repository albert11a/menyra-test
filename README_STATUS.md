# README_STATUS — MENYRA (aktueller Stand)

**Datum:** 2025-12-16  
**Zielphase:** TEIL 1 — Dummy komplett (UI-only, keine Firebase-Logik)  
**Letzter Mini-Step:** **DUMMY-P1.3.2 ✅** (Staff Admin „wie CEO“: Schnellaktionen + Stat-Cards + Aktivität + neue Views Demos/Content)  
**Nächster Mini-Step:** **DUMMY-P1.4** (Leads CRM Screens sauber ausbauen: Liste/Detail/Notes/Next-Action/Pipeline)

---

## 0) Wichtig (damit du richtig testest)
- Das ist **Dummy/UI-only**: Buttons zeigen Views, Formulare speichern noch nichts.
- Logins sind **Dummy-Gates** (localStorage), damit die Bereiche getrennt sind.
- Später ersetzen wir Dummy-Gates durch **Firebase Auth + Firestore Role-Checks**.

---

## 1) Projektstruktur (Ordner)
- `platform/` – **CEO Platform Admin** + **Staff Admin**
- `owner/` – **Kunden-Admin** (Restaurant/Café/Hotel/Service)
- `staff/` – **Kellner** und später **Küche / Housekeeping**
- `guest/` – **QR-Karte / Menü / Bestellung**
- `public/` – **Main Pages** (Website-ähnlich, teilbar)
- `ecommerce/` – **Shop Frontend**
- `social/` – **Social Feed + Profile (Dummy)**
- `shared/` – Shared CSS/JS (Design-System, i18n, UI-Helper)
- Root: `index.html`, `manifest.json`, `sw.js`, `offline.html` (PWA Dummy)

---

## 2) Was im Dummy bereits funktioniert (UI)
### 2.1 Platform (CEO) — `platform/dashboard.html`
- Sidebar-Navigation + Mobile Drawer
- Views: Dashboard, Kunden, Leads, Demos, Mitarbeiter, Accounts, Module, Ads Freigabe, Moderation, Analytics, Einstellungen
- Sprach-Dropdown (i18n System vorbereitet)

### 2.2 Platform Staff Admin — `platform/staff.html`
- Gleiches Layout wie CEO (Shell/Spacing konsistent)
- Views: Dashboard, Meine Kunden, Meine Leads, **Demos**, **Content**, Einstellungen
- Dashboard hat jetzt:
  - Schnellaktionen (Tiles)
  - Stat-Cards (Meine Kunden/Leads/Won/Provision)
  - „Meine letzte Aktivität“ Tabelle (Dummy)

### 2.3 Owner Admin — `owner/`
- Dummy-Login getrennt von Admin-UI
- Views (Dummy): Überblick, Menü/Produkte, Bilder/Medien, Offers, Team/Staff, QR & Tische, Einstellungen

### 2.4 Staff Panels — `staff/`
- Kellner Panel (Dummy): Orders-Liste, Status-Chips, Detail Drawer/Modal (später Logik)
- Küche/Hauskeeping sind als Richtung vorbereitet (Dummy/Platzhaltertexte)

### 2.5 Guest & Public & Ecommerce & Social
- Guest QR-Karte (Dummy UI)
- Public Main Page (Dummy UI)
- Ecommerce Shop UI (Dummy)
- Social Feed/Profile/„Wer ist hier“ Placeholder (Dummy)

---

## 3) Was als Nächstes kommt (Mini-Steps Logik-freundlich)
**DUMMY-P1.4 (nächster Schritt):** Leads CRM Screens (CEO + Staff)
- Leads Liste: Filter, Pipeline, Next Action, „öffnen“
- Lead Detail: Notizen, Historie, Tasks, „zu Kunde konvertieren“ (nur Dummy UI)
- Staff sieht nur „meine Leads“ Ansicht (UI gleich aufgebaut)

Danach:
- DUMMY-P1.5 Kunden-Screens sauber (Liste/Detail/Module je Kundentyp)
- DUMMY-P1.6 Ads Manager UI (Kampagne erstellen, Budget, Regionen, Preview, Analytics — Dummy)
- DUMMY-P1.7 Social UI erweitern (Feed, Explore, Profile, Blurred Presence ohne Account — Dummy)
- Dann TEIL 2: Logik in kleinen Schritten (Auth → Rollen → Firestore Datenmodelle → Caching/Perf)

---

## 4) Bewusste „Später“ Themen (Design-Feinschliff)
Diese Dinge fixen wir **zum Schluss**, weil sich Inhalte noch ändern:
- Text-Overflow/Line-Clamp überall perfekt
- Tabellen → mobile Karten, Typografie/Spacing final
- Icons final (SVG Set), Farben, Themes, PWA-Polish

**Basis-Layout (Shell/Wrapper/Views)** halten wir aber schon jetzt konsistent, damit später nur CSS nötig ist.
